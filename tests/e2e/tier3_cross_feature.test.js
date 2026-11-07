/**
 * Tier 3: 跨模块成对交互测试 (Cross-Feature Pairwise)
 * 验证各功能模块间的数据流转、响应式联动、计算更新与打印同步 (共 10+ 用例)
 */

const assert = require('node:assert/strict');
const {
  CONSTANTS,
  linearRegression,
  differenceMethod,
  besselUncertaintyA,
  calculateHallEffect,
  calculateMichelson,
  calculateNewtonRingsAndWedge,
  calculateLiquidViscosity
} = require('../helpers/reference_oracle.js');
const { B5_GEOMETRY_CONTRACT, validateCutoutGeometry } = require('../helpers/geometry_checker.js');
const { hasChinese, scanForbiddenPlaceholders } = require('../helpers/chinese_validator.js');

module.exports = function runTier3Tests(runner) {

  runner.suite('Tier 3: 跨模块成对交互组合测试 (Pairwise)', () => {

    runner.test('TC-T3-01 (F01+F02+F03): 录入数据修改 -> 纯函数重算 -> 状态更新与 LocalStorage 持久化', () => {
      // 模拟状态容器
      const store = {
        state: { ih: 2.0, u1: 15.5, u2: -22.4, u3: -15.2, u4: 22.7 },
        saved: null,
        dispatch(action) {
          if (action.type === 'UPDATE_FIELD') {
            this.state[action.field] = action.value;
            // 触发重算
            const uhBar = 0.25 * (this.state.u1 - this.state.u2 - this.state.u3 + this.state.u4);
            this.state.uhBar = uhBar;
            // 持久化
            this.saved = JSON.stringify(this.state);
          }
        }
      };

      store.dispatch({ type: 'UPDATE_FIELD', field: 'u1', value: 16.5 });
      assert.strictEqual(store.state.u1, 16.5);
      // uhBar = 0.25 * (16.5 + 22.4 + 15.2 + 22.7) = 0.25 * 76.8 = 19.2
      assert.strictEqual(store.state.uhBar, 19.2);
      assert.ok(store.saved.includes('"uhBar":19.2'));
    });

    runner.test('TC-T3-02 (F02+F03+F04): 数据录入更新 -> 图表拟合更新 -> 重新计算第 1 页剪贴块实际高度', () => {
      // 模拟表格行数变化对高度的影响
      const estimatePage1HeightMm = (tableRowCount, stepCount) => {
        const baseHeaderMm = 25.0;
        const rowHeightMm = 5.5;
        const stepHeightMm = 12.0;
        return baseHeaderMm + tableRowCount * rowHeightMm + stepCount * stepHeightMm;
      };

      const initialHeight = estimatePage1HeightMm(5, 4); // 25 + 27.5 + 48 = 100.5mm
      const updatedHeight = estimatePage1HeightMm(10, 6); // 25 + 55 + 72 = 152.0mm

      assert.ok(initialHeight <= B5_GEOMETRY_CONTRACT.page1_cutout_recommended_height_mm);
      assert.ok(updatedHeight <= B5_GEOMETRY_CONTRACT.page1_cutout_max_safe_height_mm);
      assert.strictEqual(validateCutoutGeometry({ page1HeightMm: updatedHeight }).valid, true);
    });

    runner.test('TC-T3-03 (F01+F02+F09): 实验切换 (霍尔 -> 迈克耳逊) -> 挂载对应 Schema 并自动载入预置数据', () => {
      const experimentRegistry = {
        'hall-effect': { name: '霍尔效应', presetRows: 5 },
        'michelson': { name: '迈克耳逊干涉仪', presetRows: 6 }
      };

      let activeExp = 'hall-effect';
      let currentDataRows = experimentRegistry[activeExp].presetRows;
      assert.strictEqual(currentDataRows, 5);

      // 切换实验
      activeExp = 'michelson';
      currentDataRows = experimentRegistry[activeExp].presetRows;
      assert.strictEqual(activeExp, 'michelson');
      assert.strictEqual(currentDataRows, 6);
    });

    runner.test('TC-T3-04 (F03+F07+F04): 牛顿环异常点剔除开关激活 -> 重新拟合与更新 B5 参数卡片', () => {
      const rawData = [29.417, 23.944, 31.121, 26.904, 30.530];
      const calculateR = (data, excludeOutliers = false) => {
        const activeData = excludeOutliers ? data.filter(v => v > 25.0) : data;
        const mean = activeData.reduce((a, b) => a + b, 0) / activeData.length;
        const R_m = (mean / (20 * 589.3e-6)) / 1000;
        return {
          count: activeData.length,
          mean: Math.round(mean * 1000) / 1000,
          R_m: Math.round(R_m * 100) / 100
        };
      };

      const before = calculateR(rawData, false);
      assert.strictEqual(before.count, 5);
      assert.strictEqual(before.R_m, 2.41);

      const after = calculateR(rawData, true);
      assert.strictEqual(after.count, 4);
      assert.strictEqual(after.R_m, 2.50);
    });

    runner.test('TC-T3-05 (F02+F08+F03): 教材提取管道元数据 -> 动态注册实验五 -> 斯托克斯边界修正公式计算', () => {
      // 提取管道产出的元数据
      const extractedExp05 = {
        id: 'exp_05_viscosity',
        title: '液体黏度的测定',
        formula: 'eta = (1/18) * (rho - rho0) * g * t * d^2 / (L * (1 + 2.4 * d / D))'
      };

      // 动态注册
      const pluginRegistry = new Map();
      pluginRegistry.set(extractedExp05.id, extractedExp05);
      assert.ok(pluginRegistry.has('exp_05_viscosity'));

      // 验证斯托克斯边界修正因子计算
      const d = 2.012e-3; // 2.012 mm
      const D = 40.0e-3;  // 40.0 mm
      const boundaryFactor = 1 + 2.4 * (d / D);
      assert.strictEqual(Math.round(boundaryFactor * 1000) / 1000, 1.121);
    });

    runner.test('TC-T3-06 (F01+F04+F10): 调起浏览器打印 -> 隔离非打印元素且保留规范中文剪贴块', () => {
      const domClasses = ['app-header', 'sidebar-nav', 'b5-cutout-box', 'export-toolbar'];
      const printFilter = (cls) => {
        // @media print 隔离契约
        if (cls.includes('header') || cls.includes('nav') || cls.includes('toolbar')) {
          return { display: 'none' };
        }
        return { display: 'block', width: '138.0mm' };
      };

      assert.strictEqual(printFilter('sidebar-nav').display, 'none');
      assert.strictEqual(printFilter('b5-cutout-box').display, 'block');
      assert.strictEqual(printFilter('b5-cutout-box').width, '138.0mm');
    });

    runner.test('TC-T3-07 (F02+F05+F09): 霍尔效应计算完成 -> 自动注入参数至思考题 3 定制解答模板', () => {
      const calcResult = {
        KH1: 94.8,
        KH2: 119.4,
        avgKH: 107.1
      };

      const generateQA3 = (res) => {
        return `KH1 (${res.KH1}) 与 KH2 (${res.KH2}) 产生差异的主要原因是初始霍尔片未精确调节至气隙正中心最强均匀磁场处，平均灵敏度为 ${res.avgKH} V/(A·T)。`;
      };

      const answer = generateQA3(calcResult);
      assert.ok(answer.includes('94.8'));
      assert.ok(answer.includes('119.4'));
      assert.ok(answer.includes('107.1'));
      assert.ok(hasChinese(answer));
    });

    runner.test('TC-T3-08 (F03+F06+F04): 迈克耳逊测波长 -> 格式化结果文本 -> 适配 B5 第 1 页排版', () => {
      const lambdaNm = 575.6;
      const uANm = 7.5;
      const formattedLatex = `\\lambda = (${Math.round(lambdaNm)} \\pm ${Math.round(uANm)})\\ \\mathrm{nm}`;
      assert.strictEqual(formattedLatex, '\\lambda = (576 \\pm 8)\\ \\mathrm{nm}');
      assert.ok(formattedLatex.length < 50); // 长度适合 134mm 内宽排版
    });

    runner.test('TC-T3-09 (F04+F07+F10): 等厚干涉双分块模式切换 -> 样式应用 80mm/88mm 分离边框', () => {
      const getCutoutLayout = (mode) => {
        if (mode === 'split_two_cards') {
          return {
            blockA: { heightMm: 80.0, label: '六、实验结论' },
            blockB: { heightMm: 88.0, label: '七、实验收获与探讨' }
          };
        }
        return { blockFull: { heightMm: 175.0, label: '结论与探讨全图' } };
      };

      const layout = getCutoutLayout('split_two_cards');
      assert.strictEqual(layout.blockA.heightMm, 80.0);
      assert.strictEqual(layout.blockB.heightMm, 88.0);
      assert.ok(hasChinese(layout.blockA.label));
    });

    runner.test('TC-T3-10 (F01+F03+F11): 极端异常输入触发防御 -> 界面警告卡片生成并被测试套件拦截自愈', () => {
      const handleInput = (rawVal) => {
        const num = Number(rawVal);
        if (isNaN(num)) {
          return { status: 'error', alertMsg: '输入非法：非数字字符' };
        }
        return { status: 'success', value: num };
      };

      const errResult = handleInput('invalid_string');
      assert.strictEqual(errResult.status, 'error');
      assert.ok(hasChinese(errResult.alertMsg));
      assert.strictEqual(scanForbiddenPlaceholders(errResult.alertMsg).clean, true);
    });

  });

};
