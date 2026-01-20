import React, { useEffect, useState } from 'react';
import { Play, Loader2, X } from 'lucide-react';
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

    return (
        <div className="container mx-auto px-4 py-12">
             <h1 className="text-3xl font-bold text-emerald-800 dark:text-emerald-400 mb-8 text-center">Galeri Foto & Video</h1>
             
             {loading ? (
                <div className="flex justify-center py-20">
                    <Loader2 className="animate-spin text-emerald-600" size={40} />
                </div>
             ) : (
                <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
                    {items.map((item, idx) => (
                        <div 
                            key={idx} 
                            onClick={() => setSelectedItem(item)}
                            className="group relative rounded-xl overflow-hidden shadow-lg cursor-pointer bg-black h-64 border border-gray-200 dark:border-gray-700"
                        >
                            {/* Thumbnail rendering */}
                            {item.type === 'video' ? (
                                <div className="w-full h-full relative">
                                    {/* Video thumbnail fallback or generic video styling */}
                                    <div className="w-full h-full bg-gray-900 flex items-center justify-center">
                                        <video src={item.url} className="w-full h-full object-cover opacity-60" muted />
                                    </div>
                                    <div className="absolute inset-0 flex items-center justify-center">
                                        <div className="w-14 h-14 bg-emerald-600/90 rounded-full flex items-center justify-center shadow-xl group-hover:scale-110 transition-transform">
                                            <Play fill="white" className="text-white ml-1" size={28} />
                                        </div>
                                    </div>
                                </div>
                            ) : (
                                <img 
                                    src={item.url} 
                                    alt={item.title} 
                                    className="w-full h-full object-cover opacity-90 group-hover:opacity-100 group-hover:scale-105 transition-all duration-500"
                                />
                            )}
                            
                            <div className="absolute bottom-0 left-0 right-0 bg-gradient-to-t from-black/90 via-black/50 to-transparent p-4 transform translate-y-2 group-hover:translate-y-0 transition-transform">
                                <p className="text-white font-medium line-clamp-1">{item.title}</p>
                                <p className="text-xs text-gray-300 capitalize">{item.type}</p>
                            </div>
                        </div>
                    ))}
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
                        className="relative max-w-6xl w-full max-h-[90vh] flex flex-col items-center justify-center" 
                        onClick={e => e.stopPropagation()}
                     >
                         {selectedItem.type === 'video' ? (
                             <div className="w-full aspect-video bg-black rounded-lg overflow-hidden shadow-2xl border border-gray-800">
                                <video 
                                    src={selectedItem.url} 
                                    controls 
                                    autoPlay 
                                    className="w-full h-full"
                                >
                                    Browser Anda tidak mendukung tag video.
                                </video>
                             </div>
                         ) : (
                             <img 
                                 src={selectedItem.url} 
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