import { defineConfig } from 'vite';
import react from '@vitejs/plugin-react';
import path from 'path';
import fs from 'fs';
import svgr from 'vite-plugin-svgr';
import checker from 'vite-plugin-checker';
import circularDependency from 'vite-plugin-circular-dependency';

const isDev = process.env.NODE_ENV === 'development';

// Функция для поиска файла с учетом расширений
function resolveAlias(basePaths) {
  return {
    name: 'resolve-alias',
    resolveId(source, importer) {
      // Игнорируем абсолютные пути и пути, начинающиеся с node_modules
      if (source.startsWith('.') || source.startsWith('/') || source.startsWith('node_modules')) {
        return null;
      }

      // Расширения, которые нужно проверять
      const extensions = ['.tsx', '.ts', '.jsx', '.js'];

      // Проверяем наличие файла в указанных директориях
      for (const basePath of basePaths) {
        let fullPath = path.resolve(basePath, source);
        if (fs.existsSync(fullPath)) {
          return fullPath;
        }
        for (const ext of extensions) {
          fullPath = path.resolve(basePath, `${source}${ext}`);
          if (fs.existsSync(fullPath)) {
            return fullPath;
          }
        }
      }

      // Если файл не найден, возвращаем null
      return null;
    },
  };
}

const htmlPlugin = () => {
  return {
    name: 'html-transform',
    transformIndexHtml(html) {
      if (isDev) return html;
      return html.replace('<base href="/" />', '<base href="/MineCalc/" />');
    },
  };
};

export default defineConfig({
  base: './',
  server: {
    // open: true,
    host: true,
    port: 3000,
    sourcemap: true,
  },
  plugins: [
    circularDependency(),
    react(),
    checker({ typescript: true }), // Включаем проверку TypeScript
    {
      name: 'suppress-public-warnings',
      configResolved(config) {
        const originalWarn = config.logger.warn;
        config.logger.warn = (msg, options) => {
          // Подавляем предупреждения, связанные с public directory
          if (msg.includes('Files in the public directory are served at the root path.')) {
            return;
          }
          originalWarn(msg, options);
        };
      },
    },
    resolveAlias([__dirname, path.resolve(__dirname, './src')]), // Ищем в корне и в ./src],
    svgr({
      typescript: true, // Генерация типов для SVG
      svgrOptions: { exportType: 'default', ref: true, svgo: false, titleProp: true },
      include: '**/*.svg',
    }),
    htmlPlugin(),
  ],
  resolve: {
    extensions: ['.tsx', '.ts', '.jsx', '.js'], // Добавляем расширения
  },
  build: {
    outDir: './build',
    emptyOutDir: true,
  },
});
