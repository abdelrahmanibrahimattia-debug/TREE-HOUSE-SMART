import React, { useState, useEffect } from 'react';
import { api } from '../api/client.js';
import DataTable from '../components/DataTable.jsx';
import Modal from '../components/Modal.jsx';
import { useAuth } from '../context/AuthContext.jsx';
import { Truck, Plus, CheckCircle2, AlertCircle } from 'lucide-react';

export default function SupplyDeliveryPage() {
  const { hasPermission } = useAuth();
  const [supplies, setSupplies] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState('');
  const [success, setSuccess] = useState('');

  const [isModalOpen, setIsModalOpen] = useState(false);
  const [formData, setFormData] = useState({
    customerCode: '',
    contractNumber: '',
    title: '',
    stage: 'توريد أخشاب وشاسيهات',
    deliveryDate: new Date().toISOString().split('T')[0],
    receivedBy: '',
    notes: ''
  });

  const loadSupplies = async () => {
    setLoading(true);
    try {
      const res = await api.get('/supplies');
      setSupplies(res.data || []);
    } catch (err) {
      setError(err.message || 'فشل جلب قائمة التوريدات.');
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    loadSupplies();
  }, []);

  const handleSubmit = async (e) => {
    e.preventDefault();
    try {
      await api.post('/supplies', formData);
      setSuccess('تم تسجيل عملية التوريد والتسليم بنجاح.');
      setIsModalOpen(false);
      loadSupplies();
    } catch (err) {
      setError(err.message || 'تعذر تسجيل التوريد.');
    }
  };

  const columns = [
    {
      header: 'كود التوريد',
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
      header: 'مرحلة التوريد',
      accessor: 'stage',
      render: (row) => (
        <span className="font-bold text-xs bg-emerald-50 text-emerald-800 border border-emerald-200 px-2 py-0.5 rounded">
          {row.stage}
        </span>
      )
    },
    {
      header: 'تاريخ التوريد',
      accessor: 'deliveryDate',
      className: 'font-mono text-xs'
    },
    {
      header: 'مستلم الموقع',
      accessor: 'receivedBy'
    },
    {
      header: 'الحالة',
      accessor: 'status',
      render: (row) => (
        <span className="text-xs font-bold px-2.5 py-1 rounded-full bg-slate-100 text-slate-700">
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
            <Truck size={18} />
            <span>العمليات الميدانية واللوجستيات</span>
          </div>
          <h1 className="text-2xl font-black text-slate-800">التوريدات والتسليمات الميدانية</h1>
          <p className="text-xs text-slate-500 mt-1">
            متابعة شحنات الموقع، توريد الأخشاب والرخام والأجهزة، وتوثيق استلامات العملاء.
          </p>
        </div>

        {hasPermission('crm.edit') && (
          <button
            onClick={() => setIsModalOpen(true)}
            className="inline-flex items-center gap-2 px-4 py-2.5 bg-tree-green hover:bg-tree-green-dark text-white rounded-xl font-bold text-sm shadow-sm transition-all shrink-0 cursor-pointer"
          >
            <Plus size={18} />
            <span>تسجيل توريد جديد</span>
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
        data={supplies}
        searchPlaceholder="بحث بكود العميل أو كود التوريد أو المرحلة..."
        searchField="customerName"
      />

      <Modal
        isOpen={isModalOpen}
        onClose={() => setIsModalOpen(false)}
        title="تسجيل عملية توريد وتسليم جديدة"
        maxWidth="max-w-xl"
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

          <div>
            <label className="block text-xs font-bold text-slate-700 mb-1">بيان التوريد *</label>
            <input
              type="text"
              required
              placeholder="مثال: توريد الكبائن السفلية والعلوية للمطبخ"
              value={formData.title}
              onChange={(e) => setFormData({ ...formData, title: e.target.value })}
              className="w-full px-3 py-2 bg-slate-50 border border-slate-200 rounded-xl text-sm"
            />
          </div>

          <div className="grid grid-cols-2 gap-4">
            <div>
              <label className="block text-xs font-bold text-slate-700 mb-1">مرحلة التوريد *</label>
              <select
                value={formData.stage}
                onChange={(e) => setFormData({ ...formData, stage: e.target.value })}
                className="w-full px-3 py-2 bg-slate-50 border border-slate-200 rounded-xl text-sm font-bold"
              >
                <option value="توريد أخشاب وشاسيهات">توريد أخشاب وشاسيهات</option>
                <option value="توريد وتركيب رخام">توريد وتركيب رخام</option>
                <option value="توريد أجهزة وأحواض">توريد أجهزة وأحواض</option>
                <option value="توريد دواليب ودريسنج">توريد دواليب ودريسنج</option>
                <option value="تسليم نهائي للموقع">تسليم نهائي للموقع</option>
              </select>
            </div>
            <div>
              <label className="block text-xs font-bold text-slate-700 mb-1">تاريخ التوريد</label>
              <input
                type="date"
                value={formData.deliveryDate}
                onChange={(e) => setFormData({ ...formData, deliveryDate: e.target.value })}
                className="w-full px-3 py-2 bg-slate-50 border border-slate-200 rounded-xl text-sm"
              />
            </div>
          </div>

          <div>
            <label className="block text-xs font-bold text-slate-700 mb-1">اسم مستلم الموقع</label>
            <input
              type="text"
              placeholder="اسم العميل أو المهندس المشرف في الموقع"
              value={formData.receivedBy}
              onChange={(e) => setFormData({ ...formData, receivedBy: e.target.value })}
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
              حفظ أمر التوريد
            </button>
          </div>
        </form>
      </Modal>
    </div>
  );
}
