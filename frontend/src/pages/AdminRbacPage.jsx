import React, { useState, useEffect } from 'react';
import { api } from '../api/client.js';
import DataTable from '../components/DataTable.jsx';
import Modal from '../components/Modal.jsx';
import {
  ShieldAlert,
  UserPlus,
  Power,
  Sliders,
  CheckCircle2,
  XCircle,
  AlertCircle
} from 'lucide-react';

const ALL_PERMISSIONS = [
  { group: 'إدارة العملاء (CRM)', perms: [
    { key: 'crm.view', label: 'رؤية شاشة العملاء' },
    { key: 'crm.create', label: 'إضافة عميل جديد' },
    { key: 'crm.edit', label: 'تعديل بيانات العميل' },
    { key: 'crm.delete', label: 'حذف عميل' },
    { key: 'crm.export', label: 'تصدير بيانات العملاء' }
  ]},
  { group: 'المعاينات والتشيكات', perms: [
    { key: 'inspect.view', label: 'رؤية المعاينات والتشيكات' },
    { key: 'inspect.create', label: 'تسجيل معاينة جديدة' },
    { key: 'inspect.edit', label: 'تعديل المعاينة' },
    { key: 'inspect.delete', label: 'حذف معاينة' },
    { key: 'inspect.export', label: 'تنزيل ملفات المعاينة' }
  ]},
  { group: 'المقايسات والتسعير', perms: [
    { key: 'boq.view', label: 'رؤية المقايسات' },
    { key: 'boq.create', label: 'إنشاء مقايسة جديدة' },
    { key: 'boq.edit', label: 'تعديل المقايسة' },
    { key: 'boq.delete', label: 'حذف مقايسة' },
    { key: 'boq.approve', label: 'اعتماد المقايسة' },
    { key: 'boq.export', label: 'طباعة وتصدير المقايسة' }
  ]},
  { group: 'العقود وجدول الدفعات', perms: [
    { key: 'contract.view', label: 'رؤية العقود' },
    { key: 'contract.create', label: 'إنشاء عقد جديد' },
    { key: 'contract.edit', label: 'تعديل شروط العقد' },
    { key: 'contract.delete', label: 'إلغاء أو حذف عقد' },
    { key: 'contract.approve', label: 'اعتماد وتوقيع العقد' },
    { key: 'contract.export', label: 'طباعة وتصدير العقد' }
  ]},
  { group: 'المالية والخزينة والمدفوعات', perms: [
    { key: 'pay.view', label: 'رؤية الخزينة والدفعات' },
    { key: 'pay.create', label: 'تسجيل سند صرف/قبض' },
    { key: 'pay.edit', label: 'تعديل الدفعات' },
    { key: 'pay.delete', label: 'حذف دفعة' },
    { key: 'pay.approve', label: 'اعتماد السند المالي' },
    { key: 'pay.export', label: 'طباعة إيصال الدفعة' }
  ]},
  { group: 'الإدارة والأمان', perms: [
    { key: 'admin.manage_users', label: 'التحكم في الموظفين والصلاحيات' },
    { key: 'admin.audit_logs', label: 'رؤية سجل الأمان والنشاط' }
  ]}
];

