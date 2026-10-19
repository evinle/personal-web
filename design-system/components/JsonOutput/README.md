# JsonOutput

Pretty-printed JSON coloured the way `jq` does it, for structured terminal output (the whoami panel).

- `data` is any JSON value; `indent` defaults to 2; `highlight` lists keys whose values go `mint` (one at most, the thing to notice).
- Colours: keys `blue`, strings `ink`, numbers `cream`, booleans and null `pink`, punctuation `ink-muted`.
- Put it inside a Terminal after a `Prompt` that shows the command producing it (`whoami --json | jq`), and end with a prompt + `Cursor`.
