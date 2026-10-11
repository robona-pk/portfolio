# Ask Prerna evaluation and telemetry guide

This document explains what the chatbot records, how to review the 113-question evaluation set, and how to build the PostHog views needed to improve the product and detect likely abuse.

## Evaluation workflow

Open `/eval.html` on the preproduction deployment.

1. Run one question while debugging a specific route, or select **Run all 113** for a complete pass.
2. Open each result and compare the answer with the expected facts, response type, and sources.
3. Mark the result **Correct** or **Incorrect**.
4. Give it a helpfulness score from 1 to 5.
5. Record why the answer is correct or incorrect. You can type in the Reason field or select the coral microphone icon, speak naturally, and select it again to stop.
6. Export the review as JSON when you want to share or archive it.

Use **Compare models** on an individual open-ended case to run Gemini Flash-Lite and Qwen 2.5 against the same retrieved evidence. Compare factual completeness, tone, concision, fallback behaviour, and latency. Qwen runs locally through WebGPU and may take several minutes on its first run; if WebGPU is unavailable, the console records that limitation instead of changing the live bot.

Answers and manual reviews are stored in the current browser with `localStorage`. They are not uploaded automatically. Exporting produces a dated JSON file containing the dataset, answers, telemetry, verdicts, helpfulness ratings, and reviewer reasons.

Dictation uses the browser's Web Speech API and requires microphone permission. Browser support varies, and some browsers may process speech through their provider. The evaluation console stores only the resulting transcript in its normal local review data and does not send evaluation reviews to PostHog.

## Source-only answer contract

The assistant may answer only from:

- Approved profile and policy responses in `assets/chatbot-knowledge.js`
- Portfolio passages in `portfolioKnowledge` inside `index.html`
- The visitor's question

Known recruiter questions, published metrics, confidentiality rules, and safety boundaries return approved answers without generation. Gemini is reserved for open-ended synthesis through a protected Vercel endpoint. It is instructed to paraphrase supplied facts rather than introduce claims and must not infer people management, seniority, private details, dates, employers, metrics, ownership, or personality traits.

The active thresholds are exposed as `window.ASK_PRERNA_RAG_CONFIG`:

| Setting | Value | Purpose |
| --- | ---: | --- |
| Semantic relevance threshold | `0.24` | Minimum cosine score after hybrid reranking |
| Meaningful-term coverage | `0.50` | At least half of the non-generic question topics must appear in the evidence |
| Minimum topic matches | `1` | Rejects passages that are only close because of generic words such as “Prerna”, “work”, or “product” |
| Unsupported fallback | `I don’t have that information right now. You can reach out to Prerna to ask her directly.` | Returned with a contact CTA when approved context is insufficient |

Gemini is limited to 120 output tokens and a 10-second browser response budget. Its output is trimmed at a sentence or word boundary and hard-capped at 300 characters. Generated responses are rejected when they are empty, malformed, exceed that cap, introduce an unsupported quantified claim, mention unsupported proper nouns or private topics, leak prompt language, or fail sentence-level semantic grounding. A rejected or slow response falls back to the approved answer.

Before retrieval, input is canonicalised to expose zero-width characters, selected Unicode homoglyphs, Base64-encoded instructions, and common leetspeak. Literal rules screen every request. Questions that match a deterministic approved answer or policy boundary return that fixed response without loading an AI model; because visitor text is never supplied to generation on this path, it cannot alter the answer. Unmatched open-ended questions also pass through the MiniLM injection classifier before retrieval or generation. If semantic security classification cannot load, those open-ended requests fail closed. These are layered risk controls, not a proof that every novel attack will be caught.

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

Create a dashboard named **Ask Prerna health** and add these insights:

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
