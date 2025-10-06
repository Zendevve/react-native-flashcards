const fs = require('fs');
const path = require('path');

console.log('🔧 Fixing paths for GitHub Pages deployment...\n');

// Fix paths in index.html
const indexPath = path.join(__dirname, 'dist', 'index.html');
let indexContent = fs.readFileSync(indexPath, 'utf8');

// Convert absolute paths to relative
indexContent = indexContent.replace(/href="\/favicon\.ico"/g, 'href="./favicon.ico"');
indexContent = indexContent.replace(/src="\/_expo\//g, 'src="./_expo/');

fs.writeFileSync(indexPath, indexContent);
console.log('✅ Fixed paths in index.html');

// Fix paths in the main JS bundle
const distDir = path.join(__dirname, 'dist', '_expo', 'static', 'js', 'web');

if (fs.existsSync(distDir)) {
  const files = fs.readdirSync(distDir);
  
  files.forEach(file => {
    if (file.endsWith('.js')) {
      const filePath = path.join(distDir, file);
      let content = fs.readFileSync(filePath, 'utf8');
      
      // Fix asset paths - convert absolute to relative
      const originalContent = content;
      
      // Fix /assets/ paths to ./assets/
      content = content.replace(/["']\/assets\//g, '"./assets/');
      
      // Fix /node_modules/ paths in assets
      content = content.replace(/\/assets\/node_modules/g, './assets/node_modules');
      
      if (content !== originalContent) {
        fs.writeFileSync(filePath, content);
        console.log(`✅ Fixed asset paths in ${file}`);
      }
    }
  });
}

console.log('\n✅ All paths fixed for GitHub Pages!');
console.log('📦 Ready to deploy with: npm run deploy');
