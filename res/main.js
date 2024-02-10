"use strict";

function stepChange(steps, noReload) {
    // var theGrid = document.getElementById("theGrid")
    var stepSpinner = document.getElementById("stepSpinner");
    var currentTrack = getTheScore();
    var newGridHTML = [];

    stepCount = steps;
    currentTrack["steps"] = steps;

    newGridHTML.push("<table><thead>");
    newGridHTML.push("<th>&#9660;</th>".repeat(steps + 1));
    newGridHTML.push("</thead><tbody>");
    for (var i = 0; i < numberOfOctaves * 12; i++) {
        var rowHTML = [];
        rowHTML.push("<tr>");
        for (var j = 0; j < steps + 1; j++) {
            var cellHTML = "";
            if (!j) {
                var note = chromaticScale[12 - ((i % 12) + 1)];
                var octave = startOctave + numberOfOctaves - (1 + Math.floor(i / 12));
                cellHTML = `<td class='step_${j - 1}' data-note="${note}${octave}">${note}${octave}</td>`;
            } else {
                cellHTML = `<td class='step_${j - 1}'></td>`;
            }
            rowHTML.push(cellHTML);
        }
        rowHTML.push("</tr>");
        newGridHTML.push(rowHTML.join("\n"));
    }
    newGridHTML.push("</tbody></table>");
    theGrid.innerHTML = newGridHTML.join("\n");
    stepSpinner.value = steps;

    cycleNoteDuration(true);

    if (!noReload) {
        loadTrack(currentTrack, true);
    }
}

function stepDurationChange(duration) {
    stepDuration = duration;
    if (autoStepIntervalIdArray.length) {
        startAutoplay();
    }
}

function highlightStep(step) {
    currentStep = step;
    document.title = `Step ${step + 1}/${theGrid.rows[0].cells.length - 1}`;

    // unhighlight all steps
    // var colClass = document.querySelectorAll(".currentStep")
    var colClass = [...theGrid.getElementsByClassName("currentStep")];
    colClass.forEach((element) => {
        element.classList.remove("currentStep");
    });

    // highlight step
    // var colClass = document.querySelectorAll(`.step_${step}`)
    var colClass = [...theGrid.getElementsByClassName(`step_${step}`)];
    colClass.forEach((element) => {
        element.classList.add("currentStep");
    });
}

function advanceStep() {
    currentStep = (currentStep + 1) % stepCount;
    highlightStep(currentStep);
    var notes = getCurrentStepActiveCellNoteArray();
    var halfNotes = getCurrentStepActiveCellHalfNoteArray();
    var doubleNotes = getCurrentStepActiveCellDoubleNoteArray();
    playChordArray(notes);
    playHalfChordArray(halfNotes);
    playDoubleChordArray(doubleNotes);
}

function addOnclickToGridCells() {
    // var theGrid = document.getElementById("theGrid")
    for (var row = 1; row < theGrid.rows.length; row++) {
        for (var col = 1; col < theGrid.rows[row].cells.length; col++) {
            var cell = theGrid.rows[row].cells[col];
            cell.onclick = function () {
                if (this.classList.contains("activeCellHalf")) {
                    this.classList.remove("activeCellHalf", "activeCellHalf01", "activeCellHalf10", "activeCellHalf11");
                } else if (this.classList.contains("activeCellDouble")) {
                    this.classList.remove("activeCellDouble");
                } else {
                    this.classList.toggle("activeCell");
                    if (this.classList.contains("activeCell")) {
                        initAudioContext();
                        playNoteByName(this.parentElement.cells[0].innerText);
                    }
                }
            };
        }
    }
    // add event to headers
    for (var col = 0; col < theGrid.rows[0].cells.length; col++) {
        var cell = theGrid.rows[0].cells[col];
        cell.onclick = function () {
            highlightStep(Array.from(this.parentNode.children).indexOf(this) - 1);
        };
    }

    annotateCellsWithNoteName();
}

function addDoubleNoteOnclickToGridCells() {
    for (var row = 1; row < theGrid.rows.length; row++) {
        for (var col = 1; col < theGrid.rows[row].cells.length; col++) {
            var cell = theGrid.rows[row].cells[col];
            cell.onclick = function () {
                if (this.classList.contains("activeCellHalf")) {
                    this.classList.remove("activeCellHalf", "activeCellHalf01", "activeCellHalf10", "activeCellHalf11");
                } else if (this.classList.contains("activeCell")) {
                    this.classList.remove("activeCell");
                } else if (this.classList.contains("activeCellDouble")) {
                    this.classList.remove("activeCellDouble");
                } else {
                    this.classList.add("activeCellDouble");
                    initAudioContext();
                    playDoubleNoteByName(this.parentElement.cells[0].innerText);
                }
            };
        }
    }
    // add event to headers
    for (var col = 0; col < theGrid.rows[0].cells.length; col++) {
        var cell = theGrid.rows[0].cells[col];
        cell.onclick = function () {
            highlightStep(Array.from(this.parentNode.children).indexOf(this) - 1);
        };
    }
}

function addHalfNoteOnclickToGridCells() {
    for (var row = 1; row < theGrid.rows.length; row++) {
        for (var col = 1; col < theGrid.rows[row].cells.length; col++) {
            var cell = theGrid.rows[row].cells[col];
            cell.onclick = function () {
                if (this.classList.contains("activeCell")) {
                    this.classList.remove("activeCell");
                } else if (this.classList.contains("activeCellDouble")) {
                    this.classList.remove("activeCellDouble");
                } else if (this.classList.contains("activeCellHalf10")) {
                    this.classList.remove("activeCellHalf10");
                    this.classList.add("activeCellHalf01");
                    initAudioContext();
                    playHalfNoteByName(this.parentElement.cells[0].innerText, "10");
                } else if (this.classList.contains("activeCellHalf01")) {
                    this.classList.remove("activeCellHalf01");
                    this.classList.add("activeCellHalf11");
                    initAudioContext();
                    playHalfNoteByName(this.parentElement.cells[0].innerText, "11");
                } else if (this.classList.contains("activeCellHalf11")) {
                    this.classList.remove("activeCellHalf11", "activeCellHalf");
                    initAudioContext();
                } else {
                    this.classList.add("activeCellHalf10", "activeCellHalf");
                    initAudioContext();
                    playHalfNoteByName(this.parentElement.cells[0].innerText, "01");
                }
            };
        }
    }
    // add event to headers
    for (var col = 0; col < theGrid.rows[0].cells.length; col++) {
        var cell = theGrid.rows[0].cells[col];
        cell.onclick = function () {
            highlightStep(Array.from(this.parentNode.children).indexOf(this) - 1);
        };
    }
}

