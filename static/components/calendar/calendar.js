import { ComponentRoot } from 'https://components.int-t.com/core/componentRoot/componentRoot.js';
import { JSONFetchChannel } from 'https://components.int-t.com/core/jsonFetchChannel/jsonFetchChannel.js';

class Calendar extends ComponentRoot {
  #date = new Date();
  #currYear = this.#date.getFullYear();
  #currMonth = this.#date.getMonth();
  #months = ["January", "February", "March", "April", "May", "June", "July", "August", "September", "October", "November", "December"]
  #channel = new JSONFetchChannel();
  
  #renderCalendar() {
    const firstDayOfMonth = new Date(this.#currYear, this.#currMonth, 1).getDay();
    const lastDateOfMonth = new Date(this.#currYear, this.#currMonth + 1, 0).getDate();
    const lastDayOfMonth = new Date(this.#currYear, this.#currMonth, lastDateOfMonth).getDate();
    const lastDateOfLastMonth = new Date(this.#currYear, this.#currMonth, 0).getDate()
    let liTag = ""

    for (let i = firstDayOfMonth; i > 0; i--) {
      liTag += `<button class="inactive">${lastDateOfLastMonth - i + 1}</button>`;
    }

    for (let i = 1; i <= lastDateOfMonth; i++) {
      const isToday = i === this.#date.getDate() &&
        this.#currMonth === new Date().getMonth() &&
        this.#currYear === new Date().getFullYear()
        ? "active" : "";
      liTag += `<button class="${isToday}">${i}</buttton>`;
    }

    for (let i = lastDayOfMonth; i < 6; i++) {
      liTag += `<button class="inactive">${i - lastDateOfMonth + 1}</button>`
    }
    this.components.currentDate.innerText = `${this.#months[this.#currMonth]} ${this.#currYear}`;
    this.components.days.innerHTML = liTag;
  }

  #handleCurrentDate() {
    if (this.#currMonth < 0 || this.#currMonth > 11) {
      this.#date = new Date(this.#currYear, this.#currMonth, new Date().getDate());
      this.#currYear = this.#date.getFullYear();
      this.#currMonth = this.#date.getMonth();
    } else {
      this.#date = new Date();
    }
    this.#renderCalendar();
  }

  #renderButtons() {
    this.components.next.onclick = () => {
      this.#currMonth = this.#currMonth + 1;      
      this.#handleCurrentDate();
    }

    this.components.prev.onclick = () => {
      this.#currMonth = this.#currMonth - 1;
      this.#handleCurrentDate();
    }
  }
  
  get url() { return import.meta.resolve('./calendar.html') }
  
  constructor() {
    super();
  }

  async componentReady() {
    this.#channel.url = 'https://api.core-regulus.com/calendar/days'
    const cdata = await this.#channel.send({
      "dateEnd": "2025-07-31T00:00:00Z"
    });
    console.log(cdata);
    this.#renderCalendar(cdata);
    this.#renderButtons();
  }
}

customElements.define('i-calendar', Calendar);
