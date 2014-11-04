(function(){
    var debounce = angular.module('mgcrea.ngStrap.helpers.debounce', []);

// @source jashkenas/underscore
// @url https://github.com/jashkenas/underscore/blob/1.5.2/underscore.js#L693
    debounce.factory('debounce', function($timeout) {
        return function(func, wait, immediate) {
            var timeout = null;
            return function() {
                var context = this,
                    args = arguments,
                    callNow = immediate && !timeout;
                if(timeout) {
                    $timeout.cancel(timeout);
                }
                timeout = $timeout(function later() {
                    timeout = null;
                    if(!immediate) {
                        func.apply(context, args);
                    }
                }, wait, false);
                if(callNow) {
                    func.apply(context, args);
                }
                return timeout;
            };
        };
    })

// @source jashkenas/underscore
// @url https://github.com/jashkenas/underscore/blob/1.5.2/underscore.js#L661
    debounce.factory('throttle', function($timeout) {
        return function(func, wait, options) {
            var timeout = null;
            options || (options = {});
            return function() {
                var context = this,
                    args = arguments;
                if(!timeout) {
                    if(options.leading !== false) {
                        func.apply(context, args);
                    }
                    timeout = $timeout(function later() {
                        timeout = null;
                        if(options.trailing !== false) {
                            func.apply(context, args);
                        }
                    }, wait, false);
                }
            };
        };
    });
})();

(function(){
    var dimensions = angular.module('mgcrea.ngStrap.helpers.dimensions', []);

    dimensions.factory('dimensions', function($document, $window) {

        var jqLite = angular.element;
        var fn = {};

        /**
         * Test the element nodeName
         * @param element
         * @param name
         */
        var nodeName = fn.nodeName = function(element, name) {
            return element.nodeName && element.nodeName.toLowerCase() === name.toLowerCase();
        };

        /**
         * Returns the element computed style
         * @param element
         * @param prop
         * @param extra
         */
        fn.css = function(element, prop, extra) {
            var value;
            if (element.currentStyle) { //IE
                value = element.currentStyle[prop];
            } else if (window.getComputedStyle) {
                value = window.getComputedStyle(element)[prop];
            } else {
                value = element.style[prop];
            }
            return extra === true ? parseFloat(value) || 0 : value;
        };

        /**
         * Provides read-only equivalent of jQuery's offset function:
         * @required-by bootstrap-tooltip, bootstrap-affix
         * @url http://api.jquery.com/offset/
         * @param element
         */
        fn.offset = function(element) {
            var boxRect = element.getBoundingClientRect();
            var docElement = element.ownerDocument;
            return {
                width: boxRect.width || element.offsetWidth,
                height: boxRect.height || element.offsetHeight,
                top: boxRect.top + (window.pageYOffset || docElement.documentElement.scrollTop) - (docElement.documentElement.clientTop || 0),
                left: boxRect.left + (window.pageXOffset || docElement.documentElement.scrollLeft) - (docElement.documentElement.clientLeft || 0)
            };
        };

        /**
         * Provides read-only equivalent of jQuery's position function
         * @required-by bootstrap-tooltip, bootstrap-affix
         * @url http://api.jquery.com/offset/
         * @param element
         */
        fn.position = function(element) {

            var offsetParentRect = {top: 0, left: 0},
                offsetParentElement,
                offset;

            // Fixed elements are offset from window (parentOffset = {top:0, left: 0}, because it is it's only offset parent
            if (fn.css(element, 'position') === 'fixed') {

                // We assume that getBoundingClientRect is available when computed position is fixed
                offset = element.getBoundingClientRect();

            } else {

                // Get *real* offsetParentElement
                offsetParentElement = offsetParent(element);
                offset = fn.offset(element);

                // Get correct offsets
                offset = fn.offset(element);
                if (!nodeName(offsetParentElement, 'html')) {
                    offsetParentRect = fn.offset(offsetParentElement);
                }

                // Add offsetParent borders
                offsetParentRect.top += fn.css(offsetParentElement, 'borderTopWidth', true);
                offsetParentRect.left += fn.css(offsetParentElement, 'borderLeftWidth', true);
            }

            // Subtract parent offsets and element margins
            return {
                width: element.offsetWidth,
                height: element.offsetHeight,
                top: offset.top - offsetParentRect.top - fn.css(element, 'marginTop', true),
                left: offset.left - offsetParentRect.left - fn.css(element, 'marginLeft', true)
            };

        };

        /**
         * Returns the closest, non-statically positioned offsetParent of a given element
         * @required-by fn.position
         * @param element
         */
        var offsetParent = function offsetParentElement(element) {
            var docElement = element.ownerDocument;
            var offsetParent = element.offsetParent || docElement;
            if(nodeName(offsetParent, '#document')) return docElement.documentElement;
            while(offsetParent && !nodeName(offsetParent, 'html') && fn.css(offsetParent, 'position') === 'static') {
                offsetParent = offsetParent.offsetParent;
            }
            return offsetParent || docElement.documentElement;
        };

        /**
         * Provides equivalent of jQuery's height function
         * @required-by bootstrap-affix
         * @url http://api.jquery.com/height/
         * @param element
         * @param outer
         */
        fn.height = function(element, outer) {
            var value = element.offsetHeight;
            if(outer) {
                value += fn.css(element, 'marginTop', true) + fn.css(element, 'marginBottom', true);
            } else {
                value -= fn.css(element, 'paddingTop', true) + fn.css(element, 'paddingBottom', true) + fn.css(element, 'borderTopWidth', true) + fn.css(element, 'borderBottomWidth', true);
            }
            return value;
        };

        /**
         * Provides equivalent of jQuery's width function
         * @required-by bootstrap-affix
         * @url http://api.jquery.com/width/
         * @param element
         * @param outer
         */
        fn.width = function(element, outer) {
            var value = element.offsetWidth;
            if(outer) {
                value += fn.css(element, 'marginLeft', true) + fn.css(element, 'marginRight', true);
            } else {
                value -= fn.css(element, 'paddingLeft', true) + fn.css(element, 'paddingRight', true) + fn.css(element, 'borderLeftWidth', true) + fn.css(element, 'borderRightWidth', true);
            }
            return value;
        };

        return fn;

    });
})();

