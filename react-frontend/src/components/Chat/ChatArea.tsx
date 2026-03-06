import React, { useRef, useEffect, useState } from 'react';
import { useChatStore } from '../../store/useChatStore';
import { MessageBubble } from './MessageBubble';
import { InputBox } from './InputBox';
import { Loader2, Stethoscope, Settings2 } from 'lucide-react';
import type { Message } from '../../types/chat';
import { sendMessage, callGeminiAPI, fetchRelatedImage } from '../../services/api';
import { AnimatePresence, motion } from 'framer-motion';

export const ChatArea: React.FC = () => {
    const { chats, currentChatId, addMessage, createNewChat, geminiApiKey, patientData } = useChatStore();

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
            // 1. Fetch Context from Vector DB Backend
            const history = currentChat?.messages || [];

            // To provide a better UI, we can simulate typing or just show loading state.
            const { response: dbResponse, context: dbContext } = await sendMessage(content, history);

            // 2. Fetch a related image based on the query (to enhance UI)
            const imageUrl = await fetchRelatedImage(content);

            // 3. Prepare the Prompt for Gemini
            if (!geminiApiKey) {
                const errorMsg: Message = {
                    id: crypto.randomUUID(),
                    role: 'assistant',
                    content: "Missing Gemini API Key. Please add it in the Settings panel.",
                    timestamp: new Date().toISOString()
                };
                addMessage(chatId, errorMsg);
                setIsLoading(false);
                return;
            }

            const prompt = `
You are an expert medical AI assistant designed to provide accurate, helpful, and empathetic responses.

--- USER QUERY ---
${content}

--- PATIENT DATA / CONTEXT ---
${patientData || "No specific patient data provided."}

--- RELEVANT CLINICAL GUIDELINES & RESEARCH (From Vector DB) ---
${dbContext && dbContext.length > 0 ? dbContext.join('\n\n') : dbResponse || "No specific vector DB context found."}

--- INSTRUCTIONS ---
Based on the User Query, the Patient Data, and the Research Evidence from the Vector DB provided above, generate a comprehensive, clear, and well-structured medical response. 
Address the user directly. Be empathetic but professional. If the Vector DB information conflicts with common medical knowledge, note the discrepancy neutrally.
If it is a general medical question, answer it fully. Use Markdown formatting (bullet points, bold text for emphasis) to make the text readable.
If no relevant info is found, provide standard medical guidance but add a disclaimer.
Keep the response detailed but strictly relevant.
`;

            // 4. Call Gemini API
            const finalResponse = await callGeminiAPI(prompt, geminiApiKey);

            const botMsg: Message = {
                id: crypto.randomUUID(),
                role: 'assistant',
                content: finalResponse,
                imageUrl: imageUrl || undefined,
                timestamp: new Date().toISOString()
            };

            addMessage(chatId, botMsg);
        } catch (error: any) {
            console.error(error);
            const errorMsg: Message = {
                id: crypto.randomUUID(),
                role: 'assistant',
                content: `An error occurred: ${error.message || 'Unable to connect to service.'} Please try again.`,
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
                                    Welcome to Medical Intelligence
                                </h1>
                                <p className="text-slate-500 leading-relaxed text-sm">
                                    Your advanced AI assistant powered by Gemini and RAG (Vector DB) for clinical research and patient analysis.
                                </p>
                                {(!geminiApiKey || !patientData) && (
                                    <div className="mt-4 p-3 bg-amber-50 text-amber-800 rounded-xl border border-amber-200 text-sm flex items-start gap-2 text-left">
                                        <Settings2 size={16} className="mt-0.5 flex-shrink-0" />
                                        <span>
                                            <strong>Setup Recommended:</strong> Open Settings in the sidebar to add your Gemini API Key and Patient Data for context-aware responses.
                                        </span>
                                    </div>
                                )}
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
