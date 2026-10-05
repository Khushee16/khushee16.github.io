/* 79 Web Span Studio — loads the shared header/footer partials around the body content, then starts the site. */
(function () {
  function loadFragment(url) {
    return fetch(url).then(function (res) {
      if (!res.ok) throw new Error("Could not load " + url);
      return res.text();
    });
  }

  function initSite() {
      var form = document.getElementById('briefForm');
      var output = document.getElementById('briefOutput');
      var status = document.getElementById('copyStatus');
      var progress = document.querySelector('.progress-line');
      var contactForm = document.getElementById('contactForm');
      var contactStatus = document.getElementById('contactStatus');

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

      contactForm.addEventListener('submit', function (event) {
        event.preventDefault();
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

      function updateProgress() {
        var doc = document.documentElement;
        var max = doc.scrollHeight - doc.clientHeight;
        progress.style.width = (max > 0 ? (doc.scrollTop / max) * 100 : 0) + '%';
      }
      document.addEventListener('scroll', updateProgress, { passive: true });
      updateProgress();

      var reduceMotion = window.matchMedia('(prefers-reduced-motion: reduce)').matches;
      var reveals = document.querySelectorAll('.reveal');
      if (!reduceMotion && ('IntersectionObserver' in window)) {
        document.documentElement.classList.add('motion-ready');
      }
      if (reduceMotion || !('IntersectionObserver' in window)) {
        reveals.forEach(function (el) { el.classList.add('is-visible'); });
      } else {
        var observer = new IntersectionObserver(function (entries) {
          entries.forEach(function (entry) {
            if (entry.isIntersecting) {
              entry.target.classList.add('is-visible');
              observer.unobserve(entry.target);
            }
          });
        }, { threshold: .12 });
        reveals.forEach(function (el) { observer.observe(el); });
      }

      var menuButton = document.querySelector('.navbar-toggler');
      var menu = document.getElementById('siteNav');
      if (menuButton && menu && !window.bootstrap) {
        menuButton.addEventListener('click', function () {
          var open = menu.classList.toggle('show');
          menuButton.setAttribute('aria-expanded', open ? 'true' : 'false');
        });
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

      document.querySelectorAll('#siteNav a').forEach(function (link) {
        link.addEventListener('click', function () {
          if (menu.classList.contains('show')) {
            if (window.bootstrap) {
              bootstrap.Collapse.getOrCreateInstance(menu).hide();
            } else {
              menu.classList.remove('show');
              menuButton.setAttribute('aria-expanded', 'false');
            }
          }
        });
      });
  }

  function start() {
    var main = document.getElementById("main");
    if (main && window.fetch) {
      Promise.all([loadFragment("header.html"), loadFragment("footer.html")])
        .then(function (parts) {
          main.insertAdjacentHTML("beforebegin", parts[0]);
          main.insertAdjacentHTML("afterend", parts[1]);
          initSite();
        })
        .catch(function () { initSite(); });
    } else {
      initSite();
    }
  }

  if (document.readyState === "loading") {
    document.addEventListener("DOMContentLoaded", start);
  } else {
    start();
  }
})();