function removeAllNoteOnclickEvents() {
    for (var row = 1; row < theGrid.rows.length; row++) {
        for (var col = 1; col < theGrid.rows[row].cells.length; col++) {
            var cell = theGrid.rows[row].cells[col];
            cell.onclick = "";
        }
    }
    // add event to headers
    for (var col = 0; col < theGrid.rows[0].cells.length; col++) {
        var cell = theGrid.rows[0].cells[col];
        cell.onclick = "";
    }
}

function getCurrentStepActiveCellNoteArray() {
    // var noteElements = document.querySelectorAll(".activeCell.currentStep")
    var noteElements = [...theGrid.getElementsByClassName("currentStep")].filter((x) => x.classList.contains("activeCell"));
    var noteArray = [...noteElements].map(
        (x) =>
            // x.parentElement.firstElementChild.innerText
            x.parentElement.firstElementChild.innerHTML //  innerText is slower, apparently
    );
    return noteArray ? noteArray : [];
}

function getCurrentStepActiveCellDoubleNoteArray() {
    var noteElements = [...theGrid.getElementsByClassName("currentStep")].filter((x) => x.classList.contains("activeCellDouble"));
    var noteArray = [...noteElements].map((x) => x.parentElement.firstElementChild.innerHTML);
    return noteArray ? noteArray : [];
}

function getCurrentStepActiveCellHalfNoteArray() {
    var noteElements = [...theGrid.getElementsByClassName("currentStep")].filter((x) => x.classList.contains("activeCellHalf"));
    var noteArray = [...noteElements].map((x) => [
        x.parentElement.firstElementChild.innerHTML,
        x.classList.contains("activeCellHalf01")
            ? "01"
            : x.classList.contains("activeCellHalf10")
            ? "10"
            : x.classList.contains("activeCellHalf11")
            ? "11"
            : undefined,
    ]);
    return noteArray ? noteArray : [];
}

function playNoteByName(noteName) {
    `
        Plays a note given a name, e.g. A4 or C♯3
        Will let you get away with using # instead of ♯
        Assumes you have an audio context called audioCtx
        `;
    var noteFrequency = getFrequencyFromNoteName(noteName);

    // for reference
    // you can make a kickdrum with
    // oscillator.frequency.exponentialRampToValueAtTime(0.001, audioCtx.currentTime+0.5)

    var oscillator = audioCtx.createOscillator();
    oscillator.type = waveform ? waveform : "sine";
    oscillator.frequency.setValueAtTime(noteFrequency, audioCtx.currentTime); // value in hertz

    if (attackTime) {
        mainGainNode.gain.setValueAtTime(0, audioCtx.currentTime);
        mainGainNode.gain.linearRampToValueAtTime(1, attackTime);
    }

    if (releaseTime) {
        mainGainNode.gain.linearRampToValueAtTime(0, audioCtx.currentTime + (stepDuration - releaseTime));
    }

    oscillator.connect(mainGainNode);
    oscillator.start();
    oscillator.stop(audioCtx.currentTime + stepDuration);
}

function playDoubleNoteByName(noteName) {
    `
        Plays a note given a name, e.g. A4 or C♯3
        Will let you get away with using # instead of ♯
        Assumes you have an audio context called audioCtx
        `;
    var noteFrequency = getFrequencyFromNoteName(noteName);
    var oscillator = audioCtx.createOscillator();

    oscillator.type = waveform ? waveform : "sine";
    oscillator.frequency.setValueAtTime(noteFrequency, audioCtx.currentTime); // value in hertz
    oscillator.connect(mainGainNode);
    oscillator.start();
    oscillator.stop(audioCtx.currentTime + stepDuration * 2);
}

function playHalfNoteByName(noteName, pattern) {
    `
        Plays a note given a name, e.g. A4 or C♯3
        Will let you get away with using # instead of ♯
        Assumes you have an audio context called audioCtx
        `;
    var noteFrequency = getFrequencyFromNoteName(noteName);

    var oscillator = audioCtx.createOscillator();
    oscillator.type = waveform ? waveform : "sine";
    oscillator.frequency.setValueAtTime(noteFrequency, audioCtx.currentTime); // value in hertz
    oscillator.connect(mainGainNode);

    var oscillator2 = audioCtx.createOscillator();
    oscillator2.type = waveform ? waveform : "sine";
    oscillator2.frequency.setValueAtTime(noteFrequency, audioCtx.currentTime); // value in hertz
    oscillator2.connect(mainGainNode);

    if (pattern == "01") {
        oscillator.start(audioCtx.currentTime + stepDuration / 2);
        oscillator.stop(audioCtx.currentTime + stepDuration);
    } else if (pattern == "10") {
        oscillator.start();
        oscillator.stop(audioCtx.currentTime + stepDuration / 2);
    } else if (pattern == "11") {
        oscillator.start();
        oscillator.stop(audioCtx.currentTime + stepDuration / 2);
        oscillator2.start(audioCtx.currentTime + stepDuration / 2);
        oscillator2.stop(audioCtx.currentTime + stepDuration);
    } else {
        console.error("Invalid pattern provided to playHalfNoteByName()");
    }
}

function getFrequencyFromNoteName(noteName) {
    `
        Gets frequency in Hz for a note given a name, e.g. A4 or C♯3
        Will let you get away with using # instead of ♯
        Breaks above G#9 because of the assumption that the octave is always a single digit
        `;
    var note = noteName.slice(0, noteName.length - 1).replace("#", "♯");
    var octave = parseInt(noteName.slice(noteName.length - 1));
    var noteIdx = chromaticScale.indexOf(note);

    var noteValueRelativeToA4 = noteIdx + 12 * (octave - 4);
    var noteFrequency = 2 ** (noteValueRelativeToA4 / 12) * 440;

    return noteFrequency;
}

function playChordArray(chordArray) {
    if (!chordArray.length) {
        return;
    }
    // chordArray.map(x => setTimeout(playNoteByName, 0, x))
    chordArray.map((x) => playNoteByName(x));
}

function playHalfChordArray(chordArray) {
    if (!chordArray.length) {
        return;
    }
    // chordArray.map(x => setTimeout(playHalfNoteByName, 0, x[0], x[1]))
    chordArray.map((x) => playHalfNoteByName(x[0], x[1]));
}

