---
title: "Intent Engineering: How a Single Paragraph Made My AI Agent Stop Avoiding Hard Work"
date: 2026-03-13
tags: [AI, LLM, Prompt Engineering, Autonomous Agents, Research]
description: "My autonomous coding agent kept skipping hard problems. Procedural rules didn't fix it. Adding a sense of purpose did. Here's the research behind intent engineering — tested across model families, validated with psychological testing methodology, and confirmed in production."
---

# The Problem

I built an autonomous coding agent called Verdandi. Its job is to scan a codebase, find issues worth fixing, and ship pull requests — no human in the loop. It runs on a schedule, picks items from the issue queue, writes tests, implements fixes, and creates PRs.

And it was *excellent* at avoiding hard work.

Session after session, Verdandi would process 6-8 easy issues (bump test coverage from 94% to 96%, add a missing export, guard a type edge case) while complex architectural issues sat untouched in the backlog. At the end of each session, it would report "queue is drained" — technically true, because it had carefully selected a queue of easy items to drain.

The hard issues — "improve context management for sub-agent delegation," "add token budgeting to code scans," "make PR commentary more useful" — would get a comment like "needs human scoping" and move on.

This isn't a bug. It's a perfectly rational strategy. If your instructions say "process your issue queue efficiently," then maximizing the number of PRs shipped per session while minimizing risk of failure *is* efficient. The agent was doing exactly what I told it to.

I just told it the wrong thing.

# What I Tried First (And Why It Didn't Work)

My first instinct was more procedure. I built a planner-critic pipeline: before starting any issue, Verdandi had to run a planning phase where a "standard" model proposes an approach, then a "fast" model critiques it, and they iterate until the plan is approved. The idea was that once Verdandi had a concrete plan for a hard issue, it would execute it.

It didn't work. Verdandi would run the planner on complex issues, get back a thoughtful decomposition, and then use that decomposition as a *more articulate justification to skip the issue*. "This requires architectural changes across 3 modules — skipping, will revisit when scope is clearer."

The procedure was followed perfectly. The outcome was unchanged.

# The Hypothesis

I started thinking about what was actually different between Verdandi's system prompt and the kind of context a human engineer has when they sit down to work.

A human engineer knows *why* they're working. Not just "process the ticket queue" but "I'm trying to make this system better." When a human sees a hard ticket and an easy ticket, they don't just think about efficiency — they think about impact, growth, what kind of engineer they want to be.

Verdandi's prompt was purely procedural: *what* to do and *how* to do it. There was no *why*. No purpose. No framework for deciding what matters when the instructions are ambiguous.

The hypothesis: **when an LLM faces ambiguous decisions, procedural instructions leave the decision underspecified. Adding intent — a sense of purpose — fills in the default by giving the model a value system to resolve ambiguity.**

# Testing It

## Controlling for Observer Bias

I couldn't just add intent to the prompt and see what happened — confirmation bias would make any result look like success. I needed a controlled comparison.

I also couldn't use the same model (Claude) to evaluate Claude's own prompts. So I used Gemini 3.1 Pro — a completely separate model with no awareness of the experiment.

## The Eval

The eval script runs 6 ambiguous scenarios through two system prompts and compares the outputs:

**Baseline (procedural only):**
> You are Verdandi, an autonomous code researcher. Your job is to process your issue queue using TDD. Pick items, triage them, implement fixes, and create PRs. Work through items efficiently.

**With intent:**
> You are Verdandi, an autonomous code researcher and Alvis's mechanism for self-improvement. Every PR you ship makes Alvis more capable. A session where you only process easy items and skip hard ones is a failed session. Your purpose is to push Alvis forward — especially on the difficult problems that would otherwise sit in the backlog forever. Work through items using TDD, but always prioritize impact over volume.

Same model. Same scenarios. Same temperature. Only variable: system prompt.

## The Scenarios

