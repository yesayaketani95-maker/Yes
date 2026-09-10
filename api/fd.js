module.exports = async (req, res) => {
  const q = req.query || {};

  // fichiers CSV publics (football-data.co.uk)
  if (q.csv) {
    const url = String(q.csv);
    if (!/^https:\/\/www\.football-data\.co\.uk\/[A-Za-z0-9/_.-]+\.csv$/.test(url)) {
      res.status(400).json({ message: 'URL CSV refusee : ' + url });
      return;
    }
    try {
      const r = await fetch(url);
      const body = await r.text();
      res.setHeader('Content-Type', 'text/plain; charset=utf-8');
      res.setHeader('Cache-Control', 's-maxage=86400, stale-while-revalidate=604800');
      res.status(r.status).send(body);
    } catch (e) {
      res.status(502).json({ message: 'CSV injoignable : ' + e.message });
    }
    return;
  }

  // notes Club Elo
  if (q.elo) {
    const url = String(q.elo);
    if (!/^https?:\/\/api\.clubelo\.com\/[A-Za-z0-9_-]+$/.test(url)) {
      res.status(400).json({ message: 'URL Elo refusee : ' + url });
      return;
    }
    try {
      const r = await fetch(url);
      const body = await r.text();
      res.setHeader('Content-Type', 'text/plain; charset=utf-8');
      res.setHeader('Cache-Control', 's-maxage=43200, stale-while-revalidate=86400');
      res.status(r.status).send(body);
    } catch (e) {
      res.status(502).json({ message: 'Club Elo injoignable : ' + e.message });
    }
    return;
  }

  // API football-data.org
  const path = String(q.path || '');
  if (!/^\/v4\/[A-Za-z0-9/_,-]+(\?[A-Za-z0-9=&,_-]*)?$/.test(path)) {
    res.status(400).json({ message: 'Chemin refuse : ' + path });
    return;
  }

  const token = process.env.FD_TOKEN;
  if (!token) {
    res.status(500).json({ message: "FD_TOKEN n'est pas defini sur Vercel." });
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
