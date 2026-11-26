(() => {
  'use strict';

  const copy = {
    title: 'Outline your project',
    intro: 'Tell our developers what you want to build and how we can reach you.',
    localIntro: 'Describe the project and save a brief to share with your team.',
    name: 'Your name', email: 'Email address', phone: 'Phone number',
    company: 'Organisation name', companyHint: 'Your organisation’s name',
    workflow: 'Project focus', choose: 'Select a focus area',
    basketball: 'Basketball school', solar: 'Solar installers', education: 'Education and training',
    acquisition: 'AI customer acquisition', operations: 'AI operations',
    edge: 'On-device AI', rdti: 'R&D project scoping', other: 'Another AI project',
    detail: 'Describe the project', detailHint: 'What would you like the system to do?',
    systems: 'Current tools or hardware', systemsHint: 'For example, HubSpot and a shared inbox',
    metric: 'Measure of success', metricHint: 'For example, time to qualify an enquiry',
    optional: 'Optional', prepare: 'Create brief', preview: 'Preview brief', close: 'Close project brief',
    send: 'Send enquiry', sending: 'Sending…', sent: 'Enquiry sent',
    sentIntro: 'Thank you for sharing your project. Our team will follow up at the email address below.',
    reference: 'Enquiry reference',
    privacy: 'We use FormSubmit to email your enquiry to Layerform so our team can reply.',
    localPrivacy: 'Your brief stays on this device. You choose how to share it.',
    noName: 'Enter your name.', noEmail: 'Enter a valid email address.', noPhone: 'Check your phone number, including the area or country code.',
    noCompany: 'Enter your organisation’s name.', noWorkflow: 'Select a focus area.',
    noDetail: 'Describe the project you have in mind.',
    ready: 'Your project brief', readyIntro: 'Check the details, then send your enquiry or keep a copy.',
    localReadyIntro: 'Copy or download your brief to share it with your team.',
    edit: 'Edit brief', copy: 'Copy', download: 'Download .txt', copied: 'Brief copied to the clipboard.',
    copyFailed: 'The brief could not be copied. You can download the text file.',
    downloaded: 'Your text file is ready.',
  };
  const workflows = ['basketball', 'solar', 'education', 'acquisition', 'operations', 'edge', 'rdti', 'other'];

  const live = location.protocol === 'https:' || location.protocol === 'http:';
  let dialog, form, review, heading, intro, status, opener;
  let view = 'form';
  let sending = false;
  let attempt, reference = '', failure = '';
  let hostedDelivery;
  const controls = {};

  // All user-entered content is rendered with textContent or as plain text.
  function initialise() {
    if (dialog) return;
    dialog = document.createElement('dialog');
    dialog.id = 'project-brief-dialog';
    dialog.setAttribute('aria-labelledby', 'pb-title');
    dialog.setAttribute('aria-describedby', 'pb-intro');
    dialog.innerHTML = `
      <div class="pb-wrap">
        <header class="pb-head">
          <h2 id="pb-title" tabindex="-1"></h2>
          <button type="button" class="pb-close" data-pb-close>
            <svg width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="1.8" stroke-linecap="round" aria-hidden="true"><path d="m6 6 12 12M18 6 6 18"/></svg>
          </button>
        </header>
        <p id="pb-intro" class="pb-intro"></p>
        <form class="pb-form" novalidate>
          <fieldset class="pb-fields">
            <div class="pb-field pb-contact">
              <label for="pb-name" data-pb-text="name"></label>
              <input id="pb-name" name="name" required maxlength="120" autocomplete="name" aria-describedby="pb-error-name">
              <small id="pb-error-name" class="pb-error" hidden></small>
            </div>
            <div class="pb-field pb-contact">
              <label for="pb-email" data-pb-text="email"></label>
              <input id="pb-email" name="email" type="email" required maxlength="254" autocomplete="email" aria-describedby="pb-error-email">
              <small id="pb-error-email" class="pb-error" hidden></small>
            </div>
            <div class="pb-field">
              <label for="pb-company" data-pb-text="company"></label>
              <input id="pb-company" name="company" required maxlength="180" autocomplete="organization" data-pb-placeholder="companyHint" aria-describedby="pb-error-company">
              <small id="pb-error-company" class="pb-error" hidden></small>
            </div>
            <div class="pb-field pb-contact">
              <label for="pb-phone"><span data-pb-text="phone"></span><span class="pb-optional" data-pb-text="optional"></span></label>
              <input id="pb-phone" name="phone" type="tel" maxlength="40" autocomplete="tel" aria-describedby="pb-error-phone">
              <small id="pb-error-phone" class="pb-error" hidden></small>
            </div>
            <div class="pb-field pb-wide">
              <label for="pb-workflow" data-pb-text="workflow"></label>
              <div class="pb-select">
                <select id="pb-workflow" name="workflow" required aria-describedby="pb-error-workflow">
                  <option value="" data-pb-text="choose"></option>
                </select>
                <svg width="15" height="15" viewBox="0 0 16 16" fill="none" stroke="currentColor" stroke-width="1.5" stroke-linecap="round" stroke-linejoin="round" aria-hidden="true"><path d="m4 6 4 4 4-4"/></svg>
              </div>
              <small id="pb-error-workflow" class="pb-error" hidden></small>
            </div>
            <div class="pb-field pb-wide">
              <label for="pb-detail" data-pb-text="detail"></label>
              <textarea id="pb-detail" name="detail" required maxlength="1200" rows="2" data-pb-placeholder="detailHint" aria-describedby="pb-error-detail"></textarea>
              <small id="pb-error-detail" class="pb-error" hidden></small>
            </div>
            <div class="pb-field">
              <label for="pb-systems"><span data-pb-text="systems"></span><span class="pb-optional" data-pb-text="optional"></span></label>
              <input id="pb-systems" name="systems" maxlength="500" data-pb-placeholder="systemsHint">
            </div>
            <div class="pb-field">
              <label for="pb-metric"><span data-pb-text="metric"></span><span class="pb-optional" data-pb-text="optional"></span></label>
              <input id="pb-metric" name="metric" maxlength="500" data-pb-placeholder="metricHint">
            </div>
            <div class="pb-trap" aria-hidden="true" inert>
              <label for="pb-website">Website</label>
              <input id="pb-website" name="website" tabindex="-1" maxlength="256" autocomplete="off">
            </div>
          </fieldset>
          <div class="pb-actions pb-create-actions">
            <button type="submit" class="pb-primary" data-pb-submit></button>
            <button type="button" class="pb-secondary" data-pb-preview data-pb-text="preview"></button>
          </div>
        </form>
        <div class="pb-review" hidden>
          <dl class="pb-summary"></dl>
          <div class="pb-actions">
            <button type="button" class="pb-edit" data-pb-edit data-pb-text="edit"></button>
            <button type="button" class="pb-secondary" data-pb-copy data-pb-text="copy"></button>
            <button type="button" class="pb-secondary" data-pb-download data-pb-text="download"></button>
            <button type="button" class="pb-primary" data-pb-send data-pb-text="send"></button>
          </div>
        </div>
        <p class="pb-privacy"><svg width="15" height="15" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="1.65" stroke-linecap="round" stroke-linejoin="round" aria-hidden="true"><rect x="5" y="10" width="14" height="11" rx="2"/><path d="M8 10V7a4 4 0 0 1 8 0v3"/></svg><span data-pb-text="privacy"></span></p>
        <p class="pb-status" role="status" tabindex="-1"></p>
        <form class="pb-hosted" method="post" target="_blank" rel="noopener" hidden>
          <p id="pb-hosted-note">FormSubmit will open in a new tab for verification and show whether your enquiry was sent. Your draft stays here.</p>
          <div class="pb-actions"><button type="submit" class="pb-secondary" aria-describedby="pb-hosted-note">Send with FormSubmit</button></div>
          <div data-hosted-fields></div>
        </form>
      </div>`;
    document.body.append(dialog);
    form = dialog.querySelector('form');
    review = dialog.querySelector('.pb-review');
    heading = dialog.querySelector('h2');
    intro = dialog.querySelector('.pb-intro');
    status = dialog.querySelector('.pb-status');
    for (const name of ['name', 'email', 'phone', 'company', 'workflow', 'detail', 'systems', 'metric', 'website']) {
      controls[name] = form.elements.namedItem(name);
    }
    dialog.querySelectorAll('.pb-contact').forEach(field => { field.hidden = !live; });
    controls.name.required = controls.email.required = live;
    workflows.forEach(key => {
      const option = document.createElement('option');
      option.value = key;
      option.dataset.pbText = key;
      controls.workflow.append(option);
    });
    dialog.querySelector('[data-pb-close]').setAttribute('aria-label', copy.close);
    dialog.querySelectorAll('[data-pb-text]').forEach(el => { el.textContent = copy[el.dataset.pbText]; });
    dialog.querySelectorAll('[data-pb-placeholder]').forEach(el => { el.placeholder = copy[el.dataset.pbPlaceholder]; });
    dialog.querySelector('[data-pb-close]').addEventListener('click', () => dialog.close());
    dialog.querySelector('[data-pb-edit]').addEventListener('click', () => changeView('form'));
    dialog.querySelector('[data-pb-preview]').addEventListener('click', previewBrief);
    dialog.querySelector('[data-pb-send]').addEventListener('click', sendEnquiry);
    dialog.querySelector('[data-pb-copy]').addEventListener('click', copyBrief);
    dialog.querySelector('[data-pb-download]').addEventListener('click', downloadBrief);
    dialog.querySelector('.pb-hosted').addEventListener('submit', event => {
      if (!hostedDelivery || hostedDelivery.used || sending || attempt.fingerprint !== JSON.stringify(readFields())) {
        event.preventDefault();
        return;
      }
      // Let this user-initiated HTML form submit normally. Only the hosted tab can confirm the outcome.
      hostedDelivery.used = true;
      event.currentTarget.querySelector('button').disabled = true;
      failure = 'Check the FormSubmit tab for the result. Your draft remains available here.';
      status.textContent = failure;
      status.classList.remove('pb-failed');
    });
    form.addEventListener('input', event => {
      const field = event.target;
      if (field.getAttribute('aria-invalid') === 'true' && field.value.trim()) clearError(field);
      if (failure || reference) {
        hostedDelivery = undefined;
        failure = '';
        reference = '';
        paint();
      }
    });
    form.addEventListener('submit', event => {
      event.preventDefault();
      if (live) sendEnquiry();
      else previewBrief();
    });
    let backdropPress = false;
    function outside(event) {
      if (event.target !== dialog) return false;
      const box = dialog.getBoundingClientRect();
      return event.clientX < box.left || event.clientX > box.right || event.clientY < box.top || event.clientY > box.bottom;
    }
    dialog.addEventListener('pointerdown', event => { backdropPress = outside(event); });
    dialog.addEventListener('click', event => {
      if (backdropPress && outside(event)) dialog.close();
      backdropPress = false;
    });
    dialog.addEventListener('close', () => {
      document.documentElement.classList.remove('project-brief-open');
      const focusTarget = opener?.getClientRects().length ? opener : document.querySelector('.menu-btn');
      focusTarget?.focus({ preventScroll: true });
    });
  }

  function clearError(field) {
    field.removeAttribute('aria-invalid');
    const message = dialog.querySelector('#pb-error-' + field.name);
    if (message) {
      message.hidden = true;
      message.textContent = '';
    }
  }

  const errors = { name: 'noName', email: 'noEmail', company: 'noCompany', phone: 'noPhone', workflow: 'noWorkflow', detail: 'noDetail' };
  function showFieldError(field) {
    const message = dialog.querySelector('#pb-error-' + field.name);
    field.setAttribute('aria-invalid', 'true');
    message.textContent = copy[errors[field.name]];
    message.hidden = false;
  }

  function isValid(forSending) {
    let first;
    const fields = forSending ? Object.keys(errors) : ['company', 'workflow', 'detail'];
    for (const name of fields) {
      const field = controls[name];
      const value = field.value.trim();
      let valid = !field.required || !!value;
      if (name === 'email') valid = /^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(value) && field.validity.valid;
      if (name === 'phone' && value) valid = /^[+\d().\s-]+(?:\s*(?:x|ext\.?)\s*\d+)?$/i.test(value) && value.replace(/\D/g, '').length >= 5;
      if (valid) { clearError(field); continue; }
      showFieldError(field);
      if (!first) first = field;
    }
    if (first) {
      if (view !== 'form') changeView('form');
      first.focus();
    }
    return !first;
  }

  function previewBrief() {
    if (!sending && isValid(false)) changeView('review');
  }

  function newRequestId() {
    if (crypto.randomUUID) return crypto.randomUUID();
    const bytes = crypto.getRandomValues(new Uint8Array(16));
    bytes[6] = (bytes[6] & 15) | 64;
    bytes[8] = (bytes[8] & 63) | 128;
    const digits = Array.from(bytes, byte => byte.toString(16).padStart(2, '0')).join('');
    return [digits.slice(0,8), digits.slice(8,12), digits.slice(12,16), digits.slice(16,20), digits.slice(20)].join('-');
  }

  function readFields() {
    return Object.fromEntries(Object.entries(controls).map(([name, input]) => [name, input.value.trim()]));
  }

  const mailFields = new Set(['_subject', '_url', 'Reference', 'Name', 'email', 'Phone', 'Organisation',
    'Project focus', 'Project details', 'Current tools or hardware', 'Measure of success']);
  function preparedDelivery(result) {
    if (result?.prepared !== true || typeof result.action !== 'string' || typeof result.reference !== 'string') return;
    const expected = /^https:\/\/formsubmit\.co\/ajax\/([a-f0-9]{16,128})$/.exec(result.action);
    if (!expected || expected[0] !== result.action) return;
    const fields = result.fields;
    if (!fields || typeof fields !== 'object' || Array.isArray(fields) || !result.reference || fields.Reference !== result.reference) return;
    if (Object.entries(fields).some(([name, value]) => !mailFields.has(name) || typeof value !== 'string')) return;
    if (!['_subject', '_url', 'Name', 'email', 'Organisation', 'Project focus', 'Project details'].every(name => fields[name]?.trim())) return;
    return {ajax: result.action, hosted: 'https://formsubmit.co/' + expected[1], fields, reference: result.reference};
  }

  async function deliver(prepared, signal) {
    const unconfirmed = 'Delivery could not be confirmed. You can continue with FormSubmit or keep a copy of your brief.';
    const waitAndRetry = 'Please wait a few minutes before sending again. Your details are still here.';
    let response, result;
    try {
      response = await fetch(prepared.ajax, {
        method: 'POST', mode: 'cors', credentials: 'omit', redirect: 'error',
        headers: {'Content-Type': 'application/json', Accept: 'application/json'},
        body: JSON.stringify(prepared.fields), signal
      });
      if (response.status === 429) return {message: waitAndRetry};
      // FormSubmit can return a JSON body labelled as text/html.
      result = await response.json();
    } catch {
      return {message: unconfirmed, offerHosted: true};
    }
    if (response.ok && (result?.success === true || result?.success === 'true')
        && typeof result.message === 'string' && /^the form was submitted successfully[.!]?$/i.test(result.message.trim())) return {sent: true};
    const message = [result?.message, result?.error, result?.code, result?.diagnostic].filter(part => typeof part === 'string').join(' ');
    if (/activat(?:e|ion)|confirm.{0,24}(?:email address|this form)/i.test(message)) {
      return {message: 'Email delivery is temporarily unavailable. Your draft is safe here. Please try again later or save a copy.'};
    }
    if (/captcha|verification_required|verify.{0,25}human|browser verification|human verification/i.test(message)) {
      return {message: 'FormSubmit needs you to complete a verification step.', offerHosted: true};
    }
    if (/rate.limit|too many/i.test(message)) return {message: waitAndRetry};
    return {message: 'Your enquiry has not been confirmed. Please try again later or keep a copy of your brief.'};
  }

  async function sendEnquiry() {
    if (!live || sending || view === 'sent' || !isValid(true)) return;
    const fields = readFields();
    const fingerprint = JSON.stringify(fields);
    if (attempt?.fingerprint !== fingerprint) attempt = {fingerprint, requestId: newRequestId()};
    const controller = new AbortController();
    const timeout = setTimeout(() => controller.abort(), 25000);
    sending = true;
    failure = '';
    hostedDelivery = undefined;
    paint();
    let rejectedField = '';
    try {
      const response = await fetch('/api/enquiry', {
        method: 'POST', redirect: 'error', headers: {'Content-Type': 'application/json', Accept: 'application/json'},
        body: JSON.stringify({...fields, requestId: attempt.requestId}), signal: controller.signal
      });
      const result = await response.json();
      const prepared = response.ok && preparedDelivery(result);
      if (prepared) {
        reference = prepared.reference;
        const delivery = await deliver(prepared, controller.signal);
        if (delivery.sent) view = 'sent';
        else {
          failure = delivery.message;
          if (delivery.offerHosted) hostedDelivery = prepared;
        }
      } else if (response.status === 422 && Object.hasOwn(errors, result?.field)) {
        view = 'form';
        rejectedField = result.field;
        failure = 'Please check the highlighted field and send again.';
      } else {
        failure = response.status === 429
          ? 'Please wait a few minutes before sending again. Your details are still here.'
          : 'Delivery could not be confirmed. Your details are still here. Try again later or save a copy of your brief.';
      }
    } catch {
      failure = 'Delivery could not be confirmed. Your details are still here. Try again or save a copy of your brief.';
    } finally {
      clearTimeout(timeout);
      sending = false;
      paint();
      if (rejectedField) {
        showFieldError(controls[rejectedField]);
        if (dialog.open) controls[rejectedField].focus();
      } else if (view === 'sent' && dialog.open) {
        dialog.scrollTop = 0;
        heading.focus({preventScroll: true});
      } else if (failure && dialog.open) {
        status.focus({preventScroll: true});
        const notice = hostedDelivery ? dialog.querySelector('.pb-hosted button') : status;
        notice.scrollIntoView({block: 'nearest'});
      }
    }
  }

  function summaryRows() {
    const workflow = controls.workflow.value;
    return [
      [copy.reference, reference],
      [copy.name, controls.name.value.trim()], [copy.email, controls.email.value.trim()], [copy.phone, controls.phone.value.trim()],
      [copy.company, controls.company.value.trim()],
      [copy.workflow, copy[workflow]],
      [copy.detail, controls.detail.value.trim()],
      [copy.systems, controls.systems.value.trim()], [copy.metric, controls.metric.value.trim()],
    ].filter(([, value]) => value);
  }

  function paint() {
    if (attempt && attempt.fingerprint !== JSON.stringify(readFields())) {
      hostedDelivery = undefined;
      reference = '';
    }
    const reviewing = view !== 'form';
    const headings = {form: copy.title, review: copy.ready, sent: copy.sent};
    const descriptions = {form: live ? copy.intro : copy.localIntro, review: live ? copy.readyIntro : copy.localReadyIntro, sent: copy.sentIntro};
    heading.textContent = headings[view];
    intro.textContent = descriptions[view];
    form.hidden = reviewing;
    review.hidden = !reviewing;
    form.querySelector('fieldset').disabled = sending;
    const submit = dialog.querySelector('[data-pb-submit]');
    const send = dialog.querySelector('[data-pb-send]');
    submit.textContent = sending ? copy.sending : live ? copy.send : copy.prepare;
    send.textContent = sending ? copy.sending : copy.send;
    send.hidden = !live || view === 'sent';
    dialog.querySelector('[data-pb-preview]').hidden = !live;
    dialog.querySelector('[data-pb-edit]').hidden = view === 'sent';
    dialog.querySelectorAll('[data-pb-submit], [data-pb-preview], [data-pb-edit], [data-pb-send]').forEach(button => { button.disabled = sending; });
    dialog.querySelector('[data-pb-text="privacy"]').textContent = live ? copy.privacy : copy.localPrivacy;
    status.textContent = failure || (sending ? copy.sending : '');
    status.classList.toggle('pb-failed', !!failure && !hostedDelivery?.used);
    const hostedForm = dialog.querySelector('.pb-hosted');
    hostedForm.hidden = !hostedDelivery || sending || view === 'sent';
    const inputs = hostedForm.querySelector('[data-hosted-fields]');
    inputs.replaceChildren();
    if (!hostedForm.hidden) {
      hostedForm.action = hostedDelivery.hosted;
      hostedForm.querySelector('button').disabled = !!hostedDelivery.used;
      for (const [name, value] of Object.entries(hostedDelivery.fields)) {
        const input = document.createElement('input');
        input.type = 'hidden';
        input.name = name;
        input.value = value;
        inputs.append(input);
      }
    }
    if (reviewing) {
      const summary = dialog.querySelector('.pb-summary');
      summary.replaceChildren();
      for (const [label, content] of summaryRows()) {
        const dt = document.createElement('dt');
        const dd = document.createElement('dd');
        dt.textContent = label;
        dd.textContent = content;
        summary.append(dt, dd);
      }
    }
  }

  function changeView(next) {
    view = next;
    failure = '';
    paint();
    dialog.scrollTop = 0;
    if (dialog.open) heading.focus({ preventScroll: true });
  }

  function briefText() {
    return [copy.ready, ...summaryRows().map(([label, value]) => label + '\n' + value)].join('\n\n');
  }

  async function copyBrief() {
    let ok = false;
    const content = briefText();
    if (navigator.clipboard?.writeText) {
      try { await navigator.clipboard.writeText(content); ok = true; } catch { /* Try local clipboard support. */ }
    }
    if (!ok && dialog.open) {
      const previous = document.activeElement;
      const buffer = document.createElement('textarea');
      buffer.className = 'pb-clipboard';
      buffer.value = content;
      dialog.append(buffer);
      buffer.select();
      try { ok = document.execCommand('copy'); } catch { /* Download remains available. */ }
      buffer.remove();
      previous?.focus({ preventScroll: true });
    }
    status.textContent = ok ? copy.copied : copy.copyFailed;
  }

  function downloadBrief() {
    const blob = new Blob(['\uFEFF', briefText()], { type: 'text/plain;charset=utf-8' });
    const url = URL.createObjectURL(blob);
    const link = document.createElement('a');
    link.href = url;
    link.download = 'project-brief.txt';
    dialog.append(link);
    link.click();
    link.remove();
    setTimeout(() => URL.revokeObjectURL(url), 30000);
    status.textContent = copy.downloaded;
  }

  document.addEventListener('click', event => {
    const trigger = event.target.closest?.('[data-brief]');
    if (!trigger) return;
    event.preventDefault();
    initialise();
    if (dialog.open) return;
    opener = trigger;
    if (view === 'sent') {
      form.reset();
      reference = '';
      attempt = undefined;
      failure = '';
    }
    if (!sending) {
      if (!failure && workflows.includes(trigger.dataset.brief)) controls.workflow.value = trigger.dataset.brief;
      Object.values(controls).forEach(clearError);
      view = 'form';
    }
    paint();
    dialog.showModal();
    document.documentElement.classList.add('project-brief-open');
    dialog.scrollTop = 0;
    heading.focus({ preventScroll: true });
  });
})();
