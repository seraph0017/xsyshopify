<!-- BEGIN:nextjs-agent-rules -->

# This is NOT the Next.js you know

This version has breaking changes — APIs, conventions, and file structure may all differ from your training data. Read the relevant guide in `node_modules/next/dist/docs/` (resolved from this file's directory; in monorepos the `next` package may not be visible from the repo root) before writing any code. Heed deprecation notices.

This block is written and re-added by `next dev` — verify at `node_modules/next/dist/server/lib/generate-agent-files.js`. Removing it from a diff only re-creates the uncommitted change; committing it with your work keeps the tree clean.

<!-- END:nextjs-agent-rules -->

# TIDEFORM Project Instructions

本文件是 `xsyshopify` 仓库的项目级代理规则。它补充机器级规则；发生冲突时，优先遵守离目标文件更近、约束更具体的规则。`CLAUDE.md` 通过 `@AGENTS.md` 引用本文件，不要复制维护第二套规则。

## Communication

- 默认使用中文汇报，代码、命令、环境变量、路由和技术标识保持原文。
- 先说明结果，再说明关键改动、验证证据和剩余风险。
- 不把原型、推测、图片观感或供应商待确认信息写成已验证事实。

## Product Boundary

TIDEFORM 是铝型材骨架与海洋级板材表面共同构成的成品或可配置家具商店原型，不是裸铝型材、连接件或工业框架目录。

- 标准尺寸和饰面走商品详情、本地购物车及未来 Shopify Checkout 路径。
- 非标尺寸、颜色、布局、项目数量和特殊配送要求走 Custom Project RFQ。
- `Marine-grade panel / 海洋级板材` 是中性工作名称。供应商确认前，不扩写具体基材、厚度、封边、户外适用性、防水、承载、耐久、护理、认证或性能承诺。
- 当前本地购物车和页面价格是 prototype；Shopify 商品、库存、Checkout、支付、税费、运输和订单创建尚未连接。RFQ API 只校验输入并返回 prototype reference，附件只处理 metadata，不持久化 RFQ、不存储文件字节、不发送通知。

- 实现行为的权威顺序：当前代码与测试 > 仓库内操作文档 > 设计/计划记录 > 外部记忆或历史会话。
- 材料、商品、主体、交易和合规事实只以负责人和审核人均完成审核的 evidence/source record 为准；代码 fixture、测试 fixture、图片和原型文案永远不构成生产事实证据。

## Before Editing

1. 运行 `git status --short --branch`，识别并保护已有修改。
2. 用 `rg` / `rg --files` 定位实现、测试和文档，不凭文件名猜测。
3. 阅读目标模块及相邻测试；涉及 Next.js API 时先查本文件顶部要求的本地 Next.js 16 文档。
4. 涉及产品事实、SEO/GEO 或发布行为时，同时核对对应证据门禁和操作文档。
5. 保持改动范围与请求一致，不顺带重构、格式化或改写无关文件。

## Stack And Commands

- Next.js 16 App Router、React 19、TypeScript、pnpm 11。
- 包管理器及版本以 `package.json` 的 `packageManager` 字段为准；不要生成或提交 npm/yarn 锁文件。
- 支持的 Node.js 范围见 `README.md`；容器基线见 `Dockerfile`。

```bash
pnpm dev
pnpm test
pnpm lint
pnpm build
pnpm test:e2e
```

Playwright 默认访问 `http://127.0.0.1:3000`。复用已确认的本地或隔离 prototype 实例时显式设置，例如：

```bash
PLAYWRIGHT_BASE_URL=http://127.0.0.1:3200 pnpm test:e2e
```

不要假定端口属于当前工作树。复用前检查监听进程及其工作目录，防止测试命中另一棵 worktree、旧构建或线上环境。禁止对线上 production 运行会写入状态的完整 E2E；线上只执行明确设计为只读的 health/smoke 检查。

## Code Conventions

- 优先复用 `src/components` 和 `src/lib` 中的现有模式，只有确实降低复杂度时才新增抽象。
- Server Component 保持服务端；仅在状态、事件、浏览器 API 或客户端 Context 确有需要时添加 `"use client"`。
- 使用结构化数据和既有类型处理目录、购物车、RFQ、分析及发布状态，不用脆弱的字符串拼接替代现有模型。
- 使用 `@/` 路径别名和既有命名风格；图标使用当前 `lucide-react` 依赖。
- 可访问名称、label、键盘焦点、语义标题和状态公告属于功能契约，不因视觉调整删除。
- `next-env.d.ts` 由 Next.js 生成。确认变更由本次 dev/build 触发，且只在 `.next/dev/types` 与 `.next/types` 之间切换后，完成前恢复到仓库基线，不把该噪声混入功能改动。

## Frontend And Content

- 保持当前安静、实用、面向家具选购的视觉语言；不要把站点改成铝材工业目录或营销落地页。
- 不使用图片证明材料成分、结构细节、饰面准确性或性能。图片是概念/商品视觉，结构化事实来自经核对的数据记录。
- 响应式修改至少验证 `playwright.config.ts` 中的桌面配置和 Pixel 7 profile（当前 viewport `412x839`、screen `412x915`），检查溢出、裁切、重叠、边框、焦点和交互状态。
- 用户提供截图时，将截图作为复现证据；修复后在真实浏览器中对同一界面和状态做对照验证。
- 视觉修复必须检查 DOM/CSS 和真实截图；仅通过 build 不算完成。

## SEO, GEO And Evidence Gates

默认 `SITE_MODE=prototype`，必须保持 fail-closed：

- 全站 `noindex,follow`
- 空 sitemap
- 不输出实体 JSON-LD
- 不提交 Search Console、Bing Webmaster Tools 或 Merchant Center

production 采用两层门禁：环境门禁与完整的 operator-verified 站点身份共同开启 production、首页索引和站点级 Schema；内容和商品实体再分别通过自己的证据门禁。未通过实体门禁的页面仍可访问，但保持 `noindex,follow`、不进入 sitemap、不输出实体 Schema。不要通过硬编码、测试 fixture 或放宽校验绕过任何一层。当前没有交易和评价证据类型，不发布 `Offer`、`review`、`aggregateRating` 或商品 feed。修改 metadata、robots、sitemap、Schema 或商品证据逻辑时，必须阅读：

- `.env.example`
- `docs/seo-geo-operations-guide.md`
- `docs/strategy/seo-geo-plan.md`
- 对应的 `src/lib` 测试

## Testing

验证规模随风险增加：

- 纯 Markdown 文档：核对引用和相对链接，运行 `git diff --check`；只有文档声明代码行为时才补相应代码验证。
- 用户可见页面文案或窄范围样式：相关测试、真实页面验证、`pnpm lint`、`git diff --check`。
- 前端组件或交互 bug：先补回归测试，再运行相关 Vitest 和桌面/移动端 Playwright。
- 路由、共享状态、SEO 门禁或跨模块契约：`pnpm test`、`pnpm lint`、`pnpm build`、`pnpm test:e2e`。
- 部署脚本或容器运行时变更：运行仓库现有 deployment 测试、Shell/YAML/Compose 检查和受影响的应用验证，并验证真实容器健康状态。
- 纯 workflow 权限或供应链变更：运行 YAML、Action pin、权限和现有 workflow 契约测试；可行时执行远端 run，未执行的远端验证必须明确记录。

前端完成前至少确认：页面身份正确、非空白、没有框架错误层、没有相关应用 console error、目标交互产生预期状态变化。浏览器扩展自身日志需与应用日志区分说明。

## Deployment

- 海外生产路径：private GHCR + GitHub Actions + Cosign keyless + Podman + Nginx/Certbot + blue/green。
- blue 固定为 `127.0.0.1:3101`，green 固定为 `127.0.0.1:3102`；两个端口只绑定 loopback。
- production 只从受保护的 `main` 手动构建，部署 Actions Summary 给出的 immutable digest，并先完成精确 Cosign 验签。
- prototype 接受明确 tag 或 digest；production 只接受与 `SIGNATURE_VERIFIED_DIGEST` 一致的已验签 digest。所有模式都拒绝 `latest` 和缺少明确 tag/digest 的镜像引用。
- 候选槽位通过 health 和 smoke 后才能切流；验证或切流失败时保持或恢复原 active。发布成功后 active 使用 `restart-policy=always`，停止的 rollback 槽位使用 `restart-policy=no`，主机重启只恢复 active。
- 不把本机容器验证写成海外服务器已完成演练。
- 不在仓库、构建参数、日志或文档中写入 token、PAT、私钥、实际 registry 凭据或 auth 文件内容；认证路径和占位命令可以记录。
- 修改部署资产前阅读 `docs/deployment-guide.md`、`scripts/prod/README.md`、`.github/workflows/container.yml` 和相关测试。

## Documentation

代码行为变化时同步最接近用户或运维人员的文档：

- 使用流程：`docs/user-guide.md`
- SEO/GEO 操作：`docs/seo-geo-operations-guide.md`
- 部署运维：`docs/deployment-guide.md` 与 `scripts/prod/README.md`
- 文档入口：`README.md` 与 `docs/README.md`

避免在多份文档重复维护同一细节：README 负责入口和基线，用户手册负责操作，策略文档负责取舍，代码和测试负责最终行为。相对链接必须可解析。

## Completion Checklist

完成前确认：

1. 改动只覆盖用户请求，未覆盖无关工作区内容。
2. 对应回归测试已添加或说明不适用原因。
3. 最小有效验证已通过；前端改动有真实桌面和移动端证据。
4. prototype/production、材料证据和交易能力边界未被削弱。
5. 相关文档已同步，`git diff --check` 通过。
6. 汇报实际运行的命令、结果和未验证项；启动或验证了服务时同时汇报当前本地 URL。未获明确要求时不提交、不合并、不推送。
