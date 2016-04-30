var numArray = [2, 3, 4, 5, 6, 7, 8, 9, 10, "jack", "queen", "king", "ace"];

var suitArray = ["clubs", "diamonds", "hearts", "spades"];
var suitSymbols = ["♣", "♦", "♥", "♠"];



function card(number, suit){
	this.number = number;
	this.suit = suit;
  this.image = document.createElement( 'img' );
  this.image.src = this.filename();
  this.movementTween = {
    position: new THREE.Vector3(0, 0, 0),
    rotation: new THREE.Vector3(0, 0, 0)
  };
  this.geom;// = null;
}

card.prototype.friendlyRepresentation = function(){
    return suitSymbols[suitArray.indexOf(this.suit)] + " " + this.friendlynumber();
}

card.prototype.friendlynumber = function(){
	return numArray[this.number];
}

card.prototype.texturePrefix = "assets/Cards/";

card.prototype.filename = function(){
	return this.texturePrefix+numArray[this.number]+"_of_"+this.suit+".png";
}





function deck(){
	this.perfectDeck = [];		//deck of cards in perfect order;
	this.shuffledDeck = [];
	for(var i=0; i<numArray.length; i++){
		for(var j=0; j<suitArray.length; j++){
			this.perfectDeck.push(new card(i, suitArray[j]));
		}
	}
    //this.makeGenericCard();
}

/*deck.prototype.makeGenericCard = function(){
            var manager = new THREE.LoadingManager();
             var loader = new THREE.AltOBJMTLLoader(manager);
             var backFilename = "assets/Models/CardBack.obj";
             var frontFilename = "assets/Models/CardFront.obj";
              var cardTexImg = document.createElement('img');
              cardTexImg.src = "assets/Models/CardTexture.png";  
	          var cardMat = new THREE.MeshBasicMaterial({map:new THREE.Texture(cardTexImg)});
              var tempMat = new THREE.MeshBasicMaterial({color: "#FFFFFF"});
             var scope = this;
             loader.load(backFilename, function ( card ) {
                 console.log('generic card loaded!', card);
                 
                 card.scale.set(300, 300, 300);
                 for(var i=0; i<card.children.length; i++){
                     var group = card.children[i];
                     group.material = cardMat;
                     
                 }
                 

                 loader.load(frontFilename, function(cardfront){
                    
                     for(var i=0; i<cardfront.children.length; i++){
                         var group = cardfront.children[i];
                         group.material = tempMat;

                     }
                     card.userData.cardFace = cardfront.children[0];
                     card.add(cardfront);
                     //sim.scene.add(card);
                     scope.genericCard = card;
                 })
                 
                 
             } );

}*/

deck.prototype.shuffle = function(){
	this.shuffledDeck = this.perfectDeck.slice(0);
	var tempCard;		//Fisher-Yates algorithm for randomness
	for(var i=this.shuffledDeck.length - 1; i > 0; i--){
		var j = Math.floor(Math.random() * (i+1));
		tempCard = this.shuffledDeck[i];
		this.shuffledDeck[i] = this.shuffledDeck[j];
		this.shuffledDeck[j] = tempCard;
	}
}

deck.prototype.arrange = function(arrangement){
    
    for(var i=0; i<arrangement.length; i++){
        for(var j=0; j<this.perfectDeck.length; j++){
            if(this.perfectDeck[j].number === arrangement[i].number && this.perfectDeck[j].suit === arrangement[i].suit){
              this.shuffledDeck[i] = this.perfectDeck[j];
              break;
            }
        }
    }
}

deck.prototype.dealTo = function(players, numCards){
	if(typeof(players.length) == "undefined"){
		players = [players];
	}
	for(var i=0; i<numCards; i++){
		var thiscard = this.shuffledDeck.pop();
		for(var j=0; j<players.length; j++){
			players[j].cards.push(thiscard);
		}
	}
}

deck.prototype.revealCard = function(theCard){
    if(!theCard.geom.userData.hidden){
        console.log("this card is already visible!");
        return;
    }
    
    var parent = theCard.parent;
    
}

