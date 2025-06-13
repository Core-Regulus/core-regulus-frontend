import { Page } from 'https://components.int-t.com/core/page/page.js';

export class CorePage extends Page { 
  connectedCallback() {
    console.log('Put your js code here');
  }

}

const headerEl = document.querySelector(".header")

window.addEventListener("scroll", function(){
    const scrollPos = window.scrollY

    if(scrollPos > 100) {
        headerEl.classList.add("header__scroll")
    }else{
        headerEl.classList.remove("header__scroll")
    }
})

const menuIcon = document.querySelector('#menu-icon')
const navbar = document.querySelector('.navbar')
const navbg = document.querySelector('.nav-bg')


menuIcon.addEventListener('click', () => {
    menuIcon.classList.toggle('bx-x')
    navbar.classList.toggle('active')
    navbg.classList.toggle('active')
} )

customElements.define('core-page', CorePage);
