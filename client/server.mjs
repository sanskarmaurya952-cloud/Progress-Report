import { createServer } from 'vite';
import react from '@vitejs/plugin-react';
import path from 'path';
import { fileURLToPath } from 'url';

const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);

async function start() {
  console.log('[ALPHA++ Frontend] Starting Vite dev server...');
  const server = await createServer({
    configFile: false,
    root: '.',
    plugins: [react()],
    resolve: {
      alias: [
        {
          find: /^lucide-react$/,
          replacement: path.resolve(__dirname, 'src/lib/icons.ts'),
        },
      ],
    },
    server: {
      port: 5173,
      host: '0.0.0.0',
      watch: null,
      proxy: {
        '/api': {
          target: 'http://127.0.0.1:3001',
          changeOrigin: true,
        },
      },
    },
  });

  await server.listen();
  console.log('[ALPHA++ Frontend] Server is ready on http://127.0.0.1:5173');
}

start().catch(err => {
  console.error('[ALPHA++ Frontend] Error starting server:', err);
  process.exit(1);
});
