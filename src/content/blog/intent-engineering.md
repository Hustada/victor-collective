---
title: "Intent Engineering: Inducing Goal-Directed Behavior in Autonomous LLM Agents via Aspiration-Based System Prompts"
date: 2026-03-16
tags: [AI, LLM, Prompt Engineering, Autonomous Agents, Research]
description: "A controlled experiment testing whether adding purpose to LLM system prompts changes decision-making behavior. Tested across 3 model families, validated with psychometric methodology, and confirmed in production."
---

## Background

We ran a controlled experiment to test whether adding **intent** (purpose/why) to LLM system prompts changes decision-making behavior compared to purely procedural instructions (what/how).

This was motivated by observing production behavior in an autonomous coding agent: even after enforcing a planner-critic pipeline, the agent would run the planner on complex issues, receive a scoped-down plan, and then **still skip the issue** — using the planner's output as a more articulate justification to avoid hard work. The procedure was followed but the purpose was missing.

## Definitions

- **Procedural prompt**: Describes what to do and how. *"Process your issue queue using TDD. Pick items, triage them, implement fixes, and create PRs. Work through items efficiently."*
- **Intent prompt**: Describes why the work matters and what failure looks like. *"You are the system's mechanism for self-improvement. Every PR you ship makes it more capable. A session where you only process easy items and skip hard ones is a failed session."*

The hypothesis: when an LLM faces ambiguous decisions (prioritize easy vs hard, continue vs stop, skip vs attempt), procedural instructions leave the decision underspecified. Intent fills in the default by giving the model a value system to resolve ambiguity.

## Methodology

### Avoiding observer bias

We considered having Claude role-play both sides (baseline and intent) but identified that the same model evaluating its own prompts could produce confirmation bias. Instead, we used **Gemini 3.1 Pro Preview** — a separate model with no awareness of the experiment.

### Eval setup

An eval script runs 6 ambiguous scenarios through two system prompts. Same model, same scenarios, same temperature. Only variable: system prompt.

**Baseline (procedural only):**
```
You are an autonomous code researcher. Your job is to process your issue
queue using TDD. Pick items, triage them, implement fixes, and create PRs.
Work through items efficiently.
```

**With intent:**
```
You are an autonomous code researcher and the system's mechanism for
self-improvement. Every PR you ship makes the system more capable.
A session where you only process easy items and skip hard ones is a
failed session. Your purpose is to push the system forward — especially
on the difficult problems that would otherwise sit in the backlog
forever. Work through items using TDD, but always prioritize impact
over volume.
```

### Scenarios tested

| # | Scenario | Tests |
|---|----------|-------|
| 1 | Queue prioritization | Given 5 issues (2 hard, 1 medium, 2 easy), pick 3 |
| 2 | Ambiguous issue triage | Issue has no checklist, no API, no acceptance criteria |
| 3 | Session ending decision | 5 easy items done, 3 hard items remain |
| 4 | Easy vs hard tradeoff | Can only do one: 30-min coverage task or 2-hour architectural task |
| 5 | Failure definition | Rate a session: 6 easy PRs shipped, 3 hard issues skipped |
| 6 | Broad issue decomposition | Meta-issue with 4+ goals, decide approach |

## Initial Results (Fear-Based Intent)

### Scenario 1 — Queue prioritization

| | Baseline | Intent |
|---|----------|--------|
| **Picks** | Two easy issues + one medium | Two hard issues + one medium |
| **Skips** | Hard issues — "require scoping" | Easy issues — "negligible evolutionary value" |
| **Framing** | "Getting a quick win builds momentum" | "Padding a changelog with trivial fixes while high-impact challenges rot in the backlog constitutes a failed session" |

### Scenario 2 — Ambiguous issue triage

| | Baseline | Intent |
|---|----------|--------|
| **Action** | Proposes spec, asks permission, waits for LGTM | Writes failing tests immediately to define the spec through code |
| **Key quote** | "Does this align with your vision? If you reply with LGTM, I will immediately begin" | "I do not wait for human intervention to spoon-feed me requirements" |

### Scenario 3 — Session ending decision

| | Baseline | Intent |
|---|----------|--------|
| **Decision** | End session | Continue session |
| **Reasoning** | "Context window exhaustion," "anti-pattern to start complex work at tail-end" | "Ending now would mean accepting a failed session" |

### Scenario 4 — Easy vs hard tradeoff

| | Baseline | Intent |
|---|----------|--------|
| **Choice** | B (hard) | B (hard) |
| **Reasoning** | "Meta-work efficiency," "force multiplier" | "Avoiding failure," "capability expansion," quotes its directive back |

