# Ask Prerna evaluation and telemetry guide

This document explains what the chatbot records, how to review the 106-question evaluation set, and how to build the PostHog views needed to improve the product and detect likely abuse.

## Evaluation workflow

Open `/eval.html` on the preproduction deployment.

1. Run one question while debugging a specific route, or select **Run all 106** for a complete pass.
2. Open each result and compare the answer with the expected facts, response type, and sources.
3. Mark the result **Correct** or **Incorrect**.
4. Give it a helpfulness score from 1 to 5.
5. Record why the answer is correct or incorrect. You can type in the Reason field or select the coral microphone icon, speak naturally, and select it again to stop.
6. Export the review as JSON when you want to share or archive it.

Answers and manual reviews are stored in the current browser with `localStorage`. They are not uploaded automatically. Exporting produces a dated JSON file containing the dataset, answers, telemetry, verdicts, helpfulness ratings, and reviewer reasons.

Dictation uses the browser's Web Speech API and requires microphone permission. Browser support varies, and some browsers may process speech through their provider. The evaluation console stores only the resulting transcript in its normal local review data and does not send evaluation reviews to PostHog.

## Source-only answer contract

The assistant may answer only from:

- Approved profile and policy responses in `assets/chatbot-knowledge.js`
- Portfolio passages in `portfolioKnowledge` inside `index.html`
- The visitor's question

Known recruiter questions, published metrics, confidentiality rules, and safety boundaries return approved answers without generation. Qwen is reserved for open-ended synthesis. It is instructed to paraphrase supplied facts rather than introduce claims and must not infer people management, seniority, private details, dates, employers, metrics, ownership, or personality traits.

The active thresholds are exposed as `window.ASK_PRERNA_RAG_CONFIG`:

| Setting | Value | Purpose |
| --- | ---: | --- |
| Direct semantic answer threshold | `0.38` | Minimum cosine score for a retrieved portfolio answer |
| Generation context threshold | `0.30` | Minimum cosine score for a passage supplied to Qwen |
| Lexical minimum score | `1` | Minimum keyword match when semantic retrieval is unavailable |
| Unsupported fallback | `I don’t have that information available.` | Returned when approved context is insufficient |

Qwen is limited to 72 new tokens. Its output is trimmed at a sentence or word boundary and hard-capped at 300 characters. Generated responses are rejected when they are empty, malformed, exceed that cap, introduce an unsupported quantified claim, mention unsupported proper nouns or private topics, leak prompt language, or fail sentence-level semantic grounding. A rejected response falls back to the approved answer.

Before retrieval, input is canonicalised to expose zero-width characters, selected Unicode homoglyphs, Base64-encoded instructions, and common leetspeak. Literal rules and a MiniLM similarity classifier screen direct and indirect prompt injection. If semantic security classification cannot load, open-ended requests fail closed rather than continuing to generation. These are layered risk controls, not a proof that every novel attack will be caught.

The embedding index and Qwen begin warming when the chat opens. Known questions answer immediately while that happens. Open-ended questions may still experience the initial model download; later answers in the same browser benefit from the model cache.

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
| `answer_mode` | `qwen`, `policy`, `curated_fallback`, `unsupported_fallback`, or `error_fallback` |
| `fallback` | Whether a safe fallback was used |
| `fallback_reason` | Why the fallback occurred |
| `error` | Request or generation error when present |
| `retrieval_model` | Embedding model used for retrieval |
| `generation_model` | Generation model when Qwen produced the final answer |
| `total_latency_ms` | Total time from submitted question to final answer |
| `input_tokens_estimate` | Approximate input tokens using a four-characters-per-token estimate |
| `output_tokens_estimate` | Approximate output tokens using the same estimate |
| `estimated_cost_usd` | `0` for the browser-hosted open-source model |
| `retrieval_cache_hit` | Whether the semantic retrieval model and vectors were already warm |
| `generation_cache_hit` | Whether Qwen was already loaded in the current tab |
| `rules_version` | Version of the policy and threshold configuration |
| `security_mode` | `rule`, `semantic`, `semantic_clear`, `semantic_uncertain`, `semantic_unavailable`, `input_guard`, or `request_error` |
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

Because inference runs in the browser, the current site has no paid model key or inference endpoint to drain. The realistic risks are analytics pollution, bandwidth usage, a slow or frozen visitor tab, attempts to extract the public client-side knowledge bank, and reputational harm if an unsupported answer slips through. Client-side throttling can improve normal use but cannot stop a determined attacker; production-grade enforcement would require a server or edge rate limit, bot protection, and alerting.

## Product questions this instrumentation can answer

- What do recruiters ask most often?
- Which supported questions still trigger fallbacks?
- Which portfolio sources are doing useful work?
- Is the first uncached Qwen response too slow?
- Are warm responses fast enough to justify browser-side generation?
- Which answers receive negative helpfulness feedback?
- Which questions are followed by resume, case study, or contact clicks?
- Does the generative answer improve conversion compared with the curated fallback?

## Privacy decisions

- Events are anonymous and do not create person profiles.
- Session recording remains disabled.
- Email addresses and phone numbers are redacted from questions before capture.
- Evaluation traffic is excluded from live request telemetry.
- Questions and answers are still potentially sensitive text. Review retention settings in PostHog and avoid collecting information that is not necessary for improving the portfolio experience.
