import { pipeline } from 'https://cdn.jsdelivr.net/npm/@huggingface/transformers@4.3.0';

const MODEL_ID = 'onnx-community/Qwen2.5-0.5B-Instruct';
let generatorPromise;

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
  const { id, question, approvedAnswer, retrievedContext } = event.data || {};
  if (!id || !question || !approvedAnswer) return;

  try {
    const generator = await getGenerator();
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
          'Keep the answer natural, specific, and concise. Use two or three sentences and no more than 75 words.',
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
      max_new_tokens: 110,
      do_sample: false,
      repetition_penalty: 1.08
    });
    const answer = output?.[0]?.generated_text?.at?.(-1)?.content?.trim();
    if (!answer) throw new Error('The model returned an empty answer.');
    self.postMessage({ type: 'result', id, answer });
  } catch (error) {
    self.postMessage({ type: 'error', id, message: error?.message || 'Generation failed.' });
  }
});
