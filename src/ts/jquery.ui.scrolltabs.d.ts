interface JQuery<TElement extends Node = HTMLElement> {
  scrollTabs: (options?: any) => JQuery<HTMLElement>;
  swipe: JQuerySwipe<HTMLElement>;
  mousewheel: JQuery<HTMLElement>;
}

declare namespace JQueryUI {
  interface UI {
    scrollTabs: (options?: any) => JQuery<HTMLElement>;
  }
}

interface SwipePhases {
  PHASE_START: string,
  PHASE_MOVE: string,
  PHASE_END: string,
  PHASE_CANCEL: string
}

interface SwipeDirections {
  LEFT: string,
  RIGHT: string,
  UP: string,
  DOWN: string,
  IN: string,
  OUT: string
}

interface JQuerySwipe<TElement extends Node = HTMLElement> {
  (options: any): JQuery<HTMLElement>;
  directions: SwipeDirections;
  phases: SwipePhases;
  [n: number]: TElement;
}

interface JQueryStatic<TElement extends Node = HTMLElement> {
  debounce: (delay: number, at_begin: any, callback?: any) => any;
  throttle: (delay: number, at_begin: any, callback?: any) => any;
}
interface ScrollTabOptions {
  /**
   * Enable animation when tab changes. Default: false
   */
  animateTabs?: boolean;
  /**
   * true: shows the navigation arrows like previous, next
   *       only when all tabs doesn't fit within the view.
   * false: always show controls.
   * Default: true
   */
  showNavWhenNeeded?: boolean;
  /**
   * provide selector for elements that should be used for next, previous,
   * GoTo first and Goto Last controls.
   * Limitation: These controls should be within the tabwrapper
   * Default: Default controls will be auto created
   */
  customNavNext?: string;
  customNavPrev?: string;
  customNavFirst?: string;
  customNavLast?: string;
  /**
   * Allow tabs to be removed dynamically using close button
   * Default: true
   */
  closable?: boolean;
  /**
   * Easing funtion to be use while animating
   * Css animations like linear, ease-in-out etc., can be used
   * Default: swing
   */
  easing?: string;
  /**
   * Last tab is selected as an default active
   * Default: false - first tab will be active on initial load
   */
  loadLastTab?: boolean;
  /**
   * Add custom callback fn to be triggered after tab scroll animation
   * completion
   * Default: empty callback function
   */
  onTabScroll?: () => void;
  /**
   * Control speed of the animations
   * Default: 500ms
   */
  scrollSpeed?: number;
  /**
   * Enable auto select of new tab, when it is added
   * Default: true
   */
  selectTabOnAdd?: boolean;
  /**
   * Select the tab on navigating using previous & next buttons
   * Default: true
   */
  selectTabAfterScroll?: boolean;
  /**
   * Enable goto first or last arrows
   * Default: true
   */
  showFirstLastArrows?: boolean;
  /**
   * Hide previous and next arrows
   * Default: false
   */
  hideDefaultArrows?: boolean;
  /**
   * The styling of outer controls done based on this option
   * true: if next & previous control comes as the outer control
   * false: if first & last buttons comes as the outer control
   * Default: false
   */
  nextPrevOutward?: boolean;
  /**
   * Css class name to be added to the tab outer div
   * Default: '' or empty
   */
  wrapperCssClass?: string;
  /**
   * Enable debugging information to be logged in the console
   * Default: false
   */
  enableDebug: boolean;
  [propName: string]: any;
}
