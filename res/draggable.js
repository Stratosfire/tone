"use strict";

var card_pos1 = 0,
    card_pos2 = 0,
    card_pos3 = 0,
    card_pos4 = 0;

// https://www.w3schools.com/howto/howto_js_draggable.asp
// w3schools to the rescue yet again
// Make the DIV element draggable:
function dragElement(elmnt) {
    if (document.getElementById(elmnt.id).getElementsByClassName("titlebar")[0]) {
        // if present, the titlebar is where you move the DIV from:
        document.getElementById(elmnt.id).getElementsByClassName("titlebar")[0].onmousedown = dragMouseDown;
    } else {
        // otherwise, move the DIV from anywhere inside the DIV:
        elmnt.addEventListener("mousedown", dragMouseDown);
    }
}

function dragMouseDown(e) {
    e = e || window.event;
    e.preventDefault();
    // get the mouse cursor position at startup:
    card_pos3 = e.clientX;
    card_pos4 = e.clientY;
    document.onmouseup = closeDragElement;
    // call a function whenever the cursor moves:
    document.onmousemove = elementDrag;
}

function elementDrag(e) {
    e = e || window.event;
    e.preventDefault();
    // calculate the new cursor position:
    card_pos1 = card_pos3 - e.clientX;
    card_pos2 = card_pos4 - e.clientY;
    card_pos3 = e.clientX;
    card_pos4 = e.clientY;
    // set the element's new position:
    controlDiv.style.top = controlDiv.offsetTop - card_pos2 + "px";
    controlDiv.style.left = controlDiv.offsetLeft - card_pos1 + "px";
}

function closeDragElement() {
    // stop moving when mouse button is released:
    document.onmouseup = null;
    document.onmousemove = null;
}

function toggleFloatingControls() {
    if (controlDiv.classList.contains("floating")) {
        // make undraggable
        controlDiv.removeEventListener("mousedown", dragMouseDown);
        // reset position
        controlDiv.style.top = "unset";
        controlDiv.style.left = "unset";
    } else {
        // make draggable
        dragElement(controlDiv);
    }

    controlDiv.classList.toggle("floating");
}
