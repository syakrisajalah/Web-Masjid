import React, { useState, createContext, useContext, useEffect } from 'react';
import { HashRouter, Routes, Route, Navigate, useLocation, Link, useNavigate } from 'react-router-dom';
import { User, UserRole } from './types';
import { Home } from './pages/Home';
import { Consultation } from './pages/Consultation';
import { Profile } from './pages/Profile';
import { Donation } from './pages/Donation';
import { AdminDashboard } from './pages/AdminDashboard';
import { Gallery } from './pages/Gallery';
import { BlogList } from './pages/BlogList';
import { BlogDetail } from './pages/BlogDetail';
import { FinancialReport } from './pages/FinancialReport';
import { Login } from './pages/Login';
import { Menu, X, Moon, Sun, User as UserIcon, LogOut, Home as HomeIcon, MessageCircle, Heart, FileText, Image, PieChart, LogIn, MapPin, Phone, Mail } from 'lucide-react';
import { setScriptUrl } from './services/api';
import { MOSQUE_INFO } from './config';

// Contexts
interface AuthContextType {
  user: User;
  login: (role: UserRole, userData?: User) => void; 
  logout: () => void;
}

const AuthContext = createContext<AuthContextType | undefined>(undefined);

export const useAuth = () => {
  const context = useContext(AuthContext);
  if (!context) throw new Error('useAuth must be used within an AuthProvider');
  return context;
};

interface ThemeContextType {
  isDark: boolean;
  toggleTheme: () => void;
}

const ThemeContext = createContext<ThemeContextType | undefined>(undefined);

export const useTheme = () => {
  const context = useContext(ThemeContext);
  if (!context) throw new Error('useTheme must be used within a ThemeProvider');
  return context;
};

