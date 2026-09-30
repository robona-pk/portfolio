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

The floating **Ask Prerna** assistant is a deliberately inspectable RAG demo. It answers questions about Prerna’s portfolio, explains its scope when a question is unrelated, and shows the portfolio sources used for supported answers.

### Architecture

```text
Visitor question
      │
      ▼
Answer-policy guard ──► graceful redirect / profile answer / privacy boundary
      │ (portfolio question)
      ▼
POST /api/ask  ──► OpenAI embeddings ──► cosine-similarity ranking
      │                                        │
      │                                        ▼
      └──────────────────────────── top portfolio passages only
                                               │
                                               ▼
                                      OpenAI Responses API
                                               │
                                               ▼
                              concise answer + cited source labels in the chat
```

### Components

| Component | Location | Responsibility |
| --- | --- | --- |
| Chat UI and static fallback | `index.html` | Floating chat window, source labels, local answer-policy checks, and a demo-safe fallback index. |
| Server RAG endpoint | `api/ask.js` | Applies the same answer policy, retrieves relevant passages, calls the model, and returns citations. |
| Portfolio knowledge | `knowledgeBase` in `api/ask.js` | Curated case-study, product-approach, skills, and profile passages used for server retrieval. |
| Static demo knowledge | `portfolioKnowledge` in `index.html` | A concise browser fallback used only when the API is unavailable or the portfolio is opened as a static file. |

### Retrieval flow

1. The browser sends the visitor’s question to `POST /api/ask`.
2. The server embeds the question and curated portfolio passages using `text-embedding-3-small`.
3. It calculates cosine similarity and selects the top three passages.
4. Only those passages are provided to `gpt-4.1-mini` through the Responses API.
5. The UI renders the answer along with the matching portfolio sources.

This keeps the model grounded in the portfolio rather than allowing it to invent employers, metrics, projects, or personal details.

### Answer policy and edge cases

Before retrieval, the client and server apply a small policy layer for common visitor intent:

- **Supported portfolio facts:** experience, role, location, employers, work, skills, product approach, outcomes, and career intent.
- **Behavioural questions:** strengths, leadership style, problem-solving, motivation, and hiring fit answer from documented work; weaknesses, failure, conflict, and feedback prompts avoid speculation when no evidence exists.
- **Personal questions:** salary, family, relationships, private address, and other personal details receive a privacy-respecting boundary.
- **Insults:** the assistant responds calmly and asks the visitor to keep the question evidence-based.
- **Out-of-scope questions:** general knowledge, politics, news, weather, jokes, and similar requests are redirected to the portfolio’s purpose.
- **Prompt injection attempts:** requests to ignore instructions or expose internal instructions stay within the assistant’s portfolio-only scope.

### Local fallback

If `OPENAI_API_KEY` is not configured, or the API cannot be reached, the browser uses the concise static answer bank in `index.html`. This lets the chatbot remain demonstrable in a static preview, while the Vercel API path is the full embedding-based RAG implementation.

### Vercel preproduction

The current chatbot preproduction deployment is the Vercel preview connected to `codex/portfolio-rag-preprod`. It is intentionally separate from the existing user-owned `preprod` branch, so chatbot work can be reviewed without overwriting unrelated preproduction changes. No production promotion is performed by this repository workflow.

Required Vercel environment variable:

```bash
OPENAI_API_KEY=your_openai_api_key
```

Optional model overrides:

```bash
OPENAI_MODEL=gpt-4.1-mini
OPENAI_EMBEDDING_MODEL=text-embedding-3-small
```

Never commit API keys. Configure them only in Vercel’s project environment settings, scoped to Preview (and Production only when the assistant is ready to be promoted).
