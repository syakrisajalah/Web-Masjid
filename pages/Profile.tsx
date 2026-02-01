import React, { useEffect, useState, useMemo } from 'react';
import { Award, Users, History, Loader2, CheckCircle2, Shield, UserCheck, Briefcase, Search, ChevronRight, User as UserIcon, Layers } from 'lucide-react';
import { MosqueProfileData, Staff } from '../types';
import { api } from '../services/api';
import { useMosqueInfo } from '../contexts';

// Struktur data internal untuk pengelompokan dinamis
interface BidangData {
    koordinator: Staff | null;
    wakil: Staff | null;
    anggota: Staff[];
}

interface PilarGroup {
    wakilKetua: Staff;
    bidangList: Record<string, BidangData>;
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

  // Helper untuk membersihkan dan menstandarisasi nama bidang
  const getCleanBidangName = (role: string) => {
    return role
        .replace(/^(Koord\.|Wakil Koord\.|Anggota|Wakil|Koordinator)\s+Bidang\s+/i, '')
        .replace(/^Bidang\s+/i, '')
        .trim();
  };

  const renderMissionList = (text: string | undefined) => {
    if (!text) return <p className="text-gray-500 italic">Data belum tersedia.</p>;
    const items = text.split(/\r?\n|\\n/g).map(item => item.trim()).filter(item => item.length > 0);
    return (
        <ul className="space-y-3">
            {items.map((item, index) => {
                const cleanText = item.replace(/^[-*•\d.]\s*/, '');
                return (
                  <li key={index} className="flex items-start gap-3 text-gray-700 dark:text-gray-300">
                      <CheckCircle2 size={18} className="text-emerald-500 mt-1 flex-shrink-0" />
                      <span className="text-sm leading-relaxed">{cleanText}</span>
                  </li>
                );
            })}
        </ul>
    );
  };

  // --- LOGIKA GROUPING DINAMIS & FLEKSIBEL ---
  const groupedStaff = useMemo(() => {
      const groups = {
          pelindung: [] as Staff[],
          penasehat: [] as Staff[],
          inti: [] as Staff[], 
          pilar: [] as PilarGroup[],
          others: [] as Staff[] // Untuk bidang yang tidak punya pilar (fallback)
      };

      // 1. Identifikasi semua Wakil Ketua sebagai "Pilar" utama
      const viceChairs = staffList.filter(s => s.role.toLowerCase().includes('wakil ketua bidang'));
      viceChairs.forEach(wk => {
          groups.pilar.push({ wakilKetua: wk, bidangList: {} });
      });

      // 2. Distribusikan staff ke pilar yang tepat
      staffList.forEach(staff => {
          const role = staff.role.toLowerCase();
          const name = staff.name.toLowerCase();

          // Filter Pencarian
          if (searchQuery && !name.includes(searchQuery.toLowerCase()) && !role.includes(searchQuery.toLowerCase())) return;

          if (role.includes('pelindung')) {
              groups.pelindung.push(staff);
          } else if (role.includes('penasehat')) {
              groups.penasehat.push(staff);
          } else if (['ketua umum', 'sekretaris umum', 'bendahara', 'wakil ketua umum'].some(r => role === r)) {
              groups.inti.push(staff);
          } else if (role.includes('bidang') && !role.includes('wakil ketua bidang')) {
              const bidangNameFull = getCleanBidangName(staff.role);
              
              // Temukan pilar yang membawahi bidang ini (Fuzzy Matching)
              // Mencari apakah nama bidang ada di dalam teks jabatan Wakil Ketua
              let targetPillar = groups.pilar.find(p => {
                  const wkRole = p.wakilKetua.role.toLowerCase();
                  // Cek apakah ada kata kunci yang cocok (misal: "Ekonomi" di jabatan WK cocok dengan "Ekonomi" di jabatan Bidang)
                  const keywords = bidangNameFull.toLowerCase().split(/[\s,]+/);
                  return keywords.some(key => key.length > 3 && wkRole.includes(key));
              });

              if (targetPillar) {
                  if (!targetPillar.bidangList[bidangNameFull]) {
                      targetPillar.bidangList[bidangNameFull] = { koordinator: null, wakil: null, anggota: [] };
                  }

                  if (role.includes('koord.') || role.includes('koordinator')) {
                      targetPillar.bidangList[bidangNameFull].koordinator = staff;
                  } else if (role.includes('wakil')) {
                      targetPillar.bidangList[bidangNameFull].wakil = staff;
                  } else {
                      targetPillar.bidangList[bidangNameFull].anggota.push(staff);
                  }
              } else {
                  // Jika tidak cocok ke pilar manapun, masukkan ke kategori umum
                  groups.others.push(staff);
              }
          }
      });

      return groups;
  }, [staffList, searchQuery]);

