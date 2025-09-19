/**
 * Script to replace all hardcoded localhost:5100 URLs with the apiConfig import
 * Run this with Node.js in the frontend directory
 */

const fs = require('fs');
const path = require('path');
const { promisify } = require('util');

const readFile = promisify(fs.readFile);
const writeFile = promisify(fs.writeFile);

const SRC_DIR = path.join(__dirname, 'frontend', 'src');
const FILES_TO_IGNORE = ['node_modules', '.git', 'build', 'dist'];

// Import statement to add at the top of affected files
const IMPORT_STATEMENT = "import apiConfig from '../config/apiConfig';\n";
const RELATIVE_IMPORT_STATEMENT = "import apiConfig from './config/apiConfig';\n";

async function fixFile(filePath) {
  try {
    let content = await readFile(filePath, 'utf8');
    const originalContent = content;

    // Check if file contains localhost:5100
    if (!content.includes('localhost:5100')) {
      return false;
    }

    console.log(`Fixing file: ${filePath}`);

    // Add import statement if not already there
    const relativePath = path.relative(path.dirname(filePath), path.join(SRC_DIR, 'config'));
    const importPath = relativePath.startsWith('.') ? relativePath : `./${relativePath}`;
    const importStatement = `import apiConfig from '${importPath.replace(/\\/g, '/')}/apiConfig';\n`;
    
    if (!content.includes('apiConfig')) {
      // Find a good place to add the import
      if (content.includes('import ')) {
        // Add after the last import statement
        const lines = content.split('\n');
        let lastImportIndex = -1;
        
        for (let i = 0; i < lines.length; i++) {
          if (lines[i].startsWith('import ')) {
            lastImportIndex = i;
          }
        }
        
        if (lastImportIndex >= 0) {
          lines.splice(lastImportIndex + 1, 0, importStatement);
          content = lines.join('\n');
        }
      } else {
        // Add at the beginning of the file
        content = importStatement + content;
      }
    }

    // Replace all hardcoded localhost URLs
    content = content.replace(/['"]http:\/\/localhost:5100\/api\/([^'"]+)['"]/g, 
                             'apiConfig.endpoints.$1');
    
    // Replace hardcoded URLs with specific path patterns
    content = content.replace(/['"]http:\/\/localhost:5100([^'"]+)['"]/g, 
                             'apiConfig.API_URL.replace("/api", "") + "$1"');

    // Replace image URLs
    content = content.replace(/[`'"]http:\/\/localhost:5100(\${[^}]+})[`'"]/g, 
                             'apiConfig.API_URL.replace("/api", "") + $1');

    // Save the file only if changes were made
    if (content !== originalContent) {
      await writeFile(filePath, content, 'utf8');
      return true;
    }
    
    return false;
  } catch (err) {
    console.error(`Error processing ${filePath}:`, err);
    return false;
  }
}

async function processDirectory(directory) {
  try {
    const entries = fs.readdirSync(directory);
    let filesFixed = 0;

    for (const entry of entries) {
      const fullPath = path.join(directory, entry);
      
      // Skip directories to ignore
      if (FILES_TO_IGNORE.includes(entry)) {
        continue;
      }
      
      const stats = fs.statSync(fullPath);
      
      if (stats.isDirectory()) {
        filesFixed += await processDirectory(fullPath);
      } else if (stats.isFile() && fullPath.endsWith('.js')) {
        if (await fixFile(fullPath)) {
          filesFixed++;
        }
      }
    }
    
    return filesFixed;
  } catch (err) {
    console.error(`Error processing directory ${directory}:`, err);
    return 0;
  }
}

async function run() {
  console.log('Starting to fix hardcoded localhost URLs...');
  
  try {
    const filesFixed = await processDirectory(SRC_DIR);
    console.log(`Done! Fixed ${filesFixed} files.`);
  } catch (err) {
    console.error('Failed to process files:', err);
  }
}

run();
