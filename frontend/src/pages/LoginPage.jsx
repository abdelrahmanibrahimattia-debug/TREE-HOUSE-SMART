import React, { useState } from 'react';
import { useAuth } from '../context/AuthContext.jsx';
import { api } from '../api/client.js';
import TreeHouseLogo from '../components/TreeHouseLogo.jsx';
import { Lock, Mail, ArrowRight, ShieldCheck, AlertCircle } from 'lucide-react';

export default function LoginPage() {
  const { login } = useAuth();
  const [emailOrCode, setEmailOrCode] = useState('');
  const [password, setPassword] = useState('');
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState('');
  const [seedSuccess, setSeedSuccess] = useState('');

  const handleSubmit = async (e) => {
    e.preventDefault();
    setError('');
    setSeedSuccess('');
    setLoading(true);

    try {
      const res = await api.post('/auth/login', { emailOrCode, password });
      if (res?.data?.token && res?.data?.user) {
        login(res.data.user, res.data.token);
      }
    } catch (err) {
      setError(err.message || 'فشل تسجيل الدخول، تأكد من صحة البيانات.');
    } finally {
      setLoading(false);
    }
  };

  const handleSeedOwner = async () => {
    setError('');
    setSeedSuccess('');
    try {
      const res = await api.post('/auth/seed-owner', {});
      setSeedSuccess(res.message || 'تم إنشاء حساب المالك بنجاح!');
      setEmailOrCode('owner@treehouse.com');
      setPassword('Admin@TreeHouse2026');
    } catch (err) {
      setError(err.message || 'حساب المالك موجود بالفعل.');
      setEmailOrCode('owner@treehouse.com');
      setPassword('Admin@TreeHouse2026');
    }
  };

  return (
    <div className="min-h-screen bg-gradient-to-br from-slate-100 via-slate-50 to-emerald-50/40 flex items-center justify-center p-4">
      <div className="w-full max-w-md bg-white rounded-3xl shadow-xl shadow-slate-200/60 border border-slate-100 p-8 sm:p-10 relative overflow-hidden">
        {/* Top Decorative Line */}
        <div className="absolute top-0 inset-x-0 h-2 bg-gradient-to-r from-tree-green via-emerald-500 to-tree-brown" />

        {/* Logo and Welcome */}
        <div className="flex flex-col items-center text-center mb-8">
          <TreeHouseLogo size={80} showText={true} className="flex-col gap-2 mb-3" />
          <h2 className="text-xl font-bold text-slate-800">تسجيل الدخول للنظام</h2>
          <p className="text-xs text-slate-500 mt-1">أدخل بيانات اعتمادك للوصول إلى لوحة التحكم</p>
        </div>

        {error && (
          <div className="mb-5 p-3.5 bg-red-50 border border-red-200 text-red-700 text-xs rounded-xl flex items-center gap-2">
            <AlertCircle size={16} className="shrink-0 text-red-500" />
            <span>{error}</span>
          </div>
        )}

        {seedSuccess && (
          <div className="mb-5 p-3.5 bg-emerald-50 border border-emerald-200 text-emerald-800 text-xs rounded-xl flex items-center gap-2">
            <ShieldCheck size={16} className="shrink-0 text-emerald-600" />
            <span>{seedSuccess}</span>
          </div>
        )}

        <form onSubmit={handleSubmit} className="space-y-4">
          <div>
            <label className="block text-xs font-bold text-slate-700 mb-1.5">
              كود الموظف أو البريد الإلكتروني
            </label>
            <div className="relative">
              <input
                type="text"
                required
                value={emailOrCode}
                onChange={(e) => setEmailOrCode(e.target.value)}
                placeholder="owner@treehouse.com أو OWNER-01"
                className="w-full pl-3 pr-10 py-2.5 bg-slate-50/70 border border-slate-200 rounded-xl text-sm focus:outline-none focus:ring-2 focus:ring-tree-green focus:bg-white transition-all text-left dir-ltr"
              />
              <Mail size={18} className="absolute right-3 top-3 text-slate-400" />
            </div>
          </div>

          <div>
            <label className="block text-xs font-bold text-slate-700 mb-1.5">
              كلمة المرور
            </label>
            <div className="relative">
              <input
                type="password"
                required
                value={password}
                onChange={(e) => setPassword(e.target.value)}
                placeholder="••••••••"
                className="w-full pl-3 pr-10 py-2.5 bg-slate-50/70 border border-slate-200 rounded-xl text-sm focus:outline-none focus:ring-2 focus:ring-tree-green focus:bg-white transition-all text-left dir-ltr"
              />
              <Lock size={18} className="absolute right-3 top-3 text-slate-400" />
            </div>
          </div>

          <button
            type="submit"
            disabled={loading}
            className="w-full py-3 bg-tree-green hover:bg-tree-green-dark text-white font-bold rounded-xl shadow-lg shadow-tree-green/25 flex items-center justify-center gap-2 transition-all disabled:opacity-60 cursor-pointer text-sm"
          >
            {loading ? (
              <span>⏳ جاري التحقق...</span>
            ) : (
              <>
                <span>دخول النظام</span>
                <ArrowRight size={17} />
              </>
            )}
          </button>
        </form>

        {/* Initial setup helper for owner */}
        <div className="mt-6 pt-5 border-t border-slate-100 text-center">
          <button
            type="button"
            onClick={handleSeedOwner}
            className="text-xs text-slate-500 hover:text-tree-green font-medium underline transition-colors"
          >
            🔑 تهيئة أو استرجاع بيانات حساب المالك الأولي
          </button>
        </div>
      </div>
    </div>
  );
}