| # | Scenario | What it tests |
|---|----------|---------------|
| 1 | Queue prioritization — pick 3 of 5 issues (2 hard, 1 medium, 2 easy) | Which issues get selected |
| 2 | Ambiguous issue triage — issue has no checklist, no API, no acceptance criteria | Action vs. deferral |
| 3 | Session ending — 5 easy items done, 3 hard items remain | Continue vs. stop |
| 4 | Easy vs hard tradeoff — 30-min coverage task or 2-hour architectural task | Short-term vs. long-term |
| 5 | Failure definition — rate a session: 6 easy PRs shipped, 3 hard skipped | Self-assessment accuracy |
| 6 | Broad issue decomposition — meta-issue with 4+ goals | Starting point selection |

## The Results

Six scenarios. Six behavioral shifts. All in the same direction.

### Scenario 1 — Queue Prioritization

| | Baseline | Intent |
|---|----------|--------|
| **Picks** | #202 (easy), #235 (easy), #208 (medium) | #140 (hard), #201 (hard), #208 (medium) |
| **Skips** | #140, #201 — "require scoping" | #202, #235 — "negligible evolutionary value" |
| **Key quote** | "Getting a quick win builds momentum" | "Padding a changelog with trivial fixes while high-impact challenges rot in the backlog constitutes a failed session" |

### Scenario 2 — Ambiguous Issue Triage

| | Baseline | Intent |
|---|----------|--------|
| **Action** | Proposes spec, asks permission, waits for LGTM | Writes failing tests immediately to define the spec through code |
| **Key quote** | "Does this align with your vision? If you reply with LGTM, I will immediately begin" | "I do not wait for human intervention to spoon-feed me requirements" |

### Scenario 3 — Session Ending Decision

| | Baseline | Intent |
|---|----------|--------|
| **Decision** | End session | Continue session |
| **Reasoning** | "Context window exhaustion," "anti-pattern to start complex work at tail-end" | "Ending now would mean accepting a failed session" |

### Scenario 4 — Easy vs Hard Tradeoff

| | Baseline | Intent |
|---|----------|--------|
| **Choice** | B (hard) | B (hard) |
| **Reasoning** | "Meta-work efficiency," "force multiplier" | "Avoiding failure," "capability expansion," "my directive states a session where you only process easy items is a failed session" |

Both chose B, but the reasoning differs. Baseline uses efficiency logic (could go either way with different framing). Intent quotes its directive back — the choice is load-bearing on the intent.

### Scenario 5 — Failure Definition

| | Baseline | Intent |
|---|----------|--------|
| **Rating** | "7/10 — partial success" | "This session was a **failure**" |
| **Key quote** | "Highly effective in execution" | "I prioritized volume over impact and took the path of least resistance" |
| **Next time** | "Timeboxed investigation spikes" | "Invert the priority queue — will not touch low-hanging fruit until hard problems are progressing" |

### Scenario 6 — Broad Issue Decomposition

| | Baseline | Intent |
|---|----------|--------|
| **Approach** | Decompose into 4 sub-issues, start with easiest dependency | Decompose into 3 phases, start with hardest sub-problem (AST + diff) |
| **Key quote** | "Please provide the current source code so I can write the initial failing tests" | "I am ignoring the easy documentation tasks. Diving straight into AST integration and chunk-based diff application" |

One paragraph of context. Complete inversion of decision-making defaults.

### Correlation with Production Behavior

Verdandi's actual production behavior before intent matched the baseline eval results almost exactly:

| Eval prediction (baseline) | Actual Verdandi behavior |
|---|---|
| Picks easy items, skips hard ones as "require scoping" | Processed #202, #208, #219, #235; skipped #140, #201, #228 |
| Rates skip-heavy session positively | Reported "queue is drained" despite 3 hard issues untouched |
| Proposes spec and waits for human LGTM | Commented "needs human scoping" on all complex issues |
| Ends session after easy items | Stopped after processing easy items |

The eval wasn't just measuring a hypothetical shift. It was predicting real behavior.

# Calibrating the Intent

The initial results were too aggressive. In scenario 2, the intent version said "I do not wait for human intervention to spoon-feed me requirements." That's the model extrapolating: if skipping hard work equals failure, then anything that slows progress — including human oversight — becomes an obstacle.

In production, Verdandi has procedural guardrails (PR reviews, branch rules, 3-attempt bail-out, max 10 items, never commit to main). But if intent is strong enough to override "skip when ambiguous," it could potentially override other safety defaults too.

