# Ask Prerna evaluation audit

## Follow-up run

The second reviewed export contained 28 correct and 22 incorrect answers, with an average helpfulness score of 3.9 out of 5. The remaining gaps were more specific than the first run:

- recruiter answers were accurate but still too generic or self-promotional;
- AI-building experience and newer tools such as Claude Code and PostHog were missing;
- case-study answers needed more problem context and direct case-study actions;
- the family question needed an earlier privacy route;
- the failure question needed an honest boundary plus an invitation to discuss it directly.

The approved answer bank, retrieval passages, routing, expected facts, and case-study actions were updated from this feedback. Case-study actions now close the assistant and open the corresponding case modal. No private evaluation export is committed to the repository.

## Third run

The third reviewed export reached 45 correct answers out of 50, while average helpfulness remained 3.9 out of 5. The five remaining comments were deterministic editorial issues rather than retrieval or generation failures:

- availability needed a more direct invitation and a `Talk to Prerna` action;
- strengths needed more modest, less self-referential phrasing;
- collaboration needed Prerna's actual philosophy of keeping partners close to the solution space, aligning stakeholders, and sharing business outcomes;
- insurance pre-authorisation needed clearer grammar around manual Vidal entry, OCR, and NER;
- the failure boundary needed to avoid saying that Prerna had not “published” a story.

All five approved answers and their evaluation expectations were revised. The attached export remains private and uncommitted.

## Outcome

All 50 responses in Prerna's exported evaluation have now been reviewed. Prerna's verdicts and reasons for questions 1-10 are preserved. Questions 11-50 were reviewed against the approved answer bank, published portfolio evidence, privacy rules, and the quality standard visible in those first ten reviews.

- Correct: 24 of 50
- Incorrect: 26 of 50
- Average helpfulness: 3.0 of 5
- Strongest area: deterministic privacy, confidentiality, abuse, and off-topic handling
- Weakest area: Qwen-generated factual and behavioural answers

The reviewed data is in `ask-prerna-evals-reviewed-2026-10-09.json`. Each response includes a verdict, helpfulness score, and reason.

## What the audit found

The original expected-facts list was too thin for several recruiter questions. It often described the minimum technically correct answer rather than the strongest useful answer. The evaluation dataset has therefore been expanded to include:

- named employers and disclosed impact for identity and hiring-fit questions;
- Prerna's industries, total experience, product approach, and B2C/growth/adoption/AI interests;
- complete behavioural evidence rather than generic personality adjectives;
- complete case-study metrics rather than one headline number;
- explicit non-invention requirements for personal, unsupported, and prompt-injection questions.

## Current-answer assessment

### Good without material changes

Availability, hobbies, location, life philosophy, strengths, the Bajaj overview, confidentiality boundaries, privacy boundaries, insult handling, personal-status handling, off-topic handling, and prompt-injection containment were acceptable.

### Incorrect because Qwen invented information

- `hobbies-13`: invented fitness competitions and significant success.
- `personality-16`: invented that Prerna puts her needs ahead of others.
- `pm-style-17`: wrote in first person and treated Prerna Kapoor as a company.
- `unsupported-49`: invented a failed health-tech launch.
- `fallback-50`: invented *The Art of War* as a favourite book.

These are safety failures, not merely tone problems.

### Incorrect because important evidence was omitted

- `interests-14`: ignored dopamine detox, meeting people, and solo travel.
- `skills-19`: reduced product management to marketing campaigns.
- `problem-22`: omitted the smallest useful intervention and outcome measurement.
- `collaboration-23`: omitted the actual partner functions and working lifecycle.
- `motivation-24`: replaced the documented motivation with generic innovation language.
- `hiring-25`: omitted experience, industries, companies, and measurable outcomes.
- `lenskart-26` and `lenskart-28`: omitted disclosed metrics.

### Incorrect because routing failed

- `skills-20` and `tools-21` incorrectly returned insufficient-information fallbacks.
- `lenskart-27`, `bajaj-30`, and `bajaj-32` incorrectly returned out-of-scope responses.
- `bajaj-31` and `bajaj-33` incorrectly returned insufficient-information fallbacks.

These facts already exist in the knowledge base, so the problem is intent detection and retrieval, not missing source material.

## Product conclusion

The earlier deterministic bot felt better because it returned deliberately written answers for known recruiter intents. Adding Qwen introduced variation but also removed facts, distorted wording, and fabricated unsupported claims.

The recommended architecture is hybrid:

1. Deterministic, approved responses for common recruiter questions, disclosed metrics, privacy, confidentiality, abuse, unsupported personal questions, and prompt injection.
2. Retrieval plus Qwen only for genuinely open-ended questions where multiple approved sources must be combined.
3. Required-fact validation before any generated answer is displayed.
4. A clean approved fallback whenever Qwen omits a mandatory fact or introduces an unsupported claim.

This is still a legitimate RAG system. The model is used selectively where generation adds value; retrieval and policy controls remain responsible for accuracy.

## How future feedback should be handled

Manual verdicts do not retrain Qwen automatically. Each incorrect review should be classified as one of:

- **Evaluation gap:** expected facts are incomplete. Update `assets/eval-dataset.js`.
- **Knowledge gap:** the approved fact is absent. Update `assets/chatbot-knowledge.js` or the curated portfolio passages.
- **Routing gap:** the fact exists but the wrong intent or source is selected. Update the intent rules or retrieval tests.
- **Generation gap:** Qwen receives the right facts but omits or distorts them. Add required-fact validation or use the approved deterministic answer.
- **Safety failure:** Qwen invents private, personal, or unsupported information. Block generation for that intent and use a policy response.
