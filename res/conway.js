"use strict";

// ridiculous conways game of life code that I wrote for https://ashe.org.uk/grid.html

// so currentState is an array of arrays because position matters
// nextState is just an array because position doesn't matter
function conwayNextStep(currentState) {
    var nextState = [];
    var gridWidth = currentState[0].length;
    var gridHeight = currentState.length;
    for (var y = 0; y < gridHeight; y++) {
        for (var x = 0; x < gridWidth; x++) {
            var neighbourCount = 0;
            var nswe_coords = {};
            var cellState = currentState[y][x];
            var nextCellState = 0;
            nswe_coords["north"] = [x, (((y - 1) % gridHeight) + gridHeight) % gridHeight];
            nswe_coords["south"] = [x, (y + 1) % gridHeight];
            nswe_coords["west"] = [(((x - 1) % gridWidth) + gridWidth) % gridWidth, y];
            nswe_coords["east"] = [(x + 1) % gridWidth, y];
            nswe_coords["nw"] = [nswe_coords["west"][0], nswe_coords["north"][1]];
            nswe_coords["ne"] = [nswe_coords["east"][0], nswe_coords["north"][1]];
            nswe_coords["sw"] = [nswe_coords["west"][0], nswe_coords["south"][1]];
            nswe_coords["se"] = [nswe_coords["east"][0], nswe_coords["south"][1]];
            for (var i in nswe_coords) {
                var [xCoord, yCoord] = nswe_coords[i];
                if (currentState[yCoord][xCoord]) {
                    neighbourCount += 1;
                }
            }
            if ((cellState && neighbourCount == 2) || (cellState && neighbourCount == 3)) {
                nextCellState = 1;
            } else if (!cellState && neighbourCount == 3) {
                nextCellState = 1;
            } else {
                nextCellState = 0;
            }
            nextState.push(nextCellState);
        }
    }
    return nextState;
}

function conwayCurrentState() {
    var currentState = [];
    var gridBody = document.querySelector("#theGrid tbody");
    for (var i = 0; i < gridBody.rows.length; i++) {
        var rowState = [];
        for (var j = 1; j < gridBody.rows[i].cells.length; j++) {
            rowState.push(gridBody.rows[i].cells[j].classList.contains("activeCell"));
        }
        currentState.push(rowState);
    }
    return currentState;
}

function doConwayNextStep() {
    var nextStepString = conwayNextStep(conwayCurrentState()).join("");
    setPattern(nextStepString);
}

function toggleConway(element) {
    if (!refreshIntervalId) {
        refreshIntervalId = setInterval(doConwayNextStep, conwayInterval);
        element.innerText = "Stop";
    } else {
        clearInterval(refreshIntervalId);
        refreshIntervalId = undefined;
        element.innerText = "Start";
    }
}

function restartConway() {
    if (refreshIntervalId) {
        clearInterval(refreshIntervalId);
        refreshIntervalId = undefined;
        refreshIntervalId = setInterval(doConwayNextStep, conwayInterval);
    }
}

function setPattern(patternString) {
    var gridCells = document.querySelectorAll("#theGrid tbody td:not(.step_-1)");

    for (var i = 0; i < gridCells.length; i++) {
        if (parseInt(patternString[i])) {
            gridCells[i].classList.add("activeCell");
        } else {
            gridCells[i].classList.remove("activeCell");
        }
    }
}
