import bcrypt from 'bcryptjs';
import prisma from '../config/prisma.js';
import { sendSuccess, sendError } from '../utils/response.js';
import { logAudit } from '../utils/auditLogger.js';

/**
 * RBAC & Permissions Management Controller (For Owner & System Admin)
 */

export async function getAllUsers(req, res) {
  try {
    const users = await prisma.user.findMany({
      orderBy: { createdAt: 'desc' },
      select: {
        id: true,
        code: true,
        name: true,
        email: true,
        role: true,
        phone: true,
        accountStatus: true,
        customPermissions: true,
        lastLoginAt: true,
        createdAt: true
      }
    });

    const formatted = users.map(u => {
      let permissions = {};
      if (u.customPermissions) {
        try {
          permissions = typeof u.customPermissions === 'string'
            ? JSON.parse(u.customPermissions)
            : u.customPermissions;
        } catch (e) {
          permissions = {};
        }
      }
      return {
        ...u,
        permissions
      };
    });

    return sendSuccess(res, formatted, 'قائمة المستخدمين والصلاحيات');
  } catch (error) {
    return sendError(res, 'فشل جلب قائمة المستخدمين.', 500);
  }
}

export async function createUser(req, res) {
  try {
    const { code, name, email, password, role = 'EMPLOYEE', permissions = {}, phone } = req.body;

    if (!code || !name || !email || !password) {
      return sendError(res, 'يرجى استيفاء الحقول الإلزامية (الكود، الاسم، البريد، كلمة المرور).', 400);
    }

    const existing = await prisma.user.findFirst({
      where: {
        OR: [{ email }, { code }]
      }
    });

    if (existing) {
      return sendError(res, 'البريد الإلكتروني أو كود الموظف مستخدم بالفعل.', 400);
    }

    const salt = await bcrypt.genSalt(12);
    const passwordHash = await bcrypt.hash(password, salt);

    const newUser = await prisma.user.create({
      data: {
        code: String(code).trim().toUpperCase(),
        name: String(name).trim(),
        email: String(email).trim().toLowerCase(),
        passwordHash,
        role,
        phone: phone || null,
        accountStatus: 'ACTIVE',
        customPermissions: JSON.stringify(permissions)
      }
    });

    await logAudit({
      userId: req.user.id,
      userCode: req.user.code,
      userName: req.user.name,
      action: 'CREATE_USER',
      resource: 'USERS',
      resourceId: newUser.id,
      ipAddress: req.ip,
      userAgent: req.headers['user-agent'],
      details: { createdUserCode: newUser.code, role, permissions }
    });

    return sendSuccess(res, {
      id: newUser.id,
      code: newUser.code,
      name: newUser.name,
      email: newUser.email,
      role: newUser.role
    }, 'تم إنشاء حساب الموظف وتعيين الصلاحيات بنجاح.', 201);
  } catch (error) {
    return sendError(res, 'تعذر إنشاء المستخدم: ' + error.message, 500);
  }
}

export async function updateUserPermissions(req, res) {
  try {
    const { userId } = req.params;
    const { permissions, role } = req.body;

    const user = await prisma.user.findUnique({ where: { id: userId } });
    if (!user) {
      return sendError(res, 'المستخدم غير موجود.', 404);
    }

    // Protect OWNER account from being downgraded
    if (user.role === 'OWNER' && req.user.id !== user.id) {
      return sendError(res, 'لا يمكن تعديل صلاحيات حساب المالك الرئيسي.', 403);
    }

    const updateData = {};
    if (permissions !== undefined) {
      updateData.customPermissions = JSON.stringify(permissions);
    }
    if (role && user.role !== 'OWNER') {
      updateData.role = role;
    }

    const updated = await prisma.user.update({
      where: { id: userId },
      data: updateData,
      select: {
        id: true,
        code: true,
        name: true,
        role: true,
        customPermissions: true,
        accountStatus: true
      }
    });

    await logAudit({
      userId: req.user.id,
      userCode: req.user.code,
      userName: req.user.name,
      action: 'UPDATE_PERMISSIONS',
      resource: 'USERS',
      resourceId: user.id,
      ipAddress: req.ip,
      userAgent: req.headers['user-agent'],
      details: { targetUser: user.code, newRole: role, updatedPermissions: permissions }
    });

    return sendSuccess(res, updated, 'تم تحديث صلاحيات المستخدم بنجاح.');
  } catch (error) {
    return sendError(res, 'تعذر تحديث الصلاحيات: ' + error.message, 500);
  }
}

export async function toggleUserStatus(req, res) {
  try {
    const { userId } = req.params;
    const { status } = req.body; // 'ACTIVE' or 'SUSPENDED'

    if (!['ACTIVE', 'SUSPENDED'].includes(status)) {
      return sendError(res, 'حالة غير صالحة. اختر ACTIVE أو SUSPENDED.', 400);
    }

    const user = await prisma.user.findUnique({ where: { id: userId } });
    if (!user) return sendError(res, 'المستخدم غير موجود.', 404);

    if (user.role === 'OWNER') {
      return sendError(res, 'حظر حساب المالك غير مسموح به.', 403);
    }

    const updated = await prisma.user.update({
      where: { id: userId },
      data: { accountStatus: status }
    });

    await logAudit({
      userId: req.user.id,
      userCode: req.user.code,
      userName: req.user.name,
      action: status === 'ACTIVE' ? 'ACTIVATE_USER' : 'SUSPEND_USER',
      resource: 'USERS',
      resourceId: user.id,
      ipAddress: req.ip,
      userAgent: req.headers['user-agent'],
      details: { targetUser: user.code, newStatus: status }
    });

    const msg = status === 'ACTIVE' ? 'تم تنشيط الحساب بنجاح.' : 'تم إيقاف الحساب فوراً بنجاح (Kill-Switch Active).';
    return sendSuccess(res, { id: updated.id, status: updated.accountStatus }, msg);
  } catch (error) {
    return sendError(res, 'تعذر تعديل حالة الحساب: ' + error.message, 500);
  }
}

export async function getAuditLogs(req, res) {
  try {
    const logs = await prisma.auditLog.findMany({
      take: 100,
      orderBy: { createdAt: 'desc' }
    });

    return sendSuccess(res, logs, 'سجل النشاط والأمان (Audit Trail)');
  } catch (error) {
    return sendError(res, 'فشل جلب سجلات الأمان.', 500);
  }
}
