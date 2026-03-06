export interface ChatResponse {
    response: string;
    context?: string[]; // Optional, depending on if your backend returns this
}

import { GoogleGenerativeAI } from "@google/generative-ai";

const BACKEND_URL = import.meta.env.VITE_BACKEND_URL;

export const sendMessage = async (message: string, history: any[]): Promise<ChatResponse> => {
    if (!BACKEND_URL || BACKEND_URL.includes("replace-this")) {
        console.error("Backend URL is not set in .env");
        return {
            response: "System Error: Backend URL is not configured. Please check your .env file.",
            context: []
        };
    }

    try {
        const res = await fetch(BACKEND_URL, {
            method: "POST",
            headers: {
                "Content-Type": "application/json",
            },
            body: JSON.stringify({
                message,
                history, // Sending the history if your backend needs it
            }),
        });

        if (!res.ok) {
            throw new Error(`Server error: ${res.status}`);
        }

        const data = await res.json();

        // Ensure the response matches our interface
        return {
            response: data.response || data.answer || "No response text received", // Adjust based on your actual backend response key
            context: data.context || data.documents || data.chunks || []
        };

    } catch (error) {
        console.error("API Request Error:", error);
        return {
            response: "Error connecting to the vector database. Is the backend running?",
            context: []
        };
    }
};

export const callGeminiAPI = async (prompt: string, apiKey: string): Promise<string> => {
    if (!apiKey) {
        throw new Error("Gemini API key is not provided.");
    }

    try {
        const genAI = new GoogleGenerativeAI(apiKey);
        const model = genAI.getGenerativeModel({ model: "gemini-1.5-pro" });
        const result = await model.generateContent(prompt);
        const response = await result.response;
        return response.text();
    } catch (error: any) {
        console.error("Gemini API Error:", error);
        throw new Error(`Failed to generate response: ${error.message || 'Unknown error'}`);
    }
};

export const fetchRelatedImage = async (query: string): Promise<string | null> => {
    try {
        // Query Wikipedia API for an image related to the search term
        const encodedQuery = encodeURIComponent(query);
        const wikiUrl = `https://en.wikipedia.org/w/api.php?action=query&prop=pageimages&format=json&piprop=original&titles=${encodedQuery}&origin=*`;

        const res = await fetch(wikiUrl);
        if (!res.ok) return null;

        const data = await res.json();
        const pages = data.query?.pages;

        if (pages) {
            const pageId = Object.keys(pages)[0];
            const originalImage = pages[pageId]?.original?.source;
            if (originalImage) {
                return originalImage;
            }
        }
        return null; // No image found
    } catch (error) {
        console.error("Error fetching related image:", error);
        return null;
    }
};
