const fs = require('fs');
const file = 'src/components/common/ComboSection.jsx';
let content = fs.readFileSync(file, 'utf8');

content = content.replace(
  'className="btn btn-outline btn-sm"\n          onClick={() => navigate(\'/combos\')}',
  'className="btn btn-ghost btn-sm"\n          onClick={() => navigate(\'/combos\')}'
);

fs.writeFileSync(file, content);
