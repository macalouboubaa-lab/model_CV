const cheerio = require('cheerio');

function prepareModelHtml(html) {
  const $ = cheerio.load(html);
  const sharedScripts = [];

  if (!$('script[src="/assets/auth.js"]').length) {
    sharedScripts.push('<script src="/assets/auth.js"></script>');
  }
  if (!$('script[src="/assets/protection.js"]').length) {
    sharedScripts.push('<script src="/assets/protection.js"></script>');
  }
  if (sharedScripts.length) $('head').prepend(sharedScripts.join(''));
  if (!$('#sama-model-photo-styles').length) {
    $('head').append(
      '<style id="sama-model-photo-styles">#cvContainer .profile-photo,#cvContainer .cv-profile-photo{box-sizing:border-box!important;width:96px!important;height:96px!important;max-width:100%;object-fit:cover!important}</style>'
    );
  }

  return $.html();
}

module.exports = { prepareModelHtml };
