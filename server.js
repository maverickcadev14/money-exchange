const http = require('node:http');
const fs = require('node:fs');
const path = require('node:path');

const PORT = Number(process.env.PORT) || 4173;
const HOST = process.env.HOST || '0.0.0.0';
const ROOT = __dirname;
const SUPER_RICH_URL = 'https://www.superrichthailand.com/';
const MEGA_BANK_URL = 'https://www.megabank.com.tw/api/client/ExchangeRate/GetRateData?sc_lang=zh-TW&sc_site=bank-zh-tw&dic_lang=zh-TW';

const contentTypes = {
  '.html': 'text/html; charset=utf-8',
  '.css': 'text/css; charset=utf-8',
  '.js': 'text/javascript; charset=utf-8',
  '.png': 'image/png',
  '.svg': 'image/svg+xml',
  '.json': 'application/json; charset=utf-8',
  '.webmanifest': 'application/manifest+json; charset=utf-8'
};

function sendJson(response, statusCode, body) {
  response.writeHead(statusCode, {
    'Content-Type': 'application/json; charset=utf-8',
    'Cache-Control': 'no-store'
  });
  response.end(JSON.stringify(body));
}

async function serveRates(response) {
  try {
    const [superRichResponse, megaBankResponse] = await Promise.all([
      fetch(SUPER_RICH_URL, {
        headers: { Accept: 'text/html' },
        signal: AbortSignal.timeout(12000)
      }),
      fetch(MEGA_BANK_URL, {
        headers: { Accept: 'application/json' },
        signal: AbortSignal.timeout(12000)
      })
    ]);

    if (!superRichResponse.ok) throw new Error(`SuperRich returned ${superRichResponse.status}`);
    if (!megaBankResponse.ok) throw new Error(`Mega Bank returned ${megaBankResponse.status}`);

    const [superRichHtml, megaBankPayload] = await Promise.all([
      superRichResponse.text(),
      megaBankResponse.json()
    ]);
    const usd100Match = superRichHtml.match(/\\"exchangeList\\":\{\\"USD\\":\[\{[\s\S]{0,500}?\\"denomRem\\":\\"100\\",\\"buyText\\":\\"([0-9.]+)\\"/);
    const twdMatch = superRichHtml.match(/\\"TWD\\":\[\{[\s\S]{0,500}?\\"buyText\\":\\"([0-9.]+)\\"/);
    const updatedMatch = superRichHtml.match(/\\"initialTime\\":\{\\"date\\":\\"([^\"]+)\\",\\"time\\":\[\\"([^\"]+)\\"/);
    const usdBuying = Number(usd100Match?.[1]);
    const twdBuying = Number(twdMatch?.[1]);
    const megaUsd = megaBankPayload?.rates?.find((rate) => String(rate.currKey).startsWith('USD|'));
    const megaUsdSpotSell = Number(megaUsd?.spot?.ask);

    if (!Number.isFinite(usdBuying) || !Number.isFinite(twdBuying) || !Number.isFinite(megaUsdSpotSell)) {
      throw new Error('One or more required exchange rates are missing');
    }

    sendJson(response, 200, {
      usdBuying,
      twdBuying,
      megaUsdSpotSell,
      superRichUpdatedAt: updatedMatch ? `${updatedMatch[1]} ${updatedMatch[2]}` : 'Current official page',
      megaBankUpdatedAt: megaBankPayload.updateTime,
      isFullyLive: true,
      branch: 'Headquarter Rajdamri 1'
    });
  } catch (error) {
    sendJson(response, 502, { error: 'Live rates are temporarily unavailable.', detail: error.message });
  }
}

function serveFile(request, response) {
  const pathname = new URL(request.url, `http://${request.headers.host}`).pathname;
  const requested = pathname === '/' ? '/index.html' : pathname;
  const filePath = path.resolve(ROOT, `.${requested}`);

  if (!filePath.startsWith(ROOT) || !fs.existsSync(filePath) || fs.statSync(filePath).isDirectory()) {
    response.writeHead(404, { 'Content-Type': 'text/plain; charset=utf-8' });
    response.end('Not found');
    return;
  }

  response.writeHead(200, {
    'Content-Type': contentTypes[path.extname(filePath)] || 'application/octet-stream',
    'Cache-Control': 'no-cache'
  });
  fs.createReadStream(filePath).pipe(response);
}

const server = http.createServer((request, response) => {
  if (request.method === 'GET' && request.url === '/api/rates') {
    serveRates(response);
    return;
  }
  if (request.method !== 'GET') {
    response.writeHead(405, { Allow: 'GET' });
    response.end();
    return;
  }
  serveFile(request, response);
});

server.listen(PORT, HOST, () => {
  console.log(`Money Exchange is running at http://${HOST}:${PORT}`);
});
