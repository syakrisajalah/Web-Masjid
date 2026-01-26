import React, { useState, useEffect } from 'react';
import { Clock, Calendar, ChevronRight, Loader2, MapPin, Send, MessageSquare } from 'lucide-react';
import { Link } from 'react-router-dom';
import { PrayerTime, ProgramService } from '../types';
import { api } from '../services/api';
import { useMosqueInfo } from '../contexts';

export const Home: React.FC = () => {
  const [prayerTimes, setPrayerTimes] = useState<PrayerTime[]>([]);
  const [programs, setPrograms] = useState<ProgramService[]>([]);
  const [nextPrayer, setNextPrayer] = useState<string>('');
  const [timeDiff, setTimeDiff] = useState<string>('');
  const [loading, setLoading] = useState(true);
  
  // Contact Form State
  const [contactForm, setContactForm] = useState({ name: '', email: '', message: '' });
  const [isSending, setIsSending] = useState(false);
  
  const mosqueInfo = useMosqueInfo();
  
  // Tanggal Hari Ini di Makassar
  const currentDateDisplay = new Date().toLocaleDateString('id-ID', { 
      weekday: 'long', 
      year: 'numeric', 
      month: 'long', 
      day: 'numeric',
      timeZone: 'Asia/Makassar' 
  });

  useEffect(() => {
    const loadData = async () => {
      setLoading(true);
      
      const [times, programData] = await Promise.all([
        api.getPrayerTimes(),
        api.getPrograms()
      ]);

      setPrayerTimes(times);
      setPrograms(programData);
      
      calculateNextPrayer(times);
      setLoading(false);
    };

    loadData();

    // Update countdown every minute
    const interval = setInterval(() => {
        // We need to fetch current state of prayerTimes, which might be empty initially
        // Ideally we should use a ref or dependency, but re-calculating with existing state is safe here
        if (prayerTimes.length > 0) calculateNextPrayer(prayerTimes);
    }, 60000);

    return () => clearInterval(interval);
  }, []); // Run once on mount

  // Recalculate when prayerTimes data arrives
  useEffect(() => {
      if (prayerTimes.length > 0) calculateNextPrayer(prayerTimes);
  }, [prayerTimes]);

  const calculateNextPrayer = (times: PrayerTime[]) => {
      if (!times || times.length === 0) return;

      // GET CURRENT TIME IN MAKASSAR (WITA)
      // Ini memastikan hitungan mundur akurat sesuai lokasi masjid meskipun user membukanya dari Jakarta/Papua.
      const now = new Date();
      const makassarTimeStr = now.toLocaleTimeString('en-US', { timeZone: 'Asia/Makassar', hour12: false });
      const [hStr, mStr] = makassarTimeStr.split(':');
      const currentMinutes = parseInt(hStr) * 60 + parseInt(mStr);
      
      let next = null;
      let minDiff = Infinity;

      // Filter out 'Terbit' mostly for next prayer calculation
      const relevantTimes = times.filter(t => t.name !== 'Terbit');

      for (const pt of relevantTimes) {
          const [h, m] = pt.time.split(':').map(Number);
          const ptMinutes = h * 60 + m;
          
          if (ptMinutes > currentMinutes) {
              next = pt;
              minDiff = ptMinutes - currentMinutes;
              break; 
          }
      }

      // If no next prayer found today (e.g. after Isya), next is Subuh tomorrow
      if (!next) {
          const subuh = relevantTimes.find(t => t.name === 'Subuh');
          if (subuh) {
              next = subuh;
              const [h, m] = subuh.time.split(':').map(Number);
              const subuhMinutes = h * 60 + m;
              // Time until midnight + time from midnight to Subuh
              minDiff = (24 * 60 - currentMinutes) + subuhMinutes; 
          }
      }

      if (next) {
          setNextPrayer(next.name);
          const hours = Math.floor(minDiff / 60);
          const mins = minDiff % 60;
          if (hours > 0) {
              setTimeDiff(`${hours} jam ${mins} menit`);
          } else {
              setTimeDiff(`${mins} menit`);
          }
      }
  };

  const handleSendMessage = async (e: React.FormEvent) => {
      e.preventDefault();
      if (!contactForm.name || !contactForm.message) return;
      
      setIsSending(true);
      const res = await api.sendMessage(contactForm.name, contactForm.email || '-', contactForm.message);
      setIsSending(false);

      if (res.success) {
          alert("Pesan Anda telah terkirim. Terima kasih atas masukan Anda.");
          setContactForm({ name: '', email: '', message: '' });
      } else {
          alert("Maaf, gagal mengirim pesan. Silakan coba lagi.");
      }
  };

  return (
    <div className="space-y-12 pb-12">
      {/* Hero Section */}
      <section className="relative min-h-[550px] flex items-center justify-center text-center px-4">
        <div className="absolute inset-0 bg-emerald-900 overflow-hidden">
          <img 
            src={mosqueInfo.images.hero} 
            alt="Mosque Interior" 
            className="w-full h-full object-cover opacity-30"
          />
          <div className="absolute inset-0 bg-gradient-to-t from-emerald-900 to-transparent"></div>
        </div>
        
        <div className="relative z-10 max-w-4xl mx-auto space-y-6 pt-10">
          <span className="inline-block px-4 py-1.5 rounded-full bg-gold-500/20 text-gold-400 text-sm font-semibold border border-gold-500/30 backdrop-blur-sm animate-in fade-in slide-in-from-bottom-4 duration-700">
            Selamat Datang di Portal Digital
          </span>
          
          <h1 className="text-4xl md:text-6xl font-bold text-white leading-tight animate-in fade-in slide-in-from-bottom-6 duration-700 delay-100">
            {mosqueInfo.name}
          </h1>
          
          <h2 className="text-xl md:text-2xl text-gold-400 font-medium animate-in fade-in slide-in-from-bottom-6 duration-700 delay-200">
            {mosqueInfo.slogan}
          </h2>

          <p className="text-lg text-gray-200 max-w-2xl mx-auto leading-relaxed animate-in fade-in slide-in-from-bottom-6 duration-700 delay-300 hidden md:block whitespace-pre-wrap">
            {mosqueInfo.description}
          </p>
          
          <a 
            href="https://www.google.com/maps/search/?api=1&query=-5.1371483500853605,119.50608370916899"
            target="_blank"
            rel="noopener noreferrer"
            className="flex items-center justify-center gap-2 text-emerald-200 text-sm animate-in fade-in slide-in-from-bottom-6 duration-700 delay-300 hover:text-white hover:underline transition-all"
          >
             <MapPin size={16} />
             <span>{mosqueInfo.address}</span>
          </a>

          <div className="flex flex-col sm:flex-row gap-4 justify-center pt-8 animate-in fade-in slide-in-from-bottom-8 duration-700 delay-500">
            <Link to="/donation" className="px-8 py-3 bg-gold-500 hover:bg-gold-600 text-white font-semibold rounded-lg transition-all shadow-lg shadow-gold-500/30 transform hover:-translate-y-1">
              Infaq Sekarang
            </Link>
            <Link to="/consultation" className="px-8 py-3 bg-white/10 hover:bg-white/20 text-white font-semibold rounded-lg backdrop-blur-sm transition-all border border-white/30 transform hover:-translate-y-1">
              Tanya Ustaz AI
            </Link>
          </div>
        </div>
      </section>

      {/* Prayer Times Widget */}
      <div className="container mx-auto px-4 -mt-24 relative z-20">
        <div className="bg-white dark:bg-gray-800 rounded-2xl shadow-xl p-6 md:p-8 border border-gray-100 dark:border-gray-700 min-h-[160px]">
          <div className="flex flex-col md:flex-row justify-between items-center mb-6">
            <div className="text-center md:text-left mb-4 md:mb-0">
              <h2 className="text-2xl font-bold text-emerald-800 dark:text-emerald-400 flex items-center gap-2 justify-center md:justify-start">
                <Clock className="text-gold-500" /> Jadwal Shalat (WITA)
              </h2>
              <p className="text-gray-500 dark:text-gray-400 text-sm">{currentDateDisplay}</p>
            </div>
            <div className="px-4 py-2 bg-emerald-50 dark:bg-emerald-900/30 rounded-full text-emerald-700 dark:text-emerald-300 text-sm font-medium animate-pulse">
              {nextPrayer ? `Menuju ${nextPrayer} dalam ${timeDiff}` : 'Memuat jadwal...'}
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
            "Hanyalah yang memakmurkan masjid-masjid Allah ialah orang-orang yang beriman kepada Allah dan hari kemudian."
          </h2>
          <p className="text-emerald-600 dark:text-emerald-400 mb-8 font-medium">— At-Taubah: 18</p>
          <Link to="/donation" className="inline-flex items-center gap-2 text-emerald-700 dark:text-emerald-300 font-bold hover:underline">
            Ikut Berdonasi <ChevronRight size={18} />
          </Link>
        </div>
      </section>

      {/* CONTACT FORM SECTION */}
      <section className="container mx-auto px-4 py-8">
          <div className="bg-white dark:bg-gray-800 rounded-2xl shadow-xl overflow-hidden flex flex-col md:flex-row border border-gray-100 dark:border-gray-700">
             <div className="md:w-1/2 bg-emerald-700 p-10 text-white flex flex-col justify-center">
                 <h2 className="text-3xl font-bold mb-4">Saran & Masukan</h2>
                 <p className="opacity-90 mb-8 leading-relaxed">
                     Punya pertanyaan, kritik, saran, atau ingin mengajukan kegiatan? Silakan kirim pesan kepada pengurus DKM Masjid melalui formulir ini.
                 </p>
                 <div className="space-y-4">
                     <div className="flex items-center gap-4">
                         <div className="w-10 h-10 rounded-full bg-white/10 flex items-center justify-center">
                             <MessageSquare size={20} />
                         </div>
                         <div>
                             <p className="font-semibold">Respon Cepat</p>
                             <p className="text-xs opacity-75">Insya Allah dibalas 1x24 jam</p>
                         </div>
                     </div>
                     <div className="flex items-center gap-4">
                         <div className="w-10 h-10 rounded-full bg-white/10 flex items-center justify-center">
                             <Calendar size={20} />
                         </div>
                         <div>
                             <p className="font-semibold">Sekretariat</p>
                             <p className="text-xs opacity-75">Buka Setiap Hari, Ba'da Ashar - Isya</p>
                         </div>
                     </div>
                 </div>
             </div>
             <div className="md:w-1/2 p-10">
                 <form onSubmit={handleSendMessage} className="space-y-4">
                     <div>
                         <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-1">Nama Lengkap</label>
                         <input 
                            type="text" 
                            required
                            className="w-full px-4 py-3 rounded-lg bg-gray-50 dark:bg-gray-700 border border-gray-200 dark:border-gray-600 focus:ring-2 focus:ring-emerald-500 outline-none text-gray-800 dark:text-white"
                            placeholder="Hamba Allah"
                            value={contactForm.name}
                            onChange={e => setContactForm({...contactForm, name: e.target.value})}
                         />
                     </div>
                     <div>
                         <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-1">Email / WhatsApp (Opsional)</label>
                         <input 
                            type="text" 
                            className="w-full px-4 py-3 rounded-lg bg-gray-50 dark:bg-gray-700 border border-gray-200 dark:border-gray-600 focus:ring-2 focus:ring-emerald-500 outline-none text-gray-800 dark:text-white"
                            placeholder="Contoh: 0812..."
                            value={contactForm.email}
                            onChange={e => setContactForm({...contactForm, email: e.target.value})}
                         />
                     </div>
                     <div>
                         <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-1">Pesan Anda</label>
                         <textarea 
                            required
                            rows={4}
                            className="w-full px-4 py-3 rounded-lg bg-gray-50 dark:bg-gray-700 border border-gray-200 dark:border-gray-600 focus:ring-2 focus:ring-emerald-500 outline-none text-gray-800 dark:text-white"
                            placeholder="Tulis pesan Anda di sini..."
                            value={contactForm.message}
                            onChange={e => setContactForm({...contactForm, message: e.target.value})}
                         />
                     </div>
                     <button 
                        type="submit" 
                        disabled={isSending}
                        className="w-full py-3 bg-emerald-600 hover:bg-emerald-700 text-white font-bold rounded-lg transition-all flex items-center justify-center gap-2 disabled:opacity-70"
                     >
                         {isSending ? <Loader2 className="animate-spin" size={20} /> : <Send size={20} />}
                         Kirim Pesan
                     </button>
                 </form>
             </div>
          </div>
      </section>
    </div>
  );
};