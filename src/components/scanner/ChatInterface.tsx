import React, { useState, useEffect, useRef, useMemo } from 'react';
import { Send, Bot, User, Loader2, BookOpen } from 'lucide-react';
import { chatWithCloudflare } from '../../services/cloudflareChatService';
import type { ChatMessage } from '../../services/cloudflareChatService';
import type { AIResult } from '../../services/aiTypes';
import { retrieveTrashContext, buildRagContext } from '../../services/ragService';

interface ChatInterfaceProps {
  result: AIResult;
}

export default function ChatInterface({ result }: ChatInterfaceProps) {
  // RAG: Ambil konteks dari kamus lokal berdasarkan hasil AI Vision
  const ragFacts = useMemo(() => retrieveTrashContext(result.label, result.category), [result]);
  const ragContext = useMemo(() => buildRagContext(ragFacts), [ragFacts]);

  const systemPrompt = `Kamu adalah asisten ekologi "EcoBot" yang membantu warga desa memilah sampah.
Aturan MUTLAK:
1. Jawab HANYA berdasarkan data di bawah ini. Jangan mengarang fakta di luar konteks ini.
2. Jika ada fakta harga atau waktu penguraian, gunakan angka PERSIS dari konteks.
3. Gunakan bahasa Indonesia yang santai, gaul, dan mudah dipahami.
4. Jawab singkat dan padat (maksimal 5-7 kalimat).

${ragContext}`;

  const [messages, setMessages] = useState<ChatMessage[]>([
    { role: 'system', content: systemPrompt },
    { role: 'assistant', content: `Halo! Saya EcoBot 🌿\n\nKamu baru saja scan **${ragFacts.namaResmi}**. Data lengkapnya sudah saya pegang dari kamus lokal. Mau tanya apa?` }
  ]);
  const [input, setInput] = useState('');
  const [isLoading, setIsLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const chatContainerRef = useRef<HTMLDivElement>(null);

  // Template cepat
  const quickPrompts = [
    "💡 Beri Ide Daur Ulang",
    "♻️ Bagaimana Cara Membuangnya?",
    "💰 Berapa Nilai Jualnya?"
  ];

  // Auto-scroll logic yang lebih mulus (mengunci ke bawah)
  const scrollToBottom = () => {
    if (chatContainerRef.current) {
      chatContainerRef.current.scrollTop = chatContainerRef.current.scrollHeight;
    }
  };

  useEffect(() => {
    scrollToBottom();
  }, [messages]);

  const sendMessage = async (text: string) => {
    if (!text.trim() || isLoading) return;

    const userMsg: ChatMessage = { role: 'user', content: text };
    const updatedMessages = [...messages, userMsg];
    
    setMessages(updatedMessages);
    setInput('');
    setIsLoading(true);
    setError(null);

    let assistantMsg = '';
    setMessages(prev => [...prev, { role: 'assistant', content: '' }]);

    try {
      await chatWithCloudflare(updatedMessages, (token) => {
        assistantMsg += token;
        setMessages(prev => {
          const newMessages = [...prev];
          newMessages[newMessages.length - 1] = { role: 'assistant', content: assistantMsg };
          return newMessages;
        });
        scrollToBottom(); // Kunci scroll ke bawah saat streaming
      });
    } catch (e: any) {
      setError(e.message);
    } finally {
      setIsLoading(false);
    }
  };

  const handleSend = (e: React.FormEvent) => {
    e.preventDefault();
    sendMessage(input);
  };

  // Sembunyikan prompt jika percakapan sudah berjalan (lebih dari 2 pesan awal)
  const showPrompts = messages.length <= 2;

  return (
    <div className="flex flex-col h-[500px] w-full max-w-md mx-auto bg-gray-50 rounded-3xl shadow-inner border border-gray-200 mt-6 overflow-hidden">
      <div className="bg-eco-green text-white p-4 flex items-center gap-3">
        <Bot className="w-6 h-6" />
        <div className="flex-1">
          <h3 className="font-bold">EcoBot (Cloudflare AI)</h3>
          <p className="text-xs text-eco-green-light opacity-80">Berbasis kamus lokal · Anti-Halusinasi</p>
        </div>
        <div className="bg-white/20 rounded-full px-2 py-1 flex items-center gap-1">
          <BookOpen className="w-3 h-3" />
          <span className="text-xs font-medium">RAG</span>
        </div>
      </div>
      
      <div ref={chatContainerRef} className="flex-1 overflow-y-auto p-4 flex flex-col gap-4">
        {messages.filter(m => m.role !== 'system').map((msg, idx) => (
          <div key={idx} className={`flex gap-3 max-w-[85%] ${msg.role === 'user' ? 'self-end flex-row-reverse' : 'self-start'}`}>
            <div className={`w-8 h-8 rounded-full flex items-center justify-center flex-shrink-0 shadow-sm ${msg.role === 'user' ? 'bg-eco-blue text-white' : 'bg-eco-green text-white'}`}>
              {msg.role === 'user' ? <User className="w-5 h-5" /> : <Bot className="w-5 h-5" />}
            </div>
            <div className={`p-3 rounded-2xl shadow-sm ${msg.role === 'user' ? 'bg-eco-blue text-white rounded-tr-none' : 'bg-white text-gray-800 border border-gray-200 rounded-tl-none'}`}>
              <p className="text-sm whitespace-pre-wrap leading-relaxed">{msg.content || (isLoading && idx === messages.length - 1 ? 'Mendengarkan...' : '')}</p>
            </div>
          </div>
        ))}
        {error && (
          <div className="bg-red-50 text-red-700 p-4 rounded-xl text-sm text-center border border-red-200">
            <span className="font-bold block mb-1">Koneksi Cloudflare Gagal</span>
            {error}
          </div>
        )}
      </div>

      <div className="bg-white border-t border-gray-200 flex flex-col">
        {showPrompts && (
          <div className="flex flex-wrap gap-2 p-3 pb-0">
            {quickPrompts.map((prompt, i) => (
              <button
                key={i}
                onClick={() => sendMessage(prompt)}
                disabled={isLoading}
                className="bg-gray-100 hover:bg-eco-green hover:text-white text-gray-700 text-xs px-3 py-1.5 rounded-full transition-colors border border-gray-200"
              >
                {prompt}
              </button>
            ))}
          </div>
        )}
        <form onSubmit={handleSend} className="p-3 flex gap-2">
          <input 
            type="text" 
            value={input}
            onChange={(e) => setInput(e.target.value)}
            placeholder="Tanya sesuatu..." 
            className="flex-1 border border-gray-300 rounded-full px-4 py-2 text-sm focus:outline-none focus:border-eco-green focus:ring-1 focus:ring-eco-green"
            disabled={isLoading}
          />
          <button 
            type="submit" 
            disabled={isLoading || !input.trim()}
            className="w-10 h-10 bg-eco-green text-white rounded-full flex items-center justify-center disabled:opacity-50 transition-all active:scale-95 shadow-sm shrink-0"
          >
            {isLoading ? <Loader2 className="w-5 h-5 animate-spin" /> : <Send className="w-5 h-5" />}
          </button>
        </form>
      </div>
    </div>
  );
}
