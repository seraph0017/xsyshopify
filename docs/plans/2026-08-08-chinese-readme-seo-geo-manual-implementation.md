# 中文 README 与 SEO/GEO 操作手册实施计划

> **For Claude:** REQUIRED SUB-SKILL: Use superpowers:executing-plans to implement this plan task-by-task.

**Goal:** 将仓库 README 全量中文化，并交付一套与当前发布门禁一致、可直接执行的 SEO/GEO 快速指南和完整运营 SOP。

**Architecture:** 根 README 负责项目与开发入口，现有用户手册提供 SEO/GEO 快速流程，新操作手册承载端到端 SOP，策略文档保留方法论。代码、Obsidian 项目资料和官方平台文档分别作为实现事实、业务上下文和外部规则来源。

**Tech Stack:** Markdown、Next.js 16 App Router metadata/robots/sitemap、Schema.org JSON-LD、Google Search Console、Bing Webmaster Tools/IndexNow。

---

### Task 1: 核对内部事实与官方资料

**Files:**
- Read: `README.md`
- Read: `docs/user-guide.md`
- Read: `docs/strategy/seo-geo-plan.md`
- Read: `src/lib/seo.ts`
- Read: `src/app/robots.ts`
- Read: `src/app/sitemap.ts`

**Steps:**

1. 从 Obsidian 项目交接、Headless 清单和既有调研提取与当前家具站相关的稳定事实。
2. 用仓库代码复核 prototype/production、canonical、robots、sitemap 和 JSON-LD 门禁。
3. 检索 Google Search Central、Bing Webmaster/IndexNow、OpenAI crawler 等官方公开资料。
4. 记录标题、URL、页面更新状态和 `2026-08-08` 访问日期；将平台事实与项目建议分开。

### Task 2: 中文化根 README

**Files:**
- Modify: `README.md`

**Steps:**

1. 保留现有结构和所有已验证技术信息，将叙述、表头和命令说明改为自然中文。
2. 保留命令、路径、路由、环境变量、产品名和代码标识原文。
3. 增加 SEO/GEO 操作手册入口，区分用户手册、运营 SOP 和策略文档。
4. 核对 Node/pnpm/Playwright 前置、22 个构建页面和测试基线。

### Task 3: 编写 SEO/GEO 完整操作手册

**Files:**
- Create: `docs/seo-geo-operations-guide.md`

**Steps:**

1. 编写适用范围、角色职责、prototype 边界和发布前置。
2. 编写关键词/主题研究、页面地图、内容 brief、页面制作和 claim ledger SOP。
3. 编写站点/SKU/内容/服务证据准入，以及 Offer 尚未实现的边界。
4. 编写 production 配置、构建、canonical、robots、sitemap 和 Schema 核验命令。
5. 编写 GSC、Bing/IndexNow 提交、上线后索引检查和问题处理流程。
6. 编写 GEO 的实体一致性、answer-first、事实表、来源、更新时间、AI crawler 与效果抽样规则。
7. 添加首日/首周/每周/每月节奏、KPI、故障排查、模板、发布清单和官方来源。

### Task 4: 扩展用户手册与文档导航

**Files:**
- Modify: `docs/user-guide.md`
- Modify: `docs/README.md`
- Modify: `docs/strategy/seo-geo-plan.md`

**Steps:**

1. 在用户手册增加 SEO/GEO 快速操作章节，提供最小发布流程和详细 SOP 链接。
2. 在文档索引增加操作手册，并明确 README、用户手册、操作手册和策略文档职责。
3. 在策略文档增加操作手册交叉链接，保持方法论与执行说明分离。
4. 检查标题层级、术语、中文可读性和链接。

### Task 5: 验证与独立复审

**Files:**
- Modify: findings identified by review

**Steps:**

1. 运行 Markdown 相对链接检查和 `git diff --check`。
2. 对官方来源执行 HTTP 可达性检查，并记录重定向后的正式 URL。
3. 运行 `pnpm test` 与 `pnpm lint`，确认文档变更没有破坏仓库基线。
4. 分别请求技术准确性、SEO/GEO 契约、中文可用性 agent 复审。
5. 修复全部 Critical、Important 和 Minor，重复复审直至清零。

### Task 6: 提交、推送与交接

**Files:**
- Modify: `工作/项目与方案/xsyshopify/项目交接.md`
- Create or merge: `AI/Outputs/Session Digests/2026-08-08 xsyshopify 中文 README 与 SEO GEO 手册.md`

**Steps:**

1. 提交 README、手册、索引、策略链接和实施记录。
2. 推送 `feat/storefront` 到 `origin`，核对本地与远端 HEAD。
3. 更新 Obsidian 项目交接和 Session Digest，并执行 memory consolidate。
4. 运行 Vault 本地快照；保留远端非快进状态，不执行强推。

## Completion Record

- 2026-08-08：Tasks 1-4 已完成。根 README 已中文化；用户手册已增加快速指南；完整操作 SOP、文档导航和策略交叉链接已完成。
- 首轮验证：`pnpm test` 通过 16 个文件、83 个测试；`pnpm lint`、`git diff --check`、Markdown 相对链接和首批官方 URL 可达性检查通过。
- 首轮三路复审：中文可用性清零；技术和 SEO/GEO 复审指出 Product evidence、参数页 noindex、Product rich result、GSC property 和 Bing AI Performance 表述需修正。
- 最终验证：`pnpm test` 通过 16 个文件、83 个测试；`pnpm lint`、`pnpm build`、`git diff --check` 通过；37 个 Markdown 相对链接全部存在；14 个官方来源均返回 HTTP 200。
- 最终三路复审：技术准确性、SEO/GEO 官方规则、中文可用性与导航均为 Critical 0、Important 0、Minor 0。
