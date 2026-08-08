# 海外服务器蓝绿部署实施计划

> **For Claude:** REQUIRED SUB-SKILL: Use superpowers:executing-plans to implement this plan task-by-task.

**Goal:** 为 TIDEFORM 增加基于 GHCR 私有镜像、Podman、Nginx 和双端口蓝绿切换的海外单机部署代码、验证和中文运维手册。

**Architecture:** Next.js 使用 standalone 多阶段镜像，GitHub Actions 生成明确版本的私有 GHCR 镜像。生产服务器只在 loopback 运行 blue/green 容器，Nginx 负责 TLS 和公网入口；候选容器先通过健康检查及代表页面烟雾测试，再切换 upstream，并保留旧容器用于回滚。

**Tech Stack:** Next.js 16 App Router、TypeScript、Vitest、pnpm、Docker/Podman、GitHub Actions/GHCR、Bash、Nginx、Certbot。

---

### Task 1: 健康检查契约

**Files:**
- Create: `src/app/api/health/route.test.ts`
- Create: `src/app/api/health/route.ts`

**Step 1: 写失败测试**

测试直接调用 `GET()`，要求：

- HTTP 200。
- JSON 严格等于 `{ status: "ok" }`。
- `Cache-Control` 包含 `no-store`。
- 响应正文不出现 hostname、版本、环境变量或依赖状态。

**Step 2: 验证测试先失败**

Run: `pnpm test src/app/api/health/route.test.ts`

Expected: FAIL，因为 route 尚不存在。

**Step 3: 实现最小路由**

使用 App Router `Response.json()` 返回固定 liveness/readiness 结果和 no-store header。当前应用没有数据库或持久化依赖，健康接口不做外部探测。

**Step 4: 验证测试通过**

Run: `pnpm test src/app/api/health/route.test.ts`

Expected: PASS。

### Task 2: Standalone 容器镜像与 Compose

**Files:**
- Modify: `next.config.ts`
- Create: `Dockerfile`
- Create: `.dockerignore`
- Create: `compose.prod.yml`
- Create: `tests/deployment/assets.test.ts`

**Step 1: 写部署资产失败测试**

测试读取配置并断言：

- Next 配置包含 `output: "standalone"`。
- Dockerfile 使用多阶段构建、固定 Node/pnpm 版本、非 root 用户、复制 `public` 和 `.next/static`、包含 healthcheck。
- `.dockerignore` 排除 `.env*` 且重新允许 `.env.example`，同时排除 Git、本地依赖、构建和测试产物。
- Compose 只把容器端口绑定到 `127.0.0.1`，要求明确 `IMAGE`，使用 env file、healthcheck、日志轮转和基础容器加固。

**Step 2: 验证测试先失败**

Run: `pnpm test tests/deployment/assets.test.ts`

Expected: FAIL，因为部署资产尚不存在或 standalone 未开启。

**Step 3: 实现镜像和 Compose**

Dockerfile：

- 使用 Node 24 LTS Alpine builder/runner。
- 全局安装与 `packageManager` 一致的 pnpm 11.20.0。
- `pnpm install --frozen-lockfile` 和 `pnpm build`。
- 只接收非敏感 SEO build args；prototype 为默认。
- runner 使用 `nextjs` 非 root 用户、`HOSTNAME=0.0.0.0`、`PORT=3000`。
- healthcheck 使用 Node 内置 `fetch` 请求 `/api/health`。

Compose：

- `image: ${IMAGE:?IMAGE is required}`。
- 默认绑定 `127.0.0.1:3101:3000`。
- env file 默认 `/opt/tideform/config/tideform.env`。
- `read_only`、`no-new-privileges`、drop all capabilities、tmpfs、pids/memory/CPU 边界和日志轮转。

**Step 4: 验证**

Run: `pnpm test tests/deployment/assets.test.ts && pnpm build`

Expected: PASS，Next 构建包含 `/api/health`。

### Task 3: GHCR 私有镜像工作流

**Files:**
- Create: `.github/workflows/container.yml`
- Modify: `tests/deployment/assets.test.ts`

**Step 1: 扩展失败测试**

要求工作流：

- 仅手动触发或明确 `deploy-*` tag 触发。
- 最小权限 `contents: read`、`packages: write`。
- 登录 `ghcr.io` 使用 `github.actor` 和 `GITHUB_TOKEN`。
- 推送 release tag 和 commit SHA tag，不只推 `latest`。
- 将 site mode/domain/evidence 非敏感变量作为 Docker build args。
- production 参数缺失时在 build 前显式失败。
- Action 固定到具体 commit SHA，并在注释中记录版本。

**Step 2: 验证测试先失败**

Run: `pnpm test tests/deployment/assets.test.ts`

Expected: FAIL，因为 workflow 尚不存在。

**Step 3: 实现工作流**

默认镜像名为 `ghcr.io/${{ github.repository_owner }}/xsyshopify`。workflow_dispatch 接收 `image_tag`、`site_mode`、`site_url`、`approved_domain` 和 `evidence_gate`；tag 触发使用 repository variables。禁止在 workflow 中回显 Token。

