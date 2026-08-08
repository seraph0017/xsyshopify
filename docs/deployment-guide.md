# 海外单机部署与运维手册

本文用于把 TIDEFORM 部署到海外 Linux 单机。标准方案是 GitHub Actions 构建私有 GHCR 镜像，服务器用 Podman 运行 blue/green 两个槽位，Nginx 提供 HTTPS 公网入口。

## 1. 架构与边界

```text
Git tag / 手动发布
        |
        v
GitHub Actions -> private GHCR image
                         |
                         v
Internet -> Nginx :80/:443 -> 127.0.0.1:3101 blue
                              127.0.0.1:3102 green
```

- blue 固定使用 `127.0.0.1:3101`，green 固定使用 `127.0.0.1:3102`。
- 3101/3102 只绑定 loopback；应用公网入口只开放 80/443，SSH 仅向管理来源开放。
- 新版本先在非活动槽位完成健康检查和页面 smoke，再切换 Nginx。
- 切换后旧容器停止但保留，便于快速回滚。
- 当前没有数据库、持久化 RFQ、Shopify Checkout 或订单系统。
- prototype 必须继续输出 `noindex,follow`、空 sitemap 和零实体 JSON-LD。production 只有在正式资料和 evidence 完成后才启用。

## 2. 镜像仓库选择

默认镜像地址：

```text
ghcr.io/OWNER/xsyshopify:TAG
```

推荐 GHCR 是因为源代码和 Actions 已在 GitHub，海外服务器拉取路径短，package 可以保持私有。GitHub 官方在 2026-08-08 的说明中写明 Container Registry 的镜像存储和带宽当前免费，并承诺政策变化至少提前一个月通知；同一计费文档也列出通用 Packages/Actions 套餐额度，因此仍应查看 Billing 页面并控制历史版本数量，不把“当前免费”当作永久 SLA。

部署脚本接收完整 `IMAGE`，也能使用 Docker Hub、阿里云 ACR、腾讯云 TCR 或自建 Harbor。对于海外服务器，GHCR 是默认选择；国内镜像仓库更适合作为中国大陆机器的缓存或独立发布目标。社区免费版、个人版或试用额度不等于生产 SLA。

建议保留当前线上镜像、上一个可回滚镜像、最近 3 个已验证历史镜像，以及对应的 `sha-COMMIT_SHA` 审计标签。

## 3. 发布前准备

### 3.1 服务器与网络

建议起点：x86_64 的 Ubuntu 24.04 LTS、Debian 12 或 Rocky Linux 9，2 vCPU、2 GB 内存、20 GB 系统盘。当前 workflow 只发布 `linux/amd64`；ARM 实例不在本轮支持范围。服务器需要固定公网入口，域名 A/AAAA 记录已指向服务器，云防火墙入站只开放 SSH 管理来源、TCP 80 和 TCP 443。

```bash
dig +short store.example.com A
dig +short store.example.com AAAA
```

存在 AAAA 记录时，IPv6 也必须真正到达该服务器，否则 Let's Encrypt HTTP-01 校验可能失败。

### 3.2 GitHub Packages 权限

工作流 [`.github/workflows/container.yml`](../.github/workflows/container.yml) 使用仓库 `GITHUB_TOKEN` 推送镜像，权限为：

```yaml
permissions:
  contents: read
  packages: write
  id-token: write
```

`id-token: write` 只用于 Cosign keyless 获取 GitHub OIDC 身份并签名镜像 digest；服务器仍不持有签名密钥。

首次发布后，在 GitHub package 设置中确认：

1. 可见性为 `Private`。
2. package 已连接 `xsyshopify` 仓库。
3. Actions repository access 包含当前仓库。
4. 部署账号只有读取该 package 所需的访问权。

服务器 Token 使用 classic PAT，scope 只选 `read:packages`。不要给服务器 Token 配置 `write:packages`、`delete:packages` 或仓库管理权限；组织启用 SSO 时需完成 SSO 授权。

## 4. 构建和推送镜像

### 4.1 prototype 镜像

进入 **Actions > Build private deployment image > Run workflow**：

```text
image_tag: 2026.08.08-1
site_mode: prototype
site_url: 留空
approved_domain: 留空
evidence_gate: 留空
```

也可推送明确部署 tag，`deploy-` 前缀会被移除后作为镜像 tag：

```bash
git tag deploy-2026.08.08-1
git push origin deploy-2026.08.08-1
```