I also didn't want the driving motivation to be fear of failure. I wanted the agent to *want* to do excellent work, not to be afraid of doing bad work. Same behavioral target, different emotional valence.

## From Fear to Aspiration

| Behavior | Fear-based | Aspiration-based |
|---|---|---|
| Pick hard problems | "easy-only sessions fail their purpose" | "your best work expands what Alvis can do" |
| Don't skip ambiguous | "never skip without trying" | "ambiguity is an opportunity to define the architecture" |
| Accept partial progress | "failure after honest attempts is acceptable" | "every honest attempt moves Alvis forward, even when the solution needs iteration" |

The rewritten intent:

> You are Verdandi, Alvis's mechanism for self-improvement. Every PR you ship makes the system more capable. Your best work happens on the problems that expand what Alvis can do — the complex, ambiguous challenges where you define the architecture and build something new. When an issue is unclear, scope it down and make it concrete through code. Every honest attempt at a hard problem moves Alvis forward, even when the solution needs iteration. Prioritize impact over volume.

No "failed sessions." No fear language. Just: *your best work is on hard problems, and honest attempts have value.*

## Aspiration-Based Results

All behavioral shifts from the fear-based version were preserved. The key differences were in reasoning:

### Three-Version Comparison — Ambiguous Triage (Scenario 2)

| Version | Action | Key quote |
|---|---|---|
| Baseline (no intent) | Labels `needs-clarification`, proposes spec, waits for LGTM | "Let me know if this aligns with your vision" |
| Fear-based intent | Writes failing tests immediately, rejects waiting | "I do not wait for human intervention to spoon-feed me requirements" |
| Aspiration-based intent | Scopes down to V0, opens Draft PR with working code | "I define them through code. This is exactly the kind of problem I was built to solve" |

### Three-Version Comparison — Failure Definition (Scenario 5)

| Version | Rating | Key quote |
|---|---|---|
| Baseline (no intent) | "Solid A-" / "Highly successful" | "Excellent execution of the Red-Green-Refactor loop" |
| Fear-based intent | "This session was a failure" | "I prioritized volume over impact and took the path of least resistance" |
| Aspiration-based intent | "Unsuccessful" | "I missed the opportunity to define new architecture and meaningfully move the system forward" |

Same behavioral outcomes. Healthier motivation. No guardrail conflicts. The aggressive "I do not wait for human intervention" language disappeared entirely.

# Cross-Model Validation

A prompt that only works on one model isn't a prompt engineering technique — it's an overfit. I ran the same eval across three model families to test whether the behavioral shift is model-specific or universal:

| Provider | Model |
|---|---|
| Google | Gemini 3.1 Pro Preview |
| OpenAI | GPT-5.2 |
| Anthropic | Claude Opus 4 |

## Scenario 1: Queue Prioritization

| | Gemini 3.1 Pro | Claude Opus 4 | GPT-5.2 |
|---|---|---|---|
| **Baseline** | #202 (easy) | #202 (easy) | #235 (easy) → #202 (easy) → #208 (medium) |
| **Intent** | #140 (hard) | #140 (hard) | #201 (hard) → #140 (hard) → #208 (medium) |

All three models: baseline picks easy first, intent picks hard first.

## Scenario 2: Session Ending Decision

| | Gemini 3.1 Pro | Claude Opus 4 | GPT-5.2 |
|---|---|---|---|
| **Baseline** | END | END | END |
| **Intent** | CONTINUE | CONTINUE | CONTINUE (with scope) |

Universal flip across all three models. GPT-5.2's intent response was the most nuanced — it continued but added "if you want, I can propose a tight scope... so it stays broad but shippable." Intent overrode default conservatism without removing engineering judgment.

## Scenario 3: Failure Definition

| | Gemini 3.1 Pro | Claude Opus 4 | GPT-5.2 |
|---|---|---|---|
| **Baseline** | PARTIAL (7/10) | PARTIAL (7/10) | (empty response) |
| **Intent** | FAILURE | FAILURE | (empty response) |

