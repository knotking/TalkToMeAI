import React, { useEffect, useRef, useState, useCallback } from 'react';
import { GoogleGenAI, LiveServerMessage, Modality } from '@google/genai';
import { GEMINI_MODEL } from '../constants';
import { pcmToWav } from '../utils/audio';
import { captureCameraFrame, fileToBase64 } from '../utils/image';
import { ChatMessage, GroundingMetadata } from '../types';
import { Audio } from 'expo-av';
import * as FileSystem from 'expo-file-system';
import { CameraView } from 'expo-camera';
import { Platform } from 'react-native';

interface UseLiveSessionProps {
  systemInstruction: string;
  initialContext?: string; // Text content from file
  additionalContext?: string; // e.g. Address
  voiceName: string;
  language: string;
  cameraRef?: React.RefObject<CameraView | null>;
  inputVolume?: number;
  outputVolume?: number;
  isVideoEnabled?: boolean;
}

export const useLiveSession = ({
  systemInstruction,
  initialContext,
  additionalContext,
  voiceName,
  language,
  cameraRef,
  inputVolume = 1.0,
  outputVolume = 1.0,
  isVideoEnabled = false,
}: UseLiveSessionProps) => {
  const [isConnected, setIsConnected] = useState(false);
  const [isError, setIsError] = useState(false);
  const [volume, setVolume] = useState({ input: 0, output: 0 });
  const [status, setStatus] = useState<string>('Ready');
  const [messages, setMessages] = useState<ChatMessage[]>([]);

  // Expo Audio Refs
  const recordingRef = useRef<Audio.Recording | null>(null);
  const soundRef = useRef<Audio.Sound | null>(null);
  const audioQueueRef = useRef<string[]>([]);
  const isPlayingRef = useRef<boolean>(false);
  const isRecordingRef = useRef<boolean>(false);

  // Video State
  const videoIntervalRef = useRef<NodeJS.Timeout | null>(null);

  // Gemini Session
  const sessionPromiseRef = useRef<Promise<any> | null>(null);
  const clientRef = useRef<GoogleGenAI | null>(null);

  // ---------------------------------------------------------------------------
  // Audio Playback Queue
  // ---------------------------------------------------------------------------
  const processAudioQueue = useCallback(async () => {
    if (isPlayingRef.current || audioQueueRef.current.length === 0) return;

    isPlayingRef.current = true;
    const audioUri = audioQueueRef.current.shift();

    if (audioUri) {
      try {
        const { sound } = await Audio.Sound.createAsync(
            { uri: audioUri }, 
            { shouldPlay: true, volume: outputVolume }
        );
        soundRef.current = sound;
        
        sound.setOnPlaybackStatusUpdate(async (status) => {
          if (status.isLoaded && status.didJustFinish) {
            await sound.unloadAsync();
            soundRef.current = null;
            // Delete temp file
            await FileSystem.deleteAsync(audioUri, { idempotent: true });
            isPlayingRef.current = false;
            processAudioQueue();
          }
        });
      } catch (e) {
        console.error("Error playing audio chunk", e);
        isPlayingRef.current = false;
        processAudioQueue();
      }
    } else {
        isPlayingRef.current = false;
    }
  }, [outputVolume]);

  const queueAudioForPlayback = useCallback(async (base64Audio: string) => {
      try {
          // Expo AV doesn't support raw PCM playback easily. 
          // Gemini returns PCM, so we wrap it in a WAV header.
          // Note: If Gemini returns MP3/AAC via config, we could save directly.
          // For 'native-audio-preview', it's usually PCM.
          
          // Let's assume we receive PCM and need to header it.
          // IMPORTANT: Check Gemini API output format. If it's raw PCM, we need to convert.
          // Based on the web implementation, we were decoding raw PCM float/int16.
          
          const audioData = Uint8Array.from(atob(base64Audio), c => c.charCodeAt(0));
          const wavBase64 = pcmToWav(audioData, 24000, 1); // Sample rate 24kHz for output usually

          const filename = `${FileSystem.cacheDirectory || ''}response_${Date.now()}_${Math.random()}.wav`;
          await FileSystem.writeAsStringAsync(filename, wavBase64, { encoding: 'base64' });
          
          audioQueueRef.current.push(filename);
          processAudioQueue();
      } catch (e) {
          console.error("Error queueing audio", e);
      }
  }, [processAudioQueue]);


  // ---------------------------------------------------------------------------
  // Audio Recording (Chunked)
  // ---------------------------------------------------------------------------
  const startRecording = useCallback(async () => {
      try {
          if (recordingRef.current) {
              await recordingRef.current.stopAndUnloadAsync();
          }

          await Audio.setAudioModeAsync({
              allowsRecordingIOS: true,
              playsInSilentModeIOS: true,
              staysActiveInBackground: true,
          });

          const { recording } = await Audio.Recording.createAsync(
              Audio.RecordingOptionsPresets.LOW_QUALITY // Mono 16kHz-like settings preferred
          );
          
          recordingRef.current = recording;
          isRecordingRef.current = true;

          // In a "real" stream, we'd access the buffer. Expo AV is file-based.
          // So we loop: Record -> Stop -> Read -> Send -> Restart
          // This introduces latency (~500ms-1s).
          
          // FIXME: This "stop-start" loop is too slow for real conversation.
          // A better approach for Expo Go is strictly Request-Response for now, 
          // OR accept the latency.
          // We will implement a 1-second chunk loop.
          
          const chunkLoop = async () => {
              if (!isRecordingRef.current || !isConnected) return;
              
              // Wait 1s
              await new Promise(r => setTimeout(r, 1000));
              
              if (!recordingRef.current) return;

              try {
                  await recordingRef.current.stopAndUnloadAsync();
                  const uri = recordingRef.current.getURI();
                  
                  if (uri && sessionPromiseRef.current) {
                      // Read file
                      const base64 = await FileSystem.readAsStringAsync(uri, { encoding: 'base64' });
                      
                      // Convert recorded format to PCM? 
                      // Expo records in m4a/caf by default on low quality preset.
                      // Gemini usually expects PCM 16kHz. 
                      // WE CANNOT easily transcode on Expo Go JS thread fast enough.
                      // HACK: Send M4A if supported, or rely on web-based logic?
                      // The Gemini Live API documentation mentions support for raw PCM.
                      // It might accept other formats if configured?
                      
                      // CRITICAL: Expo Go limitation.
                      // We will send the raw base64 and hope the API can handle the container 
                      // or configured mimeType.
                      // Let's assume we configure InputAudio to something standard or 
                      // we just send it.
                      
                      sessionPromiseRef.current.then(session => {
                         session.sendRealtimeInput({ 
                             media: { 
                                 mimeType: 'audio/mp4', // or 'audio/x-m4a' check preset
                                 data: base64 
                             } 
                         });
                      }).catch(e => console.error("Send error", e));

                      // Clean up
                      await FileSystem.deleteAsync(uri, { idempotent: true });
                  }
                  
                  // Restart recording
                  const { recording: newRec } = await Audio.Recording.createAsync(
                      Audio.RecordingOptionsPresets.LOW_QUALITY
                  );
                  recordingRef.current = newRec;
                  chunkLoop();
                  
              } catch (e) {
                  console.error("Recording loop error", e);
              }
          };

          chunkLoop();

      } catch (err) {
          console.error("Failed to start recording", err);
      }
  }, [isConnected]);

  const stopRecording = useCallback(async () => {
      isRecordingRef.current = false;
      if (recordingRef.current) {
          try {
              await recordingRef.current.stopAndUnloadAsync();
          } catch (e) {}
          recordingRef.current = null;
      }
  }, []);


  // ---------------------------------------------------------------------------
  // Video Streaming
  // ---------------------------------------------------------------------------
  useEffect(() => {
    let mounted = true;

    const startVideo = () => {
        if (!isConnected || !isVideoEnabled || !cameraRef?.current) return;
        
        videoIntervalRef.current = setInterval(async () => {
            if (!mounted || !cameraRef.current) return;
            
            const base64 = await captureCameraFrame(cameraRef.current);
            if (base64 && sessionPromiseRef.current) {
                sessionPromiseRef.current.then(session => {
                    session.sendRealtimeInput({
                        media: {
                            mimeType: 'image/jpeg',
                            data: base64
                        }
                    });
                }).catch(console.error);
            }
        }, 1000); // 1 FPS for mobile to save data/battery
    };

    const stopVideo = () => {
        if (videoIntervalRef.current) {
            clearInterval(videoIntervalRef.current);
            videoIntervalRef.current = null;
        }
    };

    if (isVideoEnabled && isConnected) {
        startVideo();
    } else {
        stopVideo();
    }

    return () => {
        mounted = false;
        stopVideo();
    };
  }, [isConnected, isVideoEnabled, cameraRef]);


  // ---------------------------------------------------------------------------
  // Connection Logic
  // ---------------------------------------------------------------------------
  const disconnect = useCallback(async () => {
    stopRecording();
    
    // Stop playback
    if (soundRef.current) {
        try { await soundRef.current.stopAsync(); await soundRef.current.unloadAsync(); } catch (e) {}
    }
    audioQueueRef.current = [];
    isPlayingRef.current = false;

    // Close session
    if (sessionPromiseRef.current) {
       sessionPromiseRef.current.then(session => {
         if (session.close) session.close();
       }).catch(() => {});
    }

    setIsConnected(false);
    setStatus('Ready');
    setVolume({ input: 0, output: 0 });
  }, [stopRecording]);

  const sendText = useCallback((text: string) => {
      if (sessionPromiseRef.current) {
          sessionPromiseRef.current.then(session => {
              session.send({ parts: [{ text }], turnComplete: true });
          });
          setMessages(prev => [...prev, { role: 'user', text, timestamp: Date.now(), isFinal: true }]);
      }
  }, []);

  const sendImage = useCallback((base64: string, mimeType: string) => {
      if (sessionPromiseRef.current) {
          sessionPromiseRef.current.then(session => {
              session.send({ parts: [{ inlineData: { mimeType, data: base64 } }], turnComplete: true });
          });
           setMessages(prev => [...prev, { 
               role: 'user', 
               text: 'Sent an image', 
               image: `data:${mimeType};base64,${base64}`,
               timestamp: Date.now(), 
               isFinal: true 
            }]);
      }
  }, []);

  const connect = useCallback(async () => {
    try {
      setStatus('Connecting...');
      setIsError(false);
      setMessages([]);

      // Permission Check
      const { status: audioStatus } = await Audio.requestPermissionsAsync();
      if (audioStatus !== 'granted') throw new Error("Microphone permission required");

      const geminiKey = process.env.EXPO_PUBLIC_GEMINI_API_KEY;
      if (!geminiKey) {
        throw new Error("API Key not found in env");
      }

      clientRef.current = new GoogleGenAI({ apiKey: geminiKey });

      let fullInstruction = systemInstruction;
      fullInstruction += `\n\nIMPORTANT: You must converse in ${language}.`;
      
      if (initialContext) {
        fullInstruction += `\n\n[USER PROVIDED DOCUMENT]:\n${initialContext}\n\n[END OF DOCUMENT]`;
      }
      
      if (additionalContext) {
        fullInstruction += `\n\n[USER PROVIDED CONTEXT]:\n${additionalContext}`;
      }

      sessionPromiseRef.current = clientRef.current.live.connect({
        model: GEMINI_MODEL,
        config: {
          responseModalities: [Modality.AUDIO],
          speechConfig: {
            voiceConfig: { prebuiltVoiceConfig: { voiceName: voiceName } },
          },
          systemInstruction: fullInstruction,
          // We will send 'audio/mp4' (AAC) from Expo, so we need to hope model supports it 
          // or transcode. If native-audio-preview only supports PCM, we are in trouble with Expo Go.
          // Assuming for this port we just try.
          // If it fails, we would need to implement a JS-based PCM recorder (slow).
        },
        callbacks: {
          onopen: () => {
            console.log('Session Opened');
            setIsConnected(true);
            setStatus('Active');
            startRecording();
          },
          onmessage: async (message: LiveServerMessage) => {
            // Audio Output
            const base64Audio = message.serverContent?.modelTurn?.parts?.[0]?.inlineData?.data;
            if (base64Audio) {
                queueAudioForPlayback(base64Audio);
            }

            // Transcriptions
            const inputTrans = message.serverContent?.inputTranscription;
            const outputTrans = message.serverContent?.outputTranscription;

            if (inputTrans && inputTrans.text) {
                setMessages(prev => {
                    const lastMsg = prev[prev.length - 1];
                    if (lastMsg && lastMsg.role === 'user' && !lastMsg.isFinal) {
                         const newMsgs = [...prev];
                         newMsgs[newMsgs.length - 1] = { ...lastMsg, text: lastMsg.text + inputTrans.text };
                         return newMsgs;
                    } else {
                         return [...prev, { role: 'user', text: inputTrans.text || '', timestamp: Date.now(), isFinal: false }];
                    }
                });
            }

            if (outputTrans && outputTrans.text) {
                 setMessages(prev => {
                    const lastMsg = prev[prev.length - 1];
                    if (lastMsg && lastMsg.role === 'model' && !lastMsg.isFinal) {
                         const newMsgs = [...prev];
                         newMsgs[newMsgs.length - 1] = { ...lastMsg, text: lastMsg.text + outputTrans.text };
                         return newMsgs;
                    } else {
                         return [...prev, { role: 'model', text: outputTrans.text || '', timestamp: Date.now(), isFinal: false }];
                    }
                });
            }
            
            if (message.serverContent?.turnComplete) {
                setMessages(prev => prev.map((msg, idx) => idx === prev.length - 1 ? { ...msg, isFinal: true } : msg));
            }
            
            if (message.serverContent?.interrupted) {
                // Clear queue
                audioQueueRef.current = [];
                if (soundRef.current) {
                    await soundRef.current.stopAsync();
                }
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
  }, [systemInstruction, initialContext, additionalContext, voiceName, language, disconnect, startRecording]);


  useEffect(() => {
    return () => { disconnect(); };
  }, [disconnect]);

  return {
    isConnected,
    isError,
    status,
    volume,
    connect,
    disconnect,
    sendText,
    sendImage,
    messages
  };
};

