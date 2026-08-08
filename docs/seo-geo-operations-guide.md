# TIDEFORM SEO/GEO 操作手册

版本：2026-08-08

适用对象：业务负责人、商品负责人、供应商资料负责人、SEO/内容运营、开发和数据分析人员。

本手册负责“具体怎么做”。页面策略、主题集群与证据模型见 [SEO/GEO 策略](./strategy/seo-geo-plan.md)，顾客和基础运营流程见 [用户使用手册](./user-guide.md)。仓库代码与测试是当前发布行为的最终事实源。

## 1. 目标与边界

SEO 的目标是让有明确家具类型、空间、尺寸、材料和定制意图的用户进入正确页面。GEO 的目标是让搜索与生成式答案系统能够从公开 HTML 中提取、理解和引用可核对的事实。

当前商品是由铝型材骨架与海洋级板材表面共同构成的家具，不是裸铝型材。标准尺寸和颜色进入商品/购物车路径；非标尺寸、颜色、布局、数量和特殊项目进入 RFQ。

以下内容在证据批准前不得作为生产主张：

- 板材具体基材、厚度、封边和表面体系。
- 防水、户外适用、承载、阻燃、耐候、认证和保修。
- 正式价格、库存、交期、配送、退换和安装承诺。
- 客户评价、项目案例、销量和本地仓储。

## 2. 当前发布状态

当前仓库默认是 prototype：

| 项目 | prototype 预期 |
| --- | --- |
| 页面 robots meta | `noindex,follow` |
| `/sitemap.xml` | 空 |
| 实体 JSON-LD | 0 个 |
| `/robots.txt` | 允许页面抓取、阻止 `/api/`；不声明 sitemap |
| Search Console/Bing 提交 | 暂不提交 |
| Product `Offer` | 不输出 |

prototype 可以用于内容、交互和发布门禁验收，但不用于积累自然搜索排名。只有正式品牌、域名、主体、政策和逐实体 evidence 完成后，才进入 production。

## 3. 角色与责任

| 角色 | 必须提供 | 主要验收 |
| --- | --- | --- |
| Business / Legal | 品牌、销售主体、域名、联系渠道、隐私、条款、运输和退换政策 | 站点身份与政策真实一致 |
| Product / Supplier | SKU、版本、尺寸、材料、饰面、五金、图片权利、护理和适用范围 | 商品主张可追溯到批准资料 |
| Content / SEO | 查询簇、页面 brief、正文、内部链接、来源、更新时间和 claim ledger | 页面回答单一主意图，事实与限制清楚 |
| Engineering | metadata、canonical、robots、sitemap、Schema、重定向和发布门禁 | 构建及线上技术检查通过 |
| Analytics | GSC、Bing、GA4、事件、UTM 和报告 | 搜索表现与业务结果分开统计 |

每个页面必须有一个内容负责人和一个审核者。涉及材料、尺寸、使用环境、交付或交易的页面还需要相应业务证据负责人。

## 4. 端到端流程

按以下顺序执行：

1. 冻结业务事实和证据边界。
2. 研究查询与用户任务。
3. 建立“一个主意图对应一个主页面”的页面地图。
4. 编写 content brief 和 claim ledger。
5. 制作可见 HTML、metadata、图片和内部链接。
6. 通过内容、证据、技术和业务复核。
7. 通过 production 发布门禁。
8. 在 GSC/Bing 验证并提交 sitemap。
9. 监测收录、查询、转化和内容质量。
10. 依据真实数据更新页面并保留修订记录。

跳过证据步骤直接做关键词和 Schema，会放大错误主张；跳过页面地图，会产生多个页面争抢同一查询的问题。

## 5. 上线前资料清单

### 5.1 站点资料

- 正式品牌中英文名称及品牌与销售主体关系。
- 法定销售主体、公开联系 URL、隐私政策、条款、运输和退换政策。
- 正式生产域名及 DNS 管理负责人。
- 美国首发市场范围；加拿大首期 RFQ 的公开说明。

### 5.2 商品资料

每个 SKU 至少准备：

