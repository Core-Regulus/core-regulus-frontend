import koa from "koa";
import config from "./config.js";
import serve from 'koa-static';
import http from "http";
import router from './routes.js';
import builder from './modules/builder.js';

const application = new koa();

application.use(serve(config.staticPath));
application.use(router.routes());

function createServer(application, port) {
  return new Promise((resolve, reject) => {
    const server = http.createServer(application.callback());
    server.listen(port, (err) => {
      if (err != null) return reject(err);
      console.log("Server accepts connections at " + port);
      return resolve();
    });
  });
}

async function start(application, port) {
  try {
    await builder.start(config);
    await createServer(application, port);
  } catch (err) {
    console.log(err);
  }
}

process.on("unhandledRejection", function (reason, p) {
  console.log(
    "Possibly Unhandled Rejection at: Promise ",
    p,
    " reason: ",
    reason
  );
});

start(application, config.port);
