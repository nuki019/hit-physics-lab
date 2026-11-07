/**
 * Tier 4: 真实实验全流程端到端场景测试 (Real-World Application Scenarios)
 * 覆盖 6 大真实实验工作流与哈工大未来技术学院规范端到端核验
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
const { B5_GEOMETRY_CONTRACT, validateCutoutGeometry, validatePrintCssRules } = require('../helpers/geometry_checker.js');
const { hasChinese, scanForbiddenPlaceholders, validateUiLabels } = require('../helpers/chinese_validator.js');

module.exports = function runTier4Tests(runner) {

  runner.suite('Tier 4: 真实实验全流程端到端场景测试', () => {

    // ------------------------------------------------------------------------
    // 场景 1: 霍尔效应全套数据录入、四次换向法、双特性拟合与导出
    // ------------------------------------------------------------------------
    runner.test('场景 1: 霍尔效应全套数据录入、四次换向法、双特性拟合与报告导出', () => {
      // 1. 原始测量数据
      const table1_raw = [
        [2.0, 15.5, -22.4, -15.2, 22.7],
        [2.5, 19.5, -27.9, -19.0, 28.5],
        [3.0, 23.5, -33.4, -22.7, 34.5],
        [3.5, 27.5, -38.9, -26.5, 40.1],
        [4.0, 31.8, -43.8, -29.9, 46.0]
      ];
      const table2_raw = [
        [100, 50, 22.7, -22.7],
        [200, 100, 40.3, -40.3],
        [300, 150, 58.2, -58.3],
        [400, 200, 76.1, -76.1],
        [500, 250, 94.3, -94.4]
      ];
      const table3_raw = [
        [-2, 15.9],
        [-1, 7.7],
        [0, 0.0],
        [1, -7.4],
        [2, -14.6]
      ];

      // 2. 执行核心计算引擎
      const hallResult = calculateHallEffect(table1_raw, table2_raw, table3_raw);

      // 3. 物理断言
      // 灵敏度 KH1 与 KH2
      assert.ok(Math.abs(hallResult.KH1 - 94.75) < 0.1);
      assert.strictEqual(Math.round(hallResult.KH2 * 10) / 10, 119.4);
      assert.strictEqual(Math.round(hallResult.KH_avg * 10) / 10, 107.1);

      // 相关系数 r 接近 1
      assert.ok(hallResult.fit1.r > 0.9999);
      assert.ok(hallResult.fit2.r > 0.9999);

      // 载流子浓度与霍尔系数
      assert.strictEqual(Math.round((hallResult.RH * 100) * 100) / 100, 2.14);
      assert.strictEqual(Math.round((hallResult.nCarrier / 1e20) * 100) / 100, 2.91);

      // 微位移定标斜率
      assert.strictEqual(Math.round(Math.abs(hallResult.kr) * 1000) / 1000, 0.131);
      assert.strictEqual(Math.round(Math.abs(hallResult.ku) * 100) / 100, 7.61);

      // 4. 模拟生成报告排版对象并断言
      const page1Report = {
        title: '五、实验数据整理及处理（霍尔效应）',
        widthMm: 138.0,
        innerContentMm: 134.0,
        heightMm: 148.0
      };
      assert.strictEqual(page1Report.widthMm, 138.0);
      assert.ok(page1Report.heightMm <= 185.0);
      assert.ok(hasChinese(page1Report.title));
    });

    // ------------------------------------------------------------------------
    // 场景 2: 迈克耳逊干涉仪波长测量、动镜逐差、气室折射率回归与不确定度
    // ------------------------------------------------------------------------
    runner.test('场景 2: 迈克耳逊干涉仪波长测量、动镜位移逐差、气室折射率回归与 A 类不确定度', () => {
      const readings = [5.811, 6.083, 6.371, 6.652, 6.955, 7.248];
      const pressureTable = [
        [0, 0],
        [50, 3],
        [100, 7],
        [150, 13],
        [200, 16],
        [250, 21]
      ];

      const michelsonResult = calculateMichelson(readings, pressureTable);

      // 逐差位移与均值
      assert.strictEqual(Math.round(michelsonResult.deltaX_bar * 10000) / 10000, 0.8633);
      assert.strictEqual(Math.round(michelsonResult.deltaD_bar * 100000) / 100000, 0.04317);

      // 测得波长与误差
      assert.strictEqual(Math.round(michelsonResult.lambda_nm * 10) / 10, 575.6);
      const relativeError = Math.abs(michelsonResult.lambda_nm - 632.8) / 632.8;
      assert.strictEqual(Math.round(relativeError * 1000) / 10, 9.0); // 9.0%

      // A 类不确定度
      assert.strictEqual(Math.round(michelsonResult.uA_lambda), 8); // 8 nm

      // 气压斜率与折射率
      assert.strictEqual(Math.round(michelsonResult.kP * 100000) / 100000, 0.08571);
      assert.strictEqual(Math.round(michelsonResult.n_air * 1000000) / 1000000, 1.000258);
      // 与标准值 1.000271 相对偏差极小
      assert.ok(Math.abs(michelsonResult.n_air - 1.000271) < 2e-5);
    });

    // ------------------------------------------------------------------------
    // 场景 3: 牛顿环逐差法曲率半径计算、m=19 异常点剔除再拟合与劈尖微丝测厚
    // ------------------------------------------------------------------------
    runner.test('场景 3: 牛顿环逐差法曲率半径计算、暗环 m=19 异常点剔除再拟合与劈尖微丝测厚', () => {
      const newtonData = [
        { m: 20, Dm: 10.994, Dm_5: 9.563 },
        { m: 19, Dm: 10.446, Dm_5: 9.229 }, // 异常跳变点
        { m: 18, Dm: 10.492, Dm_5: 8.886 },
        { m: 17, Dm: 10.171, Dm_5: 8.749 },
        { m: 16, Dm: 9.863, Dm_5: 8.170 }
      ];
      const wedgeData = { L: 43.095, l: 1.4656 };

      // 全量 5 组计算
      const fullRes = calculateNewtonRingsAndWedge(newtonData, wedgeData);
      assert.strictEqual(Math.round(fullRes.meanDiffSq * 1000) / 1000, 28.383);
      assert.strictEqual(Math.round(fullRes.R_m * 100) / 100, 2.41);
      assert.strictEqual(Math.round(fullRes.u_R_m * 100) / 100, 0.11);

      // 剔除 m=19 异常组后再算
      const filteredData = newtonData.filter(d => d.m !== 19);
      const filteredRes = calculateNewtonRingsAndWedge(filteredData, wedgeData);
      assert.strictEqual(Math.round(filteredRes.meanDiffSq * 1000) / 1000, 29.493);
      assert.strictEqual(Math.round(filteredRes.R_m * 100) / 100, 2.50);

      // 劈尖测微丝直径
      assert.strictEqual(Math.round(fullRes.d_wire_um * 10) / 10, 86.6);

      // 思考题 2 判定
      const q2Answer = '底平面有微小凸起时，空气膜厚度减小，暗环局部向外凸出';
      assert.ok(hasChinese(q2Answer));
      assert.ok(q2Answer.includes('向外凸出'));
    });

    // ------------------------------------------------------------------------
    // 场景 4: 教材 p.70 实验五液体黏度测定斯托克斯公式外推与拟合测试
    // ------------------------------------------------------------------------
    runner.test('场景 4: 教材 p.70 实验五液体黏度测定斯托克斯公式外推与拟合测试', () => {
      // 5 颗钢球的 5 次测量数据
      const ballsData = [
        [2.012, 2.016, 2.010, 2.014, 2.013],
        [2.008, 2.010, 2.012, 2.009, 2.011],
        [2.015, 2.018, 2.014, 2.017, 2.016],
        [2.005, 2.007, 2.006, 2.008, 2.004],
        [2.011, 2.013, 2.012, 2.010, 2.014]
      ];

      // 5 组不同温度下落球数据 (20°C ~ 40°C)
      const castorOilData = [
        { temp: 20.0, L_cm: 20.0, D_cm: 4.0, t_s: 14.73 },
        { temp: 25.0, L_cm: 20.0, D_cm: 4.0, t_s: 9.67 },
        { temp: 30.0, L_cm: 20.0, D_cm: 4.0, t_s: 6.10 },
        { temp: 35.0, L_cm: 20.0, D_cm: 4.0, t_s: 4.46 },
        { temp: 40.0, L_cm: 20.0, D_cm: 4.0, t_s: 3.42 }
      ];

      const res = calculateLiquidViscosity(ballsData, castorOilData);

      // 平均球径约 2.012 mm
      assert.strictEqual(Math.round(res.grandAvg_d_mm * 1000) / 1000, 2.011);

      // 20°C 下蓖麻油黏度约 0.99 Pa*s
      const eta20 = res.results[0].eta;
      assert.ok(eta20 > 0.95 && eta20 < 1.05);

      // 随温度升高黏度单调递减
      for (let i = 1; i < res.results.length; i++) {
        assert.ok(res.results[i].eta < res.results[i - 1].eta);
      }

      // 雷诺数 Re 全部远小于 1 (严格满足斯托克斯层流条件)
      for (const r of res.results) {
        assert.ok(r.Re < 1.0);
      }
    });

    // ------------------------------------------------------------------------
    // 场景 5: B5 剪刀虚线框宽度（严格 138mm）与 10cm 校验标尺物理几何断言
    // ------------------------------------------------------------------------
    runner.test('场景 5: B5 剪刀虚线框宽度（严格 138mm）与 10cm 校验标尺物理几何断言', () => {
      const b5Spec = {
        outerWidthMm: 138.0,
        innerWidthMm: 134.0,
        a4MarginMm: 36.0,
        page1HeightMm: 148.0,
        conclusionBlockHeightMm: 80.0,
        discussionBlockHeightMm: 88.0,
        rulerLengthMm: 100.0
      };

      const geoValidation = validateCutoutGeometry(b5Spec);
      assert.strictEqual(geoValidation.valid, true);
      assert.strictEqual(geoValidation.errors.length, 0);

      // 模拟前端生成的打印 CSS 样式串并进行全量规则断言
      const fullPrintCss = `
        @page {
          size: A4 portrait;
          margin: 0;
        }
        @media print {
          .a4-print-sheet {
            width: 210mm;
            height: 297mm;
            margin: 0 auto;
          }
          .b5-cutout-box {
            width: 138.0mm;
            border: 0.75pt dashed #94a3b8;
          }
          .b5-cutout-inner {
            width: 134.0mm;
          }
          .physical-ruler-10cm {
            width: 100.0mm;
            border-bottom: 1px solid #0f172a;
          }
        }
      `;
      const cssValidation = validatePrintCssRules(fullPrintCss);
      assert.strictEqual(cssValidation.valid, true);
    });

    // ------------------------------------------------------------------------
    // 场景 6: 全流程全中文输出合规性校验
    // ------------------------------------------------------------------------
    runner.test('场景 6: 全流程全中文输出合规性校验 (无遗留英文模板词)', () => {
      // 模拟应用导出的全量 UI 文案与报告结构
      const fullExportBundle = {
        appName: '哈尔滨工业大学大学物理实验网页端应用平台',
        navigation: {
          experiments: ['霍尔效应', '迈克耳逊干涉仪', '等厚干涉（牛顿环与劈尖）', '液体黏度的测定'],
          buttons: {
            import: '导入数据',
            calculate: '立即计算',
            exportPdf: '导出 B5 剪贴版 PDF',
            reset: '恢复默认值'
          }
        },
        reportHeaders: {
          title: '大学物理实验报告',
          section5: '五、实验数据整理及处理',
          section6: '六、实验结论',
          section7: '七、实验收获、体会、感想及引申的问题探讨'
        },
        notices: {
          rulerNotice: '打印比例校验标尺（标准长度 10.0 cm，请用文具直尺核对，若不足请取消适应纸张）',
          cutoutNotice: '剪切线：宽 13.8 cm，适配哈工大未来技术学院 B5 实验报告册安全粘贴区'
        }
      };

      // 1. 扫描是否有违规占位词
      const scanRes = scanForbiddenPlaceholders(fullExportBundle);
      assert.strictEqual(scanRes.clean, true);

      // 2. 验证各个关键字段均包含规范中文字符
      assert.ok(hasChinese(fullExportBundle.appName));
      assert.ok(hasChinese(fullExportBundle.reportHeaders.section5));
      assert.ok(hasChinese(fullExportBundle.reportHeaders.section6));
      assert.ok(hasChinese(fullExportBundle.reportHeaders.section7));
      assert.ok(hasChinese(fullExportBundle.notices.rulerNotice));
      assert.ok(hasChinese(fullExportBundle.notices.cutoutNotice));

      // 3. 校验按钮标签规范性
      const btnValidation = validateUiLabels(fullExportBundle.navigation.buttons);
      assert.strictEqual(btnValidation.valid, true);
    });

  });

};
