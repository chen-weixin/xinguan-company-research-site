const RELEASE_ASSET = "https://github.com/chen-weixin/xinguandian-enterprise-research-releases/releases/download/v0.2.68/xinguandian-enterprise-research_0.2.68_x64-setup.exe";
const DOWNLOAD_NAME = "xinguandian-enterprise-research_0.2.68_x64-setup.exe";

async function proxyDownload(request) {
  const upstreamHeaders = new Headers();
  const range = request.headers.get("Range");
  if (range) upstreamHeaders.set("Range", range);

  const upstream = await fetch(RELEASE_ASSET, {
    method: request.method === "HEAD" ? "HEAD" : "GET",
    headers: upstreamHeaders,
    redirect: "follow",
  });
  if (!upstream.ok && upstream.status !== 206) {
    return new Response("安装包暂不可用，请稍后重试。", {
      status: upstream.status,
      headers: { "content-type": "text/plain; charset=utf-8" },
    });
  }

  const responseHeaders = new Headers(upstream.headers);
  responseHeaders.set("content-type", "application/octet-stream");
  responseHeaders.set("content-disposition", `attachment; filename*=UTF-8''${encodeURIComponent(DOWNLOAD_NAME)}`);
  responseHeaders.set("cache-control", "public, max-age=3600");
  responseHeaders.set("accept-ranges", "bytes");
  responseHeaders.delete("location");
  return new Response(upstream.body, { status: upstream.status, headers: responseHeaders });
}

export default {
  async fetch(request, env) {
    const url = new URL(request.url);
    if ((url.pathname === "/download" || url.pathname === "/download/") && ["GET", "HEAD"].includes(request.method)) {
      try {
        return await proxyDownload(request);
      } catch {
        return new Response("安装包暂不可用，请稍后重试。", {
          status: 502,
          headers: { "content-type": "text/plain; charset=utf-8" },
        });
      }
    }
    return env.ASSETS.fetch(request);
  },
};
