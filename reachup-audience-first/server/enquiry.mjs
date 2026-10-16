const recipient = 'letstalk@reachupmedia.in';
const emailPattern = /^[^\s@<>\r\n]+@[^\s@<>\r\n]+\.[^\s@<>\r\n]+$/;
const limits = { name: 120, email: 180, brand: 160, website: 250, budget: 80, timeline: 80, brief: 4000 };

export function createEnquiryHandler({ env = process.env, createTransport, now = Date.now }) {
  const attempts = new Map(); // Per-instance protection; add Vercel firewall limits at production cutover.
  const reply = (status, data, extra = {}) => Response.json(data, {
    status, headers: { 'Cache-Control': 'no-store', ...extra },
  });
  const config = () => {
    const port = Number(env.CONTACT_SMTP_PORT || 465);
    if (!env.CONTACT_SMTP_HOST || !env.CONTACT_SMTP_PASSWORD ||
        !emailPattern.test(env.CONTACT_SMTP_USER || '') || ![465, 587].includes(port)) return null;
    return { host: env.CONTACT_SMTP_HOST, port, secure: port === 465, requireTLS: true,
      auth: { user: env.CONTACT_SMTP_USER, pass: env.CONTACT_SMTP_PASSWORD },
      connectionTimeout: 5000, greetingTimeout: 5000, socketTimeout: 10000,
      disableFileAccess: true, disableUrlAccess: true };
  };
  return async request => {
    if (request.method === 'GET') return reply(200, { available: Boolean(config()) });
    if (request.method !== 'POST') return reply(405, { error: 'Method not allowed.' }, { Allow: 'GET, POST' });
    const allowed = new Set(['https://reachupmedia.in', 'https://www.reachupmedia.in']);
    if (env.CONTACT_SITE_ORIGIN) allowed.add(env.CONTACT_SITE_ORIGIN.replace(/\/$/, ''));
    for (const host of [env.VERCEL_URL, env.VERCEL_BRANCH_URL]) if (host) allowed.add(`https://${host}`);
    if (!allowed.has(request.headers.get('origin'))) return reply(403, { error: 'Please submit from our website.' });
    if (!request.headers.get('content-type')?.startsWith('application/json')) return reply(415, { error: 'Please use the enquiry form.' });
    if (Number(request.headers.get('content-length')) > 12000) return reply(413, { error: 'Your enquiry is too long.' });
    let body;
    try {
      const text = await request.text();
      if (Buffer.byteLength(text, 'utf8') > 12000) return reply(413, { error: 'Your enquiry is too long.' });
      body = JSON.parse(text);
    } catch { return reply(400, { error: 'Please check your enquiry and try again.' }); }
    if (!body || Array.isArray(body) || typeof body !== 'object') return reply(400, { error: 'Please use the enquiry form.' });
    if (body.company_url) return reply(422, { error: 'Please use email or WhatsApp to contact us.' });
    const fields = {};
    for (const [key, max] of Object.entries(limits)) {
      const value = body[key] ?? '';
      if (typeof value !== 'string' || value.length > max || (key !== 'brief' && /[\r\n]/.test(value))) {
        return reply(422, { error: 'Please check the length and format of your details.' });
      }
      fields[key] = value.trim();
    }
    if (!fields.name || !fields.brand || fields.brief.length < 15 || !emailPattern.test(fields.email)) {
      return reply(422, { error: 'Please enter your name, valid email, brand and a campaign brief of at least 15 characters.' });
    }
    const options = config();
    if (!options) return reply(503, { error: 'Online enquiries are unavailable right now. Please email or WhatsApp us.' });
    const time = now();
    for (const [key, value] of attempts) if (value.expires <= time) attempts.delete(key);
    const key = request.headers.get('x-forwarded-for')?.split(',')[0].trim() || fields.email.toLowerCase();
    const record = attempts.get(key) || { count: 0, expires: time + 600000 };
    if (record.count >= 5 || (!attempts.has(key) && attempts.size >= 1000)) {
      return reply(429, { error: 'Please wait a few minutes before sending another enquiry.' }, { 'Retry-After': '600' });
    }
    record.count += 1;
    attempts.set(key, record);
    let transport;
    try {
      transport = createTransport(options);
      const result = await transport.sendMail({
        from: { name: 'Reachup Media website', address: options.auth.user },
        to: recipient,
        replyTo: { name: fields.name, address: fields.email },
        subject: `Campaign enquiry — ${fields.brand}`,
        text: `New campaign enquiry\n\nName: ${fields.name}\nEmail: ${fields.email}\nBrand: ${fields.brand}\nWebsite / Instagram: ${fields.website || 'Not provided'}\nBudget: ${fields.budget || 'Not decided yet'}\nTimeline: ${fields.timeline || 'Let’s discuss'}\n\nCampaign brief:\n${fields.brief}`,
      });
      if (!result.accepted?.some(address => String(address).toLowerCase() === recipient)) throw new Error('Recipient not accepted');
      return reply(200, { success: true });
    } catch {
      return reply(502, { error: 'We couldn’t confirm delivery. Your details are still here; please email or WhatsApp us.' });
    } finally { transport?.close?.(); }
  };
}
