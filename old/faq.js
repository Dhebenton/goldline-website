const faqs = document.querySelectorAll('.faq');

faqs.forEach(faq => {
  const p = faq.querySelector('p');
  const wrap = faq.querySelector('.question-wrap');
  
  if (p && wrap) {
    wrap.dataset.height = p.offsetHeight + 'px';
  }
  
  faq.addEventListener('mouseenter', () => {
    faqs.forEach(f => {
      f.classList.remove('active');
      f.querySelector('.question-wrap').style.height = '0px';
    });
    
    faq.classList.add('active');
    wrap.style.height = wrap.dataset.height;
  });
});

const firstFaq = faqs[0];
if (firstFaq) {
  const wrap = firstFaq.querySelector('.question-wrap');
  firstFaq.classList.add('active');
  wrap.style.height = wrap.dataset.height;
}