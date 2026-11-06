import { contact } from '../data/contact.js';

// Contact form: validates on blur once a field has been touched and on submit, then either
// POSTs to contact.endpoint or, with no endpoint yet, hands the message to the visitor's
// email app. Copy never claims a message was sent unless the endpoint said so.

const EMAIL = /^[^\s@]+@[^\s@]+\.[^\s@]{2,}$/;
const PHONE = /^[+()\-\s\d]{7,}$/;

export function initContactForm({ lenis, reduceMotion }) {
  const form = document.querySelector('[data-contact-form]');
  if (!form) return;

  const done = document.querySelector('[data-done]');
  const summary = form.querySelector('#cform-summary');
  const submit = form.querySelector('[data-submit]');
  const submitLabel = form.querySelector('[data-submit-label]');
  const failure = form.querySelector('[data-failure]');
  const count = form.querySelector('[data-count]');
  const f = (name) => form.elements.namedItem(name);

  form.querySelector('[data-mode-note]').textContent = contact.endpoint
    ? ''
    : 'This opens your email app with your message written out, ready to send.';

  // Practice and profile pages link here with ?about=<practice> or ?for=<person>.
  const params = new URLSearchParams(location.search);
  prefill(f('matter'), params.get('about'));
  prefill(f('person'), params.get('for'));

  const rules = {
    name: (v) => (v.trim() ? '' : 'Enter your name.'),
    email: (v) =>
      !v.trim()
        ? 'Enter your email address so we can reply.'
        : EMAIL.test(v.trim())
          ? ''
          : 'Enter an email address like name@example.com.',
    phone: (v) => {
      const wantsCall = form.querySelector('input[name="reply"]:checked')?.value === 'phone';
      if (!v.trim()) return wantsCall ? 'Add a phone number, or choose a reply by email.' : '';
      return PHONE.test(v.trim()) ? '' : 'Use digits, spaces, brackets and + only.';
    },
    matter: (v) => (v ? '' : 'Choose the area closest to your matter, or Something else.'),
    message: (v) =>
      !v.trim()
        ? 'Give a short outline of the matter.'
        : v.trim().length < 20
          ? 'Add a little more detail, at least 20 characters.'
          : '',
    consent: (_, el) => (el.checked ? '' : 'Tick the box to confirm before sending.'),
  };

  const touched = new Set();

  function check(name) {
    const el = f(name);
    const message = rules[name](el.value ?? '', el);
    const error = form.querySelector(`#cf-${name}-error`);
    el.setAttribute('aria-invalid', message ? 'true' : 'false');
    error.textContent = message;
    error.hidden = !message;
    el.closest('.field').classList.toggle('has-error', Boolean(message));
    return message;
  }

  for (const name of Object.keys(rules)) {
    const el = f(name);
    const event = el.type === 'checkbox' || el.tagName === 'SELECT' ? 'change' : 'blur';
    el.addEventListener(event, () => {
      touched.add(name);
      check(name);
    });
    // Once an error is showing, clear it as soon as the input is fixed.
    el.addEventListener('input', () => {
      if (touched.has(name) && el.getAttribute('aria-invalid') === 'true') check(name);
    });
  }

  form.querySelectorAll('input[name="reply"]').forEach((r) =>
    r.addEventListener('change', () => touched.has('phone') && check('phone')),
  );

  const message = f('message');
  const updateCount = () => (count.textContent = String(message.value.length));
  message.addEventListener('input', updateCount);
  updateCount();

  form.addEventListener('submit', async (e) => {
    e.preventDefault();
    failure.hidden = true;

    const errors = Object.keys(rules)
      .map((name) => [name, check(name)])
      .filter(([, msg]) => msg);
    Object.keys(rules).forEach((n) => touched.add(n));

    if (errors.length) {
      showSummary(errors);
      return;
    }
    summary.hidden = true;

    const data = collect();

    // Bots fill the hidden field; give them the normal ending and send nothing.
    if (f('website').value) {
      finish('sent', data);
      return;
    }

    if (!contact.endpoint) {
      window.location.href = mailtoFor(data);
      finish('mail', data);
      return;
    }

    setBusy(true);
    try {
      const controller = new AbortController();
      const timer = setTimeout(() => controller.abort(), 15000);
      const res = await fetch(contact.endpoint, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json', Accept: 'application/json' },
        body: JSON.stringify(data),
        signal: controller.signal,
      });
      clearTimeout(timer);
      if (!res.ok) throw new Error(`HTTP ${res.status}`);
      finish('sent', data);
    } catch {
      failure.textContent = `We couldn't send your message. Check your connection and try again, or email ${contact.email} directly. Everything you typed is still here.`;
      failure.hidden = false;
    } finally {
      setBusy(false);
    }
  });

  function showSummary(errors) {
    const list = summary.querySelector('ul');
    list.replaceChildren(
      ...errors.map(([name, msg]) => {
        const li = document.createElement('li');
        const a = document.createElement('a');
        a.href = `#cf-${name}`;
        a.textContent = msg;
        a.addEventListener('click', (ev) => {
          ev.preventDefault();
          f(name).focus();
        });
        li.append(a);
        return li;
      }),
    );
    summary.hidden = false;
    summary.focus({ preventScroll: true });
    scrollTo(summary);
  }

  function collect() {
    const option = (sel) => sel.options[sel.selectedIndex];
    return {
      name: f('name').value.trim(),
      organisation: f('organisation').value.trim(),
      email: f('email').value.trim(),
      phone: f('phone').value.trim(),
      matter: f('matter').value,
      matterLabel: option(f('matter')).textContent,
      person: f('person').value,
      personLabel: f('person').value ? option(f('person')).textContent : '',
      reply: form.querySelector('input[name="reply"]:checked').value,
      message: f('message').value.trim(),
      page: location.pathname + location.search,
    };
  }

  function plainText(d) {
    // null marks an optional line with nothing in it; '' is the deliberate gap before the message.
    return [
      `Name: ${d.name}`,
      d.organisation ? `Organisation: ${d.organisation}` : null,
      `Email: ${d.email}`,
      d.phone ? `Phone: ${d.phone}` : null,
      `About: ${d.matterLabel}`,
      d.personLabel ? `For the attention of: ${d.personLabel}` : null,
      `Reply by: ${d.reply}`,
      '',
      d.message,
    ]
      .filter((line) => line !== null)
      .join('\n');
  }

  function mailtoFor(d) {
    const subject = `Enquiry: ${d.matterLabel} (${d.name})`;
    return `mailto:${contact.email}?subject=${encodeURIComponent(subject)}&body=${encodeURIComponent(plainText(d))}`;
  }

  function finish(mode, d) {
    const first = d.name.split(/\s+/)[0];
    done.querySelector('[data-done-label]').textContent = mode === 'sent' ? 'Message received' : 'One more step';
    done.querySelector('[data-done-title]').textContent =
      mode === 'sent' ? `Thank you, ${first}.` : `Your email app should now be open, ${first}.`;
    done.querySelector('[data-done-text]').textContent =
      mode === 'sent'
        ? `Your message has reached the Firm. We'll reply by ${d.reply === 'phone' ? 'phone' : 'email'}.`
        : `Your message is written out there, addressed to the Firm. It isn't sent until you press Send in your email app. If nothing opened, copy the message below and email it to us.`;

    const copyBlock = done.querySelector('[data-done-copy]');
    copyBlock.hidden = mode === 'sent';
    if (mode === 'mail') {
      done.querySelector('[data-done-message]').textContent = plainText(d);
      wireCopy(plainText(d));
    }

    form.hidden = true;
    done.hidden = false;
    if (!reduceMotion) {
      done.animate(
        [
          { opacity: 0, transform: 'translateY(8px)' },
          { opacity: 1, transform: 'none' },
        ],
        { duration: 350, easing: 'cubic-bezier(0.23, 1, 0.32, 1)' },
      );
    }
    done.focus({ preventScroll: true });
    scrollTo(done);
  }

  function wireCopy(text) {
    const btn = done.querySelector('[data-copy]');
    const note = done.querySelector('[data-copied]');
    btn.onclick = async () => {
      try {
        await navigator.clipboard.writeText(text);
        note.textContent = 'Copied.';
      } catch {
        const range = document.createRange();
        range.selectNodeContents(done.querySelector('[data-done-message]'));
        const sel = window.getSelection();
        sel.removeAllRanges();
        sel.addRange(range);
        note.textContent = 'Selected. Press Ctrl+C (or ⌘C) to copy.';
      }
    };
  }

  function setBusy(busy) {
    submit.disabled = busy;
    submit.setAttribute('aria-busy', String(busy));
    submitLabel.textContent = busy ? 'Sending…' : 'Send to the Firm';
  }

  function scrollTo(el) {
    if (lenis) lenis.scrollTo(el, { offset: -120, duration: reduceMotion ? 0 : 0.8 });
    else el.scrollIntoView({ block: 'start' });
  }
}

function prefill(select, value) {
  if (value && [...select.options].some((o) => o.value === value)) select.value = value;
}
