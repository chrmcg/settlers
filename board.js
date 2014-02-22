game.board = {
    game: game,
    hexes: [],
    vertices: [],
    edges: []
};

game.board.randomize = function() {
     // 0 = no port, 1 = WOOD, 2 = SHEEP, 3 = WHEAT, 4 = BRICK, 5 = ORE, 6 = 3:1 port
    var porttypes = [1, 2, 3, 4, 5, 6, 6, 6, 6];
    var ports = [
        [ 0, 6], [ 1, 6], [ 3, 2], [ 4, 2], 
        [14, 6], [15, 6], [26, 6], [37, 6],
        [46, 4], [45, 4], [51, 1], [50, 1],
        [48, 6], [47, 6], [38, 3], [28, 3],
        [17, 5], [ 7, 5]
    ];
    // Randomize ports
    for(var i = 0; i < porttypes.length - 1; i++) {
        var swap = Math.floor(Math.random() * (porttypes.length - 1 - i)) + i + 1;
        temp = porttypes[i];
        porttypes[i] = porttypes[swap];
        porttypes[swap] = temp;
    }
    for(var i = 0; i < ports.length; i+=2) {
        ports[i][1] = porttypes[i/2];
        ports[i+1][1] = porttypes[i/2];
    }

    var nums = [0, 2, 3, 3, 4, 4, 5, 5, 6, 6, 8, 8, 9, 9, 10, 10, 11, 11, 12];
    // Randomize numbers until 6 or 8 not adjacent
    do {
        for(var i = 0; i < nums.length - 1; i++) {
            var swap = Math.floor(Math.random() * (nums.length - 1 - i)) + i + 1;
            temp = nums[i];
            nums[i] = nums[swap];
            nums[swap] = temp;
        }
    } while(this.checkNums(nums) === false);
    
    // 1 = WOOD, 2 = SHEEP, 3 = WHEAT, 4 = BRICK, 5 = ORE, 0 = DESERT
    var types = [1, 1, 1, 1, 2, 2, 2, 2, 3, 3, 3, 3, 4, 4, 4, 5, 5, 5];
    // Randomize types
    for(var i = 0; i < types.length - 1; i++) {
        var swap = Math.floor(Math.random() * (types.length - 1 - i)) + i + 1;
        temp = types[i];
        types[i] = types[swap];
        types[swap] = temp;
    }

    // Assign ports
    for(var i = 0; i < ports.length; i++) {
        this.vertices[ports[i][0]].port = ports[i][1];
    }

    // Assign randomized numbers
    for(var i = 0; i < 19; i++) {
        this.hexes[i].num = nums.shift();
    }

    // Assign randomized types
    for(var i = 0; i < 19; i++) {
        this.hexes[i].type = this.hexes[i].num == 0 ? 0 : types.shift();
        this.hexes[i].robber = this.hexes[i].num == 0 ? 1 : 0;
    }

};

