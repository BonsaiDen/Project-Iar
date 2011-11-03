// Object --------------------------------------------------------------------
// ---------------------------------------------------------------------------
var LaserObject = Class(CollideMeshObject, {

    constructor: function(pool) {
        Super(pool);
    },

    create: function(t, p) {

        p.scaleX = p.width;
        p.scaleY = p.length;
        Super.create(t, p);

        this.oldLength = p.length;
        this.length = p.length;
        this.currentLength = p.length;

        // Original coordinate
        this.ox = this.x;
        this.oy = this.y;

        this.setLength(p.length);

    },

    setLength: function(length) {
        this.x = this.ox + Math.sin(this.angle) * length / 2;
        this.y = this.oy + Math.cos(this.angle) * length / 2;
    },

    update: function(t) {

        this.angle = this.oAngle + t * 0.001;
        this.setLength(this.currentLength);

        if (this.oldLength !== this.currentLength) {

            this.size.y = this.currentLength;
            this.setLength(this.currentLength);
            this.updateSize();

        }

        Super.update(t);

        this.oldLength = this.currentLength;
        this.currentLength = this.length;

    },

    // We use this to deal damage
    obbCollision: function(t, other) {
//        this.destroy(t);
    },

    // This is used to determine the length of the laser
    lineCollision: function(dist, other) {

        if (dist < this.currentLength) {
            this.currentLength = dist;
        }

    },

    destroy: function(t) {
        Super.destroy(t);
    }

});


var LaserTypes = {};

// Pool ----------------------------------------------------------------------
// ---------------------------------------------------------------------------
var LaserPool = Class(CollideMeshPool, {

    constructor: function(game, max) {

        Super(game, max, LaserObject, 1, new THREE.MeshBasicMaterial({
            color: 0xffffff,
            wireframe: false
        }));

    },

    create: function(type, x, y, angle, length) {

        var data = LaserTypes[type];

        Super.create({

            angle: (angle || 0),
            length: (length || 200),
            x: x,
            y: y,
            width: 5

        });

    }

});

