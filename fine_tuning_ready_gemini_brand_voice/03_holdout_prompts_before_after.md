# Prompt test trước và sau fine-tuning Gemini

Cách dùng đúng: chạy cùng một prompt hai lần. Lần trước dùng Gemini base. Lần sau chọn model Gemini đã fine-tune và giữ nguyên prompt. Không thêm brand rule vào prompt test vì như vậy base model cũng có thể bắt chước.

Dấu hiệu sau fine-tune nên thấy rõ: output có các nhãn kiểu `Góc cần biết` và `CTA mềm`, giọng tư vấn tiết chế, ít hype, không tự bịa số liệu, thường có câu nhắc hỏi shop hoặc chọn khi đúng nhu cầu.

## T-001 - headline - máy pha cà phê capsule

### Trước fine-tuning
Chọn model base `gemini-flash` hoặc `gemini-2.5-flash`, rồi paste prompt này:
```text
Viết headline cho sản phẩm máy pha cà phê capsule.
Đối tượng: người thích cà phê nhanh tại nhà.
Lợi ích chính: pha nhanh ; dễ vệ sinh ; thiết kế gọn.
Ưu đãi: tặng hộp capsule dùng thử.
Tone: professional.
Không cần giải thích quá trình viết.
```

### Sau fine-tuning
Chọn model fine-tuned đã promote trong Generator, rồi paste lại đúng prompt trên. Prompt không đổi; chỉ đổi model.

### Output mong đợi sau fine-tuning
```text
Headline: máy pha cà phê capsule cho người thích cà phê nhanh tại nhà | Lý do chọn: pha nhanh ; dễ vệ sinh ; thiết kế gọn. | Góc cần biết: Giọng Hat Moc giữ câu chữ chắc và đi thẳng vào nhu cầu. Không thêm cam kết ngoài brief. | CTA mềm: Nhắn shop hỏi thêm trước khi chọn MAY_PHA_CA_PHE_CAPSULE.
```

## T-002 - description - máy pha cà phê capsule

### Trước fine-tuning
Chọn model base `gemini-flash` hoặc `gemini-2.5-flash`, rồi paste prompt này:
```text
Viết description cho sản phẩm máy pha cà phê capsule.
Đối tượng: người thích cà phê nhanh tại nhà.
Lợi ích chính: pha nhanh ; dễ vệ sinh ; thiết kế gọn.
Ưu đãi: tặng hộp capsule dùng thử.
Tone: friendly.
Không cần giải thích quá trình viết.
```

### Sau fine-tuning
Chọn model fine-tuned đã promote trong Generator, rồi paste lại đúng prompt trên. Prompt không đổi; chỉ đổi model.

### Output mong đợi sau fine-tuning
```text
Phù hợp với: người thích cà phê nhanh tại nhà muốn một lựa chọn dễ dùng và không cần đọc quá nhiều thông tin rối. | Điểm nổi bật: máy pha cà phê capsule có pha nhanh ; dễ vệ sinh ; thiết kế gọn. | Góc cần biết: Nội dung chỉ dùng dữ kiện trong brief. Nếu cần so sánh thêm thì nên hỏi shop trước khi mua. | CTA mềm: Lưu lại sản phẩm hoặc nhắn shop để được tư vấn đúng nhu cầu MAY_PHA_CA_PHE_CAPSULE.
```

## T-003 - social - máy pha cà phê capsule

### Trước fine-tuning
Chọn model base `gemini-flash` hoặc `gemini-2.5-flash`, rồi paste prompt này:
```text
Viết social cho sản phẩm máy pha cà phê capsule.
Đối tượng: người thích cà phê nhanh tại nhà.
Lợi ích chính: pha nhanh ; dễ vệ sinh ; thiết kế gọn.
Ưu đãi: tặng hộp capsule dùng thử.
Tone: emotional.
Không cần giải thích quá trình viết.
```

### Sau fine-tuning
Chọn model fine-tuned đã promote trong Generator, rồi paste lại đúng prompt trên. Prompt không đổi; chỉ đổi model.

