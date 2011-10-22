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
        camera = null;

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
        BulletCombos.init(game);
        Bullets.init(game, 500); // pool of 500 bullets

        BulletCombos.spawn('rays', 0, 300);

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

        BulletCombos.update(gameTime);
        Bullets.update(gameTime);

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


//(function() {
//
//    var bullets = [],
//        active = [],
//        material = new THREE.MeshLambertMaterial({
//            color: 0xffffff
//        }),
//        scene = null,
//        time = 0,
//        minX = 0,
//        minY = 0,
//        maxX = 0,
//        maxY = 0;
//
//    window.Bullets = {
//
//        init: function(s, count, minx, maxx, maxy, miny) {
//
//            minX = minx;
//            minY = miny;
//            maxX = maxx;
//            maxY = maxy;
//
//            var plane = new THREE.PlaneGeometry(-20, -20, 20, 20);
//            for(var i = 0, l = count; i < l; i++) {
//
//                bullets.push({
//                    used: false,
//                    index: i,
//                    mesh: new THREE.Mesh(plane, material)
//                });
//
//            }
//
//            scene = s;
//
//        },
//
//        get: function() {
//
//            for(var i = 0, l = bullets.length; i < l; i++) {
//                if (!bullets[i].used) {
//                    bullets[i].used = true;
//                    return bullets[i];
//                }
//            }
//
//        },
//
//        spawn: function(x, y, w, h, degrees, speed, rps) {
//
//            speed = speed || 5;
//            speed = speed / 100;
//            w = w || 1;
//            g = h || 1;
//            rps = rps ? rps * (Math.PI * 2 / 1000) : 0;
//
//            degrees = degrees || 0;
//            degrees = (degrees / 180 * Math.PI);
//            degrees -= Math.PI / 2;
//
//            degrees = -degrees;
//
//            var b = Bullets.get();
//            if (!b) {
//                return;
//            }
//
//            b.mesh.position.x = x || 0;
//            b.mesh.position.y = y || 0;
//            b.mesh.scale.x = w;
//            b.mesh.scale.y = h;
//
//            b.degrees = degrees || 0;
//            b.speed = speed ;
//            b.ox = x || 0;
//            b.oy = y || 0;
//            b.sx = 20 * w;
//            b.sy = 20 * h;
//            b.rps = rps;
//
//            b.time = time;;
//
//            active.push(b);
//            scene.add(b.mesh);
//
//            return b;
//
//        },
//
//        update: function(t) {
//
//            time = t;
//            for(var i = 0, l = active.length; i < l; i++) {
//
//                var b = active[i],
//                    bt = t - b.time,
//                    ox = Math.cos(b.degrees) * b.speed * bt,
//                    oy = Math.sin(b.degrees) * b.speed * bt;
//
//                var x = b.ox + ox,
//                    y = b.oy + oy;
//
//                b.mesh.position.x = x;
//                b.mesh.position.y = y;
//                b.mesh.rotation.z = b.rps * bt;
//
//                // Out of bounds
//                if (x < minX - b.sx || x > maxX + b.sx || y < minY - b.sy || y > maxY + b.sy) {
//                    active.splice(i, 1);
//                    scene.remove(b.mesh);
//                    b.used = false;
//                    i--;
//                    l--;
//                }
//
//            }
//
//        }
//
//    };
//
//})();
//
//(function() {
//
//    var waves = [],
//        time = 0;
//
//    window.BulletWaves = {
//
//        spawn: function(type, x, y, degrees, lifeTime) {
//
//            waves.push({
//                type: type,
//                x: x || 0,
//                y: y || 0,
//                degrees: degrees || 0,
//                lifeTime: lifeTime || 0,
//                time: time,
//                lastTime: time - type.interval
//            });
//
//        },
//
//        update: function(t) {
//
//            time = t;
//            for(var i = 0, l = waves.length; i < l; i++) {
//
//                var w = waves[i];
//                if (w.lifeTime > 0 && time - w.time > w.lifeTime) {
//                    waves.splice(i, l);
//                    i--;
//                    l--;
//                    continue;
//                }
//
//                if (time > w.lastTime + w.type.interval) {
//                    w.type(w.x, w.y, w.degrees);
//
//                    var overdue = (time - w.lastTime) - w.type.interval;
//                    w.lastTime = time - overdue;
//                }
//
//
//            }
//
//        }
//
//    };
//
//})();
//
//
//(function() {
//
//    var scene = null,
//        camera = null,
//        renderer = null,
//        width = 0,
//        height = 0,
//        element = null,
//        time = 0,
//        lastUpdate = 0,
//        updateTime = 0;
//
//    window.Game = {
//
//        start: function(id, w, h) {
//
//            width = width;
//            height = height;
//            renderer = new THREE.WebGLRenderer();
//            camera = new THREE.OrthographicCamera(-(w / 2), w / 2, h, 0, 400, 1000);
//            scene = new THREE.Scene();
//            camera.position.z = 500;
//
//            renderer.setSize(w, h);
//
//            element = document.getElementById(id);
//            element.appendChild(renderer.domElement);
//            renderer.domElement.tabIndex = 1;
//
//            Bullets.init(scene, 300, -(w / 2), w / 2, h, 0);
//
//            function TestWave(x, y, r) {
//                Bullets.spawn(x, y, 1, 1, ((Math.random() * 40) - 20) + r, 20, 1);
//                Bullets.spawn(x, y, 1, 1, r + 10, 20, -1);
//                Bullets.spawn(x, y, 1, 1, r - 10, 20, 1);
//            };
//            TestWave.interval = 500;
//
//            BulletWaves.spawn(TestWave, 0, 0, 0, 2000);
//
//            Game.paused = false;
//            Game.renderLoop();
//
//            lastUpdate = Date.now();
//            setInterval(Game.updateLoop, 16);
//
//        },
//
//    };
//
//})();
//
