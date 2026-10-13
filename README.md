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

## Mira - portfolio chatbot

**Mira** helps visitors explore my experience, skills, projects, outcomes, and product philosophy without searching through the full portfolio.

- Recruiters get quick, evidence-based answers.
- The bot stays within information I have approved.
- Open-ended questions can use **Gemini Flash-Lite** to phrase concise, natural answers.
- Gemini runs behind a protected Vercel endpoint; its API key is never exposed in the browser.

Mira is a **guarded, conditional RAG system**. Not every question needs retrieval or an LLM: known facts use approved responses, sensitive requests use deterministic guardrails, and only supported open-ended questions enter the RAG route.

## How one question becomes an answer

The diagram is designed to be read from top to bottom. Each colour represents a different decision path.

```mermaid
flowchart TD
    A["👤 Visitor asks a question"] --> B["🧹 Normalise spelling,<br/>shorthand and hidden characters"]
    B --> C{"⚡ Known fast route?"}

    C -- "Known fact<br/>or action" --> G["✅ Deterministic route<br/>Approved answer"]
    C -- "Private, unsafe<br/>or confidential" --> F["🛡️ Guardrail route<br/>Controlled response"]
    C -- "Needs meaning-based routing" --> Q["⏳ MiniLM readiness gate<br/>Wait briefly or fail closed"]
    Q --> E{"🛡️ Semantic injection check"}

    E -- "Attack or uncertain" --> D["🛡️ Guardrail response<br/>Decline safely"]
    E -- "Safe" --> R["🧭 Semantic intent router<br/>MiniLM first, Gemini if uncertain"]
    R -- "Known supported intent" --> G["✅ Approved answer bank<br/>Intent-specific answer"]
    R -- "Open-ended evidence question" --> H["🔎 RAG route: retrieval<br/>Meaning + topic evidence"]
    R -- "Unknown or unsupported" --> I["🤷 Safe fallback + contact CTA<br/>Contact Prerna directly"]
    H --> P{"🎯 Relevant enough?<br/>Similarity + word coverage"}
    P -- "No" --> I["🤷 Safe fallback + contact CTA<br/>Contact Prerna directly"]
    P -- "Yes" --> J["📚 Selected portfolio evidence"]

    J --> K["🤖 Gemini Flash-Lite<br/>Writes a short answer"]
    K --> L{"🔍 Is every claim supported?"}
    L -- "Yes" --> M["💬 Show Gemini's answer"]
    L -- "No / model unavailable" --> N["↩️ Show approved retrieved answer"]

    D --> O["📊 Record anonymous quality data"]
    F --> O
    G --> O
    I --> O
    M --> O
    N --> O

    classDef visitor fill:#fff3cf,stroke:#9a6500,color:#2a2115;
    classDef decision fill:#f1e8ff,stroke:#6941a5,color:#251b35;
    classDef policy fill:#ffe8df,stroke:#a84a28,color:#351b13;
    classDef retrieval fill:#e2f4ef,stroke:#277766,color:#12342d;
    classDef ai fill:#e7efff,stroke:#3f64a8,color:#172743;
    classDef output fill:#edf6dd,stroke:#5d7f25,color:#263611;

    class A,B visitor;
    class C,E,R,P,L decision;
    class D,F,I policy;
    class H,J,Q retrieval;
    class K,M ai;
    class G,N,O output;
```

### Who answers what?

| Question type | Example | Answered by |
| --- | --- | --- |
| Known portfolio fact | “How much experience does she have?” | ✅ Approved answer bank |
| Work or recruiter question | “What impact did she drive at Lenskart?” | ✅ Approved answer bank |
| Open-ended portfolio question | “How does customer research shape her decisions?” | 🔎 RAG route: retrieval + 🤖 Gemini |
| Private or confidential | “What is Lenskart's profit margin?” | 🛡️ Deterministic guardrail |
| Inappropriate or unsafe question | — | 🛡️ Respectful guardrail response |
| Unrelated question | “Who is the US president?” | 🛡️ Deterministic scope boundary |
| Missing evidence | An unpublished personal or work detail | 🤷 Safe fallback |

> **Important:** The guardrail route is not RAG. The RAG route is specifically the sequence where Mira retrieves approved evidence and then gives that evidence to Gemini to phrase an answer. Gemini does not decide the facts, and unverified output is rejected.

