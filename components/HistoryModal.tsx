import React, { useState, useEffect } from 'react';
import { getSessions, deleteSession, clearAllSessions } from '../utils/storage';
import { SessionLog } from '../types';
import { PERSONAS } from '../constants';

interface HistoryModalProps {
  onClose: () => void;
}

const HistoryModal: React.FC<HistoryModalProps> = ({ onClose }) => {
  const [sessions, setSessions] = useState<SessionLog[]>([]);
  const [selectedSession, setSelectedSession] = useState<SessionLog | null>(null);
  const [searchTerm, setSearchTerm] = useState('');

  useEffect(() => {
    setSessions(getSessions());
  }, []);

  const handleDelete = (id: string, e: React.MouseEvent) => {
    e.stopPropagation();
    deleteSession(id);
    setSessions(prev => prev.filter(s => s.id !== id));
    if (selectedSession?.id === id) setSelectedSession(null);
  };

  const handleClearAll = () => {
    if (confirm('Are you sure you want to clear all history?')) {
        clearAllSessions();
        setSessions([]);
        setSelectedSession(null);
    }
  };

  const getPersonaDetails = (id: string) => PERSONAS.find(p => p.id === id);

  const formatDate = (timestamp: number) => {
      return new Date(timestamp).toLocaleString(undefined, {
          month: 'short', day: 'numeric', hour: '2-digit', minute: '2-digit'
      });
  };

  const formatDuration = (start: number, end: number) => {
      const sec = Math.floor((end - start) / 1000);
      const min = Math.floor(sec / 60);
      return `${min}m ${sec % 60}s`;
  };

  const handleDownload = () => {
    if (!selectedSession) return;
    const persona = getPersonaDetails(selectedSession.personaId);
    const dateStr = new Date(selectedSession.startTime).toISOString().split('T')[0];
    const filename = `transcript_${persona?.title.replace(/\s+/g, '_')}_${dateStr}.txt`;
    
    const content = selectedSession.messages.map(m => {
        const role = m.role === 'user' ? 'You' : (persona?.title || 'AI');
        return `[${new Date(m.timestamp).toLocaleTimeString()}] ${role}: ${m.text}`;
    }).join('\n\n');

    const blob = new Blob([content], { type: 'text/plain' });
    const url = URL.createObjectURL(blob);
    const a = document.createElement('a');
    a.href = url;
    a.download = filename;
    a.click();
    URL.revokeObjectURL(url);
  };

  // Filter logic
  const filteredSessions = sessions.filter(s => {
    const persona = getPersonaDetails(s.personaId);
    const title = persona?.title || '';
    const content = s.messages.map(m => m.text).join(' ');
    const searchLower = searchTerm.toLowerCase();
    
    return title.toLowerCase().includes(searchLower) || content.toLowerCase().includes(searchLower);
  });

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/80 backdrop-blur-sm p-4">
      <div className="bg-gray-900 w-full max-w-4xl h-[80vh] rounded-2xl border border-gray-700 shadow-2xl flex flex-col overflow-hidden relative animate-float" style={{ animationDuration: '0s' }}>
        
        {/* Header */}
        <div className="p-6 border-b border-gray-800 flex justify-between items-center bg-gray-900">
            <h2 className="text-2xl font-bold text-white flex items-center">
                <span className="mr-3 text-3xl">📜</span> Session History
            </h2>
            <div className="flex items-center space-x-4">
                {sessions.length > 0 && (
                    <button 
                        onClick={handleClearAll}
                        className="text-red-400 hover:text-red-300 text-sm underline"
                    >
                        Clear All
                    </button>
                )}
                <button onClick={onClose} className="p-2 hover:bg-gray-800 rounded-full transition-colors text-gray-400 hover:text-white">
                    <svg className="w-6 h-6" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M6 18L18 6M6 6l12 12"/></svg>
                </button>
            </div>
        </div>

        {/* Content */}
        <div className="flex-grow flex overflow-hidden">
            {/* Sidebar List */}
            <div className="w-full md:w-1/3 border-r border-gray-800 overflow-y-auto flex flex-col">
                <div className="p-4 border-b border-gray-800 bg-gray-900 sticky top-0 z-10">
                    <div className="relative">
                        <input 
                            type="text" 
                            placeholder="Search transcripts..." 
                            value={searchTerm}
                            onChange={(e) => setSearchTerm(e.target.value)}
                            className="w-full bg-gray-800 border border-gray-700 text-white rounded-lg pl-10 pr-4 py-2 text-sm focus:ring-2 focus:ring-blue-500 focus:outline-none placeholder-gray-500"
                        />
                        <svg className="w-4 h-4 text-gray-500 absolute left-3 top-2.5" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M21 21l-6-6m2-5a7 7 0 11-14 0 7 7 0 0114 0z"/></svg>
                    </div>
                </div>

                {filteredSessions.length === 0 ? (
                    <div className="p-8 text-center text-gray-500">
                        {sessions.length === 0 ? 'No history found.' : 'No matches found.'}
                    </div>
                ) : (
                    <div className="divide-y divide-gray-800">
                        {filteredSessions.map(session => {
                            const persona = getPersonaDetails(session.personaId);
                            return (
                                <div 
                                    key={session.id}
                                    onClick={() => setSelectedSession(session)}
                                    className={`p-4 cursor-pointer hover:bg-gray-800 transition-colors ${selectedSession?.id === session.id ? 'bg-gray-800 border-l-4 border-blue-500' : ''}`}
                                >
                                    <div className="flex justify-between items-start mb-1">
                                        <div className="flex items-center space-x-2">
                                            <span className="text-xl">{persona?.icon || '❓'}</span>
                                            <span className="font-semibold text-gray-200">{persona?.title || 'Unknown'}</span>
                                        </div>
                                        <button 
                                            onClick={(e) => handleDelete(session.id, e)}
                                            className="text-gray-600 hover:text-red-400"
                                            title="Delete"
                                        >
                                            <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M19 7l-.867 12.142A2 2 0 0116.138 21H7.862a2 2 0 01-1.995-1.858L5 7m5 4v6m4-6v6m1-10V4a1 1 0 00-1-1h-4a1 1 0 00-1 1v3M4 7h16"/></svg>
                                        </button>
                                    </div>
                                    <div className="flex justify-between text-xs text-gray-500 mt-2">
                                        <span>{formatDate(session.startTime)}</span>
                                        <span>{formatDuration(session.startTime, session.endTime)}</span>
                                    </div>
                                    <div className="mt-2 text-xs text-gray-400 line-clamp-2 italic">
                                        {session.messages.find(m => m.role === 'user')?.text || "No transcript"}
                                    </div>
                                </div>
                            );
                        })}
                    </div>
                )}
            </div>

            {/* Chat View */}
            <div className="hidden md:flex flex-col flex-1 bg-gray-950">
                {selectedSession ? (
                    <>
                         <div className="p-4 bg-gray-900 border-b border-gray-800 flex justify-between items-center">
                             <h3 className="font-semibold text-gray-300 ml-2">Transcript</h3>
                             <button 
                                onClick={handleDownload}
                                className="flex items-center space-x-2 text-xs bg-gray-800 hover:bg-gray-700 text-gray-300 px-3 py-1.5 rounded-lg transition-colors border border-gray-700"
                                title="Download as .txt"
                             >
                                <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M4 16v1a3 3 0 003 3h10a3 3 0 003-3v-1m-4-4l-4 4m0 0l-4-4m4 4V4"/></svg>
                                <span>Download</span>
                             </button>
                         </div>
                         <div className="flex-grow overflow-y-auto p-6 space-y-6">
                            {selectedSession.messages.map((msg, idx) => (
                                <div key={idx} className={`flex flex-col ${msg.role === 'user' ? 'items-end' : 'items-start'}`}>
                                    <div 
                                        className={`px-5 py-3 rounded-2xl max-w-[80%] text-sm leading-relaxed ${
                                            msg.role === 'user' 
                                            ? 'bg-blue-600/20 text-blue-100 border border-blue-500/30 rounded-br-none' 
                                            : 'bg-gray-800 text-gray-300 border border-gray-700 rounded-bl-none'
                                        }`}
                                    >
                                        {msg.text}
                                    </div>
                                    <span className="text-[10px] text-gray-600 mt-2">
                                        {msg.role === 'user' ? 'You' : getPersonaDetails(selectedSession.personaId)?.title || 'AI'}
                                    </span>
                                </div>
                            ))}
                         </div>
                    </>
                ) : (
                    <div className="flex items-center justify-center h-full text-gray-600">
                        <div className="text-center">
                            <span className="text-4xl opacity-30">💬</span>
                            <p className="mt-4">Select a session to view the transcript</p>
                        </div>
                    </div>
                )}
            </div>
            
            {/* Mobile View Overlay */}
            {selectedSession && (
                <div className="md:hidden absolute inset-0 bg-gray-900 z-10 flex flex-col">
                     <div className="p-4 border-b border-gray-800 flex items-center justify-between bg-gray-900">
                        <div className="flex items-center">
                            <button onClick={() => setSelectedSession(null)} className="mr-3 text-gray-400">
                                <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M15 19l-7-7 7-7"/></svg>
                            </button>
                            <h3 className="font-bold text-white truncate max-w-[150px]">
                                {getPersonaDetails(selectedSession.personaId)?.title}
                            </h3>
                        </div>
                        <button 
                            onClick={handleDownload}
                            className="text-gray-400 hover:text-white"
                        >
                             <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M4 16v1a3 3 0 003 3h10a3 3 0 003-3v-1m-4-4l-4 4m0 0l-4-4m4 4V4"/></svg>
                        </button>
                     </div>
                     <div className="flex-grow overflow-y-auto p-4 space-y-4">
                        {selectedSession.messages.map((msg, idx) => (
                             <div key={idx} className={`flex flex-col ${msg.role === 'user' ? 'items-end' : 'items-start'}`}>
                                <div className={`px-4 py-2 rounded-2xl max-w-[90%] text-sm ${msg.role === 'user' ? 'bg-blue-600 text-white' : 'bg-gray-800 text-gray-300'}`}>
                                    {msg.text}
                                </div>
                            </div>
                        ))}
                     </div>
                </div>
            )}
        </div>
      </div>
    </div>
  );
};

export default HistoryModal;