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

        bullets: [{

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

        bullets: [{

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

        bullets: [{

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

        bullets: [{

            at: 0,
            type: 'simple',
            r: 0,
            dr: 0,
            di: 0

        }],

        r: 0,
        rps: -0.7,
        interval: 32,
        duration: 500

    },

    rays: {

        bullets: [{

            at: 0,
            type: 'ray',
            r: ['r', -10, -5],
            dr: 0,
            di: 0

        }, {

            at: 0,
            type: 'ray',
            r: ['r', 5, 10],
            dr: 0,
            di: 0

        }],

        interval: 80

    }

};

