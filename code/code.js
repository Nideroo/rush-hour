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
const WALL_ROW = `
<tr>
<td class="wall"></td>
<td class="wall"></td>
<td class="wall"></td>
<td class="wall"></td>
<td class="wall"></td>
<td class="wall"></td>
<td class="wall"></td>
<td class="wall"></td>
</tr>
`

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
    let boardHtml = generateBoardHtml(board);
    document.getElementById("board-container").innerHTML = boardHtml;
}

window.onload = function(){
    drawBoard(myBoard);
}

function generateBoardHtml(board){
    let boardHtml = "<table>";
    for (let i = 0; i < board.length; i++){
        boardHtml += "<tr>";
        for (let j = 0; j < board[0].length; j++){
            let value = board[i][j];
            if (value == 0){
                boardHtml += "<td></td>";
            } else {
                let vehicleType = getVehicleType(value);
                boardHtml += `<td class="vehicle ${vehicleType}"></td>`;
            }
        }
        boardHtml += "</tr>";
    }
    boardHtml += "</table>";
    return boardHtml;
}

function getVehicleType(vehicleID){
    return VEHICLE_TYPES[vehicleID];
}