### Output mong đợi sau fine-tuning
```text
Mở bài: Có những món không cần nói quá nhiều vẫn thấy hợp nhu cầu hằng ngày. | Điểm đáng cân nhắc: máy pha cà phê capsule dành cho người thích cà phê nhanh tại nhà với pha nhanh ; dễ vệ sinh ; thiết kế gọn. | Góc cần biết: tặng hộp capsule dùng thử. Hat Moc ưu tiên nói rõ lợi ích và tránh tạo cảm giác phải mua ngay. | CTA mềm: Nếu đang phân vân thì nhắn shop hỏi thêm trước khi chọn.
```

## T-004 - email - máy pha cà phê capsule

### Trước fine-tuning
Chọn model base `gemini-flash` hoặc `gemini-2.5-flash`, rồi paste prompt này:
```text
Viết email cho sản phẩm máy pha cà phê capsule.
Đối tượng: người thích cà phê nhanh tại nhà.
Lợi ích chính: pha nhanh ; dễ vệ sinh ; thiết kế gọn.
Ưu đãi: tặng hộp capsule dùng thử.
Tone: urgent.
Không cần giải thích quá trình viết.
```

### Sau fine-tuning
Chọn model fine-tuned đã promote trong Generator, rồi paste lại đúng prompt trên. Prompt không đổi; chỉ đổi model.

### Output mong đợi sau fine-tuning
```text
Subject: Gợi ý máy pha cà phê capsule cho nhu cầu hằng ngày | Preview text: Thông tin ngắn gọn để bạn cân nhắc trước khi mua. | Nội dung: Nếu bạn là người thích cà phê nhanh tại nhà thì máy pha cà phê capsule là lựa chọn đáng xem nhờ pha nhanh ; dễ vệ sinh ; thiết kế gọn. Ưu đãi hiện có là tặng hộp capsule dùng thử. | Góc cần biết: Email này không phóng đại hiệu quả và không thêm số liệu ngoài brief. | CTA mềm: Xem chi tiết rồi chọn khi thấy thật sự phù hợp.
```

## T-005 - headline - kem chống nắng nâng tông nhẹ

### Trước fine-tuning
Chọn model base `gemini-flash` hoặc `gemini-2.5-flash`, rồi paste prompt này:
```text
Viết headline cho sản phẩm kem chống nắng nâng tông nhẹ.
Đối tượng: người đi làm cần lớp nền tự nhiên.
Lợi ích chính: thấm nhanh ; không bí da ; dùng hằng ngày.
Ưu đãi: mua 2 tặng 1 minisize.
Tone: professional.
Không cần giải thích quá trình viết.
```

### Sau fine-tuning
Chọn model fine-tuned đã promote trong Generator, rồi paste lại đúng prompt trên. Prompt không đổi; chỉ đổi model.

### Output mong đợi sau fine-tuning
```text
Headline: kem chống nắng nâng tông nhẹ cho người đi làm cần lớp nền tự nhiên | Lý do chọn: thấm nhanh ; không bí da ; dùng hằng ngày. | Góc cần biết: Giọng Hat Moc giữ câu chữ chắc và đi thẳng vào nhu cầu. Không thêm cam kết ngoài brief. | CTA mềm: Nhắn shop hỏi thêm trước khi chọn KEM_CHONG_NANG_NANG_TONG_NHE.
```

## T-006 - description - kem chống nắng nâng tông nhẹ

### Trước fine-tuning
Chọn model base `gemini-flash` hoặc `gemini-2.5-flash`, rồi paste prompt này:
```text
Viết description cho sản phẩm kem chống nắng nâng tông nhẹ.
Đối tượng: người đi làm cần lớp nền tự nhiên.
Lợi ích chính: thấm nhanh ; không bí da ; dùng hằng ngày.
Ưu đãi: mua 2 tặng 1 minisize.
Tone: friendly.
Không cần giải thích quá trình viết.
```

### Sau fine-tuning
Chọn model fine-tuned đã promote trong Generator, rồi paste lại đúng prompt trên. Prompt không đổi; chỉ đổi model.

