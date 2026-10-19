import React, { useState, useEffect } from 'react';
import { api } from '../api/client.js';
import DataTable from '../components/DataTable.jsx';
import Modal from '../components/Modal.jsx';
import { useAuth } from '../context/AuthContext.jsx';
import TreeHouseLogo from '../components/TreeHouseLogo.jsx';
import {
  FileSignature,
  Plus,
  Eye,
  Printer,
  Calendar,
  CheckCircle2,
  AlertCircle
} from 'lucide-react';

export default function ContractsPage() {
  const { hasPermission } = useAuth();
  const [contracts, setContracts] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState('');
  const [success, setSuccess] = useState('');

  // View Contract Modal State
  const [viewingContract, setViewingContract] = useState(null);

  // Create Contract Modal State
  const [isModalOpen, setIsModalOpen] = useState(false);
  const [formData, setFormData] = useState({
    customerCode: '',
    contractType: 'الفرش كامل',
    totalAmount: '',
    downPayment: '',
    installments: [
      { title: 'دفعة ثانية (عند بدء التصنيع)', amount: '', dueDate: '' },
      { title: 'دفعة أخيرة (عند التوريد والتركيب)', amount: '', dueDate: '' }
    ]
  });

  const loadContracts = async () => {
    setLoading(true);
    try {
      const res = await api.get('/contracts');
      setContracts(res.data || []);
    } catch (err) {
      setError(err.message || 'فشل جلب قائمة العقود.');
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    loadContracts();
  }, []);

  const handleAddInstallment = () => {
    setFormData(prev => ({
      ...prev,
      installments: [
        ...prev.installments,
        { title: `دفعة ${prev.installments.length + 2}`, amount: '', dueDate: '' }
      ]
    }));
  };

  const handleRemoveInstallment = (idx) => {
    setFormData(prev => ({
      ...prev,
      installments: prev.installments.filter((_, i) => i !== idx)
    }));
  };

  const handleInstallmentChange = (idx, field, val) => {
    setFormData(prev => {
      const next = [...prev.installments];
      next[idx][field] = val;
      return { ...prev, installments: next };
    });
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    setError('');
    try {
      await api.post('/contracts', formData);
      setSuccess('تم إنشاء العقد وجدولة الدفعات بنجاح.');
      setIsModalOpen(false);
      setFormData({
        customerCode: '',
        contractType: 'الفرش كامل',
        totalAmount: '',
        downPayment: '',
        installments: [
          { title: 'دفعة ثانية (عند بدء التصنيع)', amount: '', dueDate: '' },
          { title: 'دفعة أخيرة (عند التوريد والتركيب)', amount: '', dueDate: '' }
        ]
      });
      loadContracts();
    } catch (err) {
      setError(err.message || 'تعذر إنشاء العقد.');
    }
  };

  const columns = [
    {
      header: 'رقم العقد',
      accessor: 'contractNumber',
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
      header: 'القيمة الإجمالية',
      render: (row) => (
        <span className="font-mono font-extrabold text-slate-800">
          {Number(row.totalAmount).toLocaleString()} ج.م
        </span>
      )
    },
    {
      header: 'المقدم',
      render: (row) => (
        <span className="font-mono text-emerald-700 font-bold">
          {Number(row.downPayment).toLocaleString()} ج.م
        </span>
      )
    },
    {
      header: 'المتبقي',
      render: (row) => (
        <span className="font-mono text-amber-700 font-bold">
          {Number(row.remainingAmount).toLocaleString()} ج.م
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
      header: 'العقد والطباعة',
      render: (row) => (
        <button
          onClick={() => setViewingContract(row)}
          className="inline-flex items-center gap-1.5 px-3 py-1 bg-tree-green/10 hover:bg-tree-green text-tree-green hover:text-white rounded-lg text-xs font-bold transition-all cursor-pointer"
        >
          <Eye size={13} />
          <span>عرض العقد</span>
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
            <FileSignature size={18} />
            <span>إدارة العقود وجدولة الأقساط</span>
          </div>
          <h1 className="text-2xl font-black text-slate-800">عقود العملاء والشروط المالية</h1>
          <p className="text-xs text-slate-500 mt-1">
            إنشاء العقود الرسمية المعتمدة، جدولة الدفعات والأقساط، ودعم عقود الفرش الكامل المتكاملة.
          </p>
        </div>

        {hasPermission('contract.create') && (
          <button
            onClick={() => setIsModalOpen(true)}
            className="inline-flex items-center gap-2 px-4 py-2.5 bg-tree-green hover:bg-tree-green-dark text-white rounded-xl font-bold text-sm shadow-sm transition-all shrink-0 cursor-pointer"
          >
            <Plus size={18} />
            <span>تحرير عقد جديد</span>
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
        data={contracts}
        searchPlaceholder="بحث برقم العقد، اسم العميل، أو الكود..."
        searchField="customerName"
      />

      {/* View Contract Modal (Print-Ready) */}
      <Modal
        isOpen={Boolean(viewingContract)}
        onClose={() => setViewingContract(null)}
        title={`العقد الرسمي: ${viewingContract?.contractNumber || ''}`}
        maxWidth="max-w-4xl"
      >
        <div className="space-y-6 p-4 bg-white border border-slate-200 rounded-xl" id="printable-contract">
          {/* Contract Header with Tree House Logo */}
          <div className="flex items-center justify-between border-b-2 border-tree-green pb-4">
            <TreeHouseLogo size={52} showText={true} />
            <div className="text-left font-mono">
              <div className="text-sm font-bold text-slate-800">رقم العقد: {viewingContract?.contractNumber}</div>
              <div className="text-xs text-slate-500">التاريخ: {new Date(viewingContract?.createdAt || Date.now()).toLocaleDateString('ar-EG')}</div>
            </div>
          </div>

          <div className="text-center py-2">
            <h2 className="text-xl font-black text-tree-brown">
              عقد توريد وتنفيذ أعمال ({viewingContract?.contractType})
            </h2>
          </div>

          {/* Parties */}
          <div className="bg-slate-50 p-4 rounded-xl border border-slate-200 text-xs leading-relaxed space-y-2">
            <div><strong>الطرف الأول (الشركة):</strong> شركة Tree House للأعمال والديكور الذكي.</div>
            <div>
              <strong>الطرف الثاني (العميل):</strong> {viewingContract?.customerName} — الرقم القومي: <span className="font-mono font-bold">{viewingContract?.customerNationalId || 'مسجل بالعقد'}</span> — كود: <span className="font-mono">{viewingContract?.customerCode}</span>
            </div>
          </div>

          {/* Financials & Installments */}
          <div className="space-y-3">
            <h4 className="text-sm font-bold text-slate-800 border-b pb-1">الشروط المالية والجدول الزمني للدفعات:</h4>
            <div className="grid grid-cols-3 gap-3 text-center">
              <div className="p-3 bg-slate-50 border rounded-lg">
                <div className="text-[11px] text-slate-500">إجمالي قيمة العقد</div>
                <div className="text-base font-black text-slate-800 font-mono">{Number(viewingContract?.totalAmount).toLocaleString()} ج.م</div>
              </div>
              <div className="p-3 bg-emerald-50 border border-emerald-200 rounded-lg">
                <div className="text-[11px] text-emerald-700">مقدم التعاقد (مدفوع)</div>
                <div className="text-base font-black text-emerald-800 font-mono">{Number(viewingContract?.downPayment).toLocaleString()} ج.م</div>
              </div>
              <div className="p-3 bg-amber-50 border border-amber-200 rounded-lg">
                <div className="text-[11px] text-amber-700">المبلغ المتبقي بالأقساط</div>
                <div className="text-base font-black text-amber-800 font-mono">{Number(viewingContract?.remainingAmount).toLocaleString()} ج.م</div>
              </div>
            </div>

            {/* Installments Table */}
            {viewingContract?.installments?.length > 0 && (
              <div className="overflow-x-auto border rounded-xl mt-3">
                <table className="w-full text-xs text-right">
                  <thead className="bg-slate-100 font-bold border-b">
                    <tr>
                      <th className="p-2">الدفعة</th>
                      <th className="p-2">البيان</th>
                      <th className="p-2">المبلغ</th>
                      <th className="p-2">تاريخ الاستحقاق</th>
                      <th className="p-2">الحالة</th>
                    </tr>
                  </thead>
                  <tbody className="divide-y">
                    {viewingContract.installments.map((inst, idx) => (
                      <tr key={idx}>
                        <td className="p-2 font-bold text-slate-500">دفعة {inst.number || idx + 1}</td>
                        <td className="p-2 font-semibold">{inst.notes || 'قسط مستحق'}</td>
                        <td className="p-2 font-mono font-bold">{Number(inst.amount).toLocaleString()} ج.م</td>
                        <td className="p-2 font-mono text-slate-500">{inst.dueDate || '-'}</td>
                        <td className="p-2">
                          <span className={`px-2 py-0.5 rounded text-[10px] font-bold ${
                            inst.status === 'مدفوع' ? 'bg-emerald-100 text-emerald-800' : 'bg-amber-100 text-amber-800'
                          }`}>
                            {inst.status}
                          </span>
                        </td>
                      </tr>
                    ))}
                  </tbody>
                </table>
              </div>
            )}
          </div>

          <div className="flex justify-end gap-3 pt-3 border-t">
            <button
              onClick={() => window.print()}
              className="inline-flex items-center gap-1.5 px-4 py-2 bg-tree-green text-white rounded-lg text-xs font-bold cursor-pointer"
            >
              <Printer size={15} />
              <span>طباعة العقد الرسمي</span>
            </button>
          </div>
        </div>
      </Modal>

      {/* Add Contract Modal */}
      <Modal
        isOpen={isModalOpen}
        onClose={() => setIsModalOpen(false)}
        title="تحرير عقد جديد وجدولة الدفعات"
        maxWidth="max-w-3xl"
      >
        <form onSubmit={handleSubmit} className="space-y-4">
          <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
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
          </div>

          <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
            <div>
              <label className="block text-xs font-bold text-slate-700 mb-1">إجمالي قيمة العقد (ج.م) *</label>
              <input
                type="number"
                required
                min="0"
                value={formData.totalAmount}
                onChange={(e) => setFormData({ ...formData, totalAmount: e.target.value })}
                className="w-full px-3 py-2 bg-slate-50 border border-slate-200 rounded-xl text-sm font-mono"
              />
            </div>
            <div>
              <label className="block text-xs font-bold text-slate-700 mb-1">مقدم التعاقد (ج.م)</label>
              <input
                type="number"
                min="0"
                value={formData.downPayment}
                onChange={(e) => setFormData({ ...formData, downPayment: e.target.value })}
                className="w-full px-3 py-2 bg-slate-50 border border-slate-200 rounded-xl text-sm font-mono"
              />
            </div>
          </div>

          {/* Dynamic Installments Schedule */}
          <div className="bg-slate-50 p-4 rounded-xl border border-slate-200">
            <div className="flex items-center justify-between mb-3">
              <label className="text-xs font-extrabold text-slate-800">جدولة الأقساط والدفعات المتبقية:</label>
              <button
                type="button"
                onClick={handleAddInstallment}
                className="text-xs font-bold text-tree-green hover:underline cursor-pointer"
              >
                + إضافة دفعة أخرى
              </button>
            </div>

            <div className="space-y-2.5">
              {formData.installments.map((inst, idx) => (
                <div key={idx} className="flex flex-col sm:flex-row items-center gap-2 p-2 bg-white rounded-lg border">
                  <input
                    type="text"
                    placeholder="بيان الدفعة"
                    value={inst.title}
                    onChange={(e) => handleInstallmentChange(idx, 'title', e.target.value)}
                    className="flex-1 px-2.5 py-1.5 border rounded-lg text-xs"
                  />
                  <input
                    type="number"
                    placeholder="قيمة الدفعة (ج.م)"
                    value={inst.amount}
                    onChange={(e) => handleInstallmentChange(idx, 'amount', e.target.value)}
                    className="w-32 px-2.5 py-1.5 border rounded-lg text-xs font-mono"
                  />
                  <input
                    type="date"
                    value={inst.dueDate}
                    onChange={(e) => handleInstallmentChange(idx, 'dueDate', e.target.value)}
                    className="w-36 px-2.5 py-1.5 border rounded-lg text-xs font-mono"
                  />
                  {formData.installments.length > 1 && (
                    <button
                      type="button"
                      onClick={() => handleRemoveInstallment(idx)}
                      className="text-red-500 p-1 hover:bg-red-50 rounded"
                    >
                      ✕
                    </button>
                  )}
                </div>
              ))}
            </div>
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
              إنشاء العقد وتثبيت الدفعات
            </button>
          </div>
        </form>
      </Modal>
    </div>
  );
}
