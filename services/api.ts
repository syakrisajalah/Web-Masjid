import { User, Post, Transaction, PrayerTime, MediaItem, UserRole, ProgramService, MosqueProfileData, Staff, BankAccount, ConsultationItem, MosqueGeneralInfo, InboxMessage } from '../types';
import { DEFAULT_MOSQUE_INFO } from '../config';

const SCRIPT_URL_KEY = 'masjid_app_script_url';
const ENV_SCRIPT_URL = process.env.GOOGLE_SCRIPT_URL;

export const getScriptUrl = () => {
  const localUrl = localStorage.getItem(SCRIPT_URL_KEY);
  if (localUrl) return localUrl;
  return ENV_SCRIPT_URL || '';
};

export const setScriptUrl = (url: string) => localStorage.setItem(SCRIPT_URL_KEY, url);

// --- MOCK DATA ---

const MOCK_PRAYER_TIMES: PrayerTime[] = [
  { name: 'Subuh', time: '04:40' },
  { name: 'Terbit', time: '06:00' },
  { name: 'Dzuhur', time: '12:05' },
  { name: 'Ashar', time: '15:20' },
  { name: 'Maghrib', time: '18:10' },
  { name: 'Isya', time: '19:20' },
];

const MOCK_PROGRAMS: ProgramService[] = [
  { title: "Kajian Rutin", description: "Ikuti kajian tafsir, hadits, dan fiqih setiap ba'da Maghrib.", icon: "📚" },
  { title: "TPA Anak", description: "Pendidikan Al-Quran ceria untuk anak-anak usia dini hingga SD.", icon: "👶" },
  { title: "Layanan Jenazah", description: "Bantuan pengurusan jenazah lengkap 24 jam untuk jamaah.", icon: "🚑" },
  { title: "Baitul Maal", description: "Pengelolaan Zakat, Infaq, dan Sedekah yang transparan.", icon: "💰" },
  { title: "Perpustakaan", description: "Koleksi buku islami lengkap untuk menambah wawasan umat.", icon: "📖" },
  { title: "Konseling", description: "Layanan konsultasi keluarga sakinah bersama asatidz.", icon: "🤝" },
];

const MOCK_PROFILE: MosqueProfileData = {
  history: "Masjid Besar Al-Muamalah berlokasi di Kecamatan Tamalanrea, Makassar. Menjadi pusat peribadahan utama bagi masyarakat BTP dan sekitarnya. Dengan struktur kepengurusan periode 2025-2030, masjid ini berkomitmen meningkatkan pelayanan umat melalui berbagai bidang pemberdayaan.",
  vision: "Menjadi masjid percontohan dalam manajemen modern yang berbasis pada pelayanan umat dan kemandirian ekonomi.",
  mission: "- Menyelenggarakan peribadahan yang khusyuk dan nyaman.\n- Mengembangkan pendidikan Al-Quran berbasis teknologi.\n- Memberdayakan ekonomi umat melalui Baitul Maal.\n- Menjadi pusat informasi dan kajian keislaman."
};

