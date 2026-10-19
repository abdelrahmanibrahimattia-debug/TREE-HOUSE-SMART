import React, { useState, useEffect } from 'react';
import { api } from '../api/client.js';
import DataTable from '../components/DataTable.jsx';
import { Activity, ShieldCheck, RefreshCw } from 'lucide-react';

export default function AuditLogsPage() {
  const [logs, setLogs] = useState([]);
  const [loading, setLoading] = useState(true);

  const loadLogs = async () => {
    setLoading(true);
    try {
      const res = await api.get('/admin/audit-logs');
      setLogs(res.data || []);
    } catch (err) {
      console.error(err);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    loadLogs();
  }, []);

  const columns = [
    {
      header: 'الوقت والتاريخ',
      accessor: 'createdAt',
      className: 'font-mono text-xs text-slate-500',
      render: (row) => new Date(row.createdAt).toLocaleString('ar-EG')
    },
    {
      header: 'المستخدم / المسؤول',
      render: (row) => (
        <div>
          <div className="font-bold text-slate-800">{row.userName || 'مجهول'}</div>
          <div className="text-[10px] text-slate-400 font-mono">{row.userCode || '-'}</div>
        </div>
      )
    },
    {
      header: 'نوع الإجراء',
      accessor: 'action',
      render: (row) => {
        const isAuth = row.action.includes('LOGIN') || row.action.includes('USER');
        const isAlert = row.action.includes('DENIED') || row.action.includes('SUSPEND');
        return (
          <span className={`px-2 py-0.5 rounded text-xs font-mono font-bold ${
            isAlert
              ? 'bg-red-100 text-red-800'
              : isAuth
              ? 'bg-blue-100 text-blue-800'
              : 'bg-slate-100 text-slate-800'
          }`}>
            {row.action}
          </span>
        );
      }
    },
    {
      header: 'المورد (Resource)',
      accessor: 'resource',
      className: 'font-mono text-xs font-bold text-tree-green'
    },
    {
      header: 'عنوان IP والشبكة',
      accessor: 'ipAddress',
      className: 'font-mono text-xs text-slate-500 dir-ltr text-right',
      render: (row) => row.ipAddress || '127.0.0.1'
    },
    {
      header: 'تفاصيل العملية',
      accessor: 'details',
      className: 'text-xs text-slate-600 font-mono max-w-xs truncate',
      render: (row) => row.details || '-'
    }
  ];

  return (
    <div className="space-y-6">
      {/* Header */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4 bg-white p-6 rounded-2xl border border-slate-100 shadow-sm">
        <div>
          <div className="flex items-center gap-2 text-tree-green font-bold text-sm mb-1">
            <Activity size={18} />
            <span>الحصن والأمان السيبراني</span>
          </div>
          <h1 className="text-2xl font-black text-slate-800">سجل النشاط وتتبع العمليات (Audit Trail)</h1>
          <p className="text-xs text-slate-500 mt-1">
            سجل أمني مشفر غير قابل للتعديل يوثق كل عملية تسجيل دخول، حفظ، تعديل، حذف، وتغيير صلاحيات بالثانية وعنوان IP.
          </p>
        </div>

        <button
          onClick={loadLogs}
          disabled={loading}
          className="inline-flex items-center gap-1.5 px-4 py-2 bg-slate-100 hover:bg-slate-200 text-slate-700 rounded-xl text-xs font-bold transition-all shrink-0 cursor-pointer"
        >
          <RefreshCw size={14} className={loading ? 'animate-spin' : ''} />
          <span>تحديث السجل</span>
        </button>
      </div>

      <DataTable
        columns={columns}
        data={logs}
        searchPlaceholder="بحث في سجل الأمان بالاسم أو كود الموظف أو نوع الإجراء..."
        searchField="userName"
      />
    </div>
  );
}
