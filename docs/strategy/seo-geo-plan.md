# TIDEFORM SEO / GEO 实施方案

## 1. 目标与事实边界

本方案服务于“标准家具在线购买 + 尺寸/颜色/配置/项目定制 RFQ”的北美家具站。产品是铝型材框架与海洋级板材共同构成的成品或模块化家具，不以裸铝型材、连接件或工业框架为主要商品。

`TIDEFORM` 是原型临时品牌。`marine-grade panel / 海洋级板材` 是中性工作名称，具体基材待供应商确认。上线前不得把胶合板、HDPE、PVC、防水、户外适用、阻燃、承重、耐候、认证或保修写成已验证事实。

SEO 目标：让有明确家具类型、空间、尺寸、材料和定制意图的用户进入正确页面。GEO 目标：让搜索与生成式答案系统从 HTML 中提取可核对的尺寸、配置、适用范围、限制、来源状态和更新时间。

## 2. 受众与搜索意图

| 受众 | 主要任务 | 搜索表达示例 | 主入口 | 主转化 |
| --- | --- | --- | --- | --- |
| 设计意识强的家庭用户 | 找适合玄关、客厅、媒体墙的小体量家具 | aluminum frame console; modern green sideboard; slim entry console | `/products`、PDP、`/collections/living` | 标准加购或定制 |
| 小户型与工作室用户 | 用准确尺寸解决收纳和工作面 | narrow console for small space; custom depth media console; modular studio table | 产品类型页、测量指南 | 定制 RFQ |
| 室内设计师 | 比较材料、颜色、尺寸和项目数量 | aluminum frame furniture; marine panel furniture; custom color sideboard | `/materials`、`/custom-projects` | 样板/色板请求或 RFQ |
| 酒店与小型商业空间 | 采购重复件或特殊配置 | custom console furniture project; hospitality sideboard; modular shelving order | `/custom-projects`、RFQ | 合格项目线索 |

关键词示例只表示意图，搜索量、CPC 和地域差异需在正式品牌、域名和产品资料冻结后通过 GSC、Keyword Planner 与客户访谈验证。

## 3. 路由与主题矩阵

| 路由 | 首要意图 | 必须回答 | 主 CTA | Schema 准入 |
| --- | --- | --- | --- | --- |
| `/` | 品牌与品类判断 | 卖什么家具、材料组合、标准与定制边界 | Shop furniture / Customize a piece | 品牌证据通过后 `Organization`、`WebSite` |
| `/products` | 家具选购 | 类型、宽度、颜色、框架、可售/定制路径 | 查看 PDP | 证据通过后 `CollectionPage`、`ItemList` |
| `/products/[handle]` | 具体款式 | 尺寸、颜色、结构、价格状态、使用限制、交付边界 | 加购或定制 | SKU 级证据通过后 `Product`；真实 Offer 另设闸门 |
| `/collections/living` | 空间与组合灵感 | 玄关、客厅、媒体、长墙的家具关系 | 浏览系列 | 批准正文后 `CollectionPage` |
| `/materials` | 材料与结构研究 | 铝框作用、板面作用、已知与未知事实、护理依赖 | 查看产品或询色 | 批准作者/来源后 `Article` |
| `/custom-projects` | 定制服务采购 | 能改什么、需提供什么、流程与边界 | Start a custom project | 服务能力核实后 `Service` |
| `/resources` | 购买前计划 | 测量、送货路径、组装、锚固、护理 | 阅读指南 | 批准内容后 `CollectionPage` |
| `/resources/measuring-for-furniture` | 空间测量问题 | 家具包络、墙面、操作间隙、送货路径 | RFQ | 批准作者/来源后 `Article` |
| `/rfq` | 高意向定制 | 家具类型、尺寸、颜色、配置、数量、地点、时间、文件 | 提交项目 | `ContactPage`；不输出虚构服务承诺 |
| `/search` | 站内导航 | 定位产品与指南 | 结果点击 | 永久 `noindex,follow` |

## 4. 商品页 HTML 模板

每个 PDP 依次提供：

1. 家具类型和唯一 H1。
2. 真实可读的尺寸字符串，说明单位与标准/起始配置。
3. 面板颜色和框架饰面名称；色块同时有文字标签。
4. 标准尺寸/颜色的购买路径或定制路径，二者不得混淆。
5. 铝框、海洋级板材、门/搁板/设备格等可见结构事实。
6. 供应商待确认字段、图片用途限制和证据状态。
7. 送货、组装、锚固、护理和退货的当前边界。
8. 指向 Materials、Measuring、Collection 和 Custom Projects 的上下文链接。

图片用于展示形态和空间效果，不作为精确尺寸、颜色、板材基材、承载、耐水或结构性能的证据。关键事实必须在 HTML 中出现。

## 5. 主题集群

### 家具类型

- aluminum frame console table
- modern sideboard / low storage cabinet
- media console with open equipment bay
- modular open shelving
- aluminum frame work table
- entryway bench with shelf

### 空间与任务

- narrow furniture for entryway
- low storage for long living room wall
- media console cable clearance
- small-space furniture depth
- studio table dimensions
- how to measure delivery path for furniture

### 材料与构造

