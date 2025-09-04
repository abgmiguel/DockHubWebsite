export default {
  server: {
    hmr: {
      host: '127.0.0.1'
    },
    // Allow all hosts for multi-tenant development
    allowedHosts: [
      '127.0.0.1',
      'localhost',
      '.codersinflow.com',
      '.darkflows.com',
      'codersinflow.com',
      'darkflows.com'
    ]
  }
};