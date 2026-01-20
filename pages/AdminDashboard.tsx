import React, { useState, useEffect } from 'react';
import { Settings, FilePlus, Users, DollarSign, Bell, Save, Database, AlertCircle } from 'lucide-react';
import { getScriptUrl, setScriptUrl } from '../services/api';

export const AdminDashboard: React.FC = () => {
  const [showSettings, setShowSettings] = useState(false);
  const [scriptUrl, setScriptUrlState] = useState('');
  const [isSaved, setIsSaved] = useState(false);

  useEffect(() => {
    setScriptUrlState(getScriptUrl() || '');
  }, []);

  const handleSaveSettings = () => {
    setScriptUrl(scriptUrl);
    setIsSaved(true);
    setTimeout(() => setIsSaved(false), 3000);
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
                <Database size={20} className="text-blue-500" /> Konfigurasi Database (Google Sheets)
            </h2>
            <p className="text-sm text-gray-600 dark:text-gray-300 mb-4">
                Hubungkan aplikasi ini dengan Google Sheets menggunakan Google Apps Script. 
                Silakan deploy kode dari file <code>backend/Code.js</code> sebagai Web App, lalu tempel URL-nya di sini.
            </p>
            
            <div className="flex flex-col gap-3">
                <label className="text-sm font-medium text-gray-700 dark:text-gray-200">Google Apps Script Web App URL</label>
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
                        className="px-6 py-2 bg-blue-600 hover:bg-blue-700 text-white rounded-lg font-medium flex items-center gap-2"
                    >
                        <Save size={18} /> Simpan
                    </button>
                </div>
                {isSaved && <p className="text-green-600 text-sm font-medium">Pengaturan berhasil disimpan!</p>}
                {!scriptUrl && (
                    <div className="flex items-center gap-2 text-amber-600 text-xs bg-amber-50 dark:bg-amber-900/20 p-2 rounded">
                        <AlertCircle size={14} />
                        <span>Saat ini aplikasi menggunakan Mode Demo (Mock Data) karena URL belum diset.</span>
                    </div>
                )}
            </div>
        </div>
      )}

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

      {/* Quick Actions (Mock UI) */}
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

        <div className="bg-white dark:bg-gray-800 rounded-xl shadow-md p-6">
          <h3 className="text-lg font-bold text-gray-800 dark:text-white mb-4">Pesan Masuk</h3>
          <div className="space-y-4">
            {[1, 2, 3].map((i) => (
              <div key={i} className="flex gap-3 pb-3 border-b border-gray-100 dark:border-gray-700 last:border-0 last:pb-0">
                <div className="w-10 h-10 rounded-full bg-gray-200 flex-shrink-0" />
                <div>
                  <p className="text-sm font-bold text-gray-800 dark:text-white">Hamba Allah</p>
                  <p className="text-xs text-gray-500 mb-1">Tanya jawab via form kontak</p>
                  <p className="text-sm text-gray-600 dark:text-gray-300 line-clamp-1">Assalamualaikum admin, apakah bisa mengajukan proposal...</p>
                </div>
              </div>
            ))}
          </div>
        </div>
      </div>
    </div>
  );
};
