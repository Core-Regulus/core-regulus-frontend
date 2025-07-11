import 'https://components.int-t.com/current/core/application/application.js';
import 'https://components.int-t.com/current/core/router/router.js';
import './pages/main/main.js';
import './components/logs/logs.js';

export const routes = [
  { path: /^\/(\?.*)?$/i, page: '/pages/main/main.html', target: '/' },
  { path: /^\/index.html$/i, page: '/pages/main/main.html' }
];
