/*
RUSH HOUR
Nicolas De Roover
r0702537
voor het vak Informaticawerktuigen binnen de Bachelor Informatica
Academiejaar 2022-2023
 */

/* CONSTANTEN EN GLOBALE VARIABELEN */
// HTML voor statische structuren op het spelbord
const WALL = "<td class='wall'></td>";
const WALL_ROW = "<tr>" + WALL.repeat(8) + "</tr>";
const EMPTY_SQUARE = "<td class='empty'></td>";
const EXIT_SQUARE = "<td id='exit'>EXIT</td>";

// CSS classes voor verschillende voertuigen
const VEHICLE_TYPES = { 1: "player",
                        2:   "npc1",
                        3:   "npc2",
                        4:   "npc3",
                        5:   "npc4",
                        6:   "npc5",
                        7:   "npc6",
                        8:   "npc7",
                        9:   "npc8",
                       10:   "npc9",
                       11:  "npc10",
                       12:  "npc11" };

// Levels met als key hun moeilijkheidsgraad
// INTERNAL REPRESENTATION:
//   2D-array
//   Unieke integer > 0 per voertuig per positie die opgenomen wordt door voertuig
//   0 per lege positie
const LEVELS = { "Beginner": [[0, 0, 0, 2, 0, 0],
                              [0, 0, 1, 2, 0, 3],
                              [0, 0, 1, 2, 4, 3],
                              [0, 0, 0, 0, 4, 0],
                              [0, 0, 0, 0, 0, 0],
                              [5, 5, 5, 0, 0, 0]],
                 "Intermediate": [[3, 3, 7, 9, 0, 0],
                                  [2, 2, 7, 9, 0, 0],
                                  [8, 1, 1, 9, 0, 0],
                                  [8, 4, 4, 4, 0, 0],
                                  [8, 5, 5, 0, 0, 0],
                                  [6, 6, 6, 0, 0, 0]],
                 "Advanced": [[0, 4, 0, 7,  7,  7],
                              [2, 4, 0, 8, 10,  0],
                              [2, 1, 1, 8, 10, 11],
                              [3, 5, 5, 5, 10, 11],
                              [3, 0, 6, 0,  0, 12],
                              [0, 0, 6, 9,  9, 12]],
                 "Expert": [[2, 0, 0,  6,  6,  6],
                            [2, 3, 3,  7,  0,  0],
                            [1, 1, 4,  7,  0, 11],
                            [0, 0, 4,  8,  8, 11],
                            [0, 0, 5,  9,  9, 11],
                            [0, 0, 5, 10, 10, 10]],
                 "Grandmaster": [[2, 2, 6, 0,  9,  9],
                                 [3, 3, 6, 0, 10,  0],
                                 [4, 0, 1, 1, 10,  0],
                                 [4, 7, 7, 7, 10, 11],
                                 [4, 0, 0, 8,  0, 11],
                                 [5, 5, 0, 8, 12, 12]] };

// Globaal object om gamestate bij te houden
let myGame = { board: [],
               time: 0,
               timerInterval: null,
               moves: 0,
               lastMovedVehicleID: 0,
               won: false };

/* ------------------------------------------------------------------------------------------------------------------ */
/* FUNCTIES OM GAME OP TE STARTEN / TE HERSTARTEN*/
window.onload = function() {
    populateLevelMenu();
    restartHandler();
}

function populateLevelMenu() {
    document.getElementById("level-menu").innerHTML = generateLevelMenuHtml();
}

// Wordt opgeroepen als speler een nieuw level kiest of op restart-knop klikt
function restartHandler() {
    resetTimer();
    resetMoveCounter();
    loadChosenLevel();
}

function loadChosenLevel() {
    let chosenLevel = document.getElementById("level-menu").value;
    myGame.board = JSON.parse(JSON.stringify(LEVELS[chosenLevel])); // Deep copy
    drawBoard(myGame.board);
}

// Input:
//   board: 2D-array van feitelijke spelbord
function drawBoard(board) {
    document.getElementById("board-container").innerHTML = generateBoardHtml(board);
}

/* ------------------------------------------------------------------------------------------------------------------ */
/* FUNCTIES OM HTML TE GENEREREN */

// Output:
//   levelMenuHtml: string met HTML voor <select> menu om level te kiezen, gegenereerd op basis van const LEVELS
function generateLevelMenuHtml() {
    let levelMenuHtml = ""
    for (const difficulty in LEVELS) {
        levelMenuHtml += `<option value="${difficulty}">${difficulty}</option>`;
    }
    return levelMenuHtml;
}

