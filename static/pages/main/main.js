import loader from 'https://components.int-t.com/core/loader/loader.js';
import { Page } from 'https://components.int-t.com/core/page/page.js';

loader.loadCSS(import.meta.resolve('./main.css'));

export class MainPage extends Page { 
  
}

customElements.define('main-page', MainPage);