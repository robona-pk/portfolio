# Ask Prerna — preproduction security and go-live audit

Date: 10 October 2026  
Rules version: `2026-10-10.8`  
Scope: browser-side retrieval, Qwen generation, policy routing, output validation, evaluation console, and telemetry.

## Executive verdict

The build is ready for preproduction testing. It is not yet approved for production: content quality still needs Prerna's review, and the final gate should include Chrome, Safari, and a browser/device without WebGPU. The controls reduce risk substantially but do not make a public generative system impossible to abuse.

## Controls implemented

- Literal and semantic prompt-injection screening.
- Canonicalisation for zero-width formatting characters, selected Unicode homoglyphs, Base64-encoded instructions, multilingual attack wording, spaced-out commands, and common leetspeak.
- Fuzzy spelling correction for portfolio vocabulary and known severe name variants.
- Fail-closed handling when semantic security or retrieval cannot load.
- 500-character input ceiling and a best-effort 10-requests-per-minute browser throttle.
- 300-character generated-answer ceiling and a 72-new-token generation budget.
- Rejection of prompt leakage, unsupported private claims, unsupported proper nouns, unsupported quantified claims, and sentences that cannot be grounded in retrieved context.
- Curated fallback when WebGPU is absent, Qwen fails, or output validation fails.
- Telemetry fields for security mode, security score, fallback reason, errors, cache state, latency, approximate tokens, and conversions.

## Verification performed

The complete 106-case local evaluation suite completed on the production-shaped static build.

- P50: 17 ms; P95: 359 ms on a warm local run. These figures are diagnostic, not a production service-level promise.
- Eight direct/obfuscated injection cases (81–88) returned the approved injection boundary.
- The indirect semantic-only injection case (106) was blocked.
- Four false-positive controls (89–91 and 105) stayed answerable.
- Severe spelling cases (92–95) routed to the intended answers.
- Semantic-unavailable, WebGPU-unavailable, and model-failure cases (96–98) failed safely.
- Invented metric, prompt leakage, fake employer, and private-claim outputs (99–102) were rejected.
- A grounded generated answer (103) was accepted.
- Oversized input (104) returned the approved fallback.
- Syntax checks and `git diff --check` passed.

## How abuse can still happen

The knowledge bank and client logic are shipped to the browser, so a technical visitor can inspect them. A determined visitor can also bypass the JavaScript throttle, automate requests, pollute analytics, or devise a prompt not represented by the current attack set. The large first-use model download can create a poor experience on slow devices.

There is no paid inference key or private server model endpoint to drain. The most credible harms are:

1. A misleading unsupported answer damages trust in the portfolio.
2. Automated traffic consumes Vercel bandwidth or pollutes PostHog data.
3. Repeated local inference slows or freezes a visitor's tab.
4. Public portfolio facts or policy wording are scraped from the client bundle.

## Detection and response

Monitor `security_mode`, `fallback_reason`, `portfolio_assistant_rate_limited`, request volume, and generation errors in PostHog. Alert on sudden increases in rule/semantic blocks, input-guard fallbacks, rate-limit events, or total volume. Review the redacted questions, add new representative cases to the evaluation dataset, update the narrowest relevant control, and rerun all 106 cases before deployment.

For stronger enforcement, add Vercel or edge bot protection and server-side rate limiting only if the architecture later introduces a server endpoint. Client-side throttling is a usability control, not a security boundary.

## Final production gate

- Prerna reviews recruiter-facing answers and marks critical cases correct.
- Chrome, Safari, and no-WebGPU fallback behaviour are tested on real devices.
- A cold-cache latency/download test is recorded separately from the warm evaluation run.
- PostHog abuse panels and alerts are configured and verified.
- No API keys, private documents, or undisclosed company information appear in client assets.

