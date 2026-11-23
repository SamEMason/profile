# Profile — Development Plan

## Objective

Build a persistent, extensible personal information platform, beginning with software-development projects and experiences.

The immediate objective is to establish a reliable source of truth, support both ongoing and retrospective experience capture, and accumulate real Profile data while working on other projects. Sophisticated retrieval and cloud hosting can follow actual usage.

## 1. Architecture

```text
Claude Code / other agents
    ↕
Profile MCP server
    ↕
Profile application services
(validation, domain logic, persistence)
    ↕
PostgreSQL — single source of truth
(initially Docker; eventually cloud)
```

Architectural boundaries:

- **Domain model:** Define Profile, Project, Experience, Skill, sources, and relationships.
- **Application services:** Create, update, link, and retrieve records; enforce rules.
- **Persistence:** PostgreSQL holds canonical Profile data.
- **Interfaces:** MCP initially; CLI and HTTP API as useful later.
- **Agent skills:** Gather evidence, propose records, and interact with Profile through supported interfaces.

MCP is an interface for agents, not the database layer. Skills should use application services rather than manipulate the database directly.

## 2. Persistence: Pivot from SQLite to PostgreSQL

The persistence layer is still at an early stage, making this an appropriate time to switch.

Initial setup:

- PostgreSQL in Docker Compose.
- Persistent Docker volume containing **real Profile data**, not disposable test data.
- Environment-based connection configuration.
- Version-controlled schema migrations.
- Integration tests against a **separate** PostgreSQL test database.
- Backup and restore procedure.

### Initial domain concepts

| Concept      | Purpose                                                              |
| ------------ | -------------------------------------------------------------------- |
| Profile      | Owner of the information                                             |
| Project      | Product, repository, or body of work; a first-class entity           |
| Experience   | Meaningful work, decisions, challenges, accomplishments, or learning |
| Skill        | Capability or technology associated with experience                  |
| Source       | Supporting evidence and provenance                                   |
| Relationship | Connections among records                                            |

These are conceptual entities, not necessarily a one-to-one list of database tables. Existing Zod models can be evolved rather than discarded.

Design considerations:

- Stable IDs independent of descriptions.
- Relationships between experiences, projects, and skills.
- Dates, including uncertain historical dates.
- Supporting evidence and provenance.
- Corrections, edits, and schema evolution.
- Distinguishing proposed records from user-approved records.

Avoid prematurely modeling every possible kind of personal information; start with the capture use cases.

## 3. Two First-Class Capture Workflows

Both workflows feed the same underlying data model and persistence services.

### A. Ongoing experience capture

1. Complete a meaningful piece of work in an active project.
2. Invoke a Profile capture skill in Claude Code.
3. Agent examines available context: code, commits, discussions, problems, and decisions.
4. Agent proposes candidate experiences.
5. User discusses, corrects, rejects, or approves proposals.
6. Approved records are saved through Profile's MCP interface.

The purpose is to preserve meaningful experience, not log every commit.

### B. Retrospective experience capture

1. Agent inspects an existing repository, history, documents, and available evidence.
2. Agent proposes or updates a project description.
3. Agent identifies candidate past experiences.
4. Agent interviews the user about contributions, decisions, challenges, and outcomes.
5. Experiences are linked to projects, skills, and sources.
6. Approved records are saved.

Do not infer individual contributions merely from the existence of code. Preserve uncertainty where dates, attribution, or evidence are incomplete. Retrospective capture is as important as ongoing capture because it can populate Profile with years of prior work immediately.

## 4. Initial MCP Operations

Illustrative operations, subject to refinement:

| Operation            | Purpose                            |
| -------------------- | ---------------------------------- |
| Create project       | Register a project                 |
| Get/list projects    | Inspect projects                   |
| Update project       | Refine project information         |
| Create experience    | Save an approved experience        |
| Get/list experiences | Inspect captured records           |
| Update experience    | Correct or enrich a record         |
| Link experience      | Associate with projects and skills |

