import { UserUnauthorizedException } from "src/users/exception/userUnauthorized.exception";
import BallInterface from "../interfaces/ball.interface";
import GameSetupInterface from "../dto/gameSetup.dto";
import MouseMoveInterface from "../dto/mouseMove.dto";
import PlayerInterface from "../interfaces/player.interface";
import User from "src/users/user.entity";

export enum GameStatus {
  WAITING = 'waiting',
  INITIALIZATION = 'initialization',
  RUNNING = 'running',
  STOPPED = 'stopped',
  ENDED = 'ended'
};

export enum GameMaxPoints {
  FIVE = 5,
  TEN = 10,
  FIFTEEN = 15,
}

export enum GamePlayerHeight {
  SMALL = 50,
  MEDIUM = 100,
  LARGE = 150,
}

export enum GameBallSpeed {
  SLOW = 1.1,
  MEDIUM = 1.5,
  FAST = 2
}

class Point
{
  x: number
  y: number
  constructor(x, y) {
    this.x = x;
    this.y = y;
  }
}

class GameObject {
  id: string;
  status: GameStatus;
  canvasHeight: number;
  canvasWidth: number;
  maxPoints: GameMaxPoints;
  ballSpeed: GameBallSpeed;
  playerHeight: GamePlayerHeight;
  playerWidth: number;
  player1: PlayerInterface;
  player2: PlayerInterface;
  ball: BallInterface
  lastFrame: number

  constructor(id: string, player1: User, player2: User) {
    this.id = id;
    this.status =  GameStatus.INITIALIZATION;
    this.canvasHeight = 480;
    this.canvasWidth = 640;
    this.maxPoints = GameMaxPoints.FIVE;
    this.ballSpeed =  GameBallSpeed.MEDIUM;
    this.playerHeight = GamePlayerHeight.MEDIUM;
    this.playerWidth = 5;
    this.lastFrame = 0
    this.player1 = {
      user: player1,
      isReady: false
    },
    this.player2 = {
      user: player2,
      isReady: false
    }
  }

  setupGame(id: number, gameData: GameSetupInterface) {
    for (let param in gameData) {
      if (param == 'isPlayerReady') {
        let player = (this.player1.user.id == id )? this.player1 : this.player2;
        player.isReady = gameData[param];
      }
      else if (param.toString() == "maxPoints" || param == "ballSpeed" || param == "playerHeight") {
        this.player1.isReady = false;
        this.player2.isReady = false;
        this[param] = gameData[param];
      }
    }
  }

  launchGame() {
    this.player1.xWall = 0;
    this.player1.x = 0 + this.playerWidth;
    this.player1.y = this.canvasHeight / 2 - this.playerHeight / 2;
    this.player1.score = 0;
  
    this.player2.xWall = this.canvasWidth;
    this.player2.x = this.canvasWidth - this.playerWidth;
    this.player2.y = this.canvasHeight / 2 - this.playerHeight / 2;
    this.player2.score = 0;

    this.ball = {
      oldx: this.canvasWidth / 2,
      oldy: this.canvasHeight / 2,
      x: this.canvasWidth / 2,
      y: this.canvasHeight / 2,
      r: 5,
      speed: {
        x: 2,
        y: 0
      }
    }
    this.lastFrame = Date.now()
    this.status = GameStatus.RUNNING;
  }

  async mouseUpdate(playerId: number, data: MouseMoveInterface) {
    let player;
    if (this.player1.user.id == playerId)
      player = this.player1;
    else if (this.player2.user.id == playerId)
      player = this.player2;
    else 
      throw new UserUnauthorizedException(playerId);
    var mouseLocation = data.clientY - data.canvasLocationY;
    if (mouseLocation < this.playerHeight / 2)
      player.y = 0;
    else if (mouseLocation > this.canvasHeight - this.playerHeight / 2)
      player.y = this.canvasHeight - this.playerHeight;
    else 
      player.y = mouseLocation - this.playerHeight / 2;
  }

  async updateGame() {
    this.ballMove();
    if (this.player1.score == this.maxPoints || this.player2.score == this.maxPoints)
      this.status = GameStatus.ENDED;
  }

