game.actions = {
    game: game
};


game.actions.rollDice = function() {
    game.display.refreshDevCards();

    var obj = {};

    obj['id'] = gapi.hangout.getLocalParticipant().person.id;
    obj['next_action'] = 'playerControl';
    game.state.next_action = 'playerControl';

    var d1 = Math.floor(Math.random() * 6) + 1;
    var d2 = Math.floor(Math.random() * 6) + 1;
    var d = d1 + d2;

    //console.log('['+d1+']['+d2+'] = ' + d + ' rolled');
    game.state.setDiceValues(d1, d2);
    window.diceRolled = true;

    if(d == 7) {
        game.state.next_action = 'getRobbed';
        obj['next_action'] = 'getRobbed';
    } else {
        var h, v, o;
        for(var i = 0; i < 19; i++) {
            o = {};
            h = game.board.hexes[i]
            if(h.num == d) {
                for(var j = 0; j < game.board.hexes[i].vertices.length; j++) {
                    if(game.board.hexes[i].robber == 0) {
                        v = game.board.vertices[game.board.hexes[i].vertices[j]];
                        obj = {};
                        switch(v.contents) {
                            case 1:
                                o[h.type] = 1;
                                game.state.collect(v.owner, o);
                            break;
                            case 2:
                                o[h.type] = 2;
                                game.state.collect(v.owner, o);
                            break;
                            case 0: default:

                            break;
                        }
                    }
                }
            }
        }
    }
    obj['d1'] = ''+d1;
    obj['d2'] = ''+d2;
    if(game.state.next_action !== 'getRobbed') {
        for(var i = 0; i < game.state.player_count; i++) {
            obj['p'+i] = JSON.stringify(game.state['p'+i]);
        }
    }
    gapi.hangout.data.submitDelta(obj);
    game.proceed();
};

game.actions.getRobbed = function() {
    console.log('Each player with >7 cards has to select cards now...');
    var cards = 0; 
    for(var i = 1; i <= 5; i++) {
        cards += game.state['p'+(game.state.turn-1)]['r'+i]   
    }

    if(cards > 7) {
        game.display.disableMenuButtons(['endTurn']);
        game.display.disableAllExchangeButtons();
        game.actions.selectCards('R', {card_count: cards});
    }
    game.state['p'+(game.state.getLocalPlayerNumber()-1)].robbed = true;
    var obj = {};
    obj['p'+(game.state.getLocalPlayerNumber()-1)] = JSON.stringify(game.state['p'+(game.state.getLocalPlayerNumber()-1)]);
    gapi.hangout.data.submitDelta(obj);
};


game.actions.moveRobber = function() {
    // Don't let the user do anything until the robber is moved
    game.display.disableAllMenuButtons();
    game.display.disableAllExchangeButtons();

    // Move the robber
    for (var i = 0; i < 19; i++) {
        game.board.hexes[i].robber = 0;
        game.board.hexes[i].circle.setAttribute('class', 'menu-item');
        game.board.hexes[i].circle.setAttribute('fill', 'rgba(0,0,0,0)');
        game.board.hexes[i].circle.setAttribute('onmouseover', 'game.board.highlightRobber(' + i + ')');
        game.board.hexes[i].circle.setAttribute('onmouseout', 'game.board.unhighlightRobber(' + i + ')');
    }

    var obj = {'hexes' : JSON.stringify(
        (function(hexes){
            var arr = [];
            for(var i = 0; i < hexes.length; i++) {
                arr.push({num: hexes[i].num, type: hexes[i].type, robber: hexes[i].robber});
            }
            return arr;
        })(game.board.hexes))
    };
    gapi.hangout.data.submitDelta(obj);
};

game.actions.selectRobber = function(i) {
    for (var j = 0; j < 19; j++) {
        game.board.hexes[j].circle.setAttribute('class', '');
        game.board.hexes[j].circle.setAttribute('onmouseover', '');
        game.board.hexes[j].circle.setAttribute('onmouseout', '');
        game.board.hexes[j].circle.setAttribute('onclick', '');
    }
    game.board.hexes[i].robber = 1;
    var obj = {'hexes' : JSON.stringify(
        (function(hexes){
            var arr = [];
            for(var i = 0; i < hexes.length; i++) {
                arr.push({num: hexes[i].num, type: hexes[i].type, robber: hexes[i].robber});
            }
            return arr;
        })(game.board.hexes))
    };
    game.state.next_action = 'stealFrom';
    obj['next_action'] = 'stealFrom';
    gapi.hangout.data.submitDelta(obj);
    game.proceed();
};

game.actions.stealFrom = function() {
    var robberhex = null;
    for(var j = 0; j < 19; j++) {
        if(game.board.hexes[j].robber === 1) robberhex = j;
    }
    var vertices = 0;
    for(var j = 0; j < 6; j++) {
        var vertex = game.board.vertices[game.board.hexes[robberhex].vertices[j]];
        if(vertex.contents === 1 || vertex.contents === 2) {
            vertices++;
        }
    }
    if(vertices > 0) {
        game.board.showAvailableVertices(3, game.state.getLocalPlayerNumber());
    } else {
        game.state.next_action = 'playerControl';
        game.proceed();
    }
};

