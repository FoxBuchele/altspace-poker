(function(){var a = window.altspace; (function insert(ss, t){for(var i in ss) {for (var j in ss[i]) {t[j] = ss[i][j];}};})([a, a.utilities,a.utilities.behaviors, a.utilities.shims], window.alt = {})})();

// Setup
var sim = alt.Simulation({
  auto: false
});
var inCodePen = alt.codePen.inCodePen;
var instanceBase = alt.sync.getInstance({
		instanceId: null//"AltSpacePoker"
});
var sceneSync = alt.SceneSync(instanceBase, {
	instantiators: {},
	ready: ready
});
sim.scene.addBehavior(sceneSync);


var startingMoney = 1337;

var tableOffset = new THREE.Vector3(0, -150, 0)

var potPosition = new THREE.Vector3();
//potPosition.copy(tableOffset);
potPosition.set(150, tableOffset.y, 150);

var cardTemplate = {
  width: 25,
  height: 35, 
  padding: 10 
};


var globalUserId;
var globalUserName;
var globalPlayerIndex = -1;

//function makeGame(){
  //theGame = new game();
  //syncingObject = new THREE.Object3D();
 // syncingObject.addBehaviors(alt.Object3DSync({syncData: true})); 
 // syncingObject.userData.syncData = theGame;//{that:"testThing"};  //theGame;//.players[0];  
 // console.log(syncingObject.userData);
  //theGame.syncTrigger = syncingObject.getBehaviorByType('Object3DSync'); 
  //console.log(theGame.syncTrigger); 
  
  //main();
  //return syncingObject; 
//}
 











function ready(firstInstance) { 
    window.setTimeout(function(){
    
	altspace.getUser().then(function(result){
		globalUserId = result.userId;
		globalUserName = result.displayName;
	})
	
      
     var table = createTable(); 
    console.log(firstInstance);
    theGame = new game();
    theGame.deck = new deck(); 
    for(var i=0; i<4; i++){
       theGame.players.push(new player(i));
    }
    if(firstInstance){ 

        theGame.deck.shuffle(); 
        
        theGame.roundRecord = [{title: "startedLevel", timestamp: Date.now(), data: getSafeGameObj()}]
         
        instanceBase.child('game').set({title: "Initial data dump", data: theGame.roundRecord});


    }
  
  
      theGame.syncInstance = instanceBase.child('game');       
    
      theGame.syncInstance.once('value', function(newValue){ 
        main();
        theGame.syncInstance.on('value', onUpdateRecieved);  //turns out when you implement this inside the once clause
                                                             //It'll fire with the same update that triggered this
      });
      
      
    }, 0);
} 





function createTable(){
	var geometry = new THREE.CubeGeometry(500, 125, 500);
	var material = new THREE.MeshBasicMaterial({color:'#663300'});
	var table = new THREE.Mesh(geometry, material);
  //table.position.y = -325;
  table.position.copy(tableOffset);
  table.position.y -= 75;
	//table.scale.multiplyScalar(250);
  var deckGeom = new THREE.CubeGeometry(cardTemplate.width, 25, cardTemplate.height);
  var deckMat = new THREE.MeshBasicMaterial({color:'#583f2c'});
  var deck = new THREE.Mesh(deckGeom, deckMat);
  deck.position.y = 75;
  table.add(deck);
  sim.scene.add(table);
  //table.visible = false;
  //table.matrixAutoUpdate = false;
  //object.updateMatrix();

  return table;
}

function createPotHolder(){
  var geometry = new THREE.CylinderGeometry( 50, 50, 10, 12);
  var material = new THREE.MeshBasicMaterial( {color: "grey"} );
  var cylinder = new THREE.Mesh( geometry, material );
  return cylinder;
}

function createHiddenCardGeom(){

   console.log('making hidden card geometry');

	var geometry = new THREE.PlaneGeometry(cardTemplate.width, cardTemplate.height);
	var material = new THREE.MeshBasicMaterial({color:'#000000'});
    var materialBack = new THREE.MeshBasicMaterial({color:'#583f2c'});
  
	var cardFront = new THREE.Mesh(geometry, material);
  
  var cardBack = new THREE.Mesh(geometry, materialBack);

  cardBack.rotation.y = Math.PI;
  
  var card = new THREE.Object3D();
  card.add(cardFront);
  card.add(cardBack);
  
  card.position.copy(tableOffset);
  card.position.y += cardTemplate.height/2;
  
  card.addBehaviors(
			alt.Object3DSync({position: true, rotation: true})
		);
  sim.scene.add(card);  
  card.userData.hidden = true;
  return card; 
}

