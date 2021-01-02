'use strict';


const placeholderLines = document.querySelector('.timeline-wrapper .markers-placeholder');
//populate hours 0-23
for (let i = 0; i < 24; ++i) {
    const parentEl = document.createElement('DIV');
    const hourEl = document.createElement('DIV');
    const lineEl = document.createElement('HR');
    hourEl.innerText = i < 10 ? `0${i}:00` : `${i}:00`;
    parentEl.classList.add("hour-marker");
    hourEl.classList.add('hour');
    parentEl.appendChild(hourEl);
    parentEl.appendChild(lineEl);
    placeholderLines.appendChild(parentEl);
    parentEl.dataset.hour = i;
}



const pointerState = {
    card: null,
    dayColumn: null,
    hourMarker: null,
    hour: null,
    minute: null,
};

document.addEventListener('pointerdown', function(event) {
    Object.keys(pointerState).forEach(function(e, i) {
        pointerState[e] = null; //clear old state
    });
    if (event.target.classList.contains('card') && event.target.parentNode !== null && event.target.parentNode.classList.contains('card-list')) {
        pointerState.card = event.target.cloneNode(true);
    }
});

document.addEventListener('pointerup', function(event) {
    let cancelAction = false;
    Object.values(pointerState).forEach(function(e, i) {
        if (e === null) cancelAction = true;
    });
    if (cancelAction) return;
    pointerState.card.dataset.hour = pointerState.hour;
    pointerState.card.dataset.minute = pointerState.minute;
    handleCardTransform(pointerState.card);
    pointerState.dayColumn.appendChild(pointerState.card);
});

document.addEventListener('pointermove', function(event) {

    const data = calculateTimeFromPoint(event.clientX, event.clientY);
    if (data === null) return;
    Object.assign(pointerState, data);
});

function handleCardTransform(card) {
    const hour = card.dataset.hour;
    const minute = card.dataset.minute;
    const top = (parseInt(hour) * 60 + parseInt(minute)) / (24 * 60) * 100;
    card.style.top = `${top}%`;
}

function calculateTimeFromPoint(x, y) {
    const elements = document.elementsFromPoint(event.clientX, event.clientY);
    let dayColumn = null;
    let hourMarker = null;
    elements.forEach(function(e, i) {
        if (e.classList.contains('day-column')) {
            dayColumn = e;
        } else if (e.classList.contains('hour-marker')) {
            hourMarker = e;
        }
    });

    if (dayColumn === null || hourMarker === null) {
        return null;
    }

    const rect = hourMarker.getBoundingClientRect();
    const yRat = (event.clientY - rect.y) / rect.height;
    let hour = parseInt(hourMarker.dataset.hour);
    let minute = ~~(yRat * 60);
    return {
        dayColumn: dayColumn,
        hourMarker: hourMarker,
        hour: hour,
        minute: minute
    };
}