class ArchiveManager {
  constructor() {
    this.slots = new Map();
    this.maxSlots = 4;
    this.initialize();
  }

  initialize() {
    // 初始化4个存档槽
    for (let i = 0; i < this.maxSlots; i++) {
      if (!this.slots.has(i)) {
        this.slots.set(i, new ArchiveSlot(i));
      }
    }
  }

  getSlot(slotId) {
    return this.slots.get(slotId);
  }

  getAllSlots() {
    return Array.from(this.slots.values());
  }

  // 单例模式
  static getInstance() {
    if (!ArchiveManager.instance) {
      ArchiveManager.instance = new ArchiveManager();
    }
    return ArchiveManager.instance;
  }
}

class ArchiveSlot {
  constructor(id) {
    this.id = id;
    this.status = 'idle'; // idle, saving, loading, error
    this.data = null;
    this.thumbnail = null;
    this.lastModified = null;
    this.worker = null;
    this.setupWorker();
  }

  setupWorker() {
    // 创建专属的 Web Worker
    this.worker = new Worker('/workers/archiveWorker.js');
    
    this.worker.onmessage = (event) => {
      const { type, data } = event.data;
      switch (type) {
        case 'SAVE_COMPLETE':
          this.status = 'idle';
          this.data = data.archive;
          this.thumbnail = data.thumbnail;
          this.lastModified = new Date();
          this.notifyUpdate();
          break;
        case 'LOAD_COMPLETE':
          this.status = 'idle';
          this.notifyUpdate();
          break;
        case 'ERROR':
          this.status = 'error';
          this.notifyUpdate();
          break;
      }
    };
  }

  async saveState(canvasData, layers) {
    this.status = 'saving';
    this.notifyUpdate();

    // 发送数据到 Worker 进行处理
    this.worker.postMessage({
      type: 'SAVE',
      data: {
        canvasData,
        layers,
        slotId: this.id
      }
    });
  }

  async loadState() {
    if (!this.data) return null;
    
    this.status = 'loading';
    this.notifyUpdate();

    this.worker.postMessage({
      type: 'LOAD',
      data: {
        slotId: this.id
      }
    });

    return this.data;
  }

  notifyUpdate() {
    // 发布状态更新事件
    const event = new CustomEvent('archiveSlotUpdate', {
      detail: {
        slotId: this.id,
        status: this.status,
        hasData: !!this.data,
        thumbnail: this.thumbnail,
        lastModified: this.lastModified
      }
    });
    window.dispatchEvent(event);
  }

  terminate() {
    if (this.worker) {
      this.worker.terminate();
      this.worker = null;
    }
  }
}

export default ArchiveManager;
