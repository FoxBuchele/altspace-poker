function errorMessage(configObj){
    this.timeToDisappear = configObj.timeToDisappear;
    this.messageType = configObj.messageType || 0;
    this.message = configObj.message;
    
    this.messagePos = configObj.pos;
    this.messageRot = configObj.rot || new THREE.Quaternion();
    if(typeof configObj.scale !== 'undefined'){
        this.scale = new THREE.Vector3(configObj.scale, configObj.scale, configObj.scale);
    }else{
        this.scale = new THREE.Vector3(1, 1, 1);
    }
    
    this.arrowSide = configObj.arrowSide || "down";
    
    this.moveDirection = new THREE.Vector3(0, 50, 0);
    
    displayMessage(this);
    
}

function displayMessage(errorMessage){
    
    
    errorMessage.mesh = createMessage(errorMessage.message, errorMessage.messageType, errorMessage.arrowSide);
    
    sim.scene.add(errorMessage.mesh);
    
    errorMessage.mesh.quaternion.copy(errorMessage.messageRot);
    
    var toPos = new THREE.Vector3();
    var fromPos = new THREE.Vector3();
    toPos.copy(errorMessage.messagePos);
    fromPos.copy(errorMessage.messagePos);
    
    errorMessage.mesh.scale.copy(errorMessage.scale);
    
    errorMessage.moveDirection.multiplyScalar(errorMessage.scale.x);
    
    toPos.add(errorMessage.moveDirection);
    
    
    var toPointTween = new TWEEN.Tween(fromPos).to(toPos, 1000);
    toPointTween.onUpdate(function(){
        errorMessage.mesh.position.copy(fromPos);
    });
    
    toPointTween.easing(TWEEN.Easing.Elastic.InOut);
    
    window.setTimeout(function(){
        sim.scene.remove(errorMessage.mesh);
    }, errorMessage.timeToDisappear);
    
    toPointTween.start();
    /*var toPlayerTween = new TWEEN.Tween(thisCard.movementTween.position).to({x:toObj.position.x, z: toObj.position.z}, 2000);
            toPlayerTween.onUpdate((function(card){
              return function(value1){
                  //move the cards to the player
                card.geom.position.copy(card.movementTween.position);
              }
            }(thisCard)));
  
            toPlayerTween.onComplete((function(card, hand){
              return function(value1){
                
                //add the cards to the 'hand' object
                
                THREE.SceneUtils.attach(card.geom, sim.scene, hand);
                hand.updateMatrixWorld();
                 
                //our position has updated, so lets update the movementTween
                card.movementTween.position.copy(card.geom.position); 
                card.movementTween.rotation.set(card.geom.rotation.x, card.geom.rotation.y, card.geom.rotation.z);

                
              }
            }(thisCard, toObj)));*/
}

function createMessage(text, type, direction){
    var canvasEl = document.createElement('canvas');
    canvasEl.width = 200;
    canvasEl.height = 100;
    var textArea = canvasEl.getContext('2d');
    textArea.font = "42px Arial";
    //check to see if we need to resize the canvas
    if(textArea.measureText(text).width > canvasEl.width){
        canvasEl.width = textArea.measureText(text).width + 40;
        console.log(canvasEl.width);
        textArea = canvasEl.getContext('2d');
        textArea.font = "42px Arial";
    }
    
    textArea.textAlign = "center";

    
    var fillColor;
    var textColor;
    
    switch(type){
        case 0:
            //error message
            fillColor = "rgba(232, 27, 27, 1)";
            textColor = "rgba(255,255,255,1)";
            break;
        case 1:
            //info message
            fillColor = "rgba(134, 175, 217, 1)";
            textColor = "rgba(255, 255, 255, 1)";
            break;
        case 2:
            //bet message
            fillColor = "rgba(0, 153, 0, 1)";
            textColor = "rgba(255, 255, 255, 1)";
            break;
        case 3:
            //winning hand cardInfo
            fillColor = "rgba(255, 255, 255, 1)";
            textColor = "rgba(0, 0, 0, 1)";
            break;
        default:
            console.error("No message color specified for message type ", type);
            break;
    }
    
    textArea.fillStyle = fillColor;
    textArea.beginPath();
    textArea.rect(0, 0, canvasEl.width, canvasEl.height);
    textArea.fill();
    //textArea.fillRect(0, 0, canvasEl.width, canvasEl.height);
    
    textArea.fillStyle = textColor;
    textArea.textBaseline = "middle";
    textArea.fillText(text, canvasEl.width/2, canvasEl.height/2);
    
    var material = new THREE.MeshBasicMaterial({map: new THREE.Texture(canvasEl)});
    var meshfront = new THREE.Mesh(new THREE.PlaneGeometry(canvasEl.width/3, canvasEl.height/3), material);
    var meshback = new THREE.Mesh(new THREE.PlaneGeometry(canvasEl.width/3, canvasEl.height/3), material);
    var meshArrow = createMessagePointer(canvasEl, fillColor, direction);
    
    meshback.rotation.set(0, Math.PI, 0);
    meshfront.position.z += 0.2;
    meshback.position.z -= 0.2;
    
    var holder = new THREE.Object3D();
    holder.add(meshfront);
    holder.add(meshback);
    holder.add(meshArrow);
    
    return holder;
}

