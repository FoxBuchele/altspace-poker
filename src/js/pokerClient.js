(function(){var a = window.altspace; (function insert(ss, t){for(var i in ss) {for (var j in ss[i]) {t[j] = ss[i][j];}};})([a, a.utilities,a.utilities.behaviors, a.utilities.shims], window.alt = {})})();

// Setup

var sim = altspace.utilities.Simulation({
  auto: false
});
var inCodePen = altspace.utilities.codePen.inCodePen;
var instanceBase;
var sceneSync;

altspace.utilities.sync.connect({
		appId: "AltSpacePoker",
        authorId: "Fox",
    instanceId: null
}).then(function(connection){
    instanceBase = connection.instance;
   console.log('we have the instance');
   sceneSync = altspace.utilities.behaviors.SceneSync(instanceBase, {
        instantiators: {},
        ready: ready
    })
    sim.scene.addBehavior(sceneSync);
    sim.scene.updateAllBehaviors();
})


var startingMoney = 1337;

var tableOffset = new THREE.Vector3(0, -150, 0)

var potPosition = new THREE.Vector3();
//potPosition.copy(tableOffset);
potPosition.set(115, tableOffset.y - 18.5, 0);

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
 


var tableTexImg = document.createElement('img');
tableTexImg.src = "assets/Models/TableTexture.png";  
var tableMat = new THREE.MeshBasicMaterial({map:new THREE.Texture(tableTexImg)});

var bettingTexImg = document.createElement('img');
bettingTexImg.src = "assets/Models/BettingTexture.png";
var bettingMat = new THREE.MeshBasicMaterial({map: new THREE.Texture(bettingTexImg)});

var cardTexImg = document.createElement('img');
cardTexImg.src = "assets/Models/CardTexture.png";
var cardBackMat = new THREE.MeshBasicMaterial({map: new THREE.Texture(cardTexImg)});

var menuTexImg = document.createElement('img');
menuTexImg.src = "assets/Models/MenuTexture.png";
var menuMat = new THREE.MeshBasicMaterial({map: new THREE.Texture(menuTexImg)});


var blackTexImg = document.createElement('img');
blackTexImg.src = "assets/Models/ChipTextureBlack.png";
var blueTexImg = document.createElement('img');
blueTexImg.src = "assets/Models/ChipTextureBlue.png";
var greenTexImg = document.createElement('img');
greenTexImg.src = "assets/Models/ChipTextureGreen.png";
var redTexImg = document.createElement('img');
redTexImg.src = "assets/Models/ChipTextureRed.png";
var whiteTexImg = document.createElement('img');
whiteTexImg.src = "assets/Models/ChipTextureWhite.png";

var blackMat = new THREE.MeshBasicMaterial({map: new THREE.Texture(blackTexImg)});
var blueMat = new THREE.MeshBasicMaterial({map: new THREE.Texture(blueTexImg)});
var greenMat = new THREE.MeshBasicMaterial({map: new THREE.Texture(greenTexImg)});
var redMat = new THREE.MeshBasicMaterial({map: new THREE.Texture(redTexImg)});
var whiteMat = new THREE.MeshBasicMaterial({map: new THREE.Texture(whiteTexImg)});

var chipMatContainer = {
    black: blackMat,
    blue: blueMat,
    green: greenMat,
    red: redMat,
    white: whiteMat
}


var basicMat = new THREE.MeshBasicMaterial({color: "#FFFFFF"});








