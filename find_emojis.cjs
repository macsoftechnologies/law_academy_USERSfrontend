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
const emojis = new Set();
const emojiRegex = /\p{Emoji_Presentation}/gu;

for (const file of files) {
  const content = fs.readFileSync(file, 'utf8');
  const matches = content.match(emojiRegex);
  if (matches) {
    matches.forEach(m => emojis.add(m));
  }
}
console.log(Array.from(emojis));
