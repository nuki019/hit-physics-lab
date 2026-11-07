/**
 * 哈工大大物实验平台独立测试运行器 (Independent Test Runner)
 * 纯 Node.js 原生实现，零第三方外部依赖，跨平台秒级执行
 */

const path = require('path');

class TestRunner {
  constructor() {
    this.currentSuite = '';
    this.totalTests = 0;
    this.passedTests = 0;
    this.failedTests = 0;
    this.skippedTests = 0;
    this.failures = [];
    this.suiteStats = new Map();
    this.startTime = 0n;
  }

  suite(name, fn) {
    this.currentSuite = name;
    if (!this.suiteStats.has(name)) {
      this.suiteStats.set(name, { total: 0, passed: 0, failed: 0 });
    }
    console.log(`\n\x1b[1m\x1b[36m▶ 测试套件：${name}\x1b[0m`);
    fn();
  }

  test(name, fn) {
    this.totalTests++;
    const suiteStat = this.suiteStats.get(this.currentSuite);
    if (suiteStat) suiteStat.total++;

    const testStart = process.hrtime.bigint();
    try {
      fn();
      const testEnd = process.hrtime.bigint();
      const durationMs = (Number(testEnd - testStart) / 1e6).toFixed(2);
      this.passedTests++;
      if (suiteStat) suiteStat.passed++;
      console.log(`  \x1b[32m✔\x1b[0m \x1b[90m[通过]\x1b[0m ${name} \x1b[90m(${durationMs} ms)\x1b[0m`);
    } catch (err) {
      const testEnd = process.hrtime.bigint();
      const durationMs = (Number(testEnd - testStart) / 1e6).toFixed(2);
      this.failedTests++;
      if (suiteStat) suiteStat.failed++;
      console.log(`  \x1b[31m✖\x1b[0m \x1b[31m[失败]\x1b[0m ${name} \x1b[90m(${durationMs} ms)\x1b[0m`);
      console.log(`    \x1b[31m错误详情: ${err.message || err}\x1b[0m`);
      this.failures.push({
        suite: this.currentSuite,
        test: name,
        error: err
      });
    }
  }

  printSummary() {
    const totalDuration = (Number(process.hrtime.bigint() - this.startTime) / 1e6).toFixed(2);
    console.log('\n' + '='.repeat(70));
    console.log(`\x1b[1m哈工大大物实验网页端应用平台 - 测试执行诊断汇总报告\x1b[0m`);
    console.log('='.repeat(70));

    console.log(`\n\x1b[1m各分层与特性用例统计：\x1b[0m`);
    for (const [suiteName, stat] of this.suiteStats.entries()) {
      const rate = stat.total > 0 ? ((stat.passed / stat.total) * 100).toFixed(1) : 100.0;
      const statusColor = stat.failed === 0 ? '\x1b[32m' : '\x1b[31m';
      console.log(`  - ${suiteName.padEnd(42, ' ')} : ${statusColor}${stat.passed}/${stat.total} 通过 (${rate}%)\x1b[0m`);
    }

    console.log('\n' + '-'.repeat(70));
    console.log(`\x1b[1m总计用例数\x1b[0m: ${this.totalTests}`);
    console.log(`\x1b[32m✔ 成功通过\x1b[0m: ${this.passedTests}`);
    console.log(`\x1b[31m✖ 失败用例\x1b[0m: ${this.failedTests}`);
    console.log(`\x1b[90m⏱ 执行总耗时\x1b[0m: ${totalDuration} ms`);

    const passRate = this.totalTests > 0 ? ((this.passedTests / this.totalTests) * 100).toFixed(2) : 100.0;
    console.log(`\x1b[1m综合通过率\x1b[0m: \x1b[32m${passRate}%\x1b[0m`);

    if (this.failures.length > 0) {
      console.log('\n\x1b[1m\x1b[31m失败用例追溯：\x1b[0m');
      this.failures.forEach((f, idx) => {
        console.log(`\n[${idx + 1}] 套件: ${f.suite}`);
        console.log(`    用例: ${f.test}`);
        console.log(`    异常: ${f.error.stack || f.error}`);
      });
    }

    console.log('='.repeat(70));
    const exitCode = this.failedTests > 0 ? 1 : 0;
    if (exitCode === 0) {
      console.log(`\x1b[1m\x1b[32m★ 端到端测试套件全量通过！标准退出状态码: 0 ★\x1b[0m\n`);
    } else {
      console.log(`\x1b[1m\x1b[31m⚠ 测试套件存在失败用例，标准退出状态码: 1 ⚠\x1b[0m\n`);
    }
    return exitCode;
  }
}

// 主入口
function main() {
  const runner = new TestRunner();
  runner.startTime = process.hrtime.bigint();

  console.log(`\x1b[1m\x1b[35m======================================================================\x1b[0m`);
  console.log(`\x1b[1m\x1b[35m  哈尔滨工业大学大学物理实验网页端应用平台 E2E 测试运行器启动         \x1b[0m`);
  console.log(`\x1b[1m\x1b[35m  Node 运行时: ${process.version} | 平台: ${process.platform}                       \x1b[0m`);
  console.log(`\x1b[1m\x1b[35m======================================================================\x1b[0m`);

  // 1. 核心算法与几何单元测试
  const runMathTests = require('./unit/math_engine.test.js');
  const runGeometryTests = require('./unit/b5_geometry.test.js');
  runMathTests(runner);
  runGeometryTests(runner);

  // 2. 4 层端到端黑盒测试
  const runTier1 = require('./e2e/tier1_feature_coverage.test.js');
  const runTier2 = require('./e2e/tier2_boundary_corner.test.js');
  const runTier3 = require('./e2e/tier3_cross_feature.test.js');
  const runTier4 = require('./e2e/tier4_real_workload.test.js');

  runTier1(runner);
  runTier2(runner);
  runTier3(runner);
  runTier4(runner);

  // 3. M5 全量平台集成与发布验收测试
  const runM5IntegrationTests = require('./unit/m5_integration.test.js');
  runM5IntegrationTests(runner);

  // 输出报告并以正确状态码退出
  const exitCode = runner.printSummary();
  process.exit(exitCode);
}

if (require.main === module) {
  main();
}

module.exports = TestRunner;
