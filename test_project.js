const assert = require('node:assert/strict');
const fs = require('node:fs');

const html = fs.readFileSync('index.html', 'utf8');
assert.match(html, /<h3 class="project-title">EzBoard<\/h3>/);
assert.match(html, /https:\/\/ezboard\.vyasdevgna\.online/);
assert.match(html, /https:\/\/github\.com\/vyas-devgna\/ezboard/);
assert.doesNotMatch(html, /project-showcase/);
console.log('EzBoard portfolio card check passed');