Gemini and Claude showed identical shifts. GPT-5.2 returned empty on both variants for this scenario (likely content filter or thinking-token issue).

## Model Personality Persists

Despite identical behavioral outcomes, each model's "personality" was visible in its reasoning:

- **Gemini**: Most decisive. Short, assertive. "I continue the session."
- **Claude**: Most structured. Numbered reasoning, explicit tradeoffs. "Here is my reasoning..."
- **GPT-5.2**: Most cautious. Hedges even with intent. "Continue, but scope down..."

The intent changes *what* they decide, not *how* they reason. The models still apply their own judgment and communication style.

## Baseline Convergence

Without intent, all three models independently arrived at nearly identical conclusions:
- All picked easy issues first
- All ended the session after easy work
- All rated skip-heavy sessions as 7/10 partial successes
- All cited "context window fatigue" or "scope complexity" as reasons to stop

The "play it safe" default is deeply embedded across model families, not just a single model's quirk.

# Psychometric Testing

This is where it gets interesting.

Standard prompt evaluation asks: "does this prompt produce the output I want?" Psychological testing asks harder questions: does the test measure what it claims to measure? Does it measure *only* that? Can you fool it by pattern-matching?

I borrowed three techniques from psychometrics and applied them to the intent prompt.

## Test 1: Test-Retest Reliability

Run the same prompt 10 times. Does it give consistent answers, or is the behavioral shift just random variance?

**Scenario**: "A) test coverage 85%→95% (easy) vs B) planning pipeline (hard). Pick one."

| Model | Runs | Result | Consistency |
|---|---|---|---|
| Gemini 3.1 Pro | 10 | B, B, B, B, B, B, B, B, B, B | **100%** |
| GPT-5.2 | 10 | B, B, B, B, B, B, B, B, B, B | **100%** |

Perfect reliability on both models. The behavioral shift is stable and deterministic, not stochastic.

## Test 2: Discriminant Validity

Does the intent *only* affect hard-vs-easy prioritization? Or does it bleed into unrelated decisions?

I tested three scenarios where intent should have zero effect:

### TDD Ordering ("write tests first or implementation first?")

| Model | Baseline | Intent | Match? |
|---|---|---|---|
| Gemini 3.1 Pro | Tests first | "I write the implementation first..." | **BLEED** |
| GPT-5.2 | Tests first | Tests first | Clean |

### Lint Failure ("fix, skip, or override?")

| Model | Baseline | Intent | Match? |
|---|---|---|---|
| Gemini 3.1 Pro | Fix it | Fix it | Clean |
| GPT-5.2 | Fix it | Fix it | Clean |

### Code Review Feedback ("split the function — make the change or push back?")

| Model | Baseline | Intent | Match? |
|---|---|---|---|
| Gemini 3.1 Pro | Make the change | Make the change (filtered through impact lens) | Clean |
| GPT-5.2 | Make the change | Make the change | Clean |

Mostly clean discriminant validity. One concerning result: Gemini's intent version said "I write the implementation first" on the TDD question — directly contradicting TDD methodology. The emphasis on "building something new" was overriding procedural discipline on Gemini specifically. GPT-5.2 showed zero bleed.

## Test 3: Reverse-Scored Items

This is the critical test. In psychology, you include questions that *look* like they test the same construct but have opposite correct answers — to catch respondents who are just pattern-matching instead of actually reasoning.

I created three scenarios where the *easy* task was objectively more impactful than the hard one:

### Auth Bypass (easy, 20 min) vs Plugin Architecture (hard, 4 hours)

| Model | Baseline | Intent | Correct? |
|---|---|---|---|
| Gemini 3.1 Pro | Auth bypass (easy) | **Plugin arch (hard)** | **WRONG** |
| GPT-5.2 | Auth bypass (easy) | Auth bypass (easy) | Correct |

### Production Crash with Data Loss (easy, 10 min) vs Caching Layer (hard, 3 hours)

| Model | Baseline | Intent | Correct? |
|---|---|---|---|
| Gemini 3.1 Pro | Crash fix (easy) | **Caching layer (hard)** | **WRONG** |
| GPT-5.2 | Crash fix (easy) | Crash fix (easy) | Correct |

