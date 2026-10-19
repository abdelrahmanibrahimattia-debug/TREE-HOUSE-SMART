import prisma from '../config/prisma.js';
import { sendSuccess, sendError } from '../utils/response.js';
import { logAudit } from '../utils/auditLogger.js';

export async function getContracts(req, res) {
  try {
    const { customerCode, contractType, page = 1, limit = 50 } = req.query;
    const where = {};
    if (customerCode) where.customerCode = String(customerCode).trim();
    if (contractType) where.contractType = contractType;

    const take = Math.min(Number(limit) || 50, 100);
    const skip = (Math.max(Number(page) || 1, 1) - 1) * take;

    const [total, contracts] = await Promise.all([
      prisma.contract.count({ where }),
      prisma.contract.findMany({
        where,
        take,
        skip,
        orderBy: { createdAt: 'desc' },
        include: {
          customer: {
            select: { name: true, phone: true, nationalId: true }
          },
          installments: {
            orderBy: { number: 'asc' }
          }
        }
      })
    ]);

    const formatted = contracts.map(c => {
      let terms = [];
      let articles = [];
      try {
        terms = typeof c.paymentTerms === 'string' ? JSON.parse(c.paymentTerms) : c.paymentTerms;
      } catch (e) { terms = []; }
      try {
        articles = typeof c.articles === 'string' ? JSON.parse(c.articles) : c.articles;
      } catch (e) { articles = []; }

      return {
        ...c,
        customerName: c.customer?.name || c.customerCode,
        customerNationalId: c.customer?.nationalId || '',
        paymentTerms: terms,
        articles
      };
    });

    return sendSuccess(res, formatted, 'قائمة العقود', 200, {
      total,
      page: Number(page),
      pages: Math.ceil(total / take)
    });
  } catch (error) {
    return sendError(res, 'فشل جلب العقود: ' + error.message, 500);
  }
}

export async function createContract(req, res) {
  try {
    const {
      customerCode,
      quotationId,
      contractType = 'الفرش كامل',
      totalAmount,
      downPayment,
      installments = [],
      articles = []
    } = req.body;

    if (!customerCode || totalAmount === undefined) {
      return sendError(res, 'كود العميل وإجمالي قيمة العقد حقول مطلوبة.', 400);
    }

    const customer = await prisma.customer.findUnique({
      where: { code: String(customerCode).trim().toUpperCase() }
    });

    if (!customer) {
      return sendError(res, 'العميل غير مسجل بالنظام.', 404);
    }

    const total = Number(totalAmount) || 0;
    const down = Number(downPayment) || 0;
    const remaining = Math.max(0, total - down);

    // Auto-generate Contract Number: CONT-YYYY-XXXX
    const count = await prisma.contract.count();
    const contractNumber = `CONT-${new Date().getFullYear()}-${String(count + 1).padStart(4, '0')}`;

    // Execute atomic transaction to save contract and its installments
    const contract = await prisma.$transaction(async (tx) => {
      const createdContract = await tx.contract.create({
        data: {
          contractNumber,
          customerId: customer.id,
          customerCode: customer.code,
          quotationId: quotationId || null,
          contractType: contractType || 'الفرش كامل',
          totalAmount: total,
          downPayment: down,
          remainingAmount: remaining,
          paymentTerms: JSON.stringify(installments),
          articles: JSON.stringify(articles),
          status: 'ساري',
          signedAt: new Date()
        }
      });

      // Save scheduled installments
      if (Array.isArray(installments) && installments.length > 0) {
        for (let i = 0; i < installments.length; i++) {
          const inst = installments[i];
          await tx.installment.create({
            data: {
              contractId: createdContract.id,
              contractNumber: createdContract.contractNumber,
              customerCode: customer.code,
              number: i + 1,
              dueDate: inst.dueDate || '',
              amount: Number(inst.amount) || 0,
              status: 'غير مدفوع',
              notes: inst.notes || inst.title || `دفعة ${i + 1}`
            }
          });
        }
      }

      // Update customer status to "تم التعاقد"
      await tx.customer.update({
        where: { id: customer.id },
        data: { status: 'تم التعاقد' }
      });

      return createdContract;
    });

    await logAudit({
      userId: req.user.id,
      userCode: req.user.code,
      userName: req.user.name,
      action: 'CREATE_CONTRACT',
      resource: 'CONTRACTS',
      resourceId: contract.id,
      ipAddress: req.ip,
      userAgent: req.headers['user-agent'],
      details: { contractNumber: contract.contractNumber, customerCode: customer.code, totalAmount: total, contractType }
    });

    return sendSuccess(res, contract, 'تم إنشاء العقد وجدولة الدفعات بنجاح.', 201);
  } catch (error) {
    return sendError(res, 'تعذر إنشاء العقد: ' + error.message, 500);
  }
}
