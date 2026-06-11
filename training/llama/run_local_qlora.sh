#!/usr/bin/env bash
set -euo pipefail

ROOT_DIR="$(cd "$(dirname "${BASH_SOURCE[0]}")/../.." && pwd)"
cd "$ROOT_DIR"

BASE_MODEL="${BASE_MODEL:-meta-llama/Llama-3.2-1B-Instruct}"
OUTPUT_DIR="${OUTPUT_DIR:-training/llama/outputs/copypro-brand-voice-llama-1b-lora}"
HUB_MODEL_ID="${HUB_MODEL_ID:-Phuoc20050911/copypro-brand-voice-llama-1b-lora-local}"
TRAIN_FILE="${TRAIN_FILE:-fine_tuning_ready_vi_huggingface/02_train_huggingface_chat_utf8.jsonl}"
EVAL_FILE="${EVAL_FILE:-fine_tuning_ready_vi_huggingface/03_validation_holdout_chat_utf8.jsonl}"

if ! command -v nvidia-smi >/dev/null 2>&1; then
  echo "No NVIDIA GPU detected. Run this in WSL2/Linux with CUDA, or use Colab/Kaggle free GPU." >&2
  exit 1
fi

if [ ! -f "$TRAIN_FILE" ]; then
  echo "Missing train file: $TRAIN_FILE" >&2
  exit 1
fi

if [ -z "${HF_TOKEN:-${HUGGINGFACE_HUB_TOKEN:-}}" ]; then
  echo "Set HF_TOKEN first, for example: export HF_TOKEN='hf_xxx'" >&2
  exit 1
fi

python -m pip install -U pip
python -m pip install -r training/llama/requirements.txt

python training/llama/train_lora.py \
  --model-id "$BASE_MODEL" \
  --train-file "$TRAIN_FILE" \
  --eval-file "$EVAL_FILE" \
  --output-dir "$OUTPUT_DIR" \
  --epochs "${EPOCHS:-2}" \
  --batch-size "${BATCH_SIZE:-1}" \
  --grad-accum "${GRAD_ACCUM:-8}" \
  --load-in-4bit \
  --fp16 \
  --push-to-hub \
  --hub-model-id "$HUB_MODEL_ID"

echo "Done. Local adapter: $OUTPUT_DIR"
echo "Hub adapter: https://huggingface.co/$HUB_MODEL_ID"
