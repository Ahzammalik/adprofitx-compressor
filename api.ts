import { storage } from './storage';
import type { InsertCompressionStat } from '../shared/schema';

export interface CompressionData {
  fileName: string;
  fileType: 'image' | 'pdf';
  originalSize: number;
  compressedSize: number;
  compressionRatio: number;
  quality: number;
  outputFormat: string;
  processingTime?: number;
  userAgent?: string;
  ipAddress?: string;
}

export class CompressionAPI {
  async recordCompression(data: CompressionData): Promise<{ success: boolean; message?: string }> {
    try {
      const compressionRecord: InsertCompressionStat = {
        fileName: data.fileName,
        fileType: data.fileType,
        originalSize: data.originalSize,
        compressedSize: data.compressedSize,
        compressionRatio: data.compressionRatio,
        quality: data.quality,
        outputFormat: data.outputFormat,
        processingTime: data.processingTime,
        userAgent: data.userAgent || 'Unknown',
        ipAddress: data.ipAddress || 'Unknown'
      };

      await storage.recordCompression(compressionRecord);
      
      return { success: true };
    } catch (error) {
      console.error('API: Failed to record compression:', error);
      return { 
        success: false, 
        message: error instanceof Error ? error.message : 'Unknown error' 
      };
    }
  }

  async getStats(): Promise<any> {
    try {
      const [
        totalCompressions,
        totalBytesSaved,
        averageRatio,
        popularFormats,
        recentCompressions,
        dailyAnalytics
      ] = await Promise.all([
        storage.getTotalCompressions(),
        storage.getTotalBytesSaved(),
        storage.getAverageCompressionRatio(),
        storage.getPopularFormats(),
        storage.getCompressionStats(10),
        storage.getDailyAnalytics(7)
      ]);

      return {
        success: true,
        data: {
          totalCompressions,
          totalBytesSaved,
          averageRatio,
          popularFormats,
          recentCompressions,
          dailyAnalytics
        }
      };
    } catch (error) {
      console.error('API: Failed to get stats:', error);
      return { 
        success: false, 
        message: error instanceof Error ? error.message : 'Unknown error' 
      };
    }
  }

  formatFileSize(bytes: number): string {
    if (bytes === 0) return '0 Bytes';
    
    const k = 1024;
    const sizes = ['Bytes', 'KB', 'MB', 'GB'];
    const i = Math.floor(Math.log(bytes) / Math.log(k));
    
    return parseFloat((bytes / Math.pow(k, i)).toFixed(2)) + ' ' + sizes[i];
  }
}

export const compressionAPI = new CompressionAPI();
