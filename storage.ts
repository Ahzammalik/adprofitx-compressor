import { db } from './db';
import { compressionStats, dailyAnalytics, userSessions, processingQueue } from '../shared/schema';
import { eq, sql, and, gte, lte } from 'drizzle-orm';
import type { 
  InsertCompressionStat, 
  InsertDailyAnalytic, 
  InsertUserSession, 
  InsertProcessingQueueItem 
} from '../shared/schema';

export interface IAnalyticsStorage {
  recordCompression(data: InsertCompressionStat): Promise<void>;
  getCompressionStats(limit?: number): Promise<any[]>;
  getDailyAnalytics(days?: number): Promise<any[]>;
  updateDailyStats(date: string): Promise<void>;
  createOrUpdateSession(sessionData: InsertUserSession): Promise<string>;
  getTotalCompressions(): Promise<number>;
  getTotalBytesSaved(): Promise<number>;
  getPopularFormats(): Promise<any[]>;
  getAverageCompressionRatio(): Promise<number>;
}

export class DatabaseStorage implements IAnalyticsStorage {
  async recordCompression(data: InsertCompressionStat): Promise<void> {
    try {
      await db.insert(compressionStats).values(data);
      
      // Update daily stats
      const today = new Date().toISOString().split('T')[0];
      await this.updateDailyStats(today);
    } catch (error) {
      console.error('Failed to record compression:', error);
      throw error;
    }
  }

  async getCompressionStats(limit: number = 100): Promise<any[]> {
    try {
      return await db
        .select()
        .from(compressionStats)
        .orderBy(sql`${compressionStats.timestamp} DESC`)
        .limit(limit);
    } catch (error) {
      console.error('Failed to get compression stats:', error);
      return [];
    }
  }

  async getDailyAnalytics(days: number = 30): Promise<any[]> {
    try {
      const startDate = new Date();
      startDate.setDate(startDate.getDate() - days);
      const startDateStr = startDate.toISOString().split('T')[0];

      return await db
        .select()
        .from(dailyAnalytics)
        .where(gte(dailyAnalytics.date, startDateStr))
        .orderBy(dailyAnalytics.date);
    } catch (error) {
      console.error('Failed to get daily analytics:', error);
      return [];
    }
  }

  async updateDailyStats(date: string): Promise<void> {
    try {
      // Get stats for the day
      const dayStart = new Date(date + 'T00:00:00.000Z');
      const dayEnd = new Date(date + 'T23:59:59.999Z');

      const dayStats = await db
        .select({
          totalCompressions: sql<number>`count(*)`,
          totalImages: sql<number>`count(*) filter (where ${compressionStats.fileType} = 'image')`,
          totalPdfs: sql<number>`count(*) filter (where ${compressionStats.fileType} = 'pdf')`,
          totalBytesSaved: sql<number>`sum(${compressionStats.originalSize} - ${compressionStats.compressedSize})`,
          averageCompressionRatio: sql<number>`avg(${compressionStats.compressionRatio})`,
          uniqueIps: sql<number>`count(distinct ${compressionStats.ipAddress})`
        })
        .from(compressionStats)
        .where(
          and(
            gte(compressionStats.timestamp, dayStart),
            lte(compressionStats.timestamp, dayEnd)
          )
        );

      if (dayStats.length > 0) {
        const stats = dayStats[0];
        
        // Insert or update daily analytics
        await db
          .insert(dailyAnalytics)
          .values({
            date,
            totalCompressions: stats.totalCompressions || 0,
            totalImages: stats.totalImages || 0,
            totalPdfs: stats.totalPdfs || 0,
            totalBytesSaved: stats.totalBytesSaved || 0,
            averageCompressionRatio: Math.round(stats.averageCompressionRatio) || 0,
            uniqueVisitors: stats.uniqueIps || 0
          })
          .onConflictDoUpdate({
            target: dailyAnalytics.date,
            set: {
              totalCompressions: stats.totalCompressions || 0,
              totalImages: stats.totalImages || 0,
              totalPdfs: stats.totalPdfs || 0,
              totalBytesSaved: stats.totalBytesSaved || 0,
              averageCompressionRatio: Math.round(stats.averageCompressionRatio) || 0,
              uniqueVisitors: stats.uniqueIps || 0
            }
          });
      }
    } catch (error) {
      console.error('Failed to update daily stats:', error);
    }
  }

  async createOrUpdateSession(sessionData: InsertUserSession): Promise<string> {
    try {
      const [session] = await db
        .insert(userSessions)
        .values(sessionData)
        .onConflictDoUpdate({
          target: userSessions.sessionId,
          set: {
            lastActivity: new Date(),
            totalCompressions: sql`${userSessions.totalCompressions} + 1`
          }
        })
        .returning();

      return session.sessionId;
    } catch (error) {
      console.error('Failed to create/update session:', error);
      return sessionData.sessionId;
    }
  }

  async getTotalCompressions(): Promise<number> {
    try {
      const result = await db
        .select({ count: sql<number>`count(*)` })
        .from(compressionStats);
      
      return result[0]?.count || 0;
    } catch (error) {
      console.error('Failed to get total compressions:', error);
      return 0;
    }
  }

  async getTotalBytesSaved(): Promise<number> {
    try {
      const result = await db
        .select({ 
          totalSaved: sql<number>`sum(${compressionStats.originalSize} - ${compressionStats.compressedSize})` 
        })
        .from(compressionStats);
      
      return result[0]?.totalSaved || 0;
    } catch (error) {
      console.error('Failed to get total bytes saved:', error);
      return 0;
    }
  }

  async getPopularFormats(): Promise<any[]> {
    try {
      return await db
        .select({
          format: compressionStats.outputFormat,
          count: sql<number>`count(*)`
        })
        .from(compressionStats)
        .groupBy(compressionStats.outputFormat)
        .orderBy(sql`count(*) DESC`)
        .limit(10);
    } catch (error) {
      console.error('Failed to get popular formats:', error);
      return [];
    }
  }

  async getAverageCompressionRatio(): Promise<number> {
    try {
      const result = await db
        .select({ 
          avgRatio: sql<number>`avg(${compressionStats.compressionRatio})` 
        })
        .from(compressionStats);
      
      return Math.round(result[0]?.avgRatio) || 0;
    } catch (error) {
      console.error('Failed to get average compression ratio:', error);
      return 0;
    }
  }
}

export const storage = new DatabaseStorage();
