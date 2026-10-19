import React, { useState, useEffect } from 'react';
import { api } from '../api/client.js';
import DataTable from '../components/DataTable.jsx';
import Modal from '../components/Modal.jsx';
import { useAuth } from '../context/AuthContext.jsx';
import { Wrench, Plus, CheckCircle2, AlertCircle } from 'lucide-react';

export default function WorkOrdersPage() {
  const { hasPermission } = useAuth();
  const [orders, setOrders] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState('');
  const [success, setSuccess] = useState('');

  const [isModalOpen, setIsModalOpen] = useState(false);
  const [formData, setFormData] = useState({
    contractNumber: '',
    department: 'تقطيع',
    priority: 'عادية',
    dueDate: '',
    specs: ''
  });

  const loadOrders = async () => {
    setLoading(true);
    try {
      const res = await api.get('/work-orders');
      setOrders(res.data || []);
    } catch (err) {
      setError(err.message || 'فشل جلب أوامر الشغل.');
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    loadOrders();
  }, []);

  const handleSubmit = async (e) => {
    e.preventDefault();
    try {
      await api.post('/work-orders', formData);
      setSuccess('تم إصدار أمر الشغل بنجاح.');
      setIsModalOpen(false);
      loadOrders();
    } catch (err) {
      setError(err.message || 'تعذر إصدار أمر الشغل.');
    }
  };

  const columns = [
    {
      header: 'رقم الأمر',
      accessor: 'orderNumber',
      className: 'font-mono font-bold text-tree-green'
    },
    {
      header: 'العميل',
      render: (row) => (
        <div>
          <div className="font-bold text-slate-800">{row.customerName}</div>
          <div className="text-xs text-slate-400 font-mono">{row.customerCode}</div>
        </div>
      )
    },
    {
      header: 'نوع التعاقد',
      accessor: 'contractType',
      render: (row) => (
        <span className={`text-xs font-bold px-2 py-0.5 rounded ${
          row.contractType === 'الفرش كامل' ? 'bg-tree-green text-white' : 'bg-slate-100 text-slate-700'
        }`}>
          {row.contractType}
        </span>
      )
    },
    {
      header: 'القسم الصناعي',
      accessor: 'department',
      render: (row) => (
        <span className="font-bold text-xs bg-slate-100 px-2.5 py-1 rounded text-slate-800">
          {row.department}
        </span>
      )
    },
    {
      header: 'الأولوية',
      accessor: 'priority',
      render: (row) => (
        <span className={`text-xs font-bold px-2 py-0.5 rounded ${
          row.priority === 'عاجلة' ? 'bg-red-100 text-red-800' : 'bg-slate-100 text-slate-700'
        }`}>
          {row.priority}
        </span>
      )
    },
    {
      header: 'الحالة',
      accessor: 'status',
      render: (row) => (
        <span className="text-xs font-bold px-2.5 py-1 rounded-full bg-emerald-100 text-emerald-800">
          {row.status}
        </span>
      )
    }
  ];

  return (
    <div className="space-y-6">
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4 bg-white p-6 rounded-2xl border border-slate-100 shadow-sm">
        <div>
          <div className="flex items-center gap-2 text-tree-green font-bold text-sm mb-1">
            <Wrench size={18} />
            <span>المكتب الفني والتصنيع</span>
          </div>
          <h1 className="text-2xl font-black text-slate-800">أوامر الشغل وخط الإنتاج (Work Orders)</h1>
          <p className="text-xs text-slate-500 mt-1">
            متابعة مراحل التصنيع (تقطيع، تجميع، دهانات، تركيبات) ومراقبة خط سير العمل بالمصنع.
          </p>
        </div>

        {hasPermission('wo.create') && (
          <button
            onClick={() => setIsModalOpen(true)}
            className="inline-flex items-center gap-2 px-4 py-2.5 bg-tree-green hover:bg-tree-green-dark text-white rounded-xl font-bold text-sm shadow-sm transition-all shrink-0 cursor-pointer"
          >
            <Plus size={18} />
            <span>إصدار أمر شغل جديد</span>
          </button>
        )}
      </div>

      {error && (
        <div className="p-4 bg-red-50 border border-red-200 text-red-700 text-sm rounded-xl flex items-center justify-between">
          <div className="flex items-center gap-2">
            <AlertCircle size={18} />
            <span>{error}</span>
          </div>
          <button onClick={() => setError('')} className="font-bold">✕</button>
        </div>
      )}

      {success && (
        <div className="p-4 bg-emerald-50 border border-emerald-200 text-emerald-800 text-sm rounded-xl flex items-center justify-between">
          <div className="flex items-center gap-2">
            <CheckCircle2 size={18} />
            <span>{success}</span>
          </div>
          <button onClick={() => setSuccess('')} className="font-bold">✕</button>
        </div>
      )}

      <DataTable
        columns={columns}
        data={orders}
        searchPlaceholder="بحث برقم أمر الشغل، العقد، أو القسم..."
        searchField="orderNumber"
      />

      {/* Add Modal */}
      <Modal
        isOpen={isModalOpen}
        onClose={() => setIsModalOpen(false)}
        title="إصدار أمر شغل جديد للمصنع"
        maxWidth="max-w-xl"
      >
        <form onSubmit={handleSubmit} className="space-y-4">
          <div>
            <label className="block text-xs font-bold text-slate-700 mb-1">رقم العقد المرتبط *</label>
            <input
              type="text"
              required
              placeholder="مثال: CONT-2026-0001"
              value={formData.contractNumber}
              onChange={(e) => setFormData({ ...formData, contractNumber: e.target.value })}
              className="w-full px-3 py-2 bg-slate-50 border border-slate-200 rounded-xl text-sm font-mono dir-ltr text-left"
            />
          </div>

          <div className="grid grid-cols-2 gap-4">
            <div>
              <label className="block text-xs font-bold text-slate-700 mb-1">القسم الصناعي *</label>
              <select
                value={formData.department}
                onChange={(e) => setFormData({ ...formData, department: e.target.value })}
                className="w-full px-3 py-2 bg-slate-50 border border-slate-200 rounded-xl text-sm font-bold"
              >
                <option value="تقطيع">تقطيع وCNC</option>
                <option value="تجميع وشاسيهات">تجميع وشاسيهات</option>
                <option value="دهانات وتجاليد">دهانات وتجاليد</option>
                <option value="تجهيز إكسسوارات">تجهيز إكسسوارات</option>
                <option value="تركيبات موقع">تركيبات موقع</option>
              </select>
            </div>
            <div>
              <label className="block text-xs font-bold text-slate-700 mb-1">الأولوية</label>
              <select
                value={formData.priority}
                onChange={(e) => setFormData({ ...formData, priority: e.target.value })}
                className="w-full px-3 py-2 bg-slate-50 border border-slate-200 rounded-xl text-sm font-bold"
              >
                <option value="عادية">عادية</option>
                <option value="عاجلة">عاجلة جداً</option>
                <option value="منخفضة">منخفضة</option>
              </select>
            </div>
          </div>

          <div>
            <label className="block text-xs font-bold text-slate-700 mb-1">تاريخ التسليم المستهدف</label>
            <input
              type="date"
              value={formData.dueDate}
              onChange={(e) => setFormData({ ...formData, dueDate: e.target.value })}
              className="w-full px-3 py-2 bg-slate-50 border border-slate-200 rounded-xl text-sm"
            />
          </div>

          <div>
            <label className="block text-xs font-bold text-slate-700 mb-1">المواصفات الفنية والملاحظات</label>
            <textarea
              rows={3}
              placeholder="سماكات الخشب، كود اللون، نوع المفصلات وسكك الأدراج..."
              value={formData.specs}
              onChange={(e) => setFormData({ ...formData, specs: e.target.value })}
              className="w-full px-3 py-2 bg-slate-50 border border-slate-200 rounded-xl text-sm"
            />
          </div>

          <div className="flex justify-end gap-3 pt-3 border-t">
            <button
              type="button"
              onClick={() => setIsModalOpen(false)}
              className="px-4 py-2 text-slate-600 font-bold text-sm"
            >
              إلغاء
            </button>
            <button
              type="submit"
              className="px-6 py-2 bg-tree-green hover:bg-tree-green-dark text-white font-bold text-sm rounded-xl shadow-md transition-all cursor-pointer"
            >
              إصدار أمر الشغل
            </button>
          </div>
        </form>
      </Modal>
    </div>
  );
}
