export interface Message {
    id: string;
    role: 'user' | 'assistant';
    content: string;
    imageUrl?: string;
    timestamp: string;
}

export interface Chat {
    id: string;
    title: string;
    messages: Message[];
    createdAt: string;
}
