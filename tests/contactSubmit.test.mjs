import test from 'node:test';
import assert from 'node:assert/strict';
import { readFileSync } from 'node:fs';

const read = (path) => readFileSync(new URL(`../${path}`, import.meta.url), 'utf8');

test('contact modal simulates submit without opening a mail client', () => {
  const source = read('src/components/ContactModal.tsx');

  assert.equal(source.includes('window.location.href'), false);
  assert.equal(source.includes("t('contact.sending')"), true);
  assert.equal(source.includes("t('contact.success')"), true);
  assert.equal(source.includes('aria-live="polite"'), true);
});

test('contact status keys exist in both locales', () => {
  const source = read('src/i18n/translations.ts');

  for (const key of ['contact.demoNotice', 'contact.sending', 'contact.success']) {
    assert.equal(source.includes(`'${key}'`), true);
  }
});
