import React, { useState, useEffect, useRef } from 'react';
import { HashRouter, Routes, Route, Navigate, useLocation, Link, useNavigate } from 'react-router-dom';
import { User, UserRole, MosqueGeneralInfo, Post, MediaItem, ProgramService } from './types';
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
import { Menu, X, Moon, Sun, User as UserIcon, LogOut, Home as HomeIcon, MessageCircle, Heart, FileText, Image, PieChart, LogIn, MapPin, Phone, Mail, Search, ChevronRight, Loader2 } from 'lucide-react';
import { setScriptUrl, api } from './services/api';
import { DEFAULT_MOSQUE_INFO } from './config';
import { AuthContext, ThemeContext, MosqueContext, useAuth, useTheme, useMosqueInfo } from './contexts';

// --- SEARCH MODAL COMPONENT ---
const SearchModal: React.FC<{ isOpen: boolean; onClose: () => void }> = ({ isOpen, onClose }) => {
  const [query, setQuery] = useState('');
  const [results, setResults] = useState<{ posts: Post[], gallery: MediaItem[], programs: ProgramService[] }>({ posts: [], gallery: [], programs: [] });
  const [loading, setLoading] = useState(false);
  const [allData, setAllData] = useState<{ posts: Post[], gallery: MediaItem[], programs: ProgramService[] } | null>(null);
  const inputRef = useRef<HTMLInputElement>(null);
  const navigate = useNavigate();

  // Load all data once when modal opens to perform client-side filtering (fast for small-medium datasets)
  useEffect(() => {
    if (isOpen && !allData) {
      const fetchData = async () => {
        setLoading(true);
        const [posts, gallery, programs] = await Promise.all([
          api.getPosts(),
          api.getGallery(),
          api.getPrograms()
        ]);
        setAllData({ posts, gallery, programs });
        setLoading(false);
      };
      fetchData();
    }
    
    if (isOpen) {
       setTimeout(() => inputRef.current?.focus(), 100);
    }
  }, [isOpen, allData]);

  // Handle Search Filter
  useEffect(() => {
    if (!query.trim() || !allData) {
      setResults({ posts: [], gallery: [], programs: [] });
      return;
    }

    const lowerQuery = query.toLowerCase();
    
    const filteredPosts = allData.posts.filter(p => 
      p.title.toLowerCase().includes(lowerQuery) || 
      p.category.toLowerCase().includes(lowerQuery)
    ).slice(0, 3); // Limit 3 results

    const filteredGallery = allData.gallery.filter(g => 
      g.title.toLowerCase().includes(lowerQuery) || 
      (g.tags && g.tags.some(t => t.toLowerCase().includes(lowerQuery)))
    ).slice(0, 3);

    const filteredPrograms = allData.programs.filter(p => 
      p.title.toLowerCase().includes(lowerQuery) || 
      p.description.toLowerCase().includes(lowerQuery)
    ).slice(0, 2);

    setResults({ posts: filteredPosts, gallery: filteredGallery, programs: filteredPrograms });
  }, [query, allData]);

  const handleNavigate = (path: string) => {
    navigate(path);
    onClose();
    setQuery('');
  };

  if (!isOpen) return null;

  return (
    <div className="fixed inset-0 z-[60] flex items-start justify-center pt-20 px-4">
      {/* Backdrop */}
      <div className="absolute inset-0 bg-black/60 backdrop-blur-sm transition-opacity" onClick={onClose}></div>
      
      {/* Modal Content */}
      <div className="relative w-full max-w-2xl bg-white dark:bg-gray-800 rounded-2xl shadow-2xl overflow-hidden animate-in fade-in zoom-in-95 duration-200">
        <div className="flex items-center border-b border-gray-200 dark:border-gray-700 p-4">
          <Search className="text-gray-400 mr-3" size={24} />
          <input 
            ref={inputRef}
            type="text" 
            value={query}
            onChange={e => setQuery(e.target.value)}
            placeholder="Cari artikel, kegiatan, atau dokumentasi..."
            className="flex-1 bg-transparent border-none outline-none text-lg text-gray-800 dark:text-gray-100 placeholder-gray-400"
          />
          <button onClick={onClose} className="p-1 hover:bg-gray-100 dark:hover:bg-gray-700 rounded-full text-gray-500">
            <X size={24} />
          </button>
        </div>

        <div className="max-h-[60vh] overflow-y-auto p-2">
            {loading && (
              <div className="flex items-center justify-center py-8 text-gray-500">
                <Loader2 className="animate-spin mr-2" size={20} /> Memuat data...
              </div>
            )}

            {!loading && !query && (
               <div className="text-center py-12 text-gray-400 text-sm">
                  Ketik kata kunci untuk mulai mencari
               </div>
            )}

            {!loading && query && results.posts.length === 0 && results.gallery.length === 0 && results.programs.length === 0 && (
               <div className="text-center py-8 text-gray-500">
                  Tidak ditemukan hasil untuk "{query}"
               </div>
            )}

            {/* Results: Posts */}
            {results.posts.length > 0 && (
              <div className="mb-2">
                <h3 className="text-xs font-bold text-gray-500 dark:text-gray-400 uppercase tracking-wider px-3 py-2">Artikel & Berita</h3>
                {results.posts.map(post => (
                  <div 
                    key={post.id} 
                    onClick={() => handleNavigate(`/blog/${post.id}`)}
                    className="flex items-center gap-3 p-3 hover:bg-emerald-50 dark:hover:bg-emerald-900/20 rounded-lg cursor-pointer group transition-colors"
                  >
                    <FileText size={18} className="text-emerald-600 dark:text-emerald-400" />
                    <div className="flex-1 min-w-0">
                      <p className="font-medium text-gray-800 dark:text-gray-200 truncate group-hover:text-emerald-700 dark:group-hover:text-emerald-300">{post.title}</p>
                      <p className="text-xs text-gray-500 truncate">{new Date(post.date).toLocaleDateString()} • {post.category}</p>
                    </div>
                    <ChevronRight size={16} className="text-gray-400 group-hover:text-emerald-500" />
                  </div>
                ))}
              </div>
            )}

            {/* Results: Gallery */}
            {results.gallery.length > 0 && (
              <div className="mb-2">
                <h3 className="text-xs font-bold text-gray-500 dark:text-gray-400 uppercase tracking-wider px-3 py-2">Galeri</h3>
                {results.gallery.map(item => (
                  <div 
                    key={item.id} 
                    onClick={() => handleNavigate('/gallery')}
                    className="flex items-center gap-3 p-3 hover:bg-emerald-50 dark:hover:bg-emerald-900/20 rounded-lg cursor-pointer group transition-colors"
                  >
                    <Image size={18} className="text-purple-600 dark:text-purple-400" />
                    <div className="flex-1 min-w-0">
                      <p className="font-medium text-gray-800 dark:text-gray-200 truncate group-hover:text-purple-700 dark:group-hover:text-purple-300">{item.title}</p>
                      <div className="flex gap-1 mt-0.5">
                          {item.tags?.slice(0, 2).map((tag, i) => (
                              <span key={i} className="text-[10px] bg-gray-100 dark:bg-gray-700 px-1.5 py-0.5 rounded text-gray-600 dark:text-gray-300">#{tag}</span>
                          ))}
                      </div>
                    </div>
                    <ChevronRight size={16} className="text-gray-400 group-hover:text-purple-500" />
                  </div>
                ))}
              </div>
            )}

             {/* Results: Programs */}
             {results.programs.length > 0 && (
              <div className="mb-2">
                <h3 className="text-xs font-bold text-gray-500 dark:text-gray-400 uppercase tracking-wider px-3 py-2">Program</h3>
                {results.programs.map((prog, idx) => (
                  <div 
                    key={idx} 
                    onClick={() => handleNavigate('/')}
                    className="flex items-center gap-3 p-3 hover:bg-emerald-50 dark:hover:bg-emerald-900/20 rounded-lg cursor-pointer group transition-colors"
                  >
                    <div className="text-lg">{prog.icon}</div>
                    <div className="flex-1 min-w-0">
                      <p className="font-medium text-gray-800 dark:text-gray-200 truncate group-hover:text-emerald-700 dark:group-hover:text-emerald-300">{prog.title}</p>
                      <p className="text-xs text-gray-500 truncate">{prog.description}</p>
                    </div>
                  </div>
                ))}
              </div>
            )}
        </div>
        
        <div className="bg-gray-50 dark:bg-gray-700/50 p-3 text-center text-xs text-gray-400 border-t border-gray-100 dark:border-gray-700">
            Tekan <kbd className="font-sans px-1 py-0.5 bg-white dark:bg-gray-600 border border-gray-300 dark:border-gray-500 rounded text-[10px]">ESC</kbd> untuk menutup
        </div>
      </div>
    </div>
  );
};


