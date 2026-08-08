# TIDEFORM 文档索引

本目录记录 TIDEFORM 家具商店原型的产品边界、实现、操作、发布控制、营销策略和验证结果。

## 使用与操作

- [中文用户使用手册](./user-guide.md)：目录、PDP、购物车、RFQ、搜索、辅助功能、发布门禁，以及 SEO/GEO 快速操作。
- [SEO/GEO 操作手册](./seo-geo-operations-guide.md)：关键词与页面地图、内容制作、证据审核、生产发布、GSC/Bing 提交、GEO、监测和复盘的完整 SOP。
- [海外单机部署与运维手册](./deployment-guide.md)：私有 GHCR、服务器初始化、Nginx/TLS、蓝绿发布、回滚、监控、备份和故障排查。
- [生产部署脚本说明](../scripts/prod/README.md)：脚本执行顺序、默认路径、状态机和可覆盖参数。
- [仓库 README](../README.md)：本地启动、命令、路由、项目结构和当前验证状态。

## 产品与实现

- [商店设计](./plans/2026-08-08-tideform-furniture-storefront-design.md)：产品定位、体验模型、信息架构、证据规则和验收标准。
- [实施计划](./plans/2026-08-08-tideform-furniture-storefront-implementation.md)：已完成的实施任务和最终验证记录。
- [中文 README 与 SEO/GEO 手册设计](./plans/2026-08-08-chinese-readme-seo-geo-manual-design.md)：本轮文档分层与验收标准。
- [海外蓝绿部署设计](./plans/2026-08-08-overseas-blue-green-deployment-design.md)：GHCR、Podman、Nginx 和失败恢复的架构取舍。
- [海外蓝绿部署实施计划](./plans/2026-08-08-overseas-blue-green-deployment-implementation.md)：部署资产、验证步骤和复审记录。

当前产品定义是由铝型材骨架与海洋级板材表面共同构成的成品或可配置家具，不销售裸铝型材。`Marine-grade panel / 海洋级板材` 在供应商批准准确材料与性能记录前只作为中性工作名称。

## 策略

- [SEO/GEO 策略](./strategy/seo-geo-plan.md)：页面意图、结构化内容、证据模型和发布门禁；负责“为什么做、做什么”。
- [90 天营销方案](./strategy/marketing-plan.md)：受众、Offer、渠道、视觉资产和阶段推进。
- [测量与分析方案](./strategy/measurement-plan.md)：漏斗、事件契约、数据最小化、工具、KPI 和 QA。

SEO/GEO 的日常执行以操作手册为准，策略取舍以策略文档为准，代码和测试是当前发布行为的最终事实源。

## 质量

- [视觉一致性台账](./qa/fidelity-ledger.md)：参考对比、主动偏差、响应式检查、自动化验证和独立复审结果。

## 生产前仍需提供

1. 供应商批准的板材基材、厚度、饰面、封边、护理、性能、适用环境和认证。
2. 每个 SKU 的铝合金/饰面、连接件、五金、尺寸、包装、组装、锚固和图片权利。
3. 正式品牌、销售主体、公开联系信息、政策、域名和内容负责人。
4. 真实 Shopify 商品、变体、价格、库存、市场、Checkout、税费、运输和退换行为。
5. RFQ 持久化、附件存储、通知、负责人、报价、审批和订单流程。
6. 逐 SKU 的 HTS、Section 232、AD/CVD scope、包装、长件运输和 landed cost 核对。
