# TIDEFORM 测量与分析方案

## 1. 目标

测量系统同时覆盖标准家具电商和定制家具 RFQ，不把两类漏斗混成一个“转化率”。原型阶段只验证事件结构；生产埋点需在正式域名、同意机制、Shopify、支付、CRM 和隐私政策就绪后启用。

核心业务结果：

- `purchase`：真实 Shopify 订单，去重后计数与收入。
- `qualified_rfq`：经人工或 CRM 规则确认具备家具类型、尺寸、地点、时间和可跟进联系信息的项目。
- `won_project`：RFQ 转成已接受报价/受控订单。

## 2. 漏斗

### 标准家具

`view_item_list -> select_item -> view_item -> select_furniture_option -> add_to_cart -> begin_checkout -> purchase`

### 定制家具

`view_item / view_custom_projects / view_guide -> rfq_start -> file_upload -> rfq_submit -> qualified_rfq -> quote_issued -> won_project`

### 内容辅助

`organic/social/referral -> view_collection/material/guide -> product/RFQ -> purchase or qualified_rfq`

## 3. 事件契约

| 事件 | 触发 | 关键属性 | 去重/注意 |
| --- | --- | --- | --- |
| `view_item_list` | 目录/系列商品进入可见区 | `item_list_id`, `item_list_name`, `item_count` | 每页/列表状态一次 |
| `select_item` | 点击商品卡 | `item_id`, `item_name`, `item_category`, `list_id`, `position` | 点击一次 |
| `view_item` | PDP 展示 | `item_id`, `item_name`, `category`, `transaction_mode`, `prototype_status` | 路由一次 |
| `select_furniture_option` | 改尺寸或板面颜色 | `item_id`, `option_type`, `option_value`, `price` | 每次用户选择 |
| `add_to_cart` | 标准配置加入购物车 | `item_id`, `size`, `panel_finish`, `quantity`, `value`, `currency` | 使用行项目 ID |
| `view_cart` | 打开购物车 | `item_count`, `value`, `currency` | 每次打开 |
| `checkout_preview_diagnostic` | 点击尚未接入 Shopify 的 checkout 预览 | `value`, `reason` | 原型诊断事件，不计入生产转化 |
| `begin_checkout` | 已验证 Shopify checkout 跳转成功 | `checkout_id`, `value`, `currency`, `items` | 接入后按 checkout ID 去重 |
| `purchase` | Shopify/支付确认 | `transaction_id`, `value`, `tax`, `shipping`, `currency`, `items` | `transaction_id` 强去重 |
| `rfq_start` | 第一次编辑 RFQ | `project_type`, `source_page`, `product_handle` | 会话/表单实例一次 |
| `file_upload_preview` | 原型选择文件元数据 | `file_count`, `extension_group`, `total_size_bucket` | 不发送文件名和内容；生产上传接入后另设事件 |
| `rfq_preview_submit` | 原型 API 返回 reference、但未持久化 | `project_type`, `panel_finish`, `quantity_bucket`, `country`, `file_count`, `persisted=false` | 原型诊断事件，不计入生产线索 |
| `rfq_submit` | 服务端持久化成功并返回 reference | `reference_hash`, `project_type`, `panel_finish`, `quantity_bucket`, `country`, `file_count`, `persisted=true` | reference 去重；不传原始联系信息 |
| `qualified_rfq` | CRM 人工确认 | `lead_id`, `project_type`, `quantity_bucket`, `market`, `qualification_reason` | CRM lead ID 去重 |
| `quote_issued` | 正式报价发出 | `quote_id`, `lead_id`, `value`, `currency` | 报价 ID 去重 |
| `won_project` | 报价转订单 | `order_id`, `quote_id`, `value`, `currency` | 订单 ID 去重 |
| `view_guide` | Materials/Measuring/Resources | `content_id`, `content_type`, `evidence_status` | 路由一次 |
| `search` | 提交站内搜索 | `search_term_normalized`, `result_count` | 不记录可能包含个人信息的长查询 |

当前代码对未连接的 checkout、文件选择和未持久化 RFQ 分别发送 `checkout_preview_diagnostic`、`file_upload_preview`、`rfq_preview_submit`。只有接入并验证真实系统后，才发送 `begin_checkout` 和 `rfq_submit` 等生产事件。

## 4. 数据最小化

- GA4、广告和 Clarity 不接收姓名、邮箱、公司、邮编全文、文件名、自由文本、房间照片或图纸。
- RFQ reference 对分析平台使用单向 hash；原始 reference 只留在业务系统。
- 搜索词限制长度并检查 email/phone/URL 模式；疑似个人信息时只记录 `redacted`。
- 文件只记录数量、扩展组和大小区间。
- IP、Cookie、会话录制、广告信号和跨域配置按目标市场的同意与隐私政策执行。
- Clarity/录屏必须屏蔽 RFQ 输入、搜索输入、Cart 个人化区域和所有上传控件。

