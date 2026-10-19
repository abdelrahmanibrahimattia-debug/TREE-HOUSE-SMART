import jwt from 'jsonwebtoken';
import prisma from '../config/prisma.js';
import { sendError } from '../utils/response.js';

/**
 * Authentication Middleware (Zero-Trust Session Guard)
 * Enforces token validity and immediate account suspension check.
 */
export async function authenticateToken(req, res, next) {
  const authHeader = req.headers['authorization'];
  const token = authHeader && authHeader.startsWith('Bearer ')
    ? authHeader.substring(7)
    : req.cookies?.token;

  if (!token) {
    return sendError(res, 'يجب تسجيل الدخول للوصول إلى هذا المورد.', 401);
  }

  try {
    const decoded = jwt.verify(token, process.env.JWT_SECRET);
    
    // Always check live database record to enforce instant account suspension
    const user = await prisma.user.findUnique({
      where: { id: decoded.userId },
      select: {
        id: true,
        code: true,
        name: true,
        email: true,
        role: true,
        customPermissions: true,
        accountStatus: true
      }
    });

    if (!user) {
      return sendError(res, 'المستخدم غير موجود بالنظام.', 401);
    }

    // Instant Kill-Switch: if owner suspended this user, block instantly!
    if (user.accountStatus !== 'ACTIVE') {
      return sendError(res, 'تم تعطيل هذا الحساب من قبل إدارة النظام، لا تملك صلاحية الدخول.', 403);
    }

    // Parse custom permissions
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

    req.user = {
      ...user,
      permissions
    };

    next();
  } catch (error) {
    if (error.name === 'TokenExpiredError') {
      return sendError(res, 'انتهت صلاحية الجلسة، يرجى تسجيل الدخول مجدداً.', 401);
    }
    return sendError(res, 'جلسة غير صالحة أو تم التلاعب بها.', 403);
  }
}
