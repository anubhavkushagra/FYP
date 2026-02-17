import { useState } from "react";
import { Send, BookOpen, Loader2, AlertCircle } from "lucide-react";
import ReactMarkdown from "react-markdown";
import { motion } from "framer-motion";

// Define the shape of the data coming from your Python API
interface Source {
  content: string;
  metadata: Record<string, any>;
}

interface ApiResponse {
  answer: string;
  sources: Source[];
}

function App() {
  const [query, setQuery] = useState("");
  const [response, setResponse] = useState<ApiResponse | null>(null);
  const [isLoading, setIsLoading] = useState(false);
  const [error, setError] = useState("");

  const handleAsk = async () => {
    if (!query.trim()) return;

    setIsLoading(true);
    setError("");
    setResponse(null);

    try {
      const res = await fetch("http://localhost:8000/ask", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ question: query }),
      });

      if (!res.ok) {
        throw new Error("Failed to fetch response from backend");
      }

      const data = await res.json();
      setResponse(data);
    } catch (err) {
      setError("Error connecting to the server. Is your Python backend running?");
      console.error(err);
    } finally {
      setIsLoading(false);
    }
  };

  return (
    <div className="min-h-screen bg-gray-50 text-gray-900 font-sans p-8">
      <div className="max-w-4xl mx-auto space-y-8">
        
        {/* Header */}
        <div className="text-center space-y-2">
          <h1 className="text-4xl font-bold text-blue-900 tracking-tight">
            Medical RAG Assistant
          </h1>
          <p className="text-gray-500">
            Powered by Qdrant, BGE Embeddings & GPT-4o-mini
          </p>
        </div>

        {/* Input Section */}
        <div className="relative">
          <input
            type="text"
            value={query}
            onChange={(e) => setQuery(e.target.value)}
            onKeyDown={(e) => e.key === "Enter" && handleAsk()}
            placeholder="Ask a clinical question (e.g., 'What are the symptoms of anxiety?')"
            className="w-full p-4 pr-16 text-lg border-2 border-gray-200 rounded-xl focus:border-blue-500 focus:ring-4 focus:ring-blue-100 outline-none transition-all shadow-sm"
            disabled={isLoading}
          />
          <button
            onClick={handleAsk}
            disabled={isLoading || !query.trim()}
            className="absolute right-2 top-2 bottom-2 bg-blue-600 hover:bg-blue-700 text-white px-4 rounded-lg transition-colors disabled:opacity-50 disabled:cursor-not-allowed flex items-center gap-2"
          >
            {isLoading ? <Loader2 className="animate-spin w-5 h-5" /> : <Send className="w-5 h-5" />}
          </button>
        </div>

        {/* Error Message */}
        {error && (
          <div className="bg-red-50 text-red-600 p-4 rounded-lg flex items-center gap-2">
            <AlertCircle className="w-5 h-5" />
            {error}
          </div>
        )}

        {/* Results Section */}
        {response && (
          <motion.div 
            initial={{ opacity: 0, y: 10 }}
            animate={{ opacity: 1, y: 0 }}
            className="grid grid-cols-1 lg:grid-cols-3 gap-6"
          >
            {/* Main Answer Column */}
            <div className="lg:col-span-2 space-y-6">
              <div className="bg-white p-6 rounded-xl shadow-sm border border-gray-100">
                <h2 className="text-xl font-semibold mb-4 text-blue-900 flex items-center gap-2">
                  <span className="bg-blue-100 p-1 rounded">AI</span> Answer
                </h2>
                <div className="prose prose-blue max-w-none text-gray-700 leading-relaxed">
                  <ReactMarkdown>{response.answer}</ReactMarkdown>
                </div>
              </div>
            </div>

            {/* Sources Column */}
            <div className="space-y-4">
              <h3 className="text-sm font-semibold text-gray-500 uppercase tracking-wider flex items-center gap-2">
                <BookOpen className="w-4 h-4" /> Evidence Sources
              </h3>
              <div className="space-y-3">
                {response.sources.map((source, idx) => (
                  <div 
                    key={idx} 
                    className="bg-white p-4 rounded-lg text-sm shadow-sm border border-gray-100 hover:border-blue-200 transition-colors"
                  >
                    <p className="text-gray-600 italic line-clamp-4">
                      "{source.content}"
                    </p>
                    <div className="mt-2 text-xs text-blue-500 font-medium">
                      Source Quote #{idx + 1}
                    </div>
                  </div>
                ))}
              </div>
            </div>
          </motion.div>
        )}
      </div>
    </div>
  );
}

export default App;