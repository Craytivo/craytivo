(function () {
  const mount = document.getElementById('servicePageHeader');
  if (!mount) return;

  const pageSlug = window.location.pathname.replace(/^\//, '').replace(/\/$/, '') || 'home';
  const campaign = encodeURIComponent(pageSlug.replace(/[^a-z0-9-]/gi, '-').toLowerCase());
  const contactRoot = '/?utm_source=service-page&utm_medium=';

  mount.className = 'sticky top-0 z-50 border-b border-slate-200/80 bg-white/90 shadow-sm backdrop-blur';
  mount.innerHTML = `
    <div class="mx-auto flex max-w-6xl items-center justify-between px-4 py-3.5 sm:px-6 lg:px-8">
      <a href="/" class="inline-flex items-center rounded-md px-1.5 py-1 transition-colors duration-200 hover:bg-slate-100 focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-sky-600 focus-visible:ring-offset-2" aria-label="Craytivo home">
        <img src="/assets/brand/craytivo-header-logo.png?v=20260214" alt="Craytivo logo" class="h-7 w-auto translate-y-[1px] sm:h-8 md:h-9" width="144" height="36" loading="eager" fetchpriority="high" decoding="async" />
      </a>
      <nav class="hidden items-center gap-6 md:flex" aria-label="Primary">
        <div class="nav-dropdown">
          <a href="/#services" class="nav-link nav-dropdown-trigger text-sm font-medium text-slate-600 hover:text-slate-900 focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-sky-600 focus-visible:ring-offset-2 rounded-md">
            Services
            <svg class="nav-dropdown-caret" viewBox="0 0 20 20" fill="none" aria-hidden="true">
              <path d="M5 7.5L10 12.5L15 7.5" stroke="currentColor" stroke-width="1.6" stroke-linecap="round" stroke-linejoin="round" />
            </svg>
          </a>
          <div class="nav-dropdown-menu" aria-label="Service pages">
            <a href="/landing-page-design-edmonton/" class="dropdown-link">Landing Page Design</a>
            <a href="/web-developer-edmonton-small-business/" class="dropdown-link">Small Business Website Design</a>
            <a href="/ecommerce-setup-edmonton/" class="dropdown-link">E-commerce Setup</a>
            <a href="/technical-seo-performance-edmonton/" class="dropdown-link">Technical SEO and Performance</a>
            <a href="/website-maintenance-support-edmonton/" class="dropdown-link">Website Maintenance and Support</a>
          </div>
        </div>
        <a href="/#process" class="nav-link text-sm font-medium text-slate-600 hover:text-slate-900 focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-sky-600 focus-visible:ring-offset-2 rounded-md">Process</a>
        <a href="/#work" class="nav-link text-sm font-medium text-slate-600 hover:text-slate-900 focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-sky-600 focus-visible:ring-offset-2 rounded-md">Work</a>
        <a data-cta="header" href="${contactRoot}header-cta&utm_campaign=${campaign}#contact" class="cta rounded-md px-4 py-2 text-sm font-semibold focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-sky-600 focus-visible:ring-offset-2">Book Free 15-Min Call</a>
      </nav>
      <button id="menuBtn" class="inline-flex items-center justify-center rounded-md border border-slate-300 p-2 text-slate-700 md:hidden focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-sky-600 focus-visible:ring-offset-2" aria-expanded="false" aria-controls="mobileMenu" aria-label="Toggle menu">
        <svg xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24" stroke-width="1.5" stroke="currentColor" class="h-5 w-5">
          <path stroke-linecap="round" stroke-linejoin="round" d="M3.75 6.75h16.5m-16.5 5.25h16.5m-16.5 5.25h16.5" />
        </svg>
      </button>
    </div>
    <nav id="mobileMenu" class="hidden max-h-[70vh] overflow-y-auto border-t border-slate-200 bg-white px-4 py-3 shadow-lg md:hidden md:shadow-none" aria-label="Mobile">
      <div class="flex flex-col gap-3">
        <details class="mobile-services">
          <summary>Services
            <svg class="mobile-services-caret" viewBox="0 0 20 20" fill="none" aria-hidden="true">
              <path d="M5 7.5L10 12.5L15 7.5" stroke="currentColor" stroke-width="1.6" stroke-linecap="round" stroke-linejoin="round" />
            </svg>
          </summary>
          <div class="mobile-services-links">
            <a href="/#services" class="mobile-link mobile-service-link">All Services Overview</a>
            <a href="/landing-page-design-edmonton/" class="mobile-link mobile-service-link">Landing Page Design</a>
            <a href="/web-developer-edmonton-small-business/" class="mobile-link mobile-service-link">Small Business Website Design</a>
            <a href="/ecommerce-setup-edmonton/" class="mobile-link mobile-service-link">E-commerce Setup</a>
            <a href="/technical-seo-performance-edmonton/" class="mobile-link mobile-service-link">Technical SEO and Performance</a>
            <a href="/website-maintenance-support-edmonton/" class="mobile-link mobile-service-link">Website Maintenance and Support</a>
          </div>
        </details>
        <a href="/#process" class="mobile-link nav-link rounded-md px-3 py-2 text-sm font-medium text-slate-700 hover:bg-slate-100 focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-sky-600 focus-visible:ring-offset-2">Process</a>
        <a href="/#work" class="mobile-link nav-link rounded-md px-3 py-2 text-sm font-medium text-slate-700 hover:bg-slate-100 focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-sky-600 focus-visible:ring-offset-2">Work</a>
        <a data-cta="mobile-header" href="${contactRoot}header-cta-mobile&utm_campaign=${campaign}#contact" class="mobile-link cta rounded-md px-3 py-2 text-center text-sm font-semibold focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-sky-600 focus-visible:ring-offset-2">Book Call</a>
      </div>
    </nav>
  `;

  const breadcrumbMap = {
    '/web-developer-edmonton-small-business/': 'Small Business Website Design',
    '/startup-website-developer-edmonton/': 'Startup Website Developer',
    '/custom-website-design-edmonton/': 'Custom Website Design',
    '/landing-page-design-edmonton/': 'Landing Page Design',
    '/ecommerce-setup-edmonton/': 'E-commerce Setup',
    '/technical-seo-performance-edmonton/': 'Technical SEO and Performance',
    '/website-maintenance-support-edmonton/': 'Website Maintenance and Support'
  };

  const main = document.querySelector('main');
  const crumbLabel = breadcrumbMap[window.location.pathname];
  if (main && crumbLabel) {
    const crumb = document.createElement('nav');
    crumb.className = 'service-breadcrumb-wrap';
    crumb.setAttribute('aria-label', 'Breadcrumb');
    crumb.innerHTML = `
      <div class="mx-auto max-w-6xl sm:px-6 lg:px-8">
        <div class="service-breadcrumb">
          <a href="/">Home</a>
          <span class="sep">/</span>
          <a href="/#services">Services</a>
          <span class="sep">/</span>
          <span aria-current="page">${crumbLabel}</span>
        </div>
      </div>
    `;
    main.parentNode.insertBefore(crumb, main);
  }

  const menuBtn = mount.querySelector('#menuBtn');
  const mobileMenu = mount.querySelector('#mobileMenu');
  if (menuBtn && mobileMenu) {
    menuBtn.addEventListener('click', () => {
      mobileMenu.classList.toggle('hidden');
      menuBtn.setAttribute('aria-expanded', String(!mobileMenu.classList.contains('hidden')));
    });

    mount.querySelectorAll('.mobile-link').forEach((link) => {
      link.addEventListener('click', () => {
        mobileMenu.classList.add('hidden');
        menuBtn.setAttribute('aria-expanded', 'false');
      });
    });
  }

  document.querySelectorAll('section details').forEach((details) => {
    details.addEventListener('toggle', () => {
      if (!details.open) return;
      const group = details.parentElement;
      if (!group) return;
      group.querySelectorAll('details').forEach((item) => {
        if (item !== details) item.open = false;
      });
    });
  });

  window.dataLayer = window.dataLayer || [];
  function gtag(){ window.dataLayer.push(arguments); }
  gtag('js', new Date());

  let gaRequested = false;
  function loadGa() {
    if (window.__gaLoaded || gaRequested) return;
    gaRequested = true;
    window.__gaLoaded = true;
    const script = document.createElement('script');
    script.src = 'https://www.googletagmanager.com/gtag/js?id=G-DMKNSQXDJL';
    script.async = true;
    document.head.appendChild(script);
    gtag('config', 'G-DMKNSQXDJL');
    window.removeEventListener('pointerdown', loadGa, true);
    window.removeEventListener('keydown', loadGa, true);
    window.removeEventListener('scroll', loadGa, true);
  }
  window.addEventListener('pointerdown', loadGa, { once: true, capture: true });
  window.addEventListener('keydown', loadGa, { once: true, capture: true });
  window.addEventListener('scroll', loadGa, { once: true, capture: true });
  window.setTimeout(loadGa, 12000);

  function trackServiceCta(anchor, ctaLocation) {
    anchor.addEventListener('click', () => {
      gtag('event', 'service_cta_click', {
        service_page: pageSlug,
        cta_location: ctaLocation
      });
    });
  }

  document.querySelectorAll('a[data-cta]').forEach((anchor) => {
    trackServiceCta(anchor, anchor.getAttribute('data-cta') || 'unknown');
  });

  document.querySelectorAll('a[href*="utm_medium=next-step-cta"], a[href*="utm_medium=footer-cta"], a[href*="utm_medium=inline-anchor"]').forEach((anchor) => {
    const href = anchor.getAttribute('href') || '';
    const ctaLocation = href.includes('next-step-cta') ? 'next-step' : href.includes('footer-cta') ? 'footer' : 'inline';
    trackServiceCta(anchor, ctaLocation);
  });
})();
