document.addEventListener('DOMContentLoaded', () => {
  const dot = document.createElement('div');
  const ring = document.createElement('div');
  
  dot.className = 'cursor-dot';
  ring.className = 'cursor-ring';
  
  document.body.appendChild(dot);
  document.body.appendChild(ring);

  let mouseX = 0;
  let mouseY = 0;
  let ringX = 0;
  let ringY = 0;

  window.addEventListener('mousemove', (e) => {
    mouseX = e.clientX;
    mouseY = e.clientY;
    
    dot.style.transform = `translate(${mouseX}px, ${mouseY}px)`;
  });

  const animate = () => {
    // Smooth trailing for the ring
    ringX += (mouseX - ringX) * 0.15;
    ringY += (mouseY - ringY) * 0.15;
    
    ring.style.transform = `translate(${ringX}px, ${ringY}px)`;
    
    requestAnimationFrame(animate);
  };
  animate();

  // Hover effects
  const targets = 'a, button, .card, .btn, .logo';
  document.querySelectorAll(targets).forEach(el => {
    el.addEventListener('mouseenter', () => {
      ring.classList.add('active');
    });
    el.addEventListener('mouseleave', () => {
      ring.classList.remove('active');
    });
  });
});