// Input:
//   board: 2D-array van feitelijke spelbord
function generateBoardHtml(board) {
    // Hou het aantal reeds gegenereerde vakjes per voertuig bij
    // om te weten welk soort vakje nog nodig is afhankelijk van lengte en oriëntatie
    let nSquaresGeneratedPerVehicle = {   1: 0,
                                          2: 0,
                                          3: 0,
                                          4: 0,
                                          5: 0,
                                          6: 0,
                                          7: 0,
                                          8: 0,
                                          9: 0,
                                         10: 0,
                                         11: 0,
                                         12: 0 }
    let playerOrientation = getVehicleOrientation(1, board);
    let playerRow, playerCol;
    [playerRow, playerCol] = getCoordsOfVehicle(1, board);
    let boardHtml = "<table>";

    boardHtml += WALL_ROW; // Bord bestaat uit feitelijke spelbord omringd door muren met één EXIT
    for (let i = 0; i < board.length; i++) { // Itereer over rijen
        boardHtml += "<tr>";
        boardHtml += WALL;
        for (let j = 0; j < board[0].length; j++) { // Itereer over kolommen
            let value = board[i][j]; // 0 of unieke integer per voertuig
            if (value === 0) {
                boardHtml += EMPTY_SQUARE;
            } else {
                boardHtml += generateVehicleHtml(value, nSquaresGeneratedPerVehicle[value], board);
                nSquaresGeneratedPerVehicle[value] += 1;
            }
        }
        if (playerOrientation === "horizontal" && i === playerRow) { // Bij horizontale speler EXIT naast rij genereren
            boardHtml += EXIT_SQUARE;
        } else {
            boardHtml += WALL;
        }
        boardHtml += "</tr>";
    }
    if (playerOrientation === "vertical") { // Bij verticale speler EXIT onder kolom genereren
        // Totale breedte van tabel == board[0].length + 2
        boardHtml += WALL.repeat(playerCol + 1) + EXIT_SQUARE + WALL.repeat(board[0].length - playerCol);
    } else {
        boardHtml += WALL_ROW;
    }
    boardHtml += "</table>";
    return boardHtml;
}

function generateVehicleHtml(vehicleID, nSquaresAlreadyGenerated, board) {
    let vehicleType = getVehicleType(vehicleID);
    let vehicleOrientation = getVehicleOrientation(vehicleID, board)
    let vehicleLength = getVehicleLength(vehicleID, board);
    if (nSquaresAlreadyGenerated === 0) {
        if (vehicleOrientation === "horizontal") {
            return `<td class="vehicle ${vehicleType} left" onclick="clickMoveVehicleHandler(${vehicleID}, 'left')">🠈</td>`;
        } else if (vehicleOrientation === "vertical") {
            return `<td class="vehicle ${vehicleType} up" onclick="clickMoveVehicleHandler(${vehicleID}, 'up')">🠉</td>`;
        }
    } else if (nSquaresAlreadyGenerated === vehicleLength-1) {
        if (vehicleOrientation === "horizontal") {
            return `<td class="vehicle ${vehicleType} right" onclick="clickMoveVehicleHandler(${vehicleID}, 'right')">🠊</td>`;
        } else if (vehicleOrientation === "vertical") {
            return `<td class="vehicle ${vehicleType} down" onclick="clickMoveVehicleHandler(${vehicleID}, 'down')">🠋</td>`;
        }
    } else {
        return `<td class="vehicle ${vehicleType}"></td>`;
    }
}

/* ------------------------------------------------------------------------------------------------------------------ */
/* FUNCTIES OM ALGEMENE GEGEVENS VAN EEN VOERTUIG TE BEPALEN */

function getVehicleType(vehicleID) {
    return VEHICLE_TYPES[vehicleID];
}

function getCoordsOfVehicle(vehicleID, board) {
    for (let i = 0; i < board.length; i++) {
        for (let j = 0; j < board[0].length; j++) {
            if (board[i][j] === vehicleID) {
                return [i, j];
            }
        }
    }
}

function getVehicleOrientation(vehicleID, board) {
    let inNRows = 0;
    for (let i = 0; i < board.length; i++) {
        if (board[i].includes(vehicleID) === true) {
            inNRows += 1;
            if (inNRows > 1) {
                return "vertical";
            }
        }
    }
    return "horizontal"
}

