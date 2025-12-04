import React, { useEffect, useRef, useState, useCallback } from 'react';
import { GoogleGenAI, LiveServerMessage, Modality } from '@google/genai';
import { GEMINI_MODEL } from '../constants';
import { createPcmBlob, decodeAudioData, base64ToUint8Array } from '../utils/audio';
import { captureFrameAsBase64 } from '../utils/image';
import { ChatMessage } from '../types';

interface UseLiveSessionProps {
  systemInstruction: string;
  initialContext?: string; // Text content from file
  additionalContext?: string; // e.g. Address
  voiceName: string;
  language: string;
  videoRef?: React.RefObject<HTMLVideoElement | null>;
}

export const useLiveSession = ({ 
  systemInstruction, 
  initialContext, 
  additionalContext,
  voiceName, 
  language,
  videoRef 
}: UseLiveSessionProps) => {
  const [isConnected, setIsConnected] = useState(false);
  const [isError, setIsError] = useState(false);
  const [volume, setVolume] = useState({ input: 0, output: 0 });
  const [status, setStatus] = useState<string>('Ready');
  const [messages, setMessages] = useState<ChatMessage[]>([]);

  // Audio Contexts and Nodes
  const inputAudioContextRef = useRef<AudioContext | null>(null);
  const outputAudioContextRef = useRef<AudioContext | null>(null);
  const inputSourceRef = useRef<MediaStreamAudioSourceNode | null>(null);
  const processorRef = useRef<ScriptProcessorNode | null>(null);
  const outputNodeRef = useRef<GainNode | null>(null);
  const inputAnalyserRef = useRef<AnalyserNode | null>(null);
  const outputAnalyserRef = useRef<AnalyserNode | null>(null);
  
  // Video/Canvas State
  const canvasRef = useRef<HTMLCanvasElement | null>(null);
  const videoIntervalRef = useRef<number | null>(null);
  
  // State for playback scheduling
  const nextStartTimeRef = useRef<number>(0);
  const sourcesRef = useRef<Set<AudioBufferSourceNode>>(new Set());
  
  // Session Management
  const sessionPromiseRef = useRef<Promise<any> | null>(null);
  const clientRef = useRef<GoogleGenAI | null>(null);
  
  const disconnect = useCallback(async () => {
    // Stop video capture
    if (videoIntervalRef.current) {
        clearInterval(videoIntervalRef.current);
        videoIntervalRef.current = null;
    }
    
    // Stop streams
    if (inputSourceRef.current) {
      const stream = inputSourceRef.current.mediaStream;
      stream.getTracks().forEach(track => track.stop());
      inputSourceRef.current.disconnect();
    }
    
    if (videoRef?.current && videoRef.current.srcObject) {
      const stream = videoRef.current.srcObject as MediaStream;
      stream.getTracks().forEach(track => track.stop());
      videoRef.current.srcObject = null;
    }

    if (processorRef.current) {
      processorRef.current.disconnect();
      processorRef.current.onaudioprocess = null;
    }

    if (inputAudioContextRef.current) {
      await inputAudioContextRef.current.close();
      inputAudioContextRef.current = null;
    }
    if (outputAudioContextRef.current) {
      await outputAudioContextRef.current.close();
      outputAudioContextRef.current = null;
    }
    
    // Stop all playing sources
    sourcesRef.current.forEach(source => {
      try { source.stop(); } catch (e) {}
    });
    sourcesRef.current.clear();
    
    // Close session
    if (sessionPromiseRef.current) {
       sessionPromiseRef.current.then(session => {
         if (session.close) session.close();
       }).catch(() => {});
    }

    setIsConnected(false);
    setStatus('Ready');
    setVolume({ input: 0, output: 0 });
  }, [videoRef]);

  const connect = useCallback(async () => {
    try {
      setStatus('Connecting...');
      setIsError(false);
      setMessages([]); // Clear previous messages on new connection

      if (!process.env.API_KEY) {
        throw new Error("API Key not found");
      }

      clientRef.current = new GoogleGenAI({ apiKey: process.env.API_KEY });

      // Initialize Audio Contexts
      const AudioContextClass = window.AudioContext || (window as any).webkitAudioContext;
      inputAudioContextRef.current = new AudioContextClass({ sampleRate: 16000 });
      outputAudioContextRef.current = new AudioContextClass({ sampleRate: 24000 });

      // Setup Analysers for Visualization
      inputAnalyserRef.current = inputAudioContextRef.current.createAnalyser();
      outputAnalyserRef.current = outputAudioContextRef.current.createAnalyser();
      inputAnalyserRef.current.fftSize = 256;
      outputAnalyserRef.current.fftSize = 256;

      // Determine Media Constraints
      const hasVideo = !!videoRef;
      const constraints = {
        audio: true,
        video: hasVideo ? { width: 640, height: 480, facingMode: 'environment' } : false
      };

      // Get Media Stream (Audio + Video if requested)
      const stream = await navigator.mediaDevices.getUserMedia(constraints);
      
      // Handle Video Stream
      if (hasVideo && videoRef.current) {
        videoRef.current.srcObject = stream;
        await videoRef.current.play();
        
        // Initialize helper canvas for frame capture
        canvasRef.current = document.createElement('canvas');
      }

      // Input Pipeline (Audio)
      inputSourceRef.current = inputAudioContextRef.current.createMediaStreamSource(stream);
      processorRef.current = inputAudioContextRef.current.createScriptProcessor(4096, 1, 1);
      
      inputSourceRef.current.connect(inputAnalyserRef.current);
      inputAnalyserRef.current.connect(processorRef.current);
      processorRef.current.connect(inputAudioContextRef.current.destination);

      // Output Pipeline
      outputNodeRef.current = outputAudioContextRef.current.createGain();
      outputNodeRef.current.connect(outputAnalyserRef.current);
      outputAnalyserRef.current.connect(outputAudioContextRef.current.destination);

      // Construct System Instruction
      let fullInstruction = systemInstruction;
      fullInstruction += `\n\nIMPORTANT: You must converse in ${language}.`;
      
      if (initialContext) {
        fullInstruction += `\n\n[USER PROVIDED DOCUMENT]:\n${initialContext}\n\n[END OF DOCUMENT]`;
      }
      
      if (additionalContext) {
        fullInstruction += `\n\n[USER PROVIDED CONTEXT]:\n${additionalContext}`;
      }

      // Connect to Gemini Live
      sessionPromiseRef.current = clientRef.current.live.connect({
        model: GEMINI_MODEL,
        config: {
          responseModalities: [Modality.AUDIO],
          speechConfig: {
            voiceConfig: { prebuiltVoiceConfig: { voiceName: voiceName } },
          },
          systemInstruction: fullInstruction,
          // Enable transcription - using empty objects as per SDK requirements
          inputAudioTranscription: { },
          outputAudioTranscription: { },
        },
        callbacks: {
          onopen: () => {
            console.log('Session Opened');
            setIsConnected(true);
            setStatus('Active');
            
            // Start processing audio input
            if (processorRef.current && inputAudioContextRef.current) {
                processorRef.current.onaudioprocess = (e) => {
                    const inputData = e.inputBuffer.getChannelData(0);
                    const pcmBlob = createPcmBlob(inputData);
                    sessionPromiseRef.current?.then((session) => {
                        session.sendRealtimeInput({ media: pcmBlob });
                    }).catch(console.error);
                };
            }

            // Start video frame transmission if video is active
            if (hasVideo && videoRef?.current && canvasRef.current) {
                videoIntervalRef.current = window.setInterval(() => {
                    if (videoRef.current && canvasRef.current) {
                        const base64Image = captureFrameAsBase64(videoRef.current, canvasRef.current);
                        if (base64Image) {
                            sessionPromiseRef.current?.then((session) => {
                                session.sendRealtimeInput({ 
                                    media: { 
                                        mimeType: 'image/jpeg', 
                                        data: base64Image 
                                    } 
                                });
                            }).catch(console.error);
                        }
                    }
                }, 500);
            }
          },
          onmessage: async (message: LiveServerMessage) => {
            // Handle Audio Output
            const base64Audio = message.serverContent?.modelTurn?.parts?.[0]?.inlineData?.data;
            if (base64Audio && outputAudioContextRef.current && outputNodeRef.current) {
                const ctx = outputAudioContextRef.current;
                nextStartTimeRef.current = Math.max(nextStartTimeRef.current, ctx.currentTime);
                
                try {
                    const audioBuffer = await decodeAudioData(
                        base64ToUint8Array(base64Audio),
                        ctx,
                        24000,
                        1
                    );
                    
                    const source = ctx.createBufferSource();
                    source.buffer = audioBuffer;
                    source.connect(outputNodeRef.current);
                    
                    source.addEventListener('ended', () => {
                        sourcesRef.current.delete(source);
                    });
                    
                    source.start(nextStartTimeRef.current);
                    sourcesRef.current.add(source);
                    nextStartTimeRef.current += audioBuffer.duration;
                } catch (e) {
                    console.error("Error decoding audio", e);
                }
            }

            // Handle Transcriptions
            const inputTrans = message.serverContent?.inputTranscription;
            const outputTrans = message.serverContent?.outputTranscription;

            if (inputTrans) {
                setMessages(prev => {
                    const lastMsg = prev[prev.length - 1];
                    if (lastMsg && lastMsg.role === 'user' && !lastMsg.isFinal) {
                         const newMsgs = [...prev];
                         newMsgs[newMsgs.length - 1] = {
                             ...lastMsg,
                             text: lastMsg.text + inputTrans.text
                         };
                         return newMsgs;
                    } else {
                         return [...prev, {
                             role: 'user',
                             text: inputTrans.text,
                             timestamp: Date.now(),
                             isFinal: false
                         }];
                    }
                });
            }

            if (outputTrans) {
                 setMessages(prev => {
                    const lastMsg = prev[prev.length - 1];
                    if (lastMsg && lastMsg.role === 'model' && !lastMsg.isFinal) {
                         const newMsgs = [...prev];
                         newMsgs[newMsgs.length - 1] = {
                             ...lastMsg,
                             text: lastMsg.text + outputTrans.text
                         };
                         return newMsgs;
                    } else {
                         return [...prev, {
                             role: 'model',
                             text: outputTrans.text,
                             timestamp: Date.now(),
                             isFinal: false
                         }];
                    }
                });
            }

            // Handle Turn Complete (finalize messages)
            if (message.serverContent?.turnComplete) {
                setMessages(prev => prev.map((msg, idx) => 
                    idx === prev.length - 1 ? { ...msg, isFinal: true } : msg
                ));
            }

            // Handle Interruption
            if (message.serverContent?.interrupted) {
                sourcesRef.current.forEach(s => s.stop());
                sourcesRef.current.clear();
                nextStartTimeRef.current = 0;
            }
          },
          onclose: () => {
            console.log('Session Closed');
            disconnect();
          },
          onerror: (err) => {
            console.error('Session Error', err);
            setIsError(true);
            setStatus('Error');
            disconnect();
          }
        }
      });

    } catch (e) {
      console.error(e);
      setIsError(true);
      setStatus('Failed to Connect');
      disconnect();
    }
  }, [systemInstruction, initialContext, additionalContext, voiceName, language, videoRef, disconnect]);

  useEffect(() => {
    let animFrame: number;
    const animate = () => {
        if (!isConnected) return;
        
        let inputVol = 0;
        let outputVol = 0;

        if (inputAnalyserRef.current) {
            const data = new Uint8Array(inputAnalyserRef.current.frequencyBinCount);
            inputAnalyserRef.current.getByteFrequencyData(data);
            inputVol = data.reduce((a, b) => a + b, 0) / data.length;
        }

        if (outputAnalyserRef.current) {
            const data = new Uint8Array(outputAnalyserRef.current.frequencyBinCount);
            outputAnalyserRef.current.getByteFrequencyData(data);
            outputVol = data.reduce((a, b) => a + b, 0) / data.length;
        }

        setVolume({ input: inputVol, output: outputVol });
        animFrame = requestAnimationFrame(animate);
    };

    if (isConnected) {
        animate();
    }

    return () => {
        if (animFrame) cancelAnimationFrame(animFrame);
    };
  }, [isConnected]);

  // Cleanup on unmount
  useEffect(() => {
    return () => {
        disconnect();
    };
  }, [disconnect]);

  return {
    isConnected,
    isError,
    status,
    volume,
    connect,
    disconnect,
    messages
  };
};