function createCardGeom(theCard, doubleSided){
   doubleSided = doubleSided || false;
   if(typeof theCard.geom !== "undefined"){
     console.error("We already made the geometry for this card!", theCard);
     return theCard;  
   }
   console.log('making card geometry');

	var geometry = new THREE.PlaneGeometry(cardTemplate.width, cardTemplate.height);
	var material = new THREE.MeshBasicMaterial({color:'#CCCCCC', map: new THREE.Texture(theCard.image)});
  var materialBack = new THREE.MeshBasicMaterial({color:'#583f2c'});
  
	var cardFront = new THREE.Mesh(geometry, material);
  
  var cardBack; 
  if(doubleSided){
    cardBack = new THREE.Mesh(geometry, material); 
  }else{
    cardBack = new THREE.Mesh(geometry, materialBack);

  }
  cardBack.rotation.y = Math.PI;
  
  var card = new THREE.Object3D();
  card.add(cardFront);
  card.add(cardBack);
  
  card.position.copy(tableOffset);
  card.position.y += cardTemplate.height/2;
  
  card.addBehaviors(
			alt.Object3DSync({position: true, rotation: true})
		);
  sim.scene.add(card);  
  theCard.geom = card;
  return card; 
}

function getCardPosition(numCards, index){
  var fullOffset = (cardTemplate.width+cardTemplate.padding)/2 * (numCards - 1);
  return{
    x: (fullOffset - (cardTemplate.width+cardTemplate.padding) * index)
  };
}

function arrangeCards(cards){
  var numCards = cards.length;
  fullOffset = (cardTemplate.width+cardTemplate.padding)/2 * (numCards - 1);
  var card;
  var hand = new THREE.Object3D();
  sim.scene.add(hand); 
  for(var i=0; i<numCards; i++){
    //cards[i] = createCard();
    card = cards[i].geom;
    card.position.x -= (fullOffset - (cardTemplate.width+cardTemplate.padding) * i);
    hand.add(card);
    //hand[i].lookAt(new THREE.Vector3(0, tableOffset.y + (cardTemplate.height/2), 225 * 1.5))
  }
  //put them in a hand and return the obj?
  
  return hand;
}

function arrangeHand(hand, spotIndex){
    //later switch out for the physical positions of the players maybe?
    hand.position.y -= 10;
   switch(spotIndex){
      case 0:
        //hand.position.x -= (fullOffset -     (cardTemplate.width+cardTemplate.padding) * i);
        hand.position.z = 225;
        break;
      case 1:
        hand.position.z = -225;
        hand.rotation.y = Math.PI;
        
        break;
      case 2:
        hand.rotation.y = Math.PI/2;
        hand.position.x = 225;
        break;
      case 3:
        hand.rotation.y = -Math.PI/2;
        hand.position.x = -225;
        break;
   }
  
}

function toggleCardsBehavior(pl){
  
  var object;
  var player;
  var visible = true;
  
  function awake(obj){
    player = pl;
    object = obj;
    object.addEventListener('cursordown', toggleCards);
    
  }
  
  function toggleCards(){
        console.log("toggling!", player);
        if(visible){
          for(var i=0; i<player.cards.length; i++){
            player.cards[i].geom.rotation.x = Math.PI/2;
            player.cards[i].geom.position.y-= cardTemplate.height/2;
            player.cards[i].geom.updateMatrix();

          }
        }else{
          for(var i=0; i<player.cards.length; i++){
            player.cards[i].geom.rotation.x = 0;
            player.cards[i].geom.position.y+= cardTemplate.height/2;
            player.cards[i].geom.updateMatrix();

          }
        }
        visible = !visible;
   }
  
  return {awake: awake};
  
  
}

function makePot(){
  //make a chipstack of theChips, at thePotHolder
  renderChips(theGame.potHolder, theGame.bettingPot);
}


