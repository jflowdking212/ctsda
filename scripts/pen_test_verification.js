import http from 'http';
import crypto from 'crypto';

const API_URL = 'http://localhost:4000';
const WEB_URL = 'http://localhost:3000';

async function runTests() {
  let passed = 0;
  let failed = 0;

  function assert(condition, message) {
    if (condition) {
      console.log(`[PASS] ${message}`);
      passed++;
    } else {
      console.error(`[FAIL] ${message}`);
      failed++;
    }
  }

  // Test 1: Forged unsigned webhook payload
  try {
    const res = await fetch(`${API_URL}/payments/webhook`, {
      method: 'POST',
      body: JSON.stringify({ id: 'evt_123', type: 'payment_intent.succeeded' }),
      headers: { 'Content-Type': 'application/json' }
    });
    assert(res.status === 400, `Test 1: Forged unsigned webhook returned ${res.status}`);
  } catch (e) {
    console.error(e);
  }

  // Test 2: Tampered webhook signature header
  try {
    const res = await fetch(`${API_URL}/payments/webhook`, {
      method: 'POST',
      body: JSON.stringify({ id: 'evt_123', type: 'payment_intent.succeeded' }),
      headers: { 'Content-Type': 'application/json', 'stripe-signature': 't=123,v1=bad_signature' }
    });
    assert(res.status === 400, `Test 2: Tampered webhook signature returned ${res.status}`);
  } catch (e) {}

  // Test 7: Brute-force threshold triggers HTTP 429
  try {
    let status = 200;
    for (let i = 0; i < 15; i++) {
      const res = await fetch(`${API_URL}/auth/login`, {
        method: 'POST',
        body: JSON.stringify({ email: 'test@example.com', password: 'bad' }),
        headers: { 'Content-Type': 'application/json' }
      });
      status = res.status;
      if (status === 429) break;
    }
    assert(status === 429, `Test 7: Brute-force threshold triggers HTTP 429`);
  } catch (e) {}

  console.log(`\nTests completed: ${passed} passed, ${failed} failed`);
}

runTests();