// Components
const Layout: React.FC<{ children: React.ReactNode }> = ({ children }) => {
  const [isSidebarOpen, setIsSidebarOpen] = useState(false);
  const { isDark, toggleTheme } = useTheme();
  const { user, logout } = useAuth();
  const location = useLocation();
  const navigate = useNavigate();

  // --- MAGIC LINK CONFIGURATION LOGIC ---
  useEffect(() => {
    // Cek apakah ada parameter 'apiUrl' di URL browser
    const params = new URLSearchParams(window.location.search);
    const newApiUrl = params.get('apiUrl');

    if (newApiUrl && newApiUrl.startsWith('https://script.google.com/')) {
        setScriptUrl(newApiUrl);
        const newUrl = window.location.protocol + "//" + window.location.host + window.location.pathname + window.location.hash;
        window.history.pushState({path:newUrl},'',newUrl);
        alert("Konfigurasi Database berhasil diperbarui otomatis!");
        window.location.reload();
    }
  }, []);

  const navItems = [
    { path: '/', label: 'Beranda', icon: <HomeIcon size={20} /> },
    { path: '/profile', label: 'Profil', icon: <UserIcon size={20} /> },
    { path: '/blog', label: 'Artikel', icon: <FileText size={20} /> },
    { path: '/gallery', label: 'Galeri', icon: <Image size={20} /> },
    { path: '/donation', label: 'Donasi', icon: <Heart size={20} /> },
    { path: '/finance', label: 'Keuangan', icon: <PieChart size={20} /> },
    { path: '/consultation', label: 'Tanya Ustaz', icon: <MessageCircle size={20} /> },
  ];

  if (user.role === UserRole.ADMIN) {
    navItems.push({ path: '/admin', label: 'Admin Dashboard', icon: <UserIcon size={20} /> });
  }

  const isActive = (path: string) => location.pathname === path || (path === '/blog' && location.pathname.startsWith('/blog/'));

  return (
    <div className="min-h-screen flex flex-col font-sans">
      {/* Navbar */}
      <header className="sticky top-0 z-50 bg-white dark:bg-gray-800 shadow-md border-b border-gray-200 dark:border-gray-700">
        <div className="container mx-auto px-4 h-16 flex items-center justify-between">
          <div className="flex items-center gap-2">
            <button onClick={() => setIsSidebarOpen(!isSidebarOpen)} className="lg:hidden p-2 text-emerald-700 dark:text-emerald-400">
              <Menu size={24} />
            </button>
            <Link to="/" className="text-xl md:text-2xl font-bold text-emerald-800 dark:text-emerald-400 flex items-center gap-2 truncate max-w-[200px] md:max-w-none">
              <span>🕌</span> <span className="hidden sm:inline">{MOSQUE_INFO.name}</span>
              <span className="sm:hidden">Al-Mustaqbal</span>
            </Link>
          </div>

          <div className="hidden lg:flex items-center gap-6">
            {navItems.map((item) => (
              <Link
                key={item.path}
                to={item.path}
                className={`text-sm font-medium transition-colors ${
                  isActive(item.path) 
                    ? 'text-emerald-600 dark:text-emerald-400' 
                    : 'text-gray-600 dark:text-gray-300 hover:text-emerald-600'
                }`}
              >
                {item.label}
              </Link>
            ))}
          </div>

          <div className="flex items-center gap-3">
            <button onClick={toggleTheme} className="p-2 rounded-full hover:bg-gray-100 dark:hover:bg-gray-700 text-gray-600 dark:text-gray-300">
              {isDark ? <Sun size={20} /> : <Moon size={20} />}
            </button>
            
            {user.role === UserRole.GUEST ? (
              <div className="flex gap-2">
                <Link 
                  to="/login"
                  className="flex items-center gap-2 px-4 py-2 text-sm font-medium text-white bg-emerald-600 hover:bg-emerald-700 rounded-lg transition-colors shadow-sm"
                >
                  <LogIn size={16} />
                  <span>Masuk</span>
                </Link>
              </div>
            ) : (
              <div className="flex items-center gap-2">
                <span className="text-sm font-medium text-gray-700 dark:text-gray-300 hidden sm:block">
                  Hi, {user.name}
                </span>
                {user.isUstadz && (
                    <span className="text-xs bg-emerald-100 text-emerald-800 px-2 py-0.5 rounded-full border border-emerald-200 hidden sm:block">
                        Ustadz
                    </span>
                )}
                <button 
                  onClick={() => {
                      logout();
                      navigate('/');
                  }} 
                  className="p-2 text-red-500 hover:bg-red-50 rounded-full" 
                  title="Logout"
                >
                  <LogOut size={20} />
                </button>
              </div>
            )}
          </div>
        </div>
      </header>

      {/* Mobile Sidebar */}
      {isSidebarOpen && (
        <div className="fixed inset-0 z-50 lg:hidden">
          <div className="absolute inset-0 bg-black/50" onClick={() => setIsSidebarOpen(false)} />
          <div className="absolute left-0 top-0 bottom-0 w-64 bg-white dark:bg-gray-800 shadow-xl p-4 flex flex-col">
            <div className="flex justify-between items-center mb-6">
              <h2 className="text-xl font-bold text-emerald-800 dark:text-emerald-400">Menu</h2>
              <button onClick={() => setIsSidebarOpen(false)}><X size={24} /></button>
            </div>
            <nav className="flex flex-col gap-2 flex-1 overflow-y-auto">
              {navItems.map((item) => (
                <Link
                  key={item.path}
                  to={item.path}
                  onClick={() => setIsSidebarOpen(false)}
                  className={`flex items-center gap-3 px-4 py-3 rounded-lg text-sm font-medium transition-colors ${
                    isActive(item.path)
                      ? 'bg-emerald-50 dark:bg-emerald-900/30 text-emerald-700 dark:text-emerald-400'
                      : 'text-gray-600 dark:text-gray-300 hover:bg-gray-50 dark:hover:bg-gray-700'
                  }`}
                >
                  {item.icon}
                  {item.label}
                </Link>
              ))}
            </nav>

             {/* Auth Buttons for Mobile */}
            <div className="pt-4 mt-4 border-t border-gray-100 dark:border-gray-700">
                {user.role === UserRole.GUEST ? (
                    <div className="space-y-2">
                        <Link 
                        to="/login"
                        onClick={() => setIsSidebarOpen(false)}
                        className="w-full flex items-center justify-center gap-2 py-2.5 px-4 bg-emerald-600 text-white rounded-lg text-sm font-medium hover:bg-emerald-700 transition-colors"
                        >
                        <LogIn size={16} /> Masuk Akun
                        </Link>
                    </div>
                ) : (
                    <div className="space-y-3">
                         <div className="flex items-center gap-3 px-2">
                            <div className="w-8 h-8 rounded-full bg-emerald-100 dark:bg-emerald-900 flex items-center justify-center text-emerald-700 dark:text-emerald-300">
                                <UserIcon size={16} />
                            </div>
                            <div>
                                <p className="text-sm font-medium text-gray-800 dark:text-white">{user.name}</p>
                                <p className="text-xs text-gray-500 dark:text-gray-400 capitalize flex items-center gap-1">
                                    {user.role}
                                    {user.isUstadz && <span className="bg-emerald-100 text-emerald-800 px-1 rounded text-[10px]">Ustadz</span>}
                                </p>
                            </div>
                         </div>
                        <button 
                            onClick={() => {
                                logout();
                                setIsSidebarOpen(false);
                                navigate('/');
                            }} 
                            className="w-full flex items-center justify-center gap-2 py-2.5 px-4 bg-red-50 dark:bg-red-900/20 text-red-600 dark:text-red-400 rounded-lg text-sm font-medium hover:bg-red-100 dark:hover:bg-red-900/30 transition-colors"
                        >
                            <LogOut size={16} /> Keluar
                        </button>
                    </div>
                )}
            </div>
          </div>
        </div>
      )}

      {/* Main Content */}
      <main className="flex-1 bg-gray-50 dark:bg-gray-900 transition-colors duration-300">
        {children}
      </main>

      {/* Footer */}
      <footer className="bg-emerald-900 text-emerald-100 py-12 mt-auto">
        <div className="container mx-auto px-4 grid grid-cols-1 md:grid-cols-3 gap-8">
          <div className="space-y-4">
            <h3 className="text-2xl font-bold text-white flex items-center gap-2">
                 <span>🕌</span> {MOSQUE_INFO.name}
            </h3>
            <p className="text-sm opacity-80 leading-relaxed max-w-xs">
              {MOSQUE_INFO.slogan}
            </p>
          </div>
          <div>
            <h4 className="font-semibold text-white mb-4 text-lg border-b border-emerald-700 pb-2 inline-block">Hubungi Kami</h4>
            <div className="space-y-3 text-sm opacity-90">
                <p className="flex items-start gap-3">
                    <MapPin size={18} className="mt-1 flex-shrink-0 text-gold-400" />
                    <span>{MOSQUE_INFO.address}</span>
                </p>
                <p className="flex items-center gap-3">
                    <Phone size={18} className="text-gold-400" />
                    <span>{MOSQUE_INFO.contact.phone}</span>
                </p>
                <p className="flex items-center gap-3">
                    <Mail size={18} className="text-gold-400" />
                    <span>{MOSQUE_INFO.contact.email}</span>
                </p>
            </div>
          </div>
          <div>
            <h4 className="font-semibold text-white mb-4 text-lg border-b border-emerald-700 pb-2 inline-block">Tautan Cepat</h4>
            <div className="flex flex-col gap-2 text-sm opacity-80">
              <Link to="/profile" className="hover:text-gold-400 transition-colors flex items-center gap-2"><span className="w-1 h-1 bg-gold-400 rounded-full"></span> Profil Masjid</Link>
              <Link to="/donation" className="hover:text-gold-400 transition-colors flex items-center gap-2"><span className="w-1 h-1 bg-gold-400 rounded-full"></span> Salurkan Infaq</Link>
              <Link to="/consultation" className="hover:text-gold-400 transition-colors flex items-center gap-2"><span className="w-1 h-1 bg-gold-400 rounded-full"></span> Tanya Ustaz</Link>
              <Link to="/blog" className="hover:text-gold-400 transition-colors flex items-center gap-2"><span className="w-1 h-1 bg-gold-400 rounded-full"></span> Berita Terbaru</Link>
            </div>
          </div>
        </div>
        <div className="text-center mt-12 pt-8 border-t border-emerald-800/50 text-xs opacity-60 flex justify-center items-center gap-2">
          <span>© {new Date().getFullYear()} {MOSQUE_INFO.name}. All rights reserved.</span>
        </div>
      </footer>
    </div>
  );
};

