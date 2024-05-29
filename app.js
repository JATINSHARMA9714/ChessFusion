const express = require('express');
const app = express();
const http = require('http');
const socket = require('socket.io');
const {Chess} = require('chess.js');
const path = require('path');


//socket io wants a server which is created by http and is connected to the server of express
const server = http.createServer(app);
const io = socket(server);

const chess = new Chess();//all functionality of chess.js is available along with all the rules
let players ={};
let currentPlayer = "w";



app.set('view engine','ejs');
app.use(express.static(path.join(__dirname,'public')));

io.on("connection",(socket)=>{
    console.log("a user connected");
    if(!players.white){
        players.white = socket.id;
        socket.emit("playerRole","w");
    }
    else if(!players.black){
        players.black = socket.id;
        socket.emit("playerRole","b");
    }
    else{
        socket.emit("spectatorRole");
    }

    socket.on("disconnect", function(){
        console.log("a user disconnected");
        if(players.white == socket.id){
            players.white = null;
        }
        else if(players.black == socket.id){
            players.black = null;
        }
    });

    socket.on("move",function(move){
        try {
            //if its not the persons turn but he is moving the piece then return
            if(chess.turn === 'w' && socket.id!=players.white){
                return;
            }
            if(chess.turn === 'b' && socket.id!=players.black){
                return;
            }
            const result = chess.move(move);//moving the piece by passing it to chess.move

            //if it is not a wrong move
            if(result){
                currentPlayer = chess.turn();
                io.emit("move",move);//sare players+spectators ko bhej diya
                io.emit("boardState",chess.fen());//it basicaly gives the position of all the pieces in an 8x8 array
            }
            else{
                console.log("Invalid Move: ",move);
                socket.emit("InvalidMove",move);
            }
        }
        catch (error) {
            console.log("err");
            socket.emit("InvalidMove",move);
        }
    })
})

app.get('/',(req,res)=>{
    res.render('index');
});

//not app.listen so that socket and express run on the same port 
server.listen(3000,function(){
    console.log("listening on port 3000");
})