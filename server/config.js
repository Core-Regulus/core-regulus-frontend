import path from 'path';
import { dirname } from 'path';
import { fileURLToPath } from 'url';

const __dirname = dirname(fileURLToPath(import.meta.url));
export const port = process.env['PORT'] ?? 9001;
export const staticPath = path.resolve(__dirname, '..', 'static');

export const settings = {
  root: path.resolve(__dirname, '..', 'static'),
  watch: [path.resolve(__dirname, '..', 'static')],
  templates: path.resolve(__dirname, '..', 'templates'),
  pages: path.resolve(__dirname, '..', 'static', 'pages'),
  mininfyCSSPath: path.resolve(__dirname, '..', 'static', 'styles'),
  minifyCSS: false
};

export default {
  maxParallelRenderers: 50, //How much renderers will be launched in parallel
  port,
  staticPath,
  settings,
  isDev: true
};