game.actions.buyDevCard = function() {

    if(game.state.playerHas(game.state.turn, {2: 1, 3: 1, 5: 1})) {
        var empty = true;
        var k;
        var i = 0;
        var obj = {};
        for(var key in game.state.devcards) {
            empty = false;
            if(Math.random() < 1/++i) {
                k = key;
            }
        }
        // (k) is now a random key in the state.devcards object

        if(empty === true) {
            console.log('There are no more dev cards in the stack');
        } else {
            game.state.deduct(game.state.turn, {2: 1, 3: 1, 5: 1});
            var card = game.state.devcards[k];
            delete game.state.devcards[k];

            game.state['p'+(game.state.turn-1)]['c'+card]++;
            if(game.state['p'+(game.state.turn-1)].newcards[card] === undefined) {
                game.state['p'+(game.state.turn-1)].newcards[card] = 0;
            }
            game.state['p'+(game.state.turn-1)].newcards[card]++;
            console.log('Player ' + game.state.turn + ' buys a ' + card + ' card');
            game.display.refreshDevCards();
        }
    } else {
        console.log('Player ' + game.state.turn + ' cannot afford a dev card');
    }

    game.state.updateVictoryPoints({devcards: JSON.stringify(game.state.devcards)});
    game.state.next_action = 'playerControl';
    game.proceed();
};

game.actions.playDevCard = function(type) {
    console.log(type + ' card played');
    //Knight, Year of Plenty, Road Building, Monopoly

    switch(type) {
    case 'K':
        game.state['p'+(game.state.turn-1)].army++;
        game.state['p'+(game.state.turn-1)].cK--;
        game.state.updateVictoryPoints();
        game.display.refreshDevCards();

        game.actions.moveRobber();
    break;
    case 'Y': 
        game.state['p'+(game.state.turn-1)].cY--;
        game.actions.selectCards('Y');
    break;
    case 'R':
        // Build 2 roads free of charge
        if (game.state['p'+(game.state.turn-1)].roads > 1) {
            game.actions.buildRoad('R');
            game.state['p'+(game.state.turn-1)].cR--;
            game.display.refreshDevCards();
        }
    break;
    case 'M':
        game.state['p'+(game.state.turn-1)].cM--;
        game.actions.selectCards('M');
    break;
    default: break;
    }
};