- 稳定 SKU 和产品名称。
- 批准的尺寸版本、单位、尺寸图和允许偏差。
- 铝框合金/饰面、板材正式名称/厚度/饰面、连接件和五金。
- 标准颜色、可选尺寸和标准/定制路径。
- 图片权利、图片对应的真实配置、alt 所描述的可见内容。
- 包装、组装、锚固、护理、运输和退换边界。
- 内容负责人、证据 ID、审核者和绝对审核日期。

### 5.3 内容资料

- Materials、Measuring、Custom Projects 和 Resources 的作者/审核者。
- 来源、适用市场、适用产品版本和更新时间。
- 每项主张的状态：`verified`、`prototype`、`pending` 或 `not applicable`。

## 6. 查询研究与页面地图

### 6.1 从用户任务开始

不要先收集大量关键词再决定卖什么。先按真实任务建立四组查询：

| 查询簇 | 示例 | 适合页面 |
| --- | --- | --- |
| 家具类型 | `aluminum frame console table`、`modern sideboard` | 商品目录、PDP |
| 空间任务 | `narrow console for entryway`、`media console cable clearance` | Collection、PDP、Measuring |
| 材料构造 | `aluminum frame furniture`、`marine panel furniture` | Materials、PDP |
| 定制项目 | `custom width sideboard`、`hospitality furniture project` | Custom Projects、RFQ |

“海洋级板材”的正式英文名称和同义词要等供应商确认基材与目标市场表达后再冻结。

### 6.2 研究来源

原型阶段使用：

- 站内搜索词和零结果词。
- 销售/RFQ 中反复出现的问题。
- 供应商规格和设计师常用术语。
- 目标查询的实际搜索结果页及相关问题。
- Google Trends 和 Keyword Planner 的趋势/广告数据，用于方向判断，不当作自然排名预测。

上线后增加：

- Google Search Console 的 Queries、Pages、Countries 和 Devices。
- Bing Webmaster Tools 的关键词、抓取和索引数据。
- GA4 landing page 与合格加购/RFQ 数据。

### 6.3 页面映射规则

1. 每个查询簇选择一个主页面。
2. 同一页面只保留一个主意图，相关问题作为子主题。
3. 参数筛选页不作为首版索引页；它们 canonical 到 `/products`。
4. 只有当某类家具存在稳定需求、独立正文、足够商品和内部链接时，才建立静态分类 URL。
5. 记录主查询、次查询、页面、搜索意图、目标动作、证据负责人和状态。

建议页面地图字段：

```text
page_id | route | audience | primary_query | secondary_queries |
intent | required_facts | evidence_owner | primary_cta | status
```

## 7. Content Brief 模板

每次创建或大改页面前先填写：

```markdown
# 页面名称

- Route:
- Audience:
- Primary intent:
- Primary query:
- Supporting queries:
- User decision:
- Required verified facts:
- Known limitations:
- Evidence IDs and owners:
- Primary CTA:
- Related internal links:
- Title:
- Meta description:
- H1:
- Answer-first summary:
- Required tables/images:
- Schema candidate:
- Author/reviewer:
- Review date:
```

brief 未填完时，页面保持 draft/prototype。SEO 人员负责查询与页面结构，不代替商品、供应商或法务批准事实。

## 8. 页面制作 SOP

### 8.1 所有可索引页面

逐项完成：

- 唯一、准确的 title；把产品或页面主题放在品牌词前后合理位置。
- 说明页面价值和边界的 meta description，不堆关键词。
- 页面只有一个能概括主题的 H1。
- 开头用 40-80 词回答核心问题，避免空泛品牌介绍。
- 关键尺寸、材料、配置、适用范围和限制使用原生 HTML。
- 图片 alt 描述图中真实可见的家具、角度、结构或空间，不复制关键词列表。
- 页面包含上一级入口、相关材料/测量内容和下一步动作。
- 标明适用市场、单位、最后审核日期、证据状态和负责人。
- 结构化数据与可见 HTML 完全一致。

### 8.2 商品详情页

推荐顺序：

1. 产品名、家具类型和使用场景。
2. 可见图片和配置说明。
3. 标准尺寸、板面饰面和框架饰面。
4. 材料与构造事实。
5. 配送、组装、护理和适用限制。
6. 标准购买或 Custom Project 路径。
7. Materials、Measuring 和相关家具链接。

