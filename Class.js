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




/**
  *  EVAL patching Classes supporting fast Super() calls
  *  this keeps the code a lot cleaner and faster than it would be without this magic
  */

function Class(base, props) {

    if (typeof base !== 'function') {
        props = base;
        base = null;
    }

    var level = 0;
    if (base) {

        level = base.$$level + 1;

        // Patch in required super calls
        for(var i in props) {

            if (props.hasOwnProperty(i) && typeof props[i] === 'function') {

                var code = props[i].toString(),
                    superMethod = /\WSuper\./.test(code),
                    superCtor = /\WSuper\(/.test(code);

                if (superMethod || superCtor) {

                    code = code.replace(/\WSuper\./g, 'this.$$$$_super_' + level + '_');
                    code = code.replace(/\WSuper\(/g, 'this.$$$$_super_' + level + '_constructor(');

                    props[i] = eval('(' + code +')');

                }

            }

        }

    }

    // We assign this here so that we don't inherit constructors
    // Which would break alot of stuff
    var ctor;
    if (props.hasOwnProperty('constructor') && typeof props.constructor === 'function') {
        ctor = props.constructor;

    } else {
        ctor = function() {};
    }

    ctor.$$level = level;

    if (base) {

        // Iterate over the base class and check for "super" methods
        for(var i in base.prototype) {

            if (i.substr(0, 3) !== '$$_') {

                if (base.prototype.hasOwnProperty(i)) {
                    props['$$_super_' + level + '_' + i] = base.prototype[i];
                }

            }

                if (!props.hasOwnProperty(i)) {
                    props[i] = base.prototype[i];
                }


        }

    }

    ctor.prototype = props;

    return ctor;

}


//function Class(ctor, methods, base) {
//
//    var level = (base && base.__level || 0) + 1;
//    if (ctor.toString().indexOf('Super') !== -1) {
//        ctor = eval('(' + ctor.toString().replace(/Super/g, 'this.Super_' + level) + ')');
//    }
//
//    ctor.__constructor = ctor;
//    ctor.__level = level;
//
//    // Map base super
//    methods['Super_' + level] = base ? base.__constructor : null;
//
//    // Add methods and patch in super calls
//    if (base) {
//
//        for(var i in base.prototype) {
//
//            if (base.prototype.hasOwnProperty(i)) {
//
//                if (methods.hasOwnProperty(i)) {
//
//                    var sup = 'super' + level + '_';
//                    methods[sup + i]  = base.prototype[i];
//
//                    if (methods[i].toString().indexOf('Super.') !== -1) {
//                        methods[i] = eval('(' + methods[i].toString().replace(/Super\./g, 'this.' + sup) + ')');
//                    }
//
//                } else {
//                    methods[i] = base.prototype[i];
//                }
//
//            }
//        }
//
//    } else {
//        ctor.__level = 0;
//    }
//
//    ctor.prototype = methods;
//    return ctor;
//
//}
//
//var Kitten = Class(function() {
//
//
//}, {
//
//
//
//});


