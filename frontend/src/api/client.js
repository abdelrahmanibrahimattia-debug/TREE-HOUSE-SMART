/**
 * Tree House API Client (Unified Fetch Wrapper & GitHub Pages Offline Demo Provider)
 * Handles auto-bearer token injection, error sanitization, 401/403 handling,
 * and provides seamless demo fallback when hosted on GitHub Pages (static environment).
 */

const isGitHubPages = typeof window !== 'undefined' && window.location.hostname.includes('github.io');
const API_BASE = isGitHubPages ? (localStorage.getItem('th_custom_api_url') || '/api') : '/api';

// Initial Mock Seed for GitHub Pages standalone preview
const MOCK_STORAGE_KEY = 'th_gh_pages_mock_data';

function getMockDb() {
  const existing = localStorage.getItem(MOCK_STORAGE_KEY);
  if (existing) {
    try { return JSON.parse(existing); } catch (e) {}
  }
  const initial = {
    customers: [
      {
        id: 'cust-1',
        code: 'CUST-2026-0001',
        name: 'م. أحمد الشريف',
        phone: '01012345678',
        secondaryPhone: '01123456789',
        nationalId: '29001011234567',
        address: 'التجمع الخامس - كمبوند هايد بارك - فيلا 42',
        contractTypes: ['الفرش كامل', 'مطبخ', 'دريسنج'],
        status: 'جاري التصنيع',
        assignedEngineer: 'م. طارق مهدي',
        assignedContractEngineer: 'م. كريم سامي',
        siteSupervisor: 'م. حسام حسن',
        notes: 'العميل مهتم بجودة الإكسسوارات النمساوية (Blum) وتناسق ألوان الفرش الكامل.'
      },
      {
        id: 'cust-2',
        code: 'CUST-2026-0002',
        name: 'د. سارة عبد الرحمن',
        phone: '01223344556',
        secondaryPhone: '',
        nationalId: 'عميل قبل السيستم',
        address: 'الشيخ زايد - بيفرلي هيلز - شقة 104',
        contractTypes: ['مطبخ', 'وحدات حمام'],
        status: 'تمت المعاينة',
        assignedEngineer: 'م. زياد محمود',
        notes: 'عميلة قديمة مسجلة قبل النظام تم تحويلها لمرحلة التصميم.'
      }
    ],
    contracts: [
      {
        id: 'cnt-1',
        contractNumber: 'CONT-2026-001',
        customerId: 'cust-1',
        customerCode: 'CUST-2026-0001',
        contractType: 'الفرش كامل',
        totalAmount: 380000,
        downPayment: 190000,
        remainingAmount: 190000,
        status: 'ساري',
        installments: [
          { id: 'inst-1', number: 1, dueDate: '2026-11-01', amount: 95000, status: 'مدفوع', paidAt: '2026-10-15' },
          { id: 'inst-2', number: 2, dueDate: '2026-12-01', amount: 95000, status: 'غير مدفوع' }
        ]
      }
    ],
    workOrders: [
      { id: 'wo-1', orderNumber: 'WO-2026-001', customerCode: 'CUST-2026-0001', department: 'تقطيع', status: 'جاهز للتسليم', priority: 'عاجلة', dueDate: '2026-10-25' },
      { id: 'wo-2', orderNumber: 'WO-2026-002', customerCode: 'CUST-2026-0001', department: 'تجميع', status: 'جاري التصنيع', priority: 'عادية', dueDate: '2026-11-05' }
    ],
    inspections: [
      { id: 'insp-1', code: 'INSP-0001', customerCode: 'CUST-2026-0001', date: '2026-10-12', responsible: 'م. طارق مهدي', status: 'مكتملة', notes: 'تم رفع مقاسات المطبخ 4.2م × 3.5م وارتفاع 2.9م' }
    ],
    quotations: [
      { id: 'boq-1', code: 'BOQ-001', customerCode: 'CUST-2026-0001', contractType: 'الفرش كامل', title: 'مقايسة الفرش الكامل والوحدات', netAmount: 380000, status: 'معتمدة' }
    ],
    designs: [
      { id: 'ds-1', code: 'DSGN-001', customerCode: 'CUST-2026-0001', title: 'تصميم مودرن كيتشن + جزيرة رخام كلكتا', status: 'معتمد', contractType: 'الفرش كامل' }
    ],
    appliances: [
      { id: 'app-1', customerCode: 'CUST-2026-0001', name: 'شفاط بلت إن 90سم', type: 'Built-in', width: 90, height: 60, depth: 50, quantity: 1, location: 'المطبخ الرئيسي' }
    ],
    payments: [
      { id: 'pay-1', receiptNumber: 'REC-2026-001', customerCode: 'CUST-2026-0001', type: 'تحصيل', amount: 190000, date: '2026-10-10', method: 'تحويل بنكي', createdBy: 'أونر النظام' }
    ]
  };
  localStorage.setItem(MOCK_STORAGE_KEY, JSON.stringify(initial));
  return initial;
}

