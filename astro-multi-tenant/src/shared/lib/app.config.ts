// Application configuration
export const appConfig = {
  // Server configuration
  server: {
    host: '127.0.0.1', // Use 127.0.0.1 to avoid IPv6 issues
    port: parseInt(process.env.PORT || '4321'),
    apiUrl: process.env.PUBLIC_API_URL || 'http://127.0.0.1:3001'
  },
  
  // Backend API configuration
  api: {
    host: '127.0.0.1',
    port: parseInt(process.env.API_PORT || '3001'),
    get url() {
      return `http://${this.host}:${this.port}`;
    }
  },
  
  // Development configuration
  dev: {
    hmrHost: '127.0.0.1',
    hmrPort: parseInt(process.env.HMR_PORT || '24678')
  }
};

// Helper to get API URL
export function getApiUrl(): string {
  return appConfig.api.url;
}

// Helper to get server URL
export function getServerUrl(): string {
  return `http://${appConfig.server.host}:${appConfig.server.port}`;
}