**Step 4: 验证**

Run: `pnpm test tests/deployment/assets.test.ts`

Expected: PASS。

### Task 4: 部署脚本核心与状态机

**Files:**
- Create: `scripts/prod/lib.sh`
- Create: `scripts/prod/03-deploy-first.sh`
- Create: `scripts/prod/04-deploy-blue-green.sh`
- Create: `scripts/prod/05-smoke-test.sh`
- Create: `tests/deployment/scripts.test.ts`

**Step 1: 写 shell 行为失败测试**

通过 `bash` 调用 `lib.sh` 纯函数，覆盖：

- `blue <-> green` 映射。
- blue/green 端口分别为 3101/3102。
- 拒绝空镜像、`latest` 和不含 tag/digest 的镜像引用。
- 从 Nginx 标记解析 active color，并拒绝非法标记。
- smoke 脚本在不支持的 site mode 下失败。

资产测试同时要求所有脚本使用 strict mode、引用完整 `IMAGE`、绑定 loopback、候选健康后才修改 Nginx，并提供回滚说明。

**Step 2: 验证测试先失败**

Run: `pnpm test tests/deployment/scripts.test.ts tests/deployment/assets.test.ts`

Expected: FAIL，因为脚本尚不存在。

**Step 3: 实现共享库、首次部署和蓝绿升级**

- `/opt/tideform/config/tideform.env` 必须存在且权限为 600。
- 首次部署启动 blue，健康通过后写发布日志。
- 蓝绿升级从 Nginx `# active-color:` 读取当前颜色，启动另一个颜色。
- 候选容器使用非 root 镜像并附加 Podman 加固、资源和日志参数。
- 60 秒健康轮询与代表页面 smoke 通过后备份 Nginx、精确替换 active marker/upstream port、`nginx -t`、reload。
- Nginx 验证/reload 失败时恢复备份；候选失败时保持当前 upstream。
- 切换成功后等待短暂排空，再停止旧容器但保留。

**Step 4: 验证**

Run: `pnpm test tests/deployment/scripts.test.ts tests/deployment/assets.test.ts`

Expected: PASS。

### Task 5: 服务器初始化和 Nginx/TLS

**Files:**
- Create: `scripts/prod/01-setup-system.sh`
- Create: `scripts/prod/02-setup-nginx.sh`
- Create: `scripts/prod/nginx/tideform.conf.template`
- Modify: `tests/deployment/assets.test.ts`

**Step 1: 扩展失败测试**

断言：

- 初始化脚本支持 apt/dnf，安装 Podman、Nginx、Certbot、curl、jq、logrotate，创建 `/opt/tideform/{config,backup,scripts}`，config 权限为 700。
- 防火墙只开放 80/443，不开放 3101/3102。
- Nginx 模板包含 active marker、loopback upstream、HTTP 到 HTTPS、ACME、TLS、安全头、转发 headers、`Accept`、关闭 buffering、1 MiB body limit 和本地 status 页面。
- setup 脚本要求 root、DOMAIN、EMAIL，先生成 HTTP challenge 配置，证书成功后安装生产模板，运行 `nginx -t` 再 reload，并启用续期。

**Step 2: 验证测试先失败**

Run: `pnpm test tests/deployment/assets.test.ts`

Expected: FAIL，因为初始化和 Nginx 资产尚不存在。

**Step 3: 实现系统和代理脚本**

保持脚本幂等，不修改与本应用无关的全局内核参数。Nginx 配置备份写入 `/opt/tideform/backup`，证书申请失败时保留 HTTP challenge 配置并给出诊断命令。

**Step 4: 验证 shell 和资产**

Run: `find scripts/prod -type f -name '*.sh' -print0 | xargs -0 -n1 bash -n && pnpm test tests/deployment`

Expected: PASS。

### Task 6: 中文部署手册与导航

**Files:**
- Create: `docs/deployment-guide.md`
- Modify: `README.md`
- Modify: `docs/README.md`
- Modify: `.env.example`
- Create: `scripts/prod/README.md`

**Step 1: 编写端到端 runbook**

覆盖：

- GHCR 私有镜像选择、免费额度边界和国内/海外网络取舍。
- GitHub 仓库 Packages 权限、Actions 发布、服务器 read-only 凭据登录。
- prototype/production 构建期与运行期变量一致性。
- Ubuntu/RHEL 首次初始化、DNS、证书、首次部署和 smoke。
- 日常蓝绿发布、观察、回滚、旧镜像清理和 GHCR 保留策略。
- 日志、备份、证书续期、磁盘、健康、502、构建门禁和 Registry 登录排障。
- 当前 RFQ、Shopify、evidence 和交易系统边界。
- 官方来源与 2026-08-08 访问日期。

**Step 2: 更新入口**

README 增加部署命令与手册入口；文档索引增加部署手册；`.env.example` 明确镜像构建期/运行期一致性和部署文件不存秘密。

