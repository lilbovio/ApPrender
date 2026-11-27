import express from 'express'
import cors from 'cors'
import path from 'path'
import { fileURLToPath } from 'url'
import dotenv from 'dotenv'

import connectDB from './src/config/db.js'
import { errorHandler, notFound } from './src/middleware/errorMiddleware.js'

// Routes
import authRoutes from './src/routes/authRoutes.js'
import lessonRoutes from './src/routes/lessonRoutes.js'
import progressRoutes from './src/routes/progressRoutes.js'
import userRoutes from './src/routes/userRoutes.js'
import vakRoutes from './src/routes/vakRoutes.js'

dotenv.config()

const __filename = fileURLToPath(import.meta.url)
const __dirname = path.dirname(__filename)

connectDB()

const app = express()
const PORT = process.env.PORT || 5000

// ─── Middleware ────────────────────────────────────────────────────────────────

// CORS configuration for both local development and production.
// Extra origins come from CLIENT_URL (comma-separated), e.g.
//   CLIENT_URL=https://tudominio.com,https://www.tudominio.com
// Browsers send Origin without a trailing slash, so entries are normalized. For each custom
// domain the www / non-www twin is allowed too, so setting just one of them is enough.
const normalizeOrigin = (url) => url.trim().replace(/\/+$/, '').toLowerCase();

const envOrigins = (process.env.CLIENT_URL || '')
  .split(',')
  .map(normalizeOrigin)
  .filter(Boolean)
  .flatMap((origin) => {
    const match = origin.match(/^(https?:\/\/)(www\.)?(.+)$/);
    if (!match) return [origin];
    const [, scheme, , host] = match;
    return [`${scheme}${host}`, `${scheme}www.${host}`];
  });

const allowedOrigins = [
  /^http:\/\/localhost:\d+$/,                       // Local development (any port)
  'https://ap-prender-client.vercel.app',           // Production frontend (Vercel URL)
  /^https:\/\/ap-prender-client.*\.vercel\.app$/,   // Vercel preview deployments
  ...envOrigins,                                    // Custom domain(s) from CLIENT_URL
];

app.use(cors({
  origin: function (origin, callback) {
    // Allow requests with no origin (like mobile apps or curl requests)
    if (!origin) return callback(null, true);
    
    // Check if origin matches any allowed pattern
    const requestOrigin = normalizeOrigin(origin);
    const isAllowed = allowedOrigins.some(allowedOrigin => {
      if (allowedOrigin instanceof RegExp) {
        return allowedOrigin.test(requestOrigin);
      }
      return allowedOrigin === requestOrigin;
    });
    
    if (isAllowed) {
      callback(null, true);
    } else {
      callback(new Error('Not allowed by CORS'));
    }
  },
  credentials: true,
  methods: ['GET', 'POST', 'PUT', 'DELETE', 'PATCH', 'OPTIONS'],
  allowedHeaders: ['Content-Type', 'Authorization'],
  exposedHeaders: ['Content-Range', 'X-Content-Range'],
  maxAge: 600 // Cache preflight requests for 10 minutes
}))

app.use(express.json({ limit: '10mb' }))
app.use(express.urlencoded({ extended: true, limit: '10mb' }))

// Servir archivos subidos (avatares)
app.use('/uploads', express.static(path.join(__dirname, 'uploads')))

// ─── Routes ───────────────────────────────────────────────────────────────────

app.use('/api/auth',     authRoutes)
app.use('/api/lessons',  lessonRoutes)
app.use('/api/progress', progressRoutes)
app.use('/api/users',    userRoutes)
app.use('/api/vak',      vakRoutes)

// Health check
app.get('/api/health', (req, res) => {
  res.json({
    status: 'ok',
    message: '🚀 EduKids API running',
    env: process.env.NODE_ENV,
    timestamp: new Date().toISOString()
  })
})

// ─── Error Handlers ───────────────────────────────────────────────────────────

app.use(notFound)
app.use(errorHandler)

// ─── Start Server ─────────────────────────────────────────────────────────────

app.listen(PORT, () => {
  console.log(`\n🌟 ========================================`)
  console.log(`🚀  EduKids Server running on port ${PORT}`)
  console.log(`🌍  Mode: ${process.env.NODE_ENV || 'development'}`)
  console.log(`🔗  http://localhost:${PORT}/api/health`)
  console.log(`🌟 ========================================\n`)
})

export default app