const fs = require("fs");
const path = require("path");

/**
 * Recursively traverses a directory and adds dark mode CSS/JS to all HTML files.
 * @param {string} dir - The directory to traverse.
 */
function processFiles(dir) {
  if (!fs.existsSync(dir)) {
    console.warn(`Directory not found: ${dir}`);
    return;
  }

  const files = fs.readdirSync(dir);
  for (const file of files) {
    const fullPath = path.join(dir, file);
    const stat = fs.statSync(fullPath);

    if (stat.isDirectory()) {
      processFiles(fullPath);
    } else if (file.endsWith(".html")) {
      processHtmlFile(fullPath);
    }
  }
}

/**
 * Injects dark mode styles, scripts, and updates the timestamp in a single HTML file.
 * @param {string} filePath
 */
function processHtmlFile(filePath) {
  let content = fs.readFileSync(filePath, "utf8");

  // Avoid double injection if possible (though we might overwrite styles)
  // We'll check for our specific unique ID
  if (content.includes('id="smart-food-logger-theme"')) {
    console.log(`Skipping already processed file: ${filePath}`);
    return;
  }

  // 1. Update Timestamp to JST
  // Pattern: "at 2025-12-21T01:55:33.345Z"
  // Note: istanbul reports might vary slightly but usually match this pattern in the footer.
  const dateRegex = /at (\d{4}-\d{2}-\d{2}T\d{2}:\d{2}:\d{2}\.\d{3}Z)/;
  const match = content.match(dateRegex);
  if (match) {
    try {
      const dateStr = match[1];
      const date = new Date(dateStr);

      // Convert to JST
      const formatter = new Intl.DateTimeFormat('ja-JP', {
          timeZone: 'Asia/Tokyo',
          year: 'numeric',
          month: '2-digit',
          day: '2-digit',
          hour: '2-digit',
          minute: '2-digit',
          second: '2-digit',
          hour12: false
      });
      // Intl output is like "2025/12/21 10:55:33"
      const jstDate = formatter.format(date);
      content = content.replace(match[0], `at ${jstDate} (JST)`);
    } catch (e) {
      console.warn(`Failed to convert date in ${filePath}:`, e);
    }
  }

  // 2. Inject Fonts (Google Fonts - IBM Plex Mono)
  const fontLinks = `
<link rel="preconnect" href="https://fonts.googleapis.com">
<link rel="preconnect" href="https://fonts.gstatic.com" crossorigin>
<link href="https://fonts.googleapis.com/css2?family=IBM+Plex+Mono:wght@400;500;600&display=swap" rel="stylesheet">
`;

  // 3. Inject CSS
  const styles = `
<style id="smart-food-logger-theme">
  /* Font Override for the whole page */
  body, code, pre, td, th, .strong {
    font-family: 'PlemolJP', 'PlemolJP35 Console NF', 'PlemolJP Console NF', 'IBM Plex Mono', 'Consolas', 'Courier New', monospace !important;
  }

  /* Dark Mode Styles */
  body.dark-mode {
      background-color: #1e1e1e;
      color: #d4d4d4;
  }

  /* Link Colors */
  body.dark-mode a { color: #4daafc; }
  body.dark-mode a:visited { color: #c586c0; }

  /* Header / Stats Areas */
  body.dark-mode .pad1 {
      color: #d4d4d4;
  }
  body.dark-mode .status-line {
      opacity: 0.8;
  }

  /* Tables */
  body.dark-mode .coverage-summary tr {
      border-bottom: 1px solid #333;
  }
  body.dark-mode .coverage-summary th {
      background-color: #252526;
      color: #d4d4d4;
      border-bottom: 1px solid #3e3e42;
  }
  body.dark-mode .coverage-summary td {
      border-right: 1px solid #333;
  }

  /* 背景の白浮き防止 */
  body.dark-mode .cover-empty {
      background: #333;
  }

  /* ステータス背景色の最適化 (透過色にして眩しさを抑える) */
  body.dark-mode .high, body.dark-mode .cline-yes {
      background: rgba(77, 146, 33, 0.4) !important;
  }
  body.dark-mode .medium {
      background: rgba(249, 205, 11, 0.3) !important;
  }
  body.dark-mode .low, body.dark-mode .cline-no {
      background: rgba(194, 31, 57, 0.4) !important;
  }

  /* ソースコード表示の縞模様 */
  body.dark-mode li.L1, body.dark-mode li.L3, body.dark-mode li.L5, body.dark-mode li.L7, body.dark-mode li.L9 {
      background: #2a2a2a;
  }

  /* ナビゲーション・ヘッダー周り（黒文字問題の解消） */
  /* パンくずリスト (優先度を上げて黒文字を上書き) */
  body.dark-mode div.path a:link, body.dark-mode div.path a:visited {
      color: #4daafc;
  }

  /* 説明テキスト (Press n or j...) */
  body.dark-mode .quiet {
      color: rgba(255, 255, 255, 0.7);
  }

  /* 統計数値 (グレー背景を修正) */
  body.dark-mode .fraction {
      background: #333;
      color: #d4d4d4;
  }

  /* 検索入力フォーム */
  body.dark-mode input[type="search"] {
      background: #252526;
      color: #d4d4d4;
      border: 1px solid #3e3e42;
      padding: 4px;
  }

  /* ソートアイコン (黒い画像を反転して白くする) */
  body.dark-mode .coverage-summary .sorter {
      filter: invert(1);
  }

  /* その他ハイライトの調整 */
  /* 無視された行や分岐 */
  body.dark-mode .cstat-skip, body.dark-mode .fstat-skip, body.dark-mode .cbranch-skip {
      background: #444 !important;
      color: #888 !important;
  }

  /* 未達箇所の強調 */
  body.dark-mode .cbranch-no, body.dark-mode .cstat-no, body.dark-mode .fstat-no {
      background: rgba(194, 31, 57, 0.6) !important;
      color: #d4d4d4 !important;
  }

  /* Code Blocks & PrettyPrint (VS Code Dark Theme Approximation) */
  body.dark-mode pre.prettyprint {
      background-color: #1e1e1e;
      border: 1px solid #333;
      color: #d4d4d4;
  }
  body.dark-mode .pln { color: #d4d4d4; }
  body.dark-mode .str { color: #ce9178; } /* String */
  body.dark-mode .kwd { color: #569cd6; } /* Keyword */
  body.dark-mode .com { color: #6a9955; } /* Comment */
  body.dark-mode .typ { color: #4ec9b0; } /* Type */
  body.dark-mode .lit { color: #b5cea8; } /* Literal */
  body.dark-mode .pun { color: #d4d4d4; } /* Punctuation */
  body.dark-mode .opn { color: #ffd700; } /* Open Bracket */
  body.dark-mode .clo { color: #ffd700; } /* Close Bracket */
  body.dark-mode .tag { color: #569cd6; } /* HTML Tag */
  body.dark-mode .atn { color: #9cdcfe; } /* Attribute Name */
  body.dark-mode .atv { color: #ce9178; } /* Attribute Value */
  body.dark-mode .dec { color: #dcdcaa; } /* Declaration */
  body.dark-mode .var { color: #9cdcfe; } /* Variable */
  body.dark-mode .fun { color: #dcdcaa; } /* Function */

  /* Line numbers */
  body.dark-mode span.cline-any {
      color: #858585; /* Gray for line numbers */
  }

  /* Footer */
  body.dark-mode .footer {
      color: #888;
  }
  body.dark-mode .footer a {
      color: #4daafc;
  }
</style>
`;

  // 4. Inject Toggle Script
  const script = `
<script>
(function() {
    var body = document.body;
    var storageKey = 'coverage-theme';
    var savedTheme = localStorage.getItem(storageKey);

    // Create toggle button
    var btn = document.createElement('button');
    btn.id = 'theme-toggle';
    btn.setAttribute('aria-label', 'Toggle Dark Mode');
    btn.style.position = 'fixed';
    btn.style.top = '10px';
    btn.style.right = '10px';
    btn.style.zIndex = '1000';
    btn.style.padding = '8px 12px';
    btn.style.fontSize = '16px';
    btn.style.background = '#333';
    btn.style.color = '#fff';
    btn.style.border = '1px solid #555';
    btn.style.borderRadius = '4px';
    btn.style.cursor = 'pointer';
    btn.style.fontFamily = 'system-ui, sans-serif';

    function applyTheme(isDark) {
        if (isDark) {
            body.classList.add('dark-mode');
            btn.innerHTML = 'Theme: 🌙';
            btn.style.background = '#333';
            btn.style.color = '#fff';
            localStorage.setItem(storageKey, 'dark');
        } else {
            body.classList.remove('dark-mode');
            btn.innerHTML = 'Theme: ☀️';
            btn.style.background = '#f0f0f0';
            btn.style.color = '#333';
            localStorage.setItem(storageKey, 'light');
        }
    }

    // Initial State
    var prefersDark = window.matchMedia && window.matchMedia('(prefers-color-scheme: dark)').matches;
    if (savedTheme === 'dark') {
        applyTheme(true);
    } else if (savedTheme === 'light') {
        applyTheme(false);
    } else {
        // Default to system preference
        applyTheme(prefersDark);
    }

    btn.onclick = function() {
        var isDark = body.classList.contains('dark-mode');
        applyTheme(!isDark);
    };

    document.body.appendChild(btn);
})();
</script>
`;

  // Insert into <head> and <body>
  // Fonts and Styles go in Head
  if (content.includes("</head>")) {
    content = content.replace("</head>", `${fontLinks}${styles}</head>`);
  } else {
    content += fontLinks + styles;
  }

  // Script goes at the end of Body
  if (content.includes("</body>")) {
    content = content.replace("</body>", `${script}</body>`);
  } else {
    content += script;
  }

  fs.writeFileSync(filePath, content);
  console.log(`Processed: ${filePath}`);
}

// Main execution
const targetDir = process.argv[2];

if (!targetDir) {
  console.error("Usage: node inject-dark-mode.js <directory>");
  process.exit(1);
}

console.log(`Starting post-processing for directory: ${targetDir}`);
processFiles(targetDir);
console.log("Post-processing complete.");
