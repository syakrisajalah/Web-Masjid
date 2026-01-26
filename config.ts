import { MosqueGeneralInfo } from './types';

// Ini adalah data default (fallback) jika database belum terhubung atau kosong
export const DEFAULT_MOSQUE_INFO: MosqueGeneralInfo = {
    name: "Masjid Raya Al-Mustaqbal",
    slogan: "Pusat Peradaban & Pemberdayaan Umat",
    description: "Masjid Al-Mustaqbal hadir sebagai pusat kegiatan ibadah yang nyaman, modern, dan inklusif. Kami berkomitmen untuk membangun masyarakat madani melalui program pendidikan, sosial, dan ekonomi berbasis syariah.",
    address: "Jl. Masjid Raya No. 1, Makassar, Sulawesi Selatan",
    contact: {
        phone: "+62 812-3456-7890",
        email: "info@almustaqbal.id",
        whatsapp: "6281234567890"
    },
    social: {
        facebook: "Masjid Al Mustaqbal",
        instagram: "@almustaqbal.official",
        youtube: "Al-Mustaqbal TV"
    },
    images: {
        hero: "https://picsum.photos/1920/1080?grayscale&blur=2", // Gambar besar di halaman Beranda
        profile: "https://picsum.photos/800/600?grayscale", // Gambar di halaman Profil
        qris: "https://picsum.photos/250/250?blur=10" // Gambar QR Code di halaman Donasi
    }
};