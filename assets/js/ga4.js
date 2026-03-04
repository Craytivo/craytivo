(function initGa4InteractionFirst() {
  window.dataLayer = window.dataLayer || [];
  function gtag(){window.dataLayer.push(arguments);}
  window.gtag = window.gtag || gtag;
  gtag('js', new Date());

  var GA_MEASUREMENT_ID = 'G-DMKNSQXDJL';
  var gaRequested = false;

  function loadGa() {
    if (window.__gaLoaded || gaRequested) return;
    gaRequested = true;
    window.__gaLoaded = true;

    var script = document.createElement('script');
    script.src = 'https://www.googletagmanager.com/gtag/js?id=' + GA_MEASUREMENT_ID;
    script.async = true;
    document.head.appendChild(script);

    gtag('config', GA_MEASUREMENT_ID);

    window.removeEventListener('pointerdown', loadGa, true);
    window.removeEventListener('keydown', loadGa, true);
    window.removeEventListener('scroll', loadGa, true);
  }

  window.addEventListener('pointerdown', loadGa, { once: true, capture: true });
  window.addEventListener('keydown', loadGa, { once: true, capture: true });
  window.addEventListener('scroll', loadGa, { once: true, capture: true });

  // Fallback to still capture sessions without interaction.
  window.setTimeout(loadGa, 12000);
})();