function getVehicleLength(vehicleID, board) {
    let vehicleLength = 0;
    for (let i = 0; i < board.length; i++) {
        for (let j = 0; j < board.length; j++) {
            if (board[i][j] === vehicleID) {
                vehicleLength += 1;
            }
        }
    }
    return vehicleLength
}

/* ------------------------------------------------------------------------------------------------------------------ */
/* FUNCTIES OM EEN VOERTUIG TE BEWEGEN */

function clickMoveVehicleHandler(vehicleID, direction) {
    if (myGame.won !== true) {
        moveVehicle(vehicleID, direction, myGame.board);
        drawBoard(myGame.board);
        myGame.won = checkForWin(myGame.board);
        if (myGame.won === true) {
            winHandler();
        }
    }
}

function moveVehicle(vehicleID, direction, board) {
    if (canMove(vehicleID, direction, board)) {
        let vehicleLength = getVehicleLength(vehicleID, board);
        let row, col;
        [row, col] = getCoordsOfVehicle(vehicleID, board);
        if (direction === "left") {
            board[row][col + vehicleLength - 1] = 0;
            board[row][col - 1] = vehicleID;
        } else if (direction === "right") {
            board[row][col] = 0;
            board[row][col + vehicleLength] = vehicleID;
        } else if (direction === "up") {
            board[row + vehicleLength - 1][col] = 0;
            board[row - 1][col] = vehicleID;
        } else if (direction === "down") {
            board[row][col] = 0;
            board[row + vehicleLength][col] = vehicleID;
        }
        incrementMoveCountIfNeeded(vehicleID);
        myGame.lastMovedVehicleID = vehicleID;
        if (myGame.timerInterval === null) {
            startTimer();
        }
    }
}

function canMove(vehicleID, direction, board) {
    let vehicleLength = getVehicleLength(vehicleID, board);
    let row, col;
    [row, col] = getCoordsOfVehicle(vehicleID, board);
    if (direction === "left") {
        return (col-1) >= 0 && board[row][col-1] === 0;
    } else if (direction === "right") {
        return (col+vehicleLength) < board[0].length && board[row][col+vehicleLength] === 0;
    } else if (direction === "up") {
        return (row-1) >= 0 && board[row-1][col] === 0;
    } else if (direction === "down") {
        return (row+vehicleLength) < board.length && board[row+vehicleLength][col] === 0;
    }
}

function incrementMoveCountIfNeeded(vehicleID) {
    if (vehicleID !== myGame.lastMovedVehicleID) {
        let moveCounter = document.getElementById("movecounter")
        myGame.moves += 1;
        moveCounter.innerText = myGame.moves;
    }
}

function resetMoveCounter() {
    myGame.moves = 0;
    myGame.lastMovedVehicleID = 0;
    let moveCounter = document.getElementById("movecounter");
    moveCounter.innerText = myGame.moves;
}

/* ------------------------------------------------------------------------------------------------------------------ */
/* FUNCTIES OM DE GEBRUIKTE TIJD BIJ TE HOUDEN */

function startTimer() {
    myGame.timerInterval = window.setInterval(incrementTimer, 1000);
}
function incrementTimer() {
    let timer = document.getElementById("timer");
    myGame.time += 1;
    timer.innerText = myGame.time;
}

function stopTimer() {
    clearInterval(myGame.timerInterval);
}

function resetTimer() {
    clearInterval(myGame.timerInterval);
    myGame.time = 0;
    myGame.timerInterval = null;
    let timer = document.getElementById("timer");
    timer.innerText = myGame.time;
}

/* ------------------------------------------------------------------------------------------------------------------ */
/* FUNCTIES OM EEN GEWONNEN SPEL TE DETECTEREN EN AF TE HANDELEN */

function checkForWin(board) {
    let playerOrientation = getVehicleOrientation(1, board);
    let playerLength = getVehicleLength(1, board);
    let row, col;
    [row, col] = getCoordsOfVehicle(1, board);
    if (playerOrientation === "horizontal") {
        return col === board[0].length - playerLength;
    } else {
        return row === board.length - playerLength;
    }
}

function winHandler() {
    let timeWin = document.getElementById("time-win");
    timeWin.innerText = myGame.time;
    stopTimer();
    let movesWin = document.getElementById("moves-win");
    movesWin.innerText = myGame.moves;
    let winContainer = document.getElementById("win-container");
    winContainer.style.display = "block";
}
