import { Page } from 'https://components.int-t.com/current/core/page/page.js';
import { CalendarChannel } from  '../../components/calendar/calendar.js';
import '../../components/sphere/sphere.js'

function getLocalDateTime(date) {
  const sDate = new Date(date);
  const offset = sDate.getTimezoneOffset();
  return new Date(sDate.getTime() - offset * 60 * 1000);
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

        card.style.setProperty("--mouse-x", `${x}px`);
        card.style.setProperty("--mouse-y", `${y}px`);
      }
    }
  }

  #isActive = (date) => {
    if (this.#currentDate == null) return false;
    return date.getFullYear() === this.#currentDate.getFullYear() &&
      date.getMonth() === this.#currentDate.getMonth() &&
      date.getDate() === this.#currentDate.getDate();
  }

    
  #scrollTimeout = null;
  #scrollHandler = () => {
    if (this.#scrollTimeout != null) return;
    this.#scrollTimeout = setTimeout(() => {
      const scrollPos = this.components.content.scrollTop;
      if (scrollPos > 100) {
        this.components.header.classList.add("header-scroll")
      } else {
        this.components.header.classList.remove("header-scroll")
      } 
      this.#scrollTimeout = null;
    }, 200);
  }
  
  #initScroll() {
    this.components.content.onscroll = this.#scrollHandler;
  }

  #goToMeetInfo() {
    this.components.meetSlot.innerHTML = getLocalDateTime(this.#currentSlot).toLocaleString();
    this.components.schedulePage.classList.remove("meet-status");
    this.components.schedulePage.classList.add("meet-info");
  }

  #goToMeetStatus() {
    this.components.schedulePage.classList.remove("meet-info");
    this.components.schedulePage.classList.add("meet-status");
  }

  #goToSchedule() {
    this.components.schedulePage.classList.remove("meet-status");
    this.components.schedulePage.classList.remove("meet-info");
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

  #selectDate = async (calendar, date, calendarData) => {
    const newDate = new Date(date);
    newDate.setDate(date.getDate() + 1);
    const currentSlots = await calendar.channel.send({
      dateStart: date,
      dateEnd: newDate
    });    
    const isoDate = getLocalDate(date);
    const slotDate = currentSlots[isoDate];
    if ((slotDate?.slots == null) ||
      (slotDate.slots.length == 0))
      return;
    this.#currentDate = date;
    calendar.slots = slotDate.slots;
  }

  #getMeetName() {
    const name = this.components.guestName.value;
    if (name == '') {
      this.components.meetName.innerHTML = '&nbsp;';
    }
    this.components.meetName.innerHTML = `Core Regulus - ${name} meeting`;
  }


  #selectSlot = (_, date) => {    
    const isoDate = date.toISOString();    
    this.#currentSlot = isoDate;
    this.#goToMeetInfo();    
  }

  async #sendCalendarEvent(time, eventName, guestEmail, guestName, guestDescription) {
    await this.components.calendar.channel.setEvent({
      time,
      eventName,
      guestEmail,
      guestName,
      guestDescription
    });
    this.#goToMeetStatus();    
  }
  
  #initCalendarButtons() {  
    this.components.backToSchedule.onclick = () => {
      this.#goToSchedule();
    };

    this.components.guestName.oninput = () => {
      this.#getMeetName();
    }

    this.components.meetInfo.onsubmit = async (event) => {
      event.preventDefault();
      event.stopPropagation();
      try {        
        this.components.meetError.innerHTML = '&nbsp;';
        const time = getLocalDateTime(this.#currentSlot);
        const name = this.components.meetName.innerHTML;
        const guestName = this.components.guestName.value;
        const email = this.components.guestEmail.value;
        const description = this.components.guestDescription.value;
        await this.#sendCalendarEvent(time, name, email, guestName, description);
      } catch (e) {
        this.components.meetError.innerHTML = 'This time slot is busy. Please go back and select another time slot';
      }
      
    }
  }
  
  componentReady() {    
    this.#initScroll();
    this.#initRenderer();
    this.components.calendar.onCalendarButtonState = this.#getCalendarButtonState;
    this.components.calendar.onSlotButtonState = this.#getSlotButtonState;
    this.components.calendar.onSelectDate = this.#selectDate;
    this.components.calendar.onSelectSlot = this.#selectSlot;    
    this.components.calendar.channel = this.#channel;
    this.#initCalendarButtons();

  }
}

customElements.define('core-page', CorePage);