game.actions.selectCards = function(reason, params) {
    game.display.hideMenuButtons(['offerTrade','buildRoad','buildSettlement','buildCity','buyDevCard']);
    game.display.showMenuButtons(['confirmSelect', 'cancelSelect']);
    
    game.devcardbox.setAttribute('display', 'none');
    game.selectbox.wrapper_outer.setAttribute('display', 'inline');
    
    for(var i = 1; i <= 5; i++) {
        game.selectbox.fields['r'+i].num.setAttribute('visibility', 'visible');
        game.selectbox.fields['r'+i].dec_button.setAttribute('display', 'inline');
    }

    switch(reason) {
        case 'Y':
        // Year of plenty
        // Choose any two resources and add them to your resources

        this.incdec = function(i, amt) {
            var c = amt+parseInt(game.selectbox.fields['r'+i].num.textContent);
            if(c == 2) {
                game.selectbox.fields['r'+i].num.textContent = c;
                game.selectbox.fields['r'+i].inc_button.children[0].setAttribute('fill', 'gray');
                game.selectbox.fields['r'+i].inc_button.setAttribute('onclick', '');
                game.selectbox.fields['r'+i].dec_button.setAttribute('onclick', 'game.actions.incdec('+i+',-1)');
                game.selectbox.fields['r'+i].dec_button.children[0].setAttribute('fill', 'white');
            } else if(c == 1) {
                game.selectbox.fields['r'+i].num.textContent = c;
                game.selectbox.fields['r'+i].dec_button.children[0].setAttribute('fill', 'white');
                game.selectbox.fields['r'+i].dec_button.setAttribute('onclick', 'game.actions.incdec('+i+',-1)');
                game.selectbox.fields['r'+i].inc_button.children[0].setAttribute('fill', 'white');
                game.selectbox.fields['r'+i].inc_button.setAttribute('onclick', 'game.actions.incdec('+i+',1)');
      
            } else if(c == 0) {
                game.selectbox.fields['r'+i].num.textContent = c;
                game.selectbox.fields['r'+i].dec_button.children[0].setAttribute('fill', 'gray');
                game.selectbox.fields['r'+i].dec_button.setAttribute('onclick', '');
            }

            var sum = 0; for(var j = 1; j <= 5; j++) { sum += parseInt(game.selectbox.fields['r'+j].num.textContent); }
            if(sum < 2) {
                for(var j = 1; j <= 5; j++) {
                    game.selectbox.fields['r'+j].inc_button.children[0].setAttribute('fill', 'white');
                    game.selectbox.fields['r'+j].inc_button.setAttribute('onclick', 'game.actions.incdec('+j+',1)');
                }
                game.menu.buttons.forEach(function(a){
                    if(a.getAttribute('data-action')=='confirmSelect'){
                        a.children[0].setAttribute('fill', 'gray');
                        a.setAttribute('onclick', '');
                        a.setAttribute('class', '');
                    }
                });
            } else {
                for(var j = 1; j <= 5; j++) {
                    game.selectbox.fields['r'+j].inc_button.children[0].setAttribute('fill', 'gray');
                    game.selectbox.fields['r'+j].inc_button.setAttribute('onclick', '');
                }
                game.menu.buttons.forEach(function(a){
                    if(a.getAttribute('data-action')=='confirmSelect'){
                        a.children[0].setAttribute('fill', 'white');
                        a.setAttribute('onclick', 'game.actions.confirmSelect("'+reason+'",'+JSON.stringify(params)+')');
                        a.setAttribute('class', 'menu-item');
                    }
                });
            }
        };

        for(var i = 1; i <= 5; i++) {
            game.selectbox.fields['r'+i].dec_button.children[0].setAttribute('fill', 'gray');
            game.selectbox.fields['r'+i].inc_button.children[0].setAttribute('fill', 'white');
            game.selectbox.fields['r'+i].inc_button.setAttribute('onclick', 'game.actions.incdec('+i+',1)');
            game.selectbox.fields['r'+i].num.textContent = '0';
            game.selectbox.fields['r'+i].num.setAttribute('fill', 'black');
        }

        game.menu.buttons.forEach(function(a){
            if(a.getAttribute('data-action')=='cancelSelect'){
                a.children[0].setAttribute('fill', 'white');
                a.setAttribute('onclick', 'game.actions.cancelSelect()');
                a.setAttribute('class', 'menu-item');
            }
            if(a.getAttribute('data-action')=='confirmSelect'){
                a.children[1].textContent = 'Confirm';
            }
        });

        break;
       
        case 'R':
        // Robbed
        var playerNum = game.state.getLocalPlayerNumber();
        var cards_robbed = Math.floor(params.card_count / 2);
        console.log('Player '+playerNum+' has '+params.card_count+' cards and must discard '+cards_robbed);
        this.incdec = function(i, amt) {
            var c = amt+parseInt(game.selectbox.fields['r'+i].num.textContent);
            game.selectbox.fields['r'+i].num.textContent = c;

            var sum = 0;
            var obj = {};
            for(var j = 1; j <= 5; j++) { 
                obj[j] = parseInt(game.selectbox.fields['r'+j].num.textContent); 
                sum += obj[j];
            }

            var limit = game.state['p'+(playerNum-1)]['r'+i];

            if(c >= limit) {
                game.selectbox.fields['r'+i].dec_button.setAttribute('onclick', 'game.actions.incdec('+i+',-1)');
                game.selectbox.fields['r'+i].dec_button.children[0].setAttribute('fill', 'white');
            } else if(c < limit && c > 0) {
                game.selectbox.fields['r'+i].dec_button.children[0].setAttribute('fill', 'white');
                game.selectbox.fields['r'+i].dec_button.setAttribute('onclick', 'game.actions.incdec('+i+',-1)');
      
            } else if(c == 0) {
                game.selectbox.fields['r'+i].dec_button.children[0].setAttribute('fill', 'gray');
                game.selectbox.fields['r'+i].dec_button.setAttribute('onclick', '');
            }

            if(sum == cards_robbed && game.state.playerHas(playerNum, obj) === true) {
                for(var j = 1; j <= 5; j++) {
                    game.selectbox.fields['r'+j].inc_button.children[0].setAttribute('fill', 'gray');
                    game.selectbox.fields['r'+j].inc_button.setAttribute('onclick', '');
                }
                game.menu.buttons.forEach(function(a){
                    if(a.getAttribute('data-action')=='confirmSelect'){
                        a.children[0].setAttribute('fill', 'white');
                        a.setAttribute('onclick', 'game.actions.confirmSelect("'+reason+'",'+JSON.stringify(params)+')');
                        a.setAttribute('class', 'menu-item');
                    }
                });
            } else if(sum < cards_robbed) {
                for(var j = 1; j <= 5; j++) {
                    if(obj[j] < game.state['p'+(playerNum-1)]['r'+j]) {
                        game.selectbox.fields['r'+j].inc_button.children[0].setAttribute('fill', 'white');
                        game.selectbox.fields['r'+j].inc_button.setAttribute('onclick', 'game.actions.incdec('+j+',1)');
                    } else {
                        game.selectbox.fields['r'+j].inc_button.children[0].setAttribute('fill', 'gray');
                        game.selectbox.fields['r'+j].inc_button.setAttribute('onclick', '');
                    }

                }
                game.menu.buttons.forEach(function(a){
                    if(a.getAttribute('data-action')=='confirmSelect'){
                        a.children[0].setAttribute('fill', 'gray');
                        a.setAttribute('onclick', '');
                        a.setAttribute('class', '');
                    }
                });
            }
        };

        for(var i = 1; i <= 5; i++) {
            game.selectbox.fields['r'+i].dec_button.children[0].setAttribute('fill', 'gray');
            if(game.state['p'+(playerNum-1)]['r'+i] > 0) {
                game.selectbox.fields['r'+i].inc_button.children[0].setAttribute('fill', 'white');
                game.selectbox.fields['r'+i].inc_button.setAttribute('onclick', 'game.actions.incdec('+i+',1)');
            } else {
                game.selectbox.fields['r'+i].inc_button.children[0].setAttribute('fill', 'gray');
                game.selectbox.fields['r'+i].inc_button.setAttribute('onclick', '');

            }
            game.selectbox.fields['r'+i].num.textContent = '0';
            game.selectbox.fields['r'+i].num.setAttribute('fill', 'black');
        }

        game.menu.buttons.forEach(function(a){
            if(a.getAttribute('data-action')=='cancelSelect'){
                a.children[0].setAttribute('fill', 'gray');
                a.setAttribute('onclick', '');
                a.setAttribute('class', '');
            }
            if(a.getAttribute('data-action')=='confirmSelect'){
                a.children[1].textContent = 'Confirm';
            }
        });
        break;

        case 'M':
        // Monopoly
        // Choose one resource and get it from everyone
        case '1':
        // Choose 1
        // Choose what ONE resource you're asking for in a 4:1 trade or Monopoly card

        this.inc = function(i) {
            this.incdec = null;
            var c = 1+parseInt(game.selectbox.fields['r'+i].num.textContent);
            if(c <= 1) {
                if(reason == 'M') {
                    game.selectbox.fields['r'+i].num.textContent = 'M';
                    game.selectbox.fields['r'+i].num.setAttribute('visibility', 'visible');
                } else {
                    game.selectbox.fields['r'+i].num.textContent = c;
                }
                game.selectbox.fields['r'+i].inc_button.children[0].setAttribute('fill', 'gray');
                game.selectbox.fields['r'+i].inc_button.setAttribute('onclick', '');
          
                for(var j = 1; j <= 5; j++) {
                    if(i != j) {
                        game.selectbox.fields['r'+j].num.textContent = '0';
                        if(reason == 'M') game.selectbox.fields['r'+j].num.setAttribute('visibility', 'hidden');

                        game.selectbox.fields['r'+j].dec_button.setAttribute('onclick', '');
                        game.selectbox.fields['r'+j].dec_button.children[0].setAttribute('fill', 'gray');
                        game.selectbox.fields['r'+j].inc_button.children[0].setAttribute('fill', 'white');
                        game.selectbox.fields['r'+j].inc_button.setAttribute('onclick', 'game.actions.inc('+j+')');
                        game.selectbox.fields['r'+j].num.setAttribute('fill', 'black');
                    }
                    if(reason == '1') {
                    for(var k in params.offer) {
                        game.selectbox.fields['r'+k].inc_button.children[0].setAttribute('fill', 'gray');
                        game.selectbox.fields['r'+k].inc_button.setAttribute('onclick', '');
                        game.selectbox.fields['r'+k].dec_button.setAttribute('onclick', '');
                        game.selectbox.fields['r'+k].num.setAttribute('fill', 'gray');
                    }
                }
                }
            }

            game.menu.buttons.forEach(function(a){
                if(a.getAttribute('data-action')=='confirmSelect'){
                    a.children[0].setAttribute('fill', 'white');

                    a.setAttribute('onclick', 'game.actions.confirmSelect("'+reason+'",'+JSON.stringify(params)+')');
                    a.setAttribute('class', 'menu-item');
                }
                if(a.getAttribute('data-action')=='cancelSelect'){
                    a.children[0].setAttribute('fill', 'white');
                    a.setAttribute('onclick', 'game.actions.cancelSelect()');
                    a.setAttribute('class', 'menu-item');
                }
            });
        };

        for(var i = 1; i <= 5; i++) {
            game.selectbox.fields['r'+i].dec_button.setAttribute('display', 'none');;
            game.selectbox.fields['r'+i].inc_button.children[0].setAttribute('fill', 'white');
            game.selectbox.fields['r'+i].inc_button.setAttribute('onclick', 'game.actions.inc('+i+')');

            game.selectbox.fields['r'+i].num.textContent = '0';
            if(reason == 'M') game.selectbox.fields['r'+i].num.setAttribute('visibility', 'hidden');
            game.selectbox.fields['r'+i].num.setAttribute('fill', 'black');
        }

        if(reason == '1') {
            for(var i in params.offer) {
                game.selectbox.fields['r'+i].inc_button.children[0].setAttribute('fill', 'gray');
                game.selectbox.fields['r'+i].inc_button.setAttribute('onclick', '');
                game.selectbox.fields['r'+i].num.setAttribute('fill', 'gray');
            }
        }

        game.menu.buttons.forEach(function(a){
            if(a.getAttribute('data-action')=='cancelSelect'){
                a.children[0].setAttribute('fill', 'white');
                a.setAttribute('onclick', 'game.actions.cancelSelect()');
                a.setAttribute('class', 'menu-item');
            }
            if(a.getAttribute('data-action')=='confirmSelect'){
                a.children[1].textContent = 'Confirm';
            }
        });

        break;


        case 'O':
        // Choose what resources you're offering in trade
        // (Limited to what you have)
      
        game.actions.incdec = function(i, amt) {
            var c = amt+parseInt(game.selectbox.fields['r'+i].num.textContent);
            game.selectbox.fields['r'+i].num.textContent = c;

            var sum = 0;
            var obj = {};
            for(var j = 1; j <= 5; j++) { 
                obj[j] = parseInt(game.selectbox.fields['r'+j].num.textContent); 
                sum += obj[j];
            }

            var limit = game.state['p'+(game.state.getLocalPlayerNumber()-1)]['r'+i];

            if(c >= limit) {
                game.selectbox.fields['r'+i].dec_button.setAttribute('onclick', 'game.actions.incdec('+i+',-1)');
                game.selectbox.fields['r'+i].dec_button.children[0].setAttribute('fill', 'white');
                game.selectbox.fields['r'+i].inc_button.setAttribute('onclick', '');
                game.selectbox.fields['r'+i].inc_button.children[0].setAttribute('fill', 'gray');
            } else if(c < limit && c > 0) {
                game.selectbox.fields['r'+i].dec_button.children[0].setAttribute('fill', 'white');
                game.selectbox.fields['r'+i].dec_button.setAttribute('onclick', 'game.actions.incdec('+i+',-1)');
                game.selectbox.fields['r'+i].inc_button.children[0].setAttribute('fill', 'white');
                game.selectbox.fields['r'+i].inc_button.setAttribute('onclick', 'game.actions.incdec('+i+',1)');

            } else if(c == 0) {
                game.selectbox.fields['r'+i].dec_button.children[0].setAttribute('fill', 'gray');
                game.selectbox.fields['r'+i].dec_button.setAttribute('onclick', '');
                game.selectbox.fields['r'+i].inc_button.children[0].setAttribute('fill', 'white');
                game.selectbox.fields['r'+i].inc_button.setAttribute('onclick', 'game.actions.incdec('+i+',1)');
            } 

           game.menu.buttons.forEach(function(a){
                if(a.getAttribute('data-action')=='confirmSelect') {
                    if(sum > 0) {
                        a.children[0].setAttribute('fill', 'white');
                        a.setAttribute('onclick', 'game.actions.confirmSelect("'+reason+'", {})');
                        a.setAttribute('class', 'menu-item');
                    } else {
                        a.children[0].setAttribute('fill', 'gray');
                        a.setAttribute('onclick', '');
                        a.setAttribute('class', '');

                    }
                }
                if(a.getAttribute('data-action')=='cancelSelect'){
                    a.children[0].setAttribute('fill', 'white');
                    a.setAttribute('onclick', 'game.actions.cancelSelect(true)');
                    a.setAttribute('class', 'menu-item');
                }
            });

        };

        
        for(var i = 1; i <= 5; i++) {
            game.selectbox.fields['r'+i].dec_button.children[0].setAttribute('fill', 'gray');
            game.selectbox.fields['r'+i].dec_button.children[0].setAttribute('onclick', '');

            if(parseInt(game.state['p'+(game.state.getLocalPlayerNumber()-1)]['r'+i]) > 0) {
                game.selectbox.fields['r'+i].inc_button.children[0].setAttribute('fill', 'white');
                game.selectbox.fields['r'+i].inc_button.setAttribute('onclick', 'game.actions.incdec('+i+',1)');
            } else {
                game.selectbox.fields['r'+i].inc_button.children[0].setAttribute('fill', 'gray');
                game.selectbox.fields['r'+i].inc_button.setAttribute('onclick', '');

            }
            game.selectbox.fields['r'+i].num.textContent = '0';
            game.selectbox.fields['r'+i].num.setAttribute('fill', 'black');
        }

        game.menu.buttons.forEach(function(a){
            if(a.getAttribute('data-action')=='cancelSelect'){
                a.children[0].setAttribute('fill', 'white');
                a.setAttribute('onclick', 'game.actions.cancelSelect(true)');
                a.setAttribute('class', 'menu-item');
            }
            if(a.getAttribute('data-action')=='confirmSelect'){
                a.children[1].textContent = 'Send Offer';
            }
        });
        break;
        default: break;
    }
};