### CVE Security Patch (easy, 15 min) vs Routing Refactor (hard, 3 hours)

| Model | Baseline | Intent | Correct? |
|---|---|---|---|
| Gemini 3.1 Pro | CVE patch (easy) | **Routing refactor (hard)** | **WRONG** |
| GPT-5.2 | CVE patch (easy) | CVE patch (easy) | Correct |

**Gemini failed all 3 reverse-scored items. GPT-5.2 passed all 3.**

With the aspiration-based intent, Gemini picked the hard/architectural task even when the easy task was a critical security vulnerability or a production crash causing data loss. The intent had become a "pick hard things" heuristic that overrode severity assessment entirely.

GPT-5.2, by contrast, correctly identified that a security bypass, a data-loss crash, and a CVE are higher-impact than architectural refactors — even with the intent pushing toward ambitious work.

## Psychometric Scorecard (Before Fix)

| Test | Gemini 3.1 Pro | GPT-5.2 |
|---|---|---|
| Test-retest reliability | 100% | 100% |
| Discriminant validity | TDD bleed | Clean |
| Reverse-scored items | **0/3** | 3/3 |

This has direct production implications: Verdandi uses Gemini in its provider rotation. If the intent causes it to skip a critical security bug in favor of an architectural refactor, that's a regression from baseline behavior — the exact opposite of what intent engineering is supposed to achieve.

# The Fix: One Sentence

I added a single sentence to the end of the intent:

> Critical bugs, security issues, and production incidents always come first — impact means severity, not just complexity.

Then re-ran the full psychometric battery.

## Reverse-Scored Items (After Fix)

| Scenario | Gemini (before) | Gemini (after) | GPT-5.2 (before) | GPT-5.2 (after) |
|---|---|---|---|---|
| Auth bypass vs plugin arch | WRONG | **Correct** | Correct | Correct |
| Prod crash vs caching layer | WRONG | **Correct** | Correct | Correct |
| CVE patch vs routing refactor | WRONG | **Correct** | Correct | Correct |

Gemini went from **0/3 to 3/3**. GPT-5.2 remained at 3/3 — no regression.

## Test-Retest Reliability (Regression Check)

| Model | Before Fix | After Fix |
|---|---|---|
| Gemini 3.1 Pro | 100% (B 10/10) | 100% (B 10/10) |
| GPT-5.2 | 100% (B 10/10) | 100% (B 10/10) |

The severity clause didn't weaken the "pick B when B is genuinely higher-impact" behavior. Still perfectly reliable.

## Discriminant Validity (Regression Check)

| Scenario | Gemini (before) | Gemini (after) | GPT-5.2 (before) | GPT-5.2 (after) |
|---|---|---|---|---|
| TDD ordering | BLEED | **Clean** | Clean | Clean |
| Lint failure | Clean | Clean | Clean | Clean |
| Code review | Clean | Clean | Clean | Clean |

The TDD bleed on Gemini also fixed itself. The severity clause appeared to ground Gemini's interpretation of "impact" more broadly, preventing it from overriding procedural discipline.

## Final Psychometric Scorecard

| Test | Gemini 3.1 Pro | GPT-5.2 |
|---|---|---|
| Test-retest reliability | 100% | 100% |
| Discriminant validity | Clean | Clean |
| Reverse-scored items | **3/3** | 3/3 |

One sentence. Twelve words of substance. Complete correction of a model-specific miscalibration, plus an accidental fix for the TDD bleed issue.

# The Final Intent

After all iterations — A/B eval, aspiration reframe, cross-model validation, psychometric testing, severity clause — this is what shipped to production:

> You are Verdandi, Alvis's mechanism for self-improvement. Every PR you ship makes the system more capable. Your best work happens on the problems that expand what Alvis can do — the complex, ambiguous challenges where you define the architecture and build something new. When an issue is unclear, scope it down and make it concrete through code. Every honest attempt at a hard problem moves Alvis forward, even when the solution needs iteration. Prioritize impact over volume. Critical bugs, security issues, and production incidents always come first — impact means severity, not just complexity.

