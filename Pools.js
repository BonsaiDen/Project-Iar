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
function ObjectPool(game, count, type) {

    var pool = [],
        active = [],
        time = 0;

    for(var i = 0; i < count; i++) {

        var e = {};
        type.init && type.init(e);
        pool.push(e);
    }

    return {

        add: function(params) {

            for(var i = 0, l = pool.length; i < l; i++) {

                var obj = pool[i];
                if (!obj._used) {

                    obj._used = true;
                    type.add(obj, time, params);
                    active.push(obj);
                    return obj;

                }

            }

        },

        update: function(t) {

            time = t;

            for(var i = 0, l = active.length; i < l; i++) {

                var obj = active[i];
                if (type.update(obj, t)) {

                    active.splice(i, 1);
                    obj._used = false;
                    type.remove(obj, t);
                    i--;
                    l--;
                    continue;

                }

            }

        }

    }

}

function MeshPool(game, count, size, type) {

    var Mesh = {

        init: function(mesh) {
            mesh.mesh = new THREE.Mesh(plane, material);
            type.init && type.init(mesh);
        },

        add: function(mesh, t, params) {
            game.scene.add(mesh.mesh);
            type.add && type.add(mesh, t, params);
        },

        update: function(mesh, t) {
            return type.update && type.update(mesh, t);
        },

        remove: function(mesh, t) {
            game.scene.remove(mesh.mesh);
            type.remove && type.remove(mesh, t);
        }

    };

    var material = new THREE.MeshBasicMaterial({
            color: 0xffffff,
            wireframe: true
        }),
        plane = new THREE.PlaneGeometry(size, size),
        pool = new ObjectPool(game, count, Mesh);

    return {

        add: function(params) {
            return pool.add(params);
        },

        update: function(t) {
            pool.update(t);
        }

    };

}

function BulletPool(game, count) {

    var Bullet = {

        add: function(bullet, t, p) {

            bullet.x = p.x;
            bullet.y = p.y;
            bullet.ox = p.x;
            bullet.oy = p.y;

            bullet.speed = (p.speed || 5) / 100; // determine a meaningful scale
            bullet.r = toRadian(p.r || 0); // clockwise with 0 pointing up
            bullet.sx = (p.sx || 1);
            bullet.sy = (p.sy || 1);
            bullet.rps = p.rps ? p.rps * (Math.PI * 2 / 1000) : 0;
            bullet.time = t;

            // Scaled size + out of screen
            bullet.six = size * bullet.sx * 2;
            bullet.siy = size * bullet.sy * 2;

            bullet.mesh.position.x = bullet.x;
            bullet.mesh.position.y = bullet.y;
            bullet.mesh.scale.x = bullet.sx;
            bullet.mesh.scale.y = bullet.sy;

            // Bound size
            bullet.bix = bullet.sx * size;
            bullet.biy = bullet.sy * size;

        },

        update: function(bullet, t) {

            var bt = t - bullet.time;

            // Calculate position and other values based on passed time
            var ox = Math.sin(bullet.r) * bullet.speed * bt,
                oy = Math.cos(bullet.r) * bullet.speed * bt;

            var x = bullet.ox + ox,
                y = bullet.oy + oy;

            // Apply rendering
            bullet.mesh.position.x = x;
            bullet.mesh.position.y = y;
            bullet.mesh.rotation.z = -(bullet.r + bullet.rps * bt);

            // Out of bounds check
            if (x < minX - bullet.six || x > maxX + bullet.six
                || y < minY - bullet.siy || y > maxY + bullet.siy) {

                return true;
            }

        }

    };

    var size = 10,
        meshPool = new MeshPool(game, count, size, Bullet),
        minX = game.rect.l,
        maxX = game.rect.r,
        minY = game.rect.b,
        maxY = game.rect.t;

    return {

        add: function(type, x, y, speed, r, dr, di) {

            var data = BulletTypes[type];
            di = di || 0;
            dr = toRadian(dr || 0); // overwrite in data during load later to speed up this

            return meshPool.add({

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

        },

        update: function(t) {
            meshPool.update(t);
        }

    };

}


function ComboPool(game, count, bulletPool) {

    var Combo = {

        add: function(combo, t, p) {

            combo.time = t;
            combo.lastRun = t;

            // Patch values to give the expected results from the config
            var interval = getValue(p.data, 'interval', 100),
                duration = getValue(p.data, 'duration', 0);

            combo.interval = Math.round(interval / game.tick) * game.tick;
            combo.duration = Math.round(duration / game.tick) * game.tick;

            if (combo.duration > 0) {
                combo.duration = Math.floor(combo.duration / combo.interval) * combo.interval;
            }

            combo.x = p.x;
            combo.y = p.y;
            combo.speed = p.speed;
            combo.r = toRadian(p.r);
            combo.rps = p.rps ? p.rps * (Math.PI * 2 / 1000) : 0;
            combo.bullets = [];

            var bullets = getValue(p.data, 'bullets', []);
            for(var i = 0, l = bullets.length; i < l; i++) {

                var bullet = bullets[i];

                // convert float based at times into actual integers based on the current frame rate
                // this simplifies and speeds up stuff
                var at = getValue(bullet, 'at', 0.5),
                    atTick = Math.floor((combo.interval * at) / game.tick) * game.tick;

                combo.bullets.push({

                    at: atTick,
                    type: bullet.type,
                    data: bullet,
                    speed: getValue(bullet, 'speed', 0)

                });

            }

            // sort by at tick, again, combo speeds up stuff later
            combo.bullets.sort(function(a, b) {
                return a.atTick - b.atTick;
            });

            combo.bulletIndex = 0;
            combo.bulletCount = combo.bullets.length;

        },

        update: function(combo, t) {

            var bct = t - combo.time,
                tick = Math.floor((bct % combo.interval) / game.tick) * game.tick;

            for(var i = combo.bulletIndex; i < combo.bulletCount; i++) {

                var bullet = combo.bullets[i];
                if (tick === bullet.at) {

                    // Calculate intermediate values of the combo
                    var r = combo.r + combo.rps * bct,
                        speed = combo.speed + bullet.speed;

                    r = r * (180 / Math.PI);

                    bulletPool.add(bullet.type, combo.x, combo.y, speed,
                                r + getValue(bullet.data, 'r', 0),
                                getValue(bullet.data, 'dr', 0),
                                getValue(bullet.data, 'di', 0));

                    combo.bulletIndex = i + 1;
                    if (combo.bulletIndex >= combo.bulletCount) {
                        combo.bulletIndex = 0;
                    }

                }

            }

            return combo.duration > 0 && t - combo.time > combo.duration;
        }

    };

    var comboPool = new ObjectPool(game, count, Combo);

    return {

        add: function(type, x, y, speed, r, dr, di) {

            var data = BulletComboTypes[type];
            di = (di || 0) + getValue(data, 'di', 0);
            dr = toRadian(dr || 0) + getValue(data, 'dr', 0); // overwrite in data during load later to speed up this

            return comboPool.add({

                data: data,
                r: (r || 0) + getValue(data, 'r', 0),
                speed: (speed || 0) + getValue(data, 'speed', 0),
                x: x + Math.sin(dr) * di,
                y: y + Math.cos(dr) * di,
                rps: getValue(data, 'rps', 0)

            });

        },

        update: function(t) {
            comboPool.update(t);
        }

    };

}

