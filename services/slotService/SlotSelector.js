/**
 * SlotSelector 类 - 存档槽位管理器
 * 
 * ⚠️ 重要提示：
 * 1. 单例模式：
 *    - 使用 getInstance() 获取实例
 *    - 不要直接实例化新对象
 * 
 * 2. 数据存储：
 *    - 使用 IndexedDB 存储槽位信息
 *    - 数据库名：ImageSlotDB
 *    - 表名：slots
 * 
 * 3. 槽位限制：
 *    - 最大槽位数：4
 *    - 槽位ID范围：0-3
 * 
 * 4. 事件系统：
 *    - 使用 CustomEvent: 'archiveSlotUpdate'
 *    - 所有状态更改必须触发事件
 * 
 * 5. 安全注意事项：
 *    - 删除操作不可恢复
 *    - 必须先删除 COS 文件再清除槽位
 *    - 保持事件监听器的一致性
 * 
 * 6. 文件命名规则：
 *    YnnAI-{timestamp}_{styleId}-feedback.png
 *    存储在：Feedback/{YYYYMMDD}/
 */
class SlotSelector {
  static instance = null;
  workers = {};

  /**
   * 获取 SlotSelector 实例
   * 
   * @returns {SlotSelector} SlotSelector 实例
   */
  static getInstance() {
    if (!SlotSelector.instance) {
      console.log('创建新的 SlotSelector 实例');
      SlotSelector.instance = new SlotSelector();
    }
    return SlotSelector.instance;
  }

  constructor() {
    if (SlotSelector.instance) {
      console.log('返回已存在的 SlotSelector 实例');
      return SlotSelector.instance;
    }
    console.log('初始化新的 SlotSelector 实例');
    this.maxSlots = 4;
    this.initialize();
    SlotSelector.instance = this;
  }

  initialize() {
    // 确保 IndexedDB 已经初始化
    this.ensureDatabase();
  }

  async ensureDatabase() {
    const dbName = 'ImageSlotDB';
    const dbVersion = 1;

    return new Promise((resolve, reject) => {
      const request = indexedDB.open(dbName, dbVersion);

      request.onerror = () => reject(new Error('无法打开数据库'));

      request.onupgradeneeded = (event) => {
        const db = event.target.result;
        
        // 创建存储槽位信息的对象仓库
        if (!db.objectStoreNames.contains('slots')) {
          const store = db.createObjectStore('slots', { keyPath: 'id' });
          store.createIndex('status', 'status', { unique: false });
          store.createIndex('lastModified', 'lastModified', { unique: false });
        }
      };

      request.onsuccess = () => resolve(request.result);
    });
  }

  async findEmptySlot() {
    const db = await this.ensureDatabase();
    
    return new Promise((resolve, reject) => {
      const transaction = db.transaction(['slots'], 'readonly');
      const store = transaction.objectStore('slots');
      const request = store.getAll();

      request.onsuccess = () => {
        const slots = request.result;
        console.log('当前所有槽位状态:', slots);
        
        // 查找第一个空槽位
        for (let i = 0; i < this.maxSlots; i++) {
          const slot = slots.find(s => s.id === i);
          if (!slot) {
            console.log('找到完全空槽位:', i);
            resolve(i);
            return;
          }
          // 检查槽位是否为空白状态（没有cosUrl或status为空）
          if (!slot.cosUrl && (!slot.status || slot.status === 'empty')) {
            console.log('找到空白状态槽位:', i);
            resolve(i);
            return;
          }
        }
        
        // 如果所有槽位都满了，选择最早使用的槽位
        if (slots.length >= this.maxSlots) {
          console.log('所有槽位都已使用，查找最早使用的槽位');
          const oldestSlot = slots.reduce((oldest, current) => {
            // 如果没有 lastModified，假设是很旧的数据
            const oldestTime = oldest.lastModified ? new Date(oldest.lastModified).getTime() : 0;
            const currentTime = current.lastModified ? new Date(current.lastModified).getTime() : 0;
            return currentTime < oldestTime ? current : oldest;
          });
          console.log('选择最早使用的槽位:', oldestSlot.id);
          resolve(oldestSlot.id);
          return;
        }
        
        // 如果出现意外情况，使用槽位0
        console.log('未预期的情况，使用槽位0');
        resolve(0);
      };

      request.onerror = () => reject(new Error('查找空槽位失败'));
    });
  }

