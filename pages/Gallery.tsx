import React, { useEffect, useState, useMemo } from 'react';
import { Play, Loader2, X, Youtube, Image as ImageIcon, Video as VideoIcon, Tag, ChevronDown, FolderHeart } from 'lucide-react';
import { api } from '../services/api';
import { MediaItem } from '../types';

export const Gallery: React.FC = () => {
    // State untuk data mentah dari API
    const [allItems, setAllItems] = useState<MediaItem[]>([]);
    const [loading, setLoading] = useState(true);
    
    // State untuk interaksi UI
    const [selectedItem, setSelectedItem] = useState<MediaItem | null>(null);
    const [activeTag, setActiveTag] = useState<string>('Semua');
    const [filterType, setFilterType] = useState<'all' | 'image' | 'video'>('all');
    
    // State untuk Pagination (Load More)
    const ITEMS_PER_PAGE = 9;
    const [visibleCount, setVisibleCount] = useState(ITEMS_PER_PAGE);

    useEffect(() => {
        const loadGallery = async () => {
            setLoading(true);
            const data = await api.getGallery();
            // Sort data terbaru dulu
            setAllItems([...data].reverse());
            setLoading(false);
        };
        loadGallery();
    }, []);

    // Extract unique tags from all items
    const allTags = useMemo(() => {
        const tags = new Set<string>();
        allItems.forEach(item => {
            if (item.tags && Array.isArray(item.tags)) {
                item.tags.forEach(t => tags.add(t));
            }
        });
        return ['Semua', ...Array.from(tags).sort()];
    }, [allItems]);

    // Main Filter Logic
    const filteredItems = useMemo(() => {
        return allItems.filter(item => {
            // Filter 1: Type
            if (filterType !== 'all' && item.type !== filterType) return false;
            
            // Filter 2: Tag
            if (activeTag === 'Semua') return true;
            return item.tags && item.tags.includes(activeTag);
        });
    }, [allItems, filterType, activeTag]);

    // Pagination Logic
    const visibleItems = useMemo(() => {
        return filteredItems.slice(0, visibleCount);
    }, [filteredItems, visibleCount]);

    // Reset pagination when filter changes
    useEffect(() => {
        setVisibleCount(ITEMS_PER_PAGE);
    }, [filterType, activeTag]);

    const handleLoadMore = () => {
        setVisibleCount(prev => prev + ITEMS_PER_PAGE);
    };

    // Close on Escape key
    useEffect(() => {
        const handleEsc = (e: KeyboardEvent) => {
            if (e.key === 'Escape') setSelectedItem(null);
        };
        window.addEventListener('keydown', handleEsc);
        return () => window.removeEventListener('keydown', handleEsc);
    }, []);

    // Helper: Extract YouTube ID
    const getYouTubeId = (url: string) => {
        const regExp = /^.*(youtu.be\/|v\/|u\/\w\/|embed\/|watch\?v=|&v=)([^#&?]*).*/;
        const match = url.match(regExp);
        return (match && match[2].length === 11) ? match[2] : null;
    };

    const isYouTube = (url: string) => {
        return getYouTubeId(url) !== null;
    };

    // Helper: Convert Google Drive Link to Direct Image Link (Thumbnail Endpoint)
    const convertDriveUrl = (url: string) => {
        if (!url) return '';
        const idMatch = url.match(/\/d\/([a-zA-Z0-9_-]+)/) || url.match(/[?&]id=([a-zA-Z0-9_-]+)/);
        if (idMatch && idMatch[1]) {
            return `https://drive.google.com/thumbnail?id=${idMatch[1]}&sz=w1000`;
        }
        return url;
    };

    return (
        <div className="container mx-auto px-4 py-12 min-h-screen">
             <div className="text-center mb-8">
                <h1 className="text-3xl font-bold text-emerald-800 dark:text-emerald-400 mb-4">Galeri & Album</h1>
                <p className="text-gray-600 dark:text-gray-300 max-w-2xl mx-auto">
                    Dokumentasi kegiatan masjid yang dikelompokkan berdasarkan tema dan momen.
                </p>
             </div>
             
             {loading ? (
                <div className="flex justify-center py-20">
                    <Loader2 className="animate-spin text-emerald-600" size={40} />
                </div>
             ) : (
                <>
                    {/* Tags Navigation (Horizontal Scroll) */}
                    <div className="mb-8 relative group">
                        <div className="flex items-center gap-3 overflow-x-auto pb-4 scrollbar-hide px-2 md:justify-center justify-start">
                            {allTags.map(tag => (
                                <button
                                    key={tag}
                                    onClick={() => setActiveTag(tag)}
                                    className={`flex items-center gap-2 px-5 py-2.5 rounded-full text-sm font-medium whitespace-nowrap transition-all duration-300 transform ${
                                        activeTag === tag
                                        ? 'bg-emerald-600 text-white shadow-lg shadow-emerald-600/30 scale-105'
                                        : 'bg-white dark:bg-gray-800 text-gray-600 dark:text-gray-300 border border-gray-200 dark:border-gray-700 hover:border-emerald-500 hover:text-emerald-600'
                                    }`}
                                >
                                    {tag === 'Semua' ? <FolderHeart size={16} /> : <Tag size={14} />}
                                    {tag}
                                </button>
                            ))}
                        </div>
                        {/* Gradient Fade for scroll indication on mobile */}
                        <div className="absolute right-0 top-0 bottom-4 w-12 bg-gradient-to-l from-gray-50 dark:from-gray-900 to-transparent md:hidden pointer-events-none"></div>
                    </div>

                    {/* Secondary Type Filter (Optional, Small) */}
                    <div className="flex justify-center gap-4 mb-8 text-sm">
                        <button 
                            onClick={() => setFilterType('all')} 
                            className={`${filterType === 'all' ? 'text-emerald-600 font-bold border-b-2 border-emerald-600' : 'text-gray-500'} pb-1 transition-colors`}
                        >
                            Semua Tipe
                        </button>
                        <button 
                            onClick={() => setFilterType('image')} 
                            className={`${filterType === 'image' ? 'text-emerald-600 font-bold border-b-2 border-emerald-600' : 'text-gray-500'} pb-1 transition-colors`}
                        >
                            Foto Saja
                        </button>
                        <button 
                            onClick={() => setFilterType('video')} 
                            className={`${filterType === 'video' ? 'text-emerald-600 font-bold border-b-2 border-emerald-600' : 'text-gray-500'} pb-1 transition-colors`}
                        >
                            Video Saja
                        </button>
                    </div>

                    {/* Gallery Grid */}
                    {filteredItems.length === 0 ? (
                        <div className="text-center py-20 bg-gray-50 dark:bg-gray-800 rounded-2xl border border-dashed border-gray-300 dark:border-gray-700 animate-in fade-in zoom-in duration-300">
                            <ImageIcon className="mx-auto h-12 w-12 text-gray-400" />
                            <h3 className="mt-2 text-sm font-semibold text-gray-900 dark:text-white">Album Kosong</h3>
                            <p className="mt-1 text-sm text-gray-500">Belum ada dokumentasi dengan tag "{activeTag}"</p>
                        </div>
                    ) : (
                        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
                            {visibleItems.map((item, idx) => {
                                const youtubeId = item.type === 'video' ? getYouTubeId(item.url) : null;
                                const displayUrl = item.type === 'image' ? convertDriveUrl(item.url) : item.url;
                                
                                return (
                                    <div 
                                        key={`${item.id}-${idx}`} 
                                        onClick={() => setSelectedItem(item)}
                                        className="group relative rounded-xl overflow-hidden shadow-md hover:shadow-2xl cursor-pointer bg-black h-64 border border-gray-200 dark:border-gray-700 transition-all duration-500 transform hover:-translate-y-2 animate-in fade-in slide-in-from-bottom-4"
                                        style={{ animationDelay: `${idx * 50}ms` }}
                                    >
                                        {/* Media Content */}
                                        {item.type === 'video' ? (
                                            <div className="w-full h-full relative">
                                                {youtubeId ? (
                                                    <img 
                                                        src={`https://img.youtube.com/vi/${youtubeId}/hqdefault.jpg`} 
                                                        alt={item.title} 
                                                        loading="lazy"
                                                        className="w-full h-full object-cover opacity-90 group-hover:opacity-100 group-hover:scale-105 transition-all duration-700"
                                                    />
                                                ) : (
                                                    <div className="w-full h-full bg-gray-900 flex items-center justify-center">
                                                        <video src={item.url} className="w-full h-full object-cover opacity-60" muted />
                                                    </div>
                                                )}
                                                
                                                <div className="absolute inset-0 flex items-center justify-center">
                                                    <div className={`w-14 h-14 ${youtubeId ? 'bg-red-600' : 'bg-emerald-600/90'} rounded-full flex items-center justify-center shadow-xl group-hover:scale-110 transition-transform`}>
                                                        {youtubeId ? <Youtube fill="white" className="text-white" size={28} /> : <Play fill="white" className="text-white ml-1" size={28} />}
                                                    </div>
                                                </div>
                                            </div>
                                        ) : (
                                            <img 
                                                src={displayUrl} 
                                                alt={item.title} 
                                                loading="lazy"
                                                className="w-full h-full object-cover opacity-90 group-hover:opacity-100 group-hover:scale-105 transition-all duration-700"
                                                onError={(e) => {
                                                    (e.target as HTMLImageElement).src = 'https://via.placeholder.com/400x300?text=Gagal+Muat+Gambar';
                                                }}
                                            />
                                        )}
                                        
                                        {/* Info Overlay */}
                                        <div className="absolute bottom-0 left-0 right-0 bg-gradient-to-t from-black/95 via-black/70 to-transparent p-5 transform translate-y-4 group-hover:translate-y-0 transition-transform duration-300">
                                            <p className="text-white font-semibold line-clamp-1 text-lg">{item.title}</p>
                                            
                                            <div className="flex flex-wrap items-center gap-2 mt-2 opacity-0 group-hover:opacity-100 transition-opacity duration-300 delay-100">
                                                <div className="flex items-center gap-1 text-xs text-emerald-300 bg-emerald-900/50 px-2 py-1 rounded-md border border-emerald-500/30">
                                                    {item.type === 'video' ? <VideoIcon size={12}/> : <ImageIcon size={12}/>}
                                                    <span className="capitalize">{item.type}</span>
                                                </div>
                                                
                                                {/* Display Tags */}
                                                {item.tags && item.tags.slice(0, 2).map((tag, tIdx) => (
                                                    <span key={tIdx} className="text-[10px] text-gray-200 bg-white/20 px-2 py-1 rounded-md backdrop-blur-sm">
                                                        #{tag}
                                                    </span>
                                                ))}
                                                {item.tags && item.tags.length > 2 && (
                                                    <span className="text-[10px] text-gray-300">+{item.tags.length - 2}</span>
                                                )}
                                            </div>
                                        </div>
                                    </div>
                                );
                            })}
                        </div>
                    )}

                    {/* Load More Button */}
                    {visibleCount < filteredItems.length && (
                        <div className="mt-12 text-center">
                            <button 
                                onClick={handleLoadMore}
                                className="inline-flex items-center gap-2 px-8 py-3 bg-white dark:bg-gray-800 text-emerald-600 dark:text-emerald-400 font-bold rounded-full border border-emerald-200 dark:border-emerald-800 hover:bg-emerald-50 dark:hover:bg-gray-700 transition-all shadow-sm hover:shadow-lg transform hover:-translate-y-1"
                            >
                                <ChevronDown size={20} />
                                Lihat Dokumentasi Lainnya ({filteredItems.length - visibleCount})
                            </button>
                        </div>
                    )}
                </>
             )}

             {/* Lightbox Modal */}
             {selectedItem && (
                 <div 
                    className="fixed inset-0 z-[60] flex items-center justify-center p-4 bg-black/95 backdrop-blur-md animate-in fade-in duration-300" 
                    onClick={() => setSelectedItem(null)}
                 >
                     <button 
                        className="absolute top-4 right-4 z-10 p-2 text-white/70 hover:text-white hover:bg-white/10 rounded-full transition-colors"
                        onClick={() => setSelectedItem(null)}
                     >
                         <X size={32} />
                     </button>
                     
                     <div 
                        className="relative max-w-5xl w-full max-h-[90vh] flex flex-col items-center justify-center" 
                        onClick={e => e.stopPropagation()}
                     >
                         {selectedItem.type === 'video' ? (
                             <div className="w-full aspect-video bg-black rounded-xl overflow-hidden shadow-2xl border border-gray-800 relative">
                                {isYouTube(selectedItem.url) ? (
                                    <iframe
                                        className="w-full h-full"
                                        src={`https://www.youtube.com/embed/${getYouTubeId(selectedItem.url)}?autoplay=1&rel=0`}
                                        title={selectedItem.title}
                                        allow="accelerometer; autoplay; clipboard-write; encrypted-media; gyroscope; picture-in-picture"
                                        allowFullScreen
                                    ></iframe>
                                ) : (
                                    <video 
                                        src={selectedItem.url} 
                                        controls 
                                        autoPlay 
                                        className="w-full h-full"
                                    >
                                        Browser Anda tidak mendukung tag video.
                                    </video>
                                )}
                             </div>
                         ) : (
                             <img 
                                 src={convertDriveUrl(selectedItem.url)} 
                                 alt={selectedItem.title} 
                                 className="max-w-full max-h-[80vh] rounded-xl shadow-2xl object-contain border border-gray-800"
                             />
                         )}
                         <div className="mt-6 text-center text-white">
                             <h3 className="text-xl font-bold mb-2">{selectedItem.title}</h3>
                             <div className="flex justify-center gap-2">
                                {selectedItem.tags?.map(tag => (
                                    <span key={tag} className="px-3 py-1 bg-white/20 rounded-full text-xs backdrop-blur-sm">
                                        #{tag}
                                    </span>
                                ))}
                             </div>
                         </div>
                     </div>
                 </div>
             )}
        </div>
    );
};