function playDoubleChordArray(chordArray) {
    if (!chordArray.length) {
        return;
    }
    // chordArray.map(x => setTimeout(playDoubleNoteByName, 0, x))
    chordArray.map((x) => playDoubleNoteByName(x));
}

function getTheScore(asString) {
    var theScore = {};

    theScore["notes"] = [...theGrid.getElementsByClassName("activeCell")].map((x) => [
        x.parentElement.cells[0].innerText,
        Array.from(x.parentNode.children).indexOf(x) - 1,
    ]);

    theScore["doublenotes"] = [...theGrid.getElementsByClassName("activeCellDouble")].map((x) => [
        x.parentElement.cells[0].innerText,
        Array.from(x.parentNode.children).indexOf(x) - 1,
    ]);

    theScore["halfnotes"] = [...theGrid.getElementsByClassName("activeCellHalf")].map((x) => [
        x.parentElement.cells[0].innerText,
        Array.from(x.parentNode.children).indexOf(x) - 1,
        x.classList.contains("activeCellHalf01")
            ? "01"
            : x.classList.contains("activeCellHalf10")
            ? "10"
            : x.classList.contains("activeCellHalf11")
            ? "11"
            : undefined,
    ]);

    theScore["steps"] = stepCount;
    theScore["duration"] = stepDuration;
    theScore["waveform"] = waveform;
    theScore["octaves"] = numberOfOctaves;
    theScore["startOctave"] = startOctave;

    if (asString) {
        return JSON.stringify(theScore);
    } else {
        return theScore;
    }
}

function annotateCellsWithNoteName() {
    [...document.querySelectorAll("[data-note]")].forEach((x) =>
        [...x.parentElement.getElementsByTagName("td")].forEach((y) => (y.title = x.dataset.note))
    );
}

function loadTrack(trackData, noStepChange) {
    clearNotes();

    // load the data
    var notesArray = trackData["notes"];
    var doubleNotesArray = trackData["doublenotes"] ? trackData["doublenotes"] : [];
    var halfNotesArray = trackData["halfnotes"] ? trackData["halfnotes"] : [];
    var steps = trackData["steps"];
    var duration = trackData["duration"];
    var waveform = trackData["waveform"];
    var octaves = Object.keys(trackData).includes("octaves") ? trackData["octaves"] : 2;
    var octaveStart = Object.keys(trackData).includes("startOctave") ? trackData["startOctave"] : 3;
    var favicon = Object.keys(trackData).includes("favicon") ? trackData["favicon"] : false;
    var faviconAlpha = Object.keys(trackData).includes("faviconAlpha") ? trackData["faviconAlpha"] : false;

    if (!notesArray) {
        console.warn("No notes in trackData");
        return;
    }

    // octaves
    document.getElementById("octaveSpinner").value = octaves;
    document.getElementById("startOctaveSpinner").value = octaveStart;
    numberOfOctaves = octaves;
    startOctave = octaveStart;

    // steps
    document.getElementById("stepSpinner").value = steps;
    stepCount = steps;
    stepChange(steps, true);

    // notes
    for (var i = 0; i < notesArray.length; i++) {
        var note = notesArray[i][0];
        var step = notesArray[i][1];
        var rowElement = document.querySelector(`[data-note=${note}]`).parentElement;
        try {
            var cell = rowElement.cells[step + 1];
            cell.classList.add("activeCell");
        } catch {
            console.warn(`Cannot place ${note} at step ${step}, truncating score`);
        }
    }

    // double notes
    for (var i = 0; i < doubleNotesArray.length; i++) {
        var note = doubleNotesArray[i][0];
        var step = doubleNotesArray[i][1];
        var rowElement = document.querySelector(`[data-note=${note}]`).parentElement;
        try {
            var cell = rowElement.cells[step + 1];
            cell.classList.add("activeCellDouble");
        } catch {
            console.warn(`Cannot place doublenote ${note} at step ${step}, truncating score`);
        }
    }

    // half notes
    for (var i = 0; i < halfNotesArray.length; i++) {
        var note = halfNotesArray[i][0];
        var step = halfNotesArray[i][1];
        var halfNoteType = halfNotesArray[i][2];
        var rowElement = document.querySelector(`[data-note=${note}]`).parentElement;
        try {
            var cell = rowElement.cells[step + 1];
            cell.classList.add("activeCellHalf", `activeCellHalf${halfNoteType}`);
        } catch {
            console.warn(`Cannot place halfnote ${note} at step ${step}, truncating score`);
        }
    }

    // step duration
    document.getElementById("stepDurationSpinner").value = duration;
    stepDurationChange(duration);

    // waveform
    document.getElementById("waveformSelection").value = waveform;
    changeWaveform(waveform);

    // set favicon if present
    if (favicon) {
        setFavicon(favicon, faviconAlpha);
    } else {
        while (document.getElementById("favicon")) {
            document.getElementById("favicon").remove();
        }
        setFavicon(defaultFavicon, defaultFaviconAlpha);
    }
}

function initAudioContext() {
    if (!audioCtx) {
        audioCtx = new (window.AudioContext || window.webkitAudioContext)();
        mainGainNode = audioCtx.createGain();
        mainGainNode.connect(audioCtx.destination);
        mainGainNode.gain.value = volume;
    }
}

function clearNotes() {
    const classesToRemove = [
        "activeCell",
        "activeCellDouble",
        "activeCellHalf",
        "activeCellHalf01",
        "activeCellHalf10",
        "activeCellHalf11",
    ];
    for (var i = 0; i < classesToRemove.length; i++) {
        var tempClass = classesToRemove[i];
        document.querySelectorAll(`.${tempClass}`).forEach((element) => {
            element.classList.remove(tempClass);
        });
    }
}

function clearNotesIfSure() {
    if (confirm("Clear all notes?")) {
        clearNotes();
    }
}

function startAutoplay() {
    stopAutoplay();
    autoStepIntervalIdArray.push(setInterval(advanceStep, stepDuration * 1000));
}

function stopAutoplay() {
    while (autoStepIntervalIdArray.length) {
        clearInterval(autoStepIntervalIdArray.pop());
    }
}

function trackSelectorGenerator() {
    var outhtml =
        "<select onchange='highlightStep(-1); loadTrack(tracks[this.value])' id='trackSelection'><option disabled selected>Select a track</option>";
    var caArray = Object.keys(tracks).sort();

    for (var ca_idx in caArray) {
        outhtml += `<option value='${caArray[ca_idx]}'>${caArray[ca_idx]}</option>`;
    }
    outhtml += "</select>";
    document.getElementById("trackSelection").innerHTML = outhtml;
}