function player(whichPlayer){
  this.cards = [];
  this.spot = whichPlayer;
  this.state = -1;
  this.prevState = -2;
  this.updateFunction = this.renderVisuals;
 
  
  //defined later
  this.userId = null;
  this.money = 0; 
  this.hand = {};
  this.chipStack = {};
  this.joinButton;
}

player.prototype.myCardsFriendly = function(){
	var retArray = [];
	for(var i=0; i<this.cards.length; i++){
		retArray.push(numArray[this.cards[i].number]+" of "+this.cards[i].suit);
	} 
	return retArray;
} 

player.prototype.renderVisuals = function(timeSince){
  if(this.prevState !== this.state){ 
    console.group('player'+this.spot+' moved from ', this.prevState, this.state); 

    //state init
    switch(this.state){
      case -1:
        //no one playing
        if(typeof this.joinButton === "undefined"){
          this.joinButton = new makeJoinButton(this.spot);
          sim.scene.add(this.joinButton.mesh);
        }else{
          this.joinButton.mesh.visible = true;
        }
        this.money = startingMoney;  
        
        
        break;
      case 0:
        //someone playing, they haven't started yet
        //make buttons and UI
         
        
        this.joinButton.mesh.visible = false;
        this.hand = new THREE.Object3D();
        
        var hideButton = this.createHideButton(); 
        hideButton.position.z = 50;
        this.hand.add(hideButton);
         
        this.chipStack = new THREE.Object3D();
        this.hand.add(this.chipStack);
        this.bettingui = new bettingUI(this);
        this.bettingui.mesh.rotation.y = -Math.PI/8;  
        toggleVisible(this.bettingui.mesh, false); 

        this.hand.add(this.bettingui.mesh);
        var numPlayers = 0;
        for(var i=0; i<theGame.players.length; i++){
          if(theGame.players[i].state != -1){
            numPlayers++;  
          }
        }
        
        if(numPlayers === 1){ //first player 
          this.startGame = new makeStartGameButton();
          this.hand.add(this.startGame.mesh);
          this.startGame.mesh.position.z = 10;
          this.startGame.mesh.position.y -= 125;
          this.startGame.mesh.position.x = -50;  
          this.startGame.mesh.rotation.y = Math.PI/8;  
          theGame.startGameButton = this.startGame.mesh;
          if(this.userId !== globalUserId){
              theGame.startGameButton.visible = false;
          }
        } 
        this.renderChips();  
        
        arrangeHand(this.hand, this.spot);
        sim.scene.add(this.hand);
        break;  
      case 1:
        //give cards to player
        if(this.startGame){
          this.startGame.mesh.visible = false;
        }
        for(var i=0; i<this.cards.length; i++){
            
          //if this is the correct player, get correct card
          this.cards[i] = theGame.deck.getCard(this.cards[i], false, globalUserId === this.userId);
          //otherwise, get a black card
            
          giveCard(this.cards, this.hand, i);
          window.setTimeout((function(that, index){
            return function(){ 
              //move card to hand
              toggleCard(that.cards[index], true);
              if(that.state === 1){   //only do this if our state hasn't been changed by an update
                that.state = 2;
              }
            }
          })(this, i), 4000);
            
        }
        console.log('giving cards to', this, this.cards.length);

        break;
      case 2: 
        //waiting 
        console.log(this, this.spot);
        toggleVisible(this.bettingui.mesh, false);
        //move the cube to someone else 
        
        break;
      case 3:
        //this players turn to bet
        //put the bet cube over this player
        console.log("this player is betting", this);
        toggleVisible(this.bettingui.mesh, true);

        theGame.betCube.visible = true;
        theGame.betCube.position.copy(this.hand.position);
        break;
      case 4:
        //folded, out for this round 
        toggleVisible(this.bettingui.mesh, false);

        break;
    }
    //console.log(getSafeGameObj());
    //theGame.syncInstance.update(getSafeGameObj());     //going to move this to the actual player functions, so we can be more specific about when we send things and don't send crap data.
    
    console.groupEnd();
    this.prevState = this.state;
  }

  //state update
  for(var i=0; i<this.cards.length; i++){
    if(this.cards[i].movementTween){
          //this.cards[i].geom.updateBehaviors(timeSince); 
    }

  }
}


player.prototype.chipColors = {
  "white": 1,
   "red": 5,
  "blue": 10,
  "green": 25,
  "black": 100
}

