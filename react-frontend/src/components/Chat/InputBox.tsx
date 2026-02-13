import React, { useState, useRef, useEffect } from 'react';
import { Send, Loader2 } from 'lucide-react';
import { motion } from 'framer-motion';

interface InputBoxProps {
    onSend: (message: string) => void;
    isLoading: boolean;
    disabled?: boolean;
}

export const InputBox: React.FC<InputBoxProps> = ({ onSend, isLoading, disabled }) => {
    const [input, setInput] = useState('');
    const textareaRef = useRef<HTMLTextAreaElement>(null);

    const handleSubmit = (e?: React.FormEvent) => {
        e?.preventDefault();
        if (!input.trim() || isLoading || disabled) return;
        onSend(input);
        setInput('');
    };

    const handleKeyDown = (e: React.KeyboardEvent) => {
        if (e.key === 'Enter' && !e.shiftKey) {
            e.preventDefault();
            handleSubmit();
        }
    };

    useEffect(() => {
        if (textareaRef.current) {
            textareaRef.current.style.height = 'auto';
            textareaRef.current.style.height = `${Math.min(textareaRef.current.scrollHeight, 160)}px`;
        }
    }, [input]);

    return (
        <div className="absolute bottom-6 left-0 right-0 px-4 md:px-0 z-20">
            <div className="max-w-3xl mx-auto flex flex-col gap-2">
                {/* Input Container */}
                <motion.div
                    initial={{ y: 20, opacity: 0 }}
                    animate={{ y: 0, opacity: 1 }}
                    className="relative bg-white border border-gray-200 shadow-[0_8px_30px_rgb(0,0,0,0.06)] rounded-2xl p-2.5 focus-within:ring-2 focus-within:ring-primary/20 focus-within:border-primary transition-all duration-300"
                >
                    <div className="flex items-end gap-3">
                        <textarea
                            ref={textareaRef}
                            value={input}
                            onChange={(e) => setInput(e.target.value)}
                            onKeyDown={handleKeyDown}
                            placeholder="Ask a medical question..."
                            disabled={isLoading || disabled}
                            className="w-full bg-transparent border-none focus:ring-0 resize-none max-h-40 min-h-[44px] py-3 pl-3 text-[15px] leading-relaxed text-slate-800 placeholder:text-slate-400 disabled:opacity-50"
                            rows={1}
                        />

                        <motion.button
                            whileTap={{ scale: 0.95 }}
                            onClick={() => handleSubmit()}
                            disabled={!input.trim() || isLoading || disabled}
                            className="bg-primary hover:bg-primary-dark disabled:bg-slate-100 disabled:text-slate-300 disabled:cursor-not-allowed text-white p-2.5 rounded-xl transition-all shadow-sm mb-1 self-end"
                        >
                            {isLoading ? (
                                <Loader2 size={20} className="animate-spin text-primary" />
                            ) : (
                                <Send size={20} className={!input.trim() ? "opacity-50" : ""} />
                            )}
                        </motion.button>
                    </div>
                </motion.div>

                <p className="text-center text-[10px] sm:text-xs text-slate-400 font-medium">
                    Mental Health Chatbot can make mistakes. Check important info.
                </p>
            </div>
        </div >
    );
};
