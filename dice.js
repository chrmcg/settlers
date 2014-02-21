game.dice = {
    visual_d1: null,
    visual_d2: null,
}

var d1 = document.createElementNS(game.ns, 'g');
var rect = document.createElementNS(game.ns, 'rect');
var num = document.createElementNS(game.ns, 'text');
num.setAttribute('font-size', '32px');
num.textContent = '0';
rect.setAttribute('x','-5');
rect.setAttribute('y','-22');
rect.setAttribute('width', '25px');
rect.setAttribute('height', '25px');
rect.setAttribute('fill', 'white');
rect.setAttribute('stroke', 'black');

d1.appendChild(rect);
d1.appendChild(num);
d1.setAttribute('transform', 'translate(30, 355)');
game.dice.visual_d1 = d1;


var d2 = document.createElementNS(game.ns, 'g');
rect = document.createElementNS(game.ns, 'rect');
num = document.createElementNS(game.ns, 'text');
num.setAttribute('font-size', '32px');
num.textContent = '0';
rect.setAttribute('x','-5');
rect.setAttribute('y','-22');
rect.setAttribute('width', '25px');
rect.setAttribute('height', '25px');
rect.setAttribute('fill', 'white');
rect.setAttribute('stroke', 'black');

d2.appendChild(rect);
d2.appendChild(num);
d2.setAttribute('transform', 'translate(60, 355)');
game.dice.visual_d2 = d2;


game.dice.init = function() {
    game.svg.appendChild(game.dice.visual_d1);
    game.svg.appendChild(game.dice.visual_d2);
}
