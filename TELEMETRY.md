# Mira evaluation and telemetry guide

This document explains what the chatbot records, how to review the golden evaluation dataset, and how to build the PostHog views needed to improve the product and detect likely abuse.

## Evaluation workflow

Open `/eval.html` on the preproduction deployment.

1. Run one question while debugging a specific route, or select **Run all** for a complete pass.
2. Open each result and compare the answer with the expected facts, response type, and sources.
3. Mark the result **Correct** or **Incorrect**.
4. Give it a helpfulness score from 1 to 5.
5. Record why the answer is correct or incorrect. You can type in the Reason field or select the coral microphone icon, speak naturally, and select it again to stop.
6. Export the review as JSON when you want to share or archive it.

Use **Compare models** on an individual open-ended case to run Gemini Flash-Lite and Qwen 2.5 against the same retrieved evidence. Compare factual completeness, tone, concision, fallback behaviour, total latency, and model-generation latency. Qwen runs locally through WebGPU and may take several minutes on its first run; if WebGPU is unavailable, the console records that limitation instead of changing the live bot.

Use the **Answer source** filter to isolate policy answers, accepted LLM answers, fallbacks, guardrails, or errors. Model-generation latency is shown as **Not used** when a policy or guardrail answer bypassed the model. For generated answers, it measures the generation step, including provider or local-model overhead. Total latency includes security checks, retrieval, semantic-cache lookup, validation, and generation.

Answers and manual reviews are stored in the current browser with `localStorage`. They are not uploaded automatically. Exporting produces a dated JSON file containing the dataset, answers, telemetry, verdicts, helpfulness ratings, and reviewer reasons.

Dictation uses the browser's Web Speech API and requires microphone permission. Browser support varies, and some browsers may process speech through their provider. The evaluation console stores only the resulting transcript in its normal local review data and does not send evaluation reviews to PostHog.

## Source-only answer contract

The assistant may answer only from:

- Approved profile and policy responses in `assets/chatbot-knowledge.js`
- Approved structured facts in `assets/mira-facts.js`; only entries marked `approved` may answer, and their evaluation examples are never indexed for retrieval
- Portfolio passages in `portfolioKnowledge` inside `index.html`
- Verified resume and interview-prep chunks indexed from approved source documents
- The visitor's question

Known direct actions, confidentiality rules, and safety boundaries return approved answers without generation. Every normal portfolio or recruiter question goes directly to evidence retrieval—there is no separate intent classifier. Gemini is reserved for evidence-based synthesis through a protected Vercel endpoint. It is instructed to paraphrase supplied facts rather than introduce claims and must not infer private details, dates, employers, metrics, ownership, or personality traits.

The active thresholds are exposed as `window.ASK_PRERNA_RAG_CONFIG`:

| Setting | Value | Purpose |
| --- | ---: | --- |
| Evidence candidate floor | `0.16` | Broad semantic-recall floor before evidence validation |
| Maximum evidence candidates | `5` | Limits the context Gemini receives |
| Semantic cache threshold | `0.91` | Reuses an answer only for a very close question with matching evidence sources |
| Maximum question length | `500` characters | Limits abuse and unnecessary processing |
| Maximum answer length | `300` characters | Keeps Mira concise |
| Semantic security wait | `8` seconds | Fails closed if the security model cannot decide in time |
| Gemini browser wait | `14` seconds | Returns the approved fallback instead of leaving the visitor waiting |
| Structured-fact confidence | `0.72` | Below this, Gemini's shortlist decision fails closed |
| Unsupported fallback | `I don’t have that information available.` | Returned when approved context is insufficient |

Gemini is limited to 120 output tokens and a 14-second browser response budget. Its output is trimmed at a sentence or word boundary and hard-capped at 300 characters. Generated responses are rejected when they are empty, malformed, exceed that cap, introduce an unsupported quantified claim, mention unsupported proper nouns or private topics, leak prompt language, or fail sentence-level semantic grounding. A rejected or slow response falls back to the approved answer.

Before retrieval, input is canonicalised to expose zero-width characters, selected Unicode homoglyphs, Base64-encoded instructions, and common leetspeak. Literal rules screen every request. Questions that match a deterministic approved action or policy boundary return that fixed response without generation. Other questions pass through the MiniLM injection check before direct evidence retrieval. If semantic security classification cannot load, those open-ended requests fail closed. These are layered risk controls, not a proof that every novel attack will be caught.

MiniLM loads only when an open-ended request needs semantic checks or retrieval. Approved recruiter questions and policy responses stay on the fast path. Gemini runs server-side, so visitors no longer download a generation model or depend on WebGPU; an open-ended request can still experience network, Vercel, or provider latency.

## Live request event

Event name: `portfolio_assistant_response`

One anonymous event is captured after each completed visitor request. Evaluation runs made through `/eval.html` are excluded so test traffic does not pollute visitor analytics.