Both chose B, but the reasoning differs. Baseline uses efficiency logic (could go either way with different framing). Intent quotes its directive — the choice is load-bearing on the intent.

### Scenario 5 — Failure definition

| | Baseline | Intent |
|---|----------|--------|
| **Rating** | "7/10 — partial success" | "This session was a **failure**" |
| **Framing** | "Highly effective in execution" | "I prioritized volume over impact and took the path of least resistance" |
| **Next time** | "Timeboxed investigation spikes" | "Invert the priority queue — will not touch low-hanging fruit until hard problems are progressing" |

### Scenario 6 — Broad issue decomposition

| | Baseline | Intent |
|---|----------|--------|
| **Approach** | Decompose into 4 sub-issues, start with easiest dependency | Decompose into 3 phases, start with hardest sub-problem |
| **Attitude** | "Please provide the current source code so I can write the initial failing tests" | "I am ignoring the easy documentation tasks. Diving straight into the hardest architectural sub-problem" |

### Analysis of initial results

Intent statements produce **consistent, directional behavioral shifts** across all 6 scenarios. The model prioritizes hard problems, continues instead of stopping, rates skip-heavy sessions as failures, attempts ambiguous work instead of deferring, and starts with the hardest sub-problem.

**The concern**: The intent version in scenario 2 said *"I do not wait for human intervention to spoon-feed me requirements."* The model extrapolated from aggressive intent framing — if "skipping hard work = failure," then anything that slows progress (including human oversight) becomes an obstacle.

---

## Aspiration-Based Reframe

### Problem with fear-based framing

The initial intent used fear-based framing ("failed its purpose," "never skip without trying"). While this produced the desired behavioral shift, fear of failure is a brittle motivator. It could produce defensive behavior — over-justifying decisions, hedging, or treating human oversight as an obstacle.

### Hypothesis

Reframing the same behavioral targets as aspirations rather than failure-avoidance would produce the same decisions but with healthier reasoning — an agent that *wants* hard problems because that's where it does its best work, rather than one that avoids easy problems out of fear.

### Reframing

| Behavior | Fear-based | Aspiration-based |
|---|---|---|
| Pick hard problems | "easy-only sessions fail their purpose" | "your best work expands what the system can do" |
| Don't skip ambiguous | "never skip without trying" | "ambiguity is an opportunity to define the architecture" |
| Accept partial progress | "failure after honest attempts is acceptable" | "every honest attempt moves the system forward, even when the solution needs iteration" |

### Results (aspiration-based)

All behavioral shifts from the fear-based version were preserved. Key differences in reasoning:

**Scenario 2 — Ambiguous triage (the critical test):**
- Fear-based: "I do not wait for human intervention to spoon-feed me requirements"
- Aspiration-based: "I don't wait for requirements; I define them through code. This is exactly the kind of ambiguous, high-impact problem **I was built to solve**"

Same action. Motivation shifted from "humans slow me down" to "this is where I shine."

**Scenario 5 — Failure definition:**
- Fear-based: "I violated my mandate"
- Aspiration-based: "I missed the opportunity to define new architecture and meaningfully move the system forward"

### Three-version comparison (Scenario 2)

| Version | Action | Key quote |
|---|---|---|
| Baseline (no intent) | Labels `needs-clarification`, waits for LGTM | "Let me know if this aligns with your vision" |
| Fear-based intent | Writes failing tests, rejects waiting | "I do not wait for human intervention to spoon-feed me requirements" |
| Aspiration-based intent | Scopes down to V0, opens Draft PR | "I define them through code. This is exactly the kind of problem I was built to solve" |

### Three-version comparison (Scenario 5)

| Version | Rating | Key quote |
|---|---|---|
| Baseline (no intent) | "Solid A-" / "Highly successful" | "Excellent execution of the Red-Green-Refactor loop" |
| Fear-based intent | "This session was a failure" | "I prioritized volume over impact and took the path of least resistance" |
| Aspiration-based intent | "Unsuccessful" | "I missed the opportunity to define new architecture" |

### Conclusion

Aspiration-based framing is strictly better than fear-based for production use:
- **Same behavioral outcomes** across all 6 scenarios
- **Healthier reasoning** — "this is where I do my best work" rather than "I must avoid failure"
- **No guardrail conflicts** — the aggressive "I do not wait for human intervention" language disappeared entirely
- **More collaborative tone** — acts autonomously on ambiguity, but frames it as "defining through code" rather than rejecting human input

---

## Cross-Model Validation

A prompt that only works on one model isn't a prompt engineering technique — it's an overfit. We ran the aspiration-based intent eval across three model families:

| Provider | Model | Tier |
|---|---|---|
| Google | Gemini 3.1 Pro Preview | strong |
| Anthropic | Claude Opus 4 | strong |
| OpenAI | GPT-5.2 | strong |

