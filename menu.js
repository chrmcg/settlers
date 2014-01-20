game.menu = {
    game: game,
    wrapper_outer: null,
    buttons: [],
    devcards: [],
    offers: [],

};

game.menu.init = function() {

    var actions = { 
        'buildRoad': 'Road',
        'buildSettlement': 'Settlement',
        'buildCity': 'City',
        'buyDevCard': 'Buy Dev Card',
        'offerTrade': 'Trade',
        'endTurn': 'DONE',
        'confirmSelect': 'Confirm',
        'cancelSelect': 'Cancel',

    };
    var positions = {
        'offerTrade':       [530, 115, 70],

        'buyDevCard':       [475, 310, 100],

        'buildRoad':        [615, 200, 80],
        'buildSettlement':  [615, 255, 80],
        'buildCity':        [615, 310, 80],

        'endTurn':          [550, 360, 150],

        'confirmSelect':    [500, 200, 80],
        'cancelSelect':     [590, 200, 80],
    };
    var r, text, g, i = 0;
    for(var a in actions) {

        r = document.createElementNS(game.ns, 'rect');
        r.setAttribute('width', positions[a][2]);
        r.setAttribute('height', '30');
        r.setAttribute('x', '0');
        r.setAttribute('y', '0');
        r.setAttribute('fill', 'gray');
        r.setAttribute('stroke', 'black');

        text = document.createElementNS(game.ns, 'text');
        text.setAttribute('x', positions[a][2] / 2);
        text.setAttribute('y', '20');
        text.setAttribute('width', positions[a][2]);
        text.setAttribute('height', '30');
        text.setAttribute('font-size', '16px');
        text.setAttribute('text-anchor', 'middle');
        text.textContent = actions[a];

        g = document.createElementNS(game.ns, 'g');
        g.setAttribute('transform', 'translate(' + positions[a][0] + ', ' + positions[a][1] + ')');
        g.setAttribute('data-action', a);
        g.appendChild(r);
        g.appendChild(text);

        if(['confirmSelect', 'cancelSelect'].indexOf(a) > -1) g.setAttribute('visibility', 'hidden');
        
        game.svg.appendChild(g);
        this.buttons.push(g);

        i++;
    }

    // Display dev cards
    g = document.createElementNS(game.ns, 'g');
    var g2, text2;
    for(var i = 1; i <= 4; i++) { 
        g2 = document.createElementNS(game.ns, 'g');
        g2.setAttribute('transform', 'translate(110, ' + (25 * (i-1)) + ')');

        text = document.createElementNS(game.ns, 'text');
        text.setAttribute('x', '0');
        text.setAttribute('y', '0');
        text.setAttribute('transform', 'translate(0, ' + (25 * (i-1)) + ')');
        text.textContent = '';
        g.appendChild(text);

        r = document.createElementNS(game.ns, 'rect');
        r.setAttribute('x', '0');
        r.setAttribute('y', '-15');
        r.setAttribute('width', '30');
        r.setAttribute('height', '20');
        r.setAttribute('fill', 'gray');
        r.setAttribute('stroke', 'black');
        g2.appendChild(r);

        text2 = document.createElementNS(game.ns, 'text');
        text2.setAttribute('x', '15');
        text2.setAttribute('y', '0');
        text2.setAttribute('text-anchor', 'middle');
        text2.textContent = 'Play';
        g2.appendChild(text2);

        g2.setAttribute('visibility', 'hidden');

        g.appendChild(g2);
        this.devcards.push({text: text, button: g2});
    }

    g.setAttribute('transform', 'translate(455, 210)');
    game.devcardbox = g;
    game.svg.appendChild(g);


    // Add a box for trading offers
    g = document.createElementNS(game.ns, 'g');
    for(var j = 0; j < game.state.player_count; j++) {

        text = document.createElementNS(game.ns, 'text');
        text.setAttribute('x', 90);
        text.setAttribute('y', 17);
        text.setAttribute('text-anchor', 'middle');
        text.textContent = 'Offer '+j;

        g2 = document.createElementNS(game.ns, 'g');
        g2.setAttribute('transform', 'translate(0, '+(36*j)+')');

        rect = document.createElementNS(game.ns, 'rect');
        rect.setAttribute('width', '180');
        rect.setAttribute('height', '24');
        rect.setAttribute('fill', 'white');
        rect.setAttribute('stroke',' black');
        rect.setAttribute('x','0');
        rect.setAttribute('y','0');
        g2.appendChild(rect);
        g2.appendChild(text);

        g.appendChild(g2);

        this.offers.push({ 
            text: text,
            button: g2,
        });
    }

    g.setAttribute('transform', 'translate(455, 247)');
    g.setAttribute('display', 'none');
    game.tradebox = g;
    game.svg.appendChild(g);
};

