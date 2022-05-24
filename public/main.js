var stage = document.getElementById("stage");
var ctx = stage.getContext("2d");

var stage2 = document.getElementById("stage2");
var ctx2 = stage2.getContext("2d");

var stage3 = document.getElementById("stage3");
var ctx3 = stage3.getContext("2d");

document.addEventListener("keydown", keyPush);

var socket = io("http://localhost:3000");


var tq = 64;
var nqx = 13;
var nqy = 11;

var blocos = [];
var fixos = [];
var powerUps = [];
var conectados = [];

var quebrados = new Array()

var gameStart = true;

var playerColideup = false;
var playerColideleft = false;
var playerColidedown = false;
var playerColideright = false;

setInterval(colisaoPowerUp, 30);
setInterval(colisaoParedes, 30);
setInterval(update, 30);

  stage.style.border = "10px solid brown";
  stage2.style.border = "10px solid brown";
  stage3.style.border = "10px solid brown";



//Funçoes de colisao
function colisaoParedes() {
  conectados.forEach((player) => {
    var xCresce = (element) =>
      element.x == player.px + 1 && element.y == player.py;
    var xDiminui = (element) =>
      element.x == player.px - 1 && element.y == player.py;
    var yCresce = (element) =>
      element.x == player.px && element.y == player.py + 1;
    var yDiminui = (element) =>
      element.x == player.px && element.y == player.py - 1;
    if (
      fixos.some(xDiminui) ||
      blocos.some(xDiminui) ||
      conectados.some((element) => element.minhasbombas.some(xDiminui)) ||
      conectados.some(
        (player2) =>
          player2.px == player.px - 1 &&
          player2.py == player.py &&
          player.name != player2.name
      ) ||
      player.px - 1 < 0
    ) {
      player.playerColideleft = true;
    } else {
      player.playerColideleft = false;
    }

    if (
      fixos.some(xCresce) ||
      blocos.some(xCresce) ||
      conectados.some((element) => element.minhasbombas.some(xCresce)) ||
      conectados.some(
        (player2) =>
          player2.px == player.px + 1 &&
          player2.py == player.py &&
          player.name != player2.name
      ) ||
      player.px + 2 > nqx
    ) {
      player.playerColideright = true;
    } else {
      player.playerColideright = false;
    }

    if (
      fixos.some(yDiminui) ||
      blocos.some(yDiminui) ||
      conectados.some((element) => element.minhasbombas.some(yDiminui)) ||
      conectados.some(
        (player2) =>
          player2.px == player.px &&
          player2.py == player.py - 1 &&
          player.name != player2.name
      ) ||
      conectados.some(yDiminui) ||
      player.py - 1 < 0
    ) {
      player.playerColideup = true;
    } else {
      player.playerColideup = false;
    }

    if (
      fixos.some(yCresce) ||
      blocos.some(yCresce) ||
      conectados.some((element) => element.minhasbombas.some(yCresce)) ||
      conectados.some(
        (player2) =>
          player2.px == player.px &&
          player2.py == player.py + 1 &&
          player.name != player2.name
      ) ||
      conectados.some(yCresce) ||
      player.py + 2 > nqy
    ) {
      player.playerColidedown = true;
    } else {
      player.playerColidedown = false;
    }
  });
}

function colisaoPowerUp() {
  conectados.forEach((player) => {
    var power = (element) => element.x == player.px && element.y == player.py;
    if (powerUps.some(power)) {
      var x1 = powerUps[powerUps.findIndex(power)].x;
      var y1 = powerUps[powerUps.findIndex(power)].y;
      var t = powerUps[powerUps.findIndex(power)].type;

      if (x1 == player.px && y1 == player.py) {
        if (t == 1) {
          player.tamanhoBomba++;
        } else if (t == 2) {
          player.quantidadeBombas++;
        } else if (t == 3) {
        }
      }
    }
    ctx2.clearRect(x1 * tq, y1 * tq, tq, tq);
    powerUps[powerUps.findIndex(power)] = {};
  });
}
// FIM Funçoes de colisao


//Funçoes bombasticas

async function colocarBomba(player) {
  if (player.quantidadeBombas > 0) {
    player.quantidadeBombas--;
    player.minhasbombas.push({
      raioExplosao: new Array(),
      x: player.px,
      y: player.py,
      tamanho: player.tamanhoBomba,
    });
    var bombaN = player.minhasbombas[player.minhasbombas.length - 1];
    //ctx2.fillRect(bombaN.x * tq, bombaN.y * tq, tq, tq);
    socket.emit("posPlayers", conectados, blocos, powerUps)
    await sleep(3000);
    await explosaoBomba(bombaN, player);
    player.quantidadeBombas++;
  }
}

