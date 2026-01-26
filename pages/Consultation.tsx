import React, { useState, useRef, useEffect } from 'react';
import { Send, Bot, User, Loader2, Info, MessageSquare, PenTool, Clock, CheckCircle, Lock } from 'lucide-react';
import { createConsultationSession, sendMessageToUstaz } from '../services/geminiService';
import { ChatMessage, ConsultationItem, UserRole } from '../types';
import { useAuth } from '../contexts';
import { Link } from 'react-router-dom';
import { api } from '../services/api';

export const Consultation: React.FC = () => {
  const { user } = useAuth();
  const [activeTab, setActiveTab] = useState<'ai' | 'manual'>('ai');

  // Common State
  if (user.role === UserRole.GUEST) {
      return (
          <div className="container mx-auto px-4 py-20 text-center">
              <div className="max-w-md mx-auto bg-white dark:bg-gray-800 p-8 rounded-2xl shadow-lg border border-gray-100 dark:border-gray-700">
                  <Lock size={48} className="mx-auto text-emerald-500 mb-4" />
                  <h2 className="text-2xl font-bold text-gray-800 dark:text-white mb-2">Akses Terbatas</h2>
                  <p className="text-gray-600 dark:text-gray-300 mb-6">
                      Fitur Tanya Ustaz hanya tersedia untuk Jamaah yang terdaftar. Silakan masuk atau daftar terlebih dahulu.
                  </p>
                  <Link to="/login" className="inline-block px-6 py-3 bg-emerald-600 text-white font-medium rounded-lg hover:bg-emerald-700 transition">
                      Masuk Akun
                  </Link>
              </div>
          </div>
      );
  }

  return (
    <div className="container mx-auto px-4 py-8 min-h-[calc(100vh-64px)]">
        {user.isUstadz ? (
            <UstadzDashboard />
        ) : (
            <>
                <div className="flex justify-center mb-8">
                    <div className="bg-white dark:bg-gray-800 p-1 rounded-xl shadow-sm border border-gray-200 dark:border-gray-700 inline-flex">
                        <button 
                            onClick={() => setActiveTab('ai')}
                            className={`px-6 py-2 rounded-lg text-sm font-medium transition-all ${
                                activeTab === 'ai' 
                                ? 'bg-emerald-600 text-white shadow-sm' 
                                : 'text-gray-600 dark:text-gray-400 hover:text-emerald-600'
                            }`}
                        >
                            <span className="flex items-center gap-2"><Bot size={16} /> Live Chat AI</span>
                        </button>
                        <button 
                            onClick={() => setActiveTab('manual')}
                            className={`px-6 py-2 rounded-lg text-sm font-medium transition-all ${
                                activeTab === 'manual' 
                                ? 'bg-emerald-600 text-white shadow-sm' 
                                : 'text-gray-600 dark:text-gray-400 hover:text-emerald-600'
                            }`}
                        >
                            <span className="flex items-center gap-2"><MessageSquare size={16} /> Tanya Ustadz</span>
                        </button>
                    </div>
                </div>

                {activeTab === 'ai' ? <AIChatView /> : <ManualConsultationView userId={user.id} userName={user.name} />}
            </>
        )}
    </div>
  );
};

// --- SUB COMPONENTS ---

