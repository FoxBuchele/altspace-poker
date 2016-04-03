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


























