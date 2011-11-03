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
            this.circle = new THREE.Mesh(pool.meshCircle, pool.circleMaterial);
            this.box = new THREE.Mesh(pool.meshPlane, pool.boxMaterial);
        }

    },

    create: function(t, p) {

        Super.create(t, p);
        this.updateSize();

        // Correction times for fast moving objects
        this.lastTime = t;
        this.timeDiff = 0;

        if (DEBUG) {
            this.scene.add(this.circle);
            this.scene.add(this.box);
        }

    },

    updateSize: function() {

        this.obb.setSize(this.size.x, this.size.y);

        // Make sure to update right away
        this.obb.transform(this.x, this.y, -this.angle);

        if (DEBUG) {
            this.circle.scale.x = this.obb.radius / 2;
            this.circle.scale.y = this.obb.radius / 2;
            this.circle.position.z = -2;
            this.box.scale.x = this.size.x / this.mesh.size;
            this.box.scale.y = this.size.y / this.mesh.size;
            this.box.position.z = -1;
        }

        Super.updateSize();

    },

    update: function(t) {

        Super.update(t);

        // Do a lot of stuff to adjust the OBB based on the object's speed
        // (this extends the OBB *behind* the object so that it matches up with the speed)
        var td = t - this.lastTime;
        this.lastTime = t;

        // Only adjust obb scaling in case we move more than size.y
        var v = (this.speed * td) - this.size.y;
        if (v > this.size.y) {

            var dx = Math.sin(this.angle) * v * 0.5,
                dy = Math.cos(this.angle) * v * 0.5;

            // This extrudes the OBB with the inverted velocity of the object
            if (td !== this.timeDiff) {

                this.timeDiff = td;
                this.obb.setSize(this.size.x, this.size.y + v);

                // Adjust the bounding circle
                if (DEBUG) {
                    this.circle.scale.x = this.obb.radius / 2;
                    this.circle.scale.y = this.obb.radius / 2;
                    this.box.scale.y = (this.size.y + v) / this.mesh.size;
                }

            }

            this.obb.transform(this.x - dx, this.y - dy, -this.angle);

        } else {
            this.obb.transform(this.x, this.y, -this.angle);
        }

        // Adjust positions of bounding things
        if (DEBUG) {
            this.circle.position.x = this.obb.x;
            this.circle.position.y = this.obb.y;
            this.box.position.x = this.obb.x;
            this.box.position.y = this.obb.y;
            this.box.rotation.z = this.mesh.rotation.z;
        }

    },

    obbCollision: function(t, other) {
    },

    lineCollision: function(dist, other) {
    },

    destroy: function(t) {

        Super.destroy(t);

        if (DEBUG) {
            this.scene.remove(this.circle);
            this.scene.remove(this.box);
        }

    }

});


// Pool ----------------------------------------------------------------------
// ---------------------------------------------------------------------------
var CollideMeshPool = Class(MeshPool, {

    constructor: function(game, max, type, size, material) {

        Super(game, max, type);

        this.meshMaterial = material || new THREE.MeshBasicMaterial({
            color: 0xffffff,
            wireframe: false
        });

        this.meshPlane = new THREE.PlaneGeometry(size, size);
        this.meshSize = size;
        this.scene = game.scene;

        if (DEBUG) {

            this.circleMaterial = new THREE.MeshBasicMaterial({
                color: 0x000000,
                wireframe: true
            });

            this.boxMaterial = new THREE.MeshBasicMaterial({
                color: 0x0000ff,
                wireframe: true,
                wireframeLinewidth: 3
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
                    ao.obbCollision(this.time, bo);
                    bo.obbCollision(this.time, ao);
                }

            }

        }

    },

    // Collide all objects in this pool with a line based on there Y size and angle
    // with the OBBs in another pool
    // the collision with the minimum distance is then provided to the collisionLine method of the object within this pool
    collideLines: function(otherPool) {

        var a = this.getActive(),
            b = otherPool.getActive();

        for(var i = 0, l = a.length; i < l; i++) {

            var ao = a[i];
            for(var e = 0, el = b.length; e < el; e++) {

                var bo = b[e];

                // Use the original point where the laser starts, not the current object location
                var dist = ao.obb.overlapsLine(bo.obb, ao.ox, ao.oy, ao.angle, ao.length);
                if (dist !== -1) {
                    ao.lineCollision(dist, bo);
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
    this.invalidSize = true;

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
        this.invalidSize = true;
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

        if (angle !== this.angle || this.invalidSize) {

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
            this.invalidSize = false;

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

    overlapsLine: function(other, x, y, angle, length) {

        var ex = Math.sin(angle) * length,
            ey = Math.cos(angle) * length;

        return other.intersectLinePoints([x, y], [x + ex, y + ey]);

    },

    intersectLinePoints: function(la, lb) {

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

    var bx = b[0] - a[0],
        by = b[1] - a[1],

        cx = c[0] - a[0],
        cy = c[1] - a[1],

        dx = d[0] - a[0],
        dy = d[1] - a[1];

    var distAB = Math.sqrt(bx * bx + by * by);

    var cos = bx / distAB,
        sin = by / distAB;

    var newX = cx * cos + cy * sin;
    cy = cy * cos - cx * sin;
    cx = newX;

    var newX = dx * cos + dy * sin;
    dy = dy * cos - dx * sin;
    dx = newX;

    var ABpos = dx + (cx - dx) * dy / (dy - cy);

    if (ABpos < 0 || ABpos > distAB) {
        return -1;
    }

    return ABpos;

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


//console.log(intersectSegment([0, 0], [100, 0], [50, 10], [50, -5]))

//function eucd(dx, dy) {
//
//    if (dx < 0) {
//        dx = -dx;
//    }
//
//    if (dy < 0) {
//        dy = -dy;
//    }
//
//    var min, max;
//    if (dx < dy) {
//        min = dx;
//        max = dy;
//
//    } else {
//        min = dy;
//        max = dx;
//    }
//
//    // coefficients equivalent to ( 123/128 * max ) and ( 51/128 * min )
//    return ((( max << 8 ) + ( max << 3 ) - ( max << 4 ) - ( max << 1 ) +
//             ( min << 7 ) - ( min << 5 ) + ( min << 3 ) - ( min << 1 )) >> 8 );
//
//}
//
//
//function eucd2(dx, dy) {
//
//    if (dx < 0) {
//        dx = -dx;
//    }
//
//    if (dy < 0) {
//        dy = -dy;
//    }
//
//    var min, max;
//    if (dx < dy) {
//       min = dx;
//       max = dy;
//
//    } else {
//       min = dy;
//       max = dx;
//    }
//
//    var approx = (max * 1007) + (min * 441);
//    if (max < (min << 4)) {
//       approx -= (max * 40);
//    }
//
//    console.log(approx);
//    // add 512 for proper rounding
//    return ((approx + 512) >> 10);
//}
//
//for(var i = 0; i < 100; i++) {
//
//    var d = Math.sqrt(10 * 10 + i * i),
//        b = eucd(10, i),
//        c = eucd2(10, i);
//
//    console.log(d - b, d - c);
//
//}
//
//
//