game.actions.confirmSelect = function(reason, params) {

    switch(reason) {

    case 'Y':
        var ask = {}, a;
        for(var j = 1; j <= 5; j++) {
            a = parseInt(game.selectbox.fields['r'+j].num.textContent);
            if(a > 0) ask[j] = a;
        }
        game.state['p'+(game.state.turn-1)].cY--;
        game.actions.completeTrade(game.state.getLocalPlayerNumber(), 0, {}, ask);

        game.actions.cancelSelect();
    break;
    case 'M':
        var obj = {}, a;
        for(var j = 1; j <= 5; j++) {
            if(game.selectbox.fields['r'+j].num.textContent == 'M') {
                obj = {};
                obj[j] = 1;
            }
        }

        var ask;
        for(var p = 1; p <= game.state.player_count; p++) {
            if(p != game.state.turn) {
                ask = {};
                for(var i in obj) {
                    ask[i] = obj[i] * game.state['p'+(p-1)]['r'+i];
                    if(ask[i] > 0) {
                        game.actions.completeTrade(game.state.turn, p, {}, ask); 
                    }
                }
            }
        }

        game.state['p'+(game.state.turn-1)].cM--;

        game.actions.cancelSelect();
    break;
    case 'R':
        var robbed = {}, a;
        for(var j = 1; j <= 5; j++) {
            a = parseInt(game.selectbox.fields['r'+j].num.textContent);
            if(a > 0) robbed[j] = a;
        }
        game.state.deduct(game.state.getLocalPlayerNumber(), robbed);
        var obj = {};
        obj['p'+(game.state.getLocalPlayerNumber()-1)] = JSON.stringify(game.state['p'+(game.state.getLocalPlayerNumber()-1)]);
        obj['id'] = gapi.hangout.getLocalParticipant().person.id;
        game.actions.cancelSelect();
    break;
    case '1':
        var ask = {}, a;
        for(var j = 1; j <= 5; j++) {
            a = parseInt(game.selectbox.fields['r'+j].num.textContent);
            if(a > 0) ask[j] = a;
        }
        
        game.actions.cancelSelect();
        game.actions.completeTrade(params.from, 0, params.offer, ask);
    break;
    case 'O':
        var offer = {}, a;
        for(var j = 1; j <= 5; j++) {
            a = parseInt(game.selectbox.fields['r'+j].num.textContent);
            if(a > 0) offer[j] = a;
        }
        game.actions.announceOffer(game.state.getLocalPlayerNumber(), offer);
        game.menu.displayOffers();
    break;
    default: break;
    }
};


