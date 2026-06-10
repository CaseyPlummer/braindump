# Current best practices for agile ticket authoring (2024–2026)

_Audience: **reference**_

A cited synthesis of current best practices for writing backlog items, with a Kanban/flow
bias and extra depth on AI-assisted authoring. Findings are grouped by topic; each carries
a confidence tag. Full source list at the end.

## Confidence tags

- **[high]** — stated by a primary/authoritative source and cross-checked against
  independent corroboration or adversarial verification.
- **[medium]** — a single strong source, or a claim with notable caveats.
- **[unverified]** — asserted by a credible source but not independently cross-verified
  here; well-founded, not settled.

AI and tooling findings are time-sensitive: vendor features change frequently, and the
most-cited AI study is a 2025 preprint.

## 1. The backlog item and the story format

- **[high] Outcome over output.** Current guidance leads with the change in the world —
  the value — rather than the thing to build.
- **[high] The "As a / I want / so that" template is contested.** Linear calls it a
  _"cargo cult ritual that… wastes a lot of resources and time"_ that _"silos engineers
  into a mechanical role,"_ recommending plain-language issues with _"a clear, defined
  outcome."_ Opinionated vendor advocacy, not settled consensus — but a real signal that
  the template is openly questioned.
- **[high] Job stories** ("When _[situation]_, I want _[motivation]_, so I can
  _[outcome]_") are an established alternative (Alan Klement / Intercom), valued for
  capturing the triggering situation a plain user story omits.
- **[high] INVEST remains the common bar** (Independent, Negotiable, Valuable, Estimable,
  Small, Testable), but a flow-oriented alternative has emerged: **FIRST** (ProKanban) —
  **F**eedback Loop, **I**ndependent, **R**ight-Sized, **S**mall, **T**estable. FIRST
  keeps Independent / Small / Testable but replaces _Valuable_ and _Estimable_ with
  _Feedback Loop_ and _Right-Sized_, reflecting a probabilistic, flow-based approach
  (right-sizing over estimation).

## 2. Story splitting / vertical slicing

- **[high] Slice vertically, not horizontally.** A good item cuts through all
  architectural layers to deliver a visible behavior change; splitting by a single layer
  ("backend only") fails INVEST's _independent_ and _valuable_ tests (Humanizing Work).
- **[high] SPIDR** (Mike Cohn, derived from analyzing 1,000+ stories) — five techniques:
  **S**pike (research a poorly-understood item), **P**ath (separate alternate paths, e.g.
  card vs. Apple Pay), **I**nterfaces (split by browser/device, or deliver a complex UI
  incrementally), **D**ata (support a subset of data first), **R**ules (temporarily relax
  business rules a story will ultimately need).
- **[high] Humanizing Work's nine patterns** — Workflow Steps, Operations (CRUD),
  Business-Rule Variations, Variations in Data, Data-Entry Methods, Major Effort,
  Simple/Complex, Defer Performance, and Break Out a Spike (last resort).
- **[high] Choosing among candidate splits:** prefer the split that lets you deprioritize
  or drop a slice (80/20), or the one that yields more equally-sized small stories.

## 3. Acceptance criteria

- **[high]** Both **Given/When/Then (Gherkin)** and **checklist/rule-based** formats are
  current (Thoughtworks): Given = preconditions, When = a _single_ trigger, Then = expected
  outcome. GWT's value is that requirement syntax matches test syntax (Cucumber/SpecFlow).
  The key anti-pattern is **multiple triggers in one When** — each scenario tests one
  behavior, with conditions in Given. Keep criteria binary and testable; vague/unmeasurable
  criteria and an over-long list (which usually hides a too-big story) are the other
  anti-patterns.
- **[high] Specification by Example** (Gojko Adzic) frames acceptance criteria as
  **collaborative, testable, living documentation** produced by the _Three Amigos_
  (business + dev + test) — not a solo hand-off. Difficulty writing AC signals a
  poorly-sliced story.

## 4. Definition of Ready — a contested practice

- **[high] A hard DoR gate is a recognized anti-pattern.** Mike Cohn recommends against a
  DoR for most teams: a rule that _"something must be done before the next thing can
  start… moves the team dangerously close to stage-gate process,"_ undermining concurrent
  engineering. He favors flexible guidelines over hard rules.
- **[high] A lightweight DoR keeps value in specific cases** (Robert Galen):
  cross-team/external dependencies, insufficient understanding, skill gaps, requirement
  clarity — provided it never becomes a 100% stage-gate.
- **[high] Kanban frames readiness as a pull policy, not a gate.** Readiness rests on the
  Kanban _Method's_ practice **Make Policies Explicit** — an agreed, visible policy for what
  makes an item safe to pull; the Kanban _Guide_ expresses the same idea as its
  **Definition of Workflow**. The 2025 Guide mandates a Definition of Workflow, WIP limits,
  pull, and four flow metrics, and **omits both a Definition of Ready and estimation.**
- **[high] Pre-commitment work is "options," pulled by replenishment.** In flow, items
  before the commitment point are **options** (many expected to be discarded), pulled via
  explicit **replenishment** criteria when capacity exists — replacing a fixed "ready"
  backlog. The current Kanban Guide (v2025.5) makes DoR, DoD, classes of service, and
  commitment points all **non-mandatory**; only the Definition of Workflow (explicit
  policies + a Service Level Expectation) is required.

## 5. Kanban / flow mechanics

- **[high]** Kanban is _"a strategy for optimizing the flow of value through a process"_
  (The Kanban Guide) — flow, not sprints, is the organizing principle.
- **[high] Four mandatory flow metrics:** WIP, Throughput, Work Item Age, Cycle Time —
  these replace velocity / story points.
- **[high] Pull system with explicit WIP limits:** capacity (WIP dropping below the limit)
  signals when to start new work, not a plan.
- **[high] Right-sizing + cycle-time scatterplots** give probabilistic forecasting as an
  alternative to story-point estimation (accuracy degrades under high size variability).
- **[high] Service Level Expectation (SLE) + Monte Carlo.** Set delivery expectations
  probabilistically — e.g. "85% of items finish within 8–10 days," from history — instead
  of story points; **Monte Carlo simulation** is the most accurate forecasting method
  (never averages). #NoEstimates (Zuill, Duarte, Killick) is the credible-but-contested
  edge: some flow teams don't estimate at all.
- **[high] Classes of Service are contested:** Vacanti argues they harm predictability
  (Thoughtworks concurs, via Little's Law), whereas classic Anderson Kanban promotes them.
  Don't treat them as settled good practice.

## 6. Closing the loop with the originator

- **[high] "Closing the loop" is an established practice** in product / customer-feedback
  management: personally notify the people who raised a request once it ships. It also maps
  to Kanban's **Implement Feedback Loops** practice.
- **[high] Aha! Ideas implements it directly:** when a linked feature/epic is marked
  shipped, the idea auto-updates and subscribers (including the original submitter) are
  notified, with optional quick-comment buttons to capture their reaction.

## 7. Architect decision rights & the what-vs-how line

- **[high] The Architecture Advice Process** (Andrew Harmel-Law; Fowler, Thoughtworks,
  O'Reilly's _Facilitating Software Architecture_, 2024): **anyone can make an architectural
  decision, provided they first seek _advice_ — not permission — from everyone meaningfully
  affected and those with relevant expertise.** The advice is non-binding; the decision-taker
  keeps accountability. This is the dominant 2024–2026 answer to the architect-as-bottleneck
  problem (top-down architecture doesn't scale), shifting the architect from gatekeeper to
  **coach / conversation-starter.** Chief risk: it requires trust and psychological safety.
- **[high] Lightweight scaffolding for it:** a recurring (e.g. weekly) **Architecture
  Advisory Forum** that ensures the needed conversations happen rather than imposing approval
  gates, plus collectively-sourced principles, a tech radar, and ADRs. Governance = "ensuring
  the conversations that need to happen are happening," not gating decisions.
- **[unverified]** Reference implementations, the "walking skeleton" first slice (Cockburn),
  and "do one, pair on the second, delegate the third" remain sound practitioner lore for
  transferring a pattern without bottlenecking.

## 8. Architecture Decision Records

- **[high] Nygard's five-part format** — Title, Context, Decision, Status, Consequences —
  kept to one or two pages (_"large documents are never kept up to date"_), and
  **immutable once accepted**: a reversed decision is marked **superseded**, not edited or
  deleted. Corroborated by Fowler, AWS, Microsoft Azure WAF, adr.github.io. A minor
  "living document" (mutable) camp exists.
- **[high] Formats span a spectrum:** Nygard's minimal five-part template; **MADR**
  (Markdown ADRs — options-centric, with pros/cons per option and metadata like
  decision-makers); and the single-sentence **Y-statement** ("In the context of _X_, facing
  _Y_, we decided _Z_ to achieve _W_, accepting _V_"). Store in-repo (e.g. `docs/adr/`),
  monotonically numbered, and record the decision's confidence/uncertainty.

## 9. Lightweight governance / guardrails

- **[high] Architectural fitness functions** (Thoughtworks): _"an objective integrity
  assessment of some architectural characteristics… may encompass unit testing, metrics,
  monitors"_ — the canonical automatable guardrail that scales without a human gatekeeper.
- **[unverified] One-way vs two-way door** decisions (reversibility; popularized by Amazon)
  remain a useful framing for how much to deliberate before deciding.
- **[high] Golden paths / paved roads** ("paths not cages"): best-practice defaults that cut
  developer cognitive load and improve security while leaving developers free to deviate.
  Treat the platform as a product, ship a **Thinnest Viable Platform**, and measure
  **adoption** as the key success metric (an unused platform is a failure). Failure mode:
  taking feedback too literally — the "faster horse" problem.

## 10. Who writes stories / platform-as-a-product

- **[high] Platform-as-a-product** (Team Topologies; Martin Fowler): treat an internal
  platform as a product, with the other dev teams as customers.
- **[high] Tailor ownership by team type — the autonomy spectrum.** Team Topologies
  distinguishes autonomy of _How_ (methods/tools) from _What/When_ (problem selection +
  priority). Stream-Aligned teams sit highest on What/When with an externally-facing PO;
  **Platform teams have an internally-focused Platform PO** and roadmap autonomy driven by
  internal-consumer needs. It warns against the **"Product Owner everywhere"** anti-pattern —
  the title shouldn't imply a uniform role.
- **[high] Authoring ≠ value ownership.** Anyone may author a backlog item; the Product Owner
  is accountable for the backlog existing (Mountain Goat / Cohn; 2020 Scrum Guide). A common
  anti-pattern: many stories beginning "As a user…" signals the user identity isn't
  meaningful.

## 11. AI-assisted ticket authoring

- **[high] LLM-written stories meet acceptance criteria less often than human ones.** A
  2025 study (10 frontier models) found them comparable in coverage and style but lower in
  diversity / creativity, and accepted less often regardless of model size. _(2025
  preprint — directional.)_
- **[high] Dominant failure modes:** hallucination (plausible-but-wrong output) and weak
  domain / company-specific knowledge (2025 systematic review; OWASP LLM09:2025). The
  consensus mitigation is **human-in-the-loop / hybrid workflows.**
- **[high] Drafting is the validated use; refinement stays human.** LLMs reliably turn
  discovery into draft requirements that humans then refine.
- **[medium] LLM-as-judge:** LLMs can assess user-story semantic quality given clear
  criteria, potentially reducing human review — caveated by verbosity / position /
  self-enhancement biases.
- **[high] Native tooling is preview-then-apply** (human-in-the-loop by design): Jira
  (Atlassian Intelligence / Rovo) generates acceptance criteria, subtasks, and user stories
  via `/rovo` or `/ai` (Atlassian's own example uses a Job Story: "When… I want to… So I
  can…"); Azure DevOps's **AI Work Item Assistant** generates and refines fields with safe
  previews ("choose field → prompt → preview → Apply").
- **[high] AI inherits specification quality.** It's a context-completion engine, so
  well-specified tickets yield aligned output and poor ones produce "plausible-but-wrong"
  results ("build the wrong product faster"). Named failure modes beyond hallucination:
  **Ghost APIs** (AC citing nonexistent endpoints), **fabricated edge cases**,
  **over-specification / scope-creep bloat**, and **skipped NFRs** (security, accessibility,
  performance). Never ship AI output straight to the backlog without refinement.
- **[medium] Prompt patterns that help** (documented, not independently validated): a persona
  system prompt (e.g. "Senior Technical PM" enforcing INVEST + Gherkin), decompose epics
  first then expand stories, ground generation with **RAG over your OpenAPI/Swagger docs**
  (prevents Ghost APIs), and append an **NFR checklist**.
- **[high] Measured benefit in the _adjacent_ domain of AI code review:** Atlassian's Rovo
  Dev cut median PR cycle time ~31% across 1,900+ repos (ICSE'26 study) under a
  human-as-final-decider design — evidence AI suggestions are useful under HITL, though it's
  code review, not ticket authoring, and a vendor self-study.

## 12. Tool nomenclature & Aha! → Jira mapping

- **[high]** "PBI" (Product Backlog Item) is an **Azure DevOps Scrum-template** term;
  Jira's equivalent is a **Story.**
- **[high] Aha!'s Jira mapping is "intentionally flexible" — three recommended options:**
  (1) Features → Epics, Requirements → Stories; (2) Epics → Epics, Features → Stories,
  Requirements → Sub-tasks; (3) Epics → Epics, Features → Stories/Tasks — plus two
  Advanced-Roadmaps (Initiative) variants.

## Sources

- Linear Method — _Write issues, not user stories_: https://linear.app/method/write-issues-not-user-stories
- Intercom — _How we accidentally invented job stories_ (Klement): https://www.intercom.com/blog/accidentally-invented-job-stories/
- Mountain Goat (Cohn) — SPIDR / splitting user stories: https://www.mountaingoatsoftware.com/blog/five-simple-but-powerful-ways-to-split-user-stories
- Mountain Goat (Cohn) — job stories: https://www.mountaingoatsoftware.com/blog/job-stories-offer-a-viable-alternative-to-user-stories
- Humanizing Work — guide to splitting user stories: https://www.humanizingwork.com/the-humanizing-work-guide-to-splitting-user-stories/
- ProKanban — FIRST: https://www.prokanban.org/blog/first
- The Kanban Guide (Vacanti/Coleman): https://kanbanguides.org/the-kanban-guide/
- Vacanti — _Actionable Agile Metrics for Predictability_: https://actionableagile.com/books/aamfp/
- Kanban University / David Anderson — principles & practices: https://djaa.com/the-principles-and-general-practices-of-the-kanban-method/
- Mountain Goat (Cohn) — _The Dangers of a Definition of Ready_: https://www.mountaingoatsoftware.com/blog/the-dangers-of-a-definition-of-ready
- Galen — _Definition of Ready as an Anti-pattern_: https://rgalen.com/agile-training-news/2016/11/8/definition-of-ready-as-an-anti-pattern
- Aha! — portal notification emails (submitters notified on status change / shipped): https://www.aha.io/support/roadmaps/strategic-roadmaps/ideas/idea-management-notifications
- Thematic — closing the customer feedback loop: https://getthematic.com/insights/close-the-customer-feedback-loop
- arXiv 2507.15157 — LLM-generated user stories (2025 preprint): https://arxiv.org/pdf/2507.15157
- Frontiers in Computer Science 2025 — LLMs in requirements engineering (review): https://www.frontiersin.org/journals/computer-science/articles/10.3389/fcomp.2025.1519437/full
- Atlassian — use Atlassian Intelligence to write/edit content: https://support.atlassian.com/jira-software-cloud/docs/use-atlassian-intelligence-to-help-write-or-edit-content/
- Microsoft — AI Work Item Assistant for Azure DevOps: https://marketplace.visualstudio.com/items?itemName=ms-adowia-external.workitem-assistant-extension-external
- Nygard — _Documenting Architecture Decisions_: https://www.cognitect.com/blog/2011/11/15/documenting-architecture-decisions
- Fowler — Architecture Decision Record: https://martinfowler.com/bliki/ArchitectureDecisionRecord.html
- Thoughtworks — architectural fitness function: https://www.thoughtworks.com/radar/techniques/architectural-fitness-function
- Thoughtworks — predictability & classes of service: https://www.thoughtworks.com/en-in/insights/blog/predictability-and-classes-service
- thoughtbot — one-way vs two-way door decisions: https://thoughtbot.com/blog/one-way-vs-two-way-door-decisions
- Team Topologies — platform engineering / platform-as-a-product: https://teamtopologies.com/platform-engineering
- Fowler — platform prerequisites: https://martinfowler.com/articles/platform-prerequisites.html
- platformengineering.org — golden paths: https://platformengineering.org/blog/how-to-pave-golden-paths-that-actually-go-somewhere
- Aha! — recommended Jira mappings: https://support.aha.io/aha-roadmaps/integrations/jira/recommended-jira-mappings~7444658099150945189
- Harmel-Law / Fowler — _Scaling the Practice of Architecture, Conversationally_ (Advice Process): https://martinfowler.com/articles/scaling-architecture-conversationally.html
- Thoughtworks — Harmel-Law on decentralized architecture decisions: https://www.thoughtworks.com/en-us/insights/blog/architecture/software-architecture-decisions-andrew-harmel-law
- adr.github.io — ADR formats (Nygard, MADR, Y-statement): https://adr.github.io/
- Thoughtworks — applying BDD acceptance criteria to user stories: https://www.thoughtworks.com/en-us/insights/blog/applying-bdd-acceptance-criteria-user-stories
- Gojko Adzic — _Specification by Example_: https://gojko.net/books/specification-by-example/
- Applied Frameworks — user stories & the vertical slice: https://agile.appliedframeworks.com/applied-frameworks-agile-blog/user-stories-making-the-vertical-slice
- Official Kanban Guide (Kanban University): https://kanban.university/wp-content/uploads/2023/04/The-Official-Kanban-Guide_A4.pdf
- Scrum.org — Professional Scrum with Kanban (limit/optimize WIP): https://www.scrum.org/resources/blog/professional-scrum-kanban-psk-dont-just-limit-wip-optimize-it-post-1-3
- teamworx — Definition of Ready: anti-pattern, and when it might be useful: https://teamworx.co.nz/agile-articles/definition-of-ready-an-anti-pattern-and-when-it-might-be-useful/
- Nave — estimation in Kanban (scatterplots, Monte Carlo): https://getnave.com/blog/estimation-in-kanban/
- Team Topologies — navigating the product-ownership autonomy spectrum: https://teamtopologies.com/news-blogs-newsletters/navigating-the-autonomy-spectrum-tailoring-product-ownership-with-team-topologies
- Mountain Goat (Cohn) — user stories (authoring vs ownership): https://www.mountaingoatsoftware.com/agile/user-stories
- Atlassian — Jira AI / Rovo: https://www.atlassian.com/software/jira/ai
- Atlassian — Rovo Dev developer-productivity study (ICSE'26): https://www.atlassian.com/blog/ai-at-work/developer-productivity-improved-with-rovo-dev
- Allstacks — specification quality in AI product management: https://www.allstacks.com/blog/specification-quality-ai-product-management
- Vegavid — using AI for user stories (prompt patterns; treat its stats as uncited): https://vegavid.com/blog/how-to-use-ai-for-user-stories
- Microsoft Learn — Azure DevOps Scrum process workflow: https://learn.microsoft.com/en-us/azure/devops/boards/work-items/guidance/scrum-process-workflow
- Microsoft Learn — Azure DevOps epics & features: https://learn.microsoft.com/en-us/azure/devops/boards/backlogs/define-features-epics