deck.prototype.getCard = function(theCard, large, visible){
  large = large || false;
  visible = visible || false;
  console.log(theCard, large, visible);

  //console.log(theCard, (theCard instanceof card));
  
  var thisCard;
  if(theCard instanceof card){
    thisCard = theCard;
  }else{
    for(var i=0; i<this.perfectDeck.length; i++){
        if(this.perfectDeck[i].number === theCard.number && this.perfectDeck[i].suit === theCard.suit){
          thisCard = this.perfectDeck[i];
          break;
        }
    }
  }
  
  if(!visible){
      
      sim.scene.remove(thisCard.geom);
      delete thisCard.Geom;
      
      thisCard.geom = createHiddenCardGeom();
      
      thisCard.geom.position.set(0, tableOffset.y - cardTemplate.height/2 + 10, 0);
      thisCard.geom.rotation.set(Math.PI/2, 0, 0);
      thisCard.geom.scale.set(1, 1, 1);
      
  }else{
    
      if(typeof thisCard.geom === 'undefined' || thisCard.geom.userData.large !== large || thisCard.geom.userData.hidden){

        sim.scene.remove(thisCard.geom);
        delete thisCard.geom;

        createCardGeom(thisCard, large);
        thisCard.geom.userData.large = large;
      }
      if(large){
        thisCard.geom.scale.set(1.5, 1.5, 1.5);
        thisCard.geom.position.set(i*0.1, thisCard.geom.position.y, i*0.1);
        thisCard.geom.rotation.set(0, Math.PI/4, 0);
        toggleVisible(thisCard.geom, true);
        thisCard.movementTween.rotation.copy(thisCard.geom.rotation);
        thisCard.movementTween.position.copy(thisCard.geom.position);
      }else{
        thisCard.geom.position.set(0, tableOffset.y - cardTemplate.height/2 + 10, 0);
        thisCard.geom.rotation.set(Math.PI/2, 0, 0);
        thisCard.geom.scale.set(1, 1, 1);
        toggleVisible(thisCard.geom, true);
      }
  }
  return thisCard;
}


function createHiddenCardGeom(){

	return createCardGeom({}, false, false);
}

function createCardGeom(theCard, doubleSided, visible){
   doubleSided = doubleSided || false;
   if(typeof theCard.geom !== "undefined"){
     theCard.geom.parent.remove(theCard.geom);
     delete theCard.geom;
   }

    console.log('cloning the card models');
    
    //var geometry =     
    
    
    
    var cardfront = theGame.models.CardFront.clone();
    //uv for the card front is flipped, so we have to do this for some reason
    cardfront.scale.set(-300, 300, 300);
    var material;
    if(visible){
        material = new THREE.MeshBasicMaterial({color:'#000000'});
    }else{
        material = new THREE.MeshBasicMaterial({color:'#FFFFFF', map: new THREE.Texture(theCard.image)});
        material.side = THREE.BackSide;
    }
	//var material = new THREE.MeshBasicMaterial({color:'#FFFFFF', map: new THREE.Texture(theCard.image)});
    for(var j=0; j<cardfront.children.length; j++){
        var mesh = cardfront.children[j];
        mesh.material = material;            
    }
    var card = new THREE.Object3D();
    
    card.add(cardfront);
    
    if(doubleSided){
        var othercardfront = cardfront.clone();
        othercardfront.rotation.y = Math.PI;
        card.add(othercardfront);
    }else{
        var cardback = theGame.models.CardBack.clone();
        card.add(cardback);
    }
  
  card.position.copy(tableOffset);
  card.position.y += cardTemplate.height/2;
  
  sim.scene.add(card);  
  theCard.geom = card;
  return card; 
}

function ruleset(){
	this.handRanking = [];
}

ruleset.prototype.judge = function(cards){
	var hand = {
		name: "",
		value: -1,
	};
	for(var i=0; i<this.handRanking.length; i++){
        
        //should sort cards here
        
        var thesecards = this.handRanking[i].isHand(cards);
		if(thesecards != false){
			hand.name = this.handRanking[i].name;
            hand.cards = thesecards.cards;
			hand.value = this.handRanking.length - i;
            hand.subValue = thesecards.subVal;  //when comparing hands to see who has the higher pair (for instance), use this value, if value is the same the players tie
            console.log(hand);
			break;
		}
	}
	return hand;
}

