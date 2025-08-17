const http = require('http');

const PORT = process.env.FRONTEND_PORT || 5173;

const html = `<!doctype html>
<html lang="en">
<head>
  <meta charset="UTF-8" />
  <meta name="viewport" content="width=device-width, initial-scale=1.0" />
  <title>POS Frontend Placeholder</title>
  <style>
    html, body { height: 100%; margin: 0; font-family: system-ui, -apple-system, Segoe UI, Roboto, Helvetica, Arial, sans-serif; }
    .wrap { min-height: 100%; display: grid; place-items: center; background: #0f172a; color: #e2e8f0; }
    .card { padding: 2rem 2.5rem; border-radius: 12px; background: #111827; box-shadow: 0 10px 30px rgba(0,0,0,0.35); }
    h1 { margin: 0 0 0.5rem; font-size: 1.5rem; }
    p { margin: 0.25rem 0; color: #94a3b8; }
    code { background: #0b1220; color: #93c5fd; padding: 0.2rem 0.4rem; border-radius: 6px; }
    a { color: #60a5fa; text-decoration: none; }
    a:hover { text-decoration: underline; }
  </style>
</head>
<body>
  <div class="wrap">
    <div class="card">
      <h1>POS Frontend Placeholder</h1>
      <p>Replace this with your SPA/SSR framework of choice.</p>
      <p>Backend health: <code>GET http://localhost:4000</code></p>
      <p>Environment: <code>${process.env.NODE_ENV || 'development'}</code></p>
    </div>
  </div>
</body>
</html>`;

const server = http.createServer((req, res) => {
  res.writeHead(200, { 'content-type': 'text/html' });
  res.end(html);
});

server.listen(PORT, () => {
  console.log(`Frontend placeholder running on http://localhost:${PORT}`);
});
