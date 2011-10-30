// Object --------------------------------------------------------------------
// ---------------------------------------------------------------------------
var BulletObject = Class(function(pool) {

    Super(pool);
    this.rect = pool.rect;

}, {

    create: function(t, p) {

        // Move this into another class
        this.x = p.x;
        this.y = p.y;
        this.angle = toRadian(p.angle || 0); // clockwise with 0 pointing up

        this.ox = p.x;
        this.oy = p.y;
        this.oAngle = this.angle;

        this.speed = (p.speed || 0) / 100; // determine a meaningful scale
        this.rps = p.rps ? p.rps * (Math.PI * 2 / 1000) : 0;

        this.size = {
            x: this.mesh.size * (p.scaleX || 1),
            y: this.mesh.size * (p.scaleY || 1)
        };

        this.boundSize = {
            x: this.size.x * 2,
            y: this.size.y * 2
        };

        Super.create(t, p);

    },

    update: function(t) {

        // Calculate position and other values based on passed time
        var dx = Math.sin(this.oAngle) * this.speed * t,
            dy = Math.cos(this.oAngle) * this.speed * t;

        this.x = this.ox + dx,
        this.y = this.oy + dy;

        // Out of bounds check
        var b = this.boundSize;
        if (this.x < this.rect.l - b.x || this.x > this.rect.angle + b.x
            || this.y < this.rect.b - b.y || this.y > this.rect.t + b.y) {

            return this.destroy(t);

        }

        this.angle = -(this.oAngle + this.rps * t);

        Super.update(t);

    },

    collision: function(t, other) {
        this.destroy(t);
    },

    destroy: function(t) {
        Super.destroy(t);
    }

}, CollideMeshObject);


// Pool ----------------------------------------------------------------------
// ---------------------------------------------------------------------------
var BulletPool = Class(function(game, max) {

    Super(game, max, BulletObject, 10, new THREE.MeshBasicMaterial({
        color: 0xffffff,
        wireframe: true
    }));

    this.rect = game.rect;

}, {

    create: function(type, x, y, speed, angle, dr, di) {

        var data = BulletTypes[type];
        di = di || 0;
        dr = toRadian(dr || 0); // overwrite in data during load later to speed up this

        Super.create({

            dr: dr,
            di: di,
            angle: (angle || 0) + getValue(data, 'r', 0),
            speed: (speed || 0) + getValue(data, 'speed', 0),
            x: x + Math.sin(dr) * di,
            y: y + Math.cos(dr) * di,
            scaleX: getValue(data, 'sx', 1),
            scaleY: getValue(data, 'sy', 1),
            rps: getValue(data, 'rps', 0)

        });

    }

}, CollideMeshPool);

