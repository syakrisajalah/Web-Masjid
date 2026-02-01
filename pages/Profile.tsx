import React, { useEffect, useState, useMemo } from 'react';
import { Award, Users, History, Loader2, CheckCircle2, Shield, UserCheck, Briefcase, Search, ChevronRight, User as UserIcon, Layers } from 'lucide-react';
import { MosqueProfileData, Staff } from '../types';
import { api } from '../services/api';
import { useMosqueInfo } from '../contexts';

// Struktur data untuk menampung hirarki sesuai urutan sheet
interface BidangGroup {
    name: string;
    koordinator: Staff | null;
    wakil: Staff | null;
    anggota: Staff[];
}

interface Pillar {
    viceChair: Staff;
    bidangList: BidangGroup[];
}

export const Profile: React.FC = () => {
  const [profile, setProfile] = useState<MosqueProfileData | null>(null);
  const [staffList, setStaffList] = useState<Staff[]>([]);
  const [loading, setLoading] = useState(true);
  const [searchQuery, setSearchQuery] = useState('');
  const mosqueInfo = useMosqueInfo();

  useEffect(() => {
      const loadProfile = async () => {
          setLoading(true);
          try {
            const data = await api.getProfile();
            setProfile(data.detail);
            setStaffList(data.staff);
          } catch (error) {
            console.error("Error loading profile:", error);
          }
          setLoading(false);
      };
      loadProfile();
  }, []);

  // Helper untuk membersihkan nama bidang dari jabatan
  const getCleanBidangName = (role: string) => {
    return role
        .replace(/^(Koord\.|Wakil Koord\.|Anggota|Wakil|Koordinator|Ketua)\s+Bidang\s+/i, '')
        .replace(/^Bidang\s+/i, '')
        .trim();
  };

  // --- LOGIKA PENGELOMPOKAN BERDASARKAN URUTAN SHEET ---
  const organizedStaff = useMemo(() => {
    const structure = {
        pelindung: [] as Staff[],
        penasehat: [] as Staff[],
        harian: [] as Staff[],
        pillars: [] as Pillar[]
    };

    let currentPillar: Pillar | null = null;
    let currentBidang: BidangGroup | null = null;

    staffList.forEach(staff => {
        const role = staff.role.toLowerCase();
        const name = staff.name.toLowerCase();

        // Filter pencarian sederhana
        if (searchQuery && !name.includes(searchQuery.toLowerCase()) && !role.includes(searchQuery.toLowerCase())) return;

        // 1. Kelompok Statis (Pelindung, Penasehat, Harian Inti)
        if (role.includes('pelindung')) {
            structure.pelindung.push(staff);
        } else if (role.includes('penasehat')) {
            structure.penasehat.push(staff);
        } else if (['ketua umum', 'sekretaris umum', 'bendahara', 'wakil ketua umum'].some(r => role === r)) {
            structure.harian.push(staff);
        } 
        
        // 2. Kelompok Pilar (Wakil Ketua Bidang) - Menentukan awal seksi baru
        else if (role.includes('wakil ketua bidang')) {
            currentPillar = { viceChair: staff, bidangList: [] };
            structure.pillars.push(currentPillar);
            currentBidang = null; // Reset bidang saat masuk pilar baru
        } 
        
        // 3. Kelompok Bidang (Koordinator, Wakil, Anggota) - Mengikuti pilar sebelumnya
        else if (role.includes('bidang') && currentPillar) {
            const bName = getCleanBidangName(staff.role);
            
            // Jika nama bidang berubah dari sebelumnya dalam urutan sheet, buat grup bidang baru
            if (!currentBidang || currentBidang.name !== bName) {
                currentBidang = { name: bName, koordinator: null, wakil: null, anggota: [] };
                currentPillar.bidangList.push(currentBidang);
            }

            if (role.includes('koord.') || role.includes('koordinator') || role.includes('ketua bidang')) {
                currentBidang.koordinator = staff;
            } else if (role.includes('wakil')) {
                currentBidang.wakil = staff;
            } else {
                currentBidang.anggota.push(staff);
            }
        }
    });

    return structure;
  }, [staffList, searchQuery]);

  const renderMissionList = (text: string | undefined) => {
    if (!text) return <p className="text-gray-500 italic text-xs">Data belum tersedia.</p>;
    const items = text.split(/\r?\n|\\n/g).map(item => item.trim()).filter(item => item.length > 0);
    return (
        <ul className="space-y-2">
            {items.map((item, index) => {
                const cleanText = item.replace(/^[-*•\d.]\s*/, '');
                return (
                  <li key={index} className="flex items-start gap-2 text-gray-700 dark:text-gray-300">
                      <CheckCircle2 size={16} className="text-emerald-500 mt-0.5 flex-shrink-0" />
                      <span className="text-sm leading-relaxed">{cleanText}</span>
                  </li>
                );
            })}
        </ul>
    );
  };

  if (loading) return (
    <div className="flex flex-col justify-center items-center h-[60vh] gap-4">
        <Loader2 className="animate-spin text-emerald-600" size={40} />
        <p className="text-gray-400 text-sm animate-pulse font-medium">Menyusun Struktur Organisasi...</p>
    </div>
  );

  return (
    <div className="container mx-auto px-4 py-12">
      <div className="max-w-6xl mx-auto space-y-16">
        
        {/* Header Section */}
        <div className="text-center space-y-4">
          <div className="inline-block p-2 bg-emerald-50 dark:bg-emerald-900/20 rounded-xl mb-2">
            <Layers className="text-emerald-600" size={24} />
          </div>
          <h1 className="text-3xl md:text-4xl font-bold text-emerald-800 dark:text-emerald-400 tracking-tight">Profil & Struktur</h1>
          <p className="text-lg text-gray-500 italic font-serif">"{mosqueInfo.slogan}"</p>
        </div>

        {/* 1. SEJARAH, VISI & MISI */}
        <div className="grid grid-cols-1 lg:grid-cols-2 gap-10">
            <section className="space-y-6">
                <h2 className="text-2xl font-bold text-emerald-900 dark:text-emerald-400 flex items-center gap-3">
                    <History className="text-gold-500" size={24} /> Sejarah Singkat
                </h2>
                <div className="bg-white dark:bg-gray-800 p-6 rounded-2xl shadow-sm border border-gray-100 dark:border-gray-700">
                    <p className="text-gray-700 dark:text-gray-300 leading-relaxed whitespace-pre-wrap text-justify text-sm md:text-base">
                        {profile?.history}
                    </p>
                </div>
            </section>
            <section className="space-y-6">
                <div className="bg-emerald-800 text-white p-6 rounded-2xl shadow-lg">
                    <h2 className="text-lg font-bold mb-3 flex items-center gap-2">
                        <Award className="text-gold-400" size={20} /> Visi
                    </h2>
                    <p className="italic text-base font-serif leading-relaxed">"{profile?.vision}"</p>
                </div>
                <div className="bg-white dark:bg-gray-800 p-6 rounded-2xl shadow-sm border border-gray-100 dark:border-gray-700">
                    <h2 className="text-lg font-bold mb-4 text-emerald-900 dark:text-emerald-400 flex items-center gap-2">
                        <Users className="text-emerald-600" size={20} /> Misi Strategis
                    </h2>
                    {renderMissionList(profile?.mission)}
                </div>
            </section>
        </div>

        {/* 2. STRUKTUR ORGANISASI */}
        <section className="space-y-10 pt-10 border-t border-gray-100 dark:border-gray-800">
            <div className="text-center space-y-4">
                <h2 className="text-3xl font-bold text-gray-900 dark:text-white">Struktur Kepengurusan</h2>
                <div className="max-w-md mx-auto relative group">
                    <Search className="absolute left-4 top-1/2 -translate-y-1/2 text-gray-400 group-focus-within:text-emerald-500" size={18} />
                    <input 
                        type="text" 
                        placeholder="Cari nama atau jabatan..."
                        className="w-full pl-11 pr-4 py-3 bg-white dark:bg-gray-800 border border-gray-200 dark:border-gray-700 rounded-full shadow-sm outline-none focus:ring-2 focus:ring-emerald-500 transition-all text-sm"
                        value={searchQuery}
                        onChange={(e) => setSearchQuery(e.target.value)}
                    />
                </div>
            </div>

            {/* LEVEL 1: PELINDUNG | PENASEHAT */}
            <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                <div className="bg-emerald-50 dark:bg-emerald-900/10 p-6 rounded-2xl border border-emerald-100 dark:border-emerald-800/50">
                    <h3 className="text-[11px] font-black text-emerald-700 dark:text-emerald-400 mb-4 flex items-center gap-2 uppercase tracking-[0.2em] border-b border-emerald-200 dark:border-emerald-800/50 pb-2">
                        <Shield size={14} /> I. Pelindung
                    </h3>
                    <div className="space-y-2">
                        {organizedStaff.pelindung.map((s, i) => (
                            <div key={i} className="flex items-center gap-3 bg-white dark:bg-gray-800 p-2.5 rounded-xl text-sm font-semibold shadow-sm border border-gray-50 dark:border-gray-700">
                                <span className="bg-emerald-100 text-emerald-700 w-5 h-5 rounded flex items-center justify-center text-[10px] font-bold">{i+1}</span>
                                {s.name}
                            </div>
                        ))}
                    </div>
                </div>
                <div className="bg-blue-50 dark:bg-blue-900/10 p-6 rounded-2xl border border-blue-100 dark:border-blue-800/50">
                    <h3 className="text-[11px] font-black text-blue-700 dark:text-blue-400 mb-4 flex items-center gap-2 uppercase tracking-[0.2em] border-b border-blue-200 dark:border-blue-800/50 pb-2">
                        <UserCheck size={14} /> II. Penasehat
                    </h3>
                    <div className="grid grid-cols-1 sm:grid-cols-2 gap-2">
                        {organizedStaff.penasehat.map((s, i) => (
                            <div key={i} className="bg-white dark:bg-gray-800 p-2.5 rounded-xl text-[13px] font-semibold shadow-sm border border-gray-50 dark:border-gray-700 flex items-center gap-2">
                                <div className="w-1.5 h-1.5 bg-blue-400 rounded-full"></div>
                                {s.name}
                            </div>
                        ))}
                    </div>
                </div>
            </div>

            {/* LEVEL 2: PENGURUS HARIAN */}
            <div className="space-y-6">
                <h3 className="text-[10px] font-black text-center text-gray-400 uppercase tracking-[0.4em]">III. Pengurus Harian Inti</h3>
                <div className="grid grid-cols-1 sm:grid-cols-2 md:grid-cols-3 gap-6 max-w-4xl mx-auto">
                    {organizedStaff.harian.map((s, i) => (
                        <div key={i} className="bg-white dark:bg-gray-800 p-6 rounded-2xl shadow-sm border border-gray-100 dark:border-gray-700 text-center flex flex-col items-center hover:border-emerald-500 transition-colors">
                            <div className="w-12 h-12 bg-emerald-50 dark:bg-emerald-900/30 text-emerald-600 rounded-full flex items-center justify-center mb-3">
                                <UserIcon size={24} />
                            </div>
                            <h4 className="text-sm font-bold text-gray-900 dark:text-white leading-tight">{s.name}</h4>
                            <p className="text-[10px] font-bold text-gold-600 uppercase mt-2 tracking-widest">{s.role}</p>
                        </div>
                    ))}
                </div>
            </div>

            {/* LEVEL 3: PILAR WAKIL KETUA (DINAMIS DARI SHEET) */}
            <div className="space-y-16 pt-8">
                {organizedStaff.pillars.map((pilar, pIdx) => (
                    <div key={pIdx} className="space-y-8 animate-in fade-in slide-in-from-bottom-6 duration-500">
                        {/* Pillar Header */}
                        <div className="bg-emerald-900 text-white p-6 md:p-8 rounded-[2rem] shadow-xl flex flex-col md:flex-row items-center gap-6 border-b-8 border-gold-500">
                             <div className="w-16 h-16 bg-white/10 rounded-2xl flex items-center justify-center backdrop-blur-md border border-white/20">
                                 <Users size={32} className="text-gold-400" />
                             </div>
                             <div className="text-center md:text-left">
                                 <h4 className="text-[10px] font-black text-gold-400 uppercase tracking-[0.3em] mb-1">{pilar.viceChair.role}</h4>
                                 <p className="text-xl md:text-2xl font-black">{pilar.viceChair.name}</p>
                             </div>
                        </div>

                        {/* Bidang Grid di dalam Pilar */}
                        <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                            {pilar.bidangList.map((bidang, bIdx) => (
                                <div key={bIdx} className="bg-white dark:bg-gray-800 rounded-2xl border border-gray-100 dark:border-gray-700 shadow-sm overflow-hidden flex flex-col border-l-4 border-l-emerald-500">
                                    <div className="bg-gray-50 dark:bg-gray-700/50 p-4 border-b border-gray-100 dark:border-gray-700">
                                        <h5 className="text-xs font-bold text-emerald-800 dark:text-emerald-400 flex items-center gap-2">
                                            <Briefcase size={14} className="text-emerald-600" /> Bidang {bidang.name}
                                        </h5>
                                    </div>
                                    <div className="p-5 flex-1 space-y-5">
                                        <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
                                            {bidang.koordinator && (
                                                <div className="p-3 bg-emerald-50 dark:bg-emerald-900/10 rounded-xl border border-emerald-50 dark:border-emerald-800">
                                                    <p className="text-[9px] font-black text-emerald-600 uppercase mb-0.5">Koordinator</p>
                                                    <p className="text-xs font-bold text-gray-900 dark:text-white">{bidang.koordinator.name}</p>
                                                </div>
                                            )}
                                            {bidang.wakil && (
                                                <div className="p-3 bg-blue-50 dark:bg-blue-900/10 rounded-xl border border-blue-50 dark:border-blue-800">
                                                    <p className="text-[9px] font-black text-blue-600 uppercase mb-0.5">Wakil</p>
                                                    <p className="text-xs font-bold text-gray-900 dark:text-white">{bidang.wakil.name}</p>
                                                </div>
                                            )}
                                        </div>
                                        {bidang.anggota.length > 0 && (
                                            <div>
                                                <p className="text-[9px] font-black text-gray-400 uppercase mb-2 tracking-widest">Staf Anggota ({bidang.anggota.length})</p>
                                                <div className="grid grid-cols-1 sm:grid-cols-2 gap-x-3 gap-y-1.5">
                                                    {bidang.anggota.map((ang, aIdx) => (
                                                        <div key={aIdx} className="text-[11px] font-medium text-gray-600 dark:text-gray-400 flex items-center gap-2">
                                                            <div className="w-1 h-1 bg-emerald-400 rounded-full"></div>
                                                            {ang.name}
                                                        </div>
                                                    ))}
                                                </div>
                                            </div>
                                        )}
                                    </div>
                                </div>
                            ))}
                        </div>
                    </div>
                ))}
            </div>

            {/* Bagian Tertanda */}
            <div className="pt-20 border-t border-gray-100 dark:border-gray-700 text-center">
                <div className="max-w-xs mx-auto space-y-4">
                    <p className="text-gray-400 text-[10px] font-bold uppercase tracking-widest italic">Ketua Umum Pengurus Masjid,</p>
                    <div className="h-16 flex items-center justify-center opacity-10 select-none grayscale">
                        <img src="https://upload.wikimedia.org/wikipedia/commons/3/3a/Jon_Kirsch%27s_Signature.png" alt="Signature" className="h-full object-contain" />
                    </div>
                    <div className="space-y-1">
                        <p className="text-lg font-black text-emerald-900 dark:text-emerald-400">Assoc Prof Dr. Abdul Malik, S.Pi., M.Si</p>
                        <div className="w-10 h-0.5 bg-gold-500 mx-auto rounded-full"></div>
                    </div>
                </div>
            </div>
        </section>

      </div>
    </div>
  );
};