### Output mong đợi sau fine-tuning
```text
Phù hợp với: người đi làm cần lớp nền tự nhiên muốn một lựa chọn dễ dùng và không cần đọc quá nhiều thông tin rối. | Điểm nổi bật: kem chống nắng nâng tông nhẹ có thấm nhanh ; không bí da ; dùng hằng ngày. | Góc cần biết: Nội dung chỉ dùng dữ kiện trong brief. Nếu cần so sánh thêm thì nên hỏi shop trước khi mua. | CTA mềm: Lưu lại sản phẩm hoặc nhắn shop để được tư vấn đúng nhu cầu KEM_CHONG_NANG_NANG_TONG_NHE.
```

## T-007 - social - kem chống nắng nâng tông nhẹ

### Trước fine-tuning
Chọn model base `gemini-flash` hoặc `gemini-2.5-flash`, rồi paste prompt này:
```text
Viết social cho sản phẩm kem chống nắng nâng tông nhẹ.
Đối tượng: người đi làm cần lớp nền tự nhiên.
Lợi ích chính: thấm nhanh ; không bí da ; dùng hằng ngày.
Ưu đãi: mua 2 tặng 1 minisize.
Tone: emotional.
Không cần giải thích quá trình viết.
```

### Sau fine-tuning
Chọn model fine-tuned đã promote trong Generator, rồi paste lại đúng prompt trên. Prompt không đổi; chỉ đổi model.

### Output mong đợi sau fine-tuning
```text
Mở bài: Có những món không cần nói quá nhiều vẫn thấy hợp nhu cầu hằng ngày. | Điểm đáng cân nhắc: kem chống nắng nâng tông nhẹ dành cho người đi làm cần lớp nền tự nhiên với thấm nhanh ; không bí da ; dùng hằng ngày. | Góc cần biết: mua 2 tặng 1 minisize. Hat Moc ưu tiên nói rõ lợi ích và tránh tạo cảm giác phải mua ngay. | CTA mềm: Nếu đang phân vân thì nhắn shop hỏi thêm trước khi chọn.
```

## T-008 - email - kem chống nắng nâng tông nhẹ

### Trước fine-tuning
Chọn model base `gemini-flash` hoặc `gemini-2.5-flash`, rồi paste prompt này:
```text
Viết email cho sản phẩm kem chống nắng nâng tông nhẹ.
Đối tượng: người đi làm cần lớp nền tự nhiên.
Lợi ích chính: thấm nhanh ; không bí da ; dùng hằng ngày.
Ưu đãi: mua 2 tặng 1 minisize.
Tone: urgent.
Không cần giải thích quá trình viết.
```

### Sau fine-tuning
Chọn model fine-tuned đã promote trong Generator, rồi paste lại đúng prompt trên. Prompt không đổi; chỉ đổi model.

### Output mong đợi sau fine-tuning
```text
Subject: Gợi ý kem chống nắng nâng tông nhẹ cho nhu cầu hằng ngày | Preview text: Thông tin ngắn gọn để bạn cân nhắc trước khi mua. | Nội dung: Nếu bạn là người đi làm cần lớp nền tự nhiên thì kem chống nắng nâng tông nhẹ là lựa chọn đáng xem nhờ thấm nhanh ; không bí da ; dùng hằng ngày. Ưu đãi hiện có là mua 2 tặng 1 minisize. | Góc cần biết: Email này không phóng đại hiệu quả và không thêm số liệu ngoài brief. | CTA mềm: Xem chi tiết rồi chọn khi thấy thật sự phù hợp.
```

## T-009 - headline - bộ dao bếp inox

### Trước fine-tuning
Chọn model base `gemini-flash` hoặc `gemini-2.5-flash`, rồi paste prompt này:
```text
Viết headline cho sản phẩm bộ dao bếp inox.
Đối tượng: người nấu ăn tại nhà.
Lợi ích chính: cầm chắc tay ; dễ rửa ; đủ size cơ bản.
Ưu đãi: tặng thanh mài dao.
Tone: professional.
Không cần giải thích quá trình viết.
```

### Sau fine-tuning
Chọn model fine-tuned đã promote trong Generator, rồi paste lại đúng prompt trên. Prompt không đổi; chỉ đổi model.

