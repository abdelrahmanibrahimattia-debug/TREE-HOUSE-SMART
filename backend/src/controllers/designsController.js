import prisma from '../config/prisma.js';
import { sendSuccess, sendError } from '../utils/response.js';
import { logAudit } from '../utils/auditLogger.js';

export async function getDesigns(req, res) {
  try {
    const { customerCode, status, page = 1, limit = 50 } = req.query;
    const where = {};
    if (customerCode) where.customerCode = String(customerCode).trim();
    if (status) where.status = status;

    const take = Math.min(Number(limit) || 50, 100);
    const skip = (Math.max(Number(page) || 1, 1) - 1) * take;

    const [total, designs] = await Promise.all([
      prisma.design.count({ where }),
      prisma.design.findMany({
        where,
        take,
        skip,
        orderBy: { createdAt: 'desc' },
        include: {
          customer: { select: { name: true, phone: true } }
        }
      })
    ]);

    const formatted = designs.map(d => ({
      ...d,
      customerName: d.customer?.name || d.customerCode
    }));

    return sendSuccess(res, formatted, 'قائمة التصميمات والمقترحات', 200, {
      total,
      page: Number(page),
      pages: Math.ceil(total / take)
    });
  } catch (error) {
    return sendError(res, 'فشل جلب التصميمات: ' + error.message, 500);
  }
}

export async function createDesign(req, res) {
  try {
    const { customerCode, title, contractType = 'الفرش كامل', fileUrl, notes } = req.body;
    if (!customerCode || !title) {
      return sendError(res, 'كود العميل وعنوان التصميم حقول مطلوبة.', 400);
    }

    const customer = await prisma.customer.findUnique({
      where: { code: String(customerCode).trim().toUpperCase() }
    });
    if (!customer) return sendError(res, 'العميل غير مسجل.', 404);

    const count = await prisma.design.count();
    const code = `DSGN-${String(count + 1).padStart(4, '0')}`;

    const design = await prisma.design.create({
      data: {
        code,
        customerId: customer.id,
        customerCode: customer.code,
        title,
        contractType,
        fileUrl: fileUrl || null,
        designer: req.user.name,
        notes: notes || null
      }
    });

    await logAudit({
      userId: req.user.id,
      userCode: req.user.code,
      userName: req.user.name,
      action: 'CREATE_DESIGN',
      resource: 'DESIGNS',
      resourceId: design.id,
      ipAddress: req.ip,
      userAgent: req.headers['user-agent'],
      details: { designCode: design.code, customerCode: customer.code, contractType }
    });

    return sendSuccess(res, design, 'تم حفظ التصميم بنجاح.', 201);
  } catch (error) {
    return sendError(res, 'تعذر حفظ التصميم: ' + error.message, 500);
  }
}