function ready(firstInstance) { 
    
    theGame = new game();
    theGame.deck = new deck(); 
    for(var i=0; i<6; i++){
       theGame.players.push(new player(i));
    }
    
    
    window.setTimeout(function(){

        if(firstInstance){ 

            cutoffTime = Date.now();

            theGame.deck.shuffle(); 

            theGame.roundRecord = [{title: "startedLevel", timestamp: Date.now()}]

            instanceBase.child('game').set({title: "Initial data dump", data: theGame.roundRecord});


        }



          theGame.syncInstance = instanceBase.child('game');       

          theGame.syncInstance.once('value', function(newValue){

            //once we know that we've recieved the first update, load the models



            console.log('loading all models');
            var models = {
                fileBase : ['IndicationArrow', 'BettingText', 'WinnerText', 'MenuSidepanel', 'Menu', 'CardBack', 'CardFront', 'PokerChip', 'PokerTable6Sided'],
                materials: [bettingMat, bettingMat, bettingMat, menuMat, menuMat, cardBackMat, basicMat, basicMat, tableMat]
            }

            altspace.utilities.multiloader.init({
                baseUrl: "assets/Models"
            })
            var req = new altspace.utilities.multiloader.LoadRequest();

            for(var i=0; i<models.fileBase.length; i++){
                req.objUrls.push(models.fileBase[i]+".obj");
                req.mtlUrls.push(models.fileBase[i]+".mtl");
            }

            theGame.models = {};

            altspace.utilities.multiloader.load(req, function(){
                for(var i=0; i<req.objects.length; i++){

                    console.log(req.objects[i]);
                    req.objects[i].scale.set(300, 300, 300);
                    for(var j=0; j<req.objects[i].children.length; j++){
                         var group = req.objects[i].children[j];
                         group.material = models.materials[i];
                    }
                    theGame.models[models.fileBase[i]] = req.objects[i];

                }
                
                altspace.getUser().then(function(result){

                        globalUserId = result.userId;
                        globalUserName = result.displayName;    
                    
                        createTable(); 
                        main();
                        theGame.syncInstance.on('value', onUpdateRecieved);  //turns out when you implement this inside the once clause
                                                                         //It'll fire with the same update that triggered this
                		
                });

            })






          });
      
      
    }, 0);
} 





function createTable(){
            
    
     var table = theGame.models.PokerTable6Sided.clone();
    
                 
     table.scale.set(300, 300, 300);

     var deck = theGame.models.CardFront.clone();
     
        for(var i=0; i<deck.children.length; i++){
                var group = deck.children[i];
                group.material = cardBackMat;
        }
    
     deck.scale.set(300, 300, 4000);
     deck.rotation.set(-Math.PI/2, 0, 0);
     deck.position.copy(tableOffset); 
     deck.position.y -= 5;
    
    
     sim.scene.add(deck);
     sim.scene.add(table);
     table.position.copy(tableOffset);
     table.position.y -= 380;
    console.log('table created');
            

}

function createPotHolder(){
  var geometry = new THREE.CylinderGeometry( 50, 50, 10, 12);
  var material = new THREE.MeshBasicMaterial( {color: "grey"} );
  var cylinder = new THREE.Mesh( geometry, material );
  return cylinder;
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
        hand.userData.forward = new THREE.Vector3(0, 0, 0);
        break;
      case 1:
        hand.position.x = 195;
        hand.position.z = 112;
        hand.rotation.y = Math.PI/3;
        hand.userData.forward = new THREE.Vector3(0, 0, 0);
        break;
      case 2:
        hand.position.x = 195;
        hand.position.z = -112;
        hand.rotation.y = 2*Math.PI/3;
        hand.userData.forward = new THREE.Vector3(0, 0, 0);
        break;
      case 3:
        hand.position.z = -225;
        hand.rotation.y = -Math.PI;
        hand.userData.forward = new THREE.Vector3(0, 0, 0);
        break;
      case 4:
        hand.position.x = -195;
        hand.position.z = -112;
        hand.rotation.y = -2*Math.PI/3;
        hand.userData.forward = new THREE.Vector3(0, 0, 0);   
           break;
       case 5:
        hand.position.x = -195;
        hand.position.z = 112;
        hand.rotation.y = -Math.PI/3;
       hand.userData.forward = new THREE.Vector3(0, 0, 0);    
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
  
  for(var i=0; i<theGame.bettingPots.length; i++){
      var offset = new THREE.Vector3(0, 0, i*-15);      
      //amount += theGame.bettingPots[i].amount;
      console.log(offset);
      _renderChips(theGame.potHolder, theGame.bettingPots[i].amount, offset);
  }
  
}

