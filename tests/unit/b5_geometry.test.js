/**
 * B5 剪贴几何与打印规格单元测试 (B5 Geometry Unit Tests)
 */

const assert = require('node:assert/strict');
const {
  B5_GEOMETRY_CONTRACT,
  validateCutoutGeometry,
  validatePrintCssRules
} = require('../helpers/geometry_checker.js');

module.exports = function runB5GeometryTests(runner) {
  runner.suite('B5 剪贴版几何契约单元测试', () => {

    runner.test('标准合规尺寸断言：外框 138mm，内宽 134mm，A4 边距 36mm', () => {
      const validDimensions = {
        outerWidthMm: 138.0,
        innerWidthMm: 134.0,
        a4MarginMm: 36.0,
        page1HeightMm: 148.0,
        conclusionBlockHeightMm: 80.0,
        discussionBlockHeightMm: 88.0,
        rulerLengthMm: 100.0
      };
      const res = validateCutoutGeometry(validDimensions);
      assert.strictEqual(res.valid, true);
      assert.strictEqual(res.errors.length, 0);
    });

    runner.test('宽度超标拦截：宽度设为 145mm 侵入装订线应报警', () => {
      const badWidth = {
        outerWidthMm: 145.0
      };
      const res = validateCutoutGeometry(badWidth);
      assert.strictEqual(res.valid, false);
      assert.ok(res.errors[0].includes('138.0mm'));
    });

    runner.test('第 1 页高度溢出拦截：高度达到 190mm 遮盖页码应报警', () => {
      const overflowPage1 = {
        page1HeightMm: 190.0
      };
      const res = validateCutoutGeometry(overflowPage1);
      assert.strictEqual(res.valid, false);
      assert.ok(res.errors[0].includes('185.0mm'));
    });

    runner.test('标尺长度缩放拦截：标尺若因缩放变为 95mm 应断言失败', () => {
      const badRuler = {
        rulerLengthMm: 95.0
      };
      const res = validateCutoutGeometry(badRuler);
      assert.strictEqual(res.valid, false);
      assert.ok(res.errors[0].includes('100.0mm'));
    });

    runner.test('CSS 打印规则完整性断言：必须声明 A4 portrait 与 138mm', () => {
      const sampleCss = `
        @page { size: A4 portrait; margin: 0; }
        .b5-cutout-box { width: 138.0mm; }
        .physical-ruler-10cm { width: 100.0mm; }
      `;
      const res = validatePrintCssRules(sampleCss);
      assert.strictEqual(res.valid, true);
    });

    runner.test('CSS 打印规则缺失断言：缺失 A4 规则时应报错', () => {
      const incompleteCss = `
        .b5-cutout-box { width: 138.0mm; }
      `;
      const res = validatePrintCssRules(incompleteCss);
      assert.strictEqual(res.valid, false);
      assert.ok(res.errors.length > 0);
    });

  });
};
