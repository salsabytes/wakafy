# wakafy — module + CLI for the plugin repository

A wakafy plugin is a **small repo**: multiple files, `waka.json` as config,
`index.js` as entry, later `package.json` too. Free like a real repo —
but running on the `wakafy` module.

## Usage (today)

```sh
npx wakafy init hello-friend   # once published to npm; for now from this folder:
node bin/wakafy.js init hello-friend
cd hello-friend
```

`init` creates two files:

- **`waka.json`** — title, description, category, method, entry, params.
  Edit it freely, later read by `wakafy publish`.
- **`index.js`** — your code. One contract: `function main(input)`
  and answer with **`wakafy.send(...)`**:

```js
function main(input) {
  const name = String(input.name || 'friend');
  wakafy.send({ greeting: 'Hello, ' + name + '!' });
}
```

`input` = caller query/body (`?name=ana` becomes `input.name`).
`wakafy.send(object)` answers JSON — simple, right?
(The old `return {...}` style from `main` still works.)

Then publish, two ways:

- **Import (today):** open the **Publish** tab in the dashboard, click
  *Impor waka.json + index.js*, select both files — the form fills itself
  from `waka.json`, then hit Publish.
- **Paste (manual):** fill the form from `waka.json`, paste `index.js`
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

Limits: 32 KB source, 5 s run, 256 KB output. No network/disk
(no `fetch`/`require`/`process` — pure compute).

## `waka.json` schema (engine `wakafy/1`)

```jsonc
{
  "engine": "wakafy/1",
  "name": "hello-friend",    // = plugin id (globally unique)
  "title": "Hello Friend",
  "description": "...",
  "category": "Community",
  "method": "GET",           // GET or POST
  "entry": "index.js",
  "params": [
    { "name": "name", "required": false, "placeholder": "ana" }
  ]
}
```

## Roadmap (coming up)

- `wakafy publish` — ship the repo straight from the terminal, no paste.
- multi-file + `package.json` — `require` across your own files.
- file/folder upload — static assets per plugin.
- `wakafy dev` — run locally before publishing.
