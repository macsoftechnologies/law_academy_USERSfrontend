const fs = require('fs');
const path = require('path');

const emojiMap = {
  '📜': '<FileText size={18} color="#3b82f6" />',
  '📋': '<ClipboardList size={18} color="#4b5563" />',
  '🛒': '<ShoppingCart size={18} color="#f59e0b" />',
  '🤍': '<Heart size={18} color="#ef4444" />',
  '❤️': '<Heart size={18} color="#ef4444" fill="#ef4444" />',
  '📦': '<Package size={18} color="#8b5cf6" />',
  '🏆': '<Trophy size={18} color="#eab308" />',
  '📚': '<Library size={18} color="#3b82f6" />',
  '🎓': '<GraduationCap size={18} color="#1e40af" />',
  '🔏': '<PenTool size={18} color="#4b5563" />',
  '🎉': '<PartyPopper size={18} color="#10b981" />',
  '✅': '<CheckCircle size={18} color="#10b981" />',
  '👤': '<User size={18} color="#4b5563" />',
  '📊': '<BarChart size={18} color="#3b82f6" />',
  '💳': '<CreditCard size={18} color="#6366f1" />',
  '❓': '<HelpCircle size={18} color="#4b5563" />',
  '🌙': '<Moon size={18} color="#4b5563" />',
  '☀️': '<Sun size={18} color="#eab308" />',
  '🎁': '<Gift size={18} color="#ec4899" />',
  '🔒': '<Lock size={18} color="#dc2626" />',
  '🔔': '<Bell size={18} color="#f59e0b" />',
  '🚪': '<LogOut size={18} color="#ef4444" />',
  '🔑': '<Key size={18} color="#f59e0b" />',
  '🔓': '<Unlock size={18} color="#10b981" />',
  '🔐': '<LockKeyhole size={18} color="#dc2626" />',
  '📱': '<Smartphone size={18} color="#4b5563" />',
  '📘': '<Book size={18} color="#3b82f6" />',
  '🎬': '<Clapperboard size={18} color="#6366f1" />',
  '📄': '<FileText size={18} color="#64748b" />',
  '📖': '<BookOpen size={18} color="#3b82f6" />',
  '🧾': '<Receipt size={18} color="#64748b" />',
  '🎤': '<Mic size={18} color="#ec4899" />',
  '📂': '<FolderOpen size={18} color="#f59e0b" />',
  '❌': '<XCircle size={18} color="#ef4444" />',
  '👋': '<Hand size={18} color="#f59e0b" />',
  '👨': '<User size={18} color="#4b5563" />',
  '⚖️': '<Scale size={18} color="#d4af37" />',
  '🏫': '<Landmark size={18} color="#3b82f6" />',
  '📅': '<Calendar size={18} color="#6366f1" />',
  '📝': '<FileEdit size={18} color="#8b5cf6" />',
  '🔍': '<Search size={18} color="#4b5563" />',
  '📬': '<Mail size={18} color="#64748b" />',
  '⏳': '<Hourglass size={18} color="#f59e0b" />',
  '🟢': '<Circle size={18} color="#10b981" fill="#10b981" />',
  '⛔': '<MinusCircle size={18} color="#ef4444" />',
  '🎫': '<Ticket size={18} color="#8b5cf6" />',
  '💬': '<MessageSquare size={18} color="#3b82f6" />',
  '📞': '<Phone size={18} color="#10b981" />',
  '🧪': '<FlaskConical size={18} color="#8b5cf6" />',
  '🎯': '<Target size={18} color="#ef4444" />',
  '🎥': '<Video size={18} color="#6366f1" />',
  '📑': '<Files size={18} color="#64748b" />',
  '🏁': '<Flag size={18} color="#10b981" />',
  '🧩': '<Puzzle size={18} color="#f59e0b" />',
  '📭': '<Mailbox size={18} color="#64748b" />',
  '📌': '<Pin size={18} color="#ef4444" />',
  '📢': '<Megaphone size={18} color="#3b82f6" />',
  '🪪': '<IdCard size={18} color="#64748b" />',
  '👥': '<Users size={18} color="#4b5563" />',
  '💰': '<Banknote size={18} color="#10b981" />',
  '💔': '<HeartCrack size={18} color="#ef4444" />',
  '🔄': '<RefreshCw size={18} color="#3b82f6" />',
  '💡': '<Lightbulb size={18} color="#eab308" />',
  '🔢': '<Hash size={18} color="#64748b" />',
  '🚀': '<Rocket size={18} color="#8b5cf6" />',
  '📈': '<TrendingUp size={18} color="#10b981" />',
  '⏰': '<AlarmClock size={18} color="#ef4444" />',
  '🏅': '<Medal size={18} color="#f59e0b" />',
  '🚩': '<Flag size={18} color="#ef4444" />',
  '💪': '<Shield size={18} color="#10b981" />',
  '🕐': '<Clock size={18} color="#64748b" />',
  '📥': '<Inbox size={18} color="#3b82f6" />',
  '🚨': '<AlertTriangle size={18} color="#ef4444" />',
  '✨': '<Sparkles size={18} color="#eab308" />',
  '✍️': '<PenTool size={18} color="#4b5563" />'
};

