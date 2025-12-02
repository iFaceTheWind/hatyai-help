'use client';

import { useState } from 'react';
import { supabase } from '@/lib/supabase';
import { useLanguage } from '@/contexts/LanguageContext';
import { X, Mail, Loader2, CheckCircle, KeyRound } from 'lucide-react';

interface AuthModalProps {
  onClose: () => void;
}

export default function AuthModal({ onClose }: AuthModalProps) {
  const { t } = useLanguage();
  const [email, setEmail] = useState('');
  const [otp, setOtp] = useState('');
  const [loading, setLoading] = useState(false);
  const [sent, setSent] = useState(false);
  const [error, setError] = useState<string | null>(null);

  const handleLogin = async (e: React.FormEvent) => {
    e.preventDefault();
    setLoading(true);
    setError(null);

    try {
      const { error } = await supabase.auth.signInWithOtp({
        email,
        options: {
          emailRedirectTo: window.location.origin,
        },
      });

      if (error) throw error;
      setSent(true);
    } catch (err: any) {
      setError(err.message || 'Error sending login link');
    } finally {
      setLoading(false);
    }
  };

  const handleVerifyOtp = async (e: React.FormEvent) => {
    e.preventDefault();
    setLoading(true);
    setError(null);

    try {
      const { error } = await supabase.auth.verifyOtp({
        email,
        token: otp,
        type: 'email',
      });

      if (error) throw error;
      onClose(); // Close modal on success
    } catch (err: any) {
      setError(err.message || 'Invalid code');
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="fixed inset-0 z-50 bg-black/50 flex items-center justify-center p-4 animate-in fade-in duration-200">
      <div className="bg-white rounded-2xl shadow-xl max-w-sm w-full p-6 relative">
        <button 
          onClick={onClose}
          className="absolute top-4 right-4 p-2 hover:bg-gray-100 rounded-full text-gray-500"
        >
          <X className="w-5 h-5" />
        </button>

        <h2 className="text-xl font-bold mb-2 text-center text-gray-900">
          {t.auth.login_title}
        </h2>
        <p className="text-gray-500 text-center mb-6 text-sm">
          {t.auth.login_desc}
        </p>

        {sent ? (
          <div className="text-center py-4">
            <CheckCircle className="w-12 h-12 text-green-500 mx-auto mb-3" />
            <h3 className="font-bold text-lg text-gray-900">Check your email</h3>
            <p className="text-gray-600 mt-2 mb-6">We sent a magic link to <b>{email}</b></p>
            
            <div className="text-left bg-gray-50 p-4 rounded-xl mb-6">
              <p className="text-sm text-gray-600 mb-3 font-medium">Link opening in Gmail/Line?</p>
              <p className="text-xs text-gray-500 mb-3">
                If the link opens in a different app, copy the 6-digit code from the email and paste it below to stay logged in here.
              </p>
              
              <form onSubmit={handleVerifyOtp} className="space-y-3">
                <div className="relative">
                  <KeyRound className="w-4 h-4 text-gray-400 absolute left-3 top-3" />
                  <input 
                    type="text" 
                    value={otp}
                    onChange={(e) => setOtp(e.target.value.trim())}
                    className="w-full border border-gray-300 rounded-lg pl-9 pr-4 py-2 text-sm outline-none focus:border-blue-500 text-gray-900"
                    placeholder="Enter 6-digit code"
                  />
                </div>
                <button 
                  type="submit" 
                  disabled={loading || otp.length < 6}
                  className="w-full py-2 bg-blue-600 text-white rounded-lg font-bold text-sm hover:bg-blue-700 disabled:opacity-50 disabled:cursor-not-allowed"
                >
                  {loading ? <Loader2 className="w-4 h-4 animate-spin mx-auto" /> : 'Verify Code'}
                </button>
              </form>
            </div>

            <button 
              onClick={onClose}
              className="w-full py-3 bg-gray-100 text-gray-800 rounded-xl font-semibold"
            >
              Close
            </button>
          </div>
        ) : (
          <form onSubmit={handleLogin} className="space-y-4">
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-1">Email Address</label>
              <div className="relative">
                <Mail className="w-5 h-5 text-gray-400 absolute left-3 top-3.5" />
                <input 
                  type="email" 
                  value={email}
                  onChange={(e) => setEmail(e.target.value)}
                  className="w-full border-2 border-gray-200 rounded-xl pl-10 pr-4 py-3 outline-none focus:border-blue-500 text-gray-900"
                  placeholder="name@example.com"
                  required
                />
              </div>
            </div>

            {error && (
              <p className="text-red-500 text-sm bg-red-50 p-2 rounded-lg text-center">
                {error}
              </p>
            )}

            <button 
              type="submit" 
              disabled={loading}
              className="w-full py-3 bg-blue-600 text-white rounded-xl font-bold shadow-lg hover:bg-blue-700 flex items-center justify-center gap-2 disabled:opacity-50 disabled:cursor-not-allowed"
            >
              {loading ? <Loader2 className="w-5 h-5 animate-spin" /> : t.auth.send_link}
            </button>
          </form>
        )}
      </div>
    </div>
  );
}
