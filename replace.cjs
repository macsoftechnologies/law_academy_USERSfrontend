const fs = require('fs');
const files = [
  'src/pages/Dashboard/Referrals/Referrals.jsx',
  'src/pages/QA/QAItemDetail.jsx',
  'src/pages/Dashboard/MyCourses/EnrollmentDetails.jsx',
  'src/pages/Mains/MainsTestAttempt.jsx',
  'src/pages/Exam/MockTest.jsx',
  'src/components/common/EnrollModal.jsx'
];

files.forEach(file => {
  if (fs.existsSync(file)) {
    let content = fs.readFileSync(file, 'utf8');
    if (content.includes('⚠️')) {
      content = content.replace(/⚠️/g, '<TriangleAlert size={18} color="#eab308" />');
      
      // Fix some toast alignments if needed
      content = content.replace(/className="toast warning" style={{ margin:'1rem 1rem 0' }}/g, 'className="toast warning" style={{ margin:"1rem 1rem 0", display: "flex", alignItems: "center", gap: ".6rem" }}');
      content = content.replace(/className="toast warning" style={{ marginBottom:'1rem' }}/g, 'className="toast warning" style={{ marginBottom:"1rem", display: "flex", alignItems: "center", gap: ".6rem" }}');

      if (!content.includes('TriangleAlert')) {
         if (content.includes("from 'lucide-react'")) {
           content = content.replace(/import\s+{([^}]*)}\s+from\s+'lucide-react'/, (match, p1) => {
             return `import { ${p1.trim()}, TriangleAlert } from 'lucide-react'`;
           });
         } else {
           content = "import { TriangleAlert } from 'lucide-react';\n" + content;
         }
      }
      fs.writeFileSync(file, content);
    }
  }
});
console.log('Done replacing emojis.');
