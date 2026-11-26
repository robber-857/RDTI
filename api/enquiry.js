'use strict';

const { createHash } = require('node:crypto');

const workflows = new Map(Object.entries({
  basketball: 'Basketball school',
  solar: 'Solar installers',
  education: 'Education and training',
  acquisition: 'AI customer acquisition',
  operations: 'AI operations',
  edge: 'On-device AI',
  rdti: 'R&D project scoping',
  other: 'Another AI project',
}));
const limits = { name: 120, email: 254, phone: 40, company: 180, workflow: 32, detail: 1200, systems: 500, metric: 500, website: 256, requestId: 36 };
const uuid = /^[0-9a-f]{8}-[0-9a-f]{4}-4[0-9a-f]{3}-[89ab][0-9a-f]{3}-[0-9a-f]{12}$/i;
const mailbox = /^[A-Z0-9!#$%&'*+\/=?^_`{|}~-]+(?:\.[A-Z0-9!#$%&'*+\/=?^_`{|}~-]+)*@(?:[A-Z0-9](?:[A-Z0-9-]{0,61}[A-Z0-9])?\.)+[A-Z0-9](?:[A-Z0-9-]{0,61}[A-Z0-9])?$/i;
const bodyLimit = 24 * 1024;
const minute = 60_000;
const canonicalOrigin = 'https://layerform-ai.vercel.app';

// Keep validation fingerprints and expiry times only for the lifetime of this instance.
const submissions = new Map();
const senders = new Map();

function hash(value) {
  return createHash('sha256').update(value).digest('hex');
}

function prune(cache, now) {
  for (const [key, value] of cache) {
    if (value.expires <= now) cache.delete(key);
  }
}

function decode(req) {
  let input = req.body;
  if (Buffer.isBuffer(input)) input = input.toString('utf8');
  if (typeof input === 'string') {
    if (Buffer.byteLength(input) > bodyLimit) return { status: 413 };
    input = JSON.parse(input);
  }
  if (!input || typeof input !== 'object' || Array.isArray(input)) return { status: 400 };
  if (Object.keys(input).some(key => !Object.hasOwn(limits, key))) return { status: 400 };

  const fields = {};
  for (const [field, max] of Object.entries(limits)) {
    const raw = Object.hasOwn(input, field) ? input[field] : '';
    if (typeof raw !== 'string' || raw.length > max) return { status: 422, field };
    const invalidControl = field === 'detail' ? /[\x00-\x08\x0b\x0c\x0e-\x1f\x7f]/ : /[\x00-\x1f\x7f]/;
    if (invalidControl.test(raw)) return { status: 422, field };
    fields[field] = raw.trim();
  }
  if (fields.website) return { status: 400 };
  if (!uuid.test(fields.requestId)) return { status: 422, field: 'requestId' };
  if (!fields.name) return { status: 422, field: 'name' };
  if (!mailbox.test(fields.email)) return { status: 422, field: 'email' };
  if (fields.phone && (!/^[+\d().\s-]+(?:\s*(?:x|ext\.?)\s*\d+)?$/i.test(fields.phone) || fields.phone.replace(/\D/g, '').length < 5)) {
    return { status: 422, field: 'phone' };
  }
  if (!fields.company) return { status: 422, field: 'company' };
  if (!workflows.has(fields.workflow)) return { status: 422, field: 'workflow' };
  if (!fields.detail) return { status: 422, field: 'detail' };
  return { fields };
}

function providerFields(fields, reference) {
  return {
    _subject: 'Layerform project enquiry · ' + reference,
    _url: canonicalOrigin + '/',
    Reference: reference,
    Name: fields.name,
    email: fields.email,
    ...(fields.phone && { Phone: fields.phone }),
    Organisation: fields.company,
    'Project focus': workflows.get(fields.workflow),
    'Project details': fields.detail,
    ...(fields.systems && { 'Current tools or hardware': fields.systems }),
    ...(fields.metric && { 'Measure of success': fields.metric }),
  };
}

module.exports = function enquiry(req, res) {
  res.setHeader('Cache-Control', 'no-store');
  function fail(status, error, field) {
    return res.status(status).json({ ok: false, error, ...(field && { field }) });
  }
  if (req.method !== 'POST') {
    res.setHeader('Allow', 'POST');
    return fail(405, 'method_not_allowed');
  }
  if (!/^application\/json(?:\s*;|$)/i.test(req.headers['content-type'] || '')) return fail(415, 'json_required');
  if (Number(req.headers['content-length']) > bodyLimit) return fail(413, 'invalid_request');

  let parsed;
  try {
    parsed = decode(req);
  } catch {
    return fail(400, 'invalid_request');
  }
  if (parsed.status) return fail(parsed.status, 'invalid_request', parsed.field);

  const formId = (process.env.LAYERFORM_FORM_ID || '').trim();
  if (!/^[a-f0-9]{16,128}$/i.test(formId)) return fail(503, 'not_configured');
  const vercelOrigins = [process.env.VERCEL_PROJECT_PRODUCTION_URL, process.env.VERCEL_URL, process.env.VERCEL_BRANCH_URL].filter(Boolean).map(domain => 'https://' + domain);
  const allowedOrigins = [canonicalOrigin, ...vercelOrigins];
  if (req.headers.origin && !allowedOrigins.includes(req.headers.origin)) return fail(403, 'origin_not_allowed');

  const fields = parsed.fields;
  const key = fields.requestId.toLowerCase();
  fields.requestId = key;
  const fingerprint = hash(JSON.stringify(fields));
  const now = Date.now();
  prune(submissions, now);
  const entry = submissions.get(key);
  if (entry && entry.fingerprint !== fingerprint) return fail(409, 'reference_conflict');

  if (!entry) {
    prune(senders, now);
    const address = req.headers['x-vercel-forwarded-for'] || req.socket?.remoteAddress;
    const ipKey = address ? hash(String(address)) : null;
    const sender = senders.get(ipKey);
    if ((sender && sender.count >= 6) || submissions.size >= 2048 || (ipKey && !sender && senders.size >= 2048)) {
      res.setHeader('Retry-After', sender ? String(Math.max(1, Math.ceil((sender.expires - now) / 1000))) : '60');
      return fail(429, 'rate_limited');
    }
    if (ipKey) senders.set(ipKey, { count: (sender?.count || 0) + 1, expires: sender?.expires || now + 10 * minute });
    submissions.set(key, { fingerprint, expires: now + 60 * minute });
  }

  const reference = 'LF-' + key.replace(/-/g, '').slice(0, 12).toUpperCase();
  return res.status(200).json({
    prepared: true,
    reference,
    action: 'https://formsubmit.co/ajax/' + formId,
    fields: providerFields(fields, reference),
  });
};
