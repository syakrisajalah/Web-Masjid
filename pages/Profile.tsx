import React, { useEffect, useState } from 'react';
import { Award, Users, History, Loader2, CheckCircle2 } from 'lucide-react';
import { MosqueProfileData, Staff } from '../types';
import { api } from '../services/api';

export const Profile: React.FC = () => {
  const [profile, setProfile] = useState<MosqueProfileData | null>(null);
  const [staffList, setStaffList] = useState<Staff[]>([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
      const loadProfile = async () => {
          setLoading(true);
          const data = await api.getProfile();
          setProfile(data.detail);
          setStaffList(data.staff);
          setLoading(false);
      };
      loadProfile();
  }, []);

  if (loading) {
     return (
        <div className="flex justify-center items-center h-[50vh]">
            <Loader2 className="animate-spin text-emerald-600" size={40} />
        </div>
     );
  }

  // Helper untuk mengubah string text menjadi list array
  const renderMissionList = (text: string | undefined) => {
      if (!text) return <p className="text-gray-500 italic">Data belum tersedia.</p>;

      // Split berdasarkan baris baru, hapus baris kosong, dan hapus tanda dash/strip di awal
      const items = text.split('\n')
          .map(item => item.trim())
          .filter(item => item.length > 0);

      return (
          <ul className="space-y-3">
              {items.map((item, index) => {
                  // Hapus tanda strip (-) atau bullet (•) di awal kalimat jika ada
                  const cleanText = item.replace(/^[-*•]\s*/, '');
                  
                  return (
                    <li key={index} className="flex items-start gap-3 text-gray-700 dark:text-gray-300">
                        <CheckCircle2 size={20} className="text-gold-500 mt-0.5 flex-shrink-0" />
                        <span className="leading-relaxed">{cleanText}</span>
                    </li>
                  );
              })}
          </ul>
      );
  };

  return (
    <div className="container mx-auto px-4 py-12">
      <div className="max-w-4xl mx-auto space-y-12">
        <div className="text-center">
          <h1 className="text-4xl font-bold text-emerald-800 dark:text-emerald-400 mb-4">Profil Masjid</h1>
          <p className="text-xl text-gray-600 dark:text-gray-300">Sejarah, Visi, dan Misi Perjuangan</p>
        </div>

        <div className="grid grid-cols-1 md:grid-cols-2 gap-8 items-center">
          <img 
            src="https://picsum.photos/800/600?grayscale" 
            alt="Mosque Building" 
            className="rounded-2xl shadow-xl w-full h-[300px] object-cover"
          />
          <div className="space-y-4">
            <h2 className="text-2xl font-bold text-gray-800 dark:text-white flex items-center gap-2">
              <History className="text-gold-500" /> Sejarah Singkat
            </h2>
            <p className="text-gray-600 dark:text-gray-300 leading-relaxed whitespace-pre-wrap text-justify">
              {profile?.history}
            </p>
          </div>
        </div>

        <div className="grid grid-cols-1 md:grid-cols-2 gap-8">
            <div className="bg-white dark:bg-gray-800 p-8 rounded-2xl shadow-lg border-t-4 border-emerald-500 flex flex-col">
                <h2 className="text-2xl font-bold mb-6 text-emerald-800 dark:text-emerald-400 flex items-center gap-2">
                    <Award className="text-emerald-600" /> Visi
                </h2>
                <div className="flex-1 flex items-center">
                    <p className="text-gray-700 dark:text-gray-300 italic text-lg leading-relaxed text-center w-full">
                        "{profile?.vision}"
                    </p>
                </div>
            </div>
            <div className="bg-white dark:bg-gray-800 p-8 rounded-2xl shadow-lg border-t-4 border-gold-500">
                <h2 className="text-2xl font-bold mb-6 text-emerald-800 dark:text-emerald-400 flex items-center gap-2">
                    <Users className="text-gold-600" /> Misi
                </h2>
                <div>
                    {renderMissionList(profile?.mission)}
                </div>
            </div>
        </div>
        
        {/* Organization Structure */}
        <div className="bg-emerald-50 dark:bg-emerald-900/20 p-8 rounded-2xl">
            <h2 className="text-2xl font-bold text-center mb-8 text-emerald-800 dark:text-emerald-400">Struktur Pengurus (DKM)</h2>
            <div className="grid grid-cols-1 sm:grid-cols-3 gap-6 text-center">
                {staffList.map((staff, idx) => (
                    <div key={idx} className="bg-white dark:bg-gray-800 p-4 rounded-xl shadow-sm hover:shadow-md transition-shadow">
                        <div className="w-16 h-16 bg-gray-200 rounded-full mx-auto mb-3 overflow-hidden border-2 border-emerald-100 dark:border-emerald-800">
                            {staff.imageUrl ? (
                                <img src={staff.imageUrl} alt={staff.name} className="w-full h-full object-cover" />
                            ) : (
                                <div className="w-full h-full flex items-center justify-center bg-gray-300 text-gray-500 text-xs">No Img</div>
                            )}
                        </div>
                        <h3 className="font-bold text-gray-800 dark:text-white">{staff.name}</h3>
                        <p className="text-sm text-emerald-600">{staff.role}</p>
                    </div>
                ))}
            </div>
        </div>
      </div>
    </div>
  );
};
