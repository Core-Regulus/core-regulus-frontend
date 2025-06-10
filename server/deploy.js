import config from './config.js';
import builder from './modules/builder.js';
import 'dotenv/config';

const branch = process.env['BRANCH'] ?? process.argv[2];

if (branch == null)
  throw new Error('Invalid branch');


const target = branch == 'main' ? 'dev' :
               branch == 'production' ? 'prod' :
               unknownBranch(branch);
console.log('Current branch is: ', branch, 'Current target is: ', target);

function unknownBranch(branch) {
  throw new Error(`Unknown branch ${branch}`);
}


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