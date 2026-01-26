import React, { useState, useEffect } from 'react';
import { Settings, FilePlus, Users, DollarSign, Bell, Save, Database, AlertCircle, Share2, Copy, CheckCircle, RefreshCw, Server, Info, Loader2 } from 'lucide-react';
import { api, getScriptUrl, setScriptUrl } from '../services/api';
import { useMosqueInfo } from '../contexts';
import { InboxMessage } from '../types';

export const AdminDashboard: React.FC = () => {
  const [showSettings, setShowSettings] = useState(false);
  const [scriptUrl, setScriptUrlState] = useState('');
  const [isSaved, setIsSaved] = useState(false);
  const [magicLink, setMagicLink] = useState('');
  const [isCopied, setIsCopied] = useState(false);
  const [connectionSource, setConnectionSource] = useState<'env' | 'manual' | 'none'>('none');
  const mosqueInfo = useMosqueInfo();
  
  // Messages State
  const [messages, setMessages] = useState<InboxMessage[]>([]);
  const [loadingMessages, setLoadingMessages] = useState(false);

  useEffect(() => {
    // Cek sumber URL saat ini
    const localUrl = localStorage.getItem('masjid_app_script_url');
    const envUrl = process.env.GOOGLE_SCRIPT_URL;
    
    if (localUrl) {
        setConnectionSource('manual');
        setScriptUrlState(localUrl);
    } else if (envUrl) {
        setConnectionSource('env');
        setScriptUrlState(envUrl);
    } else {
        setConnectionSource('none');
    }
  }, [showSettings]); 

  useEffect(() => {
    if (scriptUrl) {
        const baseUrl = window.location.protocol + "//" + window.location.host + window.location.pathname;
        setMagicLink(`${baseUrl}?apiUrl=${encodeURIComponent(scriptUrl)}`);
    }
  }, [scriptUrl]);

  // Load Messages
  const loadMessages = async () => {
      setLoadingMessages(true);
      const data = await api.getMessages();
      // Sort by date descending (newest first)
      const sorted = data.sort((a,b) => new Date(b.date).getTime() - new Date(a.date).getTime());
      setMessages(sorted);
      setLoadingMessages(false);
  };

  useEffect(() => {
      loadMessages();
  }, []);

  const handleSaveSettings = () => {
    setScriptUrl(scriptUrl);
    setConnectionSource('manual');
    setIsSaved(true);
    setTimeout(() => setIsSaved(false), 3000);
  };

  const handleResetToEnv = () => {
      localStorage.removeItem('masjid_app_script_url');
      const envUrl = process.env.GOOGLE_SCRIPT_URL;
      if (envUrl) {
          setScriptUrlState(envUrl);
          setConnectionSource('env');
      } else {
          setScriptUrlState('');
          setConnectionSource('none');
      }
      alert("Pengaturan dikembalikan ke Default (Environment Variable).");
  };

  const copyMagicLink = () => {
      navigator.clipboard.writeText(magicLink);
      setIsCopied(true);
      setTimeout(() => setIsCopied(false), 2000);
  };

  return (
    <div className="container mx-auto px-4 py-12">
      <div className="flex justify-between items-center mb-10">
        <div>
          <h1 className="text-3xl font-bold text-gray-800 dark:text-white">Dashboard Admin</h1>
          <p className="text-gray-500">Selamat datang kembali, Administrator.</p>
        </div>
        <button 
            onClick={() => setShowSettings(!showSettings)}
            className="flex items-center gap-2 bg-emerald-600 text-white px-4 py-2 rounded-lg hover:bg-emerald-700 transition"
        >
          <Settings size={18} /> Pengaturan
        </button>
      </div>

      {/* Settings Panel */}
      {showSettings && (
        <div className="bg-white dark:bg-gray-800 p-6 rounded-xl shadow-lg border border-gray-200 dark:border-gray-700 mb-8 animate-in slide-in-from-top-4">
            <h2 className="text-xl font-bold mb-4 flex items-center gap-2 text-gray-800 dark:text-white">
                <Database size={20} className="text-blue-500" /> Konfigurasi Database
            </h2>
            
            {/* Status Indicator */}
            <div className="mb-6">
                {connectionSource === 'env' && (
                    <div className="bg-blue-50 dark:bg-blue-900/20 text-blue-700 dark:text-blue-300 p-3 rounded-lg flex items-start gap-3 text-sm border border-blue-100 dark:border-blue-800">
                        <Server size={18} className="mt-0.5" />
                        <div>
                            <span className="font-bold">Terhubung Otomatis (Environment Variable)</span>
                            <p className="opacity-90 mt-1">
                                Aplikasi menggunakan URL yang disetting di Vercel/System. Anda tidak perlu mengubah apa pun di sini kecuali ingin menggantinya secara manual.
                            </p>
                        </div>
                    </div>
                )}
                {connectionSource === 'manual' && (
                    <div className="bg-amber-50 dark:bg-amber-900/20 text-amber-700 dark:text-amber-300 p-3 rounded-lg flex items-start gap-3 text-sm border border-amber-100 dark:border-amber-800">
                        <Settings size={18} className="mt-0.5" />
                        <div>
                            <span className="font-bold">Mode Manual (Override)</span>
                            <p className="opacity-90 mt-1">
                                Anda menggunakan pengaturan URL manual yang disimpan di browser ini. Pengaturan Environment Variable diabaikan.
                            </p>
                            <button onClick={handleResetToEnv} className="mt-2 text-xs underline font-bold hover:text-amber-900">
                                Kembalikan ke Default
                            </button>
                        </div>
                    </div>
                )}
                {connectionSource === 'none' && (
                    <div className="bg-red-50 dark:bg-red-900/20 text-red-700 dark:text-red-300 p-3 rounded-lg flex items-start gap-3 text-sm border border-red-100 dark:border-red-800">
                        <AlertCircle size={18} className="mt-0.5" />
                        <div>
                            <span className="font-bold">Belum Terhubung</span>
                            <p className="opacity-90 mt-1">
                                Aplikasi berjalan dalam Mode Demo. Silakan masukkan URL Google Apps Script di bawah ini.
                            </p>
                        </div>
                    </div>
                )}
            </div>

            <div className="flex flex-col gap-4">
                <div>
                    <label className="text-sm font-medium text-gray-700 dark:text-gray-200 mb-1 block">
                        Google Apps Script Web App URL
                    </label>
                    <div className="flex gap-2">
                        <input 
                            type="text" 
                            value={scriptUrl}
                            onChange={(e) => setScriptUrlState(e.target.value)}
                            placeholder="https://script.google.com/macros/s/..."
                            className="flex-1 px-4 py-2 rounded-lg border border-gray-300 dark:border-gray-600 dark:bg-gray-700 dark:text-white focus:ring-2 focus:ring-emerald-500 outline-none"
                        />
                        <button 
                            onClick={handleSaveSettings}
                            className="px-6 py-2 bg-emerald-600 hover:bg-emerald-700 text-white rounded-lg font-medium flex items-center gap-2"
                        >
                            <Save size={18} /> {connectionSource === 'manual' ? 'Update' : 'Override'}
                        </button>
                    </div>
                </div>

                {/* Magic Link Section */}
                {scriptUrl && (
                    <div className="p-4 bg-gray-50 dark:bg-gray-700/50 rounded-lg border border-gray-200 dark:border-gray-600">
                        <div className="flex items-start gap-3">
                            <Share2 className="text-emerald-600 mt-1 flex-shrink-0" size={20} />
                            <div className="flex-1">
                                <h4 className="font-bold text-gray-800 dark:text-gray-200 mb-1">Bagikan Konfigurasi (Magic Link)</h4>
                                <p className="text-sm text-gray-600 dark:text-gray-400 mb-3">
                                    Gunakan link ini untuk menghubungkan HP jamaah lain secara otomatis jika mereka tidak bisa mengakses database.
                                </p>
                                <div className="flex gap-2 items-center">
                                    <code className="flex-1 bg-white dark:bg-gray-800 p-2 rounded text-xs text-gray-500 border border-gray-200 dark:border-gray-700 truncate">
                                        {magicLink}
                                    </code>
                                    <button 
                                        onClick={copyMagicLink}
                                        className="px-3 py-2 bg-emerald-600 text-white rounded-lg hover:bg-emerald-700 transition flex items-center gap-2 text-sm"
                                    >
                                        {isCopied ? <CheckCircle size={16} /> : <Copy size={16} />}
                                        {isCopied ? 'Disalin' : 'Salin'}
                                    </button>
                                </div>
                            </div>
                        </div>
                    </div>
                )}

                {isSaved && <p className="text-green-600 text-sm font-medium">Pengaturan berhasil disimpan!</p>}
            </div>
        </div>
      )}

      {/* Identity Info Card */}
      <div className="bg-white dark:bg-gray-800 rounded-xl shadow-md p-6 mb-8 border-l-4 border-emerald-500 flex flex-col md:flex-row justify-between items-start md:items-center gap-4">
        <div>
            <h3 className="text-lg font-bold text-gray-800 dark:text-white flex items-center gap-2">
                <Info size={20} className="text-emerald-600" /> Identitas Masjid (Aktif)
            </h3>
            <div className="mt-2 space-y-1 text-sm text-gray-600 dark:text-gray-300">
                <p><span className="font-semibold text-gray-800 dark:text-gray-200 w-20 inline-block">Nama:</span> {mosqueInfo.name}</p>
                <p><span className="font-semibold text-gray-800 dark:text-gray-200 w-20 inline-block">Alamat:</span> {mosqueInfo.address}</p>
            </div>
        </div>
        <div className="bg-gray-50 dark:bg-gray-700/50 p-3 rounded-lg border border-gray-200 dark:border-gray-600 text-xs text-gray-500 dark:text-gray-400 max-w-sm">
            <p className="font-semibold mb-1 text-gray-700 dark:text-gray-300">Ingin mengubah data ini?</p>
            <p>Silakan edit Sheet <code className="bg-gray-200 dark:bg-gray-600 px-1 py-0.5 rounded text-blue-500 font-mono">app_config</code> di Google Spreadsheet database Anda. Perubahan akan otomatis diterapkan ke seluruh website saat direfresh.</p>
        </div>
      </div>

      {/* Stats Grid */}
      <div className="grid grid-cols-1 md:grid-cols-4 gap-6 mb-12">
        {[
          { label: 'Jamaah Terdaftar', val: '1,204', icon: <Users size={24} />, color: 'bg-blue-500' },
          { label: 'Total Artikel', val: '45', icon: <FilePlus size={24} />, color: 'bg-green-500' },
          { label: 'Donasi Bulan Ini', val: 'Rp 12.5jt', icon: <DollarSign size={24} />, color: 'bg-yellow-500' },
          { label: 'Pengumuman Aktif', val: '3', icon: <Bell size={24} />, color: 'bg-red-500' },
        ].map((stat, idx) => (
          <div key={idx} className="bg-white dark:bg-gray-800 p-6 rounded-xl shadow-md flex items-center gap-4">
            <div className={`${stat.color} text-white p-3 rounded-lg`}>
              {stat.icon}
            </div>
            <div>
              <p className="text-sm text-gray-500 dark:text-gray-400">{stat.label}</p>
              <h3 className="text-2xl font-bold text-gray-800 dark:text-white">{stat.val}</h3>
            </div>
          </div>
        ))}
      </div>

      {/* Quick Actions & Inbox */}
      <div className="grid grid-cols-1 lg:grid-cols-2 gap-8">
        <div className="bg-white dark:bg-gray-800 rounded-xl shadow-md p-6">
          <h3 className="text-lg font-bold text-gray-800 dark:text-white mb-4">Kelola Konten</h3>
          <div className="space-y-3">
            <button className="w-full text-left px-4 py-3 rounded-lg border border-gray-200 dark:border-gray-700 hover:bg-gray-50 dark:hover:bg-gray-700 transition flex justify-between items-center">
              <span>Tulis Artikel Baru</span>
              <span className="text-xs bg-emerald-100 text-emerald-700 px-2 py-1 rounded">Buat</span>
            </button>
            <button className="w-full text-left px-4 py-3 rounded-lg border border-gray-200 dark:border-gray-700 hover:bg-gray-50 dark:hover:bg-gray-700 transition flex justify-between items-center">
              <span>Update Jadwal Shalat</span>
              <span className="text-xs bg-blue-100 text-blue-700 px-2 py-1 rounded">Edit</span>
            </button>
            <button className="w-full text-left px-4 py-3 rounded-lg border border-gray-200 dark:border-gray-700 hover:bg-gray-50 dark:hover:bg-gray-700 transition flex justify-between items-center">
              <span>Upload Foto Galeri</span>
              <span className="text-xs bg-purple-100 text-purple-700 px-2 py-1 rounded">Upload</span>
            </button>
          </div>
        </div>

        <div className="bg-white dark:bg-gray-800 rounded-xl shadow-md p-6 flex flex-col h-[400px]">
          <div className="flex justify-between items-center mb-4 border-b border-gray-100 dark:border-gray-700 pb-2">
             <h3 className="text-lg font-bold text-gray-800 dark:text-white">Pesan Masuk</h3>
             <button onClick={loadMessages} disabled={loadingMessages} className="text-emerald-600 hover:text-emerald-700">
                {loadingMessages ? <Loader2 size={18} className="animate-spin" /> : <RefreshCw size={18} />}
             </button>
          </div>
          
          <div className="space-y-4 overflow-y-auto flex-1 pr-2">
            {loadingMessages ? (
                <div className="flex justify-center items-center h-full">
                    <Loader2 className="animate-spin text-emerald-600" size={32} />
                </div>
            ) : messages.length === 0 ? (
                <div className="text-center text-gray-400 py-10">Belum ada pesan masuk.</div>
            ) : (
                messages.map((msg) => (
                <div key={msg.id} className="flex gap-3 pb-3 border-b border-gray-100 dark:border-gray-700 last:border-0 last:pb-0">
                    <div className={`w-10 h-10 rounded-full flex-shrink-0 flex items-center justify-center text-sm font-bold text-white ${msg.isRead ? 'bg-gray-400' : 'bg-emerald-500'}`}>
                        {msg.name.charAt(0).toUpperCase()}
                    </div>
                    <div className="flex-1 min-w-0">
                    <div className="flex justify-between items-start">
                        <p className={`text-sm ${msg.isRead ? 'font-medium text-gray-600 dark:text-gray-300' : 'font-bold text-gray-800 dark:text-white'}`}>
                            {msg.name}
                        </p>
                        <span className="text-[10px] text-gray-400 whitespace-nowrap ml-2">
                            {new Date(msg.date).toLocaleDateString()}
                        </span>
                    </div>
                    <p className="text-xs text-emerald-600 dark:text-emerald-400 mb-1">{msg.email}</p>
                    <p className="text-sm text-gray-600 dark:text-gray-300 break-words leading-snug">
                        {msg.message}
                    </p>
                    </div>
                </div>
                ))
            )}
          </div>
        </div>
      </div>
    </div>
  );
};