  ballMove() {
    // Time Factor
    const now = Date.now()
    const timeElapsed =  now - this.lastFrame
    const timeFactor = timeElapsed / 16
    this.lastFrame = now
    // console.log('Time elapsed:',timeElapsed, 'ms', 'Time Factor:', timeFactor)
    
    // // Un-comment the 2 next lines two generate artificial lag
    // const ran = Math.random();
    // for (let i = 0; i < 99999999 * ran; i++)

    // Save previous ball pos 
    this.ball.oldx = this.ball.x
    this.ball.oldy = this.ball.y
    // Get new pos
    this.ball.x += this.ball.speed.x * timeFactor;
    this.ball.y += this.ball.speed.y * timeFactor;
    // Lower wall collision
    if (this.ball.y > this.canvasHeight){
      this.ball.y = this.canvasHeight - (this.canvasHeight - this.ball.y)
      this.ball.speed.y *= -1;
    } 
    // Upper wall collision
    if (this.ball.y < 0){
      this.ball.y *= -1
      this.ball.speed.y *= -1;
    }
    // Player collision
    if (this.ball.x > this.canvasWidth - this.playerWidth) {
      this.collide(this.player2);
    } else if (this.ball.x < this.playerWidth) {
      this.collide(this.player1);
    }
  }
 
  async collide(player: PlayerInterface) {
    // The player doesnt hit the ball
    if (!this.doIntersect(
        {x: player.x, y: player.y},
        {x: player.x, y: player.y + this.playerHeight},
        {x: this.ball.oldx, y: this.ball.oldy},
        {x: this.ball.x, y: this.ball.y},
      ) && !this.doIntersect(
        {x: player.xWall, y: player.y},
        {x: player.xWall, y: player.y + this.playerHeight},
        {x: this.ball.oldx, y: this.ball.oldy},
        {x: this.ball.x, y: this.ball.y},
      )
    ){
      this.reset();
      // Update score
      if (player == this.player1) {
        this.player2.score++;
      } else {
        this.player1.score++;
      }
    } else {
        this.ball.speed.x *= -1;
        this.changeDirection(player.y);

        // Increase speed if it has not reached max speed
        if (Math.abs(this.ball.speed.x) < 12)
          this.ball.speed.x *= this.ballSpeed;
    }
  }

  async reset() {
    // Set ball and players to the center
    this.ball.x = this.canvasWidth / 2;
    this.ball.y = this.canvasHeight / 2;
    this.player1.y = this.canvasHeight / 2 - this.playerHeight / 2;
    this.player2.y = this.canvasHeight / 2 - this.playerHeight / 2;
  
    // Reset speed
    this.ball.speed.x = 2;
    this.ball.speed.y = Math.random() * 2;
  }

async changeDirection(playerPosition) {
    var impact = this.ball.y - playerPosition - this.playerHeight / 2;
    var ratio = 100 / (this.playerHeight / 2);
    this.ball.speed.y = Math.round(impact * ratio / 10);
  }


  // Below is all the intersection code, it's kinda magical
  // Given three collinear points p, q, r, the function checks if
  // point q lies on line segment 'pr'
  onSegment(p, q, r) {
    if (q.x <= Math.max(p.x, r.x) && q.x >= Math.min(p.x, r.x) &&
      q.y <= Math.max(p.y, r.y) && q.y >= Math.min(p.y, r.y))
    return true;
  
    return false;
  }
  
  // To find orientation of ordered triplet (p, q, r).
  // The function returns following values
  // 0 --> p, q and r are collinear
  // 1 --> Clockwise
  // 2 --> Counterclockwise
  pointsOrientation(p: Point, q: Point, r: Point) {
    let val = (q.y - p.y) * (r.x - q.x) -
        (q.x - p.x) * (r.y - q.y);
  
    if (val == 0) return 0; // collinear
  
    return (val > 0)? 1: 2; // clock or counterclock wise
  }
  
  // The main function that returns true if line segment 'p1q1'
  // and 'p2q2' intersect.
  doIntersect(p1: Point, q1: Point, p2: Point, q2: Point) {
    // Find the four orientations needed for general and
    // special cases
    let o1 = this.pointsOrientation(p1, q1, p2);
    let o2 = this.pointsOrientation(p1, q1, q2);
    let o3 = this.pointsOrientation(p2, q2, p1);
    let o4 = this.pointsOrientation(p2, q2, q1);
  
    // General case
    if (o1 != o2 && o3 != o4)
      return true;
  
    // Special Cases
    // p1, q1 and p2 are collinear and p2 lies on segment p1q1
    if (o1 == 0 && this.onSegment(p1, p2, q1)) return true;
    // p1, q1 and q2 are collinear and q2 lies on segment p1q1
    if (o2 == 0 && this.onSegment(p1, q2, q1)) return true;
    // p2, q2 and p1 are collinear and p1 lies on segment p2q2
    if (o3 == 0 && this.onSegment(p2, p1, q2)) return true;
    // p2, q2 and q1 are collinear and q1 lies on segment p2q2
    if (o4 == 0 && this.onSegment(p2, q1, q2)) return true;
    return false; // Doesn't fall in any of the above cases
  }
}

export default GameObject;