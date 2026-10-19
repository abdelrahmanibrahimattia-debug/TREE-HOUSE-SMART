import React, { useState, useEffect } from 'react';
import { api } from '../api/client.js';
import DataTable from '../components/DataTable.jsx';
import Modal from '../components/Modal.jsx';
import CustomerReadOnlyDossierModal from '../components/CustomerReadOnlyDossierModal.jsx';
import { useAuth } from '../context/AuthContext.jsx';
import {
  Users,
  UserPlus,
  Phone,
  CreditCard,
  MapPin,
  Tag,
  CheckCircle2,
  AlertCircle,
  Eye,
  FileSpreadsheet,
  Plus,
  Trash2,
  Sparkles,
  ClipboardPaste,
  Shield,
  Layers
} from 'lucide-react';

const CONTRACT_TYPE_OPTIONS = [
  { id: 'الفرش كامل', label: 'الفرش كامل (Full Furnishing)', highlight: true },
  { id: 'مطبخ', label: 'مطبخ' },
  { id: 'دريسنج', label: 'دريسنج' },
  { id: 'غرف نوم وأثاث', label: 'غرف نوم وأثاث' },
  { id: 'وحدات حمام', label: 'وحدات حمام' }
];

export default function CustomersPage() {
  const { hasPermission } = useAuth();
  const [customers, setCustomers] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState('');
  const [success, setSuccess] = useState('');

  // Read-only Dossier Modal
  const [viewCustomerCode, setViewCustomerCode] = useState(null);

  // Add/Edit Modal State
  const [isModalOpen, setIsModalOpen] = useState(false);
  const [editingCustomer, setEditingCustomer] = useState(null);
  const [formData, setFormData] = useState({
    name: '',
    phone: '',
    secondaryPhone: '',
    nationalId: '',
    isLegacyCustomer: false,
    address: '',
    contractTypes: ['الفرش كامل'],
    status: 'جديد',
    assignedEngineer: '',
    assignedContractEngineer: '',
    siteSupervisor: '',
    notes: ''
  });

  // Bulk Add Modal State
  const [isBulkModalOpen, setIsBulkModalOpen] = useState(false);
  const [bulkRows, setBulkRows] = useState([
    { name: '', phone: '', nationalId: '', isLegacy: true, contractTypes: ['الفرش كامل'], address: '' },
    { name: '', phone: '', nationalId: '', isLegacy: true, contractTypes: ['الفرش كامل'], address: '' },
    { name: '', phone: '', nationalId: '', isLegacy: true, contractTypes: ['الفرش كامل'], address: '' }
  ]);
  const [excelPasteText, setExcelPasteText] = useState('');
  const [bulkMode, setBulkMode] = useState('table'); // 'table' | 'paste'
  const [bulkSubmitting, setBulkSubmitting] = useState(false);

  const loadCustomers = async () => {
    setLoading(true);
    try {
      const res = await api.get('/customers');
      setCustomers(res.data || []);
    } catch (err) {
      setError(err.message || 'فشل جلب قائمة العملاء.');
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    loadCustomers();
  }, []);

  const handleOpenAdd = () => {
    setEditingCustomer(null);
    setFormData({
      name: '',
      phone: '',
      secondaryPhone: '',
      nationalId: '',
      isLegacyCustomer: false,
      address: '',
      contractTypes: ['الفرش كامل'],
      status: 'جديد',
      assignedEngineer: '',
      assignedContractEngineer: '',
      siteSupervisor: '',
      notes: ''
    });
    setIsModalOpen(true);
  };

  const handleOpenEdit = (cust) => {
    const isLegacy = cust.nationalId === 'عميل قبل السيستم' || !cust.nationalId;
    setEditingCustomer(cust);
    setFormData({
      name: cust.name || '',
      phone: cust.phone || '',
      secondaryPhone: cust.secondaryPhone || '',
      nationalId: cust.nationalId || (isLegacy ? 'عميل قبل السيستم' : ''),
      isLegacyCustomer: isLegacy,
      address: cust.address || '',
      contractTypes: Array.isArray(cust.contractTypes) ? cust.contractTypes : ['الفرش كامل'],
      status: cust.status || 'جديد',
      assignedEngineer: cust.assignedEngineer || '',
      assignedContractEngineer: cust.assignedContractEngineer || '',
      siteSupervisor: cust.siteSupervisor || '',
      notes: cust.notes || ''
    });
    setIsModalOpen(true);
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    setError('');

    // Handle National ID: If marked as legacy or left blank, write "عميل قبل السيستم"
    let finalNationalId = formData.nationalId ? formData.nationalId.trim() : '';
    if (formData.isLegacyCustomer || !finalNationalId || finalNationalId === 'عميل قبل السيستم') {
      finalNationalId = 'عميل قبل السيستم';
    } else if (finalNationalId.length !== 14 && !finalNationalId.includes('قبل السيستم')) {
      setError('تنبيه: الرقم القومي المصري يجب أن يتكون من 14 رقماً، أو اختر "عميل قبل السيستم".');
      return;
    }

    const payload = {
      ...formData,
      nationalId: finalNationalId
    };

    try {
      if (editingCustomer) {
        await api.put(`/customers/${editingCustomer.id}`, payload);
        setSuccess('تم تحديث بيانات العميل بنجاح.');
      } else {
        await api.post('/customers', payload);
        setSuccess('تم تسجيل العميل الجديد بنجاح.');
      }
      setIsModalOpen(false);
      loadCustomers();
    } catch (err) {
      setError(err.message || 'حدث خطأ أثناء حفظ بيانات العميل.');
    }
  };

  // Bulk Operations
  const handleAddBulkRow = () => {
    setBulkRows(prev => [
      ...prev,
      { name: '', phone: '', nationalId: '', isLegacy: true, contractTypes: ['الفرش كامل'], address: '' }
    ]);
  };

  const handleRemoveBulkRow = (index) => {
    setBulkRows(prev => prev.filter((_, idx) => idx !== index));
  };

  const handleBulkRowChange = (index, field, value) => {
    setBulkRows(prev => {
      const copy = [...prev];
      copy[index] = { ...copy[index], [field]: value };
      return copy;
    });
  };

  const handleParseExcelPaste = () => {
    if (!excelPasteText.trim()) return;
    const lines = excelPasteText.trim().split('\n');
    const parsed = lines.map(line => {
      const parts = line.split('\t').map(p => p.trim());
      // Expecting: Name | Phone | NationalId | ContractType | Address
      const name = parts[0] || '';
      const phone = parts[1] || '';
      let nationalId = parts[2] || '';
      let isLegacy = false;
      if (!nationalId || nationalId === 'عميل قبل السيستم' || nationalId.length !== 14) {
        nationalId = 'عميل قبل السيستم';
        isLegacy = true;
      }
      const contractTypes = parts[3] ? [parts[3]] : ['الفرش كامل'];
      const address = parts[4] || '';

      return { name, phone, nationalId, isLegacy, contractTypes, address };
    }).filter(r => r.name);

    if (parsed.length > 0) {
      setBulkRows(parsed);
      setBulkMode('table');
      setExcelPasteText('');
    } else {
      alert('لم يتم التعرف على أي أسطر صالحة. تأكد من نسخ البيانات من جدول إكسيل.');
    }
  };

  const handleBulkSubmit = async () => {
    const validRows = bulkRows.filter(r => r.name && r.name.trim());
    if (validRows.length === 0) {
      alert('يرجى ملء اسم عميل واحد على الأقل في الجدول.');
      return;
    }

    setBulkSubmitting(true);
    try {
      const formatted = validRows.map(r => ({
        name: r.name.trim(),
        phone: r.phone ? r.phone.trim() : 'غير مسجل',
        nationalId: (!r.nationalId || r.isLegacy || r.nationalId === 'عميل قبل السيستم') ? 'عميل قبل السيستم' : r.nationalId.trim(),
        contractTypes: r.contractTypes || ['الفرش كامل'],
        address: r.address || null
      }));

      const res = await api.post('/customers/bulk', { customers: formatted });
      setSuccess(`تمت إضافة ${res.data?.createdCount || formatted.length} عميل بنجاح!`);
      setIsBulkModalOpen(false);
      setBulkRows([
        { name: '', phone: '', nationalId: '', isLegacy: true, contractTypes: ['الفرش كامل'], address: '' },
        { name: '', phone: '', nationalId: '', isLegacy: true, contractTypes: ['الفرش كامل'], address: '' }
      ]);
      loadCustomers();
    } catch (err) {
      alert(err.message || 'فشلت الإضافة المجمعة للعملاء');
    } finally {
      setBulkSubmitting(false);
    }
  };

  const columns = [
    {
      header: 'كود العميل',
      accessor: 'code',
      className: 'font-mono font-bold text-tree-green'
    },
    {
      header: 'اسم العميل',
      accessor: 'name',
      render: (row) => (
        <div>
          <div className="font-bold text-slate-800">{row.name}</div>
          <div className="text-xs text-slate-400 flex items-center gap-1 font-mono dir-ltr mt-0.5">
            <Phone size={12} /> {row.phone}
          </div>
        </div>
      )
    },
    {
      header: 'الرقم القومي',
      accessor: 'nationalId',
      render: (row) => {
        const isLegacy = row.nationalId === 'عميل قبل السيستم' || !row.nationalId || String(row.nationalId).includes('قبل السيستم');
        return isLegacy ? (
          <span className="inline-flex items-center gap-1 text-[11px] font-bold text-amber-900 bg-amber-50 border border-amber-200 px-2 py-0.5 rounded-md">
            🏛️ عميل قبل السيستم
          </span>
        ) : (
          <span className="font-mono text-xs text-slate-700 bg-slate-100 px-2 py-0.5 rounded font-semibold">
            🆔 {row.nationalId}
          </span>
        );
      }
    },
    {
      header: 'أنواع التعاقد',
      render: (row) => {
        const types = Array.isArray(row.contractTypes) ? row.contractTypes : [];
        return (
          <div className="flex flex-wrap gap-1">
            {types.map((t, idx) => (
              <span
                key={idx}
                className={`text-[11px] font-bold px-2 py-0.5 rounded-md ${
                  t === 'الفرش كامل'
                    ? 'bg-amber-100 text-amber-900 border border-amber-300 shadow-xs'
                    : 'bg-emerald-50 text-emerald-800 border border-emerald-200'
                }`}
              >
                {t}
              </span>
            ))}
          </div>
        );
      }
    },
    {
      header: 'حالة العميل',
      accessor: 'status',
      render: (row) => (
        <span className="px-2.5 py-1 rounded-full text-xs font-bold bg-slate-100 text-slate-700">
          {row.status}
        </span>
      )
    },
    {
      header: 'لوحة العرض والإجراءات',
      render: (row) => (
        <div className="flex items-center gap-2">
          {/* Read-Only 360 Showcase Button */}
          <button
            onClick={() => setViewCustomerCode(row.code)}
            className="inline-flex items-center gap-1.5 px-3 py-1.5 bg-slate-800 hover:bg-slate-900 text-white font-bold rounded-xl text-xs shadow-xs transition-all cursor-pointer"
            title="عرض ملف العميل الشامل (بدون تعديل)"
          >
            <Eye size={14} className="text-emerald-400" />
            <span>عرض شامل (محمي)</span>
          </button>

          {hasPermission('crm.edit') && (
            <button
              onClick={() => handleOpenEdit(row)}
              className="text-xs font-bold text-slate-500 hover:text-tree-green hover:underline cursor-pointer px-2 py-1"
            >
              تعديل
            </button>
          )}
        </div>
      )
    }
  ];

  return (
    <div className="space-y-6">
      {/* Header */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4 bg-white p-6 rounded-2xl border border-slate-100 shadow-sm">
        <div>
          <div className="flex items-center gap-2 text-tree-green font-bold text-sm mb-1">
            <Users size={18} />
            <span>إدارة العملاء والعلاقات</span>
          </div>
          <h1 className="text-2xl font-black text-slate-800">قاعدة بيانات العملاء (CRM)</h1>
          <p className="text-xs text-slate-500 mt-1">
            إدارة العملاء، لوحة العرض الشاملة بدون تعديل، الإضافة المجمعة، ودعم عملاء ما قبل السيستم.
          </p>
        </div>

        <div className="flex flex-wrap items-center gap-2.5">
          {hasPermission('crm.create') && (
            <>
              {/* Bulk Add Button */}
              <button
                onClick={() => setIsBulkModalOpen(true)}
                className="inline-flex items-center gap-2 px-4 py-2.5 bg-indigo-700 hover:bg-indigo-800 text-white rounded-xl font-bold text-xs shadow-sm transition-all cursor-pointer"
              >
                <FileSpreadsheet size={16} />
                <span>إضافة مجمعة (دفعة واحدة)</span>
              </button>

              {/* Single Add Button */}
              <button
                onClick={handleOpenAdd}
                className="inline-flex items-center gap-2 px-4 py-2.5 bg-tree-green hover:bg-tree-green-dark text-white rounded-xl font-bold text-xs shadow-sm transition-all cursor-pointer"
              >
                <UserPlus size={16} />
                <span>تسجيل عميل جديد</span>
              </button>
            </>
          )}
        </div>
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

      {/* Main Customers DataTable */}
      <DataTable
        title="كشف العملاء المسجلين"
        data={customers}
        columns={columns}
        loading={loading}
        searchPlaceholder="بحث باسم العميل، الكود، الهاتف، أو الرقم القومي..."
      />

      {/* 1. Read-Only 360 Customer Showcase Modal */}
      {viewCustomerCode && (
        <CustomerReadOnlyDossierModal
          customerCode={viewCustomerCode}
          onClose={() => setViewCustomerCode(null)}
        />
      )}

      {/* 2. Single Customer Add/Edit Modal */}
      <Modal
        isOpen={isModalOpen}
        onClose={() => setIsModalOpen(false)}
        title={editingCustomer ? `تعديل بيانات العميل (${editingCustomer.code})` : 'تسجيل عميل جديد في المنظومة'}
        maxWidth="max-w-2xl"
      >
        <form onSubmit={handleSubmit} className="space-y-4 text-xs">
          <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
            <div>
              <label className="block text-slate-700 font-bold mb-1">اسم العميل بالكامل *</label>
              <input
                type="text"
                required
                placeholder="مثال: أحمد محمد علي"
                value={formData.name}
                onChange={(e) => setFormData({ ...formData, name: e.target.value })}
                className="w-full p-2.5 bg-slate-50 border border-slate-200 rounded-xl focus:outline-none focus:ring-2 focus:ring-tree-green text-sm"
              />
            </div>

            <div>
              <label className="block text-slate-700 font-bold mb-1">رقم الهاتف الأساسي *</label>
              <input
                type="tel"
                required
                placeholder="01XXXXXXXXX"
                value={formData.phone}
                onChange={(e) => setFormData({ ...formData, phone: e.target.value })}
                className="w-full p-2.5 bg-slate-50 border border-slate-200 rounded-xl focus:outline-none focus:ring-2 focus:ring-tree-green text-sm font-mono dir-ltr text-right"
              />
            </div>
          </div>

          <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
            <div>
              <label className="block text-slate-700 font-bold mb-1">رقم هاتف بديل / واتساب</label>
              <input
                type="tel"
                placeholder="01XXXXXXXXX"
                value={formData.secondaryPhone}
                onChange={(e) => setFormData({ ...formData, secondaryPhone: e.target.value })}
                className="w-full p-2.5 bg-slate-50 border border-slate-200 rounded-xl focus:outline-none focus:ring-2 focus:ring-tree-green text-sm font-mono dir-ltr text-right"
              />
            </div>

            {/* National ID with Legacy Customer Toggle */}
            <div>
              <div className="flex items-center justify-between mb-1">
                <label className="text-slate-700 font-bold">الرقم القومي (14 رقم)</label>
                <label className="flex items-center gap-1.5 cursor-pointer text-[11px] font-bold text-amber-800 bg-amber-50 px-2 py-0.5 rounded border border-amber-200 select-none">
                  <input
                    type="checkbox"
                    checked={formData.isLegacyCustomer || formData.nationalId === 'عميل قبل السيستم'}
                    onChange={(e) => {
                      const checked = e.target.checked;
                      setFormData({
                        ...formData,
                        isLegacyCustomer: checked,
                        nationalId: checked ? 'عميل قبل السيستم' : ''
                      });
                    }}
                    className="w-3.5 h-3.5 accent-tree-green"
                  />
                  <span>عميل قبل السيستم</span>
                </label>
              </div>

              <input
                type="text"
                placeholder={formData.isLegacyCustomer ? 'عميل قبل السيستم' : '14 رقماً أو اتركه فارغاً لتعيينه عميل قبل السيستم'}
                value={formData.nationalId}
                disabled={formData.isLegacyCustomer}
                onChange={(e) => setFormData({ ...formData, nationalId: e.target.value })}
                className={`w-full p-2.5 border rounded-xl text-sm font-mono ${
                  formData.isLegacyCustomer
                    ? 'bg-amber-50/60 border-amber-200 text-amber-900 font-bold'
                    : 'bg-slate-50 border-slate-200 focus:outline-none focus:ring-2 focus:ring-tree-green'
                }`}
              />
              <span className="text-[10px] text-slate-400 mt-0.5 block">
                {formData.isLegacyCustomer || formData.nationalId === 'عميل قبل السيستم'
                  ? '✓ مسجل كعميل قديم بدون رقم قومي وسيقبل النظام حفظه فوراً.'
                  : 'إذا كان العميل قديماً لا يملك رقماً قومياً، اضغط على خيار "عميل قبل السيستم".'}
              </span>
            </div>
          </div>

          <div>
            <label className="block text-slate-700 font-bold mb-1">العنوان والموقع الميداني</label>
            <input
              type="text"
              placeholder="المدينة، الحي، اسم العمارة ورقم الشقة..."
              value={formData.address}
              onChange={(e) => setFormData({ ...formData, address: e.target.value })}
              className="w-full p-2.5 bg-slate-50 border border-slate-200 rounded-xl focus:outline-none focus:ring-2 focus:ring-tree-green text-sm"
            />
          </div>

          <div>
            <label className="block text-slate-700 font-bold mb-1.5">أنواع التعاقد المستهدفة (يمكن اختيار أكثر من نوع) *</label>
            <div className="grid grid-cols-2 sm:grid-cols-3 gap-2">
              {CONTRACT_TYPE_OPTIONS.map((opt) => {
                const isSelected = formData.contractTypes.includes(opt.id);
                return (
                  <button
                    type="button"
                    key={opt.id}
                    onClick={() => {
                      const current = [...formData.contractTypes];
                      const index = current.indexOf(opt.id);
                      if (index > -1) {
                        if (current.length > 1) current.splice(index, 1);
                      } else {
                        current.push(opt.id);
                      }
                      setFormData({ ...formData, contractTypes: current });
                    }}
                    className={`p-2 rounded-xl text-xs font-bold text-right border transition-all cursor-pointer flex items-center justify-between ${
                      isSelected
                        ? opt.highlight
                          ? 'bg-amber-100 border-amber-400 text-amber-950 font-black'
                          : 'bg-emerald-50 border-tree-green text-tree-green font-black'
                        : 'bg-slate-50 border-slate-200 text-slate-600 hover:bg-slate-100'
                    }`}
                  >
                    <span>{opt.label}</span>
                    {isSelected && <CheckCircle2 size={14} className={opt.highlight ? 'text-amber-800' : 'text-tree-green'} />}
                  </button>
                );
              })}
            </div>
          </div>

          <div className="grid grid-cols-1 sm:grid-cols-3 gap-3">
            <div>
              <label className="block text-slate-700 font-bold mb-1">مهندس المعاينة</label>
              <input
                type="text"
                placeholder="اسم المهندس"
                value={formData.assignedEngineer}
                onChange={(e) => setFormData({ ...formData, assignedEngineer: e.target.value })}
                className="w-full p-2.5 bg-slate-50 border border-slate-200 rounded-xl text-xs"
              />
            </div>
            <div>
              <label className="block text-slate-700 font-bold mb-1">مهندس التعاقد</label>
              <input
                type="text"
                placeholder="اسم المهندس"
                value={formData.assignedContractEngineer}
                onChange={(e) => setFormData({ ...formData, assignedContractEngineer: e.target.value })}
                className="w-full p-2.5 bg-slate-50 border border-slate-200 rounded-xl text-xs"
              />
            </div>
            <div>
              <label className="block text-slate-700 font-bold mb-1">مشرف الموقع</label>
              <input
                type="text"
                placeholder="اسم المشرف"
                value={formData.siteSupervisor}
                onChange={(e) => setFormData({ ...formData, siteSupervisor: e.target.value })}
                className="w-full p-2.5 bg-slate-50 border border-slate-200 rounded-xl text-xs"
              />
            </div>
          </div>

          <div>
            <label className="block text-slate-700 font-bold mb-1">ملاحظات العميل</label>
            <textarea
              rows="2"
              placeholder="أي تفاصيل أو رغبات خاصة بالعميل..."
              value={formData.notes}
              onChange={(e) => setFormData({ ...formData, notes: e.target.value })}
              className="w-full p-2.5 bg-slate-50 border border-slate-200 rounded-xl text-xs"
            />
          </div>

          <div className="flex items-center justify-end gap-2 pt-3 border-t border-slate-100">
            <button
              type="button"
              onClick={() => setIsModalOpen(false)}
              className="px-4 py-2 bg-slate-100 hover:bg-slate-200 text-slate-700 font-bold rounded-xl transition cursor-pointer"
            >
              إلغاء
            </button>
            <button
              type="submit"
              className="px-5 py-2 bg-tree-green hover:bg-tree-green-dark text-white font-bold rounded-xl shadow-xs transition cursor-pointer"
            >
              {editingCustomer ? 'حفظ التعديلات' : 'تسجيل وتأكيد العميل'}
            </button>
          </div>
        </form>
      </Modal>

      {/* 3. Bulk Add Customers Modal */}
      <Modal
        isOpen={isBulkModalOpen}
        onClose={() => setIsBulkModalOpen(false)}
        title="📥 إضافة مجمعة للعملاء دفعة واحدة (Batch Import)"
        maxWidth="max-w-4xl"
      >
        <div className="space-y-4 text-xs">
          {/* Sub tabs inside Bulk modal */}
          <div className="flex items-center justify-between border-b border-slate-200 pb-2">
            <div className="flex items-center gap-2">
              <button
                type="button"
                onClick={() => setBulkMode('table')}
                className={`px-3 py-1.5 rounded-xl font-bold transition cursor-pointer ${
                  bulkMode === 'table' ? 'bg-indigo-700 text-white' : 'bg-slate-100 text-slate-600'
                }`}
              >
                جدول إدخال سريع ({bulkRows.length} صفوف)
              </button>
              <button
                type="button"
                onClick={() => setBulkMode('paste')}
                className={`px-3 py-1.5 rounded-xl font-bold transition cursor-pointer flex items-center gap-1 ${
                  bulkMode === 'paste' ? 'bg-indigo-700 text-white' : 'bg-slate-100 text-slate-600'
                }`}
              >
                <ClipboardPaste size={14} />
                <span>لصق مباشر من إكسيل (Excel)</span>
              </button>
            </div>

            {bulkMode === 'table' && (
              <button
                type="button"
                onClick={handleAddBulkRow}
                className="flex items-center gap-1 px-3 py-1.5 bg-slate-100 hover:bg-slate-200 text-slate-700 rounded-xl font-bold transition cursor-pointer"
              >
                <Plus size={14} /> إضافة صف عميل آخر
              </button>
            )}
          </div>

          {bulkMode === 'table' ? (
            <div className="overflow-x-auto max-h-[50vh] border border-slate-200 rounded-2xl">
              <table className="w-full text-right text-xs">
                <thead className="bg-slate-100 text-slate-700 font-bold sticky top-0 border-b border-slate-200">
                  <tr>
                    <th className="p-2.5 w-8">#</th>
                    <th className="p-2.5">اسم العميل *</th>
                    <th className="p-2.5">الهاتف *</th>
                    <th className="p-2.5">الرقم القومي</th>
                    <th className="p-2.5">نوع التعاقد</th>
                    <th className="p-2.5">العنوان</th>
                    <th className="p-2.5 w-10 text-center">حذف</th>
                  </tr>
                </thead>
                <tbody className="divide-y divide-slate-100">
                  {bulkRows.map((row, idx) => (
                    <tr key={idx} className="hover:bg-slate-50/80">
                      <td className="p-2 text-slate-400 font-mono font-bold text-center">{idx + 1}</td>
                      <td className="p-2">
                        <input
                          type="text"
                          placeholder="اسم العميل"
                          value={row.name}
                          onChange={(e) => handleBulkRowChange(idx, 'name', e.target.value)}
                          className="w-full p-2 border border-slate-200 rounded-lg focus:outline-none focus:border-indigo-600"
                        />
                      </td>
                      <td className="p-2">
                        <input
                          type="text"
                          placeholder="01XXXXXXXXX"
                          value={row.phone}
                          onChange={(e) => handleBulkRowChange(idx, 'phone', e.target.value)}
                          className="w-full p-2 border border-slate-200 rounded-lg focus:outline-none focus:border-indigo-600 font-mono"
                        />
                      </td>
                      <td className="p-2">
                        <div className="flex items-center gap-1">
                          <input
                            type="text"
                            placeholder={row.isLegacy ? 'عميل قبل السيستم' : '14 رقم'}
                            disabled={row.isLegacy}
                            value={row.isLegacy ? 'عميل قبل السيستم' : row.nationalId}
                            onChange={(e) => handleBulkRowChange(idx, 'nationalId', e.target.value)}
                            className={`w-full p-2 border rounded-lg text-xs font-mono ${
                              row.isLegacy ? 'bg-amber-50 border-amber-200 text-amber-900 font-bold' : 'border-slate-200'
                            }`}
                          />
                          <button
                            type="button"
                            onClick={() => handleBulkRowChange(idx, 'isLegacy', !row.isLegacy)}
                            title="تبديل إلى عميل قبل السيستم"
                            className={`px-1.5 py-1 rounded text-[10px] font-bold shrink-0 cursor-pointer ${
                              row.isLegacy ? 'bg-amber-200 text-amber-900' : 'bg-slate-100 text-slate-500'
                            }`}
                          >
                            قديم
                          </button>
                        </div>
                      </td>
                      <td className="p-2">
                        <select
                          value={row.contractTypes?.[0] || 'الفرش كامل'}
                          onChange={(e) => handleBulkRowChange(idx, 'contractTypes', [e.target.value])}
                          className="w-full p-2 border border-slate-200 rounded-lg font-bold text-tree-green text-xs"
                        >
                          <option value="الفرش كامل">الفرش كامل</option>
                          <option value="مطبخ">مطبخ</option>
                          <option value="دريسنج">دريسنج</option>
                          <option value="غرف نوم وأثاث">غرف نوم وأثاث</option>
                          <option value="وحدات حمام">وحدات حمام</option>
                        </select>
                      </td>
                      <td className="p-2">
                        <input
                          type="text"
                          placeholder="المدينة / الحي"
                          value={row.address}
                          onChange={(e) => handleBulkRowChange(idx, 'address', e.target.value)}
                          className="w-full p-2 border border-slate-200 rounded-lg"
                        />
                      </td>
                      <td className="p-2 text-center">
                        <button
                          type="button"
                          onClick={() => handleRemoveBulkRow(idx)}
                          className="text-slate-400 hover:text-red-600 transition cursor-pointer"
                        >
                          <Trash2 size={16} />
                        </button>
                      </td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>
          ) : (
            <div className="space-y-3">
              <div className="p-3 bg-indigo-50 border border-indigo-200 rounded-xl text-indigo-900 text-xs">
                <strong>تعليمات اللصق من إكسيل:</strong>
                <p className="mt-1">
                  انسخ الأعمدة من الإكسيل بالترتيب التالي: <code>الاسم | الهاتف | الرقم القومي (اختياري) | نوع التعاقد | العنوان</code>.
                  أي عميل بدون رقم قومي سيتم اعتباره <strong>"عميل قبل السيستم"</strong> تلقائياً.
                </p>
              </div>

              <textarea
                rows="8"
                value={excelPasteText}
                onChange={(e) => setExcelPasteText(e.target.value)}
                placeholder="الصق الأسطر المنسوخة من إكسيل هنا مباشرة (Ctrl + V)..."
                className="w-full p-3 font-mono text-xs border border-slate-200 rounded-2xl focus:outline-none focus:ring-2 focus:ring-indigo-600"
              />

              <button
                type="button"
                onClick={handleParseExcelPaste}
                className="px-4 py-2 bg-indigo-700 hover:bg-indigo-800 text-white rounded-xl font-bold shadow-xs transition cursor-pointer"
              >
                تحويل ومعاينة البيانات في الجدول
              </button>
            </div>
          )}

          <div className="flex items-center justify-between pt-3 border-t border-slate-100">
            <span className="text-slate-500 font-bold">
              العملاء الجاهزون للإضافة: {bulkRows.filter(r => r.name.trim()).length} عميل
            </span>

            <div className="flex items-center gap-2">
              <button
                type="button"
                onClick={() => setIsBulkModalOpen(false)}
                className="px-4 py-2 bg-slate-100 hover:bg-slate-200 text-slate-700 font-bold rounded-xl transition cursor-pointer"
              >
                إلغاء
              </button>
              <button
                type="button"
                disabled={bulkSubmitting}
                onClick={handleBulkSubmit}
                className="px-5 py-2 bg-indigo-700 hover:bg-indigo-800 text-white font-bold rounded-xl shadow-xs transition cursor-pointer disabled:opacity-50"
              >
                {bulkSubmitting ? 'جاري حفظ العملاء...' : 'حفظ وإضافة كافة العملاء الآن'}
              </button>
            </div>
          </div>
        </div>
      </Modal>
    </div>
  );
}