function sameCards(setOne, setTwo){
    //assuming the cards are in the correct order
    if(setOne.length !== setTwo.length || setOne.length === 0 || !setOne.length){
        return false;
    }
    
    for(var i=0; i<setOne.length; i++){
        if(setOne[i].number !== setTwo[i].number || setOne[i].suit !== setTwo[i].suit){
            return false;
        }
    }
    return true;
    
}

function maxCardVal(cards){
     return Math.max.apply(null, cards.map(function(val){return val.number}));
}


var mainRules = new ruleset();
mainRules.handRanking = [
	{
		name: "Straight Flush",
		isHand: function(cards){
            
            var straightCards = isStraight(cards);
            var flushCards = isFlush(cards);
			if(straightCards !== false && flushCards !== false && sameCards(straightCards, flushCards)){
                return {
                    cards: straightCards.concat(flushCards),
                    subVal:  maxCardVal(straightCards)
                }
            }else{
                return false;
            }
		}
	},
	{
		name: "Four of a kind",
		isHand: function(cards){
			var multiples = hasMultiples(cards, 4);
            if(multiples === false){
                return false;
            }
            
            return {
                cards: multiples,
                subVal: multiples[0].number
            }
		}
	},
	{
		name: "Full House",
		isHand: function(cards){
			var multiples = hasMultiples(cards, 3);
            if(multiples.length !== 3){
                return false;
            }else{
                var newCards = cards.slice();
                newCards = newCards.filter(function(obj){
                    return (multiples.indexOf(obj) !== -1)
                });
                var secondMultiples = hasMultiples(newCards, 2);
                if(secondMultiples.length !== 2){
                    return false;
                }else{
                    return {
                        cards: multiples.concat(secondMultiples),
                        subVal: Math.max(parseInt(multiples[0].number), parseInt(secondMultiples[0].number))
                    }
                }
            }
		}
	},		
	{
		name: "Flush",
		isHand: function(cards){
			var flushCards = isFlush(cards);
            if(flushCards === false){
                return false
            }
            
            return {
                cards: flushCards,
                subVal: maxCardVal(flushCards)
            }
		}
	},		
	{
		name: "Straight",
		isHand: function(cards){
			var straightCards = isStraight(cards);
            if(straightCards === false){
                return false;
            }else{
                return{
                    cards:straightCards,
                    subVal: maxCardVal(straightCards)
                }
            }
		}
	},		
	{
		name: "Three of a kind",
		isHand: function(cards){
            var threeCards = hasMultiples(cards, 3);
			if(threeCards === false){
                return false;
            }
            return {
                cards: threeCards,
                subVal: threeCards[0].number
            }
		}
	},	
	{
		name: "Two pair",
		isHand: function(cards){
			var multiples = hasMultiples(cards, 2);
            if(multiples.length !== 2){
                return false;
            }else{
                var newCards = cards.slice();
                newCards = newCards.filter(function(obj){
                    return obj.number !== multiples[0].number;
                });
                var secondMultiples = hasMultiples(newCards, 2);
                if(secondMultiples.length !== 2){
                    return false;
                }else{
                    var retMultiples = multiples.concat(secondMultiples);
                    return {
                        cards: retMultiples,
                        subVal: maxCardVal(retMultiples)
                    }
                }
            }
		}
	},	
	{
		name: "One pair",
		isHand: function(cards){
			var pairCards = hasMultiples(cards, 2);
            if(pairCards === false){
                return false;
            }
                
            return {
                cards: pairCards,
                subVal: pairCards[0].number
            }
            
		}
	},	
	{
		name: "High card",
		isHand: function(cards){
            var highCard = -1;
            var cardIndex;
            for(var i=0; i<cards.length; i++){
                if(cards[i].number > highCard){
                    highCard = cards[i].number;
                    cardIndex = i;
                }
            }
            return {
                cards: [cards[cardIndex]],
                subVal: cards[cardIndex].number
            }
		}
	},	
]

