const fs = require('fs/promises');
const os = require('os');
const path = require('path');
const { execFile } = require('child_process');

const FineTuneExample = require('../models/FineTuneExample');
const createError = require('../utils/createError');

const PROVIDER_ID = 'huggingface';
const PROVIDER_NAME = 'Hugging Face Llama Fine-tuning';
const BASE_MODEL_OPTIONS = [
  { id: 'meta-llama/Llama-3.2-3B-Instruct', name: 'Llama 3.2 3B Instruct', default: true },
  { id: 'meta-llama/Llama-3.1-8B-Instruct', name: 'Llama 3.1 8B Instruct' },
  { id: 'meta-llama/Llama-3.2-1B-Instruct', name: 'Llama 3.2 1B Instruct' },
];

let cachedUserName = '';

function parseModelList(value) {
  return Array.from(new Set(String(value || '').split(',').map((item) => item.trim()).filter(Boolean)));
}

function getToken() {
  return String(process.env.HUGGINGFACE_TOKEN || process.env.HF_TOKEN || '').trim();
}

function getSpaceHardware() {
  return String(process.env.HUGGINGFACE_SPACE_HARDWARE || process.env.HF_SPACE_HARDWARE || '').trim();
}

function isReady() {
  return Boolean(getToken() && getSpaceHardware() && typeof fetch === 'function');
}

function getConfiguredBaseModels() {
  const configured = parseModelList(process.env.HF_FINE_TUNE_BASE_MODELS || process.env.HUGGINGFACE_FINE_TUNE_BASE_MODELS);
  return configured.length > 0 ? configured : BASE_MODEL_OPTIONS.map((model) => model.id);
}

function getBaseModelOptions() {
  const configured = getConfiguredBaseModels();
  return configured.map((id, index) => {
    const option = BASE_MODEL_OPTIONS.find((model) => model.id === id);
    return { id, name: option?.name || id, default: index === 0 || option?.default === true };
  });
}

function ensureConfigured() {
  if (!getToken()) throw createError(503, 'Hugging Face fine-tuning needs HUGGINGFACE_TOKEN or HF_TOKEN.');
  if (!getSpaceHardware()) throw createError(503, 'Hugging Face Llama fine-tuning needs HUGGINGFACE_SPACE_HARDWARE or HF_SPACE_HARDWARE so the trainer Space has a GPU.');
  if (typeof fetch !== 'function') throw createError(500, 'Current Node.js runtime does not support fetch.');
}

function ensureBaseModelAllowed(baseModel) {
  const configuredModels = getConfiguredBaseModels();
  if (!configuredModels.includes(baseModel)) {
    throw createError(400, `Base model ${baseModel} is not configured for Hugging Face fine-tuning. Use one of: ${configuredModels.join(', ')}.`, undefined, { configuredModels });
  }
}

function sanitizeToken(value) {
  const token = getToken();
  return token ? String(value || '').replaceAll(token, '***') : String(value || '');
}

async function readResponse(response) {
  const text = await response.text().catch(() => '');
  if (!text) return {};
  try { return JSON.parse(text); } catch { return { message: text.slice(0, 500) }; }
}

function summarizeResponse(data) {
  const message = data?.error || data?.message || data?.detail;
  return typeof message === 'string' ? message : JSON.stringify(message || data || {}).slice(0, 500);
}

async function hfRequest(pathname, options = {}, fallbackMessage = 'Hugging Face request failed') {
  ensureConfigured();
  const response = await fetch(`https://huggingface.co${pathname}`, {
    method: options.method || 'GET',
    headers: {
      Authorization: `Bearer ${getToken()}`,
      ...(options.body ? { 'Content-Type': 'application/json' } : {}),
      ...(options.headers || {}),
    },
    body: options.body ? JSON.stringify(options.body) : undefined,
  });
  const data = await readResponse(response);
  if (!response.ok) {
    const message = summarizeResponse(data);
    if (response.status === 402 && fallbackMessage.includes('space repo creation')) {
      throw createError(
        402,
        'Hugging Face GPU Space requires prepaid billing credits. Add credits in Hugging Face billing, or use the free Kaggle/Colab notebook pack instead of the in-app Hugging Face Space provider.',
        undefined,
        data,
      );
    }
    throw createError(response.status, message ? `${fallbackMessage} (${response.status}): ${message}` : `${fallbackMessage} (${response.status})`, undefined, data);
  }
  return data;
}

