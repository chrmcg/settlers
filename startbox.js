game.startbox = {
    game: game,
    wrapper_outer: null,
    fields: [],
    players: [],
    rects: [],
    button: null
}

game.startbox.init = function() {
    this.wrapper_outer = document.createElementNS(game.ns, 'g');
    game.svg.appendChild(this.wrapper_outer);

    this.colors = ['orange', 'red', 'blue', 'purple'];
    var rect, g;
    g = document.createElementNS(game.ns, 'g');
    g.setAttribute('transform', 'translate(120, 20)');
    for(var i = 0; i < 4; i++) {
        rect = document.createElementNS(game.ns, 'rect');
        rect.setAttribute('fill', this.colors[i]);
        rect.setAttribute('x', ''+(i*110));
        rect.setAttribute('y', '0');
        rect.setAttribute('width', '100');
        rect.setAttribute('height', '50');
        //rect.setAttribute('onclick', 'game.startbox.pickColor('+i+',"'+ this.colors[i] +'")');
        this.rects.push(rect);
        g.appendChild(rect);
    }
    
    this.wrapper_outer.appendChild(g);

    var text;
    for(var i = 0; i < 4; i++) {
        text = document.createElementNS(game.ns, 'text');
        text.setAttribute('x', '350');
        text.setAttribute('y', ''+(50 * (i + 2)));
        text.setAttribute('visibility', 'hidden');
        text.setAttribute('text-anchor', 'middle');
        this.wrapper_outer.appendChild(text);
        this.fields[i] = {text: text};
    }

    this.button = document.createElementNS(game.ns, 'g');
    rect = document.createElementNS(game.ns, 'rect');
    rect.setAttribute('width', '100');
    rect.setAttribute('height', '30');
    rect.setAttribute('fill', 'gray');
    rect.setAttribute('stroke', 'black');
    text = document.createElementNS(game.ns, 'text');
    text.textContent = 'START';
    text.setAttribute('x', '50');
    text.setAttribute('y', '21');
    text.setAttribute('text-anchor', 'middle');

    this.wrapper_outer.appendChild(this.button);
    this.button.appendChild(rect);
    this.button.appendChild(text);

    this.button.setAttribute('transform', 'translate(20, 200)');
    this.button.setAttribute('class', 'menu-item');

    // Initial download of player data
    var val = gapi.hangout.data.getValue('startbox_players');
    if(val !== undefined) {
        this.players = JSON.parse(val);
    } else { 
        this.players = {};
    }

    var id = gapi.hangout.getLocalParticipant().person.id;
    if(this.players[id] !== undefined) {
        delete this.players[id];
    }

    // Initial addition of any new participants to local player data
    // we do not need everyone to get this information because it is shared
    // only submitDelta on color or readiness change.
    game.startbox.onChanged(gapi.hangout.getEnabledParticipants());
}

game.startbox.pickColor = function(id, color) {
    this.players[id].color = color;

    gapi.hangout.data.submitDelta({startbox_players: JSON.stringify(this.players)});
};

game.startbox.refresh = function(state) {
    if(state.startbox_players !== undefined) {
        this.players = JSON.parse(state.startbox_players);
    }

    var local_id = gapi.hangout.getLocalParticipant().person.id;
    for(var r = 0; r < this.rects.length; r++)  {
        this.rects[r].setAttribute('onclick', 'game.startbox.pickColor("'+local_id+'","'+this.rects[r].getAttribute('fill')+'")');
        this.rects[r].setAttribute('visibility', 'visible');
    }

    var ids = Object.keys(this.players);
    ids.sort();

    var n = 0;
    var all_ready = true;
    for(var i = 0; i < ids.length; i++) {
        for(var r = 0; r < this.rects.length; r++) {
            if(this.rects[r].getAttribute('fill') == this.players[ids[i]].color) {
                this.rects[r].setAttribute('onclick', '');
                this.rects[r].setAttribute('visibility', 'hidden');
            }
        }
        
        if(this.players[ids[i]].color !== undefined) {
            this.fields[n].text.setAttribute('fill', this.players[ids[i]].color);
            this.fields[n].text.setAttribute('font-weight', 'bold');
        } else {
            this.fields[n].text.setAttribute('fill', 'black');
            this.fields[n].text.setAttribute('font-weight', 'normal');
        }
        this.fields[n].text.textContent = this.players[ids[i]].name;
        this.fields[n].text.setAttribute('visibility', 'visible');
        if(this.players[ids[i]].ready !== true) {
            all_ready = false;
        }
        n++;
    }

    for(; n < 4; n++) {
        this.fields[n].text.setAttribute('fill', 'black');
        this.fields[n].text.textContent = '';
        this.fields[n].text.setAttribute('visibility', 'hidden');
    }

    // If there are players with the same color because of latency, reset their color
    // and make them choose again.  Only one player's color will stay.
    // for(var i = 0;  i < this.players.length; i++) {
    //     for(var j = i + 1; j < this.players.length; j++) {
    //         if (this.players[i].color == this.players[j].color) {
    //             this.players[j].color = undefined;
    //             this.players[j].text.setAttribute('fill', 'black');
    //             this.players[j].text.setAttribute('font-weight', 'normal');
    //         }
    //     }
    // }

    if (ids.length > 1 && this.players[local_id].color !== undefined) {
        this.button.children[0].setAttribute('fill', 'white');
        this.button.setAttribute('onclick', 'game.startbox.setReady("'+ local_id +'")');
    } else {
        this.button.children[0].setAttribute('fill', 'gray');
        this.button.setAttribute('onclick', '');
    }

    if(all_ready === true) {
        game.startGame(ids.length, this.players);
    }
};

game.startbox.onChanged = function(participants) {
    
    // Check to see if there are any players 
    // in the player array that have left, and delete them
    var deletes = [];
    for(var id in this.players) {
        var found = false;
        for(var i = 0; i < participants.length; i++) {
            var part_id = participants[i].person.id;
            if(part_id === id) {
                found = true;
            }
        }
        if (found === false) {
            deletes.push(id);
        }
    }
    for(var i = 0; i < deletes.length; i++) {
        delete this.players[deletes[i]];
    }
    
    // Check if all participants are in player array
    // if not, add it
    for(var i = 0; i < participants.length; i++) {
        var id = participants[i].person.id;
        if(this.players[id] === undefined) {
            this.players[id] = {
                id: id,
                name: participants[i].person.displayName,
                ready: false,
            }
        }
    }

    gapi.hangout.data.submitDelta({startbox_players: JSON.stringify(this.players)});

    // Draw players and check player data for relevant information
    game.startbox.refresh(gapi.hangout.data.getState());
};

game.startbox.setReady = function(id) {
    this.players[id].ready = true;
    gapi.hangout.data.submitDelta({startbox_players: JSON.stringify(this.players)});
};
