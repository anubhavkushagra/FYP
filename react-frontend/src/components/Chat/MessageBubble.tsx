import React from 'react';
import { User, Stethoscope } from 'lucide-react';
import { motion } from 'framer-motion';
import clsx from 'clsx';
import ReactMarkdown from 'react-markdown';
import type { Message } from '../../types/chat';

interface MessageBubbleProps {
    message: Message;
}

export const MessageBubble: React.FC<MessageBubbleProps> = ({ message }) => {
    const isUser = message.role === 'user';

    return (
        <motion.div
            initial={{ opacity: 0, y: 10 }}
            animate={{ opacity: 1, y: 0 }}
            className={clsx(
                "flex w-full mb-8",
                // Center alignment container
                isUser ? "justify-end" : "justify-start"
            )}
        >
            <div className={clsx(
                "flex max-w-[85%] md:max-w-[75%] gap-4",
                isUser ? "flex-row-reverse" : "flex-row"
            )}>
                {/* Avatar */}
                <div className={clsx(
                    "w-10 h-10 rounded-full flex items-center justify-center flex-shrink-0 shadow-sm border border-gray-100",
                    isUser ? "bg-primary text-white border-primary" : "bg-white text-secondary"
                )}>
                    {isUser ? <User size={20} /> : <Stethoscope size={20} />}
                </div>

                {/* Content */}
                <div className="flex flex-col gap-1 min-w-0">
                    <div className={clsx(
                        "p-5 rounded-2xl shadow-sm text-[15px] leading-relaxed break-words",
                        isUser
                            ? "bg-primary text-white rounded-tr-sm"
                            : "bg-white border border-gray-100 text-slate-700 rounded-tl-sm shadow-[0_2px_8px_-2px_rgba(0,0,0,0.05)]"
                    )}>
                        {message.imageUrl && !isUser && (
                            <div className="mb-4 overflow-hidden rounded-xl border border-slate-100/50 shadow-sm bg-slate-50">
                                <img
                                    src={message.imageUrl}
                                    alt="Reference"
                                    className="w-full h-auto max-h-64 object-cover object-center transition-transform hover:scale-105 duration-700"
                                />
                            </div>
                        )}
                        {isUser ? (
                            <p className="whitespace-pre-wrap">{message.content}</p>
                        ) : (
                            <div className="prose prose-sm max-w-none prose-p:text-slate-700 prose-headings:text-slate-900 prose-headings:font-semibold prose-strong:text-slate-900 prose-a:text-primary">
                                <ReactMarkdown>{message.content}</ReactMarkdown>
                            </div>
                        )}
                    </div>

                    <span className={clsx(
                        "text-[11px] font-medium opacity-60 px-1",
                        isUser ? "text-right" : "text-left"
                    )}>
                        {new Date(message.timestamp).toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' })}
                    </span>
                </div>
            </div>
        </motion.div>
    );
};
