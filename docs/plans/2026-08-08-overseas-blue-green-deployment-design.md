# 海外服务器蓝绿部署设计

状态：2026-08-08 已确认。

## 目标

为 TIDEFORM Next.js 独立站建立一套适合海外单机云服务器的可重复部署流程。发布产物使用私有容器镜像，候选版本先完成健康检查和烟雾测试，再由 Nginx 切换流量；旧版本保留用于快速回滚。

## 参考与取舍

部署结构参考 `~/Projects/apigateway/Fy-api` 的生产脚本：明确版本镜像、loopback 端口、Nginx TLS、蓝绿容器、切流前健康检查、旧容器排空和发布日志。

本项目不复制 Fy-api 的高并发网关参数、托管数据库、Redis、SLS、长连接超时和大规格资源限制。TIDEFORM 当前是单实例 Next.js 商店原型，首版只实现与其风险相匹配的容器、反向代理、健康检查、日志、回滚和验证。

## 目标架构

```text
Internet
   |
   v
Nginx :80/:443 + Let's Encrypt
   |
   +-- active upstream --> 127.0.0.1:3101 (tideform-blue)
   |                   or 127.0.0.1:3102 (tideform-green)
   |
   v
Next.js standalone container
```

- 容器内部监听 `3000`。
- blue/green 只绑定宿主 loopback，不直接暴露公网。
- Nginx 终止 TLS，转发 `Host`、`X-Real-IP`、`X-Forwarded-*` 和 `Accept`。
- Nginx 对 Next.js streaming 关闭代理缓冲，并设置适合普通网页/RFQ 的请求体和超时边界。
- 候选容器通过 `/api/health` 和代表页面烟雾测试后才切换 upstream。
- 切换后旧容器停止但暂不删除，发布日志记录镜像、颜色、端口和时间。

## 镜像与 Registry

默认使用 GitHub Container Registry 私有镜像：

```text
ghcr.io/OWNER/xsyshopify:TAG
```

GitHub Actions 使用仓库内置 `GITHUB_TOKEN` 构建并推送，服务器使用仅有 `read:packages` 权限的凭据拉取。工作流同时发布不可变 commit SHA tag 和人工指定的 release tag，不以 `latest` 作为唯一部署标识。

部署脚本只接收完整 `IMAGE` 引用，不写死 GHCR，因此后续可以切换 Docker Hub、云厂商 Registry 或 Harbor。私有 Packages 的免费额度适合当前低频发布；需要设置版本保留策略，至少保留当前、上一版和少量已验证历史版本。

## Next.js 构建契约

`next.config.ts` 使用 `output: "standalone"`。Docker 多阶段构建复制：

- `.next/standalone`
- `.next/static`
- `public`

运行阶段使用非 root 用户，设置 `NODE_ENV=production`、`HOSTNAME=0.0.0.0` 和 `PORT=3000`。

当前 SEO 发布配置会参与静态页面构建，因此镜像按发布目标构建：

- 默认 prototype 镜像：`SITE_MODE=prototype`，保持全站 `noindex,follow`、空 sitemap 和零实体 JSON-LD。
- production 镜像：在构建期传入 `SITE_MODE`、`SITE_URL`、`APPROVED_PRODUCTION_DOMAIN`、`SITE_EVIDENCE_GATE`，运行期使用相同值。

这些变量不包含秘密，但必须一致。production 构建仍受现有站点和逐实体 evidence 门禁约束；正式证据未完成时构建应失败，不通过部署脚本绕过。

## 部署资产

计划增加：

- `Dockerfile`：pnpm/Next.js standalone 多阶段镜像。
- `.dockerignore`：排除本地依赖、构建产物、测试产物、Git、输出文件和环境文件。
- `compose.prod.yml`：单容器应急/首次验证入口，使用明确 `IMAGE` 和 loopback 端口。
- `.github/workflows/container.yml`：手动或 tag 触发的 GHCR 构建与推送。
- `src/app/api/health/route.ts`：无外部依赖的 liveness/readiness 响应。
- `scripts/prod/`：服务器初始化、Nginx/TLS、首次部署、蓝绿升级、烟雾测试和本地部署资产校验。
- `docs/deployment-guide.md`：端到端中文 runbook。

## 脚本行为

所有生产脚本使用 `set -euo pipefail`，具备以下性质：

- 参数和依赖缺失时显式失败。
- 环境文件要求权限 `600`，日志不输出变量值或 Registry 凭据。
- 远端部署以完整 `IMAGE` 为输入，先拉取并记录 image ID/digest。
- 候选容器健康检查失败时保留当前流量，不修改 Nginx。
- Nginx 配置变更先备份，执行 `nginx -t` 后才 reload；失败时恢复备份。
- 部署完成后输出观察、回滚和清理命令。
- 支持 `DRY_RUN=1` 或独立校验入口，让 CI/本地验证参数和生成配置而不访问真实服务器。

## 健康与烟雾测试

`GET /api/health` 返回 HTTP 200、`{"status":"ok"}` 和 `Cache-Control: no-store`，不泄露环境变量、版本、主机或依赖信息。

切流前至少检查：

1. `/api/health` 返回预期 JSON。
2. `/`、`/products` 和 `/rfq` 返回成功状态。
3. `/robots.txt`、`/sitemap.xml` 与目标发布模式一致。
4. prototype 模式首页保持 `noindex`；production 模式再执行 evidence/域名专项核验。

## 安全边界

- 服务器只开放 SSH、80 和 443；3101/3102 不对公网开放。
- Registry 密码或 Token 只进入服务器认证存储和 GitHub Secrets，不进入仓库、镜像层、命令日志或文档实例。
- 容器默认使用非 root、`no-new-privileges`、capability drop 和只读根文件系统；仅 `/tmp` 与 Next.js 缓存目录使用受控临时写层。
- Nginx 配置包含 HSTS、`X-Content-Type-Options`、`Referrer-Policy` 和合理的请求体限制。
- RFQ 当前仍是 metadata-only 原型；部署完成不代表持久化、附件存储或通知能力已经具备。

## 测试与验收

- 健康接口先写失败测试，再实现路由。
- 部署脚本通过 `bash -n`，关键参数/状态机由自动化测试覆盖。
- Compose 配置可解析，Docker prototype 镜像可构建并启动。
- 容器内健康检查通过，代表页面和 prototype SEO 门禁通过烟雾测试。
- `pnpm test`、`pnpm lint`、`pnpm build` 和既有 E2E 保持通过。
- README、文档索引和部署手册链接有效。
- 部署正确性、安全性、运维文档三路 agent 复审，Critical、Important、Minor 全部清零。

## 非目标

- 本轮不实际创建云服务器、域名、DNS、GHCR 凭据或生产 evidence。
- 本轮不引入 Kubernetes、多节点共享缓存、数据库、Redis、集中日志平台或自动扩缩容。
- 本轮不把 prototype 直接切换为 production，也不修改现有商品和内容事实门禁。

