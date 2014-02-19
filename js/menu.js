var MenuItem = function(config) {

    var that = this;

    $.extend(this, config);

    this.length = 100;

    this.shape = new Kinetic.Shape({
        sceneFunc: function(context) {
            var ctx = context._context;

            context.save();
                context.scale(this.iconScale, this.iconScale);
                context.drawImage(that.image, -50, 0);
            context.restore();

//            context.save();
//                context.scale(this.textScaleT, this.textScaleT);
//                context.beginPath();
//                context.rect(-30, 0, 60, 60);
//                context.setAttr('fillStyle', 'blue');
//                context.fill();
//            context.restore();

            //context.fillStrokeShape(this);
        },
        hitFunc: function(context) {
            context.save();
            context.scale(this.textScaleT, this.textScaleT);
            context.beginPath();
            context.rect(0, -35 * this.iconScale, 200, 70);
            context.closePath();
            context.restore();

            context.fillStrokeShape(this);
        }
    });

    this.shape.iconScale = 1;


    this.shape.on('click', function(e) {
        that.menu.trigger('itemClicked', e, that);
    });

    this.shape.on('mousedown', function(e) {
        that.menu.trigger('itemMousedown', e);
    });

    this.shape.on('mouseenter', function(e) {
        document.body.style.cursor = "pointer";
    });

    this.shape.on('mouseleave', function(e) {
        document.body.style.cursor = "default";
    });
};

jQuery.extend(MenuItem.prototype, events, {

    initialize: function(layer) {
    },

    draw: function(x) {
        var distance =  x - this.menu.startPoint,
            directionalPercent = distance / this.length,
            percent = Math.abs(directionalPercent),
            sign = directionalPercent / (percent || 1),
            a = sign * Math.min(percent * 90, 90);

        this.shape.setX(320 + a + 75 * directionalPercent);

        this.shape.setY(90 + 466 * Math.cos(percent * 0.1 - Math.PI/2) );

        this.shape.iconScale = Math.max(1 / (1 + percent), 0.5);
    }
});





var Menu = function(config) {
    var that = this;

    $.extend(this, config);

    this.items = [];
    this.width = 0;
    this.position = 0;
    this.startPoint = 320;

    this.inertia = new tween.Tween({
        duration: 0.6,
        easing: tween.easings.EaseOut,
        onFrame: function(attrs) {
            that.setPosition(attrs.position);
            that.render();
        },
        onFinish: function() {
            that.trigger('stop');
        }
    });
};

jQuery.extend(Menu.prototype, events, {

    add: function(item) {
        this.layer.add(item.shape);
        item.initialize(this.layer);
        item.menu = this;
        this.items.push(item);
        this.width += item.length;
    },

    getPosition: function() {
        return this.position;
    },

    setPosition: function(position) {
        this.position = this.getAllowedPosition(position);
    },

    getAllowedPosition: function(position) {
        position = Math.max(position, -this.width + this.startPoint);
        position = Math.min(position, this.startPoint - 100);

        return position;
    },

    render: function() {

        var item,
            y = this.position;

        for (var i = 0; i < this.items.length; i++) {
            item = this.items[i];
            y += item.length;

            item.draw(y);
        }

        this.layer.draw();
    },

    start: function() {
        this.inertia.pause();
        this.startTime = (new Date()).getTime();
        this.startPosition = this.position;
        this.trigger('start');
    },

    getInertiaPosition: function() {
        var distance =  this.startPosition - this.position,
            deltaTime = (new Date()).getTime() - this.startTime,
            speed = distance / deltaTime,
            deltaDistance = Math.round(speed * 100),
            targetPosition;

        targetPosition = this.position - deltaDistance;

        return this.getAllowedPosition(targetPosition);
    },

    getNearestItemPosition: function(position) {
        return 320 - Math.round(Math.abs((320 - position) / 100)) * 100;
    },

    stop: function() {

        var position = this.getInertiaPosition();

        position = this.getNearestItemPosition(position);

        this.inertia.setAttrs({
            position: {
                start: this.position,
                end: position
            }
        });

        this.inertia.reset();
        this.inertia.play();
    }
});