async function getUserName() {
  if (cachedUserName) return cachedUserName;
  const data = await hfRequest('/api/whoami-v2', {}, 'Hugging Face token validation failed');
  cachedUserName = data.name || data.user?.name || '';
  if (!cachedUserName) throw createError(503, 'Could not determine Hugging Face username from token. Set HUGGINGFACE_NAMESPACE.');
  return cachedUserName;
}

async function getNamespace() {
  return String(process.env.HUGGINGFACE_NAMESPACE || process.env.HF_NAMESPACE || '').trim() || getUserName();
}

function encodeRepoPath(repoId) {
  return repoId.split('/').map(encodeURIComponent).join('/');
}

async function createRepo(repoId, repoType, options = {}) {
  const [namespace, ...nameParts] = repoId.split('/');
  const owner = await getUserName();
  const name = nameParts.join('/');
  const body = {
    name,
    type: repoType,
    private: options.private !== false,
    ...(repoType === 'space' ? {
      sdk: 'docker',
      ...(getSpaceHardware() ? { hardware: getSpaceHardware() } : {}),
    } : {}),
  };
  if (namespace && namespace !== owner) body.organization = namespace;
  try {
    await hfRequest('/api/repos/create', { method: 'POST', body }, `Hugging Face ${repoType} repo creation failed`);
  } catch (error) {
    if (error.statusCode !== 409) throw error;
  }
}

async function addSpaceSecret(spaceRepoId, key, value) {
  await hfRequest(`/api/spaces/${encodeRepoPath(spaceRepoId)}/secrets`, { method: 'POST', body: { key, value } }, `Hugging Face Space secret ${key} setup failed`);
}

function gitRemoteUrl(repoId, repoType) {
  const prefix = repoType === 'space' ? 'spaces/' : repoType === 'dataset' ? 'datasets/' : '';
  return `https://oauth2:${encodeURIComponent(getToken())}@huggingface.co/${prefix}${repoId}`;
}

function execFileAsync(command, args, options = {}) {
  return new Promise((resolve, reject) => {
    execFile(command, args, { ...options, windowsHide: true, timeout: options.timeout || 120000 }, (error, stdout, stderr) => {
      if (error) {
        error.message = sanitizeToken(`${error.message}\n${stderr || ''}`);
        reject(error);
        return;
      }
      resolve({ stdout, stderr });
    });
  });
}

async function writeFiles(rootDir, files) {
  await Promise.all(Object.entries(files).map(async ([relativePath, content]) => {
    const target = path.join(rootDir, ...relativePath.split('/'));
    await fs.mkdir(path.dirname(target), { recursive: true });
    await fs.writeFile(target, content, 'utf8');
  }));
}

async function pushFiles(repoId, repoType, files, message) {
  const tempDir = await fs.mkdtemp(path.join(os.tmpdir(), 'copypro-hf-'));
  try {
    await writeFiles(tempDir, files);
    await execFileAsync('git', ['init'], { cwd: tempDir });
    await execFileAsync('git', ['config', 'user.email', 'copypro-ai@local'], { cwd: tempDir });
    await execFileAsync('git', ['config', 'user.name', 'CopyPro AI'], { cwd: tempDir });
    await execFileAsync('git', ['add', '.'], { cwd: tempDir });
    await execFileAsync('git', ['commit', '-m', message], { cwd: tempDir });
    await execFileAsync('git', ['branch', '-M', 'main'], { cwd: tempDir });
    await execFileAsync('git', ['remote', 'add', 'origin', gitRemoteUrl(repoId, repoType)], { cwd: tempDir });
    await execFileAsync('git', ['push', '-u', 'origin', 'main', '--force'], { cwd: tempDir, timeout: 300000 });
  } finally {
    await fs.rm(tempDir, { recursive: true, force: true }).catch(() => {});
  }
}

