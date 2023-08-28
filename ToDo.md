# Tests
  - Test keyword types (`string`, `symbol`, `number` etc.)
  - Test garbage nodes in path (such as `/this-is-unsupported-garbage/g.flags.length`)
  - Recreate development docs
  - Add typed `nameof` (like this: `nameof.typed<Console>().assert` or alternatively `nameof.typed<Console>(c => c.log).bind`) to get the exact name of the key as type
