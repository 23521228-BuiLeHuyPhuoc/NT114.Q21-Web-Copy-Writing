# Fine-tuning Ready Pack - Vietnamese Generator Contract

Pack này dùng đúng prompt contract của trang Generator thay vì schema TYPE=... cũ.

## Dùng trong app /fine-tune

1. Mở trang `/fine-tune`.
2. Chọn provider `Hugging Face Llama Fine-tuning`.
3. Chọn `Llama 3.2 1B Instruct` để test nhẹ trước.
4. Import file `01_train_examples_for_app_import_utf8.csv`.
5. Bấm `Bắt đầu Fine-tuning`.

## Contract đã sửa

- Input là prompt nhiều dòng giống Generator: `Bạn là chuyên gia copywriting...`, `Tạo đúng 3 phiên bản...`, `Format riêng theo loại nội dung...`.
- Output luôn có đúng `Phiên bản 1:`, `Phiên bản 2:`, `Phiên bản 3:`.
- Mỗi phiên bản dùng đúng label của từng loại nội dung, ví dụ `Lời kêu gọi hành động:` thay vì `CTA:`.
- CSV giữ newline bằng quote chuẩn để nội dung import vẫn giống prompt thật.

## Dùng ngoài app với Colab hoặc Kaggle

- Train file: `02_train_huggingface_chat_utf8.jsonl`.
- Validation file: `03_validation_holdout_chat_utf8.jsonl`.
- Prompt test sau fine-tune: `copy_paste_test_prompts.md`.
