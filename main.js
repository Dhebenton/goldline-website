// ============================================================
//  LENIS SMOOTH SCROLL (inlined)
// ============================================================

(function(){var e=`1.3.23`;function t(e,t,n){return Math.max(e,Math.min(t,n))}function n(e,t,n){return(1-n)*e+n*t}function r(e,t,r,i){return n(e,t,1-Math.exp(-r*i))}function i(e,t){return(e%t+t)%t}var a=class{isRunning=!1;value=0;from=0;to=0;currentTime=0;lerp;duration;easing;onUpdate;advance(e){if(!this.isRunning)return;let n=!1;if(this.duration&&this.easing){this.currentTime+=e;let r=t(0,this.currentTime/this.duration,1);n=r>=1;let i=n?1:this.easing(r);this.value=this.from+(this.to-this.from)*i}else this.lerp?(this.value=r(this.value,this.to,this.lerp*60,e),Math.round(this.value)===Math.round(this.to)&&(this.value=this.to,n=!0)):(this.value=this.to,n=!0);n&&this.stop(),this.onUpdate?.(this.value,n)}stop(){this.isRunning=!1}fromTo(e,t,{lerp:n,duration:r,easing:i,onStart:a,onUpdate:o}){this.from=this.value=e,this.to=t,this.lerp=n,this.duration=r,this.easing=i,this.currentTime=0,this.isRunning=!0,a?.(),this.onUpdate=o}};function o(e,t){let n;return function(...r){clearTimeout(n),n=setTimeout(()=>{n=void 0,e.apply(this,r)},t)}}var s=class{width=0;height=0;scrollHeight=0;scrollWidth=0;debouncedResize;wrapperResizeObserver;contentResizeObserver;constructor(e,t,{autoResize:n=!0,debounce:r=250}={}){this.wrapper=e,this.content=t,n&&(this.debouncedResize=o(this.resize,r),this.wrapper instanceof Window?window.addEventListener(`resize`,this.debouncedResize):(this.wrapperResizeObserver=new ResizeObserver(this.debouncedResize),this.wrapperResizeObserver.observe(this.wrapper)),this.contentResizeObserver=new ResizeObserver(this.debouncedResize),this.contentResizeObserver.observe(this.content)),this.resize()}destroy(){this.wrapperResizeObserver?.disconnect(),this.contentResizeObserver?.disconnect(),this.wrapper===window&&this.debouncedResize&&window.removeEventListener(`resize`,this.debouncedResize)}resize=()=>{this.onWrapperResize(),this.onContentResize()};onWrapperResize=()=>{this.wrapper instanceof Window?(this.width=window.innerWidth,this.height=window.innerHeight):(this.width=this.wrapper.clientWidth,this.height=this.wrapper.clientHeight)};onContentResize=()=>{this.wrapper instanceof Window?(this.scrollHeight=this.content.scrollHeight,this.scrollWidth=this.content.scrollWidth):(this.scrollHeight=this.wrapper.scrollHeight,this.scrollWidth=this.wrapper.scrollWidth)};get limit(){return{x:this.scrollWidth-this.width,y:this.scrollHeight-this.height}}},c=class{events={};emit(e,...t){let n=this.events[e]||[];for(let e=0,r=n.length;e<r;e++)n[e]?.(...t)}on(e,t){return this.events[e]?this.events[e].push(t):this.events[e]=[t],()=>{this.events[e]=this.events[e]?.filter(e=>t!==e)}}off(e,t){this.events[e]=this.events[e]?.filter(e=>t!==e)}destroy(){this.events={}}};let l={passive:!1};function u(e,t){return e===1?16.666666666666668:e===2?t:1}var d=class{touchStart={x:0,y:0};lastDelta={x:0,y:0};window={width:0,height:0};emitter=new c;constructor(e,t={wheelMultiplier:1,touchMultiplier:1}){this.element=e,this.options=t,window.addEventListener(`resize`,this.onWindowResize),this.onWindowResize(),this.element.addEventListener(`wheel`,this.onWheel,l),this.element.addEventListener(`touchstart`,this.onTouchStart,l),this.element.addEventListener(`touchmove`,this.onTouchMove,l),this.element.addEventListener(`touchend`,this.onTouchEnd,l)}on(e,t){return this.emitter.on(e,t)}destroy(){this.emitter.destroy(),window.removeEventListener(`resize`,this.onWindowResize),this.element.removeEventListener(`wheel`,this.onWheel,l),this.element.removeEventListener(`touchstart`,this.onTouchStart,l),this.element.removeEventListener(`touchmove`,this.onTouchMove,l),this.element.removeEventListener(`touchend`,this.onTouchEnd,l)}onTouchStart=e=>{let{clientX:t,clientY:n}=e.targetTouches?e.targetTouches[0]:e;this.touchStart.x=t,this.touchStart.y=n,this.lastDelta={x:0,y:0},this.emitter.emit(`scroll`,{deltaX:0,deltaY:0,event:e})};onTouchMove=e=>{let{clientX:t,clientY:n}=e.targetTouches?e.targetTouches[0]:e,r=-(t-this.touchStart.x)*this.options.touchMultiplier,i=-(n-this.touchStart.y)*this.options.touchMultiplier;this.touchStart.x=t,this.touchStart.y=n,this.lastDelta={x:r,y:i},this.emitter.emit(`scroll`,{deltaX:r,deltaY:i,event:e})};onTouchEnd=e=>{this.emitter.emit(`scroll`,{deltaX:this.lastDelta.x,deltaY:this.lastDelta.y,event:e})};onWheel=e=>{let{deltaX:t,deltaY:n,deltaMode:r}=e,i=u(r,this.window.width),a=u(r,this.window.height);t*=i,n*=a,t*=this.options.wheelMultiplier,n*=this.options.wheelMultiplier,this.emitter.emit(`scroll`,{deltaX:t,deltaY:n,event:e})};onWindowResize=()=>{this.window={width:window.innerWidth,height:window.innerHeight}}};let f=e=>Math.min(1,1.001-2**(-10*e));var p=class{_isScrolling=!1;_isStopped=!1;_isLocked=!1;_preventNextNativeScrollEvent=!1;_resetVelocityTimeout=null;_rafId=null;isTouching;time=0;userData={};lastVelocity=0;velocity=0;direction=0;options;targetScroll;animatedScroll;animate=new a;emitter=new c;dimensions;virtualScroll;constructor({wrapper:t=window,content:n=document.documentElement,eventsTarget:r=t,smoothWheel:i=!0,syncTouch:a=!1,syncTouchLerp:o=.075,touchInertiaExponent:c=1.7,duration:l,easing:u,lerp:p=.1,infinite:m=!1,orientation:h=`vertical`,gestureOrientation:g=h===`horizontal`?`both`:`vertical`,touchMultiplier:_=1,wheelMultiplier:v=1,autoResize:y=!0,prevent:b,virtualScroll:x,overscroll:S=!0,autoRaf:C=!1,anchors:w=!1,autoToggle:T=!1,allowNestedScroll:E=!1,__experimental__naiveDimensions:D=!1,naiveDimensions:O=D,stopInertiaOnNavigate:k=!1}={}){window.lenisVersion=e,window.lenis||(window.lenis={}),window.lenis.version=e,h===`horizontal`&&(window.lenis.horizontal=!0),a===!0&&(window.lenis.touch=!0),(!t||t===document.documentElement)&&(t=window),typeof l==`number`&&typeof u!=`function`?u=f:typeof u==`function`&&typeof l!=`number`&&(l=1),this.options={wrapper:t,content:n,eventsTarget:r,smoothWheel:i,syncTouch:a,syncTouchLerp:o,touchInertiaExponent:c,duration:l,easing:u,lerp:p,infinite:m,gestureOrientation:g,orientation:h,touchMultiplier:_,wheelMultiplier:v,autoResize:y,prevent:b,virtualScroll:x,overscroll:S,autoRaf:C,anchors:w,autoToggle:T,allowNestedScroll:E,naiveDimensions:O,stopInertiaOnNavigate:k},this.dimensions=new s(t,n,{autoResize:y}),this.updateClassName(),this.targetScroll=this.animatedScroll=this.actualScroll,this.options.wrapper.addEventListener(`scroll`,this.onNativeScroll),this.options.wrapper.addEventListener(`scrollend`,this.onScrollEnd,{capture:!0}),(this.options.anchors||this.options.stopInertiaOnNavigate)&&this.options.wrapper.addEventListener(`click`,this.onClick),this.options.wrapper.addEventListener(`pointerdown`,this.onPointerDown),this.virtualScroll=new d(r,{touchMultiplier:_,wheelMultiplier:v}),this.virtualScroll.on(`scroll`,this.onVirtualScroll),this.options.autoToggle&&(this.checkOverflow(),this.rootElement.addEventListener(`transitionend`,this.onTransitionEnd)),this.options.autoRaf&&(this._rafId=requestAnimationFrame(this.raf))}destroy(){this.emitter.destroy(),this.options.wrapper.removeEventListener(`scroll`,this.onNativeScroll),this.options.wrapper.removeEventListener(`scrollend`,this.onScrollEnd,{capture:!0}),this.options.wrapper.removeEventListener(`pointerdown`,this.onPointerDown),(this.options.anchors||this.options.stopInertiaOnNavigate)&&this.options.wrapper.removeEventListener(`click`,this.onClick),this.virtualScroll.destroy(),this.dimensions.destroy(),this.cleanUpClassName(),this._rafId&&cancelAnimationFrame(this._rafId)}on(e,t){return this.emitter.on(e,t)}off(e,t){return this.emitter.off(e,t)}onScrollEnd=e=>{e instanceof CustomEvent||(this.isScrolling===`smooth`||this.isScrolling===!1)&&e.stopPropagation()};dispatchScrollendEvent=()=>{this.options.wrapper.dispatchEvent(new CustomEvent(`scrollend`,{bubbles:this.options.wrapper===window,detail:{lenisScrollEnd:!0}}))};get overflow(){let e=this.isHorizontal?`overflow-x`:`overflow-y`;return getComputedStyle(this.rootElement)[e]}checkOverflow(){[`hidden`,`clip`].includes(this.overflow)?this.internalStop():this.internalStart()}onTransitionEnd=e=>{e.propertyName?.includes(`overflow`)&&e.target===this.rootElement&&this.checkOverflow()};setScroll(e){this.isHorizontal?this.options.wrapper.scrollTo({left:e,behavior:`instant`}):this.options.wrapper.scrollTo({top:e,behavior:`instant`})}onClick=e=>{let t=e.composedPath().filter(e=>e instanceof HTMLAnchorElement&&e.href).map(e=>new URL(e.href)),n=new URL(window.location.href);if(this.options.anchors){let e=t.find(e=>n.host===e.host&&n.pathname===e.pathname&&e.hash);if(e){let t=typeof this.options.anchors==`object`&&this.options.anchors?this.options.anchors:void 0,n=`#${e.hash.split(`#`)[1]}`;this.scrollTo(n,t);return}}if(this.options.stopInertiaOnNavigate&&t.some(e=>n.host===e.host&&n.pathname!==e.pathname)){this.reset();return}};onPointerDown=e=>{e.button===1&&this.reset()};onVirtualScroll=e=>{if(typeof this.options.virtualScroll==`function`&&this.options.virtualScroll(e)===!1)return;let{deltaX:t,deltaY:n,event:r}=e;if(this.emitter.emit(`virtual-scroll`,{deltaX:t,deltaY:n,event:r}),r.ctrlKey||r.lenisStopPropagation)return;let i=r.type.includes(`touch`),a=r.type.includes(`wheel`);this.isTouching=r.type===`touchstart`||r.type===`touchmove`;let o=t===0&&n===0;if(this.options.syncTouch&&i&&r.type===`touchstart`&&o&&!this.isStopped&&!this.isLocked){this.reset();return}let s=this.options.gestureOrientation===`vertical`&&n===0||this.options.gestureOrientation===`horizontal`&&t===0;if(o||s)return;let c=r.composedPath();c=c.slice(0,c.indexOf(this.rootElement));let l=this.options.prevent,u=Math.abs(t)>=Math.abs(n)?`horizontal`:`vertical`;if(c.find(e=>e instanceof HTMLElement&&(typeof l==`function`&&l?.(e)||e.hasAttribute?.(`data-lenis-prevent`)||u===`vertical`&&e.hasAttribute?.(`data-lenis-prevent-vertical`)||u===`horizontal`&&e.hasAttribute?.(`data-lenis-prevent-horizontal`)||i&&e.hasAttribute?.(`data-lenis-prevent-touch`)||a&&e.hasAttribute?.(`data-lenis-prevent-wheel`)||this.options.allowNestedScroll&&this.hasNestedScroll(e,{deltaX:t,deltaY:n}))))return;if(this.isStopped||this.isLocked){r.cancelable&&r.preventDefault();return}if(!(this.options.syncTouch&&i||this.options.smoothWheel&&a)){this.isScrolling=`native`,this.animate.stop(),r.lenisStopPropagation=!0;return}let d=n;this.options.gestureOrientation===`both`?d=Math.abs(n)>Math.abs(t)?n:t:this.options.gestureOrientation===`horizontal`&&(d=t),(!this.options.overscroll||this.options.infinite||this.options.wrapper!==window&&this.limit>0&&(this.animatedScroll>0&&this.animatedScroll<this.limit||this.animatedScroll===0&&n>0||this.animatedScroll===this.limit&&n<0))&&(r.lenisStopPropagation=!0),r.cancelable&&r.preventDefault();let f=i&&this.options.syncTouch,p=i&&r.type===`touchend`;p&&(d=Math.sign(d)*Math.abs(this.velocity)**this.options.touchInertiaExponent),this.scrollTo(this.targetScroll+d,{programmatic:!1,...f?{lerp:p?this.options.syncTouchLerp:1}:{lerp:this.options.lerp,duration:this.options.duration,easing:this.options.easing}})};resize(){this.dimensions.resize(),this.animatedScroll=this.targetScroll=this.actualScroll,this.emit()}emit(){this.emitter.emit(`scroll`,this)}onNativeScroll=()=>{if(this._resetVelocityTimeout!==null&&(clearTimeout(this._resetVelocityTimeout),this._resetVelocityTimeout=null),this._preventNextNativeScrollEvent){this._preventNextNativeScrollEvent=!1;return}if(this.isScrolling===!1||this.isScrolling===`native`){let e=this.animatedScroll;this.animatedScroll=this.targetScroll=this.actualScroll,this.lastVelocity=this.velocity,this.velocity=this.animatedScroll-e,this.direction=Math.sign(this.animatedScroll-e),this.isStopped||(this.isScrolling=`native`),this.emit(),this.velocity!==0&&(this._resetVelocityTimeout=setTimeout(()=>{this.lastVelocity=this.velocity,this.velocity=0,this.isScrolling=!1,this.emit()},400))}};reset(){this.isLocked=!1,this.isScrolling=!1,this.animatedScroll=this.targetScroll=this.actualScroll,this.lastVelocity=this.velocity=0,this.animate.stop()}start(){if(this.isStopped){if(this.options.autoToggle){this.rootElement.style.removeProperty(`overflow`);return}this.internalStart()}}internalStart(){this.isStopped&&(this.reset(),this.isStopped=!1,this.emit())}stop(){if(!this.isStopped){if(this.options.autoToggle){this.rootElement.style.setProperty(`overflow`,`clip`);return}this.internalStop()}}internalStop(){this.isStopped||(this.reset(),this.isStopped=!0,this.emit())}raf=e=>{let t=e-(this.time||e);this.time=e,this.animate.advance(t*.001),this.options.autoRaf&&(this._rafId=requestAnimationFrame(this.raf))};scrollTo(e,{offset:n=0,immediate:r=!1,lock:i=!1,programmatic:a=!0,lerp:o=a?this.options.lerp:void 0,duration:s=a?this.options.duration:void 0,easing:c=a?this.options.easing:void 0,onStart:l,onComplete:u,force:d=!1,userData:p}={}){if((this.isStopped||this.isLocked)&&!d)return;let m=e,h=n;if(typeof m==`string`&&[`top`,`left`,`start`,`#`].includes(m))m=0;else if(typeof m==`string`&&[`bottom`,`right`,`end`].includes(m))m=this.limit;else{let e=null;if(typeof m==`string`?(e=document.querySelector(m),e||(m===`#top`?m=0:console.warn(`Lenis: Target not found`,m))):m instanceof HTMLElement&&m?.nodeType&&(e=m),e){if(this.options.wrapper!==window){let e=this.rootElement.getBoundingClientRect();h-=this.isHorizontal?e.left:e.top}let t=e.getBoundingClientRect(),n=getComputedStyle(e),r=this.isHorizontal?Number.parseFloat(n.scrollMarginLeft):Number.parseFloat(n.scrollMarginTop),i=getComputedStyle(this.rootElement),a=this.isHorizontal?Number.parseFloat(i.scrollPaddingLeft):Number.parseFloat(i.scrollPaddingTop);m=(this.isHorizontal?t.left:t.top)+this.animatedScroll-(Number.isNaN(r)?0:r)-(Number.isNaN(a)?0:a)}}if(typeof m==`number`){if(m+=h,this.options.infinite){if(a){this.targetScroll=this.animatedScroll=this.scroll;let e=m-this.animatedScroll;e>this.limit/2?m-=this.limit:e<-this.limit/2&&(m+=this.limit)}}else m=t(0,m,this.limit);if(m===this.targetScroll){l?.(this),u?.(this);return}if(this.userData=p??{},r){this.animatedScroll=this.targetScroll=m,this.setScroll(this.scroll),this.reset(),this.preventNextNativeScrollEvent(),this.emit(),u?.(this),this.userData={},requestAnimationFrame(()=>{this.dispatchScrollendEvent()});return}a||(this.targetScroll=m),typeof s==`number`&&typeof c!=`function`?c=f:typeof c==`function`&&typeof s!=`number`&&(s=1),this.animate.fromTo(this.animatedScroll,m,{duration:s,easing:c,lerp:o,onStart:()=>{i&&(this.isLocked=!0),this.isScrolling=`smooth`,l?.(this)},onUpdate:(e,t)=>{this.isScrolling=`smooth`,this.lastVelocity=this.velocity,this.velocity=e-this.animatedScroll,this.direction=Math.sign(this.velocity),this.animatedScroll=e,this.setScroll(this.scroll),a&&(this.targetScroll=e),t||this.emit(),t&&(this.reset(),this.emit(),u?.(this),this.userData={},requestAnimationFrame(()=>{this.dispatchScrollendEvent()}),this.preventNextNativeScrollEvent())}})}}preventNextNativeScrollEvent(){this._preventNextNativeScrollEvent=!0,requestAnimationFrame(()=>{this._preventNextNativeScrollEvent=!1})}hasNestedScroll(e,{deltaX:t,deltaY:n}){let r=Date.now();e._lenis||={};let i=e._lenis,a,o,s,c,l,u,d,f,p,m;if(r-(i.time??0)>2e3){i.time=Date.now();let t=window.getComputedStyle(e);if(i.computedStyle=t,a=[`auto`,`overlay`,`scroll`].includes(t.overflowX),o=[`auto`,`overlay`,`scroll`].includes(t.overflowY),l=[`auto`].includes(t.overscrollBehaviorX),u=[`auto`].includes(t.overscrollBehaviorY),i.hasOverflowX=a,i.hasOverflowY=o,!(a||o))return!1;d=e.scrollWidth,f=e.scrollHeight,p=e.clientWidth,m=e.clientHeight,s=d>p,c=f>m,i.isScrollableX=s,i.isScrollableY=c,i.scrollWidth=d,i.scrollHeight=f,i.clientWidth=p,i.clientHeight=m,i.hasOverscrollBehaviorX=l,i.hasOverscrollBehaviorY=u}else s=i.isScrollableX,c=i.isScrollableY,a=i.hasOverflowX,o=i.hasOverflowY,d=i.scrollWidth,f=i.scrollHeight,p=i.clientWidth,m=i.clientHeight,l=i.hasOverscrollBehaviorX,u=i.hasOverscrollBehaviorY;if(!(a&&s||o&&c))return!1;let h=Math.abs(t)>=Math.abs(n)?`horizontal`:`vertical`,g,_,v,y,b,x;if(h===`horizontal`)g=Math.round(e.scrollLeft),_=d-p,v=t,y=a,b=s,x=l;else if(h===`vertical`)g=Math.round(e.scrollTop),_=f-m,v=n,y=o,b=c,x=u;else return!1;return!x&&(g>=_||g<=0)?!0:(v>0?g<_:g>0)&&y&&b}get rootElement(){return this.options.wrapper===window?document.documentElement:this.options.wrapper}get limit(){return this.options.naiveDimensions?this.isHorizontal?this.rootElement.scrollWidth-this.rootElement.clientWidth:this.rootElement.scrollHeight-this.rootElement.clientHeight:this.dimensions.limit[this.isHorizontal?`x`:`y`]}get isHorizontal(){return this.options.orientation===`horizontal`}get actualScroll(){let e=this.options.wrapper;return this.isHorizontal?e.scrollX??e.scrollLeft:e.scrollY??e.scrollTop}get scroll(){return this.options.infinite?i(this.animatedScroll,this.limit):this.animatedScroll}get progress(){return this.limit===0?1:this.scroll/this.limit}get isScrolling(){return this._isScrolling}set isScrolling(e){this._isScrolling!==e&&(this._isScrolling=e,this.updateClassName())}get isStopped(){return this._isStopped}set isStopped(e){this._isStopped!==e&&(this._isStopped=e,this.updateClassName())}get isLocked(){return this._isLocked}set isLocked(e){this._isLocked!==e&&(this._isLocked=e,this.updateClassName())}get isSmooth(){return this.isScrolling===`smooth`}get className(){let e=`lenis`;return this.options.autoToggle&&(e+=` lenis-autoToggle`),this.isStopped&&(e+=` lenis-stopped`),this.isLocked&&(e+=` lenis-locked`),this.isScrolling&&(e+=` lenis-scrolling`),this.isScrolling===`smooth`&&(e+=` lenis-smooth`),e}updateClassName(){this.cleanUpClassName(),this.className.split(` `).forEach(e=>{this.rootElement.classList.add(e)})}cleanUpClassName(){for(let e of Array.from(this.rootElement.classList))(e===`lenis`||e.startsWith(`lenis-`))&&this.rootElement.classList.remove(e)}};globalThis.Lenis=p,globalThis.Lenis.prototype=p.prototype})();
//# sourceMappingURL=lenis.min.js.map


// ============================================================
//  NAV — hide on scroll down, show on scroll up
// ============================================================

(function () {
  const nav = document.querySelector('nav');
  let lastY = window.scrollY;

  window.addEventListener('scroll', () => {
    const currentY = window.scrollY;

    nav.style.transform = currentY > lastY ? 'translateY(-100%)' : 'translateY(0)';

    nav.style.borderBottom = (currentY > 0 || window.innerWidth < 530)
      ? '1px solid rgba(0, 0, 0, 0.06)'
      : '1px solid rgba(0, 0, 0, 0.0)';

    lastY = currentY;
  }, { passive: true });
})();



// ============================================================
//  LENIS INIT
// ============================================================

(function () {
  const lenis = new Lenis({
    duration: .6,
    easing: t => 1 - Math.pow(1 - t, 3),
    smoothWheel: true,
    smoothTouch: false
  });

  function raf(time) {
    lenis.raf(time);
    requestAnimationFrame(raf);
  }

  requestAnimationFrame(raf);
})();


// ============================================================
//  PHILOSOPHY SCROLL
// ============================================================

(function () {
  function initPhilosophyScroll() {
    const philSection = document.querySelector('#phillosophy-section');
    if (!philSection) return;

    const h2   = philSection.querySelector('h2');
    const tag  = philSection.querySelector('.tag');
    const imgs = Array.from(philSection.querySelectorAll('img')).filter(
      img => getComputedStyle(img).display !== 'none'
    );

    tag.style.opacity = '0';
    tag.style.filter  = 'blur(5px)';

    const block = philSection.querySelector('.block');
    if (block) block.style.transform = 'translateY(0%)';

    const isPhilMobile  = window.innerWidth < 1052;
    const revealOrder   = [...imgs].sort(() => Math.random() - 0.5);

    imgs.forEach(img => {
      const isLarge =
        (img.classList.contains('four') || img.classList.contains('six')) &&
        !isPhilMobile;

      img._startY    = isLarge ? 640 + Math.random() * 40 : 270 + Math.random() * 40;
      img._endY      = isLarge ? -50 : 0;
      img._threshold = (revealOrder.indexOf(img) + 1) / (revealOrder.length + 1);

      const sign     = Math.random() < 0.5 ? -1 : 1;
      img._targetRot = sign * (3 * Math.random());

      img.style.height    = `${(isPhilMobile ? 57 : 67) + Math.random() * 5}px`;
      img.style.width     = 'auto';
      img.style.opacity   = '0';
      img.style.filter    = 'blur(8px)';
      img.style.transform = `translateY(${img._startY}%) rotate(0deg)`;
    });

    if (isPhilMobile) {
      h2.innerHTML = h2.textContent
        .split(' ')
        .map(word => `<span style="opacity:0;filter:blur(3px)">${word}</span>`)
        .join(' ');
    } else {
      h2.innerHTML = h2.textContent
        .split('')
        .map(char => char === ' ' ? ' ' : `<span style="opacity:0;filter:blur(3px)">${char}</span>`)
        .join('');
    }

    const spans        = h2.querySelectorAll('span');
    const totalItems   = spans.length + 1;
    const tagRevealEnd = 1 / totalItems;
    const SECTION_OFFSET = philSection.offsetHeight * 0.06;
    const imgDelay     = 0.12;
    const imgScale     = 1 / (1 - imgDelay);

    window.addEventListener('scroll', () => {
      const rect     = philSection.getBoundingClientRect();
      const total    = philSection.offsetHeight - window.innerHeight * 0.3;
      const scrolled = -rect.top + window.innerHeight * 0.5 - SECTION_OFFSET;
      const progress = Math.min(Math.max(scrolled / total, 0), 1);

      if (block) {
        block.style.transform = `translateY(${progress * -60}%)`;
      }

      tag.style.opacity = progress >= tagRevealEnd ? '1' : '0';
      tag.style.filter  = progress >= tagRevealEnd ? 'blur(0px)' : 'blur(4px)';

      const revealUpTo = Math.floor(progress * totalItems) - 1;
      spans.forEach((span, i) => {
        span.style.opacity = i < revealUpTo ? '1' : '0';
        span.style.filter  = i < revealUpTo ? 'blur(0px)' : 'blur(2px)';
      });

      const imgProgress = Math.min(Math.max((progress - imgDelay) * imgScale, 0), 1);

      revealOrder.forEach(img => {
        const translateY = img._startY + imgProgress * (img._endY - img._startY);
        img.style.transform = `translateY(${translateY}%) rotate(${imgProgress * img._targetRot}deg)`;
        img.style.opacity   = imgProgress >= img._threshold ? '1' : '0';
        img.style.filter    = imgProgress >= img._threshold ? 'blur(0px)' : 'blur(8px)';
      });
    }, { passive: true });
  }

  if (document.readyState === 'loading') {
    document.addEventListener('DOMContentLoaded', initPhilosophyScroll);
  } else {
    initPhilosophyScroll();
  }
})();

// ============================================================
//  ABOUT SCROLL
// ============================================================

(function () {
  function initAboutScroll() {
    const isMobile = window.matchMedia('(max-width: 768px)').matches;

    const paras = document.querySelectorAll('#about-section .about-us-text-wrap p');
    if (!paras.length) return;

    paras.forEach(p => {
      Array.from(p.childNodes).forEach(node => {
        if (node.nodeType === Node.TEXT_NODE) {
          const frag  = document.createDocumentFragment();
          const parts = isMobile
            ? node.textContent.split(/(\s+)/)
            : [...node.textContent].map(ch => ch);

          parts.forEach(part => {
            if (!part) return;
            if (/^\s+$/.test(part) || part === ' ' || part === '\n') {
              frag.appendChild(document.createTextNode(part));
            } else {
              const span = document.createElement('span');
              span.className   = 'char reveal-text-dark';
              span.textContent = part;
              frag.appendChild(span);
            }
          });
          node.replaceWith(frag);

        } else if (node.nodeType === Node.ELEMENT_NODE && node.classList.contains('grey')) {
          const parts = node.innerHTML.split(/(<br\s*\/?>)/gi);
          node.innerHTML = parts.map(part => {
            if (/^<br/i.test(part)) return part;
            if (isMobile) {
              return part.split(/(\s+)/).map(w =>
                !w || /^\s+$/.test(w) ? w : `<span class="char reveal-text-grey">${w}</span>`
              ).join('');
            } else {
              return [...part].map(ch =>
                ch === ' ' ? ' ' : `<span class="char reveal-text-grey">${ch}</span>`
              ).join('');
            }
          }).join('');
        }
      });
    });

    const aboutSection = document.querySelector('#about-section');
    if (!aboutSection) return;

    const img      = aboutSection.querySelector('.about-us-text-wrap img');
    const allChars = Array.from(
      aboutSection.querySelectorAll('.about-us-text-wrap p .char')
    ).filter(el => el.offsetParent !== null);

    const total = allChars.length;
    if (!total) return;

    const revealed  = new Uint8Array(total);
    let imgRevealed = false;
    let lastCount   = -1;
    let aboutRafId  = null;
    let sectionTop  = 0;

    function cacheBounds() {
      sectionTop = aboutSection.getBoundingClientRect().top + window.scrollY;
    }

    cacheBounds();

    function update() {
      aboutRafId = null;
      const rectTop  = sectionTop - window.scrollY;
      const windowH  = window.innerHeight;
      const progress = Math.min(1, Math.max(0,
        (windowH * 0.58 - rectTop) / (windowH * 0.46)
      ));
      const count = Math.round(progress * total);

      if (count !== lastCount) {
        if (count > lastCount) {
          for (let i = Math.max(0, lastCount); i < count; i++) {
            if (!revealed[i]) { allChars[i].classList.add('revealed'); revealed[i] = 1; }
          }
        } else {
          for (let i = lastCount - 1; i >= count; i--) {
            if (revealed[i]) { allChars[i].classList.remove('revealed'); revealed[i] = 0; }
          }
        }
        lastCount = count;
      }

      if (img) {
        if (count === total && !imgRevealed)   { img.classList.add('revealed');    imgRevealed = true;  }
        else if (count < total && imgRevealed) { img.classList.remove('revealed'); imgRevealed = false; }
      }
    }

    function onAboutScroll() {
      if (aboutRafId) return;
      aboutRafId = requestAnimationFrame(update);
    }

    window.addEventListener('scroll', onAboutScroll, { passive: true });
    window.addEventListener('resize', () => { cacheBounds(); lastCount = -1; onAboutScroll(); }, { passive: true });
    onAboutScroll();
  }

  if (document.readyState === 'loading') {
    document.addEventListener('DOMContentLoaded', initAboutScroll);
  } else {
    initAboutScroll();
  }
})();


// ============================================================
//  PORTFOLIO — intersection reveal
// ============================================================

(function () {
  function initPortfolio() {
    const cards = document.querySelectorAll('.portfolio-card');
    if (!cards.length) return;

    const isMobile = window.innerWidth < 800;

    const defaultObserver = new IntersectionObserver(entries => {
      entries.forEach(entry => {
        if (entry.isIntersecting) {
          entry.target.classList.remove('outview');
          defaultObserver.unobserve(entry.target);
        }
      });
    }, { threshold: 0.7 });

    const twoObserver = new IntersectionObserver(entries => {
      entries.forEach(entry => {
        if (entry.isIntersecting) {
          entry.target.classList.remove('outview');
          twoObserver.unobserve(entry.target);
        }
      });
    }, { threshold: 1, rootMargin: isMobile ? '0px' : '0px 0px -80px 0px' });

    cards.forEach(card => {
      (card.classList.contains('two') ? twoObserver : defaultObserver).observe(card);
    });
  }

  if (document.readyState === 'loading') {
    document.addEventListener('DOMContentLoaded', initPortfolio);
  } else {
    initPortfolio();
  }
})();

// ============================================================
//  FAQ — hover to expand
// ============================================================

(function () {
  function initFaq() {
    const faqs = document.querySelectorAll('.faq');
    if (!faqs.length) return;

    const isMobile = window.innerWidth < 1042;

    function setActive(faq) {
      faqs.forEach(f => {
        f.classList.remove('active');
        f.querySelector('.answer-wrap').style.height = '0px';
      });
      faq.classList.add('active');
      const answerWrap = faq.querySelector('.answer-wrap');
      answerWrap.style.height = answerWrap.querySelector('p').offsetHeight + 6 + 'px';
    }

    setActive(faqs[0]);

    faqs.forEach(faq => {
      faq.addEventListener(isMobile ? 'click' : 'mouseenter', () => setActive(faq));
    });
  }

  if (document.readyState === 'loading') {
    document.addEventListener('DOMContentLoaded', initFaq);
  } else {
    initFaq();
  }
})();

// ============================================================
//  FOOTER CLOCK
// ============================================================

(function () {
  function initClock() {
    const hand   = document.getElementById('hour-hand');
    const timeEl = document.querySelector('.time');
    if (!hand || !timeEl) return;

    const cx = 18, cy = 18, len = 11;
    const DEG_TO_RAD = Math.PI / 180;
    let lastSecond = -1;

    function updateClock() {
      const now     = new Date();
      const hours   = now.getHours();
      const minutes = now.getMinutes();
      const seconds = now.getSeconds();

      const rad = ((((hours % 12) + minutes / 60 + seconds / 3600) * 30) - 90) * DEG_TO_RAD;
      hand.setAttribute('x2', cx + Math.cos(rad) * len);
      hand.setAttribute('y2', cy + Math.sin(rad) * len);

      if (seconds !== lastSecond) {
        timeEl.textContent = `${String(hours).padStart(2,'0')}:${String(minutes).padStart(2,'0')}:${String(seconds).padStart(2,'0')} local time`;
        lastSecond = seconds;
      }

      requestAnimationFrame(updateClock);
    }

    updateClock();
  }

  if (document.readyState === 'loading') {
    document.addEventListener('DOMContentLoaded', initClock);
  } else {
    initClock();
  }
})();


// ============================================================
//  FOOTER — sticky height + above class
// ============================================================

(function () {
  function initFooter() {
    const footer   = document.querySelector('footer');
    const services = document.getElementById('services-section');
    if (!footer) return;

    new ResizeObserver(() => {
      document.body.style.paddingBottom = footer.offsetHeight + 'px';
    }).observe(footer);

    if (services) {
      new IntersectionObserver(entries => {
        entries.forEach(entry => {
          footer.classList.toggle('above',
            !entry.isIntersecting && entry.boundingClientRect.top < 0
          );
        });
      }, { threshold: 0 }).observe(services);
    }
  }

  if (document.readyState === 'loading') {
    document.addEventListener('DOMContentLoaded', initFooter);
  } else {
    initFooter();
  }
})();


// ============================================================
//  SLIDER
// ============================================================

(function () {
  const sliders = [];
  let activeSlider = null;

  function initSlider(track, indicatorEl, options = {}) {
    const AUTOPLAY_MS = options.autoplay ?? 3000;
    const THRESHOLD   = options.threshold ?? 0.7;

    const items = Array.from(track.children);
    const N     = items.length;

    let offset         = 0;
    let current        = 0;
    let dragStartIndex = 0;
    let dragging       = false;
    let startX         = 0;
    let startOff       = 0;
    let lastX          = 0;
    let lastT          = 0;
    let velX           = 0;
    let rafId          = null;
    let autoTimer      = null;

    let cachedOffsets   = [];
    let cachedWidths    = [];
    let cachedMaxOffset = 0;

    function cacheLayout() {
      cachedOffsets   = items.map(el => el.offsetLeft);
      cachedWidths    = items.map(el => el.offsetWidth);
      cachedMaxOffset = Math.max(0, cachedOffsets[N - 1]);
    }

    function applyOffset(x, animate) {
      offset = Math.max(0, Math.min(x, cachedMaxOffset));
      track.classList.toggle('is-snapping', animate);
      track.style.transform = `translateX(${-offset}px)`;
      updateVisibility();
    }

    function snapTo(index, animate = true) {
      current = Math.max(0, Math.min(index, N - 1));
      applyOffset(cachedOffsets[current], animate);
      updateDots();
    }

    function nearestIndex() {
      let best = 0, bestDist = Infinity;
      cachedOffsets.forEach((left, i) => {
        const d = Math.abs(left - offset);
        if (d < bestDist) { bestDist = d; best = i; }
      });
      return best;
    }

    function snapToNearest() { snapTo(nearestIndex(), true); }

    // Dots
    if (indicatorEl) {
      indicatorEl.innerHTML = '';
      items.forEach((_, i) => {
        const pip = document.createElement('div');
        pip.addEventListener('click', () => { resetAutoplay(); snapTo(i); });
        indicatorEl.appendChild(pip);
      });
    }

    function updateDots() {
      if (!indicatorEl) return;
      Array.from(indicatorEl.children).forEach((pip, i) => {
        const wasActive = pip.classList.contains('active');
        pip.classList.toggle('past', i < current);
        if (i === current && !wasActive) {
          pip.classList.remove('active');
          void pip.offsetWidth;
          pip.classList.add('active');
        } else if (i !== current) {
          pip.classList.remove('active');
        }
      });
    }

    function updateDotsFromOffset() {
      const n = nearestIndex();
      if (n !== current) { current = n; updateDots(); }
    }

    // Autoplay
    function startAutoplay() {
      clearTimeout(autoTimer);
      const next = current >= N - 1 ? 0 : current + 1;
      autoTimer = setTimeout(() => { snapTo(next); startAutoplay(); }, AUTOPLAY_MS);
    }

    function resetAutoplay() { clearTimeout(autoTimer); startAutoplay(); }

    // Pause on hover
    track.addEventListener('mouseenter', () => {
      clearTimeout(autoTimer);
      if (indicatorEl) indicatorEl.classList.add('is-paused');
    });
    track.addEventListener('mouseleave', () => {
      if (indicatorEl) indicatorEl.classList.remove('is-paused');
      if (!dragging) startAutoplay();
    });

    // Mouse drag
    track.addEventListener('mousedown', e => {
      if (e.button !== 0) return;
      cancelAnimationFrame(rafId);
      clearTimeout(autoTimer);
      track.classList.remove('is-snapping');
      track.classList.add('is-dragging');
      document.documentElement.style.cursor = 'grabbing';
      document.body.style.userSelect        = 'none';
      document.body.style.pointerEvents     = 'none';
      track.style.pointerEvents             = 'auto';
      dragging       = true;
      dragStartIndex = current;
      startX = lastX = e.clientX;
      startOff = offset;
      lastT = performance.now();
      velX  = 0;
      e.preventDefault();
    });

    window.addEventListener('mousemove', e => {
      if (!dragging) return;
      const now = performance.now();
      velX  = (e.clientX - lastX) / (now - lastT + 1);
      lastX = e.clientX; lastT = now;
      applyOffset(startOff - (e.clientX - startX), false);
      updateDotsFromOffset();
    });

    window.addEventListener('mouseup', () => {
      if (!dragging) return;
      dragging = false;
      track.classList.remove('is-dragging');
      document.documentElement.style.cursor = '';
      document.body.style.userSelect        = '';
      document.body.style.pointerEvents     = '';
      track.style.pointerEvents             = '';
      momentum();
    });

    // Touch drag
    track.addEventListener('touchstart', e => {
      cancelAnimationFrame(rafId);
      clearTimeout(autoTimer);
      track.classList.remove('is-snapping');
      const t = e.touches[0];
      dragging       = true;
      dragStartIndex = current;
      startX = lastX = t.clientX;
      startOff = offset;
      lastT = performance.now();
      velX  = 0;
    }, { passive: true });

    track.addEventListener('touchmove', e => {
      if (!dragging) return;
      e.preventDefault();
      const t = e.touches[0], now = performance.now();
      velX  = (t.clientX - lastX) / (now - lastT + 1);
      lastX = t.clientX; lastT = now;
      applyOffset(startOff - (t.clientX - startX), false);
      updateDotsFromOffset();
    }, { passive: false });

    track.addEventListener('touchend', () => { dragging = false; momentum(); });

    // Wheel
    track.addEventListener('wheel', e => {
      if (Math.abs(e.deltaX) < Math.abs(e.deltaY)) return;
      e.preventDefault();
      cancelAnimationFrame(rafId);
      clearTimeout(autoTimer);
      track.classList.remove('is-snapping');
      applyOffset(offset + e.deltaX, false);
      updateDotsFromOffset();
      clearTimeout(track._wheelTimer);
      track._wheelTimer = setTimeout(() => { snapToNearest(); resetAutoplay(); }, 120);
    }, { passive: false });

    // Keyboard
    const sliderRef = { track, snapTo, resetAutoplay, getCurrent: () => current };
    sliders.push(sliderRef);

    new IntersectionObserver(entries => {
      entries.forEach(entry => { if (entry.isIntersecting) activeSlider = sliderRef; });
    }, { threshold: 0.7 }).observe(track);

    // Momentum
    function momentum() {
      const isMobile  = window.innerWidth < 800;
      const FLICK_VEL = isMobile ? 0.5 : 0.4;
      const MOM_MULT  = isMobile ? 6 : 18;
      const snapIndex = isMobile ? dragStartIndex : current;

      if (Math.abs(velX) > FLICK_VEL) {
        snapTo(Math.max(0, Math.min(velX < 0 ? snapIndex + 1 : snapIndex - 1, N - 1)));
        resetAutoplay();
        return;
      }
      let vel = -velX * MOM_MULT;
      function step() {
        if (Math.abs(vel) < 0.5 || offset <= 0 || offset >= cachedMaxOffset) {
          snapToNearest(); resetAutoplay(); return;
        }
        vel *= 0.94;
        applyOffset(offset + vel, false);
        updateDotsFromOffset();
        rafId = requestAnimationFrame(step);
      }
      rafId = requestAnimationFrame(step);
    }

    track.addEventListener('transitionend', () => {
      track.classList.remove('is-snapping');
      updateVisibility();
    });

    function updateVisibility() {
      if (window.innerWidth < 800) return;
      items.forEach((el, i) => {
        const isPast = (cachedOffsets[i] + cachedWidths[i]) <= offset + 8;
        el.classList.toggle('is-past', isPast);
        el.querySelectorAll('.card, .blog-card-wrap').forEach(c => c.classList.toggle('is-past', isPast));
      });
    }

    window.addEventListener('resize', () => { cacheLayout(); snapTo(current, false); }, { passive: true });

    cacheLayout();
    applyOffset(0, false);
    updateDots();
    updateVisibility();

    new IntersectionObserver(entries => {
      entries.forEach(entry => { if (entry.isIntersecting) { startAutoplay(); } });
    }, { threshold: THRESHOLD }).observe(track);
  }

  document.addEventListener('keydown', e => {
    if (!activeSlider) return;
    if (e.key === 'ArrowRight') { activeSlider.resetAutoplay(); activeSlider.snapTo(activeSlider.getCurrent() + 1); }
    if (e.key === 'ArrowLeft')  { activeSlider.resetAutoplay(); activeSlider.snapTo(activeSlider.getCurrent() - 1); }
  });

  function guardLinks(track) {
    let startX = 0, startY = 0;
    track.addEventListener('pointerdown', e => { startX = e.clientX; startY = e.clientY; }, { passive: true });
    track.addEventListener('click', e => {
      if (Math.abs(e.clientX - startX) > 6 || Math.abs(e.clientY - startY) > 6) e.preventDefault();
    }, true);
  }

  window.addEventListener('load', () => {
    const principlesTrack     = document.getElementById('sliderTrack');
    const principlesIndicator = document.getElementById('indicator');
    if (principlesTrack) { initSlider(principlesTrack, principlesIndicator); guardLinks(principlesTrack); }

    const blogSection   = document.getElementById('blog-section');
    const blogTrack     = document.getElementById('blogTrack');
    const blogIndicator = blogSection?.querySelector('.slider-indicator');
    if (blogTrack) { initSlider(blogTrack, blogIndicator, { autoplay: 4000 }); guardLinks(blogTrack); }
  });
})();