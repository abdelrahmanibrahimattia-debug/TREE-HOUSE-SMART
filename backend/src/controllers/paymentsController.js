import prisma from '../config/prisma.js';
import { sendSuccess, sendError } from '../utils/response.js';
import { logAudit } from '../utils/auditLogger.js';

export async function getPayments(req, res) {
  try {
    const { customerCode, type, page = 1, limit = 50 } = req.query;
    const where = {};
    if (customerCode) where.customerCode = String(customerCode).trim();
    if (type) where.type = type;

    const take = Math.min(Number(limit) || 50, 100);
    const skip = (Math.max(Number(page) || 1, 1) - 1) * take;

    const [total, payments] = await Promise.all([
      prisma.payment.count({ where }),
      prisma.payment.findMany({
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

    const formatted = payments.map(p => ({
      ...p,
      customerName: p.customer?.name || p.customerCode
    }));

    return sendSuccess(res, formatted, 'قائمة المدفوعات وسندات الصرف والقبض', 200, {
      total,
      page: Number(page),
      pages: Math.ceil(total / take)
    });
  } catch (error) {
    return sendError(res, 'فشل جلب المدفوعات: ' + error.message, 500);
  }
}

export async function createPayment(req, res) {
  try {
    const {
      customerCode,
      contractNumber,
      installmentId,
      type = 'تحصيل',
      amount,
      date,
      method = 'نقدي',
      invoiceFileUrl,
      invoiceMimeType,
      notes
    } = req.body;

    if (!customerCode || amount === undefined) {
      return sendError(res, 'كود العميل والمبلغ حقول مطلوبة.', 400);
    }

    const customer = await prisma.customer.findUnique({
      where: { code: String(customerCode).trim().toUpperCase() }
    });

    if (!customer) {
      return sendError(res, 'العميل غير مسجل بالنظام.', 404);
    }

    const count = await prisma.payment.count();
    const receiptNumber = `REC-${new Date().getFullYear()}-${String(count + 1).padStart(5, '0')}`;

    const payment = await prisma.$transaction(async (tx) => {
      const createdPayment = await tx.payment.create({
        data: {
          receiptNumber,
          customerId: customer.id,
          customerCode: customer.code,
          contractNumber: contractNumber || null,
          type,
          amount: Number(amount) || 0,
          date: date || new Date().toISOString().split('T')[0],
          method,
          invoiceFileUrl: invoiceFileUrl || null,
          invoiceMimeType: invoiceMimeType || null,
          notes: notes || null,
          createdBy: req.user.name
        }
      });

      // If an installment was paid, mark it as PAID
      if (installmentId) {
        await tx.installment.update({
          where: { id: installmentId },
          data: {
            status: 'مدفوع',
            paidAt: new Date()
          }
        });
      }

      return createdPayment;
    });

    await logAudit({
      userId: req.user.id,
      userCode: req.user.code,
      userName: req.user.name,
      action: 'CREATE_PAYMENT',
      resource: 'PAYMENTS',
      resourceId: payment.id,
      ipAddress: req.ip,
      userAgent: req.headers['user-agent'],
      details: { receiptNumber: payment.receiptNumber, customerCode: customer.code, amount }
    });

    return sendSuccess(res, payment, 'تم تسجيل سند الدفع بنجاح.', 201);
  } catch (error) {
    return sendError(res, 'تعذر تسجيل سند الدفع: ' + error.message, 500);
  }
}
