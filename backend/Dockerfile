# Backend dev image with OpenSSL for Prisma on Alpine
FROM node:18-alpine

# Install OpenSSL so Prisma engines can run on linux-musl
RUN apk add --no-cache openssl python3 build-base

# Working directory (compose will mount the repo at /workspace)
WORKDIR /workspace
