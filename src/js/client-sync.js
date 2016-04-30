function getSafeGameObj(extradata){
  var thisGame = Object.assign({}, theGame);
    thisGame = Object.assign(thisGame, extradata);
    thisGame.players = null;
  thisGame.players = [];
   for(var i=0; i<theGame.players.length; i++){
     if(theGame.players[i].prevState > theGame.players[i].state){
         thisGame.players[i] = getSafePlayer(theGame.players[i], true);
    }else{
         thisGame.players[i] = getSafePlayer(theGame.players[i]);
    }
  }
  
  if(globalPlayerIndex != -1){
    thisGame.playerUpdate = getSafePlayer(theGame.players[globalPlayerIndex]);
  }
  thisGame.judge = null;
  thisGame.syncInstance = null;
  thisGame.betCube = null;
  thisGame.potHolder = null;
  thisGame.logic = null;
  thisGame.startGameButton = null;
  thisGame.winCube = null; 
  thisGame.dealingOrder = null; 
  //thisGame.deck.perfectDeck = null; 
  thisGame.sharedCards = {cards:getSafeCards(theGame.sharedCards)};
  if(theGame.deck instanceof deck){
    thisGame.shuffledDeck = {cards:getSafeCards({cards: theGame.deck.shuffledDeck})};
  }
  thisGame.deck = null; 

  console.log(thisGame);
  return JSON.parse(JSON.stringify(thisGame));  
}

function getSafePlayer(thePlayer, important){
    var player = Object.assign({}, thePlayer);
    player.joinButton = null;
    player.bettingui = null;
    player.optionsui = null;
    player.chipStack = null;
    player.joinButton = null; 
    player.hand = null;
    player.startGame = null;
    player.prevState = null;
    if(important){
      player.importantUpdate = true;
    } 
    player.updateFunction = null;
    player.cards = getSafeCards(thePlayer);

  return player;
}

function getSafeCards(player){ 
  var cards = [];
  if(player.cards.length === 0){
    return player.cards;  
  }
  
  for(var i=0; i<player.cards.length; i++){
    var card = Object.assign({}, player.cards[i]);
    card.geom = null;
    card.movementTween = null; 
    card.image = null;
    cards[i] = card;
  }
  
  return cards;
  
} 



