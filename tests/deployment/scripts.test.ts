import { chmodSync, mkdtempSync, writeFileSync } from "node:fs";
import { tmpdir } from "node:os";
import { resolve } from "node:path";
import { spawnSync } from "node:child_process";

import { describe, expect, it } from "vitest";

const root = resolve(import.meta.dirname, "../..");
const library = resolve(root, "scripts/prod/lib.sh");
const smoke = resolve(root, "scripts/prod/05-smoke-test.sh");

function bash(script: string) {
  return spawnSync("bash", ["-c", script], { cwd: root, encoding: "utf8" });
}

function callLibrary(command: string) {
  return bash(`set -euo pipefail; source "${library}"; ${command}`);
}

describe("deployment shell library", () => {
  it("maps blue and green deployment slots to each other", () => {
    expect(callLibrary("other_color blue").stdout.trim()).toBe("green");
    expect(callLibrary("other_color green").stdout.trim()).toBe("blue");
    expect(callLibrary("other_color red").status).not.toBe(0);
  });

  it("maps deployment slots to loopback ports", () => {
    expect(callLibrary("port_for_color blue").stdout.trim()).toBe("3101");
    expect(callLibrary("port_for_color green").stdout.trim()).toBe("3102");
  });

  it("validates deployment timing overrides before they are used", () => {
    expect(callLibrary("validate_deployment_timings").status).toBe(0);
    expect(callLibrary("HEALTH_TIMEOUT_SECONDS=1; DRAIN_SECONDS=0; validate_deployment_timings").status).toBe(0);

    for (const command of [
      "HEALTH_TIMEOUT_SECONDS=abc; validate_deployment_timings",
      "HEALTH_TIMEOUT_SECONDS=0; validate_deployment_timings",
      "HEALTH_TIMEOUT_SECONDS=601; validate_deployment_timings",
      "DRAIN_SECONDS=-1; validate_deployment_timings",
      "DRAIN_SECONDS=abc; validate_deployment_timings",
      "DRAIN_SECONDS=301; validate_deployment_timings",
    ]) {
      const result = callLibrary(command);
      expect(result.status).not.toBe(0);
      expect(result.stderr).toContain("must be");
    }
  });

  it("accepts immutable image tags or digests and rejects ambiguous references", () => {
    expect(callLibrary("validate_image_ref ghcr.io/acme/xsyshopify:2026.08.08-1").status).toBe(0);
    expect(callLibrary(`validate_image_ref ghcr.io/acme/xsyshopify@sha256:${"a".repeat(64)}`).status).toBe(0);

    for (const image of ["''", "ghcr.io/acme/xsyshopify", "ghcr.io/acme/xsyshopify:latest"]) {
      expect(callLibrary(`validate_image_ref ${image}`).status).not.toBe(0);
    }
  });

  it("requires a sha256 digest for production deployments", () => {
    const directory = mkdtempSync(resolve(tmpdir(), "tideform-production-image-"));
    const envFile = resolve(directory, "tideform.env");
    writeFileSync(envFile, "SITE_MODE=production\n");

    expect(callLibrary(`ENV_FILE="${envFile}"; require_digest_for_production ghcr.io/acme/xsyshopify:release`).status).not.toBe(0);
    expect(callLibrary(`ENV_FILE="${envFile}"; require_digest_for_production ghcr.io/acme/xsyshopify@sha256:${"a".repeat(64)}`).status).toBe(0);
  });

  it("gates production on the operator-verified signature digest", () => {
    const directory = mkdtempSync(resolve(tmpdir(), "tideform-attestation-"));
    const envFile = resolve(directory, "tideform.env");
    const digest = `sha256:${"a".repeat(64)}`;
    writeFileSync(envFile, `SITE_MODE=production\nSIGNATURE_VERIFIED_DIGEST=${digest}\n`);

    expect(callLibrary(`ENV_FILE="${envFile}"; require_verified_signature_for_production ghcr.io/acme/xsyshopify@${digest}`).status).toBe(0);
    expect(callLibrary(`ENV_FILE="${envFile}"; require_verified_signature_for_production ghcr.io/acme/xsyshopify@sha256:${"b".repeat(64)}`).status).not.toBe(0);
  });

  it("reads and validates the active color marker from Nginx", () => {
    const directory = mkdtempSync(resolve(tmpdir(), "tideform-nginx-"));
    const config = resolve(directory, "tideform.conf");

    writeFileSync(config, "# active-color: green\nupstream tideform_backend {}\n");
    expect(callLibrary(`active_color_from_nginx "${config}"`).stdout.trim()).toBe("green");

    writeFileSync(config, "# active-color: red\n");
    expect(callLibrary(`active_color_from_nginx "${config}"`).status).not.toBe(0);
  });

  it("uses a persistent registry auth file when pulling a private image", () => {
    const directory = mkdtempSync(resolve(tmpdir(), "tideform-auth-"));
    const authFile = resolve(directory, "registry-auth.json");
    writeFileSync(authFile, "{}\n");
    chmodSync(authFile, 0o600);

    const result = callLibrary(
      `podman() { printf '%s\\n' "$*"; }; REGISTRY_AUTH_FILE="${authFile}"; pull_image ghcr.io/acme/xsyshopify:test`,
    );
    expect(result.status).toBe(0);
    expect(result.stdout.trim()).toBe(`pull --authfile ${authFile} ghcr.io/acme/xsyshopify:test`);
  });

  it("updates container restart policy explicitly", () => {
    const result = callLibrary(
      'podman() { printf "%s\\n" "$*" >&2; }; set_container_restart_policy tideform-blue no',
    );
    expect(result.status).toBe(0);
    expect(result.stderr.trim()).toBe("update --restart=no tideform-blue");
  });

  it("rejects an image whose baked publication settings differ from runtime", () => {
    const directory = mkdtempSync(resolve(tmpdir(), "tideform-contract-"));
    const envFile = resolve(directory, "tideform.env");
    writeFileSync(envFile, [
      "SITE_MODE=production",
      "SITE_URL=https://store.example.com",
      "APPROVED_PRODUCTION_DOMAIN=store.example.com",
      "SITE_EVIDENCE_GATE=approved",
      "NEXT_PUBLIC_SITE_URL=https://store.example.com",
      "",
    ].join("\n"));

    const matching = callLibrary(`
      ENV_FILE="${envFile}"
      image_label() {
        case "$2" in
          io.tideform.site-mode) printf 'production\\n' ;;
          io.tideform.site-url) printf 'https://store.example.com\\n' ;;
          io.tideform.approved-production-domain) printf 'store.example.com\\n' ;;
          io.tideform.site-evidence-gate) printf 'approved\\n' ;;
          io.tideform.next-public-site-url) printf 'https://store.example.com\\n' ;;
        esac
      }
      validate_image_publication_contract image-id
    `);
    expect(matching.status).toBe(0);

    const mismatching = callLibrary(`
      ENV_FILE="${envFile}"
      image_label() {
        [[ "$2" == io.tideform.site-mode ]] && printf 'production\\n' || printf 'wrong.example.com\\n'
      }
      validate_image_publication_contract image-id
    `);
    expect(mismatching.status).not.toBe(0);
    expect(mismatching.stderr).toContain("publication setting mismatch");
  });
});

