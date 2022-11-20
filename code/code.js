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
/* FUNCTIES OM GAME OP TE STARTEN OF TE HERSTARTEN*/
window.onload = function() {
    populateLevelMenu();
    restartHandler();
}

// Effect:
//   Vult level menu met moeilijkheidsgraden van beschikbare levels
function populateLevelMenu() {
    document.getElementById("level-menu").innerHTML = generateLevelMenuHtml();
}

// Effect:
//   Herstart spel op basis van selectie in level menu
function restartHandler() {
    resetTimer();
    resetMoveCounter();
    loadChosenLevel();
}

// Effect:
//   Haalt gekozen level op, kopieert dit, en roept drawBoard() op om dit te tekenen
function loadChosenLevel() {
    let chosenLevel = document.getElementById("level-menu").value;
    myGame.board = JSON.parse(JSON.stringify(LEVELS[chosenLevel])); // Deep copy
    drawBoard(myGame.board);
}

// Input:
//   board: 2D-array - feitelijke spelbord
// Effect:
//   Zet interne representatie om naar externe representatie op webpagina
function drawBoard(board) {
    document.getElementById("board-container").innerHTML = generateBoardHtml(board);
}

/* ------------------------------------------------------------------------------------------------------------------ */
/* FUNCTIES OM HTML TE GENEREREN */

// Output:
//   levelMenuHtml: string - HTML voor <option> tags om level te kiezen, gegenereerd op basis van const LEVELS
function generateLevelMenuHtml() {
    let levelMenuHtml = ""
    for (const difficulty in LEVELS) { // Itereer over moeilijkheidsgraden in LEVELS
        levelMenuHtml += `<option value="${difficulty}">${difficulty}</option>`;
    }
    return levelMenuHtml;
}

// Input:
//   board: 2D-array - feitelijke spelbord
// Output:
//   boardHtml: string - HTML voor <table> die spelbord extern voorstelt
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

// Input:
//   vehicleID: integer - identificeert uniek een voertuig, komt overeen met CSS class in const VEHICLE_TYPES
//   nSquaresAlreadyGenerated: integer - hoeveel vakjes reeds gegenereerd zijn voor dit voertuig
//   board: 2D-array - feitelijke spelbord
// Output:
//   string met HTML voor <td> die een deel van voertuig extern voorstelt
function generateVehicleHtml(vehicleID, nSquaresAlreadyGenerated, board) {
    let vehicleType = getVehicleType(vehicleID);
    let vehicleOrientation = getVehicleOrientation(vehicleID, board);
    let vehicleLength = getVehicleLength(vehicleID, board);
    if (nSquaresAlreadyGenerated === 0) { // Eerste vakje
        if (vehicleOrientation === "horizontal") { // Genereer vakje met pijl naar links
            return `<td class="vehicle ${vehicleType} left" onclick="clickMoveVehicleHandler(${vehicleID}, 'left')">🠈</td>`;
        } else if (vehicleOrientation === "vertical") { // Genereer vakje met pijl naar boven
            return `<td class="vehicle ${vehicleType} up" onclick="clickMoveVehicleHandler(${vehicleID}, 'up')">🠉</td>`;
        }
    } else if (nSquaresAlreadyGenerated === vehicleLength-1) { // Laatste vakje
        if (vehicleOrientation === "horizontal") { // Genereer vakje met pijl naar rechts
            return `<td class="vehicle ${vehicleType} right" onclick="clickMoveVehicleHandler(${vehicleID}, 'right')">🠊</td>`;
        } else if (vehicleOrientation === "vertical") { // Genereer vakje met pijl naar beneden
            return `<td class="vehicle ${vehicleType} down" onclick="clickMoveVehicleHandler(${vehicleID}, 'down')">🠋</td>`;
        }
    } else { // Middelste vakje (enkel bij voertuigen met lengte > 2), geen extra functionaliteit
        return `<td class="vehicle ${vehicleType}"></td>`;
    }
}

/* ------------------------------------------------------------------------------------------------------------------ */
/* FUNCTIES OM ALGEMENE GEGEVENS VAN EEN VOERTUIG TE BEPALEN */

// Input:
//   vehicleID: integer - identificeert uniek een voertuig, komt overeen met CSS class in VEHICLE_TYPES
//   board: 2D-array - feitelijke spelbord
// Output:
//   string - CSS class die overeeenkomt met item in VEHICLE_TYPES met als key vehicleID
function getVehicleType(vehicleID) {
    return VEHICLE_TYPES[vehicleID];
}