- aluminum frame furniture
- frame-and-panel furniture
- marine-grade panel furniture
- brushed aluminum furniture care
- panel finish samples / custom furniture color

“海洋级板材”的英文正式名、同义词和材料类关键词，必须在供应商确认基材与目标市场表达后再冻结。

## 6. 技术 SEO 发布契约

`src/lib/seo.ts` 是发布模式的单一入口：

- `SITE_MODE` 缺失或非法时 fail closed 为 `prototype`。
- `prototype` 全站 `noindex,follow`、空 sitemap、零实体 JSON-LD。
- `production` 需要合法 HTTPS `SITE_URL`、精确匹配的 `APPROVED_PRODUCTION_DOMAIN`、批准的站点身份和显式证据。
- Search、购物车状态、RFQ confirmation 和筛选参数页可抓取但 `noindex,follow`，canonical 指向干净路由，不进 sitemap。
- `robots.txt` 只阻止 `/api/`，不依靠 robots 隐藏敏感内容。

生产发布闸门分层：

| 层级 | 需要的证据 | 通过后可发布 |
| --- | --- | --- |
| 站点 | 正式品牌、销售主体关系、域名、公开联系渠道、政策 | `Organization`、`WebSite`、首页索引 |
| SKU | 稳定 SKU、版本、尺寸、材料/饰面、图片权利、负责人、证据 ID | PDP sitemap、`Product` |
| Offer | Shopify 真实市场、价格、币种、库存、checkout、税费/配送状态 | `Offer`、Merchant feed |
| 内容 | 真实作者/审核者、来源、发布日期、修改日期、批准状态 | Guide sitemap、`Article` |
| 服务 | 已核实定制范围、地区、流程、主体、限制 | `Service` |

上表是完整生产目标。当前代码已实现站点身份、SKU/Product 和内容实体门禁；`Service` 复用内容实体证据。Offer/交易证据类型尚未实现，当前始终省略 `Offer`，在真实 Shopify 市场、价格、币种、库存和 Checkout 校验接入前不得启用 commerce Schema 或 Merchant feed。

Fixture、AI 概念图、临时品牌、供应商待确认材料、原型价格和未连接库存不得进入生产 Schema、Merchant Center 或广告落地页。

## 7. Metadata、Canonical 与筛选

- 每个可索引页有唯一 title、description、canonical、Open Graph、一个 H1。
- PDP title 优先“产品名 + 家具类型”；材料和指南页优先回答问题，不堆品牌词。
- `/products?category=...&width=...&panel=...` 统一 `noindex,follow`，canonical 到 `/products`。
- 某个分类只有在有独立搜索需求、独立正文、足够商品和稳定内部链接时，才建立干净静态路由。
- `utm_*`、`gclid`、`fbclid` 从 canonical 丢弃；站内链接不携带追踪参数。
- sitemap 只列 200、canonical、自索引、通过证据闸门的 URL，`lastmod` 来自真实内容记录。

## 8. GEO 证据模型

### 可引用结构

材料、测量、护理与定制页应包含：

1. 40-80 词 answer-first 摘要。
2. `Applies to`、`Does not cover`、`Market`、`Unit system`、`Last reviewed`、`Evidence status`。
3. 原生 HTML 尺寸/清单表，表头、单位和条件完整。
4. 已知事实、待确认项和限制分别表达。
5. 来源、责任人、审核状态和绝对日期。
6. 能独立理解的图片说明和 alt。

### Claim ledger

对影响购买、适用性、护理、交付或报价的主张记录：`claim_id`、页面、原文、实体、状态、来源、版本、适用市场、负责人、核对日期、到期/复核条件。

优先级：受控产品规格/项目实测 -> 供应商批准资料 -> 官方标准或机构资料 -> 可追溯行业资料。AI 输出、论坛和二手文章只用于发现线索。

## 9. 内部链接

核心闭环：

`Collection -> Product -> Materials -> Measuring -> Custom Projects -> RFQ`

- 首页类别和 featured cards 链接到产品或目录筛选。
- PDP 回链 Materials 和 Measuring，并给标准购买与定制两种动作。
- Materials 链到相关产品与颜色匹配 RFQ。
- Measuring 链到 Custom Projects/RFQ。
- Custom Projects 提供标准款入口，避免所有用户都进入表单。
- Resources 不做孤立文章，每页至少一个产品/系列链接和一个下一步动作。

## 10. 发布检查

- [ ] 正式品牌、域名、销售主体和公开联系信息已核实
- [ ] 板材基材、厚度、饰面、边缘、护理与适用环境已由供应商确认
- [ ] 每个 SKU 的尺寸、颜色、结构、图片、版本和负责人有证据
- [ ] 价格、库存、交付、退货与 Checkout 来自真实系统
- [ ] AI 图片已人工核对结构、颜色、配置，并保留生成式元数据
- [ ] Prototype 模式全站 noindex、空 sitemap、零实体 JSON-LD
- [ ] Production 负向构建测试阻止域名错误和 fixture 泄漏
- [ ] 桌面/移动端 H1、筛选、PDP、Cart、RFQ、Search 流程通过
- [ ] GSC、GA4、Merchant Center 和广告实体信息一致
- [ ] 关键主张进入 claim ledger 并设更新触发条件
