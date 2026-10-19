import prisma from '../config/prisma.js';
import { sendSuccess, sendError } from '../utils/response.js';
import { logAudit } from '../utils/auditLogger.js';

export async function getCustomers(req, res) {
  try {
    const { search, status, contractType, page = 1, limit = 100 } = req.query;

    const where = {};
    if (search) {
      const q = String(search).trim();
      where.OR = [
        { name: { contains: q } },
        { code: { contains: q } },
        { phone: { contains: q } },
        { nationalId: { contains: q } }
      ];
    }
    if (status) {
      where.status = status;
    }
    if (contractType) {
      where.contractTypes = { contains: contractType };
    }

    const take = Math.min(Number(limit) || 100, 200);
    const skip = (Math.max(Number(page) || 1, 1) - 1) * take;

    const [total, customers] = await Promise.all([
      prisma.customer.count({ where }),
      prisma.customer.findMany({
        where,
        take,
        skip,
        orderBy: { createdAt: 'desc' },
        include: {
          _count: {
            select: {
              contracts: true,
              quotations: true,
              checks: true,
              payments: true,
              inspections: true
            }
          }
        }
      })
    ]);

    const formatted = customers.map(c => {
      let types = [];
      try {
        types = typeof c.contractTypes === 'string' ? JSON.parse(c.contractTypes) : c.contractTypes;
      } catch (e) {
        types = [c.contractTypes || 'الفرش كامل'];
      }
      return {
        ...c,
        contractTypes: Array.isArray(types) ? types : [types]
      };
    });

    return sendSuccess(res, formatted, 'قائمة العملاء', 200, {
      total,
      page: Number(page),
      pages: Math.ceil(total / take)
    });
  } catch (error) {
    return sendError(res, 'فشل جلب قائمة العملاء: ' + error.message, 500);
  }
}

export async function getCustomerByCode(req, res) {
  try {
    const { code } = req.params;
    const customer = await prisma.customer.findUnique({
      where: { code: String(code).trim().toUpperCase() },
      include: {
        contracts: {
          include: {
            installments: true,
            workOrders: true
          }
        },
        quotations: true,
        checks: true,
        payments: true,
        inspections: true,
        designs: true,
        supplies: true,
        appliances: true
      }
    });

    if (!customer) {
      return sendError(res, 'العميل غير موجود.', 404);
    }

    let types = [];
    try {
      types = typeof customer.contractTypes === 'string' ? JSON.parse(customer.contractTypes) : customer.contractTypes;
    } catch (e) {
      types = [customer.contractTypes || 'الفرش كامل'];
    }

    return sendSuccess(res, {
      ...customer,
      contractTypes: Array.isArray(types) ? types : [types]
    }, 'تفاصيل العميل');
  } catch (error) {
    return sendError(res, 'فشل جلب تفاصيل العميل.', 500);
  }
}

export async function createCustomer(req, res) {
  try {
    const {
      name,
      phone,
      secondaryPhone,
      nationalId,
      isLegacyCustomer = false,
      address,
      contractTypes = ['الفرش كامل'],
      assignedEngineer,
      assignedContractEngineer,
      siteSupervisor,
      notes
    } = req.body;

    if (!name || !phone) {
      return sendError(res, 'اسم العميل ورقم الهاتف حقول مطلوبة.', 400);
    }

    // Auto-generate Customer Code: CUST-YYYY-XXXX
    const count = await prisma.customer.count();
    const year = new Date().getFullYear();
    const code = `CUST-${year}-${String(count + 1).padStart(4, '0')}`;

    // Handle National ID: if legacy customer or left empty, set to "عميل قبل السيستم"
    let finalNationalId = nationalId ? String(nationalId).trim() : '';
    if (isLegacyCustomer || !finalNationalId || finalNationalId === 'عميل قبل السيستم') {
      finalNationalId = 'عميل قبل السيستم';
    } else if (finalNationalId.length !== 14 && !finalNationalId.includes('قبل السيستم')) {
      return sendError(res, 'الرقم القومي يجب أن يتكون من 14 رقماً، أو حدد "عميل قبل السيستم".', 400);
    }

    // Normalize contractTypes (ensure 'الفرش كامل' is accepted and stored correctly)
    const typesArray = Array.isArray(contractTypes) && contractTypes.length > 0 ? contractTypes : ['الفرش كامل'];

    const customer = await prisma.customer.create({
      data: {
        code,
        name: String(name).trim(),
        phone: String(phone).trim(),
        secondaryPhone: secondaryPhone ? String(secondaryPhone).trim() : null,
        nationalId: finalNationalId,
        address: address ? String(address).trim() : null,
        contractTypes: JSON.stringify(typesArray),
        status: 'جديد',
        assignedEngineer: assignedEngineer || null,
        assignedContractEngineer: assignedContractEngineer || null,
        siteSupervisor: siteSupervisor || null,
        notes: notes || null
      }
    });

    await logAudit({
      userId: req.user.id,
      userCode: req.user.code,
      userName: req.user.name,
      action: 'CREATE_CUSTOMER',
      resource: 'CUSTOMERS',
      resourceId: customer.id,
      ipAddress: req.ip,
      userAgent: req.headers['user-agent'],
      details: { code: customer.code, name: customer.name, nationalId: finalNationalId, contractTypes: typesArray }
    });

    return sendSuccess(res, customer, 'تم تسجيل العميل بنجاح.', 201);
  } catch (error) {
    return sendError(res, 'تعذر تسجيل العميل: ' + error.message, 500);
  }
}