player.prototype.win = function(amount, hand){
  theGame.winCube.visible = true;
  theGame.winCube.position.copy(this.hand.position);
  theGame.bettingPot -= amount;
  this.money+= amount;
  makePot();
  this.renderChips();
  //this.moveChipsFrom(amount, this.chipStack);  
}

/*

  white - 1
  red - 5
  blue - 10
  green - 25
  black - 100

*/

 


player.prototype.createHideButton = function(){
	var geometry = new THREE.CubeGeometry(1, 1, 1);
	var material = new THREE.MeshBasicMaterial({color:'#ff0000'});
	var cube = new THREE.Mesh(geometry, material);
  cube.scale.set(25, 25, 25);
  cube.position.copy(tableOffset);
  cube.addBehaviors(toggleCardsBehavior(this));
  sim.scene.add(cube); 
  return cube;
}


player.prototype.renderChips = function(){
  renderChips(this.chipStack, this.money);
  this.chipStack.position.copy(tableOffset);
}

function renderChips(parent, amount){
  for( var i = parent.children.length - 1; i >= 0; i--) { 
    parent.remove(parent.children[i]);
  }
  var chipStack = makeChipStack(amount); 
  parent.add(chipStack);
}

player.prototype.moveChipsFrom = function(amount, where){
  //where is a Vector3
  var trackingVector = new THREE.Vector3();
  trackingVector.setFromMatrixPosition(theGame.potHolder.matrixWorld);
  //trackingVector.y = tableOffset.y;
  
  var toVector = new THREE.Vector3();
  toVector.setFromMatrixPosition(where.matrixWorld);
  
  var theseChips = makeChipStack(amount);
  sim.scene.add(theseChips);
  theseChips.position.copy(trackingVector);
  
            var toHolderTween = new TWEEN.Tween(trackingVector).to(toVector, 2000);
            toHolderTween.onUpdate((function(chips){
              return function(value1){  
                chips.position.copy(trackingVector);
              }
            }(theseChips))); 
            
            
            toHolderTween.onComplete((function(movingChips, player){
              return function(value1){
                
                //delete the moving chips, update the world chip pot
                sim.scene.remove(movingChips);
                player.renderChips();
                
              }
            }(theseChips, this)));
          toHolderTween.start(); 
  renderChips(theGame.potHolder, 0);
}


//disabling chip animation for now until it's consistent
player.prototype.moveChipsTo = function(amount, where){
  //where is a Vector3
  var trackingVector = new THREE.Vector3();
  trackingVector.setFromMatrixPosition(this.chipStack.matrixWorld);
  trackingVector.y = tableOffset.y;
  
  var toVector = new THREE.Vector3();
  toVector.setFromMatrixPosition(where.matrixWorld);
  
  
  var theseChips = makeChipStack(amount);
  sim.scene.add(theseChips);
  theseChips.position.copy(trackingVector);  
  
            var toHolderTween = new TWEEN.Tween(trackingVector).to(toVector, 2000);
            toHolderTween.onUpdate((function(chips){
              return function(value1){ 
                  //move the cards to the player 
                chips.position.copy(trackingVector);
              }
            }(theseChips)));
            
            
            toHolderTween.onComplete((function(movingChips){ 
              return function(value1){
                
                //delete the moving chips, update the world chip pot
                sim.scene.remove(movingChips);
                makePot();
                
              }
            }(theseChips)));
          toHolderTween.start();
}

player.prototype.bet = function(amount){
  this.money -= amount;
  theGame.bettingPot += amount;
  //this.moveChipsTo(amount, theGame.potHolder);
  makePot();
  this.renderChips();
  sendUpdate({i:this.index, amount: amount}, "playerBet");
  theGame.nextBet(amount);
}

player.prototype.fold = function(){ 
  theGame.bettingOrder.splice(theGame.better, 1);
  
  for(var i=0; i<this.cards.length; i++){ 
      console.log(this.cards[i]);
      if(this.cards[i].geom.parent.type === "Object3D"){
        THREE.SceneUtils.detach(this.cards[i].geom, this.hand, sim.scene);
        cardToDeck(this.cards[i]);
      }
  } 
  this.cards = [];
  this.state = 4;
  if(theGame.bettingOrder.length === 1){ 
      //take to judging
      theGame.step = theGame.logic.steps.length - 2;
      theGame.runStep();
  }else{
    theGame.startBetting(); 
  }
  sendUpdate({i:this.index}, "playerFold");
  
}

