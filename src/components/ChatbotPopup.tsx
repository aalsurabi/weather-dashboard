'use client';

import React, { useState, useRef, useEffect } from 'react';
import { MessageSquare, Send, X, Sparkles, AlertCircle } from 'lucide-react';

interface Message {
  id: string;
  sender: 'user' | 'bot';
  text: string;
}

interface ChatbotPopupProps {
  currentCity: string;
}

const SUGGESTIONS = [
  'Brauche ich morgen in Dortmund einen Regenschirm?',
  'Sollte ich heute Sonnencreme einpacken?',
  'Wie wird das Wetter am Wochenende?'
];

export default function ChatbotPopup({ currentCity }: ChatbotPopupProps) {
  const [isOpen, setIsOpen] = useState(false);
  const [input, setInput] = useState('');
  const [messages, setMessages] = useState<Message[]>([
    {
      id: 'welcome',
      sender: 'bot',
      text: 'Hallo! Ich bin dein AI-Wetterassistent. Wie kann ich dir heute helfen?'
    }
  ]);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState('');
  const messagesEndRef = useRef<HTMLDivElement>(null);

  // Auto scroll to latest message
  useEffect(() => {
    if (messagesEndRef.current) {
      messagesEndRef.current.scrollIntoView({ behavior: 'smooth' });
    }
  }, [messages, loading]);

  const handleSend = async (textToSend: string) => {
    if (!textToSend.trim()) return;

    const userMsg: Message = {
      id: Date.now().toString(),
      sender: 'user',
      text: textToSend
    };

    setMessages((prev) => [...prev, userMsg]);
    setInput('');
    setLoading(true);
    setError('');

    try {
      const response = await fetch('/api/chat', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json'
        },
        body: JSON.stringify({
          message: textToSend,
          currentCity: currentCity
        })
      });

      const data = await response.json();
      if (!response.ok) {
        throw new Error(data.error || 'Fehler beim Abrufen der Antwort.');
      }

      const botMsg: Message = {
        id: (Date.now() + 1).toString(),
        sender: 'bot',
        text: data.message
      };

      setMessages((prev) => [...prev, botMsg]);
    } catch (err: any) {
      console.error(err);
      setError(err.message || 'Etwas ist schiefgelaufen. Bitte versuche es erneut.');
    } finally {
      setLoading(false);
    }
  };

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    handleSend(input);
  };

  return (
    <>
      {/* Floating Action Button */}
      <button
        onClick={() => setIsOpen(!isOpen)}
        className={`fixed bottom-6 right-6 z-50 transition-all duration-300 shadow-xl active:scale-95 cursor-pointer flex items-center justify-center group select-none ${
          isOpen
            ? 'p-4.5 rounded-full bg-slate-200 dark:bg-zinc-800 text-slate-800 dark:text-zinc-200 hover:bg-slate-300 dark:hover:bg-zinc-700'
            : 'px-5 py-3.5 rounded-full bg-blue-600 hover:bg-blue-500 text-white gap-2 font-bold text-sm tracking-wide hover:scale-105 shadow-blue-500/20 hover:shadow-blue-500/40'
        }`}
        aria-label="Ask AI weather chatbot"
      >
        {isOpen ? (
          <X className="h-6 w-6 transition-transform duration-300 rotate-90" />
        ) : (
          <>
            <Sparkles className="h-4.5 w-4.5 text-amber-400 group-hover:scale-115 group-hover:rotate-12 transition-all duration-300" />
            <span>Frag rumbleAI ✨</span>
          </>
        )}
      </button>

      {/* Floating Chat Window */}
      <div
        className={`fixed bottom-24 right-6 w-[90vw] sm:w-[400px] h-[520px] max-h-[70vh] z-50 bg-white/95 dark:bg-zinc-900/95 border border-slate-200 dark:border-zinc-800 rounded-[2rem] shadow-2xl backdrop-blur-xl flex flex-col overflow-hidden transition-all duration-300 origin-bottom-right ${
          isOpen 
            ? 'scale-100 translate-y-0 opacity-100 pointer-events-auto' 
            : 'scale-90 translate-y-4 opacity-0 pointer-events-none'
        }`}
      >
        {/* Header */}
        <div className="flex items-center justify-between px-6 py-4.5 border-b border-slate-200/60 dark:border-zinc-800/60 bg-gradient-to-r from-blue-500/5 to-indigo-500/5 select-none">
          <div className="flex items-center gap-2.5">
            <div className="bg-blue-600/10 p-2 rounded-2xl">
              <Sparkles className="h-5 w-5 text-blue-600 dark:text-blue-400" />
            </div>
            <div>
              <div className="font-bold text-sm tracking-tight text-slate-800 dark:text-zinc-100">rumble Weather AI</div>
              <div className="flex items-center gap-1.5 text-[10px] text-slate-400 dark:text-zinc-500 font-medium">
                <span className="h-1.5 w-1.5 rounded-full bg-green-500 animate-pulse"></span>
                Bereit für Fragen
              </div>
            </div>
          </div>
          <button
            onClick={() => setIsOpen(false)}
            className="p-1.5 rounded-full hover:bg-slate-100 dark:hover:bg-zinc-800 text-slate-400 hover:text-slate-600 dark:hover:text-zinc-300 transition-colors cursor-pointer"
            aria-label="Close chat window"
          >
            <X className="h-4 w-4" />
          </button>
        </div>

        {/* Message Area */}
        <div className="flex-1 overflow-y-auto p-6 flex flex-col gap-4.5 select-text scrollbar-thin">
          {messages.map((msg) => (
            <div
              key={msg.id}
              className={`flex flex-col max-w-[80%] ${
                msg.sender === 'user' ? 'self-end items-end' : 'self-start items-start'
              }`}
            >
              <div
                className={`px-4.5 py-3 rounded-2xl text-[13px] font-medium leading-relaxed ${
                  msg.sender === 'user'
                    ? 'bg-blue-600 text-white rounded-tr-none shadow-md shadow-blue-600/10'
                    : 'bg-slate-100 dark:bg-zinc-800/80 text-slate-800 dark:text-zinc-200 rounded-tl-none border border-slate-200/30 dark:border-zinc-800/30'
                }`}
              >
                {msg.text}
              </div>
            </div>
          ))}

          {loading && (
            <div className="self-start flex items-center gap-2 bg-slate-100 dark:bg-zinc-800/80 px-4.5 py-3 rounded-2xl rounded-tl-none border border-slate-200/30 dark:border-zinc-800/30">
              <span className="text-[11px] text-slate-500 dark:text-zinc-400 font-medium">Überprüfe Wetterdaten</span>
              <div className="flex gap-1">
                <span className="w-1.5 h-1.5 bg-slate-400 dark:bg-zinc-500 rounded-full animate-bounce delay-100"></span>
                <span className="w-1.5 h-1.5 bg-slate-400 dark:bg-zinc-500 rounded-full animate-bounce delay-200"></span>
                <span className="w-1.5 h-1.5 bg-slate-400 dark:bg-zinc-500 rounded-full animate-bounce delay-300"></span>
              </div>
            </div>
          )}

          {error && (
            <div className="flex items-center gap-2 bg-red-500/10 text-red-500 p-3.5 rounded-2xl border border-red-500/20 text-xs font-semibold">
              <AlertCircle size={16} />
              <span>{error}</span>
            </div>
          )}

          <div ref={messagesEndRef} />
        </div>

        {/* Suggestion Chips */}
        {messages.length === 1 && !loading && (
          <div className="px-6 pb-3 flex flex-col gap-2 select-none">
            <span className="text-[10px] font-bold uppercase tracking-wider text-slate-400 dark:text-zinc-500">
              Häufige Fragen
            </span>
            <div className="flex flex-col gap-1.5">
              {SUGGESTIONS.map((s) => (
                <button
                  key={s}
                  onClick={() => handleSend(s)}
                  className="text-left text-xs font-semibold text-slate-600 dark:text-zinc-400 bg-slate-50 hover:bg-slate-100 dark:bg-zinc-800/40 dark:hover:bg-zinc-800 border border-slate-200/60 dark:border-zinc-800/60 px-4.5 py-2.5 rounded-2xl cursor-pointer transition-all active:scale-99 hover:-translate-y-0.5"
                >
                  {s}
                </button>
              ))}
            </div>
          </div>
        )}

        {/* Footer Input */}
        <form
          onSubmit={handleSubmit}
          className="p-4.5 border-t border-slate-200/60 dark:border-zinc-800/60 bg-gradient-to-t from-blue-500/5 to-transparent flex items-center gap-2.5"
        >
          <input
            type="text"
            value={input}
            onChange={(e) => setInput(e.target.value)}
            disabled={loading}
            placeholder="Frag etwas zum Wetter..."
            className="flex-1 px-4.5 py-3 rounded-full border border-slate-200 dark:border-zinc-800 bg-white/80 dark:bg-zinc-900/50 text-[13px] font-semibold text-slate-800 dark:text-gray-100 placeholder-slate-400 dark:placeholder-zinc-500 focus:outline-none focus:ring-2 focus:ring-blue-500 transition-all backdrop-blur-md shadow-sm"
          />
          <button
            type="submit"
            disabled={loading || !input.trim()}
            className="p-3 bg-blue-600 hover:bg-blue-500 text-white rounded-full transition-all duration-300 disabled:opacity-40 disabled:hover:bg-blue-600 flex items-center justify-center cursor-pointer active:scale-95 shadow-md shadow-blue-600/10"
            aria-label="Send message"
          >
            <Send className="h-4 w-4" />
          </button>
        </form>
      </div>
    </>
  );
}
