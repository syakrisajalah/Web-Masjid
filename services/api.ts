import { User, Post, Transaction, PrayerTime, MediaItem, UserRole, ProgramService, MosqueProfileData, Staff, BankAccount, ConsultationItem } from '../types';

const SCRIPT_URL_KEY = 'masjid_app_script_url';

export const getScriptUrl = () => localStorage.getItem(SCRIPT_URL_KEY);
export const setScriptUrl = (url: string) => localStorage.setItem(SCRIPT_URL_KEY, url);

// --- MOCK DATA ---

const MOCK_PRAYER_TIMES: PrayerTime[] = [
  { name: 'Subuh', time: '04:35' },
  { name: 'Terbit', time: '05:50' },
  { name: 'Dzuhur', time: '11:58' },
  { name: 'Ashar', time: '15:15' },
  { name: 'Maghrib', time: '17:59' },
  { name: 'Isya', time: '19:10' },
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
  history: "Masjid Al-Mustaqbal didirikan pada tahun 2010 oleh sekelompok tokoh masyarakat yang menginginkan adanya pusat kegiatan Islam yang terpadu. Berawal dari musholla kecil, kini telah berkembang menjadi pusat peradaban dengan fasilitas pendidikan dan pemberdayaan ekonomi umat.",
  vision: "Menjadi masjid percontohan dalam manajemen modern yang berbasis pada pelayanan umat dan kemandirian ekonomi.",
  mission: "- Menyelenggarakan peribadahan yang khusyuk dan nyaman.\n- Mengembangkan pendidikan Al-Quran berbasis teknologi.\n- Memberdayakan ekonomi umat melalui Baitul Maal.\n- Menjadi pusat informasi dan kajian keislaman."
};

const MOCK_STAFF: Staff[] = [
  { role: 'Ketua DKM', name: 'H. Abdullah S.Ag', imageUrl: 'https://picsum.photos/seed/staff1/100' },
  { role: 'Sekretaris', name: 'Ust. Ahmad Zaini', imageUrl: 'https://picsum.photos/seed/staff2/100' },
  { role: 'Bendahara', name: 'Bpk. Irwan Santoso', imageUrl: 'https://picsum.photos/seed/staff3/100' },
];

const MOCK_BANKS: BankAccount[] = [
  { bankName: 'BSI (Bank Syariah Indonesia)', accountNumber: '7700123456', holderName: 'Masjid Al Mustaqbal' },
  { bankName: 'Bank Muamalat', accountNumber: '1230098765', holderName: 'Masjid Al Mustaqbal' }
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
  },
   {
    id: '2',
    title: 'Laporan Penyaluran Hewan Qurban 2024',
    category: 'Berita',
    excerpt: 'Alhamdulillah, tahun ini masjid kita telah menyalurkan 10 Sapi dan 25 Kambing kepada 500 mustahik di lingkungan sekitar.',
    content: `Assalamualaikum Warahmatullahi Wabarakatuh...`,
    date: '2024-06-20',
    author: 'Panitia Qurban',
    imageUrl: 'https://picsum.photos/seed/qurban/400/250'
  }
];

const MOCK_TRANSACTIONS: Transaction[] = [
  { id: '1', date: '2024-06-28', description: 'Infaq Jumat', amount: 2500000, type: 'income', category: 'Infaq' },
  { id: '2', date: '2024-06-29', description: 'Bayar Listrik PLN', amount: 1200000, type: 'expense', category: 'Operasional' },
  { id: '3', date: '2024-06-30', description: 'Honor Kebersihan', amount: 800000, type: 'expense', category: 'SDM' },
  { id: '4', date: '2024-07-01', description: 'Sumbangan Hamba Allah', amount: 5000000, type: 'income', category: 'Donasi' },
];

const MOCK_GALLERY: MediaItem[] = [
  { id: '1', type: 'image', url: 'https://picsum.photos/seed/g1/600/400', title: 'Shalat Idul Fitri 1445H' },
  { id: '2', type: 'image', url: 'https://picsum.photos/seed/g2/600/400', title: 'Kegiatan Santunan Yatim' },
  { id: '4', type: 'video', url: 'https://storage.googleapis.com/gtv-videos-bucket/sample/ForBiggerJoyrides.mp4', title: 'Dokumentasi Video Kegiatan' },
];

