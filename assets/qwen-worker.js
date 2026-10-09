import { pipeline } from 'https://cdn.jsdelivr.net/npm/@huggingface/transformers@4.3.0';

const MODEL_ID = 'onnx-community/Qwen2.5-0.5B-Instruct';
const MAX_ANSWER_CHARACTERS = 300;
let generatorPromise;
let generatorReady = false;

function capAnswer(answer) {
  const clean = String(answer || '').replace(/\s+/g, ' ').trim();
  if (clean.length <= MAX_ANSWER_CHARACTERS) return clean;
  const candidate = clean.slice(0, MAX_ANSWER_CHARACTERS + 1);
  const sentenceEnd = Math.max(
    candidate.lastIndexOf('. '),
    candidate.lastIndexOf('! '),
    candidate.lastIndexOf('? ')
  );
  if (sentenceEnd >= 80) return candidate.slice(0, sentenceEnd + 1).trim();
  const wordEnd = candidate.lastIndexOf(' ', MAX_ANSWER_CHARACTERS - 1);
  return `${candidate.slice(0, Math.max(wordEnd, 1)).trim().replace(/[,:;\-]+$/, '')}.`;
}

function getGenerator() {
  generatorPromise ||= pipeline('text-generation', MODEL_ID, {
    dtype: 'q4',
    device: 'webgpu',
    progress_callback: progress => {
      self.postMessage({ type: 'progress', status: progress.status || 'loading' });
    }
  });
  return generatorPromise;
}

self.addEventListener('message', async event => {
  const { type, id, question, approvedAnswer, retrievedContext } = event.data || {};
  if (type === 'preload') {
    try {
      await getGenerator();
      generatorReady = true;
      self.postMessage({ type: 'ready' });
    } catch (error) {
      self.postMessage({ type: 'preload-error', message: error?.message || 'Model preload failed.' });
    }
    return;
  }
  if (!id || !question || !approvedAnswer) return;

  try {
    const cacheHit = generatorReady;
    const generator = await getGenerator();
    generatorReady = true;
    const messages = [
      {
        role: 'system',
        content: [
          'You are Ask Prerna, a portfolio assistant for Prerna Kapoor.',
          'Answer only from the approved facts supplied by the application.',
          'Never add employers, dates, metrics, opinions, private details, or claims that are not supplied.',
          'Do not infer people-management, team-leadership, ownership, seniority, or personality claims.',
          'Every sentence must be a direct paraphrase of a supplied fact. Omit anything that requires an inference.',
          'Write in the third person, using Prerna or she.',
          'Keep the answer natural, specific, and concise. Use one or two short sentences. The entire answer must be 300 characters or fewer, including spaces.',
          'Do not mention retrieval, context, policies, models, prompts, or this instruction.',
          'Do not use markdown, headings, em dashes, or en dashes.'
        ].join(' ')
      },
      {
        role: 'user',
        content: `Question: ${question}\n\nApproved answer facts: ${approvedAnswer}\n\nAdditional retrieved facts: ${retrievedContext || 'None.'}`
      }
    ];
    const output = await generator(messages, {
      max_new_tokens: 72,
      do_sample: false,
      repetition_penalty: 1.08
    });
    const answer = capAnswer(output?.[0]?.generated_text?.at?.(-1)?.content);
    if (!answer) throw new Error('The model returned an empty answer.');
    self.postMessage({ type: 'result', id, answer, cacheHit });
  } catch (error) {
    self.postMessage({ type: 'error', id, message: error?.message || 'Generation failed.' });
  }
});