(function(){
    var affix = angular.module('mgcrea.ngStrap.affix', ['mgcrea.ngStrap.helpers.dimensions', 'mgcrea.ngStrap.helpers.debounce'])

    affix.provider('$affix', function() {

        var defaults = this.defaults = {
            offsetTop: 'auto'
        };

        this.$get = function($window, debounce, dimensions) {

            var bodyEl = angular.element($window.document.body);
            var windowEl = angular.element($window);

            function AffixFactory(element, config) {

                var $affix = {};

                // Common vars
                var options = angular.extend({}, defaults, config);
                var targetEl = options.target;

                // Initial private vars
                var reset = 'affix affix-top affix-bottom',
                    setWidth = false,
                    initialAffixTop = 0,
                    initialOffsetTop = 0,
                    offsetTop = 0,
                    offsetBottom = 0,
                    affixed = null,
                    unpin = null;

                var parent = element.parent();
                // Options: custom parent
                if (options.offsetParent) {
                    if (options.offsetParent.match(/^\d+$/)) {
                        for (var i = 0; i < (options.offsetParent * 1) - 1; i++) {
                            parent = parent.parent();
                        }
                    }
                    else {
                        parent = angular.element(options.offsetParent);
                    }
                }

                $affix.init = function() {

                    $affix.$parseOffsets();
                    initialOffsetTop = dimensions.offset(element[0]).top + initialAffixTop;
                    setWidth = !element[0].style.width;

                    // Bind events
                    targetEl.on('scroll', $affix.checkPosition);
                    targetEl.on('click', $affix.checkPositionWithEventLoop);
                    windowEl.on('resize', $affix.$debouncedOnResize);

                    // Both of these checkPosition() calls are necessary for the case where
                    // the user hits refresh after scrolling to the bottom of the page.
                    $affix.checkPosition();
                    $affix.checkPositionWithEventLoop();

                };

                $affix.destroy = function() {

                    // Unbind events
                    targetEl.off('scroll', $affix.checkPosition);
                    targetEl.off('click', $affix.checkPositionWithEventLoop);
                    windowEl.off('resize', $affix.$debouncedOnResize);

                };

                $affix.checkPositionWithEventLoop = function() {

                    setTimeout($affix.checkPosition, 1);

                };

                $affix.checkPosition = function() {
                    // if (!this.$element.is(':visible')) return

                    var scrollTop = getScrollTop();
                    var position = dimensions.offset(element[0]);
                    var elementHeight = dimensions.height(element[0]);

                    // Get required affix class according to position
                    var affix = getRequiredAffixClass(unpin, position, elementHeight);

                    // Did affix status changed this last check?
                    if(affixed === affix) return;
                    affixed = affix;

                    // Add proper affix class
                    element.removeClass(reset).addClass('affix' + ((affix !== 'middle') ? '-' + affix : ''));

                    if(affix === 'top') {
                        unpin = null;
                        element.css('position', (options.offsetParent) ? '' : 'relative');
                        if(setWidth) {
                            element.css('width', '');
                        }
                        element.css('top', '');
                    } else if(affix === 'bottom') {
                        if (options.offsetUnpin) {
                            unpin = -(options.offsetUnpin * 1);
                        }
                        else {
                            // Calculate unpin threshold when affixed to bottom.
                            // Hopefully the browser scrolls pixel by pixel.
                            unpin = position.top - scrollTop;
                        }
                        if(setWidth) {
                            element.css('width', '');
                        }
                        element.css('position', (options.offsetParent) ? '' : 'relative');
                        element.css('top', (options.offsetParent) ? '' : ((bodyEl[0].offsetHeight - offsetBottom - elementHeight - initialOffsetTop) + 'px'));
                    } else { // affix === 'middle'
                        unpin = null;
                        if(setWidth) {
                            element.css('width', element[0].offsetWidth + 'px');
                        }
                        element.css('position', 'fixed');
                        element.css('top', initialAffixTop + 'px');
                    }

                };

                $affix.$onResize = function() {
                    $affix.$parseOffsets();
                    $affix.checkPosition();
                };
                $affix.$debouncedOnResize = debounce($affix.$onResize, 50);

                $affix.$parseOffsets = function() {
                    var initialPosition = element.css('position');
                    // Reset position to calculate correct offsetTop
                    element.css('position', (options.offsetParent) ? '' : 'relative');

                    if(options.offsetTop) {
                        if(options.offsetTop === 'auto') {
                            options.offsetTop = '+0';
                        }
                        if(options.offsetTop.match(/^[-+]\d+$/)) {
                            initialAffixTop = - options.offsetTop * 1;
                            if(options.offsetParent) {
                                offsetTop = dimensions.offset(parent[0]).top + (options.offsetTop * 1);
                            }
                            else {
                                offsetTop = dimensions.offset(element[0]).top - dimensions.css(element[0], 'marginTop', true) + (options.offsetTop * 1);
                            }
                        }
                        else {
                            offsetTop = options.offsetTop * 1;
                        }
                    }

                    if(options.offsetBottom) {
                        if(options.offsetParent && options.offsetBottom.match(/^[-+]\d+$/)) {
                            // add 1 pixel due to rounding problems...
                            offsetBottom = getScrollHeight() - (dimensions.offset(parent[0]).top + dimensions.height(parent[0])) + (options.offsetBottom * 1) + 1;
                        }
                        else {
                            offsetBottom = options.offsetBottom * 1;
                        }
                    }

                    // Bring back the element's position after calculations
                    element.css('position', initialPosition);
                };

                // Private methods

                function getRequiredAffixClass(unpin, position, elementHeight) {

                    var scrollTop = getScrollTop();
                    var scrollHeight = getScrollHeight();

                    if(scrollTop <= offsetTop) {
                        return 'top';
                    } else if(unpin !== null && (scrollTop + unpin <= position.top)) {
                        return 'middle';
                    } else if(offsetBottom !== null && (position.top + elementHeight + initialAffixTop >= scrollHeight - offsetBottom)) {
                        return 'bottom';
                    } else {
                        return 'middle';
                    }

                }

                function getScrollTop() {
                    return targetEl[0] === $window ? $window.pageYOffset : targetEl[0].scrollTop;
                }

                function getScrollHeight() {
                    return targetEl[0] === $window ? $window.document.body.scrollHeight : targetEl[0].scrollHeight;
                }

                $affix.init();
                return $affix;

            }

            return AffixFactory;

        };

    })

    affix.directive('bsAffix', function($affix, $window) {

        return {
            restrict: 'EAC',
            require: '^?bsAffixTarget',
            link: function postLink(scope, element, attr, affixTarget) {

                var options = {scope: scope, offsetTop: 'auto', target: affixTarget ? affixTarget.$element : angular.element($window)};
                angular.forEach(['offsetTop', 'offsetBottom', 'offsetParent', 'offsetUnpin'], function(key) {
                    if(angular.isDefined(attr[key])) options[key] = attr[key];
                });

                var affix = $affix(element, options);
                scope.$on('$destroy', function() {
                    affix && affix.destroy();
                    options = null;
                    affix = null;
                });

            }
        };

    })

    affix.directive('bsAffixTarget', function() {
        return {
            controller: function($element) {
                this.$element = $element;
            }
        };
    });
})();

