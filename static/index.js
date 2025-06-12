import 'https://components.int-t.com/core/application/application.js';
import 'https://components.int-t.com/core/router/router.js';
import 'https://components.int-t.com/core/page/page.js'

export const routes = [
  { path: /^\/(\?.*)?$/i, page: '/pages/main/main.html', target: '/' },
  { path: /^\/index.html$/i, page: '/pages/main/main.html' }
];
