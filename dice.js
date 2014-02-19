game.dice = {
    visual_d1: null,
    visual_d2: null,
}

var d1 = document.createElementNS(game.ns, 'text');
game.dice.visual_d1 = d1;
d1.setAttribute('x', 15);
d1.setAttribute('y', 15);
d1.setAttribute('font-size', '32px');
d1.textContent = '0';

var d2 = document.createElementNS(game.ns, 'text');
game.dice.visual_d2 = d2;
d2.setAttribute('x', 15);
d2.setAttribute('y', 15);
d2.setAttribute('font-size', '32px');
d2.textContent = '0';


game.dice.init = function() {
    game.svg.appendChild(game.dice.visual_d1);
    game.svg.appendChild(game.dice.visual_d2);
}
