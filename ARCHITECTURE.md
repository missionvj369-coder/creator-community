# Architecture of Living Creation Intelligence

## Design Philosophy

LCI's architecture embodies its core principles:

1. **Tiny Core** - The original codebase is extremely small. We build the brain and connective tissue, not the body.
2. **Provider Neutral** - No single provider, model, or service is hardcoded as permanent.
3. **Composable** - Capabilities are combined, not monolithic.
4. **Living** - The system observes, learns, evolves, and destroys obsolete parts.
5. **Human-First** - Technology serves human intention, not the reverse.

---

## High-Level Architecture

```
┌─────────────────────────────────────────────────────────────┐
│                    HUMAN INTENTION                           │
└───────────────────────────┬─────────────────────────────────┘
                            │
                            ▼
┌─────────────────────────────────────────────────────────────┐
│              LIVING BRAIN (Orchestrator)                     │
│  ┌──────────────────────────────────────────────────────┐  │
│  │  Understanding Intelligence                           │  │
│  │  - Parse intention                                    │  │
│  │  - Identify real need                                 │  │
│  │  - Extract constraints                                │  │
│  └──────────────────────────────────────────────────────┘  │
│  ┌──────────────────────────────────────────────────────┐  │
│  │  Empathy Intelligence                                 │  │
│  │  - Infer emotional context                            │  │
│  │  - Identify motivations                               │  │
│  │  - Recognize constraints                              │  │
│  └──────────────────────────────────────────────────────┘  │
│  ┌──────────────────────────────────────────────────────┐  │
│  │  Observer Intelligence                                │  │
│  │  - Query ecosystem                                    │  │
│  │  - Discover capabilities                              │  │
│  │  - Track changes                                      │  │
│  └──────────────────────────────────────────────────────┘  │
│  ┌──────────────────────────────────────────────────────┐  │
│  │  World Intelligence                                   │  │
│  │  - Search existing solutions                          │  │
│  │  - Identify relevant projects                         │  │
│  │  - Extract reusable patterns                          │  │
│  └──────────────────────────────────────────────────────┘  │
│  ┌──────────────────────────────────────────────────────┐  │
│  │  Possibility Intelligence                             │  │
│  │  - Combine capabilities                               │  │
│  │  - Generate new possibilities                         │  │
│  │  - Evaluate novelty and feasibility                   │  │
│  └──────────────────────────────────────────────────────┘  │
│  ┌──────────────────────────────────────────────────────┐  │
│  │  Creative Intelligence                                │  │
│  │  - Design new solutions when needed                   │  │
│  │  - Create minimal missing pieces                      │  │
│  └──────────────────────────────────────────────────────┘  │
│  ┌──────────────────────────────────────────────────────┐  │
│  │  Systems Intelligence                                 │  │
│  │  - Analyze first/second/third-order effects           │  │
│  │  - Identify dependencies and risks                    │  │
│  └──────────────────────────────────────────────────────┘  │
│  ┌──────────────────────────────────────────────────────┐  │
│  │  Impact Intelligence                                  │  │
│  │  - Evaluate benefit                                   │  │
│  │  - Assess reach and depth                             │  │
│  │  - Measure against mission                            │  │
│  └──────────────────────────────────────────────────────┘  │
│  ┌──────────────────────────────────────────────────────┐  │
│  │  Guardian Intelligence                                │  │
│  │  - Constitutional evaluation                          │  │
│  │  - Risk assessment                                    │  │
│  │  - Abuse potential analysis                           │  │
│  └──────────────────────────────────────────────────────┘  │
│  ┌──────────────────────────────────────────────────────┐  │
│  │  Evolution Intelligence                               │  │
│  │  - Learn from outcomes                                │  │
│  │  - Update knowledge                                   │  │
│  │  - Improve future decisions                           │  │
│  └──────────────────────────────────────────────────────┘  │
└─────────────────────────────────────────────────────────────┘
                            │
                            ▼
┌─────────────────────────────────────────────────────────────┐
│              STRUCTURED ANALYSIS OUTPUT                      │
│  - Understood Mission                                       │
│  - Required Capabilities                                    │
│  - Existing Capabilities                                    │
│  - Possible Combinations                                    │
│  - New Possibilities                                        │
│  - Project Candidates                                       │
│  - Impact Analysis                                          │
│  - Guardian Analysis                                        │
│  - Recommended Project                                      │
│  - Next Buildable Step                                      │
└─────────────────────────────────────────────────────────────┘
```