工作流全局串行。它先以 canonical digest-only 方式推送构建结果，不创建可部署 tag；完成 Cosign 签名后才把同一 digest 晋升为 release tag 和 commit SHA tag。已有 tag 只有在 digest 已通过本次精确 Git ref 的 workflow identity 验签、revision、source 和五项 publication labels 也匹配时才会用于安全重跑，冲突或来源不明时停止。成功后发布：

```text
ghcr.io/OWNER/xsyshopify:2026.08.08-1
ghcr.io/OWNER/xsyshopify:sha-FULL_COMMIT_SHA
```

部署脚本拒绝无 tag、无 digest 和 `latest` 镜像。Actions Summary 会输出唯一 digest；发布记录和 production 部署以 digest 为准，tag 只用于人类查找。

### 4.2 production 镜像

SEO 配置会参与 Next.js 静态构建，构建期和运行期必须一致：

production 只允许在 GitHub Actions 中选择受保护的 `main`，通过 **Run workflow** 手动构建；功能分支和 `deploy-*` tag 只能构建 prototype。这样 Cosign 的 production 身份可精确限制到 `container.yml@refs/heads/main`。

```text
site_mode: production
site_url: https://store.example.com
approved_domain: store.example.com
evidence_gate: approved
```

正式主体、域名、内容和商品证据未完成前保持 prototype。完整发布门禁见 [SEO/GEO 操作手册](./seo-geo-operations-guide.md)。