// Mutable mock data for consultations to persist during session
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
    },
    {
        id: '2',
        userId: '99',
        userName: 'Fulan',
        question: 'Apakah boleh berpuasa di hari Jumat saja?',
        status: 'pending',
        createdAt: new Date().toISOString(),
    }
];

// --- API METHODS ---

const fetchData = async (action: string, params: string = '') => {
  const url = getScriptUrl();
  if (!url) return null;

  try {
    const response = await fetch(`${url}?action=${action}${params}`);
    if (!response.ok) throw new Error('Network error');
    return await response.json();
  } catch (error) {
    console.warn(`API Error [${action}]: Using mock data.`, error);
    return null;
  }
};

export const api = {
  getPrayerTimes: async (): Promise<PrayerTime[]> => {
    const data = await fetchData('getPrayerTimes');
    // If array and not empty, use it. If empty or invalid, use mock.
    return (Array.isArray(data) && data.length > 0) ? data : MOCK_PRAYER_TIMES;
  },

  getPrograms: async (): Promise<ProgramService[]> => {
    const data = await fetchData('getPrograms');
    // Important: Prevent empty homepage if sheet is empty
    return (Array.isArray(data) && data.length > 0) ? data : MOCK_PROGRAMS;
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
    return (Array.isArray(data) && data.length > 0) ? data : MOCK_BANKS;
  },

  getPosts: async (): Promise<Post[]> => {
    const data = await fetchData('getPosts');
    return (Array.isArray(data) && data.length > 0) ? data : MOCK_POSTS;
  },

  getPostById: async (id: string): Promise<Post | undefined> => {
      const data = await fetchData('getPostById', `&id=${id}`);
      if (data && !data.error) return data;
      return MOCK_POSTS.find(p => p.id === id);
  },

  getTransactions: async (): Promise<Transaction[]> => {
    const data = await fetchData('getFinance');
    return (Array.isArray(data) && data.length > 0) ? data : MOCK_TRANSACTIONS;
  },

  getGallery: async (): Promise<MediaItem[]> => {
    const data = await fetchData('getGallery');
    return (Array.isArray(data) && data.length > 0) ? data : MOCK_GALLERY;
  },

  // --- CONSULTATION API ---
  getConsultations: async (): Promise<ConsultationItem[]> => {
    const data = await fetchData('getConsultations');
    return Array.isArray(data) ? data : MOCK_CONSULTATIONS;
  },

  submitConsultation: async (userId: string, userName: string, question: string): Promise<{success: boolean, message?: string}> => {
    const url = getScriptUrl();
    if (!url) {
        // Mock Submit
        const newItem: ConsultationItem = {
            id: Date.now().toString(),
            userId, userName, question,
            status: 'pending',
            createdAt: new Date().toISOString()
        };
        MOCK_CONSULTATIONS = [newItem, ...MOCK_CONSULTATIONS];
        return { success: true };
    }

    try {
        await fetch(url, {
            method: 'POST',
            body: JSON.stringify({ action: 'submitConsultation', userId, userName, question }),
        });
        return { success: true };
    } catch(e) { return { success: false, message: 'Gagal kirim' }; }
  },

  answerConsultation: async (id: string, answer: string, answeredBy: string): Promise<{success: boolean, message?: string}> => {
    const url = getScriptUrl();
    if (!url) {
        // Mock Answer
        MOCK_CONSULTATIONS = MOCK_CONSULTATIONS.map(c => 
            c.id === id ? { ...c, answer, answeredBy, status: 'answered', answeredAt: new Date().toISOString() } : c
        );
        return { success: true };
    }

    try {
        await fetch(url, {
            method: 'POST',
            body: JSON.stringify({ action: 'answerConsultation', id, answer, answeredBy }),
        });
        return { success: true };
    } catch(e) { return { success: false, message: 'Gagal kirim jawaban' }; }
  },

  login: async (email: string, password: string): Promise<{ success: boolean; user?: User; message?: string }> => {
    const url = getScriptUrl();
    if (!url) {
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
    try {
      const response = await fetch(url, {
        method: 'POST',
        body: JSON.stringify({ action: 'login', email, password }),
      });
      return await response.json();
    } catch (error) {
      return { success: false, message: 'Gagal terhubung ke server database.' };
    }
  }
};
