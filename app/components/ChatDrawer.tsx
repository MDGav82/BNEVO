import React, { useState, useRef, useEffect } from 'react';
import { X, Send } from 'lucide-react';
import { Mission, ChatMessage, User } from '../types';
import { Button } from './ui/Button';

interface ChatDrawerProps {
  mission: Mission;
  currentUser: User;
  onClose: () => void;
  onSendMessage: (missionId: string, text: string) => void;
}

export const ChatDrawer: React.FC<ChatDrawerProps> = ({ mission, currentUser, onClose, onSendMessage }) => {
  const [inputText, setInputText] = useState('');
  const messagesEndRef = useRef<HTMLDivElement>(null);

  const scrollToBottom = () => {
    messagesEndRef.current?.scrollIntoView({ behavior: "smooth" });
  };

  useEffect(() => {
    scrollToBottom();
  }, [mission.chatMessages]);

  const handleSend = (e: React.FormEvent) => {
    e.preventDefault();
    if (inputText.trim()) {
      onSendMessage(mission.id, inputText);
      setInputText('');
    }
  };

  return (
    <div className="fixed inset-0 z-50 flex justify-end bg-black/50 backdrop-blur-sm animate-fade-in">
      <div className="w-full max-w-md bg-white h-full flex flex-col shadow-2xl animate-slide-in-right">
        {/* Header */}
        <div className="p-4 border-b border-slate-100 flex items-center justify-between bg-white z-10">
          <div>
            <h3 className="font-bold text-slate-900">Discussion d'équipe</h3>
            <p className="text-xs text-slate-500 truncate max-w-[250px]">{mission.title}</p>
          </div>
          <button onClick={onClose} className="p-2 hover:bg-slate-100 rounded-full transition-colors">
            <X className="w-5 h-5 text-slate-500" />
          </button>
        </div>

        {/* Messages Area */}
        <div className="flex-1 overflow-y-auto p-4 space-y-4 bg-slate-50">
          {mission.chatMessages.length === 0 ? (
            <div className="h-full flex flex-col items-center justify-center text-slate-400 text-center p-8">
              <div className="w-16 h-16 bg-slate-100 rounded-full flex items-center justify-center mb-4">
                <Send className="w-6 h-6 text-slate-300" />
              </div>
              <p className="text-sm">Aucun message pour le moment.</p>
              <p className="text-xs">Posez une question à l'équipe !</p>
            </div>
          ) : (
            mission.chatMessages.map((msg) => {
              const isMe = msg.userId === currentUser.id;
              return (
                <div key={msg.id} className={`flex ${isMe ? 'justify-end' : 'justify-start'}`}>
                  {!isMe && (
                     <img src={msg.userAvatar || 'https://via.placeholder.com/32'} alt={msg.userName} className="w-8 h-8 rounded-full mr-2 self-end mb-1" />
                  )}
                  <div className={`max-w-[75%] rounded-2xl px-4 py-2 text-sm shadow-sm ${
                    isMe 
                      ? 'bg-primary-600 text-white rounded-br-none' 
                      : 'bg-white text-slate-800 border border-slate-100 rounded-bl-none'
                  }`}>
                    {!isMe && <p className="text-[10px] font-bold text-slate-400 mb-1">{msg.userName}</p>}
                    <p>{msg.text}</p>
                    <p className={`text-[10px] mt-1 text-right ${isMe ? 'text-primary-200' : 'text-slate-400'}`}>
                      {new Date(msg.timestamp).toLocaleTimeString([], {hour: '2-digit', minute:'2-digit'})}
                    </p>
                  </div>
                </div>
              );
            })
          )}
          <div ref={messagesEndRef} />
        </div>

        {/* Input Area */}
        <div className="p-4 bg-white border-t border-slate-100">
          <form onSubmit={handleSend} className="flex items-center gap-2">
            <input
              type="text"
              value={inputText}
              onChange={(e) => setInputText(e.target.value)}
              placeholder="Écrivez votre message..."
              className="flex-1 bg-slate-100 border-0 rounded-full px-4 py-3 text-sm focus:ring-2 focus:ring-primary-500 focus:bg-white transition-all"
            />
            <button 
              type="submit" 
              disabled={!inputText.trim()}
              className="p-3 bg-primary-600 text-white rounded-full hover:bg-primary-700 disabled:opacity-50 disabled:cursor-not-allowed transition-colors shadow-md"
            >
              <Send className="w-4 h-4" />
            </button>
          </form>
        </div>
      </div>
    </div>
  );
};