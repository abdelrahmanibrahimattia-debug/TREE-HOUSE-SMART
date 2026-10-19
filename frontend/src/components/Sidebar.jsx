import React from 'react';
import { useAuth } from '../context/AuthContext.jsx';
import {
  Users,
  FolderKanban,
  Calendar,
  Camera,
  Calculator,
  FileSignature,
  Wrench,
  Truck,
  Wallet,
  Landmark,
  CheckSquare,
  Clock,
  ShieldAlert,
  Activity,
  Layers,
  Palette,
  UserCheck,
  Briefcase,
  Settings,
  HelpCircle
} from 'lucide-react';

export default function Sidebar({ activeTab, setActiveTab }) {
  const { hasPermission } = useAuth();

  const menuItems = [
    {
      id: 'customers',
      label: 'إدارة العملاء (CRM)',
      icon: Users,
      permission: 'crm.view',
    },
    {
      id: 'customer_project',
      label: 'ملف مشروع العميل (360°)',
      icon: FolderKanban,
      permission: 'crm.view',
    },
    {
      id: 'interviews',
      label: 'المقابلات والاستقبال',
      icon: UserCheck,
      permission: 'crm.view',
    },
    {
      id: 'inspections',
      label: 'المعاينات الميدانية',
      icon: Calendar,
      permission: 'inspect.view',
    },
    {
      id: 'designs',
      label: 'التصميمات وموديلات الأجهزة',
      icon: Palette,
      permission: 'crm.view',
    },
    {
      id: 'quotations',
      label: 'المقايسات والتسعير (BOQ)',
      icon: Calculator,
      permission: 'boq.view',
    },
    {
      id: 'contracts',
      label: 'العقود والأقساط والفرش',
      icon: FileSignature,
      permission: 'contract.view',
    },
    {
      id: 'checks',
      label: 'التشيكات الفنية والمقاسات',
      icon: Camera,
      permission: 'inspect.view',
    },
    {
      id: 'work_orders',
      label: 'أوامر الشغل والمصنع',
      icon: Wrench,
      permission: 'wo.view',
    },
    {
      id: 'supplies',
      label: 'التوريدات والتسليمات',
      icon: Truck,
      permission: 'crm.view',
    },
    {
      id: 'payments',
      label: 'الخزينة والمدفوعات',
      icon: Wallet,
      permission: 'pay.view',
    },
    {
      id: 'ledger',
      label: 'السجل المالي والعهد',
      icon: Landmark,
      permission: 'pay.view',
    },
    {
      id: 'tasks',
      label: 'إدارة المهام وكانبان',
      icon: CheckSquare,
      permission: 'crm.view',
    },
    {
      id: 'attendance',
      label: 'الحضور والانصراف والبصمة',
      icon: Clock,
      permission: 'crm.view',
    },
    {
      id: 'employees',
      label: 'إدارة الموظفين والرواتب',
      icon: Briefcase,
      permission: 'admin.manage_users',
    },
    {
      id: 'admin_rbac',
      label: 'لوحة تحكم الصلاحيات (الأونر)',
      icon: ShieldAlert,
      permission: 'admin.manage_users',
      highlight: true
    },
    {
      id: 'audit_logs',
      label: 'سجل العمليات والأمان',
      icon: Activity,
      permission: 'admin.audit_logs',
    },
    {
      id: 'settings',
      label: 'إعدادات الحساب والنظام',
      icon: Settings,
      permission: null, // Always allowed for logged in user
    },
  ];

  // Strictly filter items: only show if user has the specific permission!
  const allowedItems = menuItems.filter(item => !item.permission || hasPermission(item.permission));

  return (
    <aside className="w-64 bg-white border-l border-slate-200/80 flex flex-col shrink-0 min-h-[calc(100vh-4rem)]">
      <div className="p-3 space-y-1">
        <div className="text-[11px] font-bold text-slate-400 px-3 py-1.5 uppercase tracking-wider">
          أقسام System Tree House
        </div>

        <div className="space-y-1 max-h-[calc(100vh-14rem)] overflow-y-auto pr-1">
          {allowedItems.map((item) => {
            const Icon = item.icon;
            const isActive = activeTab === item.id;
            return (
              <button
                key={item.id}
                onClick={() => setActiveTab(item.id)}
                className={`w-full flex items-center gap-3 px-3.5 py-2.5 rounded-xl text-xs font-bold transition-all text-right ${
                  isActive
                    ? item.highlight
                      ? 'bg-amber-600 text-white shadow-sm'
                      : 'bg-tree-green text-white shadow-sm'
                    : item.highlight
                    ? 'text-amber-800 bg-amber-50/70 hover:bg-amber-100/80 font-black'
                    : 'text-slate-600 hover:text-slate-900 hover:bg-slate-100/80'
                }`}
              >
                <Icon size={16} className={isActive ? 'text-white' : item.highlight ? 'text-amber-700' : 'text-slate-400'} />
                <span className="flex-1 truncate">{item.label}</span>
                {isActive && (
                  <span className="w-1.5 h-1.5 rounded-full bg-white animate-pulse" />
                )}
              </button>
            );
          })}
        </div>
      </div>

      <div className="mt-auto p-3 border-t border-slate-100">
        <div className="bg-slate-50 p-2.5 rounded-xl border border-slate-200/60 text-right">
          <div className="text-[10px] font-bold text-slate-400">حالة النظام</div>
          <div className="text-xs font-bold text-tree-green flex items-center gap-1.5 mt-0.5">
            <span className="w-2 h-2 rounded-full bg-tree-green animate-ping" />
            Zero-Trust RBAC نشط
          </div>
        </div>
      </div>
    </aside>
  );
}
