// Splits [data-roll] labels into characters that roll up on hover (styles in main.css).
// Screen readers get the plain label; the animated copy is aria-hidden.
export function initCharRoll() {
  document.querySelectorAll('[data-roll]').forEach((el) => {
    const label = el.textContent.trim();
    el.textContent = '';

    const plain = document.createElement('span');
    plain.className = 'visually-hidden';
    plain.textContent = label;

    const roll = document.createElement('span');
    roll.className = 'roll';
    roll.setAttribute('aria-hidden', 'true');
    [...label].forEach((char, i) => {
      const span = document.createElement('span');
      span.textContent = char === ' ' ? ' ' : char;
      span.style.setProperty('--i', i);
      roll.append(span);
    });

    el.append(plain, roll);
  });
}
