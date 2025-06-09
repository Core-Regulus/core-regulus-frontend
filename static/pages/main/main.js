import loader from "/components/loader/loader.js"

async function loadPage () {
  return await loader.loadHTMLIfNotExists(`/pages/main/main.html`, 'main-banner');
}

class Main {
  constructor() {
    this.render = async (form) => {
      const res = await loadPage();
      if (res != null)
      form.innerHTML = res;
      this.components = {};
    };
  }
}

const main = new Main();
export default main;