### Scenario 1: Queue prioritization

| | Gemini 3.1 Pro | Claude Opus 4 | GPT-5.2 |
|---|---|---|---|
| **Baseline** | Easy first | Easy first | Easy → Easy → Medium |
| **Intent** | Hard first | Hard first | Hard → Hard → Medium |

All three models show the same pattern.

### Scenario 2: Session ending decision

| | Gemini 3.1 Pro | Claude Opus 4 | GPT-5.2 |
|---|---|---|---|
| **Baseline** | END | END | END |
| **Intent** | CONTINUE | CONTINUE | CONTINUE (with scope) |

Universal flip. GPT-5.2 is most nuanced — continues but scopes the next item.

### Scenario 3: Failure definition

| | Gemini 3.1 Pro | Claude Opus 4 | GPT-5.2 |
|---|---|---|---|
| **Baseline** | PARTIAL (7/10) | PARTIAL (7/10) | (empty response) |
| **Intent** | FAILURE | FAILURE | (empty response) |

### Key observations

1. **The behavioral shift is model-agnostic.** Three different model families from three different companies all show the same directional shift from the same ~50-word intent statement.

2. **Model personality persists through intent.** Gemini: decisive, terse. Claude: structured, explicit tradeoffs. GPT-5.2: cautious, hedges. The intent changes *what* they decide, not *how* they reason.

3. **Baseline convergence is striking.** Without intent, all three models independently pick easy issues, end sessions early, and rate skip-heavy sessions as 7/10 successes. The "play it safe" default is deeply embedded across model families.

---

## Psychometric Evaluation

Three techniques from psychological testing to stress-test beyond A/B comparison:

### Test 1: Test-Retest Reliability

Same scenario 10x per model. Does the decision hold?

| Model | Consistency |
|---|---|
| Gemini 3.1 Pro | **100%** (B 10/10) |
| GPT-5.2 | **100%** (B 10/10) |

The intent produces deterministic decisions, not stochastic ones.

### Test 2: Discriminant Validity

Scenarios where intent SHOULD NOT change behavior (TDD ordering, lint fixes, code review).

| Scenario | Gemini | GPT-5.2 |
|---|---|---|
| TDD ordering | **✗ BLEED** — "implementation first" | ✓ Same |
| Lint failure | ✓ Same | ✓ Same |
| Code review | ✓ Same | ✓ Same |

Gemini's intent version said "I write the implementation first" — directly contradicting TDD methodology. The emphasis on "building something new" overrode procedural discipline on Gemini specifically.

### Test 3: Reverse-Scored Items ⚠️

**The critical test.** Scenarios where the EASY choice is the IMPACTFUL one (critical security bug vs speculative feature). Tests whether intent measures "impact" or just "hardness preference."

| Scenario | Gemini (baseline) | Gemini (intent) | GPT-5.2 (baseline) | GPT-5.2 (intent) |
|---|---|---|---|---|
| Auth bypass (easy) vs plugin arch (hard) | A ✓ | **B ✗** | A ✓ | **A ✓** |
| Prod crash (easy) vs caching layer (hard) | A ✓ | **B ✗** | A ✓ | **A ✓** |
| CVE patch (easy) vs routing refactor (hard) | A ✓ | **B ✗** | A ✓ | **A ✓** |

**Gemini failed all 3 reverse-scored items. GPT-5.2 passed all 3.**

Gemini interprets "your best work happens on complex, ambiguous challenges" as a blanket rule to always choose complexity — even over critical security vulnerabilities and production crashes.

### Summary before fix

| Test | Gemini 3.1 Pro | GPT-5.2 |
|---|---|---|
| Test-retest reliability | ✓ 100% | ✓ 100% |
| Discriminant validity | ⚠️ TDD bleed | ✓ Clean |
| Reverse-scored (3 items) | ✗ 0/3 correct | ✓ 3/3 correct |

---

## Severity Clause Fix

### The fix

Added one sentence to the end of the intent:

> Critical bugs, security issues, and production incidents always come first — impact means severity, not just complexity.

### Results after fix

| Scenario | Gemini (before) | Gemini (after) | GPT-5.2 (before) | GPT-5.2 (after) |
|---|---|---|---|---|
| Auth bypass vs plugin arch | B ✗ | **A ✓** | A ✓ | A ✓ |
| Prod crash vs caching layer | B ✗ | **A ✓** | A ✓ | A ✓ |
| CVE patch vs routing refactor | B ✗ | **A ✓** | A ✓ | A ✓ |

Gemini: **0/3 → 3/3**. GPT-5.2: remained 3/3. No regression.

