import { PassThrough } from "stream";
import config from '../config.js';
import chokidar from 'chokidar';
import EventEmitter from "events";

const events = new EventEmitter();
events.setMaxListeners(0);

function watch() {
  let interval = null;
  function watchHandler() {
    if (interval == null)
      interval = setTimeout(() => {
        events.emit("data", "reload");
        interval = null;
      }, 100);
  }

  const watches = config.settings.watch;
  if (watches == null) return;

  for (const path of watches) {
    chokidar.watch(path).on('all', watchHandler);
  }
}

watch();

async function hotReloadContext(ctx) {
  ctx.request.socket.setTimeout(0);
  ctx.req.socket.setNoDelay(true);
  ctx.req.socket.setKeepAlive(true);

  ctx.set({
    "Content-Type": "text/event-stream",
    "Cache-Control": "no-cache",
    "Connection": "keep-alive",
  });

  const stream = new PassThrough();

  ctx.status = 200;
  ctx.body = stream;

  const listener = (data) => {
    stream.write(`data: ${data}\n\n`);
  };

  events.on("data", listener);

  stream.on("close", () => {
    events.off("data", listener);
  });
}

export default {
  context: {
    reload: hotReloadContext
  }
};