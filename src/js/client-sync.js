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
        
    for(var x=0; x<newUpdates.length; x++){
        indexOfError = x;
        updateType = newUpdates[x].title;
        data = newUpdates[x].data;
        console.log("processing update", newUpdates[x]);
        theGame.roundRecord.push(newUpdates[x]);
        switch(updateType){
            case "startedLevel":
                
                cutoffTime = newUpdates[x].timestamp;
                
                
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
                var winMessage = new errorMessage({
                    timeToDisappear: 2000,
                    messageType: 1,
                    message: data.name+" joined!",
                    pos: pos,
                    rot: handObj.quaternion
                }); 
                
                break;
            case "dealingCards":
                
                    for(var i=0; i<data.player.cards.length; i++){
                        theGame.players[data.index].cards[i] = data.player.cards[i];
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
                theGame.resetCards();

                
                
                
                
                theGame.deck.arrange(data.deck);
                  for(var i=0; i<theGame.players.length; i++){
                    if(theGame.players[i].state === 0){    //they're  waiting
                      theGame.players[i].state = 2;
                    }
                    theGame.players[i].cards = [];
                  }
                theGame.resetDealers();
                theGame.bettingPots = [];
                theGame.bettingPots.push(new pot());
                //theGame.step = 1;
                theGame.dealer = data.dealer;
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
                var winMessage = new errorMessage({
                        timeToDisappear: 3000,
                        messageType: 2,
                        message: message,
                        pos: pos,
                        rot: handObj.quaternion
                    });
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
                var winMessage = new errorMessage({
                        timeToDisappear: 3000,
                        messageType: 0,
                        message: message,
                        pos: pos,
                        rot: handObj.quaternion
                    });
                
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
                
                var message = thisPlayer.name+" won by forfeit!";
                        var winMessage = new errorMessage({
                                timeToDisappear: 5000,
                                messageType: 2,
                                message: message,
                                pos: pos,
                                rot: handObj.quaternion
                        });
                    var totalMoney = 0;
                    for(var i=0; i<theGame.bettingPots.length; i++){
                        totalMoney += theGame.bettingPots[i].amount;
                    }
                    thisPlayer.money += totalMoney;
                    theGame.bettingPots = [];
                                    
                break;
            case "playerWin":
                
                
                    toggleVisible(theGame.betCube, false);
                
                    var highestHands = data.hands;
                     var handOrder = Object.keys(highestHands).map(function(val){return parseInt(val)});
                    
                    handOrder.sort(function(a, b){ //sorting in reverse order
                        return b-a;
                    });
                    
                    console.log(highestHands[handOrder[0]].players, "wins with", highestHands[handOrder[0]].hand);
                    var playerWins = [];
                    
                    /*
                    *   {player: theplayer,
                    *   amount: amount,
                    *   hand: hand}
                    */
                
                    var handIndex = 0;
                    for(var i=theGame.bettingPots.length-1; i>=0; i--){
                        var thisPot = theGame.bettingPots[i];
                        var splitAmount = 0;
                        if(highestHands[handOrder[handIndex]].players.length === 1){
                            var winningPlayer = theGame.players[highestHands[handOrder[handIndex]].players[0].spot];
                            if(winningPlayer.totalBet >= thisPot.amountToContribute){
                                splitAmount = thisPot.amount;
                                winningPlayer.money += splitAmount;
                                winningPlayer.renderChips();
                                thisPot.amount = 0;
                                //TODO: Figure out something better to do with this
                                
                                playerWins.push({
                                    player: winningPlayer,
                                    amount: splitAmount,
                                    hand: highestHands[handOrder[handIndex]].hand
                                })
                                
                            }else{
                                //not qualified for this hand, let's go to the next biggest hand
                                handIndex++;
                                i++;
                            }
                            
                        }else{
                            var thisPotAmount = thisPot.amount;
                            
                             //remove any players not qualified for this pot
                            var qualifiedPlayers = highestHands[handOrder[handIndex]].players.filter(function(elem){
                                return (theGame.players[elem.spot].totalBet >= thisPot.amountToContribute);
                            })
                            
                            for(var j=0; j<qualifiedPlayers.length; j++){

                                var winningPlayer = theGame.players[qualifiedPlayers[j].spot];
                                splitAmount = Math.floor(thisPotAmount/qualifiedPlayers.length);
                                winningPlayer.money += splitAmount;
                                thisPot.amount -= splitAmount;
                                winningPlayer.renderChips();

                                playerWins.push({
                                    player: winningPlayer,
                                    amount: splitAmount,
                                    hand: highestHands[handOrder[handIndex]].hand
                                })                           
                                
                            
                        }
                    }
                        
                        
                    
                }
                
                 var sendingMessages = [];
                        
                    for(var i=0; i<playerWins.length; i++){
                        
                            //go through the rest of the playerWins array
                            //merge any duplicates
                            //credit the highest hand
                        
                            for(var j=i+1; j<playerWins.length;j++){
                                if(playerWins[i].player.spot === playerWins[j].player.spot){
                                    playerWins[i].amount += playerWins[j].amount
                                    if(playerWins[j].hand.value > playerWins[i].hand.value || (playerWins[j].hand.value === playerWins[i].hand.value && playerWins[j].hand.subValue > playerWins[i].hand.subValue)){
                                        playerWins[i].hand = playerWins[j].hand;
                                    }
                                    playerWins.splice(j--, 1);
                                }
                            }
                                
                                var winningPlayer = playerWins[i].player;
                                var splitAmount = playerWins[i].amount;
                        
                                var handObj = playerWins[i].player.hand;
                                    var pos = new THREE.Vector3();
                                    pos.copy(handObj.position);

                                var forwardDirection = new THREE.Vector3();
                                    forwardDirection.copy(handObj.userData.forward);
                                    forwardDirection.multiplyScalar(-100);
                                    pos.add(forwardDirection);
                                    pos.y += 25;
                                if(playerWins.length === 1){
                                  var message = winningPlayer.name+" won $"+splitAmount+" with "+playerWins[i].hand.name+"!";
                                }else{
                                   var message = winningPlayer.name+" split the pot for $"+splitAmount+" with "+playerWins[i].hand.name+"!";
                                }
                                
                        
                                sendingMessages.push({
                                        timeToDisappear: 6000,
                                        messageType: 2,
                                        message: message,
                                        messagePos: pos,
                                        messageRot: handObj.quaternion
                                });
                                
                                
                                var cardMessage = "";
                                for(var k=0; k<playerWins[i].hand.cards.length; k++){
                                    if(k !== 0){
                                        cardMessage += ", ";
                                    }
                                    cardMessage += card.prototype.friendlyRepresentation.apply(playerWins[i].hand.cards[k]);
                                }
                                var pos2 = new THREE.Vector3();
                                pos2.copy(pos);
                                pos2.y += 50;
                                sendingMessages.push({
                                    timeToDisappear: 6000,
                                    messageType: 3,
                                    message: cardMessage,
                                    messagePos: pos2,
                                    messageRot: handObj.quaternion
                                });
                        
                    }
                    
                
                //condense any straggler chips to one pot
                        
                    makePot();
                    theGame.step = 9;
                    displayMessage(sendingMessages);
                
            
                    
                
                break;
            case "dealSharedCards":
                Array.prototype.push.apply(theGame.sharedCards.cards, data.sharedCards);
                for(var i=0; i<data.sharedCards.length; i++){
                    theGame.deck.shuffledDeck.pop();
                }
                break;
            case "transferControl":
                
                for(var i=0; i<theGame.players.length; i++){
                        theGame.players[i].state = data.endstatePlayers[i].state;
                        theGame.players[i].money = data.endstatePlayers[i].money;
                        toggleVisible(theGame.players[i].optionsui.mesh, false);
                }
                theGame.resetCards();
                cutoffTime = newUpdates[x].timestamp;

                theGame.roundRecord = [];
                    
                //we're about to get a hell of a lot of new updates
                authority = theGame.players[data.transferControl].userId;
                
                toggleVisible(theGame.players[data.transferControl].optionsui.mesh, true);

                
                if(theGame.players[data.transferControl].userId === globalUserId){
                    
                    console.log("WE ARE NOW AUTHORITY");
                    //we are now the dealer!
                    //apply the money and spots from the previous dealer
                    
                    theGame.roundRecord = [{title: "startedLevel", timestamp: Date.now()}];
                    cutoffTime = theGame.roundRecord[0].timestamp;

                    //lets wait 5 seconds before moving on
                    //register players

                    for(var i=0; i<theGame.players.length; i++){

                        if(theGame.players[i].state > -1){
                            theGame.players[i].state = 0;
                            theGame.roundRecord.push({data:{registerIndex: i, userId: theGame.players[i].userId, money: theGame.players[i].money, name: theGame.players[i].name}, timestamp: Date.now(), title: "registerPlayer"});
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
                    theGame.deck.shuffle();
                    sendUpdate({authority:globalUserId, deck: getSafeCards({cards: theGame.deck.shuffledDeck}), dealer: theGame.dealer},"startHand");

                    //theGame.deck.shuffle();
                    authority = globalUserId;
                    //create a new round record, send it to everyone
                    
                    //start level
                    setTimeout(function(){
                        theGame.start();
                    }, 5000);
                    
                    
                }
                break;
            default:
                console.log("No action specified for update", updateType, data);
                break;
                
        }
        
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
var cutoffTime; //if we recieve an update earlier than this, ignore it

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
                if(cutoffTime > element.timestamp || element.timestamp === theGame.roundRecord[i].timestamp){
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
   // processUpdates([{title:title, timestamp: Date.now(), data:extraData}])
    //theGame.syncInstance.update({title:title, data:theGame.roundRecord});
  if(typeof options.thenUpdate === "undefined" || options.thenUpdate === false){
    theGame.roundRecord.push({title: title, timestamp: Date.now(), data: extraData});
    theGame.syncInstance.update({title: title, data: theGame.roundRecord}); 
  }else{
    //should process this update immediately
    var time = Date.now();
    var newArr = theGame.roundRecord.concat([{title: title, timestamp: time, data: extraData}])
    
    theGame.syncInstance.update({title: title, data: newArr});

    
    
      
  }

  console.log(extraData);
  console.groupEnd(); 
}