function doExport() {
    if (document.getElementById("exportDiv")) {
        document.getElementById("exportText").value = getTheScore(1);
    } else {
        createLoadExportCard();
        doExport();
    }
}

function download(filename, text) {
    var element = document.createElement("a");
    element.setAttribute("href", "data:text/plain;charset=utf-8," + encodeURIComponent(text));
    element.setAttribute("download", filename);

    element.style.display = "none";
    document.body.appendChild(element);

    element.click();

    document.body.removeChild(element);
}

function doLoad() {
    if (document.getElementById("exportDiv")) {
        loadTrack(JSON.parse(document.getElementById("exportText").value));
    } else {
        createLoadExportCard();
    }
}

function createLoadExportCard() {
    var node = document.createElement("div");
    node.id = "exportDiv";
    node.classList.add("card");
    var textareaNode = document.createElement("textarea");
    textareaNode.id = "exportText";
    textareaNode.placeholder = "Paste track data in here (or choose file) then click load again";
    node.appendChild(textareaNode);
    document.getElementById("controls").after(node);

    var loadExportButtonsDiv = document.createElement("div");
    loadExportButtonsDiv.id = "loadExportButtonsDiv";
    node.appendChild(loadExportButtonsDiv);

    var uploadButton = document.createElement("input");
    uploadButton.setAttribute("type", "file");
    uploadButton.id = "file";
    uploadButton.oninput = loadTrackFromJsonFile;
    uploadButton.classList.add("skeuButton");
    uploadButton.textContent = "Open file";
    loadExportButtonsDiv.appendChild(uploadButton);

    var button = document.createElement("button");
    button.onclick = function () {
        download("track.json", textareaNode.value);
    };
    button.classList.add("skeuButton");
    button.textContent = "Download";
    loadExportButtonsDiv.appendChild(button);
}

function changeWaveform(waveformSetting) {
    waveform = waveformSetting;
}

function reloadTrack() {
    loadTrack(getTheScore());
}

function octaveChange(octave) {
    numberOfOctaves = octave;
    reloadTrack();
}

function startOctaveChange(octave) {
    startOctave = octave;
    reloadTrack();
}

function hideCard(card) {
    card.parentElement.classList.toggle("card_hidden");
}

function insertColAtCurrentPos() {
    var currentScore = getTheScore();
    var newScore = currentScore;
    var currentScoreNotesArray = currentScore["notes"];
    var currentScoreHalfNotesArray = currentScore["halfnotes"];
    var currentScoreDoubleNotesArray = currentScore["doublenotes"];
    var newScoreNotesArray = [];
    var newScoreHalfNotesArray = [];
    var newScoreDoubleNotesArray = [];

    for (var i = 0; i < currentScoreNotesArray.length; i++) {
        var note = currentScoreNotesArray[i][0];
        var pos = currentScoreNotesArray[i][1];

        if (pos > currentStep) {
            pos++;
        }

        newScoreNotesArray.push([note, pos]);
    }

    for (var i = 0; i < currentScoreHalfNotesArray.length; i++) {
        var note = currentScoreHalfNotesArray[i][0];
        var pos = currentScoreHalfNotesArray[i][1];
        var dur = currentScoreHalfNotesArray[i][2];

        if (pos > currentStep) {
            pos++;
        }

        newScoreHalfNotesArray.push([note, pos, dur]);
    }

    for (var i = 0; i < currentScoreDoubleNotesArray.length; i++) {
        var note = currentScoreDoubleNotesArray[i][0];
        var pos = currentScoreDoubleNotesArray[i][1];

        if (pos > currentStep) {
            pos++;
        }

        newScoreDoubleNotesArray.push([note, pos]);
    }

    newScore["notes"] = newScoreNotesArray;
    newScore["halfnotes"] = newScoreHalfNotesArray;
    newScore["doublenotes"] = newScoreDoubleNotesArray;
    newScore["steps"] = newScore["steps"] + 1;

    loadTrack(newScore);
    highlightStep(currentStep);
}

function deleteColAtCurrentPos() {
    var currentScore = getTheScore();
    var newScore = currentScore;
    var currentScoreNotesArray = currentScore["notes"];
    var currentScoreHalfNotesArray = currentScore["halfnotes"];
    var currentScoreDoubleNotesArray = currentScore["doublenotes"];
    var newScoreNotesArray = [];
    var newScoreHalfNotesArray = [];
    var newScoreDoubleNotesArray = [];

    if (currentStep == -1) {
        return;
    }

    for (var i = 0; i < currentScoreNotesArray.length; i++) {
        var note = currentScoreNotesArray[i][0];
        var pos = currentScoreNotesArray[i][1];

        if (pos == currentStep) {
            continue;
        }

        if (pos > currentStep) {
            pos--;
        }

        newScoreNotesArray.push([note, pos]);
    }

    for (var i = 0; i < currentScoreHalfNotesArray.length; i++) {
        var note = currentScoreHalfNotesArray[i][0];
        var pos = currentScoreHalfNotesArray[i][1];
        var dur = currentScoreHalfNotesArray[i][2];

        if (pos == currentStep) {
            continue;
        }

        if (pos > currentStep) {
            pos--;
        }

        newScoreHalfNotesArray.push([note, pos, dur]);
    }

    for (var i = 0; i < currentScoreDoubleNotesArray.length; i++) {
        var note = currentScoreDoubleNotesArray[i][0];
        var pos = currentScoreDoubleNotesArray[i][1];

        if (pos == currentStep) {
            continue;
        }

        if (pos > currentStep) {
            pos--;
        }

        newScoreDoubleNotesArray.push([note, pos]);
    }

    newScore["notes"] = newScoreNotesArray;
    newScore["halfnotes"] = newScoreHalfNotesArray;
    newScore["doublenotes"] = newScoreDoubleNotesArray;
    newScore["steps"] = newScore["steps"] - 1;

    if (currentStep >= newScore["steps"]) {
        currentStep--;
    }

    loadTrack(newScore);
    highlightStep(currentStep);
}

function doBarShading(barLength) {
    var rule = `
            #theGrid td:nth-child(${barLength}n + 1){
                border-right: 1px solid royalblue !important;
            }
        `;
    if (!document.getElementById("barshadestyle")) {
        var ruleElm = document.createElement("style");
        ruleElm.id = "barshadestyle";
        document.body.append(ruleElm);
    } else {
        var ruleElm = document.getElementById("barshadestyle");
    }

    ruleElm.innerText = rule;
}

