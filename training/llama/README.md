# Llama Fine-tuning CLI

Thư mục này dùng để chạy fine-tuning Llama bằng SFT + LoRA hoặc QLoRA từ CLI.

## 0. Bắt buộc xử lý token

Token Hugging Face đã gửi trong chat phải được revoke và tạo token mới. Không commit token vào repo. Các script chỉ đọc token từ `HF_TOKEN`, `HUGGINGFACE_HUB_TOKEN`, hoặc phiên `hf auth login`.

## 1. Chuẩn bị môi trường

Khuyến nghị chạy trên Linux, WSL2, Colab hoặc Kaggle có NVIDIA GPU. Native Windows thường không phù hợp cho `bitsandbytes` QLoRA.

PowerShell:

```powershell
python -m venv .venv-llama
.\.venv-llama\Scripts\Activate.ps1
python -m pip install -U pip
pip install -r training/llama/requirements.txt
```

Linux hoặc WSL2:

```bash
python3 -m venv .venv-llama
source .venv-llama/bin/activate
python -m pip install -U pip
pip install -r training/llama/requirements.txt
```

## 2. Login Hugging Face

Tạo token mới có quyền `read`. Nếu muốn push adapter lên Hub, token cần thêm quyền `write`.

PowerShell:

```powershell
$env:HF_TOKEN='<YOUR_NEW_HF_TOKEN>'
hf auth login --token $env:HF_TOKEN
```

Linux hoặc WSL2:

```bash
export HF_TOKEN='<YOUR_NEW_HF_TOKEN>'
hf auth login --token $HF_TOKEN
```

Bạn cũng phải request/accept license của model Llama bằng đúng tài khoản Hugging Face đó.

## 3. Convert CSV sang chat JSONL

```bash
python training/llama/prepare_dataset.py --input fine_tune_dataset_ecommerce_vi.csv --output-dir training/llama/data
```

Lệnh này tạo:

- `training/llama/data/train.jsonl`
- `training/llama/data/val.jsonl`

Dataset hiện tại chỉ có 12 mẫu, phù hợp test pipeline. Muốn model tốt hơn nên có tối thiểu vài trăm mẫu sạch.

## 4. Train Llama bằng LoRA/QLoRA

Model nhẹ hơn cho demo:

```bash
python training/llama/train_lora.py --model-id meta-llama/Llama-3.2-3B-Instruct --train-file training/llama/data/train.jsonl --eval-file training/llama/data/val.jsonl --output-dir training/llama/outputs/llama-copywriting-lora --load-in-4bit --bf16
```

Nếu GPU không hỗ trợ bf16, đổi `--bf16` thành `--fp16`.

Model lớn hơn:

```bash
python training/llama/train_lora.py --model-id meta-llama/Llama-3.1-8B-Instruct --train-file training/llama/data/train.jsonl --eval-file training/llama/data/val.jsonl --output-dir training/llama/outputs/llama-8b-copywriting-lora --load-in-4bit --bf16
```

## 5. Test adapter sau khi train

```bash
python training/llama/infer_lora.py --model-id meta-llama/Llama-3.2-3B-Instruct --adapter-dir training/llama/outputs/llama-copywriting-lora --prompt 'Viết mô tả sản phẩm cho áo khoác chống nắng nữ, tone thân thiện, khoảng 80 từ.'
```

## 6. Push adapter lên Hugging Face Hub nếu cần

```bash
python training/llama/train_lora.py --model-id meta-llama/Llama-3.2-3B-Instruct --train-file training/llama/data/train.jsonl --eval-file training/llama/data/val.jsonl --output-dir training/llama/outputs/llama-copywriting-lora --load-in-4bit --bf16 --push-to-hub --hub-model-id username/llama-copywriting-lora
```

## 7. Gắn vào app hiện tại

Sau khi train xong, lưu `model-id` và `adapter-dir` hoặc `hub-model-id` vào backend fine-tuning job. App hiện tại có thể gọi một Python inference service riêng hoặc deploy adapter qua vLLM, TGI, hoặc Hugging Face Inference Endpoint.
