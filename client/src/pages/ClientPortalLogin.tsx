/**
 * Client Portal Login Page
 * Piano Emotion Manager
 */

import { useState } from 'react';
import { useLocation, Link } from 'wouter';
import { trpc } from '@/lib/trpc';
import { toast } from 'sonner';
import { LogIn, Mail, Lock } from 'lucide-react';
import { useTranslation } from '@/hooks/use-translation';

export default function ClientPortalLogin() {
  const { t } = useTranslation();
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [, setLocation] = useLocation();

  const loginMutation = trpc.clientPortal.login.useMutation({
    onSuccess: (data) => {
      // Guardar token en localStorage
      localStorage.setItem('clientPortalToken', data.token);
      toast.success(t('clientPortal.welcome'), {
        description: t('clientPortal.loginSuccess'),
      });
      setLocation('/client-portal/dashboard');
    },
    onError: (error) => {
      toast.error(t('clientPortal.loginError'), {
        description: error.message,
      });
    },
  });

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    if (!email || !password) {
      toast.error(t('clientPortal.pleaseCompleteAllFields'));
      return;
    }
    loginMutation.mutate({ email, password });
  };

  return (
    <div className="min-h-screen bg-gradient-to-br from-blue-50 to-indigo-100 flex items-center justify-center p-4">
      <div className="w-full max-w-md">
        {/* Logo/Header */}
        <div className="text-center mb-8">
          <div className="inline-flex items-center justify-center w-16 h-16 bg-[#e07a5f] rounded-full mb-4">
            <LogIn className="w-8 h-8 text-white" />
          </div>
          <h1 className="text-3xl font-bold text-gray-900 mb-2">{t('clientPortal.title')}</h1>
          <p className="text-gray-600">{t('clientPortal.subtitle')}</p>
        </div>

        {/* Login Form */}
        <div className="bg-white rounded-2xl shadow-xl p-8">
          <form onSubmit={handleSubmit} className="space-y-6">
            {/* Email */}
            <div>
              <label htmlFor="email" className="block text-sm font-medium text-gray-700 mb-2">
                {t('clientPortal.email')}
              </label>
              <div className="relative">
                <Mail className="absolute left-3 top-1/2 transform -translate-y-1/2 w-5 h-5 text-gray-400" />
                <input
                  id="email"
                  type="email"
                  value={email}
                  onChange={(e) => setEmail(e.target.value)}
                  className="w-full pl-10 pr-4 py-3 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-[#e07a5f] focus:border-transparent"
                  placeholder={t('clientPortal.emailPlaceholder')}
                  required
                />
              </div>
            </div>

            {/* Password */}
            <div>
              <label htmlFor="password" className="block text-sm font-medium text-gray-700 mb-2">
                {t('clientPortal.password')}
              </label>
              <div className="relative">
                <Lock className="absolute left-3 top-1/2 transform -translate-y-1/2 w-5 h-5 text-gray-400" />
                <input
                  id="password"
                  type="password"
                  value={password}
                  onChange={(e) => setPassword(e.target.value)}
                  className="w-full pl-10 pr-4 py-3 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-[#e07a5f] focus:border-transparent"
                  placeholder="••••••••"
                  required
                />
              </div>
            </div>

            {/* Submit Button */}
            <button
              type="submit"
              disabled={loginMutation.isPending}
              className="w-full bg-[#e07a5f] text-white py-3 rounded-lg font-semibold hover:bg-[#d06a4f] transition-colors disabled:opacity-50 disabled:cursor-not-allowed"
            >
              {loginMutation.isPending ? t('clientPortal.loggingIn') : t('clientPortal.login')}
            </button>
          </form>

          {/* Register Link */}
          <div className="mt-6 text-center">
            <p className="text-sm text-gray-600">
              {t('clientPortal.noAccount')}{' '}
              <Link href="/client-portal/register" className="text-[#e07a5f] font-semibold hover:underline">
                {t('clientPortal.registerHere')}
              </Link>
            </p>
          </div>
        </div>

        {/* Footer */}
        <div className="mt-8 text-center text-sm text-gray-600">
          <p>{t('clientPortal.footer')}</p>
        </div>
      </div>
    </div>
  );
}
