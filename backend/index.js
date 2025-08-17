const http = require('http');

const PORT = process.env.BACKEND_PORT || 4000;

const server = http.createServer((req, res) => {
  res.writeHead(200, { 'content-type': 'application/json' });
  res.end(
    JSON.stringify({ status: 'ok', service: 'backend', time: new Date().toISOString() })
  );
});

server.listen(PORT, () => {
  console.log(`Backend placeholder running on http://localhost:${PORT}`);
});