const AIChatView: React.FC = () => {
  const [messages, setMessages] = useState<ChatMessage[]>([
    {
      id: 'welcome',
      role: 'model',
      text: 'Assalamualaikum Warahmatullahi Wabarakatuh. Saya Ustaz AI (Kecerdasan Buatan). Silakan sampaikan pertanyaan Anda. Insya Allah saya akan membantu menjawab berdasarkan sumber umum.',
      timestamp: new Date()
    }
  ]);
  const [inputText, setInputText] = useState('');
  const [isLoading, setIsLoading] = useState(false);
  const [chatSession, setChatSession] = useState<any>(null);
  const messagesEndRef = useRef<HTMLDivElement>(null);

  useEffect(() => {
    try {
        const session = createConsultationSession();
        setChatSession(session);
    } catch (e) {
        console.error("Failed to init AI", e);
    }
  }, []);

  useEffect(() => {
    messagesEndRef.current?.scrollIntoView({ behavior: 'smooth' });
  }, [messages]);

  const handleSend = async () => {
    if (!inputText.trim() || !chatSession) return;
    const userMsg: ChatMessage = { id: Date.now().toString(), role: 'user', text: inputText, timestamp: new Date() };
    setMessages(prev => [...prev, userMsg]);
    setInputText('');
    setIsLoading(true);

    try {
      const result = await sendMessageToUstaz(chatSession, userMsg.text);
      let botResponseText = '';
      const botMsgId = (Date.now() + 1).toString();
      setMessages(prev => [...prev, { id: botMsgId, role: 'model', text: '', timestamp: new Date() }]);

      for await (const chunk of result) {
        const text = (chunk as any).text; 
        if (text) {
          botResponseText += text;
          setMessages(prev => prev.map(msg => msg.id === botMsgId ? { ...msg, text: botResponseText } : msg));
        }
      }
    } catch (error) {
      setMessages(prev => [...prev, { id: Date.now().toString(), role: 'model', text: 'Mohon maaf, terjadi gangguan koneksi.', timestamp: new Date() }]);
    } finally {
      setIsLoading(false);
    }
  };

  return (
      <div className="flex flex-col h-[600px] bg-white dark:bg-gray-800 rounded-2xl shadow-lg border border-gray-200 dark:border-gray-700 overflow-hidden">
        <div className="p-4 bg-emerald-50 dark:bg-emerald-900/20 border-b border-emerald-100 dark:border-emerald-800/50 flex justify-between items-center">
            <h3 className="font-bold text-emerald-800 dark:text-emerald-400 flex items-center gap-2"><Bot size={18} /> Ustaz AI</h3>
            <span className="text-xs bg-blue-100 text-blue-700 px-2 py-1 rounded border border-blue-200">Respon Instan</span>
        </div>
        <div className="flex-1 overflow-y-auto p-4 space-y-4 bg-gray-50 dark:bg-gray-900/50">
          {messages.map((msg) => (
            <div key={msg.id} className={`flex items-start gap-3 ${msg.role === 'user' ? 'flex-row-reverse' : ''}`}>
              <div className={`w-8 h-8 rounded-full flex items-center justify-center flex-shrink-0 ${msg.role === 'user' ? 'bg-emerald-600 text-white' : 'bg-gold-500 text-white'}`}>
                {msg.role === 'user' ? <User size={16} /> : <Bot size={16} />}
              </div>
              <div className={`max-w-[80%] rounded-2xl px-4 py-3 ${msg.role === 'user' ? 'bg-emerald-600 text-white rounded-tr-none' : 'bg-white dark:bg-gray-700 text-gray-800 dark:text-gray-100 rounded-tl-none shadow-sm'}`}>
                <div className="prose dark:prose-invert text-sm whitespace-pre-wrap leading-relaxed">{msg.text}</div>
                <div className={`text-[10px] mt-1 ${msg.role === 'user' ? 'text-emerald-200' : 'text-gray-400'}`}>{msg.timestamp.toLocaleTimeString([], {hour: '2-digit', minute:'2-digit'})}</div>
              </div>
            </div>
          ))}
          <div ref={messagesEndRef} />
        </div>
        <div className="p-4 bg-white dark:bg-gray-800 border-t border-gray-200 dark:border-gray-700">
          <div className="flex gap-2">
            <textarea
              value={inputText}
              onChange={(e) => setInputText(e.target.value)}
              placeholder="Tulis pertanyaan..."
              className="flex-1 bg-gray-100 dark:bg-gray-700 text-gray-800 dark:text-gray-100 rounded-xl p-3 focus:outline-none focus:ring-2 focus:ring-emerald-500 resize-none h-[50px]"
            />
            <button onClick={handleSend} disabled={isLoading || !inputText.trim()} className="px-4 bg-emerald-600 hover:bg-emerald-700 text-white rounded-xl disabled:opacity-50 transition-colors">
              {isLoading ? <Loader2 className="animate-spin" size={20} /> : <Send size={20} />}
            </button>
          </div>
        </div>
      </div>
  );
}