当前只在 `Product.evidence` 通过后输出基础 Schema.org `Product`，且没有 `Offer`。这个语义标记不含 Google Product snippet 所需的 `offers`、`review` 或 `aggregateRating`，当前不具备商品富结果资格。真实 Shopify 价格、币种、库存、市场、Checkout 或真实评价证据接入后，再设计相应 evidence、Product 富结果验证和 Merchant feed。

### 8.3 Materials 与指南页

- 先回答材料在家具中承担什么角色。
- 分开写“已确认”“待供应商确认”“不适用/不覆盖”。
- 表格包含条件和单位，避免孤立数字。
- 提供来源、作者、审核者和绝对日期。
- 不用 AI 图证明基材、性能或认证。

### 8.4 Custom Projects 与 RFQ

- 清楚列出可收集的尺寸、颜色、布局、数量、目的地和时间。
- 清楚列出提交不代表可行性、价格、交期或订单承诺。
- 不公开承诺尚未建立的响应 SLA。
- 提供返回标准家具目录的路径，避免所有访客都进入 RFQ。

## 9. GEO 内容制作

### 9.1 基本原则

GEO 不是独立于 SEO 的隐藏技巧。Google 官方说明，AI Overviews 和 AI Mode 沿用基础 SEO；页面需要已被索引、可在 Google Search 中显示 snippet，不存在额外技术要求，也不需要专用 AI 文本文件或特殊 Schema。

本项目采用以下做法提高可理解性和可核验性：

- 先给直接答案，再给条件、证据和限制。
- 一个段落解决一个具体问题。
- 用表格表达尺寸、组件、适用条件和待确认项。
- 实体名称保持一致：品牌、产品名、SKU、材料名和销售主体不随页面变化。
- 给事实附来源状态、版本、负责人和日期。
- 把观点、建议和未知与已确认事实分开。
- 重要正文由服务器输出并在 HTML 中可见。
- PDF 作为补充资料，不替代 HTML 主内容。

### 9.2 Answer-first 模板

```markdown
## 问题标题

直接回答：用 2-4 句说明适用对象、结论和最重要限制。

| 项目 | 已确认事实 | 条件/限制 | 来源状态 |
| --- | --- | --- | --- |

下一步：链接到对应商品、测量指南或 RFQ。
```

### 9.3 AI 搜索抽样

每月选择 10-20 个稳定问题，在目标地区和语言下抽样记录：

- 问题原文、日期、平台和地区。
- 是否出现本品牌、页面 URL 或引用。
- 引用是否准确，是否遗漏限制。
- 同一问题的传统搜索结果和站内页面表现。
- 引用后是否带来 landing session、加购或合格 RFQ。

单次答案变化不代表趋势。至少按月比较，并把页面事实准确性放在“是否被引用”之前。

### 9.4 `llms.txt` 与特殊标记

`llms.txt` 不是当前仓库的发布门禁。Google 官方明确表示 AI 搜索不要求新的 machine-readable/AI text 文件或特殊 Schema。后续可把 `llms.txt` 作为低成本实验，但它不替代 robots、sitemap、可索引 HTML、结构化数据和证据审核，也不构成引用保证。

## 10. Claim Ledger 与证据门禁

### 10.1 Claim Ledger 字段

```text
claim_id | route | exact_claim | entity | status | source |
source_version | market | owner | reviewer | reviewed_at |
expires_or_review_trigger
```

### 10.2 触发重新审核的变化

- 材料、饰面、尺寸、五金或包装版本变化。
- 图片替换或图片使用权变化。
- 价格、库存、市场、配送和退换政策变化。
- 页面主意图、title、H1 或 canonical 变化。
- 搜索引擎结构化数据政策变化。
- 客诉、退货或 RFQ 显示页面主张容易误解。

### 10.3 当前代码门禁

| 实体 | 代码位置 | 放行条件 |
| --- | --- | --- |
| 站点身份 | `src/lib/seo.ts` 的 `siteIdentityEvidence` | 品牌、主体关系、联系 URL、政策、负责人和审核记录完整 |
| 内容 | `contentEntities` | 作者、来源、批准 ID、日期和基础 evidence 完整 |
| 商品 | `Product.evidence` | 基础 evidence、图纸版本、尺寸版本、材料批准和图片权利完整 |
| 服务 | 内容 evidence | Custom Projects 范围与负责人已核实 |
| Offer | 尚未实现 | 需新增真实交易 evidence 后再发布 |

