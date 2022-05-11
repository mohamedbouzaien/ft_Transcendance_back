'use strict';

var canvas;
var game;
var anim;
const PLAYER_HEIGHT = 100;
const PLAYER_WIDTH = 5;

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

function play() {
  draw();
  computerMove();
  ballMove();
  anim = requestAnimationFrame(play);
}

function reset() {
  // Set ball and players to the center
  game.ball.x = canvas.width / 2;
  game.ball.y = canvas.height / 2;
  game.player.y = canvas.height / 2 - PLAYER_HEIGHT / 2;
  game.computer.y = canvas.height / 2 - PLAYER_HEIGHT / 2;

  // Reset speed
  game.ball.speed.x = 3;
  game.ball.speed.y = Math.random() * 3;
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

function collide(player) {
  // The player doesnt hit the ball
  if (game.ball.y < player.y || game.ball.y > player.y + PLAYER_HEIGHT) {
    // Set ball and players at start position
    game.ball.x = canvas.width / 2;
    game.ball.y = canvas.height / 2;
    game.player.y = canvas.height / 2 - PLAYER_HEIGHT / 2;
    game.computer.y = canvas.height / 2 - PLAYER_HEIGHT / 2;
    //Reset ball speed
    game.ball.speed.x = 2;
    // Update score
    if (player == game.player) {
      game.computer.score++;
      document.querySelector('#computer-score').textContent = game.computer.score;
    } else {
      game.player.score++;
      document.querySelector('#player-score').textContent = game.player.score;
    }
  } else {
    // Increase speed and change direction
    game.ball.speed.x *= -1.2;
    changeDirection(player.y);
  }
}

function changeDirection(playerPosition) {
  var impact = game.ball.y - playerPosition - PLAYER_HEIGHT / 2;
  var ratio = 100 / (PLAYER_HEIGHT / 2);
  game.ball.speed.y = Math.round(impact * ratio / 10);
}

function ballMove() {
  if(game.ball.y > canvas.height || game.ball.y < 0) {
    game.ball.speed.y *= -1;
  }
  game.ball.x += game.ball.speed.x;
  game.ball.y += game.ball.speed.y;
  if (game.ball.x > canvas.width - PLAYER_WIDTH) {
    collide(game.computer);
  } else if (game.ball.x < PLAYER_WIDTH) {
    collide(game.player);
  }
}

function playerMove(event) {
  var canvasLocation = canvas.getBoundingClientRect();
  var mouseLocation = event.clientY - canvasLocation.y;
  if (mouseLocation < PLAYER_HEIGHT / 2) {
    game.player.y = 0;
  } else if (mouseLocation > canvas.height - PLAYER_HEIGHT / 2) {
    game.player.y = canvas.height - PLAYER_HEIGHT;
  } else {
    game.player.y = mouseLocation - PLAYER_HEIGHT / 2;

  }
}

function computerMove() {

  game.computer.y += game.ball.speed.y * 0.85;
}

document.addEventListener('DOMContentLoaded', function() {
  canvas = document.getElementById('canvas');
  game = {
    player: {
      y: canvas.height / 2 - PLAYER_HEIGHT / 2,
      score: 0
    },
    computer: {
      y: canvas.height / 2 - PLAYER_HEIGHT / 2,
      score: 0
    },
    ball: {
      x: canvas.width / 2,
      y: canvas.height / 2,
      r: 5,
      speed: {
        x: 2,
        y: 2
      }
    }
  }

  canvas.addEventListener('mousemove', playerMove);
  draw();
  document.querySelector('#start-game').addEventListener('click', play);
  document.querySelector('#stop-game').addEventListener('click', stop);

})