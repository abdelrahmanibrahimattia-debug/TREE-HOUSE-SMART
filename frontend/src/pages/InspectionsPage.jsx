import React, { useState, useEffect } from 'react';
import { apiGet, apiPost, apiPut } from '../utils/api.js';
import { CONTRACT_TYPES } from '../utils/contractTypes.js';
import {
  Calendar,
  Clock,
  User,
  Phone,
  MapPin,
  Plus,
  Search,
  Filter,
  CheckCircle,
  AlertCircle,
  FileText,
  BadgeDollarSign,
  Archive,
  Layers
} from 'lucide-react';

export default function InspectionsPage() {
  const [inspections, setInspections] = useState([]);
  const [customers, setCustomers] = useState([]);
  const [activeTab, setActiveTab] = useState('active'); // 'active' | 'archive'
  const [loading, setLoading] = useState(true);
  const [search, setSearch] = useState('');
  const [showModal, setShowModal] = useState(false);
  const [showReportModal, setShowReportModal] = useState(false);
  const [selectedInspection, setSelectedInspection] = useState(null);

  // Form State for New Inspection
  const [formData, setFormData] = useState({
    customerCode: '',
    date: new Date().toISOString().split('T')[0],
    time: '12:00',
    engineer: '',
    contractType: 'الفرش كامل',
    location: '',
    inspectionFee: 500,
    feeStatus: 'غير مسددة',
    notes: ''
  });

  // Report Form State
  const [reportData, setReportData] = useState({
    status: 'مكتملة',
    notes: ''
  });

  const fetchData = async () => {
    setLoading(true);
    try {
      const [inspRes, custRes] = await Promise.all([
        apiGet(`/inspections?tab=${activeTab}&search=${encodeURIComponent(search)}`),
        apiGet('/customers?limit=100')
      ]);
      if (inspRes.ok) setInspections(inspRes.data || []);
      if (custRes.ok) setCustomers(custRes.data || []);
    } catch (e) {
      console.error(e);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchData();
  }, [activeTab]);

  const handleCustomerChange = (code) => {
    const cust = customers.find(c => c.code === code);
    setFormData(prev => ({
      ...prev,
      customerCode: code,
      location: cust?.address || '',
      engineer: cust?.assignedEngineer || prev.engineer
    }));
  };

  const handleCreate = async (e) => {
    e.preventDefault();
    if (!formData.customerCode) {
      alert('يرجى اختيار العميل');
      return;
    }
    const res = await apiPost('/inspections', formData);
    if (res.ok) {
      setShowModal(false);
      setFormData({
        customerCode: '',
        date: new Date().toISOString().split('T')[0],
        time: '12:00',
        engineer: '',
        contractType: 'الفرش كامل',
        location: '',
        inspectionFee: 500,
        feeStatus: 'غير مسددة',
        notes: ''
      });
      fetchData();
    } else {
      alert(res.error || 'تعذر تسجيل المعاينة');
    }
  };

  const handleUpdateReport = async (e) => {
    e.preventDefault();
    if (!selectedInspection) return;
    const res = await apiPut(`/inspections/${selectedInspection.id}`, {
      status: reportData.status,
      notes: `${selectedInspection.notes || ''} | تقرير المعاينة: ${reportData.notes}`
    });
    if (res.ok) {
      setShowReportModal(false);
      setSelectedInspection(null);
      fetchData();
    } else {
      alert(res.error || 'تعذر تحديث تقرير المعاينة');
    }
  };

  return (
    <div className="space-y-6">
      {/* Page Header */}
      <div className="flex flex-col sm:flex-row items-start sm:items-center justify-between gap-4 bg-white p-5 rounded-2xl border border-slate-200/80 shadow-sm">
        <div>
          <div className="flex items-center gap-2">
            <span className="p-2 bg-emerald-50 text-emerald-700 rounded-xl">
              <Calendar size={22} />
            </span>
            <h1 className="text-xl font-black text-slate-800">المعاينات الميدانية ورفع المقاسات</h1>
          </div>
          <p className="text-xs text-slate-500 mt-1">
            جدولة مواعيد المعاينات، إسناد المهندسين، واعتماد المقاسات لكافة بنود التعاقد بما فيها "الفرش كامل".
          </p>
        </div>

        <button
          onClick={() => setShowModal(true)}
          className="flex items-center gap-2 bg-tree-green hover:bg-emerald-700 text-white px-4 py-2.5 rounded-xl font-bold text-xs shadow-sm transition-all"
        >
          <Plus size={16} />
          حجز موعد معاينة جديدة
        </button>
      </div>

      {/* Tabs & Search Controls */}
      <div className="flex flex-col sm:flex-row items-center justify-between gap-3 bg-white p-3 rounded-2xl border border-slate-200/80 shadow-sm">
        <div className="flex items-center gap-2 w-full sm:w-auto">
          <button
            onClick={() => setActiveTab('active')}
            className={`flex items-center gap-2 px-4 py-2 rounded-xl text-xs font-bold transition-all ${
              activeTab === 'active'
                ? 'bg-tree-green text-white shadow-sm'
                : 'text-slate-600 hover:bg-slate-100'
            }`}
          >
            <Clock size={15} />
            المعاينات النشطة والمجدولة
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
            أرشيف المعاينات المنتهية
          </button>
        </div>

        <div className="flex items-center gap-2 w-full sm:w-80">
          <div className="relative flex-1">
            <Search size={15} className="absolute right-3 top-3 text-slate-400" />
            <input
              type="text"
              placeholder="بحث باسم العميل أو الكود أو المهندس..."
              value={search}
              onChange={(e) => setSearch(e.target.value)}
              onKeyDown={(e) => e.key === 'Enter' && fetchData()}
              className="w-full pr-9 pl-3 py-2 text-xs border border-slate-200 rounded-xl focus:outline-none focus:border-tree-green"
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

      {/* Inspections Table */}
      <div className="bg-white rounded-2xl border border-slate-200/80 shadow-sm overflow-hidden">
        {loading ? (
          <div className="p-12 text-center text-slate-400 text-xs font-bold">جاري تحميل المعاينات...</div>
        ) : inspections.length === 0 ? (
          <div className="p-12 text-center text-slate-400 text-xs">لا توجد معاينات مسجلة في هذا التبويب.</div>
        ) : (
          <div className="overflow-x-auto">
            <table className="w-full text-right text-xs">
              <thead className="bg-slate-50 border-b border-slate-200/80 text-slate-600 font-bold">
                <tr>
                  <th className="p-3.5">الكود</th>
                  <th className="p-3.5">العميل</th>
                  <th className="p-3.5">الموعد والتاريخ</th>
                  <th className="p-3.5">نوع التعاقد</th>
                  <th className="p-3.5">مهندس المعاينة</th>
                  <th className="p-3.5">العنوان / الموقع</th>
                  <th className="p-3.5">الحالة</th>
                  <th className="p-3.5 text-center">الإجراءات</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-slate-100">
                {inspections.map((insp) => (
                  <tr key={insp.id} className="hover:bg-slate-50/80 transition-colors">
                    <td className="p-3.5 font-bold text-tree-green font-mono">{insp.code}</td>
                    <td className="p-3.5">
                      <div className="font-bold text-slate-800">{insp.customerName}</div>
                      <div className="text-[11px] text-slate-400 font-mono">{insp.customerPhone}</div>
                    </td>
                    <td className="p-3.5">
                      <div className="font-bold text-slate-700">{insp.date}</div>
                    </td>
                    <td className="p-3.5">
                      <span className={`inline-flex items-center gap-1 px-2.5 py-1 rounded-lg font-bold text-[11px] ${
                        insp.contractType === 'الفرش كامل'
                          ? 'bg-amber-100 text-amber-800 border border-amber-300'
                          : 'bg-emerald-50 text-emerald-800'
                      }`}>
                        <Layers size={11} />
                        {insp.contractType}
                      </span>
                    </td>
                    <td className="p-3.5 text-slate-700 font-medium">{insp.responsible || 'لم يُحدد'}</td>
                    <td className="p-3.5 text-slate-600 max-w-xs truncate">{insp.address || 'غير محدد'}</td>
                    <td className="p-3.5">
                      <span className={`px-2.5 py-1 rounded-full text-[10px] font-bold ${
                        insp.status === 'مكتملة' || insp.status === 'معتمدة'
                          ? 'bg-green-100 text-green-700'
                          : insp.status === 'مجدولة'
                          ? 'bg-blue-100 text-blue-700'
                          : 'bg-amber-100 text-amber-700'
                      }`}>
                        {insp.status}
                      </span>
                    </td>
                    <td className="p-3.5 text-center">
                      <button
                        onClick={() => {
                          setSelectedInspection(insp);
                          setShowReportModal(true);
                        }}
                        className="px-3 py-1.5 bg-slate-100 hover:bg-tree-green hover:text-white text-slate-700 rounded-lg font-bold text-[11px] transition"
                      >
                        تقرير المعاينة
                      </button>
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        )}
      </div>

      {/* Modal: New Inspection Appointment */}
      {showModal && (
        <div className="fixed inset-0 bg-slate-900/60 backdrop-blur-sm z-50 flex items-center justify-center p-4">
          <div className="bg-white rounded-2xl max-w-lg w-full p-6 shadow-2xl border border-slate-100">
            <h3 className="text-base font-black text-slate-800 mb-4 flex items-center gap-2">
              <Calendar className="text-tree-green" size={20} />
              حجز موعد معاينة ميدانية جديدة
            </h3>

            <form onSubmit={handleCreate} className="space-y-4 text-xs">
              <div>
                <label className="block text-slate-600 font-bold mb-1">العميل *</label>
                <select
                  value={formData.customerCode}
                  onChange={(e) => handleCustomerChange(e.target.value)}
                  className="w-full p-2.5 border border-slate-200 rounded-xl focus:outline-none focus:border-tree-green"
                  required
                >
                  <option value="">-- اختر العميل --</option>
                  {customers.map((c) => (
                    <option key={c.id} value={c.code}>
                      {c.name} ({c.code}) - {c.phone}
                    </option>
                  ))}
                </select>
              </div>

              <div className="grid grid-cols-2 gap-3">
                <div>
                  <label className="block text-slate-600 font-bold mb-1">تاريخ المعاينة *</label>
                  <input
                    type="date"
                    value={formData.date}
                    onChange={(e) => setFormData({ ...formData, date: e.target.value })}
                    className="w-full p-2.5 border border-slate-200 rounded-xl focus:outline-none focus:border-tree-green"
                    required
                  />
                </div>
                <div>
                  <label className="block text-slate-600 font-bold mb-1">وقت المعاينة</label>
                  <input
                    type="time"
                    value={formData.time}
                    onChange={(e) => setFormData({ ...formData, time: e.target.value })}
                    className="w-full p-2.5 border border-slate-200 rounded-xl focus:outline-none focus:border-tree-green"
                  />
                </div>
              </div>

              <div className="grid grid-cols-2 gap-3">
                <div>
                  <label className="block text-slate-600 font-bold mb-1">مهندس المعاينة</label>
                  <input
                    type="text"
                    placeholder="اسم المهندس المسؤول"
                    value={formData.engineer}
                    onChange={(e) => setFormData({ ...formData, engineer: e.target.value })}
                    className="w-full p-2.5 border border-slate-200 rounded-xl focus:outline-none focus:border-tree-green"
                  />
                </div>
                <div>
                  <label className="block text-slate-600 font-bold mb-1">نوع التعاقد *</label>
                  <select
                    value={formData.contractType}
                    onChange={(e) => setFormData({ ...formData, contractType: e.target.value })}
                    className="w-full p-2.5 border border-slate-200 rounded-xl focus:outline-none focus:border-tree-green font-bold text-tree-green"
                  >
                    {CONTRACT_TYPES.map((t) => (
                      <option key={t.id} value={t.title}>
                        {t.title}
                      </option>
                    ))}
                  </select>
                </div>
              </div>

              <div>
                <label className="block text-slate-600 font-bold mb-1">العنوان / موقع المعاينة</label>
                <input
                  type="text"
                  placeholder="عنوان الشقة أو الفيلا بالتفصيل"
                  value={formData.location}
                  onChange={(e) => setFormData({ ...formData, location: e.target.value })}
                  className="w-full p-2.5 border border-slate-200 rounded-xl focus:outline-none focus:border-tree-green"
                />
              </div>

              <div className="grid grid-cols-2 gap-3">
                <div>
                  <label className="block text-slate-600 font-bold mb-1">رسوم المعاينة (ج.م)</label>
                  <input
                    type="number"
                    value={formData.inspectionFee}
                    onChange={(e) => setFormData({ ...formData, inspectionFee: Number(e.target.value) })}
                    className="w-full p-2.5 border border-slate-200 rounded-xl focus:outline-none focus:border-tree-green font-bold"
                  />
                </div>
                <div>
                  <label className="block text-slate-600 font-bold mb-1">حالة سداد الرسوم</label>
                  <select
                    value={formData.feeStatus}
                    onChange={(e) => setFormData({ ...formData, feeStatus: e.target.value })}
                    className="w-full p-2.5 border border-slate-200 rounded-xl focus:outline-none focus:border-tree-green"
                  >
                    <option value="غير مسددة">غير مسددة</option>
                    <option value="تم السداد">تم السداد</option>
                    <option value="معفاة">معفاة (عرض خاص)</option>
                  </select>
                </div>
              </div>

              <div>
                <label className="block text-slate-600 font-bold mb-1">ملاحظات أولية</label>
                <textarea
                  rows="2"
                  placeholder="أي تعليمات أو تفاصيل إضافية للمهندس..."
                  value={formData.notes}
                  onChange={(e) => setFormData({ ...formData, notes: e.target.value })}
                  className="w-full p-2.5 border border-slate-200 rounded-xl focus:outline-none focus:border-tree-green"
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
                  className="px-5 py-2 bg-tree-green hover:bg-emerald-700 text-white rounded-xl font-bold shadow-sm transition"
                >
                  حفظ وتأكيد الموعد
                </button>
              </div>
            </form>
          </div>
        </div>
      )}

      {/* Modal: Inspection Report */}
      {showReportModal && selectedInspection && (
        <div className="fixed inset-0 bg-slate-900/60 backdrop-blur-sm z-50 flex items-center justify-center p-4">
          <div className="bg-white rounded-2xl max-w-lg w-full p-6 shadow-2xl border border-slate-100">
            <h3 className="text-base font-black text-slate-800 mb-2 flex items-center gap-2">
              <FileText className="text-tree-green" size={20} />
              تقرير المعاينة ({selectedInspection.code})
            </h3>
            <p className="text-xs text-slate-500 mb-4">
              العميل: {selectedInspection.customerName} ({selectedInspection.customerCode}) | نوع التعاقد: {selectedInspection.contractType}
            </p>

            <form onSubmit={handleUpdateReport} className="space-y-4 text-xs">
              <div>
                <label className="block text-slate-600 font-bold mb-1">حالة المعاينة</label>
                <select
                  value={reportData.status}
                  onChange={(e) => setReportData({ ...reportData, status: e.target.value })}
                  className="w-full p-2.5 border border-slate-200 rounded-xl focus:outline-none focus:border-tree-green font-bold text-tree-green"
                >
                  <option value="مكتملة">مكتملة - تم الرفع بنجاح</option>
                  <option value="معتمدة">معتمدة - جاهزة للتصميم والتسعير</option>
                  <option value="مطلوب إعادة معاينة">مطلوب إعادة معاينة</option>
                  <option value="ملغية">ملغية</option>
                </select>
              </div>

              <div>
                <label className="block text-slate-600 font-bold mb-1">المقاسات والملاحظات الفنية للموقع *</label>
                <textarea
                  rows="4"
                  placeholder="اكتب أبعاد الحوائط، ارتفاعات الأسقف، مواسير الغاز، نقاط السباكة، الكهرباء..."
                  value={reportData.notes}
                  onChange={(e) => setReportData({ ...reportData, notes: e.target.value })}
                  className="w-full p-2.5 border border-slate-200 rounded-xl focus:outline-none focus:border-tree-green"
                  required
                />
              </div>

              <div className="flex items-center justify-end gap-2 pt-3 border-t border-slate-100">
                <button
                  type="button"
                  onClick={() => setShowReportModal(false)}
                  className="px-4 py-2 rounded-xl text-slate-600 hover:bg-slate-100 font-bold transition"
                >
                  إغلاق
                </button>
                <button
                  type="submit"
                  className="px-5 py-2 bg-tree-green hover:bg-emerald-700 text-white rounded-xl font-bold shadow-sm transition"
                >
                  اعتماد وحفظ التقرير
                </button>
              </div>
            </form>
          </div>
        </div>
      )}
    </div>
  );
}