### Output mong đợi sau fine-tuning
```text
Headline: bộ dao bếp inox cho người nấu ăn tại nhà | Lý do chọn: cầm chắc tay ; dễ rửa ; đủ size cơ bản. | Góc cần biết: Giọng Hat Moc giữ câu chữ chắc và đi thẳng vào nhu cầu. Không thêm cam kết ngoài brief. | CTA mềm: Nhắn shop hỏi thêm trước khi chọn BO_DAO_BEP_INOX.
```

## T-010 - description - bộ dao bếp inox

### Trước fine-tuning
Chọn model base `gemini-flash` hoặc `gemini-2.5-flash`, rồi paste prompt này:
```text
Viết description cho sản phẩm bộ dao bếp inox.
Đối tượng: người nấu ăn tại nhà.
Lợi ích chính: cầm chắc tay ; dễ rửa ; đủ size cơ bản.
Ưu đãi: tặng thanh mài dao.
Tone: friendly.
Không cần giải thích quá trình viết.
```

### Sau fine-tuning
Chọn model fine-tuned đã promote trong Generator, rồi paste lại đúng prompt trên. Prompt không đổi; chỉ đổi model.

### Output mong đợi sau fine-tuning
```text
Phù hợp với: người nấu ăn tại nhà muốn một lựa chọn dễ dùng và không cần đọc quá nhiều thông tin rối. | Điểm nổi bật: bộ dao bếp inox có cầm chắc tay ; dễ rửa ; đủ size cơ bản. | Góc cần biết: Nội dung chỉ dùng dữ kiện trong brief. Nếu cần so sánh thêm thì nên hỏi shop trước khi mua. | CTA mềm: Lưu lại sản phẩm hoặc nhắn shop để được tư vấn đúng nhu cầu BO_DAO_BEP_INOX.
```

## T-011 - social - bộ dao bếp inox

### Trước fine-tuning
Chọn model base `gemini-flash` hoặc `gemini-2.5-flash`, rồi paste prompt này:
```text
Viết social cho sản phẩm bộ dao bếp inox.
Đối tượng: người nấu ăn tại nhà.
Lợi ích chính: cầm chắc tay ; dễ rửa ; đủ size cơ bản.
Ưu đãi: tặng thanh mài dao.
Tone: emotional.
Không cần giải thích quá trình viết.
```

### Sau fine-tuning
Chọn model fine-tuned đã promote trong Generator, rồi paste lại đúng prompt trên. Prompt không đổi; chỉ đổi model.

### Output mong đợi sau fine-tuning
```text
Mở bài: Có những món không cần nói quá nhiều vẫn thấy hợp nhu cầu hằng ngày. | Điểm đáng cân nhắc: bộ dao bếp inox dành cho người nấu ăn tại nhà với cầm chắc tay ; dễ rửa ; đủ size cơ bản. | Góc cần biết: tặng thanh mài dao. Hat Moc ưu tiên nói rõ lợi ích và tránh tạo cảm giác phải mua ngay. | CTA mềm: Nếu đang phân vân thì nhắn shop hỏi thêm trước khi chọn.
```

## T-012 - email - bộ dao bếp inox

### Trước fine-tuning
Chọn model base `gemini-flash` hoặc `gemini-2.5-flash`, rồi paste prompt này:
```text
Viết email cho sản phẩm bộ dao bếp inox.
Đối tượng: người nấu ăn tại nhà.
Lợi ích chính: cầm chắc tay ; dễ rửa ; đủ size cơ bản.
Ưu đãi: tặng thanh mài dao.
Tone: urgent.
Không cần giải thích quá trình viết.
```

### Sau fine-tuning
Chọn model fine-tuned đã promote trong Generator, rồi paste lại đúng prompt trên. Prompt không đổi; chỉ đổi model.

### Output mong đợi sau fine-tuning
```text
Subject: Gợi ý bộ dao bếp inox cho nhu cầu hằng ngày | Preview text: Thông tin ngắn gọn để bạn cân nhắc trước khi mua. | Nội dung: Nếu bạn là người nấu ăn tại nhà thì bộ dao bếp inox là lựa chọn đáng xem nhờ cầm chắc tay ; dễ rửa ; đủ size cơ bản. Ưu đãi hiện có là tặng thanh mài dao. | Góc cần biết: Email này không phóng đại hiệu quả và không thêm số liệu ngoài brief. | CTA mềm: Xem chi tiết rồi chọn khi thấy thật sự phù hợp.
```

