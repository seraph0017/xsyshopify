# TIDEFORM 家具商店原型

TIDEFORM 是一个基于 Next.js 的家具独立站原型，展示由铝型材骨架与海洋级板材表面共同构成的成品或可配置家具。它不是裸铝型材目录。

原型验证两条客户路径：

- 标准尺寸和饰面进入商品详情与本地购物车流程。
- 定制尺寸、颜色、布局、数量和配送限制进入结构化 RFQ 询价流程。

`Marine-grade panel / 海洋级板材` 是中性工作名称。具体基材、厚度、表面系统、封边、护理要求、性能、户外适用性、承载数据和认证仍需供应商提供证据后才能用于生产发布。

## 当前范围

- 首页、家具目录、URL 筛选、站内搜索和 Living Collection
- 6 个家具详情页：玄关桌、餐边柜、电视柜、置物架、工作桌和长凳
- 标准配置选择与浏览器本地购物车原型
- Materials、Custom Projects、Resources 和家具测量指南
- RFQ 表单和本地 API 校验；附件只处理元数据
- prototype/production 双模式的 fail-closed SEO 发布门禁
- Vitest 单元/组件测试与桌面、移动端 Playwright 流程

当前尚未连接 Shopify 商品、库存、Checkout、支付、税费、运输、订单创建、生产 RFQ 存储和通知。

## 技术栈

- Next.js 16 App Router
- React 19 和 TypeScript
- Lucide React
- Vitest 和 Testing Library
- Playwright
- pnpm 11

## 本地运行

前置条件：Node.js major 22 内的 `22.22.2+`、major 24 内的 `24.15+`，或 major 26 及以上版本，并启用 Corepack。Node 23 和 25 不在当前 jsdom engine 范围内。

```bash
corepack enable
pnpm install
pnpm exec playwright install chromium
pnpm dev
```

浏览器打开 <http://127.0.0.1:3000>。Playwright 默认也使用 `3000` 端口；如需复用其他运行实例，可设置 `PLAYWRIGHT_BASE_URL`。

## 常用命令

```bash
pnpm dev       # 启动本地开发服务器
pnpm lint      # 运行 ESLint
pnpm test      # 单次运行 Vitest
pnpm test:e2e  # 运行桌面和移动端 Playwright 流程
pnpm build     # 创建生产构建
pnpm start     # 启动生产构建
```

## 主要路由

| 路由 | 用途 |
| --- | --- |
| `/` | 家具导向首页 |
| `/products` | 家具目录、搜索和筛选 |
| `/products/[handle]` | 商品详情及标准/定制分流 |
| `/collections/living` | Living Collection |
| `/materials` | 框架与板材构造及证据边界 |
| `/custom-projects` | 定制家具流程 |
| `/resources` | 测量、护理、组装和支持主题 |
| `/resources/measuring-for-furniture` | 家具测量指南 |
| `/rfq` | Custom Project 询价表单 |
| `/search` | 家具与内容搜索 |
| `/api/rfq` | 原型 RFQ 校验接口 |

## 发布模式

默认模式为 `prototype`，会主动输出全站 `noindex,follow`、空 sitemap，并关闭全部实体 JSON-LD。原型不应提交到 Google Search Console、Bing Webmaster Tools 或 Merchant Center。

production 采用 fail-closed 发布，需要以下环境门禁：

```dotenv
SITE_MODE=production
SITE_URL=https://store.tideform.com
APPROVED_PRODUCTION_DOMAIN=store.tideform.com
SITE_EVIDENCE_GATE=approved
```

以上域名只用于说明公共域名格式，实际使用时必须替换为正式批准的生产域名。`SITE_URL` 必须是没有路径、查询参数、片段和端口的公共 HTTPS origin，主机名必须与 `APPROVED_PRODUCTION_DOMAIN` 完全一致。

环境门禁与完整的 operator-verified 站点身份共同开启 production、首页索引和站点级 Schema。内容和商品实体再分别通过自己的证据门禁；prototype fixture 始终排除。交易证据类型尚未实现，因此当前不输出 `Offer`；发布 commerce Schema 或 feed 前必须补齐真实价格、币种、库存、市场和 Checkout 校验。

完整操作见 [.env.example](./.env.example)、[SEO/GEO 操作手册](./docs/seo-geo-operations-guide.md)和 [SEO/GEO 策略](./docs/strategy/seo-geo-plan.md)。

## 项目结构

```text
src/app/          App Router 页面、metadata 路由和 RFQ API
src/components/   商店、目录、购物车、RFQ 和通用 UI 组件
src/lib/          商品 fixture、购物车/RFQ 逻辑、分析和 SEO 门禁
tests/e2e/        桌面与移动端商店流程
public/images/    家具概念图、商品图和场景图
docs/             设计、操作、策略、QA 和用户文档
```

## 文档

从 [文档索引](./docs/README.md) 开始。主要资料：

- [中文用户使用手册](./docs/user-guide.md)
- [SEO/GEO 操作手册](./docs/seo-geo-operations-guide.md)
- [商店设计](./docs/plans/2026-08-08-tideform-furniture-storefront-design.md)
- [实施计划与完成记录](./docs/plans/2026-08-08-tideform-furniture-storefront-implementation.md)
- [SEO/GEO 策略](./docs/strategy/seo-geo-plan.md)
- [90 天营销方案](./docs/strategy/marketing-plan.md)
- [测量与分析方案](./docs/strategy/measurement-plan.md)
- [视觉一致性与复审台账](./docs/qa/fidelity-ledger.md)

## 已验证基线

截至 2026-08-08：

- Vitest：16 个文件，83/83 通过
- Playwright：桌面与移动端 12/12 通过
- `pnpm lint`、`pnpm build` 和 `git diff --check` 通过
- 独立复审：前端 98/100、SEO/GEO 96/100、视觉/UX 97/100
- 三路复审均为 Critical 0、Important 0

下一阶段是生产集成：确认供应商材料和商品记录，确定正式品牌与业务政策，连接 Shopify 和 Checkout，持久化 RFQ，并完成逐 SKU 的贸易、包装、运输和 landed cost 核对。
