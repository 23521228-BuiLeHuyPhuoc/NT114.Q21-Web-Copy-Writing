const fs = require('fs');
const path = require('path');

const packDir = path.resolve(__dirname, '..', 'fine_tuning_ready_vi_huggingface');
const notebookName = '06_kaggle_colab_unsloth_free_llama.ipynb';

function lines(source) {
  return source.trim().split('\n').map((line) => `${line}\n`);
}

const notebook = {
  cells: [
    {
      cell_type: 'markdown',
      metadata: {},
      source: lines(`# Free Llama LoRA fine-tuning with Kaggle or Colab

Use this when Hugging Face Spaces asks for prepaid credits. Upload this notebook and \`02_train_huggingface_chat_utf8.jsonl\` to the same working directory. Start with Llama 3.2 1B first.`),
    },
    {
      cell_type: 'code',
      execution_count: null,
      metadata: {},
      outputs: [],
      source: lines(`!pip install -q unsloth
!pip install -q --no-deps trl peft accelerate bitsandbytes datasets transformers safetensors`),
    },
    {
      cell_type: 'code',
      execution_count: null,
      metadata: {},
      outputs: [],
      source: lines(`import os
import getpass
from pathlib import Path

if not os.environ.get("HF_TOKEN"):
    os.environ["HF_TOKEN"] = getpass.getpass("Paste Hugging Face write token: ")

BASE_MODEL = "meta-llama/Llama-3.2-1B-Instruct"
OUTPUT_REPO = "Phuoc20050911/copypro-brand-voice-llama-1b-lora"
DATA_PATH = Path("02_train_huggingface_chat_utf8.jsonl")

assert DATA_PATH.exists(), f"Missing {DATA_PATH}. Upload it next to this notebook."
print("Ready", BASE_MODEL, "->", OUTPUT_REPO)`),
    },
    {
      cell_type: 'code',
      execution_count: null,
      metadata: {},
      outputs: [],
      source: lines(`from unsloth import FastLanguageModel
from datasets import load_dataset
from transformers import TrainingArguments
from trl import SFTTrainer

max_seq_length = 2048
model, tokenizer = FastLanguageModel.from_pretrained(
    model_name=BASE_MODEL,
    max_seq_length=max_seq_length,
    dtype=None,
    load_in_4bit=True,
    token=os.environ["HF_TOKEN"],
)

model = FastLanguageModel.get_peft_model(
    model,
    r=16,
    target_modules=["q_proj", "k_proj", "v_proj", "o_proj", "gate_proj", "up_proj", "down_proj"],
    lora_alpha=32,
    lora_dropout=0,
    bias="none",
    use_gradient_checkpointing="unsloth",
    random_state=3407,
)

dataset = load_dataset("json", data_files=str(DATA_PATH), split="train")

def format_item(example):
    return {"text": tokenizer.apply_chat_template(example["messages"], tokenize=False, add_generation_prompt=False)}

dataset = dataset.map(format_item, remove_columns=dataset.column_names)
print(dataset[0]["text"][:500])`),
    },
    {
      cell_type: 'code',
      execution_count: null,
      metadata: {},
      outputs: [],
      source: lines(`trainer = SFTTrainer(
    model=model,
    tokenizer=tokenizer,
    train_dataset=dataset,
    dataset_text_field="text",
    max_seq_length=max_seq_length,
    packing=False,
    args=TrainingArguments(
        output_dir="copypro_llama_lora_output",
        per_device_train_batch_size=2,
        gradient_accumulation_steps=4,
        warmup_steps=5,
        num_train_epochs=2,
        learning_rate=2e-4,
        fp16=True,
        logging_steps=5,
        optim="adamw_8bit",
        weight_decay=0.01,
        lr_scheduler_type="linear",
        seed=3407,
        report_to="none",
    ),
)

trainer.train()`),
    },
    {
      cell_type: 'code',
      execution_count: null,
      metadata: {},
      outputs: [],
      source: lines(`model.push_to_hub(OUTPUT_REPO, token=os.environ["HF_TOKEN"])
tokenizer.push_to_hub(OUTPUT_REPO, token=os.environ["HF_TOKEN"])
print("Pushed LoRA adapter to", OUTPUT_REPO)`),
    },
  ],
  metadata: {
    kernelspec: {
      display_name: 'Python 3',
      language: 'python',
      name: 'python3',
    },
    language_info: {
      name: 'python',
    },
  },
  nbformat: 4,
  nbformat_minor: 5,
};

fs.mkdirSync(packDir, { recursive: true });
fs.writeFileSync(path.join(packDir, notebookName), JSON.stringify(notebook, null, 2), 'utf8');

const manifestPath = path.join(packDir, 'manifest.json');
if (fs.existsSync(manifestPath)) {
  const manifest = JSON.parse(fs.readFileSync(manifestPath, 'utf8'));
  manifest.free_notebook = notebookName;
  manifest.huggingface_space_note = 'In-app Hugging Face Spaces with GPU require prepaid billing credits. Use the notebook for Kaggle/Colab free GPU training.';
  manifest.files = Array.from(new Set([...(manifest.files || []), notebookName]));
  fs.writeFileSync(manifestPath, `${JSON.stringify(manifest, null, 2)}\n`, 'utf8');
}

const readmePath = path.join(packDir, 'README_FINE_TUNING_UTF8.md');
if (fs.existsSync(readmePath)) {
  const readme = fs.readFileSync(readmePath, 'utf8');
  const note = [
    '',
    '## Free Kaggle/Colab option',
    '',
    `Use \`${notebookName}\` with \`02_train_huggingface_chat_utf8.jsonl\` when Hugging Face Spaces asks for prepaid credits.`,
    '',
  ].join('\n');
  if (!readme.includes(notebookName)) fs.writeFileSync(readmePath, `${readme.trimEnd()}\n${note}`, 'utf8');
}

console.log(JSON.stringify({ notebook: path.join(packDir, notebookName) }, null, 2));
