var tween = {},
    PAUSED = 1,
    PLAYING = 2,
    REVERSING = 3;

var requestAnimFrame = (function(callback) {
    return window.requestAnimationFrame || window.webkitRequestAnimationFrame || window.mozRequestAnimationFrame || window.oRequestAnimationFrame || window.msRequestAnimationFrame ||
        function(callback) {
            window.setTimeout(callback, 1000 / 60);
        };
})();


tween.Animation = function(callback) {

    var that = this;

    this.anim = function() {
        if (that.enabled) {
            callback();
            requestAnimFrame(that.anim);
        }
    }
};

tween.Animation.prototype = {
    start: function() {
        this.enabled = true;
        this.anim();
    },
    stop: function() {
        this.enabled = false;
    }
};

tween.Tween = function(config) {
    var that = this,
        start, diff,
        duration = config.duration || 1,
        easing = config.easing || tween.easings.Linear,
        yoyo = !!config.yoyo;

    this.setAttrs(config.attrs);

    this.onFrame = config.onFrame;

    this.anim = new tween.Animation(function() {
        that.tween.onEnterFrame();
    });

    this.tween = new Tween(function(i) {
        that.tweenFunc(i);
    }, easing, duration * 1000, yoyo);

    this.addListeners();
    // this.reset();

    this.tween.onFinish = config.onFinish;

    this.onFinish = config.onFinish;
    this.onReset = config.onReset;
};



tween.Tween.prototype = {
    setAttrs: function(attrs) {
        this.attrs = attrs;

        for (var i in this.attrs) {
            this.attrs[i].diff = this.attrs[i].end - this.attrs[i].start;
        }
    },
    tweenFunc: function(i) {
        var currentAttrs = {},
            key, attr;

        for (key in this.attrs) {
            attr = this.attrs[key];
            currentAttrs[key] = attr.start + (attr.diff * i);
        }

        this.onFrame(currentAttrs);
    },
    addListeners: function() {
        var that = this;

        this.tween.onPlay = function() {
            that.anim.start();
        };

        this.tween.onReverse = function() {
            that.anim.start();
        };

        this.tween.onPause = function() {
            that.anim.stop();
        };

    },
    play: function() {
        this.tween.play();
        return this;
    },
    reverse: function() {
        this.tween.reverse();
        return this;
    },
    reset: function() {
        var node = this.node;
        this.tween.reset();
        return this;
    },
    seek: function(t) {
        var node = this.node;
        this.tween.seek(t * 1000);
        return this;
    },
    pause: function() {
        this.tween.pause();
        return this;
    },
    finish: function() {
        var node = this.node;
        this.tween.finish();
        return this;
    }
};

var Tween = function(propFunc, func, duration, yoyo) {

    var begin = 0, finish = 1;

    this.propFunc = propFunc;
    this.begin = begin;
    this._pos = begin;
    this.duration = duration;
    this._change = 0;
    this.prevPos = 0;
    this.yoyo = yoyo;
    this._time = 0;
    this._position = 0;
    this._startTime = 0;
    this._finish = 0;
    this.func = func;
    this._change = finish - this.begin;
    this.pause();
};

Tween.prototype = {
    fire: function(str) {
        var handler = this[str];
        if (handler) {
            handler();
        }
    },
    setTime: function(t) {
        if(t > this.duration) {
            if(this.yoyo) {
                this._time = this.duration;
                this.reverse();
            }
            else {
                this.finish();
            }
        }
        else if(t < 0) {
            if(this.yoyo) {
                this._time = 0;
                this.play();
            }
            else {
                this.reset();
            }
        }
        else {
            this._time = t;
            this.update();
        }
    },
    getTime: function() {
        return this._time;
    },
    setPosition: function(p) {
        this.prevPos = this._pos;
        this.propFunc(p);
        this._pos = p;
    },
    getPosition: function(t) {
        if(t === undefined) {
            t = this._time;
        }
        return this.func(t, this.begin, this._change, this.duration);
    },
    play: function() {
        this.fire('onPlay');
        this.state = PLAYING;
        this._startTime = this.getTimer() - this._time;
        this.onEnterFrame();
    },
    reverse: function() {
        this.fire('onReverse');
        this.state = REVERSING;
        this._time = this.duration - this._time;
        this._startTime = this.getTimer() - this._time;
        this.onEnterFrame();
    },
    seek: function(t) {
        this.pause();
        this._time = t;
        this.update();
    },
    reset: function() {
        this.pause();
        this._time = 0;
        this.update();

    },
    finish: function() {
        this.pause();
        this._time = this.duration;
        this.update();
        this.fire('onFinish');
    },
    update: function() {
        this.setPosition(this.getPosition(this._time));
    },
    onEnterFrame: function() {
        var t = this.getTimer() - this._startTime;
        if(this.state === PLAYING) {
            this.setTime(t);
        }
        else if (this.state === REVERSING) {
            this.setTime(this.duration - t);
        }
    },
    pause: function() {
        this.fire('onPause');
        this.state = PAUSED;
    },
    getTimer: function() {
        return new Date().getTime();
    }
};

