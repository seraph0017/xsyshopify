FROM node:24.15.0-alpine@sha256:d1b3b4da11eefd5941e7f0b9cf17783fc99d9c6fc34884a665f40a06dbdfc94f AS base

ENV PNPM_HOME=/pnpm
ENV PATH=$PNPM_HOME:$PATH
RUN npm install --global pnpm@11.20.0
WORKDIR /app

FROM base AS deps

COPY package.json pnpm-lock.yaml ./
RUN pnpm install --frozen-lockfile

FROM base AS builder

ARG SITE_MODE=prototype
ARG SITE_URL=
ARG APPROVED_PRODUCTION_DOMAIN=
ARG SITE_EVIDENCE_GATE=
ARG NEXT_PUBLIC_SITE_URL=

ENV NEXT_TELEMETRY_DISABLED=1
ENV SITE_MODE=$SITE_MODE
ENV SITE_URL=$SITE_URL
ENV APPROVED_PRODUCTION_DOMAIN=$APPROVED_PRODUCTION_DOMAIN
ENV SITE_EVIDENCE_GATE=$SITE_EVIDENCE_GATE
ENV NEXT_PUBLIC_SITE_URL=$NEXT_PUBLIC_SITE_URL

COPY --from=deps /app/node_modules ./node_modules
COPY . .
RUN pnpm build

FROM node:24.15.0-alpine@sha256:d1b3b4da11eefd5941e7f0b9cf17783fc99d9c6fc34884a665f40a06dbdfc94f AS runner

ARG SITE_MODE=prototype
ARG SITE_URL=
ARG APPROVED_PRODUCTION_DOMAIN=
ARG SITE_EVIDENCE_GATE=
ARG NEXT_PUBLIC_SITE_URL=

ENV NODE_ENV=production
ENV NEXT_TELEMETRY_DISABLED=1
ENV HOSTNAME=0.0.0.0
ENV PORT=3000
ENV SITE_MODE=$SITE_MODE
ENV SITE_URL=$SITE_URL
ENV APPROVED_PRODUCTION_DOMAIN=$APPROVED_PRODUCTION_DOMAIN
ENV SITE_EVIDENCE_GATE=$SITE_EVIDENCE_GATE
ENV NEXT_PUBLIC_SITE_URL=$NEXT_PUBLIC_SITE_URL

LABEL io.tideform.site-mode=$SITE_MODE \
  io.tideform.site-url=$SITE_URL \
  io.tideform.approved-production-domain=$APPROVED_PRODUCTION_DOMAIN \
  io.tideform.site-evidence-gate=$SITE_EVIDENCE_GATE \
  io.tideform.next-public-site-url=$NEXT_PUBLIC_SITE_URL

RUN addgroup --system --gid 1001 nodejs \
  && adduser --system --uid 1001 --ingroup nodejs nextjs

WORKDIR /app
COPY --from=builder --chown=nextjs:nodejs /app/public ./public
COPY --from=builder --chown=nextjs:nodejs /app/.next/standalone ./
COPY --from=builder --chown=nextjs:nodejs /app/.next/static ./.next/static

USER nextjs
EXPOSE 3000

HEALTHCHECK --interval=30s --timeout=5s --start-period=20s --retries=3 \
  CMD node -e "fetch('http://127.0.0.1:3000/api/health').then(async response => { if (!response.ok || (await response.json()).status !== 'ok') process.exit(1) }).catch(() => process.exit(1))"

CMD ["node", "server.js"]
