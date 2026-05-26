#!/usr/bin/env node

import http from "node:http";
import { spawn } from "node:child_process";
import { once } from "node:events";

const REMOTE_HOST = process.env.MATHESAR_REMOTE_HOST ?? "82.180.136.209";
const REMOTE_PORT = Number(process.env.MATHESAR_REMOTE_PORT ?? 18081);
const PROXY_HOST = process.env.MATHESAR_LOCAL_HOST ?? "127.0.0.1";
const PROXY_PORT = Number(process.env.MATHESAR_LOCAL_PORT ?? 8001);
const VITE_HOST = process.env.MATHESAR_VITE_HOST ?? "127.0.0.1";
const VITE_PORT = Number(process.env.MATHESAR_VITE_PORT ?? 3000);
const VITE_ORIGIN = `http://${VITE_HOST}:${VITE_PORT}`;
const UI_DIR = new URL("../mathesar_ui/", import.meta.url);
const TRACE_RPC = process.env.MATHESAR_TRACE_RPC !== "0";

let proxy;

function startVite() {
  const child = spawn(
    "npm",
    ["run", "dev", "--", "--host", VITE_HOST, "--port", String(VITE_PORT)],
    {
      cwd: UI_DIR,
      stdio: ["ignore", "pipe", "pipe"],
      env: {
        ...process.env,
        FORCE_COLOR: "1",
      },
    },
  );

  child.stdout.on("data", (chunk) => process.stdout.write(`[vite] ${chunk}`));
  child.stderr.on("data", (chunk) => process.stderr.write(`[vite] ${chunk}`));
  child.on("exit", (code) => {
    if (code !== 0) {
      console.error(`[vite] exited with code ${code}`);
      process.exitCode = code ?? 1;
      proxy?.close();
    }
  });

  return child;
}

function shouldRewriteHtml(contentType, body) {
  return (
    contentType.includes("text/html") &&
    body.includes('id="common-data"') &&
    body.includes("/static/assets/")
  );
}

function rewriteAppHtml(body) {
  const devScripts = [
    `<script type="module" src="${VITE_ORIGIN}/src/i18n/languages/en/index.ts"></script>`,
    `<script type="module" src="${VITE_ORIGIN}/@vite/client"></script>`,
    `<script type="module" src="${VITE_ORIGIN}/src/main.ts"></script>`,
  ].join("\n    ");

  return body
    .replace(/\s*<link[^>]+href="\/static\/assets\/[^"]+\.css"[^>]*>\s*/g, "\n")
    .replace(
      /\s*<script\s+type="module"\s+src="\/static\/assets\/[^"]+\.js"><\/script>\s*/g,
      "\n",
    )
    .replace(/\s*<script\s+nomodule[\s\S]*?<\/script>\s*/g, "\n")
    .replace("</body>", `    ${devScripts}\n  </body>`);
}

function getRpcRequestInfo(rawBody) {
  try {
    const parsed = JSON.parse(rawBody.toString("utf8"));
    const firstCall = Array.isArray(parsed) ? parsed[0] : parsed;
    const columnAttnums = Array.isArray(firstCall?.params?.column_attnums)
      ? firstCall.params.column_attnums
      : undefined;
    return {
      batched: Array.isArray(parsed),
      batchSize: Array.isArray(parsed) ? parsed.length : undefined,
      method: firstCall?.method,
      limit: firstCall?.params?.limit,
      offset: firstCall?.params?.offset,
      tableOid: firstCall?.params?.table_oid,
      columnAttnums,
      projectedColumnCount: columnAttnums?.length,
    };
  } catch {
    return {};
  }
}

function getRpcResponseInfo(rawBody) {
  try {
    const parsed = JSON.parse(rawBody.toString("utf8"));
    const firstResponse = Array.isArray(parsed) ? parsed[0] : parsed;
    const result = firstResponse?.result;
    const firstRow = result?.results?.[0];
    return {
      resultRows: Array.isArray(result?.results) ? result.results.length : undefined,
      resultColumnsPerRow: firstRow ? Object.keys(firstRow).length : undefined,
      totalCount: result?.count,
      linkedSummaryCells: result?.linked_record_summaries
        ? Object.keys(result.linked_record_summaries).length
        : undefined,
      joinedSummaryCells: result?.joined_record_summaries
        ? Object.keys(result.joined_record_summaries).length
        : undefined,
      error: firstResponse?.error?.message,
    };
  } catch {
    return {};
  }
}

function logRpcRequest({ clientReq, reqInfo, resInfo, statusCode, bytes, elapsedMs }) {
  if (!TRACE_RPC || !clientReq.url?.startsWith("/api/rpc/v0/")) {
    return;
  }
  const summary = {
    method: reqInfo.method,
    table_oid: reqInfo.tableOid,
    limit: reqInfo.limit,
    offset: reqInfo.offset,
    projected_columns: reqInfo.projectedColumnCount,
    batched: reqInfo.batched,
    batch_size: reqInfo.batchSize,
    status: statusCode,
    ms: elapsedMs,
    bytes,
    ...resInfo,
  };
  console.log(`[rpc] ${JSON.stringify(summary)}`);
}

