/**
 * 哈工大大物实验平台 - Fireworks Implementer A 四门实验全量集成验证
 * 验证对象:
 * 1. 动态磁滞回线 (hysteresis-loop)
 * 2. 探究乐音 (musical-sound)
 * 3. 自组显微镜和望远镜 (microscope-telescope)
 * 4. 密立根油滴法测定电子电荷 (millikan-oil-drop)
 */

const { createServer } = require('vite');
const assert = require('node:assert/strict');

async function testAll() {
  console.log('启动 Vite 运行时环境以测试 Fireworks Implementer A 的 4 门实验插件...');
  const server = await createServer({
    server: { middlewareMode: true },
    appType: 'custom',
  });

  try {
    // 1. 动态磁滞回线
    console.log('\n▶ 测试 1: 动态磁滞回线 (hysteresis-loop)');
    const modHysteresis = await server.ssrLoadModule('./src/experiments/hysteresis-loop/index.ts');
    const hPlugin = modHysteresis.hysteresisLoopPlugin;
    assert.strictEqual(hPlugin.id, 'hysteresis-loop');
    assert.strictEqual(hPlugin.category, '电磁');
    assert.strictEqual(hPlugin.experimentNumber, 33);
    assert.strictEqual(hPlugin.tables.length, 2);
    assert.ok(hPlugin.questions.length >= 4);

    const hResult = hPlugin.calculate(hPlugin.defaultData);
    assert.ok(hResult.values.KH > 500 && hResult.values.KH < 1200, 'KH 范围正常');
    assert.ok(hResult.values.KB > 10 && hResult.values.KB < 25, 'KB 范围正常');
    assert.ok(hResult.values.Bs > 1.0 && hResult.values.Bs < 2.0, 'Bs 范围正常');
    assert.ok(hResult.values.Br > 0.5 && hResult.values.Br < 1.5, 'Br 范围正常');
    assert.ok(hResult.values.Hc > 20 && hResult.values.Hc < 60, 'Hc 范围正常');
    assert.ok(hResult.values.wh > 50 && hResult.values.wh < 200, 'wh 损耗功正常');
    assert.ok(hResult.steps.length >= 4, 'KaTeX 分步推导不少于 4 步');
    assert.ok(hResult.plots.length >= 2, '包含基本磁化曲线与动态磁滞回线');
    assert.ok(hResult.uncertainties.length >= 2, '包含不确定度评定');
    assert.ok(hResult.conclusions.length >= 3, '包含结论');
    console.log('  ✔ 动态磁滞回线全部断言通过！');

    // 2. 探究乐音
    console.log('\n▶ 测试 2: 探究乐音 (musical-sound)');
    const modMusical = await server.ssrLoadModule('./src/experiments/musical-sound/index.ts');
    const mPlugin = modMusical.musicalSoundPlugin;
    assert.strictEqual(mPlugin.id, 'musical-sound');
    assert.strictEqual(mPlugin.category, '力热');
    assert.strictEqual(mPlugin.experimentNumber, 17);
    assert.strictEqual(mPlugin.tables.length, 3);
    assert.ok(mPlugin.questions.length >= 4);

    const mResult = mPlugin.calculate(mPlugin.defaultData);
    assert.ok(mResult.rhoL1 > 0.4 && mResult.rhoL1 < 0.6, '表1线密度 ρL1 约为 0.48 g/m');
    assert.ok(mResult.rhoL2 > 0.4 && mResult.rhoL2 < 0.6, '表2线密度 ρL2 约为 0.48 g/m');
    assert.ok(mResult.rhoLAvg > 0.4 && mResult.rhoLAvg < 0.6, '综合平均线密度正常');
    assert.ok(mResult.fitT.r > 0.999, 'f ~ √T 线性相关系数高');
    assert.ok(mResult.fitL.r > 0.999, 'f ~ 1/L 线性相关系数高');
    assert.ok(mResult.steps.length >= 4, 'KaTeX 分步推导不少于 4 步');
    assert.ok(mResult.plots.length >= 2, '包含 f~√T, f~1/L 图表');
    assert.ok(mResult.uncertainties.length >= 2, '包含不确定度评定');
    assert.ok(mResult.conclusions.length >= 3, '包含结论');
    console.log('  ✔ 探究乐音全部断言通过！');

    // 3. 自组显微镜和望远镜
    console.log('\n▶ 测试 3: 自组显微镜和望远镜 (microscope-telescope)');
    const modScope = await server.ssrLoadModule('./src/experiments/microscope-telescope/index.ts');
    const sPlugin = modScope.microscopeTelescopePlugin;
    assert.strictEqual(sPlugin.id, 'microscope-telescope');
    assert.strictEqual(sPlugin.category, '光学');
    assert.strictEqual(sPlugin.experimentNumber, 21);
    assert.strictEqual(sPlugin.tables.length, 2);
    assert.ok(sPlugin.questions.length >= 4);

    const sResult = sPlugin.calculate(sPlugin.defaultData);
    assert.ok(Math.abs(sResult.gammaKTheo - 3.333) < 0.01, '开普勒理论放大率 3.333');
    assert.ok(Math.abs(sResult.gammaKMeas - 3.333) < 0.01, '开普勒实测放大率 3.333');
    assert.ok(Math.abs(sResult.gammaGTheo - 3.333) < 0.01, '伽利略理论放大率 3.333');
    assert.ok(Math.abs(sResult.gammaGMeas - 3.267) < 0.01, '伽利略实测放大率 3.267');
    assert.ok(sResult.fitMicroscope.r > 0.999, '显微镜放大率与光学间隔线性拟合 R > 0.999');
    assert.ok(sResult.steps.length >= 4, 'KaTeX 分步推导不少于 4 步');
    assert.ok(sResult.plots.length >= 2, '包含望远镜/显微镜拟合图');
    assert.ok(sResult.uncertainties.length >= 2, '包含不确定度评定');
    assert.ok(sResult.conclusions.length >= 3, '包含结论');
    console.log('  ✔ 自组显微镜和望远镜全部断言通过！');

    // 4. 密立根油滴法测定电子电荷
    console.log('\n▶ 测试 4: 密立根油滴法测定电子电荷 (millikan-oil-drop)');
    const modMillikan = await server.ssrLoadModule('./src/experiments/millikan-oil-drop/index.ts');
    const millikanPlugin = modMillikan.millikanOilDropPlugin;
    assert.strictEqual(millikanPlugin.id, 'millikan-oil-drop');
    assert.strictEqual(millikanPlugin.category, '近代');
    assert.strictEqual(millikanPlugin.experimentNumber, 45);
    assert.strictEqual(millikanPlugin.tables.length, 1);
    assert.ok(millikanPlugin.questions.length >= 4);

    const millikanResult = millikanPlugin.calculate(millikanPlugin.defaultData);
    assert.ok(millikanResult.values.eAvg > 1.58 && millikanResult.values.eAvg < 1.63, '元电荷 eAvg 接近 1.602');
    assert.ok(millikanResult.relErrorTotal < 0.5, '元电荷综合相对误差小于 0.5%');
    assert.strictEqual(millikanResult.processedRows.length, 5, '处理 5 颗油滴');
    for (let i = 0; i < millikanResult.processedRows.length; i++) {
      const row = millikanResult.processedRows[i];
      assert.strictEqual(row.nElectrons, i + 2, '油滴电荷量子数阶梯分布: n = 2, 3, 4, 5, 6');
      assert.ok(row.relError < 0.2, '单次油滴误差小于 0.2%');
    }
    assert.ok(millikanResult.steps.length >= 4, 'KaTeX 分步推导不少于 4 步');
    assert.ok(millikanResult.plots.length >= 2, '包含电荷量子化阶梯分布图');
    assert.ok(millikanResult.uncertainties.length >= 2, '包含不确定度评定');
    assert.ok(millikanResult.conclusions.length >= 3, '包含结论');
    console.log('  ✔ 密立根油滴法全部断言通过！');

    console.log('\n' + '='.repeat(60));
    console.log('★ 全部 4 门薪火实验插件运行时端到端真实测试 100% 成功通过！★');
    console.log('='.repeat(60));
  } finally {
    await server.close();
  }
}

testAll().catch((err) => {
  console.error('测试失败:', err);
  process.exit(1);
});
