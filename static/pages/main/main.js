import { Page } from 'https://components.int-t.com/current/core/page/page.js';
import { JSONFetchChannel } from 'https://components.int-t.com/current/core/jsonFetchChannel/jsonFetchChannel.js';
import '../../components/calendar/calendar.js';
import '../../components/sphere/sphere.js'

class CalendarChannel extends JSONFetchChannel {
  get url() {
    return 'https://api.core-regulus.com/calendar/days';
  }
}

function getLocalDate(date) {
  const year = date.getFullYear();
  const month = String(date.getMonth() + 1).padStart(2, '0');
  const day = String(date.getDate()).padStart(2, '0');
  return `${year}-${month}-${day}`;
}


export class CorePage extends Page {       
  #channel = new CalendarChannel();
  #currentDate = null;
  #currentSlot = null;

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

  #isActive = (date) => {
    if (this.#currentDate == null) return false;
    return date.getFullYear() === this.#currentDate.getFullYear() &&
      date.getMonth() === this.#currentDate.getMonth() &&
      date.getDate() === this.#currentDate.getDate();
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

  #getCalendarButtonState = (_, date, calendarData) => {
    const isoDate = getLocalDate(date);
    const slotDate = calendarData[isoDate];
    if ((slotDate?.slots == null ) || 
        (slotDate.slots.length == 0)) 
          return 'inactive';
    if (this.#isActive(date)) 
      return 'active';
    return '';
  }

  #getSlotButtonState = (_, date) => {    
    return this.#isActiveSlot(date) ? 'active' : '';
  }

  #isActiveSlot(date) {
    const str = date.toISOString();
    return str == this.#currentSlot;
  }

  #selectDate = (calendar, date, calendarData) => {
    const isoDate = getLocalDate(date);
    const slotDate = calendarData[isoDate];
    if ((slotDate?.slots == null) ||
      (slotDate.slots.length == 0))
      return;
    this.#currentDate = date;
    calendar.slots = slotDate.slots;
  }

  #selectSlot = (_, date) => {    
    const isoDate = date.toISOString();    
    if (this.#currentSlot == isoDate) {
      console.log(`slot confirmed ${date}`);
      return;
    }    
    this.#currentSlot = isoDate;        
  }
  
  disconnectedCallback() {
    this.#releaseScroll();
  }

  componentReady() {    
    this.#initScroll();
    this.#initRenderer();
    this.components.calendar.onCalendarButtonState = this.#getCalendarButtonState;
    this.components.calendar.onSlotButtonState = this.#getSlotButtonState;
    this.components.calendar.onSelectDate = this.#selectDate;
    this.components.calendar.onSelectSlot = this.#selectSlot;    
    this.components.calendar.channel = this.#channel;
  }
}

customElements.define('core-page', CorePage);
