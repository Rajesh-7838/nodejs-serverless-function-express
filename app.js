const express = require('express');
const socket = require('socket.io');
const http = require('http');
const path = require('path');
const { Chess } = require('chess.js');
const { title } = require('process');

const app = express();

const server = http.createServer(app);
const io = socket(server);

const chess =  new Chess();
let players = {};
let currentPlayer = "W";

app.set('view engine','ejs');
app.use(express.static(path.join(__dirname , "public")));

app.get("/",function(req,res){
    res.render("index", { title: "Chess Game"});
});

io.on("connection",function(uniquesocket){  //whenever someone comes on our web this function will work.
    console.log("Connected");

    // uniquesocket.on("churan", function(){  // Function to recieve data from frontend
    //     io.emit("churan papdi"); // This will send data to frontend
        
    // })

    // uniquesocket.on("disconnect", function(){
    //     console.log("Disconnected");

    // })
    
    if(!players.white) {
        players.white = uniquesocket.id;
        uniquesocket.emit("playerRole", "w");
    }

    else if(!players.black) {
        players.black = uniquesocket.id;
        uniquesocket.emit("playerRole","b");
    }

    else{
        uniquesocket.emit("spectatorRole"); 
    }

    uniquesocket.on("disconnect", function () {
    if (uniquesocket.id === players.white) {
        delete players.white;
        console.log("White player disconnected");
    } 
    else if (uniquesocket.id === players.black) {
        delete players.black;
        console.log("Black player disconnected");
    } 
    else {
        console.log("Spectator disconnected");
    }
});


    uniquesocket.on("move", (move)=>{  //(move) has the detail of what to move
        try {
            if(chess.turn() === "w" && uniquesocket.id !== players.white) return;
            if(chess.turn() === "b" && uniquesocket.id !== players.black) return;

            const result = chess.move(move);
            if(result){
                currentPlayer = chess.turn();
                io.emit("move", move)
                io.emit("boardState",chess.fen());
            }
             else{
                console.log("Inavlid move :", move);
                uniquesocket.emit("invalidMove", move);
             }
        } catch (err) {
            console.log(err);            
            console.log("Inavlid move :", move);
        }
    })
})   
server.listen(3001, function(){
    console.log("listening on port 3000");
    
})