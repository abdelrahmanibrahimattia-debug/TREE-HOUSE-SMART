import React, { useState, useEffect } from 'react';
import { api } from '../api/client.js';
import DataTable from '../components/DataTable.jsx';
import Modal from '../components/Modal.jsx';
import { useAuth } from '../context/AuthContext.jsx';
import { Landmark, Plus, CheckCircle2, AlertCircle } from 'lucide-react';

export default function FinanceLedgerPage() {
  const { hasPermission } = useAuth();
  const [entries, setEntries] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState('');
  const [success, setSuccess] = useState('');

  const [isModalOpen, setIsModalOpen] = useState(false);
  const [formData, setFormData] = useState({
    empCode: '',
    empName: '',
    type: 'عهدة',
    amount: '',
    description: '',
    date: new Date().toISOString().split('T')[0]
  });

  const loadLedger = async () => {
    setLoading(true);
    try {
      const res = await api.get('/finance/ledger');
      setEntries(res.data || []);
    } catch (err) {
      setError(err.message || 'فشل جلب سجل الحركات المالية.');
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    loadLedger();
  }, []);

  const handleSubmit = async (e) => {
    e.preventDefault();
    try {
      await api.post('/finance/ledger', formData);
      setSuccess('تم تسجيل الحركة في السجل المالي المركزي بنجاح.');
      setIsModalOpen(false);
      loadLedger();
    } catch (err) {
      setError(err.message || 'تعذر تسجيل الحركة المالية.');
    }
  };

  const columns = [
    {
      header: 'التاريخ',
      accessor: 'date',
      className: 'font-mono text-xs'
    },
    {
      header: 'الموظف',
      render: (row) => (
        <div>
          <div className="font-bold text-slate-800">{row.empName}</div>
          <div className="text-xs text-slate-400 font-mono">{row.empCode}</div>
        </div>
      )
    },
    {
      header: 'نوع الحركة',
      accessor: 'type',
      render: (row) => (
        <span className={`px-2.5 py-1 rounded-full text-xs font-bold ${
          row.type === 'عهدة'
            ? 'bg-blue-100 text-blue-800'
            : row.type === 'مصروف'
            ? 'bg-red-100 text-red-800'
            : 'bg-emerald-100 text-emerald-800'
        }`}>
          {row.type}
        </span>
      )
    },
    {
      header: 'المبلغ',
      accessor: 'amount',
      render: (row) => (
        <span className="font-mono font-black text-slate-800">
          {Number(row.amount).toLocaleString()} ج.م
        </span>
      )
    },
    {
      header: 'البيان والتفاصيل',
      accessor: 'description'
    },
    {
      header: 'الحالة',
      accessor: 'status',
      render: (row) => (
        <span className="text-xs font-bold text-emerald-700 bg-emerald-50 px-2 py-0.5 rounded">
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
            <Landmark size={18} />
            <span>المالية والليدجر المركزي</span>
          </div>
          <h1 className="text-2xl font-black text-slate-800">السجل المالي العام وكشف الحسابات</h1>
          <p className="text-xs text-slate-500 mt-1">
            تسجيل العهد، المصروفات، السلف، تصفية الحسابات، وكشوف حسابات الموظفين والشركاء.
          </p>
        </div>

        {hasPermission('pay.create') && (
          <button
            onClick={() => setIsModalOpen(true)}
            className="inline-flex items-center gap-2 px-4 py-2.5 bg-tree-green hover:bg-tree-green-dark text-white rounded-xl font-bold text-sm shadow-sm transition-all shrink-0 cursor-pointer"
          >
            <Plus size={18} />
            <span>تسجيل حركة مالية جديدة</span>
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
        data={entries}
        searchPlaceholder="بحث باسم الموظف أو الكود أو البيان..."
        searchField="empName"
      />

      <Modal
        isOpen={isModalOpen}
        onClose={() => setIsModalOpen(false)}
        title="تسجيل حركة مالية جديدة (عهدة / مصروف / تسوية)"
        maxWidth="max-w-lg"
      >
        <form onSubmit={handleSubmit} className="space-y-4">
          <div className="grid grid-cols-2 gap-4">
            <div>
              <label className="block text-xs font-bold text-slate-700 mb-1">كود الموظف *</label>
              <input
                type="text"
                required
                placeholder="مثال: EMP-101"
                value={formData.empCode}
                onChange={(e) => setFormData({ ...formData, empCode: e.target.value })}
                className="w-full px-3 py-2 bg-slate-50 border border-slate-200 rounded-xl text-sm font-mono dir-ltr text-left"
              />
            </div>
            <div>
              <label className="block text-xs font-bold text-slate-700 mb-1">اسم الموظف</label>
              <input
                type="text"
                placeholder="اسم الموظف"
                value={formData.empName}
                onChange={(e) => setFormData({ ...formData, empName: e.target.value })}
                className="w-full px-3 py-2 bg-slate-50 border border-slate-200 rounded-xl text-sm"
              />
            </div>
          </div>

          <div className="grid grid-cols-2 gap-4">
            <div>
              <label className="block text-xs font-bold text-slate-700 mb-1">نوع الحركة *</label>
              <select
                value={formData.type}
                onChange={(e) => setFormData({ ...formData, type: e.target.value })}
                className="w-full px-3 py-2 bg-slate-50 border border-slate-200 rounded-xl text-sm font-bold"
              >
                <option value="عهدة">عهدة مستلمة</option>
                <option value="مصروف">مصروف تشغيلي</option>
                <option value="سلفة">سلفة موظف</option>
                <option value="بونص">بونص ومكافأة</option>
                <option value="خصم">خصم إداري</option>
                <option value="تسوية">تسوية عهدة</option>
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

          <div>
            <label className="block text-xs font-bold text-slate-700 mb-1">البيان والشرح</label>
            <textarea
              rows={2}
              required
              placeholder="بيان تفصيلي للحركة المالية..."
              value={formData.description}
              onChange={(e) => setFormData({ ...formData, description: e.target.value })}
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
              تسجيل في السجل المركزي
            </button>
          </div>
        </form>
      </Modal>
    </div>
  );
}
