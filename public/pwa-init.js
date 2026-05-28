// Capture beforeinstallprompt as early as possible
window.addEventListener('beforeinstallprompt', function(e) {
  e.preventDefault();
  window.__deferredInstallPrompt = e;
  window.dispatchEvent(new Event('pwaInstallReady'));
});
