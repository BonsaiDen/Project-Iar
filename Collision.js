// Collision Managment ========================================================
// ============================================================================
var Collisions = (function() {

    // We have are divides in groups here:
    // bullets and ships
    // for which we keep 2 lists each

    // TODO do ray casting for lasers!!


    // http://www.flipcode.com/archives/2D_OBB_Intersection.shtml
    function OBB(center, w, h, angle) {

        this.w = w / 2;
        this.h = h / 2;
        this.axis = [];
        this.origin = [];
        this.transform(center, angle);

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

            this.computeAxis();

        },

        rotate: function() {

        },

        overlaps: function(other) {
            return this.overlapsOne(other) && other.overlapsOne(this);
        }

    }

    var a = { x:-26, y: 0 },
        b = { x: 25, y: 20 },
        c = { x: 40, y: 40 },
        f = { x: 40, y: -10 }

    var ao = new OBB(a, 50, 50, 0),
        bo = new OBB(b, 50, 50, 0),
        co = new OBB(c, 50, 50, 0);
        fo = new OBB(f, 50, 50, 0);

    console.log(ao.overlaps(bo));
    console.log(bo.overlaps(co));
    console.log(fo.overlaps(co));

})();

