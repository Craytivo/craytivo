const calendlyUrl = 'https://calendly.com/craytivo/30min';

// Mobile nav toggle + dynamic header offset for precise anchor alignment.
const menuBtn = document.getElementById('menuBtn');
const mobileMenu = document.getElementById('mobileMenu');
const headerEl = document.querySelector('.site-header');
const rootEl = document.documentElement;
let offsetRaf = null;
let sectionObserverResizeTimer = null;

function emitAnalyticsEvent(eventName, payload) {
  if (typeof window.gtag === 'function') {
    window.gtag('event', eventName, payload);
    return;
  }
  if (Array.isArray(window.dataLayer)) {
    window.dataLayer.push({ event: eventName, ...payload });
  }
}

function getHeaderOffset() {
  if (!headerEl) return 72;
  return Math.max(64, Math.ceil(headerEl.getBoundingClientRect().height));
}

function applyHeaderOffset() {
  const headerOffset = getHeaderOffset();
  rootEl.style.setProperty('--header-offset', `${headerOffset}px`);
  document.querySelectorAll('main section[id]').forEach((sectionEl) => {
    sectionEl.style.scrollMarginTop = `${headerOffset + 14}px`;
  });
  return headerOffset;
}

function scheduleOffsetSync() {
  if (offsetRaf) cancelAnimationFrame(offsetRaf);
  offsetRaf = requestAnimationFrame(() => {
    applyHeaderOffset();
  });
}

applyHeaderOffset();

if (menuBtn && mobileMenu) {
  menuBtn.addEventListener('click', () => {
    mobileMenu.classList.toggle('hidden');
    menuBtn.setAttribute('aria-expanded', String(!mobileMenu.classList.contains('hidden')));
    scheduleOffsetSync();
  });
  document.querySelectorAll('.mobile-link').forEach((link) => {
    link.addEventListener('click', () => {
      mobileMenu.classList.add('hidden');
      menuBtn.setAttribute('aria-expanded', 'false');
      scheduleOffsetSync();
    });
  });
}

window.addEventListener('resize', scheduleOffsetSync, { passive: true });
window.addEventListener('orientationchange', () => setTimeout(applyHeaderOffset, 140));

// Highlight active section in header navigation.
const sectionLinks = Array.from(document.querySelectorAll('a[data-section-link]'));
const sectionMap = new Map();
sectionLinks.forEach((link) => {
  const id = link.getAttribute('href');
  if (!id || !id.startsWith('#')) return;
  const sectionEl = document.querySelector(id);
  if (sectionEl) sectionMap.set(id, sectionEl);
});
const activeById = (id) => {
  sectionLinks.forEach((link) => {
    const isActive = link.getAttribute('href') === id;
    link.classList.toggle('nav-link-active', isActive);
  });
};
let sectionObserver;
function setupSectionObserver() {
  if (sectionObserver) sectionObserver.disconnect();
  const headerOffset = applyHeaderOffset();
  sectionObserver = new IntersectionObserver(
    (entries) => {
      const visible = entries
        .filter((entry) => entry.isIntersecting)
        .sort((a, b) => b.intersectionRatio - a.intersectionRatio)[0];
      if (!visible) return;
      const activeId = `#${visible.target.id}`;
      if (sectionMap.has(activeId)) activeById(activeId);
    },
    { rootMargin: `-${headerOffset + 16}px 0px -48% 0px`, threshold: [0.2, 0.45, 0.7] }
  );
  sectionMap.forEach((sectionEl) => sectionObserver.observe(sectionEl));
}
setupSectionObserver();
window.addEventListener('resize', () => {
  clearTimeout(sectionObserverResizeTimer);
  sectionObserverResizeTimer = setTimeout(setupSectionObserver, 120);
});

// Track high-intent pricing CTA engagement.
const pricingQuoteCta = document.getElementById('pricingQuoteCta');
if (pricingQuoteCta) {
  pricingQuoteCta.addEventListener('click', () => {
    emitAnalyticsEvent('pricing_quote_cta_click', {
      event_category: 'engagement',
      event_label: 'pricing_snapshot',
      link_target: '#contact'
    });
  });
}

// Real-user Core Web Vitals tracking for ongoing mobile tuning.
function reportWebVital(metric) {
  const eventPayload = {
    metric_name: metric.name,
    metric_value: Number(metric.value.toFixed(2)),
    metric_id: metric.id,
    metric_rating: metric.rating || 'unknown',
    page_path: window.location.pathname,
    device_type: window.matchMedia('(max-width: 767px)').matches ? 'mobile' : 'desktop',
    network_type: (navigator.connection && navigator.connection.effectiveType) || 'unknown'
  };
  emitAnalyticsEvent('web_vitals', eventPayload);
}

