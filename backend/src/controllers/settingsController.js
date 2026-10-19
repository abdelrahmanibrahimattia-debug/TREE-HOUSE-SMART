import bcrypt from 'bcryptjs';
import prisma from '../config/prisma.js';
import { sendSuccess, sendError } from '../utils/response.js';
import { logAudit } from '../utils/auditLogger.js';

// In-memory / persistent company configuration store
let companySettings = {
  companyName: 'System Tree House',
  slogan: 'SMART BY NATURE - حلول المطابخ والدريسنج والفرش الكامل',
  phone: '01000000000',
  secondaryPhone: '01100000000',
  address: 'القاهرة، مصر',
  taxNumber: '123-456-789',
  commercialRegister: '987654',
  version: '2.5.0 Enterprise',
  themePrimaryColor: '#4E8732',
  themeSecondaryColor: '#3D2817'
};

export async function getProfile(req, res) {
  try {
    const user = await prisma.user.findUnique({
      where: { id: req.user.id },
      select: {
        id: true,
        code: true,
        name: true,
        email: true,
        phone: true,
        role: true,
        salary: true,
        accountStatus: true,
        lastLoginAt: true,
        createdAt: true
      }
    });

    if (!user) return sendError(res, 'المستخدم غير موجود.', 404);

    return sendSuccess(res, user, 'بيانات الحساب الشخصي');
  } catch (error) {
    return sendError(res, 'تعذر جلب بيانات الحساب: ' + error.message, 500);
  }
}

export async function updateProfile(req, res) {
  try {
    const { phone, currentPassword, newPassword } = req.body;
    const user = await prisma.user.findUnique({ where: { id: req.user.id } });

    if (!user) return sendError(res, 'المستخدم غير موجود.', 404);

    const updateData = {};
    if (phone !== undefined) updateData.phone = phone;

    if (newPassword) {
      if (!currentPassword) {
        return sendError(res, 'يرجى إدخال كلمة المرور الحالية لتأكيد التغيير.', 400);
      }
      const match = await bcrypt.compare(currentPassword, user.passwordHash);
      if (!match) {
        return sendError(res, 'كلمة المرور الحالية غير صحيحة.', 400);
      }
      if (newPassword.length < 6) {
        return sendError(res, 'كلمة المرور الجديدة يجب ألا تقل عن 6 أحرف.', 400);
      }
      const salt = await bcrypt.genSalt(12);
      updateData.passwordHash = await bcrypt.hash(newPassword, salt);
    }

    const updated = await prisma.user.update({
      where: { id: req.user.id },
      data: updateData,
      select: {
        id: true,
        code: true,
        name: true,
        email: true,
        phone: true,
        role: true
      }
    });

    await logAudit({
      userId: req.user.id,
      userCode: req.user.code,
      userName: req.user.name,
      action: 'UPDATE_PROFILE',
      resource: 'USERS',
      resourceId: req.user.id,
      ipAddress: req.ip,
      userAgent: req.headers['user-agent'],
      details: { changedPassword: Boolean(newPassword) }
    });

    return sendSuccess(res, updated, 'تم تحديث بيانات الحساب بنجاح.');
  } catch (error) {
    return sendError(res, 'فشل تحديث البيانات: ' + error.message, 500);
  }
}

export async function getCompanySettings(req, res) {
  return sendSuccess(res, companySettings, 'بيانات وإعدادات الشركة والنظام');
}

export async function updateCompanySettings(req, res) {
  try {
    const { companyName, slogan, phone, secondaryPhone, address, taxNumber, commercialRegister } = req.body;

    companySettings = {
      ...companySettings,
      ...(companyName && { companyName }),
      ...(slogan && { slogan }),
      ...(phone && { phone }),
      ...(secondaryPhone && { secondaryPhone }),
      ...(address && { address }),
      ...(taxNumber && { taxNumber }),
      ...(commercialRegister && { commercialRegister })
    };

    await logAudit({
      userId: req.user.id,
      userCode: req.user.code,
      userName: req.user.name,
      action: 'UPDATE_COMPANY_SETTINGS',
      resource: 'SETTINGS',
      ipAddress: req.ip,
      userAgent: req.headers['user-agent'],
      details: companySettings
    });

    return sendSuccess(res, companySettings, 'تم حفظ إعدادات المؤسسة بنجاح.');
  } catch (error) {
    return sendError(res, 'تعذر تحديث إعدادات المؤسسة: ' + error.message, 500);
  }
}
