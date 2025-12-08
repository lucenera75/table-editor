#!/usr/bin/env node
/**
 * Bump the version string inside src/main.js console banner.
 * Increments patch number of pattern vX.Y.Z (e.g., v2.0.15 -> v2.0.16).
 */
const fs = require('fs');
const path = require('path');

const mainPath = path.resolve(__dirname, '../src/main.js');

function bumpVersionStr(str) {
  const re = /v(\d+)\.(\d+)\.(\d+)/;
  const m = str.match(re);
  if (!m) return null;
  const major = parseInt(m[1], 10);
  const minor = parseInt(m[2], 10);
  const patch = parseInt(m[3], 10) + 1;
  return `v${major}.${minor}.${patch}`;
}

try {
  const content = fs.readFileSync(mainPath, 'utf8');
  const re = /(\%c[^\n]*Initialized[^\n]*\%c\s*)(v\d+\.\d+\.\d+)(\s*\%c)/; // matches banner line version
  let updated = content;
  let bumped = null;

  if (re.test(content)) {
    updated = content.replace(re, (full, pre, ver, post) => {
      const newVer = bumpVersionStr(ver);
      if (!newVer) return full; // no change
      bumped = newVer;
      return `${pre}${newVer}${post}`;
    });
  } else {
    // Fallback: bump any first occurrence of vX.Y.Z in file
    const anyRe = /v(\d+)\.(\d+)\.(\d+)/;
    const m = content.match(anyRe);
    if (m) {
      const oldVer = m[0];
      const newVer = bumpVersionStr(oldVer);
      bumped = newVer;
      updated = content.replace(oldVer, newVer);
    }
  }

  if (!bumped) {
    console.error('No version pattern vX.Y.Z found in src/main.js');
    process.exit(1);
  }

  fs.writeFileSync(mainPath, updated, 'utf8');
  console.log(`Bumped src/main.js version to ${bumped}`);
  process.exit(0);
} catch (err) {
  console.error('Failed to bump version:', err);
  process.exit(1);
}