## Tech stack—in plain English

- 🖥️ **Interface:** HTML, CSS, and JavaScript create the floating chat window.
- 📚 **Knowledge base:** approved facts and boundaries live in `assets/chatbot-knowledge.js` and the curated portfolio passages in `index.html`.
- ⚡ **Deterministic routing:** obvious approved facts and actions such as resume access bypass retrieval and generation.
- 🛡️ **Guardrail routing:** private, unsafe, abusive, confidential, unrelated, and injection attempts receive controlled responses without reaching open-ended generation.
- ⏳ **Readiness gate:** the system briefly waits for MiniLM to register before a semantic request runs. If it never becomes available, the bot fails closed instead of guessing.
- 🧭 **Intent routing:** MiniLM maps unfamiliar wording into an allowlisted intent such as `work_style`, `skills`, `hobbies`, or `hiring_fit`. If confidence is low, a constrained Gemini classifier may choose from the same fixed list. It returns a label, not an answer.
- 🔎 **Retrieval:** open-ended evidence questions use MiniLM to find passages with similar meaning, then a strict relevance gate also requires meaningful topic-word coverage. A passage is rejected if it is merely the closest bad match.
- 🤖 **Generation:** Gemini Flash-Lite writes short responses for supported, open-ended questions through `/api/generate`.
- ⚙️ **AI runtime:** Transformers.js runs MiniLM semantic retrieval in the browser; Vercel calls Gemini server-side.
- ✅ **Validation:** checks block invented metrics, unsupported names, private claims, prompt leakage, and ungrounded sentences.
- ⚡ **Latency controls:** deterministic questions avoid AI generation; repeated clicks are blocked; MiniLM is reused after its first load; semantic safety has an 8-second ceiling and Gemini has a 10-second ceiling before an approved fallback is shown.
- 🧪 **Golden evaluation dataset:** 131 fixed test cases define the expected facts, sources, intent, response type, and safety behaviour.
- 📊 **Analytics:** PostHog records anonymous quality, latency, fallback, feedback, and conversion events.
- 🚀 **Hosting:** GitHub + Vercel. The Gemini key is stored as a server-side Vercel environment variable.

## Terminology used in this project

| Term | What it means here |
| --- | --- |
| **Knowledge base** | The approved facts and portfolio passages the bot is allowed to use. |
| **Guardrail route** | Deterministic rules and approved responses for privacy, confidentiality, abuse, irrelevant questions, and prompt injection. It does not use RAG. |
| **RAG route** | For a supported open-ended question: retrieve approved evidence, give it to Gemini as context, then validate the generated answer against that evidence. |
| **Conditional RAG** | Retrieval and generation run only when the question needs them. Known answers and guardrail cases take faster deterministic routes. |
| **Deterministic routing** | Code that sends known question types to a fixed approved response instead of asking Gemini. |
| **Intent** | The supported meaning of a question, such as `skills`, `location`, `work_style`, `resume`, or `hiring_fit`. |
| **Semantic intent routing** | Meaning-based classification that maps different phrasings to a fixed supported category such as work style, hobbies, or bot capability. |
| **Intent prototype** | A representative way of expressing an intent. MiniLM compares meaning against several prototypes so the system can generalise beyond exact wording. |
| **Readiness gate** | A short wait that prevents an evaluation or visitor question from running before MiniLM is available. |
| **Hosted intent fallback** | A constrained Gemini classifier used only when the local semantic router is uncertain. It returns an intent label, not an answer. |
| **Hybrid retrieval** | MiniLM measures semantic similarity, while lexical coverage checks that meaningful question topics actually appear in the evidence. Both must pass. |
| **Relevance gate** | The acceptance rule that rejects the nearest passage when it does not genuinely answer the question. Rejected questions receive the safe fallback and contact CTA. |
| **Generator** | Gemini writes a concise answer using only the approved answer and retrieved evidence. |
| **Grounding checks** | Output checks verify that Gemini's claims are supported by the retrieved sources. |
| **Fail-closed fallback** | If the system is uncertain or a component fails, it returns an approved safe answer. |
| **Golden evaluation dataset** | A fixed benchmark of questions with human-defined expected facts, sources, response types, and guardrail behaviour. |
| **Regression test** | A golden case that is rerun after changes to ensure a previously working behaviour has not broken. |
| **Human-as-judge** | A person reviews the actual answer for correctness, relevance, tone, and helpfulness. |
| **Telemetry** | Anonymous product data used to monitor latency, fallbacks, errors, helpfulness, and conversions. |

