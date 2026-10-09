const fs = require('fs');
const file = 'src/components/common/ComboSection.jsx';
let content = fs.readFileSync(file, 'utf8');

// Use regex to find btn-outline near navigate('/combos')
content = content.replace(/className="btn btn-outline btn-sm"([\s\S]*?onClick=\{\(\) => navigate\('\/combos'\)\})/, 'className="btn btn-ghost btn-sm"$1');

fs.writeFileSync(file, content);
