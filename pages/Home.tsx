import React, { useState, useEffect } from 'react';
import { Clock, Calendar, ChevronRight, Loader2 } from 'lucide-react';
import { Link } from 'react-router-dom';
import { PrayerTime, ProgramService } from '../types';
import { api } from '../services/api';

export const Home: React.FC = () => {
  const [prayerTimes, setPrayerTimes] = useState<PrayerTime[]>([]);
  const [programs, setPrograms] = useState<ProgramService[]>([]);
  const [nextPrayer, setNextPrayer] = useState<string>('');
  const [loading, setLoading] = useState(true);
  
  useEffect(() => {
    const loadData = async () => {
      setLoading(true);
      
      const [times, programData] = await Promise.all([
        api.getPrayerTimes(),
        api.getPrograms()
      ]);

      setPrayerTimes(times);
      setPrograms(programData);
      
      // Simple logic to set next prayer (mock logic)
      setNextPrayer('Ashar');
      setLoading(false);
    };

    loadData();
  }, []);

  return (
    <div className="space-y-12 pb-12">
      {/* Hero Section */}
      <section className="relative h-[500px] flex items-center justify-center text-center px-4">
        <div className="absolute inset-0 bg-emerald-900 overflow-hidden">
          <img 
            src="https://picsum.photos/1920/1080?grayscale&blur=2" 
            alt="Mosque Interior" 
            className="w-full h-full object-cover opacity-30"
          />
          <div className="absolute inset-0 bg-gradient-to-t from-emerald-900/90 to-transparent"></div>
        </div>
        
        <div className="relative z-10 max-w-3xl mx-auto space-y-6">
          <span className="inline-block px-4 py-1.5 rounded-full bg-gold-500/20 text-gold-400 text-sm font-semibold border border-gold-500/30 backdrop-blur-sm">
            Selamat Datang di Portal Digital
          </span>
          <h1 className="text-4xl md:text-6xl font-bold text-white leading-tight">
            Masjid Al-Mustaqbal
          </h1>
          <p className="text-lg md:text-xl text-emerald-100/90 font-light">
            "Hanyalah yang memakmurkan masjid-masjid Allah ialah orang-orang yang beriman kepada Allah dan hari kemudian."
          </p>
          <div className="flex flex-col sm:flex-row gap-4 justify-center pt-4">
            <Link to="/donation" className="px-8 py-3 bg-gold-500 hover:bg-gold-600 text-white font-semibold rounded-lg transition-all shadow-lg shadow-gold-500/30">
              Infaq Sekarang
            </Link>
            <Link to="/consultation" className="px-8 py-3 bg-white/10 hover:bg-white/20 text-white font-semibold rounded-lg backdrop-blur-sm transition-all border border-white/30">
              Tanya Ustaz AI
            </Link>
          </div>
        </div>
      </section>

      {/* Prayer Times Widget */}
      <div className="container mx-auto px-4 -mt-20 relative z-20">
        <div className="bg-white dark:bg-gray-800 rounded-2xl shadow-xl p-6 md:p-8 border border-gray-100 dark:border-gray-700 min-h-[160px]">
          <div className="flex flex-col md:flex-row justify-between items-center mb-6">
            <div className="text-center md:text-left mb-4 md:mb-0">
              <h2 className="text-2xl font-bold text-emerald-800 dark:text-emerald-400 flex items-center gap-2 justify-center md:justify-start">
                <Clock className="text-gold-500" /> Jadwal Shalat
              </h2>
              <p className="text-gray-500 dark:text-gray-400 text-sm">{new Date().toLocaleDateString('id-ID', { weekday: 'long', year: 'numeric', month: 'long', day: 'numeric' })}</p>
            </div>
            <div className="px-4 py-2 bg-emerald-50 dark:bg-emerald-900/30 rounded-full text-emerald-700 dark:text-emerald-300 text-sm font-medium">
              Menuju {nextPrayer} dalam 45 menit
            </div>
          </div>
          
          {loading ? (
             <div className="flex justify-center py-8">
                <Loader2 className="animate-spin text-emerald-600" size={32} />
             </div>
          ) : (
            <div className="grid grid-cols-2 md:grid-cols-6 gap-4">
              {prayerTimes.map((pt) => (
                <div key={pt.name} className={`text-center p-4 rounded-xl transition-all ${pt.name === nextPrayer ? 'bg-emerald-600 text-white shadow-lg scale-105' : 'bg-gray-50 dark:bg-gray-700 hover:bg-emerald-50 dark:hover:bg-gray-600'}`}>
                  <p className={`text-xs font-medium uppercase mb-1 ${pt.name === nextPrayer ? 'text-emerald-100' : 'text-gray-500 dark:text-gray-400'}`}>{pt.name}</p>
                  <p className={`text-xl font-bold ${pt.name === nextPrayer ? 'text-white' : 'text-gray-800 dark:text-white'}`}>{pt.time}</p>
                </div>
              ))}
            </div>
          )}
        </div>
      </div>

      {/* Quick Services Grid */}
      <section className="container mx-auto px-4">
        <div className="text-center mb-10">
          <h2 className="text-3xl font-bold text-gray-800 dark:text-white mb-2">Program & Layanan</h2>
          <div className="h-1 w-20 bg-gold-500 mx-auto rounded-full"></div>
        </div>

        {loading ? (
             <div className="flex justify-center py-8">
                <Loader2 className="animate-spin text-emerald-600" size={32} />
             </div>
        ) : (
            <div className="grid grid-cols-1 md:grid-cols-3 gap-8">
            {programs.map((item, idx) => (
                <div key={idx} className="bg-white dark:bg-gray-800 p-6 rounded-xl shadow-sm hover:shadow-md transition-shadow border border-gray-100 dark:border-gray-700">
                <div className="text-4xl mb-4">{item.icon}</div>
                <h3 className="text-xl font-bold text-gray-800 dark:text-white mb-2">{item.title}</h3>
                <p className="text-gray-600 dark:text-gray-400">{item.description}</p>
                </div>
            ))}
            </div>
        )}
      </section>

      {/* Quote/Call to Action */}
      <section className="bg-emerald-50 dark:bg-emerald-900/20 py-16">
        <div className="container mx-auto px-4 text-center">
          <h2 className="text-2xl md:text-3xl font-serif italic text-emerald-800 dark:text-emerald-300 mb-8 max-w-4xl mx-auto">
            "Siapa yang membangun masjid karena Allah, maka Allah akan membangunkan baginya semisal itu di surga."
          </h2>
          <p className="text-emerald-600 dark:text-emerald-400 mb-8 font-medium">— HR. Bukhari & Muslim</p>
          <Link to="/donation" className="inline-flex items-center gap-2 text-emerald-700 dark:text-emerald-300 font-bold hover:underline">
            Ikut Berdonasi <ChevronRight size={18} />
          </Link>
        </div>
      </section>
    </div>
  );
};