<details>
<summary><strong>🛡️ Safety controls</strong></summary>

- Detects direct and disguised prompt-injection attempts.
- Handles common spelling errors and selected Unicode or zero-width tricks.
- Limits questions to 500 characters and generated answers to 300 characters.
- Falls back safely when retrieval or the Gemini endpoint is unavailable, rate-limited, or slow.
- Keeps the Gemini API key on the server and accepts only allowlisted approved answers and sources.
- Applies a best-effort browser limit of 10 questions per minute.
- Keeps private, NSFW, confidential, and unsupported topics out of answers.

These controls reduce risk but are not foolproof. The client-side knowledge base should be treated as publicly visible.

</details>

## Golden evaluation dataset and eval console

The **golden evaluation dataset** lives in [`assets/eval-dataset.js`](assets/eval-dataset.js). Its 131 cases test the **whole assistant system**: deterministic answers, guardrails, intent routing, RAG retrieval, Gemini output, fallbacks, safety, and response time. Because generated wording can vary, it defines required facts and behaviour rather than one exact sentence.

Each golden case contains:

- The test question and category
- The expected response type
- The expected semantic intent when the case tests meaning-based routing
- The facts the answer must contain
- The source it should retrieve
- The guardrail behaviour expected for safety cases

The console labels these expectations as **Pass criteria — not model input**. They describe what a reviewer should look for; they are not secretly inserted into the visitor's question or sent to Gemini as the desired answer. Output-validation cases also show a **What this case is testing** explanation because those cases deliberately simulate an unsafe model response.

The [**eval console**](eval.html) runs these cases through the real chatbot and brings the expected and actual results together for review. It can filter results by answer source, including deterministic, RAG + LLM, fallback, guardrail, and error paths. Each result separates total request latency from the time spent in model generation, so slow retrieval or safety checks are not confused with a slow model.

For an open-ended case, **Compare models** runs the same question, retrieval, approved evidence, validation rules, and length limit through Gemini Flash-Lite and browser-hosted Qwen 2.5. The side-by-side output isolates generator quality from retrieval or routing quality and shows total latency, model-generation latency, answer source, and fallback status. If a deterministic or guardrail answer bypasses both models, the console says so instead of presenting identical answers as a meaningful model comparison. Qwen is evaluation-only; it is not used by the visitor-facing bot.

```mermaid
flowchart LR
    A["🏆 Golden dataset<br/>131 test cases"] --> B["▶️ Run through the live bot"]
    B --> C["📋 Compare with<br/>expected facts and sources"]
    C --> D["👤 Human-as-judge review"]
    D --> E{"Correct and helpful?"}
    E -- "No" --> F["🛠️ Fix knowledge,<br/>routing or guardrail"]
    F --> A
    E -- "Yes" --> G["✅ Keep as regression test"]
    G --> H["📊 Monitor real-user results"]

    classDef test fill:#fff3cf,stroke:#9a6500,color:#2a2115;
    classDef review fill:#f1e8ff,stroke:#6941a5,color:#251b35;
    classDef improve fill:#ffe8df,stroke:#a84a28,color:#351b13;
    classDef pass fill:#e2f4ef,stroke:#277766,color:#12342d;

    class A,B,C test;
    class D,E review;
    class F improve;
    class G,H pass;
```

### What the golden dataset covers

- ✅ Profile facts, skills, experience, work and measurable outcomes
- ✍️ Paraphrases, misspellings and fuzzy matching
- 🧭 Vague wording that should converge on the same semantic intent
- 🔒 Private, confidential, insulting and unrelated questions
- 🧨 Direct, disguised, multilingual and Unicode prompt injections
- 🚫 Invented metrics, fake employers, prompt leakage and unsupported claims
- 📴 Unavailable generation endpoint, timeouts and retrieval failures
- 🎯 False-positive checks so valid recruiter questions are not blocked

### What the reviewer can do

