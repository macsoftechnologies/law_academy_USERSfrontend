const fs = require('fs');
const path = require('path');

function getFiles(dir, files = []) {
  const fileList = fs.readdirSync(dir);
  for (const file of fileList) {
    const name = path.join(dir, file);
    if (fs.statSync(name).isDirectory()) {
      getFiles(name, files);
    } else if (name.endsWith('.jsx') || name.endsWith('.tsx')) {
      files.push(name);
    }
  }
  return files;
}

const files = getFiles('./src');
const emojiRegex = /\p{Emoji_Presentation}/u;

files.forEach(file => {
  const content = fs.readFileSync(file, 'utf8');
  // Match string literals (very naive)
  const stringRegex = /'([^'\\]*(?:\\.[^'\\]*)*)'|"([^"\\]*(?:\\.[^"\\]*)*)"|`([^`\\]*(?:\\.[^`\\]*)*)`/g;
  let match;
  while ((match = stringRegex.exec(content)) !== null) {
    const str = match[0];
    if (emojiRegex.test(str)) {
        // If it's more than just the emoji and optional spaces
        const stripped = str.replace(/['"`]/g, '').trim();
        const hasText = stripped.replace(/\p{Emoji_Presentation}/gu, '').trim().length > 0;
        if (hasText) {
            console.log(`Complex string in ${file}: ${str}`);
        }
    }
  }
});
