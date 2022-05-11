var socket;
var game;
var p1;
var b;
var lastPos;
var go = false;
var players = [];
var counter = 0;
var bn = true;
function setup(){
    
    socket = io.connect('http://localhost:3000/pong');
    createCanvas(500,500);
    b = new Ball(width/2,height/2,4,4,15);
    socket.on('getCounter',function(data){
      counter = data;
      print(counter);
      if(p1 === undefined){
      if(counter % 2 === 0 )
        p1 = new Player(0);
      else
        p1 = new Player(width);
      }
    var data = {
    x:p1.x,
    y:p1.y,
    v:p1.velocity,
    w:p1.w,
    h:p1.h,
    points:p1.points
  };
  socket.emit('start',data);

  var data = {
    x:b.x,
    y:b.y,
    xv:b.xv,
    yv:b.yv,
    r:b.r
  };
  socket.emit('startBall',data);
  
  if(counter === 2){
    go = true;
  }
  });
      

  socket.on('heartbeat',function(data){
    game = data;
    players = data;
  });
}

function draw(){
    background(0);
    rect(width/2,0,10,600);
    textSize(40);
    if(go === false)
      text("Waiting for other player.", width/2 - 200, height/2);
    fill(0, 102, 153);
    if(go === true){
    for(var i = 0; i < game.players.length; i++){
      var id = game.players[i].id;
      console.log(game.players[i]);
      if(id !== socket.id){
        fill(255,0,0);
        rectMode(CENTER);
        rect(game.players[i].x,game.players[i].y,game.players[i].w,game.players[i].h);
      }
    }
    showPoints(game.players);
    p1.show();
    p1.move();
    b.show();
    b.move();
    if(b.collision(p1) && p1.x === 0)
      b.xv = 4;
    if(b.collision(p1) && p1.x === width)
      b.xv = -4;
    if(b.x < 0){
      throwBall();
      if(p1.x === width)
        p1.points++;
    }
    if(b.x > width){
        throwBall();
        if(p1.x === 0)
          p1.points++;
    }
    print(p1.points);
    var data = [];
    data[0] = {
      id: socket.id,
    x:p1.x,
    y:p1.y,
    w:p1.w,
    h:p1.h,
    points:p1.points
  };

  socket.emit('update',{id: game.id, players: data});

  var data = {
    x:b.x,
    y:b.y,
    xv:b.xv,
    yv:b.yv,
    r:b.r
  };
  game.ball = data
  socket.emit('updateBall',game);
}}

function throwBall(){
    b.x = width / 2;
    b.y = height /2;
}

function showPoints(p){
  textSize(80);
  fill(0, 102, 153);
  for(var i = 0; i < p.length; i++){
    if(p[i].points !== undefined){
      if(p[i].x === 0)
        text(p[i].points.toString(), width/2 - 100, height-100);
      else
        text(p[i].points.toString(), width/2 + 100, height-100);
    }
  }
}

