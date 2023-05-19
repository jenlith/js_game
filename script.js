// Checkers
const board = [...Array(8)].map(e => Array(8).fill("<td></td>"));
// finding 1d position = parseInt(row * (board[row].length)) + parseInt(i);
// valid positions on the board: (Math.abs(col - row)) % 2; AKA (((row % 2) == 0) and ((col % 2) == 1)) | (((row % 2) == 1) and ((col % 2) == 0))
let selected = null;
let move_to = null;
let player_one = true;
let move_count = 0;

/**
 * Update the html on-screen
 */
function update_board() {
    // html board to display
    var new_contents = "";
    for (row in board) {
        // row label
        new_contents += '<tr> <td class="index">' + row + '</td>';
        // contents of row
        for (col in board[row]) {
            new_contents += '<td class="' + board[row][col] + '" id="' + row + '_' + col + '" onclick="clicked(' + row + ',' + col + ')">' + row + ',' + col + '</td>';
        }
    }
    $('#checkers_board').html(new_contents);
}

/**
 * Restart game without reloading the page
 */
function reset() {
    build_board();
    selected = null;
    move_to = null;
}

/**
 * Make the initial classes at each index for the starting 2D checkers board
 */
function build_board() {
    // html board to store
    for (row in board) {
        for (i in board[row]) {
            player_square = (Math.abs(parseInt(i) - row)) % 2;
            if (player_square == 1) {
                var str = ""
                if (row < 3) { // player one
                    str = 'piece one';
                } else if (row > 4) { // player two
                    str = 'piece two';
                } else { // no player
                    str = '';
                }
            } else {
                str = 'no_piece';
            }
            //'<td class="' + str + '" id="' + row + '_' + i + '" onclick="clicked(' + row + ',' + i + ')">' + row + ',' + i + '</td>';
            board[row][i] = str;
        }
    }
    update_board();
}

/**
 * Find a shared neighbour
 * @param {*} locn_a x & y locations of location a
 * @param {*} locn_b x & y locations of location b
 * @returns the shared neighbour of two given locations
 */
function shared_neighbour(locn_a, locn_b) {
    var shared = null;
    var num_n = 0;
    // make sure they aren't neighbours themselves (defense)
    if (is_neighbour(locn_a, locn_b) == false) {
        var n_a = find_neighbours(locn_a[0], locn_a[1]);
        var n_b = find_neighbours(locn_b[0], locn_b[1]);
        for (i in n_a) {
            if (n_a[i] != null) { // n_a[i] not null
                for (k in n_b) {
                    // n_b[k] not null and matches n_a[i] values --> it's a shared location
                    if (n_b[k] != null) {
                        if ((n_a[i][0] == n_b[k][0]) & (n_a[i][1] == n_b[k][1])) {
                            num_n += 1;
                            shared = n_b[k];
                        }
                    }
                }
            }
        }
    }
    // exactly 1 neighbour will be shared if they are valid as being far enough apart to make jump
    if (num_n == 1) {
        return shared;
    } else {
        return null;
    }
}

/**
 * Find out if two locations are neighbours or not
 * @param {*} locn_a x & y of location a, the location we have
 * @param {*} locn_b x & y of location b, the location we want to find out is neighbour of location a or not
 * @returns Whether locn_b is a neighbour of locn_a or not
 */
function is_neighbour(locn_a, locn_b) {
    n_a = find_neighbours(locn_a[0], locn_a[1]);
    for (i in n_a) {
        if (n_a[i] != null) {
            if ((n_a[i][0] == locn_b[0]) & (n_a[i][1] == locn_b[1])) {
                return true;
            }
        }
    }
    return false;
}

/**
 * Find all the neighbours of a given square in the 2D checkers board
 * @param {int} row The row the square is in
 * @param {int} col The column the square is in
 * @returns Array of neighbouring indexes
 */
function find_neighbours(r, c) {
    var neighbours = Array(4).fill(null); // up to 4 neighbours
    row = parseInt(r);
    col = parseInt(c);
    // y values: LH -1; RH: +1
    var LH = col > 0;
    var RH = col < (board.length - 1);
    // x values: UP -1; LO: +1 (* num_cols for 1D)
    var UP = row > 0;
    var LO = row < (board[0].length - 1);
    // get index values for each neighbour, going clockwise
    if (LH & UP) {
        neighbours[0] = [row - 1, col - 1];
    }
    if (RH & UP) {
        neighbours[1] = [row - 1, col + 1];
    }
    if (RH & LO) {
        neighbours[2] = [row + 1, col + 1];
    }
    if (LH & LO) {
        neighbours[3] = [row + 1, col - 1];
    }
    return neighbours;
}