function makeChipStack(amount, spacing){
  var theMoney = amount;
  var thisStack = 0;
  var numChips = 0;
  var cursor = 60;
  spacing = spacing || 10; 
  
  var chipStack = new THREE.Object3D();
  
  while(theMoney > 0){
    if(theMoney < 5){
       var whiteChips = createChipStack(theMoney, "white");
       chipStack.add(whiteChips);
       whiteChips.position.y += theMoney/2;
       whiteChips.position.x = cursor;
       theMoney = 0; 
    }else if(theMoney < 10){
      numChips = 0;
      while(theMoney >= 5){
         theMoney -= 5;
         numChips ++;
      }
      var redChips = createChipStack(numChips, "red");
      chipStack.add(redChips);
      redChips.position.y += numChips/2;
      redChips.position.x = cursor;
    }else if(theMoney < 25){
      numChips = 0;
      while(theMoney >= 10){
         theMoney -= 10;
         numChips ++;
      }
      var blueChips = createChipStack(numChips, "blue");
      chipStack.add(blueChips); 
      blueChips.position.y += numChips/2;
      blueChips.position.x = cursor;    
    }else if(theMoney < 100){
      numChips = 0;
      while(theMoney >= 25){
         theMoney -= 25;
         numChips ++;
      }
      var greenChips = createChipStack(numChips, "green");
      chipStack.add(greenChips);
      greenChips.position.y += numChips/2;
      greenChips.position.x = cursor;
      
    }else{
      numChips = 0;
      while(theMoney >= 100){ 
         theMoney -= 100;
         numChips ++; 
      }
      var blackChips = createChipStack(numChips, "black");
      chipStack.add(blackChips);
      blackChips.position.y += numChips/2;
      blackChips.position.x = cursor;
    } 
    cursor += spacing;
  }
  //chipStack.position.copy(tableOffset);
  return chipStack;
}

function createChipStack(amount, denominationColor){
  
    var geometry = new THREE.CylinderGeometry( 5, 5, amount, 6);
    var material = new THREE.MeshBasicMaterial( {color: denominationColor} );
    var cylinder = new THREE.Mesh( geometry, material );
    //cylinder.position.copy(tableOffset);
    return cylinder;
}

function giveCard(cards, toObj, i){ 
            
            var thisCard = cards[i];
             
            thisCard.movementTween.rotation.copy(thisCard.geom.rotation); 
            thisCard.movementTween.position.copy(thisCard.geom.position);
  
            var toRotationTween = new TWEEN.Tween(thisCard.movementTween.rotation).to({z: toObj.rotation.y}, 1000);
            toRotationTween.onUpdate((function(card){
              return function(value1){ 
                //rotate the cards to face the players 
                card.geom.rotation.setFromVector3(card.movementTween.rotation); 
              } 
            }(thisCard)));
            
  
            var toPlayerTween = new TWEEN.Tween(thisCard.movementTween.position).to({x:toObj.position.x, z: toObj.position.z}, 2000);
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
            }(thisCard, toObj)));
            
  
            var toHandTween = new TWEEN.Tween(thisCard.movementTween.position ).to(getCardPosition(cards.length, i), 1000);
            toHandTween.onUpdate((function(card){
              return function(value1){
                //now that cards are parented properly, move them so we can view each card
                card.geom.position.x = card.movementTween.position.x;
              }
            }(thisCard)));
           
          
  
            toRotationTween.chain(toPlayerTween);
            toPlayerTween.chain(toHandTween);
            toRotationTween.start(); 
}

function toggleCard(thisCard, toggle){
    
    var height = {y:-100};
    var rotation = {x:0};
    if(!toggle){
      rotation.x = Math.PI/2;
      height.y = tableOffset.y; 
    }
  
            var changeHeightTween = new TWEEN.Tween(thisCard.movementTween.position).to(height, 1000);  
            changeHeightTween.onUpdate((function(card){
              return function(value1){
                //now that cards are in the correct position, raise them so we can see the cards
                card.geom.position.y = card.movementTween.position.y;
              }
            }(thisCard))); 
            
            
  
            var makeVisibleTween = new TWEEN.Tween(thisCard.movementTween.rotation).to(rotation, 1000);
            makeVisibleTween.onUpdate((function(card){
              return function(t){
                  //also rotate the cards
                  card.geom.rotation.setFromVector3(card.movementTween.rotation);
              }
            }(thisCard)));
  
  
      changeHeightTween.start();
      makeVisibleTween.start();
}