const MOCK_STAFF: Staff[] = [
  // PELINDUNG
  { role: 'Pelindung', name: 'Walikota Makassar' },
  { role: 'Pelindung', name: 'Ketua Yayasan Al Falaq Bumi Tamalanrea' },
  { role: 'Pelindung', name: 'Kepala Kecamatan Tamalanrea Kota Makassar' },
  { role: 'Pelindung', name: 'Kepala Kantor Urusan Agama Kec. Tamalanrea' },
  
  // PENASEHAT
  { role: 'Penasehat', name: 'Prof. Dr. H. Paisal Halim, M.Hum' },
  { role: 'Penasehat', name: 'Ir. H. Sukardi HS' },
  { role: 'Penasehat', name: 'Uztad H. Akmal Hasan, LC' },
  { role: 'Penasehat', name: 'H. Maisani Kecca, S.Sos' },

  // PENGURUS HARIAN INTI
  { role: 'Ketua Umum', name: 'Assoc Prof Dr. Abdul Malik, S.Pi., M.Si' },
  { role: 'Sekretaris Umum', name: 'Assoc Prof HR. Fajar, ST., M.Eng' },
  { role: 'Bendahara', name: 'Drs. H. Muhammad Hasyim, MM' },

  // PILAR 1: EKONOMI, PEMBANGUNAN, PENDIDIKAN
  { role: 'Wakil Ketua Bidang Ekonomi, Pembangunan dan Pendidikan', name: 'Salman Al Fariz Karsa Sukardi' },
  
  { role: 'Koord. Bidang Dana dan Unit Pengumpul Zakat (UPZ)', name: 'Syamsuddin Thalib, S.Sos., M.Si' },
  { role: 'Wakil Koord. Bidang Dana dan Unit Pengumpul Zakat (UPZ)', name: 'Assoc Prof Dr. dr. H. Husaini Umar, Sp.Pd' },
  { role: 'Anggota Bidang Dana dan Unit Pengumpul Zakat (UPZ)', name: 'H. Munir Rahim' },
  { role: 'Anggota Bidang Dana dan Unit Pengumpul Zakat (UPZ)', name: 'H. Hardianto' },
  { role: 'Anggota Bidang Dana dan Unit Pengumpul Zakat (UPZ)', name: 'Andi Hasbi' },
  
  { role: 'Koord. Bidang Pembangunan', name: 'Ir. Syamsul Bahri' },
  { role: 'Wakil Koord. Bidang Pembangunan', name: 'Assoc Prof Abdul Fattah, ST., MT' },
  { role: 'Anggota Bidang Pembangunan', name: 'Andi Akhmad, SE' },
  { role: 'Anggota Bidang Pembangunan', name: 'Rasyid Yunior' },

  { role: 'Koord. Bidang Pemeliharaan Masjid', name: 'Usman' },
  { role: 'Wakil Koord. Bidang Pemeliharaan Masjid', name: 'H Johan, SE' },
  { role: 'Anggota Bidang Pemeliharaan Masjid', name: 'Andi Akhmad, SE' },
  { role: 'Anggota Bidang Pemeliharaan Masjid', name: 'H. Hidayat, SE' },

  { role: 'Koord. Bidang Pendidikan', name: 'Assoc Prof Abd. Hamid, SE.,M.Si' },
  { role: 'Wakil Koord. Bidang Pendidikan', name: 'Naim' },
  { role: 'Anggota Bidang Pendidikan', name: 'Musfaridawati M, SH' },

  // PILAR 2: KEAGAMAAN, PEMUDA, KELUARGA
  { role: 'Wakil Ketua Bidang Keagamaan, Pemuda, dan Keluarga', name: 'Andi Baso Nyompa, ST, MT' },
  
  { role: 'Koord. Bidang Ibadah dan Dakwah', name: 'Dr. H. Muhammad Basran, LC, MA.' },
  { role: 'Wakil Koord. Bidang Ibadah dan Dakwah', name: 'Sahrir, S.Ag' },
  { role: 'Anggota Bidang Ibadah dan Dakwah', name: 'Hamdani Hamid' },
  
  { role: 'Koord. Bidang Majelis Ta\'lim', name: 'Hj. A. Syahribulan, SH,MH.' },
  { role: 'Anggota Bidang Majelis Ta\'lim', name: 'Ny. Hj. Nurlela Rahim, S.Pd' },
  { role: 'Anggota Bidang Majelis Ta\'lim', name: 'Ny. Hj. Marhudaya Husain' },

  { role: 'Koord. Bidang Pembinaan Pemuda', name: 'Uzt Riansyah, S.Kom' },
  { role: 'Wakil Koord. Bidang Pembinaan Pemuda', name: 'Asrul' },
  { role: 'Anggota Bidang Pembinaan Pemuda', name: 'Rudi Kambuna' },

  { role: 'Koord. Bidang Pemberdayaan Wanita', name: 'Ny. Hj.Sabtiara Sukardi' },
  { role: 'Wakil Koord. Bidang Pemberdayaan Wanita', name: 'Ny. Hj. Hasbobi Husaini, M. Keb' },
  { role: 'Anggota Bidang Pemberdayaan Wanita', name: 'Ny. Dr Marani Malik' },

  // PILAR 3: SOSIAL DAN KOMUNIKASI
  { role: 'Wakil Ketua Bidang Sosial dan Komunikasi', name: 'H. Ashar Djalil, S.Pi' },
  
  { role: 'Bidang Perayaan Hari Besar Islam (PHBI)', name: 'Uztad Yambas' },
  { role: 'Wakil Bidang Perayaan Hari Besar Islam (PHBI)', name: 'Ir. Firman Ganuga' },
  { role: 'Anggota Bidang Perayaan Hari Besar Islam (PHBI)', name: 'H Andi Mashuddin' },

  { role: 'Bidang Sosial', name: 'H. Abd Rasyid, SE' },
  { role: 'Wakil Bidang Sosial', name: 'Konpol Karman' },
  { role: 'Anggota Bidang Sosial', name: 'Konpol Andi Sundra' },

  { role: 'Bidang Humas', name: 'Assoc Prof Drs Muslimin, M.Si' },
  { role: 'Wakil Bidang Humas', name: 'Muh. Wawan Azis, S.Pi' },
  { role: 'Anggota Bidang Humas', name: 'Hidayat Latif' },

  { role: 'Bidang Media', name: 'Muh. Kamil, SE' },
  { role: 'Wakil Bidang Media', name: 'Liktor' },
  { role: 'Anggota Bidang Media', name: 'Aspar' },
  { role: 'Anggota Bidang Media', name: 'Hamdani' },
];

