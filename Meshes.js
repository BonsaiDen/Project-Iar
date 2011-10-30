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

        this.mesh.position.x = this.x;
        this.mesh.position.y = this.y;
        this.mesh.scale.x = this.size.x / this.mesh.size;
        this.mesh.scale.y = this.size.y / this.mesh.size;

        this.scene.add(this.mesh);

    },

    update: function(t) {

        this.mesh.position.x = this.x;
        this.mesh.position.y = this.y;
        this.mesh.rotation.z = this.angle;

        Super.update(t);

    },

    destroy: function(t) {
        this.scene.remove(this.mesh);
        Super.destroy(t);
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

}, ObjectPool);

