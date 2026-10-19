import React, { useState, useEffect } from 'react';
import { apiGet, apiPost } from '../utils/api.js';
import { CONTRACT_TYPES } from '../utils/contractTypes.js';
import {
  Palette,
  Box,
  Layers,
  Plus,
  Search,
  CheckCircle,
  Clock,
  Sparkles,
  Tv,
  FileCode,
  DollarSign,
  Maximize2
} from 'lucide-react';

export default function DesignsPage() {
  const [designs, setDesigns] = useState([]);
  const [customers, setCustomers] = useState([]);
  const [appliances, setAppliances] = useState([]);
  const [activeSubTab, setActiveSubTab] = useState('designs'); // 'designs' | 'appliances'
  const [loading, setLoading] = useState(true);
  const [showDesignModal, setShowDesignModal] = useState(false);
  const [showApplianceModal, setShowApplianceModal] = useState(false);

  // Design form
  const [designForm, setDesignForm] = useState({
    customerCode: '',
    title: '',
    contractType: 'الفرش كامل',
    fileUrl: '',
    notes: '',
    estimatedCost: ''
  });

  // Appliance form
  const [applianceForm, setApplianceForm] = useState({
    customerCode: '',
    name: 'شفاط بلت إن',
    type: 'Built-in',
    width: 90,
    height: 60,
    depth: 50,
    quantity: 1,
    location: 'المطبخ الرئيسي',
    notes: ''
  });

  const fetchData = async () => {
    setLoading(true);
    try {
      const [dsgnRes, custRes, appRes] = await Promise.all([
        apiGet('/designs?limit=100'),
        apiGet('/customers?limit=100'),
        apiGet('/appliances')
      ]);
      if (dsgnRes.ok) setDesigns(dsgnRes.data || []);
      if (custRes.ok) setCustomers(custRes.data || []);
      if (appRes.ok) setAppliances(appRes.data || []);
    } catch (e) {
      console.error(e);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchData();
  }, []);

  const handleCreateDesign = async (e) => {
    e.preventDefault();
    if (!designForm.customerCode || !designForm.title) {
      alert('يرجى ملء كافة الحقول الإلزامية');
      return;
    }
    const res = await apiPost('/designs', designForm);
    if (res.ok) {
      setShowDesignModal(false);
      setDesignForm({
        customerCode: '',
        title: '',
        contractType: 'الفرش كامل',
        fileUrl: '',
        notes: '',
        estimatedCost: ''
      });
      fetchData();
    } else {
      alert(res.error || 'تعذر حفظ التصميم');
    }
  };

  const handleCreateAppliance = async (e) => {
    e.preventDefault();
    if (!applianceForm.customerCode || !applianceForm.name) {
      alert('يرجى اختيار العميل واسم الجهاز');
      return;
    }
    const res = await apiPost('/appliances', applianceForm);
    if (res.ok) {
      setShowApplianceModal(false);
      setApplianceForm({
        customerCode: '',
        name: 'شفاط بلت إن',
        type: 'Built-in',
        width: 90,
        height: 60,
        depth: 50,
        quantity: 1,
        location: 'المطبخ الرئيسي',
        notes: ''
      });
      fetchData();
    } else {
      alert(res.error || 'تعذر تسجيل الجهاز');
    }
  };

  return (
    <div className="space-y-6">
      {/* Header */}
      <div className="flex flex-col sm:flex-row items-start sm:items-center justify-between gap-4 bg-white p-5 rounded-2xl border border-slate-200/80 shadow-sm">
        <div>
          <div className="flex items-center gap-2">
            <span className="p-2 bg-indigo-50 text-indigo-700 rounded-xl">
              <Palette size={22} />
            </span>
            <h1 className="text-xl font-black text-slate-800">التصميمات المعمارية والأجهزة (3D & Appliances)</h1>
          </div>
          <p className="text-xs text-slate-500 mt-1">
            إدارة تصميمات المطابخ، الدريسنج، والفرش كامل، رفع ملفات SCN، وتوثيق مقاسات ومواصفات الأجهزة الكهربائية.
          </p>
        </div>

        <div className="flex items-center gap-2">
          {activeSubTab === 'designs' ? (
            <button
              onClick={() => setShowDesignModal(true)}
              className="flex items-center gap-2 bg-indigo-700 hover:bg-indigo-800 text-white px-4 py-2.5 rounded-xl font-bold text-xs shadow-sm transition-all"
            >
              <Plus size={16} />
              إضافة تصميم 3D جديد
            </button>
          ) : (
            <button
              onClick={() => setShowApplianceModal(true)}
              className="flex items-center gap-2 bg-emerald-700 hover:bg-emerald-800 text-white px-4 py-2.5 rounded-xl font-bold text-xs shadow-sm transition-all"
            >
              <Plus size={16} />
              تسجيل جهاز كهربائي
            </button>
          )}
        </div>
      </div>

      {/* Sub Tabs */}
      <div className="flex items-center gap-2 bg-white p-2 rounded-2xl border border-slate-200/80 shadow-sm w-fit">
        <button
          onClick={() => setActiveSubTab('designs')}
          className={`flex items-center gap-2 px-4 py-2 rounded-xl text-xs font-bold transition-all ${
            activeSubTab === 'designs'
              ? 'bg-indigo-700 text-white shadow-sm'
              : 'text-slate-600 hover:bg-slate-100'
          }`}
        >
          <Box size={15} />
          التصميمات ثلاثية الأبعاد ({designs.length})
        </button>
        <button
          onClick={() => setActiveSubTab('appliances')}
          className={`flex items-center gap-2 px-4 py-2 rounded-xl text-xs font-bold transition-all ${
            activeSubTab === 'appliances'
              ? 'bg-emerald-700 text-white shadow-sm'
              : 'text-slate-600 hover:bg-slate-100'
          }`}
        >
          <Tv size={15} />
          مطابقة الأجهزة الكهربائية ({appliances.length})
        </button>
      </div>

      {/* Content Section */}
      {activeSubTab === 'designs' ? (
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-5">
          {loading ? (
            <div className="col-span-full p-12 text-center text-slate-400 text-xs font-bold">
              جاري تحميل التصميمات...
            </div>
          ) : designs.length === 0 ? (
            <div className="col-span-full bg-white p-12 rounded-2xl border border-slate-200 text-center text-slate-400 text-xs">
              لا توجد تصميمات مسجلة بعد. اضغط على "إضافة تصميم 3D جديد" للبدء.
            </div>
          ) : (
            designs.map((d) => (
              <div
                key={d.id}
                className="bg-white rounded-2xl border border-slate-200/80 shadow-sm overflow-hidden flex flex-col hover:border-indigo-300 transition-all group"
              >
                <div className="h-40 bg-gradient-to-br from-slate-100 to-indigo-50 relative flex items-center justify-center border-b border-slate-100">
                  {d.fileUrl ? (
                    <img src={d.fileUrl} alt={d.title} className="w-full h-full object-cover" />
                  ) : (
                    <div className="text-center p-4">
                      <FileCode className="text-indigo-400 mx-auto mb-1" size={36} />
                      <span className="text-[11px] font-bold text-indigo-700">ملف تصميم ثلاثي الأبعاد (SCN)</span>
                    </div>
                  )}
                  <span className={`absolute top-3 right-3 px-2.5 py-1 rounded-full text-[10px] font-bold shadow-sm ${
                    d.status === 'معتمد' ? 'bg-green-600 text-white' : 'bg-indigo-600 text-white'
                  }`}>
                    {d.status}
                  </span>
                  <span className="absolute bottom-2 left-2 text-[10px] font-mono bg-white/90 px-2 py-0.5 rounded text-slate-600">
                    {d.code}
                  </span>
                </div>

                <div className="p-4 flex-1 flex flex-col justify-between">
                  <div>
                    <h3 className="font-bold text-slate-800 text-sm mb-1 group-hover:text-indigo-700 transition">
                      {d.title}
                    </h3>
                    <div className="text-xs text-slate-500 mb-2">
                      العميل: <span className="font-bold text-slate-700">{d.customerName}</span> ({d.customerCode})
                    </div>
                    <div className="flex items-center gap-1.5 mb-3">
                      <span className={`inline-flex items-center gap-1 px-2 py-0.5 rounded text-[10px] font-bold ${
                        d.contractType === 'الفرش كامل'
                          ? 'bg-amber-100 text-amber-800 border border-amber-300'
                          : 'bg-indigo-50 text-indigo-800'
                      }`}>
                        <Layers size={10} />
                        {d.contractType}
                      </span>
                      <span className="text-[10px] text-slate-400">المصمم: {d.designer || 'غير محدد'}</span>
                    </div>
                  </div>

                  {d.notes && (
                    <p className="text-[11px] text-slate-500 bg-slate-50 p-2 rounded-xl mb-3 border border-slate-100">
                      {d.notes}
                    </p>
                  )}

                  <div className="pt-2 border-t border-slate-100 flex items-center justify-between text-[11px]">
                    <span className="text-slate-400">الإصدار: Rev-{d.revisionNumber || 1}</span>
                    <button className="text-indigo-700 hover:text-indigo-900 font-bold">
                      عرض التفاصيل
                    </button>
                  </div>
                </div>
              </div>
            ))
          )}
        </div>
      ) : (
        /* Appliances Table */
        <div className="bg-white rounded-2xl border border-slate-200/80 shadow-sm overflow-hidden">
          {appliances.length === 0 ? (
            <div className="p-12 text-center text-slate-400 text-xs">
              لا توجد أجهزة مسجلة حتى الآن.
            </div>
          ) : (
            <div className="overflow-x-auto">
              <table className="w-full text-right text-xs">
                <thead className="bg-slate-50 border-b border-slate-200/80 text-slate-600 font-bold">
                  <tr>
                    <th className="p-3.5">كود العميل</th>
                    <th className="p-3.5">اسم الجهاز</th>
                    <th className="p-3.5">النوع</th>
                    <th className="p-3.5">الأبعاد (عرض × ارتفاع × عمق)</th>
                    <th className="p-3.5">الكمية</th>
                    <th className="p-3.5">الموقع</th>
                    <th className="p-3.5">ملاحظات المطابقة</th>
                  </tr>
                </thead>
                <tbody className="divide-y divide-slate-100">
                  {appliances.map((app) => (
                    <tr key={app.id} className="hover:bg-slate-50 transition-colors">
                      <td className="p-3.5 font-bold font-mono text-indigo-700">{app.customerCode}</td>
                      <td className="p-3.5 font-bold text-slate-800">{app.name}</td>
                      <td className="p-3.5">
                        <span className="px-2 py-0.5 bg-slate-100 text-slate-700 rounded text-[10px] font-bold">
                          {app.type || 'Built-in'}
                        </span>
                      </td>
                      <td className="p-3.5 font-mono text-slate-600">
                        {app.width || '-'} × {app.height || '-'} × {app.depth || '-'} سم
                      </td>
                      <td className="p-3.5 font-bold text-slate-800">{app.quantity}</td>
                      <td className="p-3.5 text-slate-600">{app.location || 'المطبخ'}</td>
                      <td className="p-3.5 text-slate-500">{app.notes || '-'}</td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>
          )}
        </div>
      )}

      {/* Modal: New Design */}
      {showDesignModal && (
        <div className="fixed inset-0 bg-slate-900/60 backdrop-blur-sm z-50 flex items-center justify-center p-4">
          <div className="bg-white rounded-2xl max-w-lg w-full p-6 shadow-2xl border border-slate-100">
            <h3 className="text-base font-black text-slate-800 mb-4 flex items-center gap-2">
              <Palette className="text-indigo-700" size={20} />
              إضافة تصميم ومقترح ثلاثي الأبعاد جديد
            </h3>

            <form onSubmit={handleCreateDesign} className="space-y-4 text-xs">
              <div>
                <label className="block text-slate-600 font-bold mb-1">العميل *</label>
                <select
                  value={designForm.customerCode}
                  onChange={(e) => setDesignForm({ ...designForm, customerCode: e.target.value })}
                  className="w-full p-2.5 border border-slate-200 rounded-xl focus:outline-none focus:border-indigo-600"
                  required
                >
                  <option value="">-- اختر العميل --</option>
                  {customers.map((c) => (
                    <option key={c.id} value={c.code}>
                      {c.name} ({c.code})
                    </option>
                  ))}
                </select>
              </div>

              <div>
                <label className="block text-slate-600 font-bold mb-1">عنوان التصميم *</label>
                <input
                  type="text"
                  placeholder="مثال: مقترح مطبخ أكريليك مودرن + وحدة جزيرة"
                  value={designForm.title}
                  onChange={(e) => setDesignForm({ ...designForm, title: e.target.value })}
                  className="w-full p-2.5 border border-slate-200 rounded-xl focus:outline-none focus:border-indigo-600"
                  required
                />
              </div>

              <div className="grid grid-cols-2 gap-3">
                <div>
                  <label className="block text-slate-600 font-bold mb-1">نوع التعاقد *</label>
                  <select
                    value={designForm.contractType}
                    onChange={(e) => setDesignForm({ ...designForm, contractType: e.target.value })}
                    className="w-full p-2.5 border border-slate-200 rounded-xl focus:outline-none focus:border-indigo-600 font-bold text-indigo-700"
                  >
                    {CONTRACT_TYPES.map((t) => (
                      <option key={t.id} value={t.title}>
                        {t.title}
                      </option>
                    ))}
                  </select>
                </div>
                <div>
                  <label className="block text-slate-600 font-bold mb-1">رابط ملف التصميم / SCN</label>
                  <input
                    type="url"
                    placeholder="https://drive.google.com/..."
                    value={designForm.fileUrl}
                    onChange={(e) => setDesignForm({ ...designForm, fileUrl: e.target.value })}
                    className="w-full p-2.5 border border-slate-200 rounded-xl focus:outline-none focus:border-indigo-600"
                  />
                </div>
              </div>

              <div>
                <label className="block text-slate-600 font-bold mb-1">ملاحظات واعتمادات التصميم</label>
                <textarea
                  rows="3"
                  placeholder="ملاحظات العميل، الخامات المختارة، الألوان، الإضاءة المخفية..."
                  value={designForm.notes}
                  onChange={(e) => setDesignForm({ ...designForm, notes: e.target.value })}
                  className="w-full p-2.5 border border-slate-200 rounded-xl focus:outline-none focus:border-indigo-600"
                />
              </div>

              <div className="flex items-center justify-end gap-2 pt-3 border-t border-slate-100">
                <button
                  type="button"
                  onClick={() => setShowDesignModal(false)}
                  className="px-4 py-2 rounded-xl text-slate-600 hover:bg-slate-100 font-bold transition"
                >
                  إلغاء
                </button>
                <button
                  type="submit"
                  className="px-5 py-2 bg-indigo-700 hover:bg-indigo-800 text-white rounded-xl font-bold shadow-sm transition"
                >
                  حفظ التصميم
                </button>
              </div>
            </form>
          </div>
        </div>
      )}

      {/* Modal: New Appliance */}
      {showApplianceModal && (
        <div className="fixed inset-0 bg-slate-900/60 backdrop-blur-sm z-50 flex items-center justify-center p-4">
          <div className="bg-white rounded-2xl max-w-lg w-full p-6 shadow-2xl border border-slate-100">
            <h3 className="text-base font-black text-slate-800 mb-4 flex items-center gap-2">
              <Tv className="text-emerald-700" size={20} />
              تسجيل أبعاد ومواصفات جهاز كهربائي
            </h3>

            <form onSubmit={handleCreateAppliance} className="space-y-4 text-xs">
              <div>
                <label className="block text-slate-600 font-bold mb-1">العميل *</label>
                <select
                  value={applianceForm.customerCode}
                  onChange={(e) => setApplianceForm({ ...applianceForm, customerCode: e.target.value })}
                  className="w-full p-2.5 border border-slate-200 rounded-xl focus:outline-none focus:border-emerald-600"
                  required
                >
                  <option value="">-- اختر العميل --</option>
                  {customers.map((c) => (
                    <option key={c.id} value={c.code}>
                      {c.name} ({c.code})
                    </option>
                  ))}
                </select>
              </div>

              <div className="grid grid-cols-2 gap-3">
                <div>
                  <label className="block text-slate-600 font-bold mb-1">اسم الجهاز *</label>
                  <input
                    type="text"
                    value={applianceForm.name}
                    onChange={(e) => setApplianceForm({ ...applianceForm, name: e.target.value })}
                    className="w-full p-2.5 border border-slate-200 rounded-xl focus:outline-none focus:border-emerald-600"
                    required
                  />
                </div>
                <div>
                  <label className="block text-slate-600 font-bold mb-1">النوع</label>
                  <select
                    value={applianceForm.type}
                    onChange={(e) => setApplianceForm({ ...applianceForm, type: e.target.value })}
                    className="w-full p-2.5 border border-slate-200 rounded-xl focus:outline-none focus:border-emerald-600"
                  >
                    <option value="Built-in">بلت إن (Built-in)</option>
                    <option value="Freestanding">قائم بذاته (Freestanding)</option>
                  </select>
                </div>
              </div>

              <div className="grid grid-cols-3 gap-2">
                <div>
                  <label className="block text-slate-600 font-bold mb-1">العرض (سم)</label>
                  <input
                    type="number"
                    value={applianceForm.width}
                    onChange={(e) => setApplianceForm({ ...applianceForm, width: e.target.value })}
                    className="w-full p-2 border border-slate-200 rounded-xl focus:outline-none focus:border-emerald-600 font-mono"
                  />
                </div>
                <div>
                  <label className="block text-slate-600 font-bold mb-1">الارتفاع (سم)</label>
                  <input
                    type="number"
                    value={applianceForm.height}
                    onChange={(e) => setApplianceForm({ ...applianceForm, height: e.target.value })}
                    className="w-full p-2 border border-slate-200 rounded-xl focus:outline-none focus:border-emerald-600 font-mono"
                  />
                </div>
                <div>
                  <label className="block text-slate-600 font-bold mb-1">العمق (سم)</label>
                  <input
                    type="number"
                    value={applianceForm.depth}
                    onChange={(e) => setApplianceForm({ ...applianceForm, depth: e.target.value })}
                    className="w-full p-2 border border-slate-200 rounded-xl focus:outline-none focus:border-emerald-600 font-mono"
                  />
                </div>
              </div>

              <div>
                <label className="block text-slate-600 font-bold mb-1">ملاحظات فنية</label>
                <textarea
                  rows="2"
                  placeholder="موديل الجهاز، نوع التغذية بالغاز أو الكهرباء، وصلات الصرف..."
                  value={applianceForm.notes}
                  onChange={(e) => setApplianceForm({ ...applianceForm, notes: e.target.value })}
                  className="w-full p-2.5 border border-slate-200 rounded-xl focus:outline-none focus:border-emerald-600"
                />
              </div>

              <div className="flex items-center justify-end gap-2 pt-3 border-t border-slate-100">
                <button
                  type="button"
                  onClick={() => setShowApplianceModal(false)}
                  className="px-4 py-2 rounded-xl text-slate-600 hover:bg-slate-100 font-bold transition"
                >
                  إلغاء
                </button>
                <button
                  type="submit"
                  className="px-5 py-2 bg-emerald-700 hover:bg-emerald-800 text-white rounded-xl font-bold shadow-sm transition"
                >
                  حفظ الجهاز
                </button>
              </div>
            </form>
          </div>
        </div>
      )}
    </div>
  );
}
