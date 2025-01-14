// 自定义API错误类
class APIError extends Error {
  constructor(code, message, status = 500) {
    super(message);
    this.name = 'APIError';
    this.code = code;
    this.status = status;
  }
}

// 常见错误类型
const ErrorTypes = {
  INVALID_INPUT: {
    code: 400001,
    message: '无效的输入参数',
    status: 400
  },
  UNAUTHORIZED: {
    code: 401001,
    message: '未授权的访问',
    status: 401
  },
  FORBIDDEN: {
    code: 403001,
    message: '禁止访问',
    status: 403
  },
  NOT_FOUND: {
    code: 404001,
    message: '资源未找到',
    status: 404
  },
  METHOD_NOT_ALLOWED: {
    code: 405001,
    message: '方法不允许',
    status: 405
  },
  RATE_LIMIT: {
    code: 429001,
    message: '请求过于频繁',
    status: 429
  },
  INTERNAL_ERROR: {
    code: 500001,
    message: '服务器内部错误',
    status: 500
  }
};

// 错误处理中间件
const errorHandler = (error, logger) => {
  // 如果是自定义API错误，直接使用其属性
  if (error instanceof APIError) {
    logger?.error(error.message, {
      code: error.code,
      status: error.status,
      stack: error.stack
    });

    return {
      code: error.code,
      message: error.message,
      status: error.status
    };
  }

  // 处理其他类型的错误
  logger?.error('Unexpected Error', {
    error: {
      name: error.name,
      message: error.message,
      stack: error.stack
    }
  });

  // 默认返回内部错误
  return {
    code: ErrorTypes.INTERNAL_ERROR.code,
    message: ErrorTypes.INTERNAL_ERROR.message,
    status: ErrorTypes.INTERNAL_ERROR.status
  };
};

export { APIError, ErrorTypes, errorHandler };
