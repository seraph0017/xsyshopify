# TIDEFORM 家具商店用户使用手册

版本：2026-08-08 prototype（实现与复审完成）

## 1. 适用范围

本手册对应 TIDEFORM Next.js 商店原型。当前商品是由铝型材骨架和海洋级板材表面组合而成的成品或可配置家具，包括玄关桌、餐边柜、电视柜、置物架、工作桌和长凳。

`海洋级板材 / marine-grade panel` 是中性工作名称。具体基材、厚度、表面系统、封边、护理方法和性能数据仍需供应商确认。页面中的价格、尺寸、颜色、库存、运输和交付信息均为原型资料，不构成正式订单或生产承诺。

## 2. 打开商店

本地预览地址：`http://127.0.0.1:3000`

首次运行时，在项目目录执行：

```bash
corepack enable
pnpm install
pnpm dev
```

开发命令、路由、环境变量和验证状态见 [项目 README](../README.md)；设计、策略和 QA 资料见 [文档索引](./README.md)。

桌面端顶部导航包含：

- `Furniture`：全部家具目录。
- `Collections`：按空间浏览 Living Collection。
- `Materials`：查看铝框架与海洋级板材的材料边界。
- `Custom Projects`：了解定制家具流程。
- 搜索图标：搜索家具、材料和规划指南。
- 购物车图标：查看标准配置预览。
- `Request a Quote`：进入定制家具询价。

移动端点击右上角菜单图标后，可打开 Furniture、Collections、Materials、Custom Projects 和 Request a Quote。

## 3. 浏览和筛选家具

1. 点击首页的 `Shop furniture` 或顶部 `Furniture`。
2. 在 `Search catalog` 中输入家具名称或类型，例如 `console`、`shelf` 或 `table`。
3. 使用筛选项缩小结果：
   - `Furniture type`：家具类型。
   - `Width`：宽度范围。
   - `Panel finish`：板面颜色。
   - `Frame finish`：铝框架饰面或表面处理。
   - `Catalog status`：标准配置或定制审核路径。
   - `Order path`：标准购买预览或 Custom Project。
4. 移动端先点击 `Filters` 展开筛选项。
5. 点击 `Clear all filters` 恢复完整目录。

筛选条件会写入页面 URL，便于保留当前视图。未知筛选值会被忽略，不会把目录错误地变成空结果。

## 4. 查看商品和标准配置

进入商品详情页后，可查看：

- 家具图片、名称和原型型号。
- 标准尺寸与构造事实表。
- 铝框架和海洋级板材的确认状态。
- 配送、护理、组装和测量边界。
- 标准配置或 Custom Project 路径。

对于标准配置家具：

1. 在 `Size` 中选择尺寸。
2. 在 `Panel finish` 中选择板面颜色。
3. 使用减号、数量输入框或加号调整数量。
4. 检查显示的 prototype price。
5. 点击 `Add to cart`。

购物车会显示家具名称、尺寸、颜色、数量、单价和预览小计。点击加减按钮调整数量，点击删除图标移除商品，点击右上角关闭按钮返回详情页。

`Preview checkout handoff` 只演示未来 Shopify Checkout 的交接位置。当前不会创建支付、订单、税费、库存扣减或物流记录。

## 5. 发起定制家具项目

以下情况使用 Custom Project：

- 需要其他宽度、深度或高度。
- 需要不同板面颜色或颜色匹配。
- 需要调整开放格、门、搁板或工作表面。
- 需要多个家具或项目数量。
- 房间、楼梯、电梯、门洞或运输路径有特殊限制。

操作步骤：

1. 点击 `Customize a piece`、`Custom Projects` 或 `Request a Quote`。
2. 填写联系人和目的地：姓名、工作邮箱、国家、邮编；公司或工作室可选。
3. 填写家具信息：家具类型、板面颜色、目标尺寸、数量、时间和房间/配置需求。
4. 可选择 PDF、PNG、JPG、JPEG 或 ZIP 文件，最多 5 个，每个不超过 25 MB。
5. 勾选确认框后点击 `Submit custom project`。
6. 提交通过后保存页面显示的 `TF-...` 参考号。

原型只把所选文件的名称、大小和 MIME 类型作为元数据用于本地验证；文件字节不会上传或保存。成功提示表示表单结构通过验证，不表示材料、可行性、价格、时间或交付已经确认。

## 6. 搜索

1. 点击顶部搜索图标。
2. 输入家具、空间、材料或指南关键词。
3. 点击 `Search` 或按 Enter。
4. 结果页会分别显示 Furniture 和 Collections and guides。

搜索分析只记录经过规范化的短查询和结果数量。疑似邮箱、电话号码、URL 或过长内容会记录为 `redacted`，不进入分析事件。

