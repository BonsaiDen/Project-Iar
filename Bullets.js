// Object --------------------------------------------------------------------
// ---------------------------------------------------------------------------
var BulletObject = Class(function(pool) {

    Super(pool);
    this.rect = pool.rect;

}, {

    create: function(t, p) {

        this.x = p.x;
        this.y = p.y;
        this.ox = p.x;
        this.oy = p.y;

        this.speed = (p.speed || 0) / 100; // determine a meaningful scale
        this.angle = toRadian(p.angle || 0); // clockwise with 0 pointing up
        this.scaleX = (p.scaleX || 1);
        this.scaleY = (p.scaleY || 1);
        this.rps = p.rps ? p.rps * (Math.PI * 2 / 1000) : 0;
        this.time = t;

        // Scaled size + out of screen
        this.six = this.mesh.size * this.scaleX * 2;
        this.siy = this.mesh.size * this.scaleY * 2;

        Super.create(t, p);

    },

    update: function(t) {

        var lifeTime = t - this.time;

        // Calculate position and other values based on passed time
        var ox = Math.sin(this.angle) * this.speed * lifeTime,
            oy = Math.cos(this.angle) * this.speed * lifeTime;

        var x = this.ox + ox,
            y = this.oy + oy;

        // Out of bounds check
        if (x < this.rect.l - this.six || x > this.rect.angle + this.six
            || y < this.rect.b - this.siy || y > this.rect.t + this.siy) {

            this.destroy(t);

        }

        // Apply rendering
        this.mesh.position.x = x;
        this.mesh.position.y = y;
        this.mesh.rotation.z = -(this.angle + this.rps * lifeTime);

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

