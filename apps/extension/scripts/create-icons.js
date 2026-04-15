const fs = require('fs');
const path = require('path');

// 简单的 SVG 图标
const svg = `<svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 128 128">
  <rect width="128" height="128" fill="#2563eb" rx="20"/>
  <text x="64" y="80" font-size="64" text-anchor="middle" fill="white" font-family="system-ui">W</text>
</svg>`;

const publicDir = path.join(__dirname, 'public');
if (!fs.existsSync(publicDir)) {
  fs.mkdirSync(publicDir, { recursive: true });
}

// 写入 SVG 文件
fs.writeFileSync(path.join(publicDir, 'icon.svg'), svg);
console.log('Created icon.svg');