tween.easings = {
    'BackEaseIn': function(t, b, c, d, a, p) {
        var s = 1.70158;
        return c * (t /= d) * t * ((s + 1) * t - s) + b;
    },
    'BackEaseOut': function(t, b, c, d, a, p) {
        var s = 1.70158;
        return c * (( t = t / d - 1) * t * ((s + 1) * t + s) + 1) + b;
    },
    'BackEaseInOut': function(t, b, c, d, a, p) {
        var s = 1.70158;
        if((t /= d / 2) < 1) {
            return c / 2 * (t * t * (((s *= (1.525)) + 1) * t - s)) + b;
        }
        return c / 2 * ((t -= 2) * t * (((s *= (1.525)) + 1) * t + s) + 2) + b;
    },
    'ElasticEaseIn': function(t, b, c, d, a, p) {
        // added s = 0
        var s = 0;
        if(t === 0) {
            return b;
        }
        if((t /= d) == 1) {
            return b + c;
        }
        if(!p) {
            p = d * 0.3;
        }
        if(!a || a < Math.abs(c)) {
            a = c;
            s = p / 4;
        }
        else {
            s = p / (2 * Math.PI) * Math.asin(c / a);
        }
        return -(a * Math.pow(2, 10 * (t -= 1)) * Math.sin((t * d - s) * (2 * Math.PI) / p)) + b;
    },
    'ElasticEaseOut': function(t, b, c, d, a, p) {
        // added s = 0
        var s = 0;
        if(t === 0) {
            return b;
        }
        if((t /= d) == 1) {
            return b + c;
        }
        if(!p) {
            p = d * 0.3;
        }
        if(!a || a < Math.abs(c)) {
            a = c;
            s = p / 4;
        }
        else {
            s = p / (2 * Math.PI) * Math.asin(c / a);
        }
        return (a * Math.pow(2, -10 * t) * Math.sin((t * d - s) * (2 * Math.PI) / p) + c + b);
    },
    'ElasticEaseInOut': function(t, b, c, d, a, p) {
        // added s = 0
        var s = 0;
        if(t === 0) {
            return b;
        }
        if((t /= d / 2) == 2) {
            return b + c;
        }
        if(!p) {
            p = d * (0.3 * 1.5);
        }
        if(!a || a < Math.abs(c)) {
            a = c;
            s = p / 4;
        }
        else {
            s = p / (2 * Math.PI) * Math.asin(c / a);
        }
        if(t < 1) {
            return -0.5 * (a * Math.pow(2, 10 * (t -= 1)) * Math.sin((t * d - s) * (2 * Math.PI) / p)) + b;
        }
        return a * Math.pow(2, -10 * (t -= 1)) * Math.sin((t * d - s) * (2 * Math.PI) / p) * 0.5 + c + b;
    },
    'BounceEaseOut': function(t, b, c, d) {
        if((t /= d) < (1 / 2.75)) {
            return c * (7.5625 * t * t) + b;
        }
        else if(t < (2 / 2.75)) {
            return c * (7.5625 * (t -= (1.5 / 2.75)) * t + 0.75) + b;
        }
        else if(t < (2.5 / 2.75)) {
            return c * (7.5625 * (t -= (2.25 / 2.75)) * t + 0.9375) + b;
        }
        else {
            return c * (7.5625 * (t -= (2.625 / 2.75)) * t + 0.984375) + b;
        }
    },
    'BounceEaseIn': function(t, b, c, d) {
        return c - Kinetic.Easings.BounceEaseOut(d - t, 0, c, d) + b;
    },
    'BounceEaseInOut': function(t, b, c, d) {
        if(t < d / 2) {
            return Kinetic.Easings.BounceEaseIn(t * 2, 0, c, d) * 0.5 + b;
        }
        else {
            return Kinetic.Easings.BounceEaseOut(t * 2 - d, 0, c, d) * 0.5 + c * 0.5 + b;
        }
    },
    'EaseIn': function(t, b, c, d) {
        return c * (t /= d) * t + b;
    },
    'EaseOut': function(t, b, c, d) {
        return -c * (t /= d) * (t - 2) + b;
    },
    'EaseInOut': function(t, b, c, d) {
        if((t /= d / 2) < 1) {
            return c / 2 * t * t + b;
        }
        return -c / 2 * ((--t) * (t - 2) - 1) + b;
    },
    'StrongEaseIn': function(t, b, c, d) {
        return c * (t /= d) * t * t * t * t + b;
    },
    'StrongEaseOut': function(t, b, c, d) {
        return c * (( t = t / d - 1) * t * t * t * t + 1) + b;
    },
    'StrongEaseInOut': function(t, b, c, d) {
        if((t /= d / 2) < 1) {
            return c / 2 * t * t * t * t * t + b;
        }
        return c / 2 * ((t -= 2) * t * t * t * t + 2) + b;
    },
    'Linear': function(t, b, c, d) {
        return c * t / d + b;
    }
};