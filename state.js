
game.state = {
    phase: 0,
    turn: 1,
    next_action: 'buildSettlement',
    player_count: 0,
    game: game,
    devcards: {},
    longest_road: 0,
    largest_army: 2,
    d1: 0,
    d2: 0
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
            newcards: {},
            roads: 15,
            settlements: 5,
            cities: 4,
            offer: {},
            proposal: {},
            color: start_state[i].color,
            id: start_state[i].id,
            robbed: false
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
    game.display.refreshResourceCounts();
};

game.state.collect = function(player, resources) {
    var str = '';

    for(var type in resources) {
        if(type > 0) {
            this['p'+(player-1)]['r'+type] += resources[type];
            str += resources[type] + ' ' + [null, 'wood', 'sheep', 'wheat', 'brick', 'ore'][type] + ' ';
        }
    }
    console.log('Player ' + player + ' collects: ' + str);
    game.display.refreshResourceCounts();
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

game.state.updateVictoryPoints = function(params) {

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
    if (params !== undefined) {
        for (var key in params) {
            obj[key] = params[key];
        }
    }
    gapi.hangout.data.submitDelta(obj);
    console.log('Victory points: p1 ' + this.p0.victoryPoints
                    + (this.p1?(', p2 ' + this.p1.victoryPoints):'')
                    + (this.p2?(', p3 ' + this.p2.victoryPoints):'')
                    + (this.p3?(', p4 ' + this.p3.victoryPoints):'')
                    );
};

game.state.download = function(state) {
    console.log(Object.keys(state));
    var prevPhase = game.state.phase;
    //Apply state_event changes
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
            case 'id':
                this[key] = value;
            break;
            default:
                try {
                    this[key] = JSON.parse(value);
                } catch(e) {
                    if (key === 'turn' || key === 'phase' || key === 'd1' || key === 'd2' || key === 'player_count') {
                        this[key] = parseInt(value);
                    } else {
                        this[key] = value;
                    }
                }
            break;
        }
    }

    var num = this.getLocalPlayerNumber();
    // This makes sure that this doesn't happen before everything is initialized
    if (window.drawn === true) {
        game.board.redraw();
        if(this.turn === num) {
            if((this.next_action === 'rollDice' && window.diceRolled === false) || ((this.phase === 0 || this.phase === 1) && this.next_action === 'buildSettlement')) {
                game.actions.cancelSelect();
                game.proceed();
            }
        }
        if(this.next_action === 'getRobbed' && this['p'+(num-1)].robbed === false) {
            var cards = 0;
            for(var i = 1; i <= 5; i++) {
                cards += this['p'+(num-1)]['r'+i];
            }
            if(cards > 7) {
                game.actions.selectCards('R', {card_count: cards});
            } else {
                this['p'+(num-1)].robbed = true;
                var obj = {};
                obj['p'+(num-1)] = JSON.stringify(this['p'+(num-1)]);
                gapi.hangout.data.submitDelta(obj);
            }
        }
        if (this.turn === num && this.next_action === 'getRobbed') { 
            var numrobbed = 0;
            for(var i = 0; i < this.player_count; i++) {
                if(this['p'+i].robbed === true) {
                    numrobbed++;
                }
            }
            if(numrobbed === this.player_count) {
                var obj = {};
                game.state.next_action = 'moveRobber';
                obj['next_action'] = 'moveRobber';
                gapi.hangout.data.submitDelta(obj);
                game.proceed();
            }
        }
        var offer = false;
        for(var i = 0; i < this.player_count; i++) {
            if(Object.keys(game.state['p'+i].offer).length !== 0) {
                offer = true;
            }
        }
        if(game.selectbox.wrapper_outer.getAttribute('display') !== 'none') {
            game.menu.displayOffers();
            var j;
            for(var i = 0; i < game.state.player_count; i++) {
                j = game.state['p'+i].proposal;
                for(var m = i+1; m < game.state.player_count; m++) {
                    z = game.state['p'+m].proposal;
                    if(j.from === z.to && j.to === z.from) {
                        var bool = (z.offer !== undefined && z.ask !== undefined && j.offer !== undefined && j.ask !== undefined);
                        for(var k in z.offer) {
                            if(z.offer[k] !== j.ask[k]) bool = false;
                        }
                        for(var k in z.ask) {
                            if(z.ask[k] !== j.offer[k]) bool = false;
                        }
                        if(bool === true) {
                            game.actions.completeTrade(j.from, j.to, j.offer, j.ask);
                            console.log('Trade confirmed: Player '+j.from+' trades '+JSON.stringify(j.offer)+' to player '+ j.to+' for '+JSON.stringify(j.ask));
                        }
                    }
                }
            }
        }
        if(prevPhase === 1 && game.state.phase === 2 && game.state.turn !== num) {
            // Enable trade button on first turn for other players
            game.display.enableMenuButtons(['offerTrade']);
        }
        game.display.refreshResourceCounts();
        if(game.state.phase === 2) {
            game.display.refreshDice();
        }
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

game.state.setDiceValues = function(d1, d2) {
    game.state.d1 = d1;
    game.state.d2 = d2;
};
