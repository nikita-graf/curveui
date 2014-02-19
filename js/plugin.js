(function($){

$.fn.curveui = function(options) {

        return this.each(function() {
            var stage,
                layer = new Kinetic.Layer(),
                $element =  $(this),
                images = [];

            stage = new Kinetic.Stage({
                container: 'slider',
                width: 638,
                height: 366
            });

            stage.add(layer);

            $.each(options.items, function(index, item) {
                images.push(item.image);
            });

            $.when(
                imageLoader(options.images),
                imageLoader(images)
            )
                .done(function(images, icons) {

                    var leftArrow,
                        rightArrow,
                        enabled,
                        mouseDownX,
                        mouseDownPosition,
                        speed = 2,
                        position = 0,
                        evaluator = new PointerEvaluator(),
                        menuEvaluator = new PointerEvaluator(),

                        menu = new Menu({
                            layer: layer
                        });

                    leftArrow = new Kinetic.Image({
                        image: images.leftArrow,
                        x: 110,
                        y: 285
                    });

                    rightArrow = new Kinetic.Image({
                        image: images.rightArrow,
                        x: 490,
                        y: 285
                    });

                    layer.add(new Kinetic.Image({
                        image: images.background
                    }));


                    $.each(options.items, function(index, item) {
                        menu.add(new MenuItem({
                            text: item.text,
                            url: item.url,
                            image: icons[index],
                            margin: 50,
                            index: index
                        }));
                    });

                    function animate() {
                        if (enabled)
                            requestAnimFrame(animate);

                        menu.setPosition(position);
                        menu.render();
                    }

                    menu.on('itemClicked', function(e, item) {
//                        window.open(item.url, '_blank');
                    });

                    menu.setPosition( menu.getNearestItemPosition(menu.width));
                    menu.render();

                    menuEvaluator.onMouseMove = function(e) {
                        position = mouseDownPosition +  (e.clientX - mouseDownX) * speed;
                    };

                    menuEvaluator.onMouseUp = function(e) {
                        enabled = false;
                        menu.stop();
                    };

//                    layer.add(leftArrow);
//                    layer.add(rightArrow);

                    evaluator.onMouseMove = function(e) {
                        if (evaluator.distance > 5) {

                            menuEvaluator.start({
                                x: evaluator.startX,
                                y: evaluator.startY
                            });

                            menu.start();
                            enabled = true;
                            mouseDownX = e.clientX;
                            mouseDownPosition = menu.getPosition();
                            position = mouseDownPosition;
                            animate();

                            evaluator.deregister();
                        }
                    };

                    evaluator.onMouseUp = function(e) {

                    };

                    $element.on('mousedown', function(e) {
                        evaluator.start(e);
                    });
                });
        });
    };

})(jQuery);