## 7. 材料、测量和支持指南

### Materials

用于了解铝框架和海洋级板材在家具中的可见作用，以及生产前仍需确认的板材、连接、五金、表面和护理资料。页面不会把防水、户外、载荷、认证或耐久数据作为已验证事实。

### Resources

用于整理房间、配送路径、组装、固定和护理问题。最终操作必须以对应生产家具的批准说明书为准。

### Measuring for furniture

测量时至少记录：

- 家具位置的可用宽度、深度和高度。
- 踢脚线、插座、开关、通风口、窗台和地面坡度。
- 门、抽屉、椅子和通行所需净空。
- 门洞、走廊、转角、楼梯、电梯和门槛。
- 带测量点的照片或平面图。

测量指南帮助整理输入，不替代最终尺寸、包装、现场或安装复核。

## 8. 键盘和辅助功能

- 按 Tab 可依次访问导航、筛选、规格、购物车和表单控件。
- 页面开头提供 `Skip to main content` 跳过导航。
- 搜索展开后焦点进入搜索框。
- 购物车打开后焦点进入关闭按钮；关闭后返回原触发按钮。
- RFQ 校验失败时焦点进入第一个错误字段。
- RFQ 成功后焦点进入参考号标题，读屏软件会播报成功区域。
- 颜色圆点旁同时提供可见颜色名称，颜色不是唯一识别方式。

## 9. 常见问题

### 购物车里的价格可以支付吗？

当前价格只用于验证规格和购物车流程。Shopify Checkout、税费、库存、运输和支付尚未连接。

### `Standard configuration` 表示有现货吗？

不是。它表示当前原型提供了可演示的标准尺寸和颜色路径，不表示库存或交期已经确认。

### 图片能证明最终颜色和材料吗？

不能。图片用于表达家具形态和空间方向。最终交付应以批准样品、供应商规格和生产文件为准。

### 提交 Custom Project 后会自动下单吗？

不会。参考号只表示原型接收了结构化项目资料。生产系统仍需增加持久化存储、负责人、通知、报价、审批和订单流程。

### 页面没有匹配结果怎么办？

清除筛选、缩短搜索词，或使用 Custom Project 描述所需家具类型、尺寸和颜色。

## 10. 原型发布边界

- 全站保持 `noindex,follow`。
- sitemap 为空。
- 不输出实体 JSON-LD。
- 生产模式先要求完整的站点身份记录；站点通过后，首页可索引并输出站点级 Schema，商品和内容再按各自证据逐实体放行。
- 正式上线前还需接入真实 Shopify 商品、库存、Checkout、政策、公司与联系信息、RFQ 存储和通知。

### 生产发布配置

生产构建需要同时设置：

- `SITE_MODE=production`
- `SITE_URL=https://正式域名`
- `APPROVED_PRODUCTION_DOMAIN=正式域名`
- `SITE_EVIDENCE_GATE=approved`

`SITE_URL` 必须是无路径、查询参数、片段和端口的 HTTPS origin，主机名必须与 `APPROVED_PRODUCTION_DOMAIN` 精确一致。localhost、IP 地址以及 `.test`、`.example`、`.invalid`、`.localhost` 保留域名不会进入生产发布。`NEXT_PUBLIC_SITE_URL` 如仍存在，必须与 `SITE_URL` 完全相同。

`SITE_MODE` 缺失、大小写错误或使用其他值时，系统回落到 prototype：全站 `noindex,follow`、空 sitemap、零实体 JSON-LD。若明确设置为 production，但缺少域名闸门或完整的站点身份记录，构建会直接报错。

### 分层证据门禁

- 站点身份通过后：首页可索引，并可输出 `Organization`、`WebSite`。
- 内容实体通过后：对应目录、系列、材料、资源、定制或 RFQ 页面才可索引并输出其页面级 Schema。
- 商品实体通过后：对应 PDP 才进入 sitemap 并输出 `Product`；未验证商品不会进入目录 `ItemList`。
- 当前尚未实现交易证据类型或门禁，因此不输出 `Offer`；接入真实价格、币种、库存和 Checkout 时需补充交易证据校验后再发布 commerce Schema 或 feed。

### 发布核验

1. 运行 `pnpm test && pnpm lint && pnpm build`。
2. 在 prototype 预览中检查页面 `<meta name="robots">` 为 `noindex,follow`。
3. 打开 `/sitemap.xml`，确认 prototype 为空；production 只包含通过证据门禁的首页、内容页和商品页。
4. 检查页面源代码中的 `application/ld+json`：prototype 应为 0；production 只能出现与当前实体证据对应的 Schema。
5. 检查 canonical 使用干净正式域名；搜索、筛选和 RFQ confirmation 页面继续保持 `noindex,follow`，且不进入 sitemap。