// Components
const Layout: React.FC<{ children: React.ReactNode }> = ({ children }) => {
  const [isSidebarOpen, setIsSidebarOpen] = useState(false);
  const [isSearchOpen, setIsSearchOpen] = useState(false); // State for Search Modal
  const { isDark, toggleTheme } = useTheme();
  const { user, logout } = useAuth();
  const mosqueInfo = useMosqueInfo(); 
  const location = useLocation();
  const navigate = useNavigate();

  // --- MAGIC LINK CONFIGURATION LOGIC ---
  useEffect(() => {
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

  // Handle ESC key for search
  useEffect(() => {
    const handleKeyDown = (e: KeyboardEvent) => {
        if (e.key === 'k' && (e.metaKey || e.ctrlKey)) {
            e.preventDefault();
            setIsSearchOpen(true);
        }
        if (e.key === 'Escape') {
            setIsSearchOpen(false);
        }
    };
    window.addEventListener('keydown', handleKeyDown);
    return () => window.removeEventListener('keydown', handleKeyDown);
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
      <SearchModal isOpen={isSearchOpen} onClose={() => setIsSearchOpen(false)} />

      {/* Navbar */}
      <header className="sticky top-0 z-50 bg-white dark:bg-gray-800 shadow-md border-b border-gray-200 dark:border-gray-700">
        <div className="container mx-auto px-4 h-16 flex items-center justify-between">
          <div className="flex items-center gap-2">
            <button onClick={() => setIsSidebarOpen(!isSidebarOpen)} className="lg:hidden p-2 text-emerald-700 dark:text-emerald-400">
              <Menu size={24} />
            </button>
            <Link to="/" className="text-xl md:text-2xl font-bold text-emerald-800 dark:text-emerald-400 flex items-center gap-2 truncate max-w-[200px] md:max-w-none">
              <span>🕌</span> 
              <span className="truncate md:hidden">Al-Muamalah</span>
              <span className="truncate hidden md:block">{mosqueInfo.name}</span>
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

          <div className="flex items-center gap-2 md:gap-3">
            {/* Search Button */}
            <button 
                onClick={() => setIsSearchOpen(true)}
                className="p-2 rounded-full hover:bg-gray-100 dark:hover:bg-gray-700 text-gray-600 dark:text-gray-300 transition-colors"
                title="Cari (Ctrl + K)"
            >
                <Search size={20} />
            </button>

            <button onClick={toggleTheme} className="p-2 rounded-full hover:bg-gray-100 dark:hover:bg-gray-700 text-gray-600 dark:text-gray-300">
              {isDark ? <Sun size={20} /> : <Moon size={20} />}
            </button>
            
            {user.role === UserRole.GUEST ? (
              <div className="flex gap-2">
                <Link 
                  to="/login"
                  className="flex items-center gap-2 px-4 py-2 text-sm font-medium text-white bg-emerald-600 hover:bg-emerald-700 rounded-lg transition-colors shadow-sm hidden md:flex"
                >
                  <LogIn size={16} />
                  <span>Masuk</span>
                </Link>
                {/* Mobile Login Icon */}
                <Link 
                  to="/login"
                  className="p-2 md:hidden text-emerald-600 hover:bg-emerald-50 rounded-full"
                >
                   <LogIn size={20} />
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
            
            {/* Search in Sidebar (Mobile) */}
            <div className="mb-4">
                <button 
                    onClick={() => { setIsSidebarOpen(false); setIsSearchOpen(true); }}
                    className="w-full flex items-center gap-3 px-4 py-3 bg-gray-100 dark:bg-gray-700/50 rounded-lg text-sm text-gray-500 dark:text-gray-400"
                >
                    <Search size={18} />
                    Cari sesuatu...
                </button>
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
                 <span>🕌</span> {mosqueInfo.name}
            </h3>
            <p className="text-sm opacity-80 leading-relaxed max-w-xs">
              {mosqueInfo.slogan}
            </p>
          </div>
          <div>
            <h4 className="font-semibold text-white mb-4 text-lg border-b border-emerald-700 pb-2 inline-block">Hubungi Kami</h4>
            <div className="space-y-3 text-sm opacity-90">
                <a 
                    href="https://www.google.com/maps/search/?api=1&query=-5.1371483500853605,119.50608370916899"
                    target="_blank"
                    rel="noopener noreferrer"
                    className="flex items-start gap-3 hover:text-gold-400 transition-colors group"
                >
                    <MapPin size={18} className="mt-1 flex-shrink-0 text-gold-400 group-hover:text-gold-300" />
                    <span>{mosqueInfo.address}</span>
                </a>
                <p className="flex items-center gap-3">
                    <Phone size={18} className="text-gold-400" />
                    <span>{mosqueInfo.contact.phone}</span>
                </p>
                <p className="flex items-center gap-3">
                    <Mail size={18} className="text-gold-400" />
                    <span>{mosqueInfo.contact.email}</span>
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
          <span>© {new Date().getFullYear()} {mosqueInfo.name}. All rights reserved.</span>
        </div>
      </footer>
    </div>
  );
};

export default function App() {
  const [user, setUser] = useState<User>({ id: 'guest', name: 'Tamu', role: UserRole.GUEST });
  const [isDark, setIsDark] = useState(false);
  const [mosqueInfo, setMosqueInfo] = useState<MosqueGeneralInfo>(DEFAULT_MOSQUE_INFO);

  // --- DYNAMIC TITLE & CONFIG LOGIC ---
  const refreshInfo = async () => {
      const data = await api.getAppConfig();
      setMosqueInfo(data);
      document.title = data.name;
  };

  useEffect(() => {
    refreshInfo();
  }, []);

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
        <MosqueContext.Provider value={{ info: mosqueInfo, refreshInfo }}>
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
        </MosqueContext.Provider>
      </AuthContext.Provider>
    </ThemeContext.Provider>
  );
}