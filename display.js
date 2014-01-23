game.display = {
    game: game
};

game.display.init = function() {
    // Call all functions to initialize visual objects
}

game.display.hideMenuButtons = function(actions) {
    game.menu.buttons.forEach(function(button) {
        if(actions.indexOf(button.getAttribute('data-action')) > -1) {
            button.setAttribute('visibility', 'hidden');
        }
    });
};

game.display.hideAllMenuButtons = function() {
    game.display.hideMenuButtons(['offerTrade', 'buildRoad', 'buildSettlement', 'buildCity', 'buyDevCard', 'endTurn']);
};

game.display.hideAllMenuButtons = function() {
    game.display.showMenuButtons(['offerTrade', 'buildRoad', 'buildSettlement', 'buildCity', 'buyDevCard', 'endTurn']);
};

game.display.showMenuButtons = function(actions) {
    game.menu.buttons.forEach(function(button) {
        if(actions.indexOf(button.getAttribute('data-action')) > -1) {
            button.setAttribute('visibility', 'visible');
        }
    });
};

game.display.enableMenuButtons = function(actions) {
    game.menu.buttons.forEach(function(button) {
        if(actions.indexOf(button.getAttribute('data-action')) > -1) {
            button.children[0].setAttribute('fill', 'white');
            button.setAttribute('onclick', 'game.actions.'+button.getAttribute('data-action')+'()');
            button.setAttribute('class', 'menu-item');
        }
    });
};

game.display.disableMenuButtons = function(actions) {
    game.menu.buttons.forEach(function(button) {
        if(actions.indexOf(button.getAttribute('data-action')) > -1) {
            button.children[0].setAttribute('fill', 'gray');
            button.setAttribute('onclick', '');
            button.setAttribute('class', '');
        }
    });
};

game.display.disableAllMenuButtons = function() {
    game.display.disableMenuButtons(['offerTrade', 'buildRoad', 'buildSettlement', 'buildCity', 'buyDevCard', 'endTurn']);
};

game.display.enableAllMenuButtons = function() {
    game.display.enableMenuButtons(['offerTrade', 'buildRoad', 'buildSettlement', 'buildCity', 'buyDevCard', 'endTurn']);
};

game.display.refreshMenuButtons = function() {
    var obj;
    var playerNumber = game.state.getLocalPlayerNumber();
    if(game.state.turn === playerNumber) {
        console.log('playerControl, your turn');
        obj = {
            'offerTrade': game.state.playerCardCount(game.state.turn) > 0,
            'buildRoad': game.state.playerHas(game.state.turn, {1:1, 4:1}) && game.state['p'+(game.state.turn-1)].roads > 0,
            'buildSettlement': game.state.playerHas(game.state.turn, {1:1, 2:1, 3:1, 4:1}) && game.state['p'+(game.state.turn-1)].settlements > 0,
            'buildCity': game.state.playerHas(game.state.turn, {3:2, 5:3}) && game.state['p'+(game.state.turn-1)].cities > 0,
            'buyDevCard': game.state.playerHas(game.state.turn, {2:1, 3:1, 5:1}),
            'endTurn': true,
        };
    } else {
        console.log('playerControl, not your turn');
        obj = {'offerTrade': false, 'buildRoad': false, 'buildSettlement': false, 'buildCity': false, 'buyDevCard': false, 'endTurn': false};
    }

    var action;
    for(var i = 0; i < game.menu.buttons.length; i++) {
        action = game.menu.buttons[i].getAttribute('data-action');
        if(obj[action] === true) {
            this.enableMenuButtons([action]);
        } else {
            this.disableMenuButtons([action]);
        }
    }
};