function hasMultiples(cards, numberOfMultiples){
	if(numberOfMultiples <= 1){
        console.log('need to check for more than one card!');
	}
	var sortedCards = [];
	for(var i=0; i<cards.length; i++){
		if(typeof(sortedCards[cards[i].number]) == "undefined"){
			sortedCards[cards[i].number] = {
                cards: [cards[i]],
                num: 0
            };
		}else{
            sortedCards[cards[i].number].cards.push(cards[i]);
        }
		sortedCards[cards[i].number].num++;
	}
	
	var findThem = false;
	
	sortedCards.forEach(function(obj){
		if(parseInt(obj.num) === parseInt(numberOfMultiples)){
			findThem = obj.cards;
		}
	})
	
	return findThem;
}

function isFlush(cards){
      if(cards.length < 5){
          return false;
      }
        var suits = {};
        for(var i=0; i<cards.length; i++){
            if(typeof suits[cards[i].suit] === "undefined"){
                suits[cards[i].suit] = {
                    cards: [cards[i]],
                    num: 0
                }
            }else{
                suits[cards[i].suit].cards.push(cards[i]);
            }
            suits[cards[i].suit].num++;
            
        }
      var isFlush = false;
  
      for(var propertyName in suits) {
        if(suits.hasOwnProperty(propertyName) && suits[propertyName].num>=5){
          isFlush = suits[propertyName].cards;
        }
      }
    return isFlush;
}

function isStraight(cards){
	var theseCards = cards.slice(0);
	theseCards.sort(function(card1, card2){
		if(card1.number === card2.number){
			return 0;
		}else{
			return card1.number > card2.number;
		}
	});
    
    var foundStraight = false;
    
    var numTries = cards.length - 5;
    //we have this many attempts to find a straight
    
    for(var i=0; i<numTries; i++){
        for(var j=0; j<5; j++){
            if(theseCards[i+j].number !== (theseCards[i+j].number+1)){
                break;
            }
            if(j===4){
                //if we've gotten this far, we're done!
                return theseCards.slice(i, i+5);
            }
        }
        
    }
    
	return false;
}

function pot(){
    this.amountToContribute = 0;
    this.locked = false;
    this.amount = 0;
}


function game(){
	this.players = [];
  this.dealingOrder = [];
  this.bettingOrder = [];
  this.dealer = 0;
  this.better = 0;
  this.smallBlind = 5;
  this.bigBlind = 10;
  this.deck = {};
  this.locked = false;
  this.step = -1;
  this.judge = mainRules;
  //whoever can deal cards
  this.currentAuthority;
  
  this.sharedCards = {
    cards:[]
  };
  this.currentBet = 0;
  this.bettingPots = [new pot()];
  this.roundRecord = [];
}

game.prototype.newPot = function(){
    this.bettingPots[0].locked = true;
    //this.bettingPots.push(this.bettingPot);
    var newpot = new pot();
    this.bettingPots.unshift(newpot);
}

game.prototype.start = function(){
  this.step = 1;
  this.better = 0;
  this.runStep();
}

game.prototype.resetCards = function(){
    
                var player;
                for(var i=0; i<this.players.length; i++){
                    player = this.players[i];
                    for(var j=0; j<player.cards.length; j++){
                        cardToDeck(player.cards[j]);
                        delete player.cards[j].geom;
                    }
                    //player.cards = [];
                    toggleVisible(player.bettingui.mesh, false);
                }
                
                for(var i=0; i<this.sharedCards.cards.length; i++){
                    cardToDeck(this.sharedCards.cards[i]);
                    delete this.sharedCards.cards[i].geom;
                }
                this.sharedCards.cards = [];
    
}


game.prototype.resetBetters = function(){
    
  //sets the betting order to a list of the players that should be given the option to bet this round
    
  var bettingOrder = [];
  for(var i=0; i<this.dealingOrder.length; i++){
    if(this.dealingOrder[i].state === 2 && this.dealingOrder[i].money > 0){// > 0 && this.dealingOrder[i].state <= 3){    //they're still in the game, but waiting
      this.dealingOrder[i].betThisRound = 0;
      bettingOrder.push(i);
    }
  }
  for(var i=0; i<this.dealer; i++){
      bettingOrder.push(bettingOrder.shift());
  }
  this.bettingOrder = bettingOrder;
}