  if (loading) return (
    <div className="flex flex-col justify-center items-center h-[60vh] gap-4">
        <Loader2 className="animate-spin text-emerald-600" size={48} />
        <p className="text-gray-500 font-medium animate-pulse">Memuat data pengurus...</p>
    </div>
  );

  return (
    <div className="container mx-auto px-4 py-12">
      <div className="max-w-6xl mx-auto space-y-20">
        
        {/* Header Identitas */}
        <div className="text-center space-y-4">
          <div className="inline-block p-3 bg-emerald-100 dark:bg-emerald-900/30 rounded-2xl mb-2">
            <Layers className="text-emerald-600 dark:text-emerald-400" size={32} />
          </div>
          <h1 className="text-4xl md:text-5xl font-bold text-emerald-800 dark:text-emerald-400 tracking-tight">Profil & Struktur</h1>
          <p className="text-xl text-gray-500 max-w-2xl mx-auto italic font-serif">
            "{mosqueInfo.slogan}"
          </p>
        </div>

        {/* 1. SEJARAH SECTION */}
        <section className="grid grid-cols-1 lg:grid-cols-2 gap-12 items-center">
          <div className="space-y-6">
            <h2 className="text-3xl font-bold text-emerald-900 dark:text-emerald-400 flex items-center gap-3">
              <History className="text-gold-500" size={32} /> Sejarah Singkat
            </h2>
            <div className="text-gray-700 dark:text-gray-300 leading-relaxed text-lg bg-white dark:bg-gray-800 p-8 rounded-3xl shadow-sm border border-gray-100 dark:border-gray-700">
              <p className="whitespace-pre-wrap text-justify">{profile?.history}</p>
            </div>
          </div>
          <div className="relative group">
              <div className="absolute -inset-2 bg-emerald-500/10 rounded-[2.5rem] blur-2xl group-hover:bg-emerald-500/20 transition-all"></div>
              <img 
                src={mosqueInfo.images.profile}
                alt="Masjid" 
                className="relative rounded-[2rem] shadow-2xl w-full h-[450px] object-cover"
              />
              <div className="absolute top-6 right-6 bg-gold-500 text-white p-6 rounded-2xl shadow-xl z-10 transform rotate-3">
                  <p className="text-xs font-bold opacity-80 uppercase tracking-widest">Periode Aktif</p>
                  <p className="text-3xl font-black">2025 - 2030</p>
              </div>
          </div>
        </section>

        {/* 2. VISI & MISI SECTION */}
        <section className="grid grid-cols-1 md:grid-cols-2 gap-8">
            <div className="bg-white dark:bg-gray-800 p-10 rounded-[2rem] shadow-lg border-t-8 border-emerald-600 flex flex-col group hover:shadow-emerald-500/10 transition-shadow">
                <h2 className="text-2xl font-bold mb-6 text-emerald-800 dark:text-emerald-400 flex items-center gap-3">
                    <Award className="text-emerald-600 group-hover:scale-110 transition-transform" size={28} /> Visi Utama
                </h2>
                <p className="text-gray-700 dark:text-gray-300 italic text-xl leading-relaxed font-serif flex-1">
                    "{profile?.vision}"
                </p>
            </div>
            <div className="bg-white dark:bg-gray-800 p-10 rounded-[2rem] shadow-lg border-t-8 border-gold-500 group hover:shadow-gold-500/10 transition-shadow">
                <h2 className="text-2xl font-bold mb-6 text-emerald-800 dark:text-emerald-400 flex items-center gap-3">
                    <Users className="text-gold-600 group-hover:scale-110 transition-transform" size={28} /> Misi Strategis
                </h2>
                <div className="custom-scrollbar">
                    {renderMissionList(profile?.mission)}
                </div>
            </div>
        </section>

        {/* 3. STRUKTUR ORGANISASI SECTION */}
        <section className="space-y-12">
            <div className="text-center space-y-6">
                <div className="inline-flex items-center gap-2 px-4 py-1.5 bg-emerald-100 dark:bg-emerald-900/30 text-emerald-700 dark:text-emerald-300 rounded-full text-xs font-bold uppercase tracking-widest">Struktur Kepengurusan</div>
                <h2 className="text-3xl font-bold text-gray-900 dark:text-white">Dewan Kemakmuran Masjid</h2>
                
                {/* Search Bar Dynamic */}
                <div className="max-w-md mx-auto relative group">
                    <Search className="absolute left-4 top-1/2 -translate-y-1/2 text-gray-400 group-focus-within:text-emerald-500 transition-colors" size={20} />
                    <input 
                        type="text" 
                        placeholder="Cari nama pengurus atau bidang..."
                        className="w-full pl-12 pr-4 py-4 bg-white dark:bg-gray-800 border border-gray-200 dark:border-gray-700 rounded-2xl shadow-sm outline-none focus:ring-4 focus:ring-emerald-500/10 focus:border-emerald-500 transition-all"
                        value={searchQuery}
                        onChange={(e) => setSearchQuery(e.target.value)}
                    />
                </div>
            </div>

            {/* A. Penasehat & Pelindung */}
            <div className="grid grid-cols-1 md:grid-cols-2 gap-8">
                <div className="bg-emerald-50 dark:bg-emerald-900/10 p-8 rounded-[2rem] border border-emerald-100 dark:border-emerald-800/50">
                    <h3 className="text-sm font-black text-emerald-800 dark:text-emerald-400 mb-6 flex items-center gap-2 border-b border-emerald-200 dark:border-emerald-800 pb-3 uppercase tracking-tighter">
                        <Shield size={18} /> I. Pelindung
                    </h3>
                    <div className="grid grid-cols-1 gap-3">
                        {groupedStaff.pelindung.map((s, i) => (
                            <div key={i} className="flex items-center gap-3 p-2 bg-white/50 dark:bg-black/20 rounded-xl">
                                <span className="bg-emerald-600 text-white w-6 h-6 rounded-lg flex items-center justify-center text-[10px] font-bold">{i+1}</span>
                                <p className="text-sm font-semibold text-gray-800 dark:text-gray-200">{s.name}</p>
                            </div>
                        ))}
                    </div>
                </div>
                <div className="bg-blue-50 dark:bg-blue-900/10 p-8 rounded-[2rem] border border-blue-100 dark:border-blue-800/50">
                    <h3 className="text-sm font-black text-blue-800 dark:text-blue-400 mb-6 flex items-center gap-2 border-b border-blue-200 dark:border-blue-800 pb-3 uppercase tracking-tighter">
                        <UserCheck size={18} /> II. Penasehat
                    </h3>
                    <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
                        {groupedStaff.penasehat.map((s, i) => (
                            <div key={i} className="text-sm font-semibold text-gray-800 dark:text-gray-200 flex items-center gap-2 bg-white/50 dark:bg-black/20 p-2 rounded-xl">
                                <div className="w-1.5 h-1.5 bg-blue-500 rounded-full"></div>
                                {s.name}
                            </div>
                        ))}
                    </div>
                </div>
            </div>

            {/* B. Pengurus Inti */}
            <div className="space-y-6">
                <h3 className="text-sm font-black text-center text-gray-400 uppercase tracking-[0.3em]">III. Pengurus Harian Inti</h3>
                <div className="grid grid-cols-1 sm:grid-cols-2 md:grid-cols-3 lg:grid-cols-4 gap-6">
                    {groupedStaff.inti.map((s, i) => (
                        <div key={i} className="bg-white dark:bg-gray-800 p-6 rounded-2xl shadow-sm border border-gray-100 dark:border-gray-700 text-center hover:border-gold-500 transition-colors">
                            <div className="w-14 h-14 bg-emerald-100 dark:bg-emerald-900/30 text-emerald-600 rounded-full flex items-center justify-center mx-auto mb-4">
                                <UserIcon size={24} />
                            </div>
                            <h4 className="font-bold text-gray-900 dark:text-white leading-tight">{s.name}</h4>
                            <p className="text-[10px] font-bold text-gold-600 uppercase mt-2 tracking-widest">{s.role}</p>
                        </div>
                    ))}
                </div>
            </div>

            {/* C. Pilar Bidang Dinamis (Flexible) */}
            <div className="space-y-16 pt-8">
                {groupedStaff.pilar.map((pilar, pIdx) => (
                    <div key={pIdx} className="space-y-8 animate-in fade-in slide-in-from-bottom-8 duration-500" style={{ animationDelay: `${pIdx * 100}ms` }}>
                        {/* Pillar Header */}
                        <div className="bg-emerald-900 text-white p-8 md:p-12 rounded-[2.5rem] shadow-2xl relative overflow-hidden flex flex-col md:flex-row items-center gap-8 border-b-[12px] border-gold-500">
                             <div className="absolute top-0 right-0 w-64 h-64 bg-emerald-800 rounded-full -mr-32 -mt-32 opacity-20"></div>
                             <div className="w-24 h-24 bg-white/10 rounded-3xl flex items-center justify-center backdrop-blur-xl border border-white/20">
                                 <Users size={48} />
                             </div>
                             <div className="text-center md:text-left flex-1">
                                 <h4 className="text-xs font-black text-gold-400 uppercase tracking-[0.4em] mb-2">{pilar.wakilKetua.role}</h4>
                                 <p className="text-3xl md:text-4xl font-black tracking-tight">{pilar.wakilKetua.name}</p>
                                 <div className="mt-4 flex flex-wrap justify-center md:justify-start gap-4">
                                    <span className="text-emerald-300/60 text-xs font-medium px-3 py-1 bg-white/5 rounded-full border border-white/10 italic">
                                        Mengoordinasikan {Object.keys(pilar.bidangList).length} Bidang Kerja
                                    </span>
                                 </div>
                             </div>
                        </div>

                        {/* Bidang List Grid */}
                        <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                            {Object.entries(pilar.bidangList).map(([bidangName, data], bIdx) => (
                                <div key={bIdx} className="bg-white dark:bg-gray-800 rounded-3xl border border-gray-100 dark:border-gray-700 shadow-sm overflow-hidden flex flex-col hover:shadow-xl transition-all group">
                                    <div className="bg-gray-50 dark:bg-gray-700/50 p-5 border-b border-gray-100 dark:border-gray-700 flex justify-between items-center">
                                        <h5 className="font-bold text-emerald-800 dark:text-emerald-400 flex items-center gap-3">
                                            <div className="p-2 bg-emerald-100 dark:bg-emerald-900/50 rounded-lg text-emerald-600">
                                                <Briefcase size={16} />
                                            </div>
                                            Bidang {bidangName}
                                        </h5>
                                        <ChevronRight size={16} className="text-gray-300 group-hover:text-emerald-500 group-hover:translate-x-1 transition-all" />
                                    </div>
                                    <div className="p-6 space-y-6">
                                        {/* Koordinator & Wakil */}
                                        <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                                            {data.koordinator && (
                                                <div className="p-4 bg-emerald-50 dark:bg-emerald-900/20 rounded-2xl border border-emerald-100 dark:border-emerald-800/50">
                                                    <p className="text-[10px] font-black text-emerald-700 dark:text-emerald-400 uppercase mb-1 tracking-wider">Koordinator</p>
                                                    <p className="text-sm font-bold text-gray-900 dark:text-white">{data.koordinator.name}</p>
                                                </div>
                                            )}
                                            {data.wakil && (
                                                <div className="p-4 bg-blue-50 dark:bg-blue-900/20 rounded-2xl border border-blue-100 dark:border-blue-800/50">
                                                    <p className="text-[10px] font-black text-blue-700 dark:text-blue-400 uppercase mb-1 tracking-wider">Wakil</p>
                                                    <p className="text-sm font-bold text-gray-900 dark:text-white">{data.wakil.name}</p>
                                                </div>
                                            )}
                                        </div>
                                        
                                        {/* Anggota Grid */}
                                        {data.anggota.length > 0 && (
                                            <div className="pt-2">
                                                <p className="text-[10px] font-black text-gray-400 uppercase mb-3 tracking-widest">Staf Anggota ({data.anggota.length})</p>
                                                <div className="grid grid-cols-1 sm:grid-cols-2 gap-x-4 gap-y-2">
                                                    {data.anggota.map((ang, aIdx) => (
                                                        <div key={aIdx} className="text-xs font-semibold text-gray-600 dark:text-gray-400 flex items-center gap-2 py-1 border-b border-gray-50 dark:border-gray-700/50">
                                                            <div className="w-1.5 h-1.5 bg-emerald-400 rounded-full"></div>
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

                {/* Others Fallback (Jika ada bidang yang belum masuk pilar) */}
                {groupedStaff.others.length > 0 && !searchQuery && (
                    <div className="bg-gray-50 dark:bg-gray-800/50 p-8 rounded-3xl border-2 border-dashed border-gray-200 dark:border-gray-700 mt-12">
                        <h4 className="text-sm font-bold text-gray-500 uppercase mb-6 text-center tracking-widest">Bagian / Unit Lainnya</h4>
                        <div className="grid grid-cols-1 sm:grid-cols-2 md:grid-cols-3 gap-4">
                            {groupedStaff.others.map((s, i) => (
                                <div key={i} className="bg-white dark:bg-gray-800 p-4 rounded-xl shadow-sm border border-gray-100 dark:border-gray-700">
                                    <p className="text-xs font-bold text-emerald-600 mb-1">{s.role}</p>
                                    <p className="text-sm font-semibold">{s.name}</p>
                                </div>
                            ))}
                        </div>
                    </div>
                )}
            </div>

            {/* Empty Search State */}
            {searchQuery && groupedStaff.pilar.every(p => Object.keys(p.bidangList).length === 0) && (
                <div className="text-center py-24 bg-gray-50 dark:bg-gray-800 rounded-[2.5rem] border-2 border-dashed border-gray-200 dark:border-gray-700">
                    <Users className="mx-auto text-gray-300 mb-4" size={64} />
                    <p className="text-gray-400 font-medium text-lg">Tidak menemukan pengurus dengan nama atau jabatan "{searchQuery}"</p>
                </div>
            )}
        </section>

        {/* Closing / Sign Off */}
        <div className="pt-20 border-t border-gray-100 dark:border-gray-700 text-center space-y-8">
            <div className="max-w-md mx-auto space-y-4">
                <p className="text-gray-400 font-medium text-sm tracking-widest uppercase italic">Disahkan oleh Ketua Umum,</p>
                <div className="h-32 flex items-center justify-center pointer-events-none opacity-20 dark:invert">
                    <img src="https://upload.wikimedia.org/wikipedia/commons/3/3a/Jon_Kirsch%27s_Signature.png" alt="Signature" className="h-full object-contain" />
                </div>
                <div className="space-y-1">
                    <p className="text-2xl font-black text-emerald-900 dark:text-emerald-400">Dr. dr. Husaini Umar, Sp.PD., KEMD</p>
                    <div className="w-12 h-1 bg-gold-500 mx-auto rounded-full"></div>
                    <p className="text-xs text-gray-500 font-bold uppercase tracking-widest">NIP. 19700101 202501 1 001</p>
                </div>
            </div>
            <p className="text-[10px] text-gray-400 max-w-lg mx-auto leading-relaxed">
                Struktur organisasi ini bersifat dinamis dan dapat berubah sewaktu-waktu berdasarkan hasil musyawarah pengurus Masjid Besar Al-Muamalah.
            </p>
        </div>

      </div>
    </div>
  );
};