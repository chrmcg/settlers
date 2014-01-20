
game.state = {
    phase: 0,
    turn: 1,
    next_action: 'buildSettlement',
    player_count: 0,
    game: game,
    devcards: {},
    longest_road: 0,
    largest_army: 2,
};

game.state.init = function(player_count, start_state) {
    this.player_count = player_count;
    for(var i = 0; i < player_count; i++) {
        this['p'+i] = {
            firstSettlement: null,
            secondSettlement: null,
            victoryPoints: 0,
            army: 0, //Number of Knight cards played 
            la: 0, // Largest Army
            lr: 0, // Longest Road
            r1: 0, //wood
            r2: 0, //sheep
            r3: 0, //wheat
            r4: 0, //brick
            r5: 0, //ore
            cK: 0, //Knight cards
            cR: 0, //Road Building cards
            cY: 0, //Year of Plenty cards
            cM: 0, //Monopoly cards
            cV: 0, //Victory Point Card cards
            roads: 15,
            settlements: 5,
            cities: 4,
            offer: {},
            proposal: {},
            color: start_state[i].color,
            id: start_state[i].id,
        };
    }

    this.devcards = {
        1: 'K', 2: 'K', 3: 'K', 4: 'K', 5: 'K', 6: 'K', 7: 'K', 8: 'K', 9: 'K', 10: 'K', 11: 'K', 12: 'K', 13: 'K', 14: 'K', //Knight
        15: 'R', 16: 'R', //Road Building
        17: 'Y', 18: 'Y', //Year of Plenty
        19: 'M', 20: 'M', //Monopoly
        21: 'V', 22: 'V', 23: 'V', 24: 'V', 25: 'V', //Victory Point Card
    };
};

// 1 = WOOD, 2 = SHEEP, 3 = WHEAT, 4 = BRICK, 5 = ORE

game.state.playerHas = function(player, resources) {
    var bool = true;
    for(var i in resources) {
        if(this['p'+(player-1)]['r'+i] < resources[i]) bool = false;
    }
    return bool;
};

game.state.playerCardCount = function(player) {
    var sum = 0;
    for(var i = 1; i <= 5; i++) {
        sum += parseInt(this['p'+(player-1)]['r'+i]);
    }
    return sum;
};

game.state.deduct = function(player, resources) {

    var str = '';

    for(var type in resources) {
        if(type > 0) {
            this['p'+(player-1)]['r'+type] -= resources[type];
            str += resources[type] + ' ' + [null, 'wood', 'sheep', 'wheat', 'brick', 'ore'][type] + ' ';
        }
    }
    console.log('Player ' + player + ' is deducted: ' + str);
    var obj = {};
    obj['p'+(player-1)] = JSON.stringify(this['p'+(player-1)]);
    obj['id'] = gapi.hangout.getLocalParticipant().person.id;
    gapi.hangout.data.submitDelta(obj);
    this.updateCards(player);
};

game.state.collect = function(player, resources) {
    var str = '';

    for(var type in resources) {
        if(type > 0) {
            this['p'+(player-1)]['r'+type] += resources[type];
            str += resources[type] + ' ' + [null, 'wood', 'sheep', 'wheat', 'brick', 'ore'][type] + ' ';
        }
    }
    var obj = {};
    obj['p'+(player-1)] = JSON.stringify(this['p'+(player-1)]);
    obj['id'] = gapi.hangout.getLocalParticipant().person.id;
    gapi.hangout.data.submitDelta(obj);
    console.log('Player ' + player + ' collects: ' + str);
    this.updateCards(player);
};

game.state.playerTradingFactors = function(player) {
    var obj = {1:4, 2:4, 3:4, 4:4, 5:4};

    for(var i = 0; i < 54; i++) {
        if(game.board.vertices[i].port > 0 && game.board.vertices[i].owner == player) {
            if(game.board.vertices[i].port == 6) {
                obj[1] = (obj[1] == 2 ? 2 : 3);
                obj[2] = (obj[2] == 2 ? 2 : 3);
                obj[3] = (obj[3] == 2 ? 2 : 3);
                obj[4] = (obj[4] == 2 ? 2 : 3);
                obj[5] = (obj[5] == 2 ? 2 : 3);
            } else {
                obj[game.board.vertices[i].port] = 2;
            }
        }
    }

    return obj;
}

