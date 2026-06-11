# Gemini Fine-tuning Pack - Hat Moc Brand Voice

Bộ này dùng để tạo khác biệt rõ hơn giữa Gemini base và Gemini đã fine-tune. Dataset cũ quá ngắn nên model chỉ học rất nhẹ. Bộ mới có 128 mẫu train và 24 prompt holdout không nằm trong train.

## Brand voice cần học

- Tư vấn ấm nhưng tiết chế.
- Không hype kiểu "đừng bỏ lỡ" hoặc "siêu phẩm".
- Không tự bịa số liệu hoặc chứng nhận.
- Hay dùng nhãn "Góc cần biết" và "CTA mềm".
- CTA thiên về hỏi thêm hoặc chọn khi đúng nhu cầu.

## File trong pack

- 01_train_app_import.csv: import vào app theo cột input, output, industry, tone.
- 02_train_vertex_gemini.jsonl: bản tham chiếu theo format Vertex Gemini supervised tuning.
- 03_holdout_prompts_before_after.md: prompt test trước/sau và output mục tiêu sau fine-tune.
- 04_eval_scorecard.csv: bảng chấm nhanh để so base và tuned.

## Cách test để thấy khác biệt

1. Chạy các prompt trong 03_holdout_prompts_before_after.md bằng model base và lưu output.
2. Import 01_train_app_import.csv vào dataset mới.
3. Tạo job provider vertex-gemini với base gemini-2.5-flash.
4. Khi job completed, promote/active model.
5. Chạy lại đúng prompt holdout bằng model fine-tuned.
6. Chấm theo 04_eval_scorecard.csv.

Lưu ý: nếu prompt test đã ghi quá chi tiết brand voice thì base model cũng sẽ bắt chước được. Muốn kiểm tra fine-tune thật, prompt test phải ngắn và giữ nguyên giữa trước/sau.
