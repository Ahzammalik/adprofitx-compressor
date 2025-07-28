const http = require('http');
const fs = require('fs');
const path = require('path');
const url = require('url');

// Import the API (we'll need to transpile TypeScript for this to work in production)
// For now, we'll create a simple endpoint structure

const server = http.createServer((req, res) => {
  const parsedUrl = url.parse(req.url, true);
  const pathname = parsedUrl.pathname;

  // Enable CORS
  res.setHeader('Access-Control-Allow-Origin', '*');
  res.setHeader('Access-Control-Allow-Methods', 'GET, POST, PUT, DELETE, OPTIONS');
  res.setHeader('Access-Control-Allow-Headers', 'Content-Type, Authorization');

  // Handle preflight requests
  if (req.method === 'OPTIONS') {
    res.writeHead(200);
    res.end();
    return;
  }

  // API endpoints
  if (pathname.startsWith('/api/')) {
    handleAPIRequest(req, res, pathname);
    return;
  }

  // Serve static files
  let filePath = pathname === '/' ? '/index.html' : pathname;
  filePath = path.join(__dirname, '..', filePath);

  const extname = path.extname(filePath);
  let contentType = 'text/html';

  switch (extname) {
    case '.js':
      contentType = 'text/javascript';
      break;
    case '.css':
      contentType = 'text/css';
      break;
    case '.json':
      contentType = 'application/json';
      break;
    case '.png':
      contentType = 'image/png';
      break;
    case '.jpg':
      contentType = 'image/jpg';
      break;
    case '.ico':
      contentType = 'image/x-icon';
      break;
  }

  fs.readFile(filePath, (err, content) => {
    if (err) {
      if (err.code == 'ENOENT') {
        res.writeHead(404);
        res.end('Page not found');
      } else {
        res.writeHead(500);
        res.end('Server error: ' + err.code);
      }
    } else {
      res.writeHead(200, { 'Content-Type': contentType });
      res.end(content, 'utf8');
    }
  });
});

function handleAPIRequest(req, res, pathname) {
  res.setHeader('Content-Type', 'application/json');

  if (pathname === '/api/record-compression' && req.method === 'POST') {
    let body = '';
    req.on('data', chunk => {
      body += chunk.toString();
    });

    req.on('end', () => {
      try {
        const data = JSON.parse(body);
        
        // For now, just log the data (in production, save to database)
        console.log('Compression recorded:', {
          fileName: data.fileName,
          fileType: data.fileType,
          originalSize: data.originalSize,
          compressedSize: data.compressedSize,
          compressionRatio: data.compressionRatio,
          quality: data.quality,
          outputFormat: data.outputFormat,
          processingTime: data.processingTime,
          timestamp: new Date().toISOString()
        });

        res.writeHead(200);
        res.end(JSON.stringify({ success: true, message: 'Compression recorded' }));
      } catch (error) {
        console.error('Error recording compression:', error);
        res.writeHead(400);
        res.end(JSON.stringify({ success: false, message: 'Invalid JSON' }));
      }
    });
  } else if (pathname === '/api/stats' && req.method === 'GET') {
    // Return mock stats for now (in production, get from database)
    const stats = {
      success: true,
      data: {
        totalCompressions: 150847,
        totalBytesSaved: 2847392847,
        averageRatio: 73,
        popularFormats: [
          { format: 'jpeg', count: 45231 },
          { format: 'png', count: 32847 },
          { format: 'webp', count: 18743 },
          { format: 'original', count: 54026 }
        ]
      }
    };

    res.writeHead(200);
    res.end(JSON.stringify(stats));
  } else {
    res.writeHead(404);
    res.end(JSON.stringify({ success: false, message: 'Endpoint not found' }));
  }
}

const PORT = process.env.PORT || 5000;
server.listen(PORT, () => {
  console.log(`Server running on port ${PORT}`);
});

module.exports = server;
