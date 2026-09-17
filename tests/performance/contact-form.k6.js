import http from "k6/http";
import { check, sleep } from "k6";

const BASE_URL = __ENV.BASE_URL || "http://localhost:3000";
const CONTACT_URL = `${BASE_URL}/api/trpc/contact.submit?batch=1`;

const payload = JSON.stringify([{
  json: {
    name: "k6 Performance Test",
    contact: "load-test@example.com",
    service: "أمن سيبراني",
    message: "Performance test message with a safe test payload.",
    website: "",
  },
}]);

export const options = {
  scenarios: {
    load: {
      executor: "ramping-vus",
      startVUs: 10,
      stages: [
        { duration: "30s", target: 50 },
        { duration: "60s", target: 100 },
        { duration: "30s", target: 0 },
      ],
      exec: "contactFlow",
      tags: { test_type: "load" },
    },
    spike: {
      executor: "ramping-vus",
      startTime: "3m",
      startVUs: 100,
      stages: [
        { duration: "5s", target: 500 },
        { duration: "20s", target: 500 },
        { duration: "30s", target: 100 },
      ],
      exec: "contactFlow",
      tags: { test_type: "spike" },
    },
    stress: {
      executor: "ramping-vus",
      startTime: "4m",
      startVUs: 100,
      stages: [
        { duration: "60s", target: 500 },
        { duration: "60s", target: 1000 },
        { duration: "60s", target: 2000 },
        { duration: "30s", target: 0 },
      ],
      exec: "contactFlow",
      tags: { test_type: "stress" },
    },
    soak: {
      executor: "constant-vus",
      startTime: "8m",
      vus: 50,
      duration: "15m",
      exec: "contactFlow",
      tags: { test_type: "soak" },
    },
  },
  thresholds: {
    http_req_failed: ["rate<0.01"],
    http_req_duration: ["p(95)<1000", "p(99)<2000"],
  },
};

export function contactFlow() {
  const response = http.post(CONTACT_URL, payload, {
    headers: { "Content-Type": "application/json" },
    tags: { endpoint: "contact.submit" },
  });
  check(response, {
    "API responds": res => res.status > 0,
    "no server error": res => res.status < 500,
  });
  sleep(1);
}
