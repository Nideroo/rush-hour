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
    restartHandler(myGame);
}

// Effect:
//   Vult level menu met moeilijkheidsgraden van beschikbare levels
function populateLevelMenu() {
    document.getElementById("level-menu").innerHTML = generateLevelMenuHtml();
}

// Input:
//   game: object - interne gamestate
// Effect:
//   Herstart spel op basis van selectie in level menu
function restartHandler(game) {
    resetTimer(game);
    resetMoveCounter(game);
    loadChosenLevel(game);
}

// Input:
//   game: object - interne gamestate
// Effect:
//   Haalt gekozen level op, kopieert dit, en roept drawBoard() op om dit te tekenen
function loadChosenLevel(game) {
    let chosenLevel = document.getElementById("level-menu").value;
    game.board = JSON.parse(JSON.stringify(LEVELS[chosenLevel])); // Deep copy
    drawBoard(game);
}

// Input:
//   game: object - interne gamestate
// Effect:
//   Zet interne representatie om naar externe representatie op webpagina
function drawBoard(game) {
    document.getElementById("board-container").innerHTML = generateBoardHtml(game);
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
//   game: object - interne gamestate
// Output:
//   boardHtml: string - HTML voor <table> die spelbord extern voorstelt
function generateBoardHtml(game) {
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
    let playerOrientation = getVehicleOrientation(1, game);
    let playerRow, playerCol;
    [playerRow, playerCol] = getCoordsOfVehicle(1, game);
    let boardHtml = "<table>";
    boardHtml += WALL_ROW; // Bord bestaat uit feitelijke spelbord omringd door muren met één EXIT
    for (let i = 0; i < game.board.length; i++) { // Itereer over rijen
        boardHtml += "<tr>";
        boardHtml += WALL;
        for (let j = 0; j < game.board[0].length; j++) { // Itereer over kolommen
            let value = game.board[i][j]; // 0 of unieke integer per voertuig
            if (value === 0) {
                boardHtml += EMPTY_SQUARE;
            } else {
                boardHtml += generateVehicleHtml(value, nSquaresGeneratedPerVehicle[value], game);
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
        boardHtml += WALL.repeat(playerCol + 1) + EXIT_SQUARE + WALL.repeat(game.board[0].length - playerCol);
    } else {
        boardHtml += WALL_ROW;
    }
    boardHtml += "</table>";
    return boardHtml;
}

// Input:
//   vehicleID: integer - identificeert uniek een voertuig, komt overeen met CSS class in const VEHICLE_TYPES
//   nSquaresAlreadyGenerated: integer - hoeveel vakjes reeds gegenereerd zijn voor dit voertuig
//   game: object - interne gamestate
// Output:
//   string met HTML voor <td> die een deel van voertuig extern voorstelt
function generateVehicleHtml(vehicleID, nSquaresAlreadyGenerated, game) {
    let vehicleType = getVehicleType(vehicleID);
    let vehicleOrientation = getVehicleOrientation(vehicleID, game);
    let vehicleLength = getVehicleLength(vehicleID, game);
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
//   game: object - interne gamestate
// Output:
//   array van twee integers - zero-indexed coördinaten [rij, kolom] van eerste vakje van voertuig
//                             (tegengekomen van links naar rechts en boven naar onder op het spelbord)
function getCoordsOfVehicle(vehicleID, game) {
    for (let i = 0; i < game.board.length; i++) { // Itereer over rijen
        for (let j = 0; j < game.board[0].length; j++) { // Itereer over kolommen
            if (game.board[i][j] === vehicleID) {
                return [i, j];
            }
        }
    }
}

// Input:
//   vehicleID: integer - identificeert uniek een voertuig, komt overeen met CSS class in VEHICLE_TYPES
//   game: object - interne gamestate
// Output:
// string - oriëntatie "horizontal" of "vertical"
function getVehicleOrientation(vehicleID, game) {
    let inNRows = 0;
    for (let i = 0; i < game.board.length; i++) { // Itereer over rijen
        if (game.board[i].includes(vehicleID)) { // Voertuig heeft minstens één vakje in deze rij
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
//   game: object - interne gamestate
// Output:
//   vehicleLength: integer - aantal vakjes dat voertuig inneemt
function getVehicleLength(vehicleID, game) {
    let vehicleLength = 0;
    for (let i = 0; i < game.board.length; i++) { // Itereer over rijen
        for (let j = 0; j < game.board.length; j++) { // Itereer over kolommen
            if (game.board[i][j] === vehicleID) {
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
    // NOOT: clickMoveVehicleHandler is de enige functie die game uit de globale scope ophaalt!
    //       Want object kan niet meegegeven worden in HTML gegenereerd door generateVehicleHtml
    //       Mogelijke oplossingen: encapsuleer alles zodat de gamestate met this kan opgehaald worden
    //                              hou alle gamestates ergens bij met primitieve keys en geef key mee
    let game = myGame;
    // Geen zetten toelaten als spel al gewonnen is
    if (!game.won && canMove(vehicleID, direction, game)) {
        moveVehicle(vehicleID, direction, game);
        drawBoard(game);
        game.won = checkForWin(game);
        if (game.won) {
            winHandler(game);
        }
    }
}

// Input:
//   vehicleID: integer - identificeert uniek een voertuig, komt overeen met CSS class in const VEHICLE_TYPES
//   direction: string - een richting "left", "right", "up" of "down"
//   game: object - interne gamestate
// Effect:
//   Schuift voertuig (in interne representatie) één vakje op in de gegeven richting en voegt zo nodig een move toe aan
//   de movecount. Indien eerste zet - begint timer.
function moveVehicle(vehicleID, direction, game) {
    let vehicleLength = getVehicleLength(vehicleID, game);
    let row, col;
    [row, col] = getCoordsOfVehicle(vehicleID, game);
    switch (direction) {
        case "left":
            game.board[row][col + vehicleLength - 1] = 0;
            game.board[row][col - 1] = vehicleID;
            break;
        case "right":
            game.board[row][col] = 0;
            game.board[row][col + vehicleLength] = vehicleID;
            break;
        case "up":
            game.board[row + vehicleLength - 1][col] = 0;
            game.board[row - 1][col] = vehicleID;
            break;
        case "down":
            game.board[row][col] = 0;
            game.board[row + vehicleLength][col] = vehicleID;
    }
    incrementMoveCountIfNeeded(vehicleID, game);
    game.lastMovedVehicleID = vehicleID;
    if (game.timerInterval === null) {
        startTimer(game);
    }
}

// Input:
//   vehicleID: integer - identificeert uniek een voertuig, komt overeen met CSS class in const VEHICLE_TYPES
//   direction: string - een richting "left", "right", "up" of "down"
//   game: object - interne gamestate
// Output:
//   boolean - of voertuig kan bewegen in de gegeven richting
function canMove(vehicleID, direction, game) {
    let vehicleLength = getVehicleLength(vehicleID, game);
    let row, col;
    [row, col] = getCoordsOfVehicle(vehicleID, game);
    switch (direction) {
        case "left":
            return (col-1) >= 0 && game.board[row][col-1] === 0;
        case "right":
            return (col+vehicleLength) < game.board[0].length && game.board[row][col+vehicleLength] === 0;
        case "up":
            return (row-1) >= 0 && game.board[row-1][col] === 0;
        case "down":
            return (row+vehicleLength) < game.board.length && game.board[row+vehicleLength][col] === 0;
    }
}

// Input:
//   vehicleID: integer - identificeert uniek een voertuig, komt overeen met CSS class in const VEHICLE_TYPES
//   game: object - interne gamestate
// Effect:
//   Indien deze zet niet hetzelfde voertuig als de vorige zet beweegt,
//   telt 1 op bij de interne movecount en update de externe
function incrementMoveCountIfNeeded(vehicleID, game) {
    if (vehicleID !== game.lastMovedVehicleID) {
        let moveCounter = document.getElementById("movecounter");
        game.moves += 1;
        moveCounter.innerText = game.moves;
    }
}

// Input:
//   game: object - interne gamestate
// Effect:
//   Zet interne movecount op 0 en update de externe, wist info over laatst bewogen voertuig
function resetMoveCounter(game) {
    game.moves = 0;
    game.lastMovedVehicleID = 0;
    let moveCounter = document.getElementById("movecounter");
    moveCounter.innerText = game.moves;
}

/* ------------------------------------------------------------------------------------------------------------------ */
/* FUNCTIES OM DE GEBRUIKTE TIJD BIJ TE HOUDEN */

// Input:
//   game: object - interne gamestate
// Effect:
//   Start de timer, wordt vanaf nu elke seconde met 1 verhoogd
function startTimer(game) {
    game.timerInterval = window.setInterval(incrementTimer, 1000, game);
}

// Input:
//   game: object - interne gamestate
// Effect:
//   Telt 1 op bij de interne timer en update de externe
function incrementTimer(game) {
    let timer = document.getElementById("timer");
    game.time += 1;
    timer.innerText = game.time;
}

// Input:
//   game: object - interne gamestate
// Effect:
//   Stopt de interne timer
function stopTimer(game) {
    clearInterval(game.timerInterval);
}


// Input:
//   game: object - interne gamestate
// Effect:
//   Zet de interne timer op 0 en stopt het optellen hierbij, en update de externe
function resetTimer(game) {
    clearInterval(game.timerInterval);
    game.time = 0;
    game.timerInterval = null;
    let timer = document.getElementById("timer");
    timer.innerText = game.time;
}

/* ------------------------------------------------------------------------------------------------------------------ */
/* FUNCTIES OM EEN GEWONNEN SPEL TE DETECTEREN EN AF TE HANDELEN */

// Input:
//   game: object - interne gamestate
// Output:
//   boolean - of spel gewonnen is
function checkForWin(game) {
    let playerOrientation = getVehicleOrientation(1, game);
    let playerLength = getVehicleLength(1, game);
    let row, col;
    [row, col] = getCoordsOfVehicle(1, game);
    if (playerOrientation === "horizontal") {
        return col === game.board[0].length - playerLength; // Rechter uiteinde van player voertuig raakt EXIT
    } else { // playerOrientation === "vertical"
        return row === game.board.length - playerLength; // Onderste uiteinde van player voertuig raakt EXIT
    }
}


// Input:
//   game: object - interne gamestate
// Effect:
//   Toont bericht met felicitaties, tijd en zetten die nodig waren en optie om een nieuw spel te starten.
//   Stopt interne timer.
function winHandler(game) {
    let timeWin = document.getElementById("time-win");
    timeWin.innerText = game.time;
    stopTimer(game);
    let movesWin = document.getElementById("moves-win");
    movesWin.innerText = game.moves;
    let winContainer = document.getElementById("win-container");
    winContainer.style.display = "block";
}
