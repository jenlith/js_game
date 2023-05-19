/* The Basic Classes */
class Piece {
    constructor(for_player) {
        this.player = for_player;
    }

    belongs_to(p) {
        return (this.player == p);
    }

    get_classes() {
        classes += " piece ";
        return classes;
    }
}

class Square {
    constructor(for_player) {
        if (for_player > 0) {
            this.piece = new Piece(for_player);
            this.allowed = true;
        } else {
            this.piece = null;
            this.allowed = false;
        }
    }

    has_piece() {
        if (this.piece != null) {
            return true;
        } else {
            return false;
        }
    }

    belongs_to(p) {
        if (this.has_piece) {
            return this.piece.belongs_to(p);
        } else {
            return false;
        }
    }

    get_classes() {
        classes = "";
        if (this.player < 0) {
            classes = " no_piece ";
        } else if (this.player > 0) {
            classes = this.piece.get_classes();
        }
        return classes;
    }
}

class Board {
    constructor(rows, cols) {
        // misc. things to know -- may move these around as necessary
        this.selected = null;
        this.move_to = null;
        this.player_one = true;
        // html board to store
        this.squares = [...Array(rows)].map(e => Array(cols).fill("<td></td>"));
        // finding 1d position = parseInt(row * (board[row].length)) + parseInt(i);
    }

    reset() {
        this.Board = new Board(this.squares.length, this.squares[0].length);
    }

    update() {
    }

    swap_player() {
        this.player_one = !(this.player_one);
    }
}

/* Checkers Classes */
class CheckersPiece extends Piece {
    constructor(for_player) {
        super(for_player);
        this.is_king = false;
    }

    get_classes() {
        classes = super.get_classes();
        if (this.is_king) {
            classes += " king ";
        }
        if (this.player == 1) {
            classes += " one ";
        } else {
            classes += " two ";
        }
        return classes;
    }
}

class CheckersSquare extends Square {
    constructor(for_player, neighbours) {
        if (for_player < 0) {
            this.piece = null;
            this.allowed = false;
        } else {
            this.piece = new CheckersPiece(for_player);
            this.allowed = true;
        }
        this.add_neighbours(this.neighbours);
    }

    add_neighbours(neighbours) {
        this.num_neighbours = 0;
        this.neighbours = Array(4).fill(null);
        // starting LH & UP, going clockwise
        for (i in neighbours) {
            if (neighbours[i] != null) {
                this.neighbours[i] = neighbours[i];
                this.num_neighbours++;
            }
        }
    }

    is_neighbour(locn) {
        for (i in this.neighbours) {
            if ((this.neighbours[i][0] == locn[0]) & (this.neighbours[i][1] == locn[1])) {
                return true;
            }
        }
        return false;
    }

    one_neighbour(locn) {
        if (this.num_neighbours == 1) {
            for (i in this.neighbours) {
                if (this.neighbours[i] != null) {
                    return this.neighbours[i];
                }
            }
        }
        return null;
    }

    can_move_to(locn, is_jumping) {
        if (!is_jumping) {
            if (this.is_neighbour(locn)) {
                return true;
            }
        } else {
            if (this.one_neighbour(locn) != null) {
                return true;
            }
        }
        return false;
    }
}

class CheckersBoard extends Board {
    constructor(rows, cols) {
        super(rows, cols);
        this.move_count = 0;
        // populate board for checkers
        // valid positions on the board: (Math.abs(col - row)) % 2; AKA (((row % 2) == 0) and ((col % 2) == 1)) | (((row % 2) == 1) and ((col % 2) == 0))
        for (row in this.squares) {
            for (col in this.squares[row]) {
                player_square = (Math.abs(parseInt(col) - row)) % 2;
                // valid location for a piece
                if (player_square == 1) {
                    if (row < 3) { player = 1; } // player one
                    else if (row > 4) { player = 2; } // player two
                    else { player = 0; } // no player
                    // get neighbours
                    var neighbours = Array(4).fill(null); // up to 4 neighbours
                    // y values: LH -1; RH: +1
                    var LH = col > 0;
                    var RH = col < (board.length - 1);
                    // x values: UP -1; LO: +1 (* num_cols for 1D)
                    var UP = row > 0;
                    var LO = row < (board[0].length - 1);
                    // get index values for each neighbour, going clockwise
                    if (LH & UP) { neighbours[0] = [row - 1, col - 1]; }
                    if (RH & UP) { neighbours[1] = [row - 1, col + 1]; }
                    if (RH & LO) { neighbours[2] = [row + 1, col + 1]; }
                    if (LH & LO) { neighbours[3] = [row + 1, col - 1]; }
                    //make square
                    this.squares[row][col] = new CheckersSquare(player, neighbours);
                }
                // not a valid location for any piece
                else { this.squares[row][col] = new CheckersSquare(-1); }
            }
        }
    }

    update() {
        // html board to display
        var new_contents = "";
        for (row in this.squares) {
            // row label
            new_contents += '<tr> <td class="index">' + row + '</td>';
            // contents of row
            for (col in this.squares[row]) {
                new_contents += '<td class="' + (this.squares[row][col].get_classes()) + '" id="' + row + '_' + col + '" onclick="clicked(' + row + ',' + col + ')">' + row + ',' + col + '</td>';
            }
        }
        $('#checkers_board').html(new_contents);
    }

    getSquare(locn) {
        return this.board[locn[0]][locn[1]];
    }

    // game happens here
    clicked(row, col) {
        clicked_item = this.getSquare([row, col]);
        // clicked item is a valid location to have piece
        if (clicked_item.allowed) {
            // selected dne
            if (this.selected == null) {
                // there's a piece on the square
                if (clicked_item.has_piece) {
                    // piece clicked belongs to curr player's turn
                    if (((this.player_one) & (clicked_item.belongs_to(1))) | // player one
                        (!(this.player_one) & (clicked_item.belongs_to(2))) // player two
                    ) {
                        this.selected = [row, col];
                        // highlight selected
                    }
                }
            }
            // selected exists; clicked -> move_to
            else {
                this.move_to = [row, col];
                // if same as selected, deselect
                // otherwise move
            }
        } else {
            // invalid location
        }
    }
}