---

## Core Components

### 1. Brain (Orchestrator)

**Location:** `brain/`

The Brain is the central orchestrator. It coordinates all intelligences, manages the pipeline, and produces the final structured analysis.

**Responsibilities:**
- Accept human intention as input
- Coordinate the flow through all intelligences
- Manage context and state
- Produce structured output
- Handle loops and iterations

**V0.1 Implementation:**
- Simple pipeline orchestrator
- Context manager
- Output formatter
- Loop handler for Guardian feedback

---

### 2. Discovery

**Location:** `discovery/`

Discovery interfaces with external ecosystems to find capabilities, tools, models, and resources.

**Responsibilities:**
- Query GitHub API for repositories, releases, topics
- Query MCP Registry for available MCP servers
- Query Hugging Face for models
- Query package registries (npm, PyPI, etc.)
- Monitor official feeds and changelogs
- Track ecosystem changes

**V0.1 Implementation:**
- GitHub API client (repositories, topics, releases)
- MCP Registry client
- Hugging Face API client
- Basic caching layer
- Rate limit handling

**Design Principles:**
- Use official APIs, not scraping
- Cache aggressively to respect rate limits
- Verify before claiming
- Never fabricate availability

---

### 3. Capabilities

**Location:** `capabilities/`

Capabilities represents external tools, models, APIs, and services in a unified, provider-neutral format.

**Capability Representation:**
```typescript
interface Capability {
  id: string;
  name: string;
  description: string;
  provider: string;
  type: 'tool' | 'model' | 'api' | 'service' | 'library';
  source: {
    platform: 'github' | 'huggingface' | 'npm' | 'pypi' | 'mcp' | 'api';
    url: string;
    verified: boolean;
    lastChecked: Date;
  };
  version?: string;
  license: string;
  dependencies?: string[];
  capabilities: string[];  // What it can do
  limitations: string[];
  cost: {
    type: 'free' | 'freemium' | 'paid';
    details: string;
  };
  performance?: {
    benchmarks: Record<string, number>;
    source: string;
  };
  compatibility: {
    platforms: string[];
    requirements: string[];
  };
  provenance: {
    attribution: string;
    originalAuthor: string;
    repository?: string;
  };
  status: 'active' | 'deprecated' | 'experimental' | 'unknown';
}
```

**V0.1 Implementation:**
- Basic capability data structure
- Capability registry (in-memory, file-based)
- Capability matching and filtering
- Simple capability combination logic

---

### 4. Possibility

**Location:** `possibility/`

Possibility is the Capability Combination Engine. It explores combinations of capabilities to discover new possibilities.

**Core Algorithm:**
```
Input: Required capabilities, Available capabilities
1. Filter available capabilities by relevance
2. For each required capability:
   a. Find matching capabilities
   b. Score by fit, cost, performance
3. Generate combinations:
   a. Start with single capabilities
   b. Combine pairs that are semantically compatible
   c. Combine triples that solve subproblems
   d. Stop when full solution is covered
4. For each combination:
   a. Check if it creates a new capability
   b. Check if it enables a new possibility
   c. Score by novelty, feasibility, impact
5. Return top N possibilities
```

**V0.1 Implementation:**
- Capability matching algorithm
- Pairwise combination generator
- Novelty scoring (simple heuristic)
- Feasibility scoring
- Top-N selection

**Anti-Combinatorial-Explosion:**
- Semantic filtering before combination
- Maximum combination size (start with 2-3)
- Relevance threshold
- Cost-aware pruning

---

### 5. Orchestration

**Location:** `orchestration/`

Orchestration manages workflows, pipelines, and the execution of multi-step processes.

**V0.1 Implementation:**
- Simple pipeline executor
- Step-by-step progression
- Loop handling (Guardian → Systems → Creator)
- State management

---

### 6. Evaluation

**Location:** `evaluation/`

Evaluation contains the analysis modules: Systems, Impact, and Guardian.