## T-013 - headline - loa bluetooth chống nước

### Trước fine-tuning
Chọn model base `gemini-flash` hoặc `gemini-2.5-flash`, rồi paste prompt này:
```text
Viết headline cho sản phẩm loa bluetooth chống nước.
Đối tượng: người nghe nhạc khi du lịch.
Lợi ích chính: chống nước nhẹ ; âm lượng ổn định ; pin dùng lâu.
Ưu đãi: bảo hành 6 tháng.
Tone: professional.
Không cần giải thích quá trình viết.
```

### Sau fine-tuning
Chọn model fine-tuned đã promote trong Generator, rồi paste lại đúng prompt trên. Prompt không đổi; chỉ đổi model.

### Output mong đợi sau fine-tuning
```text
Headline: loa bluetooth chống nước cho người nghe nhạc khi du lịch | Lý do chọn: chống nước nhẹ ; âm lượng ổn định ; pin dùng lâu. | Góc cần biết: Giọng Hat Moc giữ câu chữ chắc và đi thẳng vào nhu cầu. Không thêm cam kết ngoài brief. | CTA mềm: Nhắn shop hỏi thêm trước khi chọn LOA_BLUETOOTH_CHONG_NUOC.
```

## T-014 - description - loa bluetooth chống nước

### Trước fine-tuning
Chọn model base `gemini-flash` hoặc `gemini-2.5-flash`, rồi paste prompt này:
```text
Viết description cho sản phẩm loa bluetooth chống nước.
Đối tượng: người nghe nhạc khi du lịch.
Lợi ích chính: chống nước nhẹ ; âm lượng ổn định ; pin dùng lâu.
Ưu đãi: bảo hành 6 tháng.
Tone: friendly.
Không cần giải thích quá trình viết.
```

### Sau fine-tuning
Chọn model fine-tuned đã promote trong Generator, rồi paste lại đúng prompt trên. Prompt không đổi; chỉ đổi model.

### Output mong đợi sau fine-tuning
```text
Phù hợp với: người nghe nhạc khi du lịch muốn một lựa chọn dễ dùng và không cần đọc quá nhiều thông tin rối. | Điểm nổi bật: loa bluetooth chống nước có chống nước nhẹ ; âm lượng ổn định ; pin dùng lâu. | Góc cần biết: Nội dung chỉ dùng dữ kiện trong brief. Nếu cần so sánh thêm thì nên hỏi shop trước khi mua. | CTA mềm: Lưu lại sản phẩm hoặc nhắn shop để được tư vấn đúng nhu cầu LOA_BLUETOOTH_CHONG_NUOC.
```

## T-015 - social - loa bluetooth chống nước

### Trước fine-tuning
Chọn model base `gemini-flash` hoặc `gemini-2.5-flash`, rồi paste prompt này:
```text
Viết social cho sản phẩm loa bluetooth chống nước.
Đối tượng: người nghe nhạc khi du lịch.
Lợi ích chính: chống nước nhẹ ; âm lượng ổn định ; pin dùng lâu.
Ưu đãi: bảo hành 6 tháng.
Tone: emotional.
Không cần giải thích quá trình viết.
```

### Sau fine-tuning
Chọn model fine-tuned đã promote trong Generator, rồi paste lại đúng prompt trên. Prompt không đổi; chỉ đổi model.

### Output mong đợi sau fine-tuning
```text
Mở bài: Có những món không cần nói quá nhiều vẫn thấy hợp nhu cầu hằng ngày. | Điểm đáng cân nhắc: loa bluetooth chống nước dành cho người nghe nhạc khi du lịch với chống nước nhẹ ; âm lượng ổn định ; pin dùng lâu. | Góc cần biết: bảo hành 6 tháng. Hat Moc ưu tiên nói rõ lợi ích và tránh tạo cảm giác phải mua ngay. | CTA mềm: Nếu đang phân vân thì nhắn shop hỏi thêm trước khi chọn.
```

