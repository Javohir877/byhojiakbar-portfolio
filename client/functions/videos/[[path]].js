// Cloudflare Pages Function: /videos/* uchun byte-range (206 Partial Content) qo'llab-quvvatlash.
// Pages statik fayllarni Range so'roviga qaramay to'liq beradi; iPhone Safari esa videoni
// faqat 206 javobi bilan o'ynatadi va oldinga o'tkazish (seek) ham shunga bog'liq.
export async function onRequest({ request, env }) {
  if (request.method !== "GET" && request.method !== "HEAD") return env.ASSETS.fetch(request);

  // Asl faylni Range'siz olamiz
  const plain = new Request(request.url, { method: "GET" });
  const res = await env.ASSETS.fetch(plain);
  if (res.status !== 200) return res;

  const headers = new Headers(res.headers);
  headers.set("Accept-Ranges", "bytes");
  headers.set("Cache-Control", "public, max-age=86400");

  const range = request.headers.get("Range");
  const m = range && /^bytes=(\d*)-(\d*)$/.exec(range.trim());
  if (!m) {
    if (request.method === "HEAD") { res.body?.cancel(); return new Response(null, { status: 200, headers }); }
    return new Response(res.body, { status: 200, headers });
  }

  // Ichki javobda Content-Length bo'lmasligi mumkin — unda faylni o'qib hajmini bilamiz
  let size = Number(res.headers.get("Content-Length")) || 0;
  let buf = null;
  if (!size) {
    buf = new Uint8Array(await res.arrayBuffer());
    size = buf.byteLength;
  }

  let start, end;
  if (m[1] === "") { // bytes=-N — oxirgi N bayt
    start = Math.max(0, size - Number(m[2]));
    end = size - 1;
  } else {
    start = Number(m[1]);
    end = m[2] === "" ? size - 1 : Math.min(Number(m[2]), size - 1);
  }
  if (start >= size || start > end) {
    if (!buf) res.body?.cancel();
    return new Response(null, { status: 416, headers: { "Content-Range": `bytes */${size}`, "Accept-Ranges": "bytes" } });
  }

  const length = end - start + 1;
  headers.set("Content-Range", `bytes ${start}-${end}/${size}`);
  headers.set("Content-Length", String(length));
  if (request.method === "HEAD") {
    if (!buf) res.body?.cancel();
    return new Response(null, { status: 206, headers });
  }
  // Fayl allaqachon xotirada bo'lsa — nusxa olmasdan kerakli qismini beramiz
  if (buf) return new Response(buf.subarray(start, end + 1), { status: 206, headers });

  // Oqimdan faqat kerakli qismni o'tkazamiz (butun faylni xotiraga yuklamasdan)
  let pos = 0;
  const slice = new TransformStream({
    transform(chunk, ctrl) {
      const from = Math.max(start - pos, 0);
      const to = Math.min(end + 1 - pos, chunk.byteLength);
      if (from < to) ctrl.enqueue(chunk.subarray(from, to));
      pos += chunk.byteLength;
      if (pos > end) ctrl.terminate();
    },
  });
  return new Response(res.body.pipeThrough(slice), { status: 206, headers });
}
