const footer = document.querySelector('footer');
const dummy = document.querySelector('.footer-dummy');

const resizeObserver = new ResizeObserver(() => {
     dummy.style.height = footer.offsetHeight + 'px';
});

resizeObserver.observe(footer);