**Step 3: 验证 Markdown**

Run: Markdown 相对链接检查与 `git diff --check`。

Expected: 所有链接存在，无空白错误。

### Task 7: 容器与全量验证

**Files:**
- Modify: findings from verification

**Step 1: 本地静态验证**

Run:

```bash
pnpm test
pnpm lint
pnpm build
find scripts/prod -type f -name '*.sh' -print0 | xargs -0 -n1 bash -n
```

**Step 2: Compose 与镜像验证**

在可用的 Docker 或 Podman 环境运行：

```bash
ENV_FILE=.env.example IMAGE=ghcr.io/example/xsyshopify:test docker compose -f compose.prod.yml config
docker build -t xsyshopify:prototype .
docker run --rm -d --name xsyshopify-deploy-test -p 127.0.0.1:3199:3000 xsyshopify:prototype
```

随后检查 `/api/health`、代表页面、robots、sitemap 和 noindex，再删除测试容器。若本机容器引擎条件缺失，记录该项及已完成的替代验证。

**Step 3: E2E**

Run: `pnpm test:e2e`

Expected: 桌面与移动端既有流程通过。

### Task 8: Agent 复审、提交与交接

**Files:**
- Modify: findings from review
- Modify: `docs/plans/2026-08-08-overseas-blue-green-deployment-implementation.md`
- Modify: Obsidian `工作/项目与方案/xsyshopify/项目交接.md`
- Create or merge: Obsidian Session Digest

**Step 1: 三路独立复审**

- 部署正确性：镜像、Next.js 构建/运行配置、蓝绿状态机、健康与回滚。
- 安全/供应链：GHCR 权限、Action pin、凭据、容器权限、Nginx/TLS 和日志泄露。
- 运维/文档：新服务器从零执行、日常发布、故障排查、Registry 额度与术语。

**Step 2: 修复并复审**

修复全部 Critical、Important 和 Minor，重复复审直至三路均为 0。

**Step 3: Completion Record**

记录最终命令、结果、容器验证状态、agent 结果和残余生产前置。

**Step 4: 提交、推送与 Obsidian wrap-up**

提交部署代码和文档，推送 `feat/storefront`，核对本地/远端 HEAD；更新项目交接与 Session Digest，执行 memory consolidate 和 Vault 本地快照。

## Completion Record

完成日期：2026-08-08。

### 已交付

- Next.js standalone 多阶段镜像、固定 Node/pnpm、非 root runner、健康检查、只读运行和 publication labels。
- 私有 GHCR workflow：`linux/amd64` canonical digest-only 推送、Cosign keyless 签名、签名后 release/SHA tag 晋升、精确 Git ref 身份与安全重跑门禁。
- 海外 x86_64 Linux 的 Podman + Nginx/Certbot blue/green 脚本；blue=`127.0.0.1:3101`、green=`127.0.0.1:3102`。
- active=`restart-policy=always`、rollback=`restart-policy=no` 的重启恢复状态机，部署/回滚锁、参数边界、排空、事务切流和失败恢复。
- 中文 README、部署运维手册、脚本说明、环境变量示例和文档索引。

### 最终验证

- `pnpm test`：19 个测试文件，105/105 通过。
- `pnpm lint`：通过。
- `pnpm build`：通过，生成 23 个 App Router 路由。
- `pnpm test:e2e`：desktop/mobile Chromium 12/12 通过。
- 部署定向测试：2 个文件，21/21 通过。
- 全部 `scripts/prod/*.sh` 通过 `bash -n`；workflow 通过 Ruby YAML parser 和 Actionlint 1.7.7。
- `ENV_FILE=.env.example IMAGE=... docker compose -f compose.prod.yml config` 通过。
- 49 个 Markdown 相对链接全部存在；`git diff --check` 通过。
- 真实 `linux/amd64` Docker 镜像构建和 Compose 运行通过：架构 `amd64`、用户 `nextjs`、`restart=always`、只读根文件系统、绑定 `127.0.0.1:32991`、prototype smoke 通过、Docker health=`healthy`、镜像 label `io.tideform.site-mode=prototype`。
- 渲染后的 Nginx 配置已使用 `nginx:1.28-alpine` 执行 `nginx -t`，结果通过。

### 最终复审

- 部署正确性：Critical 0 / Important 0 / Minor 0。
- 安全与供应链：Critical 0 / Important 0 / Minor 0。
- 运维与中文文档：Critical 0 / Important 0 / Minor 0。

### 上线前置

- 在 GitHub `main` 首次运行真实 private GHCR workflow，核对 canonical digest、Cosign 签名、release/SHA tags 和 Actions Summary。
- 在运维工作站完成私有 GHCR 登录和 `cosign verify`，把精确 digest 记入服务器 production 环境。
- 在目标海外服务器完成 DNS、云/主机防火墙、Let's Encrypt、首次部署、外部 smoke、reboot 和 rollback 演练。
- 正式品牌、主体、政策、材料与逐商品 evidence 未齐前继续使用 prototype 门禁。
