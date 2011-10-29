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
var ShipObject = Class(function(pool) {
    Super(pool);

}, {

    create: function(t, p) {

        this.x = p.x;
        this.y = p.y;
        this.angle = 0;

        this.scaleX = (p.scaleX || 5);
        this.scaleY = (p.scaleY || 1);

        Super.create(t, p);

    },

    update: function(t) {
        Super.update(t);
    },

    destroy: function(t) {
        Super.remove(t);
    }

}, CollideMeshObject);


// Pool ----------------------------------------------------------------------
// ---------------------------------------------------------------------------
var ShipPool = Class(function(game, max) {

    Super(game, max, ShipObject, 40, new THREE.MeshBasicMaterial({
        color: 0xff0000,
        wireframe: true
    }));

}, {

    create: function(type, x, y) {

        Super.create({
            x: x,
            y: y
        });

    }

}, CollideMeshPool);