function slugify(value) {
  return String(value || '').toLowerCase().normalize('NFD').replace(/[\u0300-\u036f]/g, '').replace(/[^a-z0-9]+/g, '-').replace(/^-+|-+$/g, '').slice(0, 80) || 'fine-tune';
}

function buildDatasetJsonl(examples) {
  return `${examples.map((example) => JSON.stringify({
    messages: [
      { role: 'system', content: 'You are a senior Vietnamese marketing copywriter. Follow the user brief and write clear, conversion-focused copy.' },
      { role: 'user', content: example.inputText },
      { role: 'assistant', content: example.outputText },
    ],
  })).join('\n')}\n`;
}

function buildDatasetFiles(job, examples) {
  return {
    'README.md': [`# ${job.name} fine-tuning dataset`, '', `Base model: ${job.baseModel}`, `Examples: ${examples.length}`, ''].join('\n'),
    'train.jsonl': buildDatasetJsonl(examples),
  };
}

function buildTrainingScript(config) {
  const serialized = JSON.stringify(config, null, 2);
  return `import json\nimport os\nimport traceback\nfrom http.server import BaseHTTPRequestHandler, HTTPServer\n\nimport torch\nfrom datasets import load_dataset\nfrom huggingface_hub import HfApi\nfrom peft import LoraConfig\nfrom transformers import AutoModelForCausalLM, AutoTokenizer, BitsAndBytesConfig, TrainingArguments\nfrom trl import SFTTrainer\n\nCONFIG = ${serialized}\nHF_TOKEN = os.environ.get('HF_TOKEN') or os.environ.get('HUGGINGFACE_TOKEN')\nSTATUS = {'status': 'running', 'progress': 10, 'output_model_repo_id': CONFIG['output_model_repo_id'], 'history': []}\napi = HfApi(token=HF_TOKEN)\n\ndef update_status(status=None, progress=None, message=None, error=None):\n    if status:\n        STATUS['status'] = status\n    if progress is not None:\n        STATUS['progress'] = int(progress)\n    if message:\n        STATUS.setdefault('history', []).append(message)\n    if error:\n        STATUS['error'] = error\n    payload = json.dumps(STATUS, ensure_ascii=False, indent=2).encode('utf-8')\n    try:\n        api.upload_file(path_or_fileobj=payload, path_in_repo='status.json', repo_id=CONFIG['space_repo_id'], repo_type='space', token=HF_TOKEN)\n    except Exception as exc:\n        print('status upload failed:', exc)\n    print(json.dumps(STATUS, ensure_ascii=False))\n\ndef train():\n    if not HF_TOKEN:\n        raise RuntimeError('HF_TOKEN Space secret is missing')\n    if not torch.cuda.is_available():\n        raise RuntimeError('Hugging Face Space needs GPU hardware for Llama LoRA fine-tuning. Set HUGGINGFACE_SPACE_HARDWARE/HF_SPACE_HARDWARE or upgrade the Space hardware in Hugging Face.')\n    update_status('running', 15, 'Loading dataset')\n    dataset = load_dataset(CONFIG['dataset_repo_id'], split='train', token=HF_TOKEN)\n    update_status('running', 25, 'Loading tokenizer and base model')\n    tokenizer = AutoTokenizer.from_pretrained(CONFIG['base_model'], token=HF_TOKEN, use_fast=True)\n    if tokenizer.pad_token is None:\n        tokenizer.pad_token = tokenizer.eos_token\n    def format_example(example):\n        try:\n            return tokenizer.apply_chat_template(example['messages'], tokenize=False, add_generation_prompt=False)\n        except Exception:\n            return '\\n'.join([f"{item.get('role', 'user')}: {item.get('content', '')}" for item in example['messages']])\n    dataset = dataset.map(lambda item: {'text': format_example(item)}, remove_columns=dataset.column_names)\n    bnb = BitsAndBytesConfig(load_in_4bit=True, bnb_4bit_quant_type='nf4', bnb_4bit_compute_dtype=torch.bfloat16)\n    model = AutoModelForCausalLM.from_pretrained(CONFIG['base_model'], token=HF_TOKEN, device_map='auto', quantization_config=bnb)\n    model.config.use_cache = False\n    update_status('running', 45, 'Starting LoRA SFT')\n    peft_config = LoraConfig(r=16, lora_alpha=32, lora_dropout=0.05, bias='none', task_type='CAUSAL_LM', target_modules=['q_proj', 'k_proj', 'v_proj', 'o_proj', 'gate_proj', 'up_proj', 'down_proj'])\n    args = TrainingArguments(output_dir='/tmp/copypro-hf-output', num_train_epochs=CONFIG['epochs'], per_device_train_batch_size=1, gradient_accumulation_steps=8, learning_rate=2e-4, logging_steps=5, save_strategy='epoch', bf16=True, report_to=[])\n    trainer = SFTTrainer(model=model, tokenizer=tokenizer, train_dataset=dataset, dataset_text_field='text', max_seq_length=2048, peft_config=peft_config, args=args)\n    trainer.train()\n    update_status('running', 85, 'Pushing LoRA adapter')\n    api.create_repo(repo_id=CONFIG['output_model_repo_id'], repo_type='model', private=True, exist_ok=True, token=HF_TOKEN)\n    trainer.model.push_to_hub(CONFIG['output_model_repo_id'], token=HF_TOKEN, private=True)\n    tokenizer.push_to_hub(CONFIG['output_model_repo_id'], token=HF_TOKEN, private=True)\n    update_status('completed', 100, 'Training completed')\n\nclass Handler(BaseHTTPRequestHandler):\n    def do_GET(self):\n        body = json.dumps(STATUS, ensure_ascii=False).encode('utf-8')\n        self.send_response(200)\n        self.send_header('Content-Type', 'application/json; charset=utf-8')\n        self.send_header('Content-Length', str(len(body)))\n        self.end_headers()\n        self.wfile.write(body)\n\ntry:\n    train()\nexcept Exception as exc:\n    update_status('failed', STATUS.get('progress', 0), 'Training failed', ''.join(traceback.format_exception_only(type(exc), exc)).strip())\n\nHTTPServer(('0.0.0.0', 7860), Handler).serve_forever()\n`;
}