  async selectSlot(cosUrl, styleId) {
    try {
      const slotId = await this.findEmptySlot();
      const db = await this.ensureDatabase();
      
      // 生成槽位名称
      const timestamp = Date.now();
      const date = new Date();
      const dateStr = `${date.getFullYear()}${String(date.getMonth() + 1).padStart(2, '0')}${String(date.getDate()).padStart(2, '0')}`;
      const slotName = `YnnAI-${timestamp}_${styleId}`;
      
      return new Promise((resolve, reject) => {
        const transaction = db.transaction(['slots'], 'readwrite');
        const store = transaction.objectStore('slots');
        
        // 更新或创建槽位数据
        const slotData = {
          id: slotId,
          cosUrl,
          status: 'loading',
          lastModified: new Date(),
          localCacheUrl: null,
          thumbnail: null,
          name: slotName,
          styleId,
          timestamp,
          dateDir: dateStr,
          isActive: true
        };

        const request = store.put(slotData);

        request.onsuccess = () => {
          resolve({
            slotId,
            slotData,
            isNew: true
          });
        };

        request.onerror = () => reject(new Error('保存槽位数据失败'));
      });
    } catch (error) {
      console.error('选择槽位失败:', error);
      throw error;
    }
  }

  async activateSlot(slotId, styleId) {
    const db = await this.ensureDatabase();
    
    return new Promise(async (resolve, reject) => {
      const transaction = db.transaction(['slots'], 'readwrite');
      const store = transaction.objectStore('slots');
      
      // 先获取当前槽位数据
      const getRequest = store.get(slotId);
      
      getRequest.onsuccess = () => {
        const slotData = getRequest.result;
        if (!slotData) {
          reject(new Error('槽位不存在'));
          return;
        }

        // 生成新的名称
        const timestamp = Date.now();
        const date = new Date();
        const dateStr = `${date.getFullYear()}${String(date.getMonth() + 1).padStart(2, '0')}${String(date.getDate()).padStart(2, '0')}`;
        const slotName = `YnnAI-${timestamp}_${styleId}`;

        // 更新槽位数据
        slotData.name = slotName;
        slotData.isActive = true;
        slotData.status = 'loading';
        slotData.styleId = styleId;
        slotData.timestamp = timestamp;
        slotData.dateDir = dateStr;
        slotData.lastModified = new Date();
        
        const updateRequest = store.put(slotData);
        
        updateRequest.onsuccess = () => resolve(slotData);
        updateRequest.onerror = () => reject(new Error('激活槽位失败'));
      };
      
      getRequest.onerror = () => reject(new Error('获取槽位数据失败'));
    });
  }

  async setSlotName(slotId, name) {
    const db = await this.ensureDatabase();
    
    return new Promise(async (resolve, reject) => {
      const transaction = db.transaction(['slots'], 'readwrite');
      const store = transaction.objectStore('slots');
      
      // 先获取当前槽位数据
      const getRequest = store.get(slotId);
      
      getRequest.onsuccess = () => {
        const slotData = getRequest.result;
        if (!slotData) {
          reject(new Error('槽位不存在'));
          return;
        }

        // 更新名称并激活槽位
        slotData.name = name;
        slotData.isActive = true;
        slotData.status = 'loading';
        
        const updateRequest = store.put(slotData);
        
        updateRequest.onsuccess = () => resolve(slotData);
        updateRequest.onerror = () => reject(new Error('更新槽位名称失败'));
      };
      
      getRequest.onerror = () => reject(new Error('获取槽位数据失败'));
    });
  }

  async setSlotNameAndActivate(name) {
    try {
      console.log('开始设置槽位名称和激活状态:', name);
      const slotId = await this.findEmptySlot();
      const db = await this.ensureDatabase();
      
      return new Promise((resolve, reject) => {
        const transaction = db.transaction(['slots'], 'readwrite');
        const store = transaction.objectStore('slots');
        
        const slotData = {
          id: slotId,
          name: name,
          status: 'loading',
          lastModified: new Date(),
          isActive: true,
          cosUrl: null,
          localCacheUrl: null,
          thumbnail: null
        };

        console.log('准备更新槽位数据:', slotData);
        const request = store.put(slotData);
        
        request.onsuccess = () => {
          console.log('槽位数据更新成功');
          // 发送更新事件
          const event = new CustomEvent('archiveSlotUpdate', {
            detail: slotData
          });
          console.log('发送槽位更新事件:', event.detail);
          window.dispatchEvent(event);
          
          // 启动下载任务
          this.startSlotDownload(slotId, name);
          
          resolve({
            slotId,
            slotData
          });
        };

        request.onerror = (error) => {
          console.error('设置槽位名称失败:', error);
          reject(new Error('设置槽位名称失败'));
        };
      });
    } catch (error) {
      console.error('设置槽位名称和激活状态失败:', error);
      throw error;
    }
  }

  async getSlotInfo(slotId) {
    const db = await this.ensureDatabase();
    
    return new Promise((resolve, reject) => {
      const transaction = db.transaction(['slots'], 'readonly');
      const store = transaction.objectStore('slots');
      const request = store.get(slotId);

      request.onsuccess = () => resolve(request.result);
      request.onerror = () => reject(new Error('获取槽位信息失败'));
    });
  }

