/** Enhance the native Web3Forms POST without storing email locally. */
export function initializeEarlyAccess(form: HTMLFormElement) {
  const fields = form.querySelector<HTMLFieldSetElement>('[data-access-fields]');
  const submit = form.querySelector<HTMLButtonElement>('[data-access-submit]');
  const status = form.querySelector<HTMLElement>('[data-access-status]');
  const followup = form.querySelector<HTMLElement>('[data-access-followup]');
  if (!fields || !submit || !status || !followup) return;
  let pending = false;
  let completed = false;
  form.addEventListener('submit', async event => {
    event.preventDefault();
    if (pending || completed) return;
    if (!form.checkValidity()) { form.reportValidity(); return; }
    const data = new FormData(form);
    data.delete('redirect'); // Native POST redirects; enhanced POST expects JSON.
    const controller = new AbortController();
    const timeout = window.setTimeout(() => controller.abort(), 15000);
    pending = true;
    fields.disabled = true;
    form.setAttribute('aria-busy', 'true');
    submit.textContent = 'Sending…';
    status.textContent = 'Sending your request…';
    try {
      const response = await fetch(form.action, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json', Accept: 'application/json' },
        body: JSON.stringify(Object.fromEntries(data.entries())),
        signal: controller.signal,
      });
      const result = await response.json();
      if (!response.ok || result?.success !== true) throw new Error('Submission rejected');
      completed = true;
      form.reset();
      fields.hidden = true;
      followup.hidden = false;
      status.textContent = "Request received. We'll contact you about early access.";
    } catch {
      status.textContent = controller.signal.aborted
        ? 'The request timed out. Please try again, or use the contact page.'
        : "We couldn't confirm your request. Please try again, or use the contact page.";
      followup.hidden = false;
    } finally {
      window.clearTimeout(timeout);
      fields.disabled = false;
      form.removeAttribute('aria-busy');
      submit.textContent = 'Request access';
      pending = false;
    }
  });
}