function handleMockRequest(endpoint, method, body) {
  const db = getMockDb();

  // Auth mock
  if (endpoint.includes('/auth/login')) {
    const user = {
      id: 'owner-root',
      code: 'OWNER-001',
      name: 'عبدالرحمن إبراهيم (الأونر)',
      email: body?.email || 'owner@treehouse.com',
      role: 'OWNER',
      accountStatus: 'ACTIVE',
      customPermissions: null
    };
    return {
      success: true,
      message: 'تم تسجيل الدخول بنجاح (معاينة GitHub Pages)',
      data: {
        token: 'th_mock_jwt_token_github_pages',
        user
      }
    };
  }

  if (endpoint.includes('/auth/me')) {
    return {
      success: true,
      data: {
        id: 'owner-root',
        code: 'OWNER-001',
        name: 'عبدالرحمن إبراهيم (الأونر)',
        email: 'owner@treehouse.com',
        role: 'OWNER',
        accountStatus: 'ACTIVE'
      }
    };
  }

  // Customer Project 360 overview
  if (endpoint.includes('/customer-project/')) {
    const code = endpoint.split('/customer-project/')[1]?.split('?')[0];
    const customer = db.customers.find(c => c.code === code) || db.customers[0];
    const contracts = db.contracts.filter(c => c.customerCode === customer.code);
    const workOrders = db.workOrders.filter(w => w.customerCode === customer.code);
    const inspections = db.inspections.filter(i => i.customerCode === customer.code);
    const quotations = db.quotations.filter(q => q.customerCode === customer.code);
    const designs = db.designs.filter(d => d.customerCode === customer.code);
    const appliances = db.appliances.filter(a => a.customerCode === customer.code);
    const payments = db.payments.filter(p => p.customerCode === customer.code);

    return {
      success: true,
      data: {
        customer: {
          ...customer,
          contracts,
          workOrders,
          inspections,
          quotations,
          designs,
          appliances,
          payments,
          interviews: []
        },
        summary: {
          totalContracted: contracts.reduce((sum, c) => sum + c.totalAmount, 0),
          totalPaid: payments.reduce((sum, p) => sum + p.amount, 0),
          remainingBalance: contracts.reduce((sum, c) => sum + c.remainingAmount, 0),
          contractsCount: contracts.length,
          workOrdersCount: workOrders.length,
          designsCount: designs.length,
          quotationsCount: quotations.length,
          inspectionsCount: inspections.length,
          appliancesCount: appliances.length
        }
      }
    };
  }

  // Customers
  if (endpoint.includes('/customers/bulk') && method === 'POST') {
    const newItems = body?.customers || [];
    newItems.forEach((c, idx) => {
      db.customers.unshift({
        id: `cust-${Date.now()}-${idx}`,
        code: `CUST-2026-${String(db.customers.length + 1).padStart(4, '0')}`,
        name: c.name,
        phone: c.phone || 'غير مسجل',
        nationalId: c.nationalId || 'عميل قبل السيستم',
        contractTypes: c.contractTypes || ['الفرش كامل'],
        address: c.address || '',
        status: 'جديد'
      });
    });
    localStorage.setItem(MOCK_STORAGE_KEY, JSON.stringify(db));
    return { success: true, data: { createdCount: newItems.length } };
  }

  if (endpoint.startsWith('/customers')) {
    if (method === 'POST') {
      const newCust = {
        id: `cust-${Date.now()}`,
        code: `CUST-2026-${String(db.customers.length + 1).padStart(4, '0')}`,
        name: body.name,
        phone: body.phone,
        secondaryPhone: body.secondaryPhone,
        nationalId: body.nationalId || 'عميل قبل السيستم',
        contractTypes: body.contractTypes || ['الفرش كامل'],
        address: body.address || '',
        status: body.status || 'جديد',
        notes: body.notes || ''
      };
      db.customers.unshift(newCust);
      localStorage.setItem(MOCK_STORAGE_KEY, JSON.stringify(db));
      return { success: true, data: newCust };
    }
    return { success: true, data: db.customers };
  }

  if (endpoint.startsWith('/work-orders')) return { success: true, data: db.workOrders };
  if (endpoint.startsWith('/contracts')) return { success: true, data: db.contracts };
  if (endpoint.startsWith('/quotations')) return { success: true, data: db.quotations };
  if (endpoint.startsWith('/inspections')) return { success: true, data: db.inspections };
  if (endpoint.startsWith('/designs')) return { success: true, data: db.designs };
  if (endpoint.startsWith('/appliances')) return { success: true, data: db.appliances };
  if (endpoint.startsWith('/payments')) return { success: true, data: db.payments };
  if (endpoint.startsWith('/checks')) return { success: true, data: [] };
  if (endpoint.startsWith('/interviews')) return { success: true, data: [] };
  if (endpoint.startsWith('/supplies')) return { success: true, data: [] };
  if (endpoint.startsWith('/finance')) return { success: true, data: [] };
  if (endpoint.startsWith('/attendance')) return { success: true, data: [] };
  if (endpoint.startsWith('/tasks')) return { success: true, data: [] };
  if (endpoint.startsWith('/admin/users')) return { success: true, data: [] };
  if (endpoint.startsWith('/admin/audit-logs')) return { success: true, data: [] };
  if (endpoint.startsWith('/settings/company')) return { success: true, data: { companyName: 'System Tree House', slogan: 'SMART BY NATURE' } };
  if (endpoint.startsWith('/settings/profile')) return { success: true, data: { name: 'عبدالرحمن إبراهيم', role: 'OWNER' } };

  return { success: true, data: [] };
}