环境变量只开启 production 校验，不会把 prototype fixture 自动变成已批准事实。

稳定 SKU 是上线运营清单要求，但当前不属于运行时 evidence 门禁：`partNumber` 会写入 `Product.sku`，`isVerifiedProductEvidence()` 没有单独校验它的稳定性或非空值。发布前需人工核对，后续接入真实商品系统时应把该校验补进代码和测试。

## 11. Production 技术发布

### 11.1 环境配置

```dotenv
SITE_MODE=production
SITE_URL=https://HOST
APPROVED_PRODUCTION_DOMAIN=HOST
SITE_EVIDENCE_GATE=approved
```

`HOST` 替换为正式公共域名。`SITE_URL` 只能是 HTTPS origin，不得包含端口、路径、查询参数或片段；主机名与 `APPROVED_PRODUCTION_DOMAIN` 必须完全一致。

### 11.2 构建验证

```bash
pnpm test
pnpm lint
pnpm build
pnpm test:e2e
```

production 还需保留负向测试：缺失站点 evidence、保留域名、hostname 不一致、错误 mode 或 fixture 泄漏时构建/测试应失败或回落到 prototype。

### 11.3 线上检查

```bash
BASE=https://HOST

curl -sS "$BASE/robots.txt"
curl -sS "$BASE/sitemap.xml"
curl -sS "$BASE/" | rg -o '<meta name="robots"[^>]*>|<link rel="canonical"[^>]*>'
curl -sS "$BASE/" | rg -o 'application/ld\+json' | wc -l
curl -sS "$BASE/search?q=console" | rg -o '<meta name="robots"[^>]*>|<link rel="canonical"[^>]*>'
```

### 11.4 预期结果

| 检查 | production 预期 |
| --- | --- |
| 首页 | 站点 identity 通过后可索引 |
| 已批准内容页 | 可索引并输出对应页面 Schema |
| 已批准 PDP | 可索引并输出基础 Schema.org `Product`；当前不具备 Google Product snippet 富结果资格 |
| 未批准实体 | `noindex,follow`，不进 sitemap，不输出实体 Schema |
| `/search` | 始终 `noindex,follow` |
| `/products?...` | 非空、非跟踪查询参数触发 `noindex,follow`；所有参数版本 canonical 到 `/products` |
| RFQ confirmation | `noindex,follow` |
| `/api/` | robots disallow；接口本身还需鉴权/限流策略 |

在公开 URL 上使用 Schema Markup Validator 检查当前基础 `Product` 的 Schema.org 语法和词汇；再由审核人员逐项对照 JSON-LD 与页面可见内容。Rich Results Test 会提示当前 `Product` 缺少商品富结果必需字段；待真实 `offers`、`review` 或 `aggregateRating` 证据接入后，再用它验证 Product snippet 资格。即使满足技术资格，Google 也不保证展示富结果。

## 12. Google Search Console 操作

### 12.1 开通

1. 用公司控制的 Google 账号创建 Search Console property。
2. 优先使用 Domain property：只输入域名，不带协议或路径，通过 DNS TXT 验证，并覆盖该域名的所有协议和子域；记录 DNS 和账号负责人。
3. 给 SEO、开发和业务负责人分配最小必要权限，避免共用个人账号。
4. 如需精确隔离某个生产 HTTPS host，再增加包含协议和 host 的 URL-prefix property。
5. 先完成 property 验证和权限配置，再使用 URL Inspection；被检查 URL 必须属于当前 property。

### 12.2 首次提交

1. 确认 production 线上检查全部通过。
2. 在 Sitemaps 报告提交 `https://HOST/sitemap.xml`。
3. 检查读取时间、状态、发现 URL 数和处理错误。
4. sitemap 更新后保持同一 URL，通常不需要反复删除再提交。

Google 将 sitemap 视为提示，提交不保证抓取或收录；`lastmod` 只写真实的重大内容更新日期。

### 12.3 首批 URL 检查

使用 URL Inspection 抽查：

