'use strict';

var canvas;
var game;
var anim;
const PLAYER_HEIGHT = 100;
const PLAYER_WIDTH = 5;
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
  context.fillRect(0, game.player.y, PLAYER_WIDTH, PLAYER_HEIGHT);
  context.fillRect(canvas.width - PLAYER_WIDTH, game.computer.y, PLAYER_WIDTH, PLAYER_HEIGHT);

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
  socket.on('startGame', function (msg) {
    game = msg;
    draw();
  });
  canvas.addEventListener('mousemove', sendMouse);
  socket.on('update', function (msg) {
    game = msg;
    document.querySelector('#computer-score').textContent = game.computer.score;
    document.querySelector('#player-score').textContent = game.player.score;
    draw();
  })
  socket.on('endGame', function(msg) {
    console.log(msg);
    game= msg;
    draw();
    if (game.player.score > game.computer.score) 
      document.querySelector('#winner').textContent = "Winner is player";
    else
    document.querySelector('#winner').textContent = "Computer will destroy humanity";

  })
}

function stop () {
  cancelAnimationFrame(anim);
  reset();

    // Init score
    game.computer.score = 0;
    game.player.score = 0;

  document.querySelector('#computer-score').textContent = game.computer.score;
  document.querySelector('#player-score').textContent = game.player.score;
  draw();
}

document.addEventListener('DOMContentLoaded', function() {
  canvas = document.getElementById('canvas');
  document.querySelector('#start-game').addEventListener('click', start);
  document.querySelector('#stop-game').addEventListener('click', stop);

})