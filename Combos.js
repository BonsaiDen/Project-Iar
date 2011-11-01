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

// Object --------------------------------------------------------------------
// ---------------------------------------------------------------------------
var ComboObject = Class(PoolObject, {

    constructor: function(pool) {

        this.game = pool.game;
        this.bulletPool = pool.bulletPool;

    },

    create: function(t, p) {

        // Patch values to give the expected results from the config
        var interval = getValue(p.data, 'interval', 100),
            duration = getValue(p.data, 'duration', 0),
            tick = this.game.tick;

        this.interval = Math.round(interval / tick) * tick;
        this.duration = Math.ceil(duration / tick) * tick;

        if (this.duration > 0) {
            this.duration = Math.ceil(this.duration / this.interval) * this.interval;
        }

        this.x = p.x;
        this.y = p.y;
        this.speed = p.speed;
        this.oAngle = toRadian(p.angle);
        this.rps = p.rps ? p.rps * (Math.PI * 2 / 1000) : 0;
        this.bullets = [];

        var bullets = getValue(p.data, 'bullets', []);
        for(var i = 0, l = bullets.length; i < l; i++) {

            var bullet = bullets[i];

            // convert float based at times into actual integers based on the current frame rate
            // this simplifies and speeds up stuff
            var at = getValue(bullet, 'at', 0.5),
                atTick = Math.floor((this.interval * at) / tick) * tick;

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

    },

    update: function(t) {

        if (this.duration > 0 && t > this.duration) {
            return this.destroy(t);
        }

        var tick = this.game.tick;
            bulletTick = Math.floor((t % this.interval) / tick) * tick;

        for(var i = this.bulletIndex; i < this.bulletCount; i++) {

            var bullet = this.bullets[i];
            if (bulletTick === bullet.at) {

                // Calculate intermediate values of the this
                var r = this.oAngle + this.rps * t,
                    speed = this.speed + bullet.speed;

                r = r * (180 / Math.PI);

                this.bulletPool.create(bullet.type, this.x, this.y, speed,
                            r + getValue(bullet.data, 'r', 0),
                            getValue(bullet.data, 'dr', 0),
                            getValue(bullet.data, 'di', 0));

                this.bulletIndex = i + 1;
                if (this.bulletIndex >= this.bulletCount) {
                    this.bulletIndex = 0;
                }

            }

        }

    }

});


// Pool ----------------------------------------------------------------------
// ---------------------------------------------------------------------------
var ComboPool = Class(ObjectPool, {

    constructor: function(game, max, bulletPool) {

        Super(game, max, ComboObject);
        this.bulletPool = bulletPool;

    },

    create: function(type, x, y, speed, r, dr, di) {

        var data = BulletComboTypes[type];
        di = (di || 0) + getValue(data, 'di', 0);
        dr = toRadian(dr || 0) + getValue(data, 'dr', 0); // overwrite in data during load later to speed up this

        Super.create({

            data: data,
            angle: (r || 0) + getValue(data, 'r', 0),
            speed: (speed || 0) + getValue(data, 'speed', 0),
            x: x + Math.sin(dr) * di,
            y: y + Math.cos(dr) * di,
            rps: getValue(data, 'rps', 0)

        });

    }

});

