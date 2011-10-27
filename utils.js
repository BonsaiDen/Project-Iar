/**
  * Project Iar
  * Copyright (c) 2011 Ivo Wetzel.
  *
  * All rights reserved.
  *
  * Project Iar is free software: you can redistribute it and/or
  * modify it under the terms of the GNU General Public License as published by
  * the Free Software Foundation, either version 3 of the License, or
  * (at your option) any later version.
  *
  * Project Iar is distributed in the hope that it will be useful,
  * but WITHOUT ANY WARRANTY; without even the implied warranty of
  * MERCHANTABILITY or FITNESS FOR A PARTICULAR PURPOSE. See the
  * GNU General Public License for more details.
  *
  * You should have received a copy of the GNU General Public License along with
  * Project Iar. If not, see <http://www.gnu.org/licenses/>.
  */
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

        } else if (value[0] === 'l') {
            return value.slice(1);

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

