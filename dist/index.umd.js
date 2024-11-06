(function(global, factory) {
  typeof exports === "object" && typeof module !== "undefined" ? factory(exports, require("vue")) : typeof define === "function" && define.amd ? define(["exports", "vue"], factory) : (global = typeof globalThis !== "undefined" ? globalThis : global || self, factory(global["vue-exit-intent"] = {}, global.Vue));
})(this, function(exports2, vue) {
  "use strict";
  const defaultOptions = {
    repeatAfterDays: 0,
    scrollPercentageToTrigger: 0,
    delaySecondsAndTrigger: 0,
    triggerOnExitIntent: true,
    touchDeviceSensitivity: 15,
    scrollDebounceMillis: 300,
    triggerOnPageLoad: false,
    handleScrollBars: false,
    LSItemKey: "vue-exit-intent",
    setupBeforeMount: false,
    inactiveSeconds: 0
  };
  function mouseHandler(callback, options = { sensitivity: 8, threshold: 50 }) {
    let mousePosition = { x: null, y: null };
    let lastX = 0;
    let lastY = 0;
    let velocity = { x: 0, y: 0 };
    let velocityTimer = null;
    let mouseLeaveTimeout = null;
    let hasTriggered = false;
    let boundaries = {
      top: 0,
      right: window.innerWidth,
      bottom: window.innerHeight,
      left: 0
    };
    const updateBoundaries = () => {
      boundaries = {
        top: 0,
        right: window.innerWidth,
        bottom: window.innerHeight,
        left: 0
      };
    };
    const isNearEdge = (x, y) => {
      return y <= boundaries.top + options.threshold || // Top edge
      x >= boundaries.right - options.threshold || // Right edge
      y >= boundaries.bottom - options.threshold || // Bottom edge
      x <= boundaries.left + options.threshold;
    };
    const isMovingTowardsEdge = (x, y) => {
      if (y <= boundaries.top + options.threshold) {
        return velocity.y > options.sensitivity && velocity.x < velocity.y * 2;
      }
      if (x >= boundaries.right - options.threshold) {
        return velocity.x > options.sensitivity && velocity.y < velocity.x * 2;
      }
      if (y >= boundaries.bottom - options.threshold) {
        return velocity.y > options.sensitivity && velocity.x < velocity.y * 2;
      }
      if (x <= boundaries.left + options.threshold) {
        return velocity.x > options.sensitivity && velocity.y < velocity.x * 2;
      }
      return false;
    };
    const triggerCallback = () => {
      if (!hasTriggered) {
        hasTriggered = true;
        callback();
        removeMouseLeaveListeners();
      }
    };
    const handleMouseMove = (e) => {
      if (hasTriggered)
        return;
      mousePosition = { x: e.clientX, y: e.clientY };
      velocity = {
        x: Math.abs(e.clientX - lastX),
        y: Math.abs(e.clientY - lastY)
      };
      lastX = e.clientX;
      lastY = e.clientY;
      if (velocityTimer)
        window.clearTimeout(velocityTimer);
      velocityTimer = window.setTimeout(() => {
        velocity = { x: 0, y: 0 };
      }, 50);
      if (isNearEdge(e.clientX, e.clientY) && isMovingTowardsEdge(e.clientX, e.clientY)) {
        triggerCallback();
      }
    };
    const handleMouseLeave = (e) => {
      if (hasTriggered)
        return;
      if (e.relatedTarget)
        return;
      if (isNearEdge(e.clientX, e.clientY)) {
        if (mouseLeaveTimeout)
          window.clearTimeout(mouseLeaveTimeout);
        mouseLeaveTimeout = window.setTimeout(() => {
          const mouseEvent = new MouseEvent("mousemove", {
            bubbles: true,
            cancelable: true,
            view: window,
            clientX: 0,
            clientY: 0
          });
          document.dispatchEvent(mouseEvent);
          if (!mousePosition.x && !mousePosition.y) {
            triggerCallback();
          }
        }, 100);
      }
    };
    const handleVisibilityChange = () => {
      if (document.hidden && !hasTriggered) {
        triggerCallback();
      }
    };
    const handleResize = () => {
      updateBoundaries();
    };
    const addMouseListener = () => {
      updateBoundaries();
      document.addEventListener("mousemove", handleMouseMove);
      document.addEventListener("mouseleave", handleMouseLeave);
      document.addEventListener("visibilitychange", handleVisibilityChange);
      window.addEventListener("resize", handleResize);
    };
    const removeMouseLeaveListeners = () => {
      document.removeEventListener("mousemove", handleMouseMove);
      document.removeEventListener("mouseleave", handleMouseLeave);
      document.removeEventListener("visibilitychange", handleVisibilityChange);
      window.removeEventListener("resize", handleResize);
      if (velocityTimer)
        window.clearTimeout(velocityTimer);
      if (mouseLeaveTimeout)
        window.clearTimeout(mouseLeaveTimeout);
    };
    const reset = () => {
      hasTriggered = false;
      addMouseListener();
    };
    return {
      addMouseListener,
      removeMouseLeaveListeners,
      reset
    };
  }
  const scrollHandler = (options, callback) => {
    const debouncedScrollHandler = debounce(
      callback,
      options.scrollDebounceMillis
    );
    const addScrollListener = () => {
      window.addEventListener("scroll", debouncedScrollHandler);
    };
    const removeScrollListeners = () => {
      window.removeEventListener("scroll", debouncedScrollHandler);
    };
    return {
      addScrollListener,
      removeScrollListeners
    };
  };
  function touchDeviceHandler(options, callback) {
    let startY = 0;
    let scrolling = false;
    let lastTimestamp = 0;
    const onTouchStart = (event) => {
      if (window.pageYOffset === 0) {
        return;
      }
      scrolling = true;
      startY = event.touches[0].clientY;
      lastTimestamp = Date.now();
    };
    const onTouchMove = (event) => {
      if (!scrolling) {
        return;
      }
      const distance = event.touches[0].clientY - startY;
      if (distance < 0) {
        return;
      }
      const timeNow = Date.now();
      const elapsed = timeNow - lastTimestamp;
      const velocity = distance / elapsed;
      if (velocity * options.touchDeviceSensitivity > 100) {
        scrolling = false;
        callback();
      }
      lastTimestamp = timeNow;
    };
    const onTouchEnd = () => {
      scrolling = false;
    };
    const addTouchListeners = () => {
      document.addEventListener("touchstart", onTouchStart);
      document.addEventListener("touchmove", onTouchMove);
      document.addEventListener("touchend", onTouchEnd);
    };
    const removeTouchDeviceListeners = () => {
      document.removeEventListener("touchstart", onTouchStart);
      document.removeEventListener("touchmove", onTouchMove);
      document.removeEventListener("touchend", onTouchEnd);
    };
    return {
      addTouchListeners,
      removeTouchDeviceListeners
    };
  }
  function debounce(func, wait = 300) {
    let timeoutId;
    return function(...args) {
      clearTimeout(timeoutId);
      timeoutId = setTimeout(() => func.apply(this, args), wait);
    };
  }
  function isLocalStorageExpired(options) {
    const oldMillis = localStorage.getItem(options.LSItemKey);
    if (oldMillis) {
      if (options.repeatAfterDays === 0)
        return false;
      const currentMillis = Date.now();
      return currentMillis - parseInt(oldMillis) > options.repeatAfterDays * 864e5 ? true : false;
    } else {
      return true;
    }
  }
  function isTouchDevice() {
    return "ontouchstart" in window || navigator.maxTouchPoints > 0 || matchMedia("(pointer:coarse)").matches;
  }
  function useVueExitIntent(userOptions = {}) {
    const options = { ...defaultOptions, ...userOptions };
    const unsubscribedLSItemKey = options.LSItemKey + "-unsubscribed";
    const isShowing = vue.ref(false);
    const isAllowedToGetTriggered = vue.ref(false);
    const isUnsubscribed = vue.ref(false);
    const { addMouseListener, removeMouseLeaveListeners } = mouseHandler(fire);
    const { addScrollListener, removeScrollListeners } = scrollHandler(
      options,
      fire
    );
    const { addTouchListeners, removeTouchDeviceListeners } = touchDeviceHandler(
      options,
      fire
    );
    function close() {
      isShowing.value = false;
      if (options.handleScrollBars)
        document.body.style.overflowY = "auto";
    }
    function fire() {
      isShowing.value = true;
      isAllowedToGetTriggered.value = false;
      localStorage.setItem(options.LSItemKey, JSON.stringify(Date.now()));
      if (options.handleScrollBars)
        document.body.style.overflowY = "hidden";
    }
    function resetState() {
      localStorage.removeItem(options.LSItemKey);
      localStorage.removeItem(unsubscribedLSItemKey);
      isShowing.value = false;
      isAllowedToGetTriggered.value = true;
      isUnsubscribed.value = false;
    }
    function unsubscribe() {
      localStorage.setItem(unsubscribedLSItemKey, true.toString());
      isUnsubscribed.value = true;
      isAllowedToGetTriggered.value = false;
    }
    const setup = () => {
      const unsubscribedValue = localStorage.getItem(unsubscribedLSItemKey);
      isUnsubscribed.value = unsubscribedValue ? JSON.parse(unsubscribedValue) : false;
      isAllowedToGetTriggered.value = isLocalStorageExpired(options) && !isUnsubscribed.value;
    };
    const addListeners = () => {
      if (options.triggerOnExitIntent) {
        if (options.touchDeviceSensitivity && isTouchDevice()) {
          addTouchListeners();
        } else {
          addMouseListener();
        }
      }
      if (options.scrollPercentageToTrigger) {
        addScrollListener();
      }
    };
    const initialize = () => {
      if (options.delaySecondsAndTrigger) {
        setTimeout(() => {
          fire();
        }, options.delaySecondsAndTrigger * 1e3);
      }
      if (options.triggerOnPageLoad) {
        fire();
      }
      if (options.inactiveSeconds) {
        setTimeout(() => {
          addListeners();
        }, options.inactiveSeconds * 1e3);
      } else {
        addListeners();
      }
    };
    const disable = () => {
      removeMouseLeaveListeners();
      removeScrollListeners();
      removeTouchDeviceListeners();
    };
    vue.watch(isAllowedToGetTriggered, (newValue) => {
      if (newValue) {
        initialize();
      } else {
        disable();
      }
    });
    if (options.setupBeforeMount) {
      vue.onBeforeMount(() => {
        setup();
      });
    } else {
      vue.onMounted(() => {
        setup();
      });
    }
    return {
      isShowing,
      isAllowedToGetTriggered,
      isUnsubscribed,
      close,
      resetState,
      unsubscribe
    };
  }
  exports2.useVueExitIntent = useVueExitIntent;
  Object.defineProperty(exports2, Symbol.toStringTag, { value: "Module" });
});
