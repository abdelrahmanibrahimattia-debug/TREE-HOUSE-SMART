import React, { useState } from 'react';
import { AuthProvider, useAuth } from './context/AuthContext.jsx';
import Navbar from './components/Navbar.jsx';
import Sidebar from './components/Sidebar.jsx';
import LoginPage from './pages/LoginPage.jsx';

// Pages (All 18 Comprehensive Modules)
import CustomersPage from './pages/CustomersPage.jsx';
import CustomerProjectPage from './pages/CustomerProjectPage.jsx';
import InterviewsPage from './pages/InterviewsPage.jsx';
import InspectionsPage from './pages/InspectionsPage.jsx';
import DesignsPage from './pages/DesignsPage.jsx';
import QuotationsPage from './pages/QuotationsPage.jsx';
import ContractsPage from './pages/ContractsPage.jsx';
import ChecksPage from './pages/ChecksPage.jsx';
import WorkOrdersPage from './pages/WorkOrdersPage.jsx';
import SupplyDeliveryPage from './pages/SupplyDeliveryPage.jsx';
import PaymentsPage from './pages/PaymentsPage.jsx';
import FinanceLedgerPage from './pages/FinanceLedgerPage.jsx';
import TasksKanbanPage from './pages/TasksKanbanPage.jsx';
import AttendancePage from './pages/AttendancePage.jsx';
import EmployeesPage from './pages/EmployeesPage.jsx';
import AdminRbacPage from './pages/AdminRbacPage.jsx';
import AuditLogsPage from './pages/AuditLogsPage.jsx';
import SettingsPage from './pages/SettingsPage.jsx';

import { ShieldX } from 'lucide-react';

function DashboardLayout() {
  const { user, hasPermission } = useAuth();
  const [activeTab, setActiveTab] = useState(() => {
    if (hasPermission('crm.view')) return 'customers';
    if (hasPermission('inspect.view')) return 'inspections';
    if (hasPermission('boq.view')) return 'quotations';
    if (hasPermission('contract.view')) return 'contracts';
    if (hasPermission('pay.view')) return 'payments';
    if (hasPermission('admin.manage_users')) return 'admin_rbac';
    return 'customers';
  });

  const renderActivePage = () => {
    switch (activeTab) {
      case 'customers':
        return hasPermission('crm.view') ? <CustomersPage /> : <AccessDenied />;
      case 'customer_project':
        return hasPermission('crm.view') ? <CustomerProjectPage /> : <AccessDenied />;
      case 'interviews':
        return hasPermission('crm.view') ? <InterviewsPage /> : <AccessDenied />;
      case 'inspections':
        return hasPermission('inspect.view') ? <InspectionsPage /> : <AccessDenied />;
      case 'designs':
        return hasPermission('crm.view') ? <DesignsPage /> : <AccessDenied />;
      case 'quotations':
        return hasPermission('boq.view') ? <QuotationsPage /> : <AccessDenied />;
      case 'contracts':
        return hasPermission('contract.view') ? <ContractsPage /> : <AccessDenied />;
      case 'checks':
        return hasPermission('inspect.view') ? <ChecksPage /> : <AccessDenied />;
      case 'work_orders':
        return hasPermission('wo.view') ? <WorkOrdersPage /> : <AccessDenied />;
      case 'supplies':
        return hasPermission('crm.view') ? <SupplyDeliveryPage /> : <AccessDenied />;
      case 'payments':
        return hasPermission('pay.view') ? <PaymentsPage /> : <AccessDenied />;
      case 'ledger':
        return hasPermission('pay.view') ? <FinanceLedgerPage /> : <AccessDenied />;
      case 'tasks':
        return hasPermission('crm.view') ? <TasksKanbanPage /> : <AccessDenied />;
      case 'attendance':
        return hasPermission('crm.view') ? <AttendancePage /> : <AccessDenied />;
      case 'employees':
        return hasPermission('admin.manage_users') ? <EmployeesPage /> : <AccessDenied />;
      case 'admin_rbac':
        return hasPermission('admin.manage_users') ? <AdminRbacPage /> : <AccessDenied />;
      case 'audit_logs':
        return hasPermission('admin.audit_logs') ? <AuditLogsPage /> : <AccessDenied />;
      case 'settings':
        return <SettingsPage />;
      default:
        return <CustomersPage />;
    }
  };

  return (
    <div className="min-h-screen bg-slate-50 flex flex-col">
      <Navbar />
      <div className="flex-1 flex overflow-hidden">
        <Sidebar activeTab={activeTab} setActiveTab={setActiveTab} />
        <main className="flex-1 p-6 overflow-y-auto max-w-7xl mx-auto w-full">
          {renderActivePage()}
        </main>
      </div>
    </div>
  );
}

function AccessDenied() {
  return (
    <div className="p-12 text-center bg-white rounded-2xl border border-red-100 shadow-sm max-w-lg mx-auto my-12">
      <div className="w-16 h-16 bg-red-50 text-red-600 rounded-2xl flex items-center justify-center mx-auto mb-4">
        <ShieldX size={36} />
      </div>
      <h3 className="text-lg font-bold text-slate-800 mb-1">غير مصرح لك بالوصول</h3>
      <p className="text-xs text-slate-500 leading-relaxed">
        ليس لديك صلاحية لعرض هذه الشاشة. إذا كنت تحتاج للوصول، يرجى مراجعة إدارة النظام (الأونر) لمنحك الصلاحيات اللازمة.
      </p>
    </div>
  );
}

function MainApp() {
  const { isAuthenticated, loading } = useAuth();

  if (loading) {
    return (
      <div className="min-h-screen flex items-center justify-center bg-slate-50">
        <div className="flex flex-col items-center gap-3">
          <div className="w-10 h-10 border-4 border-tree-green/30 border-t-tree-green rounded-full animate-spin" />
          <span className="text-xs font-bold text-slate-600">جاري تحميل System Tree House...</span>
        </div>
      </div>
    );
  }

  return isAuthenticated ? <DashboardLayout /> : <LoginPage />;
}

export default function App() {
  return (
    <AuthProvider>
      <MainApp />
    </AuthProvider>
  );
}