// stackoverflow saves the day again
function b64DecodeUnicode(str) {
    // Going backwards: from bytestream, to percent-encoding, to original string.
    return decodeURIComponent(
        atob(str)
            .split("")
            .map(function (c) {
                return "%" + ("00" + c.charCodeAt(0).toString(16)).slice(-2);
            })
            .join("")
    );
}

function loadTrackFromJsonFile() {
    if (document.querySelector("#file").value == "") {
        document.getElementById("exportText").value = "No file selected";
        return;
    }

    var file = document.querySelector("#file").files[0];

    var reader = new FileReader();
    reader.onload = function (e) {
        // document.getElementById("exportText").value = (e.target.result);
        document.getElementById("exportText").value = b64DecodeUnicode(e.target.result.split(",")[1]);
    };
    reader.onerror = function (e) {
        document.getElementById("exportText").value = "Error reading file";
    };
    reader.readAsDataURL(file);
}

function wideMode() {
    var controlsDiv = document.getElementById("controls");

    if (!isWideModeEnabled) {
        controlsDiv.style.justifyContent = "space-evenly";
        controlsDiv.style.flexDirection = "row";
        controlsDiv.style.alignItems = "center";
        document.body.style.maxWidth = "calc(100vw - 30px)";
        [...document.getElementsByClassName("tc_categorySection")].forEach(x => x.style.gridColumn = "1 / span 4")
        window.history.replaceState(null, null, "?wide=1");
        isWideModeEnabled = 1;
    } else {
        controlsDiv.style.justifyContent = "unset";
        controlsDiv.style.flexDirection = "column";
        controlsDiv.style.alignItems = "center";
        document.body.style.maxWidth = "500px";
        [...document.getElementsByClassName("tc_categorySection")].forEach(x => x.style.gridColumn = "1 / span 2")
        window.history.replaceState(null, null, "?wide=0");
        isWideModeEnabled = 0;
    }
}

function doubleSpace(doubleDouble) {
    var score = getTheScore();

    score["duration"] = score["duration"] / 2;
    score["steps"] = score["steps"] * 2;
    score["notes"] = score["notes"].map((x) => [x[0], x[1] * 2]);

    if (score["doublenotes"]) {
        score["doublenotes"] = score["doublenotes"].map((x) => [x[0], x[1] * 2]);
    }

    if (score["halfnotes"]) {
        score["halfnotes"] = score["halfnotes"].map((x) => [x[0], x[1] * 2, x[2]]);
    }

    if (doubleDouble) {
        score["notes"] = score["notes"].concat(score["notes"].map((x) => [x[0], x[1] + 1]));
        if (score["doublenotes"]) {
            score["doublenotes"] = score["doublenotes"].concat(score["doublenotes"].map((x) => [x[0], x[1] + 1]));
        }
        if (score["halfnotes"]) {
            score["halfnotes"] = score["halfnotes"].concat(score["halfnotes"].map((x) => [x[0], x[1] + 1, x[2]]));
        }
    }

    loadTrack(score);
}

function setAttack(inputAttack) {
    attackTime = inputAttack * stepDuration;
}

function setRelease(inputRelease) {
    releaseTime = inputRelease * stepDuration;
}

function cycleNoteDuration(refreshCurrentOnly) {
    var switcherElm = document.getElementById("noteDurationSwitcher");
    var noteDurationArray = ["single", "double", "half"];
    var noteFunctionObj = {
        single: addOnclickToGridCells,
        double: addDoubleNoteOnclickToGridCells,
        half: addHalfNoteOnclickToGridCells,
    };
    var currentIdx = noteDurationArray.indexOf(notePickerDuration);
    var nextIdx = refreshCurrentOnly ? currentIdx : (currentIdx + 1) % noteDurationArray.length;
    var nextDuration = noteDurationArray[nextIdx];

    notePickerDuration = nextDuration;
    switcherElm.classList.remove(noteDurationArray[currentIdx]);
    switcherElm.classList.add(nextDuration);

    removeAllNoteOnclickEvents();

    var noteFunction = noteFunctionObj[nextDuration];
    noteFunction();
}

function mod(n, m) {
    return ((n % m) + m) % m;
}

function transposeNote(inputNote, semitones) {
    var note = inputNote.slice(0, inputNote.length - 1); // won't work at A10, but you don't need that so go away
    var octave = parseInt(inputNote.slice(inputNote.length - 1));

    var returnNote = chromaticScale[mod(chromaticScale.indexOf(note) + semitones, chromaticScale.length)];
    var returnOctave = Math.floor((octave * 12 + (chromaticScale.indexOf(note) + semitones)) / 12);

    return `${returnNote}${returnOctave}`;
}

function transposeScore(semitones) {
    var returnScore = getTheScore();

    // return early if there aren't any notes
    if (!(returnScore["notes"].length + returnScore["halfnotes"].length + returnScore["doublenotes"].length)) {
        console.warn("Nothing to transpose");
        return;
    }

    // transpose the notes
    returnScore["notes"] = returnScore["notes"].map((x) => [transposeNote(x[0], semitones), x[1]]);
    returnScore["halfnotes"] = returnScore["halfnotes"].map((x) => [transposeNote(x[0], semitones), x[1], x[2]]);
    returnScore["doublenotes"] = returnScore["doublenotes"].map((x) => [transposeNote(x[0], semitones), x[1]]);

    // fix the octave start and number
    var allOctavesArray = [
        returnScore["notes"].map((x) => parseInt(x[0].slice(x[0].length - 1))),
        returnScore["halfnotes"].map((x) => parseInt(x[0].slice(x[0].length - 1))),
        returnScore["doublenotes"].map((x) => parseInt(x[0].slice(x[0].length - 1))),
    ].flat();

    var minOctave = Math.min(...allOctavesArray);
    var maxOctave = Math.max(...allOctavesArray);

    returnScore["startOctave"] = minOctave;
    returnScore["octaves"] = Math.max(1 + maxOctave - minOctave, 2);

    if (maxOctave > 8 || minOctave < 1) {
        console.error(`Cannot transpose any ${semitones > 0 ? "higher" : "lower"}`);
        return;
    }

    console.log(returnScore);

    loadTrack(returnScore);
}

function noteToMidiNumber(inputNote) {
    var octave = parseInt(inputNote.slice(inputNote.length - 1));
    var note = inputNote.slice(0, inputNote.length - 1);

    return 12 * octave + chromaticScale.indexOf(note) + 21;
}

