import client from '../utils/apiClient.js';
import cache from './cache.service.js';

class GitHubService {
  async fetchWithCache(key, fetchFn) {
    const cached = cache.get(key);
    if (cached) return { ...cached, cached: true };
    
    const data = await fetchFn();
    cache.set(key, data);
    return { ...data, cached: false };
  }

  async getUsers(limit = 10, since = 0) {
    const validLimit = Math.min(Math.max(1, parseInt(limit) || 10), 50);
    const cacheKey = `users:${validLimit}:${since}`;
    
    return this.fetchWithCache(cacheKey, async () => {
      const response = await client.get(`/users?per_page=${validLimit}&since=${since}`);
      return {
        data: response.data.map(u => ({
          id: u.id,
          login: u.login,
          avatar: u.avatar_url,
          url: u.html_url
        })),
        meta: { count: response.data.length, since: parseInt(since) }
      };
    });
  }

  async getUserDetails(username) {
    const cacheKey = `user:${username}`;
    
    return this.fetchWithCache(cacheKey, async () => {
      const response = await client.get(`/users/${username}`);
      const user = response.data;
      return {
        user: {
          login: user.login,
          name: user.name,
          bio: user.bio,
          location: user.location,
          publicRepos: user.public_repos,
          followers: user.followers,
          following: user.following,
          createdAt: user.created_at,
          avatar: user.avatar_url
        }
      };
    });
  }

  async getUserRepos(username, filters = {}) {
    const sort = filters.sort || 'updated';
    const limit = Math.min(parseInt(filters.limit) || 10, 50);
    const cacheKey = `repos:${username}:${sort}:${limit}:${filters.language || 'all'}`;
    
    return this.fetchWithCache(cacheKey, async () => {
      const response = await client.get(`/users/${username}/repos?per_page=${limit}&sort=${sort}`);
      let repos = response.data;
      
      if (filters.language) {
        repos = repos.filter(r => 
          r.language?.toLowerCase() === filters.language.toLowerCase()
        );
      }
      
      return {
        data: repos.map(r => ({
          name: r.name,
          fullName: r.full_name,
          description: r.description,
          language: r.language,
          stars: r.stargazers_count,
          forks: r.forks_count,
          updatedAt: r.updated_at,
          url: r.html_url
        })),
        filters: { sort, language: filters.language || 'all', limit },
        meta: { total: repos.length }
      };
    });
  }

  async getRepoDetails(owner, repo) {
    const cacheKey = `repo:${owner}:${repo}`;
    
    return this.fetchWithCache(cacheKey, async () => {
      const response = await client.get(`/repos/${owner}/${repo}`);
      const r = response.data;
      return {
        name: r.name,
        fullName: r.full_name,
        description: r.description,
        owner: r.owner.login,
        language: r.language,
        stars: r.stargazers_count,
        forks: r.forks_count,
        openIssues: r.open_issues_count,
        topics: r.topics,
        createdAt: r.created_at,
        updatedAt: r.updated_at,
        homepage: r.homepage,
        url: r.html_url
      };
    });
  }

  async getUserStats(username) {
    const cacheKey = `stats:${username}`;
    
    return this.fetchWithCache(cacheKey, async () => {
      const userResponse = await client.get(`/users/${username}`);
      const reposResponse = await client.get(`/users/${username}/repos?per_page=100`);
      
      const repos = reposResponse.data;
      const totalStars = repos.reduce((sum, r) => sum + r.stargazers_count, 0);
      
      const languages = repos.reduce((acc, r) => {
        if (r.language) {
          acc[r.language] = (acc[r.language] || 0) + 1;
        }
        return acc;
      }, {});
      
      const mostStarred = repos.reduce((max, r) => 
        r.stargazers_count > (max?.stargazers_count || 0) ? r : max
      , null);
      
      return {
        username: userResponse.data.login,
        totalRepos: userResponse.data.public_repos,
        totalStars,
        totalForks: repos.reduce((sum, r) => sum + r.forks_count, 0),
        languageBreakdown: languages,
        mostStarredRepo: mostStarred ? {
          name: mostStarred.name,
          stars: mostStarred.stargazers_count,
          url: mostStarred.html_url
        } : null,
        followers: userResponse.data.followers
      };
    });
  }
}

export default new GitHubService();