import React, { useState, useEffect } from 'react';
import { api } from '../api/client.js';
import DataTable from '../components/DataTable.jsx';
import Modal from '../components/Modal.jsx';
import { useAuth } from '../context/AuthContext.jsx';
import {
  Calculator,
  Plus,
  Trash2,
  Eye,
  FileCheck,
  CheckCircle2,
  AlertCircle
} from 'lucide-react';

export default function QuotationsPage() {
  const { hasPermission } = useAuth();
  const [quotations, setQuotations] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState('');
  const [success, setSuccess] = useState('');

  // View Modal State
  const [viewingBoq, setViewingBoq] = useState(null);

  // Create Modal State
  const [isModalOpen, setIsModalOpen] = useState(false);
  const [formData, setFormData] = useState({
    customerCode: '',
    contractType: 'الفرش كامل',
    title: '',
    discount: 0,
    items: [
      { description: 'بند تنفيذ أعمال خشبية / كبائن', unit: 'م.ط', quantity: 1, unitPrice: 0 }
    ]
  });

  const loadQuotations = async () => {
    setLoading(true);
    try {
      const res = await api.get('/quotations');
      setQuotations(res.data || []);
    } catch (err) {
      setError(err.message || 'فشل جلب المقايسات.');
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    loadQuotations();
  }, []);

  const handleAddItem = () => {
    setFormData(prev => ({
      ...prev,
      items: [
        ...prev.items,
        { description: '', unit: 'م.ط', quantity: 1, unitPrice: 0 }
      ]
    }));
  };

  const handleRemoveItem = (index) => {
    setFormData(prev => ({
      ...prev,
      items: prev.items.filter((_, i) => i !== index)
    }));
  };

  const handleItemChange = (index, field, value) => {
    setFormData(prev => {
      const nextItems = [...prev.items];
      nextItems[index][field] = value;
      return { ...prev, items: nextItems };
    });
  };

  // Auto-calculated totals
  const subtotal = formData.items.reduce((acc, it) => {
    const q = Number(it.quantity) || 0;
    const p = Number(it.unitPrice) || 0;
    return acc + (q * p);
  }, 0);
  const netTotal = Math.max(0, subtotal - (Number(formData.discount) || 0));

  const handleSubmit = async (e) => {
    e.preventDefault();
    setError('');
    try {
      await api.post('/quotations', formData);
      setSuccess('تم حفظ واعتماد المقايسة بنجاح.');
      setIsModalOpen(false);
      setFormData({
        customerCode: '',
        contractType: 'الفرش كامل',
        title: '',
        discount: 0,
        items: [{ description: 'بند تنفيذ أعمال', unit: 'م.ط', quantity: 1, unitPrice: 0 }]
      });
      loadQuotations();
    } catch (err) {
      setError(err.message || 'تعذر حفظ المقايسة.');
    }
  };

  const columns = [
    {
      header: 'كود المقايسة',
      accessor: 'code',
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
          row.contractType === 'الفرش كامل'
            ? 'bg-tree-green text-white'
            : 'bg-emerald-50 text-emerald-800 border border-emerald-200'
        }`}>
          {row.contractType}
        </span>
      )
    },
    {
      header: 'إجمالي المقايسة',
      render: (row) => (
        <span className="font-mono font-extrabold text-slate-800">
          {Number(row.netAmount || row.totalAmount).toLocaleString()} ج.م
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
    },
    {
      header: 'التفاصيل',
      render: (row) => (
        <button
          onClick={() => setViewingBoq(row)}
          className="inline-flex items-center gap-1 px-3 py-1 bg-slate-100 hover:bg-slate-200 text-slate-700 rounded-lg text-xs font-bold transition-all cursor-pointer"
        >
          <Eye size={13} />
          <span>عرض البنود</span>
        </button>
      )
    }
  ];

  return (
    <div className="space-y-6">
      {/* Header */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4 bg-white p-6 rounded-2xl border border-slate-100 shadow-sm">
        <div>
          <div className="flex items-center gap-2 text-tree-green font-bold text-sm mb-1">
            <Calculator size={18} />
            <span>نظام المقايسات والتسعير الذكي</span>
          </div>
          <h1 className="text-2xl font-black text-slate-800">المقايسات وجداول الكميات (BOQ)</h1>
          <p className="text-xs text-slate-500 mt-1">
            حساب تكاليف الأمتار والبنود وتفقيطها وحساب الخصم الصافي مع الدعم الكامل لمقايسات الفرش الكامل.
          </p>
        </div>

        {hasPermission('boq.create') && (
          <button
            onClick={() => setIsModalOpen(true)}
            className="inline-flex items-center gap-2 px-4 py-2.5 bg-tree-green hover:bg-tree-green-dark text-white rounded-xl font-bold text-sm shadow-sm transition-all shrink-0 cursor-pointer"
          >
            <Plus size={18} />
            <span>إنشاء مقايسة جديدة</span>
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
        data={quotations}
        searchPlaceholder="بحث بكود المقايسة، اسم العميل، أو نوع التعاقد..."
        searchField="customerName"
      />

      {/* View BOQ Modal */}
      <Modal
        isOpen={Boolean(viewingBoq)}
        onClose={() => setViewingBoq(null)}
        title={`بنود مقايسة: ${viewingBoq?.customerName} (${viewingBoq?.code})`}
        maxWidth="max-w-3xl"
      >
        <div className="space-y-4">
          <div className="flex items-center justify-between p-3.5 bg-slate-50 rounded-xl border border-slate-200 text-xs">
            <div><strong>نوع التعاقد:</strong> <span className="text-tree-green font-bold">{viewingBoq?.contractType}</span></div>
            <div><strong>الإجمالي الصافي:</strong> <span className="text-base font-black text-slate-800 font-mono">{Number(viewingBoq?.netAmount || viewingBoq?.totalAmount).toLocaleString()} ج.م</span></div>
          </div>

          <div className="overflow-x-auto border border-slate-200 rounded-xl">
            <table className="w-full text-right text-xs">
              <thead className="bg-slate-100 text-slate-600 font-bold border-b border-slate-200">
                <tr>
                  <th className="p-2.5">م</th>
                  <th className="p-2.5">بيان البند والمواصفات</th>
                  <th className="p-2.5">الوحدة</th>
                  <th className="p-2.5">الكمية</th>
                  <th className="p-2.5">سعر الوحدة</th>
                  <th className="p-2.5">الإجمالي</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-slate-100">
                {(viewingBoq?.items || []).map((it, idx) => (
                  <tr key={idx} className="hover:bg-slate-50">
                    <td className="p-2.5 font-bold text-slate-400">{idx + 1}</td>
                    <td className="p-2.5 font-semibold text-slate-800">{it.description}</td>
                    <td className="p-2.5 text-slate-500">{it.unit}</td>
                    <td className="p-2.5 font-mono">{it.quantity}</td>
                    <td className="p-2.5 font-mono">{Number(it.unitPrice).toLocaleString()} ج.م</td>
                    <td className="p-2.5 font-mono font-bold text-tree-green-dark">
                      {(Number(it.quantity) * Number(it.unitPrice)).toLocaleString()} ج.م
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        </div>
      </Modal>

      {/* Add BOQ Modal */}
      <Modal
        isOpen={isModalOpen}
        onClose={() => setIsModalOpen(false)}
        title="إنشاء مقايسة تكاليف وأعمال جديدة"
        maxWidth="max-w-4xl"
      >
        <form onSubmit={handleSubmit} className="space-y-5">
          <div className="grid grid-cols-1 sm:grid-cols-3 gap-4">
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
            <div>
              <label className="block text-xs font-bold text-slate-700 mb-1">نوع التعاقد *</label>
              <select
                value={formData.contractType}
                onChange={(e) => setFormData({ ...formData, contractType: e.target.value })}
                className="w-full px-3 py-2 bg-slate-50 border border-slate-200 rounded-xl text-sm font-bold text-tree-green"
              >
                <option value="الفرش كامل">الفرش كامل (Full Furnishing)</option>
                <option value="مطبخ">مطبخ</option>
                <option value="دريسنج">دريسنج</option>
                <option value="غرف نوم وأثاث">غرف نوم وأثاث</option>
                <option value="وحدات حمام">وحدات حمام</option>
              </select>
            </div>
            <div>
              <label className="block text-xs font-bold text-slate-700 mb-1">عنوان أو وصف المقايسة</label>
              <input
                type="text"
                placeholder="مثال: مقايسة الفرش الكامل - فيلا التجمع"
                value={formData.title}
                onChange={(e) => setFormData({ ...formData, title: e.target.value })}
                className="w-full px-3 py-2 bg-slate-50 border border-slate-200 rounded-xl text-sm"
              />
            </div>
          </div>

          {/* Dynamic Items Builder */}
          <div>
            <div className="flex items-center justify-between mb-2">
              <label className="text-xs font-extrabold text-slate-800">بنود المقايسة والكميات والأسعار:</label>
              <button
                type="button"
                onClick={handleAddItem}
                className="inline-flex items-center gap-1 text-xs font-bold text-tree-green hover:underline cursor-pointer"
              >
                <Plus size={14} /> إضافة بند جديد
              </button>
            </div>

            <div className="space-y-2.5 max-h-64 overflow-y-auto p-1">
              {formData.items.map((item, idx) => (
                <div key={idx} className="flex flex-col sm:flex-row items-center gap-2 p-2.5 bg-slate-50 border border-slate-200 rounded-xl">
                  <div className="flex-1 w-full">
                    <input
                      type="text"
                      required
                      placeholder="وصف البند والمواصفات الفنية..."
                      value={item.description}
                      onChange={(e) => handleItemChange(idx, 'description', e.target.value)}
                      className="w-full px-2.5 py-1.5 bg-white border border-slate-200 rounded-lg text-xs"
                    />
                  </div>
                  <div className="w-24 shrink-0">
                    <select
                      value={item.unit}
                      onChange={(e) => handleItemChange(idx, 'unit', e.target.value)}
                      className="w-full px-2 py-1.5 bg-white border border-slate-200 rounded-lg text-xs font-bold"
                    >
                      <option value="م.ط">م.ط</option>
                      <option value="م2">م2</option>
                      <option value="عدد">عدد</option>
                      <option value="مقطوعية">مقطوعية</option>
                    </select>
                  </div>
                  <div className="w-20 shrink-0">
                    <input
                      type="number"
                      step="any"
                      min="0.1"
                      required
                      placeholder="الكمية"
                      value={item.quantity}
                      onChange={(e) => handleItemChange(idx, 'quantity', e.target.value)}
                      className="w-full px-2 py-1.5 bg-white border border-slate-200 rounded-lg text-xs font-mono text-center"
                    />
                  </div>
                  <div className="w-28 shrink-0">
                    <input
                      type="number"
                      step="any"
                      min="0"
                      required
                      placeholder="سعر الوحدة"
                      value={item.unitPrice}
                      onChange={(e) => handleItemChange(idx, 'unitPrice', e.target.value)}
                      className="w-full px-2 py-1.5 bg-white border border-slate-200 rounded-lg text-xs font-mono text-center"
                    />
                  </div>
                  <div className="w-28 shrink-0 font-mono text-xs font-extrabold text-tree-green text-center">
                    {((Number(item.quantity) || 0) * (Number(item.unitPrice) || 0)).toLocaleString()} ج.م
                  </div>
                  {formData.items.length > 1 && (
                    <button
                      type="button"
                      onClick={() => handleRemoveItem(idx)}
                      className="p-1.5 text-red-500 hover:bg-red-50 rounded-lg cursor-pointer shrink-0"
                    >
                      <Trash2 size={15} />
                    </button>
                  )}
                </div>
              ))}
            </div>
          </div>

          {/* Totals Summary */}
          <div className="flex flex-col sm:flex-row items-center justify-between p-4 bg-emerald-50/70 border border-emerald-200 rounded-xl gap-4">
            <div className="flex items-center gap-4">
              <div>
                <label className="block text-[11px] font-bold text-slate-600 mb-0.5">قيمة الخصم إن وجد (ج.م)</label>
                <input
                  type="number"
                  min="0"
                  value={formData.discount}
                  onChange={(e) => setFormData({ ...formData, discount: e.target.value })}
                  className="w-32 px-2.5 py-1 bg-white border border-slate-200 rounded-lg text-xs font-mono"
                />
              </div>
            </div>

            <div className="text-right">
              <div className="text-xs text-slate-500">الإجمالي قبل الخصم: <span className="font-mono font-bold">{subtotal.toLocaleString()} ج.م</span></div>
              <div className="text-base font-black text-tree-green-dark">
                الصافي النهائي: <span className="font-mono text-xl">{netTotal.toLocaleString()} ج.م</span>
              </div>
            </div>
          </div>

          <div className="flex items-center justify-end gap-3 pt-3 border-t border-slate-100">
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
              حفظ واعتماد المقايسة
            </button>
          </div>
        </form>
      </Modal>
    </div>
  );
}