## 5. 工具与环境

### GA4

- Dev、staging、production 使用不同 data stream 或明确的环境维度。
- Prototype/noindex 环境默认不发送生产数据。
- Ecommerce items 使用稳定 SKU/变体 ID；临时 fixture 不进入生产报表。
- 自定义维度：`transaction_mode`、`furniture_type`、`panel_finish`、`size_option`、`content_type`、`evidence_status`、`market`。

### Shopify

- 校验 storefront -> checkout -> thank-you 的 session/referrer 连续性。
- `purchase` 以 Shopify order/transaction ID 去重，避免客户端与 webhook 双报。
- 退款、取消、退货、运费、税费分开建模。

### Search Console

- 正式域名用 Domain property。
- 仅生产站提交 sitemap。
- 每周按页面类型聚合查询：Furniture type、Room/task、Material/construction、Custom project、Brand。
- GSC 查询不用于识别个人，也不等同订单归因。

### CRM / RFQ

- 生产 RFQ 需要 lead ID、reference、owner、status、qualification、quote ID、order ID、lost reason、timestamps。
- 状态建议：`new -> reviewing -> needs_info -> qualified -> quoted -> won/lost`。
- 自由文本留在 CRM，不复制到分析平台。

## 6. UTM 规则

统一小写、短横线命名：

- `utm_source`: google, pinterest, instagram, newsletter, designer-outreach, partner
- `utm_medium`: organic-social, paid-social, cpc, email, referral, outreach
- `utm_campaign`: `2026-fall-living`, `sideboard-launch`, `designer-materials`
- `utm_content`: 具体素材/版位，如 `haven-room-green`, `material-corner-detail`
- `utm_term`: 仅付费关键词；不写个人信息

原始 UTM 在首次会话与 CRM 线索上保留，页面 canonical 始终丢弃 UTM。内部链接不得使用 UTM。

## 7. KPI 定义

| KPI | 公式 | 用途 |
| --- | --- | --- |
| PDP engagement | 有 option/scroll/CTA 交互的 PDP session / PDP session | 判断信息与产品兴趣 |
| Add-to-cart rate | unique session with add_to_cart / unique PDP session | 标准款意向 |
| Checkout completion | unique purchase / unique begin_checkout | 商城排障 |
| RFQ start rate | unique rfq_start / eligible PDP + custom-project sessions | 定制入口吸引力 |
| RFQ completion | valid unique rfq_submit / unique rfq_start | 表单与信息负担 |
| RFQ qualification | unique qualified_rfq / unique valid rfq_submit | 流量与表单质量 |
| Quote rate | unique quote_issued / unique qualified_rfq | 销售承接 |
| Project win rate | unique won_project / unique quote_issued | 商业匹配 |
| Content-assisted conversion | 内容入口后窗口内 purchase/qualified RFQ / eligible content entrances | 内容业务贡献 |
| Return rate | unique returned order lines / fulfilled order lines | 产品/尺寸/预期问题 |
| Damage incident rate | unique damaged shipments / delivered shipments | 包装与承运质量 |

所有分子分母同时显示。低量 RFQ/项目采用 28-90 天窗口，不根据一周波动下结论。

## 8. 报表

### 每周运营板

- 流量按 source/medium、landing page、device、market。
- Furniture type 与 PDP 浏览、option、Cart、Checkout。
- Custom Projects 与 RFQ start/submit/qualified。
- 站内搜索 top terms、zero-result terms、工业错位词。
- 页面错误、Core Web Vitals、表单/API 错误。

### 每月决策板

- 标准购买与定制项目分开显示收入、毛利、获客成本。
- 渠道的 purchase + qualified RFQ 成本。
- 家具类型、颜色、尺寸和房间内容的贡献。
- RFQ lost reasons：价格、尺寸、材料、交期、配送、无效/不匹配。
- 退货、退款、破损、错色、错尺寸和客服主题。

## 9. QA 清单

- [ ] 同意前不加载受限制的分析/广告/录屏
- [ ] 所有 RFQ 输入和上传区域在录屏中遮罩
- [ ] 事件不含 PII、文件名或自由文本
- [ ] item/SKU/variant ID 与 Shopify 一致
- [ ] finish/size 选择更新 Cart 行项目和事件属性
- [ ] Checkout 跨域 session/referrer 实测
- [ ] purchase webhook/客户端不重复
- [ ] RFQ 201、422、413、415 分别验证
- [ ] reference/lead/order 去重规则有效
- [ ] Prototype 流量与生产报表隔离
- [ ] UTM 与 canonical 规则实测
- [ ] Dashboard 显示分子、分母、绝对量和时间窗口
