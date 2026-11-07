/**
 * 科学计算与统计引擎单元测试 (Math Engine Unit Tests)
 */

const assert = require('node:assert/strict');
const {
  linearRegression,
  differenceMethod,
  besselUncertaintyA,
  bUncertainty,
  combinedUncertainty
} = require('../helpers/reference_oracle.js');

module.exports = function runMathEngineTests(runner) {
  runner.suite('科学计算微内核算法单元测试', () => {

    runner.test('最小二乘法：标准直线精确拟合斜率与截距', () => {
      // y = 2x + 1
      const pts = [
        { x: 1, y: 3 },
        { x: 2, y: 5 },
        { x: 3, y: 7 },
        { x: 4, y: 9 },
        { x: 5, y: 11 }
      ];
      const res = linearRegression(pts);
      assert.strictEqual(Math.round(res.slope * 1000) / 1000, 2);
      assert.strictEqual(Math.round(res.intercept * 1000) / 1000, 1);
      assert.strictEqual(Math.round(res.rSquared * 1000) / 1000, 1);
      assert.strictEqual(Math.round(res.rmse * 1000) / 1000, 0);
    });

    runner.test('最小二乘法：含散点相关系数与 RMSE 计算', () => {
      const pts = [
        { x: 0, y: 1.1 },
        { x: 1, y: 1.9 },
        { x: 2, y: 3.2 },
        { x: 3, y: 3.8 },
        { x: 4, y: 5.1 }
      ];
      const res = linearRegression(pts);
      assert.ok(res.slope > 0.95 && res.slope < 1.05, '斜率应接近 1.0');
      assert.ok(res.intercept > 0.9 && res.intercept < 1.2, '截距应接近 1.1');
      assert.ok(res.rSquared > 0.98, 'R方应大于 0.98');
      assert.ok(res.rmse < 0.2, 'RMSE 应小于 0.2');
    });

    runner.test('最小二乘法：垂直线异常保护', () => {
      const pts = [
        { x: 2, y: 1 },
        { x: 2, y: 2 },
        { x: 2, y: 3 }
      ];
      const res = linearRegression(pts);
      assert.strictEqual(res.isVertical, true);
      assert.strictEqual(res.slope, Infinity);
    });

    runner.test('逐差法：标准等差数列逐差均值', () => {
      // 6项: [10, 20, 30, 40, 50, 60], m = 3
      // diffs: 40-10=30, 50-20=30, 60-30=30
      const series = [10, 20, 30, 40, 50, 60];
      const res = differenceMethod(series);
      assert.strictEqual(res.m, 3);
      assert.deepStrictEqual(res.diffs, [30, 30, 30]);
      assert.strictEqual(res.mean, 30);
    });

    runner.test('贝塞尔公式：样本方差与算术平均值标准差计算', () => {
      // 数据: [10.0, 10.2, 9.8, 10.1, 9.9], 均值 10.0
      const vals = [10.0, 10.2, 9.8, 10.1, 9.9];
      const res = besselUncertaintyA(vals);
      assert.strictEqual(res.mean, 10.0);
      // sum((x-10)^2) = 0.04 + 0.04 + 0.01 + 0.01 = 0.10
      // s = sqrt(0.10 / 4) = sqrt(0.025) ≈ 0.15811
      // uA = s / sqrt(5) = sqrt(0.005) ≈ 0.07071
      assert.ok(Math.abs(res.s - Math.sqrt(0.025)) < 1e-6);
      assert.ok(Math.abs(res.uA - Math.sqrt(0.005)) < 1e-6);
    });

    runner.test('B 类仪器不确定度：均匀分布除以根号3', () => {
      const delta = 0.01;
      const uB = bUncertainty(delta);
      const expected = 0.01 / Math.sqrt(3);
      assert.ok(Math.abs(uB - expected) < 1e-9);
    });

    runner.test('合成标准不确定度：勾股定理合成', () => {
      const uA = 3.0;
      const uB = 4.0;
      const uc = combinedUncertainty(uA, uB);
      assert.strictEqual(uc, 5.0);
    });

  });
};
