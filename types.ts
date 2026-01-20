export enum UserRole {
  GUEST = 'guest',
  JAMAAH = 'jamaah',
  ADMIN = 'admin'
}

export interface User {
  id: string;
  name: string;
  role: UserRole;
  email?: string;
  isUstadz?: boolean; // New Flag
}

export interface PrayerTime {
  name: string;
  time: string;
}

export interface Post {
  id: string;
  title: string;
  category: 'Berita' | 'Artikel' | 'Pengumuman';
  excerpt: string;
  content: string; // Full article content
  date: string;
  author: string;
  imageUrl?: string;
}

export interface Transaction {
  id: string;
  date: string;
  description: string;
  amount: number;
  type: 'income' | 'expense';
  category: string;
}

export interface ChatMessage {
  id: string;
  role: 'user' | 'model';
  text: string;
  timestamp: Date;
}

export interface MediaItem {
  id: string;
  type: 'image' | 'video';
  url: string;
  title: string;
}

// New Types
export interface ProgramService {
  title: string;
  description: string;
  icon: string; // Emoji char or icon identifier
}

export interface Staff {
  name: string;
  role: string;
  imageUrl?: string;
}

export interface MosqueProfileData {
  history: string;
  vision: string;
  mission: string; // Can be bullet points separated by newline
}

export interface BankAccount {
  bankName: string;
  accountNumber: string;
  holderName: string;
}

export interface ConsultationItem {
  id: string;
  userId: string;
  userName: string;
  question: string;
  answer?: string;
  answeredBy?: string; // Name of Ustadz
  status: 'pending' | 'answered';
  createdAt: string;
  answeredAt?: string;
}
