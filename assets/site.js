// Netsoft Expert Studio — shared behaviour for every page

(function () {
  var yearEl = document.getElementById('year');
  if (yearEl) yearEl.textContent = new Date().getFullYear();

  // The address never appears in the markup — assembled here so scrapers that
  // don't run scripts have nothing to harvest.
  var CONTACTS = {
    work: { b: 'YnVyYWNoYWkucEBuZXRzb2Z0LWV4cGVydC5jb20=', s: 'สอบถามงานพัฒนาซอฟต์แวร์' },
    apps: { b: 'cm9rb21hbkBnbWFpbC5jb20=',                 s: 'สอบถามเกี่ยวกับแอป' }
  };
  var addrOf = function (k) { return atob((CONTACTS[k] || CONTACTS.work).b); };

  document.querySelectorAll('.js-mail').forEach(function (el) {
    el.addEventListener('click', function () {
      var k = el.dataset.k || 'work';
      var subject = (CONTACTS[k] || CONTACTS.work).s;
      // pages can override the prefilled subject, e.g. the security page
      if (el.dataset.subject) subject = el.dataset.subject;
      window.location.href = 'mailto:' + addrOf(k) + '?subject=' + encodeURIComponent(subject);
    });
  });

  // execCommand still covers the cases the async clipboard API refuses
  function legacyCopy(text) {
    var ta = document.createElement('textarea');
    ta.value = text;
    ta.setAttribute('readonly', '');
    ta.style.cssText = 'position:fixed;top:-1000px;opacity:0';
    document.body.appendChild(ta);
    ta.select();
    var ok = false;
    try { ok = document.execCommand('copy'); } catch (e) { ok = false; }
    ta.remove();
    return ok;
  }

  var status = document.querySelector('.copied');
  document.querySelectorAll('.js-copy').forEach(function (el) {
    el.addEventListener('click', async function () {
      var addr = addrOf(el.dataset.k);
      var ok = false;
      try {
        await navigator.clipboard.writeText(addr);
        ok = true;
      } catch (e) {
        ok = legacyCopy(addr);
      }
      if (!status) return;
      status.textContent = ok ? 'คัดลอกอีเมลแล้ว' : 'คัดลอกไม่สำเร็จ — กดปุ่มอีเมลด้านบนแทนได้';
      setTimeout(function () { status.textContent = ''; }, 4000);
    });
  });

  var items = document.querySelectorAll('.reveal');
  if ('IntersectionObserver' in window && !matchMedia('(prefers-reduced-motion: reduce)').matches) {
    var io = new IntersectionObserver(function (entries) {
      entries.forEach(function (e, i) {
        if (!e.isIntersecting) return;
        e.target.style.transitionDelay = Math.min(i * 35, 175) + 'ms';
        e.target.classList.add('in');
        io.unobserve(e.target);
      });
    }, { rootMargin: '0px 0px 5% 0px' });
    items.forEach(function (el) { io.observe(el); });
  } else {
    items.forEach(function (el) { el.classList.add('in'); });
  }

  // The one-page site used #products / #services / #work anchors. Anyone arriving
  // with an old link lands on the home page — send them to the page that content moved to.
  var MOVED = { '#products': '/products/', '#services': '/services/', '#work': '/work/' };
  if (location.pathname === '/' && MOVED[location.hash]) {
    location.replace(MOVED[location.hash]);
  }
})();
