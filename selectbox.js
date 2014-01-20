
game.selectbox = {
    fields: {},
    wrapper_outer: null,
};

game.selectbox.init = function() {

    this.wrapper_outer = document.createElementNS(game.ns, 'g');
    this.wrapper_outer.setAttribute('transform', 'translate(445, 95)');
    this.wrapper_outer.setAttribute('display', 'none');
    game.svg.appendChild(this.wrapper_outer);

    var gInc, gDec, n, w, text, rect;
    for(var i = 1; i <= 5; i++) {

        text = document.createElementNS(game.ns, 'text');
        text.textContent = '+';
        text.setAttribute('text-anchor', 'middle');
        text.setAttribute('x', '11');
        text.setAttribute('y', '11');
        rect = document.createElementNS(game.ns, 'rect');
        rect.setAttribute('width', '22');
        rect.setAttribute('height', '10');
        rect.setAttribute('fill', 'white');
        rect.setAttribute('stroke', 'black');
        gInc = document.createElementNS(game.ns, 'g');
        gInc.setAttribute('transform', 'translate(10.5, 11.5)');
        gInc.appendChild(rect);
        gInc.appendChild(text);

        text = document.createElementNS(game.ns, 'text');
        text.textContent = '\u2013';
        text.setAttribute('text-anchor', 'middle');
        text.setAttribute('x', '10');
        text.setAttribute('y', '9');
        rect = document.createElementNS(game.ns, 'rect');
        rect.setAttribute('width', '22');
        rect.setAttribute('height', '10');
        rect.setAttribute('fill', 'white');
        rect.setAttribute('stroke', 'black');
        gDec = document.createElementNS(game.ns, 'g');
        gDec.setAttribute('transform', 'translate(10.5, 57.5)');
        gDec.appendChild(rect);
        gDec.appendChild(text);

        rect = document.createElementNS(game.ns, 'rect');
        rect.setAttribute('width', '44');
        rect.setAttribute('height', '80');
        rect.setAttribute('fill', game.board.colors[i]);

        text = document.createElementNS(game.ns, 'text');
        text.textContent = 0;
        text.setAttribute('x', '22');
        text.setAttribute('y', '49');
        text.setAttribute('width','44');
        text.setAttribute('height', '40');
        text.setAttribute('font-size', '28px');
        text.setAttribute('fill', 'black');
        text.setAttribute('text-anchor', 'middle');
        text.style.fontFamily = 'sans-serif';

        wrapper = document.createElementNS(game.ns, 'g');
        wrapper.appendChild(rect);
        wrapper.appendChild(text);
        wrapper.appendChild(gInc);
        wrapper.appendChild(gDec);
        wrapper.setAttribute('transform', 'translate(' + (50*(i-1)) + ', ' + (10) + ')');
        this.wrapper_outer.appendChild(wrapper);

        this.fields['r'+i] = {
            inc_button: gInc,
            dec_button: gDec,
            num: text,
            wrapper: wrapper, 
        }
    }
};

