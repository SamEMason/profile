# Profile — Planned Product and Model Evolution

## Purpose

Capture the product and architectural ideas discussed after the initial development plan. These are **planned directions and hypotheses**, not completed implementation or a fixed delivery schedule. The immediate priority remains getting the first experience-capture workflow into use and learning from it.

## 1. First-class entities and normalized relationships

Evolve the initial `Experience` fields into distinct, reusable entities where real usage supports doing so:

- **Project:** A first-class record for a product, repository, or body of work. Experiences reference projects rather than repeating project names as strings.
- **Skill:** A reusable skill record linked to experiences through a many-to-many relationship. A skill can appear across many experiences, and an experience can demonstrate many skills.
- **Source:** A first-class provenance/evidence record, potentially linked to multiple experiences, with an experience able to cite multiple sources. Sources may eventually include repositories, commits, documents, or agent sessions.

The resulting model connects experiences, projects, skills, and sources instead of treating each experience as a self-contained collection of strings. Keep the initial string fields until normalization solves observed problems; do not build all tables simply because they are conceivable.

## 2. Composable experiences

Allow an experience to be assembled from smaller experiences, retaining the underlying records rather than duplicating their contents.

- Model experience-to-experience relationships, potentially as a self-referential many-to-many association.
- Support different levels of abstraction: a specific technical decision, a larger feature effort, or a broader project accomplishment.
- Explore rules for composition, including preventing cycles and preserving provenance, when implementing this feature.

This is a proposed capability, not part of the current initial schema.

## 3. Separate capture and composition

Distinguish two operations:

- **Capture experience:** Identify and record a new meaningful experience from discussion, work context, or historical evidence.
- **Compose experiences:** Select and synthesize existing experience records into a higher-level account, preserving links back to the constituent experiences.

These workflows can share application services and storage without conflating original evidence with later synthesis.

## 4. Conversational review and approval

The agent proposes a record, the user discusses and refines it, and **only an explicitly approved record is persisted**. For the initial workflow, there is no need for a database `draft`/`approved` status or saved drafts. Revisit draft persistence only if real use calls for it.

## 5. Profile resolution and eventual authentication

For now, application services accept `profileId`, while `resolveProfile` determines the active profile in the single-user environment. A possible later path is Better Auth and a `profile.userId` association. Authentication and authorization will require further design; the resolution boundary is intended to limit coupling, not guarantee a one-function migration.

## 6. Product hypotheses and experimentation

**Value hypothesis:** Converting raw experiences into structured, durable, reusable data unlocks value that would otherwise be lost or difficult to access.

**UX hypothesis:** Conversational AI can make identifying, reviewing, and capturing meaningful experiences easy enough to become habitual.

The first usable capture skill is the beginning of the product experiment. Evaluate through actual use:

- Does the agent identify experiences worth keeping?
- Is the review-and-approval conversation useful or burdensome?
- Does capture become a habit during ordinary work?
- Do accumulated records improve later retrieval, storytelling, and other practical uses?

Use what is learned to guide subsequent modeling and interfaces rather than specifying the entire product in advance.

## 7. Exploratory development approach

Keep a clear architectural direction while allowing implementation and product decisions to evolve. Use Claude Code's plan mode and small, reviewable changes; personally inspect unfamiliar code, discuss alternatives, and commit when satisfied. Avoid reintroducing a heavy autonomous workflow or a rigid backlog as a prerequisite to experimentation.

## Status and relationship to the original plan

This document is a **supplement** to `profile-development-plan.md`, not a replacement or a record of completed work. The initial PostgreSQL foundation, application services, MCP interface, and capture skills remain the near-term path. Entity normalization and experience composition are future directions to validate against actual experience data.