const emojiRegex = /\p{Emoji_Presentation}/u;

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

files.forEach(file => {
  let content = fs.readFileSync(file, 'utf8');
  let usedComponents = new Set();

  const checkCustom = (str) => {
    let res = str;
    return emojiRegex.test(res) || str.includes('☀️') || str.includes('⚖️') || str.includes('❤️') || str.includes('✍️');
  };

  if (!checkCustom(content)) {
    return;
  }

  // 1. Process inline single-line strings (does not cross \n or \r).
  const stringRegex = /'([^'\n\r\\]*(?:\\.[^'\n\r\\]*)*)'|"([^"\n\r\\]*(?:\\.[^"\n\r\\]*)*)"/g;
  
  content = content.replace(stringRegex, (match, p1, p2) => {
    const inner = p1 !== undefined ? p1 : p2;
    const quote = p1 !== undefined ? "'" : '"';
    
    if (!checkCustom(inner)) return match;

    // Check if it's completely an emoji string e.g., '✅' or ' ✅ '
    let stripped = inner.replace(/\p{Emoji_Presentation}/gu, '').trim();
    ['☀️', '⚖️', '❤️', '✍️'].forEach(c => stripped = stripped.split(c).join(''));
    
    if (stripped === '') {
        // It's JUST emoji(s)
        let res = inner.replace(/\p{Emoji_Presentation}/gu, e => {
            if (emojiMap[e]) {
                usedComponents.add(emojiMap[e].match(/<([A-Za-z0-9_]+)/)[1]);
                return emojiMap[e];
            }
            return e;
        });
        ['☀️', '⚖️', '❤️', '✍️'].forEach(c => {
             if (res.includes(c) && emojiMap[c]) {
                 usedComponents.add(emojiMap[c].match(/<([A-Za-z0-9_]+)/)[1]);
                 res = res.split(c).join(emojiMap[c]);
             }
        });
        
        // Return without quotes! This turns { icon: '✅' } into { icon: <CheckCircle /> }
        return res;
    } else {
        // It's a mixed string e.g., '✅ Copied'
        let res = inner.replace(/\p{Emoji_Presentation}/gu, e => {
            if (emojiMap[e]) {
                usedComponents.add(emojiMap[e].match(/<([A-Za-z0-9_]+)/)[1]);
                return `{${emojiMap[e]}}`;
            }
            return e;
        });
        ['☀️', '⚖️', '❤️', '✍️'].forEach(c => {
             if (res.includes(c) && emojiMap[c]) {
                 usedComponents.add(emojiMap[c].match(/<([A-Za-z0-9_]+)/)[1]);
                 res = res.split(c).join(`{${emojiMap[c]}}`);
             }
        });
        // Wrap in (<>...</>) to make it valid JSX since it has both string and components
        // E.g., '✅ Copied' -> (<>{<CheckCircle />} Copied</>)
        // We do NOT wrap in quotes.
        return `(<>${res}</>)`;
    }
  });

  // 2. Now process the remaining emojis that are NOT in single/double quotes (usually inside JSX tags like <div>✅</div> or backticks)
  if (checkCustom(content)) {
      content = content.replace(/\p{Emoji_Presentation}/gu, match => {
          if (emojiMap[match]) {
              usedComponents.add(emojiMap[match].match(/<([A-Za-z0-9_]+)/)[1]);
              return `{${emojiMap[match]}}`;
          }
          return match;
      });
      ['☀️', '⚖️', '❤️', '✍️'].forEach(c => {
           if (content.includes(c) && emojiMap[c]) {
               usedComponents.add(emojiMap[c].match(/<([A-Za-z0-9_]+)/)[1]);
               content = content.split(c).join(`{${emojiMap[c]}}`);
           }
      });
  }

  if (usedComponents.size > 0) {
    const imports = Array.from(usedComponents).join(', ');
    const importStmt = `import { ${imports} } from 'lucide-react';\n`;
    
    if (!content.includes('from \'lucide-react\'') && !content.includes('from "lucide-react"')) {
        content = importStmt + content;
    }
    fs.writeFileSync(file, content, 'utf8');
    console.log(`Updated ${file}`);
  }
});
