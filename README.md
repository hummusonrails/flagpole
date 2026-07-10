# flagpole

A tiny feature-flag service and its typed client SDK, built to demonstrate an end-to-end
developer experience with **JFrog Fly**: build an app, containerize it, and publish artifacts
(a Docker image and an npm package) through a CI pipeline.

The name is a small pun. A flagpole raises flags, a tadpole grows into a frog, and JFrog's mascot
is a frog. The dashboard leans into it.

## What it does

- **service** exposes a small REST API for feature flags, backed by an in-memory seeded store.
- **flagpole-client** is a typed SDK that wraps the API. The one line an app actually writes is
  `await flags.isEnabled("new-checkout")`.
- **dashboard** is a small web page that lists the flags and flips them live through the SDK.

## Repo layout

```
flagpole/
├── service/                   express + typescript flag service  (becomes the docker image)
├── packages/flagpole-client/  the typed sdk                      (becomes the npm package)
└── apps/dashboard/            vite + react dashboard
```

## The API

| Method | Route         | Purpose                              |
|--------|---------------|--------------------------------------|
| GET    | `/flags`      | list all flags                       |
| GET    | `/flags/:key` | get one flag (404 if unknown)        |
| PUT    | `/flags/:key` | set a flag, body `{ "enabled": bool }` |
| GET    | `/health`     | health check                         |

## Prerequisites

- Node 22 (see `.nvmrc`)
- pnpm
- Docker (only needed to run the service as a container)

## Run it locally

```bash
pnpm install

# build the sdk once, the dashboard imports it
pnpm --filter flagpole-client build

# terminal 1: the service on :8080 (seeded with a few flags)
pnpm --filter @flagpole/service dev

# terminal 2: the dashboard
pnpm --filter @flagpole/dashboard dev
```

Open the dashboard and flip a flag. The dashboard talks to the service at
`http://localhost:8080` by default, override it with `VITE_API_URL`.

### Run the service as a container

```bash
docker build -f service/Dockerfile -t flagpole-service .
docker run -p 8080:8080 flagpole-service
curl http://localhost:8080/flags
```

## Use the SDK

```ts
import { FlagpoleClient } from "flagpole-client";

const flags = new FlagpoleClient({ baseUrl: "http://localhost:8080" });

if (await flags.isEnabled("new-checkout")) {
  // ship the new checkout
}
```

## Tests

```bash
pnpm -r test
```

## CI and artifact flow

On every push, GitHub Actions builds the app, builds the Docker image and pushes it to JFrog Fly
as a container registry, and publishes the SDK to JFrog Fly as an npm registry. The workflow is
wired up next, and this section is expanded with the exact steps once it lands.
