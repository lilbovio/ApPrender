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

// CORS configuration for both local development and production
const allowedOrigins = [
  /^http:\/\/localhost:\d+$/,  // Local development (any port)
  'https://ap-prender-client.vercel.app',  // Production frontend
  /^https:\/\/ap-prender-client.*\.vercel\.app$/  // Vercel preview deployments
];

app.use(cors({
  origin: function (origin, callback) {
    // Allow requests with no origin (like mobile apps or curl requests)
    if (!origin) return callback(null, true);
    
    // Check if origin matches any allowed pattern
    const isAllowed = allowedOrigins.some(allowedOrigin => {
      if (allowedOrigin instanceof RegExp) {
        return allowedOrigin.test(origin);
      }
      return allowedOrigin === origin;
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