function renderChips(parent, amount, offset){
  for( var i = parent.children.length - 1; i >= 0; i--) { 
    parent.remove(parent.children[i]);
  }

    _renderChips(parent, amount, offset);
}

function _renderChips(parent, amount, offset){
    
    var chipStack = makeChipStack(amount);
      if(typeof offset !== 'undefined'){
        chipStack.position.add(offset);
      }
      parent.add(chipStack);
    
}



function makeChipStack(amount, spacing){
  var theMoney = amount;
  var thisStack = 0;
  var numChips = 0;
  var cursor = 60;
  spacing = spacing || 15; 
  
  var chipStack = new THREE.Object3D();
  
  while(theMoney > 0){
    if(theMoney < 5){
       var whiteChips = createChipStack(theMoney, "white");
       chipStack.add(whiteChips);
       //whiteChips.position.y += theMoney/2;
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
      //redChips.position.y += numChips/2;
      redChips.position.x = cursor;
    }else if(theMoney < 25){
      numChips = 0;
      while(theMoney >= 10){
         theMoney -= 10;
         numChips ++;
      }
      var blueChips = createChipStack(numChips, "blue");
      chipStack.add(blueChips); 
      //blueChips.position.y += numChips/2;
      blueChips.position.x = cursor;    
    }else if(theMoney < 100){
      numChips = 0;
      while(theMoney >= 25){
         theMoney -= 25;
         numChips ++;
      }
      var greenChips = createChipStack(numChips, "green");
      chipStack.add(greenChips);
      //greenChips.position.y += numChips/2;
      greenChips.position.x = cursor;
      
    }else{
      numChips = 0;
      while(theMoney >= 100){ 
         theMoney -= 100;
         numChips ++; 
      }
      var blackChips = createChipStack(numChips, "black");
      chipStack.add(blackChips);
      //blackChips.position.y += numChips/2;
      blackChips.position.x = cursor;
    } 
    cursor += spacing;
  }
  //chipStack.position.copy(tableOffset);
  return chipStack;
}

function createChipStack(amount, denominationColor){
  
    //var geometry = new THREE.CylinderGeometry( 5, 5, amount, 6);
    //var material = new THREE.MeshBasicMaterial( {color: denominationColor} );
    var chip = theGame.models.PokerChip.clone();
    
    chip.scale.set(200, 200, 200);
    
    for(var i=0; i<chip.children.length; i++){
        var group = chip.children[i];
        group.material = chipMatContainer[denominationColor];
    }
    
    var group = new THREE.Object3D();
    
    var heightOffset = 1.35;
    
    for(var i=0; i<amount; i++){
        var thisChip = chip.clone();
        thisChip.position.y += i*heightOffset;
        group.add(thisChip);
    }
    
    //cylinder.position.copy(tableOffset);
    return group;
}