const MOCK_BANKS: BankAccount[] = [
  { bankName: 'BSI (Bank Syariah Indonesia)', accountNumber: '7700123456', holderName: 'Masjid Al Muamalah' },
  { bankName: 'Bank Muamalat', accountNumber: '1230098765', holderName: 'Masjid Al Muamalah' }
];

const MOCK_POSTS: Post[] = [
  {
    id: '1',
    title: 'Persiapan Menyambut Bulan Ramadhan 1446 H',
    category: 'Artikel',
    excerpt: 'Tips dan panduan rohani untuk mempersiapkan diri menghadapi bulan suci Ramadhan agar ibadah lebih maksimal.',
    content: `Bulan Ramadhan adalah bulan yang penuh berkah, rahmat, dan ampunan...`,
    date: '2024-03-01',
    author: 'Ust. Abdullah',
    imageUrl: 'https://picsum.photos/seed/ramadhan/400/250'
  }
];

const MOCK_TRANSACTIONS: Transaction[] = [
  { id: '1', date: '2024-06-28', description: 'Infaq Jumat', amount: 2500000, type: 'income', category: 'Infaq' },
  { id: '2', date: '2024-06-29', description: 'Bayar Listrik PLN', amount: 1200000, type: 'expense', category: 'Operasional' },
];

const MOCK_GALLERY: MediaItem[] = [
  { id: '1', type: 'image', url: 'https://picsum.photos/seed/g1/600/400', title: 'Shalat Idul Fitri 1445H', tags: ['Idul Fitri', 'Ibadah'] },
];

let MOCK_MESSAGES: InboxMessage[] = [
    {
        id: '1',
        name: 'Hamba Allah',
        email: 'jamaah@gmail.com',
        message: 'Assalamualaikum admin, apakah bisa mengajukan proposal kegiatan remaja masjid bulan depan?',
        date: new Date().toISOString(),
        isRead: false
    }
];

let MOCK_USERS: User[] = [
    { id: '1', name: 'Admin', role: UserRole.ADMIN, email: 'admin@masjid.id' },
    { id: '2', name: 'Budi', role: UserRole.JAMAAH, email: 'budi@gmail.com' },
];

let MOCK_CONSULTATIONS: ConsultationItem[] = [
    {
        id: '1',
        userId: '2',
        userName: 'Hamba Allah',
        question: 'Bagaimana hukumnya lupa rakaat saat shalat?',
        answer: 'Jika ragu jumlah rakaat, ambillah yang yakin (yang lebih sedikit), lalu lakukan sujud sahwi sebelum salam.',
        answeredBy: 'Ust. Abdullah',
        status: 'answered',
        createdAt: new Date(Date.now() - 86400000).toISOString(),
        answeredAt: new Date(Date.now() - 80000000).toISOString()
    }
];

const fetchData = async (action: string, params: string = '') => {
  const url = getScriptUrl();
  if (!url) return null;
  try {
    const response = await fetch(`${url}?action=${action}${params}`);
    if (!response.ok) throw new Error('Network error');
    return await response.json();
  } catch (error) {
    console.error(`Error fetching ${action}:`, error);
    return null;
  }
};

