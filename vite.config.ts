import path from 'path';
import { defineConfig, loadEnv } from 'vite';

export default defineConfig(({ mode }) => {
    const env = loadEnv(mode, '.', '');
    const isDev = mode === 'development';
    
    return {
      server: {
        host: '0.0.0.0',
        port: 5173,
        strictPort: true,
        hmr: {
          port: 443,
          clientPort: 443
        },
        allowedHosts: ['all']
      },
      preview: {
        host: '0.0.0.0',
        port: 4173,
        strictPort: true
      },
      define: {
        'process.env.NODE_ENV': JSON.stringify(mode),
        'process.env.API_KEY': JSON.stringify(env.GEMINI_API_KEY),
        'process.env.GEMINI_API_KEY': JSON.stringify(env.GEMINI_API_KEY),
        'process.env.REACT_APP_SUPABASE_URL': JSON.stringify(env.REACT_APP_SUPABASE_URL),
        'process.env.REACT_APP_SUPABASE_ANON_KEY': JSON.stringify(env.REACT_APP_SUPABASE_ANON_KEY),
        'process.env.REACT_APP_ENV': JSON.stringify(env.REACT_APP_ENV || mode),
        'process.env.REACT_APP_BASE_URL': JSON.stringify(env.REACT_APP_BASE_URL)
      },
      resolve: {
        alias: {
          '@': path.resolve(__dirname, '.'),
        }
      },
      build: {
        outDir: 'dist',
        sourcemap: !isDev,
        minify: 'terser',
        chunkSizeWarningLimit: 1000,
        rollupOptions: {
          output: {
            manualChunks: {
              vendor: ['react', 'react-dom'],
              router: ['react-router-dom'],
              supabase: ['@supabase/supabase-js']
            }
          }
        }
      },
      optimizeDeps: {
        include: ['react', 'react-dom', 'react-router-dom', '@supabase/supabase-js']
      }
    };
});
