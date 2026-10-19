import React, { useState, useEffect } from 'react';
import { api } from '../api/client.js';
import Modal from '../components/Modal.jsx';
import {
  FolderKanban,
  Search,
  Eye,
  FileText,
  Palette,
  CheckSquare,
  Wrench,
  Truck,
  CreditCard,
  Tv,
  Calendar,
  AlertCircle
} from 'lucide-react';

export default function CustomerProjectPage() {
  const [customerCode, setCustomerCode] = useState('');
  const [loading, setLoading] = useState(false);
  const [projectData, setProjectData] = useState(null);
  const [error, setError] = useState('');
  const [activeSection, setActiveSection] = useState('overview');

  const handleSearch = async (e) => {
    if (e) e.preventDefault();
    if (!customerCode.trim()) return;

    setLoading(true);
    setError('');
    try {
      const res = await api.get(`/customer-project/${customerCode.trim()}`);
      setProjectData(res.data || null);
    } catch (err) {
      setError(err.message || 'تعذر جلب ملف مشروع العميل.');
      setProjectData(null);
    } finally {
      setLoading(false);
    }
  };

  const customer = projectData?.customer;
  const summary = projectData?.summary;

  const sections = [
    { id: 'overview', label: 'نظرة عامة والمالية', icon: FolderKanban },
    { id: 'designs', label: `التصميمات (${summary?.designsCount || 0})`, icon: Palette },
    { id: 'boq', label: `المقايسات (${summary?.quotationsCount || 0})`, icon: FileText },
    { id: 'checks', label: `المعاينات والتشيكات (${summary?.checksCount || 0})`, icon: CheckSquare },
    { id: 'orders', label: 'أوامر التصنيع', icon: Wrench },
    { id: 'supplies', label: `التوريدات (${summary?.suppliesCount || 0})`, icon: Truck },
    { id: 'appliances', label: `أجهزة العميل (${summary?.appliancesCount || 0})`, icon: Tv },
  ];

  return (
    <div className="space-y-6">
      {/* Search Header */}
      <div className="bg-white p-6 rounded-2xl border border-slate-100 shadow-sm">
        <div className="flex items-center gap-2 text-tree-green font-bold text-sm mb-1">
          <FolderKanban size={18} />
          <span>ملف مشروع العميل المتكامل (360-View)</span>
        </div>
        <h1 className="text-2xl font-black text-slate-800 mb-3">لوحة ملف العميل الشاملة</h1>
        <p className="text-xs text-slate-500 mb-4">
          استعراض متكامل لكافة ملفات وتصميمات وأجهزة ومقايسات وعقود وأوامر تشغيل العميل في شاشة واحدة.
        </p>

        <form onSubmit={handleSearch} className="flex gap-2 max-w-md">
          <div className="relative flex-1">
            <input
              type="text"
              placeholder="أدخل كود العميل (مثال: CUST-2026-0001)..."
              value={customerCode}
              onChange={(e) => setCustomerCode(e.target.value)}
              className="w-full pl-3 pr-10 py-2.5 bg-slate-50 border border-slate-200 rounded-xl text-sm font-mono dir-ltr text-left focus:outline-none focus:ring-2 focus:ring-tree-green"
            />
            <Search size={18} className="absolute right-3 top-3 text-slate-400" />
          </div>
          <button
            type="submit"
            disabled={loading}
            className="px-5 py-2.5 bg-tree-green hover:bg-tree-green-dark text-white font-bold text-xs rounded-xl shadow-sm transition-all cursor-pointer shrink-0"
          >
            {loading ? 'جاري الفتح...' : 'عرض ملف المشروع'}
          </button>
        </form>
      </div>

      {error && (
        <div className="p-4 bg-red-50 border border-red-200 text-red-700 text-sm rounded-xl flex items-center gap-2">
          <AlertCircle size={18} className="text-red-500" />
          <span>{error}</span>
        </div>
      )}

      {/* Project Content */}
      {customer && (
        <div className="space-y-6">
          {/* Customer Quick Info Card */}
          <div className="bg-white p-6 rounded-2xl border border-slate-100 shadow-sm flex flex-col md:flex-row md:items-center justify-between gap-4">
            <div>
              <div className="flex items-center gap-3">
                <h2 className="text-xl font-black text-slate-800">{customer.name}</h2>
                <span className="font-mono text-xs font-bold bg-slate-100 text-tree-green px-2.5 py-1 rounded-lg">
                  {customer.code}
                </span>
                <span className="text-xs font-bold px-2.5 py-1 rounded-full bg-emerald-100 text-emerald-800">
                  {customer.status}
                </span>
              </div>
              <div className="text-xs text-slate-500 mt-2 flex flex-wrap gap-4">
                <span><strong>الهاتف:</strong> <span className="font-mono dir-ltr">{customer.phone}</span></span>
                <span><strong>العنوان:</strong> {customer.address || 'غير محدد'}</span>
                <span><strong>الرقم القومي:</strong> <span className="font-mono">{customer.nationalId || 'غير مسجل'}</span></span>
              </div>
            </div>

            {/* Financial Badges */}
            <div className="flex items-center gap-3 bg-slate-50 p-3 rounded-xl border border-slate-200/60 shrink-0">
              <div className="text-center px-3 border-l border-slate-200">
                <div className="text-[10px] text-slate-400 font-bold">إجمالي التعاقد</div>
                <div className="font-mono text-sm font-black text-slate-800">{(summary?.totalContracted || 0).toLocaleString()} ج.م</div>
              </div>
              <div className="text-center px-3 border-l border-slate-200">
                <div className="text-[10px] text-emerald-600 font-bold">المسدد</div>
                <div className="font-mono text-sm font-black text-emerald-700">{(summary?.totalPaid || 0).toLocaleString()} ج.م</div>
              </div>
              <div className="text-center px-3">
                <div className="text-[10px] text-amber-600 font-bold">المتبقي</div>
                <div className="font-mono text-sm font-black text-amber-700">{(summary?.remainingBalance || 0).toLocaleString()} ج.م</div>
              </div>
            </div>
          </div>

          {/* Navigation Sub-Tabs */}
          <div className="flex gap-2 overflow-x-auto pb-1 border-b border-slate-200">
            {sections.map(sec => {
              const Icon = sec.icon;
              const isActive = activeSection === sec.id;
              return (
                <button
                  key={sec.id}
                  onClick={() => setActiveSection(sec.id)}
                  className={`flex items-center gap-2 px-4 py-2.5 rounded-xl font-bold text-xs whitespace-nowrap transition-all cursor-pointer ${
                    isActive
                      ? 'bg-tree-green text-white shadow-xs'
                      : 'bg-white text-slate-600 hover:bg-slate-100 border border-slate-200/70'
                  }`}
                >
                  <Icon size={15} />
                  <span>{sec.label}</span>
                </button>
              );
            })}
          </div>

          {/* Sub-Section Content */}
          <div className="bg-white p-6 rounded-2xl border border-slate-100 shadow-sm min-h-[300px]">
            {activeSection === 'overview' && (
              <div className="space-y-4">
                <h3 className="font-bold text-slate-800 text-sm border-b pb-2">العقود وجدول الدفعات</h3>
                {customer.contracts?.length > 0 ? (
                  customer.contracts.map(c => (
                    <div key={c.id} className="p-4 bg-slate-50 border rounded-xl space-y-2">
                      <div className="flex items-center justify-between text-xs">
                        <span className="font-bold text-tree-green font-mono">{c.contractNumber}</span>
                        <span className="font-bold">{c.contractType}</span>
                        <span className="font-mono font-bold">{c.totalAmount?.toLocaleString()} ج.م</span>
                      </div>
                    </div>
                  ))
                ) : (
                  <div className="text-xs text-slate-400 py-6 text-center">لا توجد عقود مسجلة لهذا العميل حتى الآن.</div>
                )}
              </div>
            )}

            {activeSection === 'designs' && (
              <div className="space-y-4">
                <h3 className="font-bold text-slate-800 text-sm border-b pb-2">التصميمات الهندسية والمقترحات (3D)</h3>
                {customer.designs?.length > 0 ? (
                  <div className="grid grid-cols-1 sm:grid-cols-2 md:grid-cols-3 gap-4">
                    {customer.designs.map(d => (
                      <div key={d.id} className="p-3 border rounded-xl bg-slate-50 space-y-2">
                        <div className="font-bold text-xs text-slate-800">{d.title}</div>
                        <div className="text-[11px] text-slate-500">{d.contractType} - مراجعة {d.revisionNumber}</div>
                        <span className="px-2 py-0.5 rounded text-[10px] font-bold bg-emerald-100 text-emerald-800">
                          {d.status}
                        </span>
                      </div>
                    ))}
                  </div>
                ) : (
                  <div className="text-xs text-slate-400 py-6 text-center">لا توجد تصميمات مرفوعة لهذا العميل.</div>
                )}
              </div>
            )}

            {activeSection === 'boq' && (
              <div className="space-y-4">
                <h3 className="font-bold text-slate-800 text-sm border-b pb-2">المقايسات وجداول الكميات المعتمدة</h3>
                {customer.quotations?.length > 0 ? (
                  customer.quotations.map(q => (
                    <div key={q.id} className="p-3.5 border rounded-xl bg-slate-50 flex items-center justify-between text-xs">
                      <div>
                        <div className="font-bold text-slate-800">{q.title || q.code}</div>
                        <div className="text-[11px] text-slate-400">{q.contractType}</div>
                      </div>
                      <div className="font-mono font-bold text-slate-800">{q.netAmount?.toLocaleString()} ج.م</div>
                    </div>
                  ))
                ) : (
                  <div className="text-xs text-slate-400 py-6 text-center">لا توجد مقايسات مسجلة.</div>
                )}
              </div>
            )}

            {activeSection === 'checks' && (
              <div className="space-y-4">
                <h3 className="font-bold text-slate-800 text-sm border-b pb-2">المعاينات والتشيكات الميدانية</h3>
                {customer.checks?.length > 0 ? (
                  customer.checks.map(chk => (
                    <div key={chk.id} className="p-3.5 border rounded-xl bg-slate-50 flex items-center justify-between text-xs">
                      <div>
                        <div className="font-bold text-slate-800">{chk.code} - {chk.contractType}</div>
                        <div className="text-[11px] text-slate-400">{chk.date} - {chk.location}</div>
                      </div>
                      <span className="px-2.5 py-1 rounded bg-slate-100 font-bold text-slate-700">{chk.status}</span>
                    </div>
                  ))
                ) : (
                  <div className="text-xs text-slate-400 py-6 text-center">لا توجد تشيكات مسجلة.</div>
                )}
              </div>
            )}

            {activeSection === 'appliances' && (
              <div className="space-y-4">
                <h3 className="font-bold text-slate-800 text-sm border-b pb-2">أجهزة العميل ومقاساتها الفنية</h3>
                {customer.appliances?.length > 0 ? (
                  <div className="overflow-x-auto border rounded-xl">
                    <table className="w-full text-xs text-right">
                      <thead className="bg-slate-100 font-bold">
                        <tr>
                          <th className="p-2.5">الجهاز</th>
                          <th className="p-2.5">النوع</th>
                          <th className="p-2.5">الأبعاد (عرض × ارتفاع × عمق)</th>
                          <th className="p-2.5">الكمية</th>
                          <th className="p-2.5">الموقع</th>
                        </tr>
                      </thead>
                      <tbody className="divide-y">
                        {customer.appliances.map(a => (
                          <tr key={a.id}>
                            <td className="p-2.5 font-bold">{a.name}</td>
                            <td className="p-2.5">{a.type || '-'}</td>
                            <td className="p-2.5 font-mono">{a.width || '-'} × {a.height || '-'} × {a.depth || '-'}</td>
                            <td className="p-2.5 font-mono">{a.quantity}</td>
                            <td className="p-2.5">{a.location || '-'}</td>
                          </tr>
                        ))}
                      </tbody>
                    </table>
                  </div>
                ) : (
                  <div className="text-xs text-slate-400 py-6 text-center">لم يتم تسجيل أجهزة بعد لهذا العميل.</div>
                )}
              </div>
            )}
          </div>
        </div>
      )}
    </div>
  );
}