- 首页。
- `/products`。
- 1-2 个已批准 PDP。
- `/materials`。
- `/resources/measuring-for-furniture`。
- `/custom-projects`。

检查 live URL、抓取允许状态、页面 fetch、indexing allowed、用户声明 canonical、Google 选择 canonical、渲染 HTML 和 structured data。只对重要的新页面或已修复页面请求索引，不批量重复提交。

Live Test 判断当前页面是否具备可索引条件，但无法预测 Google 最终选择的 canonical，也不保证展示。

### 12.4 日常报告

每周查看：

- Page indexing：新增未收录原因和趋势。
- Sitemaps：读取错误与发现 URL 数。
- Performance：Queries、Pages、Countries、Devices。
- Enhancements/Rich results：结构化数据错误。
- Manual actions 和 Security issues。

Google 当前把 AI Overviews/AI Mode 流量计入 Search Console 的 `Web` 搜索类型，不提供本项目可依赖的独立 GEO 排名报表。

## 13. Bing Webmaster Tools 与 IndexNow

### 13.1 Bing Webmaster Tools

1. 使用公司账号添加正式生产站点；可按平台当前界面选择导入 GSC 或独立验证。
2. 提交同一正式 `/sitemap.xml`。
3. 检查 URL、抓取、索引、关键词和站点问题。
4. 保持 Bing 与 GSC 使用同一 canonical、站点身份和公开政策。
5. Bing AI Performance 公共预览可用时，查看 citations、grounding queries、页面级引用活动和趋势；它们用于观察 AI 答案引用表现，不等同于收录或转化。

### 13.2 IndexNow

IndexNow 适合在页面新增、更新或删除后主动通知参与的搜索引擎。接入步骤：

1. 生成 8-128 位、符合协议字符要求的 key。
2. 在站点根目录或协议允许的位置托管 UTF-8 key 文件。
3. 发布系统确认页面成功上线后，再提交变更 URL。
4. 单次 POST 最多提交 10,000 个 URL；只提交本域名、真实变化且 canonical 的 URL。
5. 处理 `200/202/400/403/422/429`，记录提交时间和批次。

HTTP 200 只表示搜索引擎收到 URL，不表示已经抓取、收录或获得排名。首版可先人工使用 Bing Webmaster Tools；当内容发布流程稳定后再自动化 IndexNow。

## 14. AI Crawler 策略

当前 `src/app/robots.ts` 对通用 `User-agent: *` 允许页面并阻止 `/api/`。正式上线前由 Business/Legal 与 SEO 明确不同 crawler 的政策，再由 Engineering 实现和测试。

OpenAI 官方区分：

- `OAI-SearchBot`：用于 ChatGPT 搜索结果发现。
- `GPTBot`：用于可能进入生成式基础模型训练的内容抓取。
- `ChatGPT-User`：用户请求触发的访问，不用于决定 Search 展示。

`OAI-SearchBot` 与 `GPTBot` 设置相互独立。一个常见政策示例是允许搜索发现、单独决定是否允许训练：

```text
User-agent: OAI-SearchBot
Allow: /

User-agent: GPTBot
Disallow: /
```

这是政策示例，不代表本项目已经采用。修改后检查生成的 `/robots.txt`、CDN/WAF、日志和官方 IP 范围；OpenAI 文档提示搜索系统响应 robots 更新可能需要约 24 小时。

不要根据 User-Agent 字符串单独放宽安全控制。RFQ、后台、API、未公开文件和个人数据必须由应用鉴权、网络和存储规则保护。

## 15. 发布节奏

### 首日

- 检查 DNS、HTTPS、200/重定向、canonical、robots、sitemap 和 Schema。
- 验证 GSC/Bing property 并提交 sitemap。
- URL Inspection 抽查代表页面。
- 检查 Analytics consent、landing page 和 RFQ 诊断事件。

### 首周

- 每天查看服务错误、抓取异常和 sitemap 状态。
- 第 3-7 天检查代表 URL 是否被发现/抓取，以及 canonical 是否符合预期。
- 记录站内搜索零结果和首批 RFQ 问题，不急于按少量排名波动改标题。

### 每周

- 收录页面、排除原因、结构化数据错误。
- 品牌/非品牌查询、页面、国家和设备。
- PDP 到加购、内容到 RFQ、站内搜索零结果。
- 新增或更新内容的 evidence 与 last reviewed。
- Bing AI Performance 的 citations、grounding queries、页面级引用活动和趋势。

