import test from 'node:test';
import assert from 'node:assert/strict';
import { CONTACT_EMAIL, gmailComposeUrl } from '../src/utils/contactLinks.ts';

test('gmailComposeUrl builds a Gmail web compose link', () => {
  assert.equal(
    gmailComposeUrl('anthonyandino959@gmail.com'),
    'https://mail.google.com/mail/?view=cm&fs=1&tf=1&to=anthonyandino959%40gmail.com'
  );
});

test('gmailComposeUrl encodes an optional subject', () => {
  assert.equal(
    gmailComposeUrl(CONTACT_EMAIL, 'Hola Anthony'),
    'https://mail.google.com/mail/?view=cm&fs=1&tf=1&to=anthonyandino959%40gmail.com&su=Hola%20Anthony'
  );
});