game.actions.acceptOffer = function(from, offer) {
    game.state['p'+(game.state.getLocalPlayerNumber()-1)].ask = offer;

    var sum;
    sum = 0;
    for(var j in game.state['p'+(game.state.getLocalPlayerNumber()-1)].offer) { 
        sum += game.state['p'+(game.state.getLocalPlayerNumber()-1)].offer[j]; 
    }
    if(sum == 0) {
        console.log('You must offer something');
    } else {
        game.actions.proposeTrade(from, game.state.getLocalPlayerNumber(), offer, game.state['p'+(game.state.getLocalPlayerNumber()-1)].offer);
    }

}

game.actions.cancelSelect = function(reset_offer) {
    var num = game.state.getLocalPlayerNumber();
    if(reset_offer === true) {
        // Reset your offer to null
        game.state['p'+(num-1)].offer = {};
        game.state['p'+(num-1)].proposal = {};
        console.log('Player '+num+' has canceled trading');
    }
    var obj = {};
    obj['p'+(num-1)] = JSON.stringify(game.state['p'+(num-1)]);
    gapi.hangout.data.submitDelta(obj);


    game.display.showMenuButtons(['offerTrade','buildRoad','buildSettlement','buildCity','buyDevCard']);
    game.display.disableMenuButtons(['confirmSelect', 'cancelSelect']);
    game.display.hideMenuButtons(['confirmSelect', 'cancelSelect']);
   
    game.devcardbox.setAttribute('display', 'inline');
    
    for(var i = 1; i <= 5; i++) {
        game.selectbox.fields['r'+i].num.setAttribute('visibility', 'visible');
        game.selectbox.fields['r'+i].dec_button.setAttribute('display', 'inline');
    }
    game.selectbox.wrapper_outer.setAttribute('display', 'none');
    game.tradebox.setAttribute('display', 'none');
    game.display.refreshDevCards();
};

