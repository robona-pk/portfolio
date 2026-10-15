# Qwen feedback migration

This ledger records how Prerna's human evaluations from the Qwen-era assistant were promoted into Mira's live Gemini architecture. The reviews are product requirements, not model training data.

## Inputs

- `evaluations/ask-prerna-evals-reviewed-2026-10-09.json` — the original 50-case human review.
- `mira-evals-2026-10-15.json` — later regression export with 150 reviewed cases.
- `mira-evals-2026-10-15 (1).json` — latest review; its feedback wins where older reviews conflict.

## Migration rule

Each repeated feedback theme becomes a governed answer contract with:

- approved evidence sources;
- the meanings to which the evidence applies;
- a reviewed answer and, where needed, an opposite-position answer;
- facts that must be present and claims that must not appear;
- an approved CTA when a published case study supports the answer;
- Golden Dataset cases that verify the contract across natural wording.

Gemini selects the contract by meaning. The server then returns the reviewed answer stored in that contract rather than asking Gemini to recreate it from scratch.

## Migrated contracts

| Human-review theme | Governed contract | Preserved decision |
| --- | --- | --- |
| Who Prerna is and what she does | `profile_overview` | Role, 5+ years, three industries, Lenskart/Bajaj impact and AI building—not a generic activation list |
| Experience and employers | `experience_overview` | Years, companies and industries stay together |
| Origin and current base | `location_history` | Delhi; Chennai, Pune and Hyderabad; Bengaluru now; no invented biographical language |
| Preferred roles | `target_roles` | PM/Senior PM, ownership, B2C, growth, adoption and AI-enabled products |
| Career-change framing | `career_direction` | Next meaningful challenge plus direct-contact action |
| Free time | `hobbies_profile` and `drumming` | Lifting, drums and solo travel; no invented competitions or awards |
| Personality | `personality_profile` | Energetic, persistent, meaningful problems, learning and deliberate progress |
| PM operating style | `product_work_style` and `operator_profile` | Data, customer conversations, hypothesis, smallest useful test, outcomes, energy, persistence and curiosity |
| Complete skill set | `product_toolkit` | Product craft, experimentation, GTM, analytics, technical tooling and AI-assisted building |
| Metrics capability | `metrics_capability` | Funnels, cohorts, KPIs and customer, commercial and operational outcomes |
| Cross-functional work | `cross_functional_collaboration` | Design, engineering, operations and commercial partners around measurable outcomes |
| Motivation | `product_motivation` | Evolution, customer use and learning from positive and critical feedback |
| Recruiter value | `recruiter_value` | 5+ years, industries, named commercial outcomes and hands-on AI experiments |
| Lenskart impact | `lenskart_impact` | ₹6Cr+, ₹1.8Cr and 7% booking lift together, with case-study CTA |
| Diabetes wellness | `diabetes_wellness` | 0→1, ₹28L in five months and four-person APM leadership |
| Smart Health Reports | `smart_health_reports_impact` | Customer insight, 8x adoption and ₹7L+ incremental MRR |
| Doctor ranking | `doctor_listing_ranking` | Two-layer quality model, 18% CTR and 11.6% revenue lift, with CTA |
| Insurance pre-authorisation | `preauthorisation_automation` | Email intake, OCR, NER, 26% throughput and ₹17L annual saving |
| AI/ML experience | `ai_ml_experience` | Shipped OCR/NER work plus Mira, retrieval, prompting, guardrails, evaluations and analytics |
| Unsupported/private questions | deterministic policy layer | No invention; confidentiality, privacy, respectful-language and clean no-information fallbacks remain outside open generation |

## Release protection

The compact release check now includes the high-value Qwen-reviewed cases for identity, experience, location, roles, hobbies, personality, PM style, skills, tools, recruiter value and named project outcomes. A future model migration must pass these cases before production promotion.

## Fixed migration defect

Several governed contract source IDs were not duplicated in the server's lower-level source library. The server could therefore select the right contract and then discard its evidence identity, producing a false fallback or generic source answer. Governed fact sources are now independently allowlisted and returned with the selected contract.