var theGame;

function updatePlayers(time){
  sim.renderer.render(sim.scene, sim.camera);
  
  for(var i=0; i<theGame.players.length; i++){
    theGame.players[i].renderVisuals(time);
    if(theGame.players[i].bettingui){
          theGame.players[i].bettingui.mesh.visible = false;
    }
  }
  if(theGame.betCube){
    theGame.betCube.updateBehaviors(time);
  }    

  TWEEN.update();
  requestAnimationFrame(updatePlayers);
}

function main(){
	theGame.logic = texasHoldEm;
	//theGame.players[0] = new player(0);
    theGame.giveCard = giveCard;
    
    //render first set of visuals
    updatePlayers(0);
    
    document.querySelector("svg .loading").style.display = "none";
    document.querySelector("svg .credits").style.display = "none";
    document.querySelector("svg .playerCount").style.display = "block";  
  
   
    var betimage = document.createElement('img');
    betimage.src = "http://foxgamestudios.com/wp-content/uploads/2016/02/rotatingCubeBetting.png?color=white"; 
	var betmaterial = new THREE.MeshBasicMaterial({map:new THREE.Texture(betimage)});
    var betgeometry = new THREE.CubeGeometry(50, 50, 50);
	var betCube = new THREE.Mesh(betgeometry, betmaterial);
     
    var winimage = document.createElement('img');
    winimage.src = "http://foxgamestudios.com/wp-content/uploads/2016/02/rotatingCubeWinner.png"; 
    var winmaterial = new THREE.MeshBasicMaterial({map: new THREE.Texture(winimage)});
    
  
    theGame.winCube = new THREE.Mesh(betgeometry, winmaterial);
    theGame.betCube = betCube;
    theGame.winCube.addBehaviors(alt.Spin({speed: 0.0000001}));
    theGame.betCube.addBehaviors(alt.Spin({speed: 0.0000001}));
    theGame.betCube.visible = false;
    theGame.winCube.visible = false;  
    theGame.cardsToDeck = cardsToDeck;
    var potHolder = createPotHolder();
    potHolder.position.copy(potPosition);
    
    theGame.potHolder = new THREE.Object3D();
    theGame.potHolder.name = "potholder";
    //potHolder.add(theGame.potHolder);
    theGame.potHolder.position.copy(potPosition);
    theGame.potHolder.position.y+= 5;
    theGame.potHolder.position.x-= 75;
    sim.scene.add(theGame.potHolder);
    sim.scene.add(potHolder); 
    sim.scene.add(theGame.winCube); 
    sim.scene.add(betCube);
  
    sim.renderer.render(sim.scene, sim.camera); 
  
  
    theGame.resetDealers(); 
}

function cardsToDeck(){ 
  var cards = [];
  for(var i=0; i<this.bettingOrder.length; i++){
    var player = this.dealingOrder[this.bettingOrder[i]];
    for(var j=0; j<player.cards.length; j++){
        cards.push(player.cards[j]);
    }
    player.cards = [];  
  }
  
  cards = cards.concat(this.sharedCards.cards);
  
  //we have one of every card, lets bring them back to the deck
  for(var i=0; i<cards.length; i++){ 
    var card = cards[i];
    cardToDeck(card);
  }
  this.sharedCards = {cards: []}; 
   
}

