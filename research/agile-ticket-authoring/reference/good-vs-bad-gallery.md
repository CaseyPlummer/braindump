# Good vs bad — a ticket gallery

_Audience: **reference**_

Six common failures, each shown as a bad ticket and its fix. The principles live in
[`best-practices.md`](best-practices.md); this is where they get concrete. Examples are
invented throwaways to teach the _shape_ — not real recommendations.

---

## 1. Solution-first → outcome-first

**❌ Before**

> **Title:** Add a Redis cache to the profile endpoint
> Implement a Redis layer in front of `GET /profile` and invalidate on write.

**✅ After**

> **Title:** Profile pages load fast enough that users stop bouncing
> **Summary / Why:** Profile pages take ~2s and we see a measurable bounce on them.
> Faster loads should reduce drop-off.
> **Acceptance criteria:** profile p95 < 300 ms; bounce rate on the page drops vs the
> current baseline.
> **Technical notes:** must not serve stale data after a profile edit. _How_ (cache,
> query tuning, …) is the implementer's call.

**Why better:** states the **outcome and the measurable value**, and leaves the solution
(Redis or otherwise) to the engineer instead of baking it into the title.

---

## 2. Vague, untestable AC → binary & testable

**❌ Before**

> **Acceptance criteria:**
>
> - Search works well and feels fast.
> - Results are relevant.

**✅ After**

> **Acceptance criteria:**
>
> - [ ] Results return in < 500 ms p95.
> - [ ] A query with no matches shows the empty-state message, not a spinner.
>
> ```gherkin
> Scenario: Search returns matches
>   Given the catalog contains an item named "blue mug"
>   When I search for "mug"
>   Then "blue mug" appears in the results
> ```

**Why better:** every criterion is **binary and measurable**; the scenario has **one
trigger** (`When`), with context in `Given`. "Works well / feels fast" can't be passed or
failed.

---

## 3. Too-big story → split into vertical slices (SPIDR)

**❌ Before**

> **Title:** User can manage their account
> _(14 acceptance criteria covering email, password, 2FA, billing, notifications,
> data export, deletion…)_

**✅ After** — split with **SPIDR** into thin vertical slices, each shippable:

> - **A user can change their email** (Data: email only, first).
> - **A user can reset a forgotten password** (Path: the reset flow).
> - **A user can enable 2FA** (Rules: start with TOTP only; SMS later).
> - **A user can export their data** (Data: JSON first; other formats later).

**Why better:** each slice **flows and ships independently**, and the board's cycle-time
forecasts stay meaningful. A 14-criteria story is a release wearing a story's clothes.

---

## 4. Useless bug report → reproducible

**❌ Before**

> **Title:** Login is broken, please fix ASAP
> It doesn't work for some people.

**✅ After**

> **Title:** Login fails with "invalid token" for users whose session is > 24 h old
> **Steps to reproduce:** 1) log in; 2) leave the tab open > 24 h; 3) click anything.
> **Expected:** silent re-auth or a clean re-login prompt.
> **Actual:** a blocking "invalid token" error; the only fix is a hard refresh.
> **Environment:** web, all browsers, prod build 4.12.
> **Evidence:** console error + HAR attached.

**Why better:** a developer can **reproduce it without a meeting**, and the title names the
**observable symptom**, not a guessed cause.

---

## 5. Horizontal slice → vertical slice

**❌ Before**

> **Title:** Build the notifications API
> Stand up the `/notifications` service and schema. (No UI, nothing a user can see.)

**✅ After**

> **Title:** A user gets an email when their data export finishes
> Touches the worker, the notifications service, and the email template — one thin path,
> end to end.

**Why better:** delivers **visible behavior**, so it passes INVEST's _independent_ and
_valuable_ tests. "Build the API" is a layer, not a slice — it can't be demoed or
deprioritized on its own.

---

## 6. "Refactor X" tech debt → Enabler with cost-of-inaction

**❌ Before**

> **Title:** Tech debt: refactor the auth module
> It's messy and hard to work with.

**✅ After**

> **Title:** Enabler: replace the deprecated auth library before it blocks the v3 upgrade
> **Risk / cost of inaction:** the current library is end-of-life; it blocks the framework
> v3 upgrade and caused 2 incidents last quarter.
> **Measurable improvement:** removes the upgrade blocker; cuts auth-related incidents.
> **Enables:** the v3 upgrade epic; SSO work that depends on v3.

**Why better:** gives the PO a **reason to prioritize it** in business terms. "It's messy"
loses every time to a feature; "it blocks v3 and caused incidents" doesn't.

---

## The pattern across all six

Name the **outcome**, make it **testable**, slice it **thin and vertical**, and say **why
it matters**. Every fix above is one of those four moves — and they're the same moves the
[`templates.md`](../team/templates.md) and [`best-practices.md`](best-practices.md) ask for.
