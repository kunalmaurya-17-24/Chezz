const socket = io();
const chess = new Chess();
const boardElement = document.querySelector(".chessboard");

let draggedPiece = null;
let sourceSquare = null;
let playerRole = null;

const renderBoard = () => {
       const board =  chess.board();
       boardElement.innerHTML = "";
       board.forEach((row , rowindex) => {
                row.forEach((square , squareindex) => {
                        const squareElement = document.createElement("div");
                        squareElement.classList.add("square",
                            (rowindex +squareindex) % 2 === 0 ? "light" : "dark"
                        );

                        squareElement.dataset.row = rowindex;
                        squareElement.dataset.column = squareindex;

                        if (square) {
                            const pieceElement = document.createElement("div");
                            pieceElement.classList.add("piece", square.color === 'w' ? "white" : "black");
                            pieceElement.innerText = getPieceUnicode(square);
                            pieceElement.draggable = playerRole === square.color;

                            pieceElement.addEventListener("dragstart", (event) => {
                                if (pieceElement.draggable) {
                                    draggedPiece = pieceElement;
                                    sourceSquare = { row: rowindex, col: squareindex };
                                    event.dataTransfer.setData("text/plain", "");
                                } else {
                                    event.preventDefault(); // Prevent dragging if it's not the player's turn
                                }
                            });
                            

                            pieceElement.addEventListener("dragend", (event) => {
                                draggedPiece = null;
                                sourceSquare = null;
                            });
                                squareElement.appendChild(pieceElement);
                        }
                        squareElement.addEventListener("dragover", function (event) {
                            event.preventDefault();
                });
                squareElement.addEventListener("drop", function (event) {
                    event.preventDefault();
                    if (draggedPiece) {
                        const targetSquare = {
                            row: parseInt(squareElement.dataset.row, 10),
                            col: parseInt(squareElement.dataset.column, 10), // Ensure it's `column` not `col`
                        };
                        handleMove(sourceSquare, targetSquare);
                    }
                });
                
                boardElement.appendChild(squareElement);
         });


    });

    if(playerRole === "b") {
        boardElement.classList.add("flipped");
    }   else {
        boardElement.classList.remove("flipped"); 
    }

};


const handleMove = (source, target) => {
    console.log("Source:", source, "Target:", target); // Debugging log

    const fromSquare = `${String.fromCharCode(97 + source.col)}${8 - source.row}`;
    const toSquare = `${String.fromCharCode(97 + target.col)}${8 - target.row}`;

    // Check if the move is valid before emitting it
    const move = {
        from: fromSquare,
        to: toSquare,
        promotion: undefined // Leave undefined unless it's a pawn promotion
    };

    // Validate the move using chess.js
    if (chess.move(move)) {
        socket.emit("move", move);
    } else {
        console.error("Invalid move attempted:", move); // Log invalid moves
    }
};



const getPieceUnicode = (piece) => {
    const unicodePieces = {

            K: '♔',
            Q: '♕',
            R: '♖',
            B: '♗',
            N: '♘',
            P: '♙',
            k: '♔',
            q: '♕',
            r: '♖',
            b: '♗',
            n: '♘',
            p: '♙',
    };
    return unicodePieces [piece.type] || "";
};  

socket.on("playerRole", function(role){
    playerRole = role;
    renderBoard();
});

socket.on("spectatorRole" , function () {
    playerRole = null;
    renderBoard();
});

socket.on("boardState" , function (fen) {
    chess.load(fen);
    renderBoard();
});

socket.on("move", function (move) {
    // Validate the move before executing it
    if (chess.move(move)) {
        renderBoard();
    } else {
        console.error("Received invalid move:", move); // Log invalid moves
    }
});


renderBoard();

//TODO: add a timer , add a restart button , add whose turn it is currently , add a forfeit button , add a winning annimation maybe , add a checkmate animation , add a draw , add a highlighted path for every piece and every move , add a container where there will be the removed pieces/lost pieces 

//TODO: also add a unique username like we can select user name and maybe add highscore and add a sign up option as well
