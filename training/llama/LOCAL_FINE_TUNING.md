# Local Llama Fine-tuning From This Repo

B?n c? th? fine-tune Llama ngay trong repo n?y. ?i?u ki?n b?t bu?c l? m?y ch?y script ph?i c? NVIDIA GPU/CUDA. Repo ch? ch?a code v? dataset; n? kh?ng t? t?o ra GPU.

M?y Windows hi?n t?i ?? ???c ki?m tra v? kh?ng c? `nvidia-smi`, n?n kh?ng th? ch?y QLoRA Llama local tr?n m?y n?y ngay b?y gi?. Colab/Kaggle kh?ng ph?i ??nh tr?o kh?i ni?m; ?? ch? l? n?i cung c?p GPU mi?n ph? ?? ch?y c?ng lo?i fine-tuning.

## Ch?y local n?u c? WSL2/Linux + NVIDIA GPU

Trong WSL2 ho?c Linux:

```bash
cd /mnt/e/baitap/NT114/NT114-Git/NT114.Q21-Web-Copy-Writing
python3 -m venv .venv-llama
source .venv-llama/bin/activate
export HF_TOKEN='hf_xxx'
bash training/llama/run_local_qlora.sh
```

M?c ??nh script d?ng:

```text
Base model: meta-llama/Llama-3.2-1B-Instruct
Train file: fine_tuning_ready_vi_huggingface/02_train_huggingface_chat_utf8.jsonl
Eval file: fine_tuning_ready_vi_huggingface/03_validation_holdout_chat_utf8.jsonl
Output dir: training/llama/outputs/copypro-brand-voice-llama-1b-lora
Hub repo: Phuoc20050911/copypro-brand-voice-llama-1b-lora-local
```

??i repo output n?u train nhi?u version:

```bash
HUB_MODEL_ID='Phuoc20050911/copypro-brand-voice-llama-1b-lora-v2' bash training/llama/run_local_qlora.sh
```

## V? sao kh?ng ch?y native Windows lu?n?

QLoRA th??ng c?n `bitsandbytes`, CUDA v? NVIDIA GPU. Native Windows hay l?i ho?c kh?ng ???c h? tr? t?t cho pipeline n?y. WSL2/Linux/Colab/Kaggle ?n h?n.

## N?u kh?ng c? GPU local

D?ng notebook mi?n ph? ?? t?o trong pack:

```text
fine_tuning_ready_vi_huggingface/06_kaggle_colab_unsloth_free_llama.ipynb
```

N? v?n l? LoRA/QLoRA fine-tuning th?t, ch? ch?y tr?n GPU mi?n ph? c?a Colab/Kaggle thay v? GPU local.