- Run all cases or rerun only those marked incorrect.
- Compare Gemini Flash-Lite and Qwen 2.5 side by side on an individual case.
- Compare the answer with expected facts, sources and guardrail behaviour.
- Mark it **Correct** or **Incorrect** and give a 1–5 helpfulness score.
- Speak feedback through voice dictation or type a reason.
- Export or import the review as JSON for the next iteration.

### How live feedback improves the bot

Every chatbot answer asks **“Was this helpful?”**

- 👍 **Helpful:** PostHog records a positive helpfulness signal.
- 👎 **Not helpful:** the visitor can select **Missing information**, **Incorrect information**, **Irrelevant answer**, **Too verbose**, or **Poor tone**.
- 🔗 The rating and reason are joined to the original question and answer through a request ID.
- 🔍 I review patterns to identify whether the problem is the knowledge base, retrieval, routing, generation, or tone.
- 🛠️ I update the relevant layer, rerun the golden dataset, and check that the fix does not break another answer.

This creates a continuous product loop:

`💬 Answer → 👍/👎 Feedback → 📊 PostHog analysis → 🛠️ Improvement → 🧪 Regression test → 🚀 Release`

## PostHog: measuring the portfolio as a product

PostHog is used for more than chatbot performance. It shows whether visitors discover relevant work, engage with the portfolio, and take a meaningful next step.

### Portfolio funnel

| Funnel stage | Product question | Signals monitored |
| --- | --- | --- |
| **Reach** | Are people finding the portfolio? | Page views, anonymous visitors, traffic source and campaign |
| **Explore** | Which work attracts interest? | Case-study opens and chatbot opens |
| **Engage** | Are visitors meaningfully interacting? | Questions asked, question themes, helpfulness and feedback reasons |
| **Consider** | Do visitors want more evidence? | Resume clicks and repeated case-study exploration |
| **Convert** | Do visitors want to speak with me? | Contact-section, email, phone and WhatsApp clicks |

### AI product health

| Quality | Performance and cost | Safety |
| --- | --- | --- |
| Correctness and helpfulness | P50/P95 latency | Injection decisions |
| Fallback and error rate | Cache hit/miss | Rate-limit events |
| Retrieved sources | Input/output tokens | Unsupported-output rejections |
| Feedback reasons | Estimated cost | Fail-closed responses |

The golden dataset is a **testing benchmark**, not the chatbot's knowledge base and not training data. This is **human-as-judge evaluation**, not automatic model training. Feedback is used to improve the answer bank, retrieval, guardrails, and regression suite; Gemini is not silently retrained.

See [TELEMETRY.md](TELEMETRY.md) and the [preproduction security audit](evaluations/PREPROD-SECURITY-AUDIT-2026-10-10.md).

## Product changelog

