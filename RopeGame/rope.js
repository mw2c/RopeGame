var b2Vec2 = Box2D.Common.Math.b2Vec2
    ,b2AABB = Box2D.Collision.b2AABB
    ,b2BodyDef = Box2D.Dynamics.b2BodyDef
    ,b2Body = Box2D.Dynamics.b2Body
    ,b2FixtureDef = Box2D.Dynamics.b2FixtureDef
    ,b2Fixture = Box2D.Dynamics.b2Fixture
    ,b2World = Box2D.Dynamics.b2World
    ,b2MassData = Box2D.Collision.Shapes.b2MassData
    ,b2PolygonShape = Box2D.Collision.Shapes.b2PolygonShape
    ,b2CircleShape = Box2D.Collision.Shapes.b2CircleShape
    ,b2DebugDraw = Box2D.Dynamics.b2DebugDraw
    ,b2MouseJointDef =  Box2D.Dynamics.Joints.b2MouseJointDef
    ,b2DistanceJointDef = Box2D.Dynamics.Joints.b2DistanceJointDef
    ,b2RevoluteJointDef = Box2D.Dynamics.Joints.b2RevoluteJointDef
    ,b2FilterData = Box2D.Dynamics.b2FilterData
    ,b2ContactListener = Box2D.Dynamics.b2ContactListener
    ,b2DestructionListener = Box2D.Dynamics.b2DestructionListener
    ;
var world;
var clickListener;
var linelist;// rope joints
var timeID;//return value of window.setInterval()
var cvs;//canvas
var context;
var map;
var maplength=10;
var imgs=[];
var loadImgCount=0;
var offsetY=0;//for drawing and calculating
var offsetX=0;
var offsetYstart=10;
var height;
var distanceTraveled=0;
//fly man parts
var bodyFlyManHead;
var bodyFlyManBody;//body
var bodyFlyManUpperarmR;
var bodyFlyManForearmR;
var bodyFlyManUpperarmL;
var bodyFlyManForearmL;
var bodyFlyManUpperLegR;
var bodyFlyManUpperLegL;
var bodyFlyManLowerLegR;
var bodyFlyManLowerLegL;
//fly man joints
var jointBodyLegR;
var jointBodyLegL;
var jointBodyHead;
var jointBodyArmR;
var jointBodyArmL;
var joints;
//images of fly man parts
var imgFlyManHead;
var imgFlyManBody;
var imgFlyManUpperLeg;
var imgFlyManLowerLeg;
var imgFlyManForarm;
var imgFlyManUpperarm;

//some variables to control the game
var screenCounter=0;
var buildingIndex;
var isAlive = true;
var highScore=0;

var loadImageCallBack=function(){
    loadImgCount++;
    context.fillRect(245,405,470/14*loadImgCount,40);
    if(loadImgCount==14){
        setTimeout(startGame, 1000);
    }
}

function loadImages(){
    cvs = document.getElementById('cvs');
    context = cvs.getContext('2d');
    context.clearRect(0, 0, 960, 480);
    context.fillStyle = "black";
    context.strokeStyle = "black";
    context.font = "bold 50px Arial";
    context.fillText("Rope Fly",370,200);
    context.font = "bold 20px Arial";
    context.strokeRect(240,400,480,50);
    context.fillText("Loading...",430,350);
    //load fly man images
    imgFlyManHead=new Image();
    imgFlyManHead.src="imgs/head.png";
    imgFlyManHead.onload = loadImageCallBack;
    imgFlyManBody=new Image();
    imgFlyManBody.src="imgs/body.png";
    imgFlyManBody.onload = loadImageCallBack;
    imgFlyManUpperLeg=new Image();
    imgFlyManUpperLeg.src="imgs/upper_leg.png";
    imgFlyManUpperLeg.onload = loadImageCallBack;
    imgFlyManLowerLeg=new Image();
    imgFlyManLowerLeg.src="imgs/lower_leg.png";
    imgFlyManLowerLeg.onload = loadImageCallBack;
    imgFlyManForarm=new Image();
    imgFlyManForarm.src="imgs/forarm.png";
    imgFlyManForarm.onload = loadImageCallBack;
    imgFlyManUpperarm=new Image();
    imgFlyManUpperarm.src="imgs/upperarm.png";
    imgFlyManUpperarm.onload = loadImageCallBack;
    for(var i=1;i<9;i++){
        var img=new Image();
        img.src="imgs/building"+i+".png";
        console.log(img.src);
        img.onload = loadImageCallBack;
        imgs[i-1]=img;
    }
}

