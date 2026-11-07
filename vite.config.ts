import { defineConfig } from 'vite';
import react from '@vitejs/plugin-react';
import path from 'path';

export default defineConfig({
  // 必须使用相对路径 base: './'，确保构建出的 dist/ 目录无需任何 HTTP 服务器或梯子，
  // 直接以 file:/// 双击 index.html 或部署在 GitHub Pages 的任意子路径均可正常加载静态资源
  base: './',
  plugins: [react()],
  resolve: {
    alias: {
      '@': path.resolve(__dirname, './src'),
    },
  },
  build: {
    outDir: 'dist',
    assetsDir: 'assets',
    sourcemap: false,
    minify: 'esbuild',
    rollupOptions: {
      output: {
        // 静态分块打包，分离核心框架与重型库，优化浏览器加载
        manualChunks: {
          'vendor-react': ['react', 'react-dom'],
          'vendor-katex': ['katex'],
          'vendor-icons': ['lucide-react'],
        },
      },
    },
  },
  server: {
    port: 5173,
    open: true,
  },
});