describe("deployment smoke test", () => {
  it("rejects unsupported publication modes before making requests", () => {
    const result = spawnSync("bash", [smoke, "--mode", "invalid"], { cwd: root, encoding: "utf8" });
    expect(result.status).not.toBe(0);
    expect(result.stderr).toContain("prototype or production");
  });

  it("accepts healthy prototype pages with noindex and an empty sitemap", () => {
    const directory = mkdtempSync(resolve(tmpdir(), "tideform-curl-"));
    const fakeCurl = resolve(directory, "curl");
    writeFileSync(fakeCurl, `#!/usr/bin/env bash
set -euo pipefail
url=""
output=""
while [[ "$#" -gt 0 ]]; do
  case "$1" in
    http://*) url="$1"; shift ;;
    --output) output="$2"; shift 2 ;;
    *) shift ;;
  esac
done
case "$url" in
  */api/health) printf '{"status":"ok"}' > "$output" ;;
  */robots.txt) printf 'User-agent: *\\nDisallow:\\n' > "$output" ;;
  */sitemap.xml) printf '<urlset></urlset>' > "$output" ;;
  *) printf '<html><head><meta name="robots" content="noindex, follow"></head></html>' > "$output" ;;
esac
`);
    chmodSync(fakeCurl, 0o755);

    const result = spawnSync(
      "bash",
      [smoke, "--base-url", "http://example.test", "--mode", "prototype"],
      {
        cwd: root,
        encoding: "utf8",
        env: { ...process.env, PATH: `${directory}:${process.env.PATH}` },
      },
    );
    expect(result.status).toBe(0);
    expect(result.stdout).toContain("smoke test passed");
  });

  it("requires production metadata to use the expected origin", () => {
    const directory = mkdtempSync(resolve(tmpdir(), "tideform-production-curl-"));
    const fakeCurl = resolve(directory, "curl");
    writeFileSync(fakeCurl, `#!/usr/bin/env bash
set -euo pipefail
url=""
output=""
while [[ "$#" -gt 0 ]]; do
  case "$1" in
    http://*) url="$1"; shift ;;
    --output) output="$2"; shift 2 ;;
    *) shift ;;
  esac
done
case "$url" in
  */api/health) printf '{"status":"ok"}' > "$output" ;;
  */robots.txt) printf 'Sitemap: https://wrong.example.com/sitemap.xml\\n' > "$output" ;;
  */sitemap.xml) printf '<urlset><url><loc>https://wrong.example.com/</loc></url></urlset>' > "$output" ;;
  *) printf '<html><head><link rel="canonical" href="https://wrong.example.com/"></head></html>' > "$output" ;;
esac
`);
    chmodSync(fakeCurl, 0o755);

    const result = spawnSync(
      "bash",
      [smoke, "--base-url", "http://example.test", "--mode", "production", "--expected-origin", "https://store.example.com"],
      {
        cwd: root,
        encoding: "utf8",
        env: { ...process.env, PATH: `${directory}:${process.env.PATH}` },
      },
    );
    expect(result.status).not.toBe(0);
    expect(result.stderr).not.toContain("unknown argument");
  });
});