export default function App() {
  const [user, setUser] = useState<User>({ id: 'guest', name: 'Tamu', role: UserRole.GUEST });
  const [isDark, setIsDark] = useState(false);

  useEffect(() => {
    if (isDark) {
      document.documentElement.classList.add('dark');
    } else {
      document.documentElement.classList.remove('dark');
    }
  }, [isDark]);

  const login = (role: UserRole, userData?: User) => {
    if (userData) {
        setUser(userData);
    } else {
        const name = role === UserRole.ADMIN ? 'Administrator' : 'Hamba Allah';
        setUser({ id: '1', name, role, email: `${role}@masjid.id` });
    }
  };

  const logout = () => {
    setUser({ id: 'guest', name: 'Tamu', role: UserRole.GUEST });
  };

  return (
    <ThemeContext.Provider value={{ isDark, toggleTheme: () => setIsDark(!isDark) }}>
      <AuthContext.Provider value={{ user, login, logout }}>
        <HashRouter>
          <Layout>
            <Routes>
              <Route path="/" element={<Home />} />
              <Route path="/login" element={<Login />} />
              <Route path="/profile" element={<Profile />} />
              <Route path="/donation" element={<Donation />} />
              <Route path="/consultation" element={<Consultation />} />
              <Route path="/blog" element={<BlogList />} />
              <Route path="/blog/:id" element={<BlogDetail />} />
              <Route path="/gallery" element={<Gallery />} />
              <Route path="/finance" element={<FinancialReport />} />
              <Route path="/admin" element={
                user.role === UserRole.ADMIN ? <AdminDashboard /> : <Navigate to="/" />
              } />
            </Routes>
          </Layout>
        </HashRouter>
      </AuthContext.Provider>
    </ThemeContext.Provider>
  );
}
