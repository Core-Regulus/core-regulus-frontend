const daysTag = document.querySelector(".days"),
currentDate = document.querySelector(".current-date"),
prevNextIcon = document.querySelectorAll(".icons button")
console.log(prevNextIcon)

let date = new Date(),
    currYear = date.getFullYear(),
    currMonth = date.getMonth();

const months = ["January", "February", "March", "April", "May", "June", "July", "August", "September", "October", "November", "December"]

const renderCalendar = () =>{
    let firstDayOfMonth = new Date(currYear, currMonth, 1).getDay(),
        lastDateOfMonth = new Date(currYear, currMonth + 1,0).getDate(),
        lastDayOfMonth = new Date(currYear, currMonth, lastDateOfMonth).getDate(),
        lastDateOfLastMonth = new Date(currYear, currMonth, 0).getDate()
    let liTag = ""

    for(let i = firstDayOfMonth; i > 0; i--) {
        liTag += `<button class="inactive">${lastDateOfLastMonth - i + 1}</button>`;
    }

    for(let i = 1; i <= lastDateOfMonth; i++){
        let isToday = i === date.getDate() &&
              currMonth === new Date().getMonth() &&
              currYear === new Date().getFullYear()
              ? "active" : "";
        liTag += `<button class="${isToday}">${i}</buttton>`;
    }

    for(let i = lastDayOfMonth; i < 6; i++){
        liTag += `<button class="inactive">${i - lastDateOfMonth + 1}</button>`
    }
    currentDate.innerText = `${months[currMonth]} ${currYear}`;
    daysTag.innerHTML = liTag;

}

renderCalendar();

prevNextIcon.forEach(icon => {
    icon.addEventListener("click", () =>{
        currMonth = icon.id === "prev" ? currMonth - 1 :
        currMonth + 1;
        if(currMonth < 0 || currMonth > 11){
            date = new Date(currYear, currMonth, new Date().getDate());
            currYear = date.getFullYear();
            currMonth = date.getMonth();
        }
        else{
            date = new Date();

        }
        renderCalendar();
    })
})