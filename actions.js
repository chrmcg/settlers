
game.actions = {
    game: game
};


game.actions.rollDice = function() {
    game.menu.refreshDevCards();

    var obj = {};

    obj['id'] = gapi.hangout.getLocalParticipant().person.id;
    obj['next_action'] = 'playerControl';
    game.state.next_action = 'playerControl';

    var d1 = Math.floor(Math.random() * 6) + 1;
    var d2 = Math.floor(Math.random() * 6) + 1;
    var d = d1 + d2;

    console.log('['+d1+']['+d2+'] = ' + d + ' rolled');

    if(d == 7) {
        obj['next_action'] = 'getRobbed';
        game.state.next_action = 'getRobbed';
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

    for(var i = 0; i < game.state.player_count; i++) {
        obj['p'+i] = JSON.stringify(this['p'+i]);
    }
    gapi.hangout.data.submitDelta(obj);
    game.proceed();
};

game.actions.getRobbed = function() {
    
    game.state.next_action = 'moveRobber';

    console.log('Each player with >7 cards has to select cards now...');
    var cards = 0; 
    for(var i = 1; i <= 5; i++) {
        cards += game.state['p'+(game.state.turn-1)]['r'+i]   
    }

    if(cards > 7) {
        game.menu.buttons.forEach(function(a){
            if(['endTurn'].indexOf(a.getAttribute('data-action')) > -1){
                a.setAttribute('visibility','hidden');
            }
        });
        for(var i = 1; i <= 5; i++) {
            game.statusbox.fields[(game.state.turn-1)]['r'+i].button.setAttribute('onclick','');
            game.statusbox.fields[(game.state.turn-1)]['r'+i].button.children[0].setAttribute('fill','gray');
            
        }
        game.actions.selectCards('R', {card_count: cards});
        
    } else {
        game.proceed();
    }
};


game.actions.moveRobber = function() {
    // Don't let the user do anything until the robber is moved
    for(var i = 0; i < game.menu.buttons.length; i++) {
        game.menu.buttons[i].children[0].setAttribute('fill', 'gray');
        game.menu.buttons[i].setAttribute('onclick', '');
        game.menu.buttons[i].setAttribute('class', '');
    }
    for(var i = 0; i < game.state.player_count; i++) {
        for(var j = 1; j <= 5; j++) {
            game.statusbox.fields[i]['r'+j].button.children[0].setAttribute('fill', 'gray');
            game.statusbox.fields[i]['r'+j].button.setAttribute('onclick', '');
        }
    }

    // Move the robber
    for (var i = 0; i < 19; i++) {
        game.board.hexes[i].circle.setAttribute('class', 'menu-item');
        game.board.hexes[i].circle.setAttribute('fill', 'rgba(0,0,0,0)');
        game.board.hexes[i].circle.setAttribute('onmouseover', 'game.board.highlightRobber(' + i + ')');
        game.board.hexes[i].circle.setAttribute('onmouseout', 'game.board.unhighlightRobber(' + i + ')');
    }
};

game.actions.selectRobber = function(i) {
    for (var j = 0; j < 19; j++) {
        game.board.hexes[j].robber = 0;
        game.board.hexes[j].circle.setAttribute('class', '');
        game.board.hexes[j].circle.setAttribute('onmouseover', '');
        game.board.hexes[j].circle.setAttribute('onmouseout', '');
        game.board.hexes[j].circle.setAttribute('onclick', '');
    }
    game.board.hexes[i].robber = 1;

    game.state.next_action = 'stealFrom';
    game.proceed();
};

game.actions.stealFrom = function() {

    var robberhex = null;
    for(var j = 0; j < 19; j++) {
        if(game.board.hexes[j].robber == 1) robberhex = j;
    }

    var owners = [];
    var o;
    for(var i = 0; i < 6; i++) {
        o = game.board.vertices[game.board.hexes[robberhex].vertices[i]].owner;
        if(o != null && o != game.state.turn && owners.indexOf(o) == -1) owners.push(o);
    }

    game.state.next_action = 'playerControl';

    console.log('Choose one of (' + owners.join(', ') + ') to steal a card from');
    // TODO: user chooses from (owners) and randomly gets one of their cards
    gapi.hangout.data.submitDelta({'id': gapi.hangout.getLocalParticipant().person.id, 'next_action': 'playerControl'});
    game.proceed();
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
            console.log('Player ' + game.state.turn + ' buys a ' + card + ' card');
            game.menu.refreshDevCards();
        }
    } else {
        console.log('Player ' + game.state.turn + ' cannot afford a dev card');
    }

    game.state.updateVictoryPoints();
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

        game.actions.moveRobber();
    break;
    case 'Y': 
        game.actions.selectCards('Y');
    break;
    case 'R':
        // Build 2 roads free of charge
        if (game.state['p'+(game.state.turn-1)].roads > 1) {
            game.state['p'+(game.state.turn-1)].cR--;
            game.actions.buildRoad('R');
        }
    break;
    case 'M':
        game.actions.selectCards('M');
    break;
    default: break;
    }
};


