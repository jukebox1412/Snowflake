const bgColor = 20;
const canvasSize = 600;
const max_dendrites = 5;
const max_den_distance = 70;
const min_den_distance = 15;
const dendrite_size = 30;
const nucleus_size = 15;

const nucleus_color = "rgba(46, 55, 186, 0.8)";
const dendrite_color = "rgba(109, 68, 206,";
const line_color = "rgba(82, 126, 201,";

const dendrite_r_base = 100;
const dendrite_g_base = 70;
const dendrite_b_base = 205;
const dendrite_color_dev = 70;


var snowflakes = [];
var melting = [];

class Dendrite {
    constructor(x, y, opac, r, g, b) {
        this.x = x;
        this.y = y;
        this.opac = opac;

        this.dendrite_color = `rgba(${r}, ${g}, ${b},`;
    }
}


class Snowflake {
    constructor(x, y) {
        this.x = x;
        this.y = y;
        this.dendrites = [];
    }
}

function setup() {
    createCanvas(canvasSize * 1.5, canvasSize);
    angleMode(DEGREES);
    strokeWeight(2);
    snowflakes.push(new Snowflake(0, 0));
}

function draw() {
    background(bgColor);

    // center coordinates
    translate(canvasSize / 2, canvasSize / 2);
    var mX = mouseX - canvasSize / 2;
    var mY = mouseY - canvasSize / 2;

    snowflakes[0].x = mX;
    snowflakes[0].y = mY;

    manage_dendrites(0);
    melt_dendrites();
    draw_snowflake(0);
}


function manage_dendrites(id) {
    // if a snowflake lacks dendrites, then add them
    if (snowflakes[id].dendrites.length < max_dendrites) {
        var theta = Math.random() * 360;

        var r = Math.random() * (max_den_distance - min_den_distance) + min_den_distance;
        var x = r * cos(theta) + snowflakes[id].x;
        var y = r * sin(theta) + snowflakes[id].y;

        var red = (dendrite_r_base + Math.random() * (dendrite_color_dev) - dendrite_color_dev / 2) | 0;
        var green = (dendrite_g_base + Math.random() * (dendrite_color_dev) - dendrite_color_dev / 2) | 0;
        var blue = (dendrite_b_base + Math.random() * (dendrite_color_dev) - dendrite_color_dev / 2) | 0;

        snowflakes[id].dendrites.push(new Dendrite(x, y, 0.0, red, green, blue));
    }

    for (let i = 0; i < snowflakes[id].dendrites.length; i++) {
        // detatch from nucleus if dendrite is too far away
        if (abs_distance(snowflakes[id].dendrites[i].x, snowflakes[id].dendrites[i].y, snowflakes[id].x, snowflakes[id].y) > max_den_distance) {
            var m = snowflakes[id].dendrites.splice(i, 1);
            melting.push(m[0]);
            i--;
        }
    }
}

function melt_dendrites() {
    noStroke();
    for (let i = 0; i < melting.length; i++) {

        fill(`${melting[i].dendrite_color} ${melting[i].opac})`)
        ellipse(melting[i].x, melting[i].y, dendrite_size, dendrite_size);

        // slowly melt a detached dendrite
        if (melting[i].opac >= 0.05) {
            melting[i].opac -= 0.01;
        } else {
            // remove the melting dendrite after it's been melting for long enough
            melting.splice(i, 1);
            i--;
        }
    }

}

function abs_distance(x1, y1, x2, y2) {
    return sqrt(sq(x1 - x2) + sq(y1 - y2));
}

function draw_snowflake(id) {

    var nX = snowflakes[id].x;
    var nY = snowflakes[id].y;

    for (let i = 0; i < snowflakes[id].dendrites.length; i++) {
        let d = snowflakes[id].dendrites[i];

        // line from nucleus to dendrite
        stroke(`${line_color} ${d.opac})`);
        line(d.x, d.y, nX, nY);

        noStroke();

        // slowly spawn in the dendrite
        var opac_goal = 1 - abs_distance(nX, nY, d.x, d.y) / (2 * max_den_distance);
        if (d.opac < opac_goal - 0.05) {
            snowflakes[id].dendrites[i].opac += 0.03;
        } else {
            snowflakes[id].dendrites[i].opac = opac_goal;
        }
        fill(`${d.dendrite_color} ${d.opac})`);

        ellipse(d.x, d.y, dendrite_size);
    }

    noStroke();

    fill(nucleus_color);
    ellipse(nX, nY, nucleus_size);
}