game.menu.refreshDevCards = function() {
    var p = game.state['p'+(game.state.turn-1)];
    // TODO: show local player only

    for(var j = 0; j < this.devcards.length; j++) {
        this.devcards[j].text.textContent = '';
        this.devcards[j].button.setAttribute('onclick', '');
        this.devcards[j].text.setAttribute('visibility', 'hidden');
        this.devcards[j].button.setAttribute('visibility', 'hidden');
    }

    var i = 0;
    if(p.cK > 0) {
        this.devcards[i].text.setAttribute('visibility', 'visible');
        this.devcards[i].button.setAttribute('visibility', 'visible');
        this.devcards[i].text.textContent = 'Knight' + (p.cK > 1 ? ' x'+p.cK : '');
        this.devcards[i].button.setAttribute('onclick', 'game.actions.playDevCard("K")');
        i++;
    }
    if(p.cM > 0) {
        this.devcards[i].text.setAttribute('visibility', 'visible');
        this.devcards[i].button.setAttribute('visibility', 'visible');
        this.devcards[i].text.textContent = 'Monopoly' + (p.cM > 1 ? ' x'+p.cM : '');
        this.devcards[i].button.setAttribute('onclick', 'game.actions.playDevCard("M")');
        i++;
    }
    if(p.cR > 0) {
        this.devcards[i].text.setAttribute('visibility', 'visible');
        this.devcards[i].button.setAttribute('visibility', 'visible');
        this.devcards[i].text.textContent = 'Road Building' + (p.cR > 1 ? ' x'+p.cR : '');
        this.devcards[i].button.setAttribute('onclick', 'game.actions.playDevCard("R")');
        i++;
    }
    if(p.cY > 0) {
        this.devcards[i].text.setAttribute('visibility', 'visible');
        this.devcards[i].button.setAttribute('visibility', 'visible');
        this.devcards[i].text.textContent = 'Year of Plenty' + (p.cY > 1 ? ' x'+p.cY : '');
        this.devcards[i].button.setAttribute('onclick', 'game.actions.playDevCard("Y")');
        i++;
    }
};


game.menu.displayOffers = function() {

    // Display your own offer at the top
    var obj, str;

    obj = game.state['p'+(game.state.turn-1)].offer;
    sum = 0;
    str = 'Your offer: ';
    for(var j in obj) { 
        sum += obj[j]; 
        str += obj[j] + ' ' + [null, 'wood', 'sheep', 'wheat', 'brick', 'ore'][j] + ' ';
    }

    if(sum > 0) {
        game.menu.offers[0].text.textContent = str;
        game.menu.offers[0].text.style.fontStyle = 'normal';
        game.menu.offers[0].button.setAttribute('visibility','visible');
        game.menu.offers[0].button.setAttribute('class', '');
        game.menu.offers[0].button.children[0].setAttribute('stroke', 'none');
        game.menu.offers[0].button.setAttribute('onclick', '');
    } else {
        game.menu.offers[0].button.setAttribute('visibility','hidden');
        game.menu.offers[0].button.setAttribute('onclick', '');

    }


    // Display everyone else's offers

    var k = 1;
    for(var i = 0; i < game.state.player_count; i++) {

        obj = game.state['p'+i].offer;
        sum = 0;
        str = 'P'+(i+1)+' offers: ';
        for(var j in obj) { 
            sum += obj[j]; 
            str += obj[j] + ' ' + [null, 'wood', 'sheep', 'wheat', 'brick', 'ore'][j] + ' ';
        }

        if(sum > 0 && (i+1) != game.state.turn) {
            game.menu.offers[k].text.textContent = str;
            game.menu.offers[k].button.setAttribute('visibility','visible');
            game.menu.offers[k].button.setAttribute('class', 'menu-item');
            game.menu.offers[k].button.setAttribute('onclick','game.actions.acceptOffer('+(i+1)+','+JSON.stringify(obj)+')');
            game.menu.offers[k].text.style.fontStyle = 'normal';
            k++;
        }
    }
    //Hide unused offer boxes
    for(k = k; k < game.state.player_count; k++) {
        game.menu.offers[k].button.setAttribute('visibility', 'hidden');
    }
    game.tradebox.setAttribute('display', 'inline');
    
};
