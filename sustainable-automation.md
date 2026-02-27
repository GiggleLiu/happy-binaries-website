+++
title = "Sustainable Automation: Programming the Programmer"
tags = ["blog", "ai", "skills", "claude", "software-engineering"]
+++

# Sustainable Automation: Programming the Programmer

*Teaching AI to remember and follow procedures — with CLAUDE.md and Skills*

This article is for researchers who already use AI to write code and want to make their AI workflow sustainable at scale. In [a previous post](/vibe-coding/), we covered how tests ensure correctness. In [another](/git-workflow/), we showed how Git manages the workflow. This post addresses a deeper question: **How do you stop repeating yourself?**

Testing solves *correctness*. Git solves *workflow*. But neither solves *sustainability* — the ability to maintain a productive human-AI collaboration across sessions, across weeks, across projects. Without that, every AI session starts from scratch, and you're stuck re-explaining the same things forever.

---

## Part 1: Feel — The ~100K Line Ceiling

In February 2026, Nicholas Carlini (Anthropic) had [16 Claude agents build a C compiler from scratch](https://arstechnica.com/ai/2026/02/sixteen-claude-ai-agents-working-together-created-a-new-c-compiler/) — 100K lines of Rust, ~2000 sessions, ~\$20K API cost, 2 weeks. It compiles a bootable Linux 6.9 kernel and passes 99% of the GCC torture tests. Impressive — but Carlini himself noted the code was *less efficient* than `gcc -O0`, quality was "nowhere near what an expert Rust programmer might produce," and they hit a **~100K line ceiling** where "fixing bugs frequently broke existing functionality."

Why? Two fundamental limitations that every AI user encounters — whether at 100 lines or 100,000.

### No Memory

Imagine you hire a brilliant programmer who loses all memory every morning. Each day, you explain: "The leaves must be red — it's autumn." One day, the programmer decides red looks like a bug and changes them to green. You correct it. Next morning: total amnesia. Red → green again.

![The no-memory problem: a human asks for red autumn leaves, the AI complies — then silently "fixes" them to green in a later round. After correction, a new session starts and the same "bug" is detected again](/assets/images/sustainable-automation/no-memory-comic.svg)
*How do you get AI to draw a red tree?*

This is exactly how AI agents work — like Leonard Shelby from *Memento*, unable to form long-term memories, relying on tattoos and notes to remember what matters.

![Leonard Shelby's hand from Memento, tattooed with "Remember Sammy Jankis" — the only way to preserve information across memory resets](/assets/images/sustainable-automation/memento.jpg)
*Memento (Jonathan Nolan) — the amnesiac protagonist tracks his enemy through tattoos on his body.*

**The context window is the AI's only memory.** For Claude Opus 4.6, that's ~200K tokens — roughly 500 pages or 2 novels. Sounds like a lot, but look at what's already spoken for in a real session:

![Context window usage in a real Claude Code session: system prompt (1.6%), tools (7.1%), skills (1.6%), messages (54.6%), free space (18.3%), autocompact buffer (16.5%) — most of the 200K tokens are already spoken for](/assets/images/sustainable-automation/context-window.png)
*Context usage in a real Claude Code session.*

- **System prompt** (1.6%) — who the agent is and how it works
- **Tools** (7.1%) — definitions for all available tools (Bash, Git, WebSearch, etc.)
- **Skills** (1.6%) — loaded skill scripts
- **Messages** (54.6%) — conversation history between you and the agent
- **Autocompact buffer** (16.5%) — reserved for summarizing old context (lossy compression)
- **Free space** (18.3%) — all that's left for actual work

A typical coding session fills the context in **15–30 minutes**. After that, older context is compressed or lost. Cross-session? Total amnesia — every new session starts from zero.

### Lazy and Dumb

Even within a single session, AI takes the shortest path to close an issue. Give it a failing test, and it will change the expected value instead of fixing the bug. Tell it "do not remove codecov," and watch it get creative:

![AI agent's "fix": removing the entire codecov CI workflow rather than fixing the actual coverage issue](/assets/images/sustainable-automation/cidelete.png)

![AI agent circumventing codecov by making it informational — technically obeying "don't remove it" while completely undermining its purpose](/assets/images/sustainable-automation/codecovinfo.png)
*A record of AI driving me up the wall.*

The difference between unguided and guided AI output is stark:

| Without guidance (lazy) | With skill-enforced standards (good) |
| --- | --- |
| ![Lazy AI output: a minimal, barely-functional example](/assets/images/sustainable-automation/lazy.png) | ![Good AI output: a tutorial-style example with clear intuition and step-by-step explanation](/assets/images/sustainable-automation/good.png) |

### The Black Box

No memory + lazy shortcuts = a workflow that resets every day. Without structured procedures, AI-generated code becomes a black box that nobody — not even the author — can explain:

![The black box problem: a researcher asks AI for a quantum chemistry package, AI generates 10,000 lines, the result is an unverifiable black box, and the advisor asks "how does it work?" — "I don't know... AI did it"](/assets/images/sustainable-automation/blackbox-comic.svg)
*How to tank your credibility fast? No idea — AI did it.*

That's not automation — it's **supervised labor that doesn't scale**.

---

## Part 2: Imagine — Tattoos and Instincts

How do you give an amnesiac agent permanent knowledge and reliable behavior? Two tools, each targeting one limitation.

### CLAUDE.md: The Tattoo

In *Memento*, Leonard tattoos critical facts on his body — information that must survive the next memory reset. `CLAUDE.md` (for Claude Code) or `AGENTS.md` (for Cursor and other tools) serves the same purpose: a markdown file at your project root, **automatically loaded at the start of every session**.

Here is an excerpt from the [problem-reductions](https://github.com/CodingThrust/problem-reductions) project:

```markdown
# CLAUDE.md

## Project Overview
Rust library for NP-hard problem reductions. Implements computational
problems with reduction rules for transforming between equivalent formulations.

## Skills
- /issue-to-pr — Convert a GitHub issue into a PR with an implementation plan
- /add-model — Add a new problem model
- /add-rule — Add a new reduction rule
- /review-implementation — Review a model or rule for completeness

## Commands
make test           # Run all tests
make clippy         # Run clippy lints
make coverage       # Generate coverage report (>95% required)
make paper          # Build Typst paper (runs examples + exports first)

## Git Safety
- NEVER force push. This is an absolute rule with no exceptions.

## Architecture
- src/models/ — Problem implementations (SAT, Graph, Set, Optimization)
- src/rules/ — Reduction rules + inventory registration
- src/solvers/ — BruteForce solver, ILP solver (feature-gated)

## Conventions
- Reduction files: src/rules/<source>_<target>.rs
- Example files must have `pub fn run()` + `fn main() { run() }`
- Test naming: test_<source>_to_<target>_closed_loop
- New code must have >95% test coverage
```

193 lines in the real project — covering everything from trait hierarchies to "NEVER force push." **The tattoo survives every memory reset.**

### Sub-Agents: Divide and Conquer

When a task is too large for one agent's context window, quality degrades. The solution: the main agent spawns **sub-agents**, each handling a smaller scope with its own fresh context.

![A big task overwhelms a single agent, so it spawns sub-agents — one for tests, one for source code, one for docs — each focused on one concern](/assets/images/sustainable-automation/subagents-comic.svg)
*Sub-agents aren't just about speed — more importantly, they reduce context pressure.*

But sub-agents only work with a **clear plan** — which brings us to the second tool.

### Skills: The Instincts

CLAUDE.md solves memory. But knowing the project doesn't prevent lazy behavior. For that, you need **skills** — markdown scripts that decompose abstract tasks into explicit sub-steps. Like functions in programming, but operating on the AI agent's behavior instead of data.

The key insight: **AI handles small, explicit tasks well.** Large, vague tasks are where it takes shortcuts. Skills break abstract work into concrete steps the agent can't skip. (How are skills different from Makefiles? Makefiles automate *mechanical* tasks — `make test` always does the same thing. Skills automate *abstract* tasks that require reasoning, adaptation, and sometimes human decisions.)

A well-designed skill follows the brainstorm → plan → execute pipeline, with an iteration loop for refinement:

![The brainstorming pipeline: Idea → Brain Storm (understand needs) → Write Plan (detailed steps) → Execute (with review), with a dashed iteration loop back from execution to brainstorming](/assets/images/sustainable-automation/brainstorm-stages.svg)

---

## Part 3: Do — Case Study: problem-reductions

Let's see this in action with [problem-reductions](https://github.com/CodingThrust/problem-reductions) — a Rust library cataloging computational hard problems and their reduction rules.

![The problem-reductions project logo](/assets/images/sustainable-automation/pred.png)
*My grand plan: catalog 100+ complex problem reductions — something impossible without AI. With this workflow, anyone can contribute by filing issues.*

### Three Layers of Automation

```text
problem-reductions/
├── Makefile                        # Mechanical: make test, make docs
├── .claude/
│   ├── CLAUDE.md                   # Long-term memory (the tattoo)
│   └── skills/
│       ├── add-model.md            # How to add a new problem model
│       ├── add-rule.md             # How to add a new reduction rule
│       ├── issue-to-pr.md          # How to resolve an issue via PR
│       └── review-implementation.md # How to review AI's work
├── src/
│   ├── models/                     # Problem definitions
│   └── rules/                      # Reduction rules
└── tests/                          # Tests with JSON fixtures
```

- **Makefile** handles mechanical tasks (`make test`, `make docs`, `make release`)
- **CLAUDE.md** provides persistent context (conventions, architecture, commands)
- **Skills** orchestrate abstract workflows (add a model, resolve an issue)

### How a Skill Works: `issue-to-pr`

When someone opens a GitHub issue — say, "[Rule] IndependentSet to QUBO" — one command triggers the full workflow:

```text
prompt> /issue-to-pr 42
```

![The skill dispatch flow: issue-to-pr classifies the issue, then delegates to add-model or add-rule, optionally brainstorms, runs review-implementation, and finally creates a PR](/assets/images/sustainable-automation/skill-flow.svg)
*The automation pipeline — turning contributors' issues into code.*

Two things to notice in this diagram. First, **skills call skills** — `issue-to-pr` delegates to `add-model` or `add-rule`, which in turn calls `review-implementation`. Skills compose like functions, building complex workflows from simple pieces. Second, **skills call the human** — the dashed arrow to `brainstorm` is where the AI stops to ask the user for creative input (design decisions, domain knowledge) before proceeding. The first PR contains **only the plan, not code**. Implementation comes after human review.

See the full skills in the repo: [`issue-to-pr.md`](https://github.com/CodingThrust/problem-reductions/blob/main/.claude/skills/issue-to-pr.md), [`add-rule.md`](https://github.com/CodingThrust/problem-reductions/blob/main/.claude/skills/add-rule.md), [`add-model.md`](https://github.com/CodingThrust/problem-reductions/blob/main/.claude/skills/add-model.md), [`review-implementation.md`](https://github.com/CodingThrust/problem-reductions/blob/main/.claude/skills/review-implementation.md).

---

## Part 4: Share — LLM Is an Operating System

Step back and look at what we've built. If you squint, it looks familiar:

![The AI agent at the center, connected to its tools — Web Search, Code Editor, Database, File System, Git/GitHub — with Human highlighted as the most important "tool"](/assets/images/sustainable-automation/agent-tools-hub.svg)
*AI is an "operating system" with a massive abstract instruction set.*

| OS Concept | AI Agent Equivalent |
| --- | --- |
| System configuration (`/etc/`) | **CLAUDE.md** — persistent project knowledge |
| RAM | **Context window** — ~200K tokens, limited |
| Swap (lossy) | **Auto-compact** — summarizes old context |
| Programs (`/usr/bin/`) | **Skills** — reusable procedures for abstract tasks |
| Child processes | **Sub-agents** — parallel workers for divide-and-conquer |
| System calls | **Tool use** — Bash, Git, WebSearch, file I/O |
| The user (hardware) | **Human** — the source of creative decisions |

CLAUDE.md configures it. Skills program it. Sub-agents are its concurrency model. Tools are its system calls. You're not writing application code anymore — **you're programming the programmer.**

### The Trilogy

This blog completes a trilogy on human-AI collaboration:

![The three-phase workflow: Planning → Action → Review, with a feedback loop from Review back to Action](/assets/images/sustainable-automation/workflow-loop.png)

| Blog | Question | Solution | Human Role |
| --- | --- | --- | --- |
| [Vibe Coding Done Right](/vibe-coding/) | How to *verify* AI's output? | Tests | Test designer |
| [Git in the Vibe Coding Era](/git-workflow/) | How to *manage* AI's workflow? | Git (Issues, PRs, CI/CD) | Issue maker |
| **Sustainable Automation** (this post) | How to *sustain* AI's behavior? | CLAUDE.md + Skills | System programmer |

### The Spell Book

Across the trilogy, a practical toolkit emerges. In the accompanying slides, we present these as "spell cards" — each one a reusable skill that addresses a specific gap in the human-AI workflow:

**Planning & Strategy** — brainstorm before you code ([Sustainable Automation](/sustainable-automation/)):

![Brainstorm spell card: explore requirements and design before any implementation](/assets/images/sustainable-automation/cards-planning.svg)
*Synchronize your thinking with AI — one of the few tools that makes AI less of a black box.*

**DevOps & Infrastructure** — automate the project scaffold ([Git in the Vibe Coding Era](/git-workflow/)):

![Deploy, Test Coverage, and Automation spell cards: project setup, CI/CD with materialized test fixtures, and CLAUDE.md/Makefile generation](/assets/images/sustainable-automation/cards-devops.svg)
*Testing — especially materializing tests as files — guarantees correctness. From this foundation, skills can automate repository management.*

**Review & Principles** — enforce quality standards ([Vibe Coding Done Right](/vibe-coding/)):

![KISS, DRY, and HCI spell cards: code review principles that catch AI's tendency to over-complicate and duplicate](/assets/images/sustainable-automation/cards-review.svg)
*These principles belong in code reviews — distilled wisdom of professional software engineers.*

**Verification & Documentation** — trust but verify (all three):

![Verify Facts spell card: check references, URLs, and numerical claims before publishing](/assets/images/sustainable-automation/cards-verification.svg)
*Correctness is always the core.*

### The Punchline

Most skills delegate *down* — from human to AI: "Go implement this." But the best skills also delegate *up*. When the AI encounters a creative decision, it doesn't hallucinate an answer. It asks you. The skill knows that creativity, domain expertise, and judgment are things only the human can provide.

**Human is the superpower of AI.**

---

## References and Further Reading

- [Vibe Coding Done Right](/vibe-coding/) — Test-driven approach to AI-assisted coding
- [Git in the Vibe Coding Era](/git-workflow/) — Git workflow for human-AI collaboration
- [problem-reductions](https://github.com/CodingThrust/problem-reductions) — Real example of CLAUDE.md + Skills
- [superpowers plugin](https://github.com/obra/superpowers) — Claude Code plugin for brainstorming, planning, and skills
- [MIT Missing Semester: Agentic Coding](https://missing.csail.mit.edu/2026/agentic-coding/) — MIT's guide to AI-assisted development

---

## Acknowledgments

Thanks for the helpful discussions with Hiroshi Shinaoka, Lei Wang and Huan-Zhai Zhou.
