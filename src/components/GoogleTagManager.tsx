const containerId = "GTM-NLCSSX9H";
const origin = "https://www.googletagmanager.com";

const bootstrap = `(function () {
  if (document.getElementById('jovens-gtm-container')) return;
  window.dataLayer = window.dataLayer || [];
  window.dataLayer.push({'gtm.start': Date.now(), event: 'gtm.js'});
  var script = document.createElement('script');
  script.id = 'jovens-gtm-container';
  script.async = true;
  script.src = '${origin}/gtm.js?id=${containerId}';
  document.head.appendChild(script);
})();`;

export function GoogleTagManager() {
  return <script dangerouslySetInnerHTML={{ __html: bootstrap }} />;
}

export function GoogleTagManagerFallback() {
  return (
    <noscript>
      <iframe src={`${origin}/ns.html?id=${containerId}`} title="Google Tag Manager" height="0" width="0" style={{ display: "none", visibility: "hidden" }} />
    </noscript>
  );
}
