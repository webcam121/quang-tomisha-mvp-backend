import * as bcrypt from 'bcryptjs';

const slugChars = 'ABCDEFGHIJKLMNOPQRSTUVWXYZabcdefghijklmnopqrstuvwxyz0123456789';
const slugCharsLength = slugChars.length;

export function hash(str: string): string {
  return bcrypt.hashSync(str, bcrypt.genSaltSync(10));
}

export function compareHash(str1: string, str2: string) {
  return bcrypt.compareSync(str1, str2);
}

export function filterObject(obj = {}, filter = Boolean) {
  const output = {};
  for (const key in obj) {
    if (filter(obj[key])) {
      output[key] = obj[key];
    }
  }
  return output;
}

export function getExpiresAt(sec: number): string {
  return new Date(Date.now() + sec * 1000).toUTCString();
}

export function generateSlug() {
  let slug = '';
  const len = Math.round(Math.random() * 6) + 9;

  for(let i = 0; i < len; i++) {
    slug += slugChars.charAt(Math.round(Math.random() * slugCharsLength));
  }

  return slug;
}

export function parseJSON(str) {
  try {
    return JSON.parse(str)
  } catch (_) {
    return null
  }
}
