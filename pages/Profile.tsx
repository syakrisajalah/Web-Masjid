import React, { useEffect, useState, useMemo } from 'react';
import { Award, Users, History, Loader2, CheckCircle2, Shield, UserCheck, Briefcase, Search, User as UserIcon, Layers, Star, Crown } from 'lucide-react';
import { MosqueProfileData, Staff } from '../types';
import { api } from '../services/api';
import { useMosqueInfo } from '../contexts';

// Struktur data untuk menampung hirarki sesuai urutan pilar dan bidang
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

  const getCleanBidangName = (role: string) => {
    return role
        .replace(/^(Koord\.|Wakil Koord\.|Anggota|Wakil|Koordinator|Ketua|Staf)\s+Bidang\s+/i, '')
        .replace(/^Bidang\s+/i, '')
        .trim();
  };

  const organizedStaff = useMemo(() => {
    const structure = {
        pelindung: [] as Staff[],
        penasehat: [] as Staff[],
        harian: {
            ketua: null as Staff | null,
            lainnya: [] as Staff[]
        },
        pillars: [] as Pillar[]
    };

    let currentPillar: Pillar | null = null;
    let currentBidang: BidangGroup | null = null;

    staffList.forEach(staff => {
        const role = staff.role.toLowerCase();
        const name = staff.name.toLowerCase();

        if (searchQuery && !name.includes(searchQuery.toLowerCase()) && !role.includes(searchQuery.toLowerCase())) return;

        if (role.includes('pelindung')) {
            structure.pelindung.push(staff);
        } else if (role.includes('penasehat')) {
            structure.penasehat.push(staff);
        } else if (['ketua umum', 'sekretaris umum', 'bendahara', 'wakil ketua umum', 'sekretaris', 'wakil bendahara'].some(r => role === r)) {
            if (role === 'ketua umum') {
                structure.harian.ketua = staff;
            } else {
                structure.harian.lainnya.push(staff);
            }
        } else if (role.includes('wakil ketua bidang')) {
            currentPillar = { viceChair: staff, bidangList: [] };
            structure.pillars.push(currentPillar);
            currentBidang = null;
        } else if (role.includes('bidang') && currentPillar) {
            const bName = getCleanBidangName(staff.role);
            if (!currentBidang || currentBidang.name !== bName) {
                currentBidang = { name: bName, koordinator: null, wakil: null, anggota: [] };
                currentPillar.bidangList.push(currentBidang);
            }
            if (role.includes('wakil')) {
                currentBidang.wakil = staff;
            } else if (role.includes('koord') || role.includes('koordinator') || role.includes('ketua bidang')) {
                currentBidang.koordinator = staff;
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
            {items.map((item, index) => (
                <li key={index} className="flex items-start gap-2 text-gray-700 dark:text-gray-300">
                    <CheckCircle2 size={16} className="text-emerald-500 mt-0.5 flex-shrink-0" />
                    <span className="text-sm leading-relaxed">{item.replace(/^[-*•\d.]\s*/, '')}</span>
                </li>
            ))}
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
      <div className="max-w-6xl mx-auto space-y-20">
        
        {/* Header */}
        <div className="text-center space-y-4">
          <div className="inline-block p-2 bg-emerald-50 dark:bg-emerald-900/20 rounded-xl mb-2">
            <Layers className="text-emerald-600" size={24} />
          </div>
          <h1 className="text-3xl md:text-4xl font-bold text-emerald-800 dark:text-emerald-400 tracking-tight">Profil & Struktur</h1>
          <p className="text-lg text-gray-500 italic font-serif">"{mosqueInfo.slogan}"</p>
        </div>

        {/* 1. VISI MISI & SEJARAH */}
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
                <div className="bg-emerald-800 text-white p-6 rounded-2xl shadow-lg border-b-4 border-gold-500">
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

        {/* 2. STRUKTUR KEPENGURUSAN */}
        <section className="space-y-16 pt-10 border-t border-gray-100 dark:border-gray-800">
            <div className="text-center space-y-4">
                <h2 className="text-3xl font-bold text-gray-900 dark:text-white">Struktur Organisasi</h2>
                <div className="max-w-md mx-auto relative group">
                    <Search className="absolute left-4 top-1/2 -translate-y-1/2 text-gray-400" size={18} />
                    <input 
                        type="text" 
                        placeholder="Cari nama atau jabatan..."
                        className="w-full pl-11 pr-4 py-3 bg-white dark:bg-gray-800 border border-gray-200 dark:border-gray-700 rounded-full shadow-sm outline-none focus:ring-2 focus:ring-emerald-500 text-sm"
                        value={searchQuery}
                        onChange={(e) => setSearchQuery(e.target.value)}
                    />
                </div>
            </div>

            {/* PELINDUNG & PENASEHAT */}
            <div className="grid grid-cols-1 md:grid-cols-2 gap-8 max-w-5xl mx-auto">
                <div className="space-y-4">
                    <h3 className="text-[11px] font-black text-emerald-700 dark:text-emerald-400 uppercase tracking-[0.2em] flex items-center gap-2">
                        <Shield size={14} /> Pelindung
                    </h3>
                    <div className="grid grid-cols-1 gap-2">
                        {organizedStaff.pelindung.map((s, i) => (
                            <div key={i} className="text-xs font-semibold text-gray-700 dark:text-gray-300 bg-emerald-50/50 dark:bg-gray-800 p-3 rounded-lg border border-emerald-100 dark:border-gray-700">
                                {s.name}
                            </div>
                        ))}
                    </div>
                </div>
                <div className="space-y-4">
                    <h3 className="text-[11px] font-black text-blue-700 dark:text-blue-400 uppercase tracking-[0.2em] flex items-center gap-2">
                        <UserCheck size={14} /> Penasehat
                    </h3>
                    <div className="grid grid-cols-1 sm:grid-cols-2 gap-2">
                        {organizedStaff.penasehat.map((s, i) => (
                            <div key={i} className="text-xs font-semibold text-gray-700 dark:text-gray-300 bg-blue-50/50 dark:bg-gray-800 p-3 rounded-lg border border-blue-100 dark:border-gray-700">
                                {s.name}
                            </div>
                        ))}
                    </div>
                </div>
            </div>

            {/* III. PENGURUS HARIAN INTI */}
            <div className="space-y-10">
                <div className="relative">
                    <div className="absolute inset-0 flex items-center" aria-hidden="true">
                        <div className="w-full border-t border-gray-200 dark:border-gray-700"></div>
                    </div>
                    <div className="relative flex justify-center">
                        <span className="bg-gray-50 dark:bg-gray-900 px-6 text-[10px] font-black text-emerald-800 dark:text-emerald-400 uppercase tracking-[0.5em]">Manajemen Eksekutif Harian</span>
                    </div>
                </div>

                <div className="max-w-5xl mx-auto space-y-8">
                    {/* KETUA UMUM - BIG CARD */}
                    {organizedStaff.harian.ketua && (
                        <div className="relative group max-w-2xl mx-auto">
                            <div className="absolute -inset-1 bg-gradient-to-r from-gold-400 to-emerald-600 rounded-[2rem] blur opacity-25 group-hover:opacity-50 transition duration-1000"></div>
                            <div className="relative bg-emerald-900 dark:bg-emerald-950 text-white rounded-[2rem] p-8 md:p-10 shadow-2xl flex flex-col md:flex-row items-center gap-8 border-t border-white/10 overflow-hidden">
                                <div className="absolute top-0 right-0 p-4 opacity-10">
                                    <Crown size={120} />
                                </div>
                                <div className="w-24 h-24 bg-gradient-to-tr from-gold-500 to-gold-400 rounded-2xl flex items-center justify-center shadow-inner transform rotate-3 flex-shrink-0">
                                    <UserIcon size={48} className="text-emerald-900" />
                                </div>
                                <div className="text-center md:text-left space-y-2">
                                    <h4 className="text-2xl md:text-3xl font-black tracking-tight">{organizedStaff.harian.ketua.name}</h4>
                                    <p className="text-gold-400 font-bold uppercase tracking-[0.2em] text-sm">{organizedStaff.harian.ketua.role}</p>
                                </div>
                            </div>
                        </div>
                    )}

                    {/* SEKRETARIS & BENDAHARA */}
                    <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                        {organizedStaff.harian.lainnya.map((s, i) => (
                            <div key={i} className="bg-white dark:bg-gray-800 p-6 rounded-3xl shadow-lg border-2 border-gray-100 dark:border-gray-700 flex items-center gap-6 hover:border-emerald-500 transition-all group">
                                <div className="w-16 h-16 bg-emerald-50 dark:bg-emerald-900/30 text-emerald-700 dark:text-emerald-400 rounded-2xl flex items-center justify-center group-hover:bg-emerald-600 group-hover:text-white transition-colors">
                                    <UserIcon size={28} />
                                </div>
                                <div className="space-y-1">
                                    <p className="text-[10px] font-black text-emerald-600 dark:text-emerald-500 uppercase tracking-widest">{s.role}</p>
                                    <h5 className="text-lg font-bold text-gray-900 dark:text-white">{s.name}</h5>
                                </div>
                            </div>
                        ))}
                    </div>
                </div>
            </div>

            {/* PILAR & BIDANG */}
            <div className="space-y-16 pt-8">
                {organizedStaff.pillars.map((pilar, pIdx) => (
                    <div key={pIdx} className="space-y-8">
                        <div className="bg-white dark:bg-gray-800 p-6 md:p-8 rounded-3xl shadow-sm flex flex-col md:flex-row items-center gap-6 border-l-8 border-l-emerald-600 border border-gray-100 dark:border-gray-700">
                             <div className="w-14 h-14 bg-emerald-50 dark:bg-emerald-900/30 rounded-xl flex items-center justify-center">
                                 <Users size={24} className="text-emerald-600" />
                             </div>
                             <div className="text-center md:text-left">
                                 <h4 className="text-[10px] font-black text-emerald-600 dark:text-emerald-500 uppercase tracking-[0.2em] mb-1">{pilar.viceChair.role}</h4>
                                 <p className="text-xl font-bold text-gray-900 dark:text-white">{pilar.viceChair.name}</p>
                             </div>
                        </div>

                        <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                            {pilar.bidangList.map((bidang, bIdx) => (
                                <div key={bIdx} className="bg-white dark:bg-gray-800 rounded-2xl border border-gray-100 dark:border-gray-700 shadow-sm overflow-hidden flex flex-col hover:shadow-md transition-shadow">
                                    <div className="bg-gray-50 dark:bg-gray-700/50 p-4 border-b border-gray-100 dark:border-gray-700">
                                        <h5 className="text-xs font-bold text-emerald-800 dark:text-emerald-400 flex items-center gap-2">
                                            <Briefcase size={14} className="text-emerald-600" /> Bidang {bidang.name}
                                        </h5>
                                    </div>
                                    <div className="p-5 flex-1 space-y-6">
                                        <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
                                            {bidang.koordinator && (
                                                <div className="p-4 bg-emerald-50 dark:bg-emerald-900/10 rounded-xl border border-emerald-100 dark:border-emerald-800">
                                                    <p className="text-[9px] font-black text-emerald-600 uppercase mb-1 tracking-widest">Koordinator</p>
                                                    <p className="text-[13px] font-bold text-gray-900 dark:text-white leading-tight">{bidang.koordinator.name}</p>
                                                </div>
                                            )}
                                            {bidang.wakil && (
                                                <div className="p-4 bg-blue-50 dark:bg-blue-900/10 rounded-xl border border-blue-100 dark:border-blue-800">
                                                    <p className="text-[9px] font-black text-blue-600 uppercase mb-1 tracking-widest">Wakil Koordinator</p>
                                                    <p className="text-[13px] font-bold text-gray-900 dark:text-white leading-tight">{bidang.wakil.name}</p>
                                                </div>
                                            )}
                                        </div>

                                        {bidang.anggota.length > 0 && (
                                            <div>
                                                <p className="text-[9px] font-black text-gray-400 uppercase mb-3 tracking-[0.2em] flex items-center gap-2">
                                                    <span className="h-px bg-gray-200 dark:bg-gray-700 flex-1"></span>
                                                    Anggota ({bidang.anggota.length})
                                                    <span className="h-px bg-gray-200 dark:bg-gray-700 flex-1"></span>
                                                </p>
                                                <div className="grid grid-cols-1 sm:grid-cols-2 gap-x-4 gap-y-2">
                                                    {bidang.anggota.map((ang, aIdx) => (
                                                        <div key={aIdx} className="text-[11px] font-medium text-gray-600 dark:text-gray-400 flex items-center gap-2">
                                                            <div className="w-1 h-1 bg-emerald-400 rounded-full flex-shrink-0"></div>
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

            {/* Penutup */}
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
