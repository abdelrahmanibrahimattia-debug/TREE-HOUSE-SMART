import React, { useState, useEffect } from 'react';
import { api } from '../api/client.js';
import DataTable from '../components/DataTable.jsx';
import Modal from '../components/Modal.jsx';
import { Clock, Plus, CheckCircle2, AlertCircle } from 'lucide-react';

export default function AttendancePage() {
  const [records, setRecords] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState('');
  const [success, setSuccess] = useState('');

  const [isModalOpen, setIsModalOpen] = useState(false);
  const [formData, setFormData] = useState({
    empCode: '',
    empName: '',
    checkIn: '',
    checkOut: '',
    status: 'حاضر',
    notes: ''
  });

  const loadAttendance = async () => {
    setLoading(true);
    try {
      const res = await api.get('/attendance');
      setRecords(res.data || []);
    } catch (err) {
      setError(err.message || 'فشل جلب سجل الحضور.');
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    loadAttendance();
  }, []);

  const handleSubmit = async (e) => {
    e.preventDefault();
    try {
      await api.post('/attendance', formData);
      setSuccess('تم تسجيل الحضور بنجاح.');
      setIsModalOpen(false);
      loadAttendance();
    } catch (err) {
      setError(err.message || 'تعذر تسجيل الحضور.');
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
      header: 'وقت الحضور',
      accessor: 'checkIn',
      className: 'font-mono text-xs font-bold text-emerald-700',
      render: (row) => row.checkIn || '-'
    },
    {
      header: 'وقت الانصراف',
      accessor: 'checkOut',
      className: 'font-mono text-xs font-bold text-slate-700',
      render: (row) => row.checkOut || '-'
    },
    {
      header: 'الحالة',
      accessor: 'status',
      render: (row) => (
        <span className={`px-2.5 py-1 rounded-full text-xs font-bold ${
          row.status === 'حاضر'
            ? 'bg-emerald-100 text-emerald-800'
            : row.status === 'تأخير'
            ? 'bg-amber-100 text-amber-800'
            : 'bg-red-100 text-red-800'
        }`}>
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
            <Clock size={18} />
            <span>الموارد البشرية والدوام</span>
          </div>
          <h1 className="text-2xl font-black text-slate-800">سجل الحضور والانصراف (Attendance)</h1>
          <p className="text-xs text-slate-500 mt-1">
            تسجيل ومتابعة حضور وانصراف الموظفين والمهندسين وأيام الغياب والتأخير.
          </p>
        </div>

        <button
          onClick={() => setIsModalOpen(true)}
          className="inline-flex items-center gap-2 px-4 py-2.5 bg-tree-green hover:bg-tree-green-dark text-white rounded-xl font-bold text-sm shadow-sm transition-all shrink-0 cursor-pointer"
        >
          <Plus size={18} />
          <span>تسجيل حضور يدوي</span>
        </button>
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
        data={records}
        searchPlaceholder="بحث باسم الموظف أو الكود..."
        searchField="empName"
      />

      <Modal
        isOpen={isModalOpen}
        onClose={() => setIsModalOpen(false)}
        title="تسجيل حضور وانصراف"
        maxWidth="max-w-md"
      >
        <form onSubmit={handleSubmit} className="space-y-4">
          <div>
            <label className="block text-xs font-bold text-slate-700 mb-1">كود الموظف *</label>
            <input
              type="text"
              required
              placeholder="مثال: ENG-101"
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

          <div className="grid grid-cols-2 gap-4">
            <div>
              <label className="block text-xs font-bold text-slate-700 mb-1">وقت الحضور</label>
              <input
                type="time"
                value={formData.checkIn}
                onChange={(e) => setFormData({ ...formData, checkIn: e.target.value })}
                className="w-full px-3 py-2 bg-slate-50 border border-slate-200 rounded-xl text-sm"
              />
            </div>
            <div>
              <label className="block text-xs font-bold text-slate-700 mb-1">وقت الانصراف</label>
              <input
                type="time"
                value={formData.checkOut}
                onChange={(e) => setFormData({ ...formData, checkOut: e.target.value })}
                className="w-full px-3 py-2 bg-slate-50 border border-slate-200 rounded-xl text-sm"
              />
            </div>
          </div>

          <div>
            <label className="block text-xs font-bold text-slate-700 mb-1">الحالة</label>
            <select
              value={formData.status}
              onChange={(e) => setFormData({ ...formData, status: e.target.value })}
              className="w-full px-3 py-2 bg-slate-50 border border-slate-200 rounded-xl text-sm font-bold"
            >
              <option value="حاضر">حاضر في الموعد</option>
              <option value="تأخير">تأخير</option>
              <option value="إجازة">إجازة رسمية / عارضة</option>
              <option value="غائب">غائب بدون إذن</option>
            </select>
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
              تسجيل الحضور
            </button>
          </div>
        </form>
      </Modal>
    </div>
  );
}
