import React from 'react';
import { Plus, MessageSquare, Settings, Trash2, X } from 'lucide-react';
import { motion, AnimatePresence } from 'framer-motion';
import clsx from 'clsx';
import { useChatStore } from '../../store/useChatStore';

interface SidebarProps {
    isOpen: boolean;
    onClose: () => void;
    onOpenSettings: () => void;
}

export const Sidebar: React.FC<SidebarProps> = ({ isOpen, onClose, onOpenSettings }) => {
    const { chats, currentChatId, createNewChat, selectChat, deleteChat } = useChatStore();

    const handleNewChat = () => {
        createNewChat();
        if (window.innerWidth < 768) {
            onClose();
        }
    };

    const handleSelectChat = (id: string) => {
        selectChat(id);
        if (window.innerWidth < 768) {
            onClose();
        }
    };

    return (
        <>
            {/* Mobile Overlay */}
            <AnimatePresence>
                {isOpen && (
                    <motion.div
                        initial={{ opacity: 0 }}
                        animate={{ opacity: 1 }}
                        exit={{ opacity: 0 }}
                        onClick={onClose}
                        className="fixed inset-0 bg-black/20 backdrop-blur-sm z-40 md:hidden"
                    />
                )}
            </AnimatePresence>

            {/* Sidebar Container */}
            <motion.div
                className={clsx(
                    "fixed md:static inset-y-0 left-0 z-50 w-[280px] bg-white/70 backdrop-blur-xl border-r border-white/40 flex flex-col shadow-2xl md:shadow-none h-full transition-transform duration-300 ease-in-out",
                    !isOpen && "-translate-x-full md:translate-x-0"
                )}
            >
                {/* Header */}
                <div className="p-5 border-b border-white/40 flex items-center justify-between">
                    <div className="flex items-center gap-2 text-primary font-bold text-xl tracking-tight">
                        <span className="bg-clip-text text-transparent bg-gradient-to-r from-primary to-secondary">Medical AI</span>
                    </div>
                    <button
                        onClick={onClose}
                        className="md:hidden p-1 text-gray-500 hover:text-gray-800 transition-colors"
                    >
                        <X size={20} />
                    </button>
                </div>

                {/* New Chat Action */}
                <div className="p-4">
                    <button
                        onClick={handleNewChat}
                        className="w-full flex items-center justify-center gap-2 bg-primary hover:bg-primary-dark text-white py-2.5 px-4 rounded-xl transition-all shadow-sm shadow-primary/20 hover:shadow-primary/30 active:scale-[0.98] font-medium"
                    >
                        <Plus size={18} />
                        <span>New Consultation</span>
                    </button>
                </div>

                {/* History List */}
                <div className="flex-1 overflow-y-auto px-3 py-2 space-y-1 scrollbar-hide">
                    <h2 className="text-xs font-semibold text-gray-400 uppercase tracking-wider px-3 mb-2 mt-2">
                        History
                    </h2>
                    {chats.length === 0 ? (
                        <div className="text-center py-10 px-4">
                            <p className="text-sm text-gray-400">No consultations yet.</p>
                        </div>
                    ) : (
                        chats.map((chat) => (
                            <motion.div
                                key={chat.id}
                                initial={{ opacity: 0, x: -10 }}
                                animate={{ opacity: 1, x: 0 }}
                                className={clsx(
                                    "group flex items-center justify-between p-3 rounded-lg cursor-pointer transition-all duration-200 border border-transparent",
                                    currentChatId === chat.id
                                        ? "bg-white/60 text-primary border-white/80 shadow-sm backdrop-blur-md"
                                        : "hover:bg-white/40 text-gray-600 hover:text-gray-900"
                                )}
                                onClick={() => handleSelectChat(chat.id)}
                            >
                                <div className="flex items-center gap-3 overflow-hidden">
                                    <MessageSquare
                                        size={16}
                                        className={clsx(
                                            "flex-shrink-0 transition-colors",
                                            currentChatId === chat.id ? "text-primary" : "text-gray-300 group-hover:text-gray-400"
                                        )}
                                    />
                                    <span className="truncate text-sm font-medium">
                                        {chat.title || "New Consultation"}
                                    </span>
                                </div>

                                <button
                                    onClick={(e) => {
                                        e.stopPropagation();
                                        deleteChat(chat.id);
                                    }}
                                    className="opacity-0 group-hover:opacity-100 p-1.5 text-gray-400 hover:text-red-500 hover:bg-red-50 rounded-md transition-all"
                                >
                                    <Trash2 size={14} />
                                </button>
                            </motion.div>
                        ))
                    )}
                </div>

                {/* Footer */}
                <div className="p-4 border-t border-gray-50 bg-gray-50/50">
                    <button
                        onClick={onOpenSettings}
                        className="flex items-center gap-3 text-gray-500 hover:text-gray-800 hover:bg-gray-100 w-full p-2.5 rounded-lg transition-colors text-sm font-medium"
                    >
                        <Settings size={18} />
                        <span>Settings</span>
                    </button>
                </div>
            </motion.div>
        </>
    );
};