game.state.updateVictoryPoints = function() {

    var s, c, lr, la, vpc, player, p2, r;

    var lr_arr = [];

    // update Largest Army, and count roads
    for(player = 1; player <= this.player_count; player++) {
        if(this['p'+(player-1)].army > this.largest_army) {
            this['p'+(player-1)].la = 1;
            for(p2 = 1; p2 <= this.player_count; p2++) {
                if(p2 != player) this['p'+(p2-1)].la = 0;
            }
            this.largest_army = this['p'+(player-1)].army;
            console.log('Player '+player+' has taken the Largest Army');
        }

        var r = game.board.roadLength(player);
        lr_arr[player-1] = r;
    }

    // update Longest Road using road counts
    this.longest_road = 0;
    var lrp = null;
    for(player = 1; player <= this.player_count; player++) {
        if(lr_arr[player-1] > this.longest_road) {
            this.longest_road = lr_arr[player-1];
            lrp = player;
        } else if(lr_arr[player-1] == this.longest_road && this['p'+(player-1)].lr == 1) {
            lrp = player;
        }
    }
    for(player = 1; player <= this.player_count; player++) {
        if(player == lrp && lr_arr[player-1] >= 5) {
            if(this['p'+(player-1)].lr == 0) {
                console.log('Player '+player+' has taken the Longest Road');
            }
            this['p'+(player-1)].lr = 1;
        } else {
            this['p'+(player-1)].lr = 0;
        }
    }

    // count each player's points
    for(player = 1; player <= this.player_count; player++) {
        s = (function(v){var a=0;
                for(var i = 0; i < 54; i++) { if(v[i].owner == player && v[i].contents == 1) a++; }
            return a;
            })(game.board.vertices);
        c = (function(v){var a=0;
                for(var i = 0; i < 54; i++) { if(v[i].owner == player && v[i].contents == 2) a++; }
            return a;
            })(game.board.vertices);


        la = (this['p'+(player-1)].la == 1) ? 2 : 0;
        lr = (this['p'+(player-1)].lr == 1) ? 2 : 0;
        vpc = this['p'+(player-1)].cV;

        this['p'+(player-1)].victoryPoints = s + (2*c) + lr + la + vpc;
        if(this['p'+(player-1)].victoryPoints >= 10) {
            this.next_action = 'winGame';
        }
    }

    var obj = {};
    for(var i = 0; i < this.player_count; i++) {
        obj['p'+i] = JSON.stringify(this['p'+i]);
    }
    obj['id'] = gapi.hangout.getLocalParticipant().person.id;
    gapi.hangout.data.submitDelta(obj);
    console.log('Victory points: p1 ' + this.p0.victoryPoints
                    + (this.p1?(', p2 ' + this.p1.victoryPoints):'')
                    + (this.p2?(', p3 ' + this.p2.victoryPoints):'')
                    + (this.p3?(', p4 ' + this.p3.victoryPoints):'')
                    );
};

game.state.updateCards = function(player) {
    var str = '';
    var resources = {};
    for(var i = 1; i <= 5; i++) {
        str += this['p'+(player-1)]['r'+i] + ' ' + [null, 'wood', 'sheep', 'wheat', 'brick', 'ore'][i] + ' ';
        resources[i] = this['p'+(player-1)]['r'+i];
    }

    var obj = {};
    obj['p'+(player-1)] = JSON.stringify(this['p'+(player-1)]);
    obj['id'] = gapi.hangout.getLocalParticipant().person.id;
    gapi.hangout.data.submitDelta(obj);
    game.statusbox.updateFields(player, resources);
};


game.state.download = function(state, callback) {
    //Apply state_event changes
    console.log(Object.keys(state));

    for(var i in state) {
        var key = i;
        var value = state[i];
        switch(key) {
            case 'edges':
                var edges = JSON.parse(value);
                for(var j = 0; j < edges.length; j++) {
                    game.board.edges[j].owner = edges[j].owner;
                    game.board.edges[j].road = edges[j].road;
                }
            break;
            case 'vertices':
                var vertices = JSON.parse(value);
                for(var j = 0; j < vertices.length; j++) {
                    game.board.vertices[j].contents = vertices[j].contents;
                    game.board.vertices[j].owner = vertices[j].owner;
                    game.board.vertices[j].port = vertices[j].port;
                }
            break;
            case 'hexes':
                var hexes = JSON.parse(value);
                for(var j = 0; j < 19; j++) {
                    game.board.hexes[j].num = hexes[j].num;
                    game.board.hexes[j].type = hexes[j].type;
                    game.board.hexes[j].robber = hexes[j].robber;
                }
            break;
            default:
                try {
                    this[key] = JSON.parse(value);
                } catch(e) {
                    if (key == 'turn' || key == 'phase') {
                        this[key] = parseInt(value)
                    } else {
                        this[key] = value;
                    }
                }
            break;
        }
    }
    if(callback != null) {
        callback(state);
    }
    if(window.drawn === true) {
        game.board.redraw();
    }
    if(this.turn === this.getLocalPlayerNumber()) {
        game.proceed();
    } else {
        console.log("Lock out!");
    }
};

game.state.getLocalPlayerNumber = function() {
    var id = gapi.hangout.getLocalParticipant().person.id;
    for(var i = 0; i < this.player_count; i++) {
        if(this['p'+i].id === id) {
            return i + 1;
        }
    }
};
