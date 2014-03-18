game.dice = {
    visual_d1: null,
    visual_d2: null,
}

var d1 = document.createElementNS(game.ns, 'g');
var rect = document.createElementNS(game.ns, 'rect');
var pips1 = [];
rect.setAttribute('x','0');
rect.setAttribute('y','0');
rect.setAttribute('width', '25px');
rect.setAttribute('height', '25px');
rect.setAttribute('fill', 'white');
rect.setAttribute('stroke', 'black');
rect.setAttribute('display', 'none');

d1.appendChild(rect);
for(var i = 0; i < 7; i++) {
    pips1.push(document.createElementNS(game.ns, 'text'));
    pips1[i].textContent = "\u2022";
    pips1[i].setAttribute('font-size', '20px');
    pips1[i].setAttribute('display', 'none');
    d1.appendChild(pips1[i]);
}
pips1[0].setAttribute('x', '1');
pips1[0].setAttribute('y', '11');
pips1[1].setAttribute('x', '9');
pips1[1].setAttribute('y', '11');
pips1[2].setAttribute('x', '17');
pips1[2].setAttribute('y', '11');
pips1[3].setAttribute('x', '9');
pips1[3].setAttribute('y', '19');
pips1[4].setAttribute('x', '1');
pips1[4].setAttribute('y', '27');
pips1[5].setAttribute('x', '9');
pips1[5].setAttribute('y', '27');
pips1[6].setAttribute('x', '17');
pips1[6].setAttribute('y', '27');

d1.setAttribute('transform', 'translate(25, 333)');
game.dice.visual_d1 = d1;


var d2 = document.createElementNS(game.ns, 'g');
rect = document.createElementNS(game.ns, 'rect');
var pips2 = [];
rect.setAttribute('x','0');
rect.setAttribute('y','0');
rect.setAttribute('width', '25px');
rect.setAttribute('height', '25px');
rect.setAttribute('fill', 'white');
rect.setAttribute('stroke', 'black');
rect.setAttribute('display', 'none');

d2.appendChild(rect);
for(var i = 0; i < 7; i++) {
    pips2.push(document.createElementNS(game.ns, 'text'));
    pips2[i].textContent = "\u2022";
    pips2[i].setAttribute('font-size', '20px');
    pips2[i].setAttribute('display', 'none');
    d2.appendChild(pips2[i]);
}
pips2[0].setAttribute('x', '1');
pips2[0].setAttribute('y', '11');
pips2[1].setAttribute('x', '9');
pips2[1].setAttribute('y', '11');
pips2[2].setAttribute('x', '17');
pips2[2].setAttribute('y', '11');
pips2[3].setAttribute('x', '9');
pips2[3].setAttribute('y', '19');
pips2[4].setAttribute('x', '1');
pips2[4].setAttribute('y', '27');
pips2[5].setAttribute('x', '9');
pips2[5].setAttribute('y', '27');
pips2[6].setAttribute('x', '17');
pips2[6].setAttribute('y', '27');

d2.setAttribute('transform', 'translate(55, 333)');
game.dice.visual_d2 = d2;

game.dice.init = function() {
    game.svg.appendChild(game.dice.visual_d1);
    game.svg.appendChild(game.dice.visual_d2);
}
