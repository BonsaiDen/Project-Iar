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

function Game() {

    this.element = null;
    this.debugElement = null;
    this.scene = null;
    this.renderer = null;
    this.scene = null;

    this.running = false;
    this.paused = false;
    this.lastUpdate = false;
    this.browserTime = 0;
    this.gameTime = 0;

    this.rect = {
        l: 0, r: 0,
        t: 0, b: 0
    };

    this.width = 0;
    this.height = 0;
    this.fps = 0;
    this.tick = 0;

}

Game.prototype = {

    init: function(element, width, height, fps) {

        this.width = width;
        this.height = height;
        this.fps = fps || 60;
        this.tick = Math.floor(1000 / this.fps);
        this.element = element;

        var rect = this.rect;
        rect.l = -(width / 2);
        rect.r = (width / 2);
        rect.t = height;
        rect.b = 0;

        this.initRendering();
        this.initPools();
        this.playerCombos.create('rays', 0, 300);
        this.enemies.create('player', 0, 500);

    },

    initPools: function() {

        this.player = new ShipPool(this, 1);
        this.enemies = new ShipPool(this, 20);

        this.playerBullets = new BulletPool(this, 500);
        this.enemyBullets = new BulletPool(this, 500);

        this.playerCombos = new ComboPool(this, 10, this.playerBullets);
        this.enemyCombos = new ComboPool(this, 50, this.enemyBullets);

    },

    initRendering: function() {

        // Rendering
        this.renderer = new THREE.WebGLRenderer();
        this.renderer.setSize(this.width, this.height);
        this.scene = new THREE.Scene();

        // Map camera so that 0 is at the bottom of the screen and +x is on the right
        this.camera = new THREE.OrthographicCamera(this.rect.l, this.rect.r,
                                                   this.rect.t, this.rect.b, 1, 100);

        this.camera.position.z = 5;

        // DOM canvas stuff
        this.element.appendChild(this.renderer.domElement);

        // Render loop creation
        var that = this;
        this.renderLoop = function renderLoop() {

            requestAnimFrame(renderLoop, that.element);
            that.renderer.render(that.scene, that.camera);

        };

    },

    run: function() {

        if (!this.running) {

            this.renderLoop();
            this.lastUpdate = Date.now();

            var that = this,
                runner = setInterval(function() {

                    if (!that.running) {
                        clearInterval(runner);
                        return;
                    }

                    that.updateLoop();

                }, this.tick);

            this.running = true;

        }

    },

    pause: function() {
        this.paused = true;
    },

    resume: function() {
        this.paused = false;
    },

    stop: function() {
        this.running = false;
    },

    debug: function(element) {
        this.debugElement = element;
    },

    updateLoop: function() {

        var now = Date.now();

        // Add difference to browserTime
        if (!this.paused) {

            // Ensure that throttling of intervals and other things does not effect framerate
            this.browserTime += now - this.lastUpdate;
            while(this.gameTime < this.browserTime) {

                this.gameTime += this.tick;

                var before = Date.now();
                this.player.update(this.gameTime);
                this.playerCombos.update(this.gameTime);
                this.playerBullets.update(this.gameTime);

                this.enemies.update(this.gameTime);
                this.enemyCombos.update(this.gameTime);
                this.enemyBullets.update(this.gameTime);

//                this.enemies.collide(this.playerBullets);
                this.upateTook = Date.now() - before;

            }

        }

        if (this.debugElement) {
            this.debugElement.textContent = 'Time: ' + this.gameTime + ' / ' + this.tick + ' | ' + '~' + this.upateTook + 'ms per Frame';
        }

        this.lastUpdate = Date.now();

    },

    renderLoop: function() {
    }

};


function Iar(id, w, h, debug) {
    var game = new Game();
    game.init(document.getElementById(id), w, h);
    game.run();
    game.debug(document.getElementById(debug));
};


// Utils ---------------------------------------------------------------------
// ---------------------------------------------------------------------------
function randint(min, max) {
    return Math.floor(min + (max - min) * Math.random()); // implement seeded pseudo later for replays...
}

function toRadian(r) {
    return r / 180 * Math.PI;
}

function getValue(data, key, def) {

    var value = data[key]
    if (value === undefined) {
        return def;

    } else if (typeof value === 'number') {
        return value;

    } else {

        if (value[0] === 'r') {
            return randint(value[1], value[2])

        } else if (value[0] === 'l') {
            return value.slice(1);

        } else {
            return value[randint(0, value.length)];
        }

    }

}

window.requestAnimFrame = (function() {

    return window.requestAnimationFrame ||
            window.webkitRequestAnimationFrame ||
            window.mozRequestAnimationFrame ||
            window.oRequestAnimationFrame ||
            window.msRequestAnimationFrame ||
            function(/* function */ callback, /* DOMElement */ element) {
                window.setTimeout(callback, 1000 / 60);
            };

})();


