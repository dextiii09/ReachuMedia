/* Same-origin submission. Credentials are held only by the Vercel function. */
(() => {
  const form = document.querySelector('#campaign-form');
  if (!form) return;
  const fields = form.querySelector('fieldset');
  const button = form.querySelector('[type="submit"]');
  const status = document.querySelector('#campaign-status');
  const whatsapp = document.querySelector('#campaign-whatsapp');
  let sending = false;
  let available = false;
  fields.disabled = false;
  const originalLabel = button.innerHTML;
  function details() { return Object.fromEntries(new FormData(form)); }
  function updateWhatsapp() {
    const data = details();
    const message = `Hi Reachup Media, I’d like to discuss a campaign.\n\nName: ${data.name || ''}\nBrand: ${data.brand || ''}\nEmail: ${data.email || ''}\nWebsite / Instagram: ${data.website || ''}\nBudget: ${data.budget || ''}\nTimeline: ${data.timeline || ''}\n\n${data.brief || ''}`;
    whatsapp.href = `https://wa.me/917973043372?text=${encodeURIComponent(message)}`;
  }
  form.addEventListener('input', updateWhatsapp);
  form.addEventListener('change', updateWhatsapp);
  updateWhatsapp();
  fetch('/api/enquiry', { headers: { Accept: 'application/json' }, signal: AbortSignal.timeout(10000) })
    .then(response => response.ok ? response.json() : null)
    .then(result => {
      available = result?.available === true;
      button.disabled = !available;
      status.textContent = available ? '' : 'Online enquiries are unavailable right now. Please email or WhatsApp us.';
    })
    .catch(() => { status.textContent = 'Online enquiries are unavailable right now. Please email or WhatsApp us.'; });
  form.addEventListener('submit', async event => {
    event.preventDefault();
    if (sending || !available || !form.reportValidity()) return;
    const data = details();
    for (const name of ['name', 'brand', 'brief']) {
      const input = form.elements[name];
      if (String(data[name]).trim().length < (name === 'brief' ? 15 : 1)) {
        input.setCustomValidity(name === 'brief' ? 'Please add at least 15 characters about your campaign.' : 'Please complete this field.');
        input.reportValidity();
        input.addEventListener('input', () => input.setCustomValidity(''), { once: true });
        return;
      }
    }
    sending = true;
    button.disabled = true;
    button.textContent = 'Sending…';
    form.setAttribute('aria-busy', 'true');
    status.textContent = 'Sending your enquiry…';
    try {
      const response = await fetch('/api/enquiry', {
        method: 'POST', headers: { 'Content-Type': 'application/json', Accept: 'application/json' },
        body: JSON.stringify(data), signal: AbortSignal.timeout(25000),
      });
      const result = await response.json();
      if (!response.ok || result.success !== true) throw new Error('Delivery not confirmed');
      form.reset();
      updateWhatsapp();
      status.textContent = 'Thank you—your enquiry has been sent. Our team will reply to the email you provided.';
      status.dataset.state = 'success';
    } catch {
      status.textContent = 'We couldn’t confirm delivery. Your details are still here; please try email or WhatsApp.';
      status.dataset.state = 'error';
    } finally {
      sending = false;
      button.disabled = false;
      button.innerHTML = originalLabel;
      form.removeAttribute('aria-busy');
    }
  });
})();