function shouldFilterRecordRows(reqInfo, responseHeaders) {
  const contentType = String(responseHeaders["content-type"] ?? "");
  return (
    (reqInfo.method === "records.list" || reqInfo.method === "records.search") &&
    Array.isArray(reqInfo.columnAttnums) &&
    reqInfo.columnAttnums.length > 0 &&
    contentType.includes("application/json")
  );
}

function filterRecordRows(rawBody, reqInfo) {
  const parsed = JSON.parse(rawBody.toString("utf8"));
  const responses = Array.isArray(parsed) ? parsed : [parsed];
  const allowedColumns = new Set(reqInfo.columnAttnums.map(String));

  for (const response of responses) {
    const rows = response?.result?.results;
    if (!Array.isArray(rows)) continue;
    response.result.results = rows.map((row) =>
      Object.fromEntries(
        Object.entries(row).filter(([columnId]) => allowedColumns.has(columnId)),
      ),
    );
  }

  return Buffer.from(JSON.stringify(Array.isArray(parsed) ? responses : responses[0]));
}

function proxyBufferedRequest(clientReq, clientRes, requestBody) {
  const headers = {
    ...clientReq.headers,
    "accept-encoding": "identity",
    host: `${REMOTE_HOST}:${REMOTE_PORT}`,
    origin: `http://${REMOTE_HOST}:${REMOTE_PORT}`,
  };

  if (clientReq.headers.referer !== undefined) {
    headers.referer = clientReq.headers.referer.replace(
      `http://${PROXY_HOST}:${PROXY_PORT}`,
      `http://${REMOTE_HOST}:${REMOTE_PORT}`,
    );
  }

  const upstreamReq = http.request(
    {
      hostname: REMOTE_HOST,
      port: REMOTE_PORT,
      method: clientReq.method,
      path: clientReq.url,
      headers,
    },
    (upstreamRes) => {
      const chunks = [];
      upstreamRes.on("data", (chunk) => chunks.push(chunk));
      upstreamRes.on("end", () => {
        const rawBody = Buffer.concat(chunks);
        const responseHeaders = { ...upstreamRes.headers };
        const contentType = String(responseHeaders["content-type"] ?? "");

        if (shouldRewriteHtml(contentType, rawBody.toString("utf8"))) {
          const rewritten = Buffer.from(
            rewriteAppHtml(rawBody.toString("utf8")),
          );
          responseHeaders["content-length"] = String(rewritten.length);
          delete responseHeaders["content-encoding"];
          clientRes.writeHead(upstreamRes.statusCode ?? 200, responseHeaders);
          clientRes.end(rewritten);
          return;
        }

        let responseBody = rawBody;
        if (shouldFilterRecordRows(reqInfo, responseHeaders)) {
          try {
            responseBody = filterRecordRows(rawBody, reqInfo);
          } catch (error) {
            console.warn(`[proxy] record response filter failed: ${error.message}`);
          }
        }

        if (responseBody !== rawBody) {
          responseHeaders["content-length"] = String(responseBody.length);
          delete responseHeaders["content-encoding"];
        }

        const elapsedMs = Date.now() - startedAt;
        logRpcRequest({
          clientReq,
          reqInfo,
          resInfo: getRpcResponseInfo(responseBody),
          statusCode: upstreamRes.statusCode ?? 200,
          bytes: responseBody.length,
          elapsedMs,
        });

        clientRes.writeHead(upstreamRes.statusCode ?? 200, responseHeaders);
        clientRes.end(responseBody);
      });
    },
  );

  upstreamReq.on("error", (error) => {
    clientRes.writeHead(502, { "content-type": "text/plain; charset=utf-8" });
    clientRes.end(`Proxy error: ${error.message}`);
  });

  const startedAt = Date.now();
  const reqInfo = getRpcRequestInfo(requestBody);
  upstreamReq.end(requestBody);
}

function proxyRequest(clientReq, clientRes) {
  const requestChunks = [];
  clientReq.on("data", (chunk) => requestChunks.push(chunk));
  clientReq.on("end", () => {
    proxyBufferedRequest(clientReq, clientRes, Buffer.concat(requestChunks));
  });
  clientReq.on("error", (error) => {
    clientRes.writeHead(400, { "content-type": "text/plain; charset=utf-8" });
    clientRes.end(`Request error: ${error.message}`);
  });
}

const vite = startVite();
proxy = http.createServer(proxyRequest);
proxy.listen(PROXY_PORT, PROXY_HOST);

await once(proxy, "listening");
console.log(
  [
    `[proxy] http://${PROXY_HOST}:${PROXY_PORT}`,
    `[proxy] remote http://${REMOTE_HOST}:${REMOTE_PORT}`,
    `[proxy] local UI ${VITE_ORIGIN}`,
  ].join("\n"),
);

process.on("SIGINT", () => {
  vite.kill("SIGINT");
  proxy.close(() => process.exit(0));
});
