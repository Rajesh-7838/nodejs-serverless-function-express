const socket = io();
const chess = new Chess();
const boardElement = document.querySelector(".chessboard");
const userElement = document.querySelector(".user");

let draggedPiece = null;
let sourceSquare = null;
let playerRole = null;

const renderBoard = function(){ 
    const board = chess.board();
    boardElement.innerHTML = "";
    board.forEach(function(row, rowindex){
        row.forEach(function(square, squareindex){
            const squareElement = document.createElement("div");
            squareElement.classList.add(
                "square",
                (rowindex + squareindex) % 2 === 0 ? "light" : "dark"  //For making the design of chess
            );

            squareElement.dataset.row = rowindex;
            squareElement.dataset.col = squareindex;

            if(square){
                const pieceElement = document.createElement("div");
                pieceElement.classList.add(
                    "piece",
                    square.color === "w"? "white" : "black" 
                );
                
                pieceElement.innerText = getPieceUnicode(square);
                pieceElement.draggable = playerRole === square.color;

                pieceElement.addEventListener("dragstart", function(e){
                  if(pieceElement.draggable){
                      draggedPiece = pieceElement;
                      sourceSquare = {row: rowindex, col: squareindex};
                      e.dataTransfer.setData("text/plain","");
              
                      // get algebraic notation like "e2"
                      const from = `${String.fromCharCode(97 + sourceSquare.col)}${8 - sourceSquare.row}`;
                      const moves = chess.moves({ square: from, verbose: true });
                      highlightSquares(moves);
    }
});


                pieceElement.addEventListener("dragend", function(e){
                    draggedPiece = null;
                    sourceSquare = null;
                    clearHighlights();
                })

                squareElement.appendChild(pieceElement);
            }

            squareElement.addEventListener("dragover", function(e){
                e.preventDefault(); 
            })

            squareElement.addEventListener("drop", function(e){
                e.preventDefault();
                if(draggedPiece){
                    const targetSource = {
                        row: parseInt(squareElement.dataset.row),
                        col: parseInt(squareElement.dataset.col)
                    };

                    handleMove(sourceSquare, targetSource); 
                }
            })
            boardElement.appendChild(squareElement);
        });       
    });

    if (playerRole === "w") {
      userElement.textContent = "You`re Player 1 (White)";
      userElement.classList.remove("bg-white");
      userElement.classList.add("bg-black", "text-white"); // keep text visible
}   else if (playerRole === "b") {
      userElement.textContent = "You`re Player 2 (Black)";
      userElement.classList.remove("bg-white");
      userElement.classList.add("bg-gray-200", "text-black"); // light background for black
}   else {
      userElement.textContent = "You`re Spectator";
      userElement.classList.remove("bg-black", "bg-gray-200");
      userElement.classList.add("bg-white", "text-black");
}

    if(playerRole === "b"){
        boardElement.classList.add("flipped");
    }
    else{
        boardElement.classList.remove("flipped");
    }

    
};

const handleMove = function(source, target){
    const move = {  
        from: `${String.fromCharCode(97 + source.col)}${8 - source.row}`,
        to: `${String.fromCharCode(97 + target.col)}${8 - target.row}`,
        promotion: "q",
    };

    socket.emit("move",move);
};

const getPieceUnicode = function(piece){
    const unicodePieces = {
        K: "♔",  // King
        Q: "♕",  // Queen
        R: "♖",  // Rook
        B: "♗",  // Bishop
        N: "♘",  // Knight
        P: "♙",  // Pawn
        k: "♚",  // King
        q: "♛",  // Queen
        r: "♜",  // Rook
        b: "♝",  // Bishop
        n: "♞",  // Knight
        p: "♟"   // Pawn   
    }

    return unicodePieces[piece.type] || "";
};

socket.on("playerRole", function(role){
    playerRole = role;
    renderBoard();
});

socket.on("spectatorRole", function (){
    playerRole = null;
    renderBoard();
});

socket.on("boardState", function(){
    chess.load(fen);
    renderBoard();
});

socket.on("move", function(move){
    chess.move(move);
    renderBoard();
});

renderBoard();

window.addEventListener("beforeunload", function (e) {
  e.preventDefault();
});

const highlightSquares = function(moves) {
    clearHighlights();
    moves.forEach(move => {
        const col = move.to.charCodeAt(0) - 97;   // 'a' -> 0
        const row = 8 - parseInt(move.to[1]);     // '8' -> 0
        const squareEl = document.querySelector(`.square[data-row='${row}'][data-col='${col}']`);
        if (squareEl) {
            squareEl.classList.add("highlight");
        }
    });
};

const clearHighlights = function() {
    document.querySelectorAll(".square.highlight").forEach(el => {
        el.classList.remove("highlight");
    });
};