game.board.init = function() {
    
    var vhex = [
        [ 1,  2, 10,  9,  8,  0], // hex 0
        [ 3,  4, 12, 11, 10,  2],
        [ 5,  6, 14, 13, 12,  4],
        [ 8,  9, 19, 18, 17,  7],
        [10, 11, 21, 20, 19,  9],
        [12, 13, 23, 22, 21, 11], // hex 5
        [14, 15, 25, 24, 23, 13],
        [17, 18, 29, 28, 27, 16],
        [19, 20, 31, 30, 29, 18],
        [21, 22, 33, 32, 31, 20],
        [23, 24, 35, 34, 33, 22], // hex 10
        [25, 26, 37, 36, 35, 24],
        [29, 30, 40, 39, 38, 28],
        [31, 32, 42, 41, 40, 30],
        [33, 34, 44, 43, 42, 32],
        [35, 36, 46, 45, 44, 34], // hex 15
        [40, 41, 49, 48, 47, 39],
        [42, 43, 51, 50, 49, 41],
        [44, 45, 53, 52, 51, 43]  // hex 18
    ];

    var ehex = [
        [ 1,  7, 12, 11,  6,  0], // hex 0
        [ 3,  8, 14, 13,  7,  2],
        [ 5,  9, 16, 15,  8,  4],
        [11, 19, 25, 24, 18, 10],
        [13, 20, 27, 26, 19, 12],
        [15, 21, 29, 28, 20, 14], // hex 5
        [17, 22, 31, 30, 21, 16],
        [24, 34, 40, 39, 33, 23],
        [26, 35, 42, 41, 34, 25],
        [28, 36, 44, 43, 35, 27],
        [30, 37, 46, 45, 36, 29], // hex 10
        [32, 38, 48, 47, 37, 31], 
        [41, 50, 55, 54, 49, 40],
        [43, 51, 57, 56, 50, 42],
        [45, 52, 59, 58, 51, 44],
        [47, 53, 61, 60, 52, 46], // hex 15
        [56, 63, 67, 66, 62, 55],
        [58, 64, 69, 68, 63, 57],
        [60, 65, 71, 70, 64, 59]  // hex 18
    ];

    // Initialize game.board.vertices
    for(var i = 0; i < 54; i++) {
        this.vertices[i] = {
            hexes: [],
            port: 0,        // 0 = no port, 1..5 = 2:1 port, 6 = 3:1 port
            contents: 0,    // 0 = empty, 1 = settlement, 2 = city
            owner: null,
            edges: [],
            x: null,
            y: null
        }
    }

    // Initialize game.board.edges
    for(var i = 0; i < 72; i++) {
        this.edges[i] = {
            v1: null,
            v2: null,
            road: 0,
            owner: null,
        }
    }

    // Initialize game.board.hexes
    for(var i = 0; i < 19; i++) {
        this.hexes[i] = {
            num: null,
            type: null,
            cx: null,
            cy: null,
            vertices: vhex[i],
            robber: null,
            circle: null,
        }

        for(var j = 0; j < 6; j++) {
            this.vertices[vhex[i][j]].hexes.push(i);

            this.edges[ehex[i][j]].v1 = vhex[i][j];
            this.edges[ehex[i][j]].v2 = vhex[i][(j+1)%6];

            if(this.vertices[vhex[i][j]].edges.indexOf(ehex[i][j]) < 0) {
                this.vertices[vhex[i][j]].edges.push(ehex[i][j]);
            }
            if(this.vertices[vhex[i][(j+1)%6]].edges.indexOf(ehex[i][j]) < 0) {
                this.vertices[vhex[i][(j+1)%6]].edges.push(ehex[i][j]);
            }
        }
    }

};

// Checks to see if 6 or 8 adjacent
game.board.checkNums = function(nums) {

    var v, n;
    for(var i = 0; i < nums.length; i++) {
       
        for(var j = 0; j < this.hexes[i].vertices.length; j++) {
            v = this.hexes[i].vertices[j];

            for(var k = 0; k < this.vertices[v].hexes.length; k++) {
                if(this.vertices[v].hexes[k] != i) {
                    n = nums[this.vertices[v].hexes[k]];
                    if((nums[i] == 6 || nums[i] == 8) && (n == 6 || n == 8)) {
                        return false;
                    }
                }
            }
        }
    }

    return true;
};

game.board.getNeighborVertices = function(vertex) {
    var e;
    var arr = [];
    for(var i = 0; i < this.vertices[vertex].edges.length; i++) {
        e = this.edges[this.vertices[vertex].edges[i]];
        if(e.v1 == vertex) {
            arr.push(e.v2);
        } else if(e.v2 == vertex) {
            arr.push(e.v1);
        }
    }
    return arr;
}

