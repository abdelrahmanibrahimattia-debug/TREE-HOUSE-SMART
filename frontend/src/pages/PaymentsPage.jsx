import React, { useState, useEffect } from 'react';
import { api } from '../api/client.js';
import DataTable from '../components/DataTable.jsx';
import Modal from '../components/Modal.jsx';
import { useAuth } from '../context/AuthContext.jsx';
import {
  Wallet,
  Plus,
  ArrowDownLeft,
  Calendar,
  CheckCircle2,
  AlertCircle
} from 'lucide-react';

export default function PaymentsPage() {
  const { hasPermission } = useAuth();
  const [payments, setPayments] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState('');
  const [success, setSuccess] = useState('');

  // Add Payment Modal State
  const [isModalOpen, setIsModalOpen] = useState(false);
  const [formData, setFormData] = useState({
    customerCode: '',
    contractNumber: '',
    type: 'تحصيل',
    amount: '',
    date: new Date().toISOString().split('T')[0],
    method: 'نقدي',
    notes: ''
  });

  const loadPayments = async () => {
    setLoading(true);
    try {
      const res = await api.get('/payments');
      setPayments(res.data || []);
    } catch (err) {
      setError(err.message || 'فشل جلب المدفوعات.');
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    loadPayments();
  }, []);

  const handleSubmit = async (e) => {
    e.preventDefault();
    setError('');
    try {
      await api.post('/payments', formData);
      setSuccess('تم تسجيل سند القبض/الصرف بنجاح.');
      setIsModalOpen(false);
      setFormData({
        customerCode: '',
        contractNumber: '',
        type: 'تحصيل',
        amount: '',
        date: new Date().toISOString().split('T')[0],
        method: 'نقدي',
        notes: ''
      });
      loadPayments();
    } catch (err) {
      setError(err.message || 'تعذر تسجيل السند المالي.');
    }
  };

  const columns = [
    {
      header: 'رقم الإيصال',
      accessor: 'receiptNumber',
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
      header: 'نوع الحركة',
      accessor: 'type',
      render: (row) => (
        <span className={`px-2.5 py-1 rounded-full text-xs font-bold ${
          row.type === 'تحصيل'
            ? 'bg-emerald-100 text-emerald-800'
            : 'bg-amber-100 text-amber-800'
        }`}>
          {row.type}
        </span>
      )
    },
    {
      header: 'المبلغ',
      accessor: 'amount',
      render: (row) => (
        <span className="font-mono font-black text-slate-800 text-sm">
          {Number(row.amount).toLocaleString()} ج.م
        </span>
      )
    },
    {
      header: 'طريقة الدفع',
      accessor: 'method',
      render: (row) => (
        <span className="text-xs bg-slate-100 px-2 py-0.5 rounded text-slate-700 font-bold">
          {row.method}
        </span>
      )
    },
    {
      header: 'التاريخ',
      accessor: 'date',
      className: 'font-mono text-xs'
    },
    {
      header: 'المسجل',
      accessor: 'createdBy',
      className: 'text-xs text-slate-500'
    }
  ];

  return (
    <div className="space-y-6">
      {/* Header */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4 bg-white p-6 rounded-2xl border border-slate-100 shadow-sm">
        <div>
          <div className="flex items-center gap-2 text-tree-green font-bold text-sm mb-1">
            <Wallet size={18} />
            <span>المالية والخزينة المركزية</span>
          </div>
          <h1 className="text-2xl font-black text-slate-800">إدارة المدفوعات وسندات القبض</h1>
          <p className="text-xs text-slate-500 mt-1">
            تسجيل الإيصالات وسندات التحصيل والصرف، وتتبع الأقساط المستحقة والمسددة لكل عميل.
          </p>
        </div>

        {hasPermission('pay.create') && (
          <button
            onClick={() => setIsModalOpen(true)}
            className="inline-flex items-center gap-2 px-4 py-2.5 bg-tree-green hover:bg-tree-green-dark text-white rounded-xl font-bold text-sm shadow-sm transition-all shrink-0 cursor-pointer"
          >
            <Plus size={18} />
            <span>تسجيل سند مالي جديد</span>
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

      {/* Table */}
      <DataTable
        columns={columns}
        data={payments}
        searchPlaceholder="بحث برقم الإيصال أو اسم العميل أو الكود..."
        searchField="customerName"
      />

      {/* Add Payment Modal */}
      <Modal
        isOpen={isModalOpen}
        onClose={() => setIsModalOpen(false)}
        title="تسجيل إيصال / سند تحصيل مالي"
        maxWidth="max-w-lg"
      >
        <form onSubmit={handleSubmit} className="space-y-4">
          <div>
            <label className="block text-xs font-bold text-slate-700 mb-1">كود العميل *</label>
            <input
              type="text"
              required
              placeholder="مثال: CUST-2026-0001"
              value={formData.customerCode}
              onChange={(e) => setFormData({ ...formData, customerCode: e.target.value })}
              className="w-full px-3 py-2 bg-slate-50 border border-slate-200 rounded-xl text-sm font-mono dir-ltr text-left"
            />
          </div>

          <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
            <div>
              <label className="block text-xs font-bold text-slate-700 mb-1">نوع الحركة *</label>
              <select
                value={formData.type}
                onChange={(e) => setFormData({ ...formData, type: e.target.value })}
                className="w-full px-3 py-2 bg-slate-50 border border-slate-200 rounded-xl text-sm font-bold"
              >
                <option value="تحصيل">تحصيل (قبض)</option>
                <option value="مصروف">مصروف (صرف)</option>
                <option value="عهدة">عهدة</option>
              </select>
            </div>
            <div>
              <label className="block text-xs font-bold text-slate-700 mb-1">المبلغ (ج.م) *</label>
              <input
                type="number"
                required
                min="1"
                placeholder="0"
                value={formData.amount}
                onChange={(e) => setFormData({ ...formData, amount: e.target.value })}
                className="w-full px-3 py-2 bg-slate-50 border border-slate-200 rounded-xl text-sm font-mono font-bold"
              />
            </div>
          </div>

          <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
            <div>
              <label className="block text-xs font-bold text-slate-700 mb-1">طريقة الدفع *</label>
              <select
                value={formData.method}
                onChange={(e) => setFormData({ ...formData, method: e.target.value })}
                className="w-full px-3 py-2 bg-slate-50 border border-slate-200 rounded-xl text-sm font-bold"
              >
                <option value="نقدي">نقدي (كاش)</option>
                <option value="تحويل بنكي">تحويل بنكي</option>
                <option value="فودافون كاش">فودافون كاش / إنستاباي</option>
                <option value="شيك">شيك بنكي</option>
              </select>
            </div>
            <div>
              <label className="block text-xs font-bold text-slate-700 mb-1">تاريخ التحصيل *</label>
              <input
                type="date"
                required
                value={formData.date}
                onChange={(e) => setFormData({ ...formData, date: e.target.value })}
                className="w-full px-3 py-2 bg-slate-50 border border-slate-200 rounded-xl text-sm"
              />
            </div>
          </div>

          <div>
            <label className="block text-xs font-bold text-slate-700 mb-1">رقم العقد المرتبط (اختياري)</label>
            <input
              type="text"
              placeholder="مثال: CONT-2026-0001"
              value={formData.contractNumber}
              onChange={(e) => setFormData({ ...formData, contractNumber: e.target.value })}
              className="w-full px-3 py-2 bg-slate-50 border border-slate-200 rounded-xl text-sm font-mono dir-ltr text-left"
            />
          </div>

          <div>
            <label className="block text-xs font-bold text-slate-700 mb-1">ملاحظات وبيان السند</label>
            <textarea
              rows={2}
              placeholder="دفعة مقدم تعاقد، قسط شهر..."
              value={formData.notes}
              onChange={(e) => setFormData({ ...formData, notes: e.target.value })}
              className="w-full px-3 py-2 bg-slate-50 border border-slate-200 rounded-xl text-sm"
            />
          </div>

          <div className="flex items-center justify-end gap-3 pt-3 border-t">
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
              حفظ وتوليد الإيصال
            </button>
          </div>
        </form>
      </Modal>
    </div>
  );
}
