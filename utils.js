
function randint(min, max) {
    return Math.floor(min + (max - min) * Math.random()); // implement seeded pseudo later for replays...
}

function toRadian(r) {
    return r / 180 * Math.PI;
}

function getValue(data, key, def) {

    var value = data[key]
    if (value === undefined) {
        return def;

    } else if (typeof value === 'number') {
        return value;

    } else {

        if (value[0] === 'r') {
            return randint(value[1], value[2])

        } else {
            return value[randint(0, value.length)];
        }

    }

}

window.requestAnimFrame = (function() {

    return window.requestAnimationFrame ||
            window.webkitRequestAnimationFrame ||
            window.mozRequestAnimationFrame ||
            window.oRequestAnimationFrame ||
            window.msRequestAnimationFrame ||
            function(/* function */ callback, /* DOMElement */ element) {
                window.setTimeout(callback, 1000 / 60);
            };

})();

