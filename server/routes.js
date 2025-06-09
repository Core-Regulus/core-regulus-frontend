
import Router from 'koa-router';
import hotReload from './modules/hotReload.js';

const router = new Router();
router.get('/reload', hotReload.context.reload);

export default router;