game.board.getUnblockedNeighborEdgesOwners = function(edge) {
    var arr = [];
    var e_arr;
    if(this.vertices[this.edges[edge].v1].contents == 0) {
        e_arr = this.vertices[this.edges[edge].v1].edges;
        for(var i = 0; i < e_arr.length; i++) {
            if(e_arr[i] != edge) arr.push(this.edges[e_arr[i]].owner);
        }
    }
    if(this.vertices[this.edges[edge].v2].contents == 0) {
        e_arr = this.vertices[this.edges[edge].v2].edges;
        for(var i = 0; i < e_arr.length; i++) {
            if(e_arr[i] != edge) arr.push(this.edges[e_arr[i]].owner);
        }
    }
    return arr;
}

game.board.getHexPoints = function(cx, cy, rx, ry) {
    var p0x, p0y, p1x, p1y, p2x, p2y, p3x, p3y, p4x, p4y, p5x, p5y;
    var L2 = ry/2;
    p0x = cx;       p0y = cy - ry;
    p1x = cx + rx;  p1y = cy - L2;
    p2x = cx + rx;  p2y = cy + L2;
    p3x = cx;       p3y = cy + ry;
    p4x = cx - rx;  p4y = cy + L2;
    p5x = cx - rx;  p5y = cy - L2;
    return [p0x, p0y, p1x, p1y, p2x, p2y, p3x, p3y, p4x, p4y, p5x, p5y];
};

// 0 = DESERT, 1 = WOOD, 2 = SHEEP, 3 = WHEAT, 4 = BRICK, 5 = ORE
game.board.colors = [
    'rgb(180,175,88)',
    'rgb(83,155,56)',
    'rgb(128,189,86)',
    'rgb(238,242,79)',
    'rgb(167,63,34)',
    'rgb(134,147,163)'
];

game.board.redraw = function() {
    game.display.refreshHexes();
    game.display.refreshEdges();
    game.display.refreshVertices();
    game.display.refreshPlayerFields();
};

