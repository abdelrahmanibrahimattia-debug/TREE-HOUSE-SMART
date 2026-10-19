import React, { useState, useEffect } from 'react';
import { apiGet, apiPost, apiPut } from '../utils/api.js';
import { CONTRACT_TYPES } from '../utils/contractTypes.js';
import {
  Users,
  Calendar,
  Clock,
  Phone,
  DollarSign,
  Plus,
  Search,
  Filter,
  CheckCircle,
  Archive,
  ArrowRight,
  Layers,
  MessageSquare
} from 'lucide-react';

export default function InterviewsPage() {
  const [interviews, setInterviews] = useState([]);
  const [activeTab, setActiveTab] = useState('active'); // 'active' | 'archive'
  const [loading, setLoading] = useState(true);
  const [search, setSearch] = useState('');
  const [showModal, setShowModal] = useState(false);
  const [selectedInterview, setSelectedInterview] = useState(null);
  const [showEditModal, setShowEditModal] = useState(false);

  // New Interview Form
  const [formData, setFormData] = useState({
    customerName: '',
    phone: '',
    date: new Date().toISOString().split('T')[0],
    interviewer: '',
    contractType: 'الفرش كامل',
    visitReason: 'استفسار عن أسعار وتصميمات',
    budget: '150,000 - 250,000 ج.م',
    outcomeNotes: ''
  });

  const [editData, setEditData] = useState({
    status: 'مكتملة',
    outcomeNotes: ''
  });

  const fetchData = async () => {
    setLoading(true);
    try {
      const res = await apiGet(`/interviews?tab=${activeTab}&search=${encodeURIComponent(search)}`);
      if (res.ok) setInterviews(res.data || []);
    } catch (e) {
      console.error(e);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchData();
  }, [activeTab]);

  const handleCreate = async (e) => {
    e.preventDefault();
    if (!formData.customerName) {
      alert('اسم العميل مطلوب');
      return;
    }
    const res = await apiPost('/interviews', formData);
    if (res.ok) {
      setShowModal(false);
      setFormData({
        customerName: '',
        phone: '',
        date: new Date().toISOString().split('T')[0],
        interviewer: '',
        contractType: 'الفرش كامل',
        visitReason: 'استفسار عن أسعار وتصميمات',
        budget: '150,000 - 250,000 ج.م',
        outcomeNotes: ''
      });
      fetchData();
    } else {
      alert(res.error || 'تعذر تسجيل المقابلة');
    }
  };

  const handleUpdate = async (e) => {
    e.preventDefault();
    if (!selectedInterview) return;
    const res = await apiPut(`/interviews/${selectedInterview.id}`, editData);
    if (res.ok) {
      setShowEditModal(false);
      setSelectedInterview(null);
      fetchData();
    } else {
      alert(res.error || 'تعذر تحديث المقابلة');
    }
  };

  return (
    <div className="space-y-6">
      {/* Page Header */}
      <div className="flex flex-col sm:flex-row items-start sm:items-center justify-between gap-4 bg-white p-5 rounded-2xl border border-slate-200/80 shadow-sm">
        <div>
          <div className="flex items-center gap-2">
            <span className="p-2 bg-purple-50 text-purple-700 rounded-xl">
              <Users size={22} />
            </span>
            <h1 className="text-xl font-black text-slate-800">استقبال ومقابلات المعرض (Reception)</h1>
          </div>
          <p className="text-xs text-slate-500 mt-1">
            تسجيل زيارات العملاء في المعرض، تقييم الاحتياجات، والمتابعة حتى مرحلة المعاينة والتعاقد (شامل "الفرش كامل").
          </p>
        </div>

        <button
          onClick={() => setShowModal(true)}
          className="flex items-center gap-2 bg-purple-700 hover:bg-purple-800 text-white px-4 py-2.5 rounded-xl font-bold text-xs shadow-sm transition-all"
        >
          <Plus size={16} />
          تسجيل مقابلة عميل جديدة
        </button>
      </div>

      {/* Tabs & Search */}
      <div className="flex flex-col sm:flex-row items-center justify-between gap-3 bg-white p-3 rounded-2xl border border-slate-200/80 shadow-sm">
        <div className="flex items-center gap-2 w-full sm:w-auto">
          <button
            onClick={() => setActiveTab('active')}
            className={`flex items-center gap-2 px-4 py-2 rounded-xl text-xs font-bold transition-all ${
              activeTab === 'active'
                ? 'bg-purple-700 text-white shadow-sm'
                : 'text-slate-600 hover:bg-slate-100'
            }`}
          >
            <Clock size={15} />
            المقابلات النشطة وجاري المتابعة
          </button>
          <button
            onClick={() => setActiveTab('archive')}
            className={`flex items-center gap-2 px-4 py-2 rounded-xl text-xs font-bold transition-all ${
              activeTab === 'archive'
                ? 'bg-slate-700 text-white shadow-sm'
                : 'text-slate-600 hover:bg-slate-100'
            }`}
          >
            <Archive size={15} />
            أرشيف المقابلات
          </button>
        </div>

        <div className="flex items-center gap-2 w-full sm:w-80">
          <div className="relative flex-1">
            <Search size={15} className="absolute right-3 top-3 text-slate-400" />
            <input
              type="text"
              placeholder="بحث باسم العميل، الهاتف، أو المهندس..."
              value={search}
              onChange={(e) => setSearch(e.target.value)}
              onKeyDown={(e) => e.key === 'Enter' && fetchData()}
              className="w-full pr-9 pl-3 py-2 text-xs border border-slate-200 rounded-xl focus:outline-none focus:border-purple-600"
            />
          </div>
          <button
            onClick={fetchData}
            className="p-2 bg-slate-100 hover:bg-slate-200 text-slate-600 rounded-xl transition"
          >
            <Filter size={15} />
          </button>
        </div>
      </div>

      {/* Interviews Table */}
      <div className="bg-white rounded-2xl border border-slate-200/80 shadow-sm overflow-hidden">
        {loading ? (
          <div className="p-12 text-center text-slate-400 text-xs font-bold">جاري تحميل سجل المقابلات...</div>
        ) : interviews.length === 0 ? (
          <div className="p-12 text-center text-slate-400 text-xs">لا توجد مقابلات مسجلة في هذا التبويب.</div>
        ) : (
          <div className="overflow-x-auto">
            <table className="w-full text-right text-xs">
              <thead className="bg-slate-50 border-b border-slate-200/80 text-slate-600 font-bold">
                <tr>
                  <th className="p-3.5">العميل</th>
                  <th className="p-3.5">الهاتف</th>
                  <th className="p-3.5">تاريخ المقابلة</th>
                  <th className="p-3.5">مهندس الاستقبال</th>
                  <th className="p-3.5">نوع التعاقد المستهدف</th>
                  <th className="p-3.5">الحالة</th>
                  <th className="p-3.5">تفاصيل ونتيجة المقابلة</th>
                  <th className="p-3.5 text-center">الإجراء</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-slate-100">
                {interviews.map((iv) => (
                  <tr key={iv.id} className="hover:bg-slate-50/80 transition-colors">
                    <td className="p-3.5 font-bold text-slate-800">
                      {iv.customerName}
                      <span className="block text-[11px] text-purple-700 font-mono font-medium">
                        {iv.customerCode}
                      </span>
                    </td>
                    <td className="p-3.5 font-mono text-slate-600">{iv.phone || 'غير مسجل'}</td>
                    <td className="p-3.5 text-slate-700 font-medium">{iv.date}</td>
                    <td className="p-3.5 text-slate-700">{iv.interviewer}</td>
                    <td className="p-3.5">
                      <span className={`inline-flex items-center gap-1 px-2.5 py-1 rounded-lg font-bold text-[11px] ${
                        iv.contractType === 'الفرش كامل'
                          ? 'bg-amber-100 text-amber-800 border border-amber-300'
                          : 'bg-purple-50 text-purple-800'
                      }`}>
                        <Layers size={11} />
                        {iv.contractType}
                      </span>
                    </td>
                    <td className="p-3.5">
                      <span className={`px-2.5 py-1 rounded-full text-[10px] font-bold ${
                        iv.status === 'تم التعاقد' || iv.status === 'مكتملة'
                          ? 'bg-green-100 text-green-700'
                          : iv.status === 'نشطة'
                          ? 'bg-blue-100 text-blue-700'
                          : 'bg-amber-100 text-amber-700'
                      }`}>
                        {iv.status}
                      </span>
                    </td>
                    <td className="p-3.5 text-slate-600 max-w-xs truncate">
                      {iv.outcomeNotes || 'لا توجد ملاحظات'}
                    </td>
                    <td className="p-3.5 text-center">
                      <button
                        onClick={() => {
                          setSelectedInterview(iv);
                          setEditData({ status: iv.status, outcomeNotes: iv.outcomeNotes || '' });
                          setShowEditModal(true);
                        }}
                        className="px-3 py-1.5 bg-slate-100 hover:bg-purple-700 hover:text-white text-slate-700 rounded-lg font-bold text-[11px] transition"
                      >
                        تحديث النتيجة
                      </button>
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        )}
      </div>

      {/* Modal: New Interview */}
      {showModal && (
        <div className="fixed inset-0 bg-slate-900/60 backdrop-blur-sm z-50 flex items-center justify-center p-4">
          <div className="bg-white rounded-2xl max-w-lg w-full p-6 shadow-2xl border border-slate-100">
            <h3 className="text-base font-black text-slate-800 mb-4 flex items-center gap-2">
              <Users className="text-purple-700" size={20} />
              تسجيل مقابلة عميل جديدة في المعرض
            </h3>

            <form onSubmit={handleCreate} className="space-y-4 text-xs">
              <div className="grid grid-cols-2 gap-3">
                <div>
                  <label className="block text-slate-600 font-bold mb-1">اسم العميل *</label>
                  <input
                    type="text"
                    placeholder="الاسم ثلاثي"
                    value={formData.customerName}
                    onChange={(e) => setFormData({ ...formData, customerName: e.target.value })}
                    className="w-full p-2.5 border border-slate-200 rounded-xl focus:outline-none focus:border-purple-600"
                    required
                  />
                </div>
                <div>
                  <label className="block text-slate-600 font-bold mb-1">رقم الهاتف *</label>
                  <input
                    type="tel"
                    placeholder="01XXXXXXXXX"
                    value={formData.phone}
                    onChange={(e) => setFormData({ ...formData, phone: e.target.value })}
                    className="w-full p-2.5 border border-slate-200 rounded-xl focus:outline-none focus:border-purple-600"
                    required
                  />
                </div>
              </div>

              <div className="grid grid-cols-2 gap-3">
                <div>
                  <label className="block text-slate-600 font-bold mb-1">تاريخ المقابلة *</label>
                  <input
                    type="date"
                    value={formData.date}
                    onChange={(e) => setFormData({ ...formData, date: e.target.value })}
                    className="w-full p-2.5 border border-slate-200 rounded-xl focus:outline-none focus:border-purple-600"
                    required
                  />
                </div>
                <div>
                  <label className="block text-slate-600 font-bold mb-1">مهندس المقابلة / الاستقبال</label>
                  <input
                    type="text"
                    placeholder="اسم المهندس"
                    value={formData.interviewer}
                    onChange={(e) => setFormData({ ...formData, interviewer: e.target.value })}
                    className="w-full p-2.5 border border-slate-200 rounded-xl focus:outline-none focus:border-purple-600"
                  />
                </div>
              </div>

              <div className="grid grid-cols-2 gap-3">
                <div>
                  <label className="block text-slate-600 font-bold mb-1">نوع التعاقد المطلوب *</label>
                  <select
                    value={formData.contractType}
                    onChange={(e) => setFormData({ ...formData, contractType: e.target.value })}
                    className="w-full p-2.5 border border-slate-200 rounded-xl focus:outline-none focus:border-purple-600 font-bold text-purple-700"
                  >
                    {CONTRACT_TYPES.map((t) => (
                      <option key={t.id} value={t.title}>
                        {t.title}
                      </option>
                    ))}
                  </select>
                </div>
                <div>
                  <label className="block text-slate-600 font-bold mb-1">الميزانية التقديرية</label>
                  <input
                    type="text"
                    placeholder="مثال: 200,000 ج.م"
                    value={formData.budget}
                    onChange={(e) => setFormData({ ...formData, budget: e.target.value })}
                    className="w-full p-2.5 border border-slate-200 rounded-xl focus:outline-none focus:border-purple-600"
                  />
                </div>
              </div>

              <div>
                <label className="block text-slate-600 font-bold mb-1">الغرض من الزيارة</label>
                <input
                  type="text"
                  placeholder="معاينة الخامات، استفسار عن خطة سداد، طلب تصميم..."
                  value={formData.visitReason}
                  onChange={(e) => setFormData({ ...formData, visitReason: e.target.value })}
                  className="w-full p-2.5 border border-slate-200 rounded-xl focus:outline-none focus:border-purple-600"
                />
              </div>

              <div>
                <label className="block text-slate-600 font-bold mb-1">ملاحظات ونتيجة المقابلة</label>
                <textarea
                  rows="3"
                  placeholder="انطباع العميل، الخامات المفضلة، الخطوة التالية..."
                  value={formData.outcomeNotes}
                  onChange={(e) => setFormData({ ...formData, outcomeNotes: e.target.value })}
                  className="w-full p-2.5 border border-slate-200 rounded-xl focus:outline-none focus:border-purple-600"
                />
              </div>

              <div className="flex items-center justify-end gap-2 pt-3 border-t border-slate-100">
                <button
                  type="button"
                  onClick={() => setShowModal(false)}
                  className="px-4 py-2 rounded-xl text-slate-600 hover:bg-slate-100 font-bold transition"
                >
                  إلغاء
                </button>
                <button
                  type="submit"
                  className="px-5 py-2 bg-purple-700 hover:bg-purple-800 text-white rounded-xl font-bold shadow-sm transition"
                >
                  حفظ المقابلة
                </button>
              </div>
            </form>
          </div>
        </div>
      )}

      {/* Modal: Update Interview */}
      {showEditModal && selectedInterview && (
        <div className="fixed inset-0 bg-slate-900/60 backdrop-blur-sm z-50 flex items-center justify-center p-4">
          <div className="bg-white rounded-2xl max-w-lg w-full p-6 shadow-2xl border border-slate-100">
            <h3 className="text-base font-black text-slate-800 mb-2 flex items-center gap-2">
              <MessageSquare className="text-purple-700" size={20} />
              تحديث نتيجة مقابلة العميل ({selectedInterview.customerName})
            </h3>
            <p className="text-xs text-slate-500 mb-4">
              نوع التعاقد: {selectedInterview.contractType} | الهاتف: {selectedInterview.phone}
            </p>

            <form onSubmit={handleUpdate} className="space-y-4 text-xs">
              <div>
                <label className="block text-slate-600 font-bold mb-1">حالة المقابلة</label>
                <select
                  value={editData.status}
                  onChange={(e) => setEditData({ ...editData, status: e.target.value })}
                  className="w-full p-2.5 border border-slate-200 rounded-xl focus:outline-none focus:border-purple-600 font-bold"
                >
                  <option value="نشطة">نشطة - جاري المتابعة</option>
                  <option value="تم الاتفاق على معاينة">تم الاتفاق على معاينة</option>
                  <option value="تم التعاقد">تم التعاقد</option>
                  <option value="مكتملة">مكتملة</option>
                  <option value="ملغية">ملغية - لم يتفق</option>
                </select>
              </div>

              <div>
                <label className="block text-slate-600 font-bold mb-1">ملاحظات ونتيجة التحديث</label>
                <textarea
                  rows="4"
                  value={editData.outcomeNotes}
                  onChange={(e) => setEditData({ ...editData, outcomeNotes: e.target.value })}
                  className="w-full p-2.5 border border-slate-200 rounded-xl focus:outline-none focus:border-purple-600"
                  required
                />
              </div>

              <div className="flex items-center justify-end gap-2 pt-3 border-t border-slate-100">
                <button
                  type="button"
                  onClick={() => setShowEditModal(false)}
                  className="px-4 py-2 rounded-xl text-slate-600 hover:bg-slate-100 font-bold transition"
                >
                  إغلاق
                </button>
                <button
                  type="submit"
                  className="px-5 py-2 bg-purple-700 hover:bg-purple-800 text-white rounded-xl font-bold shadow-sm transition"
                >
                  حفظ التعديلات
                </button>
              </div>
            </form>
          </div>
        </div>
      )}
    </div>
  );
}