game.prototype.playersThatNeedToBet = function(){
    var players = [];
    for(var i=0; i<this.dealingOrder.length; i++){
        if(this.dealingOrder[i].state === 2 && this.dealingOrder[i].betThisRound < this.currentBet){
            
            players.push(i);
            
        }
    }
    return players;
}

game.prototype.resetDealers = function(){
  console.log('reseting dealers'); 
   var order = this.players.slice();
    this.dealingOrder = [];
    
    //get the dealing order
    
    for(var i=0; i<order.length; i++){
        if(order[i].state > -1){
            this.dealingOrder.push(order[i]);
        }
    }
}

game.prototype.rotateDealers = function(){ 
    
    this.resetDealers();
    
    //increment the dealer index
    
    this.dealer = (this.dealer+1)%this.dealingOrder.length;
    
    
}

game.prototype.runClientStep = function(){
    if(typeof this.logic.steps[this.step].execClient !== "undefined"){
        this.logic.steps[this.step].execClient(this);
    }
}

game.prototype.runStep = function(){
  this.logic.steps[this.step].exec(this);
}

game.prototype.nextBet = function(){
  //sets the state of the current player back to 'wait' (2) and sets state of next player to 'bet' (3)
    
  //if this player hasn't folded
  if(this.dealingOrder[this.bettingOrder[this.better]].state !== 4){
    //set them back to 'waiting' state
    this.dealingOrder[this.bettingOrder[this.better]].state = 2;
  }
  this.better++;

  this.startBetting();

} 

game.prototype.startBetting = function(){
    
  if(this.better === this.bettingOrder.length){ //&& (game.currentAuthority === globalUserId)){
    //check to see if the pot is light
    var playersLeft = this.playersThatNeedToBet();
    if(playersLeft.length != 0){
        //pot is light, make people bet that still need to
        this.bettingOrder = playersLeft;
        this.better = 0;
        this.startBetting();
    }else{
        //pot is full
      
      
        this.better = 0;
        if(this.currentAuthority === globalUserId){
          //gonna just use a timeout

            this.step++;
            console.log('done betting, on to the next step!');
            this.runStep();

        }
    }
  }else if(this.dealingOrder[this.bettingOrder[this.better]].state !== 3){
    this.dealingOrder[this.bettingOrder[this.better]].state = 3;
  }
}

var betStep = function(game){
        toggleVisible(game.betCube, true);// game.betCube.visible = true;
        game.resetBetters();
        game.better = 0;
        game.currentBet = 0;
        if(game.step === 2){
            game.dealingOrder[game.bettingOrder[game.better]].bet(game.smallBlind);
            game.dealingOrder[game.bettingOrder[game.better]].renderChips();
            game.nextBet();
            game.dealingOrder[game.bettingOrder[game.better]].bet(game.bigBlind);
            game.dealingOrder[game.bettingOrder[game.better]].renderChips();
            game.nextBet();
            makePot();
        }else{
            game.dealingOrder[game.bettingOrder[game.better]].state = 3;
        }

}

var getSharedCardPosition = function(i){
    return {x:(80-(cardTemplate.width+15)*i), y: 0, z: (-80+(cardTemplate.width+15)*i)};
}