function initWebVitalsTracking() {
  if (window.__webVitalsTrackingInit) return;
  window.__webVitalsTrackingInit = true;
  const loadVitals = async () => {
    try {
      const { onCLS, onINP, onLCP, onFCP, onTTFB } = await import('https://unpkg.com/web-vitals@4/dist/web-vitals.js?module');
      onCLS(reportWebVital, { reportAllChanges: true });
      onINP(reportWebVital);
      onLCP(reportWebVital, { reportAllChanges: true });
      onFCP(reportWebVital);
      onTTFB(reportWebVital);
    } catch (e) {
      // Silent fail to avoid impacting page UX if CDN is unavailable.
    }
  };
  if ('requestIdleCallback' in window) {
    requestIdleCallback(loadVitals, { timeout: 5000 });
  } else {
    setTimeout(loadVitals, 2200);
  }
}
initWebVitalsTracking();

// Lazy-load Calendly assets only when scheduling is requested.
let calendlyLoadPromise = null;
function loadCalendlyAssets() {
  if (window.Calendly) return Promise.resolve();
  if (calendlyLoadPromise) return calendlyLoadPromise;
  calendlyLoadPromise = new Promise((resolve, reject) => {
    const existingCss = document.querySelector('link[data-calendly-css="1"]');
    if (!existingCss) {
      const css = document.createElement('link');
      css.rel = 'stylesheet';
      css.href = 'https://assets.calendly.com/assets/external/widget.css';
      css.setAttribute('data-calendly-css', '1');
      document.head.appendChild(css);
    }

    const script = document.createElement('script');
    script.src = 'https://assets.calendly.com/assets/external/widget.js';
    script.async = true;
    script.onload = () => resolve();
    script.onerror = () => reject(new Error('Calendly failed to load'));
    document.body.appendChild(script);
  });
  return calendlyLoadPromise;
}

document.querySelectorAll('.calendly-trigger').forEach((link) => {
  link.addEventListener('click', async (e) => {
    e.preventDefault();
    try {
      await loadCalendlyAssets();
      if (window.Calendly) {
        window.Calendly.initPopupWidget({ url: calendlyUrl });
      }
    } catch (error) {
      window.location.href = calendlyUrl;
    }
  });
});