### 每月

- 按家具类型、空间任务、材料和定制查询簇复盘。
- 抽样 AI 搜索引用及准确性。
- 合并重复或低价值内容，补足有需求但回答不完整的页面。
- 检查供应商资料、政策、价格、库存和图片版本变化。
- 形成下月页面新增、更新、保持或下线清单。

## 16. KPI

SEO 与业务结果同时看，避免只追排名：

| 层级 | 指标 |
| --- | --- |
| 技术 | 有效 sitemap URL、可索引率、抓取/服务器错误、Schema 错误 |
| 可见性 | impressions、clicks、CTR、average position、品牌/非品牌查询 |
| 内容质量 | 页面参与、站内搜索零结果、返回搜索、指南到 PDP/RFQ |
| 标准家具 | PDP engagement、add-to-cart、checkout、purchase |
| 定制家具 | RFQ start、有效提交、qualified、quote、won |
| GEO 抽样 | 品牌/URL 引用率、事实准确率、限制保留率、引用后转化 |

GSC 的 position 是聚合诊断指标，不直接等于单一地区、设备或用户看到的固定排名。低量 RFQ 按 28-90 天窗口判断。

## 17. 常见问题处理

### 页面没有收录

依次检查：

1. HTTP 是否为 200，页面是否公开可访问。
2. robots 是否允许抓取，meta 是否为 `index,follow` 或未设置 noindex。
3. canonical 是否指向自身，Google 选择 canonical 是否不同。
4. 页面是否在 sitemap 和可抓取内部链接中。
5. 内容是否与其他页面重复，是否缺少独立价值或证据。
6. URL Inspection 的 live test、rendered HTML 和抓取错误。

### Schema 通过测试但没有富结果

先区分 Schema.org 语义有效与 Google 富结果资格。当前基础 `Product` 缺少 Product snippet 要求的 `offers`、`review` 或 `aggregateRating`，所以不具备商品富结果资格；接入真实证据并补足字段后，再检查 visible HTML 与 JSON-LD 是否一致、页面是否已索引、内容是否最新。Google 仍不保证符合要求的页面一定展示富结果。

### AI 答案引用错误

先核对页面是否表达含糊、限制是否离核心答案太远、实体名是否不一致。更新页面和 claim ledger，记录修改日期，并在下一周期复查；不要为追求引用删除必要限制。

### 参数页进入索引

检查参数页 robots meta、canonical、内部链接和 sitemap。当前 `/products` 带非空、非跟踪查询参数时应为 `noindex,follow`；只含 `utm_source`、`utm_medium`、`utm_campaign`、`utm_content`、`utm_term`、`gclid`、`fbclid` 或 `msclkid` 时不会触发该 noindex。两种情况的 canonical 都指向 `/products`。

### 搜索流量上涨但 RFQ 质量下降

按 landing page、query、market 和家具类型拆分，检查是否吸引了 raw extrusion、industrial profile、DIY frame 等错位意图；修正文案、内部链接和广告否定词，而不是只看总流量。

## 18. 发布检查表

### 内容与证据

- [ ] 页面有唯一主意图、title、description 和 H1
- [ ] 核心答案、尺寸、材料、限制和日期在可见 HTML 中
- [ ] 主张对应 evidence ID、负责人和审核者
- [ ] 图片与真实配置一致，alt 描述可见内容，图片权利已批准
- [ ] 标准购买和 Custom Project 路径清楚
- [ ] 内部链接构成 `Collection -> Product -> Materials -> Measuring -> Custom Projects -> RFQ`

### 技术

- [ ] production 域名与环境门禁正确
- [ ] `pnpm test`、`pnpm lint`、`pnpm build`、`pnpm test:e2e` 通过
- [ ] canonical、robots、sitemap、HTTP 状态和重定向正确
- [ ] 已批准实体进入 sitemap，未批准实体保持 noindex
- [ ] JSON-LD 与可见正文一致；当前 Product 不含 `offers`、`review`、`aggregateRating`，不按商品富结果验收
- [ ] 搜索、带非跟踪查询参数的目录页和 RFQ confirmation 保持 noindex

