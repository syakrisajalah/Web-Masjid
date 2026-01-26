import { MosqueGeneralInfo } from './types';

// Ini adalah data default (fallback) jika database belum terhubung atau kosong
export const DEFAULT_MOSQUE_INFO: MosqueGeneralInfo = {
    name: "Mesjid Al-Muamalah",
    slogan: "Pusat Peradaban & Pemberdayaan Umat",
    description: "Mesjid Al-Muamalah hadir sebagai pusat kegiatan ibadah yang nyaman, modern, dan inklusif. Kami berkomitmen untuk membangun masyarakat madani melalui program pendidikan, sosial, dan ekonomi berbasis syariah.",
    address: "JL Kejayaan Utara Raya BTP Blok L, Makassar",
    contact: {
        phone: "+62 812-3456-7890",
        email: "info@almuamalah.id",
        whatsapp: "6281234567890"
    },
    social: {
        facebook: "Mesjid Al Muamalah",
        instagram: "@almuamalah.official",
        youtube: "Al-Muamalah TV"
    },
    images: {
        hero: "https://picsum.photos/1920/1080?grayscale&blur=2", // Gambar besar di halaman Beranda
        profile: "https://picsum.photos/800/600?grayscale", // Gambar di halaman Profil
        qris: "https://picsum.photos/250/250?blur=10" // Gambar QR Code di halaman Donasi
    }
};