| Property | Meaning |
| --- | --- |
| `request_id` | Unique ID used to join the answer, helpfulness, and conversion events |
| `user_question` | Visitor question after email and phone redaction, limited to 500 characters |
| `retrieved_sources` | Source names used by the answer path |
| `retrieval_scores` | Source and cosine score pairs used for generation |
| `answer` | Final answer displayed to the visitor |
| `answer_mode` | `gemini`, `policy`, `curated_fallback`, `unsupported_fallback`, or `error_fallback` |
| `fallback` | Whether a safe fallback was used |
| `fallback_reason` | Why the fallback occurred |
| `error` | Request or generation error when present |
| `retrieval_model` | Embedding model used for retrieval |
| `generation_model` | Generation model when Gemini produced the final answer |
| `fact_id` | Approved structured fact selected after retrieval, when the pilot route is used |
| `question_stance` | `affirm` or `negate` for a supported structured-fact answer |
| `fact_confidence` | Gemini confidence for the fact-and-stance decision; answers require at least `0.72` |
| `generation_latency_ms` | Time spent in the generation step; zero when no model was used |
| `total_latency_ms` | Total time from submitted question to final answer |
| `input_tokens_estimate` | Approximate input tokens using a four-characters-per-token estimate |
| `output_tokens_estimate` | Approximate output tokens using the same estimate |
| `estimated_cost_usd` | Paid-rate reference estimate for Gemini generation; actual cost may be `0` while within free-tier quota |
| `retrieval_cache_hit` | Whether the semantic retrieval model and vectors were already warm |
| `generation_cache_hit` | Whether a generated answer was reused from cache; hosted Gemini calls currently report false |
| `rules_version` | Version of the policy and threshold configuration |
| `security_mode` | `fast_policy`, `rule`, `semantic`, `semantic_clear`, `semantic_uncertain`, `semantic_unavailable`, `semantic_timeout`, `input_guard`, or `request_error` |
| `security_score` | Similarity score produced by the semantic injection classifier when available |

### `portfolio_assistant_rate_limited`

Captured when the visible browser UI receives more than 10 questions in one minute. It includes `request_id` and `requests_in_last_minute`. This is a user-experience safeguard, not strong abuse prevention: a determined visitor can clear or bypass client-side JavaScript.

## Helpfulness and conversion events

### `portfolio_assistant_helpfulness`

- `request_id`
- `helpfulness_rating`: `1` for Yes and `0` for No

When a visitor selects **No**, the interface asks what could be better. The available reasons are missing information, incorrect information, irrelevant answer, too verbose, and poor tone.

### `portfolio_assistant_feedback_reason`

- `request_id`
- `feedback_reason`: `missing_information`, `incorrect_information`, `irrelevant_answer`, `too_verbose`, or `poor_tone`

Join this event to `portfolio_assistant_response` and `portfolio_assistant_helpfulness` using `request_id`. No free-text reason is collected from portfolio visitors.

### `portfolio_conversion`

- `conversion_type`: `resume_click`, `case_study_click`, or `contact_click`
- `assistant_request_id`: most recent chatbot request in the visitor's tab
- `case_study_id` when applicable
- `link_location` when applicable

The existing detailed events such as `resume_opened`, `case_study_opened`, and contact-channel clicks are preserved.

## Recommended PostHog dashboard

Create a dashboard named **Mira health** and add these insights:

1. **Question volume**: count `portfolio_assistant_response` by day.
2. **Question themes**: table of `user_question`, `answer_mode`, `retrieved_sources`, and `fallback_reason`.
3. **Fallback rate**: percentage of responses where `fallback = true`.
4. **Error rate**: percentage where `error` is not empty.
5. **Helpfulness rate**: average `helpfulness_rating` on `portfolio_assistant_helpfulness`.
6. **Negative-feedback reasons**: count `portfolio_assistant_feedback_reason`, broken down by `feedback_reason`.
7. **Cache effectiveness**: breakdown by `generation_cache_hit` and `retrieval_cache_hit`.
8. **Token volume**: sum `input_tokens_estimate` and `output_tokens_estimate`.
9. **Estimated cost**: sum `estimated_cost_usd`.
10. **Conversions after chat**: funnel from `portfolio_assistant_response` to `portfolio_conversion`, broken down by `conversion_type`.
11. **Sources used**: breakdown of `retrieved_sources` to see which parts of the portfolio answer the most questions.
12. **Guardrail activity**: count responses by `security_mode`; alert when `rule`, `semantic`, `semantic_uncertain`, or `semantic_unavailable` rises sharply.
13. **Rate-limit events**: count `portfolio_assistant_rate_limited` by hour and browser session.

For latency percentiles, create a SQL insight with the following query and save it to the dashboard:

```sql
SELECT
    quantile(0.50)(toFloat(properties.total_latency_ms)) AS p50_latency_ms,
    quantile(0.95)(toFloat(properties.total_latency_ms)) AS p95_latency_ms,
    count() AS request_count
FROM events
WHERE event = 'portfolio_assistant_response'
  AND timestamp >= now() - INTERVAL 30 DAY
```

The evaluation console also calculates P50 and P95 locally for the current saved test run.

## Abuse monitoring and response

Create alerts for a sudden increase in prompt-injection decisions, input-guard fallbacks, rate-limit events, total question volume, or generation errors. Review the redacted questions behind the spike, add representative attacks to `assets/eval-dataset.js`, then strengthen the smallest relevant rule or source boundary and rerun the full suite.

Gemini uses a server-side key, so abuse can consume quota or create cost. The endpoint applies same-origin checks, a best-effort per-IP rate limit, input limits, and allowlists for approved answers and sources; the key never reaches the browser. Monitor generation errors, latency, request spikes, and estimated cost. For stronger production enforcement, add durable edge rate limiting and bot protection because serverless in-memory limits are not globally authoritative.

## Product questions this instrumentation can answer

- What do recruiters ask most often?
- Which supported questions still trigger fallbacks?
- Which portfolio sources are doing useful work?
- Is the first Gemini response too slow?
- Are hosted responses reliable across browsers and devices?
- Which answers receive negative helpfulness feedback?
- Which questions are followed by resume, case study, or contact clicks?
- Does the generative answer improve conversion compared with the curated fallback?

## Privacy decisions

- Events are anonymous and do not create person profiles.
- Session recording remains disabled.
- Email addresses and phone numbers are redacted from questions before capture.
- Evaluation traffic is excluded from live request telemetry.
- Questions and answers are still potentially sensitive text. Review retention settings in PostHog and avoid collecting information that is not necessary for improving the portfolio experience.