(function(){
    var scrollspy = angular.module('mgcrea.ngStrap.scrollspy', ['mgcrea.ngStrap.helpers.debounce', 'mgcrea.ngStrap.helpers.dimensions'])

    scrollspy.provider('$scrollspy', function() {

        // Pool of registered spies
        var spies = this.$$spies = {};

        var defaults = this.defaults = {
            debounce: 150,
            throttle: 100,
            offset: 100
        };

        this.$get = function($window, $document, $rootScope, dimensions, debounce, throttle) {
            var windowEl = angular.element($window);
            var docEl = angular.element($document.prop('documentElement'));
            var bodyEl = angular.element($window.document.body);

            // Helper functions

            function nodeName(element, name) {
                return element[0].nodeName && element[0].nodeName.toLowerCase() === name.toLowerCase();
            }

            function ScrollSpyFactory(config) {

                // Common vars
                var options = angular.extend({}, defaults, config);
                if(!options.element) options.element = bodyEl;
                var isWindowSpy = false;
                var scrollEl = angular.element('snap-content');
                var scrollId = options.scope.$id;

                // Use existing spy
                if(spies[scrollId]) {
                    spies[scrollId].$$count++;
                    return spies[scrollId];
                }

                var $scrollspy = {};

                // Private vars
                var unbindViewContentLoaded, unbindIncludeContentLoaded;
                var trackedElements = $scrollspy.$trackedElements = [];
                var sortedElements = [];
                var activeTarget;
                var debouncedCheckPosition;
                var throttledCheckPosition;
                var debouncedCheckOffsets;
                var viewportHeight;
                var scrollTop;

                $scrollspy.init = function() {

                    // Setup internal ref counter
                    this.$$count = 1;

                    // Bind events
                    debouncedCheckPosition = debounce(this.checkPosition, options.debounce);
                    throttledCheckPosition = throttle(this.checkPosition, options.throttle);
                    scrollEl.on('click', this.checkPositionWithEventLoop);
                    windowEl.on('resize', debouncedCheckPosition);
                    scrollEl.on('scroll', throttledCheckPosition);

                    debouncedCheckOffsets = debounce(this.checkOffsets, options.debounce);
                    unbindViewContentLoaded = $rootScope.$on('$viewContentLoaded', debouncedCheckOffsets);
                    unbindIncludeContentLoaded = $rootScope.$on('$includeContentLoaded', debouncedCheckOffsets);
                    debouncedCheckOffsets();

                    // Register spy for reuse
                    if(scrollId) {
                        spies[scrollId] = $scrollspy;
                    }

                };

                $scrollspy.destroy = function() {

                    // Check internal ref counter
                    this.$$count--;
                    if(this.$$count > 0) {
                        return;
                    }

                    // Unbind events
                    scrollEl.off('click', this.checkPositionWithEventLoop);
                    windowEl.off('resize', debouncedCheckPosition);
                    scrollEl.off('scroll', debouncedCheckPosition);
                    unbindViewContentLoaded();
                    unbindIncludeContentLoaded();
                    if (scrollId) {
                        delete spies[scrollId];
                    }
                };

                $scrollspy.checkPosition = function() {
                    // Not ready yet
                    if(!sortedElements.length) return;

                    // Calculate the scroll position
                    scrollTop = (isWindowSpy ? $window.pageYOffset : scrollEl.prop('scrollTop')) || 0;

                    // Calculate the viewport height for use by the components
                    //viewportHeight = Math.max($window.innerHeight, docEl.prop('clientHeight'));
                    viewportHeight = scrollEl.prop('clientHeight');


                    // Activate first element if scroll is smaller
                    //if(scrollTop < sortedElements[0].offsetTop && activeTarget !== sortedElements[0].target) {
                    //    return $scrollspy.$activateElement(sortedElements[0]);
                    //}

                    // Activate proper element
                    for (var i = sortedElements.length; i--;) {
                        if(angular.isUndefined(sortedElements[i].offsetTop) || sortedElements[i].offsetTop === null) continue;
                        if(activeTarget === sortedElements[i].target) continue;
                        if(scrollTop < sortedElements[i].offsetTop) continue;
                        if(sortedElements[i + 1] && scrollTop > sortedElements[i + 1].offsetTop) continue;
                        return $scrollspy.$activateElement(sortedElements[i]);
                    }
                    $scrollspy.checkPositionWithEventLoop;

                };

                $scrollspy.checkPositionWithEventLoop = function() {
                    setTimeout(this.checkPosition, 1);
                };

                // Protected methods

                $scrollspy.$activateElement = function(element) {
                    if(activeTarget) {
                        var activeElement = $scrollspy.$getTrackedElement(activeTarget);
                        if(activeElement) {
                            activeElement.source.removeClass('active');
                            if(nodeName(activeElement.source, 'li') && nodeName(activeElement.source.parent().parent(), 'li')) {
                                activeElement.source.parent().parent().removeClass('active');
                            }
                        }
                    }
                    activeTarget = element.target;
                    element.source.addClass('active');
                    if(nodeName(element.source, 'li') && nodeName(element.source.parent().parent(), 'li')) {
                        element.source.parent().parent().addClass('active');
                    }
                };

                $scrollspy.$getTrackedElement = function(target) {
                    return trackedElements.filter(function(obj) {
                        return obj.target === target;
                    })[0];
                };

                // Track offsets behavior

                $scrollspy.checkOffsets = function() {

                    angular.forEach(trackedElements, function(trackedElement) {
                        var targetElement = document.querySelector(trackedElement.target);
                        trackedElement.offsetTop = targetElement ? dimensions.offset(targetElement).top : null;
                        if(options.offset && trackedElement.offsetTop !== null) trackedElement.offsetTop -= options.offset * 1;
                    });

                    sortedElements = trackedElements
                        .filter(function(el) {
                            return el.offsetTop !== null;
                        })
                        .sort(function(a, b) {
                            return a.offsetTop - b.offsetTop;
                        });

                    debouncedCheckPosition();

                };

                $scrollspy.trackElement = function(target, source) {
                    trackedElements.push({target: target, source: source});
                };

                $scrollspy.untrackElement = function(target, source) {
                    var toDelete;
                    for (var i = trackedElements.length; i--;) {
                        if(trackedElements[i].target === target && trackedElements[i].source === source) {
                            toDelete = i;
                            break;
                        }
                    }
                    trackedElements = trackedElements.splice(toDelete, 1);
                };

                $scrollspy.activate = function(i) {
                    trackedElements[i].addClass('active');
                };

                // Initialize plugin

                $scrollspy.init();
                return $scrollspy;

            }

            return ScrollSpyFactory;

        };

    })

    scrollspy.directive('bsScrollspy', function($rootScope, debounce, dimensions, $scrollspy, $window) {

        return {
            restrict: 'EAC',
            link: function postLink(scope, element, attr) {
                angular.element('snap-content').bind("scroll", function() {
                    console.log();
                });

                var options = {scope: scope};
                angular.forEach(['offset', 'target'], function(key) {
                    if(angular.isDefined(attr[key])) options[key] = attr[key];
                });

                var scrollspy = $scrollspy(options);
                scrollspy.trackElement(options.target, element);

                scope.$on('$destroy', function() {
                    if (scrollspy) {
                        scrollspy.untrackElement(options.target, element);
                        scrollspy.destroy();
                    }
                    options = null;
                    scrollspy = null;
                });

            }
        };

    })


    scrollspy.directive('bsScrollspyList', function($rootScope, debounce, dimensions, $scrollspy) {

        return {
            restrict: 'A',
            compile: function postLink(element, attr) {
                var children = element[0].querySelectorAll('li > a[href]');
                angular.forEach(children, function(child) {
                    var childEl = angular.element(child);
                    childEl.parent().attr('bs-scrollspy', '').attr('data-target', childEl.attr('href'));
                });
            }

        };

    });
})();

(function(){
    angular.module('mgcrea.ngStrap', [
        'mgcrea.ngStrap.scrollspy',
        'mgcrea.ngStrap.affix'
    ]);
})();