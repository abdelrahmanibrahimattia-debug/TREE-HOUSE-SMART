import express from 'express';
import { authenticateToken } from '../middleware/auth.js';
import { requirePermission } from '../middleware/rbac.js';
import { authLimiter } from '../middleware/security.js';

// Controllers
import * as auth from '../controllers/authController.js';
import * as rbac from '../controllers/rbacController.js';
import * as customers from '../controllers/customersController.js';
import * as inspections from '../controllers/inspectionsController.js';
import * as interviews from '../controllers/interviewsController.js';
import * as checks from '../controllers/checksController.js';
import * as boq from '../controllers/boqController.js';
import * as contracts from '../controllers/contractsController.js';
import * as payments from '../controllers/paymentsController.js';
import * as designs from '../controllers/designsController.js';
import * as appliances from '../controllers/appliancesController.js';
import * as workOrders from '../controllers/workOrdersController.js';
import * as supplies from '../controllers/supplyDeliveryController.js';
import * as finance from '../controllers/financeLedgerController.js';
import * as attendance from '../controllers/attendanceController.js';
import * as employees from '../controllers/employeesController.js';
import * as settings from '../controllers/settingsController.js';
import * as tasks from '../controllers/tasksController.js';
import * as customerProject from '../controllers/customerProjectController.js';

const router = express.Router();

// ==========================================
// 1. Auth & Public Routes
// ==========================================
router.post('/auth/login', authLimiter, auth.login);
router.post('/auth/seed-owner', auth.seedInitialOwner);
router.get('/auth/me', authenticateToken, auth.getMe);

// ==========================================
// 2. Owner's RBAC Permissions Dashboard
// ==========================================
router.get('/admin/users', authenticateToken, requirePermission('admin.manage_users'), rbac.getAllUsers);
router.post('/admin/users', authenticateToken, requirePermission('admin.manage_users'), rbac.createUser);
router.put('/admin/users/:userId/permissions', authenticateToken, requirePermission('admin.manage_users'), rbac.updateUserPermissions);
router.put('/admin/users/:userId/status', authenticateToken, requirePermission('admin.manage_users'), rbac.toggleUserStatus);
router.get('/admin/audit-logs', authenticateToken, requirePermission('admin.audit_logs'), rbac.getAuditLogs);

// ==========================================
// 3. Customers & CRM (Including الفرش كامل)
// ==========================================
router.get('/customers', authenticateToken, requirePermission('crm.view'), customers.getCustomers);
router.get('/customers/:code', authenticateToken, requirePermission('crm.view'), customers.getCustomerByCode);
router.post('/customers', authenticateToken, requirePermission('crm.create'), customers.createCustomer);
router.post('/customers/bulk', authenticateToken, requirePermission('crm.create'), customers.bulkCreateCustomers);
router.put('/customers/:id', authenticateToken, requirePermission('crm.edit'), customers.updateCustomer);

// ==========================================
// 4. Interviews & Reception (المقابلات والاستقبال)
// ==========================================
router.get('/interviews', authenticateToken, requirePermission('crm.view'), interviews.getInterviews);
router.post('/interviews', authenticateToken, requirePermission('crm.create'), interviews.createInterview);
router.put('/interviews/:id', authenticateToken, requirePermission('crm.edit'), interviews.updateInterview);

// ==========================================
// 5. Site Inspections (المعاينات الميدانية والمواعيد)
// ==========================================
router.get('/inspections', authenticateToken, requirePermission('inspect.view'), inspections.getInspections);
router.post('/inspections', authenticateToken, requirePermission('inspect.create'), inspections.createInspection);
router.put('/inspections/:id', authenticateToken, requirePermission('inspect.edit'), inspections.updateInspection);

// ==========================================
// 6. Site Surveys & Checks (التشيكات الفنية والمقاسات)
// ==========================================
router.get('/checks', authenticateToken, requirePermission('inspect.view'), checks.getChecks);
router.post('/checks', authenticateToken, requirePermission('inspect.create'), checks.createCheck);

