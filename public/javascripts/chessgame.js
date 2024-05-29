const socket = io();
const chess = new Chess();

const boardElement = document.querySelector(".chessboard");

let draggedPiece = null;
let sourceSquare = null;
let playerRole = null;

const renderBoard = () =>{
    const board = chess.board();//to get the board array 8x8
    boardElement.innerHTML = "";
    board.forEach((row,rowIndex) =>{
        row.forEach((piece,colIndex) =>{
            const square = document.createElement("div");
            square.classList.add("square",
                ((rowIndex+colIndex)%2==0)?'light':'dark'
            );
            //making a custom attribute using dataset and its name is row
            square.dataset.row = rowIndex;
            square.dataset.col = colIndex;
            //if not null means it contains a chess piece
            if(piece!=null){
                const pieceElement = document.createElement("div");

                pieceElement.classList.add("piece",piece.color === 'w'?"white":"black");

                pieceElement.innerHTML = getPieceUnicode(piece);

                pieceElement.draggable = playerRole === piece.color;

                pieceElement.addEventListener("dragstart",(e) =>{
                    if(pieceElement.draggable){
                        draggedPiece = pieceElement
                        sourceSquare = {row:rowIndex,col:colIndex}
                        //so that drag works smoothly across all platforms
                        e.dataTransfer.setData("text/plain","");
                    }
                })


                pieceElement.addEventListener("dragend",()=>{
                    draggedPiece = null;
                    sourceSquare = null;

                })


                square.appendChild(pieceElement);

                
            }
            //forced to move the piece then stop
            square.addEventListener("dragover",(e) =>{
                e.preventDefault();
            })

            square.addEventListener("drop",(e) =>{
                e.preventDefault();
                if(draggedPiece){
                    const targetSquare = {
                        row : Number(square.dataset.row),
                        col : Number(square.dataset.col)
                    }
                    handleMove(sourceSquare, targetSquare)
                }
            })
            boardElement.appendChild(square);
        })
    })

    if(playerRole === 'b'){
        boardElement.classList.add("flipped");
    }
    else{
        boardElement.classList.remove("flipped");
    }
}

const handleMove = (source,target) =>{
    const move  = {
        from:`${String.fromCharCode(97+source.col)}${8 - source.row}`,
        to:`${String.fromCharCode(97+target.col)}${8 - target.row}`,
        promotion:'q',
    }
    socket.emit("move",move);
}

const getPieceUnicode = (piece) =>{
    const unicodePieces = {
        P:"♙",
        R:"♖",
        N:"♘",
        B:"♗",
        Q:"♕",
        K:"♔",
        p:"♟",
        r:"♜",
        n:"♞",
        b:"♝",
        q:"♛",
        k:"♚",
    };
    
    return unicodePieces[piece.type] || "";
};

socket.on("playerRole",(role)=>{
    playerRole = role;
    renderBoard();
})

socket.on("spectatorRole",()=>{
    playerRole = null;
    renderBoard();
})

socket.on("boardState",()=>{
    chess.load(fen);
    renderBoard();
})

socket.on("move",(move)=>{
    chess.move(move);
    renderBoard();
})

renderBoard()