**Systems Intelligence:**
- First-order effects: What happens immediately?
- Second-order effects: What happens as a consequence?
- Third-order effects: What happens in the longer term?
- Dependency analysis
- Risk identification

**Impact Intelligence:**
- Benefit assessment
- Reach (how many people affected)
- Depth (how deeply affected)
- Alignment with mission
- Measurability

**Guardian Intelligence:**
- Constitutional compliance check
- Risk assessment
- Abuse potential analysis
- Safety evaluation
- Privacy impact assessment
- Environmental impact assessment

**V0.1 Implementation:**
- Rule-based constitutional checks
- Simple risk scoring
- Impact estimation heuristics
- Structured output for each dimension

---

### 7. Memory

**Location:** `memory/`

Memory stores experience, knowledge, and lessons learned.

**V0.1 Implementation:**
- File-based knowledge store (JSON)
- Project history
- Capability performance records
- Lesson learned database
- Simple retrieval by similarity

**Future:**
- Vector database for semantic retrieval
- Experience replay for learning
- Pattern extraction

---

### 8. Guardian

**Location:** `guardian/`

Guardian is the safety and ethics module. It enforces the Constitution.

**Responsibilities:**
- Constitutional compliance checking
- Risk assessment
- Abuse potential analysis
- Safety evaluation
- Privacy impact assessment
- Environmental impact assessment

**V0.1 Implementation:**
- Rule-based constitutional checks
- Simple risk scoring
- Structured output for each dimension

---

### 9. Adapters

**Location:** `adapters/`

Adapters are replaceable integrations with external systems.

**V0.1 Adapters:**
- GitHub API adapter
- MCP Registry adapter
- Hugging Face adapter
- File system adapter (for local data)

**Design:**
- Common interface for all adapters
- Easy to replace or extend
- No hardcoded provider dependencies

---

### 10. Security

**Location:** `security/`

Security handles authentication, authorization, rate limiting, and safe execution.

**V0.1 Implementation:**
- API key management (environment variables)
- Rate limit handling
- Input validation
- Safe file operations

---

### 11. Tests

**Location:** `tests/`

Tests verify intelligence contracts and system behavior.

**Test Types:**
- Unit tests for individual intelligences
- Integration tests for pipeline
- Contract tests for adapters
- Constitutional compliance tests
- Demonstration tests with known intentions

---

## Data Flow in V0.1

```
1. Human provides intention (text input)
2. Understanding Intelligence parses and structures
3. Empathy Intelligence extracts context
4. Observer Intelligence queries ecosystem (GitHub, MCP, HF)
5. World Intelligence searches for existing solutions
6. Capability Discovery identifies relevant capabilities
7. Possibility Intelligence combines capabilities
8. Creative Intelligence designs if needed
9. Systems Intelligence analyzes effects
10. Impact Intelligence evaluates benefit
11. Guardian Intelligence checks constitution
12. If Guardian finds issues: loop back to Systems/Creator
13. Evolution Intelligence records experience
14. Output structured analysis
```

---

## Technology Stack (V0.1)

**Language:** TypeScript (Node.js)

**Why TypeScript?**
- Type safety for complex data structures
- Good ecosystem for API clients
- Runs everywhere Node.js runs
- Easy to test

**Core Dependencies (Minimal):**
- `node-fetch` or native fetch (HTTP requests)
- No heavy frameworks
- No vector databases (yet)
- No agent frameworks (yet)

**Storage (V0.1):**
- File-based JSON for knowledge
- In-memory for session state
- No database required

**Testing:**
- Built-in Node.js test runner or minimal test framework

---

## Directory Structure

