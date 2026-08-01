(function () {
  var script = document.currentScript;
  var slug = script.getAttribute('data-tayl-slug');
  if (!slug) {
    console.error('TAYL widget: missing data-tayl-slug attribute on the script tag');
    return;
  }

  var origin = new URL(script.src).origin;
  var open = false;

  // Floating launcher bubble — docked bottom-right corner
  var bubble = document.createElement('button');
  bubble.setAttribute('aria-label', 'Open chat');
  bubble.style.cssText =
    'position:fixed;bottom:20px;right:20px;width:56px;height:56px;border-radius:9999px;' +
    'border:none;cursor:pointer;z-index:2147483000;' +
    'background:linear-gradient(135deg,#8b5cf6,#6d5ae6);' +
    'box-shadow:0 6px 20px rgba(139,92,246,0.35);' +
    'display:flex;align-items:center;justify-content:center;' +
    'transition:box-shadow 0.2s ease;';
  bubble.innerHTML =
    '<svg width="22" height="22" viewBox="0 0 48 48" fill="none">' +
    '<path d="M24 4c1 7 3 11 6 14 3 3 7 5 14 6-7 1-11 3-14 6-3 3-5 7-6 14-1-7-3-11-6-14-3-3-7-5-14-6 7-1 11-3 14-6 3-3 5-7 6-14z" fill="#ffffff"/>' +
    '</svg>';
  bubble.onmouseenter = function () { bubble.style.boxShadow = '0 6px 24px rgba(139,92,246,0.5)'; };
  bubble.onmouseleave = function () { bubble.style.boxShadow = '0 6px 20px rgba(139,92,246,0.35)'; };

  // Proactive greeting bubble, shown once after a short delay
  var greeting = document.createElement('div');
  greeting.style.cssText =
    'position:fixed;bottom:96px;right:20px;z-index:2147483000;max-width:240px;' +
    'background:#12131A;border:1px solid rgba(255,255,255,0.08);border-radius:16px 16px 4px 16px;' +
    'padding:12px 16px;box-shadow:0 12px 32px rgba(0,0,0,0.4);font-family:sans-serif;' +
    'display:none;';
  greeting.innerHTML =
    '<button aria-label="Dismiss" style="position:absolute;top:-8px;right:-8px;width:20px;height:20px;' +
    'border-radius:9999px;border:none;background:rgba(255,255,255,0.15);color:rgba(255,255,255,0.8);' +
    'font-size:12px;cursor:pointer;line-height:1;">×</button>' +
    '<p style="margin:0;font-size:13.5px;color:rgba(255,255,255,0.9);">Hey, Taylan here 👋</p>' +
    '<p style="margin:2px 0 0;font-size:12.5px;color:rgba(255,255,255,0.5);">I may be able to help — ask me anything.</p>';

  // Docked chat panel — same corner as the launcher, no gap/float above it.
  // Uses dvh (dynamic viewport height) so it doesn't get clipped by mobile
  // browser toolbars the way 100vh-based sizing does.
  var panel = document.createElement('div');
  panel.style.cssText =
    'position:fixed;bottom:20px;right:20px;width:380px;max-width:calc(100vw - 32px);' +
    'height:min(600px, 82dvh);border-radius:16px;overflow:hidden;' +
    'box-shadow:0 20px 60px rgba(0,0,0,0.5);z-index:2147483000;' +
    'display:none;background:#08090D;';

  var closeBtn = document.createElement('button');
  closeBtn.setAttribute('aria-label', 'Close chat');
  closeBtn.style.cssText =
    'position:absolute;top:12px;right:12px;z-index:1;width:28px;height:28px;border-radius:9999px;' +
    'border:none;background:rgba(0,0,0,0.4);color:rgba(255,255,255,0.8);font-size:14px;cursor:pointer;';
  closeBtn.textContent = '×';

  var iframe = document.createElement('iframe');
  iframe.src = origin + '/chat/' + encodeURIComponent(slug) + '?embedded=1';
  iframe.style.cssText = 'width:100%;height:100%;border:none;';
  iframe.title = 'Chat';
  panel.appendChild(closeBtn);
  panel.appendChild(iframe);

  function setOpen(v) {
    open = v;
    panel.style.display = open ? 'block' : 'none';
    bubble.style.display = open ? 'none' : 'flex';
    if (open) greeting.style.display = 'none';
  }

  bubble.addEventListener('click', function () { setOpen(true); });
  closeBtn.addEventListener('click', function () { setOpen(false); });
  greeting.querySelector('button').addEventListener('click', function (e) {
    e.stopPropagation();
    greeting.style.display = 'none';
  });

  document.body.appendChild(panel);
  document.body.appendChild(greeting);
  document.body.appendChild(bubble);

  setTimeout(function () {
    if (!open) greeting.style.display = 'block';
  }, 1400);
})();
