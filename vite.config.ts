import { defineConfig } from 'vite'

export default defineConfig({
  resolve: {
    alias: {
      '@': decodeURIComponent(new URL('./src', import.meta.url).pathname),
    },
  },
  build: {
    rollupOptions: {
      input: {
        app: 'app.html',
        detail: 'detail.html',
        login: 'index.html',
        customers: 'customers.html',
        dashboard: 'dashboard.html',
        analytics: 'analytics.html',
      },
    },
  },
})