game.actions.selectCards = function(reason, params) {

    game.menu.buttons.forEach(function(a){
        if(['offerTrade','buildRoad','buildSettlement','buildCity','buyDevCard'].indexOf(a.getAttribute('data-action')) > -1){a.setAttribute('visibility','hidden');}
        if(['confirmSelect', 'cancelSelect'].indexOf(a.getAttribute('data-action')) > -1){a.setAttribute('visibility','visible');}
    });
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
        var cards_robbed = Math.floor(params.card_count / 2);
        console.log('Player '+game.state.turn+' has '+params.card_count+' cards and must discard '+cards_robbed);
        this.incdec = function(i, amt) {
            var c = amt+parseInt(game.selectbox.fields['r'+i].num.textContent);
            game.selectbox.fields['r'+i].num.textContent = c;

            var sum = 0;
            var obj = {};
            for(var j = 1; j <= 5; j++) { 
                obj[j] = parseInt(game.selectbox.fields['r'+j].num.textContent); 
                sum += obj[j];
            }

            var limit = game.state['p'+(game.state.turn-1)]['r'+i];

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

            if(sum == cards_robbed && game.state.playerHas(game.state.turn, obj) === true) {
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
                    if(obj[j] < game.state['p'+(game.state.turn-1)]['r'+j]) {
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
            if(game.state['p'+(game.state.turn-1)]['r'+i] > 0) {
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
            var c =  1+parseInt(game.selectbox.fields['r'+i].num.textContent);
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

            var limit = game.state['p'+(game.state.turn-1)]['r'+i];

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

            if(parseInt(game.state['p'+(game.state.turn-1)]['r'+i]) > 0) {
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
        game.state.collect(game.state.turn, ask);

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
        game.state.deduct(game.state.turn, robbed);
        game.actions.cancelSelect();
    break;
    case '1':
        var ask = {}, a;
        for(var j = 1; j <= 5; j++) {
            a = parseInt(game.selectbox.fields['r'+j].num.textContent);
            if(a > 0) ask[j] = a;
        }
        
        game.actions.cancelSelect();
        game.actions.proposeTrade(params.from, params.to, params.offer, ask);
    break;
    case 'O':
        var offer = {}, a;
        for(var j = 1; j <= 5; j++) {
            a = parseInt(game.selectbox.fields['r'+j].num.textContent);
            if(a > 0) offer[j] = a;
        }
        game.actions.announceOffer(game.state.turn, offer);
        game.menu.displayOffers();
    break;

    default: break;
    }
};


game.actions.acceptOffer = function(from, offer) {
    game.state['p'+(game.state.turn-1)].ask = offer;

    var sum;
    sum = 0;
    for(var j in game.state['p'+(game.state.turn-1)].offer) { 
        sum += game.state['p'+(game.state.turn-1)].offer[j]; 
    }
    if(sum == 0) {
        console.log('You must offer something');
    } else {
        game.actions.proposeTrade(game.state.turn, from, game.state['p'+(game.state.turn-1)].offer, offer);
    }

}

game.actions.cancelSelect = function(reset_offer) {

    if(reset_offer === true) {
        // Reset your offer to null
        game.state['p'+(game.state.turn-1)].offer = {};
        game.state['p'+(game.state.turn-1)].proposal = {};
        console.log('Player '+game.state.turn+' has canceled trading');
    }

    game.menu.buttons.forEach(function(a){
        if(['offerTrade','buildRoad','buildSettlement','buildCity','buyDevCard', 'endTurn'].indexOf(a.getAttribute('data-action')) > -1){
            a.setAttribute('visibility','visible');
        }
        if(['confirmSelect', 'cancelSelect'].indexOf(a.getAttribute('data-action')) > -1){
            a.setAttribute('visibility','hidden');
            a.children[0].setAttribute('fill','gray');
            a.setAttribute('onclick','');
        }
    });
    game.devcardbox.setAttribute('display', 'inline');
    for(var i = 1; i <= 5; i++) {
        game.selectbox.fields['r'+i].num.setAttribute('visibility', 'visible');
        game.selectbox.fields['r'+i].dec_button.setAttribute('display', 'inline');
    }
    game.selectbox.wrapper_outer.setAttribute('display', 'none');
    game.tradebox.setAttribute('display', 'none');
    game.menu.refreshDevCards();
    game.proceed();
};

game.actions.announceOffer = function(player, offer) {
    var str = '';
    for(var i in offer) { str += offer[i] + ' ' + [null, 'wood', 'sheep', 'wheat', 'brick', 'ore'][i] + ' '};
    console.log('Player ' + player + ' is offering ' + str);
    game.state['p'+(player-1)].offer = offer;
    game.menu.displayOffers();
};

game.actions.proposeTrade = function(p_from, p_to, offer, ask) {

    // Bank accepts or denies trade immediately based on 4:1, 3:1, 2:1 rules
    if(p_to == 0) {
        game.actions.completeTrade(p_from, p_to, offer, ask);

    } else {
        console.log('Player '+p_from+' proposes to trade '+JSON.stringify(offer)+' to player '+ p_to+' for '+JSON.stringify(ask));

        game.state['p'+(p_from-1)].proposal = {from: p_from, to: p_to, offer: offer, ask: ask};

        // Compare with all other proposals in game.state, if match call completeTrade
        var j;
        for(var i = 0; i < game.state.player_count; i++) {
            j = game.state['p'+i].proposal;
            if(j.from == p_to && j.to == p_from) {
                var bool = true;
                for(var k in offer) {
                    if(offer[k] != j.ask[k]) bool = false;
                }
                for(var k in ask) {
                    if(ask[k] != j.offer[k]) bool = false;
                }
                if(bool === true) {
                    game.actions.completeTrade(p_from, p_to, offer, ask);
                    console.log('Trade confirmed: Player '+p_from+' trades '+JSON.stringify(offer)+' to player '+ p_to+' for '+JSON.stringify(ask));
                }
            }
        }
    }
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
    var stop = false;

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
        //TODO: submitDelta of game.state[p pA] and [p pB]
        game.menu.displayOffers();
        game.actions.cancelSelect();
    }

    game.proceed();
};

// 1 = WOOD, 2 = SHEEP, 3 = WHEAT, 4 = BRICK, 5 = ORE

game.actions.buildSettlement = function() {
    if(game.state.phase == 0 || game.state.phase == 1) {
        game.board.showAvailableVertices(1, game.state.turn);
    } else if(game.state.phase == 2) {
        if(game.state.playerHas(game.state.turn, {1: 1, 2: 1, 3: 1, 4: 1}))  {
            game.board.showAvailableVertices(1, game.state.turn);
        } else {
            console.log('Cannot build. Player ' + game.state.turn + ' has insufficient resources');
        }
    }
};

game.actions.buildCity = function() {
    if(game.state.phase == 2 && (game.state.playerHas(game.state.turn, {3: 2, 5: 3}))) {
        game.state.next_action = 'playerControl';
        game.board.showAvailableVertices(2, game.state.turn);
    } else {
        console.log('Cannot build. Player ' + game.state.turn + ' has insufficient resources');
    }

};

game.actions.buildRoad = function(params) {
    if (params == 'R') {
        game.board.showAvailableEdges(game.state.turn, 'R');
    } else if(game.state.phase == 0 || game.state.phase == 1) {
        game.board.showAvailableEdges(game.state.turn);
    } else if(game.state.phase == 2) {
        if(game.state.playerHas(game.state.turn, {1: 1, 4: 1}))  {
            game.state.next_action = 'playerControl';
            game.board.showAvailableEdges(game.state.turn);
        } else {
            console.log('Cannot build. Player ' + game.state.turn + ' has insufficient resources');
        }
    }
};

game.actions.selectVertex = function(i, type) {
    var stop = false;

    if(game.state.phase == 0) {
        game.state['p'+(game.state.turn-1)].firstSettlement = i;
    } else if(game.state.phase == 1) {
        game.state['p'+(game.state.turn-1)].secondSettlement = i;
        var obj = {}, b;
        for(var j = 0; j < game.board.vertices[i].hexes.length; j++) {
            b = game.board.hexes[game.board.vertices[i].hexes[j]].type;
            if(obj[b] == null) obj[b] = 0;
            obj[b]++;
        }
        game.state.collect(game.state.turn, obj);
    } else if(game.state.phase == 2) {
        if(type == 1) {
            game.state.deduct(game.state.turn, {1: 1, 2: 1, 3: 1, 4: 1});
            game.state['p'+(game.state.turn-1)].settlements--;
        } else if(type == 2) {
            if(game.board.vertices[i].owner == game.state.turn) {
                game.state.deduct(game.state.turn, {3: 2, 5: 3});
                game.state['p'+(game.state.turn-1)].cities--;
            } else {
                stop = true;
            }
        }
    }

    if(stop === false) {
        game.board.vertices[i].contents = type;
        game.board.vertices[i].owner = game.state.turn;
        game.board.vertices[i].v.setAttribute('fill', game.state['p'+(game.state.turn-1)].color);
        if (type == 1) {
            game.board.vertices[i].v.setAttribute('width', '10');
            game.board.vertices[i].v.setAttribute('height', '10');
            game.board.vertices[i].v.setAttribute('x', game.board.vertices[i].x - 5);
            game.board.vertices[i].v.setAttribute('y', game.board.vertices[i].y - 5);
        } else if (type == 2) {
            game.board.vertices[i].v.setAttribute('width', '20');
            game.board.vertices[i].v.setAttribute('height', '20');
            game.board.vertices[i].v.setAttribute('x', game.board.vertices[i].x - 10);
            game.board.vertices[i].v.setAttribute('y', game.board.vertices[i].y - 10);
        }
        game.board.vertices[i].v.setAttribute('onclick', '');
        game.board.vertices[i].v.setAttribute('onmouseover', '');
        game.board.vertices[i].v.setAttribute('onmouseout', '');
        game.board.vertices[i].v.setAttribute('class', '');
    }
    game.board.hideEmptyVertices();

    var vertices = (function(vertices){ 
        var obj = [];
        for (var i = 0; i < vertices.length; i++) {
            obj.push({contents : vertices[i].contents, owner : vertices[i].owner, port : vertices[i].port});
        }
        return obj;
    })(game.board.vertices);
    var obj = {};
    obj['vertices'] = JSON.stringify(vertices);
    game.state.updateVictoryPoints(obj);
    if (game.state.phase == 0 || game.state.phase == 1) {
        game.state.next_action = 'buildRoad';
    }

    game.proceed();
};

game.actions.selectEdge = function(i, player, params) {
    game.board.edges[i].road = 1;
    game.board.edges[i].owner = game.state.turn;
    game.board.edges[i].e.setAttribute('stroke', game.state['p'+(game.state.turn-1)].color);
    game.board.edges[i].e.setAttribute('stroke-width', '5');
    game.board.edges[i].e.setAttribute('onclick', '');

    game.board.hideEmptyEdges();

    var obj = {};

    if(game.state.phase == 0) {
        if(game.state.turn == game.state.player_count) {
            game.state.phase = 1;
        } else {
            game.state.turn++;
            game.statusbox.viewPlayer(game.state.turn);
        }
        game.state.next_action = 'buildSettlement';
        obj['next_action'] = 'buildSettlement';
        obj['phase'] = ''+game.state.phase;
        obj['turn'] = ''+game.state.turn;
    } else if(game.state.phase == 1) { 
        if(game.state.turn == 1) {
            game.state.phase = 2;
            game.state.next_action = 'rollDice';
            obj['next_action'] = 'rollDice';
            obj['phase'] = ''+game.state.phase;
        } else {
            game.state.turn--;
            game.statusbox.viewPlayer(game.state.turn);
            game.state.next_action = 'buildSettlement';
            obj['next_action'] = 'buildSettlement';
            obj['turn'] = ''+game.state.turn;
        }

    } else if(game.state.phase == 2) {
        game.state['p'+(game.state.turn-1)].roads--;
        console.log(params);
        if (params === undefined) { 
            game.state.next_action = 'playerControl';
            obj['next_action'] = 'playerControl';
            game.state.deduct(game.state.turn, {1: 1, 4: 1});
        } else if (params == 'R') {
            game.board.showAvailableEdges(player, 'R1'); 
        } else {
            game.state.next_action = 'playerControl';
            obj['next_action'] = 'playerControl';
        }
    } 

    game.state.updateVictoryPoints();
    var edges = (function(edges){ 
        var obj = [];
        for (var i = 0; i < edges.length; i++) {
            obj.push({road : edges[i].road, owner : edges[i].owner});
        }
        return obj;
    })(game.board.edges);
    obj['p'+(game.state.turn-1)] = JSON.stringify(game.state['p'+(game.state.turn-1)]);
    obj['edges'] = JSON.stringify(edges);
    obj['id'] = gapi.hangout.getLocalParticipant().person.id;
    gapi.hangout.data.submitDelta(obj);

    game.proceed();
};

game.actions.cancelPlacement = function() {
    game.board.hideEmptyVertices();
    game.board.hideEmptyEdges();
};

game.actions.playerControl = function() {

    
    // Activate controls only if it's your turn
    var obj;
    if(game.state.turn === game.state.getLocalPlayerNumber()) {
        obj = {
            'offerTrade': game.state.playerCardCount(game.state.turn) > 0,
            'buildRoad': game.state.playerHas(game.state.turn, {1:1, 4:1}) && game.state['p'+(game.state.turn-1)].roads > 0,
            'buildSettlement': game.state.playerHas(game.state.turn, {1:1, 2:1, 3:1, 4:1}) && game.state['p'+(game.state.turn-1)].settlements > 0,
            'buildCity': game.state.playerHas(game.state.turn, {3:2, 5:3}) && game.state['p'+(game.state.turn-1)].cities > 0,
            'buyDevCard': game.state.playerHas(game.state.turn, {2:1, 3:1, 5:1}),
            'endTurn': true,
        };
    } else {
        obj = {'offerTrade': false, 'buildRoad': false, 'buildSettlement': false, 'buildCity': false, 'buyDevCard': false, 'endTurn': false};
    }

    game.statusbox.viewPlayer(game.state.getLocalPlayerNumber());

    var action;
    for(var i = 0; i < game.menu.buttons.length; i++) {
        action = game.menu.buttons[i].getAttribute('data-action');
        if(obj[action] === true) {
            game.menu.buttons[i].children[0].setAttribute('fill', 'white');
            game.menu.buttons[i].setAttribute('onclick', 'game.actions.' + action+'()');
            game.menu.buttons[i].setAttribute('class', 'menu-item');
        } else {
            game.menu.buttons[i].children[0].setAttribute('fill', 'gray');
            game.menu.buttons[i].setAttribute('onclick', '');
            game.menu.buttons[i].setAttribute('class', '');

        }
    }

    game.menu.refreshDevCards();
    for(var i = 0; i < game.menu.devcards.length; i++) {
        if(game.menu.devcards[i].text.textContent.length > 0) {
            game.menu.devcards[i].button.children[0].setAttribute('fill', 'white');
        } else {
            game.menu.devcards[i].button.children[0].setAttribute('fill', 'gray');
        }
    }

    var obj, factor;
    var f_obj = game.state.playerTradingFactors(game.state.turn);
    for(var i = 1; i <= 5; i++) {
        factor = f_obj[i];
        obj = {}; obj[i] = factor;
        game.statusbox.fields[game.state.turn-1]['r'+i].button.children[1].textContent = factor + ':1';
        if(game.state.playerHas(game.state.turn, obj) === true) {
        game.statusbox.fields[game.state.turn-1]['r'+i].button.setAttribute('onclick', 
            'game.actions.setupTrade('+game.state.turn+', 0, {'+i+':'+factor+'})'
            );
            game.statusbox.fields[game.state.turn-1]['r'+i].button.children[0].setAttribute('fill', 'white');
        } else {
            game.statusbox.fields[game.state.turn-1]['r'+i].button.setAttribute('onclick', '');
            game.statusbox.fields[game.state.turn-1]['r'+i].button.children[0].setAttribute('fill', 'gray');
        }
    }

};

game.actions.endTurn = function() {
    for(var i = 0; i < game.menu.buttons.length; i++) {
        game.menu.buttons[i].children[0].setAttribute('fill', 'gray');
        game.menu.buttons[i].setAttribute('onclick', '');
    }

    game.actions.cancelPlacement();
    game.actions.cancelSelect();

    game.state.next_action = 'rollDice';
    game.state.turn = game.state.turn == game.state.player_count ? 1 : game.state.turn+1;

    var obj = {'next_action': 'rollDice'};
    obj['turn'] = ''+game.state.turn;
    obj['id'] = gapi.hangout.getLocalParticipant().person.id;
    gapi.hangout.data.submitDelta(obj);
    //game.proceed();
}

game.actions.winGame = function() {
    console.log('Player ' + game.state.turn + ' wins the game!');
};

