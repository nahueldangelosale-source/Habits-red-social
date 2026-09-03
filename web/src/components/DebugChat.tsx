import React, { useState, useEffect, useRef } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { Send, Bot, Wifi, WifiOff, Sparkles, AlertTriangle, Video, Apple, CreditCard } from 'lucide-react';
import { useTheme } from '../context/ThemeContext';
import { z } from 'zod';

// Zod Schema for strict deterministic routing
export const IntentEnum = z.enum(['PAIN', 'TECHNIQUE', 'NUTRITION', 'BILLING', 'GENERAL']);
type ExplicitIntent = z.infer<typeof IntentEnum>;

interface Message {
    sender: string;
    text: string;
    timestamp?: number;
    explicit_intent?: ExplicitIntent | null;
    context_ref?: { entity_type: string; entity_id: string } | null;
}

export const DebugChat: React.FC = () => {
    const { mode } = useTheme();
    const [messages, setMessages] = useState<Message[]>([]);
    const [inputText, setInputText] = useState('');
    const [selectedIntent, setSelectedIntent] = useState<ExplicitIntent | null>(null);
    const [isConnected, setIsConnected] = useState(false);
    const ws = useRef<WebSocket | null>(null);
    const messagesEndRef = useRef<HTMLDivElement>(null);

    // Mock exercise context for testing context_ref
    const mockContextRef = { entity_type: 'EXERCISE', entity_id: 'uuid-sentadilla-bulgara' };

    const scrollToBottom = () => {
        messagesEndRef.current?.scrollIntoView({ behavior: 'smooth' });
    };

    useEffect(() => {
        scrollToBottom();
    }, [messages]);

    useEffect(() => {
        // ID de usuario harcodeado: 1
        const socketUrl = 'ws://localhost:8000/ws/1';
        ws.current = new WebSocket(socketUrl);

        ws.current.onopen = () => {
            console.log('✅ Conectado al WebSocket');
            setIsConnected(true);
            setMessages(prev => [...prev, {
                sender: 'System',
                text: 'Conexión segura establecida con el Sovereign Agora.',
                timestamp: Date.now()
            }]);
        };

        ws.current.onmessage = (event) => {
            const data = JSON.parse(event.data);
            setMessages(prev => [...prev, { ...data, timestamp: Date.now() }]);
        };

        ws.current.onclose = () => {
            console.log('❌ Desconectado del WebSocket');
            setIsConnected(false);
            setMessages(prev => [...prev, {
                sender: 'System',
                text: 'Conexión perdida. Reintentando...',
                timestamp: Date.now()
            }]);
        };

        return () => {
            ws.current?.close();
        };
    }, []);

    const sendMessage = () => {
        if (inputText.trim() && ws.current && isConnected) {
            
            // Deterministic Payload Layout
            const payload = {
                text: inputText,
                explicit_intent: selectedIntent,
                context_ref: selectedIntent === 'TECHNIQUE' || selectedIntent === 'PAIN' ? mockContextRef : null
            };

            ws.current.send(JSON.stringify(payload));
            
            // Optimistic UI update
            setMessages(prev => [...prev, { 
                sender: 'You', 
                text: inputText, 
                timestamp: Date.now(),
                explicit_intent: selectedIntent,
                context_ref: payload.context_ref
            }]);
            
            setInputText('');
            setSelectedIntent(null); // Reset intent after sending
        }
    };

    const isDark = mode === 'ADRENALINE';

    // Intent Selection Chips
    const IntentChips = () => (
        <div className="flex gap-2 overflow-x-auto no-scrollbar pb-2 px-4 mb-2">
            <button 
                onClick={() => setSelectedIntent(selectedIntent === 'PAIN' ? null : 'PAIN')}
                className={`flex items-center gap-1.5 px-3 py-1.5 rounded-full text-[10px] font-bold uppercase tracking-widest transition-all whitespace-nowrap ${selectedIntent === 'PAIN' ? 'bg-red-500 text-white shadow-[0_0_15px_rgba(239,68,68,0.4)] border-red-400' : 'bg-zinc-800/50 text-zinc-400 border border-zinc-700/50 hover:text-white'}`}
            >
                <AlertTriangle size={12} /> Dolor/Lesión
            </button>
            <button 
                onClick={() => setSelectedIntent(selectedIntent === 'TECHNIQUE' ? null : 'TECHNIQUE')}
                className={`flex items-center gap-1.5 px-3 py-1.5 rounded-full text-[10px] font-bold uppercase tracking-widest transition-all whitespace-nowrap ${selectedIntent === 'TECHNIQUE' ? 'bg-blue-500 text-white shadow-[0_0_15px_rgba(59,130,246,0.4)] border-blue-400' : 'bg-zinc-800/50 text-zinc-400 border border-zinc-700/50 hover:text-white'}`}
            >
                <Video size={12} /> Duda Técnica
            </button>
            <button 
                onClick={() => setSelectedIntent(selectedIntent === 'NUTRITION' ? null : 'NUTRITION')}
                className={`flex items-center gap-1.5 px-3 py-1.5 rounded-full text-[10px] font-bold uppercase tracking-widest transition-all whitespace-nowrap ${selectedIntent === 'NUTRITION' ? 'bg-emerald-500 text-white shadow-[0_0_15px_rgba(16,185,129,0.4)] border-emerald-400' : 'bg-zinc-800/50 text-zinc-400 border border-zinc-700/50 hover:text-white'}`}
            >
                <Apple size={12} /> Nutrición
            </button>
            <button 
                onClick={() => setSelectedIntent(selectedIntent === 'BILLING' ? null : 'BILLING')}
                className={`flex items-center gap-1.5 px-3 py-1.5 rounded-full text-[10px] font-bold uppercase tracking-widest transition-all whitespace-nowrap ${selectedIntent === 'BILLING' ? 'bg-amber-500 text-white shadow-[0_0_15px_rgba(245,158,11,0.4)] border-amber-400' : 'bg-zinc-800/50 text-zinc-400 border border-zinc-700/50 hover:text-white'}`}
            >
                <CreditCard size={12} /> Pagos
            </button>
        </div>
    );

    return (
        <div className={`h-full flex flex-col ${isDark ? 'bg-gray-900 text-white' : 'bg-zinc-950 text-zinc-50'} font-sans relative`}>
            {/* Header */}
            <header className={`p-4 border-b flex items-center justify-between ${isDark ? 'border-gray-800 bg-gray-900/50' : 'border-zinc-800/50 bg-zinc-950/80'} backdrop-blur-xl sticky top-0 z-10`}>
                <div className="flex items-center gap-3">
                    <div className="relative">
                        <div className="w-10 h-10 rounded-full bg-gradient-to-tr from-indigo-500 to-purple-600 flex items-center justify-center text-white shadow-lg">
                            <Bot size={20} />
                        </div>
                        {isConnected && (
                            <span className="absolute bottom-0 right-0 w-3 h-3 bg-emerald-500 border-2 border-zinc-950 rounded-full animate-pulse"></span>
                        )}
                    </div>
                    <div>
                        <h2 className="font-bold text-lg leading-tight uppercase tracking-wide">Intelligent Inbox <span className="text-[10px] text-zinc-500 font-mono tracking-widest ml-2">v2026.1</span></h2>
                        <div className="flex items-center gap-1 text-xs opacity-70">
                            {isConnected ? (
                                <>
                                    <Wifi size={10} className="text-emerald-500" />
                                    <span className="text-emerald-500 font-medium">Sovereign Agora Auth</span>
                                </>
                            ) : (
                                <>
                                    <WifiOff size={10} className="text-red-500" />
                                    <span className="text-red-500 font-medium">Reconectando</span>
                                </>
                            )}
                        </div>
                    </div>
                </div>
                <button className={`p-2 rounded-full hover:bg-zinc-800/50 text-zinc-400 transition-colors`}>
                    <Sparkles size={18} />
                </button>
            </header>

            {/* Messages Area */}
            <div className="flex-1 overflow-y-auto p-4 space-y-4 no-scrollbar">
                <AnimatePresence initial={false}>
                    {messages.map((msg, idx) => {
                        const isMe = msg.sender === 'You';
                        const isSystem = msg.sender === 'System';

                        if (isSystem) {
                            return (
                                <motion.div
                                    key={idx}
                                    initial={{ opacity: 0, y: 10 }}
                                    animate={{ opacity: 1, y: 0 }}
                                    className="flex justify-center my-4"
                                >
                                    <span className="bg-zinc-800/30 backdrop-blur-sm text-zinc-500 text-[10px] font-mono uppercase tracking-widest py-1.5 px-4 rounded-full border border-zinc-800/50">
                                        {msg.text}
                                    </span>
                                </motion.div>
                            );
                        }

                        return (
                            <motion.div
                                key={idx}
                                initial={{ opacity: 0, scale: 0.95, y: 10, x: isMe ? 10 : -10 }}
                                animate={{ opacity: 1, scale: 1, y: 0, x: 0 }}
                                transition={{ type: "spring", stiffness: 400, damping: 25 }}
                                className={`flex ${isMe ? 'justify-end' : 'justify-start'} group`}
                            >
                                <div className={`flex flex-col gap-1 max-w-[85%] ${isMe ? 'items-end' : 'items-start'}`}>
                                    {/* Bubble */}
                                    <div className={`p-3.5 rounded-2xl shadow-sm text-sm leading-relaxed relative ${isMe
                                            ? 'bg-indigo-600 text-white rounded-br-sm'
                                            : 'bg-zinc-900 text-zinc-100 rounded-bl-sm border border-zinc-800/50'
                                        }`}>
                                        
                                        {/* Intent Badge if present */}
                                        {msg.explicit_intent && (
                                            <div className="mb-2 inline-flex items-center gap-1 text-[9px] font-bold uppercase tracking-widest px-2 py-0.5 rounded-md bg-black/20 text-indigo-200 border border-white/10">
                                                {msg.explicit_intent === 'PAIN' && <AlertTriangle size={10} />}
                                                {msg.explicit_intent === 'TECHNIQUE' && <Video size={10} />}
                                                {msg.explicit_intent === 'NUTRITION' && <Apple size={10} />}
                                                {msg.explicit_intent === 'BILLING' && <CreditCard size={10} />}
                                                {msg.explicit_intent}
                                            </div>
                                        )}
                                        
                                        <p className="whitespace-pre-wrap">{msg.text}</p>
                                        
                                        {/* Context Ref Tooltip indicator */}
                                        {msg.context_ref && isMe && (
                                            <div className="mt-2 text-[10px] text-indigo-300/70 font-mono border-t border-indigo-400/20 pt-1 flex items-center gap-1">
                                                <span>🔗</span>Ref: {msg.context_ref.entity_id.split('-').slice(-2).join('-')}
                                            </div>
                                        )}

                                        <span className={`text-[9px] mt-1 block font-mono ${isMe ? 'text-indigo-300 text-right' : 'text-zinc-500 text-left'}`}>
                                            {msg.timestamp ? new Date(msg.timestamp).toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' }) : ''}
                                        </span>
                                    </div>
                                </div>
                            </motion.div>
                        );
                    })}
                </AnimatePresence>
                <div ref={messagesEndRef} className="h-4" />
            </div>

            {/* Input Area */}
            <div className={`pt-2 pb-4 px-4 border-t ${isDark ? 'border-gray-800 bg-gray-900/90' : 'border-zinc-800/50 bg-zinc-950/90'} backdrop-blur-xl relative z-10 flex flex-col`}>
                
                <h3 className="text-[10px] text-zinc-500 font-bold uppercase tracking-widest mb-2 px-4">Context Injection (Triaje)</h3>
                <IntentChips />

                <div className={`flex items-center gap-2 p-2 rounded-2xl border ${isConnected
                        ? 'bg-zinc-900/50 border-zinc-700/50 focus-within:border-indigo-500/50 focus-within:bg-zinc-900'
                        : 'bg-zinc-900/20 border-zinc-800/50 opacity-60 cursor-not-allowed'
                    } transition-all shadow-inner`}>
                    <input
                        type="text"
                        value={inputText}
                        onChange={(e) => setInputText(e.target.value)}
                        onKeyDown={(e) => e.key === 'Enter' && sendMessage()}
                        placeholder={isConnected ? "Escribe un mensaje al entrenador..." : "Conectando..."}
                        className="flex-1 bg-transparent border-none outline-none text-sm px-3 min-w-0 placeholder-zinc-500 focus:placeholder-zinc-600 transition-colors"
                        disabled={!isConnected}
                        autoFocus
                    />
                    <button
                        onClick={sendMessage}
                        disabled={!isConnected || !inputText.trim()}
                        className={`p-2.5 rounded-xl transition-all ${inputText.trim() && isConnected
                                ? 'bg-indigo-600 text-white shadow-[0_0_20px_rgba(79,70,229,0.3)] hover:bg-indigo-500 active:scale-95'
                                : 'bg-zinc-800 text-zinc-500 cursor-default'
                            }`}
                    >
                        <Send size={18} className={inputText.trim() && isConnected ? 'translate-x-[1px] -translate-y-[1px]' : ''} />
                    </button>
                </div>
            </div>
        </div>
    );
};
