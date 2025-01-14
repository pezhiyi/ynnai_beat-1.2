// 日志级别颜色配置
const COLORS = {
  INFO: '\x1b[36m',   // 青色
  WARN: '\x1b[33m',   // 黄色
  ERROR: '\x1b[31m',  // 红色
  DEBUG: '\x1b[35m',  // 紫色
  RESET: '\x1b[0m'    // 重置
};

// 表情符号配置
const EMOJI = {
  INFO: '🔵',
  WARN: '🟡',
  ERROR: '🔴',
  DEBUG: '🟣'
};

class Logger {
  constructor(requestId) {
    this.requestId = requestId || Math.random().toString(36).substring(7);
    this.startTime = Date.now();
  }

  _log(level, message, data = {}) {
    const timestamp = new Date().toISOString();
    const timeElapsed = Date.now() - this.startTime;
    
    // 构建基础日志数据
    const logData = {
      ...data,
      request_id: this.requestId,
      time_elapsed: `${timeElapsed}ms`
    };

    // 打印彩色日志头
    console.log(
      `${COLORS[level]}[${timestamp}] ${EMOJI[level]} ${level} [${this.requestId}]${COLORS.RESET}`,
      message
    );

    // 如果有额外数据，以灰色打印
    if (Object.keys(logData).length > 0) {
      console.log('\x1b[90m%s\x1b[0m', JSON.stringify(logData, null, 2));
    }

    return logData;
  }

  info(message, data = {}) {
    return this._log('INFO', message, data);
  }

  warn(message, data = {}) {
    return this._log('WARN', message, data);
  }

  error(message, data = {}) {
    return this._log('ERROR', message, data);
  }

  debug(message, data = {}) {
    return this._log('DEBUG', message, data);
  }

  // 创建一个新的请求日志实例
  static forRequest() {
    return new Logger();
  }
}

export default Logger;
