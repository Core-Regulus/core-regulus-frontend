import path from 'path';
import { promises as fs } from 'fs';
//import puppeteer from './puppeteer.js';
import * as cheerio from 'cheerio';
import uglifycss from 'uglifycss';

const handlerPath = '../pages';

function cssOnly(isMobile) {
  return (file, stats) => {
    const ext = path.extname(file);
    if (stats.isDirectory()) return false;
    if (ext != '.css') return false;
    const pt = path.dirname(file);
    if (pt.includes('node_modules')) return false;
    const bn = path.basename(file);
    const cm = bn.indexOf('-mobile') != -1;
    if (isMobile) {
      return cm;
    } else {
      return !cm;
    }          
  };
}

async function loadTemplate(config, templateName) {
  const file = path.join(config.settings.templates, templateName);
  const html = await fs.readFile(file, 'utf-8');
  return cheerio.load(html, null, true);
}

function setComponentBodyClass(template, bodyClass) {
  const body = template('body');
  body.attr('class', bodyClass);
}

function setRouterComponent(template, component) {
  const router = template('i-router');
  router.html(component.html());
}

function setStyles(template, styles) {
  const head = template('head');
  head.append(styles.desktop.join('\n'));
  head.append(styles.mobile.join('\n'));
}

function setTemplates(template, templates) {
  const body = template('body');
  body.append(templates.join('\n'));
}

async function includeComponents(config, template) {
  const components = template('[data-include]');
  for (const comp of components) {
    const component = template(comp);
    const fl = component.attr('data-include');
    component.removeAttr('data-include');
    if (fl == null) continue;
    const full = path.join(config.staticPath, fl);
    const templ = (await fs.readFile(full)).toString('utf-8');
    component.html(templ);
  }
}

async function loadHandler(onloadedAttr) {
  const [module, handler] = onloadedAttr.split('.');
  const modulePath = handlerPath + '/' + module + '.js';
  const res = await import(modulePath);
  const hnd = res[handler];
  if (hnd == null)
    throw new Error(`module ${modulePath}.${handler} is not implemented`);
  return hnd;
}

async function renderFile(config, file, styles, templates) {
  const html = await fs.readFile(file, 'utf-8');
  const component = cheerio.load(html, null, false);
  const root = component('*:not(* *)');
  //const basename = path.basename(file);
  const output = root.attr('output');
  if (output == null) return;
  let outputNames = output.split(/,\s/);
  const templateName = root.attr('data-template') ?? 'index.html';
  const noIndex = root.attr('index');

  const template = await loadTemplate(config, templateName);
  const titleName = root.attr('title');
  if (titleName) {
    const titleEl = template('title');
    titleEl.html(`${titleName}`);
  }

  setRouterComponent(template, component);
  setStyles(template, styles);
  //setTemplates(template, templates);
  await includeComponents(config, template);  
  for (const output of outputNames) {
    writeRenderedFile(config, template, output);
  }
}

async function addNoIndex(config, noIndex, template) {
  let metaTag = '';
  if (config.settings?.isDev) {
    metaTag = '<meta name="robots" content="noindex, nofollow" />';
  } else if (noIndex == "false") {
    metaTag = '<meta name="robots" content="noindex, nofollow" />';
  }

  if (metaTag != '') {
    template('head').append(metaTag);
  }
}

async function writeRenderedFile(config, template, output) {
  if ((output == null) || (output == ''))
    return;
  const fn = path.parse(output);
  setComponentBodyClass(template, `${fn.name}-page`);
  const filename = path.join(config.settings.root, output);
  const pFile = path.parse(filename);
  await fs.mkdir(pFile.dir, { recursive: true });
  await fs.writeFile(filename, template.html());
}

async function renderPage(config, page, styles, templates) {
  const html = await fs.readFile(page.file, 'utf-8');
  const component = cheerio.load(html, null, false);
  const output = page.output;
  if (output == null) throw new Error(`Output is not defined for page`, page);
  const templateName = page.template ?? 'index.html';
  const template = await loadTemplate(config, templateName);
  setRouterComponent(template, component);
  setStyles(template, styles);
  //setTemplates(template, templates);
  await includeComponents(config, template);
  if (page.onloaded) await page.onloaded(template, page.data, config);
  await writeRenderedFile(config, template, output);
}

