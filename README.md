# wakafy — module + CLI for the plugin repository

A wakafy plugin is a **small repo**: `init` seeds it with the starter files
for Node.js or Go, then you add files freely — any names you like. `main` in
the config points at the file that gets executed.

## Usage (today)

```sh
npx wakafy init hello-friend        # Node.js (default)
npx wakafy init hello-go --go       # Golang
# once published to npm; for now from this folder:
node bin/wakafy.js init hello-friend
cd hello-friend
npm install                         # Node only: pulls wakafy for local testing
```

Node.js `init` creates:

- **`package.json`** — ESM project metadata with `wakafy` as a dependency
  (`^1.0.0`), so the starter runs locally after `npm install`.
- **`waka.json`** — title, description, category, method, main, params.
  Edit it freely, later read by `wakafy publish`.
- **`index.js`** — ESM starter with an explicit `import wakafy from 'wakafy'`
  and `export default async function handler(input)`.

Golang `init` creates:

- **`go.mod`** — module metadata.
- **`waka.json`** — engine `wakafy/go-1`, main `main.go`.
- **`main.go`** — `func Handle(input map[string]any) (any, error)` with no
  hidden globals; input is the parameter and the result is the return value.

Then keep adding files, e.g. `lib/util.js`. For Node one contract:
`function main(input)` / `export default async function handler(input)` and
answer with the returned object or **`wakafy.send(...)`**:

```js
const greeting = require('./greeting.js');

function main(input) {
  wakafy.send({ greeting: greeting(String(input.name || 'friend')) });
}
```

```js
module.exports = (name) => 'Hello, ' + name + '!';
```

`input` = caller query/body (`?name=ana` becomes `input.name`).
`wakafy.send(object)` answers JSON — simple, right?
(The old `return {...}` style from `main` still works.)
`require()` loads your own repo files (relative only, max 20 files).

Then publish, two ways:

- **Import (today):** open the **Publish** tab in the dashboard, click
  *Import waka.json + files*, select the repo files — the form fills itself
  from `waka.json`, then hit Publish. Manage files per plugin afterwards
  from the same tab.
- **Paste (manual):** fill the form from `waka.json`, paste the entry file
  into the editor, publish.

Either way it is instantly live
at `/username/id` + endpoint `/v1/ext/username/id`.

## Runtime API (on the server sandbox)

| API | Description |
| --- | ----------- |
| `input` | caller query/body object (strings, max 50 keys) |
| `wakafy.send(json)` | answer JSON (last call wins) |
| `wakafy.version` | engine version, e.g. `"1"` |
| `console.log(...)` | no-op (keeps examples from crashing) |
| `require(path)` | load your own repo files (`./util`, `./util.js`) |

Limits: 32 KB per file, 20 files, 5 s run, 256 KB output. No network/disk
(no `fetch`/`process` — pure compute over your own files).

## `waka.json` schema (engine `wakafy/1`)

```jsonc
{
  "engine": "wakafy/1",
  "name": "hello-friend",    // = plugin id (globally unique)
  "title": "Hello Friend",
  "description": "...",
  "category": "Community",
  "method": "GET",           // GET or POST
  "main": "index.js",        // entry file that gets executed
  "params": [
    { "name": "name", "required": false, "placeholder": "ana" }
  ]
}
```

For Go, use engine `wakafy/go-1` and point `main` at `main.go`. The handler
contract is `func Handle(input map[string]any) (any, error)`; imports are
limited to the safe stdlib subset (no filesystem/network/process).

## Roadmap (coming up)

- `wakafy publish` — ship the repo straight from the terminal, no paste.
- file/folder upload — static assets per plugin.
- `wakafy dev` — run locally before publishing.
