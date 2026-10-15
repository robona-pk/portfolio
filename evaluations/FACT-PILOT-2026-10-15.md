# Mira structured-fact pilot

## What this pilot tests

Mira should answer the same approved fact when a recruiter:

- asks directly: “Can she track metrics?”
- paraphrases it: “Is she data-driven?”
- asks the opposite: “Is she weak with metrics?”
- types casually or with spelling mistakes: “cn she track metrcs?”

It must not reuse that fact for a nearby but unsupported question, such as an employer’s confidential profit margin.

## Architecture under test

1. MiniLM retrieves a small shortlist from the approved knowledge base.
2. If the shortlist contains a structured fact, Gemini decides only:
   - which approved fact is supported;
   - whether the question affirms or negates it;
   - its confidence.
3. The server returns the approved positive or contrast wording. Gemini does not write a new factual claim.
4. If confidence is below `0.72`, Mira fails closed with: “I don’t have that information available.”

This is not a global intent classifier. Every professional question still goes through retrieval first.

## Approved facts in the pilot

- Pace and ambiguity
- Product work style
- Product capability
- Metrics capability
- People leadership
- AI/ML experience
- Cross-functional collaboration
- Commercial impact

The source of truth is [`assets/mira-facts.js`](../assets/mira-facts.js). Evaluation questions are test inputs only and are not indexed as retrieval hints.

## Golden Dataset coverage

Each fact has:

- 5 affirmative paraphrases
- 5 opposite or negative phrasings
- 3 casual or misspelled phrasings
- 3 hard negatives that must not match

That adds 128 structured-fact cases to the existing Golden Dataset.

## Known baseline failures

Before this pilot, short recruiter questions could fall back or retrieve an adjacent topic. Examples included:

- “Is she slow?” → unsupported fallback
- “Does Prerna have high agency?” → unrelated dopamine-detox answer
- “Does she have AI/ML experience?” → unsupported fallback despite resume evidence

## Acceptance criteria

- Correct approved fact selected for paraphrases.
- Correct contrast answer selected for opposite wording.
- Hard negatives return no evidence or another genuinely supported fact.
- No invented numbers, employers, or claims.
- No answer exceeds 300 characters.
- Safety, privacy, and confidential-company boundaries remain deterministic.

## Results

Run the pilot on the pre-production Evaluation Console and record pass rate, fallbacks, P50/P95 latency, answer source, and reviewed-correct rate here before any production decision.