function flipScore() {
    var returnScore = getTheScore();
    var axis = 69; // midi A4

    // flip the notes
    returnScore["notes"] = returnScore["notes"].map((x) => [transposeNote(x[0], 2 * (axis - noteToMidiNumber(x[0]))), x[1]]);
    returnScore["halfnotes"] = returnScore["halfnotes"].map((x) => [
        transposeNote(x[0], 2 * (axis - noteToMidiNumber(x[0]))),
        x[1],
        x[2],
    ]);
    returnScore["doublenotes"] = returnScore["doublenotes"].map((x) => [
        transposeNote(x[0], 2 * (axis - noteToMidiNumber(x[0]))),
        x[1],
    ]);

    // fix the octave start and number
    var allOctavesArray = [
        returnScore["notes"].map((x) => parseInt(x[0].slice(x[0].length - 1))),
        returnScore["halfnotes"].map((x) => parseInt(x[0].slice(x[0].length - 1))),
        returnScore["doublenotes"].map((x) => parseInt(x[0].slice(x[0].length - 1))),
    ].flat();

    if (!allOctavesArray.length) {
        console.log("Nothing to flip");
        return;
    }

    var minOctave = Math.min(...allOctavesArray);
    var maxOctave = Math.max(...allOctavesArray);

    returnScore["startOctave"] = minOctave;
    returnScore["octaves"] = Math.max(1 + maxOctave - minOctave, 2);

    loadTrack(returnScore);
}

function read_url_params_and_apply() {
    var url_string = window.location.href;
    var url = new URL(url_string);
    try {
        var wide = parseInt(url.searchParams.get("wide"));
        if (wide) {
            wideMode();
        }
        var nowarn = parseInt(url.searchParams.get("nowarn"));
        if (nowarn) {
            doWarn = false;
        }
        var darkmode = parseInt(url.searchParams.get("darkmode"));
        if (darkmode) {
            toggleDarkMode();
        }
    } catch {
        console.warn("Not impressed with your invalid URL parameters");
    }
}

function enableMarkerMode() {
    document.getElementById("markerModeOnBtn").classList.add("activeBtn");
    document.getElementById("markerModeOffBtn").classList.remove("activeBtn");

    // add event to headers
    for (var col = 0; col < theGrid.rows[0].cells.length; col++) {
        var cell = theGrid.rows[0].cells[col];
        cell.onclick = function () {
            if (markerArray.length == 2) {
                markerArray.shift().classList.remove("marker");
                markerArray.shift().classList.remove("marker");

                // unhighlight any marked cells
                var colClass = [...theGrid.getElementsByClassName("marked")];
                colClass.forEach((element) => {
                    element.classList.remove("marked");
                });

                return;
            }
            this.classList.add("marker");
            markerArray.push(this);

            if (markerArray.length == 2) {
                var idx0 = Array.from(markerArray[0].parentNode.children).indexOf(markerArray[0]) - 1;
                var idx1 = Array.from(markerArray[1].parentNode.children).indexOf(markerArray[1]) - 1;

                for (var i = Math.min(idx0, idx1); i <= Math.max(idx0, idx1); i++) {
                    // highlight marked cells
                    var colClass = [...theGrid.getElementsByClassName(`step_${i}`)];
                    colClass.forEach((element) => {
                        element.classList.add("marked");
                    });
                }
            }
        };
    }
}

function disableMarkerMode() {
    loadTrack(getTheScore());
    highlightStep(currentStep);
    markerArray = [];
    document.getElementById("markerModeOnBtn").classList.remove("activeBtn");
    document.getElementById("markerModeOffBtn").classList.add("activeBtn");
}

function copyMarkedCells() {
    if (markerArray.length == 2) {
        var idx0 = Array.from(markerArray[0].parentNode.children).indexOf(markerArray[0]) - 1;
        var idx1 = Array.from(markerArray[1].parentNode.children).indexOf(markerArray[1]) - 1;
        var leftMostIdx = Math.min(idx0, idx1);
        var rightMostIdx = Math.max(idx0, idx1);
        var tempScore = getTheScore();

        // filter to notes in the highlighted region
        tempScore["notes"] = tempScore["notes"].filter((x) => x[1] >= leftMostIdx && x[1] <= rightMostIdx);
        tempScore["halfnotes"] = tempScore["halfnotes"].filter((x) => x[1] >= leftMostIdx && x[1] <= rightMostIdx);
        tempScore["doublenotes"] = tempScore["doublenotes"].filter((x) => x[1] >= leftMostIdx && x[1] <= rightMostIdx);

        // subtract the leftMostIdx from all note positions
        tempScore["notes"] = tempScore["notes"].map((x) => [x[0], 1 + x[1] - leftMostIdx]);
        tempScore["halfnotes"] = tempScore["halfnotes"].map((x) => [x[0], 1 + x[1] - leftMostIdx, x[2]]);
        tempScore["doublenotes"] = tempScore["doublenotes"].map((x) => [x[0], 1 + x[1] - leftMostIdx]);

        copiedNotesObj = {
            notes: tempScore["notes"],
            halfnotes: tempScore["halfnotes"],
            doublenotes: tempScore["doublenotes"],
            length: rightMostIdx - leftMostIdx,
        };

        disableMarkerMode();
        return;
    } else {
        console.error("No highlighted region to copy");
        disableMarkerMode();
        return 1;
    }
}

function pasteMarkedCells() {
    if (!copiedNotesObj) {
        console.error("No copied region to paste");
        return 1;
    }

    disableMarkerMode();

    // insert placeholder for the new notes
    for (var i = 0; i < copiedNotesObj.length + 1; i++) {
        insertColAtCurrentPos();
    }

    var newScore = getTheScore();

    // add new notes into the placeholder
    // offsetting the new notes by currentStep
    newScore["notes"].push(...copiedNotesObj["notes"].map((x) => [x[0], x[1] + currentStep]));
    newScore["halfnotes"].push(...copiedNotesObj["halfnotes"].map((x) => [x[0], x[1] + currentStep, x[2]]));
    newScore["doublenotes"].push(...copiedNotesObj["doublenotes"].map((x) => [x[0], x[1] + currentStep]));

    loadTrack(newScore);
    highlightStep(currentStep);
}

