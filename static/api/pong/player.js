function Player(x){
   this.x = x;
   this.y = height/2;
   this.velocityy = 4;
   this.w = 20;
   this.h = 80;
   this.top = this.x - this.h/2;
   this.bottom = this.x + this.h/2;
   this.points = 0;

   this.show = function(){
    fill(255);
    rectMode(CENTER);
    rect(this.x,this.y,this.w,this.h)
   }

   this.move = function(){
      if(this.y < mouseY)
       this.y += this.velocityy;
     else if(this.y > mouseY)
       this.y -= this.velocityy;
   }

}
