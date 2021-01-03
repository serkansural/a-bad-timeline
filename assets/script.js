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
    newColumn: false,
    hourMarker: null,
    hour: null,
    minute: null,
    offsetY: 0,
    isHeld: false,
    resizing: false,
};

document.addEventListener('click', function(event) {
    if (event.target.classList.contains('remove')) {
        event.target.parentNode.remove();
    }
});

document.addEventListener('pointerdown', function(event) {
    pointerState.isHeld = true;
    if (event.target.classList.contains('card')) {
        if (event.target.parentNode !== null && event.target.parentNode.classList.contains('card-list')) {
            pointerState.card = event.target.cloneNode(true);
        } else {
            pointerState.card = event.target;
            const rect = event.target.getBoundingClientRect();
            pointerState.offsetY = event.clientY - rect.top;
        }
        pointerState.card.classList.add('active');
    } else if (event.target.classList.contains('resize')) {
        pointerState.resizing = true;
        pointerState.card = event.target.parentNode;
    }
});

document.addEventListener('pointerup', function(event) {

    pointerState.isHeld = false;
    pointerState.resizing = false;
    pointerState.offsetY = 0;
    if (pointerState.card !== null)
        pointerState.card.classList.remove('active');
    if (pointerState.card === null || pointerState.dayColumn === null) {
        return;
    }
    //fix overflow
    const rect = pointerState.card.getBoundingClientRect();
    const data = calculateTimeFromPoint(rect.left, rect.top);
    if (data !== null)
        Object.assign(pointerState, data);
    handleCardTransform(pointerState.card, false);
    updateCardText(pointerState.card);
    pointerState.card = null;
});


document.addEventListener('pointermove', function(event) {

    if (pointerState.card === null || !pointerState.isHeld) {
        return;
    }

    if (pointerState.resizing) {
        const time = parseFloat(pointerState.card.dataset.timeLength);
        const hour = parseFloat(pointerState.card.dataset.hour);
        const minute = parseFloat(pointerState.card.dataset.minute);
        let newTime = time + Math.sign(event.movementY) / 28;
        if (newTime * 60 + hour * 60 + minute >= 24 * 60) {

            return;
        }
        pointerState.card.dataset.timeLength = Math.max(newTime.toFixed(2), 1.5);
        handleCardTransform(pointerState.card, false);
        updateCardText(pointerState.card);
        return;
    }
    const data = calculateTimeFromPoint(event.clientX, event.clientY - pointerState.offsetY);
    if (data !== null) {
        Object.assign(pointerState, data);
    }
    updateCardText(pointerState.card);

    if (pointerState.newColumn) {
        const node = pointerState.card.cloneNode(true);
        pointerState.card.remove();
        pointerState.card = node;
        pointerState.dayColumn.appendChild(node);
    }
    handleCardTransform(pointerState.card);
});

function handleCardTransform(card, handlePos = true) {
    if (handlePos) {
        const mod = pointerState.minute % 5.01;
        pointerState.minute = ~~(pointerState.minute - mod); //stepping 5
        if (pointerState.minute === 60) {
            pointerState.minute = 0;
            pointerState.hour += 1;
        }
        pointerState.card.dataset.hour = pointerState.hour;
        pointerState.card.dataset.minute = pointerState.minute;
    }
    const length = parseFloat(card.dataset.timeLength);
    const asMinutes = pointerState.hour * 60 + pointerState.minute;
    if (length * 60 + asMinutes - 5 >= 24 * 60) {
        card.dataset.timeLength = (24 * 60 - length * 60) / 60;
        return;
    }
    if (handlePos) {
        const top = (asMinutes / (24 * 60) * 100).toFixed(1);
        card.style.top = `${top}%`;
    }
    card.style.height = `${length / 24 * 100}%`;
}


function calculateTimeFromPoint(x, y) {
    pointerState.newColumn = false;
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

    if (pointerState.dayColumn !== dayColumn) {
        pointerState.newColumn = true;
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

function updateCardText(card) {
    const info = card.querySelector('.info');
    const h = parseInt(card.dataset.hour);
    const m = parseInt(card.dataset.minute);
    const hour = h < 10 ? `0${card.dataset.hour}` : card.dataset.hour;
    const minute = m < 10 ? `0${card.dataset.minute}` : card.dataset.minute;
    const length = parseFloat(card.dataset.timeLength);
    let endHour = h + ~~length;
    let endMinute = m + ((length - ~~length) * 60);
    if (endMinute >= 60) {
        endMinute = endMinute - 60;
        endHour += 1;
    }
    const endHourStr = endHour < 10 ? `0${~~endHour}` : ~~endHour;
    const endMinuteStr = endMinute < 10 ? `0${~~endMinute}` : ~~endMinute;
    info.innerText = `starts at ${hour}:${minute}, ends at ${endHourStr}:${endMinuteStr}`;
}