function keyHandler(e) {
    function mod(n, m) {
        return ((n % m) + m) % m;
    }

    // don't do anything special if Meta (for macOS) or Ctrl (everyone else)
    // is held - this way we don't break copy/paste by running preventDefault
    // on the c and v keys
    if (e.getModifierState("Meta") || e.getModifierState("Control")) {
        return;
    }

    // don't do anything special if any input elements have focus
    if (["INPUT", "TEXTAREA", "SELECT"].includes(document.activeElement.tagName)) {
        return;
    }

    switch (e.key) {
        case "ArrowRight":
            e.preventDefault();
            currentStep = (currentStep + 1) % stepCount;
            highlightStep(currentStep);
            break;
        case "ArrowLeft":
            e.preventDefault();
            currentStep = mod(currentStep - 1, stepCount);
            highlightStep(currentStep);
            break;
        case " ":
            e.preventDefault();
            initAudioContext();
            if (autoStepIntervalIdArray.length) {
                stopAutoplay();
                modalToast("Stop", 300);
            } else {
                startAutoplay();
                modalToast("Play", 300);
            }
            break;
        case "Tab":
            e.preventDefault();
            cycleNoteDuration();
            break;
        case "m":
            e.preventDefault();
            toggleMarkSection();
            break;
        case "c":
            e.preventDefault();
            modalToast(copyMarkedCells() ? "No region selected" : "Copy", 300);
            break;
        case "v":
            e.preventDefault();
            modalToast(pasteMarkedCells() ? "Clipboard is empty" : "Paste", 300);
            break;
        case "n":
            e.preventDefault();
            stepChange(parseInt(document.getElementById("stepSpinner").value) + 1);
            break;
        case "w":
            e.preventDefault();
            wideMode();
            modalToast(isWideModeEnabled ? "Wide mode on" : "Wide mode off");
            break;
        case "i":
            e.preventDefault();
            insertColAtCurrentPos();
            break;
        case "<":
            e.preventDefault();
            highlightStep(-1);
            modalToast("Jump to start");
            break;
        case "Backspace":
            e.preventDefault();
            deleteColAtCurrentPos();
            break;
        case "d":
            e.preventDefault();
            if (inhibitDarkModeToggle) {
                modalToast("Slow down!");
                break;
            }
            modalToast(`Darkmode ${toggleDarkMode() ? "enabled" : "disabled"}`);
            inhibitDarkModeToggle = true;
            setTimeout(function () {
                inhibitDarkModeToggle = false;
            }, 400);
            break;
        default:
            console.log(e.key);
    }
}

function modalToast(inputMsg, timeoutMs) {
    var toastElm = document.createElement("div");
    timeoutMs = timeoutMs ? timeoutMs : 500;

    toastElm.innerHTML = inputMsg;
    toastElm.id = "toastModal";
    toastElm.style.transition = `opacity ${timeoutMs / 1000}s`;
    document.body.appendChild(toastElm);

    setTimeout((x) => x.classList.add("invisible"), timeoutMs, toastElm);
    setTimeout((x) => x.remove(), timeoutMs * 2, toastElm);
}

function toggleMarkSection() {
    var isMarkSectionOn = document.getElementById("markerModeOnBtn").classList.contains("activeBtn");

    if (isMarkSectionOn) {
        disableMarkerMode();
        modalToast("Section marking off");
    } else {
        enableMarkerMode();
        modalToast("Section marking on");
    }
}

function takeSnapshot() {
    // don't take snapshots while playing
    if (autoStepIntervalIdArray.length) {
        return;
    }

    modalToast("Saving...");

    const nowTime = new Date();

    var snapshotRadio = document.createElement("input");
    var snapshotRadioLabel = document.createElement("label"); // absolute time
    var snapshotRadioLabelRelative = document.createElement("span"); // relative time
    snapshotRadio.setAttribute("type", "radio");
    snapshotRadio.setAttribute("name", "snapshot");
    snapshotRadio.setAttribute("value", nowTime.getTime());
    snapshotRadio.onclick = function () {
        download(
            `snapshot_${nowTime.toISOString().replaceAll(":", "")}.json`,
            JSON.stringify(snapshotArray.filter((x) => x[0] == nowTime)[0][1])
        );
    };
    snapshotRadioLabel.setAttribute("for", nowTime.getTime());
    snapshotRadioLabel.innerHTML = nowTime.toLocaleTimeString();
    snapshotRadioLabelRelative.classList.add("snapshotRelativeTime");

    snapshotRadioLabel.appendChild(snapshotRadioLabelRelative);

    snapshotArray.push([nowTime, getTheScore(), [snapshotRadio, snapshotRadioLabel, snapshotRadioLabelRelative]]);

    if (snapshotArray.length > snapshotArrayMax) {
        snapshotArray.shift()[2].map((x) => x.remove());
    }

    const snapshotsDiv = document.getElementById("snapshots");
    snapshotsDiv.appendChild(snapshotRadio);
    snapshotsDiv.appendChild(snapshotRadioLabel);

    // update minutes ago
    snapshotArray.forEach((x) => (x[2][2].innerHTML = `${Math.round((nowTime - x[0]) / 1000 / 60)} minute(s) ago`));
}

function toggleDarkMode() {
    var darkmodeElm = document.getElementById("darkmodeCSS");

    if (darkmodeElm) {
        darkmodeElm.remove();
        window.history.replaceState(null, null, "?darkmode=0");
        return 0;
    } else {
        darkmodeElm = document.createElement("link");
        darkmodeElm.setAttribute("rel", "stylesheet");
        darkmodeElm.setAttribute("href", "res/main_laserwave.css");
        darkmodeElm.id = "darkmodeCSS";
        document.body.appendChild(darkmodeElm);
        window.history.replaceState(null, null, "?darkmode=1");
        return 1;
    }
}

function hexToRGB(inputHex) {
    var rawHex = inputHex.replace("#", "");
    var red = parseInt(rawHex.slice(0, 2), 16);
    var green = parseInt(rawHex.slice(2, 4), 16);
    var blue = parseInt(rawHex.slice(4, 6), 16);

    return [red, green, blue];
}

function setFavicon(patternUrl, alphaUrl) {
    `
    Takes an ashe.org.uk/grid URL as input
    Optional alpha channel in the same format
    `;

    const dataURL = gridUrlToDataUrl(patternUrl, alphaUrl);

    // set as favicon
    var favicon = document.createElement("link");
    favicon.setAttribute("rel", "icon");
    favicon.setAttribute("href", dataURL);
    favicon.id = "favicon";
    while (document.getElementById("favicon")) {
        document.getElementById("favicon").remove();
    }
    document.body.appendChild(favicon);
}

