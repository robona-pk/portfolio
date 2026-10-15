/*
  Mira approved fact registry — pre-production pilot.

  `claim`, `answer`, and `contrast` are approved response material.
  Evaluation examples exist only for evaluation; retrieval must not index
  them. A draft fact must never be used to answer a visitor.
*/
(function exposeMiraFacts(root) {
  const facts = [
    {
      id: 'pace_and_ambiguity',
      source: 'Profile · Pace and ambiguity',
      status: 'approved',
      claim: 'Prerna’s documented work shows comfort with pace and ambiguity through evidence-led problem framing, focused experiments, and sustained iteration.',
      appliesTo: ['startup fit', 'fast-paced environments', 'high-growth teams', 'pace', 'urgency', 'adaptability', 'ambiguity', 'agency and ownership'],
      evidence: ['Profile · Work style', 'Interview prep · Scope pushback', 'Interview prep · Failed rollout and recovery'],
      answer: 'Her documented work suggests comfort with pace and ambiguity: she clarifies problems with data and customer conversations, tests focused interventions, and stays involved through iteration.',
      contrast: 'Her documented work does not support describing her as slow. It shows an evidence-led PM who narrows ambiguity, runs focused experiments, and iterates toward measurable outcomes.',
      affirmExamples: ['Is she fast paced?', 'What’s her pace like?', 'Does she work with urgency?', 'Can she handle a fast-moving startup?', 'Does she move quickly?'],
      negateExamples: ['Is she a slow PM?', 'Would she be too slow for a startup?', 'Does she take forever to ship?', 'Is she sluggish at work?', 'Does she struggle to keep pace?'],
      casualExamples: ['is pren slow paced?', 'whts her speed like at wrk?', 'can she keep up tho?'],
      hardNegatives: ['How fast did Lenskart revenue grow?', 'What pace does she run at the gym?', 'What is the fastest model used by Mira?']
    },
    {
      id: 'product_work_style',
      source: 'Profile · Work style',
      status: 'approved',
      claim: 'Prerna uses data and customer conversations to locate a journey break, turns the insight into a hypothesis, tests the smallest useful intervention, and iterates on customer and business outcomes.',
      appliesTo: ['work style', 'product approach', 'problem solving', 'how she works', 'how she performs at work', 'operating style'],
      evidence: ['Product approach', 'Interview prep · Ambiguous-data decision', 'Interview prep · Success and kill criteria'],
      answer: 'Prerna starts with data and customer conversations, turns the clearest insight into a measurable hypothesis, tests the smallest useful intervention, and iterates using customer and business outcomes.',
      contrast: 'Her documented approach is not based on jumping straight to solutions. She first clarifies the problem with data and customer conversations, then validates a focused hypothesis.',
      affirmExamples: ['How does she work?', 'What is she like as a PM?', 'How does she solve product problems?', 'Describe her working style.', 'What is her product approach?'],
      negateExamples: ['Does she jump straight into building?', 'Is her approach unstructured?', 'Does she rely only on instinct?', 'Does she just guess?', 'Does she skip customer research?'],
      casualExamples: ['how she wrks?', 'wht kinda pm is pren?', 'does she wing it?'],
      hardNegatives: ['Where does she work?', 'What are her working hours?', 'Does the chatbot work offline?']
    },
    {
      id: 'product_capability',
      source: 'Profile · Product skills',
      status: 'approved',
      claim: 'Prerna’s documented PM capabilities include discovery, customer research, funnel optimisation, experimentation, go-to-market planning, lifecycle and retention strategy, and cross-functional execution.',
      appliesTo: ['product management capability', 'PM skills', 'competence', 'what she brings to a team', 'interview suitability'],
      evidence: ['Skills and tools', 'Resume · Skills — Product and analytics'],
      answer: 'Prerna’s PM toolkit covers discovery, customer research, funnel optimisation, A/B testing, go-to-market planning, lifecycle and retention strategy, and cross-functional execution.',
      contrast: 'Her documented experience does not support describing her as unskilled. It covers discovery, experimentation, go-to-market planning, growth, retention, analytics, and cross-functional delivery.',
      affirmExamples: ['Is she skilled?', 'What are her core PM skills?', 'What can she do as a product manager?', 'Is she competent?', 'Does she know product management?'],
      negateExamples: ['Is she unskilled?', 'Does she lack PM fundamentals?', 'Is she bad at product?', 'Is she incapable as a PM?', 'Does she lack product skills?'],
      casualExamples: ['is pren skilled?', 'wht can she do as pm?', 'she any good at product?'],
      hardNegatives: ['What tools does Mira use?', 'What is her degree?', 'Does she play a musical instrument?']
    },
    {
      id: 'metrics_capability',
      source: 'Profile · Analytics and metrics',
      status: 'approved',
      claim: 'Prerna defines product and business metrics, analyses funnels and cohorts, and evaluates experiments across customer, commercial, and operational outcomes.',
      appliesTo: ['metrics', 'KPIs', 'analytics', 'data-driven product management', 'funnels', 'cohorts', 'measuring product success'],
      evidence: ['Resume · Skills — Product and analytics', 'Interview prep · Product metrics framework'],
      answer: 'Prerna defines product and business metrics, analyses funnels and cohorts, and evaluates experiments across activation, conversion, retention, CTR, NPS, revenue, and operational outcomes.',
      contrast: 'Her documented work does not suggest weak measurement skills. She defines KPIs, analyses funnels and cohorts, and uses customer, commercial, and operational outcomes to evaluate decisions.',
      affirmExamples: ['Can she track metrics?', 'Does she know how to define KPIs?', 'Can she analyse a funnel?', 'Is she data driven?', 'Can she measure product success?'],
      negateExamples: ['Is she weak with metrics?', 'Does she ignore data?', 'Can’t she define KPIs?', 'Is she bad at analytics?', 'Does she struggle to measure success?'],
      casualExamples: ['cn she track metrcs?', 'she good w kpis?', 'does pren get funnels?'],
      hardNegatives: ['What metrics does PostHog track for Mira?', 'What was Lenskart’s profit margin?', 'How many visitors came to the portfolio?']
    },
    {
      id: 'people_leadership',
      source: 'Resume · Bajaj — Product leadership',
      status: 'approved',
      claim: 'At Bajaj Finserv Health, Prerna led a four-person APM team while taking a diabetes wellness product from zero to one.',
      appliesTo: ['team leadership', 'people leadership', 'people management', 'managing or mentoring APMs', 'leading junior product managers'],
      evidence: ['Resume · Bajaj — Product leadership'],
      answer: 'Yes. At Bajaj Finserv Health, Prerna led a four-person APM team while taking a diabetes wellness product from 0 to 1; it generated ₹28L within five months.',
      contrast: 'It would be inaccurate to say she has no leadership experience. Her resume documents leading a four-person APM team while building a diabetes wellness product from 0 to 1.',
      affirmExamples: ['Has she led a team?', 'Does she have people-management experience?', 'Has she managed APMs?', 'What leadership experience does she have?', 'Can she lead junior PMs?'],
      negateExamples: ['Has she never managed anyone?', 'Does she lack leadership experience?', 'Hasn’t she led a team?', 'Has she never managed APMs?', 'Does she have no people-leadership experience?'],
      casualExamples: ['has she led ppl?', 'managed apms or nah?', 'any team lead exp?'],
      hardNegatives: ['Who led Lenskart?', 'How large was the engineering team?', 'Does Mira use agent teams?']
    },
    {
      id: 'ai_ml_experience',
      source: 'Resume · Bajaj — AI automation',
      status: 'approved',
      claim: 'Prerna has shipped AI/ML-enabled product work, including an OCR and NER insurance pre-authorisation pipeline, and has hands-on experience building and evaluating AI product prototypes.',
      appliesTo: ['AI experience', 'ML experience', 'LLM product experience', 'AI product management', 'OCR and NER', 'building AI products'],
      evidence: ['Resume · Bajaj — AI automation', 'Resume · Skills — AI product practice', 'Project · Mira architecture'],
      answer: 'Yes. Prerna shipped an OCR + NER insurance pre-authorisation pipeline that raised throughput 26% and saved ₹17L annually, and she has hands-on experience building and evaluating AI product prototypes.',
      contrast: 'It would be inaccurate to say she has no AI/ML experience. Her documented work includes OCR and NER automation plus hands-on AI prototyping, retrieval, prompting, guardrails, and evaluations.',
      affirmExamples: ['Does she have AI experience?', 'Has she worked with machine learning?', 'Has Prerna built AI products?', 'What is her AI PM experience?', 'Does she understand LLM products?'],
      negateExamples: ['Has she never worked on AI?', 'Does she lack ML exposure?', 'Does she have no AI background?', 'Has she never built an AI product?', 'Is she inexperienced with LLM products?'],
      casualExamples: ['ai ml exp?', 'has pren bilt ai stuff?', 'she know llms?'],
      hardNegatives: ['Which AI model answers Mira?', 'What is machine learning?', 'Is Gemini better than Qwen?']
    },
    {
      id: 'cross_functional_collaboration',
      source: 'Profile · Collaboration',
      status: 'approved',
      claim: 'Prerna works across design, engineering, operations, and commercial teams and has documented examples of resolving disagreement and securing senior stakeholder alignment.',
      appliesTo: ['collaboration', 'stakeholder management', 'cross-functional work', 'handling disagreement', 'influencing leaders', 'working with design and engineering'],
      evidence: ['Interview prep · Stakeholder disagreement', 'Interview prep · Senior stakeholder buy-in', 'Portfolio overview'],
      answer: 'Prerna works across design, engineering, operations, and commercial teams. Her documented examples show her testing disagreements, adjusting solutions, and aligning stakeholders around customer and business outcomes.',
      contrast: 'Her documented work does not support describing her as unable to collaborate. It includes resolving a design disagreement and earning operations leadership’s support by addressing the underlying constraint.',
      affirmExamples: ['How does she work with other teams?', 'Is she collaborative?', 'Can she manage stakeholders?', 'How does she handle disagreement?', 'Does she influence senior leaders?'],
      negateExamples: ['Is she difficult to work with?', 'Does she work badly with designers?', 'Can’t she align stakeholders?', 'Does she struggle cross-functionally?', 'Is she unable to handle disagreement?'],
      casualExamples: ['good w stakeholders?', 'team player or nah?', 'can pren handle disagreements?'],
      hardNegatives: ['Which teams exist at Lenskart?', 'Who designed this portfolio?', 'Does Mira support team accounts?']
    },
    {
      id: 'commercial_impact',
      source: 'Profile · Commercial impact',
      status: 'approved',
      claim: 'Prerna’s documented product work includes measurable revenue, adoption, conversion, customer-experience, and operational outcomes at Lenskart and Bajaj Finserv Health.',
      appliesTo: ['commercial impact', 'business outcomes', 'measurable results', 'revenue impact', 'adoption outcomes', 'why interview her'],
      evidence: ['Work · Lenskart impact', 'Work · Bajaj Finserv Health impact', 'Resume · Professional summary'],
      answer: 'Prerna’s documented impact includes ₹6Cr+ in annualised impact at Lenskart, a ₹28L 0→1 wellness business, 8x Health Files adoption, and measurable conversion, customer-experience, and operational improvements.',
      contrast: 'Her documented record does not support saying she lacks measurable impact. It includes revenue, adoption, conversion, customer-experience, and operational outcomes across Lenskart and Bajaj Finserv Health.',
      affirmExamples: ['What impact has she delivered?', 'Does she drive business outcomes?', 'Show me her measurable results.', 'Has her work made money?', 'What value has she created?'],
      negateExamples: ['Has she had no real impact?', 'Are her results all fluff?', 'Does she lack commercial outcomes?', 'Has her work failed to produce measurable results?', 'Does she have no business impact?'],
      casualExamples: ['any biz impact?', 'did her work do nything?', 'results real or fluff?'],
      hardNegatives: ['Is Lenskart profitable?', 'What is Bajaj’s revenue?', 'How much does Prerna earn?']
    },
    {
      id: 'professional_strengths',
      source: 'Profile · Professional strengths',
      status: 'approved',
      claim: 'Prerna’s documented strengths include energy, persistence, comfort with ambiguity, evidence-led problem solving, and sustained ownership through iteration.',
      appliesTo: ['strengths', 'strongest qualities', 'professional qualities', 'what she brings to a team', 'high agency'],
      evidence: ['Profile · Pace and ambiguity', 'Profile · Work style'],
      answer: 'Prerna’s work suggests energy and persistence, especially in ambiguous problems. She looks for evidence, turns insights into focused experiments, and stays involved through iteration.',
      contrast: 'Her documented work does not support describing her as passive or easily discouraged. It shows persistence, evidence-led problem solving, and continued ownership through iteration.',
      affirmExamples: ['What are her strengths?', 'What is she strongest at?', 'What does she bring to the table?', 'Does she have high agency?'],
      negateExamples: ['Is she passive at work?', 'Does she give up easily?', 'Does she lack ownership?'],
      casualExamples: ['whts pren strongest at?', 'what does she bring tho?'],
      hardNegatives: ['How strong is she at the gym?', 'What is her strongest programming language?']
    },
    {
      id: 'product_motivation',
      source: 'Profile · Product motivation',
      status: 'approved',
      claim: 'Prerna is motivated by continuous growth and by hearing how customers experience products she helped build; positive and critical feedback both inform improvement.',
      appliesTo: ['motivation', 'what drives her', 'why product management', 'customer feedback', 'continuous learning'],
      evidence: ['Profile · Product motivation'],
      answer: 'Prerna is motivated by continuing to grow as a person and PM, and by hearing how customers experience products she helped build. Positive or critical, feedback helps her improve the next version.',
      contrast: 'Her stated motivation is not limited to shipping features. She values continuous growth and customer feedback because both help her improve the product and her own practice.',
      affirmExamples: ['What motivates her as a PM?', 'What drives Prerna?', 'Why does she enjoy product management?'],
      negateExamples: ['Is she motivated only by shipping?', 'Does customer feedback not matter to her?'],
      casualExamples: ['what keeps pren going?', 'why pm for her?'],
      hardNegatives: ['What motivates customers to buy eyewear?', 'What is dopamine?']
    },
    {
      id: 'personal_interests',
      source: 'Profile · Personal interests',
      status: 'approved',
      claim: 'Outside work, Prerna enjoys strength training, playing the drums, solo travel, meeting people, learning from different perspectives, and discussing dopamine detox.',
      appliesTo: ['hobbies', 'free time', 'personal interests', 'topics she enjoys discussing', 'outside work'],
      evidence: ['Profile · Hobbies', 'Profile · Dopamine detox'],
      answer: 'Outside work, Prerna lifts weights, plays the drums, and sometimes travels solo to meet people and gain new perspectives. She also enjoys discussing dopamine detox and how it changed her relationship with focus.',
      contrast: 'Her interests are not limited to work: she lifts weights, plays the drums, travels solo, meets new people, and enjoys discussing dopamine detox and focus.',
      affirmExamples: ['What are her hobbies?', 'What does she do in her free time?', 'What topics does Prerna enjoy talking about?', 'What does she do when she logs off?'],
      negateExamples: ['Does she have no interests outside work?'],
      casualExamples: ['what she do off work?', 'hobbies n stuff?'],
      hardNegatives: ['What hobbies should I try?', 'What does the bot do when it logs off?']
    }
  ];

  root.MIRA_APPROVED_FACTS = facts;
})(typeof window !== 'undefined' ? window : globalThis);
