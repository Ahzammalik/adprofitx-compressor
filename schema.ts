import { pgTable, serial, text, integer, timestamp, boolean } from 'drizzle-orm/pg-core';
import { relations } from 'drizzle-orm';

// Compression statistics table
export const compressionStats = pgTable('compression_stats', {
  id: serial('id').primaryKey(),
  fileName: text('file_name').notNull(),
  fileType: text('file_type').notNull(), // 'image' or 'pdf'
  originalSize: integer('original_size').notNull(),
  compressedSize: integer('compressed_size').notNull(),
  compressionRatio: integer('compression_ratio').notNull(),
  quality: integer('quality').notNull(),
  outputFormat: text('output_format').notNull(),
  processingTime: integer('processing_time'), // in milliseconds
  userAgent: text('user_agent'),
  ipAddress: text('ip_address'),
  timestamp: timestamp('timestamp').defaultNow().notNull(),
});

// Daily analytics table
export const dailyAnalytics = pgTable('daily_analytics', {
  id: serial('id').primaryKey(),
  date: text('date').notNull(), // YYYY-MM-DD format
  totalCompressions: integer('total_compressions').default(0).notNull(),
  totalImages: integer('total_images').default(0).notNull(),
  totalPdfs: integer('total_pdfs').default(0).notNull(),
  totalBytesSaved: integer('total_bytes_saved').default(0).notNull(),
  averageCompressionRatio: integer('average_compression_ratio').default(0).notNull(),
  uniqueVisitors: integer('unique_visitors').default(0).notNull(),
});

// User sessions (optional, for analytics)
export const userSessions = pgTable('user_sessions', {
  id: serial('id').primaryKey(),
  sessionId: text('session_id').notNull().unique(),
  firstVisit: timestamp('first_visit').defaultNow().notNull(),
  lastActivity: timestamp('last_activity').defaultNow().notNull(),
  totalCompressions: integer('total_compressions').default(0).notNull(),
  userAgent: text('user_agent'),
  ipAddress: text('ip_address'),
  isActive: boolean('is_active').default(true).notNull(),
});

// File processing queue (for potential future batch processing)
export const processingQueue = pgTable('processing_queue', {
  id: serial('id').primaryKey(),
  sessionId: text('session_id').notNull(),
  fileName: text('file_name').notNull(),
  fileType: text('file_type').notNull(),
  fileSize: integer('file_size').notNull(),
  status: text('status').notNull(), // 'pending', 'processing', 'completed', 'failed'
  settings: text('settings'), // JSON string of compression settings
  createdAt: timestamp('created_at').defaultNow().notNull(),
  processedAt: timestamp('processed_at'),
});

// Define relationships
export const compressionStatsRelations = relations(compressionStats, ({ one }) => ({
  session: one(userSessions, {
    fields: [compressionStats.ipAddress],
    references: [userSessions.ipAddress],
  }),
}));

export const userSessionsRelations = relations(userSessions, ({ many }) => ({
  compressions: many(compressionStats),
  queueItems: many(processingQueue),
}));

export const processingQueueRelations = relations(processingQueue, ({ one }) => ({
  session: one(userSessions, {
    fields: [processingQueue.sessionId],
    references: [userSessions.sessionId],
  }),
}));

// Type definitions
export type CompressionStat = typeof compressionStats.$inferSelect;
export type InsertCompressionStat = typeof compressionStats.$inferInsert;

export type DailyAnalytic = typeof dailyAnalytics.$inferSelect;
export type InsertDailyAnalytic = typeof dailyAnalytics.$inferInsert;

export type UserSession = typeof userSessions.$inferSelect;
export type InsertUserSession = typeof userSessions.$inferInsert;

export type ProcessingQueueItem = typeof processingQueue.$inferSelect;
export type InsertProcessingQueueItem = typeof processingQueue.$inferInsert;