const postData = async (payload: any) => {
    const url = getScriptUrl();
    if (!url) return null;
    const response = await fetch(url, {
        method: 'POST',
        headers: { "Content-Type": "text/plain;charset=utf-8" },
        body: JSON.stringify(payload),
    });
    if (!response.ok) throw new Error("Server error");
    return await response.json();
};

const fetchRealtimePrayerTimes = async (): Promise<PrayerTime[] | null> => {
    try {
        const today = new Date();
        const dateStr = `${today.getDate()}-${today.getMonth() + 1}-${today.getFullYear()}`;
        const controller = new AbortController();
        const timeoutId = setTimeout(() => controller.abort(), 3000);
        const response = await fetch(
            `https://api.aladhan.com/v1/timingsByCity/${dateStr}?city=Makassar&country=Indonesia&method=20`,
            { signal: controller.signal }
        );
        clearTimeout(timeoutId);
        if (!response.ok) throw new Error("External API Failed");
        const data = await response.json();
        const t = data.data.timings;
        return [
            { name: 'Subuh', time: t.Fajr },
            { name: 'Terbit', time: t.Sunrise },
            { name: 'Dzuhur', time: t.Dhuhr },
            { name: 'Ashar', time: t.Asr },
            { name: 'Maghrib', time: t.Maghrib },
            { name: 'Isya', time: t.Isha },
        ];
    } catch (error) {
        return null;
    }
};

