import fs from 'fs';
import path from 'path';

const BREEDS_DIR = path.resolve('src/content/breeds');
const files = fs.readdirSync(BREEDS_DIR).filter(f => f.endsWith('.mdx'));

console.log(`Found ${files.length} breed files to polish...`);

for (const file of files) {
  const filePath = path.join(BREEDS_DIR, file);
  let content = fs.readFileSync(filePath, 'utf-8');

  // 1. Replace all **word** with <strong>word</strong>
  content = content.replace(/\*\*([^*]+)\*\*/g, '<strong>$1</strong>');

  // 2. Escape bare `<` followed by numbers or non-tag characters
  content = content.replace(/<([0-9]|&lt;)/g, '&lt;$1');

  fs.writeFileSync(filePath, content, 'utf-8');
  console.log(`✓ Processed ${file}`);
}

console.log('All breed files bold syntax polished successfully!');
