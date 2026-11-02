#!/bin/sh
# Disposable, isolated DSH profile. Never loads the user's credentials.
set -eu
ROOT=$(CDPATH= cd -- "$(dirname -- "$0")/.." && pwd)
DSH_APP=${CT_DSH_APP:-/Applications/DeepSeek Harness.app}
CT_VERSION=$(node -p "require(process.argv[1]).version" "$ROOT/package.json")
CT_PACKAGE="$ROOT/dist/dsh-conversation-tree-$CT_VERSION.tgz"
if [ ! -f "$CT_PACKAGE" ]; then
  echo "Missing package: run npm run pack first." >&2
  exit 1
fi
if [ ! -x "$DSH_APP/Contents/MacOS/DeepSeek Harness" ]; then
  echo "DSH Desktop not found. Set CT_DSH_APP to its .app path (macOS only)." >&2
  exit 1
fi
CT_HOME=$(mktemp -d "${TMPDIR:-/tmp}/ct-validation.XXXXXX")
trap 'rm -rf "$CT_HOME"' EXIT
export DSH_HOME="$CT_HOME"
export CT_DSH_ASAR="$DSH_APP/Contents/Resources/app.asar"
export ELECTRON_RUN_AS_NODE=1
CT_BIN="$CT_DSH_ASAR/dsh/node_modules/@deepseek-ai/dsh/lib/bin.js"
"$DSH_APP/Contents/MacOS/DeepSeek Harness" "$CT_BIN" --profile web --dump-default-config >/dev/null
"$DSH_APP/Contents/MacOS/DeepSeek Harness" "$CT_BIN" plugin --profile web add "$CT_PACKAGE"
cat > "$CT_HOME/local.patch.yml" <<PATCH
- id: session-title-llm
  disabled: true
- insert:
    - id: ct-local-provider
      name: '$ROOT/test/fixtures/local-provider.mjs'
- id: agent-default-model
  config:
    provider: ct-local
    model: fixture
PATCH
"$DSH_APP/Contents/MacOS/DeepSeek Harness" "$CT_BIN" --profile web --patch "$CT_HOME/local.patch.yml" --port 3087 --no-open