game.board.draw = function(w, h) {
    w = w*2/3;

    var rx, ry;
    if(w < h) {
        rx = (w - 22) / 10;
        ry = 2 * rx / Math.sqrt(3);
    } else {
        ry = (h - 22) / 8;
        rx = Math.sqrt(3) * ry / 2;
    }

    var Cx = w / 2;
    var Cy = h / 2;

    this.hexes[0].cx = Cx - 2*rx;   this.hexes[0].cy = Cy - 3*ry;
    this.hexes[1].cx = Cx;          this.hexes[1].cy = Cy - 3*ry;
    this.hexes[2].cx = Cx + 2*rx;   this.hexes[2].cy = Cy - 3*ry;
    this.hexes[3].cx = Cx - 3*rx;   this.hexes[3].cy = Cy - 1.5*ry;
    this.hexes[4].cx = Cx - rx;     this.hexes[4].cy = Cy - 1.5*ry;
    this.hexes[5].cx = Cx + rx;     this.hexes[5].cy = Cy - 1.5*ry;
    this.hexes[6].cx = Cx + 3*rx;   this.hexes[6].cy = Cy - 1.5*ry;
    this.hexes[7].cx = Cx - 4*rx;   this.hexes[7].cy = Cy;
    this.hexes[8].cx = Cx - 2*rx;   this.hexes[8].cy = Cy;
    this.hexes[9].cx = Cx;          this.hexes[9].cy = Cy;
    this.hexes[10].cx = Cx + 2*rx;  this.hexes[10].cy = Cy;
    this.hexes[11].cx = Cx + 4*rx;  this.hexes[11].cy = Cy;
    this.hexes[12].cx = Cx - 3*rx;  this.hexes[12].cy = Cy + 1.5*ry;
    this.hexes[13].cx = Cx - rx;    this.hexes[13].cy = Cy + 1.5*ry;
    this.hexes[14].cx = Cx + rx;    this.hexes[14].cy = Cy + 1.5*ry;
    this.hexes[15].cx = Cx + 3*rx;  this.hexes[15].cy = Cy + 1.5*ry;
    this.hexes[16].cx = Cx - 2*rx;  this.hexes[16].cy = Cy + 3*ry;
    this.hexes[17].cx = Cx;         this.hexes[17].cy = Cy + 3*ry;
    this.hexes[18].cx = Cx + 2*rx;  this.hexes[18].cy = Cy + 3*ry;

    var hex, text, circle, group, bbox, points, prob;
    for(var i = 0; i < 19; i++) {
        if(this.hexes[i].cx !== undefined) {
            group = document.createElementNS(game.ns, 'g');

            points = this.getHexPoints(this.hexes[i].cx, this.hexes[i].cy, rx, ry);
            for(j = 0; j < 6; j++) {
                this.vertices[this.hexes[i].vertices[j]].x = points[2*j];
                this.vertices[this.hexes[i].vertices[j]].y = points[2*j+1];
            }

            hex = document.createElementNS(game.ns, 'polygon');
            hex.setAttribute('points', points.join(','));
            hex.setAttribute('stroke-width', '4');
            hex.setAttribute('stroke', 'white');
            hex.setAttribute('fill', this.colors[this.hexes[i].type]);

            if(this.hexes[i].type != 0) {
                text = document.createElementNS(game.ns, 'text');
                text.setAttribute('x', this.hexes[i].cx);
                text.setAttribute('y', this.hexes[i].cy);
                text.setAttribute('font-size', '32px');
                text.setAttribute('class', 'hex-content');
                text.textContent = this.hexes[i].num;
                text.setAttribute('fill', 'white');
                prob = document.createElementNS(game.ns, 'text');
                prob.setAttribute('x', this.hexes[i].cx);
                prob.setAttribute('y', this.hexes[i].cy + 25);
                prob.setAttribute('class', 'hex-content');
                prob.setAttribute('fill', 'white');
                if (this.hexes[i].num == 2 || this.hexes[i].num == 12) {
                    prob.textContent = "\u2022";
                } else if (this.hexes[i].num == 3 || this.hexes[i].num == 11) {
                    prob.textContent = "\u2022\u2022";
                } else if (this.hexes[i].num == 4 || this.hexes[i].num == 10) {
                    prob.textContent = "\u2022\u2022\u2022";
                } else if (this.hexes[i].num == 5 || this.hexes[i].num == 9) {
                    prob.textContent = "\u2022\u2022\u2022\u2022";
                } else if (this.hexes[i].num == 6 || this.hexes[i].num == 8) {
                    prob.textContent = "\u2022\u2022\u2022\u2022\u2022";
                    prob.setAttribute('fill', '#ff0000');
                    text.setAttribute('fill', '#ff0000');
                }            
            } else {
                text = document.createElementNS(game.ns, 'text');
                text.setAttribute('x', this.hexes[i].cx);
                text.setAttribute('y', this.hexes[i].cy);
                text.setAttribute('font-size', '32px');
                text.setAttribute('class', 'hex-content');
                text.setAttribute('fill', 'white');
                prob = document.createElementNS(game.ns, 'text');
                prob.setAttribute('x', this.hexes[i].cx);
                prob.setAttribute('y', this.hexes[i].cy + 25);
                prob.setAttribute('class', 'hex-content');
                prob.setAttribute('fill', 'white');
            }

            group.appendChild(hex);
            
            // Create a placeholder robber
            circle = document.createElementNS(game.ns, 'circle');
            circle.setAttribute('cx', this.hexes[i].cx);
            circle.setAttribute('cy', this.hexes[i].cy);
            circle.setAttribute('fill', '#000000');
            circle.setAttribute('r', '27');
            if (this.hexes[i].robber == 0) {
                circle.setAttribute('fill', 'rgba(0,0,0,0)');
            } else {
                circle.setAttribute('fill', 'rgba(1,1,1,0.6)');
            }
            this.hexes[i].circle = circle;

            // The order of appendChild calls determines the z-index in SVG
            group.appendChild(text);
            group.appendChild(prob);
            group.appendChild(circle);
            game.svg.appendChild(group);

            // Fix centering of nums
            if(this.hexes[i].type != 0) {
                bbox = text.getBBox();
                text.setAttribute('x', this.hexes[i].cx - bbox.width/2);
                text.setAttribute('y', this.hexes[i].cy + bbox.height/4);
                bbox = prob.getBBox();
                prob.setAttribute('x', this.hexes[i].cx - bbox.width/2);
            }
        }
    }


    // Create placeholder object at each edge
    var e;
    for(var i = 0; i < 72; i++) {
        e = document.createElementNS(game.ns, 'line');
        e.setAttribute('x1', this.vertices[this.edges[i].v1].x);
        e.setAttribute('y1', this.vertices[this.edges[i].v1].y);

        e.setAttribute('x2', this.vertices[this.edges[i].v2].x);
        e.setAttribute('y2', this.vertices[this.edges[i].v2].y);

        e.setAttribute('stroke', 'black');
        e.setAttribute('stroke-width', '5');
        e.setAttribute('visibility', 'hidden');
        this.edges[i].e = e;
        game.svg.appendChild(e);
    }

    // Create placeholder object at each vertex
    var v;
    for(var i = 0; i < 54; i++) {
        v = document.createElementNS(game.ns, 'rect');
        v.setAttribute('x', this.vertices[i].x - 5);
        v.setAttribute('y', this.vertices[i].y - 5);
        v.setAttribute('width', '10');
        v.setAttribute('height', '10');
        v.setAttribute('stroke-width', '2');
        v.setAttribute('fill', 'white');
        if(this.vertices[i].port > 0) {
            if(this.vertices[i].port == 6) {
                v.setAttribute('stroke', 'blue');
            } else {
                v.setAttribute('stroke', game.board.colors[this.vertices[i].port]);
            }
        } else {
            v.setAttribute('stroke', 'black');
        }
        v.setAttribute('visibility', 'hidden');
        this.vertices[i].v = v;
        game.svg.appendChild(v);
    }
    if (window.drawn === false) {
        window.drawn = true;
        game.board.redraw();
    }
};