## T-016 - email - loa bluetooth chống nước

### Trước fine-tuning
Chọn model base `gemini-flash` hoặc `gemini-2.5-flash`, rồi paste prompt này:
```text
Viết email cho sản phẩm loa bluetooth chống nước.
Đối tượng: người nghe nhạc khi du lịch.
Lợi ích chính: chống nước nhẹ ; âm lượng ổn định ; pin dùng lâu.
Ưu đãi: bảo hành 6 tháng.
Tone: urgent.
Không cần giải thích quá trình viết.
```

### Sau fine-tuning
Chọn model fine-tuned đã promote trong Generator, rồi paste lại đúng prompt trên. Prompt không đổi; chỉ đổi model.

### Output mong đợi sau fine-tuning
```text
Subject: Gợi ý loa bluetooth chống nước cho nhu cầu hằng ngày | Preview text: Thông tin ngắn gọn để bạn cân nhắc trước khi mua. | Nội dung: Nếu bạn là người nghe nhạc khi du lịch thì loa bluetooth chống nước là lựa chọn đáng xem nhờ chống nước nhẹ ; âm lượng ổn định ; pin dùng lâu. Ưu đãi hiện có là bảo hành 6 tháng. | Góc cần biết: Email này không phóng đại hiệu quả và không thêm số liệu ngoài brief. | CTA mềm: Xem chi tiết rồi chọn khi thấy thật sự phù hợp.
```

## T-017 - headline - máy sấy tóc ion âm

### Trước fine-tuning
Chọn model base `gemini-flash` hoặc `gemini-2.5-flash`, rồi paste prompt này:
```text
Viết headline cho sản phẩm máy sấy tóc ion âm.
Đối tượng: người tóc dễ xơ sau khi gội.
Lợi ích chính: 3 mức nhiệt ; đầu sấy hẹp ; gió ổn định.
Ưu đãi: tặng lược gỡ rối.
Tone: professional.
Không cần giải thích quá trình viết.
```

### Sau fine-tuning
Chọn model fine-tuned đã promote trong Generator, rồi paste lại đúng prompt trên. Prompt không đổi; chỉ đổi model.

### Output mong đợi sau fine-tuning
```text
Headline: máy sấy tóc ion âm cho người tóc dễ xơ sau khi gội | Lý do chọn: 3 mức nhiệt ; đầu sấy hẹp ; gió ổn định. | Góc cần biết: Giọng Hat Moc giữ câu chữ chắc và đi thẳng vào nhu cầu. Không thêm cam kết ngoài brief. | CTA mềm: Nhắn shop hỏi thêm trước khi chọn MAY_SAY_TOC_ION_AM.
```

## T-018 - description - máy sấy tóc ion âm

### Trước fine-tuning
Chọn model base `gemini-flash` hoặc `gemini-2.5-flash`, rồi paste prompt này:
```text
Viết description cho sản phẩm máy sấy tóc ion âm.
Đối tượng: người tóc dễ xơ sau khi gội.
Lợi ích chính: 3 mức nhiệt ; đầu sấy hẹp ; gió ổn định.
Ưu đãi: tặng lược gỡ rối.
Tone: friendly.
Không cần giải thích quá trình viết.
```

### Sau fine-tuning
Chọn model fine-tuned đã promote trong Generator, rồi paste lại đúng prompt trên. Prompt không đổi; chỉ đổi model.

### Output mong đợi sau fine-tuning
```text
Phù hợp với: người tóc dễ xơ sau khi gội muốn một lựa chọn dễ dùng và không cần đọc quá nhiều thông tin rối. | Điểm nổi bật: máy sấy tóc ion âm có 3 mức nhiệt ; đầu sấy hẹp ; gió ổn định. | Góc cần biết: Nội dung chỉ dùng dữ kiện trong brief. Nếu cần so sánh thêm thì nên hỏi shop trước khi mua. | CTA mềm: Lưu lại sản phẩm hoặc nhắn shop để được tư vấn đúng nhu cầu MAY_SAY_TOC_ION_AM.
```

## T-019 - social - máy sấy tóc ion âm

