import prisma from '../config/prisma.js';
import { sendSuccess, sendError } from '../utils/response.js';

export async function getCustomerProjectOverview(req, res) {
  try {
    const { code } = req.params;
    const customerCode = String(code).trim().toUpperCase();

    const [customer, allCustomerWorkOrders, interviews] = await Promise.all([
      prisma.customer.findUnique({
        where: { code: customerCode },
        include: {
          contracts: {
            include: {
              installments: {
                orderBy: { number: 'asc' }
              },
              workOrders: true
            }
          },
          quotations: {
            orderBy: { createdAt: 'desc' }
          },
          inspections: {
            orderBy: { createdAt: 'desc' }
          },
          checks: {
            orderBy: { createdAt: 'desc' }
          },
          designs: {
            orderBy: { createdAt: 'desc' }
          },
          supplies: {
            orderBy: { createdAt: 'desc' }
          },
          appliances: {
            orderBy: { createdAt: 'desc' }
          },
          payments: {
            orderBy: { createdAt: 'desc' }
          },
          tasks: {
            orderBy: { createdAt: 'desc' }
          }
        }
      }),
      // Also fetch any work orders directly tagged with this customer code
      prisma.workOrder.findMany({
        where: { customerCode },
        orderBy: { createdAt: 'desc' }
      }),
      // Fetch interviews
      prisma.interview.findMany({
        where: { customerCode },
        orderBy: { date: 'desc' }
      })
    ]);

    if (!customer) {
      return sendError(res, 'العميل غير موجود.', 404);
    }

    let contractTypes = [];
    try {
      contractTypes = typeof customer.contractTypes === 'string'
        ? JSON.parse(customer.contractTypes)
        : customer.contractTypes;
    } catch (e) {
      contractTypes = [customer.contractTypes || 'الفرش كامل'];
    }

    // Merge work orders from contracts and direct work orders
    const workOrderMap = new Map();
    allCustomerWorkOrders.forEach(wo => workOrderMap.set(wo.id, wo));
    customer.contracts.forEach(c => {
      (c.workOrders || []).forEach(wo => workOrderMap.set(wo.id, wo));
    });
    const consolidatedWorkOrders = Array.from(workOrderMap.values());

    // Calculate Financial Summary
    const totalContracted = customer.contracts.reduce((sum, c) => sum + (c.totalAmount || 0), 0);
    const totalPaid = customer.payments.filter(p => p.type === 'تحصيل').reduce((sum, p) => sum + (p.amount || 0), 0);
    const remainingBalance = Math.max(0, totalContracted - totalPaid);

    return sendSuccess(res, {
      customer: {
        ...customer,
        contractTypes: Array.isArray(contractTypes) ? contractTypes : [contractTypes],
        interviews: interviews || [],
        workOrders: consolidatedWorkOrders
      },
      summary: {
        totalContracted,
        totalPaid,
        remainingBalance,
        contractsCount: customer.contracts.length,
        quotationsCount: customer.quotations.length,
        designsCount: customer.designs.length,
        checksCount: customer.checks.length,
        suppliesCount: customer.supplies.length,
        appliancesCount: customer.appliances.length,
        workOrdersCount: consolidatedWorkOrders.length,
        interviewsCount: (interviews || []).length
      }
    }, 'لوحة مشروع العميل الشاملة (360-View)');
  } catch (error) {
    return sendError(res, 'فشل جلب ملف مشروع العميل: ' + error.message, 500);
  }
}
