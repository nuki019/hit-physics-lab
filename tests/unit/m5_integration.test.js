/**
 * Milestone 5: 全量平台集成与发布验收测试套件 (M5 Platform Integration & Release Tests)
 */

const assert = require('node:assert/strict');
const fs = require('node:fs');
const path = require('node:path');

module.exports = function runM5IntegrationTests(runner) {
  runner.suite('M5: 全量平台集成与发布验收测试', () => {
    const rootDir = path.resolve(__dirname, '../../');

    runner.test('TC-M5-01: 全书 65 实验目录索引与 +15 页码偏移模型验证', () => {
      const catalogPath = path.join(rootDir, 'scripts/catalog_index.json');
      assert.ok(fs.existsSync(catalogPath), 'catalog_index.json 必须存在');
      const data = JSON.parse(fs.readFileSync(catalogPath, 'utf8'));

      assert.strictEqual(data.book_meta.total_experiments, 65, '全书实验总数必须为 65');
      assert.strictEqual(data.book_meta.page_offset, 15, 'PDF 页码偏移必须为 +15');
      assert.strictEqual(data.experiments.length, 65, '实验列表项数必须为 65');

      // 验证三大主体章节分布
      const ch2 = data.experiments.filter(e => e.chapter.includes('第二章'));
      const ch3 = data.experiments.filter(e => e.chapter.includes('第三章'));
      const ch4 = data.experiments.filter(e => e.chapter.includes('第四章'));
      assert.strictEqual(ch2.length, 25, '第二章基础性实验应为 25 门');
      assert.strictEqual(ch3.length, 21, '第三章综合性实验应为 21 门');
      assert.strictEqual(ch4.length, 19, '第四章近现代实验应为 19 门');
    });

    runner.test('TC-M5-02: 实验五《液体黏度的测定》模块结构与插件契约完整性', () => {
      const viscDir = path.join(rootDir, 'src/experiments/liquid-viscosity');
      assert.ok(fs.existsSync(viscDir), 'liquid-viscosity 目录必须存在');
      const requiredFiles = ['definition.ts', 'calculator.ts', 'questions.ts', 'defaultData.ts', 'index.ts'];
      for (const file of requiredFiles) {
        assert.ok(fs.existsSync(path.join(viscDir, file)), `${file} 必须存在`);
      }

      const indexContent = fs.readFileSync(path.join(viscDir, 'index.ts'), 'utf8');
      assert.ok(indexContent.includes('liquidViscosityPlugin'), '必须导出 liquidViscosityPlugin');
    });

    runner.test('TC-M5-03: 主平台聚合导出 allExperiments 包含 11 门完整交互式实验插件', () => {
      const expIndex = path.join(rootDir, 'src/experiments/index.ts');
      assert.ok(fs.existsSync(expIndex), 'src/experiments/index.ts 必须存在');
      const content = fs.readFileSync(expIndex, 'utf8');

      const expectedPlugins = [
        'hallEffectPlugin',
        'michelsonPlugin',
        'newtonRingWedgePlugin',
        'liquidViscosityPlugin',
        'hysteresisLoopPlugin',
        'musicalSoundPlugin',
        'microscopeTelescopePlugin',
        'millikanOilDropPlugin',
        'photoelectricPlanckPlugin',
        'holographyPlugin',
        'opticalFiberPlugin'
      ];

      for (const p of expectedPlugins) {
        assert.ok(content.includes(p), `allExperiments 必须聚合导出 ${p}`);
      }
    });

    runner.test('TC-M5-04: 主应用 App.tsx 移除降级备用代码并挂载 CatalogModal 模态框', () => {
      const appFile = path.join(rootDir, 'src/App.tsx');
      const content = fs.readFileSync(appFile, 'utf8');

      // 验证降级备用代码已被清除
      assert.ok(!content.includes('VISCOSITY_FALLBACK_TABLE'), '降级备用表格定义必须被清除');
      assert.ok(!content.includes('VISCOSITY_FALLBACK_PLUGIN'), '降级备用插件定义必须被清除');

      // 验证 CatalogModal 已经挂载
      assert.ok(content.includes('CatalogModal'), 'App.tsx 必须挂载 CatalogModal 组件');
      assert.ok(content.includes('isCatalogOpen'), 'App.tsx 必须包含 isCatalogOpen 状态管理');
    });

    runner.test('TC-M5-05: 离线构建产物 dist/index.html 满足纯静态相对路径规范', () => {
      const distHtml = path.join(rootDir, 'dist/index.html');
      assert.ok(fs.existsSync(distHtml), '生产构建产物 dist/index.html 必须存在');
      const content = fs.readFileSync(distHtml, 'utf8');

      // 验证纯静态相对路径（双击即可运行）
      assert.ok(content.includes('./assets/'), '资源路径必须以 ./ 开头以支持纯离线双击运行');
      assert.ok(!content.includes('src="/assets/'), '禁止包含绝对根路径引用 src="/assets/"');
      assert.ok(!content.includes('href="/assets/'), '禁止包含绝对根路径引用 href="/assets/"');
    });

    runner.test('TC-M5-06: 用户与打印指引手册 README.md 规范与全中文合规性', () => {
      const readmePath = path.join(rootDir, 'README.md');
      assert.ok(fs.existsSync(readmePath), '项目根目录 README.md 必须存在');
      const content = fs.readFileSync(readmePath, 'utf8');

      assert.ok(content.includes('哈尔滨工业大学大学物理实验网页端应用平台'), '必须包含项目正式名称');
      assert.ok(content.includes('138.0'), '必须详细说明 138.0mm B5 剪切规格');
      assert.ok(content.includes('100.0'), '必须详细说明 100.0mm 校验标尺');
      assert.ok(content.includes('extract_pipeline.py'), '必须包含教材按需提取管道使用指南');
      assert.ok(content.includes('65'), '必须包含全书 65 门实验说明');
      assert.ok(content.includes('13'), '必须包含本学期 13 门大物实验矩阵');
    });
  });
};
