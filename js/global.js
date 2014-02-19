/**
 * Created by Граф on 13.01.14.
 */
var isWebglSupported = ( function () {
    try {
        var canvas = document.createElement('canvas');
        return !! window.WebGLRenderingContext && ( canvas.getContext('webgl') || canvas.getContext('experimental-webgl') );
    } catch( e ) {
        return false;
    }
})();

var memoize = function(func) {
    var memo = {},
        hasher,
        key,
        value;

    return function() {
        key = arguments[0];
        value = memo[key];
        return value ? value : (memo[key] = func.apply(this, arguments));
    };
};

var round = function(digit, precision) {
    var precision = Math.pow(10, precision);
    return Math.ceil(digit * precision) / precision;
};

var calcDistance = function(x1, y1, x2, y2) {
    var dx = x2 - x1,
        dy = y2 - y1;

    return Math.sqrt(dx * dx + dy * dy);
};

var events = {
    on: function (name, fn, context) {
        if (!this.events) {
            this.events = {};
        }

        var events = name.split(' '),
            event;

        for (var i = 0, len = events.length; i < len; i++) {
            name = events[i];

            if (!this.events[name]) {
                this.events[name] = [];
            }

            this.events[name].push({
                fn: fn,
                context: context || this
            });
        }

        return this;
    },
    off: function(name, fn) {
        var that = this,
            eventsGroup,
            curName,
            names = name ? name.split(" ") : _.keys(this.events),
            events = this.events;


        for (var k = 0, len = names.length; k < len; k++) {
            curName = names[k];

            if (!fn) {
                delete events[curName];
                continue;
            }

            if ((eventsGroup = events[curName])) {
                for (var i = 0, len = eventsGroup.length; i < len; i++){
                    if (fn && eventsGroup[i].fn === fn) {
                        eventsGroup.splice(i, 1);
                    }
                }
            }
        }
    },
    trigger: function(name) {
        var handlers,
            handler,
            events = this.events;

        if (!events || !(handlers = events[name]))
            return;

        for (var i = 0, len = handlers.length; i < len; i++) {
            handler = handlers[i];
            handler.fn.apply(handler.context || this, [].slice.call(arguments, 1));
        }
    }

};


var PointerEvaluator = function() {
    var that = this,
        prevX = 0,
        prevY = 0;

    this.x = 0;
    this.y = 0;
    this.startX = 0;
    this.startY = 0;
    this.currentX = 0;
    this.currentY = 0;
    this.speed = 1;
    this.distance = 0;

    var move = function(e) {
        that.currentX = e.clientX;
        that.currentY = e.clientY;

        var dx = that.currentX - that.startX,
            dy = that.currentY - that.startY;

        that.directionX = dx < 0 ? 'left' : 'right';
        that.directionY = dy < 0 ? 'top' : 'bottom';

        if (Math.abs(dx) > Math.abs(dy)) {
            that.direction = that.directionX;
        } else {
            that.direction = that.directionY;
        }

        that.distance = calcDistance(that.startX, that.startY, that.currentX, that.currentY);
    };

    this.register = function() {
        $(document)
            .on('mousemove', move)
            .on('mousemove', this.onMouseMove)
            .on('mouseup', this.onMouseUp)
            .on('mouseup', this.deregister);
    };

    this.deregister = function() {
        $(document)
            .off('mousemove', move)
            .off('mousemove', this.onMouseMove)
            .off('mouseup', this.onMouseUp)
            .off('mouseup', this.deregister);
    };
};

jQuery.extend(PointerEvaluator.prototype, events, {

    setSpeed: function(speed) {
        this.speed = speed;
    },

    start: function(e) {
        this.startX = e.clientX ? e.clientX : e.x;
        this.startY = e.clientY ? e.clientY : e.y;

        this.register();
    }
});



var DeferredImage = function(url) {
    var that = this,
        image = new Image(),
        loaded = false,
        dfd = jQuery.Deferred();

    image.onload = function() {
        loaded = true;
        dfd.resolve(image);
    };

    image.src = url;

    if (image.complete && !loaded)
        dfd.resolve(image);

    return dfd.promise();
};

function eachRecursive(array, callback) {
    jQuery.each(array, function(key, value) {
        if (jQuery.isArray(value) || typeof value === 'object') {
            eachRecursive(value, callback);
        } else {
            callback(value, key, array);
        }
    })
};

var imageLoader = function(imageUrls, filter) {
    var dfds = [],
        dfd = jQuery.Deferred(),
        images = imageUrls;

    filter || (filter = function(a) {
        return a;
    });

    eachRecursive(images, function(imageUrl, key, currentObject) {
        var imageDfd = new DeferredImage(imageUrl);

        imageDfd.done(function(image) {
            currentObject[key] = filter(image);
        });

        dfds.push(imageDfd);
    });

    jQuery.when.apply(null, dfds)
        .done(function() {
            dfd.resolve(images);
        });

    return dfd.promise();
};