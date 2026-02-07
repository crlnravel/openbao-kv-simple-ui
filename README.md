# OpenBao KV Simple UI

A simple web UI for managing OpenBao KV secrets, users, and policies.

## Features

- **Authentication**: Login with token or username/password (userpass)
- **KV Secrets Management**: Create, read, update, and delete secrets in KV v2 engine
- **User Management**: Manage userpass authentication users and their policies
- **Policy Viewer**: View OpenBao policies (read-only)

## Environment Variables

```bash
OPENBAO_ADDR=http://openbao.openbao.svc.cluster.local:8200
```

## Development

```bash
# Install dependencies
pnpm install

# Run development server
pnpm dev

# Build for production
pnpm build

# Start production server
pnpm start

# Lint
pnpm lint

# Format code
pnpm format

# Check formatting
pnpm format:check
```

## Docker

```bash
# Build image
docker build -t claudexter/openbao-kv-simple-ui:latest .

# Run container
docker run -p 3000:3000 -e OPENBAO_ADDR=http://openbao:8200 claudexter/openbao-kv-simple-ui:latest
```

## Architecture

All OpenBao API requests are proxied through Next.js API routes (`/api/*`) for security. The OpenBao server address is only known to the server-side code and never exposed to the client.

## License

MIT
