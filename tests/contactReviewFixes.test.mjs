import test from 'node:test';
import assert from 'node:assert/strict';
import { readFileSync } from 'node:fs';

const read = (path) => readFileSync(new URL(`../${path}`, import.meta.url), 'utf8');

test('contact submit guards stale async completion', () => {
  const source = read('src/components/ContactModal.tsx');

  assert.equal(source.includes('if (submitRunRef.current !== run) return;'), true);
  assert.equal(source.includes('handleClose'), true);
  assert.equal((source.match(/submitRunRef\.current \+= 1;/g) ?? []).length >= 2, true);
});

test('email links announce the email address', () => {
  const directLabel = "${String(p.email)} — ${t('nav.openGmail')}";
  const profileLabel = "${String(perfil.email)} — ${t('nav.openGmail')}";
  const contactLabel = "${CONTACT_EMAIL} — ${t('nav.openGmail')}";
  const sectionLabel = "${CONTACT_DATA.email} — ${t('nav.openGmail')}";
  const label = (value) => `aria-label={\`${value}\`}`;
  const rowLabel =
    "aria-label={String(row.enlace).startsWith('https://mail.google.com') ? `${String(row.valor)} — ${t('nav.openGmail')}` : undefined}";

  const files = {
    'src/components/ContactModal.tsx': [label(contactLabel)],
    'src/components/ContactSection.tsx': [label(sectionLabel)],
    'src/components/EditorialDetailModal.tsx': [label(directLabel), rowLabel],
    'src/components/EditorialFooter.tsx': [label(profileLabel)],
    'src/components/Header.tsx': [label(profileLabel)],
    'src/components/NavigationHeader.tsx': [label(contactLabel)],
    'src/components/ResultsViewer.tsx': [label(directLabel), rowLabel],
    'src/components/SiteFooter.tsx': [label(profileLabel)],
  };

  for (const [file, labels] of Object.entries(files)) {
    const source = read(file);
    for (const expected of labels) {
      assert.equal(source.includes(expected), true, `${file} missing ${expected}`);
    }
  }
});

test('contact email is centralized outside the helper', () => {
  const files = [
    'src/components/ContactModal.tsx',
    'src/components/ContactSection.tsx',
    'src/components/NavigationHeader.tsx',
    'src/data/portfolioData.ts',
    'src/data/portfolioData.en.ts',
  ];

  for (const file of files) {
    assert.equal(read(file).includes('anthonyandino959@gmail.com'), false, `${file} hardcodes the email`);
  }
});
