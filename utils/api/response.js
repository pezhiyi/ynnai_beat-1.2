// 响应状态码
const StatusCodes = {
  SUCCESS: 10000,           // 成功
  PARTIAL_SUCCESS: 10001,   // 部分成功
  PROCESSING: 10002,        // 处理中
  INVALID_PARAMS: 40000,    // 参数错误
  UNAUTHORIZED: 40100,      // 未授权
  FORBIDDEN: 40300,         // 禁止访问
  NOT_FOUND: 40400,         // 未找到
  SERVER_ERROR: 50000       // 服务器错误
};

// 格式化成功响应
const success = (data = null, message = 'Success', requestId = null, timeElapsed = null) => {
  const response = {
    code: StatusCodes.SUCCESS,
    message,
    data
  };

  if (requestId) {
    response.request_id = requestId;
  }

  if (timeElapsed) {
    response.time_elapsed = timeElapsed;
  }

  return response;
};

// 格式化错误响应
const error = (code = StatusCodes.SERVER_ERROR, message = 'Error', requestId = null, timeElapsed = null) => {
  const response = {
    code,
    message
  };

  if (requestId) {
    response.request_id = requestId;
  }

  if (timeElapsed) {
    response.time_elapsed = timeElapsed;
  }

  return response;
};

// 格式化处理中响应
const processing = (requestId, message = 'Processing') => ({
  code: StatusCodes.PROCESSING,
  message,
  request_id: requestId
});

// 格式化分页响应
const paginated = (data, total, page, pageSize, requestId = null, timeElapsed = null) => {
  const response = {
    code: StatusCodes.SUCCESS,
    message: 'Success',
    data,
    pagination: {
      total,
      page,
      page_size: pageSize,
      total_pages: Math.ceil(total / pageSize)
    }
  };

  if (requestId) {
    response.request_id = requestId;
  }

  if (timeElapsed) {
    response.time_elapsed = timeElapsed;
  }

  return response;
};

export {
  StatusCodes,
  success,
  error,
  processing,
  paginated
};