game.display.enableExchangeButtons = function(resources) {
    var playerNumber = game.state.getLocalPlayerNumber();
    var f_obj = game.state.playerTradingFactors(playerNumber);
  
    for(var i = 0; i < resources.length; i++) {
        game.statusbox.fields['r'+resources[i]].button.children[0].setAttribute('fill', 'white');
        game.statusbox.fields['r'+resources[i]].button.setAttribute('onclick',
            'game.actions.setupTrade('+playerNumber+', 0, {'+resources[i]+':'+f_obj[resources[i]]+'})');
    }
};

game.display.disableExchangeButtons = function(resources) {
    for(var i = 0; i < resources.length; i++) {
        game.statusbox.fields['r'+resources[i]].button.children[0].setAttribute('fill', 'gray');
        game.statusbox.fields['r'+resources[i]].button.setAttribute('onclick', '');
    }
};

game.display.refreshExchangeButtons = function() {
    var playerNumber = game.state.getLocalPlayerNumber();
    var f_obj = game.state.playerTradingFactors(playerNumber);
    
    for(var i = 1; i <= 5; i++) {
        factor = f_obj[i];
        obj = {};
        obj[i] = factor;
        game.statusbox.fields['r'+i].button.children[1].textContent = factor + ':1';
        if(game.state.playerHas(playerNumber, obj) === true && game.state.turn === playerNumber) {
            game.display.enableExchangeButtons([i]);
        } else {
            game.display.disableExchangeButtons([i]);
        }
    }
};

game.display.refreshResourceCounts = function() {
    var playerNum = game.state.getLocalPlayerNumber();
    for(var i = 1; i <= 5; i++) {
        game.statusbox.fields['r'+i].num.textContent = game.state['p'+(playerNum-1)]['r'+i];
    }
};

game.display.refreshDevCards = function() {
    var playerNum = game.state.getLocalPlayerNumber();
    var p = game.state['p'+(playerNum-1)];

    for(var j = 0; j < game.menu.devcards.length; j++) {
        game.menu.devcards[j].text.textContent = '';
        game.menu.devcards[j].button.setAttribute('onclick', '');
        game.menu.devcards[j].text.setAttribute('visibility', 'hidden');
        game.menu.devcards[j].button.setAttribute('visibility', 'hidden');
    }

    var i = 0;
    if(p.cK > 0) {
        game.menu.devcards[i].text.setAttribute('visibility', 'visible');
        game.menu.devcards[i].button.setAttribute('visibility', 'visible');
        game.menu.devcards[i].text.textContent = 'Knight' + (p.cK > 1 ? ' x'+p.cK : '');
        game.menu.devcards[i].button.setAttribute('onclick', 'game.actions.playDevCard("K")');
        i++;
    }
    if(p.cM > 0) {
        game.menu.devcards[i].text.setAttribute('visibility', 'visible');
        game.menu.devcards[i].button.setAttribute('visibility', 'visible');
        game.menu.devcards[i].text.textContent = 'Monopoly' + (p.cM > 1 ? ' x'+p.cM : '');
        game.menu.devcards[i].button.setAttribute('onclick', 'game.actions.playDevCard("M")');
        i++;
    }
    if(p.cR > 0) {
        game.menu.devcards[i].text.setAttribute('visibility', 'visible');
        game.menu.devcards[i].button.setAttribute('visibility', 'visible');
        game.menu.devcards[i].text.textContent = 'Road Building' + (p.cR > 1 ? ' x'+p.cR : '');
        game.menu.devcards[i].button.setAttribute('onclick', 'game.actions.playDevCard("R")');
        i++;
    }
    if(p.cY > 0) {
        game.menu.devcards[i].text.setAttribute('visibility', 'visible');
        game.menu.devcards[i].button.setAttribute('visibility', 'visible');
        game.menu.devcards[i].text.textContent = 'Year of Plenty' + (p.cY > 1 ? ' x'+p.cY : '');
        game.menu.devcards[i].button.setAttribute('onclick', 'game.actions.playDevCard("Y")');
        i++;
    }
    for(var i = 0; i < game.menu.devcards.length; i++) {
        if(game.menu.devcards[i].text.textContent.length > 0 && game.state.turn === playerNum) {
            game.menu.devcards[i].button.children[0].setAttribute('fill', 'white');
        } else {
            game.menu.devcards[i].button.children[0].setAttribute('fill', 'gray');
        }
    }
};

