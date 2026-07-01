<!--
Sync Impact Report
==================
Version change: (template/unversioned) → 1.0.0
Modified principles: N/A (initial ratification from template placeholders)
Added sections:
  - Core Principles (5 UI-focused principles)
  - UI Performance Standards
  - Development Workflow
  - Governance
Removed sections: None
Templates requiring updates:
  - .specify/templates/plan-template.md ✅ updated
  - .specify/templates/spec-template.md ✅ updated
  - .specify/templates/tasks-template.md ✅ updated
  - .specify/templates/checklist-template.md ✅ (no changes needed)
  - .specify/templates/commands/*.md ⚠ N/A (directory does not exist)
Follow-up TODOs: None
-->

# Widgit Clone Constitution

## Core Principles

### I. Speed is Non-Negotiable

Every user-facing interaction MUST feel instant. Performance is a product requirement,
not an optimization pass.

- Primary interactions (select symbol, add to board, navigate grid) MUST complete with
  perceived latency under 100ms on reference hardware defined in plan.md.
- The application MUST reach an interactive state within 2 seconds on first load
  (cold start on typical broadband).
- Large symbol grids MUST use virtualization or equivalent techniques; rendering all
  symbols eagerly is prohibited when count exceeds 50 visible cells.
- Board edits MUST use optimistic UI updates; the user MUST NOT wait on network or
  persistence before seeing the result.
- Each feature spec MUST define performance budgets (interaction latency, load time,
  frame rate) before implementation begins.

**Rationale**: Communication composition is flow-dependent. Latency breaks sentence
building and erodes trust in the tool.

### II. Ease of Use First

The UI MUST minimize cognitive and motor effort. If a novice cannot complete a primary
task without documentation, the design has failed.

- P1 user journeys MUST be completable in three or fewer deliberate interactions from
  the default home state.
- Controls MUST use familiar, consistent patterns; novel interactions MUST include
  inline guidance on first use.
- Sensible defaults MUST work without configuration; advanced settings MUST be hidden
  behind progressive disclosure.
- Error states MUST offer one-click recovery with plain-language messages—never raw
  error codes or stack traces in the UI.
- Empty states MUST teach the next action (what to do, not just that nothing exists).

**Rationale**: Widgit Clone serves users who may have motor, cognitive, or literacy
constraints. Every extra step is a barrier to communication.

### III. Simplicity Over Feature Count

Prefer a fast, obvious tool over a flexible, cluttered one.

- Every visible UI element MUST map to a documented user journey in the feature spec.
- New features MUST NOT add mandatory steps to existing P1 flows.
- Prefer one clear path over multiple equivalent options in primary workflows.
- Defer nice-to-have UI until P1 journeys are fast and frictionless.
- Complexity that violates Principles I–II MUST be documented in plan.md Complexity
  Tracking with rejected simpler alternatives.

**Rationale**: Feature creep degrades both speed and usability; restraint preserves the
core communication experience.

### IV. Accessible & Inclusive by Default

Accessibility is a release gate, not a polish item.

- All interactive elements MUST meet WCAG 2.1 Level AA.
- Touch targets MUST be at least 44×44 CSS pixels with adequate spacing.
- Keyboard navigation MUST cover all P1 flows without mouse or touch.
- High-contrast themes and scalable text (minimum 200% zoom without layout breakage)
  MUST be supported.
- Motion and animation MUST respect `prefers-reduced-motion`.

**Rationale**: A communication UI that excludes users with diverse abilities fails its
primary purpose.

### V. Experience-Verified Quality

Speed and ease of use are experiential; they MUST be validated as users experience them.

- P1 user stories MUST include measurable speed and usability success criteria
  (time-to-complete, interaction count, first-attempt success rate).
- Features MUST pass manual walkthrough of P1 flows on reference hardware before merge.
- Regression in interaction timing, step count, or accessibility MUST block release.
- Automated tests supplement but do not replace hands-on flow validation.

**Rationale**: Metrics in code (bundle size, test pass rate) do not guarantee a fast,
easy UI; user-journey validation closes that gap.

## UI Performance Standards

These standards apply to all UI work unless a feature spec documents an approved
exception in Complexity Tracking.

| Metric | Target | Measurement |
|--------|--------|-------------|
| Primary interaction latency | < 100ms perceived | Manual timing + Performance panel |
| Time to interactive (cold load) | < 2s | Lighthouse / Web Vitals |
| Frame rate during scroll/drag | ≥ 60 fps | Performance profiler |
| P1 journey step count | ≤ 3 interactions | Spec acceptance scenarios |
| First-attempt task success | ≥ 90% in usability check | Manual test with 3+ reviewers |

Reference hardware and network profiles MUST be declared in each feature's plan.md
Technical Context section.

## Development Workflow

1. **Spec**: Define user journeys with interaction counts and speed/usability success
   criteria before requirements freeze.
2. **Plan**: Constitution Check MUST pass before Phase 0 research; re-check after Phase 1
   design. Performance budgets and accessibility approach are mandatory outputs.
3. **Tasks**: P1 story tasks MUST include UX validation checkpoints, not only
   implementation and automated tests.
4. **Review**: PRs MUST confirm no regression to Principles I–IV; cite spec success
   criteria in the review checklist.
5. **Polish phase**: Reserved for cross-cutting speed and usability improvements—never
   the first place performance or accessibility work happens.

## Governance

- This constitution supersedes ad-hoc conventions when they conflict.
- Amendments require: (1) documented rationale, (2) version bump per semantic rules
  below, (3) propagation to affected templates and active feature specs where applicable.
- **Versioning policy**: MAJOR for principle removal or redefinition; MINOR for new
  principles or materially expanded guidance; PATCH for clarifications and wording.
- **Compliance review**: Every plan.md Constitution Check and every PR touching UI code
  MUST verify adherence to Core Principles I–V and UI Performance Standards.
- Runtime development guidance: follow the active feature plan at `specs/*/plan.md`
  and agent context in `.cursor/rules/specify-rules.mdc`.

**Version**: 1.0.0 | **Ratified**: 2026-07-01 | **Last Amended**: 2026-07-01
