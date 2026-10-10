const fs = require('fs');

function fixFile(filePath, isQAList) {
  let code = fs.readFileSync(filePath, 'utf-8');
  
  // Add Clock import
  code = code.replace(/import {([^}]+)} from 'lucide-react';/, (match, p1) => {
    if (!p1.includes('Clock')) return `import { ${p1.trim()}, Clock } from 'lucide-react';`;
    return match;
  });

  if (isQAList) {
    code = code.replace(
      /<span style={{ fontSize: '\.75rem', color: 'var\(--gray-500\)' }}>{<FileEdit size={18} color="#8b5cf6" \/>} {question_count} Questions<\/span>/g,
      `<span style={{ display: 'flex', alignItems: 'center', gap: '0.25rem', fontSize: '.75rem', color: 'var(--gray-500)' }}><FileEdit size={14} color="#8b5cf6" /> {question_count} Questions</span>`
    );
    code = code.replace(
      /<span style={{ fontSize: '\.75rem', color: 'var\(--gray-500\)' }}>⏱ {duration} mins<\/span>/g,
      `<span style={{ display: 'flex', alignItems: 'center', gap: '0.25rem', fontSize: '.75rem', color: 'var(--gray-500)' }}><Clock size={14} color="#94a3b8" /> {duration} mins</span>`
    );
  } else {
    code = code.replace(
      /<span style={{ fontSize: '\.75rem', color: 'var\(--gray-500\)' }}>\s*{<FileEdit size={18} color="#8b5cf6" \/>} {questions} Qs\s*<\/span>/g,
      `<span style={{ display: 'flex', alignItems: 'center', gap: '0.25rem', fontSize: '.75rem', color: 'var(--gray-500)' }}>\n                            <FileEdit size={14} color="#8b5cf6" /> {questions} Qs\n                          </span>`
    );
    code = code.replace(
      /<span style={{ fontSize: '\.75rem', color: 'var\(--gray-500\)' }}>\s*⏱ {duration} min\s*<\/span>/g,
      `<span style={{ display: 'flex', alignItems: 'center', gap: '0.25rem', fontSize: '.75rem', color: 'var(--gray-500)' }}>\n                            <Clock size={14} color="#94a3b8" /> {duration} min\n                          </span>`
    );
  }

  fs.writeFileSync(filePath, code);
  console.log('Fixed', filePath);
}

fixFile('src/pages/Prelims/PrelimsQAList.jsx', true);
fixFile('src/pages/Prelims/PrelimsSmtDetail.jsx', false);