function processUpdates(newUpdates){
    var logstring = newUpdates.map(function(elem){return elem.title}).join('\n')
    console.log('processing', logstring)
    
    var updateType, data;
        
    var authority;
    
    newUpdates.sort(function(x, y){
        return parseInt(x.timestamp) - parseInt(y.timestamp);
    })
    
    console.log("apply these updates", newUpdates);
    var indexOfError = 0;
    try{
        
    var lastMessage = false;
    for(var x=0; x<newUpdates.length; x++){
        indexOfError = x;
        updateType = newUpdates[x].title;
        data = newUpdates[x].data;
        console.log("processing update", newUpdates[x]);
        theGame.roundRecord.push(newUpdates[x]);
        switch(updateType){
            case "startedLevel":
                
                break;
            case "unlockGame":
                
                 for(var i=0; i<theGame.players.length; i++){
                    if(theGame.players[i].state === -3){
                         theGame.players[i].state = -1;     //set them back to not joined
                    }
                }
                
                break;
            case "lockGame":
                
                //data.playerIndexes will store the players we don't set to -3;
                
                for(var i=0; i<theGame.players.length; i++){
                    if(data.playerIndexes.indexOf(i) === -1){   //set any not joined to 'locked'
                         theGame.players[i].state = -3;
                    }
                }
                
                break;
            case "registerPlayer":
                
                theGame.players[data.registerIndex].userId = data.userId;
                theGame.players[data.registerIndex].state = 0;
                theGame.players[data.registerIndex].renderVisuals(0);
                theGame.players[data.registerIndex].money = data.money;
                theGame.players[data.registerIndex].name = data.name;
               
                /*var forwardDirection = new THREE.Vector3(0, 0, 1);
                var matrix = new THREE.Matrix4();
                matrix.extractRotation(handObj.matrix);
                forwardDirection.applyMatrix4(matrix);
                */ 
                
                var handObj = theGame.players[data.registerIndex].hand
                var pos = new THREE.Vector3();
                pos.copy(handObj.position);
                var forwardDirection = new THREE.Vector3();
                forwardDirection.copy(handObj.userData.forward);
                forwardDirection.multiplyScalar(-150);
                pos.add(forwardDirection);
                lastMessage = {
                    timeToDisappear: 2000,
                    messageType: 1,
                    message: data.name+" joined!",
                    pos: pos,
                    rot: handObj.quaternion
                };
                
                break;
            case "dealingCards":
                
                    for(var i=0; i<data.player.cards.length; i++){
                        theGame.players[data.index].cards[i] = theGame.deck.getCard(data.player.cards[i], false, theGame.players[data.index].userId === globalUserId);
                        //remove a card from the deck, so if the host refreshes their deck is still at the same state
                        theGame.deck.shuffledDeck.pop();
                    }
                    theGame.players[data.index].state = 1;
                    theGame.players[data.index].renderVisuals(0);
                    theGame.players[data.index].state = 2;
                    
                
                //theGame.players[data.index]
                
                break;
            case "startHand":
                //theGame.currentAuthority = data.authority;
                authority = data.authority;
                
                
                
                
                
                theGame.deck.arrange(data.deck);
                  for(var i=0; i<theGame.players.length; i++){
                    if(theGame.players[i].state === 0){    //they're  waiting
                      theGame.players[i].state = 2;
                    }
                  }
                theGame.resetDealers();
                theGame.bettingPots = [];
                theGame.bettingPots.push(new pot());
                //theGame.step = 1;
                theGame.dealer = data.dealer;
                lastMessage = false;
               // theGame.runClientStep();
                
                break;
            case "changeGameStep":
                console.log(data);
                theGame.step = data.toStep;
                theGame.runClientStep();
                
                
                break;
           /* case "waitingFor":
                //data.toPlayer
                break;*/
            case "playerBet":
                
                theGame.players[data.i].bet(data.amount);
                theGame.players[data.i].renderChips();
                makePot();
                theGame.nextBet();
                var name = theGame.players[data.i].name;
                
                var handObj = theGame.players[data.i].hand
                var pos = new THREE.Vector3();
                pos.copy(handObj.position);
                
                var forwardDirection = new THREE.Vector3();
                forwardDirection.copy(handObj.userData.forward);
                forwardDirection.multiplyScalar(-100);
                pos.add(forwardDirection);
                var message;
                if(data.amount === 0){
                    message = name+" checked!";
                }else if(theGame.players[data.i].money === 0){
                    message = name+" went all-in with $"+data.amount+"!";
                }else{
                    message = name+" bet $"+data.amount+"!";
                }
                lastMessage = {
                        timeToDisappear: 3000,
                        messageType: 2,
                        message: message,
                        pos: pos,
                        rot: handObj.quaternion
                    };
                break;
            case "playerFold":
                
                theGame.players[data.i].fold();
                var name = theGame.players[data.i].name;
                
                var handObj = theGame.players[data.i].hand
                var pos = new THREE.Vector3();
                pos.copy(handObj.position);
                
                var forwardDirection = new THREE.Vector3();
                forwardDirection.copy(handObj.userData.forward);
                forwardDirection.multiplyScalar(-100);
                pos.add(forwardDirection);
                var message = name+" folded...";
                lastMessage = {
                        timeToDisappear: 3000,
                        messageType: 0,
                        message: message,
                        pos: pos,
                        rot: handObj.quaternion
                    };
                
                break;
            case "playerWinByForfeit":
                    
                var thisPlayer = theGame.players[data.winnerByForfeit.spot];
                
                    toggleVisible(theGame.winCube, false);
                    toggleVisible(theGame.betCube, false);

                    var handObj = thisPlayer.hand;
                        var pos = new THREE.Vector3();
                        pos.copy(handObj.position);

                    var forwardDirection = new THREE.Vector3();
                        forwardDirection.copy(handObj.userData.forward);
                        forwardDirection.multiplyScalar(-100);
                        pos.add(forwardDirection);
                        pos.y += 25;
                
                var message = "Player won by forfeit!";
                        var winMessage = new errorMessage({
                                timeToDisappear: 5000,
                                messageType: 2,
                                message: message,
                                pos: pos,
                                rot: handObj.quaternion
                        });
                        lastMessage = false;
                    
                    awardMoney([thisPlayer]);
                    
                    theGame.resetCards();
                
                break;
            case "playerWin":
                
                
                    var highestHands = data.hands;
                    
                     var handOrder = Object.keys(highestHands).map(function(val){return parseInt(val)});
                    handOrder.sort(function(a, b){ //sorting in reverse order
                        return b-a;
                    });
                    
                    console.log(highestHands[handOrder[0]].players, "wins with", highestHands[handOrder[0]].hand);
                    
                    
                    
                    /*
                    //var thisPlayer = theGame.players[data.winningPlayer.spot];

                    //rewrite this so the player can only win the pots they fulfilled
                    //thisPlayer.win();


                    toggleVisible(theGame.winCube, false);
                    toggleVisible(theGame.betCube, false);

                    var handObj = thisPlayer.hand;
                        var pos = new THREE.Vector3();
                        pos.copy(handObj.position);

                    var forwardDirection = new THREE.Vector3();
                        forwardDirection.copy(handObj.userData.forward);
                        forwardDirection.multiplyScalar(-100);
                        pos.add(forwardDirection);
                        pos.y += 25;

                    if(typeof data.hand !== 'undefined'){
                        //show this players cards above their head

                        var message = "Player won last hand with "+data.hand.name+"!";
                        var winMessage = new errorMessage({
                                timeToDisappear: 5000,
                                messageType: 2,
                                message: message,
                                pos: pos,
                                rot: handObj.quaternion
                        });
                        delete lastMessage;
                        var cardMessage = "";
                        for(var i=0; i<data.hand.cards.length; i++){
                            cardMessage += ", ";
                            cardMessage += theGame.deck.getCard(data.hand.cards[i]).friendlyRepresentation();
                        }
                        var pos2 = new THREE.Vector3();
                        pos2.copy(pos);
                        pos2.y += 50;
                        var whichCardsMessage = new errorMessage({
                            timeToDisappear: 8000,
                            messageType: 3,
                            message: cardMessage,
                            pos: pos2,
                            rot: handObj.quaternion
                        });
                    }else{

                        //forfeit, don't have to show cards!

                        var message = "Player won by forfeit!";
                        var winMessage = new errorMessage({
                                timeToDisappear: 5000,
                                messageType: 2,
                                message: message,
                                pos: pos,
                                rot: handObj.quaternion
                        });
                        lastMessage = false;

                    }
                
                theGame.resetCards();

                */
                
                break;
            case "dealSharedCards":
                Array.prototype.push.apply(theGame.sharedCards.cards, data.sharedCards);
                for(var i=0; i<data.sharedCards.length; i++){
                    theGame.deck.shuffledDeck.pop();
                }
                //theGame.step = data.stepToRerun;
               // theGame.runClientStep();
                break;
            case "transferControl":
                
                for(var i=0; i<theGame.players.length; i++){
                        theGame.players[i].state = data.endstatePlayers[i].state;
                        theGame.players[i].money = data.endstatePlayers[i].money;
                }
                
                if(theGame.players[data.transferControl].userId === globalUserId){
                    //we are now the dealer!
                    //apply the money and spots from the previous dealer
                    
                    theGame.deck.shuffle();
                    authority = globalUserId;
                    toggleVisible(theGame.players[data.transferControl].optionsui.mesh, true);
                    //create a new round record, send it to everyone
                    
                    //start level
                    setTimeout(function(){
                        theGame.roundRecord = [{title: "startedLevel", timestamp: Date.now()}];
                        //lets wait 5 seconds before moving on
                        //register players

                        for(var i=0; i<theGame.players.length; i++){

                            if(theGame.players[i].state > -1){
                                theGame.players[i].state = 0;
                                theGame.roundRecord.push({data:{registerIndex: i, userId: theGame.players[i].userId, money: theGame.players[i].money}, timestamp: Date.now(), title: "registerPlayer"});
                            }

                        }
                        for(var i=0; i<theGame.players.length; i++){
                            if(theGame.players[i].state === 0){    //they're  waiting
                              theGame.players[i].state = 2;
                            }
                        }
                        theGame.resetDealers();
                        theGame.bettingPots = [];
                        theGame.bettingPots.push(new pot());
                        sendUpdate({authority:globalUserId, deck: getSafeCards({cards: theGame.deck.shuffledDeck}), dealer: theGame.dealer},"startHand");

                        //push all these updates
                        //then deal the cards
                        //sendUpdate({authority:globalUserId, deck: getSafeCards({cards: game.deck.shuffledDeck})}, "startHand");
                        theGame.start();
                    }, 5000);
                    
                    
                }else{
                    theGame.roundRecord = [];
                    
                    //we're about to get a hell of a lot of new updates
                    authority = theGame.players[data.transferControl].userId;
                    
                }
                
                break;
            default:
                console.log("No action specified for update", updateType, data);
                break;
                
        }
        
    }
    
        if(lastMessage !== false){
            var testMessage = new errorMessage(lastMessage);
        }
        
    }
    catch(e){
        console.log('error while processing message', newUpdates[indexOfError]);
        console.log(e, e.message);
    }
    if(typeof authority !== 'undefined'){
        //prevents the host from taking any actions until they've applied all the updates
        theGame.currentAuthority = authority;
    }
    //Array.prototype.push.apply(theGame.roundRecord, newUpdates);
    console.log("updates are now", theGame.roundRecord, newUpdates);
    
    var logstring = theGame.roundRecord.map(function(elem){return elem.title}).join('\n')
    console.log('updates are now', logstring)
}






