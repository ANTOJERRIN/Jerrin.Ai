document.addEventListener('DOMContentLoaded', () => {
  
  /* ==========================================
     MOBILE NAVIGATION MENU
     ========================================== */
  const mobileToggle = document.getElementById('mobile-toggle');
  const navMenu = document.getElementById('nav-menu');
  const navLinks = document.querySelectorAll('.nav-link');

  if (mobileToggle && navMenu) {
    mobileToggle.addEventListener('click', () => {
      mobileToggle.classList.toggle('active');
      navMenu.classList.toggle('active');
    });

    // Close mobile menu when clicking any nav link
    navLinks.forEach(link => {
      link.addEventListener('click', () => {
        mobileToggle.classList.remove('active');
        navMenu.classList.remove('active');
      });
    });
  }

  /* ==========================================
     HEADER SCROLL EFFECT & SCROLLSPY
     ========================================== */
  const header = document.getElementById('header');
  const sections = document.querySelectorAll('section[id]');

  window.addEventListener('scroll', () => {
    // 1. Toggle header background on scroll
    if (window.scrollY > 50) {
      header.classList.add('scrolled');
    } else {
      header.classList.remove('scrolled');
    }

    // 2. Scrollspy active link detection
    let scrollY = window.pageYOffset;
    
    sections.forEach(current => {
      const sectionHeight = current.offsetHeight;
      const sectionTop = current.offsetTop - 100; // Offset for fixed nav
      const sectionId = current.getAttribute('id');
      const activeLink = document.querySelector(`.nav-menu a[href*=${sectionId}]`);

      if (activeLink) {
        if (scrollY > sectionTop && scrollY <= sectionTop + sectionHeight) {
          activeLink.classList.add('active');
        } else {
          activeLink.classList.remove('active');
        }
      }
    });
  });

  /* ==========================================
     DYNAMIC TYPING ANIMATION
     ========================================== */
  const typedTextSpan = document.getElementById('typed-text');
  const roles = [
    "AI Developer Intern",
    "Cloud Enthusiast",
    "Open-Source Contributor",
    "Founder of F1 FoRgE",
    "Content Creator @Tech2007"
  ];
  
  let roleIndex = 0;
  let charIndex = 0;
  let isDeleting = false;
  let typingSpeed = 100;

  function type() {
    const currentRole = roles[roleIndex];
    
    if (isDeleting) {
      typedTextSpan.textContent = currentRole.substring(0, charIndex - 1);
      charIndex--;
      typingSpeed = 50; // speed up deletion
    } else {
      typedTextSpan.textContent = currentRole.substring(0, charIndex + 1);
      charIndex++;
      typingSpeed = 120; // normal typing speed
    }

    // Checking states
    if (!isDeleting && charIndex === currentRole.length) {
      typingSpeed = 1500; // wait before delete
      isDeleting = true;
    } else if (isDeleting && charIndex === 0) {
      isDeleting = false;
      roleIndex = (roleIndex + 1) % roles.length;
      typingSpeed = 500; // pause before next role
    }

    setTimeout(type, typingSpeed);
  }

  // Initial call
  if (typedTextSpan) {
    setTimeout(type, 1000);
  }

  /* ==========================================
     3D PARALLAX EFFECT FOR PROFILE CARD
     ========================================== */
  const cardWrapper = document.getElementById('profile-card-wrapper');
  const card = document.getElementById('profile-card');

  if (cardWrapper && card) {
    cardWrapper.addEventListener('mousemove', (e) => {
      const rect = cardWrapper.getBoundingClientRect();
      const x = e.clientX - rect.left; // x position inside element
      const y = e.clientY - rect.top;  // y position inside element
      
      const centerX = rect.width / 2;
      const centerY = rect.height / 2;
      
      // Calculate rotation angles (-15deg to 15deg)
      const rotateX = ((centerY - y) / centerY) * 12;
      const rotateY = ((x - centerX) / centerX) * 12;
      
      card.style.transform = `rotateX(${rotateX}deg) rotateY(${rotateY}deg)`;
    });

    cardWrapper.addEventListener('mouseleave', () => {
      // Reset card tilt
      card.style.transform = 'rotateX(0deg) rotateY(0deg)';
      card.style.transition = 'transform 0.5s cubic-bezier(0.25, 0.46, 0.45, 0.94)';
    });

    cardWrapper.addEventListener('mouseenter', () => {
      card.style.transition = 'none';
    });
  }

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
        // Show Toast
        toastText.textContent = `${label} copied to clipboard!`;
        toast.classList.add('show');
        
        // Hide after 3 seconds
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
          // Once animated, stop observing this item
          observer.unobserve(entry.target);
        }
      });
    }, observerOptions);

    timelineItems.forEach(item => {
      timelineObserver.observe(item);
    });
  }

  /* ==========================================
     TECH CONTRIBUTIONS DASHBOARD INTERACTIVITY
     ========================================== */
  
  // Filter Tabs
  const tcFilterBtns = document.querySelectorAll('.tc-filter-btn');
  const tcCards = document.querySelectorAll('.tc-platform-card');

  if (tcFilterBtns.length > 0 && tcCards.length > 0) {
    tcFilterBtns.forEach(btn => {
      btn.addEventListener('click', () => {
        // Update active state
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
