setInterval(() => {
  players.forEach(player => {
    player.can_send = true;
  });
}, 10);

function getRandomValue(max) {
  return Math.floor(Math.random() * max + 50);
}

function point_rotation(x_old, y_old, player) {
  let x = x_old * Math.cos(player.angle.alpha * (Math.PI / 180)) - y_old * Math.sin(player.angle.alpha * (Math.PI / 180));
  let y = x_old * Math.sin(player.angle.alpha * (Math.PI / 180)) + y_old * Math.cos(player.angle.alpha * (Math.PI / 180));
  return { x, y };
}

function collision(player) {

  let x = player.position.x;
  let y = player.position.y;

  let p1 = { x, y };

  let newx = 25;
  let newy = 16 / 2;

  let p2 = point_rotation(newx, newy, player);

  p2.x += player.position.x;
  p2.y += player.position.y;

  newy = -16 / 2;

  let p3 = point_rotation(newx, newy, player);

  p3.x += player.position.x;
  p3.y += player.position.y;

  newx = 0;
  newy = 0;

  let p4 = point_rotation(newx, newy, player);

  p4.x += player.position.x;
  p4.y += player.position.y;

  let points = [p1, p2, p3, p4];
  return points;
}

const host = 'localhost';
const port = 9090;
const express = require('express');
const app = express();
const http = require('http').createServer(app);
const socket = require('socket.io')(http);
const maxPlayersCount = 10;

let canvas = {
  width: 600,
  height: 600
};

let players = [];

let coin = {
  x: getRandomValue(500),
  y: getRandomValue(500)
};

socket.on('connection', (socket) => {
  console.log(`Client with id ${socket.id} connected`);

  socket.on('login', (login) => {

    if (players.length === maxPlayersCount) {
      socket.emit('max players count');
      return;
    }

    let loginExist = false;
    players.forEach(player => {
      if (player.login === login) {
        socket.emit('login exist');
        loginExist = true;
        return;
      }
    });
    if (!loginExist) {
      players.push({
        id: socket.id,
        login: login,
        can_send: true,
        score: 0,
        position: {
          x: 20 + 400 * Math.random(),
          y: 20 + 400 * Math.random()
        },
        velocity: {
          m: 0,
          x: 0,
          y: 0
        },
        angle: {
          alpha: 0
        },
        key: [0, 0, 0, 0],
        points: []
      });
      socket.emit("successful");
    }
  })

  socket.on('key', (keys) => {
    if (keys === undefined) {
      return;
    }

    let player = players.find((player) => player.id === socket.id);

    if (player === undefined || player.can_send === false) {
      return;
    }

    player.can_send = false;

    if (player.angle.alpha >= 361) {
      player.angle.alpha = 1;
    }
    else if (player.angle.alpha <= -1) {
      player.angle.alpha = 359;
    }

    if (keys[0] == 1) {
      player.velocity.m += 0.3;
    }
    else {
      player.velocity.m *= 0.93;
    }

    if (keys[3] == 1) {
      player.velocity.m -= 0.3;
    }

    else {
      player.velocity.m *= 0.93;
    }

    if (keys[1] == 1) {
      player.angle.alpha += 4;
    }

    if (keys[2] == 1) {
      player.angle.alpha -= 4;
    }

    player.points = collision(player);

    player.velocity.y = player.velocity.m * Math.abs(Math.cos((90 - player.angle.alpha) * (Math.PI / 180)));
    player.velocity.x = player.velocity.m * Math.abs(Math.cos(player.angle.alpha * (Math.PI / 180)));

    player.x += player.velocity * Math.sin(player.rotate * Math.PI / 180);
    player.y -= player.velocity * Math.cos(player.rotate * Math.PI / 180);

    for (let i = 0; i < player.points.length; ++i) {
      if (player.points[i].x >= canvas.width - 8) {
        player.velocity.m = 0;
        player.position.x = player.position.x - 2;
      }
      else if (player.points[i].y >= canvas.height - 10) {
        player.velocity.m = 0;
        player.position.y = player.position.y - 2;
      }
      else if (player.points[i].x <= 12) {
        player.velocity.m = 0;
        player.position.x = player.position.x + 2;
      }
      else if (player.points[i].y <= 5) {
        player.velocity.m = 0;
        player.position.y = player.position.y + 2;
      }
    }

    if (player.angle.alpha <= 90 && player.angle.alpha > 0) {
      player.position.y += player.velocity.y;
      player.position.x += player.velocity.x;
    }
    else if (player.angle.alpha <= 180 && player.angle.alpha > 90) {
      player.position.y += player.velocity.y;
      player.position.x -= player.velocity.x;
    }
    else if (player.angle.alpha <= 270 && player.angle.alpha > 180) {
      player.position.y -= player.velocity.y;
      player.position.x -= player.velocity.x;
    }
    else if (player.angle.alpha <= 360 && player.angle.alpha > 270 || player.angle.alpha == 0) {
      player.position.y -= player.velocity.y;
      player.position.x += player.velocity.x;
    }
    
    for (let i = 0; i < player.points.length; ++i) {
      if (player.points[i].x >= coin.x - 3 && player.points[i].x <= coin.x + 28
        && player.points[i].y >= coin.y - 3 && player.points[i].y <= coin.y + 28) {
        player.score++;
        coin.x = getRandomValue(500);
        coin.y = getRandomValue(500);
      }
    }

    socket.emit('redraw', [players, coin]);
  });

  socket.on('disconnect', () => {
    players.splice(players.find((player) => player.id === socket.id), 1);
    console.log(`Client with id ${socket.id} disconnected`);
  });
});

app.use(express.static(__dirname + '/multiplayer'));

app.get('/', (_, res) => {
  res.sendFile(__dirname + '/multiplayer/multiplayer.html');
});

http.listen(port, host, () =>
  console.log(`Server listens http://${host}:${port}`)
);