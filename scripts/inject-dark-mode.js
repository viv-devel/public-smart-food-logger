const fs = require('fs');
const path = require('path');

/**
 * Recursively traverses a directory and adds dark mode CSS to all HTML files.
 * @param {string} dir - The directory to traverse.
 */
function addDarkMode(dir) {
  if (!fs.existsSync(dir)) {
    console.warn(`Directory not found: ${dir}`);
    return;
  }

  const files = fs.readdirSync(dir);
  for (const file of files) {
    const fullPath = path.join(dir, file);
    const stat = fs.statSync(fullPath);

    if (stat.isDirectory()) {
      addDarkMode(fullPath);
    } else if (file.endsWith('.html')) {
      // Read the file
      let content = fs.readFileSync(fullPath, 'utf8');

      // Avoid double injection
      if (content.includes('id="injected-dark-mode-style"')) {
        continue;
      }

      // CSS to inject
      // We use filter: invert(1) hue-rotate(180deg) for a generic dark mode.
      // This works surprisingly well for white-background coverage reports.
      // We explicitly set background-color: white on html so that when inverted it becomes black.
      const darkModeStyle = `
<style id="injected-dark-mode-style">
@media (prefers-color-scheme: dark) {
  html {
    background-color: white; /* Ensures inverted background is black */
    filter: invert(1) hue-rotate(180deg);
  }
  /* Re-invert images so they look normal */
  img, video, iframe, canvas, svg {
    filter: invert(1) hue-rotate(180deg);
  }
}
</style>
`;
      // Inject before </head>
      if (content.includes('</head>')) {
        content = content.replace('</head>', `${darkModeStyle}</head>`);
      } else if (content.includes('</body>')) {
        // Fallback
        content = content.replace('</body>', `${darkModeStyle}</body>`);
      } else {
        // Fallback append
        content += darkModeStyle;
      }

      fs.writeFileSync(fullPath, content);
      console.log(`Injected dark mode into: ${fullPath}`);
    }
  }
}

// Get directory from arguments
const targetDir = process.argv[2];

if (!targetDir) {
  console.error('Usage: node inject-dark-mode.js <directory>');
  process.exit(1);
}

console.log(`Starting dark mode injection for directory: ${targetDir}`);
addDarkMode(targetDir);
console.log('Dark mode injection complete.');
