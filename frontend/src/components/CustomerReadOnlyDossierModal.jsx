import React, { useState, useEffect } from 'react';
import { api } from '../api/client.js';
import TreeHouseLogo from './TreeHouseLogo.jsx';
import {
  X,
  Printer,
  Shield,
  User,
  Phone,
  MapPin,
  Calendar,
  Layers,
  Wrench,
  FileSignature,
  Calculator,
  Palette,
  CheckSquare,
  Truck,
  Wallet,
  Tv,
  MessageSquare,
  DollarSign,
  Clock,
  CheckCircle2,
  AlertCircle,
  FolderKanban,
  Building
} from 'lucide-react';

export default function CustomerReadOnlyDossierModal({ customerCode, onClose }) {
  const [loading, setLoading] = useState(true);
  const [data, setData] = useState(null);
  const [error, setError] = useState('');
  const [activeTab, setActiveTab] = useState('summary');

  useEffect(() => {
    if (!customerCode) return;
    const fetchOverview = async () => {
      setLoading(true);
      setError('');
      try {
        const res = await api.get(`/customer-project/${customerCode}`);
        setData(res.data || null);
      } catch (err) {
        setError(err.message || 'تعذر تحميل ملف العميل.');
      } finally {
        setLoading(false);
      }
    };
    fetchOverview();
  }, [customerCode]);

  const handlePrint = () => {
    window.print();
  };

  const customer = data?.customer;
  const summary = data?.summary;

  return (
    <div className="fixed inset-0 bg-slate-900/70 backdrop-blur-sm z-50 flex items-center justify-center p-2 sm:p-4 overflow-y-auto">
      <div className="bg-white rounded-3xl max-w-5xl w-full max-h-[92vh] flex flex-col shadow-2xl border border-slate-100 overflow-hidden print:m-0 print:max-h-none print:shadow-none print:border-none print:w-full">

        {/* Modal Top Bar */}
        <div className="p-4 sm:p-5 bg-gradient-to-r from-slate-900 via-slate-800 to-tree-green text-white flex items-center justify-between shrink-0">
          <div className="flex items-center gap-3">
            <div className="bg-white/10 p-2 rounded-2xl backdrop-blur-md">
              <TreeHouseLogo size={36} />
            </div>
            <div>
              <div className="flex items-center gap-2">
                <span className="text-xs bg-emerald-500/20 text-emerald-300 border border-emerald-400/30 px-2 py-0.5 rounded-full font-bold flex items-center gap-1">
                  <Shield size={12} /> لوحة عرض شاملة (بدون تعديل)
                </span>
                <span className="text-xs text-slate-300 font-mono">
                  {customerCode}
                </span>
              </div>
              <h2 className="text-lg font-black mt-0.5">
                {customer?.name || 'جاري تحميل ملف العميل...'}
              </h2>
            </div>
          </div>

          <div className="flex items-center gap-2">
            <button
              onClick={handlePrint}
              className="flex items-center gap-1.5 px-3 py-1.5 bg-white/10 hover:bg-white/20 text-white rounded-xl text-xs font-bold transition border border-white/10 cursor-pointer"
              title="طباعة الملف"
            >
              <Printer size={15} />
              <span className="hidden sm:inline">طباعة الملف</span>
            </button>
            <button
              onClick={onClose}
              className="p-1.5 hover:bg-white/10 text-white/80 hover:text-white rounded-xl transition cursor-pointer"
            >
              <X size={20} />
            </button>
          </div>
        </div>

        {/* Modal Body */}
        {loading ? (
          <div className="p-16 flex flex-col items-center justify-center gap-3 text-slate-400">
            <div className="w-8 h-8 border-3 border-tree-green border-t-transparent rounded-full animate-spin" />
            <span className="text-xs font-bold">جاري تجميع كافة ملفات وأوامر شغل العميل...</span>
          </div>
        ) : error ? (
          <div className="p-10 text-center">
            <div className="w-12 h-12 bg-red-50 text-red-600 rounded-full flex items-center justify-center mx-auto mb-3">
              <AlertCircle size={24} />
            </div>
            <p className="text-sm font-bold text-slate-800">{error}</p>
            <button
              onClick={onClose}
              className="mt-4 px-4 py-2 bg-slate-100 hover:bg-slate-200 text-slate-700 text-xs font-bold rounded-xl"
            >
              إغلاق
            </button>
          </div>
        ) : !customer ? null : (
          <div className="flex-1 overflow-y-auto p-4 sm:p-6 space-y-5 print:p-0">

            {/* Financial & Status Bar */}
            <div className="grid grid-cols-2 sm:grid-cols-4 gap-3 bg-slate-50 p-4 rounded-2xl border border-slate-200/80">
              <div className="bg-white p-3 rounded-xl border border-slate-200/60 shadow-xs">
                <div className="text-[11px] font-bold text-slate-400 flex items-center gap-1">
                  <DollarSign size={13} className="text-tree-green" /> إجمالي التعاقد
                </div>
                <div className="text-base font-black text-slate-800 font-mono mt-1">
                  {(summary?.totalContracted || 0).toLocaleString('ar-EG')} ج.م
                </div>
              </div>

              <div className="bg-white p-3 rounded-xl border border-slate-200/60 shadow-xs">
                <div className="text-[11px] font-bold text-slate-400 flex items-center gap-1">
                  <CheckCircle2 size={13} className="text-emerald-600" /> المسدد فعلياً
                </div>
                <div className="text-base font-black text-emerald-700 font-mono mt-1">
                  {(summary?.totalPaid || 0).toLocaleString('ar-EG')} ج.م
                </div>
              </div>

              <div className="bg-white p-3 rounded-xl border border-slate-200/60 shadow-xs">
                <div className="text-[11px] font-bold text-slate-400 flex items-center gap-1">
                  <Clock size={13} className="text-amber-600" /> المتبقي للاستحقاق
                </div>
                <div className="text-base font-black text-amber-700 font-mono mt-1">
                  {(summary?.remainingBalance || 0).toLocaleString('ar-EG')} ج.م
                </div>
              </div>

              <div className="bg-white p-3 rounded-xl border border-slate-200/60 shadow-xs">
                <div className="text-[11px] font-bold text-slate-400 flex items-center gap-1">
                  <Wrench size={13} className="text-indigo-600" /> أوامر الشغل
                </div>
                <div className="text-base font-black text-indigo-700 font-mono mt-1">
                  {summary?.workOrdersCount || (customer.workOrders?.length || 0)} أمر تصنيع
                </div>
              </div>
            </div>

            {/* Navigation Pills for Read-Only Dossier */}
            <div className="flex flex-wrap gap-1.5 border-b border-slate-200 pb-2 text-xs">
              {[
                { id: 'summary', label: 'الملف التعريفي والشخصي', icon: User },
                { id: 'work_orders', label: `أوامر الشغل بالمصنع (${customer.workOrders?.length || 0})`, icon: Wrench },
                { id: 'contracts', label: `العقود والأقساط (${customer.contracts?.length || 0})`, icon: FileSignature },
                { id: 'quotations', label: `المقايسات (${customer.quotations?.length || 0})`, icon: Calculator },
                { id: 'designs', label: `التصميمات 3D (${customer.designs?.length || 0})`, icon: Palette },
                { id: 'inspections', label: `المعاينات (${customer.inspections?.length || 0})`, icon: CheckSquare },
                { id: 'interviews', label: `المقابلات (${customer.interviews?.length || 0})`, icon: MessageSquare },
                { id: 'supplies', label: `التوريدات (${customer.supplies?.length || 0})`, icon: Truck },
                { id: 'payments', label: `سندات الدفع (${customer.payments?.length || 0})`, icon: Wallet },
                { id: 'appliances', label: `الأجهزة (${customer.appliances?.length || 0})`, icon: Tv },
              ].map(tab => {
                const Icon = tab.icon;
                const isActive = activeTab === tab.id;
                return (
                  <button
                    key={tab.id}
                    onClick={() => setActiveTab(tab.id)}
                    className={`flex items-center gap-1.5 px-3 py-1.5 rounded-xl font-bold transition-all cursor-pointer ${
                      isActive
                        ? 'bg-tree-green text-white shadow-xs'
                        : 'bg-slate-100 text-slate-600 hover:bg-slate-200'
                    }`}
                  >
                    <Icon size={14} />
                    <span>{tab.label}</span>
                  </button>
                );
              })}
            </div>

            {/* Tab 1: Profile & Identity */}
            {activeTab === 'summary' && (
              <div className="space-y-4">
                <div className="bg-white p-5 rounded-2xl border border-slate-200/80 shadow-xs space-y-4">
                  <h3 className="text-sm font-black text-slate-800 flex items-center gap-2 pb-2 border-b border-slate-100">
                    <User size={16} className="text-tree-green" /> البيانات الشخصية والتعريفية (عرض محمي)
                  </h3>

                  <div className="grid grid-cols-1 sm:grid-cols-2 md:grid-cols-3 gap-4 text-xs">
                    <div>
                      <span className="text-slate-400 block font-bold mb-0.5">اسم العميل</span>
                      <span className="font-bold text-slate-800 text-sm">{customer.name}</span>
                    </div>

                    <div>
                      <span className="text-slate-400 block font-bold mb-0.5">كود العميل بالمنظومة</span>
                      <span className="font-mono font-bold text-tree-green">{customer.code}</span>
                    </div>

                    <div>
                      <span className="text-slate-400 block font-bold mb-0.5">الرقم القومي</span>
                      {customer.nationalId === 'عميل قبل السيستم' || !customer.nationalId ? (
                        <span className="inline-flex items-center gap-1 px-2.5 py-1 rounded-lg bg-amber-50 text-amber-800 border border-amber-200 font-bold text-[11px]">
                          🏛️ عميل قبل السيستم
                        </span>
                      ) : (
                        <span className="font-mono font-bold text-slate-700 bg-slate-100 px-2.5 py-1 rounded-lg">
                          🆔 {customer.nationalId}
                        </span>
                      )}
                    </div>

                    <div>
                      <span className="text-slate-400 block font-bold mb-0.5">رقم الهاتف الأساسي</span>
                      <span className="font-mono font-bold text-slate-700">{customer.phone}</span>
                    </div>

                    <div>
                      <span className="text-slate-400 block font-bold mb-0.5">رقم الهاتف البديل</span>
                      <span className="font-mono text-slate-600">{customer.secondaryPhone || 'لا يوجد'}</span>
                    </div>

                    <div>
                      <span className="text-slate-400 block font-bold mb-0.5">حالة العميل الحالية</span>
                      <span className="px-2.5 py-0.5 rounded-full text-[11px] font-bold bg-emerald-100 text-emerald-800">
                        {customer.status}
                      </span>
                    </div>
                  </div>

                  <div>
                    <span className="text-slate-400 block font-bold mb-1 text-xs">العنوان والموقع الميداني</span>
                    <p className="text-xs text-slate-700 font-medium bg-slate-50 p-2.5 rounded-xl border border-slate-200/60">
                      <MapPin size={13} className="inline text-tree-green ml-1" />
                      {customer.address || 'العنوان غير مسجل بالتفصيل'}
                    </p>
                  </div>

                  <div>
                    <span className="text-slate-400 block font-bold mb-1.5 text-xs">نطاق وأنواع التعاقد المستهدفة</span>
                    <div className="flex flex-wrap gap-1.5">
                      {(customer.contractTypes || []).map((type, idx) => (
                        <span
                          key={idx}
                          className={`px-3 py-1 rounded-lg font-bold text-xs flex items-center gap-1 ${
                            type === 'الفرش كامل'
                              ? 'bg-amber-100 text-amber-900 border border-amber-300 shadow-xs'
                              : 'bg-emerald-50 text-emerald-800 border border-emerald-200'
                          }`}
                        >
                          <Layers size={13} />
                          {type}
                        </span>
                      ))}
                    </div>
                  </div>

                  <div className="grid grid-cols-1 sm:grid-cols-3 gap-3 pt-3 border-t border-slate-100 text-xs">
                    <div className="bg-slate-50 p-2.5 rounded-xl">
                      <span className="text-slate-400 block font-bold">مهندس المعاينة:</span>
                      <span className="font-bold text-slate-700">{customer.assignedEngineer || 'لم يُحدد'}</span>
                    </div>
                    <div className="bg-slate-50 p-2.5 rounded-xl">
                      <span className="text-slate-400 block font-bold">مهندس التعاقد:</span>
                      <span className="font-bold text-slate-700">{customer.assignedContractEngineer || 'لم يُحدد'}</span>
                    </div>
                    <div className="bg-slate-50 p-2.5 rounded-xl">
                      <span className="text-slate-400 block font-bold">مشرف الموقع:</span>
                      <span className="font-bold text-slate-700">{customer.siteSupervisor || 'لم يُحدد'}</span>
                    </div>
                  </div>

                  {customer.notes && (
                    <div className="pt-2">
                      <span className="text-slate-400 block font-bold mb-1 text-xs">ملاحظات عامة مسجلة</span>
                      <p className="text-xs text-slate-600 bg-amber-50/50 p-2.5 rounded-xl border border-amber-200/50">
                        {customer.notes}
                      </p>
                    </div>
                  )}
                </div>
              </div>
            )}

            {/* Tab 2: Work Orders */}
            {activeTab === 'work_orders' && (
              <div className="space-y-3">
                <div className="flex items-center justify-between">
                  <h3 className="text-sm font-black text-slate-800 flex items-center gap-2">
                    <Wrench size={16} className="text-indigo-600" /> أوامر الشغل ومراحل التصنيع بالمصنع
                  </h3>
                  <span className="text-xs text-slate-500 font-bold">
                    إجمالي الأوامر: {customer.workOrders?.length || 0}
                  </span>
                </div>

                {!customer.workOrders || customer.workOrders.length === 0 ? (
                  <div className="p-10 text-center bg-slate-50 rounded-2xl border border-slate-200/80 text-xs text-slate-400 font-bold">
                    لا توجد أوامر تشغيل صادرة لهذا العميل حتى الآن.
                  </div>
                ) : (
                  <div className="grid grid-cols-1 md:grid-cols-2 gap-3">
                    {customer.workOrders.map((wo) => (
                      <div key={wo.id} className="bg-white p-4 rounded-2xl border border-slate-200/80 shadow-xs space-y-2 text-xs">
                        <div className="flex items-center justify-between">
                          <span className="font-mono font-bold text-indigo-700 text-sm">{wo.orderNumber}</span>
                          <span className={`px-2.5 py-0.5 rounded-full font-bold text-[11px] ${
                            wo.status === 'تم التركيب' || wo.status === 'جاهز للتسليم'
                              ? 'bg-emerald-100 text-emerald-800'
                              : 'bg-amber-100 text-amber-800'
                          }`}>
                            {wo.status}
                          </span>
                        </div>
                        <div className="flex items-center gap-2">
                          <span className="bg-slate-100 px-2 py-0.5 rounded font-bold text-slate-700">
                            مرحلة: {wo.department}
                          </span>
                          <span className="text-slate-500 font-medium">نوع: {wo.contractType}</span>
                        </div>
                        <div className="text-slate-500 flex items-center justify-between text-[11px] pt-2 border-t border-slate-100">
                          <span>أولوية: <strong className="text-slate-700">{wo.priority || 'عادية'}</strong></span>
                          <span>موعد التسليم: <strong className="text-slate-700">{wo.dueDate || 'غير محدد'}</strong></span>
                        </div>
                      </div>
                    ))}
                  </div>
                )}
              </div>
            )}

            {/* Tab 3: Contracts & Installments */}
            {activeTab === 'contracts' && (
              <div className="space-y-4">
                <h3 className="text-sm font-black text-slate-800 flex items-center gap-2">
                  <FileSignature size={16} className="text-tree-green" /> العقود وجداول الدفعات والأقساط
                </h3>

                {!customer.contracts || customer.contracts.length === 0 ? (
                  <div className="p-10 text-center bg-slate-50 rounded-2xl border border-slate-200/80 text-xs text-slate-400 font-bold">
                    لا توجد عقود مسجلة لهذا العميل حتى الآن.
                  </div>
                ) : (
                  customer.contracts.map((c) => (
                    <div key={c.id} className="bg-white p-5 rounded-2xl border border-slate-200/80 shadow-xs space-y-4 text-xs">
                      <div className="flex flex-wrap items-center justify-between gap-2 pb-3 border-b border-slate-100">
                        <div>
                          <span className="text-slate-400 text-[11px] block">رقم العقد الرسمي</span>
                          <span className="font-mono font-black text-slate-800 text-base">{c.contractNumber}</span>
                        </div>
                        <span className={`px-3 py-1 rounded-lg font-bold text-xs ${
                          c.contractType === 'الفرش كامل'
                            ? 'bg-amber-100 text-amber-900 border border-amber-300'
                            : 'bg-tree-green/10 text-tree-green'
                        }`}>
                          {c.contractType}
                        </span>
                        <div className="text-left">
                          <span className="text-slate-400 text-[11px] block">القيمة الإجمالية</span>
                          <span className="font-mono font-black text-tree-green text-base">
                            {(c.totalAmount || 0).toLocaleString('ar-EG')} ج.م
                          </span>
                        </div>
                      </div>

                      {/* Installments Table */}
                      <div>
                        <h4 className="font-bold text-slate-700 mb-2">جدول الأقساط والدفعات المجدولة:</h4>
                        {!c.installments || c.installments.length === 0 ? (
                          <div className="text-slate-400 text-xs italic">لا توجد أقساط مجدولة لهذا العقد.</div>
                        ) : (
                          <div className="overflow-x-auto">
                            <table className="w-full text-right text-xs">
                              <thead className="bg-slate-50 text-slate-500 font-bold border-b border-slate-200">
                                <tr>
                                  <th className="p-2">رقم القسط</th>
                                  <th className="p-2">تاريخ الاستحقاق</th>
                                  <th className="p-2">المبلغ</th>
                                  <th className="p-2">حالة السداد</th>
                                  <th className="p-2">تاريخ الدفع</th>
                                </tr>
                              </thead>
                              <tbody className="divide-y divide-slate-100">
                                {c.installments.map((inst) => (
                                  <tr key={inst.id} className="hover:bg-slate-50">
                                    <td className="p-2 font-bold font-mono">قسط #{inst.number}</td>
                                    <td className="p-2 font-mono text-slate-600">{inst.dueDate}</td>
                                    <td className="p-2 font-bold font-mono text-slate-800">
                                      {(inst.amount || 0).toLocaleString('ar-EG')} ج.م
                                    </td>
                                    <td className="p-2">
                                      <span className={`px-2 py-0.5 rounded-full text-[10px] font-bold ${
                                        inst.status === 'مدفوع'
                                          ? 'bg-emerald-100 text-emerald-800'
                                          : 'bg-amber-100 text-amber-800'
                                      }`}>
                                        {inst.status}
                                      </span>
                                    </td>
                                    <td className="p-2 text-slate-500 font-mono text-[11px]">
                                      {inst.paidAt ? new Date(inst.paidAt).toLocaleDateString('ar-EG') : '-'}
                                    </td>
                                  </tr>
                                ))}
                              </tbody>
                            </table>
                          </div>
                        )}
                      </div>
                    </div>
                  ))
                )}
              </div>
            )}

            {/* Tab 4: Quotations (BOQ) */}
            {activeTab === 'quotations' && (
              <div className="space-y-3">
                <h3 className="text-sm font-black text-slate-800 flex items-center gap-2">
                  <Calculator size={16} className="text-tree-green" /> المقايسات وجداول الكميات والتسعير
                </h3>

                {!customer.quotations || customer.quotations.length === 0 ? (
                  <div className="p-10 text-center bg-slate-50 rounded-2xl border border-slate-200/80 text-xs text-slate-400 font-bold">
                    لا توجد مقايسات مسجلة لهذا العميل.
                  </div>
                ) : (
                  <div className="grid grid-cols-1 md:grid-cols-2 gap-3 text-xs">
                    {customer.quotations.map((q) => (
                      <div key={q.id} className="bg-white p-4 rounded-2xl border border-slate-200/80 shadow-xs space-y-2">
                        <div className="flex items-center justify-between">
                          <span className="font-mono font-bold text-tree-green">{q.code}</span>
                          <span className="px-2 py-0.5 rounded text-[10px] font-bold bg-slate-100 text-slate-700">
                            {q.status}
                          </span>
                        </div>
                        <div className="font-bold text-slate-800 text-sm">{q.title || 'مقايسة أعمال'}</div>
                        <div className="flex items-center justify-between pt-2 border-t border-slate-100 text-xs">
                          <span className="text-slate-500">نوع: {q.contractType}</span>
                          <span className="font-bold font-mono text-slate-800">
                            الصافي: {(q.netAmount || 0).toLocaleString('ar-EG')} ج.م
                          </span>
                        </div>
                      </div>
                    ))}
                  </div>
                )}
              </div>
            )}

            {/* Tab 5: 3D Designs */}
            {activeTab === 'designs' && (
              <div className="space-y-3">
                <h3 className="text-sm font-black text-slate-800 flex items-center gap-2">
                  <Palette size={16} className="text-indigo-600" /> التصميمات المعمارية والـ 3D
                </h3>

                {!customer.designs || customer.designs.length === 0 ? (
                  <div className="p-10 text-center bg-slate-50 rounded-2xl border border-slate-200/80 text-xs text-slate-400 font-bold">
                    لا توجد تصميمات مسجلة بعد.
                  </div>
                ) : (
                  <div className="grid grid-cols-1 sm:grid-cols-3 gap-3 text-xs">
                    {customer.designs.map((d) => (
                      <div key={d.id} className="bg-white p-3 rounded-2xl border border-slate-200/80 shadow-xs space-y-2">
                        <div className="font-mono text-indigo-700 font-bold">{d.code}</div>
                        <div className="font-bold text-slate-800">{d.title}</div>
                        <div className="text-[11px] text-slate-500">حالة الاعتماد: {d.status}</div>
                        {d.fileUrl && (
                          <a
                            href={d.fileUrl}
                            target="_blank"
                            rel="noreferrer"
                            className="inline-block text-[11px] text-indigo-600 hover:underline font-bold"
                          >
                            عرض ملف التصميم / SCN
                          </a>
                        )}
                      </div>
                    ))}
                  </div>
                )}
              </div>
            )}

            {/* Tab 6: Inspections */}
            {activeTab === 'inspections' && (
              <div className="space-y-3">
                <h3 className="text-sm font-black text-slate-800 flex items-center gap-2">
                  <CheckSquare size={16} className="text-emerald-600" /> المعاينات الميدانية ورفع المقاسات
                </h3>

                {!customer.inspections || customer.inspections.length === 0 ? (
                  <div className="p-10 text-center bg-slate-50 rounded-2xl border border-slate-200/80 text-xs text-slate-400 font-bold">
                    لا توجد معاينات مسجلة.
                  </div>
                ) : (
                  <div className="space-y-2">
                    {customer.inspections.map((insp) => (
                      <div key={insp.id} className="bg-white p-4 rounded-2xl border border-slate-200/80 shadow-xs space-y-1.5 text-xs">
                        <div className="flex items-center justify-between">
                          <span className="font-mono font-bold text-emerald-700">{insp.code}</span>
                          <span className="font-bold text-slate-700">{insp.date}</span>
                          <span className="px-2 py-0.5 rounded text-[10px] font-bold bg-emerald-100 text-emerald-800">
                            {insp.status}
                          </span>
                        </div>
                        <div className="text-slate-600">المهندس المسؤول: {insp.responsible || 'غير محدد'}</div>
                        {insp.notes && (
                          <div className="text-slate-500 bg-slate-50 p-2 rounded-xl text-[11px]">
                            {insp.notes}
                          </div>
                        )}
                      </div>
                    ))}
                  </div>
                )}
              </div>
            )}

            {/* Tab 7: Interviews */}
            {activeTab === 'interviews' && (
              <div className="space-y-3">
                <h3 className="text-sm font-black text-slate-800 flex items-center gap-2">
                  <MessageSquare size={16} className="text-purple-600" /> المقابلات واستقبال المعرض
                </h3>

                {!customer.interviews || customer.interviews.length === 0 ? (
                  <div className="p-10 text-center bg-slate-50 rounded-2xl border border-slate-200/80 text-xs text-slate-400 font-bold">
                    لا توجد مقابلات مسجلة لهذا العميل.
                  </div>
                ) : (
                  <div className="space-y-2">
                    {customer.interviews.map((iv) => (
                      <div key={iv.id} className="bg-white p-4 rounded-2xl border border-slate-200/80 shadow-xs text-xs space-y-1">
                        <div className="flex items-center justify-between">
                          <span className="font-bold text-slate-800">{iv.date}</span>
                          <span className="px-2 py-0.5 rounded text-[10px] font-bold bg-purple-100 text-purple-800">
                            {iv.status}
                          </span>
                        </div>
                        <div className="text-slate-600">مهندس المقابلة: {iv.interviewer}</div>
                        <div className="text-slate-500 bg-slate-50 p-2 rounded-xl text-[11px] mt-1">
                          {iv.outcomeNotes || 'لا توجد ملاحظات إضافية'}
                        </div>
                      </div>
                    ))}
                  </div>
                )}
              </div>
            )}

            {/* Tab 8: Supplies */}
            {activeTab === 'supplies' && (
              <div className="space-y-3">
                <h3 className="text-sm font-black text-slate-800 flex items-center gap-2">
                  <Truck size={16} className="text-emerald-600" /> التوريدات والتسليمات الميدانية
                </h3>

                {!customer.supplies || customer.supplies.length === 0 ? (
                  <div className="p-10 text-center bg-slate-50 rounded-2xl border border-slate-200/80 text-xs text-slate-400 font-bold">
                    لا توجد توريدات مسجلة حتى الآن.
                  </div>
                ) : (
                  <div className="grid grid-cols-1 sm:grid-cols-2 gap-3 text-xs">
                    {customer.supplies.map((s) => (
                      <div key={s.id} className="bg-white p-3.5 rounded-2xl border border-slate-200/80 shadow-xs space-y-1">
                        <div className="font-mono text-emerald-700 font-bold">{s.code}</div>
                        <div className="font-bold text-slate-800">{s.title}</div>
                        <div className="text-slate-500 text-[11px]">مرحلة: {s.stage} - حالة: {s.status}</div>
                      </div>
                    ))}
                  </div>
                )}
              </div>
            )}

            {/* Tab 9: Payments */}
            {activeTab === 'payments' && (
              <div className="space-y-3">
                <h3 className="text-sm font-black text-slate-800 flex items-center gap-2">
                  <Wallet size={16} className="text-tree-green" /> الخزينة والمقبوضات وسندات الدفع
                </h3>

                {!customer.payments || customer.payments.length === 0 ? (
                  <div className="p-10 text-center bg-slate-50 rounded-2xl border border-slate-200/80 text-xs text-slate-400 font-bold">
                    لا توجد إيصالات أو سندات قبض مسجلة.
                  </div>
                ) : (
                  <div className="overflow-x-auto">
                    <table className="w-full text-right text-xs">
                      <thead className="bg-slate-50 text-slate-500 font-bold border-b border-slate-200">
                        <tr>
                          <th className="p-2.5">رقم السند</th>
                          <th className="p-2.5">التاريخ</th>
                          <th className="p-2.5">النوع</th>
                          <th className="p-2.5">المبلغ</th>
                          <th className="p-2.5">طريقة الدفع</th>
                          <th className="p-2.5">المسؤول</th>
                        </tr>
                      </thead>
                      <tbody className="divide-y divide-slate-100">
                        {customer.payments.map((p) => (
                          <tr key={p.id} className="hover:bg-slate-50">
                            <td className="p-2.5 font-bold font-mono text-tree-green">{p.receiptNumber}</td>
                            <td className="p-2.5 font-mono">{p.date}</td>
                            <td className="p-2.5">{p.type}</td>
                            <td className="p-2.5 font-black font-mono text-slate-800">
                              {(p.amount || 0).toLocaleString('ar-EG')} ج.م
                            </td>
                            <td className="p-2.5">{p.method}</td>
                            <td className="p-2.5 text-slate-500">{p.createdBy}</td>
                          </tr>
                        ))}
                      </tbody>
                    </table>
                  </div>
                )}
              </div>
            )}

            {/* Tab 10: Appliances */}
            {activeTab === 'appliances' && (
              <div className="space-y-3">
                <h3 className="text-sm font-black text-slate-800 flex items-center gap-2">
                  <Tv size={16} className="text-emerald-600" /> أجهزة المطبخ والفرش الكهربائية
                </h3>

                {!customer.appliances || customer.appliances.length === 0 ? (
                  <div className="p-10 text-center bg-slate-50 rounded-2xl border border-slate-200/80 text-xs text-slate-400 font-bold">
                    لا توجد أجهزة مسجلة لهذا العميل.
                  </div>
                ) : (
                  <div className="grid grid-cols-1 sm:grid-cols-2 md:grid-cols-3 gap-3 text-xs">
                    {customer.appliances.map((app) => (
                      <div key={app.id} className="bg-white p-3.5 rounded-2xl border border-slate-200/80 shadow-xs space-y-1">
                        <div className="font-bold text-slate-800 text-sm">{app.name}</div>
                        <div className="text-slate-500">نوع: {app.type || 'Built-in'}</div>
                        <div className="font-mono text-slate-700 text-[11px]">
                          الأبعاد: {app.width || '-'} × {app.height || '-'} × {app.depth || '-'} سم
                        </div>
                        <div className="text-slate-400 text-[10px]">الموقع: {app.location || 'المطبخ'}</div>
                      </div>
                    ))}
                  </div>
                )}
              </div>
            )}

          </div>
        )}

        {/* Modal Footer */}
        <div className="p-3 bg-slate-50 border-t border-slate-200 flex items-center justify-between text-xs shrink-0 print:hidden">
          <div className="text-slate-400 font-bold text-[11px] flex items-center gap-1">
            <Shield size={13} className="text-tree-green" /> لوحة قراءة فقط لحماية سرية وحصانة بيانات العميل من التعديل العفوي.
          </div>
          <button
            onClick={onClose}
            className="px-4 py-1.5 bg-slate-200 hover:bg-slate-300 text-slate-700 font-bold rounded-xl transition cursor-pointer"
          >
            إغلاق
          </button>
        </div>

      </div>
    </div>
  );
}
