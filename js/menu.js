var MenuItem = function(config) {

    var that = this;

    $.extend(this, config);

    this.shape = new Kinetic.Shape({
        sceneFunc: function(context) {
            context.save();
                context.scale(this.iconScale, this.iconScale);
                context.drawImage(that.image, 0, 0, that.image.width, that.image.height, -that.width2, -that.height2, that.width, that.height);
            context.restore();
        },
        hitFunc: function(context) {
            context.save();
                context.scale(this.iconScale, this.iconScale);
                context.beginPath();
                context.rect(-that.width2, -that.height2, that.width, that.height);
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
        this.width = this.image.width * this.menu.ratio;
        this.height = this.image.height * this.menu.ratio;
        this.width2 = this.width / 2;
        this.height2 = this.height / 2;

        this.constY = this.menu.containerHeight * 0.37;
        this.constX = this.menu.containerWidth * 0.12;
        this.constX2 = this.menu.containerWidth * 0.13;

        this.constArc1 = 1.00322 * this.menu.containerHeight;
    },

    draw: function(x) {
        var distance =  x - this.menu.startPoint,
            directionalPercent = distance / this.menu.itemLength,
            percent = Math.abs(directionalPercent),
            sign = directionalPercent / (percent || 1),
            a = sign * Math.min(percent * this.constX2, this.constX2);

        this.shape.setX(this.menu.startPoint + a + this.constX * directionalPercent);
        this.shape.setY(this.constY + this.constArc1 * Math.cos(percent * 0.1 - Math.PI/2) );
        this.shape.iconScale = Math.max(1 / (1 + percent), 0.5);
    }
});





var Menu = function(config) {
    var that = this;

    $.extend(this, config);

    this.items = [];
    this.width = 0;
    this.position = 0;
    this.startPoint = this.containerWidth / 2;

    this.inertia = new tween.Tween({
        duration: 0.6,
        easing: tween.easings.EaseOut,
        onFrame: function(attrs) {
            that.setPosition(attrs.position);
            that.render();
        },
        onFinish: function() {
            that.trigger('stop', that.items[that.activeIndex - 1]);
        }
    });
};

jQuery.extend(Menu.prototype, events, {

    add: function(item) {
        this.layer.add(item.shape);
        item.menu = this;
        item.initialize(this.layer);
        this.items.push(item);
        this.width += this.itemLength;
    },

    getPosition: function() {
        return this.position;
    },

    setPosition: function(position) {
        this.position = this.getAllowedPosition(position);
    },

    getAllowedPosition: function(position) {
        position = Math.max(position, -this.width + this.startPoint);
        position = Math.min(position, this.startPoint - this.itemLength);

        return position;
    },

    render: function() {

        var item,
            y = this.position;

        for (var i = 0; i < this.items.length; i++) {
            item = this.items[i];
            y += this.itemLength;

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
            deltaDistance = Math.round(speed * this.itemLength),
            targetPosition;

        targetPosition = this.position - deltaDistance;

        return this.getAllowedPosition(targetPosition);
    },

    getNearestItemPosition: function(position) {
        this.activeIndex = Math.round(Math.abs((this.startPoint - position) / this.itemLength));
        this.activeItem = this.items[this.activeIndex - 1];

        return this.startPoint - this.activeIndex * this.itemLength;
    },

    stop: function() {

        var position = this.getInertiaPosition();

        position = this.getNearestItemPosition(position);

        this.endPosition = position;

        this.inertia.setAttrs({
            position: {
                start: this.position,
                end: position
            }
        });

        this.inertia.reset();
        this.inertia.play();
    },

    goTo: function(position) {
        this.createTween(this.getNearestItemPosition(position));
    },

    next: function() {
        var position = this.endPosition || this.position,
            nextPosition = this.getNearestItemPosition(this.getAllowedPosition(position - this.itemLength));

        this.createTween(nextPosition);
    },

    prev: function() {

        var position = this.endPosition || this.position,
            prevPosition = this.getNearestItemPosition(this.getAllowedPosition(position + this.itemLength));

        this.createTween(prevPosition);
    },

    createTween: function(position) {

        this.inertia.pause();

        this.endPosition = position;

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
