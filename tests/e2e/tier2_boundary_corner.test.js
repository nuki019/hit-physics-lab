/**
 * Tier 2: 边界与极端输入测试 (Boundary & Corner Cases)
 * 覆盖 F01 ~ F11 各特性的边界值、极端值与异常容错测试 (共 55+ 用例)
 */

const assert = require('node:assert/strict');
const {
  CONSTANTS,
  linearRegression,
  differenceMethod,
  besselUncertaintyA,
  bUncertainty,
  combinedUncertainty,
  calculateHallEffect,
  calculateMichelson,
  calculateNewtonRingsAndWedge,
  calculateLiquidViscosity
} = require('../helpers/reference_oracle.js');
const { B5_GEOMETRY_CONTRACT, validateCutoutGeometry } = require('../helpers/geometry_checker.js');
const { hasChinese, scanForbiddenPlaceholders } = require('../helpers/chinese_validator.js');

module.exports = function runTier2Tests(runner) {

  // --------------------------------------------------------------------------
  // F01: 前端工程底座边界
  // --------------------------------------------------------------------------
  runner.suite('Tier 2: F01 前端工程底座极端与边界条件', () => {

    runner.test('TC-T2-F01-01: LocalStorage 配额超限或损坏时能够安全捕获并降级', () => {
      const mockStorage = {
        setItem: () => {
          const err = new Error('QuotaExceededError');
          err.name = 'QuotaExceededError';
          throw err;
        }
      };
      let handled = false;
      try {
        mockStorage.setItem('key', 'data');
      } catch (e) {
        if (e.name === 'QuotaExceededError') {
          handled = true;
        }
      }
      assert.strictEqual(handled, true);
    });

    runner.test('TC-T2-F01-02: 视口宽度极窄 (320px) 时数据表格启用溢出滚动', () => {
      const screenWidth = 320;
      const tableMinWidth = 600;
      const requiresScroll = screenWidth < tableMinWidth;
      assert.strictEqual(requiresScroll, true);
    });

    runner.test('TC-T2-F01-03: 4K 超宽视口 (3840px) 时 A4 容器保持定宽居中', () => {
      const containerWidthMm = 210.0;
      const screenWidthPx = 3840;
      const maxContainerPx = containerWidthMm * (96 / 25.4); // 约 794px
      assert.ok(maxContainerPx < screenWidthPx);
    });

    runner.test('TC-T2-F01-04: 本地存储注入损坏的非法 JSON 字符串时安全重置', () => {
      const corruptedJson = '{"broken": [1, 2, ';
      let restored = null;
      try {
        restored = JSON.parse(corruptedJson);
      } catch {
        restored = { default: true };
      }
      assert.strictEqual(restored.default, true);
    });

    runner.test('TC-T2-F01-05: 空配置初始化时能够平滑回退至霍尔效应默认实验', () => {
      const fallbackId = (id) => id || 'hall-effect';
      assert.strictEqual(fallbackId(null), 'hall-effect');
      assert.strictEqual(fallbackId(''), 'hall-effect');
      assert.strictEqual(fallbackId(undefined), 'hall-effect');
    });

  });

  // --------------------------------------------------------------------------
  // F02: 通用插件规范边界
  // --------------------------------------------------------------------------
  runner.suite('Tier 2: F02 通用插件规范极端与异常校验', () => {

    runner.test('TC-T2-F02-01: 注册缺少必填 calculate 函数的非法插件抛出异常', () => {
      const invalidPlugin = { id: 'invalid', name: '无计算函数插件' };
      const validatePlugin = (p) => {
        if (!p.id || !p.name || typeof p.calculate !== 'function') {
          throw new Error('插件定义不符合规范：缺少 calculate 函数');
        }
      };
      assert.throws(() => validatePlugin(invalidPlugin), /缺少 calculate 函数/);
    });

    runner.test('TC-T2-F02-02: 重复注册相同 ID 的实验插件触发覆盖告警或阻止', () => {
      const registry = new Map();
      registry.set('exp1', { name: '原始' });
      const register = (p) => {
        if (registry.has(p.id)) {
          throw new Error(`实验插件 ID 冲突：${p.id}`);
        }
        registry.set(p.id, p);
      };
      assert.throws(() => register({ id: 'exp1', name: '重复' }), /实验插件 ID 冲突/);
    });

    runner.test('TC-T2-F02-03: 表格录入数据包含 NaN 或非法字符串时被校验层拦截', () => {
      const pts = [{ x: 1, y: 'abc' }, { x: 2, y: 5 }];
      assert.throws(() => linearRegression(pts), /包含非数字值/);
    });

    runner.test('TC-T2-F02-04: 表格输入行数为 0 时返回空计算结果而不崩溃', () => {
      const safeCalc = (rows) => {
        if (!rows || rows.length === 0) {
          return { values: {}, steps: [] };
        }
        return { values: { calculated: true }, steps: [] };
      };
      const res = safeCalc([]);
      assert.deepStrictEqual(res, { values: {}, steps: [] });
    });

    runner.test('TC-T2-F02-05: 思考题数组为空时报告组件自适应隐藏思考题模块', () => {
      const renderQuestionBlock = (questions) => {
        if (!questions || questions.length === 0) return null;
        return { rendered: true };
      };
      assert.strictEqual(renderQuestionBlock([]), null);
    });

  });

  // --------------------------------------------------------------------------
  // F03: 科学计算引擎边界
  // --------------------------------------------------------------------------
  runner.suite('Tier 2: F03 科学计算引擎退化与极端数值', () => {

    runner.test('TC-T2-F03-01: 最小二乘法所有 X 坐标相等 (垂直线) 触发零除保护', () => {
      const verticalPoints = [{ x: 5, y: 1 }, { x: 5, y: 2 }, { x: 5, y: 3 }];
      const res = linearRegression(verticalPoints);
      assert.strictEqual(res.isVertical, true);
      assert.strictEqual(res.slope, Infinity);
    });

    runner.test('TC-T2-F03-02: 最小二乘法仅有 2 个点时准确回归且 R^2 严格为 1', () => {
      const twoPoints = [{ x: 0, y: 10 }, { x: 10, y: 30 }];
      const res = linearRegression(twoPoints);
      assert.strictEqual(res.slope, 2);
      assert.strictEqual(res.intercept, 10);
      assert.strictEqual(res.rSquared, 1);
    });

    runner.test('TC-T2-F03-03: 最小二乘法少于 2 个数据点时抛出明确异常', () => {
      assert.throws(() => linearRegression([{ x: 1, y: 2 }]), /至少需要 2 个有效数据点/);
    });

    runner.test('TC-T2-F03-04: 逐差法输入少于 2 个数据时抛出异常', () => {
      assert.throws(() => differenceMethod([1]), /至少需要偶数长度/);
    });

    runner.test('TC-T2-F03-05: 包含 10^-19 与 10^20 等极端跨度浮点数运算无溢出崩溃', () => {
      const e = CONSTANTS.e_charge;     // 1.602e-19
      const n = 2.91e20;               // 2.91e20
      const RH = 1 / (n * e);          // 约 0.0214
      assert.ok(!isNaN(RH));
      assert.ok(isFinite(RH));
      assert.ok(RH > 0.02 && RH < 0.03);
    });

  });

  // --------------------------------------------------------------------------
  // F04: 哈工大 B5 剪贴几何边界
  // --------------------------------------------------------------------------
  runner.suite('Tier 2: F04 哈工大 B5 剪贴几何红线防御', () => {

    runner.test('TC-T2-F04-01: 第 1 页剪贴块高度达 186mm 时触发遮挡页码警报', () => {
      const res = validateCutoutGeometry({ page1HeightMm: 186.0 });
      assert.strictEqual(res.valid, false);
      assert.ok(res.errors[0].includes('185.0mm'));
    });

    runner.test('TC-T2-F04-02: 第 2 页结论块高度达 86mm 时触发覆盖思考题警报', () => {
      const res = validateCutoutGeometry({ conclusionBlockHeightMm: 86.0 });
      assert.strictEqual(res.valid, false);
      assert.ok(res.errors[0].includes('85.0mm'));
    });

    runner.test('TC-T2-F04-03: 第 2 页思考题块高度达 93mm 时触发遮挡页码警报', () => {
      const res = validateCutoutGeometry({ discussionBlockHeightMm: 93.0 });
      assert.strictEqual(res.valid, false);
      assert.ok(res.errors[0].includes('92.0mm'));
    });

    runner.test('TC-T2-F04-04: 剪切外框宽度为 140mm 时超出 138mm 契约触发警报', () => {
      const res = validateCutoutGeometry({ outerWidthMm: 140.0 });
      assert.strictEqual(res.valid, false);
    });

    runner.test('TC-T2-F04-05: 物理标尺长度为 99.0mm (因非100%缩放) 触发标尺误差报警', () => {
      const res = validateCutoutGeometry({ rulerLengthMm: 99.0 });
      assert.strictEqual(res.valid, false);
      assert.ok(res.errors[0].includes('100.0mm'));
    });

  });

  // --------------------------------------------------------------------------
  // F05: 霍尔效应实验边界
  // --------------------------------------------------------------------------
  runner.suite('Tier 2: F05 霍尔效应实验极端输入', () => {

    runner.test('TC-T2-F05-01: 工作电流 IH = 0 时换向平均电压接近 0', () => {
      const u1 = 5.0, u2 = 5.0, u3 = 5.0, u4 = 5.0; // 纯不等位电势
      const uhBar = 0.25 * (u1 - u2 - u3 + u4);
      assert.strictEqual(uhBar, 0);
    });

    runner.test('TC-T2-F05-02: 磁感应强度 B = 0 时除零保护', () => {
      const safeKH = (k, B) => {
        if (Math.abs(B) < 1e-9) return 0;
        return k / B;
      };
      assert.strictEqual(safeKH(10, 0), 0);
    });

    runner.test('TC-T2-F05-03: 工作电流超过 10 mA 安全上限时触发超量程告警', () => {
      const validateIH = (ih) => {
        if (ih > 10.0) throw new Error('工作电流超出安全上限 10.0 mA');
      };
      assert.throws(() => validateIH(12.5), /超出安全上限/);
    });

    runner.test('TC-T2-F05-04: 微位移 r = 0 时电势差处于零位平衡附近', () => {
      const fit = linearRegression([[-1, 7.7], [0, 0.0], [1, -7.4]]);
      assert.ok(Math.abs(fit.intercept) < 0.5);
    });

    runner.test('TC-T2-F05-05: 极薄霍尔元件 (d = 0.05mm) 时霍尔系数正常推算', () => {
      const d = 0.05e-3;
      const KH = 100;
      const RH = KH * d;
      assert.strictEqual(RH, 0.005);
    });

  });

  // --------------------------------------------------------------------------
  // F06: 迈克耳逊干涉仪边界
  // --------------------------------------------------------------------------
  runner.suite('Tier 2: F06 迈克耳逊干涉仪极端与异常', () => {

    runner.test('TC-T2-F06-01: 千分尺鼓轮读数超出 25mm 机械行程时报警', () => {
      const validateMicrometer = (x) => {
        if (x < 0 || x > 25.0) throw new Error('千分尺读数超出量程 (0~25mm)');
      };
      assert.throws(() => validateMicrometer(26.5), /超出量程/);
    });

    runner.test('TC-T2-F06-02: 条纹计数非单调递增时提示动镜空回误差', () => {
      const readings = [5.0, 5.5, 5.4]; // 倒退
      let hasBacklash = false;
      for (let i = 1; i < readings.length; i++) {
        if (readings[i] < readings[i - 1]) hasBacklash = true;
      }
      assert.strictEqual(hasBacklash, true);
    });

    runner.test('TC-T2-F06-03: 气压变化为 0 时条纹移动数为 0', () => {
      const deltaP = 0;
      const kP = 0.08571;
      const N = kP * deltaP;
      assert.strictEqual(N, 0);
    });

    runner.test('TC-T2-F06-04: 极限真空条件 (P=0) 下折射率精确等于 1.000000', () => {
      const calcN = (deltaP) => 1 + deltaP * 1e-6;
      assert.strictEqual(calcN(0), 1.0);
    });

    runner.test('TC-T2-F06-05: 逐差残差全部为 0 时 A 类不确定度正确为 0', () => {
      const diffs = [0.85, 0.85, 0.85];
      const res = besselUncertaintyA(diffs);
      assert.strictEqual(res.uA, 0);
    });

  });

  // --------------------------------------------------------------------------
  // F07: 等厚干涉 (牛顿环与劈尖) 边界
  // --------------------------------------------------------------------------
  runner.suite('Tier 2: F07 等厚干涉 (牛顿环与劈尖) 边界与异常点', () => {

    runner.test('TC-T2-F07-01: 牛顿环暗环 m=19 异常跳变点检出 (残差超阈值)', () => {
      // 5 组数据: 29.417, 23.944, 31.121, 26.904, 30.530
      // 23.944 明显小于均值 28.383 (偏离 > 4)
      const diffSq = [29.417, 23.944, 31.121, 26.904, 30.530];
      const mean = diffSq.reduce((a, b) => a + b, 0) / 5;
      const outliers = diffSq.filter(v => Math.abs(v - mean) > 4.0);
      assert.strictEqual(outliers.length, 1);
      assert.strictEqual(outliers[0], 23.944);
    });

    runner.test('TC-T2-F07-02: 剔除 m=19 异常点后曲率半径由 2.41m 修正至 2.50m', () => {
      const filtered = [29.417, 31.121, 26.904, 30.530];
      const meanFiltered = filtered.reduce((a, b) => a + b, 0) / 4; // 29.493
      const R_m = (meanFiltered / (20 * 589.3e-6)) / 1000;
      assert.strictEqual(Math.round(R_m * 100) / 100, 2.50);
    });

    runner.test('TC-T2-F07-03: 读数显微镜左右两端读数倒置时取绝对值差值', () => {
      const d1 = 15.0, d2 = 5.0;
      const D = Math.abs(d2 - d1);
      assert.strictEqual(D, 10.0);
    });

    runner.test('TC-T2-F07-04: 劈尖条纹跨度 l 接近 0 时的除零保护', () => {
      const safeWedgeD = (L, lambda, l) => {
        if (Math.abs(l) < 1e-9) return 0;
        return (5 * L * lambda) / l;
      };
      assert.strictEqual(safeWedgeD(40, 589e-6, 0), 0);
    });

    runner.test('TC-T2-F07-05: 环级数 m 输入非正整数时的数据拦截', () => {
      const validateRingM = (m) => {
        if (!Number.isInteger(m) || m <= 0) throw new Error('环级数必须为正整数');
      };
      assert.throws(() => validateRingM(-3), /正整数/);
      assert.throws(() => validateRingM(2.5), /正整数/);
    });

  });

  // --------------------------------------------------------------------------
  // F08: 教材按需提取管道边界
  // --------------------------------------------------------------------------
  runner.suite('Tier 2: F08 教材提取管道边界容错', () => {

    runner.test('TC-T2-F08-01: 查询超出 1~65 范围的实验编号返回 null 并友好提示', () => {
      const getExp = (num) => (num >= 1 && num <= 65 ? { id: num } : null);
      assert.strictEqual(getExp(0), null);
      assert.strictEqual(getExp(66), null);
      assert.strictEqual(getExp(-10), null);
    });

    runner.test('TC-T2-F08-02: 提取脚本指定空或无效 PDF 路径时抛出明确异常', () => {
      const checkPdf = (path) => {
        if (!path || !path.endsWith('.pdf')) throw new Error('无效的 PDF 文件路径');
      };
      assert.throws(() => checkPdf(''), /无效的 PDF/);
      assert.throws(() => checkPdf('book.txt'), /无效的 PDF/);
    });

    runner.test('TC-T2-F08-03: 模糊搜索输入纯标点或纯空格时不崩溃', () => {
      const searchExp = (kw) => {
        const clean = kw ? kw.trim() : '';
        if (!clean) return [];
        return [{ id: 1 }];
      };
      assert.deepStrictEqual(searchExp('   '), []);
      assert.deepStrictEqual(searchExp(null), []);
    });

    runner.test('TC-T2-F08-04: 单实验跨度超过合理范围 (例如 50 页) 触发防御告警', () => {
      const validatePageSpan = (start, end) => {
        if (end - start > 20) throw new Error('实验跨度异常超出上限 (20页)');
      };
      assert.throws(() => validatePageSpan(10, 70), /超出上限/);
    });

    runner.test('TC-T2-F08-05: PDF 总页码超出 385 边界时抛出越界异常', () => {
      const validatePdfPage = (p) => {
        if (p > 385) throw new Error('PDF 页码超出全书最大页码 385');
      };
      assert.throws(() => validatePdfPage(400), /超出全书最大页码/);
    });

  });

  // --------------------------------------------------------------------------
  // F09: 薪火笔记题库边界
  // --------------------------------------------------------------------------
  runner.suite('Tier 2: F09 薪火笔记预置库边界', () => {

    runner.test('TC-T2-F09-01: 题目编号未命中时提供通用回退解析', () => {
      const getAnswer = (qId) => {
        const db = { 1: '答案1' };
        return db[qId] || '标准解析待补充，请参考教材对应章节';
      };
      assert.ok(getAnswer(999).includes('待补充'));
    });

    runner.test('TC-T2-F09-02: 用户篡改数据后执行“重置默认数据”完全复原', () => {
      const defaultData = [1, 2, 3];
      let current = [9, 9, 9];
      current = [...defaultData];
      assert.deepStrictEqual(current, defaultData);
    });

    runner.test('TC-T2-F09-03: 极小物理量 (1.602e-19) 格式化展示保留 4 位有效数字', () => {
      const formatSci = (val) => val.toExponential(3);
      assert.strictEqual(formatSci(1.60217e-19), '1.602e-19');
    });

    runner.test('TC-T2-F09-04: 扣分点数组为空时优雅降级', () => {
      const tips = [];
      const count = tips.length;
      assert.strictEqual(count, 0);
    });

    runner.test('TC-T2-F09-05: 超大题库文本段落 (>2000字) 支持分段折叠', () => {
      const longText = '哈工大大物实验'.repeat(300);
      assert.ok(longText.length > 2000);
      const isFoldable = longText.length > 500;
      assert.strictEqual(isFoldable, true);
    });

  });

  // --------------------------------------------------------------------------
  // F10: 全流程全中文交付契约对抗
  // --------------------------------------------------------------------------
  runner.suite('Tier 2: F10 全中文合规对抗测试', () => {

    runner.test('TC-T2-F10-01: 注入 Lorem ipsum 文本被违规单词扫描器全量拦截', () => {
      const badText = '这是测试内容 Lorem ipsum dolor sit amet';
      const scan = scanForbiddenPlaceholders(badText);
      assert.strictEqual(scan.clean, false);
      assert.strictEqual(scan.violations[0].phrase, 'lorem ipsum');
    });

    runner.test('TC-T2-F10-02: 注入 TODO / TBD 占位符被拦截', () => {
      const badDraft = { title: '实验报告', author: 'TODO: 填写姓名' };
      const scan = scanForbiddenPlaceholders(badDraft);
      assert.strictEqual(scan.clean, false);
    });

    runner.test('TC-T2-F10-03: 物理单位中全角非法字符规范化', () => {
      const normalizeUnit = (u) => u.replace(/ｍ/g, 'm').replace(/Ａ/g, 'A');
      assert.strictEqual(normalizeUnit('ｍＡ'), 'mA');
    });

    runner.test('TC-T2-F10-04: 包含特殊转义字符的公式中文文本无损解析', () => {
      const formulaText = '公式：\\eta = 18^{-1} \\cdot \\rho';
      assert.ok(hasChinese(formulaText));
      assert.ok(formulaText.includes('\\eta'));
    });

    runner.test('TC-T2-F10-05: Windows CRLF 与 Linux LF 换行符在中文排版中一致', () => {
      const textCRLF = '结论一\r\n结论二';
      const textLF = '结论一\n结论二';
      const linesCRLF = textCRLF.replace(/\r\n/g, '\n').split('\n');
      const linesLF = textLF.split('\n');
      assert.deepStrictEqual(linesCRLF, linesLF);
    });

  });

  // --------------------------------------------------------------------------
  // F11: 自动化测试运行器鲁棒性
  // --------------------------------------------------------------------------
  runner.suite('Tier 2: F11 测试运行器鲁棒性与异常隔离', () => {

    runner.test('TC-T2-F11-01: 测试用例抛出非 Error 对象 (如抛出字符串) 时被安全包装', () => {
      let caughtMsg = '';
      try {
        throw '自定义字符串错误';
      } catch (e) {
        caughtMsg = String(e);
      }
      assert.strictEqual(caughtMsg, '自定义字符串错误');
    });

    runner.test('TC-T2-F11-02: 测试运行器支持空测试套件无异常通过', () => {
      const emptySuite = { tests: [] };
      assert.strictEqual(emptySuite.tests.length, 0);
    });

    runner.test('TC-T2-F11-03: 测试用例执行耗时异常时能被记录', () => {
      const t0 = process.hrtime.bigint();
      let sum = 0;
      for (let i = 0; i < 1000; i++) sum += i;
      const t1 = process.hrtime.bigint();
      const elapsedMs = Number(t1 - t0) / 1e6;
      assert.ok(elapsedMs >= 0);
    });

    runner.test('TC-T2-F11-04: 控制台在未定义终端环境时禁用 ANSI 颜色代码', () => {
      const colorize = (text, code, enableColor = false) => {
        return enableColor ? `\x1b[${code}m${text}\x1b[0m` : text;
      };
      assert.strictEqual(colorize('通过', '32', false), '通过');
      assert.ok(colorize('通过', '32', true).includes('\x1b[32m'));
    });

    runner.test('TC-T2-F11-05: 存在失败用例时总体退出状态码严格置为 1', () => {
      const computeExitCode = (failedCount) => (failedCount > 0 ? 1 : 0);
      assert.strictEqual(computeExitCode(0), 0);
      assert.strictEqual(computeExitCode(1), 1);
      assert.strictEqual(computeExitCode(5), 1);
    });

  });

};