function createMessagePointer(canvas, color, direction){
    
    //color = "rgba(0, 0, 0, 1)";
    
    var material = new THREE.MeshBasicMaterial({color: rgb2hex(color)});
    var size = 15; 
    var meshfront = new THREE.Mesh(new THREE.PlaneGeometry(size, size), material);
    var meshback = new THREE.Mesh(new THREE.PlaneGeometry(size, size), material);
    meshback.rotation.set(0, Math.PI, 0);
    meshfront.position.z += 0.1;
    meshback.position.z -= 0.1;
    
    var holder = new THREE.Object3D();
    holder.add(meshfront);
    holder.add(meshback);
    
    holder.rotation.set(0, 0, Math.PI/4);
    switch(direction){
        case "down":
            holder.position.set(0, -(canvas.height/6), 0);
            break;
        case "up":
            holder.position.set(0, (canvas.height/6), 0);
            break;
        case "left":
            holder.position.set(-(canvas.width/6), 0, 0);
            break;
        case "right":
            holder.position.set((canvas.width/6), 0, 0);
            break;
        default:
            console.error("no offset defined for error message arrow direction", direction);
            break;
            
    }
    
    
    return holder;
}

                                               
function rgb2hex(rgb){
 rgb = rgb.match(/^rgba?[\s+]?\([\s+]?(\d+)[\s+]?,[\s+]?(\d+)[\s+]?,[\s+]?(\d+)[\s+]?/i);
 return (rgb && rgb.length === 4) ? "#" +
  ("0" + parseInt(rgb[1],10).toString(16)).slice(-2) +
  ("0" + parseInt(rgb[2],10).toString(16)).slice(-2) +
  ("0" + parseInt(rgb[3],10).toString(16)).slice(-2) : '';
}


function optionsUI(player){
    this.mesh = new THREE.Object3D();
    var slideOut = theGame.models.MenuSidepanel.clone();
    var slideOutContainer = new THREE.Object3D();
    
    slideOutContainer.position.z += 5;
    slideOutContainer.rotation.x = -Math.PI/2;
    slideOutContainer.rotation.x += Math.PI/5;
   // slideOut.rotation.set(0, Math.PI/2, 0);
    //slideOut.rotation.y += Math.PI/5;
    slideOutContainer.rotation.z = -Math.PI/2;
    slideOutContainer.position.y -= 120;
    slideOutContainer.position.x += 80;

    slideOut.scale.set(400, 200, 200);
    slideOutContainer.add(slideOut);
    
    /*
    
      refresh page
      lock users
      adjust money (stretch)
    
    */
    
    var lockButton = new THREE.Mesh(new THREE.PlaneGeometry(20, 20), lockMaterial);
    lockButton.position.x += 85;
    lockButton.position.y += 10;
    lockButton.position.z += 5;
    lockButton.rotation.z = Math.PI/2;
    slideOutContainer.add(lockButton);
    
    
   var refreshButton = new THREE.Mesh(new THREE.PlaneGeometry(30, 30), refreshMaterial);
    refreshButton.position.y -= 200;
    refreshButton.position.z += 80;
    refreshButton.rotation.x = -Math.PI/5;
    this.mesh.add(refreshButton);
    
    refreshButton.addBehaviors({
        awake: function(obj){
                console.log('refresh button is active!', obj)
                obj.addEventListener('cursordown', function(){
                    console.log('reload the page!');
                    location.reload();
                });
        }
    })
    refreshButton.updateBehaviors(0);
    
    this.mesh.add(slideOutContainer);

    
}

var refreshImg = document.createElement('img');
    refreshImg.src = "assets/refresh.png";
    refreshImg.threeTex = new THREE.Texture(refreshImg);
var refreshMaterial = new THREE.MeshBasicMaterial({map:refreshImg.threeTex});

var lockImg = document.createElement('img');
    lockImg.src = "assets/lock.png";
    lockImg.threeTex = new THREE.Texture(lockImg);
var lockMaterial = new THREE.MeshBasicMaterial({map:lockImg.threeTex});

var plusImg = document.createElement('img');
plusImg.src = "assets/plus.png";
plusImg.threeTex = new THREE.Texture(plusImg);

var minusImg = document.createElement('img');
minusImg.src = "assets/minus.png";
minusImg.threeTex = new THREE.Texture(minusImg);

var addMaterial = new THREE.MeshBasicMaterial({map:plusImg.threeTex});
var removeMaterial = new THREE.MeshBasicMaterial({map:minusImg.threeTex});

var betImg = {
  img: document.createElement('img'),
  outImg: document.createElement('img')
};
betImg.outImg.src = "assets/betUI-bet2.png";
betImg.img.src = "assets/betUI-bet.png";
betImg.threeMat = new THREE.MeshBasicMaterial({map:new THREE.Texture(betImg.img)});

var foldImg = {
  img: document.createElement('img'),
  outImg: document.createElement('img')
};
foldImg.outImg.src = "assets/betUI-fold2.png";
foldImg.img.src = "assets/betUI-fold.png";
foldImg.threeMat = new THREE.MeshBasicMaterial({map:new THREE.Texture(foldImg.img)});

var inImg = {
  img: document.createElement('img'),
  outImg: document.createElement('img')
};
inImg.outImg.src = "assets/betUI-all_In.png";
inImg.img.src = "assets/betUI-all_In.png";
inImg.threeMat = new THREE.MeshBasicMaterial({map:new THREE.Texture(inImg.img)});


function bettingUI(player){
      this.canvasEl = document.createElement('canvas');
      this.canvasEl.width = 218;
      this.canvasEl.height = 63;
      this.textArea = this.canvasEl.getContext('2d');
      //document.body.appendChild(canvasEl);
      this.fontSize = 32;
      this.fontPadding = (63/2 + 32/2) - 5;
      this.textArea.font = this.fontSize+"px Arial";
      //this.textArea.fillStyle = "rgba(255,255,255, 1)";
      this.element = this.canvasEl;
      this.textArea.textAlign = "center";
      //this.textArea.fillText("BET", this.element.width/2, this.fontSize);
      //this.textArea.fill();

     // this.textArea.beginPath();
      //this.textArea.rect(0, 60, 150, 150); 
      //this.textArea.fillStyle = "grey";
      //this.textArea.fill(); 

      //set the color back to white
      this.textArea.fillStyle = "rgba(255,255,255, 1)";


      this.material = new THREE.MeshBasicMaterial({map: new THREE.Texture(this.element)}); 

      this.countMesh = new THREE.Mesh(new THREE.PlaneGeometry(this.element.width/4, this.element.height/4), this.material);
      this.countMesh.position.y += 18;
      this.countMesh.position.z -= 1.6;
      //this.backMesh = new THREE.Mesh(new THREE.PlaneGeometry(this.element.width/4, this.element.height/4), this.material);
      //this.backMesh.rotation.set(0, Math.PI, 0);
      //this.backMesh.position.z -= 0.1;
    
      this.mainMesh = theGame.models.Menu.clone();
      this.mainMesh.scale.set(200, 200, 200);
      this.mainMesh.position.z -= 7;
      this.mesh = new THREE.Object3D();
      //this.mesh.add(this.backMesh);
      this.mesh.add(this.mainMesh);
      this.mesh.add(this.countMesh);
      var spacing = 25; 
      var chLarge = makeChipStack(125, spacing);
      var chSmall = makeChipStack(16, spacing); 
      chLarge.rotation.set(Math.PI/2, Math.PI/2, 0);
      chSmall.rotation.set(Math.PI/2, Math.PI/2, 0);
      chLarge.position.set(0, 0, 0); 
      chSmall.position.set(0, spacing*2, 0);
      var chips = new THREE.Object3D();
      chips.add(chLarge);
      chips.add(chSmall);

      chips.scale.set(0.4, 0.4, 0.4);
      chips.position.set(0, -62, 0);
      this.mesh.add(chips); 
      /*

      white - 1
      red - 5
      blue - 10
      green - 25
      black - 100

      */

      var betButtons = new THREE.Object3D();

      var bd = [10, 5];

      var addButtonArray = [];
      var removeButtonArray = [];
      var ctrlButtonArray = [];

      for(var i=0; i<5; i++){
        var yoffset = 8.5*i;
        var addButton = new THREE.Mesh(new THREE.PlaneGeometry(bd[0], bd[1]), addMaterial);
        addButton.position.x += 25;
        addButton.position.y -= yoffset;
        betButtons.add(addButton);
        addButtonArray.push(addButton);
        var removeButton = new THREE.Mesh(new THREE.PlaneGeometry(bd[0], bd[1]), removeMaterial);
        removeButton.position.y -= yoffset;
        betButtons.add(removeButton);
        removeButtonArray.push(removeButton);
      }

      //make bet, fold, all in buttons

      var ctrlBet = new THREE.Mesh(new THREE.PlaneGeometry(17.2, 25.6), betImg.threeMat);
      var ctrlFold = new THREE.Mesh(new THREE.PlaneGeometry(17.2, 12.8), foldImg.threeMat);
      var ctrlIn = new THREE.Mesh(new THREE.PlaneGeometry(17.2, 12.8), inImg.threeMat);
      ctrlFold.position.set(-17.2, -6.4, 0);
      ctrlIn.position.set(17.2, -6.4, 0);

      var ctrlHolder = new THREE.Object3D();
      ctrlHolder.add(ctrlBet)
      ctrlHolder.add(ctrlFold)
      ctrlHolder.add(ctrlIn)

      ctrlButtonArray = [ctrlFold, ctrlBet, ctrlIn];

      ctrlHolder.position.set(0, 44, 0);
      ctrlHolder.scale.set(1.15, 1.15, 1.15);
      this.mesh.add(ctrlHolder);


      betButtons.scale.set(1.175, 1.175, 1.175);
      betButtons.position.set(-15, 2, 0);
      this.mesh.add(betButtons);

      this.mesh.position.y -= 120; 
      this.mesh.position.x = 80;
      this.mesh.position.z -= 50;

      this.mesh.addBehaviors(new bettingUIInteractions(player, (function(thisUI){
                  return function(t){
                      thisUI.updateBet(t);
                  }
                })(this), [addButtonArray, removeButtonArray, ctrlButtonArray]));
      this.mesh.updateBehaviors(0);
      this.updateBet(0);
}

bettingUI.prototype.updateBet = function(amount){ 
       this.textArea.clearRect(0, 0, 150, 60);
       this.textArea.fillText("$"+amount, this.element.width/2, this.fontPadding);
       this.material.map.needsUpdate = true; 
       this.material.needsUpdate = true; 
}

function bettingUIInteractions(pl, updateBet, buttonArray){
      this.object; 
      this.player = pl;
      this.addArr = buttonArray[0];
      this.subArr = buttonArray[1];
      this.ctrlArray = buttonArray[2];
      this.updateBet = updateBet;

      this.allowedTo = function allowedToDoThis(){
          var allowed = this.player.userId === globalUserId;
                if(!allowed){
                    var handObj = pl.hand;
                    var uiObj = pl.bettingui.mainMesh;
                    var pos = new THREE.Vector3();
                    pos.copy(uiObj.localToWorld(new THREE.Vector3(0, 50, 0)));

                    var quat = uiObj.getWorldQuaternion();



                    var message = "Unauthorized!";
                    var unauthorized = new errorMessage({
                            timeToDisappear: 3000,
                            messageType: 0,
                            message: message,
                            pos: pos,
                            rot: quat,
                            scale: 0.4
                        });
                }
          console.log('did a test and it came back', allowed);
          return allowed;
      
       }
    
      this.awake = function awake(obj){
        this.object = obj;
         this.addArr[0].addEventListener('cursordown', (function(that){
           return function(t){
             that.addMoney(1);
           }
         })(this));
         this.addArr[1].addEventListener('cursordown', (function(that){
           return function(t){
             that.addMoney(5);
           }
         })(this));
         this.addArr[2].addEventListener('cursordown', (function(that){
           return function(t){
             that.addMoney(10);

           }
         })(this));
         this.addArr[3].addEventListener('cursordown', (function(that){
           return function(t){
             that.addMoney(25);
           }
         })(this));
         this.addArr[4].addEventListener('cursordown', (function(that){
           return function(t){
             that.addMoney(100);
           }
         })(this));




        this.subArr[0].addEventListener('cursordown', (function(that){
           return function(t){
             that.addMoney(-1); 
           }
         })(this));
         this.subArr[1].addEventListener('cursordown', (function(that){
           return function(t){
             that.addMoney(-5);
           }
         })(this));
         this.subArr[2].addEventListener('cursordown', (function(that){
           return function(t){
             that.addMoney(-10);
           }
         })(this));
         this.subArr[3].addEventListener('cursordown', (function(that){
           return function(t){
             that.addMoney(-25);
           }
         })(this));
         this.subArr[4].addEventListener('cursordown', (function(that){
           return function(t){
             that.addMoney(-100);
           }
         })(this));




        //fold, bet, all-in

         this.ctrlArray[0].addEventListener('cursordown', (function(that){
           return function(t){
             that.fold();
           }
         })(this));
         this.ctrlArray[1].addEventListener('cursordown', (function(that){
           return function(t){
             that.done();
           }
         })(this));
         this.ctrlArray[2].addEventListener('cursordown', (function(that){
           return function(t){
             that.allIn();
           }
         })(this));
  }
  
  this.addMoney = function addMoney(amount){
    console.log('got a click event');
    if(!this.allowedTo()){return false};
    if(this.player.currentBet + amount <= this.player.money && (this.player.currentBet + amount) >= 0){ //this should be the min bet actually
      if(this.player.currentBet+amount >= theGame.currentBet){
        this.player.currentBet += amount;
        this.updateBet(this.player.currentBet);
      }
    }else{
      console.log('dont have the funds', this.player.currentBet + amount , (this.player.currentBet + amount) >= 0);
    }
  }
  
  this.allIn = function allIn(){ 
    if(!this.allowedTo()){return false};
    this.player.currentBet = this.player.money;
    this.updateBet(this.player.currentBet);
  }
  
  this.done = function done(){
    if(!this.allowedTo()){return false};
    this.player.betUpdate(this.player.currentBet);
    this.updateBet(this.player.currentBet);
  }
  
  this.fold = function fold(){
    if(!this.allowedTo()){return false};
    this.player.foldUpdate();
    this.updateBet(this.player.currentBet);
  } 
}




function addPlayer(ind){
  var index = ind;
  var object; 
  var textObj;
  
  
  function awake(obj){
    object = obj;
    object.addEventListener('cursordown', (function(i){
      return function(){
	  
		
		if(typeof globalUserId != 'undefined'){
			theGame.players[i].state = 0;
			theGame.players[i].userId = globalUserId;
            globalPlayerIndex = i;
			sendUpdate({registerIndex: i, userId: globalUserId, money: theGame.players[i].money}, "registerPlayer");
		}else{
		
			altspace.getUser().then(function(result){
		        globalUserId = result.userId;
				theGame.players[i].state = 0;
				theGame.players[i].userId = globalUserId;
                globalPlayerIndex = i;
				sendUpdate({registerIndex: i, userId: globalUserId, money:theGame.players[i].money}, "registerPlayer");
			});
		}
	  }
    }(index)));
    
  }
  
  return {awake: awake}; 
  
  
}

function startGame(player){
  
  var object;
  var pl = player;
  function awake(obj){
    object = obj;
    object.addEventListener('cursordown', startGame);
    
  }
    
  function allowedToDoThis(){
        var allowed = (pl.userId === globalUserId);
        if(!allowed){
             var pos = new THREE.Vector3();
             pos.copy(object.localToWorld(new THREE.Vector3(0, 50, 0)));

             var quat = object.getWorldQuaternion();



                var message = "Unauthorized!";
                var unauthorized = new errorMessage({
                        timeToDisappear: 3000,
                        messageType: 0,
                        message: message,
                        pos: pos,
                        rot: quat,
                        scale: 0.4
                    });
        }else if(numActivePlayers() < 2){
            var pos = new THREE.Vector3();
             pos.copy(object.localToWorld(new THREE.Vector3(0, 20, 0)));

             var quat = object.getWorldQuaternion();



                var message = "Need more players!";
                var unauthorized = new errorMessage({
                        timeToDisappear: 2000,
                        messageType: 0,
                        message: message,
                        pos: pos,
                        rot: quat,
                        scale: 0.4
                    });
        }
      
         console.log(pl);
          return (allowed && (numActivePlayers() >= 2));
      
  }
  
  function startGame(){
      
      
      if(allowedToDoThis()){
        theGame.step = 0;//do the initialization in the game controller
        //sendUpdate({stepUpdate: 0}, "startGame");
        theGame.runStep();
      }
   }
  
  return {awake: awake};
  
  
}



function makeStartGameButton(player){
  var canvasEl = document.createElement('canvas');
  canvasEl.width = 250;
  canvasEl.height = 75;
  var canvasCtx = canvasEl.getContext('2d');
  //document.body.appendChild(canvasEl);
  this.fontSize = 30;
  this.fontPadding = 10;
  canvasCtx.font = this.fontSize+"px Arial";
  canvasCtx.fillStyle = "rgba(255,255,255, 1)";
  this.element = canvasEl; 
  this.textArea = canvasCtx;
  var textureElement = new THREE.Texture(this.element);
  this.material = new THREE.MeshBasicMaterial({map: textureElement}); 
  this.mesh = new THREE.Mesh(new THREE.PlaneGeometry(canvasEl.width/4, canvasEl.height/4), this.material);
  this.textArea.textAlign = "center";
  this.textArea.fillText("Start the game", this.element.width/2, this.element.height/2 + this.fontSize/4);
  
  this.mesh.addBehaviors(startGame(player));
  this.mesh.updateBehaviors(0);
  
  sim.scene.add(this.mesh);
}



function makeJoinButton(index){
   var canvasEl = document.createElement('canvas');
  canvasEl.width = 250;
  canvasEl.height = 75;
  var canvasCtx = canvasEl.getContext('2d');
  //document.body.appendChild(canvasEl);
  this.fontSize = 40;
  this.fontPadding = 10;
  canvasCtx.font = this.fontSize+"px Arial";
  canvasCtx.fillStyle = "rgba(255,255,255, 1)";
  this.element = canvasEl;
  this.textArea = canvasCtx;
  var textureElement = new THREE.Texture(this.element);
  this.material = new THREE.MeshBasicMaterial({map: textureElement});
  this.mesh = new THREE.Mesh(new THREE.PlaneGeometry(canvasEl.width/2, canvasEl.height/2), this.material);
  this.textArea.textAlign = "center";
  this.textArea.fillText("Deal me in", this.element.width/2, this.element.height/2 + this.fontSize/4);
  movePlayerButton(this.mesh, index);
  this.mesh.addBehaviors(addPlayer(index));
  this.mesh.updateBehaviors(0);
  // sim.scene.add(this.mesh);
}




















