// Object --------------------------------------------------------------------
// ---------------------------------------------------------------------------
var BulletObject = Class(function(pool) {

    Super(pool);
    this.rect = pool.rect;

}, {

    create: function(t, p) {

        Super.create(t, p);

        this.x = p.x;
        this.y = p.y;
        this.ox = p.x;
        this.oy = p.y;

        this.speed = (p.speed || 5) / 100; // determine a meaningful scale
        this.r = toRadian(p.r || 0); // clockwise with 0 pointing up
        this.sx = (p.sx || 1);
        this.sy = (p.sy || 1);
        this.rps = p.rps ? p.rps * (Math.PI * 2 / 1000) : 0;
        this.time = t;

        // Scaled size + out of screen
        this.six = this.mesh.size * this.sx * 2;
        this.siy = this.mesh.size * this.sy * 2;

        this.mesh.position.x = this.x;
        this.mesh.position.y = this.y;
        this.mesh.scale.x = this.sx;
        this.mesh.scale.y = this.sy;

        // Bound size
        this.bix = this.sx * this.mesh.size;
        this.biy = this.sy * this.mesh.size;

    },

    update: function(t) {

        var lifeTime = t - this.time;

        // Calculate position and other values based on passed time
        var ox = Math.sin(this.r) * this.speed * lifeTime,
            oy = Math.cos(this.r) * this.speed * lifeTime;

        var x = this.ox + ox,
            y = this.oy + oy;

        // Apply rendering
        this.mesh.position.x = x;
        this.mesh.position.y = y;
        this.mesh.rotation.z = -(this.r + this.rps * lifeTime);

        // Out of bounds check
        if (x < this.rect.l - this.six || x > this.rect.r + this.six
            || y < this.rect.b - this.siy || y > this.rect.t + this.siy) {

            return true;
        }

    },

    destroy: function(t) {
        Super.destroy(t);
    }

}, MeshObject);


// Pool ----------------------------------------------------------------------
// ---------------------------------------------------------------------------
var BulletPool = Class(function(game, max) {

    Super(game, max, BulletObject, 10, new THREE.MeshBasicMaterial({
        color: 0xffffff,
        wireframe: true
    }));

    this.rect = game.rect;

}, {

    create: function(type, x, y, speed, r, dr, di) {

        var data = BulletTypes[type];
        di = di || 0;
        dr = toRadian(dr || 0); // overwrite in data during load later to speed up this

        Super.create({

            dr: dr,
            di: di,
            r: (r || 0) + getValue(data, 'r', 0),
            speed: (speed || 0) + getValue(data, 'speed', 0),
            x: x + Math.sin(dr) * di,
            y: y + Math.cos(dr) * di,
            sx: getValue(data, 'sx', 1),
            sy: getValue(data, 'sy', 1),
            rps: getValue(data, 'rps', 0)

        });

    }

}, MeshPool);

