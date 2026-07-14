# flagpole

A tiny feature-flag service and its typed client SDK, built to demonstrate an end-to-end
developer experience with **JFrog Fly**: build an app, containerize it, and publish artifacts
(a Docker image and an npm package) through a CI pipeline.

The name is a small pun. A flagpole raises flags, a tadpole grows into a frog, and JFrog's mascot
is a frog. The dashboard leans into it.

## What it does

- **service** exposes a small REST API for feature flags, backed by an in-memory seeded store.
- **@hummusonrails/flagpole-client** is a typed SDK that wraps the API. The one line an app actually writes is
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
pnpm --filter @hummusonrails/flagpole-client build

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
import { FlagpoleClient } from "@hummusonrails/flagpole-client";

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

Every push to `main` (or a manual dispatch) runs a single workflow,
[`.github/workflows/ci.yml`](.github/workflows/ci.yml). A green run ends with two artifacts in
the JFrog Fly registry and a release tracked against this repo. Nothing is published by hand.

The pipeline stages, in order:

1. **Build and verify.** Install with a frozen lockfile, build the SDK, typecheck every package,
   run the tests. A failure here stops the run before anything touches the registry.
2. **Authenticate.** `jfrog/fly-action@v1` exchanges the job's GitHub OIDC token for a
   short-lived Fly access token, then configures Docker and npm on the runner to use the tenant
   registry. The workflow stores no registry credentials at all; the only permission it needs is
   `id-token: write`.
3. **Publish.** The Docker image is built and pushed, then the SDK is published if its version
   is new.

### What gets published

| Artifact                         | Type         | Destination                                                    |
|:---------------------------------|:-------------|:---------------------------------------------------------------|
| `flagpole-service`               | Docker image | `hummusonrails.jfrog.io/docker/flagpole-service:<git sha>` and `:latest` |
| `@hummusonrails/flagpole-client` | npm package  | the Fly npm registry                                            |

The image is tagged twice on every run: the commit SHA pins the exact build, `latest` tracks the
newest green run.

### The version guard

Fly rejects republishing an npm version that already exists. Instead of letting that fail the
build, the publish step asks the registry first (`npm view`) and skips with a log line when the
version is already there. Bumping the version in `packages/flagpole-client/package.json` is what
releases a new SDK.

### Releases, not just artifacts

Fly records each successful run as a release tied to the workflow and commit that produced it,
with the artifacts attached. That link only exists when artifacts arrive through CI: a manual
`docker push` from a laptop lands in the registry as an untracked artifact with no release and
no provenance. So the rule for this repo is simple: all publishing goes through the workflow.
