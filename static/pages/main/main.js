import { Page } from 'https://components.int-t.com/current/core/page/page.js';
import { JSONFetchChannel } from 'https://components.int-t.com/current/core/jsonFetchChannel/jsonFetchChannel.js';
import '../../components/calendar/calendar.js';
import '../../components/sphere/sphere.js'

class CalendarChannel extends JSONFetchChannel {
  get url() {
    return 'https://api.core-regulus.com/calendar/days';
  }
}

export class CorePage extends Page {       
  #channel = new CalendarChannel();
  #initRenderer() {
    const menuIcon = this.components.menuIcon;
    const navbar = this.components.navbar;
    const navbg = this.components.navbg;

    menuIcon.onclick = () => {
      menuIcon.classList.toggle('bx-x')
      navbar.classList.toggle('active')
      navbg.classList.toggle('active')
    }

    const cards = Array.from(document.querySelectorAll(".card"))
    const cardsContainer = this.components.industries;

    cardsContainer.onmousemove =(e) => {
      for (const card of cards) {
        const rect = card.getBoundingClientRect();
        const x = e.clientX - rect.left;
        const y = e.clientY - rect.top;

        card.style.setProperty("--mouse-x", `${x}px`)
        card.style.setProperty("--mouse-y", `${y}px`)        
      }
    }
    
  }
    
  #scrollHandler = () => {
    const scrollPos = window.scrollY
    if (scrollPos > 100) {
      this.components.header.classList.add("header__scroll")
    } else {
      this.components.header.classList.remove("header__scroll")
    }    
  }
  
  #initScroll() {
    window.addEventListener("scroll", this.#scrollHandler);    
  }

  #releaseScroll() {
    window.removeEventListener("scroll", this.#scrollHandler);
  }
  
  disconnectedCallback() {
    this.#releaseScroll();
  }

  componentReady() {    
    this.#initScroll();
    this.#initRenderer();    
    this.components.calendar.channel = this.#channel;
  }
}

customElements.define('core-page', CorePage);
