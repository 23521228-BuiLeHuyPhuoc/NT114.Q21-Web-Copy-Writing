# Fine-tuning Ready Pack - Vietnamese Brand Voice

Pack này thay thế pack cũ bị mất dấu tiếng Việt trong CSV.

## Dùng trong app /fine-tune

1. Mở trang `/fine-tune`.
2. Chọn provider `Hugging Face Llama Fine-tuning`.
3. Chọn `Llama 3.2 1B Instruct` để test nhẹ trước.
4. Import file `01_train_examples_for_app_import_utf8.csv`.
5. Bấm `Bắt đầu Fine-tuning`.

## Dùng ngoài app với Colab hoặc Kaggle

- Train file: `02_train_huggingface_chat_utf8.jsonl`.
- Validation file: `03_validation_holdout_chat_utf8.jsonl`.
- Prompt test sau fine-tune: `copy_paste_test_prompts.md`.

## Lưu ý

- CSV được cố tình tránh dấu phẩy trong nội dung vì parser import hiện tại của UI tách đơn giản theo dấu phẩy.
- JSONL giữ nguyên Unicode tiếng Việt và phù hợp để dùng với SFT/LoRA chat format.
- Dataset này dạy giọng viết và format thương mại điện tử; không làm model thông minh tổng quát hơn.

## Free Kaggle/Colab option

Use `06_kaggle_colab_unsloth_free_llama.ipynb` with `02_train_huggingface_chat_utf8.jsonl` when Hugging Face Spaces asks for prepaid credits.

## Recommended free option: Unsloth

Use `06_kaggle_colab_unsloth_free_llama.ipynb` with `02_train_huggingface_chat_utf8.jsonl`.
This is the simpler free path for Colab/Kaggle GPU and is the recommended notebook for now.

## Optional: LLaMA Factory

Use `07_colab_llamafactory_free_llama.ipynb` with `02_train_huggingface_chat_utf8.jsonl`.
It converts the dataset to sharegpt format and runs QLoRA with `llamafactory-cli train`.
