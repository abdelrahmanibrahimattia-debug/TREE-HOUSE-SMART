import helmet from 'helmet';
import rateLimit from 'express-rate-limit';

// Standard Helmet protection
export const helmetMiddleware = helmet({
  contentSecurityPolicy: false, // Allows flexible SPA assets
  crossOriginResourcePolicy: { policy: 'cross-origin' }
});

// General API Rate Limiter
export const generalLimiter = rateLimit({
  windowMs: 15 * 60 * 1000, // 15 minutes
  max: 1000, // limit each IP to 1000 requests per 15 minutes
  standardHeaders: true,
  legacyHeaders: false,
  message: {
    success: false,
    message: 'تم تجاوز الحد المسموح من الطلبات، يرجى المحاولة لاحقاً.'
  }
});

// Sensitive Auth Rate Limiter (Anti-Brute-Force)
export const authLimiter = rateLimit({
  windowMs: 15 * 60 * 1000, // 15 minutes
  max: 15, // limit each IP to 15 login attempts per window
  standardHeaders: true,
  legacyHeaders: false,
  message: {
    success: false,
    message: 'تم تكرار محاولات تسجيل الدخول الخاطئة، تم حظر الوصول مؤقتاً لحماية النظام.'
  }
});