game.actions.announceOffer = function(player, offer) {
    var str = '';
    for(var i in offer) { str += offer[i] + ' ' + [null, 'wood', 'sheep', 'wheat', 'brick', 'ore'][i] + ' '};
    console.log('Player ' + player + ' is offering ' + str);
    game.state['p'+(player-1)].offer = offer;
    var obj = {};
    obj['p'+(player-1)] = JSON.stringify(game.state['p'+(player-1)]);
    gapi.hangout.data.submitDelta(obj);
    game.menu.displayOffers();
};

game.actions.proposeTrade = function(p_from, p_to, offer, ask) {
    // Bank accepts or denies trade immediately based on 4:1, 3:1, 2:1 rules
    console.log('Player '+p_from+' proposes to trade '+JSON.stringify(offer)+' to player '+ p_to+' for '+JSON.stringify(ask));

    game.state['p'+(p_from-1)].proposal = {from: p_from, to: p_to, offer: offer, ask: ask};
    var obj = {};
    obj['p'+(p_from-1)] = JSON.stringify(game.state['p'+(p_from-1)]);
    gapi.hangout.data.submitDelta(obj);
    // Compare with all other proposals in game.state, if match call completeTrade
};

game.actions.setupTrade = function(p_from, p_to, offer) {
    
    if(p_to == 0 && game.state.playerHas(p_from, offer) === true) {
        // Assuming valid 4:1, 3:1 or 2:1 bank trade
        game.actions.selectCards('1', {
            offer: offer,
            from: p_from,
            to: p_to,
        });
    } else console.log('bad setupTrade call');

};