async function getFilesByExt(root, extFilter) {
  const found = await fs.readdir(root, { recursive: true });
  const res = [];
  for (const file of found) {
    const pt = path.parse(file);
    const te = typeof extFilter;
    if ((te == 'string') && (pt.ext == extFilter)) {
      res.push(path.join(root, file));
      continue;
    }

    if (te == 'function') {
      const fullPt = path.join(root, file)
      const stat = await fs.stat(fullPt);
      const rs = extFilter(fullPt, stat);
      if (rs) {
        res.push(fullPt);
      }
    }

  }
  return res;
}

async function getPagesList(config) {
  const found = await getFilesByExt(config.settings.pages, '.html');
  const styles = await getStyles(config);
  const templates = await getTemplates(config);
  for (const file of found) {
    await renderFile(config, file, styles, templates);
  }
}

export async function renderPages(config, pages) {
  const maxParallel = config.maxParallelRenderers;
  console.log('maxParallelRenderers', maxParallel);
  const styles = await getStyles(config);
  const templates = await getTemplates(config);
  const promises = [];
  let i = 0;
  while (i < pages.length) {
    const nextJ = i + maxParallel;
    const jlim = nextJ > pages.length ? pages.length : nextJ;
    for (let j = i; j < jlim; j++) {
      const page = pages[j];
      promises.push(renderPage(config, page, styles, templates));
    }
    await Promise.all(promises);
    i = jlim;
  }
}

function pathToTemplateId(rPath) {
  const ts = rPath.replaceAll(/[\/\.]+/g, '-');
  return ts;
}

async function getTemplatesFromDir(baseDir, rootDir) {
  const files = await getFilesByExt(baseDir, '.html');
  const res = [];

  for (const file of files) {
    const content = await fs.readFile(file, 'utf-8');
    const id = pathToTemplateId(relative(rootDir, file));
    res.push(`
      <template id="${id}">
        ${content}
      </template>
    `);
  }

  return res;
}


async function getTemplates(config) {
  const root = config.settings.root;

  const compPath = path.join(root, 'components');
  const pagePath = path.join(root, 'pages');

  const [components, pages] = await Promise.all([
    getTemplatesFromDir(compPath, root),
    getTemplatesFromDir(pagePath, root)
  ]);

  return [...components, ...pages];
}

function relative(root, filename) {
  const rel = path.relative(root, filename);
  return `/${rel}`;
}


async function getStyles(config) {
  async function clear() {
    const files = await fs.readdir(config.settings.mininfyCSSPath);
    for (const file of files) {
      await fs.unlink(path.join(config.settings.mininfyCSSPath, file));
    }
  }

  await fs.mkdir(config.settings.mininfyCSSPath, { recursive: true });
  await clear();
  
  const mobileFiles = await getFilesByExt(config.settings.root, cssOnly(true));
  const desktopFiles = await getFilesByExt(config.settings.root, cssOnly(false));

  if (!config.settings.minifyCSS) {
    const mobile = mobileFiles.map(
      (d) =>
        `<link href="${relative(config.settings.root, d)}" rel="stylesheet" media="all and (orientation: portrait)" />`
    );
    const desktop = desktopFiles.map(
      (d) => `<link href="${relative(config.settings.root, d)}" rel="stylesheet"/>`
    );
    return { mobile, desktop };
  }
  const uMobile = uglifycss.processFiles(mobileFiles, { expandVars: false });
  const uDesktop = uglifycss.processFiles(desktopFiles, { expandVars: false });

  const mFile = path.join(config.settings.mininfyCSSPath, `styles-mobile.css`);
  const dFile = path.join(config.settings.mininfyCSSPath, `styles.css`);
  await fs.writeFile(dFile, uDesktop);
  await fs.writeFile(mFile, uMobile);
  return {
    mobile: [
      `<link href="${relative(
        config.settings.root,
        mFile
      )}" rel="stylesheet" media="all and (orientation: portrait)"/>`,
    ],
    desktop: [`<link href="${relative(config.settings.root, dFile)}" rel="stylesheet"/>`],
  };
}

export const start = async (config) => {
  await getPagesList(config);
};

export default {
  start,
  renderPages,
};