game.display.cancelPlacement = function() {
    game.board.hideEmptyVertices();
    game.board.hideEmptyEdges();
};

game.display.placeSettlement = function(i) {
    var playerNum = game.state.getLocalPlayerNumber();
    game.board.vertices[i].v.setAttribute('fill', game.state['p'+(playerNum-1)].color);
    game.board.vertices[i].v.setAttribute('width', '10');
    game.board.vertices[i].v.setAttribute('height', '10');
    game.board.vertices[i].v.setAttribute('x', game.board.vertices[i].x - 5);
    game.board.vertices[i].v.setAttribute('y', game.board.vertices[i].y - 5);
    game.board.vertices[i].v.setAttribute('onclick', '');
    game.board.vertices[i].v.setAttribute('onmouseover', '');
    game.board.vertices[i].v.setAttribute('onmouseout', '');
    game.board.vertices[i].v.setAttribute('class', '');
};

game.display.placeCity = function(i) {
    var playerNum = game.state.getLocalPlayerNumber();
    if(game.board.vertices[i].owner === playerNum && game.board.vertices[i].contents === 1) {
        game.board.vertices[i].v.setAttribute('fill', game.state['p'+(playerNum-1)].color);
        game.board.vertices[i].v.setAttribute('width', '20');
        game.board.vertices[i].v.setAttribute('height', '20');
        game.board.vertices[i].v.setAttribute('x', game.board.vertices[i].x - 10);
        game.board.vertices[i].v.setAttribute('y', game.board.vertices[i].y - 10);
        game.board.vertices[i].v.setAttribute('onclick', '');
        game.board.vertices[i].v.setAttribute('onmouseover', '');
        game.board.vertices[i].v.setAttribute('onmouseout', '');
        game.board.vertices[i].v.setAttribute('class', '');

    }
};

game.display.hideEmptyVertices = function() {
    for(var i = 0; i < 54; i++) {
        if(this.vertices[i].contents == 0 && this.vertices[i].port == 0) {
            this.vertices[i].v.setAttribute('visibility', 'hidden');
        }
        this.vertices[i].v.setAttribute('onmouseover', '');
        this.vertices[i].v.setAttribute('onmouseout', '');
        this.vertices[i].v.setAttribute('onclick', '');
        this.vertices[i].v.setAttribute('class', '');
    }
};

game.display.hideEmptyEdges = function() {
    for(var i = 0; i < 72; i++) {
        if(this.edges[i].road == 0) {
            this.edges[i].e.setAttribute('visibility', 'hidden');
        }
        this.edges[i].e.setAttribute('onmouseover', '');
        this.edges[i].e.setAttribute('onmouseout', '');
        this.edges[i].e.setAttribute('onclick', '');
        this.edges[i].e.setAttribute('class', '');
    }
};

game.display.placeRoad = function(i) {
    game.board.edges[i].e.setAttribute('stroke', game.state['p'+(game.state.getLocalPlayerNumber()-1)].color);
    game.board.edges[i].e.setAttribute('stroke-width', '5');
    game.board.edges[i].e.setAttribute('onclick', '');
};

