import React from 'react';

const TypingIndicator: React.FC = () => {
  return (
    <div className="flex items-center space-x-1 h-8 px-4 bg-gray-800/90 rounded-full border border-gray-700 shadow-lg backdrop-blur-md animate-pulse">
      <div className="w-2 h-2 bg-gray-400 rounded-full animate-bounce [animation-delay:-0.32s]"></div>
      <div className="w-2 h-2 bg-gray-400 rounded-full animate-bounce [animation-delay:-0.16s]"></div>
      <div className="w-2 h-2 bg-gray-400 rounded-full animate-bounce"></div>
    </div>
  );
};

export default TypingIndicator;