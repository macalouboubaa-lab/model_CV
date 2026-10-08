(function () {
  const MODEL_ID_PATTERN = /^model(?:[1-9]|1[0-4])$/;

  function detectModelId() {
    const requestedModel = new URLSearchParams(window.location.search).get('model');
    if (MODEL_ID_PATTERN.test(requestedModel || '')) return requestedModel;
    const match = window.location.pathname.match(/model(\d+)\.html$/);
    const detectedModel = match ? `model${match[1]}` : 'model1';
    return MODEL_ID_PATTERN.test(detectedModel) ? detectedModel : 'model1';
  }

  function addATSControls() {
    const container = document.querySelector('#cvContainer');
    const toolbar = document.querySelector('.toolbar');
    const heading = container?.querySelector('h1');
    if (!container || !toolbar || !heading) return;

    if (!container.querySelector('.ats-friendly-badge')) {
      const badge = document.createElement('span');
      badge.className = 'ats-friendly-badge';
      badge.textContent = 'ATS Friendly';
      heading.insertAdjacentElement('afterend', badge);
    }

    if (!toolbar.querySelector('.ats-mode-toggle')) {
      const toggle = document.createElement('button');
      toggle.type = 'button';
      toggle.className = 'secondary ats-mode-toggle no-print';
      toggle.textContent = 'Mode ATS';
      toggle.setAttribute('aria-pressed', 'false');
      toggle.addEventListener('click', () => {
        const enabled = document.body.classList.toggle('ats-mode');
        toggle.setAttribute('aria-pressed', String(enabled));
      });
      const status = toolbar.querySelector('.save-status');
      toolbar.insertBefore(toggle, status || null);
    }

    if (!document.querySelector('#sama-ats-styles')) {
      const style = document.createElement('style');
      style.id = 'sama-ats-styles';
      style.textContent = `
        .ats-friendly-badge { display:inline-block; margin:6px 0 8px; padding:4px 10px; border-radius:4px; background:#27AE60; color:#fff; font:700 11px Arial,sans-serif; }
        body.ats-mode #cvContainer { display:block!important; width:min(210mm,100%)!important; columns:1!important; column-count:1!important; }
        body.ats-mode #cvContainer > * { grid-area:auto!important; float:none!important; width:100%!important; max-width:none!important; }
        body.ats-mode #cvContainer .modern-grid, body.ats-mode #cvContainer .bottom-grid, body.ats-mode #cvContainer .content-grid, body.ats-mode #cvContainer .layout { display:block!important; grid-template-columns:1fr!important; columns:1!important; }
        body.ats-mode #cvContainer .sidebar, body.ats-mode #cvContainer .cv-sidebar { background:transparent!important; color:#222!important; }
        body.ats-mode #cvContainer .skills-section, body.ats-mode #cvContainer .languages-section, body.ats-mode #cvContainer .side-group { display:block!important; width:100%!important; }
        body.ats-mode #cvContainer .metrics { display:block!important; }
        body.ats-mode #cvContainer .metric { padding:5px 0!important; border:0!important; background:transparent!important; text-align:left!important; }
        body.ats-mode #cvContainer .metric b, body.ats-mode #cvContainer .metric span { display:inline!important; margin-right:5px!important; }
        body.ats-mode #cvContainer .icon, body.ats-mode #cvContainer .color-chip, body.ats-mode #cvContainer .section-title:before { display:none!important; }
        body.ats-mode #cvContainer, body.ats-mode #cvContainer * { font-size:14px!important; line-height:1.4!important; letter-spacing:normal!important; }
        body.ats-mode #cvContainer h1 { font-size:28px!important; }
        body.ats-mode #cvContainer h2, body.ats-mode #cvContainer .section-title { font-size:17px!important; text-transform:uppercase!important; }
        body.ats-mode #cvContainer .profile-photo { width:64px!important; height:64px!important; }
        body.ats-mode #cvContainer:before { display:none!important; }
      `;
      document.head.appendChild(style);
    }
  }

  function showWarning(message) {
    let warning = document.getElementById('sama-protection-warning');
    if (!warning) {
      warning = document.createElement('div');
      warning.id = 'sama-protection-warning';
      warning.setAttribute('role', 'alert');
      document.body.appendChild(warning);
    }
    warning.textContent = message;
    warning.classList.remove('warning-visible');
    requestAnimationFrame(() => warning.classList.add('warning-visible'));
    window.clearTimeout(warning.hideTimer);
    warning.hideTimer = window.setTimeout(() => warning.classList.remove('warning-visible'), 2600);
  }

  function enableProtection() {
    document.addEventListener('contextmenu', (event) => {
      event.preventDefault();
      showWarning('L’action du menu contextuel est désactivée sur cet aperçu.');
    });

    document.addEventListener('keydown', (event) => {
      const key = event.key.toLowerCase();
      const commandPressed = event.ctrlKey || event.metaKey;
      const restrictedShortcut = commandPressed && ['c', 'a', 'u', 's', 'p'].includes(key);
      const restrictedKey = event.key === 'F12' || event.key === 'PrintScreen';
      if (!restrictedShortcut && !restrictedKey) return;

      event.preventDefault();
      showWarning('Cette action est désactivée dans l’aperçu. La protection contre les captures d’écran n’est pas garantie par un navigateur.');
    });

    document.addEventListener('copy', (event) => {
      event.preventDefault();
      showWarning('La copie du texte est désactivée dans cet aperçu.');
    });
  }

  function addWatermark() {
    const modelId = detectModelId();
    return Promise.resolve(window.getVerifiedSession?.()).then(async (session) => {
      if (session?.isAdmin) {
        document.body.classList.add('admin-mode');
        return false;
      }

      const isPaid = Boolean(session?.email && await window.hasPaid?.(session.email, modelId));
      const watermarkMessage = isPaid ? 'Paiement validé' : 'Aperçu — Non payé';
      const watermarkCta = isPaid ? 'PDF privé bientôt disponible' : 'Payez 2.000 FCFA';

      const watermark = document.createElement('div');
      watermark.id = 'sama-watermark';
      watermark.setAttribute('aria-hidden', 'true');
      watermark.innerHTML = `<div class="watermark-content">${Array.from({ length: 12 }, () => `
        <div class="watermark-text">
          <span class="watermark-brand">SAMA CV</span>
          <span class="watermark-msg">${watermarkMessage}</span>
          <span class="watermark-cta">${watermarkCta}</span>
          <span class="watermark-url">samacv.com</span>
        </div>`).join('')}</div>`;
      document.body.appendChild(watermark);

      const banner = document.createElement('div');
      banner.id = 'sama-banner';
      banner.innerHTML = isPaid
        ? '<span>Paiement validé</span><span class="separator">•</span><span>Le téléchargement PDF privé n’est pas encore disponible.</span>'
        : '<span>Document en aperçu</span><span class="separator">•</span><span>Le paiement sera vérifié par un administrateur.</span><button type="button">Payer 2.000 FCFA</button>';
      const bannerPaymentButton = banner.querySelector('button');
      bannerPaymentButton?.addEventListener('click', () => {
        window.location.assign(`/payment.html?model=${encodeURIComponent(modelId)}`);
      });
      document.body.appendChild(banner);

      const exportButton = document.querySelector('.toolbar button[onclick="exportPDF()"]');
      if (exportButton) {
        const replacementButton = document.createElement('button');
        replacementButton.type = 'button';
        replacementButton.className = isPaid
          ? exportButton.className
          : `${exportButton.className} sama-pay-button`;
        replacementButton.textContent = isPaid
          ? 'PDF privé bientôt disponible'
          : 'Payer 2.000 FCFA pour télécharger';
        if (isPaid) {
          replacementButton.disabled = true;
          replacementButton.title = 'Le téléchargement privé du PDF n’est pas encore configuré.';
        } else {
          replacementButton.addEventListener('click', () => {
            window.location.assign(`/payment.html?model=${encodeURIComponent(modelId)}`);
          });
        }
        exportButton.replaceWith(replacementButton);
      }

      const style = document.createElement('style');
      style.textContent = `
        #sama-watermark { position:fixed; inset:0; z-index:9998; overflow:hidden; pointer-events:none; }
        .watermark-content { position:absolute; inset:-20%; display:grid; grid-template-columns:repeat(3,1fr); grid-template-rows:repeat(4,1fr); transform:rotate(-30deg) scale(1.1); opacity:0.4; }
        .watermark-text { display:flex; flex-direction:column; align-items:center; justify-content:center; gap:4px; padding:12px; color:#2C3E50; font:600 12px Arial,sans-serif; text-align:center; }
        .watermark-brand { color:#C342FF; font-size:27px; font-weight:900; }
        .watermark-msg { color:#E74C3C; font-size:12px; font-weight:700; }
        .watermark-cta { color:#2C3E50; }
        .watermark-url { color:#7F8C8D; font-size:10px; }
        #sama-banner { position:fixed; inset:auto 0 0; z-index:9999; display:flex; flex-wrap:wrap; justify-content:center; align-items:center; gap:10px; padding:12px 18px; border-top:3px solid #C342FF; background:#0B0F19; color:white; font:13px Arial,sans-serif; }
        #sama-banner .separator { color:#4A5060; }
        #sama-banner button { padding:8px 14px; border:0; border-radius:5px; background:#27AE60; color:white; font:700 13px Arial,sans-serif; cursor:pointer; }
        .toolbar .sama-pay-button { background:#27AE60!important; }
        #sama-protection-warning { position:fixed; z-index:10001; top:18px; left:50%; padding:10px 16px; border:1px solid #ff7474; border-radius:5px; background:#8f2020; color:white; font:600 13px Arial,sans-serif; opacity:0; pointer-events:none; transform:translate(-50%,-8px); transition:opacity .2s,transform .2s; }
        #sama-protection-warning.warning-visible { opacity:1; transform:translate(-50%,0); }
        body.admin-mode #sama-watermark, body.admin-mode #sama-banner { display:none!important; }
        @media(max-width:600px) { .watermark-content { inset:-12%; grid-template-columns:repeat(2,1fr); grid-template-rows:repeat(5,1fr); } .watermark-brand { font-size:21px; } #sama-banner { gap:6px; padding:8px 10px; font-size:11px; } #sama-banner button { font-size:11px; padding:6px 10px; } }
        @media print { body:not(.admin-mode) #sama-watermark { display:block!important; opacity:1!important; } body:not(.admin-mode) .watermark-content { opacity:0.4!important; } #sama-banner { display:none!important; } }
      `;
      document.head.appendChild(style);
      return true;
    }).catch(() => {
      showWarning('Le statut d’accès n’a pas pu être vérifié. Le document reste en aperçu.');
      return false;
    });
  }

  document.addEventListener('DOMContentLoaded', () => {
    enableProtection();
    addATSControls();
    addWatermark();
  });

  Object.assign(window, { enableProtection, showWarning, addWatermark, detectModelId, addATSControls });
})();