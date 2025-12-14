import React from 'react';
import { PERSONAS } from '../constants';

interface AboutModalProps {
  onClose: () => void;
}

const AboutModal: React.FC<AboutModalProps> = ({ onClose }) => {
  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/80 backdrop-blur-sm p-4 animate-fade-in">
      <div className="bg-gray-900 w-full max-w-5xl h-[85vh] rounded-2xl border border-gray-700 shadow-2xl flex flex-col overflow-hidden relative animate-float" style={{ animationDuration: '0s' }}>
        
        {/* Header */}
        <div className="p-6 border-b border-gray-800 flex justify-between items-center bg-gray-900 sticky top-0 z-20">
            <h2 className="text-2xl font-bold text-white flex items-center">
                <span className="mr-3 text-3xl">ℹ️</span> About TalktoMeAI
            </h2>
            <button onClick={onClose} className="p-2 hover:bg-gray-800 rounded-full transition-colors text-gray-400 hover:text-white">
                <svg className="w-6 h-6" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M6 18L18 6M6 6l12 12"/></svg>
            </button>
        </div>

        {/* Content */}
        <div className="flex-grow overflow-y-auto p-6 md:p-8 space-y-10">
            
            {/* Intro Section */}
            <section className="space-y-4">
                <h3 className="text-xl font-semibold text-blue-400 border-b border-gray-800 pb-2">How it Works</h3>
                <p className="text-gray-300 leading-relaxed text-lg">
                    TalktoMeAI brings artificial intelligence to life through real-time voice conversations. Instead of typing, you simply talk. 
                    Choose a specialized persona, provide optional context (like a PDF document or your camera feed), and engage in a natural, 
                    fluid dialogue.
                </p>
                <div className="grid grid-cols-1 md:grid-cols-3 gap-6 mt-6">
                    <div className="bg-gray-800/50 p-5 rounded-xl border border-gray-700 hover:bg-gray-800 transition-colors">
                        <div className="text-4xl mb-3">🎭</div>
                        <h4 className="font-bold text-white mb-2 text-lg">1. Select Persona</h4>
                        <p className="text-sm text-gray-400">Choose an expert agent tailored to your specific needs, from Legal advice to Fitness coaching.</p>
                    </div>
                    <div className="bg-gray-800/50 p-5 rounded-xl border border-gray-700 hover:bg-gray-800 transition-colors">
                        <div className="text-4xl mb-3">📂</div>
                        <h4 className="font-bold text-white mb-2 text-lg">2. Add Context</h4>
                        <p className="text-sm text-gray-400">Upload PDFs, text files, or enable your camera to give the AI eyes on your world.</p>
                    </div>
                    <div className="bg-gray-800/50 p-5 rounded-xl border border-gray-700 hover:bg-gray-800 transition-colors">
                        <div className="text-4xl mb-3">🎙️</div>
                        <h4 className="font-bold text-white mb-2 text-lg">3. Live Chat</h4>
                        <p className="text-sm text-gray-400">Speak naturally. The AI listens, thinks, and responds instantly with human-like intonation.</p>
                    </div>
                </div>
            </section>

            {/* Tech Section */}
            <section className="space-y-4">
                <h3 className="text-xl font-semibold text-purple-400 border-b border-gray-800 pb-2">Powered by Gemini 2.5 Live API</h3>
                <div className="bg-gradient-to-r from-purple-900/20 to-indigo-900/20 p-6 rounded-xl border border-purple-500/30">
                    <div className="flex flex-col md:flex-row gap-6 items-center">
                        <div className="flex-1">
                            <p className="text-gray-300 mb-4 leading-relaxed">
                                This application leverages Google's state-of-the-art <strong>Gemini 2.5 Flash Native Audio</strong> model. 
                                It uses WebSockets to stream raw audio data bidirectionally, allowing for extremely low latency interactions 
                                that feel like a real phone call.
                            </p>
                            <ul className="grid grid-cols-1 sm:grid-cols-2 gap-3">
                                <li className="flex items-center text-sm text-gray-300">
                                    <span className="w-2 h-2 bg-green-400 rounded-full mr-2"></span>
                                    <span>Multimodal (Audio/Video/Text)</span>
                                </li>
                                <li className="flex items-center text-sm text-gray-300">
                                    <span className="w-2 h-2 bg-green-400 rounded-full mr-2"></span>
                                    <span>Sub-second Latency</span>
                                </li>
                                <li className="flex items-center text-sm text-gray-300">
                                    <span className="w-2 h-2 bg-green-400 rounded-full mr-2"></span>
                                    <span>Interruptible Speech</span>
                                </li>
                                <li className="flex items-center text-sm text-gray-300">
                                    <span className="w-2 h-2 bg-green-400 rounded-full mr-2"></span>
                                    <span>1M+ Token Context Window</span>
                                </li>
                            </ul>
                        </div>
                    </div>
                </div>
            </section>

            {/* Personas List */}
            <section className="space-y-6">
                <h3 className="text-xl font-semibold text-green-400 border-b border-gray-800 pb-2">Available Personas</h3>
                <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
                    {PERSONAS.map(p => (
                        <div key={p.id} className="flex items-start p-4 bg-gray-800 rounded-xl border border-gray-700 hover:border-gray-500 transition-all duration-300 hover:shadow-lg group">
                            <div className={`flex-shrink-0 w-12 h-12 rounded-full bg-gradient-to-br ${p.color} flex items-center justify-center text-2xl mr-4 group-hover:scale-110 transition-transform`}>
                                {p.icon}
                            </div>
                            <div>
                                <h4 className="font-bold text-white text-sm group-hover:text-blue-300 transition-colors">{p.title}</h4>
                                <p className="text-xs text-gray-400 mt-1 line-clamp-2 leading-relaxed">{p.description}</p>
                                <div className="mt-2 flex gap-2">
                                    {p.requiresFile && <span className="text-[10px] bg-blue-900/50 text-blue-300 px-1.5 py-0.5 rounded border border-blue-800">File Required</span>}
                                    {p.requiresCamera && <span className="text-[10px] bg-orange-900/50 text-orange-300 px-1.5 py-0.5 rounded border border-orange-800">Camera</span>}
                                </div>
                            </div>
                        </div>
                    ))}
                </div>
            </section>
        </div>
      </div>
    </div>
  );
};

export default AboutModal;