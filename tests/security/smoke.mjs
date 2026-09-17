const baseUrl = (process.env.BASE_URL || "http://localhost:3000").replace(/\/$/, "");
const failures = [];

function assert(condition, message) {
  if (!condition) failures.push(message);
}

const response = await fetch(`${baseUrl}/`);
const headers = response.headers;
assert(response.status === 200, `GET / returned ${response.status}`);
assert(headers.get("x-content-type-options") === "nosniff", "X-Content-Type-Options missing or weak");
const frameProtection = headers.get("x-frame-options") === "DENY" || headers.get("content-security-policy")?.includes("frame-ancestors 'none'");
assert(frameProtection, "Clickjacking protection missing: require X-Frame-Options DENY or CSP frame-ancestors none");
assert(headers.get("referrer-policy") === "strict-origin-when-cross-origin", "Referrer-Policy missing or weak");
assert(headers.get("permissions-policy")?.includes("camera=()"), "Permissions-Policy missing camera restriction");
assert(headers.get("content-security-policy")?.includes("frame-ancestors 'none'"), "CSP frame-ancestors missing");
if (baseUrl.startsWith("https://")) {
  assert(headers.get("strict-transport-security")?.includes("max-age=31536000"), "HSTS missing on HTTPS");
}

const adminResponse = await fetch(`${baseUrl}/api/trpc/admin.messages`);
assert([401, 403].includes(adminResponse.status), `Unauthenticated admin API returned ${adminResponse.status}`);

if (failures.length) {
  console.error(failures.map(item => `FAIL: ${item}`).join("\n"));
  process.exit(1);
}
console.log(`Security smoke passed for ${baseUrl}`);
