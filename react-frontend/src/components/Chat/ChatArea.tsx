import React, { useRef, useEffect, useState } from 'react';
import { useChatStore } from '../../store/useChatStore';
import { MessageBubble } from './MessageBubble';
import { InputBox } from './InputBox';
import { Loader2, Stethoscope } from 'lucide-react';
import type { Message } from '../../types/chat';
import { sendMessage } from '../../services/api';
import { AnimatePresence, motion } from 'framer-motion';

export const ChatArea: React.FC = () => {
    const { chats, currentChatId, addMessage, createNewChat } = useChatStore();

    const [isLoading, setIsLoading] = useState(false);
    const messagesEndRef = useRef<HTMLDivElement>(null);
    const scrollContainerRef = useRef<HTMLDivElement>(null);

    const currentChat = chats.find((c) => c.id === currentChatId);

    // Auto-scroll logic
    const scrollToBottom = (behavior: ScrollBehavior = 'smooth') => {
        messagesEndRef.current?.scrollIntoView({ behavior });
    };

    useEffect(() => {
        scrollToBottom();
    }, [currentChat?.messages]);

    // Initial load scroll
    useEffect(() => {
        scrollToBottom('auto');
    }, [currentChatId]);

    const handleSendMessage = async (content: string) => {
        let chatId = currentChatId;

        // Auto-create chat if none selected
        if (!chatId) {
            createNewChat();
            // We need to get the new ID from store which is async in effect, 
            // but Zustand updates synchronously usually. 
            // For safety, let's just use the store state directly after a tick or assume
            // the store action returns the ID (it doesn't currently).
            // A quick fix is to access the store state directly.
            const state = useChatStore.getState();
            chatId = state.currentChatId;
        }

        if (!chatId) return; // Should not happen

        const userMsg: Message = {
            id: crypto.randomUUID(),
            role: 'user',
            content,
            timestamp: new Date().toISOString()
        };

        addMessage(chatId, userMsg);
        setIsLoading(true);

        try {
            // Call simulated API
            const history = currentChat?.messages || [];
            const { response } = await sendMessage(content, history);

            const botMsg: Message = {
                id: crypto.randomUUID(),
                role: 'assistant',
                content: response,
                timestamp: new Date().toISOString()
            };

            addMessage(chatId, botMsg);
        } catch (error) {
            console.error(error);
            const errorMsg: Message = {
                id: crypto.randomUUID(),
                role: 'assistant',
                content: "I'm having trouble connecting to the medical database. Please try again.",
                timestamp: new Date().toISOString()
            };
            addMessage(chatId, errorMsg);
        } finally {
            setIsLoading(false);
        }
    };

    return (
        <div className="relative flex-1 flex flex-col h-full overflow-hidden bg-white/50">

            {/* Messages Scroll Area */}
            <div
                ref={scrollContainerRef}
                className="flex-1 overflow-y-auto w-full scrollbar-hide pb-32" // Padding bottom for input area
            >
                <div className="max-w-3xl mx-auto px-4 md:px-0 pt-8">

                    {/* Welcome State */}
                    {!currentChat || currentChat.messages.length === 0 ? (
                        <motion.div
                            initial={{ opacity: 0, scale: 0.95 }}
                            animate={{ opacity: 1, scale: 1 }}
                            className="flex flex-col items-center justify-center min-h-[60vh] text-center space-y-6"
                        >
                            <div className="w-20 h-20 bg-primary/10 rounded-3xl flex items-center justify-center text-primary mb-2 shadow-sm rotate-3">
                                <Stethoscope size={40} strokeWidth={1.5} />
                            </div>
                            <div className="space-y-2 max-w-md">
                                <h1 className="text-2xl font-bold text-slate-800 tracking-tight">
                                    Welcome to Mental Health Chatbot
                                </h1>
                                <p className="text-slate-500 leading-relaxed">
                                    Your advanced AI assistant for medical research and patient consultation analysis.
                                </p>
                            </div>

                            <div className="grid grid-cols-1 md:grid-cols-2 gap-3 w-full max-w-lg mt-8 text-left">
                                {[
                                    "What are the latest treatments for Type 2 Diabetes?",
                                    "Analyze this patient's blood test results...",
                                    "Summarize the guidelines for hypertension...",
                                    "Check for drug interactions between..."
                                ].map((suggestion, i) => (
                                    <button
                                        key={i}
                                        onClick={() => handleSendMessage(suggestion)}
                                        className="p-4 bg-white border border-gray-100 rounded-xl hover:border-primary/30 hover:shadow-md hover:bg-primary/5 transition-all text-sm text-slate-600 font-medium"
                                    >
                                        {suggestion}
                                    </button>
                                ))}
                            </div>
                        </motion.div>
                    ) : (
                        // Chat Messages
                        <AnimatePresence initial={false}>
                            {currentChat.messages.map((msg) => (
                                <MessageBubble key={msg.id} message={msg} />
                            ))}
                        </AnimatePresence>
                    )}

                    {/* Loading Indicator */}
                    {isLoading && (
                        <motion.div
                            initial={{ opacity: 0, y: 10 }}
                            animate={{ opacity: 1, y: 0 }}
                            className="flex items-center gap-3 text-slate-400 text-sm ml-2 mt-2"
                        >
                            <div className="w-8 h-8 rounded-full bg-white border border-gray-100 flex items-center justify-center shadow-sm">
                                <Loader2 size={16} className="animate-spin text-primary" />
                            </div>
                            <span className="font-medium animate-pulse">Analyzing medical data...</span>
                        </motion.div>
                    )}

                    <div ref={messagesEndRef} className="h-4" />
                </div>
            </div>

            {/* Input Area */}
            <InputBox onSend={handleSendMessage} isLoading={isLoading} />
        </div >
    );
};
