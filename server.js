const express = require("express");
const path = require("path");
const Socket = require("socket.io");

const app = express();
const server = require("http").createServer(app);
const io = require("socket.io")(server);

app.use(express.static(path.join(__dirname, "public")));
app.set("views", path.join(__dirname, "public"));
app.engine("html", require("ejs").renderFile);
app.set("view engine", "html");

testecone = "deu certo";

app.use("/", (req, res) => {
  res.render("index.html");
});

fixos = new Array();
blocos = new Array();
powerUps = new Array();
conectados = new Array();

var tq = 64;
var nqx = 13;
var nqy = 11;

function novoJogador(id) {
  var x1 = (y1 = 0);
  var cor1 = getRandomColor();
  if (conectados.length + 1 == 1) {
    x1 = y1 = 0;
  } else if (conectados.length + 1 == 2) {
    x1 = 12;
    y1 = 0;
  } else if (conectados.length + 1 == 3) {
    x1 = 0;
    y1 = 10;
  } else if (conectados.length + 1 == 4) {
    x1 = 12;
    y1 = 10;
  } else {
    alert("Desculpe, mas o jogo já está cheio");
    return;
  }

  var nickname = "cleiton"; //prompt("Digite seu nome");

  conectados.push({
    id: id,
    name: nickname,
    vivo: true,
    cor: cor1,
    px: x1,
    py: y1,
    tamanhoBomba: 1,
    quantidadeBombas: 1,
    minhasbombas: [],
    playerColideup: false,
    playerColidedown: false,
    playerColideleft: false,
    playerColideright: false,
  });
}

function gerarFixos() {
  for (i2 = 1; i2 < nqy; i2 += 2) {
    for (i = 1; i < nqx; i += 2) {
      fixos.push({
        x: i,
        y: i2,
      });
    }
  }
}

function gerarBlocosQuebraveis() {
  for (i2 = 0; i2 < nqy; i2 += 10) {
    for (i = 2; i < nqx - 2; i++) {
      blocos.push({
        x: i,
        y: i2,
      });
    }
  }

  for (i2 = 0; i2 < nqx; i2 += 12) {
    for (i = 3; i < nqy - 3; i++) {
      blocos.push({
        x: i2,
        y: i,
      });
    }
  }

  for (i2 = 2; i2 < nqy - 1; i2 += 2) {
    for (i = 1; i < nqx - 1; i++) {
      if (!blocos.some((element) => element.x == i && element.y == i2)) {
        blocos.push({
          x: i,
          y: i2,
        });
      }
    }
  }

  for (i2 = 2; i2 < nqy; i2 += 2) {
    for (i = 1; i < nqx - 3; i++) {
      if (!blocos.some((element) => element.x == i2 && element.y == i)) {
        blocos.push({
          x: i2,
          y: i,
        });
      }
    }
  }
}

function gerarPowerUps(num) {
  for (i = 0; i < num; i++) {
    var cayo = getRandomInt(0, 10);
    while (
      powerUps.some((element) => element.x == x1 && element.y == y1) ||
      fixos.some((element) => element.x == x1 && element.y == y1)
    ) {
      var x1 = getRandomInt(0, 13);
      var y1 = getRandomInt(0, 11);
    }
    if (cayo < 4) {
      var t = 1;
    } else if (cayo > 5) {
      var t = 2;
    } else {
      var t = 3;
    }

    powerUps.push({
      x: x1,
      y: y1,
      type: t,
    });
  }
}

function quebrarBlocos(num) {
  for (i = 0; i < num; i++) {
    var r = getRandomInt(0, 97);
    blocos[r] = {};
  }
}

function getRandomInt(min, max) {
  min = Math.ceil(min);
  max = Math.floor(max);
  return Math.floor(Math.random() * (max - min)) + min;
}

function generateLevel() {
  //stage.style.border = "10px solid brown";
  //stage2.style.border = "10px solid brown";
  //stage3.style.border = "10px solid brown";

  gerarBlocosQuebraveis();
  quebrarBlocos(10);
  gerarFixos();
  gerarPowerUps(50);
}

function getRandomColor() {
  var letters = "0123456789ABCDEF";
  var color = "#";
  for (var i = 0; i < 6; i++) {
    color += letters[Math.floor(Math.random() * 16)];
  }
  return color;
}

generateLevel();

io.on("connection", (socket) => {
  novoJogador(socket.id);
  io.emit("players", conectados);
  console.log(
    `socket conectado: ${socket.id}, nick: ${conectados[conectados.length - 1].name}`
  );
  io.emit("generateLevel", fixos, blocos, powerUps);

  socket.on("posPlayers", (jogadores, blocos2, powers2) => {
    conectados = jogadores;
    blocos = blocos2
    powerUps = powers2
    console.log("movimento")
    socket.broadcast.emit("att", conectados, blocos, powerUps)
  })
});


server.listen(3000);