export const api = {
  getAppConfig: async (): Promise<MosqueGeneralInfo> => {
      const data = await fetchData('getAppConfig');
      let config = { ...DEFAULT_MOSQUE_INFO };
      if (Array.isArray(data)) {
          const configMap: any = {};
          data.forEach((item: any) => {
              if (item.key && item.value) {
                  configMap[item.key] = item.value;
              }
          });
          if (configMap.name) config.name = configMap.name;
          if (configMap.slogan) config.slogan = configMap.slogan;
          if (configMap.description) config.description = configMap.description;
          if (configMap.address) config.address = configMap.address;
          if (configMap.phone) config.contact.phone = configMap.phone;
          if (configMap.email) config.contact.email = configMap.email;
          if (configMap.whatsapp) config.contact.whatsapp = configMap.whatsapp;
          if (configMap.hero_image) config.images.hero = configMap.hero_image;
          if (configMap.profile_image) config.images.profile = configMap.profile_image;
          if (configMap.qris_image) config.images.qris = configMap.qris_image;
          if (configMap.facebook) config.social.facebook = configMap.facebook;
          if (configMap.instagram) config.social.instagram = configMap.instagram;
          if (configMap.youtube) config.social.youtube = configMap.youtube;
      }
      return config;
  },
  getPrayerTimes: async (): Promise<PrayerTime[]> => {
    const realtimeData = await fetchRealtimePrayerTimes();
    if (realtimeData) return realtimeData;
    const data = await fetchData('getPrayerTimes');
    if (Array.isArray(data) && data.length > 0) return data;
    return MOCK_PRAYER_TIMES;
  },
  getPrograms: async (): Promise<ProgramService[]> => {
    const data = await fetchData('getPrograms');
    return Array.isArray(data) ? data : MOCK_PROGRAMS;
  },
  getProfile: async (): Promise<{ detail: MosqueProfileData, staff: Staff[] }> => {
    const data = await fetchData('getProfile');
    if (data && data.details) {
      const detail: MosqueProfileData = {
        history: data.details.find((r: any) => r.section === 'history')?.content || '',
        vision: data.details.find((r: any) => r.section === 'vision')?.content || '',
        mission: data.details.find((r: any) => r.section === 'mission')?.content || '',
      };
      return { detail, staff: Array.isArray(data.staff) ? data.staff : [] };
    }
    return { detail: MOCK_PROFILE, staff: MOCK_STAFF };
  },
  getBankAccounts: async (): Promise<BankAccount[]> => {
    const data = await fetchData('getBankAccounts');
    return Array.isArray(data) ? data : MOCK_BANKS;
  },
  getPosts: async (): Promise<Post[]> => {
    const data = await fetchData('getPosts');
    return Array.isArray(data) ? data : MOCK_POSTS;
  },
  getPostById: async (id: string): Promise<Post | undefined> => {
      const data = await fetchData('getPostById', `&id=${id}`);
      if (data && !data.error) return data;
      return MOCK_POSTS.find(p => p.id === id);
  },
  getTransactions: async (): Promise<Transaction[]> => {
    const data = await fetchData('getFinance');
    return Array.isArray(data) ? data : MOCK_TRANSACTIONS;
  },
  getGallery: async (): Promise<MediaItem[]> => {
    const data = await fetchData('getGallery');
    if (Array.isArray(data)) {
        return data.map((item: any) => ({
            ...item,
            tags: typeof item.tags === 'string' ? item.tags.split(',').map((t: string) => t.trim()) : item.tags
        }));
    }
    return MOCK_GALLERY;
  },
  getUsers: async (): Promise<User[]> => {
      const data = await fetchData('getUsers');
      return Array.isArray(data) ? data : MOCK_USERS;
  },
  getMessages: async (): Promise<InboxMessage[]> => {
      const data = await fetchData('getMessages');
      return Array.isArray(data) ? data : MOCK_MESSAGES;
  },
  sendMessage: async (name: string, email: string, message: string): Promise<{success: boolean}> => {
      try {
          const result = await postData({ action: 'sendMessage', name, email, message });
          if (!result) {
              const newMessage: InboxMessage = {
                  id: Date.now().toString(),
                  name, email, message,
                  date: new Date().toISOString(),
                  isRead: false
              };
              MOCK_MESSAGES = [newMessage, ...MOCK_MESSAGES];
              return { success: true };
          }
          return result;
      } catch (e) {
          return { success: false };
      }
  },
  getConsultations: async (): Promise<ConsultationItem[]> => {
    const data = await fetchData('getConsultations');
    return Array.isArray(data) ? data : MOCK_CONSULTATIONS;
  },
  submitConsultation: async (userId: string, userName: string, question: string): Promise<{success: boolean, message?: string}> => {
    try {
        const result = await postData({ action: 'submitConsultation', userId, userName, question });
        if (!result) {
            const newItem: ConsultationItem = {
                id: Date.now().toString(),
                userId, userName, question,
                status: 'pending',
                createdAt: new Date().toISOString()
            };
            MOCK_CONSULTATIONS = [newItem, ...MOCK_CONSULTATIONS];
            return { success: true };
        }
        return result;
    } catch(e) { return { success: false, message: 'Gagal kirim' }; }
  },
  answerConsultation: async (id: string, answer: string, answeredBy: string): Promise<{success: boolean, message?: string}> => {
    try {
        const result = await postData({ action: 'answerConsultation', id, answer, answeredBy });
        if (!result) {
            MOCK_CONSULTATIONS = MOCK_CONSULTATIONS.map(c => 
                c.id === id ? { ...c, answer, answeredBy, status: 'answered', answeredAt: new Date().toISOString() } : c
            );
            return { success: true };
        }
        return result;
    } catch(e) { return { success: false, message: 'Gagal kirim jawaban' }; }
  },
  login: async (email: string, password: string): Promise<{ success: boolean; user?: User; message?: string }> => {
    try {
      const result = await postData({ action: 'login', email, password });
      if (!result) {
          await new Promise(r => setTimeout(r, 800));
          if (email === 'admin@masjid.id' && password === 'admin123') {
            return { success: true, user: { id: '1', name: 'Administrator', role: UserRole.ADMIN, email, isUstadz: false } };
          } else if (email === 'jamaah@masjid.id' && password === 'jamaah123') {
            return { success: true, user: { id: '2', name: 'Hamba Allah', role: UserRole.JAMAAH, email, isUstadz: false } };
          } else if (email === 'ustadz@masjid.id' && password === 'ustadz123') {
            return { success: true, user: { id: '3', name: 'Ust. Abdullah', role: UserRole.JAMAAH, email, isUstadz: true } };
          }
          return { success: false, message: 'Email atau password salah (Mode Demo)' };
      }
      return result;
    } catch (error) {
      return { success: false, message: 'Gagal terhubung ke server database.' };
    }
  }
};