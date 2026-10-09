const fs = require('fs');
const path = require('path');

const targetFiles = [
  'src/pages/QA/QAItemDetail.jsx',
  'src/pages/Notes/PrintedNotes.jsx',
  'src/pages/Notes/Notedetailpage.jsx',
  'src/pages/Combos/ComboDetail.jsx',
  'src/pages/Dashboard/Wishlist/Wishlist.jsx',
  'src/pages/Dashboard/Dashboard/Guestlecturedetail.jsx',
  'src/pages/Dashboard/Dashboard/Categories/LectureDetails.jsx',
  'src/components/common/CartWishlistActions.jsx',
  'src/components/layout/DashboardHeader.jsx'
];

const wishlistIconPath = path.resolve('src/components/common/WishlistIcon.jsx');

targetFiles.forEach(file => {
  const fullPath = path.resolve(file);
  let content = fs.readFileSync(fullPath, 'utf8');

  // Replace <Heart ... /> with <WishlistIcon ... />
  // Note: changing color from #ef4444 to var(--navy)
  content = content.replace(/<Heart /g, '<WishlistIcon ');
  // Replace HeartCrack in Wishlist.jsx
  content = content.replace(/<HeartCrack /g, '<WishlistIcon ');
  
  // Update the color="#ef4444" inside <WishlistIcon to color="var(--navy)"
  content = content.replace(/<WishlistIcon[^>]+color="(?:#ef4444|red)"[^>]*>/g, (match) => {
    return match.replace(/color="(?:#ef4444|red)"/, 'color="var(--navy)"');
  });

  // Update fill="#ef4444" to fill="var(--navy)"
  content = content.replace(/<WishlistIcon[^>]+fill="(?:#ef4444|red)"[^>]*>/g, (match) => {
    return match.replace(/fill="(?:#ef4444|red)"/, 'fill="var(--navy)"');
  });

  // Remove Heart, HeartCrack from lucide-react imports
  const importRegex = /import\s+\{([^}]+)\}\s+from\s+['"]lucide-react['"]/g;
  content = content.replace(importRegex, (match, imports) => {
    let parts = imports.split(',').map(i => i.trim());
    parts = parts.filter(i => i !== 'Heart' && i !== 'HeartCrack' && i !== '');
    if (parts.length === 0) return ''; // Remove entire import if empty
    return 'import { ' + parts.join(', ') + ' } from "lucide-react"';
  });

  // Add WishlistIcon import if not present
  if (!content.includes('WishlistIcon')) {
     // shouldn't happen since we just added the tag
  }
  
  if (content.includes('<WishlistIcon ') && !content.includes('import WishlistIcon')) {
    const dir = path.dirname(fullPath);
    let relative = path.relative(dir, wishlistIconPath).replace(/\\/g, '/');
    if (!relative.startsWith('.')) {
      relative = './' + relative;
    }
    // Remove extension
    relative = relative.replace(/\.jsx$/, '');
    
    // Add import after other imports
    const lines = content.split('\n');
    let lastImportIdx = -1;
    for(let i=0; i<lines.length; i++) {
        if(lines[i].startsWith('import ')) lastImportIdx = i;
    }
    lines.splice(lastImportIdx + 1, 0, `import WishlistIcon from '${relative}';`);
    content = lines.join('\n');
  }

  fs.writeFileSync(fullPath, content);
  console.log('Updated ' + file);
});
