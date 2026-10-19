import React, { useState, useEffect } from 'react';
import { api } from '../api/client.js';
import DataTable from '../components/DataTable.jsx';
import Modal from '../components/Modal.jsx';
import { useAuth } from '../context/AuthContext.jsx';
import { Camera, Plus, Eye, Download, CheckCircle2, AlertCircle, Image as ImageIcon } from 'lucide-react';

export default function ChecksPage() {
  const { hasPermission } = useAuth();
  const [checks, setChecks] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState('');
  const [success, setSuccess] = useState('');

  // Lightbox State
  const [lightboxUrl, setLightboxUrl] = useState(null);
  const [lightboxTitle, setLightboxTitle] = useState('');

  // Add Check Modal
  const [isModalOpen, setIsModalOpen] = useState(false);
  const [formData, setFormData] = useState({
    customerCode: '',
    date: new Date().toISOString().split('T')[0],
    location: '',
    notes: '',
    contractType: 'الفرش كامل',
    fileName: '',
    fileUrl: '',
    mimeType: 'image/jpeg'
  });

  const loadChecks = async () => {
    setLoading(true);
    try {
      const res = await api.get('/checks');
      setChecks(res.data || []);
    } catch (err) {
      setError(err.message || 'فشل جلب التشيكات.');
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    loadChecks();
  }, []);

  const handleFileChange = (e) => {
    const file = e.target.files?.[0];
    if (!file) return;

    const reader = new FileReader();
    reader.onload = () => {
      setFormData(prev => ({
        ...prev,
        fileName: file.name,
        mimeType: file.type || 'image/jpeg',
        fileUrl: reader.result // Data URL for direct, safe native image viewing
      }));
    };
    reader.readAsDataURL(file);
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    setError('');
    try {
      await api.post('/checks', formData);
      setSuccess('تم تسجيل المعاينة/التشيكة بنجاح.');
      setIsModalOpen(false);
      setFormData({
        customerCode: '',
        date: new Date().toISOString().split('T')[0],
        location: '',
        notes: '',
        contractType: 'الفرش كامل',
        fileName: '',
        fileUrl: '',
        mimeType: 'image/jpeg'
      });
      loadChecks();
    } catch (err) {
      setError(err.message || 'تعذر تسجيل التشيكة.');
    }
  };

  const columns = [
    {
      header: 'كود التشيكة',
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
            : 'bg-slate-100 text-slate-700'
        }`}>
          {row.contractType || 'الفرش كامل'}
        </span>
      )
    },
    {
      header: 'تاريخ المعاينة',
      accessor: 'date',
      className: 'font-mono text-xs'
    },
    {
      header: 'المسؤول',
      accessor: 'responsible'
    },
    {
      header: 'ملف المعاينة / الصور',
      render: (row) => {
        if (!row.fileUrl) {
          return <span className="text-xs text-slate-400">بدون ملف</span>;
        }
        return (
          <div className="flex items-center gap-1.5">
            <button
              onClick={() => {
                setLightboxTitle(`تشيكة: ${row.customerName} (${row.code})`);
                setLightboxUrl(row.fileUrl);
              }}
              className="inline-flex items-center gap-1 px-2.5 py-1 bg-emerald-50 hover:bg-emerald-100 text-emerald-800 rounded-lg text-xs font-bold transition-all cursor-pointer"
            >
              <Eye size={13} />
              <span>عرض الصورة</span>
            </button>
            <a
              href={row.fileUrl}
              download={row.fileName || `check-${row.code}.jpg`}
              className="p-1 text-slate-500 hover:text-tree-green hover:bg-slate-100 rounded"
              title="تنزيل الملف"
            >
              <Download size={14} />
            </a>
          </div>
        );
      }
    }
  ];

  return (
    <div className="space-y-6">
      {/* Header */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4 bg-white p-6 rounded-2xl border border-slate-100 shadow-sm">
        <div>
          <div className="flex items-center gap-2 text-tree-green font-bold text-sm mb-1">
            <Camera size={18} />
            <span>معاينات وتشيكات الموقع</span>
          </div>
          <h1 className="text-2xl font-black text-slate-800">التشيكات وسجلات المعاينة</h1>
          <p className="text-xs text-slate-500 mt-1">
            رفع ومعاينة صور وفيديوهات الموقع الميدانية بدون أي حظر من المتصفح مع الدعم الكامل لتعاقد الفرش الكامل.
          </p>
        </div>

        {hasPermission('inspect.create') && (
          <button
            onClick={() => setIsModalOpen(true)}
            className="inline-flex items-center gap-2 px-4 py-2.5 bg-tree-green hover:bg-tree-green-dark text-white rounded-xl font-bold text-sm shadow-sm transition-all shrink-0 cursor-pointer"
          >
            <Plus size={18} />
            <span>تسجيل تشيكة / معاينة جديدة</span>
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
        data={checks}
        searchPlaceholder="بحث بكود العميل أو اسم العميل أو كود التشيكة..."
        searchField="customerName"
      />

      {/* Lightbox Modal (Zero Iframe Blocking) */}
      <Modal
        isOpen={Boolean(lightboxUrl)}
        onClose={() => setLightboxUrl(null)}
        title={lightboxTitle || 'معاينة صورة التشيكة'}
        maxWidth="max-w-4xl"
      >
        <div className="flex flex-col items-center justify-center p-2 bg-slate-900 rounded-xl overflow-hidden">
          <img
            src={lightboxUrl}
            alt={lightboxTitle}
            className="max-h-[75vh] w-auto max-w-full object-contain rounded-lg shadow-lg"
          />
        </div>
        <div className="flex justify-end gap-3 mt-4">
          <a
            href={lightboxUrl}
            download="site-check-photo.jpg"
            className="inline-flex items-center gap-1.5 px-4 py-2 bg-tree-green text-white text-xs font-bold rounded-lg shadow-sm"
          >
            <Download size={15} />
            <span>تنزيل الصورة لجهازك</span>
          </a>
        </div>
      </Modal>

      {/* Add Check Modal */}
      <Modal
        isOpen={isModalOpen}
        onClose={() => setIsModalOpen(false)}
        title="تسجيل تشيكة معاينة موقع جديدة"
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

          <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
            <div>
              <label className="block text-xs font-bold text-slate-700 mb-1">تاريخ المعاينة *</label>
              <input
                type="date"
                required
                value={formData.date}
                onChange={(e) => setFormData({ ...formData, date: e.target.value })}
                className="w-full px-3 py-2 bg-slate-50 border border-slate-200 rounded-xl text-sm"
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

          <div>
            <label className="block text-xs font-bold text-slate-700 mb-1">موقع المعاينة</label>
            <input
              type="text"
              placeholder="العنوان أو رابط الموقع"
              value={formData.location}
              onChange={(e) => setFormData({ ...formData, location: e.target.value })}
              className="w-full px-3 py-2 bg-slate-50 border border-slate-200 rounded-xl text-sm"
            />
          </div>

          {/* Upload site image */}
          <div>
            <label className="block text-xs font-bold text-slate-700 mb-1">رفع صورة أو مخطط المعاينة</label>
            <div className="border-2 border-dashed border-slate-200 hover:border-tree-green rounded-xl p-4 text-center bg-slate-50 transition-all cursor-pointer">
              <input
                type="file"
                accept="image/*"
                onChange={handleFileChange}
                className="w-full text-xs text-slate-500 file:mr-4 file:py-2 file:px-4 file:rounded-xl file:border-0 file:text-xs file:font-semibold file:bg-tree-green file:text-white hover:file:bg-tree-green-dark"
              />
              {formData.fileUrl && (
                <div className="mt-3 flex items-center justify-center gap-2 text-xs font-bold text-tree-green">
                  <ImageIcon size={16} />
                  <span>تم تجهيز الصورة: {formData.fileName}</span>
                </div>
              )}
            </div>
          </div>

          <div>
            <label className="block text-xs font-bold text-slate-700 mb-1">ملاحظات المعاينة الميدانية</label>
            <textarea
              rows={2}
              placeholder="مقاسات الحوائط، تمديدات الكهرباء والسباكة..."
              value={formData.notes}
              onChange={(e) => setFormData({ ...formData, notes: e.target.value })}
              className="w-full px-3 py-2 bg-slate-50 border border-slate-200 rounded-xl text-sm"
            />
          </div>

          <div className="flex items-center justify-end gap-3 pt-4 border-t border-slate-100">
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
              حفظ المعاينة
            </button>
          </div>
        </form>
      </Modal>
    </div>
  );
}
