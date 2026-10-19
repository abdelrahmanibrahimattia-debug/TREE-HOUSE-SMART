import bcrypt from 'bcryptjs';
import prisma from '../config/prisma.js';
import { sendSuccess, sendError } from '../utils/response.js';
import { logAudit } from '../utils/auditLogger.js';

/**
 * Employees & HR Management Controller
 * مخصص لإدارة الموظفين والرواتب والحسابات كما كان في tab-employees
 */

export async function getEmployees(req, res) {
  try {
    const { status, role, search } = req.query;
    const where = {};

    if (status) where.accountStatus = status;
    if (role) where.role = role;
    if (search) {
      where.OR = [
        { code: { contains: search } },
        { name: { contains: search } },
        { email: { contains: search } },
        { phone: { contains: search } }
      ];
    }

    const employees = await prisma.user.findMany({
      where,
      orderBy: { createdAt: 'desc' },
      select: {
        id: true,
        code: true,
        name: true,
        email: true,
        phone: true,
        role: true,
        salary: true,
        accountStatus: true,
        customPermissions: true,
        lastLoginAt: true,
        createdAt: true
      }
    });

    const formatted = employees.map(emp => {
      let permissions = {};
      try {
        permissions = typeof emp.customPermissions === 'string'
          ? JSON.parse(emp.customPermissions)
          : (emp.customPermissions || {});
      } catch (e) {
        permissions = {};
      }
      return {
        ...emp,
        permissions
      };
    });

    return sendSuccess(res, formatted, 'قائمة الموظفين');
  } catch (error) {
    return sendError(res, 'فشل جلب بيانات الموظفين: ' + error.message, 500);
  }
}

export async function createEmployee(req, res) {
  try {
    const {
      name,
      email,
      password,
      role = 'EMPLOYEE',
      salary = 0,
      phone,
      accountStatus = 'ACTIVE',
      permissions = {}
    } = req.body;

    if (!name || !email || !password) {
      return sendError(res, 'الاسم، البريد الإلكتروني، وكلمة المرور حقول إلزامية.', 400);
    }

    const existing = await prisma.user.findFirst({
      where: { email: String(email).trim().toLowerCase() }
    });
    if (existing) {
      return sendError(res, 'البريد الإلكتروني مسجل لموظف آخر بالفعل.', 400);
    }

    // Auto-generate employee code
    const count = await prisma.user.count();
    const code = `EMP-${String(count + 101).padStart(4, '0')}`;

    const salt = await bcrypt.genSalt(12);
    const passwordHash = await bcrypt.hash(password, salt);

    const newEmp = await prisma.user.create({
      data: {
        code,
        name: String(name).trim(),
        email: String(email).trim().toLowerCase(),
        passwordHash,
        role,
        salary: Number(salary) || 0,
        phone: phone || null,
        accountStatus: accountStatus || 'ACTIVE',
        customPermissions: JSON.stringify(permissions)
      }
    });

    await logAudit({
      userId: req.user.id,
      userCode: req.user.code,
      userName: req.user.name,
      action: 'CREATE_EMPLOYEE',
      resource: 'EMPLOYEES',
      resourceId: newEmp.id,
      ipAddress: req.ip,
      userAgent: req.headers['user-agent'],
      details: { empCode: newEmp.code, name: newEmp.name, role: newEmp.role }
    });

    return sendSuccess(res, {
      id: newEmp.id,
      code: newEmp.code,
      name: newEmp.name,
      email: newEmp.email,
      role: newEmp.role,
      salary: newEmp.salary,
      accountStatus: newEmp.accountStatus
    }, 'تم إنشاء حساب الموظف بنجاح.', 201);
  } catch (error) {
    return sendError(res, 'فشل إنشاء الموظف: ' + error.message, 500);
  }
}

export async function updateEmployee(req, res) {
  try {
    const { id } = req.params;
    const { name, email, role, salary, phone, accountStatus, password, permissions } = req.body;

    const existing = await prisma.user.findUnique({ where: { id } });
    if (!existing) return sendError(res, 'الموظف غير موجود.', 404);

    const updateData = {};
    if (name) updateData.name = String(name).trim();
    if (email) updateData.email = String(email).trim().toLowerCase();
    if (role) updateData.role = role;
    if (salary !== undefined) updateData.salary = Number(salary);
    if (phone !== undefined) updateData.phone = phone;
    if (accountStatus) updateData.accountStatus = accountStatus;
    if (permissions) updateData.customPermissions = JSON.stringify(permissions);

    if (password && password.length >= 4) {
      const salt = await bcrypt.genSalt(12);
      updateData.passwordHash = await bcrypt.hash(password, salt);
    }

    const updated = await prisma.user.update({
      where: { id },
      data: updateData
    });

    await logAudit({
      userId: req.user.id,
      userCode: req.user.code,
      userName: req.user.name,
      action: 'UPDATE_EMPLOYEE',
      resource: 'EMPLOYEES',
      resourceId: id,
      ipAddress: req.ip,
      userAgent: req.headers['user-agent'],
      details: { empCode: updated.code, updatedFields: Object.keys(updateData) }
    });

    return sendSuccess(res, {
      id: updated.id,
      code: updated.code,
      name: updated.name,
      email: updated.email,
      role: updated.role,
      salary: updated.salary,
      accountStatus: updated.accountStatus
    }, 'تم تعديل بيانات الموظف بنجاح.');
  } catch (error) {
    return sendError(res, 'فشل تعديل بيانات الموظف: ' + error.message, 500);
  }
}
