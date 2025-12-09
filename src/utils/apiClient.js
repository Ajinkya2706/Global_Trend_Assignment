import axios from 'axios';

const client = axios.create({
  baseURL: 'https://api.github.com',
  timeout: 10000,
  headers: {
    'Accept': 'application/vnd.github.v3+json',
    'User-Agent': 'GitHub-API-Integration'
  }
});

client.interceptors.response.use(
  response => response,
  async error => {
    if (error.response?.status === 403 || error.response?.status === 429) {
      const resetTime = error.response.headers['x-ratelimit-reset'];
      const waitTime = resetTime ? (resetTime * 1000 - Date.now()) / 1000 : 60;
      throw new Error(`Rate limit exceeded. Retry after ${Math.ceil(waitTime)}s`);
    }
    
    if (error.code === 'ECONNABORTED') {
      throw new Error('Request timeout - GitHub API took too long to respond');
    }
    
    if (!error.response) {
      throw new Error('Network error - Could not reach GitHub API');
    }
    
    throw error;
  }
);


export default client;