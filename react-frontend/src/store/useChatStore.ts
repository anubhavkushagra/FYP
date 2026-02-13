import { create } from 'zustand';
import { persist } from 'zustand/middleware';
import type { Chat, Message } from '../types/chat';

interface ChatState {
    chats: Chat[];
    currentChatId: string | null;
    createNewChat: () => void;
    selectChat: (id: string) => void;
    deleteChat: (id: string) => void;
    addMessage: (chatId: string, message: Message) => void;
    updateChatTitle: (chatId: string, title: string) => void;
}

export const useChatStore = create<ChatState>()(
    persist(
        (set, _get) => ({
            chats: [],
            currentChatId: null,

            createNewChat: () => {
                const newChat: Chat = {
                    id: crypto.randomUUID(),
                    title: 'New Consultation',
                    messages: [],
                    createdAt: new Date().toISOString(),
                };
                set((state) => ({
                    chats: [newChat, ...state.chats],
                    currentChatId: newChat.id,
                }));
            },

            selectChat: (id) => {
                set({ currentChatId: id });
            },

            deleteChat: (id) => {
                set((state) => {
                    const newChats = state.chats.filter((chat) => chat.id !== id);
                    return {
                        chats: newChats,
                        currentChatId: state.currentChatId === id ? null : state.currentChatId,
                    };
                });
            },

            addMessage: (chatId, message) => {
                set((state) => {
                    const chatIndex = state.chats.findIndex((c) => c.id === chatId);
                    if (chatIndex === -1) return state;

                    const updatedChats = [...state.chats];
                    updatedChats[chatIndex] = {
                        ...updatedChats[chatIndex],
                        messages: [...updatedChats[chatIndex].messages, message],
                    };

                    return { chats: updatedChats };
                });
            },

            updateChatTitle: (chatId, title) => {
                set((state) => {
                    const chatIndex = state.chats.findIndex((c) => c.id === chatId);
                    if (chatIndex === -1) return state;

                    const updatedChats = [...state.chats];
                    updatedChats[chatIndex] = {
                        ...updatedChats[chatIndex],
                        title: title
                    };
                    return { chats: updatedChats };
                });
            }
        }),
        {
            name: 'mental-health-bot-storage',
        }
    )
);
