// export const errorHandler = (err, req, res, next) => {
//   console.error(err);

//   if (err.response?.status === 404) {
//     return res.status(404).json({
//       error: 'Resource not found',
//       details: err.message
//     });
//   }

//   if (err.response?.status === 403 || err.response?.status === 429) {
//     return res.status(429).json({
//       error: 'Rate limit exceeded',
//       details: err.message
//     });
//   }

//   if (err.code === 'ECONNABORTED') {
//     return res.status(504).json({
//       error: 'Request timeout',
//       details: err.message
//     });
//   }

//   if (!err.response && err.message.includes('Network')) {
//     return res.status(503).json({
//       error: 'Service unavailable',
//       details: err.message
//     });
//   }

//   res.status(err.response?.status || 500).json({
//     error: 'Internal server error',
//     details: err.message
//   });
// };


export const errorHandler = (err, req, res, next) => {
  console.error('Error occurred:', err.message);

  if (err.message?.includes('Missing or invalid')) {
    return res.status(400).json({
      error: 'Bad Request',
      details: err.message
    });
  }

  if (err.message?.includes('Malformed') || err.message?.includes('Invalid response format')) {
    return res.status(502).json({
      error: 'Bad Gateway',
      details: err.message
    });
  }

  if (err.response?.status === 404) {
    return res.status(404).json({
      error: 'Resource not found',
      details: 'The requested user or repository does not exist'
    });
  }

  if (err.response?.status === 403 || err.response?.status === 429) {
    return res.status(429).json({
      error: 'Rate limit exceeded',
      details: err.message
    });
  }

  if (err.code === 'ECONNABORTED' || err.message?.includes('timeout')) {
    return res.status(504).json({
      error: 'Gateway Timeout',
      details: 'Request took too long to complete'
    });
  }

  if (err.message?.includes('Network') || err.code === 'ENOTFOUND' || err.code === 'ECONNREFUSED') {
    return res.status(503).json({
      error: 'Service Unavailable',
      details: 'Could not connect to GitHub API'
    });
  }

  res.status(err.response?.status || 500).json({
    error: 'Internal Server Error',
    details: err.message || 'An unexpected error occurred'
  });
};