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
    internal: false,
    card: null,
    dayColumn: null,
    hourMarker: null,
    hour: null,
    minute: null,
    offsetY: 0,
    isHeld: false,
};

document.addEventListener('pointerdown', function(event) {
    pointerState.isHeld = true;
    if (event.target.classList.contains('card')) {
        if (event.target.parentNode !== null && event.target.parentNode.classList.contains('card-list')) {
            pointerState.card = event.target.cloneNode(true);
        } else {
            pointerState.card = event.target;
            pointerState.internal = true;
            const rect = event.target.getBoundingClientRect();
            pointerState.offsetY = event.clientY - rect.top;
        }
    }
});

document.addEventListener('pointerup', function(event) {
    pointerState.isHeld = false;
    if (pointerState.card === null || pointerState.dayColumn === null) {
        return;
    }
    handleCardTransform(pointerState.card);
    pointerState.dayColumn.appendChild(pointerState.card);
    Object.keys(pointerState).forEach(function(e, i) {
        pointerState[e] = null; //clear old state
    });
});

document.addEventListener('pointermove', function(event) {
    if (pointerState.card === null || !pointerState.isHeld) {
        return;
    }
    const data = calculateTimeFromPoint(event.clientX, event.clientY - pointerState.offsetY);
    if (data === null) return;
    if (pointerState.internal === true) {
        handleCardTransform(pointerState.card);
    }
    Object.assign(pointerState, data);
});

function handleCardTransform(card) {
    pointerState.card.dataset.hour = pointerState.hour;
    pointerState.card.dataset.minute = pointerState.minute;
    const length = parseFloat(card.dataset.timeLength);
    const hour = card.dataset.hour;
    const minute = card.dataset.minute;
    const top = (parseInt(hour) * 60 + parseInt(minute)) / (24 * 60) * 100;
    card.style.top = `${top}%`;
    card.style.height = `${length / 24 * 100}%`;
}

function calculateTimeFromPoint(x, y) {
    console.log(pointerState.offsetY);
    const elements = document.elementsFromPoint(x, y);
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
    const yRat = (y - rect.y) / rect.height;
    let hour = parseInt(hourMarker.dataset.hour);
    let minute = ~~(yRat * 60);
    return {
        dayColumn: dayColumn,
        hourMarker: hourMarker,
        hour: hour,
        minute: minute
    };
}