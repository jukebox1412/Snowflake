const bgColor = 20;
const canvasSize = 600;

// number of dendrites a snowflake may be attached to
const max_dendrites = 5;
// number of snowflakes on screen at one time
const snowflake_count = 9;

const max_den_distance = 70;
const min_den_distance = 15;
const den_distance_dev = 10;

const dendrite_size = 30;
const dendrite_size_dev = 10;

const nucleus_size = 15;
const nucleus_size_dev = 5;

// when to despawn snowflakes that are too low 
const despawn_y_offset = max_den_distance + den_distance_dev;
// starting y-offset of snowflake spawn so it doesn't appear they all fall at once
const spawn_y_offset = 400;

const nucleus_color = "rgba(160, 150, 240, 0.8)";
// color of line connecting dendrite and nucleus
const line_color = "rgba(82, 126, 201,";

// color of dendrites
const dendrite_r_base = 100;
const dendrite_g_base = 70;
const dendrite_b_base = 205;
const dendrite_color_dev = 70;

// y decrease for snowflakes
const fall_rate_base = 3;
const fall_rate_dev = 0.5;

// rate at which opacity decreases
const melt_rate = 0.01;
// opacity at which snowflake is no long drawn
const melt_cutoff = 0.05;

const wind_strength = 0.1;
const wind_interval = 200;
const wind_frequency = 400;

var current_wind_strength = 0.0;
var wind_freq_counter = 0;
var wind_interval_counter = 0;
var snowflakes = [];
var melting = [];

class Dendrite {
    constructor(x, y, opac, r, g, b) {
        this.x = x;
        this.y = y;
        this.opac = opac;

        this.dendrite_color = `rgba(${r}, ${g}, ${b},`;
        this.dendrite_size = Math.random() * (2 * dendrite_size_dev) + (dendrite_size - dendrite_size_dev);
    }
}


class Snowflake {
    constructor(x, y) {
        this.x = x;
        this.y = y;
        this.fall_rate = Math.random() * (2 * fall_rate_dev) + (fall_rate_base - fall_rate_dev);
        this.max_den_distance = Math.random() * (2 * den_distance_dev) + (max_den_distance - den_distance_dev);
        this.min_den_distance = Math.random() * (2 * den_distance_dev) + (min_den_distance - den_distance_dev);
        this.nucleus_size = Math.random() * (2 * nucleus_size_dev) + (nucleus_size - nucleus_size_dev);
        this.dendrites = [];
        this.x_vel = current_wind_strength;
    }
}

function setup() {
    createCanvas(canvasSize * 1.5, canvasSize);
    angleMode(DEGREES);
    strokeWeight(2);
}

function draw() {
    background(bgColor);

    // center coordinates
    translate(canvasSize / 2, canvasSize / 2);

    spawn_snowflakes();
    for (let i = 0; i < snowflakes.length; i++) {
        manage_dendrites(i);
        draw_snowflake(i);
    }
    blow_wind();
    fell_snowflakes();
    melt_dendrites();
    despawn_snowflakes();
}

function blow_wind() {
    for (let i = 0; i < snowflakes.length; i++) {
        snowflakes[i].x += snowflakes[i].x_vel;
    }

    if (wind_freq_counter > wind_frequency) {
        if (wind_interval_counter < wind_interval)
        {
            var wind_vector = wind_strength * (Math.random() * 2.0 - 1);
            for (let i = 0; i < snowflakes.length; i++)
            {
                snowflakes[i].x_vel += wind_vector;
            }
            current_wind_strength += wind_vector;
            wind_interval_counter++;
        }
        else {
            wind_freq_counter = 0;
            wind_interval_counter = 0;
        }
    }
    wind_freq_counter++;
}

/**
 * If there are not enough snowflakes, spawns more and pushes it to the 'snowflakes' array.
 */
function spawn_snowflakes() {
    if (snowflakes.length < snowflake_count) {
        snowflakes.push(new Snowflake((Math.random() * (canvasSize) - 0.5 * canvasSize) - (canvasSize * current_wind_strength / 3), -0.5 * canvasSize - spawn_y_offset * Math.random()));
    }
}

/**
 * Makes all snowflakes increase their y property based on that snowflakes fallrate property.
 */
function fell_snowflakes() {
    for (let i = 0; i < snowflakes.length; i++) {
        snowflakes[i].y += snowflakes[i].fall_rate;
    }
}

/**
 * Despawns snowflakes that are too far gone below the visible window
 */
function despawn_snowflakes() {
    for (let i = 0; i < snowflakes.length; i++) {
        if (snowflakes[i].y > 0.5 * canvasSize + despawn_y_offset) {
            snowflakes.splice(i, 1);
            i--;
        }
    }
}

/**
 * Detachs dendrites if a snowflake has over max_dendrites or spawns dendrites if a snowflake doesn't have max_dendrites
 * @param {int} id - index of the snowflake within snowflakes 
 */
function manage_dendrites(id) {
    // if a snowflake lacks dendrites, then add them
    if (snowflakes[id].dendrites.length < max_dendrites) {
        var theta = Math.random() * 360;

        var r = Math.random() * (snowflakes[id].max_den_distance - snowflakes[id].min_den_distance) + snowflakes[id].min_den_distance;
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

/**
 * Takes detached dendrites and slowly makes them more translucent.
 */
function melt_dendrites() {
    noStroke();
    for (let i = 0; i < melting.length; i++) {

        fill(`${melting[i].dendrite_color} ${melting[i].opac})`)
        ellipse(melting[i].x, melting[i].y, melting[i].dendrite_size);

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

/**
 * Given x1,y1 and x2,y2, this function finds the absolute/shortest distance between those two points. In
 * other words, finds the line drawn between those two points
 *
 * @param {*} x1 
 * @param {*} y1 
 * @param {*} x2 
 * @param {*} y2 
 */
function abs_distance(x1, y1, x2, y2) {
    return sqrt(sq(x1 - x2) + sq(y1 - y2));
}

/**
 * Draws the snowflake depending on the snowflakes properties using the 'snowflakes' array
 * @param {*} id 
 */
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
        var opac_goal = 1 - abs_distance(nX, nY, d.x, d.y) / (2 * snowflakes[id].max_den_distance);
        if (d.opac < opac_goal - 0.05) {
            snowflakes[id].dendrites[i].opac += 0.03;
        } else {
            snowflakes[id].dendrites[i].opac = opac_goal;
        }
        fill(`${d.dendrite_color} ${d.opac})`);

        ellipse(d.x, d.y, d.dendrite_size);
    }

    noStroke();

    fill(nucleus_color);
    ellipse(nX, nY, snowflakes[id].nucleus_size);
}