// ==========================================
// 7. 3D Designs & Architectural Proposals
// ==========================================
router.get('/designs', authenticateToken, requirePermission('crm.view'), designs.getDesigns);
router.post('/designs', authenticateToken, requirePermission('crm.edit'), designs.createDesign);

// ==========================================
// 8. Appliances & Equipment Specs (الأجهزة الكهربائية)
// ==========================================
router.get('/appliances', authenticateToken, requirePermission('crm.view'), appliances.getAppliances);
router.post('/appliances', authenticateToken, requirePermission('crm.edit'), appliances.createAppliance);
router.delete('/appliances/:id', authenticateToken, requirePermission('crm.edit'), appliances.deleteAppliance);

// ==========================================
// 9. Quotations / BOQ Engine (المقايسات والتسعير)
// ==========================================
router.get('/quotations', authenticateToken, requirePermission('boq.view'), boq.getQuotations);
router.post('/quotations', authenticateToken, requirePermission('boq.create'), boq.createQuotation);

// ==========================================
// 10. Contracts Engine (العقود والأقساط)
// ==========================================
router.get('/contracts', authenticateToken, requirePermission('contract.view'), contracts.getContracts);
router.post('/contracts', authenticateToken, requirePermission('contract.create'), contracts.createContract);

// ==========================================
// 11. Work Orders & Factory Manufacturing (أوامر الشغل)
// ==========================================
router.get('/work-orders', authenticateToken, requirePermission('wo.view'), workOrders.getWorkOrders);
router.post('/work-orders', authenticateToken, requirePermission('wo.create'), workOrders.createWorkOrder);

// ==========================================
// 12. Supply & Site Delivery (التوريدات والتسليمات)
// ==========================================
router.get('/supplies', authenticateToken, requirePermission('crm.view'), supplies.getSupplies);
router.post('/supplies', authenticateToken, requirePermission('crm.edit'), supplies.createSupply);

// ==========================================
// 13. Finance, Custody, & Ledger (الخزينة والعهد)
// ==========================================
router.get('/payments', authenticateToken, requirePermission('pay.view'), payments.getPayments);
router.post('/payments', authenticateToken, requirePermission('pay.create'), payments.createPayment);
router.get('/finance/ledger', authenticateToken, requirePermission('pay.view'), finance.getLedger);
router.post('/finance/ledger', authenticateToken, requirePermission('pay.create'), finance.createLedgerEntry);

// ==========================================
// 14. Attendance & HR (الحضور والانصراف)
// ==========================================
router.get('/attendance', authenticateToken, attendance.getAttendance);
router.post('/attendance', authenticateToken, attendance.recordAttendance);

// ==========================================
// 15. Employee Directory & Payroll (إدارة الموظفين)
// ==========================================
router.get('/employees', authenticateToken, requirePermission('admin.manage_users'), employees.getEmployees);
router.post('/employees', authenticateToken, requirePermission('admin.manage_users'), employees.createEmployee);
router.put('/employees/:id', authenticateToken, requirePermission('admin.manage_users'), employees.updateEmployee);

// ==========================================
// 16. Settings & Company Profile (إعدادات النظام والشركة)
// ==========================================
router.get('/settings/profile', authenticateToken, settings.getProfile);
router.put('/settings/profile', authenticateToken, settings.updateProfile);
router.get('/settings/company', authenticateToken, settings.getCompanySettings);
router.put('/settings/company', authenticateToken, requirePermission('admin.manage_users'), settings.updateCompanySettings);

// ==========================================
// 17. Tasks & Kanban
// ==========================================
router.get('/tasks', authenticateToken, tasks.getTasks);
router.post('/tasks', authenticateToken, tasks.createTask);
router.put('/tasks/:id/status', authenticateToken, tasks.updateTaskStatus);

// ==========================================
// 18. Customer Project Dashboard (360-View)
// ==========================================
router.get('/customer-project/:code', authenticateToken, requirePermission('crm.view'), customerProject.getCustomerProjectOverview);

export default router;
