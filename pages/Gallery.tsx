import React, { useEffect, useState } from 'react';
import { Play, Loader2, X, Youtube } from 'lucide-react';
import { api } from '../services/api';
import { MediaItem } from '../types';

export const Gallery: React.FC = () => {
    const [items, setItems] = useState<MediaItem[]>([]);
    const [loading, setLoading] = useState(true);
    const [selectedItem, setSelectedItem] = useState<MediaItem | null>(null);

    useEffect(() => {
        const loadGallery = async () => {
            setLoading(true);
            const data = await api.getGallery();
            setItems(data);
            setLoading(false);
        };
        loadGallery();
    }, []);

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

    // Helper: Convert Google Drive Link to Direct Image Link
    const convertDriveUrl = (url: string) => {
        if (!url) return '';
        // Cek pola: drive.google.com/file/d/{ID}/view atau id={ID}
        const driveMatch = url.match(/\/d\/([a-zA-Z0-9_-]+)|\?id=([a-zA-Z0-9_-]+)/);
        
        if (driveMatch) {
            const id = driveMatch[1] || driveMatch[2];
            // Menggunakan endpoint export=view untuk direct image
            return `https://drive.google.com/uc?export=view&id=${id}`;
        }
        return url;
    };

    return (
        <div className="container mx-auto px-4 py-12">
             <h1 className="text-3xl font-bold text-emerald-800 dark:text-emerald-400 mb-8 text-center">Galeri Foto & Video</h1>
             
             {loading ? (
                <div className="flex justify-center py-20">
                    <Loader2 className="animate-spin text-emerald-600" size={40} />
                </div>
             ) : (
                <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
                    {items.map((item, idx) => {
                        const youtubeId = item.type === 'video' ? getYouTubeId(item.url) : null;
                        // Proses URL: Jika image, coba convert Drive URL. Jika video, biarkan (kecuali thumbnail logic YouTube).
                        const displayUrl = item.type === 'image' ? convertDriveUrl(item.url) : item.url;
                        
                        return (
                            <div 
                                key={idx} 
                                onClick={() => setSelectedItem(item)}
                                className="group relative rounded-xl overflow-hidden shadow-lg cursor-pointer bg-black h-64 border border-gray-200 dark:border-gray-700"
                            >
                                {/* Thumbnail rendering */}
                                {item.type === 'video' ? (
                                    <div className="w-full h-full relative">
                                        {youtubeId ? (
                                            // YouTube Thumbnail
                                            <img 
                                                src={`https://img.youtube.com/vi/${youtubeId}/hqdefault.jpg`} 
                                                alt={item.title} 
                                                className="w-full h-full object-cover opacity-90 group-hover:opacity-100 group-hover:scale-105 transition-all duration-500"
                                            />
                                        ) : (
                                            // MP4 / Raw Video Fallback
                                            <div className="w-full h-full bg-gray-900 flex items-center justify-center">
                                                <video src={item.url} className="w-full h-full object-cover opacity-60" muted />
                                            </div>
                                        )}
                                        
                                        {/* Play Overlay */}
                                        <div className="absolute inset-0 flex items-center justify-center">
                                            <div className={`w-14 h-14 ${youtubeId ? 'bg-red-600' : 'bg-emerald-600/90'} rounded-full flex items-center justify-center shadow-xl group-hover:scale-110 transition-transform`}>
                                                {youtubeId ? <Youtube fill="white" className="text-white" size={28} /> : <Play fill="white" className="text-white ml-1" size={28} />}
                                            </div>
                                        </div>
                                    </div>
                                ) : (
                                    // Image (Supports Google Drive conversion)
                                    <img 
                                        src={displayUrl} 
                                        alt={item.title} 
                                        className="w-full h-full object-cover opacity-90 group-hover:opacity-100 group-hover:scale-105 transition-all duration-500"
                                        onError={(e) => {
                                            // Fallback jika gambar drive gagal load (misal permission restricted)
                                            (e.target as HTMLImageElement).src = 'https://via.placeholder.com/400x300?text=Gagal+Muat+Gambar';
                                        }}
                                    />
                                )}
                                
                                <div className="absolute bottom-0 left-0 right-0 bg-gradient-to-t from-black/90 via-black/50 to-transparent p-4 transform translate-y-2 group-hover:translate-y-0 transition-transform">
                                    <p className="text-white font-medium line-clamp-1">{item.title}</p>
                                    <p className="text-xs text-gray-300 capitalize flex items-center gap-1">
                                        {item.type} 
                                        {youtubeId && <span className="text-[10px] bg-red-600 px-1 rounded text-white font-bold ml-1">YouTube</span>}
                                    </p>
                                </div>
                            </div>
                        );
                    })}
                </div>
             )}

             {/* Lightbox Modal */}
             {selectedItem && (
                 <div 
                    className="fixed inset-0 z-[60] flex items-center justify-center p-4 bg-black/95 backdrop-blur-sm animate-in fade-in duration-200" 
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
                             <div className="w-full aspect-video bg-black rounded-lg overflow-hidden shadow-2xl border border-gray-800 relative">
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
                                 className="max-w-full max-h-[80vh] rounded-lg shadow-2xl object-contain border border-gray-800"
                             />
                         )}
                         <div className="mt-6 text-center">
                             <h3 className="text-xl font-medium text-white">{selectedItem.title}</h3>
                         </div>
                     </div>
                 </div>
             )}
        </div>
    );
};