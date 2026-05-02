import * as http from 'http';
import * as fs from 'fs';
import * as path from 'path';
import { URL, fileURLToPath } from 'url';

const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);

const PORT = process.env.PORT ? Number(process.env.PORT) : 3000;
const HOST = process.env.HOST || '0.0.0.0';
const PUBLIC_DIR = path.join(__dirname, 'site');

function contentType(filePath) {
	const ext = path.extname(filePath).toLowerCase();
	switch (ext) {
		case '.html': return 'text/html; charset=utf-8';
		case '.js': return 'application/javascript; charset=utf-8';
		case '.css': return 'text/css; charset=utf-8';
		case '.png': return 'image/png';
		case '.jpg':
		case '.jpeg': return 'image/jpeg';
		case '.svg': return 'image/svg+xml';
		case '.json': return 'application/json; charset=utf-8';
		case '.wasm': return 'application/wasm';
		default: return 'application/octet-stream';
	}
}

const server = http.createServer((req, res) => {
	try {
		const reqUrl = req.url || '/';
		const baseUrl = `http://${HOST}:${PORT}`;
		const parsed = new URL(reqUrl, baseUrl);
		let pathname = decodeURIComponent(parsed.pathname);

		if (pathname === '/' || pathname === '') pathname = '/index.html';

		// Resolve and prevent path traversal
		const safePath = path.normalize(path.join(PUBLIC_DIR, pathname));
		if (!safePath.startsWith(PUBLIC_DIR)) {
			res.statusCode = 403;
			res.end('Forbidden');
			return;
		}

		fs.stat(safePath, (err, stats) => {
			if (err) {
				res.statusCode = 404;
				res.end('Not Found');
				return;
			}

			if (stats.isDirectory()) {
				// serve index.html in directories
				const indexFile = path.join(safePath, 'index.html');
				fs.stat(indexFile, (ie, ist) => {
					if (ie || !ist.isFile()) {
						res.statusCode = 404;
						res.end('Not Found');
						return;
					}
					streamFile(indexFile, res);
				});
			} else {
				streamFile(safePath, res);
			}
		});
	} catch (e) {
		res.statusCode = 500;
		res.end('Server Error');
	}
});

function streamFile(filePath, res) {
	const ct = contentType(filePath);
	res.setHeader('Content-Type', ct);
	const stream = fs.createReadStream(filePath);
	stream.on('error', () => {
		res.statusCode = 500;
		res.end('Server Error');
	});
	stream.pipe(res);
}

server.listen(PORT, HOST, () => {
	// Minimal console log
	console.log(`Listening on http://${HOST}:${PORT}`);
});

export {};