### Trước fine-tuning
Chọn model base `gemini-flash` hoặc `gemini-2.5-flash`, rồi paste prompt này:
```text
Viết social cho sản phẩm máy sấy tóc ion âm.
Đối tượng: người tóc dễ xơ sau khi gội.
Lợi ích chính: 3 mức nhiệt ; đầu sấy hẹp ; gió ổn định.
Ưu đãi: tặng lược gỡ rối.
Tone: emotional.
Không cần giải thích quá trình viết.
```

### Sau fine-tuning
Chọn model fine-tuned đã promote trong Generator, rồi paste lại đúng prompt trên. Prompt không đổi; chỉ đổi model.

### Output mong đợi sau fine-tuning
```text
Mở bài: Có những món không cần nói quá nhiều vẫn thấy hợp nhu cầu hằng ngày. | Điểm đáng cân nhắc: máy sấy tóc ion âm dành cho người tóc dễ xơ sau khi gội với 3 mức nhiệt ; đầu sấy hẹp ; gió ổn định. | Góc cần biết: tặng lược gỡ rối. Hat Moc ưu tiên nói rõ lợi ích và tránh tạo cảm giác phải mua ngay. | CTA mềm: Nếu đang phân vân thì nhắn shop hỏi thêm trước khi chọn.
```

## T-020 - email - máy sấy tóc ion âm

### Trước fine-tuning
Chọn model base `gemini-flash` hoặc `gemini-2.5-flash`, rồi paste prompt này:
```text
Viết email cho sản phẩm máy sấy tóc ion âm.
Đối tượng: người tóc dễ xơ sau khi gội.
Lợi ích chính: 3 mức nhiệt ; đầu sấy hẹp ; gió ổn định.
Ưu đãi: tặng lược gỡ rối.
Tone: urgent.
Không cần giải thích quá trình viết.
```

### Sau fine-tuning
Chọn model fine-tuned đã promote trong Generator, rồi paste lại đúng prompt trên. Prompt không đổi; chỉ đổi model.

### Output mong đợi sau fine-tuning
```text
Subject: Gợi ý máy sấy tóc ion âm cho nhu cầu hằng ngày | Preview text: Thông tin ngắn gọn để bạn cân nhắc trước khi mua. | Nội dung: Nếu bạn là người tóc dễ xơ sau khi gội thì máy sấy tóc ion âm là lựa chọn đáng xem nhờ 3 mức nhiệt ; đầu sấy hẹp ; gió ổn định. Ưu đãi hiện có là tặng lược gỡ rối. | Góc cần biết: Email này không phóng đại hiệu quả và không thêm số liệu ngoài brief. | CTA mềm: Xem chi tiết rồi chọn khi thấy thật sự phù hợp.
```

## T-021 - headline - túi tote canvas có ngăn laptop

### Trước fine-tuning
Chọn model base `gemini-flash` hoặc `gemini-2.5-flash`, rồi paste prompt này:
```text
Viết headline cho sản phẩm túi tote canvas có ngăn laptop.
Đối tượng: người đi học đi làm cần túi gọn.
Lợi ích chính: ngăn laptop riêng ; vải dày ; dễ phối đồ.
Ưu đãi: giảm 15 phần trăm cho màu mới.
Tone: professional.
Không cần giải thích quá trình viết.
```

### Sau fine-tuning
Chọn model fine-tuned đã promote trong Generator, rồi paste lại đúng prompt trên. Prompt không đổi; chỉ đổi model.

### Output mong đợi sau fine-tuning
```text
Headline: túi tote canvas có ngăn laptop cho người đi học đi làm cần túi gọn | Lý do chọn: ngăn laptop riêng ; vải dày ; dễ phối đồ. | Góc cần biết: Giọng Hat Moc giữ câu chữ chắc và đi thẳng vào nhu cầu. Không thêm cam kết ngoài brief. | CTA mềm: Nhắn shop hỏi thêm trước khi chọn TUI_TOTE_CANVAS_CO_NGAN_LAPTOP.
```

## T-022 - description - túi tote canvas có ngăn laptop

