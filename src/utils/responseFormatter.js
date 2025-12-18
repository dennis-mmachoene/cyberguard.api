// Format success response
export const formatSuccessResponse = (data, message = 'Success') => {
  return {
    success: true,
    message,
    data,
    timestamp: new Date().toISOString(),
  };
};

// Format error response
export const formatErrorResponse = (message, code = 'ERROR', details = null) => {
  const response = {
    success: false,
    message,
    code,
    timestamp: new Date().toISOString(),
  };
  
  if (details) {
    response.details = details;
  }
  
  return response;
};

// Format paginated response
export const formatPaginatedResponse = (data, pagination, message = 'Success') => {
  return {
    success: true,
    message,
    data,
    pagination: {
      page: pagination.page,
      limit: pagination.limit,
      total: pagination.total,
      pages: pagination.pages,
      hasNext: pagination.hasNext,
      hasPrev: pagination.hasPrev,
    },
    timestamp: new Date().toISOString(),
  };
};

// Format list response
export const formatListResponse = (items, message = 'Success') => {
  return {
    success: true,
    message,
    data: items,
    count: items.length,
    timestamp: new Date().toISOString(),
  };
};

// Calculate pagination metadata
export const calculatePagination = (page, limit, total) => {
  const currentPage = parseInt(page, 10) || 1;
  const itemsPerPage = parseInt(limit, 10) || 10;
  const totalItems = parseInt(total, 10) || 0;
  const totalPages = Math.ceil(totalItems / itemsPerPage);
  
  return {
    page: currentPage,
    limit: itemsPerPage,
    total: totalItems,
    pages: totalPages,
    hasNext: currentPage < totalPages,
    hasPrev: currentPage > 1,
    skip: (currentPage - 1) * itemsPerPage,
  };
};