const ManualConsultationView: React.FC<{userId: string, userName: string}> = ({ userId, userName }) => {
    const [questions, setQuestions] = useState<ConsultationItem[]>([]);
    const [newQuestion, setNewQuestion] = useState('');
    const [submitting, setSubmitting] = useState(false);
    const [loading, setLoading] = useState(true);

    const loadData = async () => {
        setLoading(true);
        const data = await api.getConsultations();
        // Filter: Only show my questions
        setQuestions(data.filter(q => q.userId === userId).sort((a,b) => new Date(b.createdAt).getTime() - new Date(a.createdAt).getTime()));
        setLoading(false);
    };

    useEffect(() => { loadData(); }, [userId]);

    const handleSubmit = async () => {
        if (!newQuestion.trim()) return;
        setSubmitting(true);
        const res = await api.submitConsultation(userId, userName, newQuestion);
        if (res.success) {
            setNewQuestion('');
            loadData();
        } else {
            alert('Gagal mengirim pertanyaan');
        }
        setSubmitting(false);
    };

    return (
        <div className="space-y-8">
            {/* Form */}
            <div className="bg-white dark:bg-gray-800 p-6 rounded-2xl shadow-lg border border-gray-200 dark:border-gray-700">
                <h3 className="font-bold text-lg text-emerald-800 dark:text-emerald-400 mb-4 flex items-center gap-2">
                    <PenTool size={20} /> Ajukan Pertanyaan Baru
                </h3>
                <textarea 
                    value={newQuestion}
                    onChange={e => setNewQuestion(e.target.value)}
                    placeholder="Tulis pertanyaan Anda secara detail. Ustadz kami akan menjawabnya segera..."
                    className="w-full p-4 bg-gray-50 dark:bg-gray-900 rounded-xl border border-gray-200 dark:border-gray-700 focus:ring-2 focus:ring-emerald-500 outline-none min-h-[100px]"
                />
                <div className="mt-4 flex justify-end">
                    <button 
                        onClick={handleSubmit}
                        disabled={submitting || !newQuestion.trim()}
                        className="px-6 py-2 bg-emerald-600 text-white rounded-lg hover:bg-emerald-700 transition disabled:opacity-50 flex items-center gap-2"
                    >
                        {submitting ? <Loader2 className="animate-spin" size={18} /> : <Send size={18} />}
                        Kirim ke Ustadz
                    </button>
                </div>
            </div>

            {/* List */}
            <div>
                <h3 className="font-bold text-lg text-gray-800 dark:text-white mb-4">Riwayat Pertanyaan Saya</h3>
                {loading ? (
                    <div className="text-center py-10"><Loader2 className="animate-spin mx-auto text-emerald-600" /></div>
                ) : questions.length === 0 ? (
                    <div className="text-center py-10 text-gray-500 bg-gray-50 dark:bg-gray-800 rounded-xl border border-dashed border-gray-300">Belum ada riwayat pertanyaan.</div>
                ) : (
                    <div className="space-y-4">
                        {questions.map(q => (
                            <div key={q.id} className="bg-white dark:bg-gray-800 p-6 rounded-xl shadow border border-gray-100 dark:border-gray-700">
                                <div className="flex justify-between items-start mb-3">
                                    <span className="text-xs text-gray-400 flex items-center gap-1">
                                        <Clock size={12} /> {new Date(q.createdAt).toLocaleDateString()}
                                    </span>
                                    <span className={`px-2 py-1 rounded text-xs font-bold capitalize ${q.status === 'answered' ? 'bg-green-100 text-green-700' : 'bg-yellow-100 text-yellow-700'}`}>
                                        {q.status === 'pending' ? 'Menunggu Jawaban' : 'Dijawab'}
                                    </span>
                                </div>
                                <p className="font-medium text-gray-800 dark:text-white mb-4">"{q.question}"</p>
                                
                                {q.status === 'answered' && (
                                    <div className="bg-emerald-50 dark:bg-emerald-900/20 p-4 rounded-lg border-l-4 border-emerald-500">
                                        <p className="text-xs text-emerald-600 dark:text-emerald-400 font-bold mb-1 flex items-center gap-1">
                                            <CheckCircle size={12} /> Dijawab oleh {q.answeredBy}
                                        </p>
                                        <p className="text-gray-700 dark:text-gray-300 text-sm whitespace-pre-wrap">{q.answer}</p>
                                    </div>
                                )}
                            </div>
                        ))}
                    </div>
                )}
            </div>
        </div>
    );
}

