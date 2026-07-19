(() => {
  const header = document.querySelector('.site-header');
  const nav = document.querySelector('.site-nav');
  const toggle = document.querySelector('.nav-toggle');
  const revealItems = document.querySelectorAll('.reveal, .artwork');

  const setHeaderState = () => {
    if (!header) return;
    header.classList.toggle('is-scrolled', window.scrollY > 24);
  };

  setHeaderState();
  window.addEventListener('scroll', setHeaderState, { passive: true });

  if (toggle && nav && header) {
    toggle.addEventListener('click', () => {
      const open = !nav.classList.contains('is-open');
      nav.classList.toggle('is-open', open);
      header.classList.toggle('nav-open', open);
      toggle.setAttribute('aria-expanded', String(open));
      document.body.style.overflow = open ? 'hidden' : '';
    });

    nav.querySelectorAll('a').forEach((link) => {
      link.addEventListener('click', () => {
        nav.classList.remove('is-open');
        header.classList.remove('nav-open');
        toggle.setAttribute('aria-expanded', 'false');
        document.body.style.overflow = '';
      });
    });
  }

  if ('IntersectionObserver' in window && revealItems.length) {
    const observer = new IntersectionObserver(
      (entries) => {
        entries.forEach((entry) => {
          if (entry.isIntersecting) {
            entry.target.classList.add('is-visible');
            observer.unobserve(entry.target);
          }
        });
      },
      { threshold: 0.15, rootMargin: '0px 0px -8% 0px' }
    );
    revealItems.forEach((el) => observer.observe(el));
  } else {
    revealItems.forEach((el) => el.classList.add('is-visible'));
  }

  /* Lightbox for gallery pages */
  const galleryLinks = Array.from(document.querySelectorAll('[data-lightbox]'));
  if (galleryLinks.length) {
    const lightbox = document.createElement('div');
    lightbox.className = 'lightbox';
    lightbox.setAttribute('role', 'dialog');
    lightbox.setAttribute('aria-modal', 'true');
    lightbox.innerHTML = `
      <button class="lightbox-close" type="button" aria-label="Close">×</button>
      <button class="lightbox-prev" type="button" aria-label="Previous">‹</button>
      <button class="lightbox-next" type="button" aria-label="Next">›</button>
      <div class="lightbox-stage">
        <img alt="" />
        <div class="lightbox-caption"></div>
      </div>
    `;
    document.body.appendChild(lightbox);

    const img = lightbox.querySelector('img');
    const caption = lightbox.querySelector('.lightbox-caption');
    let index = 0;

    const openAt = (i) => {
      index = (i + galleryLinks.length) % galleryLinks.length;
      const link = galleryLinks[index];
      img.src = link.getAttribute('href');
      img.alt = link.dataset.title || '';
      caption.textContent = link.dataset.title || '';
      lightbox.classList.add('is-open');
      document.body.style.overflow = 'hidden';
    };

    const close = () => {
      lightbox.classList.remove('is-open');
      document.body.style.overflow = '';
    };

    galleryLinks.forEach((link, i) => {
      link.addEventListener('click', (event) => {
        event.preventDefault();
        openAt(i);
      });
    });

    lightbox.querySelector('.lightbox-close').addEventListener('click', close);
    lightbox.querySelector('.lightbox-prev').addEventListener('click', () => openAt(index - 1));
    lightbox.querySelector('.lightbox-next').addEventListener('click', () => openAt(index + 1));
    lightbox.addEventListener('click', (event) => {
      if (event.target === lightbox) close();
    });

    document.addEventListener('keydown', (event) => {
      if (!lightbox.classList.contains('is-open')) return;
      if (event.key === 'Escape') close();
      if (event.key === 'ArrowLeft') openAt(index - 1);
      if (event.key === 'ArrowRight') openAt(index + 1);
    });
  }

  /* Cookie consent banner (Google Consent Mode) */
  const CONSENT_KEY = 'rs-consent';
  const gtag = function () {
    window.dataLayer = window.dataLayer || [];
    window.dataLayer.push(arguments);
  };

  const applyConsent = (granted) => {
    gtag('consent', 'update', {
      analytics_storage: granted ? 'granted' : 'denied',
      ad_storage: 'denied',
      ad_user_data: 'denied',
      ad_personalization: 'denied',
    });
  };

  const stored = (() => {
    try {
      return localStorage.getItem(CONSENT_KEY);
    } catch (e) {
      return null;
    }
  })();

  if (stored === 'granted') {
    applyConsent(true);
  } else if (stored !== 'denied') {
    const banner = document.createElement('aside');
    banner.className = 'consent';
    banner.setAttribute('role', 'dialog');
    banner.setAttribute('aria-label', 'Cookie preferences');
    banner.innerHTML = `
      <h2>A note on cookies</h2>
      <p>This site uses a few analytics cookies to understand how visitors discover the work. You can accept or decline, and your choice is remembered.</p>
      <div class="consent-actions">
        <button class="btn btn-solid" type="button" data-consent="granted">Accept</button>
        <button class="btn btn-outline" type="button" data-consent="denied">Decline</button>
      </div>
    `;
    document.body.appendChild(banner);
    requestAnimationFrame(() => banner.classList.add('is-visible'));

    banner.addEventListener('click', (event) => {
      const choice = event.target.getAttribute('data-consent');
      if (!choice) return;
      try {
        localStorage.setItem(CONSENT_KEY, choice);
      } catch (e) {
        /* ignore storage errors */
      }
      applyConsent(choice === 'granted');
      banner.classList.remove('is-visible');
      setTimeout(() => banner.remove(), 500);
    });
  }

  /* Contact form enhancement */
  const form = document.querySelector('.contact-form');
  if (form) {
    const status = form.querySelector('.form-status');
    const submitBtn = form.querySelector('[type="submit"]');
    const endpoint = 'https://formsubmit.co/ajax/rumshenoy@gmail.com';

    const setStatus = (msg, isError) => {
      if (!status) return;
      status.textContent = msg;
      status.classList.toggle('is-error', !!isError);
    };

    form.addEventListener('submit', async (event) => {
      event.preventDefault();
      setStatus('Sending…', false);
      if (submitBtn) submitBtn.disabled = true;

      try {
        const res = await fetch(endpoint, {
          method: 'POST',
          headers: { Accept: 'application/json' },
          body: new FormData(form),
        });
        const data = await res.json().catch(() => ({}));
        const ok = res.ok && String(data.success) === 'true';

        if (ok) {
          form.reset();
          setStatus('Thank you. Your message is on its way.', false);
        } else if (data.message) {
          // e.g. the one-time "please activate this form" notice
          setStatus(data.message, true);
        } else {
          throw new Error('submit failed');
        }
      } catch (err) {
        setStatus('Something went wrong. Please email rumshenoy@gmail.com directly.', true);
      } finally {
        if (submitBtn) submitBtn.disabled = false;
      }
    });
  }
})();
