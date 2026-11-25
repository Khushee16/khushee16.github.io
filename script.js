/* 79 Web Span Studio — site behavior. Head, header and footer are assembled server-side. */
(function () {
  function initSite() {
      var form = document.getElementById('briefForm');
      var output = document.getElementById('briefOutput');
      var status = document.getElementById('copyStatus');
      var progress = document.querySelector('.progress-line');
      var contactForm = document.getElementById('contactForm');
      var contactStatus = document.getElementById('contactStatus');

      var themeToggle = document.getElementById('themeToggle');
      function getTheme() {
        var saved = null;
        try { saved = localStorage.getItem('sws-theme'); } catch (e) {}
        if (saved === 'light' || saved === 'dark') return saved;
        return window.matchMedia('(prefers-color-scheme: dark)').matches ? 'dark' : 'light';
      }
      function paintThemeToggle(theme) {
        if (!themeToggle) return;
        var dark = theme === 'dark';
        themeToggle.setAttribute('aria-label', dark ? 'Switch to light mode' : 'Switch to dark mode');
        themeToggle.setAttribute('aria-pressed', dark ? 'true' : 'false');
      }
      function setTheme(theme) {
        document.documentElement.setAttribute('data-theme', theme);
        try { localStorage.setItem('sws-theme', theme); } catch (e) {}
        paintThemeToggle(theme);
      }
      if (themeToggle) {
        paintThemeToggle(getTheme());
        themeToggle.addEventListener('click', function () {
          setTheme(getTheme() === 'dark' ? 'light' : 'dark');
        });
      }

      function selected(name) {
        var el = form.querySelector('input[name="' + name + '"]:checked');
        return el ? el.value : '';
      }

      function buildBrief() {
        var text = 'PROJECT BRIEF — 79 WEB SPAN STUDIO\n\n' +
          'I am looking to create ' + selected('project') + '.\n' +
          'The primary goal is to ' + selected('goal') + '.\n' +
          'My ideal timeline is ' + selected('pace') + '.\n\n' +
          'Next, I will add my audience, required pages, content status, and any reference websites.';
        output.textContent = text;
        status.textContent = '';
        return text;
      }

      if (form && output && status) {
      form.addEventListener('change', buildBrief);
      buildBrief();

      document.getElementById('copyBrief').addEventListener('click', function () {
        var text = buildBrief();
        if (navigator.clipboard && window.isSecureContext) {
          navigator.clipboard.writeText(text).then(function () {
            status.textContent = 'Brief copied to your clipboard.';
          }).catch(function () {
            status.textContent = 'Copy was unavailable. Select the brief text manually.';
          });
        } else {
          var area = document.createElement('textarea');
          area.value = text;
          area.setAttribute('readonly', '');
          area.style.position = 'fixed';
          area.style.opacity = '0';
          document.body.appendChild(area);
          area.select();
          var copied = document.execCommand('copy');
          document.body.removeChild(area);
          status.textContent = copied ? 'Brief copied to your clipboard.' : 'Copy was unavailable. Select the brief text manually.';
        }
      });

      document.getElementById('downloadBrief').addEventListener('click', function () {
        var blob = new Blob([buildBrief()], { type: 'text/plain;charset=utf-8' });
        var url = URL.createObjectURL(blob);
        var anchor = document.createElement('a');
        anchor.href = url;
        anchor.download = '79-web-span-project-brief.txt';
        document.body.appendChild(anchor);
        anchor.click();
        document.body.removeChild(anchor);
        URL.revokeObjectURL(url);
        status.textContent = 'Brief downloaded as a text file.';
      });

      form.addEventListener('submit', function (event) {
        event.preventDefault();
        var briefField = document.getElementById('briefField');
        if (briefField) briefField.value = buildBrief();
        var submitButton = form.querySelector('button[type="submit"]');
        if (submitButton) submitButton.disabled = true;
        form.setAttribute('aria-busy', 'true');
        status.textContent = 'Sending your brief…';
        fetch('https://formsubmit.co/ajax/79webspanstudio@gmail.com', {
          method: 'POST',
          headers: { 'Accept': 'application/json' },
          body: new FormData(form)
        }).then(function (response) { return response.json(); }).then(function (data) {
          if (data && data.success === 'true') {
            window.location.href = 'brief.html?sent=1';
          } else {
            if (submitButton) submitButton.disabled = false;
            form.removeAttribute('aria-busy');
            status.textContent = 'Sending failed — please try again, or copy the brief instead.';
          }
        }).catch(function () {
          if (submitButton) submitButton.disabled = false;
          form.removeAttribute('aria-busy');
          status.textContent = 'Sending failed — please try again, or copy the brief instead.';
        });
      });

      if (new URLSearchParams(window.location.search).get('sent') === '1') {
        status.textContent = 'Thank you — your brief was sent. We\'ll be in touch.';
      }
      }

      if (contactForm && contactStatus) {
      if (new URLSearchParams(window.location.search).get('sent') === '1') {
        contactStatus.textContent = 'Thank you — your inquiry was sent. We\'ll reply soon.';
      }

      var copyInquiryButton = document.getElementById('copyInquiry');
      if (copyInquiryButton) copyInquiryButton.addEventListener('click', function () {
        var data = new FormData(contactForm);
        var inquiry = 'PROJECT INQUIRY — 79 WEB SPAN STUDIO\n\n' +
          'Name: ' + data.get('name') + '\n' +
          'Email: ' + data.get('email') + '\n' +
          'Project: ' + data.get('project') + '\n' +
          'Timeline: ' + data.get('timeline') + '\n\n' +
          'Project details:\n' + data.get('message');

        function showContactResult(copied) {
          contactStatus.textContent = copied ? 'Inquiry copied. It is ready to paste into your preferred email or message app.' : 'Copy was unavailable. Select and copy your details from the fields above.';
        }

        if (navigator.clipboard && window.isSecureContext) {
          navigator.clipboard.writeText(inquiry).then(function () { showContactResult(true); }).catch(function () { showContactResult(false); });
        } else {
          var contactArea = document.createElement('textarea');
          contactArea.value = inquiry;
          contactArea.setAttribute('readonly', '');
          contactArea.style.position = 'fixed';
          contactArea.style.opacity = '0';
          document.body.appendChild(contactArea);
          contactArea.select();
          var contactCopied = document.execCommand('copy');
          document.body.removeChild(contactArea);
          showContactResult(contactCopied);
        }
      });
      }

      var siteNav = document.querySelector('.studio-nav');
      var progressTicking = false;
      function updateProgress() {
        progressTicking = false;
        var doc = document.documentElement;
        var max = doc.scrollHeight - doc.clientHeight;
        if (progress) progress.style.width = (max > 0 ? (doc.scrollTop / max) * 100 : 0) + '%';
        if (siteNav) siteNav.classList.toggle('is-scrolled', doc.scrollTop > 8);
      }
      function requestProgress() {
        if (!progressTicking) {
          progressTicking = true;
          window.requestAnimationFrame(updateProgress);
        }
      }
      document.addEventListener('scroll', requestProgress, { passive: true });
      window.addEventListener('resize', requestProgress, { passive: true });
      updateProgress();

      var motionQuery = window.matchMedia('(prefers-reduced-motion: reduce)');
      var reduceMotion = motionQuery.matches;
      var reveals = document.querySelectorAll('.reveal');
      /* Stagger siblings slightly so grouped cards cascade in. */
      reveals.forEach(function (el) {
        var siblings = el.parentElement ? el.parentElement.querySelectorAll(':scope > .reveal') : [];
        var index = Array.prototype.indexOf.call(siblings, el);
        if (index > 0) el.style.setProperty('--reveal-delay', Math.min(index * 70, 350) + 'ms');
      });
      function showAllReveals() {
        document.documentElement.classList.remove('motion-ready');
        reveals.forEach(function (el) { el.classList.add('is-visible'); });
      }
      if (!reduceMotion && ('IntersectionObserver' in window)) {
        document.documentElement.classList.add('motion-ready');
      }
      if (reduceMotion || !('IntersectionObserver' in window)) {
        showAllReveals();
      } else {
        var observer = new IntersectionObserver(function (entries) {
          entries.forEach(function (entry) {
            if (entry.isIntersecting) {
              var target = entry.target;
              target.classList.add('is-visible');
              observer.unobserve(target);
              var delay = parseInt(target.style.getPropertyValue('--reveal-delay'), 10) || 0;
              window.setTimeout(function () {
                target.style.removeProperty('--reveal-delay');
                target.classList.add('is-settled');
              }, delay + 700);
            }
          });
        }, { threshold: .08, rootMargin: '0px 0px -6% 0px' });
        reveals.forEach(function (el) { observer.observe(el); });
        /* If the user turns reduced motion on mid-visit, reveal everything. */
        if (motionQuery.addEventListener) {
          motionQuery.addEventListener('change', function (event) {
            if (event.matches) { observer.disconnect(); showAllReveals(); }
          });
        }
      }

      /* Full-screen mobile menu: instant open/close, no Bootstrap height
         animation. The toggler is taken over on small screens so the menu
         opens as a fixed full-page overlay instead of an in-flow panel. */
      var menuButton = document.querySelector('.navbar-toggler');
      var menu = document.getElementById('siteNav');
      var mqMobile = window.matchMedia('(max-width: 991.98px)');
      function setMenu(open) {
        if (menu) menu.classList.toggle('show', open);
        document.body.classList.toggle('nav-open', open);
        document.documentElement.classList.toggle('nav-open', open);
        if (menuButton) menuButton.setAttribute('aria-expanded', open ? 'true' : 'false');
      }
      function isMenuOpen() {
        return (menu && menu.classList.contains('show')) || document.body.classList.contains('nav-open');
      }
      if (menuButton && menu) {
        menuButton.addEventListener('click', function (event) {
          if (!mqMobile.matches) return; /* desktop: toggler is hidden anyway */
          if (window.bootstrap) event.stopPropagation(); /* keep Bootstrap's slow collapse animation out of it */
          setMenu(!isMenuOpen());
        });
        document.addEventListener('keydown', function (event) {
          if (event.key === 'Escape') setMenu(false);
        });
        mqMobile.addEventListener('change', function () {
          if (!mqMobile.matches) setMenu(false);
        });
        document.querySelectorAll('#siteNav a').forEach(function (link) {
          link.addEventListener('click', function () { setMenu(false); });
        });
      }

      if (!window.bootstrap) {
        document.querySelectorAll('[data-bs-toggle="collapse"]').forEach(function (button) {
          if (button === menuButton) return;
          button.addEventListener('click', function () {
            var selector = button.getAttribute('data-bs-target');
            var panel = document.querySelector(selector);
            if (!panel) return;
            var parent = panel.getAttribute('data-bs-parent');
            var willOpen = !panel.classList.contains('show');
            if (parent) {
              document.querySelectorAll(parent + ' .accordion-collapse.show').forEach(function (openPanel) {
                if (openPanel !== panel) openPanel.classList.remove('show');
              });
              document.querySelectorAll(parent + ' .accordion-button').forEach(function (otherButton) {
                if (otherButton !== button) {
                  otherButton.classList.add('collapsed');
                  otherButton.setAttribute('aria-expanded', 'false');
                }
              });
            }
            panel.classList.toggle('show', willOpen);
            button.classList.toggle('collapsed', !willOpen);
            button.setAttribute('aria-expanded', willOpen ? 'true' : 'false');
          });
        });
      }

  }

  if (document.readyState === "loading") {
    document.addEventListener("DOMContentLoaded", initSite);
  } else {
    initSite();
  }
})();