function gridUrlToDataUrl(patternUrl, alphaUrl) {
    `
    Takes an ashe.org.uk/grid URL as input
    Optional alpha channel in the same format
    `;
    // parse URLs
    const params = new URLSearchParams(new URL(patternUrl).searchParams);
    const paramsAlpha = alphaUrl ? new URLSearchParams(new URL(alphaUrl).searchParams) : false;
    var width = params.has("width") ? parseInt(params.get("width")) : 8;
    var height = params.has("height") ? parseInt(params.get("height")) : 8;
    var primaryCol = params.has("primary") ? hexToRGB(params.get("primary")) : [255, 255, 255];
    var secondaryCol = params.has("secondary") ? hexToRGB(params.get("secondary")) : [0, 0, 0];

    // init canvas
    canvas.width = width;
    canvas.height = height;

    // create ImageData object
    var imgData = ctx.createImageData(width, height);

    // prepare alpha channel
    // if not given, set alpha to 255 for all pixels
    var alphaArray = paramsAlpha
        ? paramsAlpha
              .get("pattern")
              .split("")
              .map((x) => (parseInt(x) ? 255 : 0))
        : Array(width * height).fill(255);

    // write pixels to object
    imgData.data.set(
        params
            .get("pattern")
            .split("")
            .map((x, i) => (parseInt(x) ? [...secondaryCol, alphaArray[i]] : [...primaryCol, alphaArray[i]]))
            .flat()
    );

    // push pixels to canvas
    ctx.putImageData(imgData, 0, 0);

    // convert canvas data to dataURL
    const dataURL = canvas.toDataURL("image/png");

    return dataURL;
}

function initFancyTrackSelection() {
    var fancyData = [];
    var metadataFields = new Set();
    var categories = new Set();

    // sort tracks by tracknames
    tracks = Object.keys(tracks)
        .sort()
        .reduce((obj, key) => {
            obj[key] = tracks[key];
            return obj;
        }, {});

    // add calculated metadata fields
    for (var t in tracks) {
        var data = tracks[t];

        // init metadata if needs be
        if (!Object.keys(data).includes("metadata")) {
            data["metadata"] = { category: "uncategorised" };
        }

        // noteCount
        var noteCount = data["notes"].length;
        if (Object.keys(data).includes("doublenotes")) {
            noteCount + data["doublenotes"].length;
        }
        if (Object.keys(data).includes("halfnotes")) {
            noteCount + data["halfnotes"].length;
        }

        data.metadata.noteCount = noteCount;

        // bpm
        var bpm = Math.round(60 / data["duration"]);
        data.metadata.bpm = bpm;

        // actual duration
        var actualDuration = Math.round(data["duration"] * data["steps"]); // seconds
        actualDuration = actualDuration < 60 ? `${actualDuration}s` : secondsToMins(actualDuration);
        data.metadata.actualDuration = actualDuration;
    }

    // get all the metadata fields
    for (var t in tracks) {
        var data = tracks[t];
        if (Object.keys(data).includes("metadata")) {
            Object.keys(data["metadata"]).forEach((x) => metadataFields.add(x));
        }
    }

    metadataFields = ["faviconContainer", "trackTitle", ...Array.from(metadataFields)];
    // get all categories
    for (var t in tracks) {
        var data = tracks[t];
        if (Object.keys(data).includes("metadata")) {
            categories.add(data.metadata.category);
        }
    }

    // delete uncategorised and re-add it to the end of a sorted array
    categories.delete("uncategorised");
    categories = [...Array.from(categories).toSorted(), "uncategorised"];

    for (var t in tracks) {
        var data = tracks[t];
        var tempArray = [];

        // favicon (only set default alpha if we need to)
        var patternUrl = Object.keys(data).includes("favicon") ? data["favicon"] : defaultFavicon;
        var alphaUrl =
            Object.keys(data).includes("favicon") && Object.keys(data).includes("faviconAlpha")
                ? data["faviconAlpha"]
                : Object.keys(data).includes("favicon")
                ? undefined
                : defaultFaviconAlpha;
        var faviconDataUrl = gridUrlToDataUrl(patternUrl, alphaUrl);
        var faviconElm = document.createElement("img");
        faviconElm.src = faviconDataUrl;
        faviconElm.classList.add("trackIcon");
        tempArray.push(faviconElm.outerHTML);

        // track title
        tempArray.push(t);

        // metadata
        if (Object.keys(data).includes("metadata")) {
            for (var i = 2; i < metadataFields.length; i++) {
                var tempMeta = data["metadata"][metadataFields[i]];
                tempArray.push(tempMeta ? tempMeta : "");
            }
        } else {
            for (var i = 2; i < metadataFields.length; i++) {
                tempArray.push(metadataFields[i] == "category" ? "uncategorised" : "");
            }
        }

        fancyData.push(tempArray);
    }

    // put all the fancy data into a table
    var trackCardContainerElm = document.createElement("div");
    trackCardContainerElm.id = "trackCardContainer";

    var trackCardsByCategory = {};
    categories.forEach((x) => (trackCardsByCategory[x] = [])); // init

    for (var i = 0; i < fancyData.length; i++) {
        var trackCardElm = document.createElement("div");
        trackCardElm.classList.add("trackCard");
        trackCardElm.innerHTML = fancyData[i]
            .map((x, i) => [x, `<div class="tc_${metadataFields[i]}">${x}</div>`])
            .filter((x) => x[0].toString().length)
            .map((x) => x[1])
            .join("");
        trackCardElm.dataset["trackName"] = fancyData[i][1];
        trackCardElm.onclick = function () {
            playTrackByName(this.dataset.trackName);
        };
        trackCardsByCategory[fancyData[i][2]].push(trackCardElm);
    }

    for (var i = 0; i < categories.length; i++) {
        var sectionHeaderElm = document.createElement("div");
        sectionHeaderElm.classList.add("tc_categorySection");
        sectionHeaderElm.innerHTML = categories[i];
        trackCardContainerElm.appendChild(sectionHeaderElm);

        trackCardsByCategory[categories[i]].forEach((x) => trackCardContainerElm.appendChild(x));
    }

    // put the fancy table in a card and append
    var newCard = document.createElement("div");
    newCard.classList.add("card");
    newCard.appendChild(trackCardContainerElm);
    document.body.appendChild(newCard);
}

function secondsToMins(inputSeconds) {
    var minutes = Math.floor(inputSeconds / 60);
    var seconds = inputSeconds % 60;
    return `${minutes}m ${seconds}s`;
}

function playTrackByName(inputTrackName) {
    initAudioContext();
    highlightStep(-1);
    document.querySelectorAll("#trackSelection option").forEach((x) => (x.selected = x.value == inputTrackName));
    loadTrack(tracks[inputTrackName]);
    startAutoplay();
}
