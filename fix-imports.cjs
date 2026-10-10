const fs = require('fs');
const files = [
  'src/pages/QA/QAItemDetail.jsx',
  'src/pages/Mains/MainsTestAttempt.jsx',
  'src/pages/Dashboard/MyCourses/EnrollmentDetails.jsx',
  'src/pages/Dashboard/Referrals/Referrals.jsx',
  'src/components/common/EnrollModal.jsx'
];
files.forEach(file => {
  let code = fs.readFileSync(file, 'utf-8');
  if (code.includes('import {') && code.includes('lucide-react')) {
    code = code.replace(/import\s+{([^}]+)}\s+from\s+['"]lucide-react['"];?/, (match, p1) => {
      if (!p1.includes('TriangleAlert')) {
        return `import { ${p1.trim()}, TriangleAlert } from 'lucide-react';`;
      }
      return match;
    });
    fs.writeFileSync(file, code);
  } else {
    code = `import { TriangleAlert } from 'lucide-react';\n` + code;
    fs.writeFileSync(file, code);
  }
});
console.log('Fixed imports');
