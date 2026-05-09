const videoWrap = document.querySelector('.video-wrap');
const playButton = document.querySelector('.play-button');

videoWrap.addEventListener('mousemove', (e) => {
  const rect = videoWrap.getBoundingClientRect();
  
  const centerX = rect.left + rect.width / 2;
  const centerY = rect.top + rect.height / 2;
  
  const deltaX = e.clientX - centerX;
  const deltaY = e.clientY - centerY;
  
  const moveX = deltaX * 0.25;
  const moveY = deltaY * 0.25;
  
  playButton.style.transform = `translate(calc(-50% + ${moveX}px), calc(-50% + ${moveY}px))`;
});

videoWrap.addEventListener('mouseleave', () => {
  playButton.style.transform = 'translate(-50%, -50%)';
});