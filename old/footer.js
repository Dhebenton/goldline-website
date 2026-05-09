(function () {
     const footer = document.querySelector('footer');
     const services = document.getElementById('services-section');

     const observer = new IntersectionObserver((entries) => {
          entries.forEach(entry => {
               if (!entry.isIntersecting && entry.boundingClientRect.top < 0) {
                    footer.classList.add('above');
               } else {
                    footer.classList.remove('above');
               }
          });
     }, { threshold: 0 });

     observer.observe(services);
})();