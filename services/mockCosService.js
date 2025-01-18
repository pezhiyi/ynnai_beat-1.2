// 模拟的 COS 服务，用于测试
class MockCosService {
  constructor() {
    this.mockDelay = 5000; // 模拟生成延迟时间（毫秒）
    this.mockFiles = new Map(); // 存储模拟文件
    this.baseUrl = '/api/mock-image'; // 使用本地 mock URL
    console.log('MockCosService 初始化完成');
  }

  // 模拟检查文件是否存在
  async checkFileExists(path) {
    try {
      console.log('[Mock] 检查文件:', path);
      
      // 如果文件已经在 Map 中，直接返回 true
      if (this.mockFiles.has(path)) {
        const fileInfo = this.mockFiles.get(path);
        console.log('[Mock] 文件已存在:', fileInfo);
        return true;
      }

      // 获取文件创建时间
      const createTime = this.mockFiles.get(path + '_createTime');
      if (!createTime) {
        // 如果是第一次检查，记录创建时间
        const now = Date.now();
        console.log('[Mock] 首次检查，记录创建时间:', now);
        this.mockFiles.set(path + '_createTime', now);
        return false;
      }

      // 检查是否已经过了模拟延迟时间
      const elapsed = Date.now() - createTime;
      const exists = elapsed >= this.mockDelay;

      console.log('[Mock] 检查延迟:', {
        path,
        createTime,
        elapsed,
        mockDelay: this.mockDelay,
        exists
      });

      if (exists && !this.mockFiles.has(path)) {
        // 模拟文件生成
        console.log('[Mock] 生成模拟文件');
        const mockUrl = this.generateMockUrl(path);
        this.mockFiles.set(path, {
          url: mockUrl,
          createdAt: Date.now()
        });
        console.log('[Mock] 文件已生成:', this.mockFiles.get(path));
      }

      return exists;
    } catch (error) {
      console.error('[Mock] 检查文件出错:', error);
      return false;
    }
  }

  // 获取文件URL
  async getFileUrl(path) {
    try {
      console.log('[Mock] 获取文件URL:', path);
      console.log('[Mock] 当前文件列表:', Array.from(this.mockFiles.entries()));
      
      const fileInfo = this.mockFiles.get(path);
      if (!fileInfo || !fileInfo.url) {
        console.log('[Mock] 文件未找到或未完全生成');
        throw new Error('File not found or not ready');
      }
      
      console.log('[Mock] 返回URL:', fileInfo.url);
      return fileInfo.url;
    } catch (error) {
      console.error('[Mock] 获取URL出错:', error);
      throw error;
    }
  }

  // 生成模拟URL
  generateMockUrl(path) {
    // 使用文件路径的哈希作为模拟URL的一部分
    const timestamp = Date.now();
    const mockUrl = `${this.baseUrl}?path=${encodeURIComponent(path)}&t=${timestamp}`;
    return mockUrl;
  }

  // 清理模拟数据
  clearMockData() {
    console.log('[Mock] 清理所有模拟数据');
    this.mockFiles.clear();
  }

  // 获取所有文件状态
  getFileStatus() {
    try {
      const status = {};
      for (const [key, value] of this.mockFiles.entries()) {
        if (key.endsWith('_createTime')) continue;
        status[key] = {
          ...value,
          createTime: this.mockFiles.get(key + '_createTime')
        };
      }
      return status;
    } catch (error) {
      console.error('[Mock] 获取状态出错:', error);
      return {};
    }
  }
}

// 导出单例实例
export const mockCosService = new MockCosService();