// Input:
//   vehicleID: integer - identificeert uniek een voertuig, komt overeen met CSS class in VEHICLE_TYPES
//   board: 2D-array - feitelijke spelbord
// Output:
//   array van twee integers - zero-indexed coördinaten [rij, kolom] van eerste vakje van voertuig
//                             (tegengekomen van links naar rechts en boven naar onder op het spelbord)
function getCoordsOfVehicle(vehicleID, board) {
    for (let i = 0; i < board.length; i++) { // Itereer over rijen
        for (let j = 0; j < board[0].length; j++) { // Itereer over kolommen
            if (board[i][j] === vehicleID) {
                return [i, j];
            }
        }
    }
}

// Input:
//   vehicleID: integer - identificeert uniek een voertuig, komt overeen met CSS class in VEHICLE_TYPES
//   board: 2D-array - feitelijke spelbord
// Output:
// string - oriëntatie "horizontal" of "vertical"
function getVehicleOrientation(vehicleID, board) {
    let inNRows = 0;
    for (let i = 0; i < board.length; i++) { // Itereer over rijen
        if (board[i].includes(vehicleID) === true) { // Voertuig heeft minstens één vakje in deze rij
            inNRows += 1;
            if (inNRows > 1) { // Als een voertuig in meerdere rijen vakjes heeft staat het verticaal
                return "vertical";
            }
        }
    }
    // if inNRows == 1 (eigenlijk < 2)
    return "horizontal"
}

// Input:
//   vehicleID: integer - identificeert uniek een voertuig, komt overeen met CSS class in const VEHICLE_TYPES
//   board: 2D-array - feitelijke spelbord
// Output:
//   vehicleLength: integer - aantal vakjes dat voertuig inneemt
function getVehicleLength(vehicleID, board) {
    let vehicleLength = 0;
    for (let i = 0; i < board.length; i++) { // Itereer over rijen
        for (let j = 0; j < board.length; j++) { // Itereer over kolommen
            if (board[i][j] === vehicleID) {
                vehicleLength += 1;
            }
        }
    }
    return vehicleLength
}

/* ------------------------------------------------------------------------------------------------------------------ */
/* FUNCTIES OM EEN VOERTUIG TE BEWEGEN */

// Input:
//   vehicleID: integer - identificeert uniek een voertuig, komt overeen met CSS class in const VEHICLE_TYPES
//   direction: string - een richting "left", "right", "up" of "down"
// Effect:
//   Beweegt voertuig indien mogelijk, tekent dan bord opnieuw en kijkt of het spel gewonnen is
function clickMoveVehicleHandler(vehicleID, direction) {
    // Geen zetten toelaten als spel al gewonnen is
    if (myGame.won !== true && canMove(vehicleID, direction, myGame.board)) {
        moveVehicle(vehicleID, direction, myGame.board);
        drawBoard(myGame.board);
        myGame.won = checkForWin(myGame.board);
        if (myGame.won === true) {
            winHandler();
        }
    }
}

// Input:
//   vehicleID: integer - identificeert uniek een voertuig, komt overeen met CSS class in const VEHICLE_TYPES
//   direction: string - een richting "left", "right", "up" of "down"
//   board: 2D-array - feitelijke spelbord
function moveVehicle(vehicleID, direction, board) {
    let vehicleLength = getVehicleLength(vehicleID, board);
    let row, col;
    [row, col] = getCoordsOfVehicle(vehicleID, board);
    switch (direction) {
        case "left":
            board[row][col + vehicleLength - 1] = 0;
            board[row][col - 1] = vehicleID;
            break;
        case "right":
            board[row][col] = 0;
            board[row][col + vehicleLength] = vehicleID;
            break;
        case "up":
            board[row + vehicleLength - 1][col] = 0;
            board[row - 1][col] = vehicleID;
            break;
        case "down":
            board[row][col] = 0;
            board[row + vehicleLength][col] = vehicleID;
    }
    incrementMoveCountIfNeeded(vehicleID);
    myGame.lastMovedVehicleID = vehicleID;
    if (myGame.timerInterval === null) {
        startTimer();
    }
}

// Input:
//   vehicleID: integer - identificeert uniek een voertuig, komt overeen met CSS class in const VEHICLE_TYPES
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

// Input:
//   vehicleID: integer - identificeert uniek een voertuig, komt overeen met CSS class in const VEHICLE_TYPES
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
