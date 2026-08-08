# 中文 README 与 SEO/GEO 操作手册设计

状态：2026-08-08 已确认。

## 目标

让中文开发者、业务负责人和内容运营人员在不阅读源码的情况下，能够理解项目定位、启动本地原型，并按证据门禁完成 SEO/GEO 内容准备、上线核验、搜索平台提交和持续优化。

## 信息架构

采用三级文档结构：

1. 根 `README.md`：全量中文，面向开发者和项目负责人，说明定位、范围、启动、命令、路由、发布模式、目录和验证基线。
2. `docs/user-guide.md`：保留顾客流程和运营入口，新增 SEO/GEO 快速操作章节，说明当前 prototype 边界、最小发布步骤、上线后检查及详细手册链接。
3. `docs/seo-geo-operations-guide.md`：面向 SEO、内容、商品和站点运营人员的完整 SOP；策略原理仍由 `docs/strategy/seo-geo-plan.md` 承担，操作手册负责“谁在什么阶段做什么、怎么验收”。

`docs/README.md` 增加新手册入口，并明确各文档职责，避免策略文档、用户手册和操作手册重复堆叠。

## SEO/GEO 手册结构

1. 角色与事实来源：Business、Product/Supplier、Content/SEO、Engineering、Analytics 的输入和责任。
2. 当前状态：prototype 为 `noindex,follow`、空 sitemap、零实体 JSON-LD；不得提前向搜索平台提交。
3. 关键词与页面地图：从家具类型、空间任务、材料构造和定制意图建立查询簇，并映射到唯一主页面。
4. 页面生产 SOP：搜索意图、title/description/H1、answer-first 摘要、原生 HTML 事实表、限制、图片 alt、内部链接、证据记录。
5. 商品与内容证据：站点、SKU、内容、服务及未来 Offer 的准入条件；明确 AI 图和原型价格不构成交易证据。
6. 技术发布：环境变量、canonical、robots、sitemap、Schema、筛选页和搜索页门禁，以及 production 构建负向测试。
7. 搜索平台接入：Google Search Console、Bing Webmaster Tools/IndexNow 的所有权验证、sitemap 提交、URL 检查和问题处理。
8. GEO：以可抓取、可引用、可核验的 HTML 为核心，覆盖实体一致性、答案前置、事实/未知分离、来源和更新时间；不把 `llms.txt` 或单一 AI crawler 配置当作排名保证。
9. 发布后节奏：首日、首周、每周、每月和内容变更触发检查。
10. KPI 与故障处理：曝光、点击、索引、富结果、品牌/非品牌查询、AI 引用抽样、合格 RFQ 和内容辅助转化。
11. 检查表与模板：页面 brief、claim ledger、上线清单、月度复盘和来源表。

## 资料原则

- 仓库代码和测试是当前行为的事实源。
- Obsidian 项目交接、Headless 准备清单与既有调研用于补充业务上下文。
- 搜索引擎和平台行为以 Google、Bing、OpenAI 等官方公开资料为主，并记录访问日期。
- 将事实、项目建议和仍待验证的假设分开；不声称某项 GEO 技术可保证排名或引用。

## 验收

- README 主体为中文，命令、环境变量、路径和代码标识保持原文。
- 用户手册包含可直接执行的 SEO/GEO 快速流程，并链接完整 SOP。
- 完整 SOP 能让新运营人员从资料准备走到发布、提交、监测和复盘。
- 所有相对链接存在，发布契约与 `src/lib/seo.ts`、`src/app/robots.ts`、`src/app/sitemap.ts` 一致。
- 官方外链可访问，来源包含标题、URL、发布/更新状态和访问日期。
- 文档通过独立技术、SEO/GEO 和可用性复审，Critical、Important、Minor 均清零后提交推送。
