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
                ratio = options.width / 638,
                halfWidth = options.width / 2,
                layer = new Kinetic.Layer(),
                $element =  $(this),
                images = [];

            options.height = 366 * ratio;

            stage = new Kinetic.Stage({
                container: 'slider',
                width: options.width,
                height: options.height
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
                        arrowWidth = images.leftArrow.width * ratio,
                        text,
                        arrowY = 0.77 * options.height,
                        enabled,
                        mouseDownX,
                        mouseDownPosition,
                        speed = 2,
                        position = 0,
                        evaluator = new PointerEvaluator(),
                        menuEvaluator = new PointerEvaluator(),

                        menu = new Menu({
                            layer: layer,
                            ratio: ratio,
                            containerWidth: options.width,
                            containerHeight: options.height,
                            itemLength: 100 * ratio
                        });

                    text = new Kinetic.Text({
                        x: halfWidth,
                        y: arrowY,
                        text: '',
                        fontSize: options.width * 0.054,
                        fontFamily: 'Trebuchet MS',
                        fill: '#fff'
                    });

                    text.render  = function(item) {
                        text.text(item.text);
                        text.item = item;
                        text.offsetX(text.width() / 2);
                        text.offsetY(-text.height() / 1.6);
                    };

                    leftArrow = new Kinetic.Image({
                        image: images.leftArrow,
                        width: arrowWidth,
                        height: arrowWidth,
                        x: 0.2  * options.width,
                        y: arrowY,
                        offsetX:  arrowWidth / 2,
                        offsetY:  -arrowWidth / 2
                    });

                    rightArrow = new Kinetic.Image({
                        image: images.rightArrow,
                        width: arrowWidth,
                        height: arrowWidth,
                        x: 0.8 * options.width,
                        y: arrowY,
                        offsetX:  arrowWidth / 2,
                        offsetY:  -arrowWidth / 2
                    });

                    layer.add(new Kinetic.Image({
                        image: images.background,
                        width: options.width,
                        height: options.height
                    }));


                    $.each(options.items, function(index, item) {
                        menu.add(new MenuItem({
                            text: item.text,
                            url: item.url,
                            image: icons[index],
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
                        text.render(item);
                        layer.draw();
                    });

                    menu.setPosition( menu.getNearestItemPosition(menu.width));
                    menu.render();

                    text.render(menu.activeItem);

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

                    $element.find('.kineticjs-content').on('mousedown', function(e) {
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