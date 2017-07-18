/// <reference path="../node_modules/@types/jquery/index.d.ts" />
/// <reference path="../node_modules/@types/jqueryui/index.d.ts" />
/// <reference path="../ts/jquery.scrolltab.d.ts" />
(function ($) {
    /**
     * Default options to be used for initialization
     * User provided values will override these values
     */
    var settings = {
        animateTabs: false,
        showNavWhenNeeded: true,
        customNavNext: null,
        customNavPrev: null,
        customNavFirst: null,
        customNavLast: null,
        closable: true,
        easing: 'swing',
        loadLastTab: false,
        onTabScroll: function () {
            // empty
        },
        scrollSpeed: 500,
        selectTabOnAdd: true,
        selectTabAfterScroll: true,
        showFirstLastArrows: true,
        hideDefaultArrows: false,
        nextPrevOutward: false,
        wrapperCssClass: '',
        enableDebug: false
    };
    $.fn.scrollabletabs = function (options) {
        return this.each(function () {
            var opts;
            var $tabs;
            var $scrollDiv;
            var $ul;
            var $lis;
            var $curSelectedTab;
            var $leftArrowWrapper;
            var $rightArrowWrapper;
            var $navPrev;
            var $navNext;
            var $navFirst;
            var $navLast;
            var eventDelay = 100;
            opts = $.extend({}, settings, typeof options === 'object' ? options : {});
            var isDebouncePluginFound = $.debounce ? true : false;
            log('Debounce plugin found - ' + isDebouncePluginFound);
            $tabs = $(this).addClass(opts.wrapperCssClass + ' stMainWrapper');
            $ul = $tabs.find('ul.ui-tabs-nav:first');
            $lis = $ul.find('li');
            // We will use our own css class to detect a selected tab
            // because we might want to scroll without tab being selected
            $curSelectedTab = $ul.find('.ui-tabs-selected')
                .addClass('stCurrentTab');
            /**
             * If debounce/throttle plugin is found, it debounces the event handler function
             * @param dbFunc the event handler function
             */
            function debounceEvent(dbFunc) {
                return isDebouncePluginFound ? $.debounce(eventDelay, dbFunc) : dbFunc;
            }
            /**
             * If debounce/throttle plugin is found, it throttles the event handler function
             * @param dbFunc the event handler function
             */
            function throttleEvent(dbFunc) {
                return isDebouncePluginFound ? $.throttle(eventDelay, dbFunc) : dbFunc;
            }
            /**
             * Centrally control all message to be logged to the console
             * @param message -message to be displayed
             */
            function log(message, isError) {
                if (opts.enableDebug) {
                    if (isError === true) {
                        console.error(message);
                    }
                    else {
                        console.log(message);
                    }
                }
            }
            /**
             * Returns number of tabs in $tabs widget
             */
            function getTabCount() {
                return $tabs.children('ul.ui-tabs-nav > li').length;
            }
            /**
             * calculates the navigation controls width and offsets the inner tab header accordingly
             */
            function _offsetTabsBasedOnNavControls() {
                var leftMargin = 0;
                var rightMargin = 0;
                if ($leftArrowWrapper.is(':visible')) {
                    leftMargin = $leftArrowWrapper.outerWidth();
                    rightMargin = $rightArrowWrapper.outerWidth();
                }
                $scrollDiv.css({
                    'margin-left': leftMargin,
                    'margin-right': rightMargin
                });
            }
            /**
             * Initializes the navigation controls based on user settings
             */
            function _setupNavControls() {
                $scrollDiv = $ul.parent();
                // Set the height of the UL
                $scrollDiv.height($lis.first().outerHeight());
                $leftArrowWrapper = $('<div class="stNavMain stNavMainLeft"/>');
                $rightArrowWrapper = $('<div class="stNavMain stNavMainRight"/>');
                if (!opts.hideDefaultArrows) {
                    $navPrev = $('<button class="stNavPrevArrow ui-state-active" title="Previous">' +
                        '<span class="ui-icon ui-icon-seek-prev">Previous tab</span></button>');
                    $leftArrowWrapper.append($navPrev);
                    $navNext = $('<button class="stNavNextArrow ui-state-active" title="Next">' +
                        '<span class="ui-icon ui-icon-seek-next">Next tab</span></button>');
                    $rightArrowWrapper.append($navNext);
                    if (opts.showFirstLastArrows === true) {
                        $navFirst = $('<button class="stNavFirstArrow ui-state-active" title="First">' +
                            '<span class="ui-icon ui-icon-seek-first">First tab</span></button>');
                        $leftArrowWrapper.prepend($navFirst);
                        $navLast = $('<button class="stNavLastArrow ui-state-active" title="Last">' +
                            '<span class="ui-icon ui-icon-seek-end">Last tab</span></button>');
                        $rightArrowWrapper.append($navLast);
                    }
                    else {
                        $navFirst = $navLast = $();
                    }
                }
                $scrollDiv.before($leftArrowWrapper);
                $scrollDiv.after($rightArrowWrapper);
                // Add close buttons if required
                _addclosebutton();
            }
            /**
             * Initializes all the controls and events required for scroll tabs
             */
            function _init() {
                var _this = this;
                // Add nav controls
                _setupNavControls();
                // See if nav is needed
                _showNavsIfNeeded();
                // Add events to the navigation buttons
                _addNavEvents();
                // If tab is selected manually by user than also change the css class
                $tabs.on('tabsactivate', function (event, ui) {
                    _updateCurrentTab($(ui.newTab));
                    _animateTabTo(ui.newTab, null, event);
                });
                $tabs.on('tabsadd', function (event, ui) {
                    var $thisLi = $(ui.tab).parents('li');
                    // Update li list
                    $lis = $ul.find('li');
                    // Adjust the position of last tab
                    // Welcome the new tab by adding a close button
                    _addclosebutton($thisLi);
                    // Next move tab to the end
                    // See if nav needed
                    _showNavsIfNeeded();
                    // Adjust the left position of all tabs
                    _adjustLeftPosition($thisLi);
                    // Check if select on add
                    if (opts.selectTabOnAdd) {
                        log($lis.index($thisLi));
                        $(_this).tabs('option', 'active', $lis.index($thisLi));
                    }
                }).on('tabsremove', function (event, ui) {
                    // var $thisLi = $(ui.tab).parents('li');
                    // Update li list
                    $lis = $ul.find('li');
                    // If one tab remaining than hide the close button
                    if (getTabCount() === 1) {
                        $ul.find('.ui-icon-circle-close').addClass('stFirstTab').hide();
                    }
                    else {
                        // Because if user add new tab, close button for all tabs must be shown
                        $ul.find('.ui-icon-circle-close').show();
                        // Assign 'stFirstTab' to first tab
                        _updateCurrentTab($lis.first()); // In case the first tab was removed
                    }
                    // To make sure to hide navigations if not needed
                    _showNavsIfNeeded();
                    // Adjust the position of tabs, i.e move the Next tabs to the left
                    _adjustLeftPosition();
                    // Check if the tab closed was the last tab than navigate the second last tab
                    // to the position of the last tab
                    /* if(isLastTab)
                    {
                      return;
                      // Adjust the position of last tab
                      var m = parseFloat($lis.first().css('margin-left')) + thisTabWidth;
                      $lis.css('margin-left',m)
                    } */
                });
                _updateCurrentTab($tabs.find('li').eq(0));
                $(window).on('resize', debounceEvent(_showNavsIfNeeded));
            }
            /**
             * Check if navigation need then show; otherwise hide it
             */
            function _showNavsIfNeeded() {
                if (opts.showNavWhenNeeded === false) {
                    return; // do nothing
                }
                log(_liWidth() + ', ' + $scrollDiv.width());
                // Get the width of all tabs and compare it with the width of $ul (container)
                if ((_liWidth() + ($leftArrowWrapper.width() * 2)) >= $scrollDiv.width()) {
                    $leftArrowWrapper.css('visibility', 'visible').show();
                    $rightArrowWrapper.css('visibility', 'visible').show();
                }
                else {
                    $leftArrowWrapper.css('visibility', 'hidden').hide();
                    $rightArrowWrapper.css('visibility', 'hidden').hide();
                }
                _offsetTabsBasedOnNavControls();
            }
            function _callBackFnc(fName, event, arg1) {
                if ($.isFunction(fName)) {
                    fName(event, arg1);
                }
            }
            /**
             * returns the delta that should be added to current scroll to bring it into view
             * @param $tab tab that should be tested
             */
            function _getScrollDeltaValue($tab) {
                // If no tab is provided than take the current
                $tab = $tab || $curSelectedTab;
                var leftPosition = $tab.position();
                var width = $tab.outerWidth();
                var currentScroll = $scrollDiv.scrollLeft();
                var currentVisibleWidth = $scrollDiv.width();
                var hiddenDirection = 0;
                // Check if the new tab is in view
                if (leftPosition.left < currentScroll) {
                    hiddenDirection = leftPosition.left - currentScroll;
                }
                else if (leftPosition.left + width > currentScroll + currentVisibleWidth) {
                    hiddenDirection = (leftPosition.left + width) - (currentScroll + currentVisibleWidth);
                }
                return hiddenDirection;
            }
            function _animateTabTo($tab, tabIndex, e) {
                $tab = $tab || $curSelectedTab;
                var calculatedDelta = _getScrollDeltaValue($tab);
                $scrollDiv.stop().animate({
                    scrollLeft: $scrollDiv.scrollLeft() + calculatedDelta
                }, opts.scrollSpeed, opts.easing);
                if (opts.selectTabAfterScroll && tabIndex !== null) {
                    $tabs.tabs('option', 'active', tabIndex);
                }
                else {
                    // Update current tab
                    // Means this method is called from showTab event so tab css is already updated
                    if (tabIndex > -1) {
                        // d($tab);
                        _updateCurrentTab($tab);
                        // d($curSelectedTab);
                    }
                }
                // Callback
                e = (typeof e === 'undefined') ? null : e;
                _callBackFnc(opts.onTabScroll, e, $tab);
                // Finally stop the event
                if (e) {
                    e.preventDefault();
                }
            }
            /**
             * Return a new jQuery object for user provided selectors or else use the default ones
             * @param col if selector is provided by user, then override the existing controls
             * @param nav Nav control selector option prop name suffix
             */
            function _getCustomNavSelector(col, nav) {
                var sel = opts['customNav' + nav] || '';
                // Check for custom selector
                if (typeof sel === 'string' && $.trim(sel) !== '') {
                    col = col.add(sel);
                }
                return col;
            }
            /**
             * This function add the navigation control and binds the required events
             */
            function _addNavEvents() {
                // Handle next tab
                $navNext = $navNext || $();
                $navNext = _getCustomNavSelector($navNext, 'Next');
                $navNext.on('click', debounceEvent(_moveToNextTab));
                // Handle previous tab
                $navPrev = $navPrev || $();
                $navPrev = _getCustomNavSelector($navPrev, 'Prev');
                $navPrev.on('click', debounceEvent(_moveToPrevTab));
                // Handle First tab
                $navFirst = $navFirst || $();
                $navFirst = _getCustomNavSelector($navFirst, 'First');
                $navFirst.on('click', debounceEvent(_moveToFirstTab));
                // Handle last tab
                $navLast = $navLast || $();
                $navLast = _getCustomNavSelector($navLast, 'Last');
                $navLast.on('click', debounceEvent(_moveToLastTab));
            }
            function _moveToNextTab(e) {
                e.preventDefault();
                var $nxtLi = $();
                // First check if user do not want to select tab on Next
                // than we have to find the next hidden (out of viewport) tab so we can scroll to it
                if (!opts.selectTabAfterScroll) {
                    $curSelectedTab.nextAll('li').each(function () {
                        if (_getScrollDeltaValue($(this))) {
                            $nxtLi = $(this);
                            return;
                        }
                    });
                }
                else {
                    $nxtLi = $curSelectedTab.next('li');
                }
                // check if there is no next tab
                if ($nxtLi.length === 0) {
                    log('You are on last tab, no next tab found.');
                }
                else {
                    // get index of next element
                    var indexNextTab = $lis.index($nxtLi);
                    // check if li next to selected is in view or not
                    if (_getScrollDeltaValue($nxtLi)) {
                        _animateTabTo($nxtLi, indexNextTab, e);
                    }
                    else {
                        $tabs.tabs('option', 'active', indexNextTab);
                    }
                }
            }
            function _moveToPrevTab(e) {
                e.preventDefault();
                var $prvLi = $();
                // First check if user do not want to select tab on Prev
                // than we have to find the prev hidden (out of viewport) tab so we can scroll to it
                if (!opts.selectTabAfterScroll) {
                    // Reverse the order of tabs list
                    $($lis.get().reverse()).each(function () {
                        if (_getScrollDeltaValue($(this))) {
                            $prvLi = $(this);
                            return;
                        }
                    });
                }
                else {
                    $prvLi = $curSelectedTab.prev('li');
                }
                if ($prvLi.length === 0) {
                    log('There is no previous tab. NO PREV TAB');
                }
                else {
                    // Get index of prev element
                    var indexPrevTab = $lis.index($prvLi);
                    // check if li previous to selected is in view or not
                    if (_getScrollDeltaValue($prvLi)) {
                        _animateTabTo($prvLi, indexPrevTab, e);
                    }
                    else {
                        $tabs.tabs('option', 'active', indexPrevTab);
                    }
                }
            }
            function _moveToFirstTab(e) {
                if (e) {
                    e.preventDefault();
                }
                if ($lis.index($curSelectedTab) === 0) {
                    log('You are on first tab already');
                }
                else {
                    _animateTabTo($lis.first(), 0, e);
                }
            }
            function _moveToLastTab(e) {
                e.preventDefault();
                var $lstLi = $curSelectedTab.next('li');
                if ($lstLi.length === 0) {
                    log('You are already on the last tab. there is no more last tab.');
                    return;
                }
                else {
                    var indexLastTab = getTabCount() - 1;
                    _animateTabTo($lis.last(), indexLastTab, e);
                }
            }
            function _updateCurrentTab($li) {
                // Remove current class from other tabs
                $ul.find('.stCurrentTab').removeClass('stCurrentTab');
                // Add class to the current tab to which it is scrolled and updated the variable
                $curSelectedTab = $li.addClass('stCurrentTab');
            }
            function _liWidth($tab) {
                var w;
                w = 0;
                $lis.each(function () {
                    w += $(this).outerWidth();
                });
                // 20px buffer is for vertical scrollbars if any
                return w;
            }
            function _addclosebutton($li) {
                if (opts.closable === false) {
                    return;
                }
                // If li is provide than just add to that, otherwise add to all
                var lis = $li || $lis;
                lis.each(function () {
                    var $thisLi = $(this).addClass('stHasCloseBtn');
                    $thisLi.append($('<span class="ui-state-default ui-corner-all stCloseBtn">' +
                        '<span class="ui-icon ui-icon-circle-close" title="Close this tab">Close</span>' +
                        '</span>'));
                    $thisLi.find('.stCloseBtn').hover(function () {
                        $(this).toggleClass('ui-state-hover');
                    });
                    $thisLi.find('.ui-icon-circle-close').on('click', function (e) {
                        removeTab($thisLi.find('a.ui-tabs-anchor'));
                    });
                });
            }
            function removeTab(anc) {
                var tabId = anc.attr('href');
                // Remove the panel
                $(tabId).remove();
                // Refresh the tabs widget
                $tabs.tabs('refresh');
                // Remove the tab
                anc.closest('li').remove();
            }
            function _getNavPairWidth(single) {
                // // Check if its visible
                // if ($arrowsNav.css('visibility') === 'hidden') {
                //   return 0;
                // }
                // // If no nav than width is zero - take any of the nav say prev and
                // // multiply it with 2 IF we first/last nav are shown else with just 1 (its own width)
                // const w = opts.hideDefaultArrows ? 0 :
                //   $navPrev.outerWidth() * (opts.showFirstLastArrows ? 2 : 1);
                // return single ? w / 2 : w;
                return 0;
            }
            function _adjustLeftPosition($li) {
                // If li is provided, find the left and width of second last (last is the new tab) tab
                // and assign it to the new tab
                if ($li) {
                    if ($lis.length === 1) {
                        return;
                    }
                    var $thisPrev = void 0;
                    var newLeft = void 0;
                    $thisPrev = $li.prev('li') || $lis.first();
                    newLeft = parseFloat($thisPrev.css('left'));
                    // d(newLeft);
                    newLeft = isNaN(newLeft) ? 0 : newLeft;
                    newLeft = newLeft + $thisPrev.outerWidth(true) + 4;
                    // Assign
                    $li.css({
                        'left': newLeft,
                        'margin-left': $thisPrev.css('margin-left')
                    });
                    return;
                }
                // Add css class n take its left value to start the total width of tabs
                var pairWidth;
                var leftPush;
                pairWidth = _getNavPairWidth();
                leftPush = pairWidth === 0 ? 3 : pairWidth + 2;
                $lis.first().addClass('stFirstTab').css({
                    'left': leftPush,
                    'margin-left': 0
                });
                var tw = leftPush;
                // Take left margin if any
                var leftMargin = parseFloat($lis.last().prev('li').css('margin-left'));
                $ul.find('li:not(:first)').each(function () {
                    var currentLi = $(this);
                    currentLi.css('margin-left', 0);
                    tw += $(this).prev('li').outerWidth(true);
                    // Apply the css
                    if (opts.animateTabs) {
                        currentLi.animate({ left: tw });
                    }
                    else {
                        currentLi.css({ left: tw });
                    }
                    // log($(this));
                });
                $lis.css('margin-left', leftMargin);
            }
            _init();
        });
    };
})(jQuery);
