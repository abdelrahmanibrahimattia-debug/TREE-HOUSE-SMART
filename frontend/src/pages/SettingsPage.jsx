import React, { useState, useEffect } from 'react';
import { apiGet, apiPut } from '../utils/api.js';
import { useAuth } from '../context/AuthContext.jsx';
import TreeHouseLogo from '../components/TreeHouseLogo.jsx';
import {
  Settings,
  User,
  Building,
  ShieldCheck,
  Key,
  Phone,
  Mail,
  Save,
  CheckCircle,
  Database,
  Lock,
  Cpu
} from 'lucide-react';

export default function SettingsPage() {
  const { user } = useAuth();
  const [activeTab, setActiveTab] = useState('profile'); // 'profile' | 'company' | 'system'
  const [loading, setLoading] = useState(true);
  const [saving, setSaving] = useState(false);

  // Profile Form
  const [profileData, setProfileData] = useState({
    phone: '',
    currentPassword: '',
    newPassword: '',
    confirmPassword: ''
  });

  // Company Form
  const [companyData, setCompanyData] = useState({
    companyName: 'System Tree House',
    slogan: 'SMART BY NATURE - حلول المطابخ والدريسنج والفرش الكامل',
    phone: '01000000000',
    secondaryPhone: '01100000000',
    address: 'القاهرة، جمهورية مصر العربية',
    taxNumber: '123-456-789',
    commercialRegister: '987654',
    version: '2.5.0 Enterprise'
  });

  const [message, setMessage] = useState({ text: '', type: '' });

  const fetchData = async () => {
    setLoading(true);
    try {
      const [profRes, compRes] = await Promise.all([
        apiGet('/settings/profile'),
        apiGet('/settings/company')
      ]);
      if (profRes.ok && profRes.data) {
        setProfileData(prev => ({ ...prev, phone: profRes.data.phone || '' }));
      }
      if (compRes.ok && compRes.data) {
        setCompanyData(compRes.data);
      }
    } catch (e) {
      console.error(e);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchData();
  }, []);

  const handleSaveProfile = async (e) => {
    e.preventDefault();
    if (profileData.newPassword && profileData.newPassword !== profileData.confirmPassword) {
      setMessage({ text: 'كلمة المرور الجديدة غير متطابقة مع تأكيد كلمة المرور.', type: 'error' });
      return;
    }

    setSaving(true);
    setMessage({ text: '', type: '' });

    const res = await apiPut('/settings/profile', {
      phone: profileData.phone,
      currentPassword: profileData.currentPassword,
      newPassword: profileData.newPassword
    });

    setSaving(false);
    if (res.ok) {
      setMessage({ text: 'تم تحديث البيانات الشخصية وكلمة المرور بنجاح.', type: 'success' });
      setProfileData(prev => ({ ...prev, currentPassword: '', newPassword: '', confirmPassword: '' }));
    } else {
      setMessage({ text: res.error || 'تعذر تحديث البيانات', type: 'error' });
    }
  };

  const handleSaveCompany = async (e) => {
    e.preventDefault();
    setSaving(true);
    setMessage({ text: '', type: '' });

    const res = await apiPut('/settings/company', companyData);
    setSaving(false);
    if (res.ok) {
      setMessage({ text: 'تم تحديث بيانات وبراندينج المؤسسة بنجاح.', type: 'success' });
    } else {
      setMessage({ text: res.error || 'تعذر حفظ بيانات المؤسسة', type: 'error' });
    }
  };

  return (
    <div className="space-y-6">
      {/* Header */}
      <div className="flex flex-col sm:flex-row items-start sm:items-center justify-between gap-4 bg-white p-5 rounded-2xl border border-slate-200/80 shadow-sm">
        <div>
          <div className="flex items-center gap-2">
            <span className="p-2 bg-slate-100 text-slate-800 rounded-xl">
              <Settings size={22} />
            </span>
            <h1 className="text-xl font-black text-slate-800">إعدادات الحساب والنظام</h1>
          </div>
          <p className="text-xs text-slate-500 mt-1">
            إدارة الملف الشخصي، كلمة المرور، هوية وبراندينج Tree House، ومؤشرات الأمان السيبراني.
          </p>
        </div>
      </div>

      {/* Tabs */}
      <div className="flex items-center gap-2 bg-white p-2 rounded-2xl border border-slate-200/80 shadow-sm w-fit">
        <button
          onClick={() => { setActiveTab('profile'); setMessage({ text: '', type: '' }); }}
          className={`flex items-center gap-2 px-4 py-2 rounded-xl text-xs font-bold transition-all ${
            activeTab === 'profile'
              ? 'bg-slate-800 text-white shadow-sm'
              : 'text-slate-600 hover:bg-slate-100'
          }`}
        >
          <User size={15} />
          الملف الشخصي وكلمة المرور
        </button>

        <button
          onClick={() => { setActiveTab('company'); setMessage({ text: '', type: '' }); }}
          className={`flex items-center gap-2 px-4 py-2 rounded-xl text-xs font-bold transition-all ${
            activeTab === 'company'
              ? 'bg-tree-green text-white shadow-sm'
              : 'text-slate-600 hover:bg-slate-100'
          }`}
        >
          <Building size={15} />
          بيانات وهوية Tree House
        </button>

        <button
          onClick={() => { setActiveTab('system'); setMessage({ text: '', type: '' }); }}
          className={`flex items-center gap-2 px-4 py-2 rounded-xl text-xs font-bold transition-all ${
            activeTab === 'system'
              ? 'bg-indigo-700 text-white shadow-sm'
              : 'text-slate-600 hover:bg-slate-100'
          }`}
        >
          <ShieldCheck size={15} />
          مؤشرات الأمان والنظام
        </button>
      </div>

      {/* Notification Banner */}
      {message.text && (
        <div className={`p-4 rounded-xl text-xs font-bold border flex items-center gap-2 ${
          message.type === 'success'
            ? 'bg-emerald-50 text-emerald-800 border-emerald-200'
            : 'bg-red-50 text-red-800 border-red-200'
        }`}>
          {message.type === 'success' ? <CheckCircle size={16} /> : <Lock size={16} />}
          {message.text}
        </div>
      )}

      {/* Profile Settings */}
      {activeTab === 'profile' && (
        <div className="bg-white p-6 rounded-2xl border border-slate-200/80 shadow-sm max-w-2xl">
          <h2 className="text-sm font-bold text-slate-800 mb-4 pb-2 border-b border-slate-100">
            بيانات حساب المستخدم
          </h2>

          <form onSubmit={handleSaveProfile} className="space-y-4 text-xs">
            <div className="grid grid-cols-2 gap-4">
              <div>
                <label className="block text-slate-400 font-bold mb-1">كود الموظف (محمي)</label>
                <input
                  type="text"
                  value={user?.code || ''}
                  disabled
                  className="w-full p-2.5 bg-slate-50 border border-slate-200 rounded-xl font-mono text-slate-500 font-bold"
                />
              </div>
              <div>
                <label className="block text-slate-400 font-bold mb-1">الاسم الكامل (محمي)</label>
                <input
                  type="text"
                  value={user?.name || ''}
                  disabled
                  className="w-full p-2.5 bg-slate-50 border border-slate-200 rounded-xl text-slate-500 font-bold"
                />
              </div>
            </div>

            <div className="grid grid-cols-2 gap-4">
              <div>
                <label className="block text-slate-400 font-bold mb-1">البريد الإلكتروني (محمي)</label>
                <input
                  type="email"
                  value={user?.email || ''}
                  disabled
                  className="w-full p-2.5 bg-slate-50 border border-slate-200 rounded-xl text-slate-500 font-mono"
                />
              </div>
              <div>
                <label className="block text-slate-400 font-bold mb-1">الصلاحية الإدارية</label>
                <input
                  type="text"
                  value={user?.role || ''}
                  disabled
                  className="w-full p-2.5 bg-slate-50 border border-slate-200 rounded-xl text-tree-green font-bold"
                />
              </div>
            </div>

            <div>
              <label className="block text-slate-700 font-bold mb-1">رقم الهاتف الشخصي</label>
              <input
                type="tel"
                value={profileData.phone}
                onChange={(e) => setProfileData({ ...profileData, phone: e.target.value })}
                className="w-full p-2.5 border border-slate-200 rounded-xl focus:outline-none focus:border-slate-800"
              />
            </div>

            <div className="pt-4 border-t border-slate-100 space-y-3">
              <h3 className="font-bold text-slate-800 flex items-center gap-2">
                <Key size={15} />
                تغيير كلمة المرور
              </h3>

              <div>
                <label className="block text-slate-600 font-bold mb-1">كلمة المرور الحالية</label>
                <input
                  type="password"
                  placeholder="أدخل كلمة المرور الحالية للتأكيد"
                  value={profileData.currentPassword}
                  onChange={(e) => setProfileData({ ...profileData, currentPassword: e.target.value })}
                  className="w-full p-2.5 border border-slate-200 rounded-xl focus:outline-none focus:border-slate-800"
                />
              </div>

              <div className="grid grid-cols-2 gap-4">
                <div>
                  <label className="block text-slate-600 font-bold mb-1">كلمة المرور الجديدة</label>
                  <input
                    type="password"
                    placeholder="6 خانات على الأقل"
                    value={profileData.newPassword}
                    onChange={(e) => setProfileData({ ...profileData, newPassword: e.target.value })}
                    className="w-full p-2.5 border border-slate-200 rounded-xl focus:outline-none focus:border-slate-800"
                  />
                </div>
                <div>
                  <label className="block text-slate-600 font-bold mb-1">تأكيد كلمة المرور الجديدة</label>
                  <input
                    type="password"
                    placeholder="أعد كتابة كلمة المرور"
                    value={profileData.confirmPassword}
                    onChange={(e) => setProfileData({ ...profileData, confirmPassword: e.target.value })}
                    className="w-full p-2.5 border border-slate-200 rounded-xl focus:outline-none focus:border-slate-800"
                  />
                </div>
              </div>
            </div>

            <div className="pt-3">
              <button
                type="submit"
                disabled={saving}
                className="flex items-center gap-2 bg-slate-800 hover:bg-slate-900 text-white px-5 py-2.5 rounded-xl font-bold shadow-sm transition disabled:opacity-50"
              >
                <Save size={15} />
                {saving ? 'جاري الحفظ...' : 'حفظ التعديلات'}
              </button>
            </div>
          </form>
        </div>
      )}

      {/* Company Branding Settings */}
      {activeTab === 'company' && (
        <div className="bg-white p-6 rounded-2xl border border-slate-200/80 shadow-sm max-w-3xl">
          <div className="flex items-center gap-4 p-4 bg-slate-50 rounded-2xl mb-6 border border-slate-100">
            <TreeHouseLogo size={60} />
            <div>
              <div className="text-base font-black text-tree-brown font-serif">TREE HOUSE</div>
              <div className="text-[11px] font-bold text-tree-green tracking-wider uppercase">SMART BY NATURE</div>
              <div className="text-[11px] text-slate-400 mt-1">
                الهوية البصرية المعتمدة - بصيغة SVG فائقة الدقة.
              </div>
            </div>
          </div>

          <form onSubmit={handleSaveCompany} className="space-y-4 text-xs">
            <div className="grid grid-cols-2 gap-4">
              <div>
                <label className="block text-slate-700 font-bold mb-1">اسم المؤسسة التجاري</label>
                <input
                  type="text"
                  value={companyData.companyName}
                  onChange={(e) => setCompanyData({ ...companyData, companyName: e.target.value })}
                  className="w-full p-2.5 border border-slate-200 rounded-xl focus:outline-none focus:border-tree-green font-bold text-tree-brown"
                />
              </div>
              <div>
                <label className="block text-slate-700 font-bold mb-1">الشعار اللفظي (Slogan)</label>
                <input
                  type="text"
                  value={companyData.slogan}
                  onChange={(e) => setCompanyData({ ...companyData, slogan: e.target.value })}
                  className="w-full p-2.5 border border-slate-200 rounded-xl focus:outline-none focus:border-tree-green"
                />
              </div>
            </div>

            <div className="grid grid-cols-2 gap-4">
              <div>
                <label className="block text-slate-700 font-bold mb-1">هاتف الفرع الرئيسي</label>
                <input
                  type="text"
                  value={companyData.phone}
                  onChange={(e) => setCompanyData({ ...companyData, phone: e.target.value })}
                  className="w-full p-2.5 border border-slate-200 rounded-xl focus:outline-none focus:border-tree-green font-mono"
                />
              </div>
              <div>
                <label className="block text-slate-700 font-bold mb-1">هاتف خدمة العملاء والمبيعات</label>
                <input
                  type="text"
                  value={companyData.secondaryPhone}
                  onChange={(e) => setCompanyData({ ...companyData, secondaryPhone: e.target.value })}
                  className="w-full p-2.5 border border-slate-200 rounded-xl focus:outline-none focus:border-tree-green font-mono"
                />
              </div>
            </div>

            <div className="grid grid-cols-2 gap-4">
              <div>
                <label className="block text-slate-700 font-bold mb-1">السجل التجاري</label>
                <input
                  type="text"
                  value={companyData.commercialRegister}
                  onChange={(e) => setCompanyData({ ...companyData, commercialRegister: e.target.value })}
                  className="w-full p-2.5 border border-slate-200 rounded-xl focus:outline-none focus:border-tree-green font-mono"
                />
              </div>
              <div>
                <label className="block text-slate-700 font-bold mb-1">البطاقة الضريبية</label>
                <input
                  type="text"
                  value={companyData.taxNumber}
                  onChange={(e) => setCompanyData({ ...companyData, taxNumber: e.target.value })}
                  className="w-full p-2.5 border border-slate-200 rounded-xl focus:outline-none focus:border-tree-green font-mono"
                />
              </div>
            </div>

            <div>
              <label className="block text-slate-700 font-bold mb-1">عنوان المقر والمعرض الرئيسي</label>
              <input
                type="text"
                value={companyData.address}
                onChange={(e) => setCompanyData({ ...companyData, address: e.target.value })}
                className="w-full p-2.5 border border-slate-200 rounded-xl focus:outline-none focus:border-tree-green"
              />
            </div>

            <div className="pt-3">
              <button
                type="submit"
                disabled={saving}
                className="flex items-center gap-2 bg-tree-green hover:bg-emerald-700 text-white px-5 py-2.5 rounded-xl font-bold shadow-sm transition disabled:opacity-50"
              >
                <Save size={15} />
                {saving ? 'جاري الحفظ...' : 'حفظ بيانات الشركة'}
              </button>
            </div>
          </form>
        </div>
      )}

      {/* System Security & Architecture */}
      {activeTab === 'system' && (
        <div className="bg-white p-6 rounded-2xl border border-slate-200/80 shadow-sm max-w-3xl space-y-4 text-xs">
          <h2 className="text-sm font-bold text-slate-800 pb-2 border-b border-slate-100 flex items-center gap-2">
            <ShieldCheck className="text-tree-green" size={18} />
            الحالة الأمنية والمعمارية لمنظومة Tree House
          </h2>

          <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
            <div className="p-4 bg-slate-50 rounded-xl border border-slate-200/80">
              <div className="font-bold text-slate-800 mb-1 flex items-center gap-2">
                <Database size={16} className="text-indigo-600" />
                قاعدة البيانات والمحرك (Database Engine)
              </div>
              <p className="text-slate-500 leading-relaxed">
                Prisma ORM مع دعم SQLite محلي بدون إعدادات، وجاهز للربط الفوري مع PostgreSQL عند الرفع السحابي.
              </p>
            </div>

            <div className="p-4 bg-slate-50 rounded-xl border border-slate-200/80">
              <div className="font-bold text-slate-800 mb-1 flex items-center gap-2">
                <ShieldCheck size={16} className="text-emerald-600" />
                معايير الأمان السيبراني (Cybersecurity)
              </div>
              <p className="text-slate-500 leading-relaxed">
                تشفير كلمات المرور بـ Bcrypt (Cost 12)، مصادقة JWT، حماية الرؤوس بـ Helmet، ومحدد معدل الطلبات (Rate Limiting).
              </p>
            </div>

            <div className="p-4 bg-slate-50 rounded-xl border border-slate-200/80">
              <div className="font-bold text-slate-800 mb-1 flex items-center gap-2">
                <Lock size={16} className="text-red-600" />
                التحكم بالصلاحيات (Deny-by-Default RBAC)
              </div>
              <p className="text-slate-500 leading-relaxed">
                مبدأ الحظر الافتراضي: لا يمكن لأي مستخدم مشاهدة أو تعديل أي شاشة إلا بتصريح كتابي مباشر من لوحة الأونر.
              </p>
            </div>

            <div className="p-4 bg-slate-50 rounded-xl border border-slate-200/80">
              <div className="font-bold text-slate-800 mb-1 flex items-center gap-2">
                <Cpu size={16} className="text-purple-600" />
                دورة حياة "الفرش كامل"
              </div>
              <p className="text-slate-500 leading-relaxed">
                مدعوم كخيار رئيسي أول في: العملاء، المعاينات، المقابلات، التصميمات، المقايسات، العقود، وأوامر الشغل.
              </p>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}
