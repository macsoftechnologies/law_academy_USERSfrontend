const fs = require('fs');

function fixSmt() {
  const filePath = 'src/pages/Prelims/PrelimsSmtDetail.jsx';
  let code = fs.readFileSync(filePath, 'utf-8');

  // Fix FileEdit
  code = code.replace(
    /<span style=\{\{\s*fontSize:\s*'\.75rem',\s*color:\s*'var\(--gray-500\)'\s*\}\}>\s*\{\s*<FileEdit size=\{18\} color="#8b5cf6" \/>\s*\}\s*\{questions\} Qs\s*<\/span>/g,
    `<span style={{ display: 'flex', alignItems: 'center', gap: '0.25rem', fontSize: '.75rem', color: 'var(--gray-500)' }}>\n                          <FileEdit size={14} color="#8b5cf6" /> {questions} Qs\n                        </span>`
  );

  fs.writeFileSync(filePath, code);
  console.log('Fixed', filePath);
}

fixSmt();
