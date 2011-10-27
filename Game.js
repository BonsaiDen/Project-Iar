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
var Game = (function() {

    var game = {

        scene: null,
        rect: { l: 0, r: 0, t: 0, b: 0 },
        width: 0,
        height: 0,
        paused: false,
        fps: 0,
        tick: 0

    };

    var element = null,
        renderer = null,
        scene = null,
        camera = null,
        bullets = null,
        combos = null;

    var gameTime = 0,
        lastUpdate = 0,
        browserTime = 0;

    function init(elementId, width, height, fps) {

        // Size
        game.width = width;
        game.height = height;
        game.fps = fps || 60;
        game.tick = Math.floor(1000 / game.fps);

        var rect = game.rect;
        rect.l = -(width / 2);
        rect.r = (width / 2);
        rect.t = height;
        rect.b = 0;

        // Rendering
        renderer = new THREE.WebGLRenderer();
        renderer.setSize(width, height);

        game.scene = scene = new THREE.Scene();
        camera = new THREE.OrthographicCamera(rect.l, rect.r, rect.t, rect.b, 1, 100);
        camera.position.z = 5;

        // DOM canvas stuff
        element = document.getElementById(elementId);
        element.appendChild(renderer.domElement);

        // Initiate modules
        bullets = new BulletPool(game, 500);
        combos = new ComboPool(game, 50, bullets);

        combos.add('rays', 0, 300);
//        combos.add('rays', 0, 300, 0, 180);

        // Loops
        renderLoop();

        lastUpdate = Date.now();
        setInterval(updateLoop, game.tick);

    }

    function updateLoop() {

        var now = Date.now();

        // Add difference to browserTime
        if (!game.paused) {

            browserTime += now - lastUpdate;
            while(gameTime < browserTime) {
                gameTime += game.tick;
                update();
            }

        }

        lastUpdate = Date.now();

    }

    function update() {

        combos.update(gameTime);
        bullets.update(gameTime);

    }

    function renderLoop() {
        requestAnimFrame(renderLoop, element);
        renderer.render(scene, camera);
    }

    return {

        init: init,

        pause: function() {
            game.paused = true;
        },

        resume: function() {
            game.paused = false;
        }

    };

})();

