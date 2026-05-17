const navType = performance.getEntriesByType('navigation')[0]?.type;
const isBot   = /bot|crawl|spider|google|bing|slurp|duckduck/i.test(navigator.userAgent);
const loadingScreen = document.getElementById('loading-screen');

if (navType !== 'navigate' || isBot) {
    loadingScreen.style.display = 'none';
    document.body.style.overflow = '';
} else {
    const LOGO_ENTER_DURATION  = 1541; // 1340 × 1.15
    const PATH_ENTER_Y         = 8;
    const PATH_ENTER_BLUR      = 4;
    const PATH_ENTER_DURATION  = 633;  // 550 × 1.15
    const PATH_STAGGER         = 127;  // 110 × 1.15
    const SCREEN_EXIT_DURATION = 736;  // 640 × 1.15

    const svgs  = [...loadingScreen.querySelectorAll('svg')];
    const paths = [...loadingScreen.querySelectorAll('path')];

    const ease   = t => 1 - (1 - t) ** 3;
    const easeIn = t => t ** 3;

    function animate({ duration, onUpdate, onComplete }) {
        const start = performance.now();
        (function frame(now) {
            const raw = Math.min((now - start) / duration, 1);
            onUpdate(raw);
            raw < 1 ? requestAnimationFrame(frame) : onComplete?.();
        })(start);
    }

    document.body.style.overflow = 'hidden';

    svgs.forEach(s => { s.style.opacity = '0'; s.style.bottom = '0%'; });
    paths.forEach(p => {
        p.style.opacity   = '0';
        p.style.transform = `translateY(${PATH_ENTER_Y}px)`;
        p.style.filter    = `blur(${PATH_ENTER_BLUR}px)`;
    });

    animate({
        duration: LOGO_ENTER_DURATION,
        onUpdate(raw) {
            const t = ease(raw);
            for (const s of svgs) {
                s.style.opacity = String(t);
                s.style.bottom  = `${50 * t}%`;
            }
        }
    });

    const totalPathsDuration = PATH_ENTER_DURATION + (paths.length - 1) * PATH_STAGGER;
    const screenExitDelay    = totalPathsDuration * 0.54;

    paths.forEach((p, i) => {
        setTimeout(() => {
            animate({
                duration: PATH_ENTER_DURATION,
                onUpdate(raw) {
                    const t   = ease(raw);
                    const inv = 1 - t;
                    p.style.opacity   = String(t);
                    p.style.transform = `translateY(${PATH_ENTER_Y * inv}px)`;
                    p.style.filter    = `blur(${PATH_ENTER_BLUR * inv}px)`;
                }
            });
        }, i * PATH_STAGGER);
    });

    setTimeout(() => {
        animate({
            duration: SCREEN_EXIT_DURATION,
            onUpdate(raw) {
                loadingScreen.style.transform = `translateY(${-100 * easeIn(raw)}%)`;
            },
            onComplete() {
                loadingScreen.style.display = 'none';
                document.body.style.overflow = '';
            }
        });
    }, screenExitDelay);
}