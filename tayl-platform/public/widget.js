(function () {
  var script = document.currentScript;
  var slug = script.getAttribute('data-tayl-slug');
  if (!slug) {
    console.error('TAYL widget: missing data-tayl-slug attribute on the script tag');
    return;
  }

  var origin = new URL(script.src).origin;
  var open = false;

  // Floating launcher bubble
  var bubble = document.createElement('button');
  bubble.setAttribute('aria-label', 'Open chat');
  bubble.style.cssText =
    'position:fixed;bottom:20px;right:20px;width:56px;height:56px;border-radius:9999px;' +
    'border:none;cursor:pointer;z-index:2147483000;' +
    'background:linear-gradient(135deg,#C89B3C,#a97f2e);' +
    'box-shadow:0 8px 24px rgba(0,0,0,0.25);' +
    'display:flex;align-items:center;justify-content:center;' +
    'transition:transform 0.2s ease;';
  bubble.innerHTML =
    '<svg width="24" height="24" viewBox="0 0 48 48" fill="none">' +
    '<path d="M24 6c-1.4 0-2.5 1.1-2.5 2.5v1.6C15.9 11.4 12 15.9 12 21.3v7.4l-3.2 4.8c-.6.9 0 2.1 1.1 2.1h28.2c1.1 0 1.7-1.2 1.1-2.1L36 28.7v-7.4c0-5.4-3.9-9.9-9.5-11.2V8.5C26.5 7.1 25.4 6 24 6z" fill="#1B2A22"/>' +
    '<path d="M19 37.5a5 5 0 0 0 10 0" stroke="#1B2A22" stroke-width="2.4" stroke-linecap="round" fill="none"/>' +
    '</svg>';
  bubble.onmouseenter = function () { bubble.style.transform = 'scale(1.06)'; };
  bubble.onmouseleave = function () { bubble.style.transform = 'scale(1)'; };

  // Chat panel (iframe keeps the widget's styles fully isolated from the host site)
  var panel = document.createElement('div');
  panel.style.cssText =
    'position:fixed;bottom:88px;right:20px;width:380px;max-width:calc(100vw - 32px);' +
    'height:560px;max-height:calc(100vh - 120px);border-radius:16px;overflow:hidden;' +
    'box-shadow:0 20px 60px rgba(0,0,0,0.35);z-index:2147483000;' +
    'display:none;transition:opacity 0.2s ease;background:#1B2A22;';

  var iframe = document.createElement('iframe');
  iframe.src = origin + '/chat/' + encodeURIComponent(slug) + '?embedded=1';
  iframe.style.cssText = 'width:100%;height:100%;border:none;';
  iframe.title = 'Chat';
  panel.appendChild(iframe);

  function toggle() {
    open = !open;
    panel.style.display = open ? 'block' : 'none';
  }

  bubble.addEventListener('click', toggle);

  document.body.appendChild(panel);
  document.body.appendChild(bubble);
})();
