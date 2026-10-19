import prisma from '../config/prisma.js';
import { sendSuccess, sendError } from '../utils/response.js';
import { logAudit } from '../utils/auditLogger.js';

export async function getWorkOrders(req, res) {
  try {
    const { customerCode, department, status, page = 1, limit = 50 } = req.query;
    const where = {};
    if (customerCode) where.customerCode = String(customerCode).trim();
    if (department) where.department = department;
    if (status) where.status = status;

    const take = Math.min(Number(limit) || 50, 100);
    const skip = (Math.max(Number(page) || 1, 1) - 1) * take;

    const [total, orders] = await Promise.all([
      prisma.workOrder.count({ where }),
      prisma.workOrder.findMany({
        where,
        take,
        skip,
        orderBy: { createdAt: 'desc' },
        include: {
          contract: {
            include: { customer: { select: { name: true, phone: true } } }
          }
        }
      })
    ]);

    const formatted = orders.map(o => ({
      ...o,
      customerName: o.contract?.customer?.name || o.customerCode
    }));

    return sendSuccess(res, formatted, 'قائمة أوامر الشغل والإنتاج', 200, {
      total,
      page: Number(page),
      pages: Math.ceil(total / take)
    });
  } catch (error) {
    return sendError(res, 'فشل جلب أوامر الشغل: ' + error.message, 500);
  }
}

export async function createWorkOrder(req, res) {
  try {
    const { contractNumber, department, priority = 'عادية', dueDate, specs } = req.body;
    if (!contractNumber || !department) {
      return sendError(res, 'رقم العقد والقسم الصناعي حقول مطلوبة.', 400);
    }

    const contract = await prisma.contract.findUnique({
      where: { contractNumber: String(contractNumber).trim() }
    });
    if (!contract) return sendError(res, 'العقد غير موجود بالنظام.', 404);

    const count = await prisma.workOrder.count();
    const orderNumber = `WO-${String(count + 1).padStart(4, '0')}`;

    const order = await prisma.workOrder.create({
      data: {
        orderNumber,
        customerId: contract.customerId,
        customerCode: contract.customerCode,
        contractId: contract.id,
        contractType: contract.contractType,
        department,
        priority,
        dueDate: dueDate || null,
        specs: specs ? (typeof specs === 'string' ? specs : JSON.stringify(specs)) : null
      }
    });

    await logAudit({
      userId: req.user.id,
      userCode: req.user.code,
      userName: req.user.name,
      action: 'CREATE_WORK_ORDER',
      resource: 'WORK_ORDERS',
      resourceId: order.id,
      ipAddress: req.ip,
      userAgent: req.headers['user-agent'],
      details: { orderNumber: order.orderNumber, department, contractNumber }
    });

    return sendSuccess(res, order, 'تم إصدار أمر الشغل بنجاح.', 201);
  } catch (error) {
    return sendError(res, 'تعذر إصدار أمر الشغل: ' + error.message, 500);
  }
}
