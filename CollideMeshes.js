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
var CollideMeshObject = Class(MeshObject, {

    constructor: function(pool) {

        Super(pool);
        this.obb = new OBB();

        if (DEBUG) {
            this.circle = new THREE.Mesh(pool.meshCircle, pool.circleMaterial)
        }

    },

    create: function(t, p) {

        Super.create(t, p);
        this.obb.setSize(this.size.x, this.size.y);

        if (DEBUG) {
            this.scene.add(this.circle);
            this.circle.scale.x = this.obb.radius / 2;
            this.circle.scale.y = this.obb.radius / 2;
            this.circle.position.z = 0;
        }

    },

    update: function(t) {

        Super.update(t);

        this.obb.transform(this.x, this.y, this.angle);

        if (DEBUG) {
            this.circle.position.x = this.x;
            this.circle.position.y = this.y;
        }

    },

    collision: function(t, other) {
    },

    lineCollision: function(a, b) {
        return this.obb.intersectLine(a, b);
    },

    destroy: function(t) {

        Super.destroy(t);

        if (DEBUG) {
            this.scene.remove(this.circle);
        }

    }

});


// Pool ----------------------------------------------------------------------
// ---------------------------------------------------------------------------
var CollideMeshPool = Class(MeshPool, {

    constructor: function(game, max, type, size, material) {

        Super(game, max, type);

        this.meshMaterial = material || new THREE.MeshBasicMaterial({
            color: 0x0000ff,
            wireframe: true
        });

        this.meshPlane = new THREE.PlaneGeometry(size, size);
        this.meshSize = size;
        this.scene = game.scene;

        if (DEBUG) {

            this.circleMaterial = new THREE.MeshBasicMaterial({
                color: 0x000000,
                wireframe: true
            });

            this.meshCircle = new THREE.SphereGeometry(1, 4, 4);

        }

    },

    collide: function(otherPool) {

        var a = this.getActive(),
            b = otherPool.getActive();

        for(var i = 0, l = a.length; i < l; i++) {

            var ao = a[i];
            for(var e = 0, el = b.length; e < el; e++) {

                var bo = b[e];

                if (ao.obb.overlaps(bo.obb)) {
                    ao.collision(this.time, bo);
                    bo.collision(this.time, ao);
                }

            }

        }

    }

});


// Collision Detection -------------------------------------------------------
// ---------------------------------------------------------------------------
function OBB() {

    this.w = 10;
    this.h = 10;
    this.axis = [];
    this.origin = [];
    this.invalidAxis = true;

    this.x = 0;
    this.y = 0;
    this.radius = 10;

}

OBB.prototype = {

    setSize: function(w, h) {

        // TODO Tweak this later :)
        this.w = w / 2;
        this.h = h / 2;
        this.invalidAxis = true;
        this.radius = Math.max(w, h) * 1.5;

    },

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

                t = corner[c][0] * b[0] + corner[c][1] * b[1];

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

    transform: function(x, y, angle) {

        if (angle !== this.angle) {

            var Xx =  Math.cos(angle) * this.w, Xy = Math.sin(angle) * this.w,
                Yx = -Math.sin(angle) * this.h, Yy = Math.cos(angle) * this.h;

            this.corner = [[x - Xx - Yx, y - Xy - Yy],
                           [x + Xx - Yx, y + Xy - Yy],
                           [x + Xx + Yx, y + Xy + Yy],
                           [x - Xx + Yx, y - Xy + Yy]];

            this.angle = angle;

            this.x = x;
            this.y = y;
            this.invalidAxis = true;

        } else if (this.x !== x || this.y !== y) {

            var corner = this.corner,
                centroid = [(corner[0][0] + corner[1][0] + corner[2][0] + corner[3][0]) / 4,
                            (corner[0][1] + corner[1][1] + corner[2][1] + corner[3][1]) / 4];

            var translation = [x - centroid[0], y - centroid[1]];
            for(var c = 0; c < 4; ++c) {
                corner[c][0] += translation[0];
                corner[c][1] += translation[1];
            }

            this.x = x;
            this.y = y;
            this.invalidAxis = true;

        }

    },

    overlaps: function(other) {

        var dx = this.x - other.x,
            dy = this.y - other.y;

        dx *= dx;
        dy *= dy;

        var rr = this.radius + other.radius;
        rr *= rr;

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

    },

    intersectLine: function(la, lb) {

        if (this.invalidAxis) {
            this.computeAxis();
        }

        var t = tMin = 10000000, intersects = false;
        for(var c = 0; c < 4; ++c) {

            var a = this.corner[c],
                b = this.corner[c < 3 ? c + 1 : 0]

            // Get the intersection distance
            var t = intersectSegment(la, lb, a, b);

            if (t !== -1) {

                intersects = true;

                if (t < tMin) {
                    tMin = t;
                }

            }

        }

        if (intersects) {
            return tMin;

        } else {
            return -1;
        }

    }

};

function triangleArea(a, b, c) {
    return (a[0] - c[0] ) * (c[1] - b[1]) - (c[1] - a[1]) * (b[0] - c[0]);
}

function intersectPoint(a, b, c, d) {

    var B = [b[0] - a[0], b[1] - a[1]],
        C = [c[0] - a[0], c[1] - a[1]],
        D = [d[0] - a[0], d[1] - a[1]];

    var distAB = Math.sqrt(B[0] * B[0] + B[1] * B[1]);

    var cos = B[0] / distAB,
        sin = B[1] / distAB;

    var newX = C[0] * cos + C[1] * sin;
    C[1] = C[1] * cos - C[0] * sin;
    C[0] = newX;

    var newX = D[0] * cos + D[1] * sin;
    D[1] = D[1] * cos - D[0] * sin;
    D[0] = newX;

    return D[0] + (C[0] - D[0]) * D[1] / (D[1] - C[1]);

};

function intersectSegment(a, b, c, d) {

    var a1 = triangleArea(a, b, d),
        a2 = triangleArea(a, b, c);

    if (a1 * a2 < 0) {

        var a3 = triangleArea(c, d, a),
            a4 = a3 + a2 - a1;

        if (a3 * a4 < 0) {
            return intersectPoint(a, b, c, d);
        }

    }

    return -1;

}