var prevUpdate;

function onUpdateRecieved(newVal){
    var response = newVal.val(); 
    console.log(response);
    
    
      altspace.getUser().then(function(result){
        //console.log(result);
        globalUserId = result.userId;
        console.group("Recieved update '"+response.data.length+"'");
       // if(theGame.roundRecord.length != response.data.length){
          
          //remove any updates from newupdates that already exist in theGame.roundRecord
        
        var newUpdates = response.data.filter(function(element){
            for(var i=0; i<theGame.roundRecord.length; i++){
                if(element.timestamp === theGame.roundRecord[i].timestamp){
                    return false;
                }
            }
            return true;
        });
          
          processUpdates(newUpdates);

        console.groupEnd();
      });
                              
      
}


















function isCyclic (obj) {
  var seenObjects = [];

  function detect (obj) {
    if (obj && typeof obj === 'object') {
      if (seenObjects.indexOf(obj) !== -1) {
        return true;
      }
      seenObjects.push(obj);
      for (var key in obj) {
        if (obj.hasOwnProperty(key) && detect(obj[key])) {
          console.log(obj, 'cycle at ' + key);
          return true;
        }
      }
    }
    return false;
  }

  return detect(obj);
}

/**
 * Simple is object check.
 * @param item
 * @returns {boolean}
 */
