import { sendError } from '../utils/response.js';
import { logAudit } from '../utils/auditLogger.js';

/**
 * Granular RBAC Permission Guard Middleware
 * Strict Deny-By-Default:
 * If the user has not been granted this specific permission, returns 403 Forbidden.
 */
export function requirePermission(permissionCode) {
  return async (req, res, next) => {
    const user = req.user;
    if (!user) {
      return sendError(res, 'غير مصرح بالدخول.', 401);
    }

    // OWNER has absolute supreme master authority
    if (user.role === 'OWNER') {
      return next();
    }

    // Check custom permissions assigned by owner
    const permissions = user.permissions || {};
    const hasPermission = Boolean(permissions[permissionCode]);

    if (!hasPermission) {
      // Log unauthorized attempt in audit trail
      await logAudit({
        userId: user.id,
        userCode: user.code,
        userName: user.name,
        action: 'ACCESS_DENIED',
        resource: permissionCode,
        ipAddress: req.ip,
        userAgent: req.headers['user-agent'],
        details: { requiredPermission: permissionCode }
      });

      return sendError(res, `عذراً، ليس لديك صلاحية تنفيذ هذا الإجراء (${permissionCode}). تواصل مع إدارة النظام.`, 403);
    }

    next();
  };
}

/**
 * Role-level guard (e.g., only OWNER or ADMIN)
 */
export function requireRole(...allowedRoles) {
  return (req, res, next) => {
    const user = req.user;
    if (!user || !allowedRoles.includes(user.role)) {
      return sendError(res, 'هذا القسم مخصص لإدارة النظام والمالك فقط.', 403);
    }
    next();
  };
}
