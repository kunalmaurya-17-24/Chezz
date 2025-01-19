const express = require("express");
const socket = require("socket.io");
const http = require ("http");
const { Chess } = require("chess.js");
const path = require("path");
const { log } = require("console");

const app = express();
const server = http.createServer(app);

const io = socket(server);

const chess = new Chess();

let players = {};
let currentPlayer = "w";

//io.emit means sabko like broadcast
//socket.emit means 1 person ko like 1-1 message

app.set("view engine", "ejs"); //allows us to use ejs
app.use(express.static(path.join(__dirname, "public")));//allows us to use static files like images etc

app.get("/", (req, res) => {
    res.render("index" , {tittle: "Chess Game"}); 
});


io.on("connection", function (uniquesocket) {
        console.log("connected");

        if(!players.white) {
            players.white = uniquesocket.id;
            uniquesocket.emit("playerRole", "w");
        } else if (!players.black) {
            players.black = uniquesocket.id;
            uniquesocket.emit("playerRole", "b");
        } else {
            uniquesocket.emit("spectatorRole");
        }

        uniquesocket.on("disconnect" , function () {
            if(uniquesocket.id === players.white){
                delete players.white;
            } else if ( uniquesocket.id === players.black) {
                
                delete players.black;
            }
        });

        uniquesocket.on("move" , (move)=>{
            try {
                if(chess.turn() === "w" && uniquesocket.id !== players.white) return;
                if(chess.turn() === "b" && uniquesocket.id !== players.black) return;

                const result = chess.move(move);
                if(result) {
                    currentPlayer = chess.turn();
                    io.emit("move", move);
                    io.emit("boardState", chess.fen());
                } else {
                    console.log("Invalid move" , move);
                    uniquesocket.emit("invalidMove" ,move);
                }

            } catch (error) {
                console.log(error);
                
                uniquesocket.emit("Invalid move : " , move);
                
                
            }
        })
  });

server.listen(3000, function() {
    console.log("Server listening on port 3000");
});