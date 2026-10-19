import prisma from '../config/prisma.js';
import { sendSuccess, sendError } from '../utils/response.js';
import { logAudit } from '../utils/auditLogger.js';

/**
 * Interviews / Reception Controller - لوحة إدخال وإدارة المقابلات الشخصية والاستقبال
 * منبثقة من 14_Reception.gs في النظام القديم
 */

export async function getInterviews(req, res) {
  try {
    const { customerCode, status, tab = 'active', search, dateFrom, dateTo, page = 1, limit = 50 } = req.query;
    const where = {};

    if (customerCode) {
      where.customerCode = String(customerCode).trim().toUpperCase();
    }

    if (status) {
      where.status = status;
    } else if (tab === 'active') {
      where.status = { in: ['مجدولة', 'نشطة', 'جاري المتابعة'] };
    } else if (tab === 'archive') {
      where.status = { in: ['مكتملة', 'تم التعاقد', 'ملغية'] };
    }

    if (search) {
      where.OR = [
        { customerCode: { contains: search } },
        { customerName: { contains: search } },
        { interviewer: { contains: search } },
        { phone: { contains: search } }
      ];
    }

    if (dateFrom || dateTo) {
      where.date = {};
      if (dateFrom) where.date.gte = String(dateFrom);
      if (dateTo) where.date.lte = String(dateTo);
    }

    const take = Math.min(Number(limit) || 50, 100);
    const skip = (Math.max(Number(page) || 1, 1) - 1) * take;

    const [total, interviews] = await Promise.all([
      prisma.interview.count({ where }),
      prisma.interview.findMany({
        where,
        take,
        skip,
        orderBy: { createdAt: 'desc' },
        include: {
          customer: {
            select: { name: true, phone: true, address: true, contractTypes: true }
          }
        }
      })
    ]);

    return sendSuccess(res, interviews, 'قائمة المقابلات والاستقبال', 200, {
      total,
      page: Number(page),
      pages: Math.ceil(total / take)
    });
  } catch (error) {
    return sendError(res, 'فشل جلب المقابلات: ' + error.message, 500);
  }
}

export async function createInterview(req, res) {
  try {
    const {
      customerCode,
      customerName,
      phone,
      date,
      interviewer,
      contractType = 'الفرش كامل',
      status = 'نشطة',
      outcomeNotes,
      budget,
      visitReason
    } = req.body;

    if (!customerName || !date) {
      return sendError(res, 'اسم العميل وتاريخ المقابلة حقول إلزامية.', 400);
    }

    let existingCustomer = null;
    let finalCustomerCode = customerCode;

    // Check if customerCode provided or search by phone
    if (customerCode) {
      existingCustomer = await prisma.customer.findUnique({
        where: { code: String(customerCode).trim().toUpperCase() }
      });
    } else if (phone) {
      existingCustomer = await prisma.customer.findFirst({
        where: { phone: String(phone).trim() }
      });
    }

    // Auto-create customer if does not exist yet (Lead generation from showroom reception)
    if (!existingCustomer) {
      const count = await prisma.customer.count();
      finalCustomerCode = `CUST-${String(count + 1).padStart(4, '0')}`;
      existingCustomer = await prisma.customer.create({
        data: {
          code: finalCustomerCode,
          name: String(customerName).trim(),
          phone: phone || 'غير محدد',
          contractTypes: JSON.stringify([contractType || 'الفرش كامل']),
          status: 'جديد',
          assignedEngineer: interviewer || req.user.name,
          notes: `تم إنشاء العميل من لوحة الاستقبال والمقابلات [الغرض: ${visitReason || 'زيارة عامة'} | الميزانية: ${budget || 'غير محدد'}]`
        }
      });
    } else {
      finalCustomerCode = existingCustomer.code;
    }

    const formattedNotes = [
      outcomeNotes,
      visitReason ? `الغرض من المقابلة: ${visitReason}` : null,
      budget ? `الميزانية التقديرية: ${budget}` : null
    ].filter(Boolean).join(' | ');

    const interview = await prisma.interview.create({
      data: {
        customerCode: finalCustomerCode,
        customerName: String(customerName).trim(),
        phone: phone || existingCustomer.phone || null,
        date: String(date),
        interviewer: interviewer || req.user.name,
        contractType: contractType || 'الفرش كامل',
        status: status || 'نشطة',
        outcomeNotes: formattedNotes || null
      }
    });

    await logAudit({
      userId: req.user.id,
      userCode: req.user.code,
      userName: req.user.name,
      action: 'CREATE_INTERVIEW',
      resource: 'INTERVIEWS',
      resourceId: interview.id,
      ipAddress: req.ip,
      userAgent: req.headers['user-agent'],
      details: { customerCode: finalCustomerCode, customerName, contractType }
    });

    return sendSuccess(res, interview, 'تم تسجيل المقابلة وربطها بنجاح.', 201);
  } catch (error) {
    return sendError(res, 'فشل تسجيل المقابلة: ' + error.message, 500);
  }
}

export async function updateInterview(req, res) {
  try {
    const { id } = req.params;
    const { status, outcomeNotes, contractType, interviewer } = req.body;

    const existing = await prisma.interview.findUnique({ where: { id } });
    if (!existing) return sendError(res, 'المقابلة غير موجودة.', 404);

    const updated = await prisma.interview.update({
      where: { id },
      data: {
        ...(status && { status }),
        ...(outcomeNotes && { outcomeNotes }),
        ...(contractType && { contractType }),
        ...(interviewer && { interviewer })
      }
    });

    await logAudit({
      userId: req.user.id,
      userCode: req.user.code,
      userName: req.user.name,
      action: 'UPDATE_INTERVIEW',
      resource: 'INTERVIEWS',
      resourceId: id,
      ipAddress: req.ip,
      userAgent: req.headers['user-agent'],
      details: { status, outcomeNotes }
    });

    return sendSuccess(res, updated, 'تم تحديث المقابلة بنجاح.');
  } catch (error) {
    return sendError(res, 'تعذر تحديث المقابلة: ' + error.message, 500);
  }
}