### Trước fine-tuning
Chọn model base `gemini-flash` hoặc `gemini-2.5-flash`, rồi paste prompt này:
```text
Viết description cho sản phẩm túi tote canvas có ngăn laptop.
Đối tượng: người đi học đi làm cần túi gọn.
Lợi ích chính: ngăn laptop riêng ; vải dày ; dễ phối đồ.
Ưu đãi: giảm 15 phần trăm cho màu mới.
Tone: friendly.
Không cần giải thích quá trình viết.
```

### Sau fine-tuning
Chọn model fine-tuned đã promote trong Generator, rồi paste lại đúng prompt trên. Prompt không đổi; chỉ đổi model.

### Output mong đợi sau fine-tuning
```text
Phù hợp với: người đi học đi làm cần túi gọn muốn một lựa chọn dễ dùng và không cần đọc quá nhiều thông tin rối. | Điểm nổi bật: túi tote canvas có ngăn laptop có ngăn laptop riêng ; vải dày ; dễ phối đồ. | Góc cần biết: Nội dung chỉ dùng dữ kiện trong brief. Nếu cần so sánh thêm thì nên hỏi shop trước khi mua. | CTA mềm: Lưu lại sản phẩm hoặc nhắn shop để được tư vấn đúng nhu cầu TUI_TOTE_CANVAS_CO_NGAN_LAPTOP.
```

## T-023 - social - túi tote canvas có ngăn laptop

### Trước fine-tuning
Chọn model base `gemini-flash` hoặc `gemini-2.5-flash`, rồi paste prompt này:
```text
Viết social cho sản phẩm túi tote canvas có ngăn laptop.
Đối tượng: người đi học đi làm cần túi gọn.
Lợi ích chính: ngăn laptop riêng ; vải dày ; dễ phối đồ.
Ưu đãi: giảm 15 phần trăm cho màu mới.
Tone: emotional.
Không cần giải thích quá trình viết.
```

### Sau fine-tuning
Chọn model fine-tuned đã promote trong Generator, rồi paste lại đúng prompt trên. Prompt không đổi; chỉ đổi model.

### Output mong đợi sau fine-tuning
```text
Mở bài: Có những món không cần nói quá nhiều vẫn thấy hợp nhu cầu hằng ngày. | Điểm đáng cân nhắc: túi tote canvas có ngăn laptop dành cho người đi học đi làm cần túi gọn với ngăn laptop riêng ; vải dày ; dễ phối đồ. | Góc cần biết: giảm 15 phần trăm cho màu mới. Hat Moc ưu tiên nói rõ lợi ích và tránh tạo cảm giác phải mua ngay. | CTA mềm: Nếu đang phân vân thì nhắn shop hỏi thêm trước khi chọn.
```

## T-024 - email - túi tote canvas có ngăn laptop

### Trước fine-tuning
Chọn model base `gemini-flash` hoặc `gemini-2.5-flash`, rồi paste prompt này:
```text
Viết email cho sản phẩm túi tote canvas có ngăn laptop.
Đối tượng: người đi học đi làm cần túi gọn.
Lợi ích chính: ngăn laptop riêng ; vải dày ; dễ phối đồ.
Ưu đãi: giảm 15 phần trăm cho màu mới.
Tone: urgent.
Không cần giải thích quá trình viết.
```

### Sau fine-tuning
Chọn model fine-tuned đã promote trong Generator, rồi paste lại đúng prompt trên. Prompt không đổi; chỉ đổi model.

### Output mong đợi sau fine-tuning
```text
Subject: Gợi ý túi tote canvas có ngăn laptop cho nhu cầu hằng ngày | Preview text: Thông tin ngắn gọn để bạn cân nhắc trước khi mua. | Nội dung: Nếu bạn là người đi học đi làm cần túi gọn thì túi tote canvas có ngăn laptop là lựa chọn đáng xem nhờ ngăn laptop riêng ; vải dày ; dễ phối đồ. Ưu đãi hiện có là giảm 15 phần trăm cho màu mới. | Góc cần biết: Email này không phóng đại hiệu quả và không thêm số liệu ngoài brief. | CTA mềm: Xem chi tiết rồi chọn khi thấy thật sự phù hợp.
```

