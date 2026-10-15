(function () {
  const MODEL_ID_PATTERN = /^model[1-9]\d{0,3}$/;

  function detectModelId() {
    const requestedModel = new URLSearchParams(window.location.search).get('model');
    if (MODEL_ID_PATTERN.test(requestedModel || '')) return requestedModel;
    const match = window.location.pathname.match(/model(\d+)\.html$/);
    const detectedModel = match ? `model${match[1]}` : 'model1';
    return MODEL_ID_PATTERN.test(detectedModel) ? detectedModel : 'model1';
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

  function addSharedStyles() {
    if (document.querySelector('#sama-shared-styles')) return;
    const style = document.createElement('style');
    style.id = 'sama-shared-styles';
    style.textContent = `
      #cvContainer .profile-photo, #cvContainer .cv-profile-photo { box-sizing:border-box!important; width:96px!important; height:96px!important; max-width:100%; object-fit:cover!important; }
      .sama-generated-toolbar { display:flex; justify-content:center; gap:8px; padding:12px; }
      .sama-generated-toolbar button { padding:9px 14px; border:0; border-radius:5px; background:#27AE60; color:#fff; font-weight:700; cursor:pointer; }
      #sama-watermark { position:fixed; inset:-30%; z-index:9998; overflow:hidden; pointer-events:none; }
      .watermark-content { position:absolute; inset:0; display:grid; grid-template-columns:repeat(8,minmax(0,1fr)); grid-template-rows:repeat(5,minmax(0,1fr)); align-items:center; justify-items:center; transform:rotate(-30deg) scale(1.15); }
      .sama-watermark-item { display:flex; flex-direction:column; align-items:center; gap:7px; color:#1a1a1a; font-family:Arial,sans-serif; text-align:center; opacity:.15; white-space:nowrap; }
      .sama-watermark-item strong { font-size:32px; font-weight:700; letter-spacing:2px; }
      .sama-watermark-item small { font-size:16px; font-style:italic; font-weight:400; }
      .sama-watermark-logo { position:absolute; top:50%; left:50%; width:300px; height:auto; opacity:.08; transform:translate(-50%,-50%) rotate(-30deg); }
      body.paid-user #sama-watermark, body.admin-mode #sama-watermark { display:none!important; }
      @media(max-width:768px) {
        .watermark-content { grid-template-columns:repeat(4,minmax(0,1fr)); grid-template-rows:repeat(5,minmax(0,1fr)); }
        .sama-watermark-item:nth-child(n+21) { display:none; }
        .sama-watermark-item strong { font-size:20px; }
        .sama-watermark-item small { font-size:12px; }
        .sama-watermark-logo { width:180px; }
      }
      #sama-banner { position:fixed; inset:auto 0 0; z-index:9999; display:flex; flex-wrap:wrap; justify-content:center; align-items:center; gap:10px; padding:12px 18px; border-top:3px solid #C342FF; background:#0B0F19; color:white; font:13px Arial,sans-serif; }
      #sama-banner .separator { color:#4A5060; }
      #sama-banner button { padding:8px 14px; border:0; border-radius:5px; background:#27AE60; color:white; font:700 13px Arial,sans-serif; cursor:pointer; }
      .toolbar .sama-download-button, .toolbar .sama-edit-button { background:#27AE60!important; }
      body.public-preview #cvContainer [contenteditable="true"] { pointer-events:none; user-select:none; }
      body.public-preview #cvContainer .profile-photo { pointer-events:none; }
      body.public-preview .btn-add, body.public-preview .btn-delete { display:none!important; }
      body.public-preview .toolbar > :not(.sama-edit-button):not(.sama-download-button) { display:none!important; }
      body.edit-mode .sama-edit-button { display:none!important; }
      #sama-protection-warning { position:fixed; z-index:10001; top:18px; left:50%; padding:10px 16px; border:1px solid #ff7474; border-radius:5px; background:#8f2020; color:white; font:600 13px Arial,sans-serif; opacity:0; pointer-events:none; transform:translate(-50%,-8px); transition:opacity .2s,transform .2s; }
      #sama-protection-warning.warning-visible { opacity:1; transform:translate(-50%,0); }
      body.admin-mode #sama-banner { display:none!important; }
      @media(max-width:600px) { #sama-banner { gap:6px; padding:8px 10px; font-size:11px; } #sama-banner button { font-size:11px; padding:6px 10px; } }
      @media print {
        body:not(.paid-user):not(.admin-mode) #sama-watermark { display:block!important; opacity:1!important; }
        body:not(.paid-user):not(.admin-mode) .sama-watermark-item { opacity:.25; }
        #sama-banner, .sama-generated-toolbar { display:none!important; }
      }
    `;
    document.head.appendChild(style);
  }

  function ensureToolbar() {
    const existingToolbar = document.querySelector('.toolbar');
    if (existingToolbar) return existingToolbar;

    const container = document.querySelector('#cvContainer');
    if (!container) return null;
    const toolbar = document.createElement('div');
    toolbar.className = 'toolbar no-print sama-generated-toolbar';
    container.insertAdjacentElement('beforebegin', toolbar);
    return toolbar;
  }

  function paymentUrl(modelId) {
    return `/payment.html?model=${encodeURIComponent(modelId)}&intent=download`;
  }

  function markDownloadIntent(modelId) {
    sessionStorage.setItem(`sama-download-intent:${modelId}`, '1');
  }

  async function handleDownload(button) {
    const modelId = detectModelId();
    const container = document.querySelector('#cvContainer');
    if (!container) {
      showWarning('Le contenu du CV est introuvable.');
      return;
    }

    button.disabled = true;
    try {
      const session = await window.getVerifiedSession?.();
      if (!session) {
        markDownloadIntent(modelId);
        const next = paymentUrl(modelId);
        window.location.assign(`/login.html?next=${encodeURIComponent(next)}`);
        return;
      }

      let hasAccess = Boolean(session.isAdmin);
      if (!hasAccess) {
        try {
          hasAccess = await window.getEntitlement(modelId);
        } catch (error) {
          showWarning(error.message);
          return;
        }
      }
      if (!hasAccess) {
        markDownloadIntent(modelId);
        window.location.assign(paymentUrl(modelId));
        return;
      }
      sessionStorage.removeItem(`sama-download-intent:${modelId}`);
      await window.downloadPdf(modelId, container.innerHTML);
    } catch (error) {
      showWarning(error.message);
    } finally {
      button.disabled = false;
    }
  }

  function ensureWorkflowControls() {
    const toolbar = ensureToolbar();
    if (!toolbar) return;

    let downloadButton = toolbar.querySelector('button[onclick="exportPDF()"], .sama-export-pdf, .sama-download-button');
    if (!downloadButton) {
      downloadButton = document.createElement('button');
      toolbar.appendChild(downloadButton);
    }
    downloadButton.removeAttribute('onclick');
    downloadButton.type = 'button';
    downloadButton.classList.add('sama-download-button');
    downloadButton.textContent = 'Télécharger mon CV en PDF';
    downloadButton.addEventListener('click', () => handleDownload(downloadButton));

    if (!toolbar.querySelector('.sama-edit-button')) {
      const editButton = document.createElement('button');
      editButton.type = 'button';
      editButton.className = 'secondary sama-edit-button';
      editButton.textContent = 'Se connecter pour modifier';
      editButton.addEventListener('click', async () => {
        const modelId = detectModelId();
        const session = await window.getVerifiedSession?.();
        if (session) {
          window.location.assign(`/${modelId}.html?mode=edit`);
          return;
        }
        const next = `/${modelId}.html?mode=edit`;
        window.location.assign(`/login.html?next=${encodeURIComponent(next)}`);
      });
      toolbar.insertBefore(editButton, downloadButton);
    }
  }

  function addATSControls() {
    const container = document.querySelector('#cvContainer');
    const toolbar = ensureToolbar();
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
        body.ats-mode #cvContainer .profile-photo, body.ats-mode #cvContainer .cv-profile-photo { width:64px!important; height:64px!important; }
        body.ats-mode #cvContainer:before { display:none!important; }
      `;
      document.head.appendChild(style);
    }
  }

  function setEditingEnabled(enabled) {
    const container = document.querySelector('#cvContainer');
    if (!container) return;
    container.querySelectorAll('[data-editable]').forEach((element) => {
      element.setAttribute('contenteditable', String(enabled));
    });
    container.querySelectorAll('.profile-photo, .cv-profile-photo').forEach((photo) => {
      photo.classList.add('cv-profile-photo');
    });
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

  async function addWatermark() {
    const modelId = detectModelId();
    const session = await window.getVerifiedSession?.();
    let isPaid = Boolean(session?.isAdmin);
    if (session && !isPaid) {
      try {
        isPaid = await window.getEntitlement(modelId);
      } catch (error) {
        showWarning(error.message);
      }
    }

    const previewRequested = new URLSearchParams(window.location.search).get('mode') === 'preview';
    const isPreview = !session || previewRequested;
    document.body.classList.toggle('paid-user', isPaid);
    document.body.classList.toggle('public-preview', isPreview);
    document.body.classList.toggle('edit-mode', Boolean(session) && !isPreview);
    document.body.classList.toggle('admin-mode', Boolean(session?.isAdmin));
    setEditingEnabled(!isPreview);
    const editButton = document.querySelector('.sama-edit-button');
    if (editButton) editButton.textContent = session ? 'Modifier ce modèle' : 'Se connecter pour modifier';

    if (!isPaid && !session?.isAdmin) {
      const watermark = document.createElement('div');
      watermark.id = 'sama-watermark';
      watermark.setAttribute('aria-hidden', 'true');

      const watermarkContent = document.createElement('div');
      watermarkContent.className = 'watermark-content';
      for (let index = 0; index < 40; index += 1) {
        const item = document.createElement('span');
        item.className = 'sama-watermark-item';
        const title = document.createElement('strong');
        title.textContent = 'BIENVENUE À SAMA CV';
        const subtitle = document.createElement('small');
        subtitle.textContent = 'Créez, modifiez, puis téléchargez votre CV';
        item.append(title, subtitle);
        watermarkContent.appendChild(item);
      }

      const logo = document.createElement('img');
      logo.className = 'sama-watermark-logo';
      logo.src = '/assets/logo-sama-cv.svg';
      logo.alt = '';
      watermark.append(watermarkContent, logo);
      document.body.appendChild(watermark);
    }

    const banner = document.createElement('div');
    banner.id = 'sama-banner';
    if (isPreview) {
      banner.append('Document en aperçu · ');
      const action = document.createElement('button');
      action.type = 'button';
      action.textContent = session ? 'Modifier ce modèle' : 'Se connecter pour modifier';
      action.addEventListener('click', () => {
        const next = `/${modelId}.html?mode=edit`;
        window.location.assign(session ? next : `/login.html?next=${encodeURIComponent(next)}`);
      });
      banner.append(action);
    } else if (isPaid) {
      banner.textContent = 'Paiement validé · Téléchargez votre CV en PDF depuis la barre d’outils.';
    } else {
      banner.textContent = 'Édition libre · La photo reste protégée; le paiement n’est demandé qu’au téléchargement.';
    }
    document.body.appendChild(banner);
  }

  document.addEventListener('DOMContentLoaded', () => {
    addSharedStyles();
    ensureToolbar();
    ensureWorkflowControls();
    addATSControls();
    enableProtection();
    document.body.classList.add('public-preview');
    setEditingEnabled(false);
    addWatermark().catch((error) => {
      showWarning(error.message);
      document.body.classList.add('public-preview');
      document.body.classList.remove('edit-mode');
      setEditingEnabled(false);
    });
  });

  Object.assign(window, {
    enableProtection,
    showWarning,
    addWatermark,
    detectModelId,
    addATSControls,
    addSharedStyles
  });
})();
