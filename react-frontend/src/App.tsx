import { useState } from 'react';
import { Sidebar } from './components/Sidebar/Sidebar';
import { ChatArea } from './components/Chat/ChatArea';
import { Menu } from 'lucide-react';


function App() {
  const [isSidebarOpen, setIsSidebarOpen] = useState(false);

  return (
    <div className="flex h-screen w-full bg-surface text-slate-800 overflow-hidden font-sans">
      {/* Sidebar */}
      <Sidebar
        isOpen={isSidebarOpen}
        onClose={() => setIsSidebarOpen(false)}
      />

      {/* Main Content */}
      <main className="flex-1 flex flex-col h-full relative w-full transition-all duration-300">

        {/* Mobile Header (Only visible on small screens) */}
        <div className="md:hidden flex items-center justify-between p-4 bg-white border-b border-gray-100 z-30 sticky top-0">
          <button
            onClick={() => setIsSidebarOpen(true)}
            className="p-2 -ml-2 text-gray-600 hover:bg-gray-100 rounded-lg transition-colors"
          >
            <Menu size={24} />
          </button>
          <span className="font-semibold text-primary">Mental Health Chatbot</span>
          <div className="w-8" /> {/* Spacer for centering */}
        </div>

        {/* Chat Area */}
        <ChatArea />
      </main>
    </div>
  );
}

export default App;
