//version=0.1.0

import { JSONFetchChannel } from 'https://components.int-t.com/current/core/jsonFetchChannel/jsonFetchChannel.js';
import { ComponentRoot } from 'https://components.int-t.com/current/core/componentRoot/componentRoot.js';

export class CalendarChannel extends JSONFetchChannel {
  #hashData(calendarData) {
    const res = {};
    if (calendarData.days == null) return res;
    for (const day of calendarData.days) {
      res[day.date] = day;
    }
    return res;
  }

  #getISODate(date) {
    const year = date.getFullYear().toString();
    const month = (date.getMonth() + 1).toString().padStart(2, '0');
    const dt = date.getDate().toString().padStart(2, '0');
    return `${year}-${month}-${dt}`;
  }

  async send(data) {
    this.url = 'https://api.core-regulus.com/calendar/days';
    const cdata = {
      "dateStart": this.#getISODate(data.dateStart),
      "dateEnd": this.#getISODate(data.dateEnd)
    };
    const res = await super.send(cdata);
    return this.#hashData(res);
  }

  async setEvent(data) {
    this.url = 'https://api.core-regulus.com/calendar/event';
    return await super.send(data);
  }
}


class Calendar extends ComponentRoot {
  #date = new Date();
  #currYear = this.#date.getFullYear();
  #currMonth = this.#date.getMonth();
  #months = ["January", "February", "March", "April", "May", "June", "July", "August", "September", "October", "November", "December"]
  #channel;
  #onCalendarButtonState;
  #onSelectDate;
  #slots;
  #onSelectSlot;
  #onSlotButtonState;
  
  #callCalendarButtonState(date, calendarData) {
    if (this.#onCalendarButtonState == null)
      return 'inactive';
    return this.#onCalendarButtonState(this, date, calendarData);
  }

  #callSlotButtonState(slotDate) {
    if (this.#onSlotButtonState == null)
      return '';
    return this.#onSlotButtonState(this, slotDate);
  }