async function explosaoBomba(bombaN, player) {
  var yCresce = (element) =>
    element.x == bombaN.x && element.y == bombaN.y + i2;
  var yDiminui = (element) =>
    element.x == bombaN.x && element.y == bombaN.y - i2;
  var xCresce = (element) => element.x == bombaN.x + i && element.y == bombaN.y;
  var xDiminui = (element) =>
    element.x == bombaN.x - i && element.y == bombaN.y;
  bombaN.raioExplosao.push({
    x: bombaN.x,
    y: bombaN.y,
  });

  for (i2 = 1; i2 <= bombaN.tamanho; i2++) {
    if (fixos.some(yCresce)) {
      break;
    } else if (blocos.some(yCresce)) {
      bombaN.raioExplosao.push({
        x: bombaN.x,
        y: bombaN.y + i2,
      });

      blocos[blocos.findIndex(yCresce)] = {};
      break;
    } else if (powerUps.some(yCresce)) {
      ctx2.clearRect(
        powerUps[powerUps.findIndex(yCresce)].x * tq,
        powerUps[powerUps.findIndex(yCresce)].y * tq,
        tq,
        tq
      );
      powerUps[powerUps.findIndex(yCresce)] = {};
    }

    bombaN.raioExplosao.push({
      x: bombaN.x,
      y: bombaN.y + i2,
    });
  }

  for (i2 = 1; i2 <= bombaN.tamanho; i2++) {
    if (fixos.some(yDiminui)) {
      break;
    } else if (blocos.some(yDiminui)) {
      bombaN.raioExplosao.push({
        x: bombaN.x,
        y: bombaN.y - i2,
      });
      blocos[blocos.findIndex(yDiminui)] = {};
      break;
    } else if (powerUps.some(yDiminui)) {
      ctx2.clearRect(
        powerUps[powerUps.findIndex(yDiminui)].x * tq,
        powerUps[powerUps.findIndex(yDiminui)].y * tq,
        tq,
        tq
      );
      powerUps[powerUps.findIndex(yDiminui)] = {};
    }

    bombaN.raioExplosao.push({
      x: bombaN.x,
      y: bombaN.y - i2,
    });
  }
  for (i = 1; i <= bombaN.tamanho; i++) {
    if (fixos.some(xCresce)) {
      break;
    } else if (blocos.some(xCresce)) {
      bombaN.raioExplosao.push({
        x: bombaN.x + i,
        y: bombaN.y,
      });
      blocos[blocos.findIndex(xCresce)] = {};
      break;
    } else if (powerUps.some(xCresce)) {
      ctx2.clearRect(
        powerUps[powerUps.findIndex(xCresce)].x * tq,
        powerUps[powerUps.findIndex(xCresce)].y * tq,
        tq,
        tq
      );
      powerUps[powerUps.findIndex(xCresce)] = {};
    }
    bombaN.raioExplosao.push({
      x: bombaN.x + i,
      y: bombaN.y,
    });
  }
  for (i = 1; i <= bombaN.tamanho; i++) {
    if (fixos.some(xDiminui)) {
      break;
    } else if (blocos.some(xDiminui)) {
      bombaN.raioExplosao.push({
        x: bombaN.x - i,
        y: bombaN.y,
      });
      blocos[blocos.findIndex(xDiminui)] = {};
      break;
    } else if (powerUps.some(xDiminui)) {
      ctx2.clearRect(
        powerUps[powerUps.findIndex(xDiminui)].x * tq,
        powerUps[powerUps.findIndex(xDiminui)].y * tq,
        tq,
        tq
      );
      powerUps[powerUps.findIndex(xDiminui)] = {};
    }
    bombaN.raioExplosao.push({
      x: bombaN.x - i,
      y: bombaN.y,
    });
  }
  bombaN.raioExplosao.forEach((element) => {
    ctx.fillStyle = "red";
    ctx.fillRect(element.x * tq, element.y * tq, tq, tq);
  });

  socket.emit("posPlayers", conectados, blocos, powerUps)

  await sleep(1000);

  bombaN.raioExplosao.forEach((element) => {
    ctx.clearRect(element.x * tq, element.y * tq, tq, tq);
  });

  ctx2.clearRect(bombaN.x * tq, bombaN.y * tq, tq, tq);

  bombaN.x = bombaN.y = bombaN.tamanho = {};
  bombaN.raioExplosao = new Array();
  socket.emit("posPlayers", conectados, blocos, powerUps)
}
// FIM Funçoes bombasticas

//Funçoes auxiliares
function sleep(ms) {
  return new Promise((resolve) => setTimeout(resolve, ms));
}

function getRandomInt(min, max) {
  min = Math.ceil(min);
  max = Math.floor(max);
  return Math.floor(Math.random() * (max - min)) + min;
}

function draw(x1, y1, local) {
  var img = new Image();
  img.onload = function () {
    ctx2.drawImage(img, x1 * tq, y1 * tq, tq, tq);
  };
  img.src = local;
}

// FIM Funçoes auxiliares

