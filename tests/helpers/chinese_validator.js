/**
 * 全流程全中文合规性验证器 (Chinese Compliance Validator)
 * 依据需求 R5：项目所有输出物、UI 界面、提示信息、生成文档及报告文本必须统一使用规范中文。
 */

const FORBIDDEN_PLACEHOLDERS = [
  'lorem ipsum',
  'todo',
  'tbd',
  'fixme',
  'placeholder',
  'sample text',
  'asdf',
  'foo bar',
  'undefined',
  'null',
  'nan'
];

/**
 * 检查字符串是否包含规范中文
 */
function hasChinese(text) {
  if (typeof text !== 'string') return false;
  return /[\u4e00-\u9fa5]/.test(text);
}

/**
 * 检查文本或对象中是否包含违规英文占位词
 */
function scanForbiddenPlaceholders(input) {
  const violations = [];

  function scan(val, path) {
    if (val === null || val === undefined) return;
    if (typeof val === 'string') {
      const lower = val.toLowerCase();
      for (const phrase of FORBIDDEN_PLACEHOLDERS) {
        // 排除代码标识符中的正常单词，主要针对文本内容
        const regex = new RegExp(`\\b${phrase}\\b`, 'i');
        if (regex.test(lower)) {
          violations.push({ path, phrase, text: val });
        }
      }
    } else if (Array.isArray(val)) {
      val.forEach((item, idx) => scan(item, `${path}[${idx}]`));
    } else if (typeof val === 'object') {
      for (const key of Object.keys(val)) {
        scan(val[key], `${path}.${key}`);
      }
    }
  }

  scan(input, 'root');
  return {
    clean: violations.length === 0,
    violations
  };
}

/**
 * 校验界面文本数组全部为合规中文
 */
function validateUiLabels(labels) {
  const invalid = [];
  for (const [key, label] of Object.entries(labels)) {
    if (typeof label !== 'string' || !hasChinese(label)) {
      invalid.push({ key, label, reason: '缺少中文字符' });
    }
  }
  return {
    valid: invalid.length === 0,
    invalid
  };
}

module.exports = {
  hasChinese,
  scanForbiddenPlaceholders,
  validateUiLabels
};