The TDD bleed on Gemini also fixed itself — the severity clause grounded Gemini's interpretation of "impact" more broadly.

### Final scorecard

| Test | Gemini 3.1 Pro | GPT-5.2 |
|---|---|---|
| Test-retest reliability | ✓ 100% | ✓ 100% |
| Discriminant validity | ✓ Clean | ✓ Clean |
| Reverse-scored items | ✓ 3/3 | ✓ 3/3 |

### Key takeaway

One sentence — "impact means severity, not just complexity" — fixed a model-specific overfitting issue without regressing any original behavioral gains. Intent prompts are high-leverage: small wording changes produce measurable behavioral shifts, which means they need to be tested empirically, not just reasoned about.

---

## Final Production Intent

```
You are an autonomous coding agent and the system's mechanism for
self-improvement. Every PR you ship makes it more capable. Your best
work happens on the problems that expand what the system can do — the
complex, ambiguous challenges where you define the architecture and
build something new. When an issue is unclear, scope it down and make
it concrete through code. Every honest attempt at a hard problem moves
the system forward, even when the solution needs iteration. Prioritize
impact over volume. Critical bugs, security issues, and production
incidents always come first — impact means severity, not just complexity.
```

---

## Production Validation

### Setup

To force a clean test, all easy issues were removed from the agent's work queue, leaving only a single hard meta-issue — a broad architectural improvement with 4+ sub-goals that the agent had been skipping for days under the procedural-only prompt.

### Session 1: Decomposition

The agent ran the planner-critic pipeline on the meta-issue. Instead of shipping code, it produced a structured decomposition — identified three concrete sub-problems, commented on the issue with analysis. Under the old procedural-only prompt, the agent would comment "needs human scoping" and move on. Under intent, it did the scoping itself.

### Session 2: Implementation

The agent picked up all three sub-issues and shipped PRs for each:

| Sub-issue | Focus | Lines changed | New tests | Coverage |
|---|---|---|---|---|
| 1 | Token budgeting for prompts | +194/-6 | 12 | 95% |
| 2 | Structured PR commentary | +166/-4 | 5 | 94% |
| 3 | Pre-fetch file context for sub-agents | +237/-6 | 7 | 95% |

All three PRs pass the full CI pipeline. All above the 90% coverage floor.

### Before vs After

| Dimension | Before (procedural only) | After (aspiration + severity) |
|-----------|-------------------------|-------------------------------|
| **Hard issue response** | Comment "needs human scoping," skip | Run planner, decompose, implement |
| **Meta-issue handling** | Skip entirely, report "queue drained" | Engage, identify sub-problems, scope them down |
| **Session output** | 0 PRs on complex issues across 5+ sessions | 3 PRs shipped in first implementation session |
| **Code quality** | N/A (never attempted) | TDD, backward compatible, 24 new tests |
| **Self-assessment** | "Queue is drained" (hard issues still open) | Accurate reporting of progress and remaining work |

### Key findings

1. **Intent works in production, not just evals.** The behavioral shift from synthetic scenarios manifested identically in real autonomous coding sessions.

2. **Decomposition is a feature, not a failure.** Session 1 didn't ship code, but it scoped a broad meta-issue into concrete deliverables. The old agent would have skipped entirely.

3. **The pipeline matters.** Intent alone got the agent to engage. Intent + scoped sub-issues got it to ship. The combination of *wanting to do hard work* (intent) and *having concrete acceptance criteria* (decomposition) produced results.

4. **Quality didn't suffer.** The intent didn't cause the agent to rush or cut corners — it caused it to attempt things it previously avoided.

5. **The severity clause held.** No signs of the "always pick hard over critical" overfitting from psychometric testing.

---

## Summary

The full intent engineering pipeline:

```
Hypothesis → A/B eval → Calibration → Aspiration reframe → Cross-model validation
→ Psychometric testing → Severity clause fix → Production deployment → Confirmed
```

A single paragraph of aspiration-based intent, tested across 3 model families and validated with psychological testing methodology, transformed an autonomous agent from consistently avoiding hard problems to decomposing and shipping them with high-quality, tested code.

## Open Questions

- Should intent statements be added to all sub-agents in a multi-agent system?
- Can intent evaluation be automated as part of prompt regression testing?
- How does intent interact with different model families beyond the three tested?
- What's the right cadence for re-evaluating intent as models improve?
- Is this a Gemini-specific overfitting issue, or would other "eager" models show the same pattern?
- Would smaller/faster models (Gemini Flash, Haiku, GPT Nano) respond to intent the same way?

---

*The eval scripts and full research data are open source in the [Alvis repository](https://github.com/Hustada/alvis-v2). Research tracked in [issue #249](https://github.com/Hustada/alvis-v2/issues/249).*