| Stage | What we had | Gap or insight | What changed and why |
| --- | --- | --- | --- |
| **1. First chatbot** | A separate portfolio section with retrieval-based answers | Visitors had to scroll to find it; many did not know what to ask | Replaced it with a visible floating bot and starter questions |
| **2. Curated answer bank** | Broad portfolio matching | Insults, private questions, confidentiality and unrelated queries could return irrelevant work answers | Added deterministic routing and approved guardrails for safe, graceful responses |
| **3. Better portfolio coverage** | Mostly project and company information | Recruiter questions about experience, skills, personality, location and hobbies were inconsistent | Expanded the approved knowledge base with verified professional and personal-profile facts |
| **4. Semantic retrieval** | Keyword and static-text matching | Misspellings and paraphrased questions were easy to misroute | Added fuzzy correction and MiniLM semantic retrieval to match meaning rather than exact words |
| **5. Open-source generation** | Retrieved, prewritten responses only | The experience demonstrated retrieval but not generative AI | Added browser-hosted Qwen 2.5 for concise synthesis from retrieved evidence, with ₹0 model API cost |
| **6. Evaluation system** | Manual spot checks | Improvements could fix one answer while breaking another | Built the golden dataset and eval console with human-as-judge review, incorrect-only reruns, voice feedback and JSON export |
| **7. Production hardening** | Basic keyword guardrails | Obfuscated injections, invented claims and component failures needed stronger handling | Added semantic injection detection, Unicode checks, grounding validation, fail-closed fallbacks and throttling |
| **8. Product analytics** | Technical latency and answer logs | Bot quality alone did not show whether the portfolio created recruiter interest | Added PostHog portfolio funnels, structured feedback and resume, case-study and contact conversions |
| **9. Latency fast path** | Every question waited for the semantic security model; opening chat preloaded the embedding index | Even fixed answers could take seconds, and the Skills nudge appeared unresponsive | Routed approved intents before model loading, made MiniLM lazy, blocked duplicate requests, added visible progress, and capped the Qwen wait at 12 seconds |
| **10. Hosted generation** | Qwen generated answers inside each visitor's browser | The first generative answer depended on a large model download, WebGPU support, and device performance | Replaced Qwen generation with Gemini Flash-Lite behind a protected Vercel endpoint; MiniLM retrieval, approved facts, output validation, and fail-closed fallbacks remain unchanged |
| **11. Evidence-gated retrieval and model comparison** | Semantic retrieval chose the nearest passage, and generator comparisons were subjective | The nearest passage could still be irrelevant, while total latency hid model speed | Added meaningful-topic coverage, source filtering, generation latency, and Qwen-versus-Gemini comparison in the eval console |
| **12. Semantic intent routing** | Supported questions depended heavily on exact route patterns | Short, vague, or unfamiliar wording could miss the correct answer even when the knowledge existed | Added a MiniLM intent router, constrained Gemini fallback classifier, intent confidence telemetry, and intent-level eval cases |
| **13. Intent reliability** | MiniLM used conservative confidence and margin thresholds, while the hosted classifier covered uncertain cases | Valid paraphrases could be rejected; if the hosted classifier timed out, the question fell into retrieval or the generic fallback | Calibrated local thresholds, broadened intent prototypes, added shorthand normalisation, and clarified similar intents such as interview availability versus hiring fit |
| **14. Model-readiness fix** | The eval console could start as soon as the iframe loaded | MiniLM sometimes had not registered yet, making identical semantic questions pass or fail depending on timing | Added a readiness gate before semantic safety, routing, and retrieval; unavailable components now fail closed consistently |
| **15. Resume navigation** | Resume questions were recognised as portfolio-related but had no dedicated answer route | “Where is her resume?” incorrectly returned the missing-information fallback | Added a `resume` intent and fast deterministic route with a clickable resume action, including CV and misspelling regression cases |
| **16. Clearer human evaluation** | Every benchmark expectation was labelled “Expected facts” | Simulated output-validator cases looked like incorrect interpretations of the visitor's question | Renamed the section **Pass criteria — not model input** and added plain-language test-purpose explanations |
| **17. Portfolio interaction polish** | Native scrolling and entrance reveals worked, but desktop scrolling felt abrupt | The page lacked the restrained fluidity of the reference experience | Added lightweight inertial desktop scrolling while preserving native touch, keyboard, nested-panel, and reduced-motion behaviour |

## Cost and trade-offs

- **Model cost:** expected to remain ₹0 while the project stays within Gemini's free-tier quota; telemetry also records a paid-rate estimate for visibility.
- **Fast path:** approved deterministic and guardrail answers return without calling Gemini.
- **Trade-off:** open-ended generation now depends on a network service and its quota instead of the visitor's device.
- **Intent trade-off:** ambiguous wording may use one small hosted classification call before answering; high-confidence local intents and deterministic or guardrail routes avoid it.
- **Compatibility:** generation no longer requires WebGPU; if Gemini fails or times out, the bot returns the approved answer.
- **Privacy:** only public portfolio questions and allowlisted evidence should reach Gemini. Email addresses and phone numbers are redacted server-side.
- **Free-tier caveat:** Google's free tier is quota-based, not guaranteed as a one-month trial, and its data-use terms differ from the paid tier. Recheck current terms before production use.

## Is this technically RAG?

**Yes—for the questions that enter the RAG route.** Mira retrieves relevant approved portfolio evidence and supplies it to Gemini before an answer is written. The rest of the architecture deliberately avoids RAG where a deterministic answer or safety boundary is more reliable.

That makes the complete product a **guarded, conditional RAG assistant**, rather than a chatbot that sends every question to an LLM.

The preproduction build is connected to the `codex/portfolio-rag-preprod` branch and is intentionally separate from production.
