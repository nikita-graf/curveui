(function($){

$.fn.curveui = function(options) {

        function addCursor(shape) {
            shape.on('mouseenter', function(e) {
                document.body.style.cursor = "pointer";
            });

            shape.on('mouseleave', function(e) {
                document.body.style.cursor = "default";
            });
        }

        return this.each(function() {
            var stage,
                layer = new Kinetic.Layer(),
                $element =  $(this),
                images = [];

            stage = new Kinetic.Stage({
                container: 'slider',
                width: 640,
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
                        text,
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

                    text = new Kinetic.Text({
                        x: 170,
                        y: 285,
                        text: '',
                        fontSize: 35,
                        fontFamily: 'Trebuchet MS',
                        fill: '#fff',
                        align: 'center',
                        width: 300
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
                        if (item === menu.activeItem)
                            window.open(item.url, '_blank');
                    });

                    text.on('click', function() {
                        window.open(text.item.url, '_blank');
                    })

                    menu.on('stop', function(item) {
                        text.item = item;
                        text.text(item.text);
                        layer.draw();
                    });

                    menu.setPosition( menu.getNearestItemPosition(menu.width));
                    menu.render();

                    text.item = menu.activeItem;
                    text.text(menu.activeItem.text);

                    menuEvaluator.onMouseMove = function(e) {
                        position = mouseDownPosition +  (e.clientX - mouseDownX) * speed;
                    };

                    menuEvaluator.onMouseUp = function(e) {
                        enabled = false;
                        menu.stop();
                    };

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

                    layer.add(text);
                    layer.add(leftArrow);
                    layer.add(rightArrow);


                    leftArrow.cache();
                    leftArrow.drawHitFromCache();

                    rightArrow.cache();
                    rightArrow.drawHitFromCache();

                    addCursor(text);
                    addCursor(leftArrow);
                    addCursor(rightArrow);

                    leftArrow.on('click', function() {
                        evaluator.deregister();
                        menu.prev();
                    });

                    rightArrow.on('click', function() {
                        evaluator.deregister();
                        menu.next();
                    });

                    layer.draw();
                });
        });
    };

})(jQuery);