game.actions.offerTrade = function() {
    game.menu.displayOffers();
    game.actions.selectCards('O');
};


game.actions.completeTrade = function(p_A, p_B, r_A, r_B) {
    // "Player 0" is the bank

    if(p_A == 0) {
        //TODO: check that p_B is following 4:1, 3:1, 2:1 rules as appropriate
        game.state.deduct(p_B, r_B);
        game.state.collect(p_B, r_A);

    } else if(p_B == 0) {
        //TODO: check that p_A is following 4:1, 3:1, 2:1 rules as appropriate

        game.state.deduct(p_A, r_A);
        game.state.collect(p_A, r_B);

    } else {
        //TODO: check that both parties actually have the cards to be traded

        if(Object.keys(r_A).length > 0) {
            game.state.deduct(p_A, r_A);
            game.state.collect(p_B, r_A);
        }
        if(Object.keys(r_B).length > 0) {
            game.state.deduct(p_B, r_B);
            game.state.collect(p_A, r_B);
        }

        //Reset trading GUI
        game.state['p'+(p_A-1)].offer = {};
        game.state['p'+(p_A-1)].proposal = {};
        game.state['p'+(p_B-1)].offer = {};
        game.state['p'+(p_B-1)].proposal = {};
        game.menu.displayOffers();
        game.actions.cancelSelect();
    }
    obj = {};
    for(var i = 0; i < game.state.player_count; i++) {
        obj['p'+i] = JSON.stringify(game.state['p'+i]);
    }
    gapi.hangout.data.submitDelta(obj);
    game.actions.playerControl();
};

// 1 = WOOD, 2 = SHEEP, 3 = WHEAT, 4 = BRICK, 5 = ORE

game.actions.buildSettlement = function() {
    var playerNum = game.state.getLocalPlayerNumber();
    if(game.state.phase == 0 || game.state.phase == 1) {
        game.board.showAvailableVertices(1, playerNum);
    } else if(game.state.phase == 2) {
        if(game.state.playerHas(playerNum, {1: 1, 2: 1, 3: 1, 4: 1}))  {
            game.board.showAvailableVertices(1, playerNum);
        } else {
            console.log('Cannot build. You have insufficient resources');
        }
    }
};

game.actions.buildCity = function() {
    var playerNum = game.state.getLocalPlayerNumber();
    if(game.state.phase == 2 && (game.state.playerHas(playerNum, {3: 2, 5: 3}))) {
        game.board.showAvailableVertices(2, playerNum);
    } else {
        console.log('Cannot build. You have insufficient resources');
    }

};

game.actions.buildRoad = function(params) {
    var playerNum = game.state.getLocalPlayerNumber();
    if (params == 'R') {
        game.board.showAvailableEdges(playerNum, 'R');
    } else if(game.state.phase == 0 || game.state.phase == 1) {
        game.board.showAvailableEdges(playerNum);
    } else if(game.state.phase == 2) {
        if(game.state.playerHas(playerNum, {1: 1, 4: 1}))  {
            game.state.next_action = 'playerControl';
            game.board.showAvailableEdges(playerNum);
        } else {
            console.log('Cannot build. You have insufficient resources');
        }
    }
};