game.board.showAvailableEdges = function(player, params) {
    var cont;
    var a = game.state['p'+(game.state.turn-1)].firstSettlement; 
    var b = game.state['p'+(game.state.turn-1)].secondSettlement; 
    for(var i = 0; i < 72; i++) {

        cont = true;

        if(game.state.phase == 1) {
            cont = false;
            if(this.edges[i].v1 == b || this.edges[i].v2 == b) {
                cont = true;
            }
        }

        // TODO: On mouseover, Show the longest path through the road that includes the highlighted edge
        if(cont === true && this.edges[i].road == 0
                && (this.vertices[this.edges[i].v1].owner == player
                    || this.vertices[this.edges[i].v2].owner == player
                    || this.getUnblockedNeighborEdgesOwners(i).indexOf(player) > -1
                    )
          )
        {
            this.edges[i].e.setAttribute('class', 'menu-item');
            this.edges[i].e.setAttribute('visibility', 'visible');
            this.edges[i].e.setAttribute('onmouseover', 'game.board.highlightEdge('+i+','+player+',"'+params+'")');
            this.edges[i].e.setAttribute('onmouseout', 'game.board.unhighlightEdge('+i+')');
        }
    }

};

game.board.showAvailableVertices = function(type, player) {
    var a, b, c;
    if(type == 1) {
        for (var i = 0; i < 54; i++) {
            var neighbors = this.getNeighborVertices(i);
            var draw = true;
            for(var j = 0; j < neighbors.length; j++) {
                var neighbor = neighbors[j];
                if(this.vertices[neighbor].contents != 0) {
                    draw = false;
                }
            }
            var draw2 = true;
            var edges = this.vertices[i].edges;
            if(game.state.phase == 2) {
                draw2 = false;
                for(var j = 0; j < edges.length; j++) {
                    var edge = edges[j];
                    if(this.edges[edge].owner === player) {
                        draw2 = true;
                    }
                }
            }
            if(this.vertices[i].contents != 0) {
                draw = false;
            }
            if(draw && draw2) {
                this.vertices[i].v.setAttribute('class', 'menu-item');
                this.vertices[i].v.setAttribute('visibility', 'visible');
                this.vertices[i].v.setAttribute('onmouseover', 'game.board.highlightVertex('+i+', ' + type + ', ' + player + ')');
                this.vertices[i].v.setAttribute('onmouseout', 'game.board.unhighlightVertex('+i+',' + type + ')');
            }
        }
    } else if(type == 2) {
        for(var i = 0; i < 54; i++) {
            if(this.vertices[i].contents == 1 && this.vertices[i].owner == player) {
                this.vertices[i].v.setAttribute('class', 'menu-item');
                this.vertices[i].v.setAttribute('onmouseover', 'game.board.highlightVertex('+i+', ' + type + ',' + player + ')');
                this.vertices[i].v.setAttribute('onmouseout', 'game.board.unhighlightVertex('+i+',' + type + ')');
            }
        }
    } else if(type === 3) {
        var robberhex = null;
        for(var j = 0; j < 19; j++) {
            if(game.board.hexes[j].robber == 1) robberhex = j;
        }
        var v;
        for(var j = 0; j < 6; j++) {
            v = game.board.hexes[robberhex].vertices[i];
            if(this.vertices[v].contents === 1 || this.vertices[v].contents === 2 && this.vertices[v].owner !== player) {
                this.vertices[v].v.setAttribute('class', 'menu-item');
                this.vertices[v].v.setAttribute('width', '20');
                this.vertices[v].v.setAttribute('height', '20');
                this.vertices[v].v.setAttribute('x', this.vertices[i].x - 10);
                this.vertices[v].v.setAttribute('y', this.vertices[i].y - 10);
                this.vertices[v].v.setAttribute('onmouseover', 'game.board.highlightVertex('+i+', '+type+', '+player+')');
                this.vertices[v].v.setAttribute('onmouseout', 'game.board.unhighlightVertex('+i+','+type+')');
            }
        }
    }
};


