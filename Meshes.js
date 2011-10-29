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
var MeshObject = Class(function(pool) {

    this.mesh = new THREE.Mesh(pool.meshPlane, pool.meshMaterial)
    this.mesh.size = pool.meshSize;
    this.scene = pool.scene;

}, {

    create: function(t, params) {
        this.scene.add(this.mesh);
    },

    destroy: function(t) {
        this.scene.remove(this.mesh);
    }

}, PoolObject);



// Pool ----------------------------------------------------------------------
// ---------------------------------------------------------------------------
var MeshPool = Class(function(game, max, type, size, material) {

    Super(game, max, type);

    this.meshMaterial = material || new THREE.MeshBasicMaterial({
        color: 0xffffff,
        wireframe: true
    });

    this.meshPlane = new THREE.PlaneGeometry(size, size);
    this.meshSize = size;
    this.scene = game.scene;

}, {

    collide: function(otherPool) {
        console.log(pool.getActive(), 'vs', otherPool.getActive());
    }

}, ObjectPool);



// Collision Detection -------------------------------------------------------
// ---------------------------------------------------------------------------
function OBB(w, h) {

    this.w = w / 2;
    this.h = h / 2;
    this.axis = [];
    this.origin = [];
    this.invalidAxis = true;

    this.x = 0;
    this.y = 0;
    this.radius = Math.max(w, h);

}

OBB.prototype = {

    computeAxis: function() {

        var axis = this.axis,
            corner = this.corner,
            c = corner[0];

        axis[0] = [corner[1][0] - c[0], corner[1][1] - c[1]];
        axis[1] = [corner[3][0] - c[0], corner[3][1] - c[1]];

        for(var i = 0; i < 2; ++i) {

            var a = axis[i],
                length = a[0] * a[0] + a[1] * a[1];

            a[0] /= length;
            a[1] /= length;

            this.origin[i] = c[0] * a[0] + c[1] * a[1];

        }

        this.invalidAxis = false;

    },

    overlapsOne: function(other) {

        var corner = other.corner,
            axis = this.axis,
            e = corner[0];

        for(var a = 0; a < 2; ++a) {

            var b = axis[a],
                tMin = tMax = t = e[0] * b[0] + e[1] * b[1];

            for(var c = 1; c < 4; ++c) {

                t = corner[c][0] * b[0] + corner[c][0] * b[1];

                if (t < tMin) {
                    tMin = t;

                } else if (t > tMax) {
                    tMax = t;
                }

            }

            if ((tMin > 1 + this.origin[a]) || (tMax < this.origin[a])) {
                return false;
            }

        }

        return true;

    },

    transform: function(center, angle) {

        if (angle !== this.angle) {

            var Xx =  Math.cos(angle) * this.w, Xy = Math.sin(angle) * this.w,
                Yx = -Math.sin(angle) * this.h, Yy = Math.cos(angle) * this.h;

            this.corner = [[center.x - Xx - Yx, center.y - Xy - Yy],
                           [center.x + Xx - Yx, center.y + Xy - Yy],
                           [center.x + Xx + Yx, center.y + Xy + Yy],
                           [center.x - Xx + Yx, center.y - Xy + Yy]];

            this.angle = angle;

        } else {

            var corner = this.corner;
            var centroid = [(corner[0][0] + corner[1][0] + corner[2][0] + corner[3][0]) / 4,
                            (corner[0][1] + corner[1][1] + corner[2][1] + corner[3][1]) / 4];

            var translation = [center.x - centroid[0], center.y - centroid[1]];
            for(var c = 0; c < 4; ++c) {
                corner[c][0] += translation[0];
                corner[c][1] += translation[1];
            }

        }

        this.x = center.x;
        this.y = center.y;
        this.invalidAxis = true;

    },

    overlaps: function(other) {

        var dx = this.x - other.x,
            dy = this.y - other.y;

        dx *= dx;
        dy *= dy;

        var rr = this.radius * other.radius;
        if (dx + dy <= rr) {

            if (this.invalidAxis) {
                this.computeAxis();
            }

            if (other.invalidAxis) {
                other.computeAxis();
            }

            return this.overlapsOne(other) && other.overlapsOne(this);

        } else {
            return false;
        }

    }

};


//    // TODO do ray casting for lasers!!
//    function collideGroups(a, b, func) {
//
//        for(var i = 0, l = a.length; i < l; i++) {
//
//            for(var e = 0, el = b.length; e < el; e++) {
//
//                if (a[i].overlaps(b[e])) {
//                    func(a, b);
//                }
//
//            }
//
//        }
//
//    }
//
