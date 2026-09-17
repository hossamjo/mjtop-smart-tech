const baseUrl = (process.env.BASE_URL || "http://localhost:3000").replace(/\/$/, "");
const endpoint = `${baseUrl}/api/trpc/auth.me`;
const stages = [10, 50, 100, 500, 1000];
const rounds = 3;

async function oneRequest() {
  const started = performance.now();
  try {
    const response = await fetch(endpoint);
    await response.arrayBuffer();
    return { duration: performance.now() - started, status: response.status };
  } catch {
    return { duration: performance.now() - started, status: 0 };
  }
}

const results = [];
for (const concurrency of stages) {
  const samples = [];
  for (let round = 0; round < rounds; round += 1) {
    samples.push(...await Promise.all(Array.from({ length: concurrency }, oneRequest)));
  }
  const durations = samples.map(sample => sample.duration).sort((a, b) => a - b);
  const errors = samples.filter(sample => sample.status === 0 || sample.status >= 500).length;
  const percentile = (value) => durations[Math.min(durations.length - 1, Math.floor(durations.length * value))];
  results.push({
    concurrency,
    requests: samples.length,
    requestsPerSecond: Number((samples.length / (Math.max(...durations) / 1000)).toFixed(2)),
    p50Ms: Number(percentile(0.5).toFixed(2)),
    p95Ms: Number(percentile(0.95).toFixed(2)),
    p99Ms: Number(percentile(0.99).toFixed(2)),
    errors,
  });
}

console.log(JSON.stringify({ endpoint, rounds, results }, null, 2));
if (results.some(result => result.errors > 0)) process.exit(1);