production 还需在运维工作站验证免费的 Cosign keyless 签名。macOS 或已安装 Homebrew 的 Linux 可执行 `brew install cosign`；其他 Linux 按 [Cosign 官方安装说明](https://docs.sigstore.dev/cosign/system_config/installation/)安装稳定版并校验官方 checksum。先确认版本与私有 GHCR 登录：

```bash
cosign version  # 当前 workflow 使用 v3；工作站保持同一 major
read -rsp 'GHCR read:packages token: ' GHCR_TOKEN
printf '\n'
printf '%s' "$GHCR_TOKEN" | docker login \
  --username GITHUB_USERNAME --password-stdin ghcr.io
unset GHCR_TOKEN
docker buildx imagetools inspect \
  ghcr.io/OWNER/xsyshopify@sha256:DIGEST >/dev/null
```

工作站 Token 也只授予 `read:packages`。上述 Docker 登录把凭据写入工作站的 Docker credential store，Cosign 验证私有 manifest 时会复用它；不要打印 Token 或把它写进仓库。把 `OWNER` 和 digest 替换为 Actions Summary 的值：

```bash
cosign verify \
  --certificate-identity \
  'https://github.com/OWNER/xsyshopify/.github/workflows/container.yml@refs/heads/main' \
  --certificate-oidc-issuer 'https://token.actions.githubusercontent.com' \
  ghcr.io/OWNER/xsyshopify@sha256:DIGEST
```

验证成功后把 `sha256:DIGEST` 记入服务器 `SIGNATURE_VERIFIED_DIGEST`。Cosign keyless 使用 GitHub OIDC 和公共透明日志，不要求 GitHub Enterprise Cloud；部署服务器只需要 GHCR `read:packages` 凭据，不需要安装 Cosign。部署脚本会检查该记录与 production `IMAGE` 完全一致。

如果 canonical digest 已推送、但 Cosign 失败，直接在同一 commit 上重跑；未签名 digest 没有 release/SHA tag。如果签名成功后 tag 晋升或 Summary 临时失败，重跑会先对已有 digest 执行本次精确 Git ref 的 Cosign 验签，再核对已签名的 revision/source/publication labels，并补齐缺失 tag 或 Summary；不存在接受任意 digest 的补签输入。同一 commit 改变 site mode、域名或 evidence 会因 labels 不一致而停止，应提交新的 commit 后再构建，避免一个 SHA tag 对应多套静态发布配置。

## 5. 初始化服务器

把 `scripts/prod/` 传到服务器或在受控工作目录检出仓库，然后执行：

Ubuntu/Debian 如需主机 ufw，先保留 SSH 再启用：

```bash
sudo apt-get install -y ufw
sudo ufw allow OpenSSH  # 非 22 端口时替换为实际 SSH 规则
sudo ufw enable
sudo ./scripts/prod/01-setup-system.sh
```

只使用已核对的云防火墙时必须显式确认：

```bash
sudo ALLOW_NO_HOST_FIREWALL=1 ./scripts/prod/01-setup-system.sh

sudo install -d -m 0755 /opt/tideform/scripts/nginx
sudo install -m 0755 scripts/prod/*.sh /opt/tideform/scripts/
sudo install -m 0644 scripts/prod/nginx/tideform.conf.template \
  /opt/tideform/scripts/nginx/
```

初始化脚本安装 Podman、Nginx、Certbot、curl、DNS 工具、jq、logrotate、flock 和 CA 证书，创建 `/opt/tideform`，并在已启用的 ufw/firewalld 中开放 80/443。Rocky 会启用 EPEL/CRB，并在 SELinux 开启时只设置 Nginx 访问 Podman loopback 所需的 `httpd_can_network_connect`。脚本启用 `podman-restart.service`；active 槽位使用该 unit 能识别的 `restart-policy=always`，停止的回滚槽位使用 `restart-policy=no`，主机重启后只恢复 active。3101/3102 不对公网开放。

```bash
sudo ss -lntp
sudo ufw status verbose 2>/dev/null || true
sudo firewall-cmd --list-all 2>/dev/null || true
systemctl is-enabled podman-restart.service
getenforce 2>/dev/null || true
getsebool httpd_can_network_connect 2>/dev/null || true
```

### 5.1 持久化 GHCR 登录

Podman 在 Linux 上的默认 auth 文件通常位于运行时目录，重启后不保留。本项目显式使用 `/opt/tideform/config/registry-auth.json`：

```bash
read -rsp 'GHCR read:packages token: ' GHCR_TOKEN
printf '\n'
printf '%s' "$GHCR_TOKEN" | sudo podman login \
  --authfile /opt/tideform/config/registry-auth.json \
  --username GITHUB_USERNAME \
  --password-stdin ghcr.io
unset GHCR_TOKEN
sudo chmod 600 /opt/tideform/config/registry-auth.json
```

验证时不要打印 auth 文件内容：

```bash
sudo podman login --authfile /opt/tideform/config/registry-auth.json \
  --get-login ghcr.io
```

Token 不进入 Git、`.env`、shell history、部署日志或容器环境。

### 5.2 应用运行环境

```bash
sudo install -m 0600 /dev/null /opt/tideform/config/tideform.env
sudoedit /opt/tideform/config/tideform.env
```

prototype：

```dotenv
SITE_MODE=prototype
PUBLIC_BASE_URL=https://store.example.com
```

production 必须与构建镜像时的值一致：

```dotenv
SITE_MODE=production
SITE_URL=https://store.example.com
APPROVED_PRODUCTION_DOMAIN=store.example.com
SITE_EVIDENCE_GATE=approved
NEXT_PUBLIC_SITE_URL=https://store.example.com
PUBLIC_BASE_URL=https://store.example.com
SIGNATURE_VERIFIED_DIGEST=sha256:REPLACE_WITH_VERIFIED_DIGEST
```

```bash
sudo chmod 600 /opt/tideform/config/tideform.env
```

`PUBLIC_BASE_URL` 只供部署脚本在切流后做公网 smoke。将来加入 Shopify、RFQ 存储或第三方 API 秘密时，仍放服务器的 600 环境文件或专用 secret manager，不写入 Docker build args。

## 6. 配置 Nginx 和 TLS

确认域名已解析且公网 80/443 可达，然后执行：

```bash
sudo DOMAIN=store.example.com EMAIL=ops@example.com \
  /opt/tideform/scripts/02-setup-nginx.sh
```

首次签发时，脚本会备份旧配置、事务安装 HTTP-only ACME challenge 站点、使用 Certbot webroot 申请证书，再事务安装 blue/green TLS 模板。已有证书时跳过临时站点，不中断 HTTPS；重跑会保留当前 active marker/port。Ubuntu 默认站点会先备份再禁用，任一 Nginx 验证或 reload 失败会恢复先前配置。脚本还安装续期 deploy hook，证书更新后先 `nginx -t` 再 reload。

证书失败时 HTTP challenge 配置会保留。先修复 DNS、AAAA、云防火墙或 80 端口，再重跑脚本。首次容器启动前访问 HTTPS 返回 502 属于预期，因为 upstream 尚未启动。

## 7. 首次部署

```bash
IMAGE=ghcr.io/OWNER/xsyshopify:2026.08.08-1  # prototype
sudo /opt/tideform/scripts/03-deploy-first.sh "$IMAGE"
```

脚本会拉取镜像、启动 blue、等待 `/api/health`，并检查首页、商品列表、RFQ、robots 和 sitemap。随后做公网验证：

```bash
sudo /opt/tideform/scripts/05-smoke-test.sh \
  --base-url https://store.example.com \
  --mode prototype
curl --fail --silent https://store.example.com/api/health | jq .
curl -I https://store.example.com/
```

prototype 预期页面为 `noindex,follow`，`robots.txt` 没有 sitemap 声明，`sitemap.xml` 没有 URL。

## 8. 日常蓝绿发布

触发 Actions并记录 release tag、commit SHA、run URL 和 digest。prototype 可以使用新 tag；production 使用 Actions Summary 中的 digest：

```bash
IMAGE=ghcr.io/OWNER/xsyshopify@sha256:VERIFIED_PRODUCTION_DIGEST
sudo /opt/tideform/scripts/04-deploy-blue-green.sh "$IMAGE"
```

观察：

```bash
sudo podman ps -a --format 'table {{.Names}}\t{{.Status}}\t{{.Image}}'
sudo podman logs --tail 100 tideform-blue
sudo podman logs --tail 100 tideform-green
sudo tail -n 20 /opt/tideform/deploy-log.tsv
sudo journalctl -u nginx --since '-15 minutes'
```

首次上线后安排一次维护窗口重启演练：`sudo reboot`，恢复后确认 `podman ps`、active 槽位 `/api/health` 和公网 smoke。切流脚本保持 active 槽位 `restart-policy=always`，把停止的回滚槽位改为 `restart-policy=no`；因此 `podman-restart.service` 只恢复 active。失败时先检查容器 policy、Nginx marker 和 `systemctl status podman-restart.service`。

部署状态以 `/etc/nginx/conf.d/tideform.conf` 中唯一的 `# active-color: blue|green` 为准。不要手工只改 marker 或只改 upstream 端口。

## 9. 回滚

上一槽位容器仍在时：

```bash
sudo /opt/tideform/scripts/06-rollback.sh
```

脚本先验证旧容器再切回 Nginx；旧容器验证失败时保持当前流量。切流成功后等待 `DRAIN_SECONDS` 再停止原 active，避免截断 Nginx 旧 worker 中的请求。更早版本按正常蓝绿发布流程部署：

```bash
sudo /opt/tideform/scripts/04-deploy-blue-green.sh \
  ghcr.io/OWNER/xsyshopify:KNOWN_GOOD_TAG
```

## 10. 监控、日志与备份

最低监控由明确的当班运维联系人接收：外部每 1 分钟检查 `/api/health` 和首页，连续 3 次失败告警；TLS 剩余 21 天告警；磁盘或 inode 超过 80% 告警；Nginx marker 对应 active 容器停止/不健康、Nginx 5xx 连续 5 分钟超过 2% 时告警。停止的回滚槽位是正常状态，不应单独告警。至少每季度演练一次告警送达、回滚和重启恢复并记录结果。

```bash
df -h
df -i
free -h
sudo podman stats --no-stream
sudo nginx -t
sudo certbot renew --dry-run --run-deploy-hooks
curl --resolve store.example.com:443:127.0.0.1 \
  https://store.example.com/nginx-status
```

日志位置：

- `/var/log/nginx/tideform-access.log`
- `/var/log/nginx/tideform-error.log`
- `podman logs tideform-blue|green`
- `/opt/tideform/deploy-log.tsv`

用 `sudo logrotate -d /etc/logrotate.d/nginx` 确认发行版规则覆盖 `/var/log/nginx/*.log`。Podman `k8s-file` 日志设置其支持的 `max-size=20m`；每月检查实际日志占用，不使用不受 Podman 支持的 `max-file`。

应备份 Nginx 配置、证书恢复说明、DNS 记录、发布记录和加密后的应用配置。`/opt/tideform/backup` 是本机 Nginx 切换备份，不是异机备份。每月只保留最近 20 个或 90 天内的配置备份，把 `deploy-log.tsv` 按月归档到加密异机存储；每季度从异机副本恢复到临时路径并核对。不要把明文 Token 或环境文件上传到普通对象存储。

## 11. 清理策略

确认不再需要立即回滚后，可删除停止的旧容器：

```bash
sudo podman ps -a
sudo podman rm tideform-blue   # 仅在 blue 已停止且不是回滚目标时
sudo podman image prune -f
sudo podman image ls --digests
sudo podman image rm ghcr.io/OWNER/xsyshopify:OLD_TAG
```

`image prune` 只清 dangling 层；带唯一 release tag 的旧镜像要在核对后用 `podman image rm IMAGE` 精确删除。不要使用未审查的 `podman system prune -a`。在服务器或 GitHub Packages 删除旧版本前，先确认线上与回滚容器使用的 image ID/digest。每月查看磁盘和 GitHub Billing 的 Packages/Actions 用量。

Buildx 在签名前只推送 canonical digest，不创建临时 tag；Cosign 失败可能在 GHCR 留下 untagged package version。每周在 **GitHub Packages > xsyshopify > Manage versions** 检查一次，只删除超过 7 天、没有任何 release/SHA tag、也未出现在 Actions Summary、`deploy-log.tsv`、线上或回滚容器中的 untagged digest。不要按 digest 删除仍带 release/SHA tag 的版本，因为 Registry 删除 manifest 会同时影响这些 tag。

## 12. 故障排查

### 拉取镜像 401/403

```bash
sudo podman login --authfile /opt/tideform/config/registry-auth.json \
  --get-login ghcr.io
sudo stat -c '%a %n' /opt/tideform/config/registry-auth.json
```

确认 classic PAT 有 `read:packages`、账号有 package read 权限、SSO 已授权、镜像名全小写且 tag 存在。优先修 package 访问控制，不扩大 Token 权限。

### Nginx 502

```bash
sudo nginx -t
sudo grep -E '^# active-color:|server 127.0.0.1:' /etc/nginx/conf.d/tideform.conf
sudo podman ps -a
curl --fail http://127.0.0.1:3101/api/health
curl --fail http://127.0.0.1:3102/api/health
```

只检查 active 颜色对应端口。候选失败不会自动修改 Nginx。

### 证书失败

```bash
sudo nginx -t
sudo certbot certificates
sudo journalctl -u nginx --since '-30 minutes'
curl -I http://store.example.com/.well-known/acme-challenge/test
```

检查 DNS A/AAAA、公网 80、云防火墙和系统时间。

### production 门禁失败

四项 production 输入必须完整一致，`IMAGE` 必须是 digest，且 `SIGNATURE_VERIFIED_DIGEST` 必须匹配。部署还会逐项比较镜像 labels 和运行环境。先补齐域名、站点身份和 evidence，具体见 [SEO/GEO 操作手册](./seo-geo-operations-guide.md)。

### smoke 失败

直接对候选 loopback 端口运行 `05-smoke-test.sh` 并核对 `SITE_MODE`。构建期和运行期模式相反会造成 robots/sitemap 断言不一致。

## 13. 安全检查表

- GHCR package 保持 Private；服务器 Token 只有 `read:packages`。
- registry auth 和 `tideform.env` 权限均为 600，config 目录为 700。
- Actions 使用仓库 `GITHUB_TOKEN`，第三方 Action 固定完整 commit SHA。
- workflow 全局串行并拒绝覆盖已有 tag；production 只接受 `main` 的精确 Cosign workflow identity 和 digest。
- 容器非 root、只读根文件系统、drop all capabilities、`no-new-privileges`、资源和日志受限。
- 容器端口只绑定 `127.0.0.1`，公网只开放 80/443。
- 定期安装系统安全更新，并验证 Nginx、Podman 和 Certbot。
- 不在日志、issue、Actions input、Git 或镜像 build arg 中放秘密。

## 14. 官方来源

访问日期均为 2026-08-08：

- [GitHub Packages 计费说明](https://docs.github.com/en/billing/managing-billing-for-your-products/managing-billing-for-github-packages/about-billing-for-github-packages)
- [GitHub Container Registry 使用与认证](https://docs.github.com/en/packages/working-with-a-github-packages-registry/working-with-the-container-registry)
- [GitHub Actions 发布 Docker 镜像](https://docs.github.com/en/actions/tutorials/publish-packages/publish-docker-images)
- [Sigstore Cosign keyless 签名](https://docs.sigstore.dev/cosign/signing/signing_with_containers/)
- [Podman login 官方手册](https://docs.podman.io/en/latest/markdown/podman-login.1.html)
- [Certbot 证书续期说明](https://eff-certbot.readthedocs.io/en/stable/using.html#renewing-certificates)

项目实现参考了本机 `~/Projects/apigateway/Fy-api` 的单机 Podman、Nginx/Certbot 与蓝绿发布经验；最终行为以本仓库脚本、测试和本手册为准。
