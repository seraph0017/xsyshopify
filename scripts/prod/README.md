# 生产部署脚本

这些脚本用于海外 Linux 单机的 Podman + Nginx blue/green 部署。完整前置条件、GHCR 权限、证书、监控和排障见 [海外单机部署与运维手册](../../docs/deployment-guide.md)。

## 执行顺序

| 脚本 | 用途 | 重复执行 |
| --- | --- | --- |
| `01-setup-system.sh` | 安装依赖、创建目录、配置已启用的防火墙 | 幂等 |
| `02-setup-nginx.sh` | 申请/复用证书并保留当前 active 槽位 | 幂等、事务恢复、备份旧配置 |
| `03-deploy-first.sh IMAGE` | 首次启动 marker 指向的空槽位 | 已有同名容器时拒绝 |
| `04-deploy-blue-green.sh IMAGE` | 拉起候选、验证、切流并停止旧槽位 | 日常发布 |
| `05-smoke-test.sh` | 检查健康、代表页面和 SEO 发布模式 | 可独立执行 |
| `06-rollback.sh` | 验证并切回上一个保留容器 | 需要旧容器存在 |
| `lib.sh` | 共享状态机和 Podman 函数 | 不直接执行 |

## 约定

- 必须使用明确 tag 或 `sha256` digest，拒绝 `latest`。
- production 必须使用 `@sha256`，且与 `SIGNATURE_VERIFIED_DIGEST` 相同。
- blue=`127.0.0.1:3101`，green=`127.0.0.1:3102`。
- 环境文件默认为 `/opt/tideform/config/tideform.env`，权限必须为 600。
- Registry auth 默认为 `/opt/tideform/config/registry-auth.json`；存在时权限必须为 600。
- Nginx 配置默认为 `/etc/nginx/conf.d/tideform.conf`，只能有一个合法 active marker。
- 脚本以 root 执行；应用容器内部仍使用非 root 用户。
- setup、首次部署、蓝绿发布和回滚共用非阻塞文件锁，不能并行运行。
- active 容器使用 `restart-policy=always`，停止的回滚槽位使用 `restart-policy=no`；发布/回滚会同步反转策略，`podman-restart.service` 在主机重启后只恢复 active。
- Podman `k8s-file` 日志使用其支持的 `max-size=20m`，不传 Docker 专用 `max-file`。

## 最短示例

```bash
sudo DOMAIN=store.example.com EMAIL=ops@example.com ./02-setup-nginx.sh
sudo ./03-deploy-first.sh ghcr.io/OWNER/xsyshopify:2026.08.08-1
sudo ./04-deploy-blue-green.sh ghcr.io/OWNER/xsyshopify:2026.08.15-1
sudo ./06-rollback.sh
```

没有启用 ufw/firewalld、但已核对云防火墙时，系统初始化必须显式执行 `sudo ALLOW_NO_HOST_FIREWALL=1 ./01-setup-system.sh`。默认行为是停止并提示，不会静默依赖云侧规则。

可通过环境变量覆盖测试路径和资源限额：`DEPLOY_ROOT`、`ENV_FILE`、`REGISTRY_AUTH_FILE`、`NGINX_CONF`、`BACKUP_DIR`、`MEMORY_LIMIT`、`CPU_LIMIT`、`HEALTH_TIMEOUT_SECONDS`、`DRAIN_SECONDS`。`HEALTH_TIMEOUT_SECONDS` 必须为 1-600 的整数，`DRAIN_SECONDS` 必须为 0-300 的整数；三个部署/回滚脚本会在改变状态前校验。生产环境不要随意覆盖端口映射或 Nginx marker。
