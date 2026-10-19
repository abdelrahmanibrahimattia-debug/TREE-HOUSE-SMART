import React, { useState, useEffect } from 'react';
import { api } from '../api/client.js';
import Modal from '../components/Modal.jsx';
import { CheckSquare, Plus, CheckCircle2, Clock, AlertCircle } from 'lucide-react';

export default function TasksKanbanPage() {
  const [tasks, setTasks] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState('');
  const [success, setSuccess] = useState('');

  const [isModalOpen, setIsModalOpen] = useState(false);
  const [formData, setFormData] = useState({
    title: '',
    description: '',
    type: 'معاينة',
    priority: 'عادية',
    assignee: '',
    dueDate: '',
    customerCode: ''
  });

  const loadTasks = async () => {
    setLoading(true);
    try {
      const res = await api.get('/tasks');
      setTasks(res.data || []);
    } catch (err) {
      setError(err.message || 'فشل جلب المهام.');
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    loadTasks();
  }, []);

  const handleUpdateStatus = async (taskId, newStatus) => {
    try {
      await api.put(`/tasks/${taskId}/status`, { status: newStatus });
      loadTasks();
    } catch (err) {
      setError(err.message || 'تعذر تعديل حالة المهمة.');
    }
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    try {
      await api.post('/tasks', formData);
      setSuccess('تم إنشاء المهمة بنجاح.');
      setIsModalOpen(false);
      setFormData({
        title: '',
        description: '',
        type: 'معاينة',
        priority: 'عادية',
        assignee: '',
        dueDate: '',
        customerCode: ''
      });
      loadTasks();
    } catch (err) {
      setError(err.message || 'تعذر إنشاء المهمة.');
    }
  };

  const columns = [
    { id: 'جديدة', title: 'مهام جديدة', color: 'bg-blue-50 text-blue-800 border-blue-200' },
    { id: 'قيد التنفيذ', title: 'قيد التنفيذ', color: 'bg-amber-50 text-amber-800 border-amber-200' },
    { id: 'مكتملة', title: 'مكتملة ومنتهية', color: 'bg-emerald-50 text-emerald-800 border-emerald-200' }
  ];

  return (
    <div className="space-y-6">
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4 bg-white p-6 rounded-2xl border border-slate-100 shadow-sm">
        <div>
          <div className="flex items-center gap-2 text-tree-green font-bold text-sm mb-1">
            <CheckSquare size={18} />
            <span>فريق العمل والمتابعة</span>
          </div>
          <h1 className="text-2xl font-black text-slate-800">إدارة المهام ولوحة كانبان (Kanban)</h1>
          <p className="text-xs text-slate-500 mt-1">
            توزيع المهام اليومية، متابعة إنجاز المعاينات والمقايسات، وتحديد أولويات العمل.
          </p>
        </div>

        <button
          onClick={() => setIsModalOpen(true)}
          className="inline-flex items-center gap-2 px-4 py-2.5 bg-tree-green hover:bg-tree-green-dark text-white rounded-xl font-bold text-sm shadow-sm transition-all shrink-0 cursor-pointer"
        >
          <Plus size={18} />
          <span>إضافة مهمة جديدة</span>
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

      {/* Kanban Columns */}
      <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
        {columns.map(col => {
          const colTasks = tasks.filter(t => (t.status || 'جديدة') === col.id);
          return (
            <div key={col.id} className="bg-slate-50/70 border border-slate-200 rounded-2xl p-4 flex flex-col min-h-[450px]">
              <div className="flex items-center justify-between pb-3 border-b border-slate-200/80 mb-3">
                <span className={`px-2.5 py-1 rounded-lg text-xs font-bold border ${col.color}`}>
                  {col.title}
                </span>
                <span className="font-mono text-xs font-bold text-slate-400">
                  {colTasks.length}
                </span>
              </div>

              <div className="space-y-3 flex-1 overflow-y-auto">
                {colTasks.map(task => (
                  <div key={task.id} className="bg-white p-4 rounded-xl border border-slate-200 shadow-xs space-y-2.5">
                    <div className="flex items-start justify-between gap-2">
                      <h4 className="font-bold text-slate-800 text-xs leading-snug">{task.title}</h4>
                      <span className={`text-[10px] font-bold px-1.5 py-0.5 rounded shrink-0 ${
                        task.priority === 'عاجلة' ? 'bg-red-100 text-red-700' : 'bg-slate-100 text-slate-600'
                      }`}>
                        {task.priority}
                      </span>
                    </div>

                    {task.description && (
                      <p className="text-[11px] text-slate-500 line-clamp-2">{task.description}</p>
                    )}

                    <div className="text-[10px] text-slate-400 flex items-center justify-between pt-2 border-t border-slate-100">
                      <span>المسؤول: <strong>{task.assignee || 'الجميع'}</strong></span>
                      {task.dueDate && <span className="font-mono">{task.dueDate}</span>}
                    </div>

                    {/* Quick Move Buttons */}
                    <div className="flex gap-1 pt-1 justify-end">
                      {col.id !== 'قيد التنفيذ' && (
                        <button
                          onClick={() => handleUpdateStatus(task.id, 'قيد التنفيذ')}
                          className="px-2 py-0.5 text-[10px] font-bold bg-amber-50 text-amber-700 hover:bg-amber-100 rounded"
                        >
                          قيد التنفيذ
                        </button>
                      )}
                      {col.id !== 'مكتملة' && (
                        <button
                          onClick={() => handleUpdateStatus(task.id, 'مكتملة')}
                          className="px-2 py-0.5 text-[10px] font-bold bg-emerald-50 text-emerald-700 hover:bg-emerald-100 rounded"
                        >
                          اكتملت ✓
                        </button>
                      )}
                    </div>
                  </div>
                ))}

                {colTasks.length === 0 && (
                  <div className="text-center text-xs text-slate-400 py-12">
                    لا توجد مهام في هذا العمود.
                  </div>
                )}
              </div>
            </div>
          );
        })}
      </div>

      {/* Add Task Modal */}
      <Modal
        isOpen={isModalOpen}
        onClose={() => setIsModalOpen(false)}
        title="إضافة مهمة جديدة لفريق العمل"
        maxWidth="max-w-md"
      >
        <form onSubmit={handleSubmit} className="space-y-4">
          <div>
            <label className="block text-xs font-bold text-slate-700 mb-1">عنوان المهمة *</label>
            <input
              type="text"
              required
              placeholder="مثال: مراجعة قياسات موقع فيلا الشيخ زايد"
              value={formData.title}
              onChange={(e) => setFormData({ ...formData, title: e.target.value })}
              className="w-full px-3 py-2 bg-slate-50 border border-slate-200 rounded-xl text-sm"
            />
          </div>

          <div>
            <label className="block text-xs font-bold text-slate-700 mb-1">تفاصيل المهمة</label>
            <textarea
              rows={2}
              placeholder="وصف المطلوب تنفيذه بالتفصيل..."
              value={formData.description}
              onChange={(e) => setFormData({ ...formData, description: e.target.value })}
              className="w-full px-3 py-2 bg-slate-50 border border-slate-200 rounded-xl text-sm"
            />
          </div>

          <div className="grid grid-cols-2 gap-4">
            <div>
              <label className="block text-xs font-bold text-slate-700 mb-1">المسؤول عن التنفيذ</label>
              <input
                type="text"
                placeholder="اسم المهندس أو الموظف"
                value={formData.assignee}
                onChange={(e) => setFormData({ ...formData, assignee: e.target.value })}
                className="w-full px-3 py-2 bg-slate-50 border border-slate-200 rounded-xl text-sm"
              />
            </div>
            <div>
              <label className="block text-xs font-bold text-slate-700 mb-1">الأولوية</label>
              <select
                value={formData.priority}
                onChange={(e) => setFormData({ ...formData, priority: e.target.value })}
                className="w-full px-3 py-2 bg-slate-50 border border-slate-200 rounded-xl text-sm font-bold"
              >
                <option value="عادية">عادية</option>
                <option value="عاجلة">عاجلة جداً</option>
                <option value="منخفضة">منخفضة</option>
              </select>
            </div>
          </div>

          <div className="grid grid-cols-2 gap-4">
            <div>
              <label className="block text-xs font-bold text-slate-700 mb-1">تاريخ الاستحقاق</label>
              <input
                type="date"
                value={formData.dueDate}
                onChange={(e) => setFormData({ ...formData, dueDate: e.target.value })}
                className="w-full px-3 py-2 bg-slate-50 border border-slate-200 rounded-xl text-sm"
              />
            </div>
            <div>
              <label className="block text-xs font-bold text-slate-700 mb-1">كود العميل المرتبط</label>
              <input
                type="text"
                placeholder="CUST-2026-0001"
                value={formData.customerCode}
                onChange={(e) => setFormData({ ...formData, customerCode: e.target.value })}
                className="w-full px-3 py-2 bg-slate-50 border border-slate-200 rounded-xl text-sm font-mono dir-ltr text-left"
              />
            </div>
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
              حفظ المهمة
            </button>
          </div>
        </form>
      </Modal>
    </div>
  );
}
