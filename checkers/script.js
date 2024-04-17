// Checkers
const board = [...Array(8)].map((e) => Array(8).fill("<td></td>"));
// finding 1d position = parseInt(row * (board[row].length)) + parseInt(i);
// valid positions on the board: (Math.abs(col - row)) % 2; AKA (((row % 2) == 0) and ((col % 2) == 1)) | (((row % 2) == 1) and ((col % 2) == 0))
let selected = null;
let move_to = null;
let player_one = true;
let move_count = 0;

/**
 * Convert int row & column to pretty string
 * @param {int} row
 * @param {int} col
 * @returns {string}
 */
function location_to_string(row, col) {
  return "(" + row + "," + col + ")";
}

/**
 * Log message in console
 * @param {string} message
 */
function log_message(message) {
  console.log(message);
}

/**
 * Log message with pretty location in console
 * @param {string} message
 * @param {int} row
 * @param {int} col
 */
function log_info(message, row, col) {
  log_message(message + location_to_string(row, col));
}

/**
 * Log message with pretty printed coordinates from a square
 * @param {string} message
 * @param {int[]} square
 */
function log_coords(message, square) {
  log_info(message, square[0], square[1]);
}

/**
 * Update the html on-screen
 */
function update_board() {
  // html board to display
  var new_contents = "";
  for (row in board) {
    // row label
    // new_contents += '<tr> <td class="index">' + row + "</td>";
    new_contents += "<tr> ";
    // contents of row
    for (col in board[row]) {
      new_contents += '<td class="' + board[row][col];
      new_contents += '" id="' + row + "_" + col;
      new_contents += '" onclick="clicked(' + row + "," + col + ')"></td>';
    }
  }
  let page_board = document.getElementById("checkers_board");
  page_board.innerHTML = new_contents;
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
      player_square = Math.abs(parseInt(i) - row) % 2;
      if (player_square == 1) {
        var str = "";
        if (row < 3) {
          // player one
          str = "piece one";
        } else if (row > 4) {
          // player two
          str = "piece two";
        } else {
          // no player
          str = "";
        }
      } else {
        str = "unused_space";
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
      if (n_a[i] != null) {
        // n_a[i] not null
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
 * @param {int} r The row the square is in
 * @param {int} c The column the square is in
 * @returns Array of neighbouring indexes
 */
function find_neighbours(r, c) {
  var neighbours = Array(4).fill(null); // up to 4 neighbours
  row = parseInt(r);
  col = parseInt(c);
  // y values: LH -1; RH: +1
  var LH = col > 0;
  var RH = col < board.length - 1;
  // x values: UP -1; LO: +1 (* num_cols for 1D)
  var UP = row > 0;
  var LO = row < board[0].length - 1;
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

function alert_invalid(row, col) {
  alert(
    "(" +
      row +
      "," +
      col +
      ")" +
      " is not a valid square. Please select a different location."
  );
}

function highlight(row, col) {
  let el = document.getElementById(row + "_" + col);
  el.style.backgroundColor = 'yellow';
}

/**
 * This is where the game happens
 * @param {int} row
 * @param {int} col
 */
function clicked(row, col) {
  clicked_item = board[row][col].toString().toLowerCase();
  // if selected can have a piece on it
  if (clicked_item.indexOf("unused_space") < 0) {
    // if selected is null
    if (selected == null) {
      // if square clicked isn't empty
      if (board[row][col] != "") {
        // if colour of clicked = colour of turn
        if (
          (player_one & (clicked_item.indexOf("one") >= 0)) | // player one
          (!player_one & (clicked_item.indexOf("two") >= 0)) // player two
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
    alert_invalid(row, col);
  }
}

/**
 * Check if a piece can move forwards (up/down, depending on active player)
 * @param {int[]} from
 * @param {int[]} to
 * @returns
 */
function goes_forward(from, to) {
  //   from_row = selected[0];
  from_row = from[0];
  //   to_row = move_to[0];
  to_row = to[0];
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

/**
 * Checks if a given piece is a king
 * @returns
 */
function is_king(piece) {
  if (board[piece[0]][piece[1]].indexOf("king") >= 0) {
    return true;
  }
  return false;
}

// TODO: break this function down into pieces
function move() {
  // TODO: King or not, what direction can a piece move?
  var valid_move = false;
  var jumped = false;
  // move_to must be unoccupied to be a valid move
  if (board[move_to[0]][move_to[1]].indexOf("piece") < 0) {
    // case 1 (basic move): move_to is a neighbour of selected & is the first move of the turn
    if (is_neighbour(selected, move_to) & (move_count <= 0)) {
      // if !king & move is forward: good
      if (is_king(selected)) {
        valid_move = true;
      } else if (goes_forward(selected, move_to)) {
        valid_move = true;
      }
    }
    // case 2 (jumps): move_to is and selected share a neighbour that currently has a piece
    else {
      mid = shared_neighbour(selected, move_to);
      if (mid != null) {
        mid_text = board[mid[0]][mid[1]];
        if (mid_text.indexOf("piece") >= 0) {
          // shared neighbour contains opponent's piece: good
          if (
            (player_one & (mid_text.indexOf("two") > 0)) | // player one
            (!player_one & (mid_text.indexOf("one") > 0)) // player two
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
    // did the piece become a king?
    make_king(move_to);
    update_board();
    // update selected items
    selected = move_to;
    highlight(selected[0], selected[1]);
    move_to = null;
    move_count += 1;
    // checking jump qualifications
    // if player did not jump, then swap
    if (!jumped) {
      swap_player();
    }
    // if player jumped, but can't jump again, then swap
    else if (!can_jump(selected)) {
      swap_player();
    }
  }
}

/**
 * Turn a piece into a king if necessary
 */
function make_king(location) {
  // if location has piece
  if (location != null) {
    row = location[0];
    col = location[1];
    boardInfo = board[row][col];
    if (boardInfo.indexOf("piece") >= 0) {
      // if going down & is at bottom row (7)
      if ((boardInfo.indexOf("one") >= 0) & player_one & (row == 7)) {
        // update html
        board[row][col] = "piece one king";
      }
      // if going up & is at top row (0)
      else if ((boardInfo.indexOf("two") >= 0) & !player_one & (row == 0)) {
        // update html
        board[row][col] = "piece two king";
      }
    }
  }
}

function swap_player() {
  player_one = !player_one;
  selected = null;
  move_to = null;
  move_count = 0;
  update_board();
  let player_turn = document.getElementById("checkers_turn");
  if (player_one) {
    player_turn.innerHTML = "<p>Turn: White</p>";
  } else {
    player_turn.innerHTML = "<p>Turn: Black</p>";
  }
}

/**
 * Check if the piece at a given location is allowed to jump
 * @param {int[]} selected
 * @returns
 */
function can_jump(selected) {
  is_jump_available = false;
  // determine possible target by finding wanted value in neighboring square (possible target)
  // if player 1, looking for "two"
  // if player 2, looking for "one"
  wanted_name = "one";
  if (player_one) {
    wanted_name = "two";
  }
  // if opposite neighbour to possible target is empty:
  neighbours = square_has_neighbours_with_name(selected, wanted_name);
  temp = neighbours.forEach((neighbour) => {
    if (is_opposite_neighbour_open(neighbour, selected)) {
      is_jump_available = true;
    }
  });
  return is_jump_available;
}

/**
 * Determine if a given square's neighbours meet a given criteria
 * @param {int[]} square
 * @param {string} want
 * @returns
 */
function square_has_neighbours_with_name(square, want) {
  row = square[0];
  col = square[1];
  neighbours = find_neighbours(row, col);
  wanted_neighbours = [];
  for (i in neighbours) {
    if (neighbours[i] != null) {
      temp = board[neighbours[i][0]][neighbours[i][1]];
      if (temp != null) {
        if (temp.indexOf(want) >= 0) {
          wanted_neighbours.push(neighbours[i]);
        }
      }
    }
  }
  return wanted_neighbours;
}

/**
 * Check if the neighbour of 'viewing' opposite from 'neighbour' is open or not
 * @param {int[]} investigating
 * @param {int[]} selected
 * @returns true if open
 */
function is_opposite_neighbour_open(investigating, selected) {
  row_diff = investigating[0] - selected[0];
  col_diff = investigating[1] - selected[1];
  opposite_row = investigating[0] + row_diff;
  opposite_col = investigating[1] + col_diff;
  if (
    opposite_row < 0 ||
    opposite_row > 7 ||
    opposite_col < 0 ||
    opposite_col > 7
  ) {
    return false;
  }
  opposite_neighbour = [opposite_row, opposite_col];
  // if king, no worries. if not king, must check forward movement or not
  if (!is_king(selected) & !goes_forward(selected, opposite_neighbour)) {
    return false;
  }
  if (board[opposite_neighbour[0]][opposite_neighbour[1]] === "") {
    return true;
  }
  return false;
}

function docReady(fn) {
  // see if DOM is already available
  if (
    document.readyState === "complete" ||
    document.readyState === "interactive"
  ) {
    // call on next available tick
    setTimeout(fn, 1);
  } else {
    document.addEventListener("DOMContentLoaded", fn);
  }
}

docReady(function () {
  build_board();
});
