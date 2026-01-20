import React, { useEffect, useState } from 'react';
import { Post } from '../types';
import { Calendar, User, Loader2, ArrowRight } from 'lucide-react';
import { api } from '../services/api';
import { Link } from 'react-router-dom';

export const BlogList: React.FC = () => {
  const [posts, setPosts] = useState<Post[]>([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    const loadPosts = async () => {
        setLoading(true);
        const data = await api.getPosts();
        setPosts(data);
        setLoading(false);
    };
    loadPosts();
  }, []);

  return (
    <div className="container mx-auto px-4 py-12">
      <div className="flex justify-between items-center mb-8">
        <h1 className="text-3xl font-bold text-emerald-800 dark:text-emerald-400">Berita & Artikel</h1>
        
        <div className="flex gap-2">
            {!loading && <span className="text-sm text-gray-500">Menampilkan {posts.length} postingan</span>}
        </div>
      </div>

      {loading ? (
        <div className="flex justify-center py-20">
            <Loader2 className="animate-spin text-emerald-600" size={40} />
        </div>
      ) : (
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-8">
            {posts.map((post) => (
            <article key={post.id} className="bg-white dark:bg-gray-800 rounded-xl shadow-lg overflow-hidden flex flex-col hover:transform hover:-translate-y-1 transition-all duration-300 border border-gray-100 dark:border-gray-700">
                <Link to={`/blog/${post.id}`} className="block relative group overflow-hidden h-48">
                    {post.imageUrl ? (
                        <img 
                            src={post.imageUrl} 
                            alt={post.title} 
                            className="w-full h-full object-cover transition-transform duration-500 group-hover:scale-105" 
                        />
                    ) : (
                        <div className="w-full h-full bg-emerald-100 dark:bg-emerald-900 flex items-center justify-center">
                            <span className="text-emerald-600 dark:text-emerald-400 font-bold text-xl">{post.category}</span>
                        </div>
                    )}
                    <div className="absolute inset-0 bg-black/0 group-hover:bg-black/10 transition-colors"></div>
                </Link>
                
                <div className="p-6 flex-1 flex flex-col">
                <div className="flex items-center justify-between mb-3">
                    <span className={`text-xs font-bold px-2 py-1 rounded-full ${
                        post.category === 'Berita' ? 'bg-blue-100 text-blue-700' :
                        post.category === 'Artikel' ? 'bg-green-100 text-green-700' :
                        'bg-yellow-100 text-yellow-700'
                    }`}>
                        {post.category}
                    </span>
                    <div className="flex items-center gap-1 text-gray-400 text-xs">
                        <Calendar size={12} />
                        {new Date(post.date).toLocaleDateString('id-ID')}
                    </div>
                </div>
                
                <Link to={`/blog/${post.id}`}>
                    <h3 className="text-xl font-bold text-gray-800 dark:text-white mb-3 hover:text-emerald-600 dark:hover:text-emerald-400 transition-colors cursor-pointer line-clamp-2">
                        {post.title}
                    </h3>
                </Link>
                
                <p className="text-gray-600 dark:text-gray-300 text-sm mb-4 flex-1 line-clamp-3">
                    {post.excerpt}
                </p>
                
                <div className="flex items-center justify-between mt-auto pt-4 border-t border-gray-100 dark:border-gray-700">
                    <div className="flex items-center gap-2">
                        <div className="w-6 h-6 rounded-full bg-gray-200 flex items-center justify-center">
                            <User size={12} className="text-gray-500" />
                        </div>
                        <span className="text-xs text-gray-500 dark:text-gray-400">{post.author}</span>
                    </div>
                    <Link to={`/blog/${post.id}`} className="text-emerald-600 dark:text-emerald-400 text-sm font-semibold flex items-center gap-1 hover:gap-2 transition-all">
                        Baca <ArrowRight size={14} />
                    </Link>
                </div>
                </div>
            </article>
            ))}
        </div>
      )}
    </div>
  );
};