function buildSpaceFiles(config) {
  return {
    'README.md': ['---', `title: ${config.job_name} Trainer`, 'sdk: docker', 'app_port: 7860', '---', '', 'Generated by CopyPro AI.'].join('\n'),
    'Dockerfile': ['FROM pytorch/pytorch:2.4.1-cuda12.1-cudnn9-runtime', 'WORKDIR /app', 'RUN apt-get update && apt-get install -y git && rm -rf /var/lib/apt/lists/*', 'COPY requirements.txt .', 'RUN pip install --no-cache-dir -r requirements.txt', 'COPY train.py .', 'CMD ["python", "train.py"]', ''].join('\n'),
    'requirements.txt': ['accelerate>=0.34.0', 'bitsandbytes>=0.43.3', 'datasets>=2.21.0', 'huggingface_hub>=0.24.6', 'peft>=0.12.0', 'safetensors>=0.4.4', 'torch>=2.4.0', 'transformers>=4.44.2', 'trl>=0.10.1', ''].join('\n'),
    'status.json': JSON.stringify({ status: 'queued', progress: 5, output_model_repo_id: config.output_model_repo_id, history: ['Space files created'] }, null, 2),
    'train.py': buildTrainingScript(config),
  };
}

async function submitJob(job) {
  ensureConfigured();
  ensureBaseModelAllowed(job.baseModel);
  const examples = await FineTuneExample.find({ datasetId: job.datasetId, userId: job.userId, isValid: true }).sort({ createdAt: 1 });
  const namespace = await getNamespace();
  const alias = `${slugify(job.name)}-${job._id.toString().slice(-6)}`;
  const datasetRepoId = `${namespace}/${alias}-dataset`;
  const outputModelRepoId = `${namespace}/${alias}-lora`;
  const spaceRepoId = `${namespace}/${alias}-trainer`;
  const config = {
    job_name: job.name,
    base_model: job.baseModel,
    epochs: Math.max(1, Number(job.epochs || 3)),
    dataset_repo_id: datasetRepoId,
    output_model_repo_id: outputModelRepoId,
    space_repo_id: spaceRepoId,
  };

  await createRepo(datasetRepoId, 'dataset', { private: true });
  await createRepo(outputModelRepoId, 'model', { private: true });
  await createRepo(spaceRepoId, 'space', { private: true });
  await pushFiles(datasetRepoId, 'dataset', buildDatasetFiles(job, examples), 'Add CopyPro fine-tuning dataset');
  await addSpaceSecret(spaceRepoId, 'HF_TOKEN', getToken());
  await pushFiles(spaceRepoId, 'space', buildSpaceFiles(config), 'Add CopyPro trainer Space');

  job.providerJobId = spaceRepoId;
  job.datasetUrl = `https://huggingface.co/datasets/${datasetRepoId}`;
  job.fineTunedModelId = outputModelRepoId;
  job.status = 'queued';
  job.progress = 10;
  job.startedAt = job.startedAt || new Date();
  job.errorMessage = '';
  await job.save();
  return job;
}