game.actions.selectVertex = function(i, type) {
    var playerNum = game.state.getLocalPlayerNumber();

    if(type === 1 || type === 2) {
        if(game.state.phase == 0) {
            game.state['p'+(playerNum-1)].firstSettlement = i;
            game.state['p'+(playerNum-1)].settlements--;
        } else if(game.state.phase == 1) {
            game.state['p'+(playerNum-1)].secondSettlement = i;
            game.state['p'+(playerNum-1)].settlements--;
            var obj = {}, b;
            for(var j = 0; j < game.board.vertices[i].hexes.length; j++) {
                b = game.board.hexes[game.board.vertices[i].hexes[j]].type;
                if(obj[b] == null) obj[b] = 0;
                obj[b]++;
            }
            game.state.collect(playerNum, obj);
        } else if(game.state.phase == 2) {
            if(type == 1) {
                game.state.deduct(playerNum, {1: 1, 2: 1, 3: 1, 4: 1});
                game.state['p'+(playerNum-1)].settlements--;
            } else if(type == 2 && game.board.vertices[i].owner === playerNum && game.board.vertices[i].contents === 1) {
                if(game.board.vertices[i].owner === playerNum) {
                    game.state.deduct(playerNum, {3: 2, 5: 3});
                    game.state['p'+(game.state.turn-1)].cities--;
                    game.state['p'+(game.state.turn-1)].settlements++;
                }
            }
        }

        if (type === 1) {
            game.board.placeSettlement(i);
        } else if (type === 2) {
            game.board.placeCity(i);
        }
        game.display.hideEmptyVertices();

        var vertices = (function(vertices){ 
            var obj = [];
            for (var i = 0; i < vertices.length; i++) {
                obj.push({contents : vertices[i].contents, owner : vertices[i].owner, port : vertices[i].port});
            }
            return obj;
        })(game.board.vertices);
        var obj = {};
        game.state.next_action = 'playerControl';
        obj['next_action'] = 'playerControl';
        if (game.state.phase == 0 || game.state.phase == 1) {
            game.state.next_action = 'buildRoad';
            obj['next_action'] = 'buildRoad';
        }
        obj['vertices'] = JSON.stringify(vertices);
        game.state.updateVictoryPoints(obj);

        game.proceed();
    } else {
        var vertex = game.board.vertices[i];
        var v = vertex.v;
        if(vertex.contents === 1) {
            v.setAttribute('width', '10');
            v.setAttribute('height', '10');
            v.setAttribute('x', vertex.x - 5);
            v.setAttribute('y', vertex.y - 5);
        } else if (vertex.contents === 2) {
            v.setAttribute('width', '20');
            v.setAttribute('height', '20');
            v.setAttribute('x', vertex.x - 10);
            v.setAttribute('y', vertex.y - 10);
        }
        v.setAttribute('onclick', '');
        if(vertex.owner !== game.state.getLocalPlayerNumber()) {
            var resources = [];
            var a = 0;
            for(var j = 1; j <= 5; j++) {
                if(game.state['p'+(vertex.owner-1)] > 0) {
                    resources[a] = j;
                    a++;
                }
            }
            var rand = Math.floor(Math.random() * a);
            var steal = {};
            steal[''+resources[rand]] = 1;
            game.actions.completeTrade(game.state.getLocalPlayerNumber(), vertex.owner, {}, steal);
        }
        if(type === 3) {
            game.state.next_action = 'playerControl';
        } else {
            game.state.next_action = 'rollDice';
        }
        game.proceed();
    }
};

game.actions.selectEdge = function(i, player, params) {
    game.board.placeRoad(i);

    game.display.hideEmptyEdges();
    
    var obj = {};

    if(game.state.phase === 0) {
        if(game.state.turn === game.state.player_count) {
            game.state.phase = 1;
        } else {
            game.state.turn++;
        }
        game.state.next_action = 'buildSettlement';
        obj['next_action'] = 'buildSettlement';
        obj['phase'] = ''+game.state.phase;
        obj['turn'] = ''+game.state.turn;
    } else if(game.state.phase === 1) { 
        if(game.state.turn === 1) {
            game.state.phase = 2;
            game.state.next_action = 'rollDice';
            obj['next_action'] = 'rollDice';
            obj['phase'] = ''+game.state.phase;
        } else {
            game.state.turn--;
            game.state.next_action = 'buildSettlement';
            obj['next_action'] = 'buildSettlement';
            obj['turn'] = ''+game.state.turn;
        }

    } else if(game.state.phase === 2) {
        game.state['p'+(game.state.turn-1)].roads--;
        if(params === 'R') {
            // This means we just built a road for free
            // and now we are going to build a second one (Road Building Card)
            game.board.showAvailableEdges(player, 'R1');
        } else {
            game.state.next_action = 'playerControl';
            obj['next_action'] = 'playerControl';
            if(params !== 'R1') {
                // We are not on our second road for the Road Building Card,
                // we are paying for it
                game.state.deduct(player, {1: 1, 4: 1});
            }
        }
    } 
    var edges = (function(edges){ 
        var obj = [];
        for (var i = 0; i < edges.length; i++) {
            obj.push({road : edges[i].road, owner : edges[i].owner});
        }
        return obj;
    })(game.board.edges);
    obj['edges'] = JSON.stringify(edges);
    game.state.updateVictoryPoints(obj);
    if (game.state.phase === 2) {
        game.proceed();
    }
};


game.actions.playerControl = function() {
    game.display.refreshMenuButtons();
    game.display.refreshDevCards(); 
    game.display.refreshExchangeButtons(); 
};

game.actions.endTurn = function() {
    game.display.disableAllMenuButtons();
    game.display.enableMenuButtons(['offerTrade']);
   
    game.display.disableAllExchangeButtons();

    game.display.cancelPlacement();
    game.actions.cancelSelect();

    game.state.next_action = 'rollDice';
    game.state.turn = game.state.turn == game.state.player_count ? 1 : game.state.turn+1;

    game.display.refreshDevCards();
    window.diceRolled = false;
    game.state['p'+(game.state.turn-1)].newcards = {};
    var obj = {'next_action': 'rollDice'};
    for(var i = 0; i < game.state.player_count; i++) {
        game.state['p'+i].robbed = false;
        obj['p'+i] = JSON.stringify(game.state['p'+i]);
    }
    obj['turn'] = ''+game.state.turn;
    gapi.hangout.data.submitDelta(obj);
}

game.actions.winGame = function() {
    console.log('Player ' + game.state.turn + ' wins the game!');
};