function giveCard(cards, toObj, i){ 
            
            var thisCard = cards[i];
             
            
            //thisCard = theGame.deck.getCard(thisCard);
            //cards[i] = thisCard;
                 
    
            thisCard.movementTween.rotation.copy(thisCard.geom.rotation); 
            thisCard.movementTween.position.copy(thisCard.geom.position);
  
            var toRotationTween = new TWEEN.Tween(thisCard.movementTween.rotation).to({z: -toObj.rotation.y}, 1000);
            toRotationTween.onUpdate((function(card){
              return function(value1){ 
                //rotate the cards to face the players 
                if(typeof card.geom !== 'undefined'){
                  card.geom.rotation.setFromVector3(card.movementTween.rotation); 
                }
               } 
            }(thisCard)));
            
  
            var toPlayerTween = new TWEEN.Tween(thisCard.movementTween.position).to({x:toObj.position.x, z: toObj.position.z}, 2000);
            toPlayerTween.onUpdate((function(card){
              return function(value1){
                  //move the cards to the player
                if(typeof card.geom !== 'undefined'){
                    card.geom.position.copy(card.movementTween.position);
                }
              }
            }(thisCard)));
  
            toPlayerTween.onComplete((function(card, hand){
              return function(value1){
                
                //add the cards to the 'hand' object
                if(typeof card.geom !== 'undefined'){

                    THREE.SceneUtils.attach(card.geom, sim.scene, hand);
                    hand.updateMatrixWorld();
                 
                    //our position has updated, so lets update the movementTween
                    card.movementTween.position.copy(card.geom.position); 
                    card.movementTween.rotation.set(card.geom.rotation.x, card.geom.rotation.y, card.geom.rotation.z);
                }
                
              }
            }(thisCard, toObj)));
            
  
            var toHandTween = new TWEEN.Tween(thisCard.movementTween.position).to(getCardPosition(cards.length, i), 1000);
            toHandTween.onUpdate((function(card){
              return function(value1){
                //now that cards are parented properly, move them so we can view each card
                  if(typeof card.geom !== 'undefined'){

                        card.geom.position.x = card.movementTween.position.x;
                  }
               }
            }(thisCard)));
           
    
            var height = {y: -110};
            var rotation = {x:-Math.PI/8};
            //if(!toggle){
               // rotation.x = Math.PI/2;
               // height.y = tableOffset.y; 
           // }
  
            var changeHeightTween = new TWEEN.Tween(thisCard.movementTween.position).to(height, 1000);  
            changeHeightTween.onUpdate((function(card){
              return function(value1){
                //now that cards are in the correct position, raise them so we can see the cards
                if(typeof card.geom !== 'undefined'){
                    card.geom.position.copy(card.movementTween.position);
                }else{
                    console.log('no geom!');
                }
              }
            }(thisCard))); 
            
            
  
            var makeVisibleTween = new TWEEN.Tween(thisCard.movementTween.rotation).to(rotation, 1000);
            makeVisibleTween.onUpdate((function(card){
              return function(t){
                  //also rotate the cards
                  if(typeof card.geom !== 'undefined'){
                    card.geom.rotation.setFromVector3(card.movementTween.rotation);
                  }
              }
            }(thisCard)));

          
            
            toRotationTween.chain(toPlayerTween);
            toPlayerTween.chain(toHandTween, makeVisibleTween, changeHeightTween);
            toRotationTween.start(); 
}


var theGame;

function updatePlayers(time){
  sim.renderer.render(sim.scene, sim.camera);
  
  for(var i=0; i<theGame.players.length; i++){
    theGame.players[i].renderVisuals(time);
  }
  if(typeof theGame.betCube !== "undefined" && theGame.betCube.visible){
    theGame.betCube.rotation.y += 0.005;
  }    

  TWEEN.update();
  requestAnimationFrame(updatePlayers);
}

