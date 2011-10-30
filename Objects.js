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
var PoolObject = Class(function(pool) {

}, {

    create: function(t, p) {
    },

    update: function(t) {
    },

    destroy: function(t) {
        this._destroyed = true;
    }

});


// Pool ----------------------------------------------------------------------
// ---------------------------------------------------------------------------
var ObjectPool = Class(function(game, max, type) {

    this.game = game;
    this.type = type;
    this.time = 0;

    this.max = max;
    this.used = 0;
    this.created = 0;

    this.objects = [];
    this.active = [];

}, {

    create: function(params) {

        // Create new instances on the fly
        if (this.used === this.created && this.created < this.max) {

            var o = new this.type(this);

            this.objects.push(o);

            this.created++;

        }

        for(var i = 0, l = this.created; i < l; i++) {

            var obj = this.objects[i];
            if (!obj._used) {

                this.used++;
                obj._used = true;
                obj._destroyed = false;
                obj._time = this.time;

                obj.create(0, params);
                this.active.push(obj);

                return obj;

            }

        }

    },

    update: function(t) {

        this.time = t;

        var removed = [];
        for(var i = 0, l = this.active.length; i < l; i++) {

            var obj = this.active[i];
            if (!obj._destroyed) {
                obj.update(this.time - obj._time);
            }

            if (obj._destroyed) {
                this.used--;
                obj._used = false;
                this.active.splice(i, 1);
                l--;
                i--;
            }

        }

    },

    getActive: function() {
        return this.active;
    },

    info: function() {
        return '[ ' + this.used + 'used of ' + this.created +' (' + this.max + 'max) ]';
    }

});

