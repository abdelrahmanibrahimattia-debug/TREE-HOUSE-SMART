import prisma from '../config/prisma.js';

/**
 * Fault-Tolerant Asynchronous Audit Logger
 * Never blocks the main request if logging encounters any issue.
 */
export async function logAudit({
  userId = null,
  userCode = null,
  userName = null,
  action,
  resource,
  resourceId = null,
  ipAddress = null,
  userAgent = null,
  details = null
}) {
  try {
    const detailsStr = typeof details === 'object' && details !== null
      ? JSON.stringify(details)
      : (details ? String(details) : null);

    await prisma.auditLog.create({
      data: {
        userId,
        userCode,
        userName,
        action,
        resource,
        resourceId,
        ipAddress,
        userAgent,
        details: detailsStr
      }
    });
  } catch (error) {
    console.error('⚠️ [AuditLog Error]:', error.message);
  }
}
