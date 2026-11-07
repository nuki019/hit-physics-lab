/** @type {import('tailwindcss').Config} */
module.exports = {
  content: [
    "./index.html",
    "./src/**/*.{js,ts,jsx,tsx}",
  ],
  theme: {
    extend: {
      fontFamily: {
        // 报告纸质排版专用中文字体栈 (出版级宋体)
        report: ['"SimSun"', '"Songti SC"', '"STSong"', '"Songti TC"', 'serif'],
        // 现代工程 UI 中文字体栈 (清晰易读无衬线)
        sans: [
          '-apple-system', 'BlinkMacSystemFont', '"Segoe UI"',
          '"PingFang SC"', '"Hiragino Sans GB"', '"Microsoft YaHei"',
          '"WenQuanYi Micro Hei"', 'sans-serif'
        ],
        // 数学数据与等宽数字字体栈
        mono: ['"JetBrains Mono"', '"Consolas"', '"Courier New"', 'monospace'],
      },
      colors: {
        hit: {
          blue: '#004098',      // 哈工大标准蓝
          lightBlue: '#1e6bb8',
          navy: '#0a2540',
          amber: '#d97706',
          slate: '#0f172a',
        },
      },
      screens: {
        // 打印专用媒体查询断点
        print: { raw: 'print' },
      },
    },
  },
  plugins: [],
};
