'use strict';

var canvas;
var game;
var anim;
const socket = io("http://localhost:3000/pong");

function draw() {
  var context = canvas.getContext('2d');


  //Draw field
  context.fillStyle = 'black';
  context.fillRect(0, 0, canvas.width, canvas.height);

  //Draw middle line

  context.strokeStyle = 'white';
  context.beginPath();
  context.moveTo(canvas.width / 2, 0);
  context.lineTo(canvas.width / 2, canvas.height);
  context.stroke();

  //Draw players

  context.fillStyle = 'white';
  context.fillRect(0, game.player1.y, game.playerWidth, game.playerHeight);
  context.fillRect(canvas.width - game.playerWidth, game.player2.y, game.playerWidth, game.playerHeight);

  //Draw Ball
  context.beginPath();
  context.fillStyle = 'white';
  context.arc(game.ball.x, game.ball.y, game.ball.r, 0, Math.PI * 2, false);
  context.fill();
}

function sendMouse(event) {
  console.log(event);
  if (game && game.status == 'running')
    socket.emit('mousemove', {id: game.id, canvasLocation: canvas.getBoundingClientRect(), clientY: event.clientY});
}

function start() {
  socket.emit('joinQueue');
  socket.on('setupGame', function (msg) {
    game = msg;
    if (game.status != 'running') { 
      if (socket.id == game.player1.id) {
        game.id = "a";
        game.playerHeight = 50;
        game.player1.isReady = true;
        game.player2.isReady = true;
        socket.emit('setupGame', game);
     }
    }
  })
  socket.on('startGame', function (msg) {
    game = msg;
    console.log(game);
    draw();
  });
  canvas.addEventListener('mousemove', sendMouse);
  socket.on('update', function (msg) {
    game = msg;
    document.querySelector('#computer-score').textContent = game.player2.score;
    document.querySelector('#player-score').textContent = game.player1.score;
    draw();
  })
  socket.on('endGame', function(msg) {
    console.log(msg);
    game= msg;
    draw();
    if (game.player1.score > game.player2.score) 
      document.querySelector('#winner').textContent = 'player 1 named ' + game.player1.user.username + ' won';
    else
    document.querySelector('#winner').textContent = 'player 2 named ' + game.player2.user.username + ' won';

  })
}

function stop () {
  cancelAnimationFrame(anim);
  reset();

    // Init score
    game.player2.score = 0;
    game.player1.score = 0;

  document.querySelector('#computer-score').textContent = game.player2.score;
  document.querySelector('#player-score').textContent = game.player1.score;
  draw();
}

document.addEventListener('DOMContentLoaded', function() {
  canvas = document.getElementById('canvas');
  document.querySelector('#start-game').addEventListener('click', start);
  document.querySelector('#stop-game').addEventListener('click', stop);

})