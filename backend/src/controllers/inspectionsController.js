import prisma from '../config/prisma.js';
import { sendSuccess, sendError } from '../utils/response.js';
import { logAudit } from '../utils/auditLogger.js';

/**
 * Inspections Controller - لوحة إدخال وإدارة المعاينات الميدانية
 * يدعم الفلترة بين المعاينات النشطة والأرشيف
 * يدعم نوع التعاقد "الفرش كامل" بشكل افتراضي وشامل
 */

export async function getInspections(req, res) {
  try {
    const { customerCode, status, tab = 'active', search, dateFrom, dateTo, page = 1, limit = 50 } = req.query;
    const where = {};

    if (customerCode) {
      where.customerCode = String(customerCode).trim().toUpperCase();
    }

    if (status) {
      where.status = status;
    } else if (tab === 'active') {
      where.status = { in: ['مجدولة', 'قيد التنفيذ', 'بانتظار التقرير'] };
    } else if (tab === 'archive') {
      where.status = { in: ['مكتملة', 'معتمدة', 'ملغية'] };
    }

    if (search) {
      where.OR = [
        { customerCode: { contains: search } },
        { location: { contains: search } },
        { responsible: { contains: search } },
        { customer: { name: { contains: search } } }
      ];
    }

    if (dateFrom || dateTo) {
      where.date = {};
      if (dateFrom) where.date.gte = String(dateFrom);
      if (dateTo) where.date.lte = String(dateTo);
    }

    const take = Math.min(Number(limit) || 50, 100);
    const skip = (Math.max(Number(page) || 1, 1) - 1) * take;

    const [total, inspections] = await Promise.all([
      prisma.inspection.count({ where }),
      prisma.inspection.findMany({
        where,
        take,
        skip,
        orderBy: { createdAt: 'desc' },
        include: {
          customer: {
            select: { name: true, phone: true, address: true }
          }
        }
      })
    ]);

    const formatted = inspections.map(i => ({
      ...i,
      customerName: i.customer?.name || i.customerCode,
      customerPhone: i.customer?.phone || '',
      address: i.location || i.customer?.address || ''
    }));

    return sendSuccess(res, formatted, 'قائمة المعاينات الميدانية', 200, {
      total,
      page: Number(page),
      pages: Math.ceil(total / take)
    });
  } catch (error) {
    return sendError(res, 'فشل جلب المعاينات: ' + error.message, 500);
  }
}

export async function createInspection(req, res) {
  try {
    const {
      customerCode,
      date,
      time,
      engineer,
      contractType = 'الفرش كامل',
      location,
      notes,
      inspectionFee = 0,
      feeStatus = 'غير مسددة'
    } = req.body;

    if (!customerCode || !date) {
      return sendError(res, 'كود العميل وتاريخ المعاينة حقول إلزامية.', 400);
    }

    const customer = await prisma.customer.findUnique({
      where: { code: String(customerCode).trim().toUpperCase() }
    });

    if (!customer) {
      return sendError(res, 'العميل غير مسجل بالنظام.', 404);
    }

    const count = await prisma.inspection.count();
    const code = `INSP-${String(count + 1).padStart(4, '0')}`;

    const newInspection = await prisma.inspection.create({
      data: {
        code,
        customerId: customer.id,
        customerCode: customer.code,
        date: String(date),
        location: location || customer.address || null,
        responsible: engineer || req.user.name,
        contractType: contractType || 'الفرش كامل',
        status: 'مجدولة',
        notes: notes ? `${notes} [الوقت: ${time || 'غير محدد'} | الرسوم: ${inspectionFee} (${feeStatus})]` : `[الوقت: ${time || 'غير محدد'} | الرسوم: ${inspectionFee} (${feeStatus})]`
      }
    });

    // Update customer status to reflect inspection scheduled
    await prisma.customer.update({
      where: { id: customer.id },
      data: {
        status: 'تمت المعاينة',
        assignedEngineer: engineer || customer.assignedEngineer
      }
    });

    await logAudit({
      userId: req.user.id,
      userCode: req.user.code,
      userName: req.user.name,
      action: 'CREATE_INSPECTION',
      resource: 'INSPECTIONS',
      resourceId: newInspection.id,
      ipAddress: req.ip,
      userAgent: req.headers['user-agent'],
      details: { code: newInspection.code, customerCode: customer.code, contractType }
    });

    return sendSuccess(res, newInspection, 'تم تسجيل موعد المعاينة بنجاح', 201);
  } catch (error) {
    return sendError(res, 'فشل تسجيل المعاينة: ' + error.message, 500);
  }
}

export async function updateInspection(req, res) {
  try {
    const { id } = req.params;
    const { status, notes, mediaFiles, location, responsible, contractType } = req.body;

    const existing = await prisma.inspection.findUnique({ where: { id } });
    if (!existing) return sendError(res, 'المعاينة غير موجودة.', 404);

    const updated = await prisma.inspection.update({
      where: { id },
      data: {
        ...(status && { status }),
        ...(notes && { notes }),
        ...(location && { location }),
        ...(responsible && { responsible }),
        ...(contractType && { contractType }),
        ...(mediaFiles && { mediaFiles: typeof mediaFiles === 'string' ? mediaFiles : JSON.stringify(mediaFiles) })
      }
    });

    await logAudit({
      userId: req.user.id,
      userCode: req.user.code,
      userName: req.user.name,
      action: 'UPDATE_INSPECTION',
      resource: 'INSPECTIONS',
      resourceId: id,
      ipAddress: req.ip,
      userAgent: req.headers['user-agent'],
      details: { status, notes }
    });

    return sendSuccess(res, updated, 'تم تحديث بيانات وتقرير المعاينة بنجاح.');
  } catch (error) {
    return sendError(res, 'تعذر تحديث المعاينة: ' + error.message, 500);
  }
}