function isObject(item) {
  return (item && typeof item === 'object' && item !== null);
}

/**
 * Deep merge two objects.
 * @param target
 * @param source
 */
function mergeDeep(target, source) {   
  if (isObject(target) && isObject(source)) {
    Object.keys(source).forEach(function(key){
      if (isObject(source[key])) {
        if (!target[key]){
          var newObj = {};
          newObj[key] = {};
          Object.assign(target, newObj);
        }
        mergeDeep(target[key], source[key]);
      } else {
        var newObj = {};
        newObj[key] = source[key];
        Object.assign(target, newObj); 
      }
    }); 
  }
  return target;
}







function sendUpdate(extraData, title, options){
  title = title || "";
  options = options || {};
  console.groupCollapsed("Sending update '"+ title + "'");
  if(typeof options.thenUpdate === "undefined" || options.thenUpdate === false){
    theGame.roundRecord.push({title: title, timestamp: Date.now(), data: extraData});
    theGame.syncInstance.update({title: title, data: theGame.roundRecord}); 
  }else{
    //should process this update immediately
    var time = Date.now();
    var newArr = theGame.roundRecord.concat([{title: title, timestamp: time, data: extraData}])
   // newArr.push({title: title, timestamp: Date.now(), data: extraData});
    
    theGame.syncInstance.update({title: title, data: newArr});
//    processUpdates([{title: title, timestamp: time, data: extraData}]);

    
    
      
  }

  console.log(extraData);
  console.groupEnd(); 
}