var texasHoldEm = {
	steps: [
    {   //0
      exec: function(game){
        //this is run on the very first hand only
        //game.dealer = 0;
        game.deck.shuffle();
        game.currentAuthority = globalUserId;
        sendUpdate({authority:globalUserId, dealer: game.dealer, deck: getSafeCards({cards: game.deck.shuffledDeck})}, "startHand");
        game.start();
        //since only the dealer will do this step, we can assume the globalUserId is the dealer
        
      }
    },
		{   //1
            execClient: function(game){
                if(typeof game.startGameButton !== 'undefined'){
                    game.startGameButton.visible = false;
                }
                game.step = 2;
                game.runClientStep();
            },
			exec: function(game){
				//deal 2 to players                
                for(var i=0; i<game.players.length; i++){
                  if(game.players[i].state > -1 && game.players[i].cards.length === 0){
                    game.deck.dealTo(game.players[i], 2);
                    game.players[i].state = 1;    //player animates their own cards 
                    sendUpdate({index: i, player: getSafePlayer(game.players[i])}, "dealingCards");
                  }
                }
                sendUpdate({toStep: 1}, "changeGameStep", {thenUpdate: true});
                
            }
                
			
            
		},
		{ //2
			execClient: betStep
		},
		{ //3
            execClient: function(game){
                
                toggleVisible(game.betCube, false);

                for(var i=0; i<game.sharedCards.cards.length; i++){ 
                   game.sharedCards.cards[i] = game.deck.getCard(game.sharedCards.cards[i], true, true);
                   var toSharedTween = new TWEEN.Tween(game.sharedCards.cards[i].movementTween.position).to(getSharedCardPosition(i), 2000); 
                   toSharedTween.onUpdate((function(card){
                      return function(value1){
                          //move the cards to the player
                        card.geom.position.copy(card.movementTween.position);
                      }
                    }(game.sharedCards.cards[i])));
                   toSharedTween.start();
                }
                game.step = 4;
                game.runClientStep();
            
            },
			exec: function(game){
                                
                //make a show of discarding a card?
                var dealTo = [];
                dealTo.push(game.sharedCards);
                game.deck.dealTo(dealTo, 3);
                sendUpdate({sharedCards: getSafeCards(game.sharedCards)}, "dealSharedCards");
                sendUpdate({toStep: 3}, "changeGameStep", {thenUpdate: true});

            }
                
		},
		{ //4
			execClient: betStep
		},
		{ //5
            execClient: function(game){
                toggleVisible(game.betCube, false);
                game.sharedCards.cards[3] = game.deck.getCard(game.sharedCards.cards[3], true, true);

                       var toPlayerTween = new TWEEN.Tween(game.sharedCards.cards[3].movementTween.position).to(getSharedCardPosition(3), 2000);
                       toPlayerTween.onUpdate((function(card){
                          return function(value1){
                              //move the cards to the player
                            card.geom.position.copy(card.movementTween.position);
                          }
                        }(game.sharedCards.cards[3])));
                       toPlayerTween.start();
                game.step = 6;
                game.runClientStep();
            },
			exec: function(game){
                
                    var dealTo = [];
                    dealTo.push(game.sharedCards);
                    game.deck.dealTo(dealTo, 1);
                    sendUpdate({sharedCards:getSafeCards({cards:[game.sharedCards.cards[3]]})}, "dealSharedCards");
                    sendUpdate({toStep: 5}, "changeGameStep", {thenUpdate: true});                    
            
			}
		},
		{ //6
			execClient: betStep
		},
		{ //7
            execClient: function(game){
                toggleVisible(game.betCube, false);
                 game.sharedCards.cards[4] = game.deck.getCard(game.sharedCards.cards[4], true, true);

                       var toPlayerTween = new TWEEN.Tween(game.sharedCards.cards[4].movementTween.position).to(getSharedCardPosition(4), 2000);
                       toPlayerTween.onUpdate((function(card){
                          return function(value1){
                              //move the cards to the player
                            card.geom.position.copy(card.movementTween.position);
                          }
                        }(game.sharedCards.cards[4])));
                       toPlayerTween.start();
                game.step = 8;
                game.runClientStep();
            },
			exec: function(game){
                
                
                
                    var dealTo = [];
                    dealTo.push(game.sharedCards);
                    game.deck.dealTo(dealTo, 1);
                    sendUpdate({sharedCards:getSafeCards({cards:[game.sharedCards.cards[4]]})}, "dealSharedCards");
                    sendUpdate({toStep: 7}, "changeGameStep", {thenUpdate: true});                
                
			}
		},
		{ //8
			execClient: betStep
		},
		{ //9
            execClient: function(game){
            },
			exec: function(game){
        
                    var highestHand = [];
                    var winningPlayer;
                
                    game.resetBetters();
                    console.log("betters are", game.bettingOrder);
                    
                    var winnerOrder = [];
                    
                    for(var i=0; i<game.bettingOrder.length; i++){
                      var judgeValue = game.judge.judge(game.dealingOrder[game.bettingOrder[i]].cards.concat(game.sharedCards.cards))
                      judgeValue.cards = getSafeCards(judgeValue);
                      if(typeof highestHand[judgeValue.value] === "undefined"){
                            var writeObj = {
                                hand: {},
                                players: []
                            };
                            writeObj.hand = judgeValue;
                            writeObj.players.push(getSafePlayer(game.dealingOrder[game.bettingOrder[i]]));
                            highestHand[judgeValue.value] = writeObj;
                       }else{
                           
                           //see if it's actually a tie, or if someone else has a better version
                           
                           if(highestHand[judgeValue.value].hand.subValue === judgeValue.subValue){
                               //this new hand ties
                               highestHand[judgeValue.value].players.push(getSafePlayer(game.dealingOrder[game.bettingOrder[i]]));
                           }else if(parseInt(highestHand[judgeValue.value].hand.subValue) < parseInt(judgeValue.subValue)){
                               //this new hand wins
                                var writeObj = {
                                    hand: {},
                                    players: []
                                };
                                writeObj.hand = judgeValue;
                                writeObj.players.push(getSafePlayer(game.dealingOrder[game.bettingOrder[i]]));
                                highestHand[judgeValue.value] = writeObj;
                           }else{
                               console.log("Close loss!", highestHand[judgeValue.value].hand, judgeValue);
                           }                   
                           
                       }

                    }
                    
                    //we want to sort numerically, highest rated hand won
                
                    sendUpdate({hands: highestHand}, "playerWin", {thenUpdate: true});
                    
                    var handOrder = Object.keys(highestHand).map(function(val){return parseInt(val)});
                    handOrder.sort(function(a, b){ //sorting in reverse order
                        return b-a;
                    });
                    
                    console.log(highestHand[handOrder[0]].players, "wins with", highestHand[handOrder[0]].hand);
                
                    for(var i=0; i<handOrder.length; i++){
                        //start at the highest hand and award money
                        if(theGame.bettingPots.length === 0){
                            console.log("Done awarding money!");
                            break;
                        }
                        var winningPlayers = highestHand[handOrder[i]].players;
                        awardMoney(winningPlayers);
                        
                    }
                
                    //sendUpdate({toStep: 10}, "changeGameStep");
                    game.step = 10;
                    //game.resetCards();

                   // game.runClientStep();
                    game.runStep(); //kick out players without money, transfer control
                
                
			}
		},
    { //10
        
        execClient: function(game){
            
        },
      exec: function(game){
        
        
            for(var i=0; i<game.dealingOrder.length; i++){
              //go through every player, if they have no money, they need to leave
              //broke-ass punks

              if(game.dealingOrder[i].money === 0 && game.dealingOrder[i].state !== -1){
                if(!game.locked){
                    game.dealingOrder[i].state = -1;
                }else{
                    game.dealingOrder[i].state = -3;
                }
                if(i === game.dealer){
                    game.dealer--;  //if this person folds out, pretend like the person right before them was the dealer when we rotate
                }
              }
            }
            
            var playerStates = [];
            for(var i=0; i<game.players.length; i++){
               // game.players[i].cards = [];
                playerStates.push(getSafePlayer(game.players[i]));
            }
            
            game.rotateDealers();
            
            //sendUpdate({transferControl: game.dealingOrder[game.dealer].spot, endstatePlayers: playerStates}, "transferControl", {thenUpdate: true});
          
    
        }
    }
	]
}


function awardMoney(playerList){
    //this is a list of players we need to give money in the betting pot to
    
    //first lets handle the case of a single player, how much did they win
    
    var player = playerList[0];
    var threshold = player.totalBet;
    
    
    
}

function toggleVisible(object, visible){
      object.visible = visible;
      for(var i = 0, max = object.children.length; i<max ;i++){
         toggleVisible(object.children[i], visible);
      }
}




