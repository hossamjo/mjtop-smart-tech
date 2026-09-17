const baseUrl = (process.env.BASE_URL || "https://mjtoptech-yyqcfset.manus.space").replace(/\/$/, "");
const failures = [];
const findings = [];

function check(condition, message) {
  if (!condition) failures.push(message);
}

async function request(path, init = {}) {
  const response = await fetch(`${baseUrl}${path}`, {
    redirect: "manual",
    signal: AbortSignal.timeout(10000),
    ...init,
    headers: { "User-Agent": "MjTop-DAST-Safe/1.0", ...(init.headers || {}) },
  });
  const body = await response.text();
  return { response, body };
}

const routes = ["/", "/services/ai-automation", "/services/cybersecurity", "/services/cloud-infrastructure", "/services/data-integration", "/admin"];
for (const route of routes) {
  const { response, body } = await request(route);
  check(response.status >= 200 && response.status < 500, `${route} returned ${response.status}`);
  check(!body.includes("<script>alert(") && !body.includes("<script>alert%28"), `${route} reflects obvious XSS marker`);
}

const unauthenticatedAdmin = await request("/api/trpc/admin.messages");
check([401, 403].includes(unauthenticatedAdmin.response.status), `admin API returned ${unauthenticatedAdmin.response.status} without auth`);

const security = await request("/");
const headers = security.response.headers;
check(headers.get("content-security-policy")?.includes("frame-ancestors 'none'"), "CSP clickjacking directive missing");
check(headers.get("x-content-type-options") === "nosniff", "nosniff header missing");
check(headers.get("referrer-policy") === "strict-origin-when-cross-origin", "Referrer-Policy missing");
if (baseUrl.startsWith("https://")) check(headers.get("strict-transport-security")?.includes("max-age=31536000"), "HSTS missing on HTTPS");

const cors = headers.get("access-control-allow-origin");
if (cors === "*") findings.push("CORS wildcard is exposed on the public document response; verify that authenticated APIs do not allow wildcard origins.");

const traversal = await request("/..%2F..%2Fetc%2Fpasswd");
check(!traversal.body.includes("root:x:") && !traversal.body.includes("root:*:"), "possible path traversal disclosure");

console.log(JSON.stringify({ baseUrl, findings, failures }, null, 2));
if (failures.length) process.exit(1);
