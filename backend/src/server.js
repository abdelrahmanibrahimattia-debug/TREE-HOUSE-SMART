import express from 'express';
import cors from 'cors';
import compression from 'compression';
import dotenv from 'dotenv';
import path from 'path';
import { fileURLToPath } from 'url';
import fs from 'fs';
import { exec } from 'child_process';
import apiRoutes from './routes/api.js';
import { helmetMiddleware, generalLimiter } from './middleware/security.js';
import { sendError, sendSuccess } from './utils/response.js';

dotenv.config();

const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);
const distPath = path.resolve(__dirname, '../../frontend/dist');

const app = express();
const PORT = process.env.PORT || 5000;

// Security and Performance Middlewares
app.use(helmetMiddleware);
app.use(compression());
app.use(generalLimiter);

// CORS configuration
const allowedOrigins = (process.env.CORS_ORIGIN || '').split(',').map(o => o.trim());
app.use(cors({
  origin: (origin, callback) => {
    if (!origin || allowedOrigins.includes(origin) || process.env.NODE_ENV === 'development' || !process.env.NODE_ENV) {
      callback(null, true);
    } else {
      callback(new Error('غير مصرح بهذا النطاق بواسطة سياسة CORS.'));
    }
  },
  credentials: true
}));

// Body Parsers with safe payload limits
app.use(express.json({ limit: '25mb' }));
app.use(express.urlencoded({ extended: true, limit: '25mb' }));

// Health Check
app.get('/health', (req, res) => {
  return sendSuccess(res, {
    status: 'HEALTHY',
    system: 'System Tree House',
    version: '2.6.0',
    uptime: process.uptime()
  }, 'سيرفر Tree House يعمل بكفاءة وأمان');
});

// API Routes
app.use('/api', apiRoutes);

// Serve static frontend assets if built
if (fs.existsSync(distPath)) {
  app.use(express.static(distPath));

  // SPA fallback for React Client-Side Router
  app.get('*', (req, res, next) => {
    if (req.originalUrl.startsWith('/api') || req.originalUrl.startsWith('/health')) {
      return next();
    }
    res.sendFile(path.join(distPath, 'index.html'));
  });
} else {
  // 404 Handler if dist not present
  app.use((req, res) => {
    return sendError(res, `المسار المطلوب (${req.originalUrl}) غير موجود بالنظام.`, 404);
  });
}

// Global Error Sanitizer (Prevents info disclosure)
app.use((err, req, res, next) => {
  console.error('💥 [Server Error]:', err);
  const message = process.env.NODE_ENV === 'development'
    ? err.message
    : 'حدث خطأ داخلي في خادم النظام.';
  return sendError(res, message, err.statusCode || 500);
});

// Start Server on PORT (binds dual-stack IPv4/IPv6)
const server = app.listen(PORT, () => {
  const primaryUrl = `http://127.0.0.1:${PORT}`;
  console.log(`\n=============================================================`);
  console.log(`🌲 [System Tree House] تم تشغيل خادم المنظومة بنجاح!`);
  console.log(`🌐 الرابط المباشر للمتصفح: ${primaryUrl}`);
  console.log(`🌐 رابط بديل:             http://localhost:${PORT}`);
  console.log(`🔒 [حماية الأمان السيبراني]: محرك الصلاحيات والجدار الناري نشط 100%`);
  console.log(`=============================================================\n`);

  // Auto-launch default browser on Windows when standalone launcher is used
  if (process.env.AUTO_OPEN !== 'false' && process.platform === 'win32') {
    setTimeout(() => {
      exec(`start ${primaryUrl}`, (err) => {
        if (err) console.log('ملاحظة: يمكنك فتح الرابط يدوياً في المتصفح:', primaryUrl);
      });
    }, 800);
  }
});

export default app;
