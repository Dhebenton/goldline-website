// ── variables ──────────────────────────────────────────────
const LOGO_ENTER_DURATION  = 1500;

const PATH_ENTER_Y         = 6;
const PATH_ENTER_BLUR      = 4;
const PATH_ENTER_DURATION  = 640;
const PATH_STAGGER         = 120;

const SCREEN_EXIT_AT       = 0.74;
const SCREEN_EXIT_DURATION = 700;
// ───────────────────────────────────────────────────────────

const loadingScreen = document.getElementById('loading-screen');
const svgs          = loadingScreen.querySelectorAll('svg');
const paths         = Array.from(loadingScreen.querySelectorAll('path'));

const ease   = t => 1 - Math.pow(1 - t, 3);
const easeIn = t => t * t * t;

function animate({ duration, onUpdate, onComplete }) {
    const start = performance.now();
    (function frame(now) {
        const raw = Math.min((now - start) / duration, 1);
        onUpdate(raw);
        raw < 1 ? requestAnimationFrame(frame) : onComplete?.();
    })(performance.now());
}

// initial states
svgs.forEach(s => {
    s.style.opacity = '0';
    s.style.bottom  = '0%';
});

paths.forEach(p => {
    p.style.opacity   = '0';
    p.style.transform = `translateY(${PATH_ENTER_Y}px)`;
    p.style.filter    = `blur(${PATH_ENTER_BLUR}px)`;
});

// phase 3 — screen exits
function startScreenExit() {
    animate({
        duration: SCREEN_EXIT_DURATION,
        onUpdate(raw) {
            const t = easeIn(raw);
            loadingScreen.style.transform = `translateY(${-100 * t}%)`;
        },
        onComplete() {
            loadingScreen.style.display = 'none';
        }
    });
}

// phase 2 — paths enter one by one
const totalPathsDuration = PATH_ENTER_DURATION + (paths.length - 1) * PATH_STAGGER;

paths.forEach((p, i) => {
    setTimeout(() => {
        animate({
            duration: PATH_ENTER_DURATION,
            onUpdate(raw) {
                const t = ease(raw);
                p.style.opacity   = t;
                p.style.transform = `translateY(${PATH_ENTER_Y * (1 - t)}px)`;
                p.style.filter    = `blur(${PATH_ENTER_BLUR * (1 - t)}px)`;
            }
        });
    }, i * PATH_STAGGER);
});

setTimeout(() => startScreenExit(), totalPathsDuration * SCREEN_EXIT_AT);

// phase 1 — svg rises to bottom 50%
animate({
    duration: LOGO_ENTER_DURATION,
    onUpdate(raw) {
        const t = ease(raw);
        svgs.forEach(s => {
            s.style.opacity = t;
            s.style.bottom  = `${50 * t}%`;
        });
    }
});