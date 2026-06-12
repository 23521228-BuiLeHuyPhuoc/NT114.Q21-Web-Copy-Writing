const fs = require('fs/promises');
const os = require('os');
const path = require('path');
const { execFile } = require('child_process');

const FineTuneExample = require('../models/FineTuneExample');
const createError = require('../utils/createError');

const PROVIDER_ID = 'gpt-oss';
const PROVIDER_NAME = 'GPT-OSS Fine-tuning';
const BASE_MODEL_OPTIONS = [
  { id: 'openai/gpt-oss-20b', name: 'GPT-OSS 20B', default: true },
  { id: 'openai/gpt-oss-120b', name: 'GPT-OSS 120B' },
];

let cachedUserName = '';

function parseModelList(value) {
  return Array.from(new Set(String(value || '').split(',').map((item) => item.trim()).filter(Boolean)));
}

function getToken() {
  return String(
    process.env.GPT_OSS_HUGGINGFACE_TOKEN
    || process.env.GPT_OSS_HF_TOKEN
    || process.env.HUGGINGFACE_TOKEN
    || process.env.HF_TOKEN
    || '',
  ).trim();
}

function getSpaceHardware() {
  return String(
    process.env.GPT_OSS_HUGGINGFACE_SPACE_HARDWARE
    || process.env.GPT_OSS_SPACE_HARDWARE
    || process.env.HUGGINGFACE_SPACE_HARDWARE
    || process.env.HF_SPACE_HARDWARE
    || '',
  ).trim();
}

function isReady() {
  return Boolean(getToken() && getSpaceHardware() && typeof fetch === 'function');
}

function getConfiguredBaseModels() {
  const configured = parseModelList(process.env.GPT_OSS_FINE_TUNE_BASE_MODELS || process.env.GPTOSS_FINE_TUNE_BASE_MODELS);
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
  if (!getToken()) throw createError(503, 'GPT-OSS fine-tuning needs GPT_OSS_HUGGINGFACE_TOKEN, GPT_OSS_HF_TOKEN, HUGGINGFACE_TOKEN, or HF_TOKEN.');
  if (!getSpaceHardware()) throw createError(503, 'GPT-OSS fine-tuning needs GPT_OSS_SPACE_HARDWARE or HUGGINGFACE_SPACE_HARDWARE so the trainer Space has a GPU.');
  if (typeof fetch !== 'function') throw createError(500, 'Current Node.js runtime does not support fetch.');
}