function keyPush(event) {
  idzada = conectados.find(element => element.id == socket.id)
  if (gameStart) {
    if (idzada != undefined && idzada.vivo) {
      switch (event.keyCode) {
        case 37: //left
          if (!idzada.playerColideleft) {
            ctx3.clearRect(idzada.px * tq, idzada.py * tq, tq, tq);
            playerState = "walkLeft";
            idzada.px--;
          }
          break;
        case 38: //up
          if (!idzada.playerColideup) {
            ctx3.clearRect(idzada.px * tq, idzada.py * tq, tq, tq);
            playerState = "walkBack";
            idzada.py--;
          }
          break;
        case 39: //right
          if (!idzada.playerColideright) {
            ctx3.clearRect(idzada.px * tq, idzada.py * tq, tq, tq);
            playerState = "walkRight";
            idzada.px++;
          }
          break;
        case 40: //down
          if (!idzada.playerColidedown) {
            ctx3.clearRect(idzada.px * tq, idzada.py * tq, tq, tq);
            playerState = "walkFront";
            idzada.py++;
          }
          break;
        case 88: // colocar bomba
          colocarBomba(idzada);
          break;
      }
      
    }
  }
  socket.emit("posPlayers", conectados, blocos, powerUps)
}

function teste() {
  socket.emit("posPlayers", conectados)
}

async function update() {  
  conectados.forEach((elementP) => {
    ctx3.fillStyle = elementP.cor;
    ctx3.fillRect(elementP.px * tq, elementP.py * tq, tq, tq);
    ctx3.fillStyle = "black";
    ctx3.font = "20px roboto";
    ctx3.fillText(elementP.name, elementP.px * tq + 1, elementP.py * tq + tq / 4);
  });

  if (conectados.some(player => player.minhasbombas != null || player.minhasbombas != undefined)) {
    conectados.forEach(player => player.minhasbombas.forEach(bomba => {
      ctx2.fillRect(bomba.x * tq, bomba.y * tq, tq, tq)
    }))
  }
  else {
    ctx2.clearRect(0, 0, stage2.clientWidth, stage2.clientHeight)
  }

  if (conectados.some(player => player.minhasbombas.raioExplosao != null || player.minhasbombas.raioExplosao != undefined)) {
    console.log("testabndi")
    conectados.forEach(player => player.minhasbombas.forEach(element => element.raioExplosao.forEach(explo => {
      ctx2.fillRect(explo.x * tq, explo,y * tq, tq, tq)
    })))
  }

  if (
    conectados.some((conectado) =>
      conectado.minhasbombas.some((minhabom) =>
        minhabom.raioExplosao.some((element) =>
          conectados.some(
            (player) => element.x == player.px && element.y == player.py
          )
        )
      )
    )
  ) {
    /*alert(conectados.findIndex((player1) =>
      player1.minhasbombas.raioExplosao.some((element) =>
        conectados.some(
        player2 => element.x == player2.px && element.y == player2.py
        )
      )
    ))*/

    var morto = conectados.findIndex((element) =>
      conectados.some((player) =>
        player.minhasbombas.some((bombaN) =>
          bombaN.raioExplosao.some(
            (explodido) =>
              explodido.x == element.px && explodido.y == element.py
          )
        )
      )
    );

    alert("Player " + conectados[morto].name + " morreu");
    //conectados.splice(morto, 1)
    delete conectados[morto];
  }
}

socket.on("generateLevel", (fixos2, blocos2, powerUps2) => {

  fixos = fixos2;
  blocos = blocos2;
  powerUps = powerUps2;

  fixos.forEach((element) => {
    ctx.fillStyle = "brown";
    ctx.fillRect(element.x * tq, element.y * tq, tq, tq);
  });

  blocos.forEach((element) => {
    ctx.fillStyle = "#49C48F";
    ctx.fillRect(element.x * tq, element.y * tq, tq, tq);
  });

  powerUps.forEach((element) => {
    if (element.type == 1) {
      draw(element.x, element.y, "imgsPowerUps/fireSprite.webp");
    } else if (element.type == 2) {
      draw(element.x, element.y, "imgsPowerUps/BombaSprite.webp");
    } else if (element.type == 3) {
      draw(element.x, element.y, "imgsPowerUps/Patinssprite.webp");
    }
  });
  
});

socket.on("players", players => {
  conectados = players
})

socket.on("att", (novos, blocos2, powers2) => {
  conectados = novos
  blocos = blocos2
  powerUps = powers2
  ctx.clearRect(0, 0, stage.clientWidth, stage.clientHeight)
  ctx2.clearRect(0, 0, stage2.clientWidth, stage2.clientHeight)
  ctx3.clearRect(0, 0, stage3.clientWidth, stage3.clientHeight)

  fixos.forEach((element) => {
    ctx.fillStyle = "brown";
    ctx.fillRect(element.x * tq, element.y * tq, tq, tq);
  });

  blocos.forEach((element) => {
    ctx.fillStyle = "#49C48F";
    ctx.fillRect(element.x * tq, element.y * tq, tq, tq);
  });

  powerUps.forEach((element) => {
    if (element.type == 1) {
      draw(element.x, element.y, "imgsPowerUps/fireSprite.webp");
    } else if (element.type == 2) {
      draw(element.x, element.y, "imgsPowerUps/BombaSprite.webp");
    } else if (element.type == 3) {
      draw(element.x, element.y, "imgsPowerUps/Patinssprite.webp");
    }
  });
  console.log("sim")
})



socket.on("receberInfos", (brasil) => {
  alert(brasil);
});

//generateLevel();