game.display.refreshHexes = function() {
    var obj = [0, 0, "\u2022", "\u2022\u2022", "\u2022\u2022\u2022", "\u2022\u2022\u2022\u2022", 
        "\u2022\u2022\u2022\u2022\u2022", 0, "\u2022\u2022\u2022\u2022\u2022", "\u2022\u2022\u2022\u2022",
        "\u2022\u2022\u2022", "\u2022\u2022", "\u2022"];
    var text, prob, circle, bbox;
    for(var i = 0; i < 19; i++) {
        game.board.hexes[i].circle.parentElement.children[0].setAttribute('fill', game.board.colors[game.board.hexes[i].type]);

        if(game.board.hexes[i].num !== 0) {
            text = game.board.hexes[i].circle.parentElement.children[1];
            text.textContent = game.board.hexes[i].num;

            prob = game.board.hexes[i].circle.parentElement.children[2];

            prob.textContent = obj[i];
            if(game.board.hexes[i].num  === 6 || game.board.hexes[i].num === 8) {
                prob.setAttribute('fill', 'red');
                text.setAttribute('fill', 'red');
            } else {
                prob.setAttribute('fill', 'white');
                text.setAttribute('fill', 'white');
            }
        } else {
            text = game.board.hexes[i].circle.parentElement.children[1];
            text.textContent = '';
            prob = game.board.hexes[i].circle.parentElement.children[2];
            prob.textContent = '';
        }

        text.setAttribute('class', 'hex-content');
        prob.setAttribute('class', 'hex-content');

        circle = game.board.hexes[i].circle;
        if (game.board.hexes[i].robber === 0) {
            circle.setAttribute('fill', 'rgba(0,0,0,0)');
        } else {
            circle.setAttribute('fill', 'rgba(1,1,1,0.6)');
        }

        // Fix centering of nums
        if(game.board.hexes[i].num !== 0) {
            bbox = text.getBBox();
            text.setAttribute('x', game.board.hexes[i].cx - bbox.width/2);
            text.setAttribute('y', game.board.hexes[i].cy + bbox.height/4);
            bbox = prob.getBBox();
            prob.setAttribute('x', game.board.hexes[i].cx - bbox.width/2);
        }
    }
};

game.display.refreshEdges = function() {
    var e;
    for(var i = 0; i < 72; i++) {
        e = game.board.edges[i].e;

        if(game.board.edges[i].owner !== undefined) {
            e.setAttribute('stroke', game.state['p'+(game.board.edges[i].owner-1)].color);
            e.setAttribute('stroke-width', '5');
            e.setAttribute('visibility', 'visible');
        }
    }
};

game.display.refreshVertices = function() {
    var v;
    for(var i = 0; i < 54; i++) {
        v = this.vertices[i].v;

        if(this.vertices[i].contents == 1) {
            v.setAttribute('fill', game.state['p'+(this.vertices[i].owner-1)].color);
            v.setAttribute('visibility', 'visible');
            v.setAttribute('width', '10');
            v.setAttribute('height', '10');
            v.setAttribute('x', this.vertices[i].x - 5);
            v.setAttribute('y', this.vertices[i].y - 5);
            v.setAttribute('onclick', '');
        } else if(this.vertices[i].contents == 2) {
            v.setAttribute('fill', game.state['p'+(this.vertices[i].owner-1)].color);
            v.setAttribute('visibility', 'visible');
            v.setAttribute('width', '20');
            v.setAttribute('height', '20');
            v.setAttribute('x', this.vertices[i].x - 10);
            v.setAttribute('y', this.vertices[i].y - 10);
            v.setAttribute('onclick', '');
        }

        if(this.vertices[i].port > 0) {
            if(this.vertices[i].port === 6) {
                v.setAttribute('stroke', 'blue');
                v.setAttribute('visibility', 'visible');
            } else {
                v.setAttribute('stroke', this.colors[this.vertices[i].port]);
                v.setAttribute('visibility', 'visible');
            }
        } else {
            v.setAttribute('stroke', 'black');
        }
    }
};

game.display.refreshPlayerFields() {
    for(var i = 0; i < game.state.player_count; i++) {
        var player_field = game.statusbox.player_fields[i];
        if(i == game.state.turn-1) {
            player_field.rect.setAttribute('height', '30px');
            player_field.rect.setAttribute('transform', 'translate(0, -10)');
        } else {
            player_field.rect.setAttribute('height', '20px');
            player_field.rect.setAttribute('transform', '');
        }
    }
};