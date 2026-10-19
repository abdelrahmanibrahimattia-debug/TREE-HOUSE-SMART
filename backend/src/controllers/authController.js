import bcrypt from 'bcryptjs';
import jwt from 'jsonwebtoken';
import prisma from '../config/prisma.js';
import { sendSuccess, sendError } from '../utils/response.js';
import { logAudit } from '../utils/auditLogger.js';

/**
 * Auth Controller for System Tree House
 */

export async function login(req, res) {
  try {
    const { emailOrCode, password } = req.body;
    if (!emailOrCode || !password) {
      return sendError(res, 'يرجى إدخال اسم المستخدم أو البريد الإلكتروني وكلمة المرور.', 400);
    }

    const identifier = String(emailOrCode).trim();
    const user = await prisma.user.findFirst({
      where: {
        OR: [
          { email: identifier },
          { code: identifier }
        ]
      }
    });

    if (!user) {
      return sendError(res, 'بيانات تسجيل الدخول غير صحيحة.', 401);
    }

    if (user.accountStatus !== 'ACTIVE') {
      return sendError(res, 'تم تعطيل هذا الحساب من قبل إدارة النظام. تواصل مع المسؤول.', 403);
    }

    const isMatch = await bcrypt.compare(password, user.passwordHash);
    if (!isMatch) {
      return sendError(res, 'بيانات تسجيل الدخول غير صحيحة.', 401);
    }

    // Generate JWT Access Token
    const token = jwt.sign(
      {
        userId: user.id,
        code: user.code,
        role: user.role
      },
      process.env.JWT_SECRET,
      { expiresIn: process.env.JWT_EXPIRES_IN || '24h' }
    );

    // Update last login
    await prisma.user.update({
      where: { id: user.id },
      data: { lastLoginAt: new Date() }
    });

    // Log login in audit trail
    await logAudit({
      userId: user.id,
      userCode: user.code,
      userName: user.name,
      action: 'LOGIN',
      resource: 'AUTH',
      ipAddress: req.ip,
      userAgent: req.headers['user-agent']
    });

    let permissions = {};
    if (user.customPermissions) {
      try {
        permissions = typeof user.customPermissions === 'string'
          ? JSON.parse(user.customPermissions)
          : user.customPermissions;
      } catch (e) {
        permissions = {};
      }
    }

    return sendSuccess(res, {
      token,
      user: {
        id: user.id,
        code: user.code,
        name: user.name,
        email: user.email,
        role: user.role,
        permissions,
        accountStatus: user.accountStatus
      }
    }, 'تم تسجيل الدخول بنجاح');
  } catch (error) {
    console.error('Login error:', error);
    return sendError(res, 'تعذر تسجيل الدخول بسبب خطأ غير متوقع.', 500);
  }
}

export async function getMe(req, res) {
  try {
    return sendSuccess(res, { user: req.user }, 'بيانات الحساب');
  } catch (error) {
    return sendError(res, 'فشل جلب بيانات الحساب.', 500);
  }
}

export async function seedInitialOwner(req, res) {
  try {
    const existing = await prisma.user.count();
    if (existing > 0) {
      return sendError(res, 'النظام يحتوي بالفعل على مستخدمين مسجلين.', 400);
    }

    const salt = await bcrypt.genSalt(12);
    const passwordHash = await bcrypt.hash('Admin@TreeHouse2026', salt);

    const owner = await prisma.user.create({
      data: {
        code: 'OWNER-01',
        name: 'إدارة Tree House (المالك)',
        email: 'owner@treehouse.com',
        passwordHash,
        role: 'OWNER',
        accountStatus: 'ACTIVE',
        customPermissions: JSON.stringify({
          'crm.view': true, 'crm.create': true, 'crm.edit': true, 'crm.delete': true, 'crm.export': true,
          'inspect.view': true, 'inspect.create': true, 'inspect.edit': true, 'inspect.delete': true, 'inspect.export': true,
          'boq.view': true, 'boq.create': true, 'boq.edit': true, 'boq.delete': true, 'boq.export': true, 'boq.approve': true,
          'contract.view': true, 'contract.create': true, 'contract.edit': true, 'contract.delete': true, 'contract.export': true, 'contract.approve': true,
          'pay.view': true, 'pay.create': true, 'pay.edit': true, 'pay.delete': true, 'pay.export': true, 'pay.approve': true,
          'wo.view': true, 'wo.create': true, 'wo.edit': true, 'wo.delete': true, 'wo.export': true,
          'task.view': true, 'task.create': true, 'task.edit': true, 'task.delete': true,
          'admin.view': true, 'admin.manage_users': true, 'admin.audit_logs': true
        })
      }
    });

    return sendSuccess(res, {
      code: owner.code,
      email: owner.email,
      role: owner.role
    }, 'تم إنشاء حساب المالك الأولي بنجاح. كلمة المرور الافتراضية: Admin@TreeHouse2026', 201);
  } catch (error) {
    return sendError(res, error.message, 500);
  }
}