  /**
   * 清除槽位数据
   * ⚠️ 警告：此操作不可恢复
   * 调用此方法前必须确保：
   * 1. COS 文件已被删除
   * 2. 用户已确认删除操作
   * 
   * @param {number} slotId 槽位ID (0-3)
   * @returns {Promise<boolean>} 是否成功
   */
  async clearSlot(slotId) {
    const db = await this.ensureDatabase();
    
    return new Promise((resolve, reject) => {
      const transaction = db.transaction(['slots'], 'readwrite');
      const store = transaction.objectStore('slots');
      const request = store.delete(slotId);

      request.onsuccess = () => {
        // 发送槽位清除事件
        this.notifySlotUpdate({
          id: slotId,
          status: 'empty',
          isActive: false,
          lastModified: new Date().toISOString()
        });
        resolve(true);
      };
      request.onerror = () => reject(new Error('清除槽位失败'));
    });
  }

  /**
   * 清除所有槽位数据
   * ⚠️ 警告：此操作不可恢复
   * 调用此方法前必须确保：
   * 1. 所有 COS 文件已被删除
   * 2. 用户已确认操作
   * 
   * @returns {Promise<boolean>} 是否成功
   */
  async clearAllSlots() {
    const db = await this.ensureDatabase();
    
    return new Promise((resolve, reject) => {
      const transaction = db.transaction(['slots'], 'readwrite');
      const store = transaction.objectStore('slots');
      const request = store.clear();

      request.onsuccess = () => {
        // 发送所有槽位清除事件
        for (let i = 0; i < this.maxSlots; i++) {
          this.notifySlotUpdate({
            id: i,
            status: 'empty',
            isActive: false,
            lastModified: new Date().toISOString(),
            cosUrl: null,
            previewUrl: null,
            name: null
          });
        }
        resolve(true);
      };
      request.onerror = () => reject(new Error('清除所有槽位失败'));
    });
  }

  /**
   * 停止所有下载任务
   */
  stopAllDownloads() {
    Object.keys(this.workers).forEach(slotId => {
      this.stopSlotDownload(slotId);
    });
  }

  notifySlotUpdate(slotData) {
    const event = new CustomEvent('archiveSlotUpdate', {
      detail: slotData
    });
    window.dispatchEvent(event);
  }

  // 启动槽位的下载任务
  startSlotDownload(slotId, fileName) {
    // 如果已有worker在运行，先停止它
    this.stopSlotDownload(slotId);

    // 从文件名中提取日期目录（假设文件名格式为：YnnAI-YYYYMMDDHHMMSS_style.png）
    const dateMatch = fileName.match(/YnnAI-(\d{8})/);
    const dateDir = dateMatch ? dateMatch[1] : new Date().toISOString().slice(0, 10).replace(/-/g, '');

    // 创建新的worker
    const worker = new Worker('/workers/slotWorker.js');
    this.workers[slotId] = worker;

    // 处理worker消息
    worker.onmessage = async (e) => {
      const { type, slotId, data, progress, error } = e.data;
      
      switch (type) {
        case 'success':
          // 更新槽位状态
          await this.updateSlotStatus(slotId, data);
          this.stopSlotDownload(slotId);
          break;
          
        case 'error':
          console.error(`槽位${slotId}下载错误:`, error);
          // 更新槽位状态为空
          if (data) {
            await this.updateSlotStatus(slotId, data);
          }
          this.stopSlotDownload(slotId);
          break;
          
        case 'timeout':
          console.log(`槽位${slotId}下载超时，恢复空槽位状态`);
          // 更新槽位状态为空
          if (data) {
            await this.updateSlotStatus(slotId, data);
          }
          this.stopSlotDownload(slotId);
          break;
          
        case 'checking':
          // 更新进度显示
          console.log(`槽位${slotId}下载进度: ${progress}%`);
          break;
      }
    };

    // 启动下载任务
    worker.postMessage({
      type: 'start',
      data: { slotId, fileName, dateDir }
    });
  }

  // 停止槽位的下载任务
  stopSlotDownload(slotId) {
    const worker = this.workers[slotId];
    if (worker) {
      worker.postMessage({ type: 'stop' });
      worker.terminate();
      delete this.workers[slotId];
    }
  }

  // 更新槽位状态
  async updateSlotStatus(slotId, data) {
    const db = await this.ensureDatabase();
    
    return new Promise((resolve, reject) => {
      const transaction = db.transaction(['slots'], 'readwrite');
      const store = transaction.objectStore('slots');
      
      const request = store.get(slotId);
      
      request.onsuccess = () => {
        const slot = request.result || { id: slotId };
        const updatedSlot = { ...slot, ...data };
        
        const updateRequest = store.put(updatedSlot);
        
        updateRequest.onsuccess = () => {
          // 发送更新事件
          this.notifySlotUpdate(updatedSlot);
          resolve(updatedSlot);
        };
        
        updateRequest.onerror = () => reject(new Error('更新槽位状态失败'));
      };
      
      request.onerror = () => reject(new Error('获取槽位数据失败'));
    });
  }
}

export default SlotSelector;
