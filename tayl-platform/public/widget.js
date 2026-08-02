(function () {
  var script = document.currentScript;
  var slug = script.getAttribute('data-tayl-slug');
  if (!slug) {
    console.error('TAYL widget: missing data-tayl-slug attribute on the script tag');
    return;
  }

  var origin = new URL(script.src).origin;
  var open = false;

  var bubble = document.createElement('button');
  bubble.setAttribute('aria-label', 'Open chat');
  bubble.style.cssText =
    'position:fixed;bottom:20px;right:20px;width:56px;height:56px;border-radius:9999px;' +
    'border:none;cursor:pointer;z-index:2147483000;' +
    'background:linear-gradient(135deg,#8b5cf6,#6d5ae6);' +
    'box-shadow:0 6px 20px rgba(139,92,246,0.35);' +
    'display:flex;align-items:center;justify-content:center;';
  bubble.innerHTML =
    '<svg width="22" height="22" viewBox="0 0 48 48" fill="none">' +
    '<path d="M24 4c1 7 3 11 6 14 3 3 7 5 14 6-7 1-11 3-14 6-3 3-5 7-6 14-1-7-3-11-6-14-3-3-7-5-14-6 7-1 11-3 14-6 3-3 5-7 6-14z" fill="#ffffff"/>' +
    '</svg>';

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
  }

  bubble.addEventListener('click', function () { setOpen(true); });
  closeBtn.addEventListener('click', function () { setOpen(false); });

  document.body.appendChild(panel);
  document.body.appendChild(bubble);
})();
