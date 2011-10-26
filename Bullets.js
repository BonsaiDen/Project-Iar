// Bullet Managment ===========================================================
// ============================================================================
var Bullets = (function() {

    var time = 0,
        pool = [],
        active = [],
        game = null,
        size = 10,

        material = new THREE.MeshBasicMaterial({
            color: 0xffffff,
            wireframe: true
        });

    // Inititate the bullet Module and pool bullet objects
    function init(g, count) {

        game = g;

        var plane = new THREE.PlaneGeometry(size, size);
        for(var i = 0; i < count; i++) {
            pool.push(new Bullet(true, new THREE.Mesh(plane, material)));
        }

    }

    // Spawn a bullet of the given type at x, y with rotation offset R and position offset calculated from dr and di
    function spawn(type, x, y, speed, r, dr, di) {

        var data = BulletTypes[type];

        dr = dr || 0;
        di = di || 0;
        r = r || 0;
        speed = speed || 0;

        dr = toRadian(dr); // overwrite in data during load later to speed up this
        x += Math.sin(dr) * di;
        y += Math.cos(dr) * di;

        var bullet = getNext();
        if (!bullet) {
            return;
        }

        speed += getValue(data, 'speed', 0);
        r += getValue(data, 'r', 0);

        var sx = getValue(data, 'sx', 1),
            sy = getValue(data, 'sy', 1),
            rps = getValue(data, 'rps', 0);

        Bullet.call(bullet, false, null, x, y, speed, r, sx, sy, rps);

    }

    // Update bullets based on the time value given
    // Bullets live until they hit something or leave the screen
    function update(t) {

        time = t;

        // Set screen bounds
        var minX = game.rect.l,
            maxX = game.rect.r,
            minY = game.rect.b,
            maxY = game.rect.t;

        for(var i = 0, l = active.length; i < l; i++) {

            var b = active[i],
                bt = t - b.time;

            // Calculate position and other values based on passed time
            var ox = Math.sin(b.r) * b.speed * bt,
                oy = Math.cos(b.r) * b.speed * bt;

            var x = b.ox + ox,
                y = b.oy + oy;

            // Apply rendering
            b.mesh.position.x = x;
            b.mesh.position.y = y;
            b.mesh.rotation.z = -(b.r + b.rps * bt);

            // Out of bounds check
            if (x < minX - b.six || x > maxX + b.six || y < minY - b.siy || y > maxY + b.siy) {

                active.splice(i, 1);
                b.used = false;
                game.scene.remove(b.mesh);
                i--;
                l--;

            }

        }

    }

    // Return the next free bullet from the pool
    function getNext() {

        for(var i = 0, l = pool.length; i < l; i++) {
            if (!pool[i].used) {
                pool[i].used = true;
                return pool[i];
            }
        }

    }

    function Bullet(init, mesh, x, y, speed, rotation, scaleX, scaleY, rps) {

        this.used = !init;
        if (init)  {
            this.mesh = mesh;
        }

        this.x = x;
        this.y = y;
        this.ox = x;
        this.oy = y;

        this.speed = (speed || 5) / 100; // determine a meaningful scale
        this.r = toRadian(rotation || 0); // clockwise with 0 pointing up
        this.sx = (scaleX || 1);
        this.sy = (scaleY || 1);
        this.rps = rps ? rps * (Math.PI * 2 / 1000) : 0;
        this.time = time;

        // Scaled size + out of screen
        this.six = size * this.sx * 2;
        this.siy = size * this.sy * 2;

        this.mesh.position.x = this.x;
        this.mesh.position.y = this.y;
        this.mesh.scale.x = this.sx;
        this.mesh.scale.y = this.sy;

        // Bound size
        this.bix = this.sx * size;
        this.biy = this.sy * size;

        if (!init) {
            active.push(this);
            game.scene.add(this.mesh);
        }

    }

    return {
        init: init,
        spawn: spawn,
        update: update
    };

})();