function ensureBaseModelAllowed(baseModel) {
  const configuredModels = getConfiguredBaseModels();
  if (!configuredModels.includes(baseModel)) {
    throw createError(400, `Base model ${baseModel} is not configured for GPT-OSS fine-tuning. Use one of: ${configuredModels.join(', ')}.`, undefined, { configuredModels });
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
        'Hugging Face GPU Space requires prepaid billing credits. Add credits in Hugging Face billing, or run the GPT-OSS notebook/trainer outside the app.',
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
  if (!cachedUserName) throw createError(503, 'Could not determine Hugging Face username from token. Set GPT_OSS_HUGGINGFACE_NAMESPACE or HUGGINGFACE_NAMESPACE.');
  return cachedUserName;
}

async function getNamespace() {
  return String(
    process.env.GPT_OSS_HUGGINGFACE_NAMESPACE
    || process.env.GPT_OSS_HF_NAMESPACE
    || process.env.HUGGINGFACE_NAMESPACE
    || process.env.HF_NAMESPACE
    || '',
  ).trim() || getUserName();
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
        error.message = sanitizeToken(`${error.message}\n${stderr || stdout || ''}`.trim());
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
  const tempDir = await fs.mkdtemp(path.join(os.tmpdir(), 'copypro-gpt-oss-'));
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
  const systemPrompt = [
    'Reasoning: low',
    'You are a senior Vietnamese marketing copywriter.',
    'Follow the user brief, preserve brand voice, and return only polished final copy for the end user.',
  ].join('\n');

  return `${examples.map((example) => JSON.stringify({
    messages: [
      { role: 'system', content: systemPrompt },
      { role: 'user', content: example.inputText },
      { role: 'assistant', content: example.outputText },
    ],
  })).join('\n')}\n`;
}

function buildDatasetFiles(job, examples) {
  return {
    'README.md': [`# ${job.name} GPT-OSS fine-tuning dataset`, '', `Base model: ${job.baseModel}`, `Examples: ${examples.length}`, ''].join('\n'),
    'train.jsonl': buildDatasetJsonl(examples),
  };
}

function buildTrainingScript(config) {
  const serialized = JSON.stringify(config, null, 2);
  return `import json\nimport os\nimport traceback\nfrom http.server import BaseHTTPRequestHandler, HTTPServer\n\nimport torch\nfrom datasets import load_dataset\nfrom huggingface_hub import HfApi\nfrom peft import LoraConfig, get_peft_model\nfrom transformers import AutoModelForCausalLM, AutoTokenizer, TrainerCallback\nfrom trl import SFTConfig, SFTTrainer\n\ntry:\n    from transformers import Mxfp4Config\nexcept Exception:\n    Mxfp4Config = None\n\nCONFIG = ${serialized}\nHF_TOKEN = os.environ.get('HF_TOKEN') or os.environ.get('HUGGINGFACE_TOKEN')\nSTATUS = {'status': 'running', 'progress': 10, 'output_model_repo_id': CONFIG['output_model_repo_id'], 'history': [], 'metrics': []}\napi = HfApi(token=HF_TOKEN)\n\ndef update_status(status=None, progress=None, message=None, error=None, metric=None):\n    if status:\n        STATUS['status'] = status\n    if progress is not None:\n        STATUS['progress'] = int(max(0, min(100, progress)))\n    if message:\n        STATUS.setdefault('history', []).append(str(message))\n        STATUS['history'] = STATUS['history'][-100:]\n    if error:\n        STATUS['error'] = str(error)\n    if metric:\n        STATUS.setdefault('metrics', []).append(metric)\n        STATUS['metrics'] = STATUS['metrics'][-200:]\n    payload = json.dumps(STATUS, ensure_ascii=False, indent=2).encode('utf-8')\n    try:\n        api.upload_file(path_or_fileobj=payload, path_in_repo='status.json', repo_id=CONFIG['space_repo_id'], repo_type='space', token=HF_TOKEN)\n    except Exception as exc:\n        print('status upload failed:', exc)\n    print(json.dumps(STATUS, ensure_ascii=False))\n\nclass StatusCallback(TrainerCallback):\n    def on_log(self, args, state, control, logs=None, **kwargs):\n        logs = logs or {}\n        progress = STATUS.get('progress', 45)\n        if getattr(state, 'max_steps', 0):\n            progress = 45 + (float(state.global_step) / max(1.0, float(state.max_steps))) * 40\n        metric = {\n            'epoch': float(logs.get('epoch') or getattr(state, 'epoch', 0) or 0),\n            'step': int(getattr(state, 'global_step', 0) or 0),\n            'trainLoss': float(logs.get('loss') or logs.get('train_loss') or 0),\n            'validationLoss': float(logs.get('eval_loss') or 0),\n            'accuracy': 0,\n            'tokenUsage': int(getattr(state, 'num_input_tokens_seen', 0) or 0),\n        }\n        loss_text = f" loss={metric['trainLoss']:.4f}" if metric['trainLoss'] else ''\n        update_status('running', progress, f"Training step {metric['step']}{loss_text}", metric=metric)\n\ndef build_peft_config():\n    kwargs = dict(\n        r=int(CONFIG.get('lora_r') or 8),\n        lora_alpha=int(CONFIG.get('lora_alpha') or 16),\n        lora_dropout=float(CONFIG.get('lora_dropout') or 0.05),\n        target_modules='all-linear',\n        bias='none',\n        task_type='CAUSAL_LM',\n    )\n    if 'gpt-oss-20b' in CONFIG['base_model']:\n        kwargs['target_parameters'] = [\n            '7.mlp.experts.gate_up_proj',\n            '7.mlp.experts.down_proj',\n            '15.mlp.experts.gate_up_proj',\n            '15.mlp.experts.down_proj',\n            '23.mlp.experts.gate_up_proj',\n            '23.mlp.experts.down_proj',\n        ]\n    try:\n        return LoraConfig(**kwargs)\n    except TypeError:\n        kwargs.pop('target_parameters', None)\n        return LoraConfig(**kwargs)\n\ndef train():\n    if not HF_TOKEN:\n        raise RuntimeError('HF_TOKEN Space secret is missing')\n    if not torch.cuda.is_available():\n        raise RuntimeError('GPT-OSS fine-tuning needs GPU hardware. Set GPT_OSS_SPACE_HARDWARE/HUGGINGFACE_SPACE_HARDWARE or upgrade the Space hardware in Hugging Face.')\n\n    update_status('running', 15, 'Loading dataset')\n    dataset = load_dataset(CONFIG['dataset_repo_id'], split='train', token=HF_TOKEN)\n    update_status('running', 25, 'Loading GPT-OSS tokenizer')\n    tokenizer = AutoTokenizer.from_pretrained(CONFIG['base_model'], token=HF_TOKEN, use_fast=True)\n    if tokenizer.pad_token is None:\n        tokenizer.pad_token = tokenizer.eos_token\n\n    update_status('running', 32, 'Loading GPT-OSS base model')\n    model_kwargs = dict(\n        attn_implementation='eager',\n        torch_dtype=torch.bfloat16,\n        use_cache=False,\n        device_map='auto',\n        token=HF_TOKEN,\n    )\n    if Mxfp4Config is not None:\n        model_kwargs['quantization_config'] = Mxfp4Config(dequantize=True)\n    model = AutoModelForCausalLM.from_pretrained(CONFIG['base_model'], **model_kwargs)\n    model.config.use_cache = False\n\n    update_status('running', 42, 'Preparing LoRA adapter')\n    peft_model = get_peft_model(model, build_peft_config())\n    peft_model.print_trainable_parameters()\n\n    training_args = SFTConfig(\n        output_dir='/tmp/copypro-gpt-oss-output',\n        learning_rate=float(CONFIG.get('learning_rate') or 2e-4),\n        gradient_checkpointing=True,\n        num_train_epochs=max(1, int(CONFIG.get('epochs') or 3)),\n        logging_steps=1,\n        per_device_train_batch_size=max(1, int(CONFIG.get('per_device_train_batch_size') or 1)),\n        gradient_accumulation_steps=max(1, int(CONFIG.get('gradient_accumulation_steps') or 8)),\n        max_length=max(512, int(CONFIG.get('max_length') or 2048)),\n        warmup_ratio=0.03,\n        lr_scheduler_type='cosine',\n        report_to=[],\n        save_strategy='epoch',\n        bf16=True,\n        push_to_hub=False,\n    )\n\n    trainer = SFTTrainer(\n        model=peft_model,\n        args=training_args,\n        train_dataset=dataset,\n        processing_class=tokenizer,\n        callbacks=[StatusCallback()],\n    )\n\n    update_status('running', 45, 'Starting GPT-OSS LoRA SFT')\n    trainer.train()\n    update_status('running', 88, 'Saving LoRA adapter')\n    trainer.save_model(training_args.output_dir)\n    update_status('running', 92, 'Pushing LoRA adapter to Hugging Face')\n    api.create_repo(repo_id=CONFIG['output_model_repo_id'], repo_type='model', private=True, exist_ok=True, token=HF_TOKEN)\n    trainer.model.push_to_hub(CONFIG['output_model_repo_id'], token=HF_TOKEN, private=True)\n    tokenizer.push_to_hub(CONFIG['output_model_repo_id'], token=HF_TOKEN, private=True)\n    update_status('completed', 100, 'GPT-OSS training completed')\n\nclass Handler(BaseHTTPRequestHandler):\n    def do_GET(self):\n        body = json.dumps(STATUS, ensure_ascii=False).encode('utf-8')\n        self.send_response(200)\n        self.send_header('Content-Type', 'application/json; charset=utf-8')\n        self.send_header('Content-Length', str(len(body)))\n        self.end_headers()\n        self.wfile.write(body)\n\ntry:\n    train()\nexcept Exception as exc:\n    update_status('failed', STATUS.get('progress', 0), 'GPT-OSS training failed', ''.join(traceback.format_exception_only(type(exc), exc)).strip())\n\nHTTPServer(('0.0.0.0', 7860), Handler).serve_forever()\n`;
}

function buildSpaceFiles(config) {
  return {
    'README.md': ['---', `title: ${config.job_name} GPT-OSS Trainer`, 'sdk: docker', 'app_port: 7860', '---', '', 'Generated by CopyPro AI.'].join('\n'),
    'Dockerfile': [
      'FROM pytorch/pytorch:2.8.0-cuda12.8-cudnn9-runtime',
      'WORKDIR /app',
      'RUN apt-get update && apt-get install -y git && rm -rf /var/lib/apt/lists/*',
      'RUN pip install --no-cache-dir --upgrade pip',
      'COPY requirements.txt .',
      'RUN pip install --no-cache-dir -r requirements.txt',
      'COPY train.py .',
      'CMD ["python", "train.py"]',
      '',
    ].join('\n'),
    'requirements.txt': [
      'accelerate>=1.2.1',
      'datasets>=2.21.0',
      'huggingface_hub>=0.24.6',
      'kernels>=0.9.0',
      'peft>=0.17.0',
      'safetensors>=0.4.4',
      'trackio>=0.2.0',
      'transformers>=4.55.0',
      'trl>=0.20.0',
      '',
    ].join('\n'),
    'status.json': JSON.stringify({ status: 'queued', progress: 5, output_model_repo_id: config.output_model_repo_id, history: ['Space files created'], metrics: [] }, null, 2),
    'train.py': buildTrainingScript(config),
  };
}

async function submitJob(job) {
  ensureConfigured();
  ensureBaseModelAllowed(job.baseModel);
  const examples = await FineTuneExample.find({ datasetId: job.datasetId, userId: job.userId, isValid: true }).sort({ createdAt: 1 });
  const namespace = await getNamespace();
  const alias = `${slugify(job.name)}-${job._id.toString().slice(-6)}`;
  const datasetRepoId = `${namespace}/${alias}-gpt-oss-dataset`;
  const outputModelRepoId = `${namespace}/${alias}-gpt-oss-lora`;
  const spaceRepoId = `${namespace}/${alias}-gpt-oss-trainer`;
  const config = {
    job_name: job.name,
    base_model: job.baseModel,
    epochs: Math.max(1, Number(job.epochs || 3)),
    dataset_repo_id: datasetRepoId,
    output_model_repo_id: outputModelRepoId,
    space_repo_id: spaceRepoId,
    learning_rate: Number(process.env.GPT_OSS_FINE_TUNE_LEARNING_RATE || 2e-4),
    per_device_train_batch_size: Number(process.env.GPT_OSS_FINE_TUNE_BATCH_SIZE || 1),
    gradient_accumulation_steps: Number(process.env.GPT_OSS_FINE_TUNE_GRADIENT_ACCUMULATION_STEPS || 8),
    max_length: Number(process.env.GPT_OSS_FINE_TUNE_MAX_LENGTH || 2048),
    lora_r: Number(process.env.GPT_OSS_FINE_TUNE_LORA_R || 8),
    lora_alpha: Number(process.env.GPT_OSS_FINE_TUNE_LORA_ALPHA || 16),
    lora_dropout: Number(process.env.GPT_OSS_FINE_TUNE_LORA_DROPOUT || 0.05),
  };

  await createRepo(datasetRepoId, 'dataset', { private: true });
  await createRepo(outputModelRepoId, 'model', { private: true });
  await createRepo(spaceRepoId, 'space', { private: true });
  await pushFiles(datasetRepoId, 'dataset', buildDatasetFiles(job, examples), 'Add CopyPro GPT-OSS fine-tuning dataset');
  await addSpaceSecret(spaceRepoId, 'HF_TOKEN', getToken());
  await pushFiles(spaceRepoId, 'space', buildSpaceFiles(config), 'Add CopyPro GPT-OSS trainer Space');

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

async function getMetrics(job) {
  const status = await getSpaceStatus(job);
  return Array.isArray(status?.metrics) ? status.metrics : [];
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
  getMetrics,
};
