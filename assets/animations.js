document.addEventListener('DOMContentLoaded', () => {
  /* ===== Intersection Observer for Scroll Animations ===== */
  const io = new IntersectionObserver((entries) => {
    entries.forEach(entry => {
      if (entry.isIntersecting) {
        entry.target.classList.add('is-visible');
        io.unobserve(entry.target);
      }
    });
  }, { threshold: 0.12, rootMargin: '0px 0px -40px 0px' });

  document.querySelectorAll('.anim-fade,.anim-up,.anim-left,.anim-right,.anim-scale').forEach(el => io.observe(el));

  /* ===== Mouse Tracking for Magic Glow Cards ===== */
  document.querySelectorAll('.magic-glow').forEach(card => {
    card.addEventListener('mousemove', (e) => {
      const rect = card.getBoundingClientRect();
      card.style.setProperty('--mouse-x', ((e.clientX - rect.left) / rect.width * 100) + '%');
      card.style.setProperty('--mouse-y', ((e.clientY - rect.top) / rect.height * 100) + '%');
    });
  });

  /* ===== Smooth Horizontal Scroll with Drag ===== */
  document.querySelectorAll('.drag-scroll').forEach(container => {
    let isDown = false, startX, scrollLeft;
    container.addEventListener('mousedown', (e) => { isDown = true; startX = e.pageX - container.offsetLeft; scrollLeft = container.scrollLeft; container.style.cursor = 'grabbing'; });
    container.addEventListener('mouseleave', () => { isDown = false; container.style.cursor = 'grab'; });
    container.addEventListener('mouseup', () => { isDown = false; container.style.cursor = 'grab'; });
    container.addEventListener('mousemove', (e) => { if (!isDown) return; e.preventDefault(); container.scrollLeft = scrollLeft - (e.pageX - container.offsetLeft - startX) * 1.5; });
  });
});
