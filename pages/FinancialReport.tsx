import React, { useEffect, useState } from 'react';
import { BarChart, Bar, XAxis, YAxis, CartesianGrid, Tooltip, ResponsiveContainer } from 'recharts';
import { Transaction } from '../types';
import { api } from '../services/api';
import { Loader2 } from 'lucide-react';

export const FinancialReport: React.FC = () => {
    const [transactions, setTransactions] = useState<Transaction[]>([]);
    const [chartData, setChartData] = useState<any[]>([]);
    const [summary, setSummary] = useState({ income: 0, expense: 0, balance: 0 });
    const [loading, setLoading] = useState(true);

    useEffect(() => {
        const loadFinance = async () => {
            setLoading(true);
            const txs = await api.getTransactions();
            setTransactions(txs);
            
            // 1. Calculate Summary for Current Month (Simulation: assuming fetching fetch all, usually backend does this)
            // For simplicity, we calculate total from all fetched data
            const totalIncome = txs.filter(t => t.type === 'income').reduce((acc, curr) => acc + curr.amount, 0);
            const totalExpense = txs.filter(t => t.type === 'expense').reduce((acc, curr) => acc + curr.amount, 0);
            
            setSummary({
                income: totalIncome,
                expense: totalExpense,
                balance: totalIncome - totalExpense
            });

            // 2. Process data for Chart (Group by Month)
            // Assuming transaction date format YYYY-MM-DD
            const monthMap = new Map<string, {name: string, income: number, expense: number}>();
            const months = ['Jan', 'Feb', 'Mar', 'Apr', 'May', 'Jun', 'Jul', 'Aug', 'Sep', 'Oct', 'Nov', 'Dec'];

            txs.forEach(t => {
                const date = new Date(t.date);
                if (isNaN(date.getTime())) return;
                
                const monthIndex = date.getMonth();
                const monthName = months[monthIndex];
                
                // Use month index to sort, or just month name for simple key
                const key = monthName; 
                
                if (!monthMap.has(key)) {
                    monthMap.set(key, { name: monthName, income: 0, expense: 0 });
                }
                
                const entry = monthMap.get(key)!;
                if (t.type === 'income') entry.income += t.amount;
                else entry.expense += t.amount;
            });

            // Convert map to array and potentially sort by month index if needed (omitted strictly for simplicity here)
            // If data is empty (no transactions), fall back to empty array to avoid crash
            const processedChartData = Array.from(monthMap.values());
            
            // If API returns no data, we might want to show empty or the old mock. 
            // Here we prefer real data even if empty.
            if (processedChartData.length > 0) {
                 setChartData(processedChartData);
            } else {
                 // Fallback only if absolutely no data found to keep UI nice for demo
                 setChartData([
                    { name: 'Data Kosong', income: 0, expense: 0 }
                 ]);
            }

            setLoading(false);
        };
        loadFinance();
    }, []);

    const formatRupiah = (value: number) => new Intl.NumberFormat('id-ID', { style: 'currency', currency: 'IDR' }).format(value);

    return (
        <div className="container mx-auto px-4 py-12">
            <h1 className="text-3xl font-bold text-emerald-800 dark:text-emerald-400 mb-8">Laporan Keuangan</h1>

            {loading ? (
                 <div className="flex justify-center py-20">
                    <Loader2 className="animate-spin text-emerald-600" size={40} />
                </div>
            ) : (
                <>
                {/* Summary Cards */}
                <div className="grid grid-cols-1 md:grid-cols-3 gap-6 mb-12">
                    <div className="bg-white dark:bg-gray-800 p-6 rounded-xl shadow-md border-l-4 border-green-500">
                        <p className="text-gray-500 dark:text-gray-400 text-sm">Total Pemasukan (Tercatat)</p>
                        <p className="text-2xl font-bold text-green-600">{formatRupiah(summary.income)}</p>
                    </div>
                    <div className="bg-white dark:bg-gray-800 p-6 rounded-xl shadow-md border-l-4 border-red-500">
                        <p className="text-gray-500 dark:text-gray-400 text-sm">Total Pengeluaran (Tercatat)</p>
                        <p className="text-2xl font-bold text-red-600">{formatRupiah(summary.expense)}</p>
                    </div>
                    <div className="bg-white dark:bg-gray-800 p-6 rounded-xl shadow-md border-l-4 border-blue-500">
                        <p className="text-gray-500 dark:text-gray-400 text-sm">Saldo Kas (Tercatat)</p>
                        <p className="text-2xl font-bold text-blue-600">{formatRupiah(summary.balance)}</p>
                    </div>
                </div>

                {/* Chart */}
                <div className="bg-white dark:bg-gray-800 p-6 rounded-xl shadow-lg mb-12 h-[400px]">
                    <h3 className="text-lg font-bold mb-6 text-gray-700 dark:text-gray-200">Grafik Arus Kas (Berdasarkan Data)</h3>
                    <ResponsiveContainer width="100%" height="100%">
                        <BarChart data={chartData} margin={{ top: 5, right: 30, left: 20, bottom: 5 }}>
                            <CartesianGrid strokeDasharray="3 3" stroke="#374151" opacity={0.1} />
                            <XAxis dataKey="name" stroke="#6B7280" />
                            <YAxis stroke="#6B7280" />
                            <Tooltip 
                                contentStyle={{ backgroundColor: '#fff', borderRadius: '8px' }}
                                formatter={(value: number) => formatRupiah(value)}
                            />
                            <Bar dataKey="income" name="Pemasukan" fill="#10B981" radius={[4, 4, 0, 0]} />
                            <Bar dataKey="expense" name="Pengeluaran" fill="#EF4444" radius={[4, 4, 0, 0]} />
                        </BarChart>
                    </ResponsiveContainer>
                </div>

                {/* Recent Transactions Table */}
                <div className="bg-white dark:bg-gray-800 rounded-xl shadow-lg overflow-hidden">
                    <div className="p-6 border-b border-gray-100 dark:border-gray-700">
                        <h3 className="text-lg font-bold text-gray-700 dark:text-gray-200">Transaksi</h3>
                    </div>
                    <div className="overflow-x-auto">
                        <table className="w-full text-left text-sm text-gray-600 dark:text-gray-300">
                            <thead className="bg-gray-50 dark:bg-gray-700/50 text-xs uppercase font-medium">
                                <tr>
                                    <th className="px-6 py-4">Tanggal</th>
                                    <th className="px-6 py-4">Keterangan</th>
                                    <th className="px-6 py-4">Kategori</th>
                                    <th className="px-6 py-4 text-right">Jumlah</th>
                                </tr>
                            </thead>
                            <tbody className="divide-y divide-gray-100 dark:divide-gray-700">
                                {transactions.map((t) => (
                                    <tr key={t.id} className="hover:bg-gray-50 dark:hover:bg-gray-700 transition-colors">
                                        <td className="px-6 py-4">{t.date}</td>
                                        <td className="px-6 py-4 font-medium text-gray-800 dark:text-white">{t.description}</td>
                                        <td className="px-6 py-4">
                                            <span className="px-2 py-1 rounded-full bg-gray-100 dark:bg-gray-600 text-xs">
                                                {t.category}
                                            </span>
                                        </td>
                                        <td className={`px-6 py-4 text-right font-bold ${t.type === 'income' ? 'text-green-600' : 'text-red-600'}`}>
                                            {t.type === 'income' ? '+' : '-'} {formatRupiah(t.amount)}
                                        </td>
                                    </tr>
                                ))}
                                {transactions.length === 0 && (
                                    <tr>
                                        <td colSpan={4} className="px-6 py-8 text-center text-gray-500">Belum ada data transaksi.</td>
                                    </tr>
                                )}
                            </tbody>
                        </table>
                    </div>
                </div>
                </>
            )}
        </div>
    );
};
