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
  '🚨': '<AlertTriangle size={18} color="#ef4444" />'
};

const emojiRegex = /\p{Emoji_Presentation}/gu;

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
  
  if (!emojiRegex.test(content) && !content.includes('☀️') && !content.includes('⚖️') && !content.includes('❤️')) {
      return;
  }
  
  // Custom check since some emojis don't match Emoji_Presentation depending on Node version
  const checkCustom = (str) => {
      let res = str;
      ['☀️', '⚖️', '❤️'].forEach(c => {
          if (res.includes(c)) res = res.split(c).join('');
      });
      return emojiRegex.test(res) || str.includes('☀️') || str.includes('⚖️') || str.includes('❤️');
  };
  
  const replaceEmojis = (str, track) => {
      let result = str.replace(emojiRegex, e => {
          if (emojiMap[e]) {
              const comp = emojiMap[e].match(/<([A-Za-z0-9_]+)/)[1];
              if (track) usedComponents.add(comp);
              return emojiMap[e];
          }
          return e;
      });
      ['☀️', '⚖️', '❤️'].forEach(e => {
          if (result.includes(e) && emojiMap[e]) {
              const comp = emojiMap[e].match(/<([A-Za-z0-9_]+)/)[1];
              if (track) usedComponents.add(comp);
              result = result.split(e).join(emojiMap[e]);
          }
      });
      return result;
  };

  const stringRegex = /'([^'\\]*(?:\\.[^'\\]*)*)'|"([^"\\]*(?:\\.[^"\\]*)*)"/g;
  
  content = content.replace(stringRegex, (match, singleQuote, doubleQuote) => {
    const inner = singleQuote !== undefined ? singleQuote : doubleQuote;
    
    if (!checkCustom(inner)) return match;
    
    // Check if inner is only emojis and spaces
    let stripped = inner.replace(emojiRegex, '').trim();
    ['☀️', '⚖️', '❤️'].forEach(c => stripped = stripped.split(c).join(''));
    
    if (stripped === '') {
       // Only emojis
       return replaceEmojis(inner, true);
    } else {
       // Mixed string -> (<>{inner with emojis wrapped in {}}</>)
       let result = inner.replace(emojiRegex, e => {
           if (emojiMap[e]) {
               const comp = emojiMap[e].match(/<([A-Za-z0-9_]+)/)[1];
               usedComponents.add(comp);
               return `{${emojiMap[e]}}`;
           }
           return e;
       });
       ['☀️', '⚖️', '❤️'].forEach(e => {
          if (result.includes(e) && emojiMap[e]) {
              const comp = emojiMap[e].match(/<([A-Za-z0-9_]+)/)[1];
              usedComponents.add(comp);
              result = result.split(e).join(`{${emojiMap[e]}}`);
          }
      });
      return `(<>${result}</>)`;
    }
  });

  // Now replace any remaining emojis outside of strings
  content = replaceEmojis(content, true);

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
