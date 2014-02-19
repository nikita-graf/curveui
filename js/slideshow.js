var SlideshowItem = function(config) {

    var that = this;

    $.extend(this, config);

    this.shape = new Kinetic.Image({
        y: 0,
        image: this.image
    });
};

jQuery.extend(SlideshowItem.prototype, events, {

});





var Slideshow = function(config) {
    var that = this;

    $.extend(this, config);

    this.activeItem = 0;
    this.items = [];
};

jQuery.extend(Slideshow.prototype, {

    add: function(item) {
        this.layer.add(item.shape);
        item.shape.setX(-this.items.length * 370);
        this.items.push(item);
    },

    next: function() {
        this.activeItem++;

        var nextItemIndex = Math.round(Math.abs(this.activeItem) % this.items.length) ,
            position = this.activeItem * 370;

        this.items[nextItemIndex].shape.setX(-position);
        this.createTween(position);
    },

    prev: function() {
        this.activeItem--;

        var prevItemIndex = Math.round(Math.abs(this.activeItem) % this.items.length) ,
            position = this.activeItem * 370;

        this.items[prevItemIndex].shape.setX(-position);
        this.createTween(position);
    },

//    next: function() {
//        if (this.activeItem != this.items.length - 1) {
//
//            this.activeItem++;
//            this.items.push(item);
//            this.createTween(this.activeItem * 380);
//        }
//    },
//
//    prev: function() {
//        if (this.activeItem != 0) {
//
//            this.activeItem--;
//            this.createTween(this.activeItem * 380);
//        }
//    },

    createTween: function(x) {

        if (this.tween)
            this.tween.pause();

        this.tween = new Kinetic.Tween({
            node: this.layer,
            duration: 0.5,
            easing: Kinetic.Easings.EaseInOut,
            x: x
        });

        this.tween.play();
    }
});