async function getSpaceStatus(job) {
  if (!job.providerJobId) return null;
  const response = await fetch(`https://huggingface.co/spaces/${encodeRepoPath(job.providerJobId)}/resolve/main/status.json?cache_bust=${Date.now()}`, {
    headers: { Authorization: `Bearer ${getToken()}` },
  });
  if (!response.ok) return null;
  return response.json().catch(() => null);
}

async function syncJob(job, clampProgress) {
  if (job.provider !== PROVIDER_ID || !job.providerJobId) return job;
  const status = await getSpaceStatus(job);
  if (!status) return job;
  const normalized = String(status.status || '').toLowerCase();
  if (normalized === 'completed') job.status = 'completed';
  else if (normalized === 'failed') job.status = 'failed';
  else if (normalized === 'running') job.status = 'running';
  else job.status = 'queued';
  job.progress = clampProgress(status.progress ?? job.progress, job.progress || 0);
  job.fineTunedModelId = status.output_model_repo_id || job.fineTunedModelId || '';
  job.errorMessage = status.error || '';
  if (['completed', 'failed', 'cancelled'].includes(job.status)) job.finishedAt = job.finishedAt || new Date();
  if (['running', 'completed'].includes(job.status)) job.startedAt = job.startedAt || job.createdAt || new Date();
  await job.save();
  return job;
}

async function getLogs(job) {
  const status = await getSpaceStatus(job);
  const history = Array.isArray(status?.history) ? status.history : [];
  if (history.length === 0) return [];
  return history.map((step, index) => ({ step, status: index === history.length - 1 && job.status === 'running' ? 'running' : 'done', time: job.updatedAt || job.createdAt }));
}

module.exports = {
  PROVIDER_ID,
  PROVIDER_NAME,
  getToken,
  isReady,
  getBaseModelOptions,
  getSpaceHardware,
  ensureConfigured,
  ensureBaseModelAllowed,
  submitJob,
  syncJob,
  getLogs,
};