function main(){
    
	theGame.logic = texasHoldEm;
    checkForDoneBetting();
    //render first set of visuals
    updatePlayers(0);
    
    document.querySelector("svg .loading").style.display = "none";
    //document.querySelectorAll("svg .credits").style.display = "none";
    [].forEach.call(document.querySelectorAll("svg .credits"), function(text) {
        document.querySelectorAll("svg .credits")
        text.style.display = "none";
    });
  
   /*
    var betimage = document.createElement('img');
    betimage.src = "http://foxgamestudios.com/wp-content/uploads/2016/02/rotatingCubeBetting.png?color=white"; 
	var betmaterial = new THREE.MeshBasicMaterial({map:new THREE.Texture(betimage)});
    var betgeometry = new THREE.CubeGeometry(50, 50, 50);
	var betCube = new THREE.Mesh(betgeometry, betmaterial);
     
    var winimage = document.createElement('img');
    winimage.src = "http://foxgamestudios.com/wp-content/uploads/2016/02/rotatingCubeWinner.png"; 
    var winmaterial = new THREE.MeshBasicMaterial({map: new THREE.Texture(winimage)});
    */
    theGame.winCube = new THREE.Object3D();
    theGame.betCube = new THREE.Object3D();
    var winCube = theGame.models.WinnerText.clone();// new THREE.Mesh(betgeometry, winmaterial);
    var betCube = theGame.models.BettingText.clone();//betCube;
    var winArrow = theGame.models.IndicationArrow.clone();
    var betArrow = theGame.models.IndicationArrow.clone();
    winArrow.scale.set(50, 100, 50);
    betArrow.scale.set(50, 100, 50);
    betCube.scale.set(100, 100, 100);
    winCube.scale.set(100, 100, 100);
    
    betArrow.position.y -= 20;
    winArrow.position.y -= 20;
    
    theGame.winCube.add(winCube);
    theGame.winCube.add(winArrow);
    
    theGame.betCube.add(betCube);
    theGame.betCube.add(betArrow);
    
    theGame.winCube.addBehaviors(alt.Spin({speed: 0.0000001}));
    theGame.betCube.addBehaviors(alt.Spin({speed: 0.0000001}));
    //theGame.betCube.visible = false;
    //theGame.winCube.visible = false;
    toggleVisible(theGame.betCube, false);
    toggleVisible(theGame.winCube, false);
    theGame.cardsToDeck = cardsToDeck;
    
    theGame.potHolder = new THREE.Object3D();
    theGame.potHolder.name = "potholder";
    //potHolder.add(theGame.potHolder);
    theGame.potHolder.position.copy(potPosition);
    theGame.potHolder.position.y+= 5;
    theGame.potHolder.position.x-= 75;
    sim.scene.add(theGame.potHolder);
    sim.scene.add(theGame.winCube); 
    sim.scene.add(theGame.betCube);
  
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
    var movementTween = card.movementTween;
    if(typeof card.geom !== 'undefined'){
        var geom = card.geom;
        delete card.geom;
        movementTween.position.copy(geom.position); 
        movementTween.rotation.copy(geom.rotation);
                var toTable = new TWEEN.Tween(movementTween.position).to({y:tableOffset.y}, 200);
                var posToDeck = new TWEEN.Tween(movementTween.position).to(tableOffset, 1000);
                posToDeck.onUpdate((function(geom, movementTween){
                  return function(t){
                      geom.position.copy(movementTween.position);
                  } 
                }(geom, movementTween)));
                posToDeck.onComplete((function(geom){
                  return function(t){
                      if(geom.parent.type === "Object3D"){ 
                        THREE.SceneUtils.detach(geom, geom.parent, sim.scene);
                        geom.updateMatrixWorld();
                      }
                      geom.parent.remove(geom); 
                  } 
                }(geom)));
                var rotToDeck = new TWEEN.Tween(movementTween.rotation).to({x:Math.PI/2, y:0, z:0}, 500);
                rotToDeck.onUpdate((function(geom, movementTween){
                  return function(t){
                      if(typeof geom !== 'undefined'){
                        geom.rotation.setFromVector3(movementTween.rotation);
                      }
                  } 
                }(geom, movementTween)));
        toTable.chain(posToDeck);
        toTable.start();
        rotToDeck.start(); 
    }else{
        //debugger;
    }
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
  /*switch(newPlayerIndex){
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
  }*/
  var position = theGame.players[newPlayerIndex].hand.position;
  var rotation = theGame.players[newPlayerIndex].hand.rotation;
  mesh.position.copy(position);
  mesh.rotation.copy(rotation);
    
    
}