### 平台

- [ ] GSC Domain property 和 Bing 站点由公司账号控制
- [ ] 正式 sitemap 已提交且无处理错误
- [ ] 代表 URL 完成 Inspection/索引检查
- [ ] Analytics、consent、UTM 和生产事件经过验证
- [ ] AI crawler 政策经 Business/Legal 批准并由 Engineering 验证

## 19. 官方来源

以下页面于 2026-08-08 访问。平台可能持续更新，执行重大改动前重新核对。

| 标题 | URL | 页面更新状态 | 本手册使用 |
| --- | --- | --- | --- |
| Google: AI features and your website | https://developers.google.com/search/docs/appearance/ai-features | 2025-12-10 | AI 搜索沿用 SEO、无额外技术/特殊 Schema、GSC 统计与预览控制 |
| Google: Introduction to Product structured data | https://developers.google.com/search/docs/appearance/structured-data/product | 2025-12-10 | Product snippets、merchant listings、价格/库存/政策数据边界 |
| Google: Product snippet structured data | https://developers.google.com/search/docs/appearance/structured-data/product-snippet | 持续更新 | Product snippet 必需属性、推荐属性与富结果资格 |
| Google: Build and submit a sitemap | https://developers.google.com/search/docs/crawling-indexing/sitemaps/build-sitemap | 2026-07-08 | sitemap 格式、`lastmod`、提交方式与非保证性质 |
| Google: General structured data guidelines | https://developers.google.com/search/docs/appearance/structured-data/sd-policies | 2026-07-10 | visible content 一致性、质量规则与富结果非保证性质 |
| Google Search Console: About Search Console | https://support.google.com/webmasters/answer/9128668?hl=en | 持续更新 | 抓取、索引、搜索表现和问题监测 |
| Google Search Console: Add a website property | https://support.google.com/webmasters/answer/34592?hl=en | 持续更新 | Domain/URL-prefix property 范围与 DNS 验证要求 |
| Google Search Console: Verify site ownership | https://support.google.com/webmasters/answer/9008080?hl=en | 持续更新 | 所有权、验证方式和权限持续性 |
| Google Search Console: URL Inspection tool | https://support.google.com/webmasters/answer/9012289?hl=en | 持续更新 | live test、canonical、rendered HTML 与请求索引 |
| Bing: Start Using Bing Webmaster Tools to Improve Your Site Visibility | https://blogs.bing.com/webmaster/June-2025/Start-Using-Bing-Webmaster-Tools-to-Improve-Your-Site-Visibility | 2025-06 | 导入 GSC、独立验证、sitemap、URL Inspection 和 IndexNow |
| Bing: Introducing AI Performance in Bing Webmaster Tools Public Preview | https://blogs.bing.com/webmaster/February-2026/Introducing-AI-Performance-in-Bing-Webmaster-Tools-Public-Preview | 2026-02 | citations、grounding queries、页面级引用活动和趋势 |
| Microsoft Learn: Bing Webmaster API | https://learn.microsoft.com/en-us/bingwebmaster/ | 2026-08-07 | Bing 站点数据、URL 和 sitemap 提交能力 |
| IndexNow: Documentation | https://www.indexnow.org/documentation | 持续更新 | key、单/批量 URL、响应码与所有权验证 |
| OpenAI Docs: Overview of OpenAI Crawlers | https://developers.openai.com/api/docs/bots | 持续更新 | `OAI-SearchBot`、`GPTBot`、`ChatGPT-User` 的独立用途与控制 |

## 20. 项目内参考

- [SEO/GEO 策略](./strategy/seo-geo-plan.md)
- [测量与分析方案](./strategy/measurement-plan.md)
- [90 天营销方案](./strategy/marketing-plan.md)
- [用户使用手册](./user-guide.md)
- `src/lib/seo.ts`
- `src/app/robots.ts`
- `src/app/sitemap.ts`
- Obsidian：`工作/项目与方案/xsyshopify/项目交接.md`
- Obsidian：`工作/项目与方案/xsyshopify/Shopify Headless 独立站业务合伙人准备清单.md`
- Obsidian：`工作/项目与方案/xsyshopify/Next.js Shopify Headless GitHub 项目调研.md`
