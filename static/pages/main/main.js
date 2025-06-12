import { Page } from 'https://components.int-t.com/core/page/page.js';

export class CorePage extends Page { 
  connectedCallback() {
    console.log('Put your js code here');
  }

}

customElements.define('core-page', CorePage);
