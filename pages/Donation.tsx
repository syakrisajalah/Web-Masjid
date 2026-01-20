import React, { useState, useEffect } from 'react';
import { Copy, CheckCircle, Loader2 } from 'lucide-react';
import { api } from '../services/api';
import { BankAccount } from '../types';

export const Donation: React.FC = () => {
  const [bankAccounts, setBankAccounts] = useState<BankAccount[]>([]);
  const [loading, setLoading] = useState(true);
  const [copied, setCopied] = useState('');

  useEffect(() => {
    const loadBanks = async () => {
        setLoading(true);
        const data = await api.getBankAccounts();
        setBankAccounts(data);
        setLoading(false);
    };
    loadBanks();
  }, []);

  const handleCopy = (text: string, type: string) => {
    navigator.clipboard.writeText(text);
    setCopied(type);
    setTimeout(() => setCopied(''), 2000);
  };

  return (
    <div className="container mx-auto px-4 py-12">
      <div className="max-w-3xl mx-auto">
        <div className="text-center mb-10">
          <h1 className="text-3xl font-bold text-emerald-800 dark:text-emerald-400 mb-3">Layanan Donasi Online</h1>
          <p className="text-gray-600 dark:text-gray-300">Salurkan Infaq, Shodaqoh, dan Zakat Anda dengan mudah dan aman.</p>
        </div>

        <div className="bg-white dark:bg-gray-800 rounded-2xl shadow-xl overflow-hidden border border-gray-100 dark:border-gray-700">
          <div className="p-8 bg-emerald-600 text-white text-center">
            <p className="text-sm opacity-90 mb-2">Scan QRIS (Mendukung GoPay, OVO, Dana, LinkAja, BCA Mobile, dll)</p>
            <div className="bg-white p-4 inline-block rounded-xl shadow-lg">
                {/* Placeholder for QRIS - in real implementation this could also be dynamic from API */}
               <img src="https://picsum.photos/250/250?blur=10" alt="QRIS Code" className="w-48 h-48 object-cover" />
               <div className="text-black font-bold text-xl mt-2">QRIS</div>
            </div>
            <p className="mt-4 font-semibold">a.n Masjid Al-Mustaqbal</p>
          </div>

          <div className="p-8 space-y-6">
            <h3 className="text-lg font-bold text-gray-800 dark:text-white text-center mb-4">Atau Transfer Bank</h3>
            
            {loading ? (
                 <div className="flex justify-center py-4">
                    <Loader2 className="animate-spin text-emerald-600" size={32} />
                 </div>
            ) : (
                bankAccounts.map((acc, idx) => (
                    <div key={idx} className="flex flex-col sm:flex-row items-center justify-between p-4 bg-gray-50 dark:bg-gray-700 rounded-xl">
                        <div className="text-center sm:text-left mb-2 sm:mb-0">
                            <p className="text-sm text-gray-500 dark:text-gray-300 font-medium">{acc.bankName}</p>
                            <p className="text-xl font-mono font-bold text-gray-800 dark:text-white">{acc.accountNumber}</p>
                            <p className="text-xs text-gray-400">a.n {acc.holderName}</p>
                        </div>
                        <button 
                            onClick={() => handleCopy(acc.accountNumber, acc.bankName)}
                            className="flex items-center gap-2 px-4 py-2 bg-white dark:bg-gray-600 border border-gray-200 dark:border-gray-500 rounded-lg text-sm font-medium hover:bg-gray-50 dark:hover:bg-gray-500 transition-colors"
                        >
                            {copied === acc.bankName ? <CheckCircle size={16} className="text-green-500" /> : <Copy size={16} />}
                            {copied === acc.bankName ? 'Disalin' : 'Salin'}
                        </button>
                    </div>
                ))
            )}

            <div className="mt-8 p-4 bg-yellow-50 dark:bg-yellow-900/20 border border-yellow-200 dark:border-yellow-700/50 rounded-lg text-sm text-yellow-800 dark:text-yellow-200">
                <p className="font-bold mb-1">Konfirmasi Donasi</p>
                <p>Setelah melakukan transfer, mohon konfirmasi ke WhatsApp Admin: <span className="font-mono font-bold">+62 812-3456-7890</span> agar dapat kami catat dalam laporan keuangan.</p>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
};