const UstadzDashboard: React.FC = () => {
    const { user } = useAuth();
    const [questions, setQuestions] = useState<ConsultationItem[]>([]);
    const [loading, setLoading] = useState(true);
    const [replyText, setReplyText] = useState<{[key:string]: string}>({});
    const [submitting, setSubmitting] = useState<string | null>(null);

    const loadData = async () => {
        setLoading(true);
        const data = await api.getConsultations();
        // Show pending questions first
        setQuestions(data.sort((a,b) => (a.status === 'pending' ? -1 : 1)));
        setLoading(false);
    };

    useEffect(() => { loadData(); }, []);

    const handleAnswer = async (id: string) => {
        const answer = replyText[id];
        if (!answer?.trim()) return;

        setSubmitting(id);
        const res = await api.answerConsultation(id, answer, user.name);
        if (res.success) {
            loadData();
            // Clear text
            const newReplies = {...replyText};
            delete newReplies[id];
            setReplyText(newReplies);
        }
        setSubmitting(null);
    };

    return (
        <div className="max-w-4xl mx-auto">
            <div className="mb-8 flex items-center justify-between">
                <div>
                    <h1 className="text-2xl font-bold text-emerald-800 dark:text-emerald-400">Dashboard Ustadz</h1>
                    <p className="text-gray-600 dark:text-gray-400">Selamat bertugas, {user.name}. Silakan jawab pertanyaan jamaah.</p>
                </div>
                <button onClick={loadData} className="text-sm text-emerald-600 hover:underline">Refresh Data</button>
            </div>

            {loading ? (
                <div className="flex justify-center py-20"><Loader2 className="animate-spin text-emerald-600" size={40} /></div>
            ) : (
                <div className="space-y-6">
                    {questions.length === 0 && <p className="text-center text-gray-500">Tidak ada pertanyaan.</p>}
                    {questions.map(q => (
                        <div key={q.id} className={`bg-white dark:bg-gray-800 p-6 rounded-xl shadow border ${q.status === 'pending' ? 'border-l-4 border-l-yellow-500 border-gray-200' : 'border-gray-200 opacity-70'}`}>
                            <div className="flex justify-between mb-2">
                                <div className="flex items-center gap-2">
                                    <div className="w-8 h-8 bg-gray-200 rounded-full flex items-center justify-center text-gray-500 text-xs font-bold">
                                        {q.userName.charAt(0)}
                                    </div>
                                    <div>
                                        <p className="text-sm font-bold text-gray-800 dark:text-white">{q.userName}</p>
                                        <p className="text-xs text-gray-400">{new Date(q.createdAt).toLocaleDateString()}</p>
                                    </div>
                                </div>
                                <span className={`px-2 py-1 rounded text-xs font-bold h-fit ${q.status === 'pending' ? 'bg-yellow-100 text-yellow-800' : 'bg-green-100 text-green-800'}`}>
                                    {q.status}
                                </span>
                            </div>

                            <div className="p-4 bg-gray-50 dark:bg-gray-900 rounded-lg mb-4">
                                <p className="text-gray-800 dark:text-gray-200 font-medium">"{q.question}"</p>
                            </div>

                            {q.status === 'pending' ? (
                                <div className="mt-4">
                                    <textarea 
                                        className="w-full p-3 border border-gray-300 dark:border-gray-600 rounded-lg focus:ring-2 focus:ring-emerald-500 outline-none text-sm dark:bg-gray-700 dark:text-white"
                                        rows={3}
                                        placeholder="Tulis jawaban..."
                                        value={replyText[q.id] || ''}
                                        onChange={e => setReplyText({...replyText, [q.id]: e.target.value})}
                                    />
                                    <div className="mt-2 flex justify-end">
                                        <button 
                                            onClick={() => handleAnswer(q.id)}
                                            disabled={submitting === q.id || !replyText[q.id]?.trim()}
                                            className="px-4 py-2 bg-emerald-600 text-white rounded-lg text-sm hover:bg-emerald-700 disabled:opacity-50 flex items-center gap-2"
                                        >
                                            {submitting === q.id && <Loader2 className="animate-spin" size={14} />} Kirim Jawaban
                                        </button>
                                    </div>
                                </div>
                            ) : (
                                <div className="mt-4 pt-4 border-t border-gray-100 dark:border-gray-700">
                                    <p className="text-sm text-gray-500 mb-1">Jawaban Anda:</p>
                                    <p className="text-gray-700 dark:text-gray-300 text-sm">{q.answer}</p>
                                </div>
                            )}
                        </div>
                    ))}
                </div>
            )}
        </div>
    );
}