export async function bulkCreateCustomers(req, res) {
  try {
    const { customers = [] } = req.body;

    if (!Array.isArray(customers) || customers.length === 0) {
      return sendError(res, 'يرجى تقديم قائمة عملاء صالحة لإتمام الإضافة المجمعة.', 400);
    }

    const year = new Date().getFullYear();
    const currentCount = await prisma.customer.count();
    const createdList = [];
    const errors = [];

    for (let i = 0; i < customers.length; i++) {
      const item = customers[i];
      if (!item.name || !item.name.trim()) {
        errors.push(`الصف ${i + 1}: الاسم غير محدد.`);
        continue;
      }

      const code = `CUST-${year}-${String(currentCount + createdList.length + 1).padStart(4, '0')}`;
      let nationalId = item.nationalId ? String(item.nationalId).trim() : '';
      if (!nationalId || item.isLegacyCustomer || nationalId === 'عميل قبل السيستم') {
        nationalId = 'عميل قبل السيستم';
      }

      let typesArray = ['الفرش كامل'];
      if (item.contractTypes) {
        typesArray = Array.isArray(item.contractTypes) ? item.contractTypes : [item.contractTypes];
      }

      try {
        const newCust = await prisma.customer.create({
          data: {
            code,
            name: String(item.name).trim(),
            phone: item.phone ? String(item.phone).trim() : 'غير مسجل',
            secondaryPhone: item.secondaryPhone ? String(item.secondaryPhone).trim() : null,
            nationalId,
            address: item.address ? String(item.address).trim() : null,
            contractTypes: JSON.stringify(typesArray),
            status: item.status || 'جديد',
            notes: item.notes || 'تمت الإضافة عبر الإدخال المجمع للعملاء'
          }
        });
        createdList.push(newCust);
      } catch (err) {
        errors.push(`الصف ${i + 1} (${item.name}): ${err.message}`);
      }
    }

    await logAudit({
      userId: req.user.id,
      userCode: req.user.code,
      userName: req.user.name,
      action: 'BULK_CREATE_CUSTOMERS',
      resource: 'CUSTOMERS',
      ipAddress: req.ip,
      userAgent: req.headers['user-agent'],
      details: { addedCount: createdList.length, errorsCount: errors.length }
    });

    return sendSuccess(res, {
      totalSubmitted: customers.length,
      createdCount: createdList.length,
      created: createdList,
      errors
    }, `تمت إضافة ${createdList.length} عميل بنجاح.`);
  } catch (error) {
    return sendError(res, 'فشل تنفيذ الإضافة المجمعة للعملاء: ' + error.message, 500);
  }
}

export async function updateCustomer(req, res) {
  try {
    const { id } = req.params;
    const data = req.body;

    const existing = await prisma.customer.findUnique({ where: { id } });
    if (!existing) return sendError(res, 'العميل غير موجود.', 404);

    const updateData = {};
    if (data.name) updateData.name = String(data.name).trim();
    if (data.phone) updateData.phone = String(data.phone).trim();
    if (data.secondaryPhone !== undefined) updateData.secondaryPhone = data.secondaryPhone;

    // National ID handling: if empty or legacy, set to "عميل قبل السيستم"
    if (data.nationalId !== undefined) {
      let nid = String(data.nationalId).trim();
      if (!nid || data.isLegacyCustomer || nid === 'عميل قبل السيستم') {
        updateData.nationalId = 'عميل قبل السيستم';
      } else {
        updateData.nationalId = nid;
      }
    }

    if (data.address !== undefined) updateData.address = data.address;
    if (data.status) updateData.status = data.status;
    if (data.assignedEngineer !== undefined) updateData.assignedEngineer = data.assignedEngineer;
    if (data.assignedContractEngineer !== undefined) updateData.assignedContractEngineer = data.assignedContractEngineer;
    if (data.siteSupervisor !== undefined) updateData.siteSupervisor = data.siteSupervisor;
    if (data.notes !== undefined) updateData.notes = data.notes;

    if (data.contractTypes) {
      const types = Array.isArray(data.contractTypes) ? data.contractTypes : [data.contractTypes];
      updateData.contractTypes = JSON.stringify(types);
    }

    const updated = await prisma.customer.update({
      where: { id },
      data: updateData
    });

    await logAudit({
      userId: req.user.id,
      userCode: req.user.code,
      userName: req.user.name,
      action: 'UPDATE_CUSTOMER',
      resource: 'CUSTOMERS',
      resourceId: id,
      ipAddress: req.ip,
      userAgent: req.headers['user-agent'],
      details: { customerCode: existing.code, changes: updateData }
    });

    return sendSuccess(res, updated, 'تم تحديث بيانات العميل بنجاح.');
  } catch (error) {
    return sendError(res, 'تعذر تحديث العميل: ' + error.message, 500);
  }
}
