# Gate debug logging

Debug and diagnostic logging must not run unconditionally in committed code. Gate it
behind a flag, an environment variable, or a log level so it's **off by default** — and
opt-in when someone actually needs it.

## What's gated vs. what stays

- **Gate it** — debug, trace, and info-level diagnostics: the noisy "got here", value
  dumps, per-iteration traces, timing spam. Useful while investigating, noise in
  production.
- **Leave it ungated** — legitimate error and warning logging. A real error or a genuine
  warning condition should always surface; it isn't debug noise.

The line: would this line be useful to someone reading the logs in normal operation? If
yes, it's an error/warning and stays. If it only matters while actively debugging, it's
gated.

## Why

Unconditional debug logging is committed noise. It buries the signal (real errors get lost
in the spam), it can leak internal detail or sensitive values, and it costs performance on
hot paths. A logging stream people have learned to ignore is worse than no stream at all.

## How

Use whatever the language and stack already provide — a log-level threshold, a debug flag,
an env var, a logger category that's disabled by default. The mechanism doesn't matter;
the default does. **Off unless explicitly turned on.**
