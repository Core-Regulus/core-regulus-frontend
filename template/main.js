// const sphere = document.getElementById("sphere")
// const rows = []
// for(i = 0; i < 180; i += 10){
//     rows.push(`<div class="line" style="transform: rotateY(${i}deg);"></div>`)
// }

// sphere.innerHTML = rows.join("");

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

const cards = Array.from(document.querySelectorAll(".card"))
const cardsContainer = document.querySelector(".industries")

cardsContainer.addEventListener("mousemove", (e) =>{
    for(const card of cards){
        const rect = card.getBoundingClientRect();
        x = e.clientX - rect.left;
        y = e.clientY - rect.top;

        card.style.setProperty("--mouse-x", `${x}px`)
        card.style.setProperty("--mouse-y", `${y}px`)

    }
})