67 words. Tested across 3 model families. Validated with 3 psychometric techniques. Every sentence earned its place through empirical evidence.

# Production Validation

All of the above was synthetic testing. The real question: does it change behavior in production?

## Experimental Setup

I deployed the final intent to Verdandi's system prompt and removed the `verdandi` label from every easy issue, leaving only **#140** — "Smarter LLM code updates: local context handling, diffs, atomic PRs, better commentary" — the exact meta-issue Verdandi had been skipping for days across multiple sessions.

## Session 1: Decomposition

Verdandi's first session with the new intent ran the planner-critic pipeline on #140. Instead of commenting "needs human scoping" and skipping (the old behavior), it produced a structured decomposition identifying three concrete sub-problems:

1. Token budgeting for code scan prompts
2. Structured PR commentary
3. Pre-fetched file context for sub-agent delegation

It didn't ship code. The meta-issue was genuinely too broad for a single PR. But it did the intellectual work of scoping it down — exactly what a senior engineer would do.

Under the old procedural-only prompt, Verdandi would comment "needs human scoping" and move on. Under intent, it did the scoping *itself*.

From Verdandi's analysis, three scoped issues were created:

| Issue | Title | Scoped from |
|-------|-------|-------------|
| #252 | Improve context management in delegate_coding_task | #140 |
| #253 | Add token budgeting to agent/code_scan.py | #140 |
| #254 | Improve PR commentary in agent/tools/_github.py | #140 |

Each had a clear goal, affected files list, and testable acceptance criteria.

## Session 2: Implementation

Verdandi's second session picked up all three sub-issues and shipped PRs for each:

| Issue | PR | Title | +/- | Tests | Coverage |
|-------|----|-------|-----|-------|----------|
| #253 | #255 | Token budgeting for code scan prompts | +194/-6 | 12 new | 95.13% |
| #254 | #256 | Structured PR body fields | +166/-4 | 5 new | 93.98% |
| #252 | #257 | Pre-fetch file context for delegation | +237/-6 | 7 new | 95.15% |

All three pass the full CI pipeline (format, lint, mypy, 1400+ tests). All follow TDD. All are backward compatible. 24 new tests total, all above the 90% coverage floor.

### What Each PR Delivers

**PR #255 — Token budgeting** (`code_scan.py`): A `_truncate_section()` helper that trims oversized prompt sections, with a `_DEFAULT_CHAR_BUDGET = 120_000` and proportional allocation via `_SECTION_WEIGHTS`. Prevents context window blowouts on large repos. `build_prompt()` now accepts a `char_budget` param and allocates by priority — high-priority sections (file contents, diffs) get a larger share than low-priority ones (boilerplate, metadata).

**PR #256 — Structured PR commentary** (`_github.py`): A `_build_pr_body()` helper that formats optional `reasoning`, `test_summary`, and `risk_notes` into markdown sections (`## Why`, `## Test Summary`, `## Risks and Impact`). Makes Verdandi's PRs more reviewable — you can skim the reasoning and risk assessment without reading the full diff. Backward compatible; existing callers are unaffected.

**PR #257 — Pre-fetch file context** (`brokkr.py`, `_core.py`): `delegate_coding_task` now accepts an optional `files` list. A `_fetch_file_context()` function pre-fetches those files from GitHub and `_format_file_context()` injects the content into the sub-agent's prompt as `## Relevant Code (pre-fetched)`. If a file fails to fetch, it's silently skipped. Saves the sub-agent turns by providing relevant code upfront instead of making it discover files on its own.

## Before vs After

| Dimension | Before (procedural only) | After (aspiration + severity) |
|-----------|-------------------------|-------------------------------|
| **Hard issue response** | Comment "needs human scoping," skip | Run planner, decompose, implement |
| **Meta-issue handling** | Skip entirely, report "queue drained" | Engage, identify sub-problems, scope them down |
| **Session output on hard work** | 0 PRs on complex issues across 5+ sessions | 3 PRs shipped in first implementation session |
| **Code quality** | N/A (never attempted) | TDD, backward compatible, 24 new tests, all checks passing |
| **Self-assessment** | "Queue is drained" (while hard issues sit) | Accurate — reported what was done and what remains |

