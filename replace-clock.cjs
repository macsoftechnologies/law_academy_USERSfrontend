const fs = require('fs');
const path = require('path');

const filesToUpdate = [
  'src/pages/Prelims/TestAttemptHistory.jsx',
  'src/pages/Mains/Mainstestdetail.jsx',
  'src/pages/Mains/MainsTestSeriesList.jsx',
  'src/pages/Exam/ExamInstructions.jsx',
  'src/pages/Exam/ExamList.jsx',
  'src/pages/Exam/MockTest.jsx',
  'src/pages/Exam/ExamTerms.tsx',
  'src/pages/Dashboard/Dashboard/Guestlecturedetail.jsx'
];

filesToUpdate.forEach(file => {
  const filePath = path.join(process.cwd(), file);
  if (!fs.existsSync(filePath)) return;

  let code = fs.readFileSync(filePath, 'utf-8');

  // Skip if already heavily using Clock? No, just add import if missing.
  if (!code.includes("import { Clock }") && !code.includes(" Clock,") && !code.includes(", Clock") && !code.includes(" Clock }")) {
    if (code.includes("from 'lucide-react'")) {
      code = code.replace(/import {([^}]+)} from 'lucide-react';/, (match, p1) => {
        if (!p1.includes('Clock')) return `import { ${p1.trim()}, Clock } from 'lucide-react';`;
        return match;
      });
    } else {
      // Add lucide-react import at the top
      code = `import { Clock } from 'lucide-react';\n` + code;
    }
  }

  // Replace emoji
  // In TestAttemptHistory.jsx (icon: '⏱️') -> icon: <Clock size={16} />
  code = code.replace(/icon: '⏱️'/g, `icon: <Clock size={16} />`);
  // ExamInstructions.jsx (['⏱', ...) -> [<Clock size={18} />, ...]
  code = code.replace(/'⏱'/g, `<Clock size={18} />`);
  // Generic text replacements
  // ⏱ {test.duration} -> <span style={{ display: 'flex', alignItems: 'center', gap: '4px' }}><Clock size={16} /> {test.duration}</span>
  // This is tricky for exact text. Let's do targeted replacements.

  if (file.includes('Mainstestdetail.jsx') || file.includes('MainsTestSeriesList.jsx')) {
    code = code.replace(/⏱ \{test\.duration\}/g, `<span style={{ display: 'inline-flex', alignItems: 'center', gap: '4px' }}><Clock size={14} /> {test.duration}</span>`);
    code = code.replace(/⏱ \{sub\.duration\}/g, `<span style={{ display: 'inline-flex', alignItems: 'center', gap: '4px' }}><Clock size={14} /> {sub.duration}</span>`);
  } else if (file.includes('ExamList.jsx')) {
    code = code.replace(/⏱ \{exam\.duration\}/g, `<span style={{ display: 'inline-flex', alignItems: 'center', gap: '4px' }}><Clock size={14} /> {exam.duration}</span>`);
  } else if (file.includes('MockTest.jsx')) {
    code = code.replace(/⏱/g, `<Clock size={18} />`);
  } else if (file.includes('ExamTerms.tsx')) {
    code = code.replace(/⏱ \{test\.duration\} mins/g, `<span style={{ display: 'inline-flex', alignItems: 'center', gap: '4px' }}><Clock size={16} /> {test.duration} mins</span>`);
  } else if (file.includes('Guestlecturedetail.jsx')) {
    code = code.replace(/⏱ Duration:/g, `<span style={{ display: 'inline-flex', alignItems: 'center', gap: '4px' }}><Clock size={16} /> Duration:</span>`);
  }

  fs.writeFileSync(filePath, code);
  console.log(`Updated ${file}`);
});