// BulletCombo Managment ======================================================
// ============================================================================
var BulletCombos = (function() {

    var time = 0,
        active = [],
        game = null;

    // Inititate the bulletCombo Module
    function init(g) {
        game = g;
    }

    // Spawn a combo of the given type at x, y with rotation offset R and position offset calculated from dr and di
    function spawn(type, x, y, speed, r, dr, di) {

        // TODO README
        // Use r and speed later when these things are attached to enemies in order to add up the angular movement of the enemy itself
        var data = BulletComboTypes[type];

        // Defaults
        dr = dr || 0;
        di = di || 0;
        r = r || 0;
        speed = speed || 0;

        // Add up values
        di += getValue(data, 'di', 0);
        dr += getValue(data, 'dr', 0);
        dr = toRadian(dr); // overwrite in data during load later to speed up this

        x += Math.cos(dr) * di;
        y += Math.sin(dr) * di;

        speed += getValue(data, 'speed', 0);
        r += getValue(data, 'r', 0);

        var rps = getValue(data, 'rps', 0);

        active.push(new BulletCombo(data, x, y, speed, r, rps));

    }

    // Update bullets based on the time value given
    // Bullets live until they hit something or leave the screen
    function update(t) {

        time = t;

        for(var i = 0, l = active.length; i < l; i++) {

            var combo = active[i];

            // Destroy basded on duration
            if (combo.duration > 0 && time - combo.time > combo.duration) {
                active.splice(i, l);
                i--;
                l--;
                continue;
            }

            combo.update(t);

        }

    }

    function BulletCombo(data, x, y, speed, rotation, rps) {

        this.time = time;
        this.lastRun = time;

        // Patch values to give the expected results from the config
        var interval = getValue(data, 'interval', 100),
            duration = getValue(data, 'duration', 0);

        this.interval = Math.round(interval / game.tick) * game.tick;
        this.duration = Math.round(duration / game.tick) * game.tick;

        if (this.duration > 0) {
            this.duration = Math.floor(this.duration / this.interval) * this.interval;
        }

        this.x = x;
        this.y = y;
        this.speed = speed;
        this.r = toRadian(rotation);
        this.rps = rps ? rps * (Math.PI * 2 / 1000) : 0;
        this.bullets = [];

        var bullets = getValue(data, 'bullets', []);
        for(var i = 0, l = bullets.length; i < l; i++) {

            var bullet = bullets[i];

            // convert float based at times into actual integers based on the current frame rate
            // this simplifies and speeds up stuff
            var at = getValue(bullet, 'at', 0.5),
                atTick = Math.floor((this.interval * at) / game.tick) * game.tick;

            this.bullets.push({

                at: atTick,
                type: bullet.type,
                data: bullet,
                speed: getValue(bullet, 'speed', 0)

            });

        }

        // sort by at tick, again, this speeds up stuff later
        this.bullets.sort(function(a, b) {
            return a.atTick - b.atTick;
        });

        this.bulletIndex = 0;
        this.bulletCount = this.bullets.length;

    }


    BulletCombo.prototype.update = function(t) {

        // Round down into integers that align with bullet fire indexes
        var bct = t - this.time,
            tick = Math.floor(bct % this.interval / game.tick) * game.tick;

        for(var i = this.bulletIndex; i < this.bulletCount; i++) {

            var bullet = this.bullets[i];
            if (tick === bullet.at) {

                // Calculate intermediate values of the combo
                var r = this.r + this.rps * bct,
                    speed = this.speed + bullet.speed;

                r = r * (180 / Math.PI);

                Bullets.spawn(bullet.type, this.x, this.y, speed,
                                r + getValue(bullet.data, 'r', 0),
                                getValue(bullet.data, 'dr', 0),
                                getValue(bullet.data, 'di', 0));

                this.bulletIndex = i + 1;
                if (this.bulletIndex >= this.bulletCount) {
                    this.bulletIndex = 0;
                }

            }

        }

    };

    return {
        init: init,
        spawn: spawn,
        update: update
    };

})();
