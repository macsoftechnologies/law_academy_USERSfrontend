const fs = require('fs');
const path = require('path');

function getFiles(dir, files = []) {
  const fileList = fs.readdirSync(dir);
  for (const file of fileList) {
    const name = path.join(dir, file);
    if (fs.statSync(name).isDirectory()) {
      getFiles(name, files);
    } else if (name.endsWith('.jsx')) {
      files.push(name);
    }
  }
  return files;
}

const files = getFiles('./src');
let changedFiles = 0;

files.forEach(f => {
  let c = fs.readFileSync(f, 'utf8');
  if (c.includes('Book')) {
    let newC = c;
    
    // Replace the component usage
    newC = newC.replace(/<Book /g, '<BookOpen ');
    
    // In import statements, replace exact word Book with BookOpen
    const importRegex = /import\s+\{([^}]+)\}\s+from\s+['"]lucide-react['"]/g;
    newC = newC.replace(importRegex, (match, imports) => {
      let parts = imports.split(',').map(i => i.trim());
      // Replace Book with BookOpen
      parts = parts.map(i => i === 'Book' ? 'BookOpen' : i);
      // Remove duplicates
      let uniqueImports = [...new Set(parts)].filter(i => i);
      return 'import { ' + uniqueImports.join(', ') + ' } from "lucide-react"';
    });

    if (c !== newC) {
      fs.writeFileSync(f, newC);
      changedFiles++;
    }
  }
});
console.log('Changed files:', changedFiles);
