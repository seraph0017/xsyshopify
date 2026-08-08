import { readFileSync, readdirSync } from "node:fs";
import { resolve } from "node:path";

import { describe, expect, it } from "vitest";

const root = resolve(import.meta.dirname, "../..");

function read(path: string) {
  return readFileSync(resolve(root, path), "utf8");
}

describe("deployment assets", () => {
  it("builds a minimal non-root Next.js standalone image", () => {
    expect(read("next.config.ts")).toMatch(/output:\s*["']standalone["']/);

    const dockerfile = read("Dockerfile");
    expect(dockerfile.match(/^FROM /gm)).toHaveLength(4);
    expect(dockerfile.match(/node:24\.15\.0-alpine@sha256:[a-f0-9]{64}/g)).toHaveLength(2);
    expect(dockerfile).toContain("pnpm@11.20.0");
    expect(dockerfile).toContain("pnpm install --frozen-lockfile");
    expect(dockerfile).toContain("pnpm build");
    expect(dockerfile).toContain(".next/standalone");
    expect(dockerfile).toContain(".next/static");
    expect(dockerfile).toMatch(/COPY .*public/);
    expect(dockerfile).toContain("USER nextjs");
    expect(dockerfile).toContain("HEALTHCHECK");
    expect(dockerfile).toContain("/api/health");
    for (const label of [
      "io.tideform.site-mode",
      "io.tideform.site-url",
      "io.tideform.approved-production-domain",
      "io.tideform.site-evidence-gate",
      "io.tideform.next-public-site-url",
    ]) {
      expect(dockerfile).toContain(label);
    }
  });

  it("keeps local and secret material out of the image context", () => {
    const dockerignore = read(".dockerignore");
    for (const entry of [".git", "node_modules", ".next", "test-results", ".playwright-cli", "output", ".env*"]) {
      expect(dockerignore).toContain(entry);
    }
    expect(dockerignore).toContain("!.env.example");
  });

  it("provides a hardened loopback-only production compose service", () => {
    const compose = read("compose.prod.yml");
    expect(compose).toContain("${IMAGE:?");
    expect(compose).toMatch(/127\.0\.0\.1:\$\{HOST_PORT:-3101\}:3000/);
    expect(compose).toContain("env_file:");
    expect(compose).toContain("restart: always");
    expect(compose).toContain("read_only: true");
    expect(compose).toContain("no-new-privileges:true");
    expect(compose).toMatch(/cap_drop:\s*\n\s*- ALL/);
    expect(compose).toContain("tmpfs:");
    expect(compose).toContain("healthcheck:");
    expect(compose).toContain("max-size");
    expect(compose).not.toContain("max-file");
  });

  it("publishes immutable private GHCR images with pinned actions", () => {
    const workflow = read(".github/workflows/container.yml");
    expect(workflow).toContain("workflow_dispatch:");
    expect(workflow).toContain("deploy-*");
    expect(workflow).toMatch(/permissions:\s*\n\s*contents: read\s*\n\s*packages: write\s*\n\s*id-token: write/);
    expect(workflow).toContain("group: xsyshopify-container-package");
    expect(workflow).toContain("registry: ghcr.io");
    expect(workflow).toContain("username: ${{ github.actor }}");
    expect(workflow).toContain("password: ${{ secrets.GITHUB_TOKEN }}");
    expect(workflow).toContain("sha-${{ github.sha }}");
    expect(workflow).toContain("SITE_MODE=");
    expect(workflow).toContain("SITE_URL=");
    expect(workflow).toContain("APPROVED_PRODUCTION_DOMAIN=");
    expect(workflow).toContain("SITE_EVIDENCE_GATE=");
    expect(workflow).toContain("production requires SITE_URL");
    expect(workflow).toContain("reject_multiline");
    expect(workflow).toContain("prototype requires production-only fields to be empty");
    expect(workflow).toContain("docker buildx imagetools inspect");
    expect(workflow).toContain("steps.build.outputs.digest");
    expect(workflow).toContain("pull: true");
    expect(workflow).toContain("sigstore/cosign-installer@");
    expect(workflow).toContain("cosign sign --yes");
    expect(workflow).toContain("cosign verify");
    expect(workflow).toContain('--certificate-identity "${GITHUB_SERVER_URL}/${GITHUB_REPOSITORY}/.github/workflows/container.yml@${GITHUB_REF}"');
    expect(workflow).not.toContain("certificate-identity-regexp");
    expect(workflow).toContain('if [[ "${SITE_MODE}" == "production" ]]');
    expect(workflow).toContain("push-by-digest=true");
    expect(workflow).toContain("name-canonical=true");
    expect(workflow).toContain("Build and push canonical digest");
    expect(workflow).toContain("Inspect immutable release tags");
    expect(workflow).toContain("Promote signed digest to immutable release tags");
    expect(workflow).toContain("signed image ${label} does not match");
    expect(workflow).not.toContain("sign_existing_digest");
    expect(workflow).not.toContain("actions/attest@");

    const actionRefs = [...workflow.matchAll(/uses:\s*[^@\s]+@([^\s#]+)/g)].map((match) => match[1]);
    expect(actionRefs.length).toBeGreaterThanOrEqual(4);
    expect(actionRefs.every((ref) => /^[a-f0-9]{40}$/.test(ref))).toBe(true);
  });

  it("initializes only the host services and paths required by this app", () => {
    const setup = read("scripts/prod/01-setup-system.sh");
    expect(setup).toContain("set -euo pipefail");
    expect(setup).toContain("apt-get");
    expect(setup).toContain("dnf");
    for (const dependency of ["podman", "nginx", "certbot", "curl", "jq", "logrotate"]) {
      expect(setup).toContain(dependency);
    }
    expect(setup).toContain("/opt/tideform");
    expect(setup).toMatch(/chmod 700 .*config/);
    expect(setup).toContain("epel-release");
    expect(setup).toContain("httpd_can_network_connect");
    expect(setup).toContain("podman-restart.service");
    expect(setup).toContain("util-linux");
    expect(setup).toContain("ALLOW_NO_HOST_FIREWALL");
    expect(setup).toMatch(/uname -m/);
    expect(setup).toMatch(/(80\/tcp|--add-service=http)/);
    expect(setup).toMatch(/(443\/tcp|--add-service=https)/);
    expect(setup).not.toMatch(/ufw allow 310[12]|--add-port=310[12]/);
    expect(setup).not.toContain("sysctl");
  });

  it("installs a TLS reverse proxy that preserves the blue-green marker", () => {
    const setup = read("scripts/prod/02-setup-nginx.sh");
    const template = read("scripts/prod/nginx/tideform.conf.template");

    expect(setup).toContain("set -euo pipefail");
    expect(setup).toContain("DOMAIN");
    expect(setup).toContain("EMAIL");
    expect(setup).toContain("certbot certonly --webroot");
    expect(setup).toContain("nginx -t");
    expect(setup).toContain("systemctl reload nginx");
    expect(setup).toContain("active_color_from_nginx");
    expect(setup).toContain("ACTIVE_COLOR");
    expect(setup).toContain("restore_nginx_config");
    expect(setup).toContain("/etc/letsencrypt/renewal-hooks/deploy");
    expect(setup).toContain("/etc/nginx/sites-enabled/default");
    expect(setup).toContain("systemctl reload nginx");

    expect(template).toContain("# active-color: __ACTIVE_COLOR__");
    expect(template).toContain("server 127.0.0.1:__ACTIVE_PORT__");
    expect(template).toContain("listen 80");
    expect(template).toContain("listen 443 ssl");
    expect(template).toContain("/.well-known/acme-challenge/");
    expect(template).toContain("Strict-Transport-Security");
    expect(template).toContain("X-Content-Type-Options");
    expect(template).toContain("Referrer-Policy");
    expect(template).toContain("client_max_body_size 1m");
    expect(template).toContain("proxy_buffering off");
    expect(template).toContain("proxy_set_header Accept $http_accept");
    expect(template).toContain("proxy_set_header X-Forwarded-Proto $scheme");
    expect(template).toContain("location = /nginx-status");
    expect(template).toContain("default_server");
    expect(template).toContain("return 444");
    expect(template).toContain("return 308 https://__DOMAIN__$request_uri");
    expect(template).toContain("proxy_set_header Host __DOMAIN__");
    expect(template).not.toContain("return 308 https://$host");
    expect(template).not.toMatch(/server 0\.0\.0\.0:310[12]/);
  });

  it("keeps every production shell script strict and exposes explicit deployment stages", () => {
    const scriptNames = readdirSync(resolve(root, "scripts/prod")).filter((name) => name.endsWith(".sh"));
    expect(scriptNames).toEqual(expect.arrayContaining([
      "01-setup-system.sh",
      "02-setup-nginx.sh",
      "03-deploy-first.sh",
      "04-deploy-blue-green.sh",
      "05-smoke-test.sh",
      "06-rollback.sh",
      "lib.sh",
    ]));
    for (const name of scriptNames) {
      expect(read(`scripts/prod/${name}`)).toContain("set -euo pipefail");
    }

    const library = read("scripts/prod/lib.sh");
    const firstDeployment = read("scripts/prod/03-deploy-first.sh");
    const deployment = read("scripts/prod/04-deploy-blue-green.sh");
    const rollback = read("scripts/prod/06-rollback.sh");
    expect(library).toContain("127.0.0.1:$port:3000");
    expect(library).toContain("--restart=always");
    expect(library).not.toContain("--restart=unless-stopped");
    expect(library).toContain("--security-opt=no-new-privileges");
    expect(library).toContain("--cap-drop=ALL");
    expect(library).not.toContain("max-file");
    expect(library).toContain("acquire_deploy_lock");
    expect(library).toContain("validate_image_publication_contract");
    expect(library).toContain("require_digest_for_production");
    expect(library).toContain("require_verified_signature_for_production");
    expect(library).toContain("validate_deployment_timings");
    expect(library).toContain("set_container_restart_policy");
    expect(firstDeployment).toContain("container_exists");
    expect(rollback).toContain("site_mode_from_container");
    expect(rollback).toContain('sleep "$DRAIN_SECONDS"');
    expect(deployment).toContain("stop_container_if_running");
    expect(deployment.indexOf('set_container_restart_policy "$active_name" no')).toBeLessThan(
      deployment.indexOf('stop_container_if_running "$active_name"'),
    );
    expect(rollback).toContain('set_container_restart_policy "$previous_name" always');
    expect(rollback.indexOf('set_container_restart_policy "$active_name" no')).toBeLessThan(
      rollback.indexOf('stop_container_if_running "$active_name"'),
    );
    for (const script of [firstDeployment, deployment, rollback, read("scripts/prod/02-setup-nginx.sh")]) {
      expect(script).toContain("acquire_deploy_lock");
    }
    for (const script of [firstDeployment, deployment, rollback]) {
      expect(script.indexOf("validate_deployment_timings")).toBeLessThan(script.indexOf("acquire_deploy_lock"));
    }
    expect(deployment.indexOf("wait_for_health")).toBeLessThan(deployment.indexOf("systemctl reload nginx"));
    expect(deployment).toContain("restore_nginx");
    expect(deployment).toContain("06-rollback.sh");
  });

  it("documents the firewall decision in the copyable quickstart", () => {
    const readme = read("README.md");
    expect(readme).toContain("ALLOW_NO_HOST_FIREWALL=1");
    expect(readme).toContain("ufw");
    expect(readme).toContain("registry-auth.json");
  });
});