// Defer heavier form/reveal enhancements until idle or clear contact intent.
let enhancedUxInitialized = false;
const enhancedUxInitEvents = ['focusin', 'pointerdown', 'keydown', 'touchstart'];
function initEnhancedUx() {
  if (enhancedUxInitialized) return;
  enhancedUxInitialized = true;
  enhancedUxInitEvents.forEach((evt) => {
    document.removeEventListener(evt, eagerEnhancedUxInit, true);
  });

  // Form UX enhancements
  const form = document.getElementById('leadForm');
  const submitBtn = document.getElementById('submitBtn');
  const toStep2Btn = document.getElementById('toStep2Btn');
  const backToStep1Btn = document.getElementById('backToStep1Btn');
  const formStep1 = document.getElementById('formStep1');
  const formStep2 = document.getElementById('formStep2');
  const formStepLabel = document.getElementById('formStepLabel');
  const formProgressFill = document.getElementById('formProgressFill');
  const formError = document.getElementById('formError');
  const formStatus = document.getElementById('formStatus');
  const fullName = document.getElementById('fullName');
  const email = document.getElementById('email');
  const projectType = document.getElementById('projectType');
  const budgetRange = document.getElementById('budgetRange');
  const timeline = document.getElementById('timeline');
  const primaryGoal = document.getElementById('primaryGoal');
  const message = document.getElementById('message');
  const leadScore = document.getElementById('leadScore');
  const leadTier = document.getElementById('leadTier');
  const leadTags = document.getElementById('leadTags');
  const followUpSequence = document.getElementById('followUpSequence');
  const utmSource = document.getElementById('utmSource');
  const utmMedium = document.getElementById('utmMedium');
  const utmCampaign = document.getElementById('utmCampaign');
  const utmContent = document.getElementById('utmContent');
  const utmTerm = document.getElementById('utmTerm');
  const referrerSource = document.getElementById('referrerSource');
  const honeypot = document.getElementById('website');
  const onPageConfirm = document.getElementById('onPageConfirm');
  const consent = document.getElementById('consent');
  const summaryProject = document.getElementById('summaryProject');
  const summaryBudget = document.getElementById('summaryBudget');
  const summaryTimeline = document.getElementById('summaryTimeline');
  const fieldErrorMap = {
    fullName: document.getElementById('fullNameError'),
    email: document.getElementById('emailError'),
    projectType: document.getElementById('projectTypeError'),
    budgetRange: document.getElementById('budgetRangeError'),
    timeline: document.getElementById('timelineError'),
    primaryGoal: document.getElementById('primaryGoalError'),
    message: document.getElementById('messageError'),
    consent: document.getElementById('consentError')
  };
  let currentFormStep = 1;
  const statusToneClasses = ['text-red-700', 'text-green-700', 'text-slate-600'];

  function setFormStatus(text, toneClass) {
    if (!formStatus) return;
    formStatus.classList.remove(...statusToneClasses);
    formStatus.classList.add(toneClass);
    formStatus.textContent = text;
  }

  function withTemporaryButtonDisable(button, delayMs) {
    if (!button) return;
    button.disabled = true;
    window.setTimeout(() => {
      button.disabled = false;
    }, delayMs);
  }

  // Show on-page confirmation after Formspree redirects back to this page.
  const pageParams = new URLSearchParams(window.location.search);
  if (onPageConfirm && pageParams.get('submitted') === '1') {
    onPageConfirm.classList.remove('hidden');
    const cleaned = new URL(window.location.href);
    cleaned.searchParams.delete('submitted');
    history.replaceState(null, '', `${cleaned.pathname}${cleaned.search}${cleaned.hash}`);
  }

  // Capture campaign/source context for lightweight CRM tagging.
  const params = new URLSearchParams(window.location.search);
  if (utmSource) utmSource.value = params.get('utm_source') || '(direct)';
  if (utmMedium) utmMedium.value = params.get('utm_medium') || '(none)';
  if (utmCampaign) utmCampaign.value = params.get('utm_campaign') || '(none)';
  if (utmContent) utmContent.value = params.get('utm_content') || '(none)';
  if (utmTerm) utmTerm.value = params.get('utm_term') || '(none)';
  if (referrerSource) referrerSource.value = document.referrer || '(none)';

  function cleanTag(value) {
    return (value || 'none').toLowerCase().replace(/[^a-z0-9]+/g, '_').replace(/^_|_$/g, '');
  }

  function buildLeadScore() {
    let score = 0;
    const pType = projectType ? projectType.value : '';
    const budget = budgetRange ? budgetRange.value : '';
    const tline = timeline ? timeline.value : '';
    const goal = primaryGoal ? primaryGoal.value : '';
    const msgLen = message && message.value ? message.value.trim().length : 0;

    const projectPoints = {
      'Landing Page': 2,
      'Business Website': 3,
      'E-commerce': 4,
      'Web App': 4,
      'Maintenance': 1,
      'Not sure': 1
    };
    const budgetPoints = {
      '$150-$449': 1,
      '$450-$899': 2,
      '$900-$1,499': 3,
      '$1,500+': 4
    };
    const timelinePoints = {
      'ASAP (4-7 days)': 3,
      '1-2 weeks': 2,
      '2-4 weeks': 2,
      'Flexible': 1
    };
    const goalPoints = {
      'More qualified leads': 3,
      'Improve trust and brand credibility': 2,
      'Launch fast': 2,
      'Increase online sales': 3,
      'Improve speed and SEO': 2
    };

    score += projectPoints[pType] || 0;
    score += budgetPoints[budget] || 0;
    score += timelinePoints[tline] || 0;
    score += goalPoints[goal] || 0;
    if (msgLen >= 120) score += 1;

    let tier = 'cold';
    let sequence = 'D0 auto-reply; D3 follow-up; D7 final check-in';
    if (score >= 10) {
      tier = 'hot';
      sequence = 'D0 auto-reply; D1 personal follow-up; D3 priority check-in';
    } else if (score >= 7) {
      tier = 'warm';
      sequence = 'D0 auto-reply; D2 follow-up; D5 value check-in';
    }

    const tags = [
      `tier:${tier}`,
      `project:${cleanTag(pType)}`,
      `budget:${cleanTag(budget)}`,
      `timeline:${cleanTag(tline)}`,
      `goal:${cleanTag(goal)}`,
      `source:${cleanTag(utmSource ? utmSource.value : '(direct)')}`,
      `medium:${cleanTag(utmMedium ? utmMedium.value : '(none)')}`,
      `campaign:${cleanTag(utmCampaign ? utmCampaign.value : '(none)')}`
    ].join(', ');

    if (leadScore) leadScore.value = String(score);
    if (leadTier) leadTier.value = tier;
    if (leadTags) leadTags.value = tags;
    if (followUpSequence) followUpSequence.value = sequence;
  }

  function setFieldError(field, messageText) {
    if (!field) return;
    const errorEl = fieldErrorMap[field.id];
    if (!errorEl) return;
    if (messageText) {
      errorEl.textContent = messageText;
      errorEl.classList.remove('hidden');
      field.setAttribute('aria-invalid', 'true');
    } else {
      errorEl.textContent = '';
      errorEl.classList.add('hidden');
      field.removeAttribute('aria-invalid');
    }
  }

  function getFieldMessage(field) {
    if (!field) return '';
    if (field.id === 'email' && field.validity.typeMismatch) return 'Please enter a valid email address.';
    if (field.id === 'message' && field.validity.tooShort) return 'Please provide at least 20 characters.';
    if (field.validity.valueMissing) return 'This field is required.';
    return '';
  }

  function setStep(step) {
    currentFormStep = step;
    const isStepOne = step === 1;
    const activeStep = isStepOne ? formStep1 : formStep2;
    const inactiveStep = isStepOne ? formStep2 : formStep1;
    if (activeStep && inactiveStep) {
      inactiveStep.classList.add('hidden');
      inactiveStep.setAttribute('aria-hidden', 'true');
      activeStep.classList.remove('hidden');
      activeStep.setAttribute('aria-hidden', 'false');
      activeStep.classList.remove('step-fade-in');
      void activeStep.offsetWidth;
      activeStep.classList.add('step-fade-in');
    }
    if (formStepLabel) formStepLabel.textContent = `Step ${step} of 2`;
    if (formProgressFill) formProgressFill.style.width = isStepOne ? '50%' : '100%';

    const firstFocusableSelector = 'input:not([type="hidden"]), select, textarea, button';
    const firstField = activeStep ? activeStep.querySelector(firstFocusableSelector) : null;
    if (firstField) {
      window.setTimeout(() => {
        firstField.focus({ preventScroll: true });
      }, 120);
    }

    if (window.matchMedia('(max-width: 767px)').matches && form) {
      const headerOffsetPx = parseInt(getComputedStyle(document.documentElement).getPropertyValue('--header-offset'), 10) || 72;
      const targetY = form.getBoundingClientRect().top + window.scrollY - headerOffsetPx - 10;
      window.scrollTo({ top: targetY, behavior: 'smooth' });
    }
  }

  function validateFields(fields) {
    let valid = true;
    fields.forEach((field) => {
      if (!field || field.type === 'hidden') return;
      if (!field.checkValidity()) {
        setFieldError(field, getFieldMessage(field));
        valid = false;
      } else {
        setFieldError(field, '');
      }
    });
    return valid;
  }

  function updateSummary() {
    if (summaryProject) summaryProject.textContent = `Project: ${projectType.value || 'Not set'}`;
    if (summaryBudget) summaryBudget.textContent = `Budget: ${budgetRange.value || 'Not set'}`;
    if (summaryTimeline) summaryTimeline.textContent = `Timeline: ${timeline.value || 'Not set'}`;
  }

  function applyChoiceChip(targetId, value, button) {
    const target = document.getElementById(targetId);
    if (!target) return;
    target.value = value;
    const group = button.closest('[role="group"]');
    if (group) {
      group.querySelectorAll('.choice-chip').forEach((chip) => {
        chip.classList.remove('active');
        chip.setAttribute('aria-pressed', 'false');
      });
    }
    button.classList.add('active');
    button.setAttribute('aria-pressed', 'true');
    setFieldError(target, '');
    updateSummary();
  }

  document.querySelectorAll('.choice-chip').forEach((chip) => {
    chip.addEventListener('click', () => {
      const target = chip.getAttribute('data-target');
      const value = chip.getAttribute('data-value') || '';
      applyChoiceChip(target, value, chip);
    });
  });

  if (toStep2Btn) {
    toStep2Btn.addEventListener('click', () => {
      toStep2Btn.disabled = true;
      const stepOneFields = [fullName, email, projectType];
      const isValid = validateFields(stepOneFields);
      if (!isValid) {
        formError.classList.remove('hidden');
        setFormStatus('Please complete Step 1 before continuing.', 'text-red-700');
        toStep2Btn.disabled = false;
        return;
      }
      formError.classList.add('hidden');
      setFormStatus('Step 2: confirm scope and submit your inquiry.', 'text-slate-600');
      setStep(2);
      updateSummary();
      withTemporaryButtonDisable(toStep2Btn, 220);
    });
  }

  if (backToStep1Btn) {
    backToStep1Btn.addEventListener('click', () => {
      backToStep1Btn.disabled = true;
      setStep(1);
      withTemporaryButtonDisable(backToStep1Btn, 220);
    });
  }

  const validatedFields = [fullName, email, projectType, primaryGoal, message, consent].filter(Boolean);
  validatedFields.forEach((field) => {
    const evt = field.tagName === 'SELECT' || field.type === 'checkbox' ? 'change' : 'input';
    field.addEventListener(evt, () => {
      if (field.tagName === 'SELECT') {
        field.classList.toggle('has-value', field.value !== '');
      }
      if (!field.checkValidity()) {
        setFieldError(field, getFieldMessage(field));
        return;
      }
      setFieldError(field, '');
      updateSummary();
    });
  });

  if (form) {
    form.addEventListener('submit', (e) => {
      if (currentFormStep !== 2) {
        e.preventDefault();
        setStep(2);
        updateSummary();
        return;
      }
      const visibleFieldValid = validateFields([fullName, email, projectType, primaryGoal, message, consent]);
      let chipsValid = true;
      if (!budgetRange.value) {
        setFieldError(budgetRange, 'Please choose a budget range.');
        chipsValid = false;
      } else {
        setFieldError(budgetRange, '');
      }
      if (!timeline.value) {
        setFieldError(timeline, 'Please choose a timeline.');
        chipsValid = false;
      } else {
        setFieldError(timeline, '');
      }
      if (!visibleFieldValid || !chipsValid) {
        e.preventDefault();
        formError.classList.remove('hidden');
        setFormStatus('Submission failed. Please fill in all required fields and try again.', 'text-red-700');
        return;
      }
      if (honeypot && honeypot.value.trim() !== '') {
        e.preventDefault();
        setFormStatus('Submission failed. Please try again.', 'text-red-700');
        return;
      }
      validatedFields.forEach((field) => setFieldError(field, ''));
      setFieldError(budgetRange, '');
      setFieldError(timeline, '');
      buildLeadScore();
      formError.classList.add('hidden');
      setFormStatus('Submitting your inquiry now...', 'text-green-700');
      submitBtn.disabled = true;
      submitBtn.textContent = 'Sending...';
      setTimeout(() => {
        submitBtn.disabled = false;
        submitBtn.textContent = 'Send Inquiry';
      }, 12000);
    });
  }
  [projectType, primaryGoal].forEach((selectField) => {
    if (selectField) {
      selectField.classList.toggle('has-value', selectField.value !== '');
    }
  });
  setStep(1);
  updateSummary();

  // Subtle reveal animation for section content
  const revealTargets = document.querySelectorAll(
    'main section h2, main section .interactive-card, main section .panel-muted'
  );
  if ('IntersectionObserver' in window) {
    revealTargets.forEach((el, index) => {
      el.classList.add('reveal');
      el.style.transitionDelay = `${Math.min(index * 24, 160)}ms`;
    });

    const observer = new IntersectionObserver(
      (entries) => {
        entries.forEach((entry) => {
          if (entry.isIntersecting) {
            entry.target.classList.add('in-view');
            observer.unobserve(entry.target);
          }
        });
      },
      { rootMargin: '0px 0px -10% 0px', threshold: 0.12 }
    );
    revealTargets.forEach((el) => observer.observe(el));
  }
}

function eagerEnhancedUxInit(event) {
  const target = event.target;
  if (!(target instanceof Element)) return;
  if (target.closest('#contact') || target.closest('#leadForm') || target.closest('.choice-chip')) {
    initEnhancedUx();
  }
}
enhancedUxInitEvents.forEach((evt) => {
  document.addEventListener(evt, eagerEnhancedUxInit, { capture: true });
});
if ('requestIdleCallback' in window) {
  window.requestIdleCallback(initEnhancedUx, { timeout: 6500 });
} else {
  window.setTimeout(initEnhancedUx, 5000);
}

