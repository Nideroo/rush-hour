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
let myBoard = [[3, 3, 7, 9, 0, 0],
               [2, 2, 7, 9, 0, 0],
               [8, 1, 1, 9, 0, 0],
               [8, 4, 4, 4, 0, 0],
               [8, 5, 5, 0, 0, 0],
               [6, 6, 6, 0, 0, 0]];

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
    drawBoard(myBoard);
}

function generateBoardHtml(board){
    let boardHtml = "<table>";
    boardHtml += WALL_ROW;
    for (let i = 0; i < board.length; i++){
        boardHtml += "<tr>";
        boardHtml += WALL;
        let rowContainsPlayer = false;
        for (let j = 0; j < board[0].length; j++){
            let value = board[i][j];
            if (value === 0){
                boardHtml += EMPTY_SQUARE;
            } else {
                let vehicleType = getVehicleType(value);
                if (vehicleType === "player"){
                    rowContainsPlayer = true;
                }
                boardHtml += `<td class="vehicle ${vehicleType}"></td>`;
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

function getVehicleType(vehicleID){
    return VEHICLE_TYPES[vehicleID];
}

function canMove(vehicleID, direction, board){
    let vehicleOrientation = getVehicleOrientation(vehicleID, board);
    let vehicleLength = getVehicleLength(vehicleID, board);
    let x, y;
    [x, y] = getCoordsOfVehicle(vehicleID, board);
    if (vehicleOrientation === "horizontal"){
        if (direction === "left"){
            return (x-1) > 0 && board[x-1][y] === 0;
        } else if (direction === "right"){
            return (x+vehicleLength) < board[0].length && board[x+1][y] === 0;
        }
    } else if (vehicleOrientation === "vertical"){
        if (direction === "up"){
            return (y-1) > 0 && board[x][y-1] === 0;
        } else if (direction === "down"){
            return (y+vehicleLength) < board.length && board[x][y+1] === 0;
        }
    }
}

function moveVehicle(vehicleID, direction, board){
    let vehicleOrientation = getVehicleOrientation(vehicleID, board);
    let vehicleLength = getVehicleLength(vehicleID, board);
    let x, y;
    [x, y] = getCoordsOfVehicle(vehicleID, board);
    if (vehicleOrientation === "horizontal"){
        if (direction === "left"){
            board[x][y] = 0;
            board[x+vehicleLength][y] = vehicleID;
        } else if (direction === "right"){
            board[x+vehicleLength-1][y] = 0;
            board[x-1][y] = vehicleID;
        }
    } else if (vehicleOrientation === "vertical"){
        if (direction === "up"){
            board[x][y+vehicleLength-1] = 0;
            board[x][y-1] = vehicleID;
        } else if (direction === "down"){
            board[x][y] = 0;
            board[x][y+vehicleLength] = vehicleID;
        }
    }
}

function getCoordsOfVehicle(vehicleID, board){
    for (let i = 0; i < board.length; i++){
        for (let j = 0; j < board[0].length; j++){
            if (board[i][j] === vehicleID){
                return [i, j];
            }
        }
    }
}

function getVehicleOrientation(vehicleID, board){
    if (vehicleID === 0){
        return "horizontal";
    }
    let inNRows = 0;
    for (let i = 0; i < board.length; i++){
        if (board[i].includes(vehicleID) === true){
            inNRows += 1;
            if (inNRows > 1){
                return "vertical";
            }
        }
    }
    return "horizontal"
}

function getVehicleLength(vehicleID, board){
    let vehicleLength = 0;
    for (let i = 0; i < board.length; i++){
        vehicleLength += board[i].count(vehicleID);
    }
    return vehicleLength
}

