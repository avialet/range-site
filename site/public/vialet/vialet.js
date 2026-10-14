/* vialet.js : derniere version publiee sur GitHub (bouton, fiche), sans dependance, ES5.
   Lit data-app et data-repo sur <body>. Identique dans tous les sites (copie par sync-site.sh). */
(function () {
  var root = document.documentElement;
  root.className += ' pret';

  var body = document.body;
  var app = body.getAttribute('data-app');
  var repo = body.getAttribute('data-repo');
  if (!app || !repo || !/^[A-Za-z0-9._-]+\/[A-Za-z0-9._-]+$/.test(repo)) return;

  var RELEASES = 'https://github.com/' + repo + '/releases/latest';
  var API = 'https://api.github.com/repos/' + repo + '/releases/latest';
  var ASSET = new RegExp('^' + app + '-\\d+\\.\\d+\\.\\d+\\.dmg$');
  var STORE = 'vialet-release-' + app;
  var UNE_HEURE = 3600000;

  function tous(sel) { return Array.prototype.slice.call(document.querySelectorAll(sel)); }
  function texte(sel, valeur) { tous(sel).forEach(function (el) { el.textContent = valeur; }); }
  function github(url) { return typeof url === 'string' && url.indexOf('https://github.com/') === 0; }

  function appliquer(r) {
    tous('[data-download]').forEach(function (a) { a.setAttribute('href', r.url); });
    if (r.version) texte('[data-fiche-version]', r.version);
    if (r.taille) texte('[data-fiche-taille]', r.taille);
    if (r.sha) tous('[data-fiche-sha]').forEach(function (a) { a.setAttribute('href', r.sha); });
  }
  function repli() {
    tous('[data-download]').forEach(function (a) { a.setAttribute('href', RELEASES); });
  }
  function enMo(octets) {
    var mo = octets / 1048576;
    var s = mo < 10 ? mo.toFixed(1) : String(Math.round(mo));
    return s.replace('.', ',') + ' Mo';
  }
  function lire(json) {
    var dmg = null, sha = null;
    (json.assets || []).forEach(function (a) {
      if (ASSET.test(a.name)) dmg = a;
      else if (/\.sha256$/.test(a.name)) sha = a;
    });
    if (!dmg || !github(dmg.browser_download_url)) return null;
    return {
      url: dmg.browser_download_url,
      version: String(json.tag_name || '').replace(/^v/, ''),
      taille: typeof dmg.size === 'number' ? enMo(dmg.size) : '',
      sha: sha && github(sha.browser_download_url) ? sha.browser_download_url : ''
    };
  }

  try {
    var cache = JSON.parse(sessionStorage.getItem(STORE) || 'null');
    if (cache && cache.r && Date.now() - cache.t < UNE_HEURE) { appliquer(cache.r); return; }
  } catch (e) {}

  var xhr = new XMLHttpRequest();
  xhr.open('GET', API);
  xhr.setRequestHeader('Accept', 'application/vnd.github+json');
  xhr.onload = function () {
    try {
      if (xhr.status !== 200) return repli();
      var r = lire(JSON.parse(xhr.responseText));
      if (!r) return repli();
      appliquer(r);
      try { sessionStorage.setItem(STORE, JSON.stringify({ t: Date.now(), r: r })); } catch (e) {}
    } catch (e) { repli(); }
  };
  xhr.onerror = repli;
  xhr.send();
})();
