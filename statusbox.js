game.statusbox = {
    game: game,
    wrapper_outer: null,
    fields: {},
    player_fields: {},
};

game.statusbox.init = function() {

    var rect, text, button, obj, g, label;
    for(var p = 0; p < game.state.player_count; p++) {

        // TODO: align these with the Google+ Hangout filmstrip; for now just center them
        var margin = 10;
        var width = game.state.player_count <= 5 ? 120 : 100;
        var offset = (700 - game.state.player_count*(margin+width) ) / 2;

        this.player_fields[p] = {};
        g = document.createElementNS(game.ns, 'g');
        g.setAttribute('transform', 'translate(' + ((margin+width) * p + offset) + ', 410)');

        rect = document.createElementNS(game.ns, 'rect');
        rect.setAttribute('fill', game.state['p'+p].color);
        rect.setAttribute('x', '0');
        rect.setAttribute('y', '0');
        rect.setAttribute('width', width);
        rect.setAttribute('height', '25');

        g.appendChild(rect);
        game.svg.appendChild(g);
        this.player_fields[p].rect = rect;

        this.fields[p] = {};
        obj = {
            r1: [0, 'wood', 1],
            r2: [0, 'sheep', 2],
            r3: [0, 'wheat', 3],
            r4: [0, 'brick', 4],
            r5: [0, 'ore', 5],
        };

        var i = 0;
        for(var a in obj) {
            rect = document.createElementNS(game.ns, 'rect');
            rect.setAttribute('x', '0');
            rect.setAttribute('y', '0');
            rect.setAttribute('width', '44');
            rect.setAttribute('height', '80');
            rect.setAttribute('float', 'left');
            rect.setAttribute('fill', game.board.colors[obj[a][2]]);

            label = document.createElementNS(game.ns, 'text');
            label.setAttribute('x', '22');
            label.setAttribute('y', '15');
            label.setAttribute('font-size', '14px');
            label.setAttribute('fill', 'black');
            label.setAttribute('text-anchor', 'middle');
            label.style.fontFamily = 'sans-serif';
            label.textContent = obj[a][1];

            // the actual resource count
            text = document.createElementNS(game.ns, 'text');
            text.setAttribute('x', '22');
            text.setAttribute('y', '45');
            text.setAttribute('width','44');
            text.setAttribute('height', '40');
            text.setAttribute('font-size', '28px');
            text.setAttribute('fill', 'black');
            text.setAttribute('text-anchor', 'middle');
            text.style.fontFamily = 'sans-serif';
            text.textContent = obj[a][0];

            button = document.createElementNS(game.ns, 'g');
            button.setAttribute('transform', 'translate(22, 70)');
            button.setAttribute('text-anchor', 'middle');

            g = document.createElementNS(game.ns, 'g');
            g.setAttribute('transform', 'translate(' + (445 + 50*i) + ', ' + (10) + ')');
            if(game.state.turn != p+1) {
                g.setAttribute('display', 'none');
            }
            g.appendChild(rect);
            g.appendChild(label);
            g.appendChild(text);
            g.appendChild(button);
            game.svg.appendChild(g);
            this.fields[p][a] = {num: text, button: button, wrapper: g};

            rect = document.createElementNS(game.ns, 'rect');
            rect.setAttribute('width', '35');
            rect.setAttribute('height', '18');
            rect.setAttribute('x', '-17.5'); // half-integer values render better
            rect.setAttribute('y', '-14.5');
            rect.setAttribute('fill', 'gray');
            rect.setAttribute('stroke', 'black');
            button.appendChild(rect);

            text = document.createElementNS(game.ns, 'text');
            text.setAttribute('font-size', '16px');
            text.style.fontFamily = 'sans-serif';
            text.style.fontWeight = 'bold';
            text.textContent = '4:1';
            button.appendChild(text);

          
            i++;
        }
    }

    this.viewPlayer(game.state.getLocalPlayerNumber());
};

game.statusbox.viewPlayer = function(player) {

    for(var i = 0; i < game.state.player_count; i++) {
        if(i == player-1) {
            this.fields[i].r1.wrapper.setAttribute('display', 'inline');
            this.fields[i].r2.wrapper.setAttribute('display', 'inline');
            this.fields[i].r3.wrapper.setAttribute('display', 'inline');
            this.fields[i].r4.wrapper.setAttribute('display', 'inline');
            this.fields[i].r5.wrapper.setAttribute('display', 'inline');
            this.player_fields[i].rect.setAttribute('height', '30px');
            this.player_fields[i].rect.setAttribute('transform', 'translate(0, -10)');
        } else {
            this.fields[i].r1.wrapper.setAttribute('display', 'none');
            this.fields[i].r2.wrapper.setAttribute('display', 'none');
            this.fields[i].r3.wrapper.setAttribute('display', 'none');
            this.fields[i].r4.wrapper.setAttribute('display', 'none');
            this.fields[i].r5.wrapper.setAttribute('display', 'none');
            this.player_fields[i].rect.setAttribute('height', '20px');
            this.player_fields[i].rect.setAttribute('transform', '');
        }
    }
};

game.statusbox.updateFields = function(player, fields_obj) {

    for(var a in fields_obj) {
        this.fields[player-1]['r'+a].num.textContent = fields_obj[a];
    }
};
