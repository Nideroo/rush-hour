/*
RUSH HOUR
Nicolas De Roover
r0702537
2022-2023
voor het vak Informaticawerktuigen binnen de Bachelor Informatica
 */
/*
Interne Representatie Spelbord:
2D-array met een uniek cijfer > 0 per positie die opgenomen wordt door een voertuig, en 0 per lege positie
bv. 3x3 bord met één auto (lengte = 2) horizontaal geplaatst linksboven en één auto verticaal geplaatst rechtsonder
    [[1, 1, 0],
     [0, 0, 2]
     [0, 0, 2]]
*/
// Voorbeeldlevel "Intermediate"
/*
let myBoard = [[3, 3, 7, 9, 0, 0],
               [2, 2, 7, 9, 0, 0],
               [8, 1, 1, 9, 0, 0],
               [8, 4, 4, 4, 0, 0],
               [8, 5, 5, 0, 0, 0],
               [6, 6, 6, 0, 0, 0]];
*/
// Instawin
let myBoard = [[3, 3, 7, 9, 0, 0],
               [2, 2, 7, 9, 0, 0],
               [8, 1, 1, 0, 0, 0],
               [8, 4, 4, 4, 0, 0],
               [8, 5, 5, 0, 0, 0],
               [6, 6, 6, 0, 0, 0]];

let nSeconds = 0;
let timerInterval = 0;
let nMoves = 0;
let lastMovedVehicleID = 0;

// HTML voor veelvoorkomende structuren
const WALL = "<td class='wall'></td>";
const WALL_ROW = "<tr>" + WALL.repeat(8) + "</tr>";
const EMPTY_SQUARE = "<td></td>"
const EXIT_SQUARE = "<td id='exit'>EXIT</td>"

// CSS classes voor verschillende voertuigen
const VEHICLE_TYPES = { 1: "player",
                        2: "npc1",
                        3: "npc2",
                        4: "npc3",
                        5: "npc4",
                        6: "npc5",
                        7: "npc6",
                        8: "npc7",
                        9: "npc8",
                       10: "npc9",
                       11: "npc10",
                       12: "npc11" }

function drawBoard(board){
    document.getElementById("board-container").innerHTML = generateBoardHtml(board);
}

window.onload = function(){
    nSeconds = 0;
    nMoves = 0;
    lastMovedVehicleID = 0;
    drawBoard(myBoard);
    timerInterval = window.setInterval(incrementTimer, 1000);
}

function incrementTimer() {
    let timer = document.getElementById("timer")
    nSeconds += 1;
    timer.innerText = nSeconds;
}

function generateBoardHtml(board){
    let nSquaresGeneratedPerVehicle = {  1: 0,
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
    let boardHtml = "<table>";
    boardHtml += WALL_ROW;
    for (let i = 0; i < board.length; i++) {
        boardHtml += "<tr>";
        boardHtml += WALL;
        let rowContainsPlayer = false;
        for (let j = 0; j < board[0].length; j++) {
            let value = board[i][j];
            if (value === 0) {
                boardHtml += EMPTY_SQUARE;
            } else {
                let vehicleType = getVehicleType(value);
                if (vehicleType === "player") {
                    rowContainsPlayer = true;
                }
                boardHtml += generateVehicleHtml(value, nSquaresGeneratedPerVehicle[value], board);
                nSquaresGeneratedPerVehicle[value] += 1;
            }
        }
        if (rowContainsPlayer === true) {
            boardHtml += EXIT_SQUARE;
        } else {
            boardHtml += WALL;
        }
        boardHtml += "</tr>";
    }
    boardHtml += WALL_ROW;
    boardHtml += "</table>";
    return boardHtml;
}

function generateVehicleHtml(vehicleID, nSquaresAlreadyGenerated, board) {
    let vehicleType = getVehicleType(vehicleID);
    let vehicleOrientation = getVehicleOrientation(vehicleID, board)
    let vehicleLength = getVehicleLength(vehicleID, board);
    if (nSquaresAlreadyGenerated === 0) {
        if (vehicleOrientation === "horizontal") {
            return `<td class="vehicle ${vehicleType} left" onclick="clickMoveVehicleHandler(${vehicleID}, 'left')">←</td>`;
        } else if (vehicleOrientation === "vertical") {
            return `<td class="vehicle ${vehicleType} up" onclick="clickMoveVehicleHandler(${vehicleID}, 'up')">↑</td>`;
        }
    } else if (nSquaresAlreadyGenerated === vehicleLength-1) {
        if (vehicleOrientation === "horizontal") {
            return `<td class="vehicle ${vehicleType} right" onclick="clickMoveVehicleHandler(${vehicleID}, 'right')">→</td>`;
        } else if (vehicleOrientation === "vertical") {
            return `<td class="vehicle ${vehicleType} down" onclick="clickMoveVehicleHandler(${vehicleID}, 'down')">↓</td>`;
        }
    } else {
        return `<td class="vehicle ${vehicleType}"></td>`;
    }
}

function getVehicleType(vehicleID) {
    return VEHICLE_TYPES[vehicleID];
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
        lastMovedVehicleID = vehicleID;
    }
}

function incrementMoveCountIfNeeded(vehicleID) {
    if (vehicleID !== lastMovedVehicleID) {
        let moveCount = document.getElementById("movecount")
        nMoves += 1;
        moveCount.innerText = nMoves;
    }
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

function clickMoveVehicleHandler(vehicleID, direction) {
    moveVehicle(vehicleID, direction, myBoard);
    drawBoard(myBoard);
    let hasWon = checkForWin(myBoard);
    if (hasWon === true) {
        winHandler();
    }
}

function winHandler() {
    window.alert("YOU WON!");
    window.clearInterval(timerInterval);
}

function checkForWin(board) {
    let playerOrientation = getVehicleOrientation(1, board);
    let playerLength = getVehicleLength(1, board);
    let row, col;
    [row, col] = getCoordsOfVehicle(1, board);
    if (playerOrientation === "horizontal") {
        for (let i = col+playerLength; i < board[0].length; i++) {
            if (board[row][i] !== 0) {
                return false;
            }
        }
        return true;
    } else if (playerOrientation === "vertical") {
        for (let i = row+playerLength; i < board.length; i++) {
            if (board[i][col] !== 0) {
                return false;
            }
        }
        return true;
    }
}