```
living-creation-intelligence/
├── README.md
├── PHILOSOPHY.md
├── CONSTITUTION.md
├── ARCHITECTURE.md
├── ECOSYSTEM.md
├── ROADMAP.md
├── package.json
├── tsconfig.json
├── src/
│   ├── index.ts                 # Entry point
│   ├── types.ts                 # Core type definitions
│   ├── brain/
│   │   ├── orchestrator.ts      # Main pipeline
│   │   ├── understanding.ts     # Understanding intelligence
│   │   ├── empathy.ts           # Empathy intelligence
│   │   ├── observer.ts          # Observer intelligence
│   │   ├── world.ts             # World intelligence
│   │   ├── possibility.ts       # Possibility intelligence
│   │   ├── creative.ts          # Creative intelligence
│   │   ├── systems.ts           # Systems intelligence
│   │   ├── impact.ts            # Impact intelligence
│   │   ├── guardian.ts          # Guardian intelligence
│   │   └── evolution.ts         # Evolution intelligence
│   ├── discovery/
│   │   ├── github.ts            # GitHub API client
│   │   ├── mcp-registry.ts      # MCP Registry client
│   │   ├── huggingface.ts       # Hugging Face client
│   │   └── cache.ts             # Caching layer
│   ├── capabilities/
│   │   ├── capability.ts        # Capability data structure
│   │   ├── registry.ts          # Capability registry
│   │   ├── matcher.ts           # Capability matching
│   │   └── combiner.ts          # Capability combination
│   ├── orchestration/
│   │   └── pipeline.ts          # Pipeline executor
│   ├── evaluation/
│   │   ├── systems.ts           # Systems analysis
│   │   ├── impact.ts            # Impact analysis
│   │   └── guardian.ts          # Guardian/constitutional check
│   ├── memory/
│   │   ├── store.ts             # Knowledge store
│   │   └── experience.ts        # Experience tracking
│   ├── adapters/
│   │   ├── github.ts            # GitHub adapter
│   │   ├── mcp.ts               # MCP adapter
│   │   └── huggingface.ts       # Hugging Face adapter
│   └── security/
│       ├── auth.ts              # Authentication
│       ├── rate-limiter.ts      # Rate limiting
│       └── validator.ts         # Input validation
└── tests/
    ├── brain.test.ts
    ├── discovery.test.ts
    ├── capabilities.test.ts
    ├── possibility.test.ts
    ├── evaluation.test.ts
    └── demo.test.ts              # Demo with three intentions
```

---

## Key Design Decisions

### 1. No Heavy Frameworks

LCI V0.1 uses plain TypeScript with minimal dependencies. No React, no Express, no heavy frameworks. The brain is a library that can be used from CLI, web, or other interfaces.

### 2. Provider Neutrality

Every external integration goes through an adapter. The brain never calls GitHub, Hugging Face, or any provider directly. It calls adapters, which can be replaced.

### 3. Capability Representation

External capabilities are represented in a unified format regardless of source. A GitHub repo, an MCP server, a Hugging Face model, and an API are all `Capability` objects.

### 4. Combination Engine

The combination engine is the secret sauce. It doesn't just integrate tools - it discovers what becomes possible when tools are combined.

### 5. Constitutional Enforcement

Guardian is not an afterthought. It's a first-class intelligence that can loop back and change earlier decisions.

### 6. Experience Learning

Every run generates experience that improves future runs. The system gets better over time.

### 7. Destroyer

The system can remove its own obsolete parts. This is critical for long-term viability.

---

## Extension Points

The architecture is designed to be extended:

- **New Adapters:** Add new adapters for new ecosystems
- **New Intelligences:** Add new reasoning modules
- **New Capability Types:** Extend the capability representation
- **New Combination Strategies:** Improve the possibility engine
- **New Constitutional Rules:** Evolve the constitution
- **New Interfaces:** CLI, web, API, agent integration

---

## Non-Goals for V0.1

LCI V0.1 does NOT include:

- Web UI (CLI only)
- Autonomous internet crawling
- Unrestricted agents
- Giant vector databases
- Complex multi-agent infrastructure
- Paid APIs
- Automatic code deployment
- Thousands of integrations
- 99,999 project templates

V0.1 proves the reasoning architecture. Everything else comes later.

---

## Success Criteria for V0.1

LCI V0.1 is successful if it can:

1. Accept a human intention as text input
2. Produce a structured analysis with all 11 sections
3. Demonstrate capability discovery (even if limited)
4. Demonstrate capability combination
5. Pass constitutional checks
6. Handle three different types of intentions:
   - Humanitarian/community project
   - Creative project
   - Technical project
7. Show its work (transparent reasoning)
8. Run without external dependencies beyond public APIs

---

*This architecture is the blueprint. It will evolve as the system learns.*