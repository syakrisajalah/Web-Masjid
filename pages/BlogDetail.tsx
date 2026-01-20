import React, { useEffect, useState } from 'react';
import { useParams, Link } from 'react-router-dom';
import { Post } from '../types';
import { api } from '../services/api';
import { Calendar, User, ArrowLeft, Loader2, Share2 } from 'lucide-react';

export const BlogDetail: React.FC = () => {
    const { id } = useParams<{ id: string }>();
    const [post, setPost] = useState<Post | null>(null);
    const [loading, setLoading] = useState(true);

    useEffect(() => {
        const loadPost = async () => {
            if (!id) return;
            setLoading(true);
            const data = await api.getPostById(id);
            if (data) setPost(data);
            setLoading(false);
        };
        loadPost();
    }, [id]);

    if (loading) {
        return (
            <div className="flex justify-center items-center min-h-[50vh]">
                <Loader2 className="animate-spin text-emerald-600" size={40} />
            </div>
        );
    }

    if (!post) {
        return (
            <div className="container mx-auto px-4 py-12 text-center">
                <h2 className="text-2xl font-bold text-gray-800 dark:text-gray-200">Artikel tidak ditemukan</h2>
                <Link to="/blog" className="mt-4 inline-block text-emerald-600 hover:underline">Kembali ke Daftar Berita</Link>
            </div>
        );
    }

    return (
        <article className="min-h-screen pb-12">
            {/* Hero Header */}
            <div className="relative h-[300px] md:h-[400px] w-full bg-gray-900">
                {post.imageUrl ? (
                    <img src={post.imageUrl} alt={post.title} className="w-full h-full object-cover opacity-60" />
                ) : (
                    <div className="w-full h-full bg-emerald-900 opacity-80" />
                )}
                <div className="absolute inset-0 bg-gradient-to-t from-gray-900 via-transparent to-transparent"></div>
                
                <div className="absolute top-0 left-0 p-4 md:p-8">
                     <Link to="/blog" className="inline-flex items-center gap-2 text-white/80 hover:text-white transition-colors bg-black/20 hover:bg-black/40 px-4 py-2 rounded-full backdrop-blur-sm">
                        <ArrowLeft size={20} /> Kembali
                    </Link>
                </div>

                <div className="absolute bottom-0 left-0 w-full p-4 md:p-8 container mx-auto">
                    <span className={`inline-block px-3 py-1 rounded-full text-xs font-bold mb-3 shadow-sm ${
                        post.category === 'Berita' ? 'bg-blue-600 text-white' :
                        post.category === 'Artikel' ? 'bg-green-600 text-white' :
                        'bg-yellow-500 text-white'
                    }`}>
                        {post.category}
                    </span>
                    <h1 className="text-3xl md:text-5xl font-bold text-white leading-tight mb-4 shadow-black drop-shadow-lg">
                        {post.title}
                    </h1>
                    <div className="flex flex-wrap items-center gap-6 text-gray-200 text-sm md:text-base">
                        <div className="flex items-center gap-2">
                            <Calendar size={18} />
                            {new Date(post.date).toLocaleDateString('id-ID', { weekday: 'long', year: 'numeric', month: 'long', day: 'numeric' })}
                        </div>
                        <div className="flex items-center gap-2">
                            <User size={18} />
                            {post.author}
                        </div>
                    </div>
                </div>
            </div>

            {/* Content Body */}
            <div className="container mx-auto px-4 -mt-6 relative z-10">
                <div className="bg-white dark:bg-gray-800 rounded-xl shadow-xl p-6 md:p-10 max-w-4xl mx-auto border border-gray-100 dark:border-gray-700">
                    <div className="prose dark:prose-invert prose-emerald max-w-none">
                         {/* Render content with whitespace preserved for basic formatting */}
                        <div className="whitespace-pre-wrap leading-relaxed text-gray-700 dark:text-gray-300">
                            {post.content}
                        </div>
                    </div>

                    <div className="mt-10 pt-6 border-t border-gray-100 dark:border-gray-700 flex justify-between items-center">
                        <span className="text-sm text-gray-500 dark:text-gray-400">Bagikan artikel ini:</span>
                        <div className="flex gap-2">
                             <button className="p-2 rounded-full bg-gray-100 dark:bg-gray-700 text-gray-600 dark:text-gray-300 hover:bg-emerald-100 hover:text-emerald-600 transition">
                                <Share2 size={18} />
                             </button>
                        </div>
                    </div>
                </div>
            </div>
        </article>
    );
};
