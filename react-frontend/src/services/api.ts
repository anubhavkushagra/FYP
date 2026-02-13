
export interface ChatResponse {
    response: string;
    context?: string[]; // Optional, depending on if your backend returns this
}

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
            context: data.context || []
        };

    } catch (error) {
        console.error("API Request Error:", error);
        return {
            response: "Error connecting to the server. Is the backend running?",
            context: []
        };
    }
};
