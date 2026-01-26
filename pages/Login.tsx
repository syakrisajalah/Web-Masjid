import React, { useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { useAuth } from '../contexts';
import { UserRole } from '../types';
import { Lock, Mail, Eye, EyeOff, ArrowRight } from 'lucide-react';
import { api } from '../services/api';

export const Login: React.FC = () => {
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [showPassword, setShowPassword] = useState(false);
  const [error, setError] = useState('');
  const [isLoading, setIsLoading] = useState(false);
  
  const { login } = useAuth();
  const navigate = useNavigate();

  const handleLogin = async (e: React.FormEvent) => {
    e.preventDefault();
    setError('');
    setIsLoading(true);

    try {
        const result = await api.login(email, password);
        
        if (result.success && result.user) {
            login(result.user.role, result.user); // Pass full user object
            navigate(result.user.role === UserRole.ADMIN ? '/admin' : '/');
        } else {
            setError(result.message || 'Login gagal');
        }
    } catch (e) {
        setError('Terjadi kesalahan jaringan.');
    } finally {
        setIsLoading(false);
    }
  };

  const fillCredential = (role: 'admin' | 'jamaah' | 'ustadz') => {
    if (role === 'admin') {
      setEmail('admin@masjid.id');
      setPassword('admin123');
    } else if (role === 'ustadz') {
      setEmail('ustadz@masjid.id');
      setPassword('ustadz123');
    } else {
      setEmail('jamaah@masjid.id');
      setPassword('jamaah123');
    }
    setError('');
  };

  return (
    <div className="min-h-[calc(100vh-64px)] flex items-center justify-center py-12 px-4 sm:px-6 lg:px-8 bg-gray-50 dark:bg-gray-900">
      <div className="max-w-md w-full space-y-8 bg-white dark:bg-gray-800 p-8 rounded-2xl shadow-xl border border-gray-100 dark:border-gray-700">
        <div className="text-center">
          <h2 className="mt-2 text-3xl font-bold text-emerald-800 dark:text-emerald-400">
            Selamat Datang
          </h2>
          <p className="mt-2 text-sm text-gray-600 dark:text-gray-400">
            Silakan masuk ke akun Anda
          </p>
        </div>

        <form className="mt-8 space-y-6" onSubmit={handleLogin}>
          <div className="rounded-md shadow-sm space-y-4">
            <div className="relative">
              <div className="absolute inset-y-0 left-0 pl-3 flex items-center pointer-events-none">
                <Mail size={20} className="text-gray-400" />
              </div>
              <input
                id="email-address"
                name="email"
                type="email"
                required
                value={email}
                onChange={(e) => setEmail(e.target.value)}
                className="appearance-none relative block w-full px-3 py-3 pl-10 border border-gray-300 dark:border-gray-600 placeholder-gray-500 text-gray-900 dark:text-white dark:bg-gray-700 rounded-lg focus:outline-none focus:ring-emerald-500 focus:border-emerald-500 sm:text-sm"
                placeholder="Alamat Email"
              />
            </div>
            <div className="relative">
              <div className="absolute inset-y-0 left-0 pl-3 flex items-center pointer-events-none">
                <Lock size={20} className="text-gray-400" />
              </div>
              <input
                id="password"
                name="password"
                type={showPassword ? "text" : "password"}
                required
                value={password}
                onChange={(e) => setPassword(e.target.value)}
                className="appearance-none relative block w-full px-3 py-3 pl-10 border border-gray-300 dark:border-gray-600 placeholder-gray-500 text-gray-900 dark:text-white dark:bg-gray-700 rounded-lg focus:outline-none focus:ring-emerald-500 focus:border-emerald-500 sm:text-sm"
                placeholder="Kata Sandi"
              />
              <button
                type="button"
                onClick={() => setShowPassword(!showPassword)}
                className="absolute inset-y-0 right-0 pr-3 flex items-center text-gray-400 hover:text-gray-600"
              >
                {showPassword ? <EyeOff size={20} /> : <Eye size={20} />}
              </button>
            </div>
          </div>

          {error && (
            <div className="text-red-500 text-sm text-center bg-red-50 dark:bg-red-900/20 p-2 rounded-lg">
              {error}
            </div>
          )}

          <div>
            <button
              type="submit"
              disabled={isLoading}
              className="group relative w-full flex justify-center py-3 px-4 border border-transparent text-sm font-medium rounded-lg text-white bg-emerald-600 hover:bg-emerald-700 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-emerald-500 disabled:opacity-70 transition-colors"
            >
              {isLoading ? 'Memproses...' : 'Masuk'}
              {!isLoading && <ArrowRight className="ml-2 h-4 w-4 group-hover:translate-x-1 transition-transform" />}
            </button>
          </div>
        </form>

        <div className="mt-6">
          <div className="relative">
            <div className="absolute inset-0 flex items-center">
              <div className="w-full border-t border-gray-300 dark:border-gray-600" />
            </div>
            <div className="relative flex justify-center text-sm">
              <span className="px-2 bg-white dark:bg-gray-800 text-gray-500">
                Akun Demo (Mode Offline)
              </span>
            </div>
          </div>

          <div className="mt-6 grid grid-cols-3 gap-2">
            <button
              onClick={() => fillCredential('admin')}
              className="w-full inline-flex justify-center py-2 px-2 border border-gray-300 dark:border-gray-600 rounded-md shadow-sm bg-white dark:bg-gray-700 text-xs font-medium text-gray-500 dark:text-gray-300 hover:bg-gray-50 dark:hover:bg-gray-600"
            >
              Admin
            </button>
            <button
              onClick={() => fillCredential('ustadz')}
              className="w-full inline-flex justify-center py-2 px-2 border border-blue-300 dark:border-blue-700 rounded-md shadow-sm bg-blue-50 dark:bg-blue-900/30 text-xs font-medium text-blue-600 dark:text-blue-300 hover:bg-blue-100 dark:hover:bg-blue-900/40"
            >
              Ustadz
            </button>
            <button
              onClick={() => fillCredential('jamaah')}
              className="w-full inline-flex justify-center py-2 px-2 border border-gray-300 dark:border-gray-600 rounded-md shadow-sm bg-white dark:bg-gray-700 text-xs font-medium text-gray-500 dark:text-gray-300 hover:bg-gray-50 dark:hover:bg-gray-600"
            >
              Jamaah
            </button>
          </div>
        </div>
      </div>
    </div>
  );
};
