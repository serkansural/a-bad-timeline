'use strict';


const placeholderLines = document.querySelector('.timeline-wrapper .markers-placeholder');

for (let i = 0; i < 24; ++i) {
    const parentEl = document.createElement('DIV');
    const hourEl = document.createElement('DIV');
    const lineEl = document.createElement('hr');
    hourEl.innerText = i < 10 ? `0${i}:00` : `${i}:00`;
    parentEl.classList.add("hour-marker");
    hourEl.classList.add('hour');
    parentEl.appendChild(hourEl);
    parentEl.appendChild(lineEl);
    placeholderLines.appendChild(parentEl);
}


document.addEventListener('pointermove', function(event) {
    const elements = document.elementsFromPoint(event.clientX, event.clientY);
    elements.forEach(function(e, i) {
        if (e.classList.contains('day-column')) {
            console.log(e.dataset.day);
        }
    });
});