  async #selectDate(date, calendarData) {
    await this.#onSelectDate?.(this, date, calendarData);
    this.#refreshCalendarButtonState(calendarData)
  }

  #selectSlot(date) {
    this.#onSelectSlot?.(this, date);
    this.#refreshSlotButtonState()
  }


  #getDateFromButton(calendarBtn) {
    const dstr = calendarBtn.getAttribute('date');
    if (dstr == null) return;
    return new Date(dstr);
  }
  
  #refreshCalendarButtonState(calendarData) {
    const buttons = this.components.days.querySelectorAll('button');
    for (const btn of buttons) {
      const date = this.#getDateFromButton(btn);
      if (date == null) {
        btn.className = 'inactive';
        continue;
      }      
      btn.className = this.#callCalendarButtonState(date, calendarData);
    }
  }

  #refreshSlotButtonState(calendarData) {
    const buttons = this.components.hours.querySelectorAll('button');
    for (const btn of buttons) {
      const date = this.#getDateFromButton(btn);
      if (date == null) {
        btn.className = '';
        continue;
      }
      btn.className = this.#callSlotButtonState(date, calendarData);
    }
  }

  set channel(value) {
    this.#channel = value;
    this.#renderCalendar();
  }

  get channel() {
    return this.#channel;
  }
  
  set onCalendarButtonState(value) {
    this.#onCalendarButtonState = value;
  }

  get onCalendarButtonState() {
    return this.#onCalendarButtonState;
  }

  set onSlotButtonState(value) {
    this.#onSlotButtonState = value;
  }

  get onSlotButtonState() {
    return this.#onSlotButtonState;
  }

  set onSelectDate(value) {
    return this.#onSelectDate = value;
  }

  get onSelectDate() {
    return this.#onSelectDate;
  }

  set onSelectSlot(value) {
    return this.#onSelectSlot = value;
  }

  get onSelectSlot() {
    return this.#onSelectSlot;
  }

  set slots(value) {
    this.#slots = value;    
    this.#setSlots();    
  }

  get slots() {
    return this.#slots;
  }

  async #renderCalendar() {
    const firstDayDate = new Date(this.#currYear, this.#currMonth, 1)
    const firstDayOfMonth = firstDayDate.getDay();
    const lastDayDate = new Date(this.#currYear, this.#currMonth + 1, 0);
    const lastDateOfMonth = lastDayDate.getDate();
    const lastDayOfMonth = new Date(this.#currYear, this.#currMonth, lastDateOfMonth).getDate();
    const lastDateOfLastMonth = new Date(this.#currYear, this.#currMonth, 0).getDate();

    const calendarData = await this.#channel.send({dateStart: firstDayDate, dateEnd: lastDayDate});
    let liTag = ""

    let k = 1;
    for (let i = firstDayOfMonth; i > 0; i--) {
      liTag += `<button class="dis inactive" style="--i:${k}; --j:${21 + k};">${lastDateOfLastMonth - i + 1}</button>`;
      k++;
    }

    const currentDate = new Date(firstDayDate);
    k = firstDayOfMonth + 1;
    let activeCount = 0;
    for (let i = 1; i <= lastDateOfMonth; i++) {
      currentDate.setDate(i);
      const state = this.#callCalendarButtonState(currentDate, calendarData);
      if (state === '') activeCount++;
      liTag += `<button class="${state}" date="${currentDate}" style="--i:${1}; --j:${22};">${i}</button>`;
    }

    for (let i = lastDayOfMonth; i < 6; i++) {
      liTag += `<button class="inactive">${i - lastDateOfMonth + 1}</button>`
    }
    
    this.components.currentDate.innerText = `${this.#months[this.#currMonth]} ${this.#currYear}`;
    this.components.days.innerHTML = liTag;
    
    this.components.days.onclick = (event) => {
      const tDate = this.#getDateFromButton(event.target);
      this.#selectDate(tDate, calendarData);
    }

    if (activeCount === 0) {
      setTimeout(() => {
        this.nextMonth();
      }, 0);
    }
  }

  async #handleCurrentDate() {
    if (this.#currMonth < 0 || this.#currMonth > 11) {
      this.#date = new Date(this.#currYear, this.#currMonth, new Date().getDate());
      this.#currYear = this.#date.getFullYear();
      this.#currMonth = this.#date.getMonth();
    } else {
      this.#date = new Date();
    }
    this.#renderCalendar();
  }

  nextMonth = () => {
    this.#currMonth = this.#currMonth + 1;
    this.#handleCurrentDate();
  }

  prevMonth = () => {
    this.#currMonth = this.#currMonth - 1;
    this.#handleCurrentDate();
  }

  #renderButtons() {
    this.components.next.onclick = this.nextMonth;
    this.components.prev.onclick = this.prevMonth;     
  }

  #getISOTime(date) {
    const tDate = this.#getLocalDateTime(date);
    const hs = (tDate.getHours().toString()).padStart(2, '0');
    const ms = (tDate.getMinutes().toString()).padStart(2, '0');
    return `${hs}:${ms}`;
  }

  #getLocalDateTime(date) {
    const sDate = new Date(date);
    const offset = sDate.getTimezoneOffset();
    return new Date(sDate.getTime() - offset * 60 * 1000);    
  }

  #setSlots() {
    this.components.hours.innerHTML = '';
    const hrs = [];
    let index = 1;
    for (const slot of this.#slots) {
      hrs.push(`<button style="--i:${index}; --j:${20 + index};" class="${this.#callSlotButtonState(new Date(slot.timeStart))}" date="${slot.timeStart}">${this.#getISOTime(slot.timeStart)} - ${this.#getISOTime(slot.timeEnd)}</button>`)
      index++;
    }
    this.components.hours.innerHTML = hrs.join('');
    this.components.hours.onclick = (event) => {
      const tDate = this.#getDateFromButton(event.target);
      this.#selectSlot(tDate);      
    }    
  }
  
  get url() { return import.meta.resolve('./calendar.html') }
  
  constructor() {
    super();
  }

  async componentReady() {    
    this.#renderButtons();
  }
}

customElements.define('i-calendar', Calendar);