game.board.highlightVertex = function(i, type, player) {
    if(game.state.turn == player) {
        if(type === 1) {
            this.vertices[i].v.setAttribute('width', '20');
            this.vertices[i].v.setAttribute('height', '20');
            this.vertices[i].v.setAttribute('x', this.vertices[i].x - 10);
            this.vertices[i].v.setAttribute('y', this.vertices[i].y - 10);
            this.vertices[i].v.setAttribute('fill', game.state['p'+(player-1)].color);
        } else if(type === 2 || type === 3) {
            this.vertices[i].v.setAttribute('width', '30');
            this.vertices[i].v.setAttribute('height', '30');
            this.vertices[i].v.setAttribute('x', this.vertices[i].x - 15);
            this.vertices[i].v.setAttribute('y', this.vertices[i].y - 15);
        }
        this.vertices[i].v.setAttribute('onclick', 'game.actions.selectVertex('+i+','+type+','+player+')');
    }
};

game.board.unhighlightVertex = function(i, type) {
    this.vertices[i].v.setAttribute('width', '10');
    this.vertices[i].v.setAttribute('height', '10');
    this.vertices[i].v.setAttribute('x', this.vertices[i].x - 5);
    this.vertices[i].v.setAttribute('y', this.vertices[i].y - 5);
    this.vertices[i].v.setAttribute('onclick', '');
    if(type == 1) {
        this.vertices[i].v.setAttribute('fill', 'white');
    }
};

game.board.highlightEdge = function(i, player, params) {
    this.edges[i].e.setAttribute('stroke-width', '10');
    this.edges[i].e.setAttribute('stroke', game.state['p'+(player-1)].color);
    this.edges[i].e.setAttribute('onclick', 'game.actions.selectEdge('+i+','+player+',"'+params+'")');
};

game.board.unhighlightEdge = function(i) {
    this.edges[i].e.setAttribute('stroke-width', '5');
    this.edges[i].e.setAttribute('stroke', 'black');
    this.edges[i].e.setAttribute('onclick', '');
};