function invalid(row, col) {
    alert("(" + row + "," + col + ")" + " is not a valid square. Please select a different location.");
}

function highlight(row, col) {
    $("#" + row + '_' + col).css({ "backgroundColor": "yellow" });
}

/**
 * This is where the game happens
 * @param {int} row
 * @param {int} col
 */
function clicked(row, col) {
    clicked_item = board[row][col].toString().toLowerCase();
    // if selected can have a piece on it
    if (clicked_item.indexOf('no_piece') < 0) {
        // if selected is null
        if (selected == null) {
            // if square clicked isn't empty
            if (board[row][col] != "") {
                // if colour of clicked = colour of turn
                if (((player_one) & (clicked_item.indexOf('one') >= 0)) | // player one
                    ((!player_one) & (clicked_item.indexOf('two') >= 0))  // player two
                ) {
                    selected = [row, col];
                    highlight(row, col);
                }
            }
        }
        // else clicked location becomes move_to
        else {
            move_to = [row, col];
            // deselect
            if ((move_to[0] == selected[0]) & (move_to[1] == selected[1])) {
                if (move_count == 0) {
                    selected = null;
                    move_to = null;
                    update_board();
                }
            } else {
                // perform move
                move();
            }
        }
    } else {
        invalid(row, col);
    }
}

function goes_forward() {
    from_row = selected[0];
    to_row = move_to[0];
    // top of board wants to go down
    if (player_one) {
        if (from_row < to_row) {
            return true;
        }
    }
    // bottom of board wants to go up
    else {
        if (from_row > to_row) {
            return true;
        }
    }
    return false;
}

function is_king() {
    if (board[selected[0]][selected[1]].indexOf('king') >= 0) {
        return true;
    }
    return false;
}

function move() {
    // TODO: King or not, what direction can a piece move?
    var valid_move = false;
    var jumped = false;
    // move_to must be unoccupied to be a valid move
    if (board[move_to[0]][move_to[1]].indexOf('piece') < 0) {
        // case 1 (basic move): move_to is a neighbour of selected & is the first move of the turn
        if (is_neighbour(selected, move_to) & (move_count <= 0)) {
            // if !king & move is forward: good
            if (is_king()) {
                valid_move = true;
            } else if (goes_forward()) {
                valid_move = true;
            }
        }
        // case 2 (jumps): move_to is and selected share a neighbour that currently has a piece
        else {
            mid = shared_neighbour(selected, move_to);
            if (mid != null) {
                mid_text = board[mid[0]][mid[1]];
                if (mid_text.indexOf('piece') >= 0) {
                    // shared neighbour contains opponent's piece: good
                    if (
                        (player_one & (mid_text.indexOf('two') > 0)) | // player one
                        (!player_one & (mid_text.indexOf('one') > 0)) // player two
                    ) {
                        valid_move = true;
                        var jumped = true;
                        board[mid[0]][mid[1]] = "";
                    }
                }
            }
        }
    }

    // in case where all is good, perform the move itself
    if (valid_move) {
        // update board: move_to -> selected, selected -> nothing
        board[move_to[0]][move_to[1]] = board[selected[0]][selected[1]];
        board[selected[0]][selected[1]] = "";
        update_board();
        // update selected items
        selected = move_to;
        highlight(selected[0], selected[1]);
        move_to = null;
        move_count += 1;
        // checking jump qualifications
        can_jump = check_for_jump(selected);
        // if player did not jump, then swap
        if (!jumped) {
            swap_player();
        }
        // if player jumped, but can't jump again, then swap
        else if (!can_jump) {
            swap_player();
        }
    }
}

function swap_player() {
    player_one = !player_one;
    selected = null;
    move_to = null;
    move_count = 0;
    update_board();
    if (player_one) {
        $("#checkers_turn").html("<p>Turn: White</p>");
    } else {
        $("#checkers_turn").html("<p>Turn: Black</p>");
    }
}

function indv_check(row, col, want) {
    n = find_neighbours(row, col);
    for (i in n) {
        if (n[i] != null) {
            temp = board[n[i][0]][n[i][1]];
            if (temp != null) {
                if (temp.indexOf(want) >= 0) {
                    // issue here
                    return true;
                }
            }
        }
    }
    return false;
}

function check_for_jump(selected) {
    row = selected[0];
    col = selected[1];
    if (board[row][col].indexOf('two') >= 0) {
        if (indv_check(row, col, 'one')) {
            return true;
        }
    } else if (board[row][col].indexOf('one') >= 0) {
        if (indv_check(row, col, 'two')) {
            return true;
        }
    }
    return false;
}

$(document).ready(
    function () {
        build_board();
    }
);

