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
      const formatter = new Intl.DateTimeFormat("ja-JP", {
        timeZone: "Asia/Tokyo",
        year: "numeric",
        month: "2-digit",
        day: "2-digit",
        hour: "2-digit",
        minute: "2-digit",
        second: "2-digit",
        hour12: false,
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
  body.dark-mode .coverage-summary th {
      background-color: #252526;
      color: #d4d4d4;
      border-bottom: 1px solid #3e3e42;
  }
  body.dark-mode .coverage-summary td {
      border-right: 1px solid #333;
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

  /* =========================================
     基本背景・文字色・枠線の補正
     ========================================= */
  body.dark-mode .cover-empty {
      background: #333;
  }
  body.dark-mode .coverage-summary tr {
      border-bottom: 1px solid #333;
  }
  body.dark-mode .keyline-all {
      border: 1px solid #444;
  }

  /* =========================================
     モダンカラーパレット (High: Emerald, Med: Amber, Low: Rose)
     ========================================= */

  /* High / Yes (Emerald-500 equivalent: #10b981) */
  body.dark-mode .high, body.dark-mode .cline-yes {
      background: rgba(16, 185, 129, 0.25) !important;
      /* ボーダーや文字色も合わせる場合は以下 */
      /* color: #a7f3d0; */
  }
  body.dark-mode .status-line.high {
      background: #10b981 !important;
  }

  /* Medium (Amber-500 equivalent: #f59e0b) */
  body.dark-mode .medium {
      background: rgba(245, 158, 11, 0.25) !important;
  }
  body.dark-mode .status-line.medium {
      background: #f59e0b !important;
  }

  /* Low / No (Rose-500 equivalent: #f43f5e) */
  body.dark-mode .low, body.dark-mode .cline-no {
      background: rgba(244, 63, 94, 0.25) !important;
  }
  body.dark-mode .status-line.low {
      background: #f43f5e !important;
  }

  /* カバレッジ不足箇所のハイライト (Rose系で視認性重視) */
  body.dark-mode .cbranch-no, body.dark-mode .cstat-no, body.dark-mode .fstat-no {
      background: rgba(244, 63, 94, 0.4) !important;
      color: #e2e8f0 !important; /* 明るいグレー文字 */
      border: 1px solid rgba(244, 63, 94, 0.5); /* 境界線を入れてくっきりさせる */
  }

  /* 対象外・スキップ行 (白浮き防止・Slate系) */
  body.dark-mode span.cline-neutral {
      background: #1e293b !important; /* Slate-800 */
      color: #94a3b8 !important; /* Slate-400 */
  }
  body.dark-mode .cstat-skip, body.dark-mode .fstat-skip, body.dark-mode .cbranch-skip {
      background: #334155 !important; /* Slate-700 */
      color: #94a3b8 !important;
  }
  /* カバレッジ行のカラム背景補正 */
  body.dark-mode td.line-coverage.quiet {
      background-color: transparent !important;
      color: #64748b; /* Slate-500 */
  }

  /* =========================================
     ソースコード・行表示の調整
     ========================================= */
  /* 縞模様の背景を暗く (Carbon風) */
  body.dark-mode li.L1, body.dark-mode li.L3, body.dark-mode li.L5, body.dark-mode li.L7, body.dark-mode li.L9 {
      background: #252526;
  }

  /* =========================================
     ナビゲーション・UIパーツの視認性確保
     ========================================= */
  /* パンくずリスト (Blue-400 equivalent: #60a5fa) */
  body.dark-mode div.path a:link, body.dark-mode div.path a:visited {
      color: #60a5fa;
  }
  /* 説明テキスト */
  body.dark-mode .quiet {
      color: rgba(255, 255, 255, 0.6);
  }
  /* 統計数値 (Slate-700背景) */
  body.dark-mode .fraction {
      background: #334155;
      color: #f1f5f9;
  }

  /* 検索ボックス */
  body.dark-mode input[type="search"] {
      background: #1e293b;
      color: #f1f5f9;
      border: 1px solid #475569;
      padding: 4px 8px;
      border-radius: 4px;
  }
  /* ソートアイコン (反転) */
  body.dark-mode .coverage-summary .sorter {
      filter: invert(1);
  }

  /* =========================================
     トップページ / ディレクトリ一覧リンクの修正
     ========================================= */
  body.dark-mode ul li a {
      background-color: #1e293b !important; /* Slate-800 */
      color: #60a5fa; /* Blue-400 */
      border: 1px solid #334155;
      padding: 2px 6px;
      border-radius: 4px;
      transition: background-color 0.2s;
  }
  body.dark-mode ul li a:hover {
      background-color: #334155 !important; /* Slate-700 */
      text-decoration: none;
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