export async function apiRequest(endpoint, options = {}) {
  const token = localStorage.getItem('th_token');

  const headers = {
    'Content-Type': 'application/json',
    ...(options.headers || {})
  };

  if (token) {
    headers['Authorization'] = `Bearer ${token}`;
  }

  const config = {
    ...options,
    headers
  };

  if (options.body && typeof options.body === 'object') {
    config.body = JSON.stringify(options.body);
  }

  // If on GitHub Pages without custom live backend URL, use intelligent client-side demo engine
  if (isGitHubPages && !localStorage.getItem('th_custom_api_url')) {
    const parsedBody = options.body ? (typeof options.body === 'string' ? JSON.parse(options.body) : options.body) : null;
    return handleMockRequest(endpoint, options.method || 'GET', parsedBody);
  }

  try {
    const res = await fetch(`${API_BASE}${endpoint}`, config);
    const data = await res.json().catch(() => ({}));

    if (!res.ok) {
      if (res.status === 401) {
        localStorage.removeItem('th_token');
        localStorage.removeItem('th_user');
        window.dispatchEvent(new Event('th_auth_expired'));
      }
      throw new Error(data.message || `خطأ في الخادم (${res.status})`);
    }

    return data;
  } catch (err) {
    // If backend connection refused on GitHub Pages, fallback to demo mode seamlessly
    if (isGitHubPages) {
      const parsedBody = options.body ? (typeof options.body === 'string' ? JSON.parse(options.body) : options.body) : null;
      return handleMockRequest(endpoint, options.method || 'GET', parsedBody);
    }
    throw err;
  }
}

export const api = {
  get: (endpoint, params = {}) => {
    const query = new URLSearchParams(params).toString();
    const url = query ? `${endpoint}?${query}` : endpoint;
    return apiRequest(url, { method: 'GET' });
  },
  post: (endpoint, body) => apiRequest(endpoint, { method: 'POST', body }),
  put: (endpoint, body) => apiRequest(endpoint, { method: 'PUT', body }),
  delete: (endpoint) => apiRequest(endpoint, { method: 'DELETE' }),
};