export default function AdminRbacPage() {
  const [users, setUsers] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState('');
  const [success, setSuccess] = useState('');

  // Selected User for permissions editing
  const [selectedUser, setSelectedUser] = useState(null);
  const [userPerms, setUserPerms] = useState({});
  const [userRole, setUserRole] = useState('EMPLOYEE');
  const [isPermModalOpen, setIsPermModalOpen] = useState(false);

  // New User Modal State
  const [isAddUserOpen, setIsAddUserOpen] = useState(false);
  const [newUser, setNewUser] = useState({
    code: '',
    name: '',
    email: '',
    password: '',
    role: 'EMPLOYEE',
    phone: '',
    permissions: {}
  });

  const loadUsers = async () => {
    setLoading(true);
    try {
      const res = await api.get('/admin/users');
      setUsers(res.data || []);
    } catch (err) {
      setError(err.message || 'فشل جلب المستخدمين.');
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    loadUsers();
  }, []);

  // Instant Kill-Switch: Toggle accountStatus
  const handleToggleStatus = async (user) => {
    const newStatus = user.accountStatus === 'ACTIVE' ? 'SUSPENDED' : 'ACTIVE';
    try {
      await api.put(`/admin/users/${user.id}/status`, { status: newStatus });
      setSuccess(newStatus === 'ACTIVE' ? `تم تفعيل حساب ${user.name}` : `تم إيقاف حساب ${user.name} فوراً.`);
      loadUsers();
    } catch (err) {
      setError(err.message);
    }
  };

  // Open Permission Editor
  const handleOpenPermissions = (user) => {
    setSelectedUser(user);
    setUserRole(user.role);
    setUserPerms(user.permissions || {});
    setIsPermModalOpen(true);
  };

  // Save Permissions
  const handleSavePermissions = async () => {
    if (!selectedUser) return;
    try {
      await api.put(`/admin/users/${selectedUser.id}/permissions`, {
        permissions: userPerms,
        role: userRole
      });
      setSuccess(`تم تحديث صلاحيات ${selectedUser.name} بنجاح.`);
      setIsPermModalOpen(false);
      loadUsers();
    } catch (err) {
      setError(err.message);
    }
  };

  // Create User
  const handleCreateUser = async (e) => {
    e.preventDefault();
    try {
      await api.post('/admin/users', newUser);
      setSuccess(`تم إنشاء حساب ${newUser.name} وتعيين الصلاحيات بنجاح.`);
      setIsAddUserOpen(false);
      setNewUser({
        code: '',
        name: '',
        email: '',
        password: '',
        role: 'EMPLOYEE',
        phone: '',
        permissions: {}
      });
      loadUsers();
    } catch (err) {
      setError(err.message);
    }
  };

  const columns = [
    {
      header: 'كود الموظف',
      accessor: 'code',
      className: 'font-mono font-bold text-tree-green'
    },
    {
      header: 'الاسم',
      accessor: 'name',
      render: (row) => (
        <div>
          <div className="font-bold text-slate-800">{row.name}</div>
          <div className="text-xs text-slate-400 font-sans">{row.email}</div>
        </div>
      )
    },
    {
      header: 'الدور الوظيفي',
      accessor: 'role',
      render: (row) => (
        <span className={`px-2.5 py-1 rounded-lg text-xs font-bold ${
          row.role === 'OWNER'
            ? 'bg-amber-100 text-amber-800 border border-amber-300'
            : 'bg-slate-100 text-slate-700'
        }`}>
          {row.role === 'OWNER' ? 'المالك الرئيسي' : row.role}
        </span>
      )
    },
    {
      header: 'حالة الحساب (Kill-Switch)',
      accessor: 'accountStatus',
      render: (row) => {
        const isActive = row.accountStatus === 'ACTIVE';
        return (
          <div className="flex items-center gap-2">
            <span className={`inline-flex items-center gap-1 px-2.5 py-1 rounded-full text-xs font-bold ${
              isActive ? 'bg-emerald-100 text-emerald-800' : 'bg-red-100 text-red-800'
            }`}>
              {isActive ? <CheckCircle2 size={13} /> : <XCircle size={13} />}
              {isActive ? 'نشط ويعمل' : 'معطل ومحظور'}
            </span>

            {row.role !== 'OWNER' && (
              <button
                onClick={() => handleToggleStatus(row)}
                title={isActive ? 'إيقاف الحساب فوراً' : 'تفعيل الحساب'}
                className={`p-1.5 rounded-lg text-xs font-bold transition-all ${
                  isActive
                    ? 'text-red-600 hover:bg-red-50'
                    : 'text-emerald-600 hover:bg-emerald-50'
                }`}
              >
                <Power size={16} />
              </button>
            )}
          </div>
        );
      }
    },
    {
      header: 'الصلاحيات النشطة',
      render: (row) => {
        if (row.role === 'OWNER') {
          return <span className="text-xs font-bold text-amber-700">كامل الصلاحيات (مطلقة)</span>;
        }
        const activeCount = Object.values(row.permissions || {}).filter(Boolean).length;
        return (
          <span className="text-xs font-bold bg-slate-100 px-2.5 py-1 rounded-lg text-slate-700">
            {activeCount} صلاحية مسموحة
          </span>
        );
      }
    },
    {
      header: 'إدارة الصلاحيات',
      render: (row) => (
        <button
          onClick={() => handleOpenPermissions(row)}
          disabled={row.role === 'OWNER'}
          className="inline-flex items-center gap-1.5 px-3 py-1.5 bg-tree-green/10 hover:bg-tree-green text-tree-green hover:text-white rounded-lg text-xs font-bold transition-all disabled:opacity-40 disabled:cursor-not-allowed cursor-pointer"
        >
          <Sliders size={14} />
          <span>تحديد الصلاحيات</span>
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
            <ShieldAlert size={18} />
            <span>لوحة التحكم الخاصة بالمالك</span>
          </div>
          <h1 className="text-2xl font-black text-slate-800">إدارة صلاحيات الموظفين والمستخدمين</h1>
          <p className="text-xs text-slate-500 mt-1">
            حدد بالضبط من يدخل على النظام وماذا يرى وماذا يفعل. أي موظف لا تعطه صلاحية لن يعمل النظام أمامه أبداً.
          </p>
        </div>

        <button
          onClick={() => setIsAddUserOpen(true)}
          className="inline-flex items-center gap-2 px-4 py-2.5 bg-tree-green hover:bg-tree-green-dark text-white rounded-xl font-bold text-sm shadow-sm transition-all shrink-0 cursor-pointer"
        >
          <UserPlus size={18} />
          <span>إضافة موظف جديد</span>
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

      {/* Users Table */}
      <DataTable
        columns={columns}
        data={users}
        searchPlaceholder="بحث باسم الموظف أو الكود أو البريد..."
        searchField="name"
      />

      {/* Modal: Edit Permissions */}
      <Modal
        isOpen={isPermModalOpen}
        onClose={() => setIsPermModalOpen(false)}
        title={`تحديد صلاحيات: ${selectedUser?.name || ''} (${selectedUser?.code || ''})`}
        maxWidth="max-w-3xl"
      >
        <div className="space-y-6">
          <div className="bg-amber-50 border border-amber-200 p-3.5 rounded-xl text-xs text-amber-800 flex items-center gap-2">
            <AlertCircle size={18} className="shrink-0 text-amber-600" />
            <span>
              أي شاشة غير محددة لن تظهر في قائمة الموظف، وأي زر إجراء غير مفعل سيتم رفضه أوتوماتيكياً من السيرفر.
            </span>
          </div>

          <div className="space-y-6">
            {ALL_PERMISSIONS.map((group, gIdx) => (
              <div key={gIdx} className="bg-slate-50 p-4 rounded-xl border border-slate-200/70">
                <h4 className="text-sm font-extrabold text-slate-800 mb-3 pb-2 border-b border-slate-200">
                  {group.group}
                </h4>
                <div className="grid grid-cols-1 sm:grid-cols-2 md:grid-cols-3 gap-3">
                  {group.perms.map((perm) => {
                    const isChecked = Boolean(userPerms[perm.key]);
                    return (
                      <label
                        key={perm.key}
                        className={`flex items-center gap-2.5 p-2.5 rounded-lg border text-xs font-semibold cursor-pointer transition-all ${
                          isChecked
                            ? 'bg-white border-tree-green text-tree-green-dark shadow-xs'
                            : 'bg-white/50 border-slate-200 text-slate-600 hover:bg-white'
                        }`}
                      >
                        <input
                          type="checkbox"
                          checked={isChecked}
                          onChange={(e) => {
                            setUserPerms(prev => ({
                              ...prev,
                              [perm.key]: e.target.checked
                            }));
                          }}
                          className="w-4 h-4 text-tree-green rounded focus:ring-tree-green accent-tree-green"
                        />
                        <span>{perm.label}</span>
                      </label>
                    );
                  })}
                </div>
              </div>
            ))}
          </div>

          <div className="flex items-center justify-end gap-3 pt-4 border-t border-slate-200">
            <button
              type="button"
              onClick={() => setIsPermModalOpen(false)}
              className="px-5 py-2.5 rounded-xl border border-slate-200 text-slate-600 font-bold text-sm hover:bg-slate-100 transition-colors"
            >
              إلغاء
            </button>
            <button
              type="button"
              onClick={handleSavePermissions}
              className="px-6 py-2.5 rounded-xl bg-tree-green hover:bg-tree-green-dark text-white font-bold text-sm shadow-md transition-all"
            >
              حفظ وتطبيق الصلاحيات فوراً
            </button>
          </div>
        </div>
      </Modal>

      {/* Modal: Add User */}
      <Modal
        isOpen={isAddUserOpen}
        onClose={() => setIsAddUserOpen(false)}
        title="إضافة موظف جديد للنظام"
        maxWidth="max-w-lg"
      >
        <form onSubmit={handleCreateUser} className="space-y-4">
          <div>
            <label className="block text-xs font-bold text-slate-700 mb-1">كود الموظف (مثال: ENG-101)</label>
            <input
              type="text"
              required
              value={newUser.code}
              onChange={(e) => setNewUser({ ...newUser, code: e.target.value })}
              className="w-full px-3 py-2 bg-slate-50 border border-slate-200 rounded-xl text-sm focus:outline-none focus:ring-2 focus:ring-tree-green"
            />
          </div>

          <div>
            <label className="block text-xs font-bold text-slate-700 mb-1">الاسم الكامل</label>
            <input
              type="text"
              required
              value={newUser.name}
              onChange={(e) => setNewUser({ ...newUser, name: e.target.value })}
              className="w-full px-3 py-2 bg-slate-50 border border-slate-200 rounded-xl text-sm focus:outline-none focus:ring-2 focus:ring-tree-green"
            />
          </div>

          <div>
            <label className="block text-xs font-bold text-slate-700 mb-1">البريد الإلكتروني</label>
            <input
              type="email"
              required
              value={newUser.email}
              onChange={(e) => setNewUser({ ...newUser, email: e.target.value })}
              className="w-full px-3 py-2 bg-slate-50 border border-slate-200 rounded-xl text-sm focus:outline-none focus:ring-2 focus:ring-tree-green text-left dir-ltr"
            />
          </div>

          <div>
            <label className="block text-xs font-bold text-slate-700 mb-1">كلمة المرور المؤقتة</label>
            <input
              type="password"
              required
              value={newUser.password}
              onChange={(e) => setNewUser({ ...newUser, password: e.target.value })}
              className="w-full px-3 py-2 bg-slate-50 border border-slate-200 rounded-xl text-sm focus:outline-none focus:ring-2 focus:ring-tree-green text-left dir-ltr"
            />
          </div>

          <div>
            <label className="block text-xs font-bold text-slate-700 mb-1">المسمى الوظيفي</label>
            <select
              value={newUser.role}
              onChange={(e) => setNewUser({ ...newUser, role: e.target.value })}
              className="w-full px-3 py-2 bg-slate-50 border border-slate-200 rounded-xl text-sm focus:outline-none focus:ring-2 focus:ring-tree-green"
            >
              <option value="ENGINEER">مهندس (معاينة / تصميم)</option>
              <option value="SUPERVISOR">مشرف موقع</option>
              <option value="ACCOUNTANT">محاسب</option>
              <option value="EMPLOYEE">موظف عام</option>
            </select>
          </div>

          <div className="flex items-center justify-end gap-3 pt-4 border-t border-slate-100">
            <button
              type="button"
              onClick={() => setIsAddUserOpen(false)}
              className="px-4 py-2 text-slate-600 font-bold text-sm"
            >
              إلغاء
            </button>
            <button
              type="submit"
              className="px-6 py-2 bg-tree-green hover:bg-tree-green-dark text-white font-bold text-sm rounded-xl shadow-md transition-all"
            >
              حفظ وإنشاء الحساب
            </button>
          </div>
        </form>
      </Modal>
    </div>
  );
}