Shared services should support future interfaces without duplicating domain rules.

## 5. First Usable Milestone — Capture Foundation

- [ ] PostgreSQL persistence in Docker.
- [ ] Profile, Project, and Experience models.
- [ ] Schema migrations and persistence tests.
- [ ] MCP read/write operations.
- [ ] Ongoing capture skill.
- [ ] Retrospective capture skill.
- [ ] User review before persistence.
- [ ] Inspect and edit saved experiences.
- [ ] Backup and restore procedure.

At this point Profile can accumulate useful information through normal development work, without requiring a web UI, graph database, vector search, or cloud deployment.

## 6. Evolutionary Phases

### Phase 1 — Source of truth

PostgreSQL, domain models, migrations, persistence, and basic operations.

### Phase 2 — Capture

Ongoing and retrospective workflows; begin populating Profile with real information.

### Phase 3 — Practical consumption

Retrieve experiences for tailored résumés, cover letters, case studies, portfolio content, and agent context. Ordinary structured queries may be sufficient initially.

### Phase 4 — Knowledge representation and retrieval

Explore graph models, full-text search, semantic/vector search, hybrid retrieval, and agentic reasoning over Profile data.

### Phase 5 — Hosted platform

Migrate PostgreSQL to managed hosting, deploy services, add authentication/authorization, and support remote applications and agents.

These phases are flexible: cloud hosting may happen before advanced retrieval if remote access becomes valuable.

## 7. Knowledge Graphs and Retrieval Experiments

Keep canonical Profile records separate from **derived retrieval representations**. The same source data can generate different graph schemas and indexes, allowing comparisons without altering the source of truth.

Potential approaches:

- Relational queries and full-text search.
- Vector similarity search.
- Graph traversal with different relationship models.
- Hybrid graph/vector retrieval.
- Agentic retrieval across strategies.

Evaluate approaches on a shared set of retrieval tasks for relevance, completeness, accuracy, latency, and cost. Begin with controlled offline experiments; live A/B testing is not initially necessary.

### Reading alongside development

**Building Knowledge Graphs: A Practitioner's Guide** — Jesús Barrasa and Jim Webber. Read alongside data modeling and persistence, particularly graph concepts, databases, loading, and integration. Revisit identity, skills matching, and semantic search when the dataset grows.

**Essential GraphRAG: Knowledge Graph-Enhanced RAG** — Tomaž Bratanič and Oskar Hane. Read when building retrieval: vector and hybrid search, graph querying, agentic RAG, graph construction, and evaluation.

## 8. Local Development and Cloud Migration

**Initially:** Claude Code tools and Profile MCP server run locally; PostgreSQL runs in Docker; records are persistent and real; no sync engine.

**Eventually:** Move PostgreSQL to managed cloud hosting, deploy Profile services, and let agents and applications access them through authenticated interfaces. The hosted database becomes the source of truth.

This is **migration**, not synchronization. A sync engine would only become necessary if independently writable local and remote copies were a genuine requirement.

## 9. Development Process

Use augmented manual programming rather than an autonomous implementation harness:

1. Discuss intended behavior and design.
2. Have Claude Code implement a small, reviewable change.
3. Inspect code and question unfamiliar decisions.
4. Refine or refactor as necessary.
5. Have the agent write and run appropriate tests.
6. Review and commit personally.

The agent can do most of the implementation while the user retains architectural direction and understanding.

## 10. Immediate Next Steps

1. Replace the initial SQLite persistence work with PostgreSQL in Docker, preserving useful domain modeling work.
2. Establish a working path from agent-generated experience proposal to user-approved record in PostgreSQL.
3. Implement retrospective capture and start reconstructing experiences from existing projects.
4. Continue developing other software while Profile accumulates real experiences.
5. Let actual usage inform later graph modeling, retrieval experimentation, and cloud deployment.

**Guiding principle:** Capture first, accumulate real data, then experiment with retrieval. Profile is a slow-burn product that becomes more valuable as it is used.
