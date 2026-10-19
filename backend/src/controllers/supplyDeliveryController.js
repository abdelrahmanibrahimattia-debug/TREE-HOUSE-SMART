import prisma from '../config/prisma.js';
import { sendSuccess, sendError } from '../utils/response.js';
import { logAudit } from '../utils/auditLogger.js';

export async function getSupplies(req, res) {
  try {
    const { customerCode, stage, status, page = 1, limit = 50 } = req.query;
    const where = {};
    if (customerCode) where.customerCode = String(customerCode).trim();
    if (stage) where.stage = stage;
    if (status) where.status = status;

    const take = Math.min(Number(limit) || 50, 100);
    const skip = (Math.max(Number(page) || 1, 1) - 1) * take;

    const [total, list] = await Promise.all([
      prisma.supplyDelivery.count({ where }),
      prisma.supplyDelivery.findMany({
        where,
        take,
        skip,
        orderBy: { createdAt: 'desc' },
        include: {
          customer: { select: { name: true, phone: true } }
        }
      })
    ]);

    const formatted = list.map(item => ({
      ...item,
      customerName: item.customer?.name || item.customerCode
    }));

    return sendSuccess(res, formatted, 'قائمة التوريدات والتسليمات', 200, {
      total,
      page: Number(page),
      pages: Math.ceil(total / take)
    });
  } catch (error) {
    return sendError(res, 'فشل جلب التوريدات: ' + error.message, 500);
  }
}

export async function createSupply(req, res) {
  try {
    const { customerCode, contractNumber, title, stage, deliveryDate, receivedBy, notes } = req.body;
    if (!customerCode || !title || !stage) {
      return sendError(res, 'كود العميل، عنوان التوريد، ومرحلة التسليم حقول مطلوبة.', 400);
    }

    const customer = await prisma.customer.findUnique({
      where: { code: String(customerCode).trim().toUpperCase() }
    });
    if (!customer) return sendError(res, 'العميل غير مسجل.', 404);

    const count = await prisma.supplyDelivery.count();
    const code = `SUP-${String(count + 1).padStart(4, '0')}`;

    const supply = await prisma.supplyDelivery.create({
      data: {
        code,
        customerId: customer.id,
        customerCode: customer.code,
        contractNumber: contractNumber || null,
        title,
        stage,
        deliveryDate: deliveryDate || null,
        receivedBy: receivedBy || null,
        notes: notes || null
      }
    });

    await logAudit({
      userId: req.user.id,
      userCode: req.user.code,
      userName: req.user.name,
      action: 'CREATE_SUPPLY_DELIVERY',
      resource: 'SUPPLIES',
      resourceId: supply.id,
      ipAddress: req.ip,
      userAgent: req.headers['user-agent'],
      details: { code: supply.code, customerCode: customer.code, stage }
    });

    return sendSuccess(res, supply, 'تم تسجيل أمر التوريد والتسليم بنجاح.', 201);
  } catch (error) {
    return sendError(res, 'تعذر تسجيل التوريد: ' + error.message, 500);
  }
}