function startGame() {
    context.fillStyle = "black";
    context.strokeStyle = "black";
    //set the starting building
    map=[1,4,5,3,4,5,6,7,3,2];
    world = new b2World(new b2Vec2(0, 10),true);
    //contact callback
    function beginContact(contact){
        if(contact.GetFixtureA().GetBody().GetUserData() == "head" || contact.GetFixtureB().GetBody().GetUserData() == "head"
            ||contact.GetFixtureA().GetBody().GetUserData() == "body" || contact.GetFixtureB().GetBody().GetUserData() == "body"){
            isAlive=false;
            if(Math.floor(distanceTraveled-22)>highScore){
                highScore = Math.floor(distanceTraveled-22);
            }
        }
    }
    contactListener = new b2ContactListener();
    contactListener.BeginContact = beginContact;
    world.SetContactListener(contactListener);

    var fixDef = new b2FixtureDef;
    fixDef.density = 1.0;
    fixDef.friction = 0.5;
    fixDef.restitution = 0.2;

    var bodyDef = new b2BodyDef;
    //rope and fly man body filter
    var ropeFilter = new b2FilterData();
    ropeFilter.groupIndex=-1;
    //create ground
    bodyDef.type = b2Body.b2_staticBody;
    fixDef.shape = new b2PolygonShape;
    fixDef.shape.SetAsBox(99999, 2);
    bodyDef.position.Set(10, 18);
    world.CreateBody(bodyDef).CreateFixture(fixDef);
    fixDef.shape = new b2PolygonShape;
    fixDef.shape.SetAsBox(0.1, 999);
    bodyDef.position.Set(-0.7, 0);
    world.CreateBody(bodyDef).CreateFixture(fixDef);
    
    //create fly man
    bodyDef.type = b2Body.b2_dynamicBody;
    fixDef.density = 1.0;
    //body
    fixDef.shape = new b2PolygonShape;
    fixDef.shape.SetAsBox(0.3, 0.5);
    bodyDef.position.Set(3, 1);
    fixDef.filter=ropeFilter;
    bodyFlyManBody=world.CreateBody(bodyDef);
    bodyFlyManBody.SetUserData("body");
    bodyFlyManBody.CreateFixture(fixDef);
    //head
    fixDef.density = 0.4;
    fixDef.shape = new b2CircleShape(0.8);
    bodyDef.position.Set(3, 1);
    fixDef.filter=ropeFilter;
    bodyFlyManHead=world.CreateBody(bodyDef);
    bodyFlyManHead.SetUserData("head");
    bodyFlyManHead.CreateFixture(fixDef);
    fixDef.density = 1.0;
    //connect head and body
    var rj = new b2RevoluteJointDef();
    rj.bodyA=bodyFlyManHead;
    rj.bodyB=bodyFlyManBody;
    rj.localAnchorA=new b2Vec2(0,-0.4);
    rj.localAnchorB=new b2Vec2(0,0.5);
    rj.enableLimit=true;
    rj.lowerAngle=-0.2;
    rj.upperAngle=0.2;
    jointBodyHead=world.CreateJoint(rj);
    //right forearm
    fixDef.shape = new b2PolygonShape;
    fixDef.shape.SetAsBox(0.1, 0.5);
    bodyDef.position.Set(3, 1);
    fixDef.filter=ropeFilter;
    bodyFlyManForearmR=world.CreateBody(bodyDef);
    bodyFlyManForearmR.CreateFixture(fixDef);
    //right upper arm
    fixDef.shape = new b2PolygonShape;
    fixDef.shape.SetAsBox(0.1, 0.4);
    bodyDef.position.Set(3, 1);
    fixDef.filter=ropeFilter;
    bodyFlyManUpperarmR=world.CreateBody(bodyDef);
    bodyFlyManUpperarmR.CreateFixture(fixDef);
    //connect right arm
    var rj = new b2RevoluteJointDef();
    rj.bodyA=bodyFlyManForearmR;
    rj.bodyB=bodyFlyManUpperarmR;
    rj.localAnchorA=new b2Vec2(0.05,-0.25);
    rj.localAnchorB=new b2Vec2(0.05,0.2);
    world.CreateJoint(rj);
    //connect right arm and body
    var rj = new b2RevoluteJointDef();
    rj.bodyA=bodyFlyManBody;
    rj.bodyB=bodyFlyManUpperarmR;
    rj.localAnchorA=new b2Vec2(0.05,0.25);
    rj.localAnchorB=new b2Vec2(0.05,-0.2);
    jointBodyArmR=world.CreateJoint(rj);
    //left forearm
    fixDef.shape = new b2PolygonShape;
    fixDef.shape.SetAsBox(0.1, 0.5);
    bodyDef.position.Set(3, 1);
    fixDef.filter=ropeFilter;
    bodyFlyManForearmL=world.CreateBody(bodyDef);
    bodyFlyManForearmL.CreateFixture(fixDef);
    //left upper arm
    fixDef.shape = new b2PolygonShape;
    fixDef.shape.SetAsBox(0.1, 0.4);
    bodyDef.position.Set(3, 1);
    fixDef.filter=ropeFilter;
    bodyFlyManUpperarmL=world.CreateBody(bodyDef);
    bodyFlyManUpperarmL.CreateFixture(fixDef);
    //connect left arm
    var rj = new b2RevoluteJointDef();
    rj.bodyA=bodyFlyManForearmL;
    rj.bodyB=bodyFlyManUpperarmL;
    rj.localAnchorA=new b2Vec2(0.05,-0.25);
    rj.localAnchorB=new b2Vec2(0.05,0.2);
    world.CreateJoint(rj);
    //connect left arm and body
    var rj = new b2RevoluteJointDef();
    rj.bodyA=bodyFlyManBody;
    rj.bodyB=bodyFlyManUpperarmL;
    rj.localAnchorA=new b2Vec2(0.05,0.25);
    rj.localAnchorB=new b2Vec2(0.05,-0.2);
    jointBodyArmL=world.CreateJoint(rj);
    //right upper leg
    fixDef.shape = new b2PolygonShape;
    fixDef.shape.SetAsBox(0.1, 0.5);
    bodyDef.position.Set(3, 1);
    fixDef.filter=ropeFilter;
    bodyFlyManUpperLegR=world.CreateBody(bodyDef);
    bodyFlyManUpperLegR.CreateFixture(fixDef);
    //right lower leg
    fixDef.shape = new b2PolygonShape;
    fixDef.shape.SetAsBox(0.1, 0.4);
    bodyDef.position.Set(3, 1);
    fixDef.filter=ropeFilter;
    bodyFlyManLowerLegR=world.CreateBody(bodyDef);
    bodyFlyManLowerLegR.CreateFixture(fixDef);
    //connect lower and upper right leg
    var rj = new b2RevoluteJointDef();
    rj.bodyA=bodyFlyManUpperLegR;
    rj.bodyB=bodyFlyManLowerLegR;
    rj.localAnchorA=new b2Vec2(0,-0.5);
    rj.localAnchorB=new b2Vec2(0,0.4);
    world.CreateJoint(rj);
    //connect leg and body
    var rj = new b2RevoluteJointDef();
    rj.bodyA=bodyFlyManUpperLegR;
    rj.bodyB=bodyFlyManBody;
    rj.localAnchorA=new b2Vec2(0,0.5);
    rj.localAnchorB=new b2Vec2(0,-0.5);
    jointBodyLegR=world.CreateJoint(rj);
    //left leg
    fixDef.shape = new b2PolygonShape;
    fixDef.shape.SetAsBox(0.1, 0.5);
    bodyDef.position.Set(3, 1);
    fixDef.filter=ropeFilter;
    bodyFlyManUpperLegL=world.CreateBody(bodyDef);
    bodyFlyManUpperLegL.CreateFixture(fixDef);
    //left lower leg
    fixDef.shape = new b2PolygonShape;
    fixDef.shape.SetAsBox(0.1, 0.4);
    bodyDef.position.Set(3, 1);
    fixDef.filter=ropeFilter;
    bodyFlyManLowerLegL=world.CreateBody(bodyDef);
    bodyFlyManLowerLegL.CreateFixture(fixDef);
    //connect lower and upper right leg
    var rj = new b2RevoluteJointDef();
    rj.bodyA=bodyFlyManUpperLegL;
    rj.bodyB=bodyFlyManLowerLegL;
    rj.localAnchorA=new b2Vec2(0,-0.5);
    rj.localAnchorB=new b2Vec2(0,0.4);
    world.CreateJoint(rj);
    //connect leg and body
    var rj = new b2RevoluteJointDef();
    rj.bodyA=bodyFlyManUpperLegL;
    rj.bodyB=bodyFlyManBody;
    rj.localAnchorA=new b2Vec2(0,0.5);
    rj.localAnchorB=new b2Vec2(0,-0.5);
    jointBodyLegL=world.CreateJoint(rj);
    joints=[jointBodyHead,jointBodyLegR,jointBodyLegL,jointBodyArmR,jointBodyArmL];
    //create rope
    //first node
    bodyDef.type = b2Body.b2_staticBody;
    fixDef.density = 0.2;
    var tb1,tb2;
    bodyDef.position.x = 13;
    bodyDef.position.y = 1;
    var radius=0.5;
    fixDef.shape = new b2CircleShape(radius);
    tb1=world.CreateBody(bodyDef);
    //rest node
    bodyDef.type = b2Body.b2_dynamicBody;
    fixDef.shape = new b2CircleShape(radius);
    tb1.CreateFixture(fixDef);
    linelist = [tb1];
     for(var i = 1; i < 10; ++i) {
       fixDef.shape = new b2CircleShape(radius);
        bodyDef.position.x = 13-i;
        bodyDef.position.y = 1;
        fixDef.filter=ropeFilter;
        tb2=world.CreateBody(bodyDef);
        tb2.CreateFixture(fixDef);
        var rj = new b2RevoluteJointDef();
        rj.bodyA=tb1;
        rj.bodyB=tb2;
        if(i==1){
            rj.localAnchorA=new b2Vec2(0,0);
            rj.localAnchorB=new b2Vec2(0,radius);
        }else{
            rj.localAnchorA=new b2Vec2(0,-radius);
            rj.localAnchorB=new b2Vec2(0,radius);
        }
        world.CreateJoint(rj);
        linelist[i]=tb2;
        tb1=tb2;
     }
     //connect fly man to rope
     var rj = new b2RevoluteJointDef();
     rj.bodyA=tb2;
     rj.bodyB=bodyFlyManForearmR;
     rj.localAnchorA=new b2Vec2(0,-radius);
     rj.localAnchorB=new b2Vec2(0,0.5);
     world.CreateJoint(rj);
     
     //setup debug draw
     var debugDraw = new b2DebugDraw();
        debugDraw.SetSprite(document.getElementById("cvs").getContext("2d"));
        debugDraw.SetDrawScale(30.0);
        debugDraw.SetFillAlpha(0.5);
        debugDraw.SetLineThickness(1.0);
        debugDraw.SetFlags(b2DebugDraw.e_shapeBit | b2DebugDraw.e_jointBit);
        world.SetDebugDraw(debugDraw);
     
    timeID=window.setInterval(update, 1000 / 60);
     //mouse
    var mouseX, mouseY, mousePVec, isMouseDown, selectedBody, mouseJoint;
    var canvasPosition = getElementPosition(document.getElementById("cvs"));
    function isClickOnBuilding(e){
        var x = e.clientX - canvasPosition.x;
        var y = e.clientY - canvasPosition.y + getPageScrollY();
        if(y>0&&y<480&&x>0&&x<960){
            for(var i=0;i<5;++i){
                var imgnum=map[buildingIndex-i];
                var imgt=imgs[imgnum];
                context.drawImage(imgt,(buildingIndex-i)*320-(offsetX+12)*30,480-imgt.height+offsetY*30);
                var startX=(buildingIndex-i)*320-(offsetX+12)*30;
                var startY=480-imgt.height+offsetY*30;
                if(x>(startX+20)&&x<startX+imgt.width&&y>startY&&y<480){
                    return true;
                }
            }
            return false;
        }
        return false;
    }
     
    clickListener=function(e) {
    isMouseDown = true;
    handleMouseMove(e);
    if(isAlive){
        if(linelist.length>0){
            for(var i=0;i<linelist.length;++i){
                world.DestroyBody(linelist[i]);
            }
            linelist=[];
        }else{
            if(isClickOnBuilding(e)){
                var pos = bodyFlyManBody.GetPosition();
                bodyDef.position.x = mouseX;
                bodyDef.position.y = mouseY;
                bodyDef.type = b2Body.b2_staticBody;
                fixDef.shape = new b2CircleShape(radius);
                tb1=world.CreateBody(bodyDef);
                tb1.CreateFixture(fixDef);
                linelist = [tb1];
                bodyDef.type = b2Body.b2_dynamicBody;
                var px = mouseX, py = mouseY;
                var dx = pos.x - mouseX;
                var dy = pos.y - mouseY;
                var incX = 0, incY = 0;
                var epsl = Math.abs(dx) > Math.abs(dy) ? Math.abs(dx) : Math.abs(dy);  
                incX = dx / epsl;
                incY = dy / epsl;
                context.moveTo(px*30,py*30);
                for (var i = 0; i < epsl; i++) {
                    fixDef.shape = new b2CircleShape(radius);
                    bodyDef.position.x = px+0.5;
                    bodyDef.position.y = py+0.5;
                    tb2=world.CreateBody(bodyDef);
                    tb2.CreateFixture(fixDef);
                    var rj = new b2RevoluteJointDef();
                    rj.bodyA=tb1;
                    rj.bodyB=tb2;
                    if(i==0){
                        rj.localAnchorA=new b2Vec2(0,0);
                        rj.localAnchorB=new b2Vec2(0,radius);
                    }else{
                        rj.localAnchorA=new b2Vec2(0,-radius);
                        rj.localAnchorB=new b2Vec2(0,radius);
                    }
                    world.CreateJoint(rj);
                    linelist[i+1]=tb2;
                    tb1=tb2;
                    px += incX;
                    py += incY;
                }
                //connect fly man to rope
                 var rj = new b2RevoluteJointDef();
                 rj.bodyA=tb2;
                 rj.bodyB=bodyFlyManForearmR;
                 rj.localAnchorA=new b2Vec2(0,-radius);
                 rj.localAnchorB=new b2Vec2(0,0.5);
                 world.CreateJoint(rj);
                 bodyFlyManBody.SetLinearVelocity(new b2Vec2(-19,25));
            }
        }
    }else{
        x = e.clientX - canvasPosition.x;
        y = e.clientY - canvasPosition.y + getPageScrollY();
        //400, 350, 160, 50
        if(x>400&&x<560&&y>350&&y<400){
            restart();
        }
    }
    document.addEventListener("mousemove", handleMouseMove, true);
 };
     document.addEventListener("mousedown", clickListener, true);
     
     document.addEventListener("mouseup", function() {
        document.removeEventListener("mousemove", handleMouseMove, true);
        isMouseDown = false;
        mouseX = undefined;
        mouseY = undefined;
     }, true);
     
     function handleMouseMove(e) {
        mouseX = (e.clientX - canvasPosition.x) / 30 + offsetX;
        mouseY = (e.clientY - canvasPosition.y + getPageScrollY()) / 30 - offsetY;
     };

     function getBodyCB(fixture) {
        if(fixture.GetBody().GetType() != b2Body.b2_staticBody) {
           if(fixture.GetShape().TestPoint(fixture.GetBody().GetTransform(), mousePVec)) {
              selectedBody = fixture.GetBody();
              return false;
           }
        }
        return true;
     }
     
     
     function draw(){
         context.clearRect(0, 0, 960, 480);
         buildingIndex=Math.floor(((offsetX+12)*30+960)/320);
         if(buildingIndex<=3){
             offsetX=-1;
         }
         for(var i=0;i<5;++i){//draw buildings (map)
            var screenIndex=(offsetX+20)/32;
            var imgNum=map[buildingIndex-i];
            if(buildingIndex<=3){
                if(buildingIndex-i>=0){
                    imgNum=map[buildingIndex-i];
                }else{
                    imgNum=map[0];
                }
            }
            var img=imgs[imgNum]; 
            context.drawImage(img,(buildingIndex-i)*320-(offsetX+12)*30,480-img.height+offsetY*30);
            if(buildingIndex-screenCounter>5){
                screenCounter++;
                map[map.length]=Math.floor(Math.random()*8);
            }
        }
        var pos;
        var pos1;
        for(var i=0;i<linelist.length-1;++i){ //draw rope
            pos = linelist[i].GetPosition();
            pos1 = linelist[i+1].GetPosition();
            context.beginPath();
            context.moveTo(pos.x*30-offsetX*30,pos.y*30+offsetY*30);
            context.lineTo(pos1.x*30-offsetX*30,pos1.y*30+offsetY*30);
            context.closePath();
            context.stroke();
        }
        if(linelist.length!=0){
            var posArm=bodyFlyManForearmR.GetPosition();
            context.beginPath();
            context.moveTo(pos1.x*30-offsetX*30,pos1.y*30+offsetY*30);
            context.lineTo(posArm.x*30-offsetX*30,posArm.y*30+offsetY*30);
            context.closePath();
            context.stroke();
        }
        //draw fly man
        //left side
        //left arm
        var fPos=bodyFlyManForearmL.GetPosition();
        var angle=bodyFlyManForearmL.GetAngle();
        context.translate(fPos.x*30-offsetX*30,fPos.y*30+offsetY*30);
        context.rotate(angle);
        context.drawImage(imgFlyManForarm,-6,-15,12,30);
        context.rotate(-angle);
        context.translate(-fPos.x*30+offsetX*30,-fPos.y*30-offsetY*30);
        
        var fPos=bodyFlyManUpperarmL.GetPosition();
        var angle=bodyFlyManUpperarmL.GetAngle();
        context.translate(fPos.x*30-offsetX*30,fPos.y*30+offsetY*30);
        context.rotate(angle);
        context.drawImage(imgFlyManUpperarm,-6,-12,12,24);
        context.rotate(-angle);
        context.translate(-fPos.x*30+offsetX*30,-fPos.y*30-offsetY*30);
        //left leg
        var fPos=bodyFlyManLowerLegL.GetPosition();
        var angle=bodyFlyManLowerLegL.GetAngle();
        context.translate(fPos.x*30-offsetX*30,fPos.y*30+offsetY*30);
        context.rotate(angle);
        context.drawImage(imgFlyManLowerLeg,-20,-12,24,24);
        context.rotate(-angle);
        context.translate(-fPos.x*30+offsetX*30,-fPos.y*30-offsetY*30);
        
        var fPos=bodyFlyManUpperLegL.GetPosition();
        var angle=bodyFlyManUpperLegL.GetAngle();
        context.translate(fPos.x*30-offsetX*30,fPos.y*30+offsetY*30);
        context.rotate(angle);
        context.drawImage(imgFlyManUpperLeg,-6,-15,12,30);
        context.rotate(-angle);
        context.translate(-fPos.x*30+offsetX*30,-fPos.y*30-offsetY*30);
        //body
        var fPos=bodyFlyManBody.GetPosition();
        var angle=bodyFlyManBody.GetAngle();
        context.translate(fPos.x*30-offsetX*30,fPos.y*30+offsetY*30);
        context.rotate(angle);
        context.drawImage(imgFlyManBody,-9,-15,18,30);
        context.rotate(-angle);
        context.translate(-fPos.x*30+offsetX*30,-fPos.y*30-offsetY*30);
        //head
        var fPos=bodyFlyManHead.GetPosition();
        var angle=bodyFlyManHead.GetAngle()-3.14;
        context.translate(fPos.x*30-offsetX*30,fPos.y*30+offsetY*30);
        context.rotate(angle);
        context.drawImage(imgFlyManHead,-24,-24,48,48);
        context.rotate(-angle);
        context.translate(-fPos.x*30+offsetX*30,-fPos.y*30-offsetY*30);
        //right arm
        var fPos=bodyFlyManForearmR.GetPosition();
        var angle=bodyFlyManForearmR.GetAngle();
        context.translate(fPos.x*30-offsetX*30,fPos.y*30+offsetY*30);
        context.rotate(angle);
        context.drawImage(imgFlyManForarm,-6,-15,12,30);
        context.rotate(-angle);
        context.translate(-fPos.x*30+offsetX*30,-fPos.y*30-offsetY*30);
        
        var fPos=bodyFlyManUpperarmR.GetPosition();
        var angle=bodyFlyManUpperarmR.GetAngle();
        context.translate(fPos.x*30-offsetX*30,fPos.y*30+offsetY*30);
        context.rotate(angle);
        context.drawImage(imgFlyManUpperarm,-6,-12,12,24);
        context.rotate(-angle);
        context.translate(-fPos.x*30+offsetX*30,-fPos.y*30-offsetY*30);
        //right leg
        var fPos=bodyFlyManLowerLegR.GetPosition();
        var angle=bodyFlyManLowerLegR.GetAngle();
        context.translate(fPos.x*30-offsetX*30,fPos.y*30+offsetY*30);
        context.rotate(angle);
        context.drawImage(imgFlyManLowerLeg,-20,-12,24,24);
        context.rotate(-angle);
        context.translate(-fPos.x*30+offsetX*30,-fPos.y*30-offsetY*30);
        
        var fPos=bodyFlyManUpperLegR.GetPosition();
        var angle=bodyFlyManUpperLegR.GetAngle();
        context.translate(fPos.x*30-offsetX*30,fPos.y*30+offsetY*30);
        context.rotate(angle);
        context.drawImage(imgFlyManUpperLeg,-6,-15,12,30);
        context.rotate(-angle);
        context.translate(-fPos.x*30+offsetX*30,-fPos.y*30-offsetY*30);
        
        //draw distance
        context.fillStyle = "#fff";
        context.fillText("Distance: "+Math.floor(distanceTraveled-22)+"m",800,80);
        if(!isAlive){
            context.shadowOffsetX = 10;
            context.shadowOffsetY = 10;
            context.shadowColor = 'rgba(100,100,100,0.5)';
            context.shadowBlur = 1.5;
            context.fillStyle = 'rgba(255,0,0,0.5)';
            context.fillRect(240, 100, 480, 50);
            context.fillRect(240, 160, 480, 120);
            context.fillStyle = "#fff";
            context.fillText("You Died !",440,130);
            context.fillText("Your Distance: " + Math.floor(distanceTraveled-22)+"m",400,205);
            context.fillText("Best: " + highScore+"m",400,245);
            context.shadowOffsetX = 0;
            context.shadowOffsetY = 0;
            context.fillStyle = 'rgba(0,0,0,0.5)';
            context.fillRect(400, 350, 160, 50);
            context.fillStyle = "#fff";
            context.fillText("Play Again",430,380);
        }
     }
     //update
     
     function update() {
        bodyVelY=bodyFlyManBody.GetLinearVelocity().y;
        if(bodyVelY>0){
            bodyFlyManBody.ApplyForce(new b2Vec2(0,40),bodyFlyManBody.GetWorldCenter());
        }
        if(mouseJoint) {
           if(isMouseDown) {
              mouseJoint.SetTarget(new b2Vec2(mouseX, mouseY));
           } else {
              world.DestroyJoint(mouseJoint);
              mouseJoint = null;
           }
        }
     
        world.Step(1 / 60, 10, 10);
        
        var posE=bodyFlyManBody.GetPosition();
        height=19-posE.y;
        offsetX=posE.x-12;
        //calculate travelled distance
        if(isAlive&&posE.x>distanceTraveled){
            distanceTraveled=posE.x;
        }
        if(height>offsetYstart){
            offsetY=height-offsetYstart;
        }else{
            offsetY=0;
        }
        //destroy joints when hit ground
        if(posE.y>15||bodyFlyManHead.GetPosition().y>15){
            for(var i=0;i<joints.length;i++){
                var force=Math.abs(joints[i].GetReactionForce(1/60).x)+Math.abs(joints[i].GetReactionForce(1/60).y);
                if(force>0.1){
                    world.DestroyJoint(joints[i]);
                }
            }
        }
        //world.DrawDebugData();
        draw();
        world.ClearForces();
     };
     
     //helpers
     
     //http://js-tut.aardon.de/js-tut/tutorial/position.html
     function getElementPosition(element) {
        var elem=element, tagname="", x=0, y=0;
        while((typeof(elem) == "object") && (typeof(elem.tagName) != "undefined")) {
           y += elem.offsetTop;
           x += elem.offsetLeft;
           tagname = elem.tagName.toUpperCase();
           if(tagname == "BODY")
              elem=0;
           if(typeof(elem) == "object") {
              if(typeof(elem.offsetParent) == "object")
                 elem = elem.offsetParent;
           }
        }
        return {x: x, y: y};
     }
  };
 
function restart(){
    window.clearInterval(timeID);
    world.ClearForces();
    var bodyTemp=world.GetBodyList();
    var bodies=[bodyTemp];
    while(bodyTemp.GetNext()!=null){
        bodies[bodies.length]=bodyTemp.GetNext();
        bodyTemp=bodyTemp.GetNext();
    }
    for(var i=0;i<bodies.length;i++){
        world.DestroyBody(bodies[i]);
    }
    screenCounter=0;
    offsetY=0;
    offsetX=0;
    buildingIndex=4;
    offsetYstart=10;
    height=0;
    distanceTraveled=0;
    isAlive=true;
    linelist=[];
    map=[];
    offsetY=0;
    offsetX=0;
    world=null;
    isDistanceSubmited=false;
    document.removeEventListener("mousedown", clickListener, true);
    startGame();
};

function getPageScrollY() {
    if (self.pageYOffset) {
        return self.pageYOffset;
    } else if (document.documentElement && document.documentElement.scrollTop) {     // Explorer 6 Strict
        return document.documentElement.scrollTop;
    } else if (document.body) {// all other Explorers
        return document.body.scrollTop;
    }
};