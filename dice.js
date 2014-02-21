game.dice = {
    visual_d1: null,
    visual_d2: null,
}

var d1 = document.createElementNS(game.ns, 'g');
var rect = document.createElementNS(game.ns, 'rect');
var num = document.createElementNS(game.ns, 'text');
var pips1 = [];
num.setAttribute('font-size', '32px');
num.textContent = '0';
rect.setAttribute('x','-5');
rect.setAttribute('y','-22');
rect.setAttribute('width', '25px');
rect.setAttribute('height', '25px');
rect.setAttribute('fill', 'white');
rect.setAttribute('stroke', 'black');

d1.appendChild(rect);
//d1.appendChild(num);
for(var i = 0; i < 7; i++) {
    pips1.push(document.createElementNS(game.ns, 'text');
    pips1[i].textContent = "\u2022";
    pips1[i].setAttribute('font-size', '10px');
    pips1[i].setAttribute('display', 'none');
    d1.appendChild(pips1[i]);
}
pips1[0].setAttribute('x', '2');
pips1[0].setAttribute('y', '2');
pips1[1].setAttribute('x', '5.5');
pips1[1].setAttribute('y', '2');
pips1[2].setAttribute('x', '-2');
pips1[2].setAttribute('y', '2');
pips1[3].setAttribute('x', '5.5');
pips1[3].setAttribute('y', '5.5');
pips1[4].setAttribute('x', '2');
pips1[4].setAttribute('y', '-2');
pips1[5].setAttribute('x', '5.5');
pips1[5].setAttribute('y', '-2');
pips1[5].setAttribute('x', '-2');
pips1[5].setAttribute('y', '-2');

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
//d2.appendChild(num);
for(var i = 0; i < 7; i++) {
    pips2.push(document.createElementNS(game.ns, 'text');
    pips2[i].textContent = "\u2022";
    pips2[i].setAttribute('font-size', '10px');
    pips2[i].setAttribute('display', 'none');
    d2.appendChild(pips[2]);
}
pips2[0].setAttribute('x', '2');
pips2[0].setAttribute('y', '2');
pips2[1].setAttribute('x', '5.5');
pips2[1].setAttribute('y', '2');
pips2[2].setAttribute('x', '-2');
pips2[2].setAttribute('y', '2');
pips2[3].setAttribute('x', '5.5');
pips2[3].setAttribute('y', '5.5');
pips2[4].setAttribute('x', '2');
pips2[4].setAttribute('y', '-2');
pips2[5].setAttribute('x', '5.5');
pips2[5].setAttribute('y', '-2');
pips2[5].setAttribute('x', '-2');
pips2[5].setAttribute('y', '-2');

d2.setAttribute('transform', 'translate(60, 355)');
game.dice.visual_d2 = d2;


game.dice.init = function() {
    game.svg.appendChild(game.dice.visual_d1);
    game.svg.appendChild(game.dice.visual_d2);
}