function cardToDeck(card){ 
    card.movementTween.position.copy(card.geom.position); 
    card.movementTween.rotation.copy(card.geom.rotation);
    var toTable = new TWEEN.Tween(card.movementTween.position).to({y:tableOffset.y}, 200);
            var posToDeck = new TWEEN.Tween(card.movementTween.position).to(tableOffset, 1000);
            posToDeck.onUpdate((function(card){
              return function(t){
                  card.geom.position.copy(card.movementTween.position);
              } 
            }(card)));
            posToDeck.onComplete((function(card){
              return function(t){
                  if(card.geom.parent.type === "Object3D"){ 
                    THREE.SceneUtils.detach(card.geom, card.geom.parent, sim.scene);
                    card.geom.updateMatrixWorld();
                  }
                  //sim.scene.remove(card.geom); 
                  toggleVisible(card.geom, false);
                  //delete card.geom;
              } 
            }(card)));
            var rotToDeck = new TWEEN.Tween(card.movementTween.rotation).to({x:Math.PI/2, y:0, z:0}, 200);
            rotToDeck.onUpdate((function(card){
              return function(t){
                  card.geom.rotation.setFromVector3(card.movementTween.rotation);
              } 
            }(card)));
    toTable.chain(posToDeck);
    toTable.start();
    //posToDeck.start();
    rotToDeck.start(); 
}


function numActivePlayers(){
  var numActive = 0;
  for(var i=0; i<theGame.players.length; i++){ 
    if(theGame.players[i].state > -1){
      numActive++;
    }
  }
  return numActive;
}

function movePlayerButton(mesh, newPlayerIndex){
  switch(newPlayerIndex){
    case 0: 
      mesh.position.set(0, mesh.position.y, 225);
      mesh.rotation.y = 0;
      break;
    case 1:
       mesh.position.set(0, mesh.position.y, -225);
       mesh.rotation.y = Math.PI;
      break;
    case 2:
       mesh.position.set(225, mesh.position.y, 0);
       mesh.rotation.y = Math.PI/2;
      break;
    case 3:
       mesh.position.set(-225, mesh.position.y, 0);
       mesh.rotation.y = -Math.PI/2;
      break;
    default:
      console.log("Too many players!");
      mesh.visible = false;
      break;
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
			sendUpdate({registerIndex: i, userId: globalUserId}, "registerPlayer");
		}else{
		
			altspace.getUser().then(function(result){
		        globalUserId = result.userId;
				theGame.players[i].state = 0;
				theGame.players[i].userId = globalUserId;
                globalPlayerIndex = i;
				sendUpdate({registerIndex: i, userId: globalUserId}, "registerPlayer");
			});
		}
	  }
    }(index)));
    textObj = document.querySelector(".playerCount");
    
  }
  
  return {awake: awake}; 
  
  
}

function startGame(){
  
  var object;
  
  function awake(obj){
    object = obj;
    object.addEventListener('cursordown', startGame);
    
  }
  
  function startGame(){
        theGame.step = 0;//do the initialization in the game controller
        //sendUpdate({stepUpdate: 0}, "startGame");
        theGame.runStep(); 
   }
  
  return {awake: awake};
  
  
}



