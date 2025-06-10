import config from './config.js';
import builder from './modules/builder.js';

async function start() {
  console.log('Building project');  
  await builder.start(config);
  console.log('Build finished');
}

process.on("unhandledRejection", function (reason, p) {
  console.log(
    "Possibly Unhandled Rejection at: Promise ",
    p,
    " reason: ",
    reason
  );
});

config.settings.minifyCSS = true;
config.settings.isDev = branch == 'main';
await start(config, target);
console.log('Done');