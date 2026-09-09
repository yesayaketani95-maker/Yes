// À placer dans ton dépôt sous  api/fd.js
//
// Vercel expose ce fichier sur  /api/fd
// Il garde ta clé côté serveur et met les réponses en cache, ce qui évite
// de taper dans la limite de 10 requêtes/minute du plan gratuit.
//
// Avant de déployer : Vercel → Settings → Environment Variables → FD_TOKEN = ta clé

module.exports = async (req, res) => {
  const path = String((req.query && req.query.path) || '');

  // on n'autorise que les chemins v4 de l'API, pour ne pas transformer
  // le proxy en relais ouvert vers n'importe quelle URL
  if (!/^\/v4\/[A-Za-z0-9/_,-]+(\?[A-Za-z0-9=&,_-]*)?$/.test(path)) {
    res.status(400).json({ message: 'Chemin refusé : ' + path });
    return;
  }

  const token = process.env.FD_TOKEN;
  if (!token) {
    res.status(500).json({
      message: "La variable d'environnement FD_TOKEN n'est pas définie sur Vercel."
    });
    return;
  }

  try {
    const r = await fetch('https://api.football-data.org' + path, {
      headers: { 'X-Auth-Token': token }
    });
    const body = await r.text();
    res.setHeader('Content-Type', 'application/json; charset=utf-8');
    res.setHeader('Cache-Control', 's-maxage=600, stale-while-revalidate=3600');
    res.status(r.status).send(body);
  } catch (e) {
    res.status(502).json({ message: 'API injoignable : ' + e.message });
  }
};
