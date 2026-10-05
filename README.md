# Prerna Kapoor — Growth & Adoption Product Manager

Growth & Adoption Product Manager with 5+ years of experience building and scaling digital products across **activation, conversion, retention, customer experience, and revenue growth**.

I focus on the moments where high-intent users disengage: an abandoned booking, an unclear choice, an unread report, or a post-purchase issue. I use customer research, behavioural data, and fast experiments to turn those moments into durable product-growth loops.

## Selected Work

### Lenskart — Lenskart@Home
Owned growth initiatives across Lenskart@Home, an O2O eyewear experience spanning home trials, store ownership, and post-purchase journeys.

Selected outcomes:
- Initiatives contributed **₹6Cr+ in incremental annualised revenue**
- A personalised home-trial experience generated **₹1.8Cr annualised incremental revenue** across five cities
- A three-week, pan-India pilot improved completed home-trial bookings by **7%** versus the weekly baseline
- Territory ownership and 48-hour check-ins improved NPS for the called cohort from **41 to 60** in one month

### Bajaj Finserv Health
Built and scaled products across wellness, diagnostics, consultations, insurance, and digital health—from discovery and strategy through launch, GTM, and iteration.

Selected outcomes:
- Built a diabetes wellness business from 0→1, generating **₹28L revenue in five months**
- Smart Health Reports increased active Health Files users by **8×** and generated **₹7L+ incremental MRR**
- Doctor listing reorder improved CTR by **18%** and annual revenue by **11.6%**
- Automated insurance pre-authorisation, improving throughput by **26%** and saving **₹17L annually**

## How I Work
- Find the behavioural break in a customer journey
- Form a measurable hypothesis and test the smallest viable intervention
- Design adoption mechanics across product, operations, and lifecycle touchpoints
- Measure activation, conversion, retention, customer outcomes, and business impact
- Partner closely with design, engineering, operations, and commercial teams

## Portfolio
This repository includes detailed case studies, product experiments, and technical prototypes.

**Prerna Kapoor**  
Growth & Adoption Product Manager | Activation • Conversion • Retention • AI/Product

## Portfolio RAG assistant

### What it is and why it matters

**Ask Prerna** is a floating portfolio assistant that turns a static portfolio into a guided conversation. For a hiring manager, it surfaces role fit, impact, skills, and interview-relevant context quickly. For a product and engineering reviewer, it demonstrates scoped knowledge, graceful boundaries, explainable retrieval, and an intentionally low-cost architecture.

### One flow, from visitor to answer

```text
👤 Visitor question
        ↓
🛡️ Policy + knowledge-base check (`assets/chatbot-knowledge.js`)
   ├─ approved fact / CTA / respectful boundary → ✨ direct response
   └─ portfolio question → 🧠 MiniLM semantic embeddings in the browser
                                   ↓
                         🔎 cosine-similarity retrieval
                                   ↓
                    📚 cited portfolio passage + curated answer
                                   ↓
                         💬 chat response in the portfolio
```

### Stack at a glance

- **Experience:** static HTML, CSS, and vanilla JavaScript; floating accessible chat UI.
- **Knowledge and policy:** editable JavaScript source at `assets/chatbot-knowledge.js`; it holds approved personal/professional facts and declined-topic rules.
- **Retrieval:** `Xenova/all-MiniLM-L6-v2`, an open-source, quantized embedding model loaded through Transformers.js and cached by the browser.
- **Ranking:** client-side cosine similarity against the curated portfolio passages.
- **Hosting:** GitHub + Vercel preview deployment; no backend model, database, API key, or per-question LLM charge.
- **Product safeguards:** privacy boundaries, NSFW declines, graceful responses to insults, general-knowledge redirection, and no invented weakness/failure stories.

To edit answers, update `assets/chatbot-knowledge.js` and redeploy. The file is the approved policy layer; `index.html` contains the chat routing and portfolio retrieval passages.

### Architecture

```text
Visitor question
      │
      ▼
Answer-policy guard ──► graceful redirect / profile answer / privacy boundary
      │ (portfolio question)
      ▼
Browser-side policy guard ──► open-source MiniLM embeddings ──► cosine ranking
      │                                                              │
      └──────────────────────────────────────────────────────────────┘
                                     │
                                     ▼
                       curated answer + cited source labels in the chat
```

### Components

| Component | Location | Responsibility |
| --- | --- | --- |
| Chat UI and static fallback | `index.html` | Floating chat window, source labels, local answer-policy checks, and a demo-safe fallback index. |
| On-device RAG | `index.html` | Loads the open-source `Xenova/all-MiniLM-L6-v2` embedding model in the visitor’s browser and ranks the local knowledge bank. |
| Portfolio knowledge | `portfolioKnowledge` in `index.html` | Curated case-study, product-approach, skills, and profile passages used for retrieval and cited answers. |
| Retired API endpoint | `api/ask.js` | Returns `410 Gone`; it makes no model calls and requires no API key. |

### Retrieval flow

1. On first relevant question, the browser downloads and caches a quantized open-source MiniLM embedding model.
2. The browser embeds the question and curated portfolio passages locally.
3. It calculates cosine similarity and selects the most relevant passages.
4. The UI renders the curated answer with matching portfolio sources.

This keeps the model grounded in the portfolio rather than allowing it to invent employers, metrics, projects, or personal details.

### Answer policy and edge cases

Before retrieval, the client and server apply a small policy layer for common visitor intent:

- **Supported portfolio facts:** experience, role, location, employers, work, skills, product approach, outcomes, and career intent.
- **Behavioural questions:** strengths, leadership style, problem-solving, motivation, and hiring fit answer from documented work; weaknesses, failure, conflict, and feedback prompts avoid speculation when no evidence exists.
- **Personal questions:** salary, family, relationships, private address, and other personal details receive a privacy-respecting boundary.
- **Insults:** the assistant responds calmly and asks the visitor to keep the question evidence-based.
- **Out-of-scope questions:** general knowledge, politics, news, weather, jokes, and similar requests are redirected to the portfolio’s purpose.
- **Prompt injection attempts:** requests to ignore instructions or expose internal instructions stay within the assistant’s portfolio-only scope.

### Cost and privacy

The chatbot has no paid-model or per-question API cost. Embeddings run in the visitor’s browser through Transformers.js and are cached by the browser after the initial download. Vercel serves the static site only; no portfolio questions are sent to an LLM endpoint.

### Vercel preproduction

The current chatbot preproduction deployment is the Vercel preview connected to `codex/portfolio-rag-preprod`. It is intentionally separate from the existing user-owned `preprod` branch, so chatbot work can be reviewed without overwriting unrelated preproduction changes. No production promotion is performed by this repository workflow.

No AI API keys are required for this deployment.