game.board.getOwnedNeighborEdges = function(player, edge) {
    if(this.edges[edge].owner != player) return [];

    var arr = [];
    var e;

    for(var i = 0; i < this.vertices[this.edges[edge].v1].edges.length; i++) {
        e = this.edges[this.vertices[this.edges[edge].v1].edges[i]]; 
        if(e.owner == player && e.road == 1 && this.vertices[this.edges[edge].v1].edges[i] != edge) {
            arr.push(this.vertices[this.edges[edge].v1].edges[i]);
        }
    }
    for(var i = 0; i < this.vertices[this.edges[edge].v2].edges.length; i++) {
        e = this.edges[this.vertices[this.edges[edge].v2].edges[i]]; 
        if(e.owner == player && e.road == 1 && this.vertices[this.edges[edge].v2].edges[i] != edge) {
            arr.push(this.vertices[this.edges[edge].v2].edges[i]);
        }
    }
    return arr;
};

game.board.getVertexBetweenEdges = function(e1, e2) {
    if(this.edges[e1].v1 == this.edges[e2].v1) return this.edges[e1].v1;
    if(this.edges[e1].v2 == this.edges[e2].v1) return this.edges[e1].v2;
    if(this.edges[e1].v1 == this.edges[e2].v2) return this.edges[e1].v1;
    if(this.edges[e1].v2 == this.edges[e2].v2) return this.edges[e1].v2;
    return null;
};

game.board.roadLength = function(player) {
    var e_arr = [];
    for(var i = 0; i < 72; i++) {
        if(this.edges[i].road == 1 && this.edges[i].owner == player) {
            e_arr.push(i);
        }
    }

    var paths = [];
    for(i = 0; i < e_arr.length; i++) {
        this.getPaths(player, e_arr[i], [e_arr[i]], [], paths);
    }

    var len = 0;
    for(var i = 0; i < paths.length; i++) {
        if(paths[i].length > len) {
            len = paths[i].length;
        }
    }

    return len;
};

game.board.getPaths = function(player, edge, edge_path, vertex_path, paths) {
    var neighbors = this.getOwnedNeighborEdges(player, edge);
    var v, ep, vp;
    if(neighbors.length == 0) paths.push([edge]);
    for(var i = 0; i < neighbors.length; i++) {
        if(edge_path.indexOf(neighbors[i]) > -1) continue;
        else {
            v = this.getVertexBetweenEdges(edge, neighbors[i]);
            if(vertex_path.indexOf(v) > -1) continue;
            else if(this.vertices[v].owner != null && this.vertices[v].owner != player) continue;
            else {
                ep = edge_path.slice(0);
                ep.push(neighbors[i]);
                vp = vertex_path.slice(0);                
                vp.push(v);
                paths.push(this.getPaths(player, neighbors[i], ep, vp, paths));
            }
        }
    }
    return edge_path;
};

game.board.highlightRobber = function(i) {
    if (this.hexes[i].robber == 0) {
        this.hexes[i].circle.setAttribute('fill', 'rgba(1,1,1,0.6)');
        this.hexes[i].circle.setAttribute('onclick', 'game.actions.selectRobber(' + i + ')');
    }
};

game.board.unhighlightRobber = function(i) {
    if (this.hexes[i].robber == 0) {
        this.hexes[i].circle.setAttribute('fill', 'rgba(0,0,0,0)');
        this.hexes[i].circle.setAttribute('onclick', '');
    }
};

game.board.placeSettlement = function(i) {
    this.vertices[i].owner = game.state.getLocalPlayerNumber();
    this.vertices[i].contents = 1;
    game.display.placeSettlement(i);
};

game.board.placeCity = function(i) {
    if(this.vertices[i].owner === game.state.getLocalPlayerNumber() && this.vertices[i].contents === 1) {
        this.vertices[i].contents = 2;
        game.display.placeCity(i);
    }
};

game.board.placeRoad = function(i) {
    this.edges[i].owner = game.state.getLocalPlayerNumber();
    this.edges[i].road = 1;
    game.display.placeRoad(i);
};
