import prisma from '../config/prisma.js';
import { sendSuccess, sendError } from '../utils/response.js';
import { logAudit } from '../utils/auditLogger.js';

export async function getQuotations(req, res) {
  try {
    const { customerCode, contractType, page = 1, limit = 50 } = req.query;
    const where = {};
    if (customerCode) where.customerCode = String(customerCode).trim();
    if (contractType) where.contractType = contractType;

    const take = Math.min(Number(limit) || 50, 100);
    const skip = (Math.max(Number(page) || 1, 1) - 1) * take;

    const [total, quotations] = await Promise.all([
      prisma.quotation.count({ where }),
      prisma.quotation.findMany({
        where,
        take,
        skip,
        orderBy: { createdAt: 'desc' },
        include: {
          customer: {
            select: { name: true, phone: true }
          }
        }
      })
    ]);

    const formatted = quotations.map(q => {
      let items = [];
      try {
        items = typeof q.items === 'string' ? JSON.parse(q.items) : q.items;
      } catch (e) {
        items = [];
      }
      return {
        ...q,
        customerName: q.customer?.name || q.customerCode,
        items
      };
    });

    return sendSuccess(res, formatted, 'قائمة المقايسات', 200, {
      total,
      page: Number(page),
      pages: Math.ceil(total / take)
    });
  } catch (error) {
    return sendError(res, 'فشل جلب المقايسات: ' + error.message, 500);
  }
}

export async function createQuotation(req, res) {
  try {
    const {
      customerCode,
      contractType = 'الفرش كامل',
      title,
      items = [],
      discount = 0
    } = req.body;

    if (!customerCode) {
      return sendError(res, 'كود العميل مطلوب.', 400);
    }

    const customer = await prisma.customer.findUnique({
      where: { code: String(customerCode).trim().toUpperCase() }
    });

    if (!customer) {
      return sendError(res, 'العميل غير مسجل بالنظام.', 404);
    }

    // Calculate totals automatically
    let totalAmount = 0;
    const parsedItems = Array.isArray(items) ? items : [];
    parsedItems.forEach(item => {
      const q = Number(item.quantity) || 1;
      const p = Number(item.unitPrice) || 0;
      item.total = q * p;
      totalAmount += item.total;
    });

    const numDiscount = Number(discount) || 0;
    const netAmount = Math.max(0, totalAmount - numDiscount);

    const count = await prisma.quotation.count();
    const code = `BOQ-${new Date().getFullYear()}-${String(count + 1).padStart(4, '0')}`;

    const quotation = await prisma.quotation.create({
      data: {
        code,
        customerId: customer.id,
        customerCode: customer.code,
        contractType: contractType || 'الفرش كامل',
        title: title || `مقايسة ${contractType} - ${customer.name}`,
        totalAmount,
        discount: numDiscount,
        netAmount,
        items: JSON.stringify(parsedItems),
        status: 'معتمدة',
        approvedBy: req.user.name
      }
    });

    await logAudit({
      userId: req.user.id,
      userCode: req.user.code,
      userName: req.user.name,
      action: 'CREATE_QUOTATION',
      resource: 'BOQ',
      resourceId: quotation.id,
      ipAddress: req.ip,
      userAgent: req.headers['user-agent'],
      details: { quotationCode: quotation.code, customerCode: customer.code, netAmount, contractType }
    });

    return sendSuccess(res, quotation, 'تم حفظ المقايسة بنجاح.', 201);
  } catch (error) {
    return sendError(res, 'تعذر حفظ المقايسة: ' + error.message, 500);
  }
}