function makeStartGameButton(){
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
  
  this.mesh.addBehaviors(startGame());
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


var plusImg = document.createElement('img');
plusImg.src = "http://foxgamestudios.com/wp-content/uploads/2016/02/plus.png";
plusImg.threeTex = new THREE.Texture(plusImg);

var minusImg = document.createElement('img');
minusImg.src = "http://foxgamestudios.com/wp-content/uploads/2016/02/minus.png";
minusImg.threeTex = new THREE.Texture(minusImg);

var addMaterial = new THREE.MeshBasicMaterial({map:plusImg.threeTex});
var removeMaterial = new THREE.MeshBasicMaterial({map:minusImg.threeTex});

var betImg = {
  img: document.createElement('img'),
  outImg: document.createElement('img')
};
betImg.outImg.src = "http://foxgamestudios.com/wp-content/uploads/2016/02/betUI-bet2.png";
betImg.img.src = "http://foxgamestudios.com/wp-content/uploads/2016/02/betUI-bet.png";
betImg.threeMat = new THREE.MeshBasicMaterial({map:new THREE.Texture(betImg.img)});

var foldImg = {
  img: document.createElement('img'),
  outImg: document.createElement('img')
};
foldImg.outImg.src = "http://foxgamestudios.com/wp-content/uploads/2016/02/betUI-fold2.png";
foldImg.img.src = "http://foxgamestudios.com/wp-content/uploads/2016/02/betUI-fold.png";
foldImg.threeMat = new THREE.MeshBasicMaterial({map:new THREE.Texture(foldImg.img)});

var inImg = {
  img: document.createElement('img'),
  outImg: document.createElement('img')
};
inImg.outImg.src = "http://foxgamestudios.com/wp-content/uploads/2016/02/betUI-all_In.png";
inImg.img.src = "http://foxgamestudios.com/wp-content/uploads/2016/02/betUI-all_In.png";
inImg.threeMat = new THREE.MeshBasicMaterial({map:new THREE.Texture(inImg.img)});


function bettingUI(player){
  this.canvasEl = document.createElement('canvas');
  this.canvasEl.width = 150;
  this.canvasEl.height = 200;
  this.textArea = this.canvasEl.getContext('2d');
  //document.body.appendChild(canvasEl);
  this.fontSize = 28;
  this.fontPadding = 10;
  this.textArea.font = this.fontSize+"px Arial";
  this.textArea.fillStyle = "rgba(255,255,255, 1)";
  this.element = this.canvasEl;
  this.textArea.textAlign = "center";
  //this.textArea.fillText("BET", this.element.width/2, this.fontSize);
  this.textArea.fill();
  
  this.textArea.beginPath();
  this.textArea.rect(0, 60, 150, 150); 
  this.textArea.fillStyle = "grey";
  this.textArea.fill(); 
  
  //set the color back to white
  this.textArea.fillStyle = "rgba(255,255,255, 1)";

  
  this.material = new THREE.MeshBasicMaterial({map: new THREE.Texture(this.element)}); 

  this.mainMesh = new THREE.Mesh(new THREE.PlaneGeometry(this.element.width/4, this.element.height/4), this.material);
  this.backMesh = new THREE.Mesh(new THREE.PlaneGeometry(this.element.width/4, this.element.height/4), this.material);
  this.backMesh.rotation.set(0, Math.PI, 0);
  this.backMesh.position.z -= 0.1;
  this.mesh = new THREE.Object3D();
  this.mesh.add(this.backMesh);
  this.mesh.add(this.mainMesh);
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
  
  chips.scale.set(0.25, 0.25, 0.25);
  chips.position.set(-15, -35, 0);
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
    addButton.position.x += 20;
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
  
  ctrlHolder.position.set(0, 34, 0.1);
  ctrlHolder.scale.set(0.72, 0.72, 0.72);
  this.mesh.add(ctrlHolder);
  
  
  betButtons.scale.set(3, 3, 3);
  betButtons.position.set(40, 160, 0.1);
  chips.add(betButtons);
  
  this.mesh.position.y -= 100; 
  this.mesh.position.x = 60;
  
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
   this.textArea.fillText("$"+amount, this.element.width/2, this.fontSize*1.5);
   this.material.map.needsUpdate = true; 
   this.material.needsUpdate = true; 
}

function bettingUIInteractions(pl, updateBet, buttonArray){
  this.object; 
  this.player = pl;
  this.addArr = buttonArray[0];
  this.subArr = buttonArray[1];
  this.ctrlArray = buttonArray[2];
  this.currentBet = 0;
  this.updateBet = updateBet;
  
  this.awake = function awake(obj){
    this.object = obj;
    this.currentBet = 0;
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
         console.log('betting');
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
    if(this.currentBet + amount <= this.player.money && (this.currentBet + amount) >= 0){ //this should be the min bet actually
      this.currentBet += amount;
      this.updateBet(this.currentBet);
    }else{
      console.log('dont have the funds', this.currentBet + amount , (this.currentBet + amount) >= 0);
    }
  }
  
  this.allIn = function allIn(){ 
    this.currentBet = this.player.money;
    this.updateBet(this.currentBet);
  }
  
  this.done = function done(){
    this.player.bet(this.currentBet); 
    this.currentBet = 0;
    this.updateBet(this.currentBet);
  }
  
  this.fold = function fold(){ 
    this.player.fold();
    this.currentBet = 0;
    this.updateBet(this.currentBet);
  } 

}





//main();



/*
  this.fold = function fold(){
    this.player.fold();
    this.currentBet = 0;
    this.updateBet(this.currentBet);
    for(var i=0; i<this.player.cards.length; i++){
      THREE.SceneUtils.detach(this.player.cards[i].geom, this.player.hand, sim.scene);
      cardToDeck(this.player.cards[i]);
    }
    this.player.cards = [];
  }

*/





//main();

