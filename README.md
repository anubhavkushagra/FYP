# Medical Intelligence Chatbot (Frontend)

This project is a React-based frontend that orchestrates a sophisticated medical AI assistant. It connects to a Vector Database (for Retrieval-Augmented Generation context) and the Google Gemini API to deliver highly accurate, medical-grade prompt engineering directly from the browser. 

The aesthetic is built using Tailwind CSS with modern, frosted glassmorphism overlays and dynamic gradients.

## 🚀 Key Features

* **Advanced Prompt Engineering:** Dynamically combines the user's query, persistent Patient Data, and retrieved context from the Vector DB.
* **Direct Gemini Integration:** Generates the final output directly in the browser via `gemini-1.5-pro` using the engineered prompt.
* **Contextual Image Fetching:** Queries the Wikipedia API to retrieve and inline related medical reference images dynamically.
* **Glassmorphism UI:** Built with Vite + Tailwind CSS for a sleek, premium, modern feel.

## 🛠️ Setup Instructions

### 1. Prerequisites
- Node.js (v20+ recommended)
- A Google Gemini API Key. Get one from Google AI Studio.

### 2. Installation
Navigate to the frontend directory:
```bash
cd react-frontend
npm install
```

### 3. Environment Variables
Create a `.env` file in the `react-frontend` directory and define your backend (Vector DB retrieval) URL:
```env
# The URL pointing to your backend VectorDB retrieval API
VITE_BACKEND_URL=http://localhost:8000/chat
```
*(If your backend isn't ready, the frontend handles failures gracefully and relies solely on the Gemini API).*

### 4. Running the Development Server
```bash
npm run dev
```

### 5. Configuring the Assistant in the UI
Once the app is running in your browser:
1. Click **Settings** in the bottom-left of the sidebar.
2. Enter your **Gemini API Key** (e.g., `AIzaSy...`).
3. (Optional) Provide **Patient Data** to contextually ground the AI's responses (e.g., "45yo male, history of hypertension...").
4. Click **Save**. These settings persist in your local browser storage.

## 🧠 Where is the Prompt Engineering Logic?

The core logic that combines the user's input, the patient data, and the Vector DB context into a structured prompt lives in:
`react-frontend/src/components/Chat/ChatArea.tsx` (around lines 75-90).

Here is a snippet of how the prompt is instructed:

```text
You are an expert medical AI assistant designed to provide accurate, helpful, and empathetic responses.

--- USER QUERY ---
${content}

--- PATIENT DATA / CONTEXT ---
${patientData || "No specific patient data provided."}

--- RELEVANT CLINICAL GUIDELINES & RESEARCH (From Vector DB) ---
${dbContext && dbContext.length > 0 ? dbContext.join('\n\n') : dbResponse || "No specific vector DB context found."}

--- INSTRUCTIONS ---
Based on the User Query, the Patient Data, and the Research Evidence from the Vector DB provided above...
```