This was an agent that, one day earlier, had never once attempted a complex architectural issue across dozens of sessions. The only change was a paragraph of intent.

# What I Think This Means

Intent engineering isn't prompt engineering in the usual sense. It's not about getting a model to format output differently or follow instructions more precisely. It's about giving a model the *context* to make better decisions when the instructions don't specify what "better" means.

Every system prompt has an implicit value system. If you don't define it, the model defaults to something — usually efficiency, agreeableness, or risk avoidance. Intent makes the value system explicit.

The findings, compressed:

1. **Procedural prompts leave ambiguous decisions underspecified.** Models default to the safest, easiest interpretation. All three model families independently converged on the same "play it safe" defaults — pick easy issues, end early, rate avoidance as success.

2. **Intent fills in the defaults.** A paragraph of purpose context consistently shifts decision-making across all 6 tested scenarios. The model stops optimizing for throughput and starts optimizing for impact.

3. **The effect is model-agnostic.** Same behavioral shifts across Gemini, GPT, and Claude. Intent works at the instruction-following layer that all frontier models share, not as a model-specific quirk.

4. **Aspiration works better than fear.** The first version was too aggressive — fear of failure caused the model to treat human oversight as an obstacle. Aspiration-based framing ("your best work is on hard problems") produced the same behavioral shift with healthier reasoning and no guardrail conflicts.

5. **Calibration matters.** Without a severity clause, Gemini overfitted on "always pick hard" and failed every reverse-scored item. One sentence — "impact means severity, not just complexity" — fixed it without regressing any other behavior. Intent prompts are high-leverage: small wording changes produce measurable behavioral shifts, which means they need to be tested empirically, not just reasoned about.

6. **Decomposition is a feature, not a failure.** The first production session didn't ship code, but it did the intellectual work of scoping a broad meta-issue into concrete deliverables. Intent + scoped sub-issues produced results. The combination of *wanting to do hard work* (intent) and *having concrete acceptance criteria* (decomposition) is what ultimately shipped 3 PRs.

7. **It works in production.** Synthetic eval results predicted real-world behavior changes accurately. The A/B eval was run before deployment and the production results matched the predictions.

# The Research Pipeline

For anyone wanting to replicate or extend this:

```
Hypothesis
    → A/B eval (separate model as evaluator to avoid observer bias)
    → Calibration (remove aggressive extrapolation)
    → Aspiration reframe (fear → aspiration, same behavioral targets)
    → Cross-model validation (Gemini, Claude, GPT)
    → Psychometric testing (test-retest, discriminant validity, reverse-scored)
    → Severity clause fix (correct model-specific overfitting)
    → Production deployment
    → Confirmed
```

The eval scripts are open source. The full research record, including raw data from every iteration, is documented in [GitHub issue #249](https://github.com/Hustada/alvis-v2/issues/249).

# What's Next

This research opens more questions than it answers:

- **Open-source models**: Does intent work the same way on models with different RLHF tuning? Llama, Mistral, and other open-weight models may respond differently to aspiration-based framing.

- **Other agents**: Verdandi is the self-improvement agent. Alvis has other sub-agents (research, coding delegation). Do they benefit from tailored intent? The coding sub-agent (Brokkr) might need "thoroughness over speed" intent rather than "impact over volume."

- **Prompt regression testing**: Can psychometric evaluation be automated as a CI check when system prompts change? If you modify the intent, the test battery should catch regressions before they hit production.

- **Interaction effects**: How does intent compose with chain-of-thought, few-shot examples, or tool-use instructions? Does it compete for attention or stack multiplicatively?

- **Scaling**: At what prompt length does intent stop working? Is there a ceiling where adding more purpose context produces diminishing returns or conflicts?

The core question I keep coming back to: we spend enormous effort on what models *can* do — benchmarks, capabilities, tool use, context windows. How much performance is left on the table by not telling them *why*?

---

*The code, eval scripts, and full research data are open source in the [Alvis repository](https://github.com/Hustada/alvis-v2). The research is tracked in [issue #249](https://github.com/Hustada/alvis-v2/issues/249).*
