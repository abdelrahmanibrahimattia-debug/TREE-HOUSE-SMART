import React, { useState, useEffect } from 'react';
import { apiGet, apiPost, apiPut } from '../utils/api.js';
import {
  Users,
  UserCheck,
  UserX,
  Plus,
  Search,
  Filter,
  DollarSign,
  Shield,
  Phone,
  Mail,
  Key,
  CreditCard,
  Edit,
  Lock
} from 'lucide-react';

export default function EmployeesPage() {
  const [employees, setEmployees] = useState([]);
  const [loading, setLoading] = useState(true);
  const [search, setSearch] = useState('');
  const [showModal, setShowModal] = useState(false);
  const [selectedEmp, setSelectedEmp] = useState(null);
  const [showEditModal, setShowEditModal] = useState(false);

  // Form for New Employee
  const [formData, setFormData] = useState({
    name: '',
    email: '',
    password: '',
    role: 'EMPLOYEE',
    salary: 6000,
    phone: '',
    accountStatus: 'ACTIVE',
    paymentMethod: 'إنستا باي'
  });

  // Edit Form
  const [editData, setEditData] = useState({
    name: '',
    email: '',
    role: 'EMPLOYEE',
    salary: 0,
    phone: '',
    accountStatus: 'ACTIVE',
    password: ''
  });

  const fetchData = async () => {
    setLoading(true);
    try {
      const res = await apiGet(`/employees?search=${encodeURIComponent(search)}`);
      if (res.ok) setEmployees(res.data || []);
    } catch (e) {
      console.error(e);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchData();
  }, []);

  const handleCreate = async (e) => {
    e.preventDefault();
    if (!formData.name || !formData.email || !formData.password) {
      alert('يرجى ملء كافة الحقول الإلزامية');
      return;
    }
    const res = await apiPost('/employees', formData);
    if (res.ok) {
      setShowModal(false);
      setFormData({
        name: '',
        email: '',
        password: '',
        role: 'EMPLOYEE',
        salary: 6000,
        phone: '',
        accountStatus: 'ACTIVE',
        paymentMethod: 'إنستا باي'
      });
      fetchData();
    } else {
      alert(res.error || 'تعذر إنشاء الموظف');
    }
  };

  const handleUpdate = async (e) => {
    e.preventDefault();
    if (!selectedEmp) return;
    const res = await apiPut(`/employees/${selectedEmp.id}`, editData);
    if (res.ok) {
      setShowEditModal(false);
      setSelectedEmp(null);
      fetchData();
    } else {
      alert(res.error || 'تعذر تعديل بيانات الموظف');
    }
  };

  const totalPayroll = employees.reduce((sum, e) => sum + (Number(e.salary) || 0), 0);
  const activeCount = employees.filter(e => e.accountStatus === 'ACTIVE').length;

  return (
    <div className="space-y-6">
      {/* Header */}
      <div className="flex flex-col sm:flex-row items-start sm:items-center justify-between gap-4 bg-white p-5 rounded-2xl border border-slate-200/80 shadow-sm">
        <div>
          <div className="flex items-center gap-2">
            <span className="p-2 bg-indigo-50 text-indigo-800 rounded-xl">
              <Users size={22} />
            </span>
            <h1 className="text-xl font-black text-slate-800">إدارة شؤون الموظفين والرواتب (HR)</h1>
          </div>
          <p className="text-xs text-slate-500 mt-1">
            كشوفات الموظفين، تحديد الرواتب الأساسية، بيانات التواصل وطرق استلام المستحقات، والصلاحيات الإدارية.
          </p>
        </div>

        <button
          onClick={() => setShowModal(true)}
          className="flex items-center gap-2 bg-indigo-800 hover:bg-indigo-900 text-white px-4 py-2.5 rounded-xl font-bold text-xs shadow-sm transition-all"
        >
          <Plus size={16} />
          تسجيل موعد / موظف جديد
        </button>
      </div>

      {/* KPI Stats */}
      <div className="grid grid-cols-1 sm:grid-cols-3 gap-4">
        <div className="bg-white p-4 rounded-2xl border border-slate-200/80 shadow-sm flex items-center gap-3">
          <div className="w-10 h-10 rounded-xl bg-indigo-50 text-indigo-700 flex items-center justify-center font-bold">
            <Users size={20} />
          </div>
          <div>
            <div className="text-[11px] text-slate-400 font-bold">إجمالي فريق العمل</div>
            <div className="text-lg font-black text-slate-800 font-mono">{employees.length} موظف</div>
          </div>
        </div>

        <div className="bg-white p-4 rounded-2xl border border-slate-200/80 shadow-sm flex items-center gap-3">
          <div className="w-10 h-10 rounded-xl bg-emerald-50 text-emerald-700 flex items-center justify-center font-bold">
            <UserCheck size={20} />
          </div>
          <div>
            <div className="text-[11px] text-slate-400 font-bold">الحسابات النشطة</div>
            <div className="text-lg font-black text-emerald-700 font-mono">{activeCount} نشط</div>
          </div>
        </div>

        <div className="bg-white p-4 rounded-2xl border border-slate-200/80 shadow-sm flex items-center gap-3">
          <div className="w-10 h-10 rounded-xl bg-amber-50 text-amber-700 flex items-center justify-center font-bold">
            <DollarSign size={20} />
          </div>
          <div>
            <div className="text-[11px] text-slate-400 font-bold">إجمالي مسير الرواتب الشهرية</div>
            <div className="text-lg font-black text-amber-800 font-mono">
              {totalPayroll.toLocaleString('ar-EG')} ج.م
            </div>
          </div>
        </div>
      </div>

      {/* Filter and Search */}
      <div className="flex items-center justify-between gap-3 bg-white p-3 rounded-2xl border border-slate-200/80 shadow-sm">
        <div className="relative flex-1 max-w-md">
          <Search size={15} className="absolute right-3 top-3 text-slate-400" />
          <input
            type="text"
            placeholder="بحث بالاسم، الكود، البريد أو الهاتف..."
            value={search}
            onChange={(e) => setSearch(e.target.value)}
            onKeyDown={(e) => e.key === 'Enter' && fetchData()}
            className="w-full pr-9 pl-3 py-2 text-xs border border-slate-200 rounded-xl focus:outline-none focus:border-indigo-700"
          />
        </div>
        <button
          onClick={fetchData}
          className="p-2 bg-slate-100 hover:bg-slate-200 text-slate-600 rounded-xl transition"
        >
          <Filter size={15} />
        </button>
      </div>

      {/* Employees Table */}
      <div className="bg-white rounded-2xl border border-slate-200/80 shadow-sm overflow-hidden">
        {loading ? (
          <div className="p-12 text-center text-slate-400 text-xs font-bold">جاري تحميل بيانات الموظفين...</div>
        ) : employees.length === 0 ? (
          <div className="p-12 text-center text-slate-400 text-xs">لا يوجد موظفين مسجلين.</div>
        ) : (
          <div className="overflow-x-auto">
            <table className="w-full text-right text-xs">
              <thead className="bg-slate-50 border-b border-slate-200/80 text-slate-600 font-bold">
                <tr>
                  <th className="p-3.5">الكود</th>
                  <th className="p-3.5">اسم الموظف</th>
                  <th className="p-3.5">المسمى والصلاحية</th>
                  <th className="p-3.5">بيانات التواصل</th>
                  <th className="p-3.5">الراتب الأساسي</th>
                  <th className="p-3.5">حالة الحساب</th>
                  <th className="p-3.5 text-center">الإجراء</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-slate-100">
                {employees.map((emp) => (
                  <tr key={emp.id} className="hover:bg-slate-50/80 transition-colors">
                    <td className="p-3.5 font-bold font-mono text-indigo-800">{emp.code}</td>
                    <td className="p-3.5">
                      <div className="font-bold text-slate-800">{emp.name}</div>
                      <div className="text-[11px] text-slate-400">{emp.email}</div>
                    </td>
                    <td className="p-3.5">
                      <span className="px-2.5 py-1 bg-indigo-50 text-indigo-800 rounded-lg text-[11px] font-bold">
                        {emp.role}
                      </span>
                    </td>
                    <td className="p-3.5 font-mono text-slate-600">
                      {emp.phone || 'غير مسجل'}
                    </td>
                    <td className="p-3.5 font-bold text-slate-800 font-mono">
                      {(emp.salary || 0).toLocaleString('ar-EG')} ج.م
                    </td>
                    <td className="p-3.5">
                      <span className={`px-2.5 py-1 rounded-full text-[10px] font-bold ${
                        emp.accountStatus === 'ACTIVE'
                          ? 'bg-emerald-100 text-emerald-800'
                          : 'bg-red-100 text-red-800'
                      }`}>
                        {emp.accountStatus === 'ACTIVE' ? 'نشط' : 'موقوف'}
                      </span>
                    </td>
                    <td className="p-3.5 text-center">
                      <button
                        onClick={() => {
                          setSelectedEmp(emp);
                          setEditData({
                            name: emp.name,
                            email: emp.email,
                            role: emp.role,
                            salary: emp.salary || 0,
                            phone: emp.phone || '',
                            accountStatus: emp.accountStatus,
                            password: ''
                          });
                          setShowEditModal(true);
                        }}
                        className="p-1.5 hover:bg-slate-100 text-slate-600 hover:text-indigo-800 rounded-lg transition"
                        title="تعديل الموظف"
                      >
                        <Edit size={16} />
                      </button>
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        )}
      </div>

      {/* Modal: New Employee */}
      {showModal && (
        <div className="fixed inset-0 bg-slate-900/60 backdrop-blur-sm z-50 flex items-center justify-center p-4">
          <div className="bg-white rounded-2xl max-w-lg w-full p-6 shadow-2xl border border-slate-100">
            <h3 className="text-base font-black text-slate-800 mb-4 flex items-center gap-2">
              <Users className="text-indigo-800" size={20} />
              تسجيل موظف جديد في المنظومة
            </h3>

            <form onSubmit={handleCreate} className="space-y-4 text-xs">
              <div className="grid grid-cols-2 gap-3">
                <div>
                  <label className="block text-slate-600 font-bold mb-1">اسم الموظف بالكامل *</label>
                  <input
                    type="text"
                    placeholder="الاسم ثلاثي"
                    value={formData.name}
                    onChange={(e) => setFormData({ ...formData, name: e.target.value })}
                    className="w-full p-2.5 border border-slate-200 rounded-xl focus:outline-none focus:border-indigo-800"
                    required
                  />
                </div>
                <div>
                  <label className="block text-slate-600 font-bold mb-1">البريد الإلكتروني *</label>
                  <input
                    type="email"
                    placeholder="employee@treehouse.com"
                    value={formData.email}
                    onChange={(e) => setFormData({ ...formData, email: e.target.value })}
                    className="w-full p-2.5 border border-slate-200 rounded-xl focus:outline-none focus:border-indigo-800"
                    required
                  />
                </div>
              </div>

              <div className="grid grid-cols-2 gap-3">
                <div>
                  <label className="block text-slate-600 font-bold mb-1">الصلاحية / الوظيفة *</label>
                  <select
                    value={formData.role}
                    onChange={(e) => setFormData({ ...formData, role: e.target.value })}
                    className="w-full p-2.5 border border-slate-200 rounded-xl focus:outline-none focus:border-indigo-800 font-bold text-indigo-800"
                  >
                    <option value="EMPLOYEE">موظف (EMPLOYEE)</option>
                    <option value="ENGINEER">مهندس تصميم ومعاينات (ENGINEER)</option>
                    <option value="ACCOUNTANT">محاسب ومدير مالي (ACCOUNTANT)</option>
                    <option value="SUPERVISOR">مشرف موقع ومصنع (SUPERVISOR)</option>
                    <option value="ADMIN">مدير نظام (ADMIN)</option>
                    <option value="OWNER">الأونر - صاحب المنشأة (OWNER)</option>
                  </select>
                </div>
                <div>
                  <label className="block text-slate-600 font-bold mb-1">الراتب الأساسي (ج.م) *</label>
                  <input
                    type="number"
                    value={formData.salary}
                    onChange={(e) => setFormData({ ...formData, salary: Number(e.target.value) })}
                    className="w-full p-2.5 border border-slate-200 rounded-xl focus:outline-none focus:border-indigo-800 font-bold font-mono"
                    required
                  />
                </div>
              </div>

              <div className="grid grid-cols-2 gap-3">
                <div>
                  <label className="block text-slate-600 font-bold mb-1">رقم الهاتف</label>
                  <input
                    type="tel"
                    placeholder="01XXXXXXXXX"
                    value={formData.phone}
                    onChange={(e) => setFormData({ ...formData, phone: e.target.value })}
                    className="w-full p-2.5 border border-slate-200 rounded-xl focus:outline-none focus:border-indigo-800"
                  />
                </div>
                <div>
                  <label className="block text-slate-600 font-bold mb-1">طريقة استلام المستحقات</label>
                  <select
                    value={formData.paymentMethod}
                    onChange={(e) => setFormData({ ...formData, paymentMethod: e.target.value })}
                    className="w-full p-2.5 border border-slate-200 rounded-xl focus:outline-none focus:border-indigo-800"
                  >
                    <option value="إنستا باي">إنستا باي (InstaPay)</option>
                    <option value="محفظة إلكترونية">محفظة إلكترونية (فودافون كاش...)</option>
                    <option value="حساب بنكي">تحويل بنكي</option>
                    <option value="نقدي">استلام نقدي من الخزينة</option>
                  </select>
                </div>
              </div>

              <div>
                <label className="block text-slate-600 font-bold mb-1">كلمة المرور الابتدائية *</label>
                <input
                  type="password"
                  placeholder="كلمة مرور مكونة من 6 خانات على الأقل"
                  value={formData.password}
                  onChange={(e) => setFormData({ ...formData, password: e.target.value })}
                  className="w-full p-2.5 border border-slate-200 rounded-xl focus:outline-none focus:border-indigo-800"
                  required
                  minLength={4}
                />
              </div>

              <div className="flex items-center justify-end gap-2 pt-3 border-t border-slate-100">
                <button
                  type="button"
                  onClick={() => setShowModal(false)}
                  className="px-4 py-2 rounded-xl text-slate-600 hover:bg-slate-100 font-bold transition"
                >
                  إلغاء
                </button>
                <button
                  type="submit"
                  className="px-5 py-2 bg-indigo-800 hover:bg-indigo-900 text-white rounded-xl font-bold shadow-sm transition"
                >
                  إنشاء حساب الموظف
                </button>
              </div>
            </form>
          </div>
        </div>
      )}

      {/* Modal: Edit Employee */}
      {showEditModal && selectedEmp && (
        <div className="fixed inset-0 bg-slate-900/60 backdrop-blur-sm z-50 flex items-center justify-center p-4">
          <div className="bg-white rounded-2xl max-w-lg w-full p-6 shadow-2xl border border-slate-100">
            <h3 className="text-base font-black text-slate-800 mb-2 flex items-center gap-2">
              <Edit className="text-indigo-800" size={20} />
              تعديل بيانات الموظف ({selectedEmp.name})
            </h3>
            <p className="text-xs text-slate-400 mb-4 font-mono">كود الموظف: {selectedEmp.code}</p>

            <form onSubmit={handleUpdate} className="space-y-4 text-xs">
              <div className="grid grid-cols-2 gap-3">
                <div>
                  <label className="block text-slate-600 font-bold mb-1">الاسم</label>
                  <input
                    type="text"
                    value={editData.name}
                    onChange={(e) => setEditData({ ...editData, name: e.target.value })}
                    className="w-full p-2.5 border border-slate-200 rounded-xl focus:outline-none focus:border-indigo-800"
                    required
                  />
                </div>
                <div>
                  <label className="block text-slate-600 font-bold mb-1">البريد الإلكتروني</label>
                  <input
                    type="email"
                    value={editData.email}
                    onChange={(e) => setEditData({ ...editData, email: e.target.value })}
                    className="w-full p-2.5 border border-slate-200 rounded-xl focus:outline-none focus:border-indigo-800"
                    required
                  />
                </div>
              </div>

              <div className="grid grid-cols-2 gap-3">
                <div>
                  <label className="block text-slate-600 font-bold mb-1">الصلاحية</label>
                  <select
                    value={editData.role}
                    onChange={(e) => setEditData({ ...editData, role: e.target.value })}
                    className="w-full p-2.5 border border-slate-200 rounded-xl focus:outline-none focus:border-indigo-800 font-bold"
                  >
                    <option value="EMPLOYEE">موظف (EMPLOYEE)</option>
                    <option value="ENGINEER">مهندس (ENGINEER)</option>
                    <option value="ACCOUNTANT">محاسب (ACCOUNTANT)</option>
                    <option value="SUPERVISOR">مشرف موقع (SUPERVISOR)</option>
                    <option value="ADMIN">مدير نظام (ADMIN)</option>
                    <option value="OWNER">الأونر (OWNER)</option>
                  </select>
                </div>
                <div>
                  <label className="block text-slate-600 font-bold mb-1">الراتب الأساسي (ج.م)</label>
                  <input
                    type="number"
                    value={editData.salary}
                    onChange={(e) => setEditData({ ...editData, salary: Number(e.target.value) })}
                    className="w-full p-2.5 border border-slate-200 rounded-xl focus:outline-none focus:border-indigo-800 font-bold font-mono"
                  />
                </div>
              </div>

              <div className="grid grid-cols-2 gap-3">
                <div>
                  <label className="block text-slate-600 font-bold mb-1">حالة الحساب</label>
                  <select
                    value={editData.accountStatus}
                    onChange={(e) => setEditData({ ...editData, accountStatus: e.target.value })}
                    className="w-full p-2.5 border border-slate-200 rounded-xl focus:outline-none focus:border-indigo-800 font-bold"
                  >
                    <option value="ACTIVE">نشط (ACTIVE)</option>
                    <option value="SUSPENDED">موقوف (SUSPENDED)</option>
                    <option value="PENDING">معلق (PENDING)</option>
                  </select>
                </div>
                <div>
                  <label className="block text-slate-600 font-bold mb-1">تحديث كلمة المرور (اختياري)</label>
                  <input
                    type="password"
                    placeholder="اتركه فارغاً إذا لم ترغب بتغييرها"
                    value={editData.password}
                    onChange={(e) => setEditData({ ...editData, password: e.target.value })}
                    className="w-full p-2.5 border border-slate-200 rounded-xl focus:outline-none focus:border-indigo-800"
                  />
                </div>
              </div>

              <div className="flex items-center justify-end gap-2 pt-3 border-t border-slate-100">
                <button
                  type="button"
                  onClick={() => setShowEditModal(false)}
                  className="px-4 py-2 rounded-xl text-slate-600 hover:bg-slate-100 font-bold transition"
                >
                  إغلاق
                </button>
                <button
                  type="submit"
                  className="px-5 py-2 bg-indigo-800 hover:bg-indigo-900 text-white rounded-xl font-bold shadow-sm transition"
                >
                  حفظ التعديلات
                </button>
              </div>
            </form>
          </div>
        </div>
      )}
    </div>
  );
}
