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
var BulletTypes = {

    player: {
        sx: 0.5, // x scale of the bullet plane
        sy: 2, // y scale of the bullet plane
        r: 10, // base rotation of the bullet direction
        speed: 30, // base speed of the bullet
        rps: 0.5 // rotations per second of the bullet
    },

    spread45: {
        sx: 1,
        sy: 1,
        r: ['r', -22.5, 22.5], // this is a range, can be used for all types which will result in random values
        speed: 20,
        rps: [-1, 1]
    },

    simple: {
        speed: 20
    },

    ray: {
        speed: 40,
        sx: 0.5,
        sy: 2
    }

};


var BulletComboTypes = {

    player: {

        bullets: ['l', {

            type: 'player',
            r: 0, // rotation offset of the bullet
            dr: -90, // offset rotation for the start position of the bullet
            di: 50 // offset distance for the start position of the bullet

        }, {

            type: 'player',
            r: 0,
            dr: 90,
            di: 50

        }],

        interval: 50

    },

    spread3_45_rotate: {

        bullets: ['l', {

            at: 0.33,
            type: 'simple',
            r: 0,
            dr: 0,
            di: 2

        }, {

            at: 0.66,
            type: 'simple',
            r: 120,
            dr: 120,
            di: 2

        }, {

            at: 0.99,
            type: 'simple',
            r: 240,
            dr: 240,
            di: 2

        }],

        rps: 0.5,
        interval: 48,
        duration: 0
    },

    spread3: {

        bullets: ['l', {

            at: 0,
            type: 'simple',
            r: -10,
            dr: 0,
            di: 0

        }, {

            at: 0,
            type: 'simple',
            r: 0,
            dr: 0,
            di: 5

        }, {

            at: 0,
            type: 'simple',
            r: 10,
            dr: 0,
            di: 0

        }],

        r: 180,
        rps: 0,
        interval: 200

    },

    slash: {

        bullets: ['l', {

            at: 0,
            type: 'simple',
            r: 0,
            dr: 0,
            di: 0

        }],

        r: 0,
        rps: -0.7,
        interval: 32,
        duration: 500,
        pause: 2000

    },

    rays: {

        bullets: ['l', {

            at: 0,
            type: 'ray',
            r: ['r', -90, 0],
            dr: 0,
            di: 0

        }, {

            at: 0,
            type: 'ray',
            r: ['r', 0, 90],
            dr: 0,
            di: 0

        }, {

            at: 0,
            type: 'ray',
            r: ['r', -90, 0],
            dr: 0,
            di: 0

        }, {

            at: 0,
            type: 'ray',
            r: ['r', 0, 90],
            dr: 0,
            di: 0

        }, {

            at: 0,
            type: 'ray',
            r: ['r', -90, 0],
            dr: 0,
            di: 0

        }, {

            at: 0,
            type: 'ray',
            r: ['r', 0, 90],
            dr: 0, // Use X / Y offsets and calculate from that
            di: 0

        }],

        interval: 24

    }

};

