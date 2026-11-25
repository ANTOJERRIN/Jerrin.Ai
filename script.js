document.addEventListener('DOMContentLoaded', () => {
  
  const header = document.getElementById('header');
  const menuToggle = document.getElementById('mobile-toggle');
  const navLinks = document.querySelectorAll('.nav-link');
  let openedOnHover = false;

  function setMenuOpen(open, fromHover = false) {
    openedOnHover = open && fromHover;
    header.classList.toggle('menu-open', open);
    menuToggle.classList.toggle('active', open);
    menuToggle.setAttribute('aria-expanded', String(open));
    document.getElementById('portfolio-navigation').classList.toggle('active', open);
  }

  header.addEventListener('pointerenter', event => {
    if (event.pointerType === 'mouse' && !header.classList.contains('menu-open')) {
      setMenuOpen(true, true);
    }
  });
  header.addEventListener('pointerleave', () => {
    if (openedOnHover && !header.contains(document.activeElement)) setMenuOpen(false);
  });
  menuToggle.addEventListener('click', () => {
    setMenuOpen(!header.classList.contains('menu-open'));
  });
  header.addEventListener('focusout', event => {
    if (!header.contains(event.relatedTarget) && !header.matches(':hover')) setMenuOpen(false);
  });
  document.addEventListener('pointerdown', event => {
    if (!header.contains(event.target)) {
      if (header.contains(document.activeElement)) menuToggle.focus();
      setMenuOpen(false);
    }
  });
  document.addEventListener('keydown', event => {
    if (event.key === 'Escape' && header.classList.contains('menu-open')) {
      setMenuOpen(false);
      menuToggle.focus();
    }
  });

  const deck = document.getElementById('portfolio-deck');
  const panels = new Map(Array.from(deck.children, panel => [panel.id, panel]));

  function showPanel(id, focus = false) {
    const active = panels.get(id) ?? panels.get('home');
    for (const panel of panels.values()) panel.hidden = panel !== active;
    for (const link of navLinks) {
      const current = link.hash === '#' + active.id;
      link.classList.toggle('active', current);
      if (current) link.setAttribute('aria-current', 'location');
      else link.removeAttribute('aria-current');
    }
    deck.scrollTop = 0;
    if (focus) {
      const heading = active.querySelector('h1, h2, h3') ?? active;
      heading.tabIndex = -1;
      heading.focus({ preventScroll: true });
    }
  }

  document.documentElement.classList.add('has-portfolio-deck');
  const showLocation = () => showPanel(location.hash.slice(1));
  showLocation();
  window.addEventListener('hashchange', showLocation);
  document.addEventListener('click', event => {
    const link = event.target.closest('a[href^="#"]');
    if (!link || event.defaultPrevented || event.button !== 0 ||
        event.altKey || event.ctrlKey || event.metaKey || event.shiftKey) return;
    const panelId = link.hash.slice(1);
    if (!panels.has(panelId)) return;
    event.preventDefault();
    if (header.contains(link)) setMenuOpen(false);
    if (location.hash !== link.hash) history.pushState(null, '', link.hash);
    showPanel(panelId, true);
  });

  /* ==========================================
     CLIPBOARD COPY WITH TOAST NOTIFICATION
     ========================================== */
  const copyElements = document.querySelectorAll('[data-copy]');
  const toast = document.getElementById('toast');
  const toastText = document.getElementById('toast-text');

  copyElements.forEach(element => {
    element.addEventListener('click', () => {
      const textToCopy = element.getAttribute('data-copy');
      const label = element.getAttribute('data-label') || "Information";
      
      navigator.clipboard.writeText(textToCopy).then(() => {
        toastText.textContent = `${label} copied to clipboard!`;
        toast.classList.add('show');
        
        setTimeout(() => {
          toast.classList.remove('show');
        }, 3000);
      }).catch(err => {
        console.error('Failed to copy: ', err);
      });
    });
  });

  /* ==========================================
     TIMELINE CARD ANIMATION (SCROLL OBSERVER)
     ========================================== */
  const timelineItems = document.querySelectorAll('.timeline-item');

  if (timelineItems.length > 0) {
    const observerOptions = {
      threshold: 0.15,
      rootMargin: "0px 0px -50px 0px"
    };

    const timelineObserver = new IntersectionObserver((entries, observer) => {
      entries.forEach(entry => {
        if (entry.isIntersecting) {
          entry.target.classList.add('visible');
          observer.unobserve(entry.target);
        }
      });
    }, observerOptions);

    timelineItems.forEach(item => {
      timelineObserver.observe(item);
    });
  }

  /* ==========================================
     LIGHTBOX MODAL FOR CERTIFICATES & IMAGES
     ========================================== */
  const lightboxModal = document.getElementById('lightbox-modal');
  const lightboxImg = document.getElementById('lightbox-img');
  const lightboxCaption = document.getElementById('lightbox-caption');
  const lightboxClose = document.getElementById('lightbox-close');
  const lightboxOverlay = document.getElementById('lightbox-overlay');
  const lightboxTriggers = document.querySelectorAll('[data-lightbox]');

  if (lightboxModal && lightboxImg) {
    lightboxTriggers.forEach(trigger => {
      trigger.addEventListener('click', (e) => {
        e.preventDefault();
        const imgSrc = trigger.getAttribute('data-lightbox');
        const caption = trigger.getAttribute('data-caption') || '';
        
        lightboxImg.src = imgSrc;
        lightboxCaption.textContent = caption;
        lightboxModal.classList.add('active');
        document.body.style.overflow = 'hidden';
      });
    });

    const closeLightbox = () => {
      lightboxModal.classList.remove('active');
      document.body.style.overflow = '';
      lightboxImg.src = '';
    };

    if (lightboxClose) lightboxClose.addEventListener('click', closeLightbox);
    if (lightboxOverlay) lightboxOverlay.addEventListener('click', closeLightbox);

    document.addEventListener('keydown', (e) => {
      if (e.key === 'Escape' && lightboxModal.classList.contains('active')) {
        closeLightbox();
      }
    });
  }

  /* ==========================================
     TECH CONTRIBUTIONS DASHBOARD INTERACTIVITY
     ========================================== */
  const tcFilterBtns = document.querySelectorAll('.tc-filter-btn');
  const tcCards = document.querySelectorAll('.tc-platform-card');

  if (tcFilterBtns.length > 0 && tcCards.length > 0) {
    tcFilterBtns.forEach(btn => {
      btn.addEventListener('click', () => {
        tcFilterBtns.forEach(b => b.classList.remove('tc-active'));
        btn.classList.add('tc-active');

        const filter = btn.getAttribute('data-filter');

        tcCards.forEach((card, index) => {
          const category = card.getAttribute('data-category') || '';
          const shouldShow = filter === 'all' || category.includes(filter);

          if (shouldShow) {
            card.classList.remove('tc-hidden');
            card.classList.add('tc-visible');
            card.style.animationDelay = `${index * 0.08}s`;
          } else {
            card.classList.remove('tc-visible');
            card.classList.add('tc-hidden');
          }
        });
      });
    });
  }

  // Scroll Reveal for Tech Contribution Cards
  if (tcCards.length > 0) {
    const tcObserverOptions = {
      threshold: 0.1,
      rootMargin: "0px 0px -30px 0px"
    };

    const tcObserver = new IntersectionObserver((entries, observer) => {
      entries.forEach(entry => {
        if (entry.isIntersecting) {
          entry.target.classList.add('tc-revealed');
          observer.unobserve(entry.target);
        }
      });
    }, tcObserverOptions);

    tcCards.forEach(card => {
      tcObserver.observe(card);
    });
  }

  // 3D Tilt Effect on Tech Contribution Cards
  tcCards.forEach(card => {
    card.addEventListener('mousemove', (e) => {
      const rect = card.getBoundingClientRect();
      const x = e.clientX - rect.left;
      const y = e.clientY - rect.top;
      const centerX = rect.width / 2;
      const centerY = rect.height / 2;
      const rotateX = ((centerY - y) / centerY) * 6;
      const rotateY = ((x - centerX) / centerX) * 6;

      card.style.transform = `translateY(-8px) scale(1.02) perspective(800px) rotateX(${rotateX}deg) rotateY(${rotateY}deg)`;
    });

    card.addEventListener('mouseleave', () => {
      card.style.transform = '';
      card.style.transition = 'transform 0.4s cubic-bezier(0.4, 0, 0.2, 1), box-shadow 0.4s cubic-bezier(0.4, 0, 0.2, 1), border-color 0.3s ease';
    });

    card.addEventListener('mouseenter', () => {
      card.style.transition = 'box-shadow 0.4s cubic-bezier(0.4, 0, 0.2, 1), border-color 0.3s ease';
    });
  });

});
