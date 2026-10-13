# Chi tiết tuyến tính của khóa luận

**Đề tài:** Phương pháp kiểm chứng tuyên bố về thông số kỹ thuật có điều kiện ràng buộc trong quảng cáo  
**Sinh viên:** Bùi Lê Huy Phước (23521228) · **CBHD** (cán bộ hướng dẫn): ThS Trần Hồng Nghi · **Hạn nộp:** 31/12/2026  
Kế hoạch bám theo [đề cương bản cuối](de_cuong/23521228_BuiLeHuyPhuoc_DeCuongKLTN.pdf) ngày 11/10/2026. Cập nhật lần cuối: 11/10/2026.

> **Cách dùng file này**
>
> 1. Đọc từ trên xuống, làm lần lượt **Bước 1 → Bước 47**. Xong bước trước mới sang bước sau. Hôm nay (11/10/2026) **bắt đầu ở [Bước 1](#b01)**.
> 2. Mỗi bước ghi ngày làm, việc cần làm, tệp phải làm ra và khi nào là xong. Làm xong việc nào thì sửa `- [ ]` thành `- [x]` ở việc đó; xong cả bước thì đánh dấu bước đó trong danh sách ngay dưới đây.
> 3. 🏁 là mốc phải gửi kết quả cho CBHD. ⭐ là phần mở rộng, chỉ làm khi đúng tiến độ.
> 4. Các đường dẫn bắt đầu bằng chữ T (ví dụ T4.3, T10) trỏ tới [phần Tra cứu](#tra-cuu) ở cuối file: định nghĩa nhãn, đặc tả phương pháp, cách đánh giá, rủi ro, chữ viết tắt. Chỉ mở khi bước đang làm nhắc tới.
> 5. Chậm hơn ngày ghi ở bước đang làm quá 2 ngày thì áp dụng ngay thứ tự rút gọn ở [T9.2](#t9-2), không dồn việc sang tuần sau.

## Danh sách việc từ đầu đến cuối

**Tháng 10/2026**

- [ ] [Bước 1](#b01) · 11/10 – 12/10 · Sửa và nộp đề cương, chốt tên đề tài
- 🏁 [**Mốc 1** · 12/10 · Chốt đề cương](#m1)
- [ ] [Bước 2](#b02) · 13/10 · Dựng môi trường thực nghiệm, thử LLM
- [ ] [Bước 3](#b03) · 14/10 – 15/10 · Khảo sát tài liệu, ghi chú có số trang
- [ ] [Bước 4](#b04) · 16/10 · Chọn 12 mẫu sản phẩm, chia trước hai tập
- [ ] [Bước 5](#b05) · 17/10 · Thu thập trang thông số của 2 mẫu thử
- [ ] [Bước 6](#b06) · 18/10 · Thu thập trang thông số của 10 mẫu còn lại
- [ ] [Bước 7](#b07) · 19/10 · Chia tài liệu thành đoạn
- [ ] [Bước 8](#b08) · 20/10 – 21/10 · Viết tệp cấu hình điều kiện bắt buộc
- [ ] [Bước 9](#b09) · 21/10 – 22/10 · Viết hướng dẫn gán nhãn bốn lớp và ví dụ
- [ ] [Bước 10](#b10) · 23/10 · Khảo sát cách hiểu của 5–10 người đọc
- [ ] [Bước 11](#b11) · 24/10 – 25/10 · Làm công cụ sinh quảng cáo qua CopyPro
- [ ] [Bước 12](#b12) · 26/10 · Sinh quảng cáo và tách tuyên bố của bộ thử
- [ ] [Bước 13](#b13) · 27/10 · Gán nhãn bộ thử, đo thời gian gán
- [ ] [Bước 14](#b14) · 28/10 · Làm mô-đun truy hồi BM25, đo Recall@k
- [ ] [Bước 15](#b15) · 29/10 · Cài đặt đối chứng B0
- [ ] [Bước 16](#b16) · 30/10 – 31/10 · Phân tích bộ thử, chốt hướng dẫn và quy mô
- 🏁 [**Mốc 2** · 31/10 · Xong bộ thử](#m2)

**Tháng 11/2026**

- [ ] [Bước 17](#b17) · 01/11 – 02/11 · Viết nháp Chương 1 và Chương 2
- [ ] [Bước 18](#b18) · 03/11 · Sinh quảng cáo cho 10 mẫu còn lại
- [ ] [Bước 19](#b19) · 04/11 · Tách tuyên bố của tập phát triển
- [ ] [Bước 20](#b20) · 05/11 – 06/11 · Gán nhãn tập phát triển
- [ ] [Bước 21](#b21) · 07/11 · Chuẩn hóa sản phẩm, giá trị, đơn vị, kiểu giá trị
- [ ] [Bước 22](#b22) · 08/11 – 10/11 · Trích xuất có neo nguồn và kiểm tra đầy đủ
- [ ] [Bước 23](#b23) · 11/11 · Tách tuyên bố của tập kiểm tra
- [ ] [Bước 24](#b24) · 12/11 – 13/11 · Gán nhãn tập kiểm tra
- [ ] [Bước 25](#b25) · 14/11 – 15/11 · Tạo tập cặp tối thiểu
- [ ] [Bước 26](#b26) · 16/11 · Ghi chính thức cách chia tập, gửi việc cho người gán thứ hai
- [ ] [Bước 27](#b27) · 17/11 – 19/11 · Cài bộ quyết định A–D, sinh lý do, kiểm thử
- [ ] [Bước 28](#b28) · 20/11 · Ghép phương pháp P, đo độ đúng trích xuất
- [ ] [Bước 29](#b29) · 21/11 · Tách và lọc tuyên bố tự động
- [ ] [Bước 30](#b30) · 22/11 – 23/11 · Cài đặt đối chứng B1, B2, B3
- [ ] [Bước 31](#b31) · 24/11 · Làm hai bản bỏ thành phần P−ĐK, P−NN
- [ ] [Bước 32](#b32) · 24/11 – 25/11 · Đo độ tin cậy nhãn: gán lại 20%, tính kappa
- [ ] [Bước 33](#b33) · 26/11 – 27/11 · Chọn cấu hình, khóa cấu hình, niêm phong nhãn
- 🏁 [**Mốc 3** · 27/11 · Khóa cấu hình](#m3)
- [ ] [Bước 34](#b34) · 28/11 – 29/11 · Làm dịch vụ kiểm chứng (API)
- [ ] [Bước 35](#b35) · 30/11 – 01/12 · Viết nháp Chương 3

**Tháng 12/2026**

- [ ] [Bước 36](#b36) · 02/12 · Chạy tập kiểm tra một lần
- [ ] [Bước 37](#b37) · 03/12 – 04/12 · Tính chỉ số, khoảng tin cậy, kiểm định
- [ ] [Bước 38](#b38) · 05/12 – 06/12 · Phân tích lỗi theo nguồn gốc
- [ ] [Bước 39](#b39) · 07/12 – 08/12 · Kết luận giả thuyết, viết phần kết quả
- 🏁 [**Mốc 4** · 08/12 · Có kết quả tập kiểm tra](#m4)
- [ ] [Bước 40](#b40) · 09/12 – 12/12 · Tích hợp vào CopyPro: backend và giao diện
- [ ] [Bước 41](#b41) · 13/12 · Kiểm tra tính năng, đo thời gian, quay video
- 🏁 [**Mốc 5** · 13/12 · Tính năng chạy trên CopyPro](#m5)
- [ ] [Bước 42](#b42) · 14/12 – 18/12 · Viết Chương 4–6, gửi bản thảo đầy đủ
- 🏁 [**Mốc 6** · 18/12 · Bản thảo đầy đủ](#m6)
- [ ] [Bước 43](#b43) · 19/12 – 21/12 · Phần mở rộng: B4 và thử trên máy tính bảng ⭐ *(chỉ làm khi đúng tiến độ)*
- [ ] [Bước 44](#b44) · 22/12 – 25/12 · Sửa khóa luận theo góp ý của CBHD
- [ ] [Bước 45](#b45) · 26/12 – 27/12 · Gói tái lập: hướng dẫn cài đặt và chạy lại
- [ ] [Bước 46](#b46) · 28/12 – 31/12 · Kiểm tra cuối và nộp
- 🏁 [**Mốc 7** · 31/12 · Nộp](#m7)

**Sau khi nộp**

- [ ] [Bước 47](#b47) · theo lịch của Khoa · Chuẩn bị bảo vệ

---

<a id="thang-10"></a>

## Tháng 10/2026 · Chốt đề cương, chuẩn bị, làm thử trên 2 mẫu

> **Cuối tháng phải có:** bộ thử khoảng 60 tuyên bố của 2 mẫu thử đã gán nhãn; BM25 và B0 chạy được trên bộ thử; hướng dẫn gán nhãn bản 2; quy mô dữ liệu đã chốt ([Mốc 2](#m2), 31/10).

<a id="b01"></a>

### Bước 1 · Sửa và nộp đề cương, chốt tên đề tài

**Ngày:** Chủ nhật 11/10 – Thứ Hai 12/10 · **Thời lượng:** khoảng 2 giờ · **Thuộc:** Việc chung · **Kết thúc bằng:** [Mốc 1](#m1)

**Để làm gì.** Chốt đề cương và tên đề tài với CBHD đúng hạn 12/10. Đề cương bản cuối là chuẩn cho mọi bước sau.

> Bản gửi CBHD là `de_cuong/23521228_BuiLeHuyPhuoc_DeCuongKLTN.pdf`, xuất từ `de_cuong/23521228_BuiLeHuyPhuoc_DeCuongKLTN_ban_cuoi.docx`: bản Google Docs ngày 11/10/2026 tải về dạng .docx, đã sửa các chỗ dưới đây. File Google Docs vẫn là nội dung cũ, nên nếu còn sửa đề cương thì sửa trên tệp `_ban_cuoi.docx` này (hoặc mở nó bằng Google Docs) rồi xuất lại PDF. Hai tệp `23521228_BuiLeHuyPhuoc_DeCuongKLTN.docx` và `..._chu_do.docx` là bản dựng bằng script trước khi chuyển sang Google Docs, đã cũ, không sửa.

**Việc cần làm**

- [x] Sửa bốn chỗ còn sót trong bản ngày 11/10/2026:
  - **Trích dẫn MeasEval (đã sửa).** Ba mục cuối của danh mục xếp lại thành [14] MeasEval, [15] VitaminC, [16] BM25, đúng thứ tự xuất hiện trong bài theo chuẩn IEEE. Trong bài: "MeasEval [14]" (mục Tính mới), "VitaminC [15]" (mục Đóng góp), "theo mức độ liên quan [16]" (Nội dung 2).
  - **Bảy trường (đã sửa).** Nội dung 2 ghi "điền bảy trường thông số (sản phẩm, phiên bản, bộ phận, thông số, giá trị, đơn vị, điều kiện áp dụng cùng kiểu giá trị)" thay cho "nêu ở mục 3".
  - **Hình 1 (đã sửa).** Chỉ khối "Bộ quyết định" có nền xanh; khối "Trích xuất bộ thông số có neo nguồn" để nền trắng, khớp chú thích "khối nền xanh là bước chứa điểm mới của đề tài".
  - **Phân công công việc (đã thêm).** Mục "3. Phân công công việc" ngay trước "Tài liệu tham khảo": "Sinh viên Bùi Lê Huy Phước thực hiện toàn bộ công việc của đề tài. Người gán nhãn thứ hai chỉ gán độc lập khoảng 60 tuyên bố theo cùng hướng dẫn để tính hệ số kappa của Cohen."
- [x] Sửa các lỗi nhỏ: mục Đóng góp ghi tên nhãn tiếng Việt "(Đúng, Sai, Lệch điều kiện, Chưa đủ thông tin)"; thêm dấu chấm cuối rủi ro thứ năm; thống nhất thuật ngữ "tuyên bố" ở ba chỗ còn ghi "phát biểu" (Nội dung 1: "từng tuyên bố nhỏ của FactLens"; Thời gian biểu tháng 09/2026: "kiểm chứng tuyên bố chứa số liệu", "để tuyên bố không thay đổi ý nghĩa"), giữ "phát biểu chính trị" khi nói về dữ liệu của Tang và cộng sự.
- [x] Sửa định dạng: bản tải từ Google Docs không ghi phông mặc định và cấm nhiều hàng của khung bảng ngắt trang, nên mở ở chỗ khác bị đổi phông và có chỗ trống đến nửa trang. Bản cuối đặt Times New Roman làm phông mặc định, cho các hàng ngắt trang bình thường, chỉ giữ trọn hàng khi cần để tiêu đề không nằm một mình cuối trang (19 trang).
- [x] Xuất lại PDF, thay tệp `de_cuong/23521228_BuiLeHuyPhuoc_DeCuongKLTN.pdf` trong repo và commit.
- [ ] Gửi đề cương cho CBHD và nộp theo lịch của Khoa.
- [ ] Cập nhật tên đề tài trên hệ thống đăng ký; so từng ký tự với đề cương, cả tên tiếng Anh.
- [ ] Hỏi CBHD có đồng ý nhờ một bạn làm người gán nhãn thứ hai cho khoảng 60 tuyên bố không. Người này nhận việc vào 16/11 ([Bước 26](#b26)).

**Làm ra:** đề cương bản nộp; tên đề tài trên hệ thống khớp với đề cương.

**Xong khi:** CBHD xác nhận đề cương và tên đề tài.

**Tra cứu:** [T1](#t1) (đề tài trong một trang), [T14](#t14) (đối chiếu kế hoạch với đề cương).

<a id="m1"></a>

### 🏁 Mốc 1 · Thứ Hai 12/10 · Chốt đề cương

- **Phải có:** Đề cương và tên đề tài được CBHD xác nhận.
- **Gửi CBHD:** Đề cương bản cuối (PDF).
- **Trước khi gửi:** mọi bước trước mốc đã đánh dấu xong; tự kiểm theo [T15](#t15).

<a id="b02"></a>

### Bước 2 · Dựng môi trường thực nghiệm, thử LLM

**Ngày:** Thứ Ba 13/10 · **Thời lượng:** khoảng 5 giờ · **Thuộc:** Việc chung

> Bước này gồm cả việc tháng 9 của đề cương: cấu trúc lưu dữ liệu, kiểm tra tài nguyên máy, thử các LLM mã nguồn mở. Phần nào đã làm thì chỉ kiểm tra lại rồi đánh dấu xong.

**Để làm gì.** Có chỗ chứa dữ liệu, mã nguồn, kết quả và nháp khóa luận trước khi thu dữ liệu; biết máy và các API miễn phí chạy được LLM nào.

**Việc cần làm**

- [ ] Tạo các thư mục `data/`, `src/kiemchung/`, `tests/`, `scripts/`, `ket_qua/`, `luan_van/` theo [T3.1](#t3-1). Tạo `luan_van/nhat_ky.md` và ghi dòng nhật ký đầu tiên ([T3.5](#t3-5)).
- [ ] Tạo `requirements.txt`: Python ≥ 3.10, `rank-bm25`, `pyvi` hoặc `underthesea`, `pydantic`, `pyyaml`, `google-genai`, `groq`, `fastapi`, `uvicorn`, `pytest`, `scikit-learn`, `statsmodels`, `pandas`, `matplotlib`, `playwright`.
- [ ] Tạo `.env.example` chỉ chứa tên biến (`GEMINI_API_KEY`, `GROQ_API_KEY`); khóa thật chỉ để trong `.env` trên máy.
- [ ] Lịch sử Git của repo từng chứa tệp `.env`. Nếu khóa trong đó chưa thu hồi thì thu hồi ở trang của nhà cung cấp và tạo khóa mới.
- [ ] Viết `src/kiemchung/llm.py`: một hàm gọi LLM duy nhất, **có bộ nhớ đệm** theo mã băm của (mô hình, câu lệnh, tham số) và ghi nhật ký mọi lần gọi.
- [ ] Ghi cấu hình máy (CPU, RAM, GPU nếu có), dung lượng ổ đĩa còn trống, hạn mức gọi API miễn phí của Google AI Studio và Groq.
- [ ] Thử vài LLM (mã nguồn mở chạy trên máy, hoặc qua API như Groq) với 5–10 câu trích xuất mẫu lấy từ các ví dụ ở [T4.6](#t4-6); ghi thời gian và chất lượng sơ bộ.

**Làm ra:** cây thư mục, `requirements.txt`, `.env.example`, `src/kiemchung/llm.py`, `ket_qua/thu_llm.md`.

**Xong khi:** `pytest` chạy được; lệnh `git check-ignore .env` in ra `.env`; gọi cùng một câu lệnh hai lần thì lần hai lấy từ bộ nhớ đệm; có danh sách LLM ứng viên.

**Tra cứu:** [T3.1](#t3-1) (cấu trúc thư mục), [T3.5](#t3-5) (quy tắc làm việc).

<a id="b03"></a>

### Bước 3 · Khảo sát tài liệu, ghi chú có số trang

**Ngày:** Thứ Tư 14/10 – Thứ Năm 15/10 · **Thời lượng:** khoảng 8 giờ · **Thuộc:** Việc chung

> Bước này gồm việc tháng 9 (khảo sát nghiên cứu về kiểm chứng thông tin, truy hồi bằng chứng, tuyên bố chứa số liệu, suy luận có điều kiện) và việc khảo sát bổ sung tháng 10 của đề cương. Phần nào đã làm thì chỉ kiểm tra lại rồi đánh dấu xong.

**Để làm gì.** Nắm các hướng kiểm chứng đã có, để viết Chương 2 và trả lời được câu "đề tài khác gì các bài trước".

**Việc cần làm**

- [ ] Gom đủ bài gốc. Thư mục `báo/` hiện có 6 bài của đề cương cũ, đánh số theo danh mục cũ: `[1].pdf` là Nguyen và cộng sự ([12] trong danh mục mới), `[2].pdf` là FactLens ([10]), `[6].pdf` là Fathom ([13]); ba bài còn lại không còn trong danh mục mới. Tải các bài còn thiếu và đặt tên tệp theo tên bài (ví dụ `FEVER.pdf`), vì số thứ tự có thể đổi khi sửa đề cương.
- [ ] Đọc các nhóm nghiên cứu trong đề cương: kiểm chứng tự động (FEVER [2], AVeriTeC [3]); tuyên bố nửa sự thật (Tang và cộng sự [4]); kiểm chứng tiếng Việt (ViFactCheck [5], ViNumFCR [6], SemViQA [7]); tuyên bố số liệu (NumPert [8], VeriFin [9]); văn bản do LLM tạo (FactLens [10], MiniCheck [11]); kiểm chứng quảng cáo và mô tả sản phẩm (Nguyen và cộng sự [12], Jiang và cộng sự [1]); truy hồi bằng chứng (Fathom [13], BM25 [16]); thông tin đi kèm số đo (MeasEval [14]); cặp tương phản (VitaminC [15]).
- [ ] Khảo sát bổ sung theo đề cương tháng 10: ảo giác của LLM, tuyên bố nửa sự thật, kiểm chứng kết hợp ký hiệu, kiểm chứng tiếng Việt.
- [ ] Mỗi bài ghi: bài toán, dữ liệu, cách gán nhãn, kết quả chính, hạn chế so với đề tài, và **số trang** của từng ý sẽ trích.
- [ ] Đối chiếu các con số đề cương đã trích với bài gốc, ví dụ: Fathom đạt F1 bằng 0 ở nhãn Conflicting/Cherry-picking trên tập phát triển AVeriTeC; NumPert giảm độ chính xác đến 62%; MiniCheck rẻ hơn GPT-4 khoảng 400 lần.

**Làm ra:** `luan_van/ghi_chu_tai_lieu.md`.

**Xong khi:** mỗi câu nói về bài khác trong đề cương có số trang trong bài gốc.

**Tra cứu:** [T1.5](#t1-5) (tính mới và đóng góp), [T8.1](#t8-1) (dàn ý Chương 2), [T11](#t11) (câu hỏi phản biện).

<a id="b04"></a>

### Bước 4 · Chọn 12 mẫu sản phẩm, chia trước hai tập

**Ngày:** Thứ Sáu 16/10 · **Thời lượng:** khoảng 3 giờ · **Thuộc:** Nội dung 1 (dữ liệu)

> Bước này gồm việc tháng 9 "xây dựng tiêu chí chọn nguồn" của đề cương.

**Để làm gì.** Chọn đúng 12 mẫu và chia trước tập phát triển và tập kiểm tra, để thông tin của tập kiểm tra không lọt vào lúc phát triển phương pháp.

**Việc cần làm**

- [ ] Ghi tiêu chí chọn nguồn vào `data/THE_DU_LIEU.md` (mục "Nguồn"; thẻ dữ liệu được hoàn thiện ở Bước 45): trang thông số chính thức tiếng Việt của hãng; có con số kèm chú thích điều kiện; ghi được đường dẫn và ngày truy cập.
- [ ] Mở trang thông số tiếng Việt của các ứng viên; chỉ giữ mẫu có ít nhất 3 thông số kèm điều kiện:
  - điện thoại: iPhone 17, Xiaomi 15T, OPPO Find X8, một mẫu Galaxy S, một mẫu khác;
  - tai nghe: Galaxy Buds3 Pro, AirPods Pro 3, AirPods 4, một mẫu Xiaomi hoặc OPPO;
  - đồng hồ: Apple Watch SE 3, một mẫu Galaxy Watch, một mẫu Xiaomi.
- [ ] Ghi `data/mau_san_pham.csv`: mã mẫu (theo [T3.2](#t3-2)), nhóm, hãng, tên, URL, tập.
- [ ] Chia trước (đề xuất):
  - **tập phát triển, 4 mẫu:** iPhone 17 và Galaxy Buds3 Pro (2 mẫu thử), Apple Watch SE 3, Xiaomi 15T;
  - **tập kiểm tra, 8 mẫu còn lại:** nhóm nào và hãng nào cũng có mẫu.
- [ ] Không đặt hai mẫu cùng dòng (ví dụ Xiaomi 15T và 15T Pro) vào hai tập khác nhau.
- [ ] Ghi vào nhật ký: từ hôm nay, mọi lựa chọn thiết kế (tệp cấu hình, ví dụ trong hướng dẫn, câu lệnh, tham số) chỉ dựa trên tập phát triển ([T3.5](#t3-5), quy tắc 4).

**Làm ra:** `data/mau_san_pham.csv`, `data/THE_DU_LIEU.md` (bản đầu).

**Xong khi:** đủ 3 nhóm và ít nhất 3 hãng; tập phát triển có đủ 3 nhóm; tập kiểm tra có đủ nhóm và đủ hãng.

**Tra cứu:** [T1.6](#t1-6) (phạm vi), [T3.2](#t3-2) (mã định danh), [T6.3](#t6-3) (chia tập).

<a id="b05"></a>

### Bước 5 · Thu thập trang thông số của 2 mẫu thử

**Ngày:** Thứ Bảy 17/10 · **Thời lượng:** khoảng 3 giờ · **Thuộc:** Nội dung 1 (dữ liệu)

**Để làm gì.** Có bằng chứng chính hãng truy vết được: người khác mở lại được đúng trang đã dùng, đúng thời điểm đã dùng. Làm 2 mẫu thử trước để sửa script cho chắc, rồi mới chạy cho 10 mẫu còn lại.

**Việc cần làm**

- [ ] Viết script Playwright: mở URL, chờ tải xong, mở các mục "Xem thêm" và chú thích, rồi lưu `page.html`, `page.txt` (chữ hiển thị), `full.png` (ảnh chụp toàn trang) và `meta.json` (URL, thời điểm truy cập, mã băm SHA-256, tức "dấu vân tay" của tệp: đổi một ký tự là đổi mã). Có thể lấy lại `scripts/capture_evidence.mjs` từ commit `ba88a48`.
- [ ] Chạy cho iPhone 17 và Galaxy Buds3 Pro. Đặt `page.txt` cạnh trang trên trình duyệt: mọi chú thích điều kiện (dấu *, số mũ, "kết quả có thể thay đổi") phải có trong `page.txt`.
- [ ] Kiểm chỗ nghi vấn thấy khi xem trang ngày 09/10/2026: chú thích chế độ chống ồn cho tổng thời gian kèm hộp sạc trên trang Galaxy Buds3 Pro.
- [ ] Kiểm lại trên bản chụp các con số dùng trong ví dụ 1–12 và 18 của hướng dẫn gán nhãn ([T4.6](#t4-6)).
- [ ] Sao lưu ảnh chụp ra ngoài máy, ví dụ lên Google Drive.

**Làm ra:** script chụp trang trong `scripts/`; `data/nguon/dt-apple-iphone17/` và `data/nguon/tn-samsung-buds3pro/`, mỗi thư mục 4 tệp.

**Xong khi:** hai mẫu có đủ 4 tệp; mọi chú thích điều kiện có trong `page.txt`; các con số của ví dụ đã được kiểm.

**Tra cứu:** [T3.1](#t3-1), [T3.2](#t3-2), [T4.6](#t4-6).

<a id="b06"></a>

### Bước 6 · Thu thập trang thông số của 10 mẫu còn lại

**Ngày:** Chủ nhật 18/10 · **Thời lượng:** khoảng 3 giờ · **Thuộc:** Nội dung 1 (dữ liệu)

**Để làm gì.** Có bằng chứng cho đủ 12 mẫu, bằng script đã kiểm ở Bước 5.

**Việc cần làm**

- [ ] Chạy script của Bước 5 cho 10 mẫu còn lại.
- [ ] Mỗi mẫu: kiểm `page.txt` có đủ chú thích điều kiện. Thiếu thì chụp lại sau khi trang hiển thị xong; vẫn thiếu thì ghi vào nhật ký (rủi ro thứ hai ở [T9.1](#t9-1)).
- [ ] Kiểm chỗ nghi vấn trên trang OPPO Find X8: giá trị "định mức" lớn hơn giá trị "tiêu chuẩn".
- [ ] Kiểm lại trên bản chụp các con số của ví dụ 13–17 ở [T4.6](#t4-6) (Apple Watch SE 3, Xiaomi 15T).
- [ ] Với 8 mẫu của tập kiểm tra, chỉ kiểm tệp có đủ chú thích; không lấy ý tưởng cho tệp cấu hình hay ví dụ hướng dẫn từ các trang này.
- [ ] Sao lưu ảnh chụp ra ngoài máy.

**Làm ra:** `data/nguon/<ma_mau>/` của 10 mẫu còn lại.

**Xong khi:** đủ 12 mẫu, mỗi mẫu 4 tệp; mọi chú thích điều kiện có mặt trong `page.txt`.

**Tra cứu:** [T9.1](#t9-1) (rủi ro trang thiếu chú thích).

<a id="b07"></a>

### Bước 7 · Chia tài liệu thành đoạn

**Ngày:** Thứ Hai 19/10 · **Thời lượng:** khoảng 4 giờ · **Thuộc:** Nội dung 1 (dữ liệu)

**Để làm gì.** Chia tài liệu thành đoạn để BM25 tìm được, nhưng không tách con số khỏi điều kiện của nó.

**Việc cần làm**

- [ ] Viết hàm chia đoạn đọc `page.txt`: mỗi dòng hoặc mục thông số là một đoạn.
- [ ] Nối chú thích (dấu *, số mũ, "kết quả có thể thay đổi") vào đoạn mang ký hiệu tương ứng.
- [ ] Đặt tên mục ("Pin", "Màn hình") ở đầu mỗi đoạn để giữ ngữ cảnh.
- [ ] Đặt mã đoạn theo dạng `<ma_mau>#<số>` ([T3.2](#t3-2)).
- [ ] Chạy cho 12 mẫu; lấy ngẫu nhiên 20 đoạn để kiểm bằng mắt.

**Làm ra:** `data/nguon/<ma_mau>/doan.jsonl` của 12 mẫu.

**Xong khi:** trong 20 đoạn kiểm ngẫu nhiên, không đoạn nào mất điều kiện đi kèm con số.

**Tra cứu:** [T3.2](#t3-2) (mã đoạn).

<a id="b08"></a>

### Bước 8 · Viết tệp cấu hình điều kiện bắt buộc

**Ngày:** Thứ Ba 20/10 – Thứ Tư 21/10 · **Thời lượng:** khoảng 5 giờ · **Thuộc:** Nội dung 1 (dữ liệu)

**Để làm gì.** Ghi ra trước khi gán nhãn: thuộc tính nào có điều kiện, điều kiện nào là bắt buộc, và người đọc hiểu thế nào khi quảng cáo không nêu điều kiện. Quy tắc A–D chỉ đọc tệp này, nên thêm nhóm sản phẩm chỉ cần thêm tệp.

**Việc cần làm**

- [ ] Viết 3 tệp `dien_thoai.yaml`, `tai_nghe.yaml`, `dong_ho.yaml` theo mẫu ở [T5.7](#t5-7), dựa vào bảng cách hiểu thông thường ở [T4.5](#t4-5).
- [ ] Mỗi thuộc tính có: đơn vị; hướng thuận lợi (cao hơn tốt hơn hay thấp hơn tốt hơn); kiểu giá trị mặc định; các điều kiện bắt buộc và loại của từng điều kiện (một trong sáu loại); cách hiểu thông thường; các cách diễn đạt của từng điều kiện. Mỗi tệp có thêm bảng bí danh tên sản phẩm và phiên bản ([T5.4](#t5-4)).
- [ ] Ghi danh sách từ khẳng định chắc chắn ("luôn", "đảm bảo", "ít nhất", "mọi lúc").
- [ ] **Chỉ dùng trang của tập phát triển** khi viết.
- [ ] Chốt điểm 2, 3, 4, 11 và 12 ở [T10](#t10); ghi kết quả vào nhật ký.

**Làm ra:** `data/cau_hinh/dien_thoai.yaml`, `data/cau_hinh/tai_nghe.yaml`, `data/cau_hinh/dong_ho.yaml`.

**Xong khi:** mọi thuộc tính trong sáu nhóm thông số có đủ các khóa như mẫu ở T5.7.

**Tra cứu:** [T5.7](#t5-7) (mẫu tệp cấu hình), [T4.5](#t4-5) (cách hiểu thông thường), [T10](#t10) (điểm cần chốt).

<a id="b09"></a>

### Bước 9 · Viết hướng dẫn gán nhãn bốn lớp và ví dụ

**Ngày:** Thứ Tư 21/10 – Thứ Năm 22/10 · **Thời lượng:** khoảng 6 giờ · **Thuộc:** Nội dung 1 (dữ liệu)

> Bước này gồm việc tháng 9 "hướng dẫn gán nhãn, ít nhất 20 ví dụ, giữ ngữ cảnh khi tách" và việc tháng 10 "hướng dẫn gán nhãn bốn lớp, bổ sung ví dụ điện thoại và đồng hồ" của đề cương. Phần nào đã làm thì chỉ kiểm tra lại rồi đánh dấu xong.

**Để làm gì.** Có hướng dẫn gán nhãn bốn lớp dùng chung cho người gán nhãn và cho hệ thống. P cài đúng các quy tắc trong hướng dẫn, nên hai bên phải luôn khớp nhau.

**Việc cần làm**

- [ ] Viết `data/huong_dan_gan_nhan.md` bản 1 theo [T4](#t4): quy tắc tách tuyên bố giữ ngữ cảnh ([T4.1](#t4-1)), định nghĩa bốn nhãn ([T4.2](#t4-2)), thứ tự quyết định D1–D6 ([T4.3](#t4-3)), cách ghi bằng chứng và lý do ([T4.4](#t4-4)), cách hiểu thông thường lấy từ tệp cấu hình của Bước 8 ([T4.5](#t4-5)).
- [ ] Viết **ít nhất 24 ví dụ** bốn nhãn, bắt đầu từ 18 ví dụ ở [T4.6](#t4-6), chỉ dùng mẫu của tập phát triển (iPhone 17, Galaxy Buds3 Pro, Apple Watch SE 3, Xiaomi 15T). Mỗi nhãn và mỗi loại biến đổi có ít nhất 2 ví dụ; có đủ các trường hợp đề cương nêu: đúng, sai đối tượng, sai điều kiện, thiếu bằng chứng, xung đột bằng chứng.
- [ ] Không dùng lại bộ 23 ví dụ soạn tháng 9 cho đề tài cũ (commit `ba88a48`, tệp `evidence/2026-10-08/examples.json`): bộ đó toàn AirPods (AirPods Pro 3 và AirPods 4 thuộc tập kiểm tra dự kiến), dùng ba nhãn và có thông số ngoài phạm vi. Dùng lại sẽ làm lộ tập kiểm tra vào hướng dẫn và vào câu lệnh của B2.

**Làm ra:** `data/huong_dan_gan_nhan.md` (bản 1).

**Xong khi:** có ít nhất 24 ví dụ, mỗi ví dụ có nhãn, dòng quyết định và lý do; mọi cách hiểu thông thường trong hướng dẫn trùng với tệp cấu hình.

**Tra cứu:** [T4](#t4) (toàn bộ hướng dẫn gán nhãn), [T3.4](#t3-4) (định dạng nhãn).

<a id="b10"></a>

### Bước 10 · Khảo sát cách hiểu của 5–10 người đọc

**Ngày:** Thứ Sáu 23/10 · **Thời lượng:** khoảng 2 giờ · **Thuộc:** Nội dung 1 (dữ liệu)

**Để làm gì.** Kiểm tra "cách hiểu thông thường" trong tệp cấu hình bằng người đọc thật, để cách hiểu này không chỉ là ý của người làm đề tài.

**Việc cần làm**

- [ ] Soạn phiếu (ví dụ bằng Google Forms) khoảng 8 tuyên bố không nêu điều kiện, chỉ lấy mẫu của tập phát triển, ví dụ "Apple Watch SE 3 pin 32 giờ", "iPhone 17 sạc 50% trong 20 phút", "Galaxy Buds3 Pro pin 7 giờ". Với mỗi tuyên bố, hỏi người đọc hiểu là trong điều kiện nào (chọn một phương án hoặc tự ghi).
- [ ] Gửi cho 5–10 người, ưu tiên người không học công nghệ thông tin vì gần với người mua thông thường.
- [ ] Ghi tỷ lệ người hiểu giống cách hiểu thông thường trong tệp cấu hình. Câu nào quá nửa số người hiểu khác thì sửa tệp cấu hình, hướng dẫn gán nhãn và nhãn của các ví dụ liên quan (ví dụ 8, 9, 14 ở [T4.6](#t4-6)).
- [ ] Chốt điểm 1 ở [T10](#t10).
- [ ] Nếu trong ngày chưa đủ 5 câu trả lời thì vẫn sang Bước 11; tổng hợp khi đủ, nhưng phải xong trước Bước 13 (gán nhãn bộ thử).

**Làm ra:** `ket_qua/khao_sat_cach_hieu.md` (câu hỏi, số người, tỷ lệ đồng ý từng câu, các chỗ đã sửa).

**Xong khi:** có kết quả khảo sát; tệp cấu hình và hướng dẫn đã sửa theo khảo sát.

**Tra cứu:** [T4.5](#t4-5), [T10](#t10) (điểm 1).

<a id="b11"></a>

### Bước 11 · Làm công cụ sinh quảng cáo qua CopyPro

**Ngày:** Thứ Bảy 24/10 – Chủ nhật 25/10 · **Thời lượng:** khoảng 6 giờ · **Thuộc:** Nội dung 1 (dữ liệu)

**Để làm gì.** Sinh quảng cáo đúng như CopyPro sinh, và ghi lại mọi thứ để chạy lại được.

**Việc cần làm**

- [ ] Thêm hai mô hình vào CopyPro (repo `NT114.Q21-Web-Copy-Writing`, làm trên nhánh `kiem-chung-thong-so` như [T7.3](#t7-3)), khai báo trong `backend/src/config/generatorModels.js` và bảng ánh xạ trong `backend/src/services/aiService.js`:
  - GPT-OSS 120B qua Groq, mã `openai/gpt-oss-120b`;
  - Gemini 3.6 Flash, mã `gemini-3.6-flash`. Trang mô hình của Google ngày 11/10/2026 ghi đây là bản ổn định thế hệ trước, nên phải lưu tên và phiên bản mô hình ở mọi lần gọi (rủi ro ngừng phục vụ ở [T9.1](#t9-1)).
- [ ] Viết `src/kiemchung/sinh_quang_cao.py` **gọi chính CopyPro**: chạy backend CopyPro trên máy, đăng nhập bằng một tài khoản thử, rồi gọi `POST /api/contents/generate` với các trường như người dùng nhập trên giao diện. Nhờ vậy quảng cáo đúng là "do CopyPro tạo": đi qua câu lệnh của giao diện, câu lệnh hệ thống và tham số mà backend tự thêm (ở commit `09a35a5`, backend thêm câu lệnh hệ thống và đặt nhiệt độ 0,75, top-p 0,9 khi gọi Gemini và Groq).
- [ ] Phương án dự phòng nếu không chạy được backend: chép `buildPrompt()` (giao diện), `getProviderPrompt()`, câu lệnh hệ thống và tham số (backend) sang Python; kiểm thử so khớp từng ký tự; ghi trong khóa luận là "sinh bằng câu lệnh và tham số của CopyPro qua script".
- [ ] Dùng thiết lập ở [T3.3](#t3-3); chốt điểm 7 và 13 ở [T10](#t10).
- [ ] Mỗi lần gọi lưu đầu vào, đầu ra, mô hình, tham số và thời điểm. Sinh thử 2–3 bài bằng giao diện CopyPro để đối chiếu với bài sinh qua script.

**Làm ra:** `src/kiemchung/sinh_quang_cao.py`; hai mô hình mới trong CopyPro.

**Xong khi:** gọi được cả hai mô hình qua CopyPro; mỗi lần gọi được lưu đủ thông tin.

**Tra cứu:** [T3.3](#t3-3) (thiết lập sinh quảng cáo), [T7](#t7) (CopyPro), [T10](#t10).

<a id="b12"></a>

### Bước 12 · Sinh quảng cáo và tách tuyên bố của bộ thử

**Ngày:** Thứ Hai 26/10 · **Thời lượng:** khoảng 5 giờ · **Thuộc:** Nội dung 1 (dữ liệu)

**Để làm gì.** Có bộ dữ liệu thử ban đầu khoảng 60 tuyên bố để chốt hướng dẫn, tệp cấu hình và quy mô dữ liệu.

**Việc cần làm**

- [ ] Sinh quảng cáo cho 2 mẫu thử: 2 mẫu × 2 LLM × 3 loại bài × 2 chế độ = **24 bài**. Mỗi tệp lưu câu lệnh, mô hình, tham số, đầu ra và thời điểm.
- [ ] Tách tuyên bố **hoàn toàn bằng tay** theo [T4.1](#t4-1), không nhờ LLM gợi ý, vì tuyên bố tách tay là chuẩn để đánh giá bước tách tự động ở Bước 29. Lọc theo tệp cấu hình; gộp tuyên bố trùng trong cùng bài.
- [ ] Mỗi tuyên bố ghi đường dẫn đến nguồn chính thức của đúng sản phẩm và phiên bản được quảng cáo.

**Làm ra:** `data/quang_cao/*.json`, `data/tuyen_bo/thu.jsonl`.

**Xong khi:** có khoảng 60 tuyên bố có điều kiện ràng buộc, mỗi tuyên bố đủ ngữ cảnh.

**Tra cứu:** [T3.2](#t3-2) (mã bài, mã tuyên bố), [T3.4](#t3-4) (định dạng), [T4.1](#t4-1) (tách tuyên bố).

<a id="b13"></a>

### Bước 13 · Gán nhãn bộ thử, đo thời gian gán

**Ngày:** Thứ Ba 27/10 · **Thời lượng:** khoảng 5 giờ · **Thuộc:** Nội dung 1 (dữ liệu)

**Để làm gì.** Thử hướng dẫn trên dữ liệu thật và đo thời gian gán để chốt quy mô.

**Việc cần làm**

- [ ] Kiểm khảo sát ở Bước 10 đã tổng hợp xong và tệp cấu hình đã sửa theo khảo sát.
- [ ] Gán nhãn từng tuyên bố theo hướng dẫn: nhãn, mã đoạn bằng chứng, câu trích, lý do, loại biến đổi (nếu là Lệch điều kiện), **số giây đã gán**.
- [ ] Chỗ nào hướng dẫn chưa rõ thì ghi vào danh sách "câu hỏi nhãn" để giải quyết ở Bước 16.
- [ ] Điều kiện không xếp được vào sáu loại thì ghi vào trường `ghi_chu` (điểm 10 ở [T10](#t10)).

**Làm ra:** `data/nhan/thu.jsonl`, danh sách "câu hỏi nhãn".

**Xong khi:** mọi tuyên bố của bộ thử có nhãn, bằng chứng, lý do và thời gian.

**Tra cứu:** [T4](#t4) (hướng dẫn gán nhãn), [T3.4](#t3-4) (định dạng nhãn).

<a id="b14"></a>

### Bước 14 · Làm mô-đun truy hồi BM25, đo Recall@k

**Ngày:** Thứ Tư 28/10 · **Thời lượng:** khoảng 5 giờ · **Thuộc:** Nội dung 2 (phương pháp P)

**Để làm gì.** Có bước truy hồi chung cho P và mọi đối chứng, và đo được chất lượng của nó.

**Việc cần làm**

- [ ] Cài BM25 theo [T5.2](#t5-2), chỉ tìm trong `doan.jsonl` của mẫu được chọn.
- [ ] Thử hai cách tách từ: theo âm tiết, và theo từ (`pyvi` hoặc `underthesea`).
- [ ] Đo Recall@k với k ∈ {1, 3, 5, 8} trên bộ thử, lấy đoạn bằng chứng đã gán ở Bước 13 làm chuẩn.
- [ ] Viết kiểm thử: không bao giờ trả về đoạn của mẫu khác.

**Làm ra:** `src/kiemchung/truy_hoi.py`, bảng Recall@k trên bộ thử.

**Xong khi:** có bảng Recall@k cho hai cách tách từ; kiểm thử đạt.

**Tra cứu:** [T5.2](#t5-2) (truy hồi BM25), [T6.4](#t6-4) (Recall@k).

<a id="b15"></a>

### Bước 15 · Cài đặt đối chứng B0

**Ngày:** Thứ Năm 29/10 · **Thời lượng:** khoảng 4 giờ · **Thuộc:** Nội dung 3 (thực nghiệm)

**Để làm gì.** Có đối chứng đầu tiên, để thấy sớm cách kiểm chứng ba nhãn sai ở đâu.

**Việc cần làm**

- [ ] Cài B0 theo khung câu lệnh T12.1 ở [T12](#t12): LLM đọc tuyên bố và top-k đoạn, gán Supported, Refuted hoặc NEI.
- [ ] Ánh xạ nhãn: Supported → Đúng, Refuted → Sai, NEI → Chưa đủ thông tin.
- [ ] Chạy hết bộ thử với nhiệt độ 0, qua bộ nhớ đệm của `llm.py`.

**Làm ra:** `src/kiemchung/doi_chung/b0.py`, đầu ra của B0 trên bộ thử.

**Xong khi:** B0 chạy hết bộ thử; có FAR sơ bộ của B0 trên bộ thử.

**Tra cứu:** [T6.1](#t6-1) (các đối chứng), [T6.4](#t6-4) (FAR), [T12](#t12) (khung câu lệnh).

<a id="b16"></a>

### Bước 16 · Phân tích bộ thử, chốt hướng dẫn và quy mô

**Ngày:** Thứ Sáu 30/10 – Thứ Bảy 31/10 · **Thời lượng:** khoảng 5 giờ · **Thuộc:** Nội dung 1 (dữ liệu) · **Kết thúc bằng:** [Mốc 2](#m2)

**Để làm gì.** Chốt hướng dẫn nhãn, cấu trúc dữ liệu và quy mô dữ liệu bằng số đo thật, rồi báo cáo CBHD ở Mốc 2.

**Việc cần làm**

- [ ] Tính phân bố nhãn, số tuyên bố có điều kiện trên mỗi bài, số phút gán mỗi tuyên bố.
- [ ] Xem B0 sai ở đâu, nhất là bao nhiêu tuyên bố Lệch điều kiện bị B0 gán Supported.
- [ ] Giải quyết các "câu hỏi nhãn" của Bước 13; sửa thành hướng dẫn bản 2; gán lại bộ thử theo bản 2.
- [ ] Chốt quy mô: số bài cần sinh cho mỗi mẫu để tổng đạt 250–300 tuyên bố, tính cả bộ thử. Nếu trung bình dưới 2 tuyên bố có điều kiện mỗi bài thì áp dụng phương án ở [T9.1](#t9-1): tăng số bài; nếu vẫn thiếu thì điền tên các nhóm thông số (không kèm con số) vào ô từ khóa cho **mọi** bài và sinh lại 24 bài của bộ thử, để bộ thử và bộ chính cùng thiết lập (điểm 13 ở [T10](#t10)).
- [ ] Bổ sung danh sách từ khẳng định từ bộ thử (điểm 4 ở T10).
- [ ] Viết báo cáo 1–2 trang và gửi CBHD.

**Làm ra:** `ket_qua/bo_thu/bao_cao.md`, hướng dẫn gán nhãn bản 2.

**Xong khi:** quy mô đã chốt và báo cáo đã gửi CBHD.

**Tra cứu:** [T9.1](#t9-1) (rủi ro ít tuyên bố), [T10](#t10).

<a id="m2"></a>

### 🏁 Mốc 2 · Thứ Bảy 31/10 · Xong bộ thử

- **Phải có:** Khoảng 60 tuyên bố có nhãn; BM25 và B0 chạy trên bộ thử; hướng dẫn nhãn bản 2; quy mô dữ liệu đã chốt.
- **Gửi CBHD:** Báo cáo bộ thử 1–2 trang.
- **Trước khi gửi:** mọi bước trước mốc đã đánh dấu xong; tự kiểm theo [T15](#t15).

<a id="thang-11"></a>

## Tháng 11/2026 · Dữ liệu chính, phương pháp P, đối chứng, khóa cấu hình

> **Cuối tháng phải có:** đủ dữ liệu (250–300 tuyên bố và 100–120 biến thể cặp tối thiểu) có nhãn và có số đo độ tin cậy nhãn; P, B0–B3, P−ĐK, P−NN chạy trên tập phát triển; cấu hình đã khóa trước khi chạy tập kiểm tra ([Mốc 3](#m3), 27/11).

<a id="b17"></a>

### Bước 17 · Viết nháp Chương 1 và Chương 2

**Ngày:** Chủ nhật 01/11 – Thứ Hai 02/11 · **Thời lượng:** khoảng 8 giờ · **Thuộc:** Việc chung

**Để làm gì.** Viết sớm phần tổng quan khi ghi chú tài liệu còn mới, để tháng 12 chỉ còn phần kết quả.

**Việc cần làm**

- [ ] Viết nháp Chương 1 (Tổng quan) theo dàn ý ở [T8.1](#t8-1), lấy nội dung từ mục 1–4 của đề cương.
- [ ] Viết nháp Chương 2 (Cơ sở lý thuyết và nghiên cứu liên quan) từ ghi chú của Bước 3.
- [ ] Lập bảng "hạn chế của nghiên cứu → cách đề tài xử lý", mở rộng từ Bảng 1 của đề cương.

**Làm ra:** `luan_van/chuong_1.md`, `luan_van/chuong_2.md`.

**Xong khi:** hai chương đủ mục theo dàn ý; mọi câu nói về bài khác có số trang.

**Tra cứu:** [T8.1](#t8-1) (dàn ý), [T8.2](#t8-2) (quy tắc viết).

<a id="b18"></a>

### Bước 18 · Sinh quảng cáo cho 10 mẫu còn lại

**Ngày:** Thứ Ba 03/11 · **Thời lượng:** khoảng 3 giờ · **Thuộc:** Nội dung 1 (dữ liệu)

**Để làm gì.** Có đủ quảng cáo cho bộ dữ liệu chính.

**Việc cần làm**

- [ ] Sinh cho 10 mẫu còn lại theo thiết lập của Bước 11: 10 × 2 × 3 × 2 = **120 bài**, điều chỉnh theo quy mô đã chốt ở Bước 16.
- [ ] Không đổi câu lệnh và thiết lập so với bộ thử. Nếu cần thêm tuyên bố thì tăng số lần sinh, không sửa câu lệnh.

**Làm ra:** `data/quang_cao/*.json`.

**Xong khi:** đủ mọi tổ hợp mẫu × LLM × loại bài × chế độ.

**Tra cứu:** [T3.3](#t3-3) (thiết lập sinh quảng cáo).

<a id="b19"></a>

### Bước 19 · Tách tuyên bố của tập phát triển

**Ngày:** Thứ Tư 04/11 · **Thời lượng:** khoảng 2 giờ · **Thuộc:** Nội dung 1 (dữ liệu)

**Để làm gì.** Có tuyên bố của tập phát triển trước, để kịp gán nhãn và dùng cho việc cài đặt P từ Bước 21.

**Việc cần làm**

- [ ] Tách hoàn toàn bằng tay như Bước 12 cho 2 mẫu còn lại của tập phát triển (Apple Watch SE 3, Xiaomi 15T); lọc theo tệp cấu hình; gộp tuyên bố trùng trong cùng bài.
- [ ] Nếu nhiều hơn quy mô đã chốt thì lấy mẫu phân tầng theo nhóm sản phẩm × LLM × chế độ.

**Làm ra:** `data/tuyen_bo/chinh.jsonl` (phần tập phát triển).

**Xong khi:** tập phát triển (bộ thử cộng 2 mẫu mới) có đủ số tuyên bố theo quy mô đã chốt ở Bước 16.

**Tra cứu:** [T4.1](#t4-1) (tách tuyên bố), [T3.4](#t3-4) (định dạng).

<a id="b20"></a>

### Bước 20 · Gán nhãn tập phát triển

**Ngày:** Thứ Năm 05/11 – Thứ Sáu 06/11 · **Thời lượng:** khoảng 5 giờ · **Thuộc:** Nội dung 1 (dữ liệu)

**Để làm gì.** Có nhãn chuẩn của tập phát triển để phát triển P và chọn cấu hình cho P và các đối chứng.

**Việc cần làm**

- [ ] Gán nhãn theo hướng dẫn bản 2, như Bước 13: nhãn, mã đoạn, câu trích, lý do, loại biến đổi, số giây.
- [ ] Mỗi buổi gán tối đa 60 phút liên tục để tránh mỏi.
- [ ] Đặt cờ `tai_lieu_mau_thuan` khi tài liệu ghi mâu thuẫn; ghi `ghi_chu` cho điều kiện ngoài sáu loại.

**Làm ra:** `data/nhan/chinh.jsonl` (phần tập phát triển).

**Xong khi:** mọi tuyên bố của tập phát triển có nhãn, bằng chứng, lý do và thời gian.

**Tra cứu:** [T4](#t4) (hướng dẫn gán nhãn), [T3.4](#t3-4) (định dạng nhãn).

<a id="b21"></a>

### Bước 21 · Chuẩn hóa sản phẩm, giá trị, đơn vị, kiểu giá trị

**Ngày:** Thứ Bảy 07/11 · **Thời lượng:** khoảng 5 giờ · **Thuộc:** Nội dung 2 (phương pháp P)

**Để làm gì.** So sánh được các giá trị viết khác nhau, ví dụ "6 tiếng" và "6 giờ", "3.000 nit" và "3000 nits".

**Việc cần làm**

- [ ] Cài chuẩn hóa theo [T5.4](#t5-4): đơn vị, số, chuẩn IP, kiểu giá trị, tên sản phẩm và phiên bản (bảng bí danh trong tệp cấu hình).
- [ ] Viết ít nhất 20 kiểm thử, lấy cách viết thật từ quảng cáo và trang thông số của tập phát triển.

**Làm ra:** `src/kiemchung/chuan_hoa.py`, `tests/test_chuan_hoa.py`.

**Xong khi:** ít nhất 20 kiểm thử đạt.

**Tra cứu:** [T5.4](#t5-4) (quy tắc chuẩn hóa).

<a id="b22"></a>

### Bước 22 · Trích xuất có neo nguồn và kiểm tra đầy đủ

**Ngày:** Chủ nhật 08/11 – Thứ Ba 10/11 · **Thời lượng:** khoảng 12 giờ · **Thuộc:** Nội dung 2 (phương pháp P)

**Để làm gì.** Chuyển tuyên bố và bằng chứng thành bộ thông số có căn cứ, loại bỏ giá trị và điều kiện do LLM bịa ra.

**Việc cần làm**

- [ ] Viết câu lệnh trích xuất từ khung T12.4 ở [T12](#t12), theo lược đồ bảy trường ở [T5.1](#t5-1).
- [ ] Cài kiểm tra neo nguồn, khâu (b) ở [T5.3](#t5-3): câu trích phải có trong văn bản; con số phải khớp giá trị đã điền; trường không đạt bị bỏ, không đoán.
- [ ] Cài kiểm tra đầy đủ, khâu (c) ở T5.3: dò các cụm từ điều kiện trong tệp cấu hình để bổ sung điều kiện LLM bỏ sót; vẫn không xác định được điều kiện thì đánh dấu để bộ quyết định kết luận Chưa đủ thông tin (dòng D1a).
- [ ] Viết kiểm thử cho neo nguồn và kiểm tra đầy đủ: câu trích không có trong nguồn, con số sai, điều kiện bịa, điều kiện bị bỏ sót.
- [ ] Chạy trên tập phát triển; đếm số trường bị loại và số điều kiện được bổ sung (khâu (d) ở T5.3).

**Làm ra:** `src/kiemchung/trich_xuat.py`, `src/kiemchung/neo_nguon.py`, kiểm thử.

**Xong khi:** kiểm thử đạt; chạy hết tập phát triển; có thống kê trường bị loại và điều kiện được bổ sung.

**Tra cứu:** [T5.1](#t5-1) (bộ thông số bảy trường), [T5.3](#t5-3) (neo nguồn, kiểm tra đầy đủ), [T12](#t12) (khung câu lệnh).

<a id="b23"></a>

### Bước 23 · Tách tuyên bố của tập kiểm tra

**Ngày:** Thứ Tư 11/11 · **Thời lượng:** khoảng 5 giờ · **Thuộc:** Nội dung 1 (dữ liệu)

**Để làm gì.** Tách tuyên bố của tập kiểm tra bằng tay, cùng cách như tập phát triển, trước khi chạy bất kỳ hệ thống nào trên tập này.

**Việc cần làm**

- [ ] Tách hoàn toàn bằng tay như Bước 12 cho 8 mẫu của tập kiểm tra; lọc theo tệp cấu hình; gộp tuyên bố trùng trong cùng bài.
- [ ] Nếu nhiều hơn quy mô đã chốt thì lấy mẫu phân tầng theo nhóm sản phẩm × LLM × chế độ.
- [ ] Gặp trường hợp lạ thì ghi vào nhật ký để báo trong phần giới hạn; không sửa tệp cấu hình hay hướng dẫn vì trường hợp của tập kiểm tra.

**Làm ra:** `data/tuyen_bo/chinh.jsonl` (thêm phần tập kiểm tra).

**Xong khi:** tính cả bộ thử, toàn bộ dữ liệu có 250–300 tuyên bố; nhóm nào và hãng nào trong tập kiểm tra cũng có tuyên bố.

**Tra cứu:** [T4.1](#t4-1) (tách tuyên bố), [T3.5](#t3-5) (quy tắc 4: bảo vệ tập kiểm tra).

<a id="b24"></a>

### Bước 24 · Gán nhãn tập kiểm tra

**Ngày:** Thứ Năm 12/11 – Thứ Sáu 13/11 · **Thời lượng:** khoảng 10 giờ · **Thuộc:** Nội dung 1 (dữ liệu)

**Để làm gì.** Có nhãn chuẩn của tập kiểm tra, gán theo hướng dẫn bản 2 trước khi chạy bất kỳ hệ thống nào trên tập này.

**Việc cần làm**

- [ ] Gán nhãn như Bước 20, cùng hướng dẫn bản 2; mỗi buổi tối đa 60 phút liên tục.
- [ ] Đặt cờ `tai_lieu_mau_thuan` và ghi `ghi_chu` như Bước 20.
- [ ] Không sửa hướng dẫn hay tệp cấu hình vì trường hợp gặp ở tập kiểm tra; ghi vào `ghi_chu` và nhật ký.
- [ ] Từ đây, nhãn tập kiểm tra chỉ được mở lại để gán lại mù ở Bước 32.

**Làm ra:** `data/nhan/chinh.jsonl` (thêm phần tập kiểm tra).

**Xong khi:** mọi tuyên bố có nhãn, bằng chứng, lý do và thời gian.

**Tra cứu:** [T4](#t4) (hướng dẫn gán nhãn), [T3.5](#t3-5) (bảo vệ tập kiểm tra).

<a id="b25"></a>

### Bước 25 · Tạo tập cặp tối thiểu

**Ngày:** Thứ Bảy 14/11 – Chủ nhật 15/11 · **Thời lượng:** khoảng 6 giờ · **Thuộc:** Nội dung 1 (dữ liệu)

**Để làm gì.** Có đủ mẫu cho từng loại lệch điều kiện để đo riêng từng loại, theo ý tưởng cặp tương phản của VitaminC.

**Việc cần làm**

- [ ] Từ các tuyên bố Đúng của cả hai tập, tạo 6 loại biến thể theo [T4.7](#t4-7): bỏ điều kiện, đổi điều kiện, đổi bộ phận, đổi kiểu giá trị (biến mức "lên đến" thành mức chắc chắn đạt), đổi giá trị, đổi phiên bản.
- [ ] Mỗi biến thể chỉ khác tuyên bố gốc ở một chỗ. Với các loại đổi điều kiện, bộ phận, phiên bản: giữ con số và đổi sang chỗ có giá trị kém hơn; đổi theo chiều ngược lại thì con số thành kém thuận lợi hơn, vẫn khớp và ra Đúng.
- [ ] **Kiểm tra lại nhãn của từng biến thể bằng tay.**
- [ ] Đặt mã theo dạng `ct-<số của tuyên bố gốc>-<loại>` ([T3.2](#t3-2)); biến thể thuộc tập của tuyên bố gốc.

**Làm ra:** `data/cap_toi_thieu.jsonl`.

**Xong khi:** có 100–120 biến thể; mỗi loại ít nhất 15 (riêng loại đổi phiên bản tùy dữ liệu).

**Tra cứu:** [T4.7](#t4-7) (các loại biến thể), [T3.2](#t3-2) (mã biến thể).

<a id="b26"></a>

### Bước 26 · Ghi chính thức cách chia tập, gửi việc cho người gán thứ hai

**Ngày:** Thứ Hai 16/11 · **Thời lượng:** khoảng 2 giờ · **Thuộc:** Nội dung 1 (dữ liệu)

**Để làm gì.** Ghi chính thức ranh giới hai tập đã chia trước ở Bước 4, và giao việc sớm cho người gán thứ hai để kịp tính kappa ở Bước 32.

**Việc cần làm**

- [ ] Ghi `data/chia_tap.json` theo cách chia ở Bước 4; biến thể cặp tối thiểu đi theo tập của tuyên bố gốc.
- [ ] Chọn ngẫu nhiên, phân tầng theo nhóm sản phẩm và theo tập: 20% số tuyên bố để tự gán lại ở Bước 32, và khoảng 60 tuyên bố cho người gán thứ hai. Lưu danh sách mã tuyên bố vào `data/nhan/danh_sach_mau.json`, không mở nhãn.
- [ ] Gửi người gán thứ hai: hướng dẫn bản 2; 10 ví dụ của tập phát triển để gán thử có phản hồi; bảng khoảng 60 tuyên bố (không trùng 10 ví dụ gán thử) kèm đoạn nguồn nhưng **không kèm nhãn**. Hẹn trả kết quả trước 23/11.
- [ ] Nếu không tìm được người gán thứ hai thì ghi vào nhật ký và theo phương án ở [T9.1](#t9-1).
- [ ] Commit và đẩy lên GitHub.

**Làm ra:** `data/chia_tap.json`, `data/nhan/danh_sach_mau.json`.

**Xong khi:** đã commit; người gán thứ hai đã nhận việc, hoặc đã ghi rõ không có người thứ hai.

**Tra cứu:** [T6.3](#t6-3) (chia tập), [T6.5](#t6-5) (độ tin cậy nhãn), [T9.1](#t9-1).

<a id="b27"></a>

### Bước 27 · Cài bộ quyết định A–D, sinh lý do, kiểm thử

**Ngày:** Thứ Ba 17/11 – Thứ Năm 19/11 · **Thời lượng:** khoảng 12 giờ · **Thuộc:** Nội dung 2 (phương pháp P)

**Để làm gì.** Cài phần chứa điểm mới: kết luận nhãn bằng phép đối chiếu điều kiện, có kiểm thử cho từng quy tắc.

**Việc cần làm**

- [ ] Cài bốn bước A–D theo mã giả ở [T5.5](#t5-5), đúng thứ tự trong đề cương; các dòng D1–D6 ở [T4.3](#t4-3).
- [ ] Sinh lý do từ dấu vết theo mẫu câu ở [T5.6](#t5-6).
- [ ] Viết kiểm thử theo [T5.8](#t5-8): mỗi dòng D1–D6 (kể cả D1a, D1b) ít nhất 3 kiểm thử (khớp, không khớp, trường hợp biên); mọi ví dụ trong hướng dẫn gán nhãn thành kiểm thử hồi quy.
- [ ] Chốt điểm 5, 6 và 14 ở [T10](#t10).

**Làm ra:** `src/kiemchung/quyet_dinh.py`, `tests/test_quyet_dinh.py`.

**Xong khi:** mọi dòng có đủ 3 kiểm thử, mọi ví dụ trong hướng dẫn đều là kiểm thử, và tất cả đạt.

**Tra cứu:** [T4.3](#t4-3) (thứ tự quyết định), [T5.5](#t5-5) (mã giả), [T5.6](#t5-6) (sinh lý do), [T5.8](#t5-8) (kiểm thử).

<a id="b28"></a>

### Bước 28 · Ghép phương pháp P, đo độ đúng trích xuất

**Ngày:** Thứ Sáu 20/11 · **Thời lượng:** khoảng 6 giờ · **Thuộc:** Nội dung 2 (phương pháp P)

**Để làm gì.** Ghép các khối thành P chạy từ tuyên bố đến nhãn, và đo chất lượng trích xuất.

**Việc cần làm**

- [ ] Ghép `p.py`: BM25 → trích xuất có neo nguồn → chuẩn hóa → A–D → lý do.
- [ ] Chạy hết tập phát triển, cả tuyên bố thường và biến thể cặp tối thiểu.
- [ ] Gán tay giá trị đúng của từng trường cho **50 tuyên bố** tập phát triển; tính độ đúng của từng trường.
- [ ] Xem lỗi của P trên tập phát triển. Lỗi do mã cài sai so với hướng dẫn thì sửa mã. Không sửa hướng dẫn gán nhãn nữa vì tập kiểm tra đã gán theo bản 2; tệp cấu hình chỉ được bổ sung cách diễn đạt thấy trong tập phát triển, trước khi khóa ở Bước 33.

**Làm ra:** `src/kiemchung/p.py`, bảng độ đúng trích xuất trên tập phát triển.

**Xong khi:** P chạy hết tập phát triển; có bảng độ đúng từng trường.

**Tra cứu:** [T1.3](#t1-3) (sơ đồ P), [T6.4](#t6-4) (độ đúng trích xuất).

<a id="b29"></a>

### Bước 29 · Tách và lọc tuyên bố tự động

**Ngày:** Thứ Bảy 21/11 · **Thời lượng:** khoảng 5 giờ · **Thuộc:** Nội dung 2 (phương pháp P)

**Để làm gì.** Có bước tách tuyên bố tự động cho tính năng trên CopyPro. Thực nghiệm chính vẫn dùng tuyên bố tách thủ công.

**Việc cần làm**

- [ ] Viết câu lệnh tách từ khung T12.5 ở [T12](#t12); Python giữ tuyên bố có thuộc tính trong tệp cấu hình.
- [ ] So với tuyên bố tách thủ công của tập phát triển: hai tuyên bố được coi là trùng khi cùng thuộc tính và cùng giá trị sau chuẩn hóa. Tính Precision và Recall.

**Làm ra:** `src/kiemchung/tach_tuyen_bo.py`.

**Xong khi:** có Precision và Recall trên tập phát triển.

**Tra cứu:** [T5.8](#t5-8) (tách tự động), [T12](#t12) (khung câu lệnh).

<a id="b30"></a>

### Bước 30 · Cài đặt đối chứng B1, B2, B3

**Ngày:** Chủ nhật 22/11 – Thứ Hai 23/11 · **Thời lượng:** khoảng 9 giờ · **Thuộc:** Nội dung 3 (thực nghiệm)

**Để làm gì.** Có các đối chứng đại diện cho cách kiểm chứng hiện có, chạy trên cùng tuyên bố và cùng bằng chứng với P.

**Việc cần làm**

- [ ] **B1:** LLM nhận đúng bộ thông số đã trích của P (của tuyên bố và của bằng chứng) cùng hướng dẫn gán nhãn, rồi tự gán bốn nhãn (khung câu lệnh T12.2).
- [ ] **B2:** LLM đọc tuyên bố và top-k đoạn, gán bốn nhãn theo hướng dẫn có định nghĩa và ví dụ nhãn Lệch điều kiện (khung T12.3).
- [ ] **B3:** cài gói `semviqa`; chạy các mô hình ba nhãn đã huấn luyện của SemViQA [7] trên cặp tuyên bố và bằng chứng. Trên Hugging Face có bốn mô hình ba nhãn: `SemViQA/tc-xlmr-viwikifc`, `tc-xlmr-isedsc01`, `tc-infoxlm-viwikifc`, `tc-infoxlm-isedsc01` (tra ngày 11/10/2026). Chọn một mô hình trên tập phát triển; kiểm tra thứ tự nhãn và độ dài tối đa trong thẻ mô hình.
- [ ] Chạy lại B0 của Bước 15 trên toàn tập phát triển.
- [ ] B0–B2 dùng cùng LLM, cùng cấu hình với P; số lần thử câu lệnh bằng số lần thử dành cho câu lệnh trích xuất của P ([T6.2](#t6-2)).

**Làm ra:** `src/kiemchung/doi_chung/b1.py`, `b2.py`, `b3.py`; đầu ra của B0–B3 trên tập phát triển.

**Xong khi:** B0–B3 chạy hết tập phát triển; ánh xạ nhãn của B3 đã kiểm tra.

**Tra cứu:** [T6.1](#t6-1) (các đối chứng), [T6.2](#t6-2) (quy tắc công bằng), [T12](#t12) (khung câu lệnh).

<a id="b31"></a>

### Bước 31 · Làm hai bản bỏ thành phần P−ĐK, P−NN

**Ngày:** Thứ Ba 24/11 · **Thời lượng:** khoảng 3 giờ · **Thuộc:** Nội dung 3 (thực nghiệm)

**Để làm gì.** Đo đóng góp của từng thành phần (câu hỏi CH3).

**Việc cần làm**

- [ ] **P−ĐK:** bỏ bước B; mọi thông số cùng sản phẩm và thuộc tính coi như cùng điều kiện, nên chỉ so giá trị. Bản này phải **tắt cả D1a và D1b**: nếu không, các giá trị khác nhau ở những điều kiện khác nhau (6 và 7 giờ) bị coi là "tài liệu mâu thuẫn" và mọi tuyên bố ra Chưa đủ thông tin ([T5.9](#t5-9)).
- [ ] **P−NN:** bỏ khâu (b) neo nguồn và khâu (c) kiểm tra đầy đủ ở [T5.3](#t5-3); dùng nguyên đầu ra của LLM.
- [ ] Hai bản là hai cờ cấu hình trong `p.py`, không sao chép mã.
- [ ] Thêm kiểm thử: với P−ĐK, tuyên bố "Galaxy Buds3 Pro nghe nhạc 7 giờ khi bật chống ồn" phải ra Đúng (vì 7 giờ có trong tài liệu). Đây đúng là lỗi mà P khắc phục.
- [ ] Chạy hai bản trên tập phát triển.

**Làm ra:** cờ `--bo-doi-chieu` và `--bo-neo-nguon` trong `p.py`; đầu ra của hai bản trên tập phát triển.

**Xong khi:** hai bản chạy hết tập phát triển; kiểm thử P−ĐK đạt.

**Tra cứu:** [T5.9](#t5-9) (hai bản bỏ thành phần), [T5.5](#t5-5) (tham số `doi_chieu` trong mã giả).

<a id="b32"></a>

### Bước 32 · Đo độ tin cậy nhãn: gán lại 20%, tính kappa

**Ngày:** Thứ Ba 24/11 – Thứ Tư 25/11 · **Thời lượng:** khoảng 6 giờ · **Thuộc:** Nội dung 1 (dữ liệu)

**Để làm gì.** Chứng minh nhãn chuẩn đáng tin, vì người gán chính cũng là tác giả.

**Việc cần làm**

- [ ] **Gán lại mù** 20% số tuyên bố đã chọn ở Bước 26, ẩn nhãn cũ. Lần gán đầu xong muộn nhất ngày 13/11 (tập kiểm tra), nên từ 24/11 mọi tuyên bố đã cách lần gán đầu ít nhất 10 ngày.
- [ ] Nhận kết quả của người gán thứ hai.
- [ ] Tính kappa của Cohen (mức đồng thuận giữa hai lần gán, đã trừ phần trùng do ngẫu nhiên) trong một người và giữa hai người, **trước** khi thảo luận thống nhất.
- [ ] Nhãn chuẩn sai rõ ràng thì sửa và ghi vào `ket_qua/sua_nhan.md`. Mọi lần sửa phải xong ở bước này, trước khi niêm phong, và không dựa trên đầu ra của bất kỳ hệ thống nào.

**Làm ra:** `ket_qua/do_tin_cay_nhan.md`, `data/nhan/gan_lai.jsonl`, `data/nhan/nguoi_2.jsonl`.

**Xong khi:** có hai hệ số kappa, hoặc ghi rõ không có người thứ hai (phương án dự phòng trong đề cương).

**Tra cứu:** [T6.5](#t6-5) (độ tin cậy nhãn), [T9.1](#t9-1).

<a id="b33"></a>

### Bước 33 · Chọn cấu hình, khóa cấu hình, niêm phong nhãn

**Ngày:** Thứ Năm 26/11 – Thứ Sáu 27/11 · **Thời lượng:** khoảng 6 giờ · **Thuộc:** Nội dung 3 (thực nghiệm) · **Kết thúc bằng:** [Mốc 3](#m3)

**Để làm gì.** Chọn mọi tham số chỉ trên tập phát triển rồi khóa lại, để kết quả trên tập kiểm tra không thể bị chỉnh cho đẹp.

**Việc cần làm**

- [ ] Chọn trên tập phát triển: LLM dùng cho P và B0–B2, câu lệnh (kể cả câu lệnh tách tuyên bố tự động của Bước 29), k, cách tách từ, ngưỡng sai số làm tròn, mô hình của B3 (điểm 8 và 9 ở [T10](#t10)).
- [ ] Xin CBHD duyệt tiêu chí kết luận giả thuyết ở [T6.6](#t6-6) (điểm 15 ở T10).
- [ ] Ghi `ket_qua/khoa_cau_hinh.md`: tên và phiên bản LLM, mã băm của từng câu lệnh, k, cách tách từ, ngưỡng, phiên bản tệp cấu hình, mô hình B3, ngày giờ.
- [ ] Tính mã băm của tệp nhãn tập kiểm tra (đã sửa xong ở Bước 32) và ghi vào cùng tệp. Đây là bước "niêm phong": sau này ai cũng kiểm tra được nhãn không bị sửa.
- [ ] Commit, gắn tag Git `khoa-cau-hinh` và đẩy lên GitHub **trước** lần chạy tập kiểm tra đầu tiên.
- [ ] Gửi CBHD tệp khóa cấu hình và bảng kết quả trên tập phát triển.

**Làm ra:** `ket_qua/khoa_cau_hinh.md`, tag `khoa-cau-hinh`, bảng kết quả trên tập phát triển.

**Xong khi:** tag đã có trên GitHub và đã gửi CBHD.

**Tra cứu:** [T6.3](#t6-3) (khóa cấu hình, niêm phong), [T6.6](#t6-6) (tiêu chí kết luận), [T10](#t10).

<a id="m3"></a>

### 🏁 Mốc 3 · Thứ Sáu 27/11 · Khóa cấu hình

- **Phải có:** Dữ liệu và độ tin cậy nhãn xong; P và các đối chứng chạy trên tập phát triển; cấu hình đã khóa trước khi chạy tập kiểm tra.
- **Gửi CBHD:** Tệp khóa cấu hình, bảng kết quả tập phát triển.
- **Trước khi gửi:** mọi bước trước mốc đã đánh dấu xong; tự kiểm theo [T15](#t15).

<a id="b34"></a>

### Bước 34 · Làm dịch vụ kiểm chứng (API)

**Ngày:** Thứ Bảy 28/11 – Chủ nhật 29/11 · **Thời lượng:** khoảng 8 giờ · **Thuộc:** Nội dung 4 (CopyPro)

**Để làm gì.** Đưa P thành dịch vụ để CopyPro gọi được, tức bắt đầu tích hợp như đề cương ghi cho tháng 11.

**Việc cần làm**

- [ ] Cài API theo [T7.2](#t7-2) bằng FastAPI: `GET /mau-san-pham` và `POST /kiem-chung` (tách tuyên bố tự động rồi chạy P với cấu hình đã khóa).
- [ ] Viết `Dockerfile`; chạy trên máy; thử với 3 quảng cáo của tập phát triển.

**Làm ra:** `src/kiemchung/api.py`, `Dockerfile`.

**Xong khi:** kết quả API trả về trùng với khi chạy tách tự động rồi `p.py` trực tiếp.

**Tra cứu:** [T7.1](#t7-1) (kiến trúc), [T7.2](#t7-2) (API).

<a id="b35"></a>

### Bước 35 · Viết nháp Chương 3

**Ngày:** Thứ Hai 30/11 – Thứ Ba 01/12 · **Thời lượng:** khoảng 10 giờ · **Thuộc:** Việc chung

**Để làm gì.** Viết phần phương pháp khi mã nguồn còn mới trong đầu.

**Việc cần làm**

- [ ] Viết Chương 3 theo [T8.1](#t8-1): phát biểu bài toán, định nghĩa nhãn, bộ thông số, trích xuất có neo nguồn, chuẩn hóa, bộ quyết định A–D kèm mã giả, tệp cấu hình, sinh lý do, ví dụ xuyên suốt.
- [ ] Vẽ lại Hình 1 của đề cương ở độ phân giải cao, mũi tên thẳng, chỉ tô khối chứa điểm mới.

**Làm ra:** `luan_van/chuong_3.md`, hình quy trình.

**Xong khi:** đủ mục theo dàn ý.

**Tra cứu:** [T5](#t5) (đặc tả P), [T8](#t8) (viết khóa luận).

<a id="thang-12"></a>

## Tháng 12/2026 · Chạy tập kiểm tra, tích hợp CopyPro, viết và nộp khóa luận

> **Cuối tháng phải có:** kết quả trên tập kiểm tra ([Mốc 4](#m4), 08/12), tính năng chạy trên CopyPro ([Mốc 5](#m5), 13/12), bản thảo đầy đủ ([Mốc 6](#m6), 18/12) và bản nộp cuối ([Mốc 7](#m7), 31/12).

<a id="b36"></a>

### Bước 36 · Chạy tập kiểm tra một lần

**Ngày:** Thứ Tư 02/12 · **Thời lượng:** khoảng 4 giờ · **Thuộc:** Nội dung 3 (thực nghiệm)

**Để làm gì.** Có kết quả trên tập kiểm tra, chạy đúng một lần với cấu hình đã khóa.

**Việc cần làm**

- [ ] Kiểm tag `khoa-cau-hinh` đã có trên GitHub và mã băm nhãn tập kiểm tra khớp với `khoa_cau_hinh.md`.
- [ ] Chạy P, B0–B3, P−ĐK, P−NN trên tuyên bố thường và tập cặp tối thiểu của tập kiểm tra.
- [ ] Chạy thêm một lượt **đầu–cuối** (tách tuyên bố tự động rồi kiểm chứng) trên quảng cáo của tập kiểm tra.
- [ ] Ghi `manifest.json`: tag khóa, mã băm cấu hình, thời điểm chạy, số tuyên bố.
- [ ] Nếu chương trình lỗi giữa chừng thì chạy lại phần lỗi với đúng cấu hình đã khóa và ghi vào nhật ký.

**Làm ra:** `ket_qua/kiem_tra/*.jsonl`, `ket_qua/kiem_tra/manifest.json`.

**Xong khi:** đủ đầu ra của 7 hệ thống và lượt đầu–cuối.

**Tra cứu:** [T6.3](#t6-3) (khóa cấu hình), [T3.2](#t3-2) (mã lần chạy).

<a id="b37"></a>

### Bước 37 · Tính chỉ số, khoảng tin cậy, kiểm định

**Ngày:** Thứ Năm 03/12 – Thứ Sáu 04/12 · **Thời lượng:** khoảng 8 giờ · **Thuộc:** Nội dung 3 (thực nghiệm)

**Để làm gì.** Tính mọi chỉ số đề cương đã nêu, kèm mức độ chắc chắn của từng con số.

**Việc cần làm**

- [ ] Viết `danh_gia.py` theo [T6.4](#t6-4) và [T6.5](#t6-5): FAR, Precision, Recall, F1 từng nhãn, Macro-F1; Recall@k của BM25; Precision và Recall của tách tự động; thời gian và chi phí gọi LLM. Độ đúng trích xuất trên tập kiểm tra tính ở Bước 38, sau khi gán tay.
- [ ] Tính KTC bằng bootstrap theo cụm quảng cáo; kiểm định McNemar có hiệu chỉnh Holm cho chênh lệch FAR giữa P và từng đối chứng.
- [ ] Báo riêng theo [T6.7](#t6-7): tuyên bố thường và tập cặp tối thiểu; từng loại biến đổi, nhóm sản phẩm, hãng, LLM sinh quảng cáo, chế độ sinh.
- [ ] Xuất bảng ra CSV và vẽ hình theo [T6.9](#t6-9).

**Làm ra:** `src/kiemchung/danh_gia.py`, `ket_qua/kiem_tra/bang/*.csv`, `ket_qua/kiem_tra/hinh/*.png`.

**Xong khi:** đủ các bảng và hình ở T6.9, trừ phân loại lỗi (Bước 38) và phần mở rộng (Bước 43).

**Tra cứu:** [T6.4](#t6-4) (chỉ số), [T6.5](#t6-5) (thống kê), [T6.7](#t6-7) (cách báo kết quả), [T6.9](#t6-9) (bảng và hình).

<a id="b38"></a>

### Bước 38 · Phân tích lỗi theo nguồn gốc

**Ngày:** Thứ Bảy 05/12 – Chủ nhật 06/12 · **Thời lượng:** khoảng 8 giờ · **Thuộc:** Nội dung 3 (thực nghiệm)

**Để làm gì.** Hiểu P sai ở đâu và vì sao, để thảo luận trung thực.

**Việc cần làm**

- [ ] Với mỗi lỗi của P (tối đa 60, lấy ngẫu nhiên nếu nhiều hơn), xác định nguồn gốc: tách tuyên bố, truy hồi, trích xuất, quyết định, hay nhãn chuẩn.
- [ ] Lỗi do nhãn chuẩn thì không sửa nhãn; ghi vào mục mối đe dọa đến tính hợp lệ ([T6.3](#t6-3)).
- [ ] Phân loại theo kiểu lỗi: sai sản phẩm, sai phiên bản, sai điều kiện, thiếu bằng chứng.
- [ ] Gán tay giá trị đúng của từng trường cho 30 tuyên bố tập kiểm tra rồi tính độ đúng trích xuất trên tập kiểm tra.
- [ ] Chọn 3–5 trường hợp điển hình để đưa vào khóa luận.

**Làm ra:** `ket_qua/phan_tich_loi.md`.

**Xong khi:** mọi lỗi được xếp nguồn gốc; có các trường hợp điển hình.

**Tra cứu:** [T6.7](#t6-7), [T6.9](#t6-9) (bảng 12).

<a id="b39"></a>

### Bước 39 · Kết luận giả thuyết, viết phần kết quả

**Ngày:** Thứ Hai 07/12 – Thứ Ba 08/12 · **Thời lượng:** khoảng 8 giờ · **Thuộc:** Nội dung 3 (thực nghiệm) · **Kết thúc bằng:** [Mốc 4](#m4)

**Để làm gì.** Trả lời ba câu hỏi nghiên cứu bằng số liệu, và viết ngay phần kết quả khi số liệu còn mới.

**Việc cần làm**

- [ ] Kết luận H1, H2, H3 theo đúng tiêu chí đã ghi trước ở [T6.6](#t6-6), ở cả hai mức: đạt theo phát biểu của đề cương, và có ý nghĩa thống kê.
- [ ] Thống kê tỷ lệ tuyên bố Lệch điều kiện và Sai theo hai chế độ sinh (có và không có đoạn thông số), theo LLM và theo loại bài, để biết LLM bỏ, đổi điều kiện hoặc sai con số thường đến mức nào.
- [ ] Viết mục Kết quả và Thảo luận của Chương 4: mỗi bảng có một đoạn "con số này nói gì"; giải thích bằng phân tích lỗi, kể cả khi không đạt giả thuyết.
- [ ] Gửi CBHD bảng kết quả chính.

**Làm ra:** `luan_van/chuong_4.md` (mục Kết quả và Thảo luận), bảng kết quả chính.

**Xong khi:** mỗi giả thuyết có kết luận kèm số liệu; đã gửi CBHD.

**Tra cứu:** [T1.4](#t1-4) (câu hỏi và giả thuyết), [T6.6](#t6-6) (tiêu chí kết luận), [T8.2](#t8-2) (quy tắc viết).

<a id="m4"></a>

### 🏁 Mốc 4 · Thứ Ba 08/12 · Có kết quả tập kiểm tra

- **Phải có:** Chỉ số, khoảng tin cậy, kiểm định, phân tích lỗi, kết luận H1–H3.
- **Gửi CBHD:** Bảng kết quả chính.
- **Trước khi gửi:** mọi bước trước mốc đã đánh dấu xong; tự kiểm theo [T15](#t15).

<a id="b40"></a>

### Bước 40 · Tích hợp vào CopyPro: backend và giao diện

**Ngày:** Thứ Tư 09/12 – Thứ Bảy 12/12 · **Thời lượng:** khoảng 16 giờ · **Thuộc:** Nội dung 4 (CopyPro)

**Để làm gì.** Đưa tính năng "Kiểm chứng thông số" vào CopyPro (Nội dung 4).

**Việc cần làm**

- [ ] Backend theo [T7.3](#t7-3): thêm tuyến `POST /api/contents/:id/verify-specs`; dịch vụ `specVerificationService.js` gọi API kiểm chứng của Bước 34, giới hạn thời gian 60 giây; lưu kết quả vào `Content.specVerification`.
- [ ] Giao diện theo [T7.4](#t7-4): nút "Kiểm chứng thông số" và ô chọn mẫu sản phẩm, đặt cạnh điểm chất lượng và kết quả kiểm tra đạo văn; bảng kết quả tô màu theo nhãn, luôn có chữ tên nhãn; mỗi tuyên bố xem được đoạn nguồn và lý do.
- [ ] Trang chi tiết nội dung hiển thị kết quả đã lưu.

**Làm ra:** nhánh `kiem-chung-thong-so` trong repo CopyPro.

**Xong khi:** chạy được trên máy: tạo quảng cáo → chọn mẫu → kiểm chứng → xem và lưu kết quả.

**Tra cứu:** [T7](#t7) (tích hợp vào CopyPro).

<a id="b41"></a>

### Bước 41 · Kiểm tra tính năng, đo thời gian, quay video

**Ngày:** Chủ nhật 13/12 · **Thời lượng:** khoảng 4 giờ · **Thuộc:** Nội dung 4 (CopyPro) · **Kết thúc bằng:** [Mốc 5](#m5)

**Để làm gì.** Chứng minh tính năng chạy trên dữ liệu thật và đủ nhanh.

**Việc cần làm**

- [ ] Chạy tính năng trên khoảng 10 quảng cáo thuộc tập kiểm tra; kết quả trên giao diện phải trùng kết quả gọi dịch vụ trực tiếp.
- [ ] Đo thời gian kiểm chứng một bài, từ lúc bấm đến lúc có kết quả; ghi trung vị và p90 (90% số lần nhanh hơn mức này).
- [ ] Chụp ảnh giao diện; quay video 2–3 phút: tạo quảng cáo → kiểm chứng → sửa tuyên bố lệch → kiểm chứng lại.
- [ ] Gửi CBHD video.

**Làm ra:** ảnh chụp, video, bảng thời gian.

**Xong khi:** đủ ba đầu ra trên và đã gửi CBHD.

**Tra cứu:** [T7.5](#t7-5) (kiểm tra tính năng).

<a id="m5"></a>

### 🏁 Mốc 5 · Chủ nhật 13/12 · Tính năng chạy trên CopyPro

- **Phải có:** Tính năng “Kiểm chứng thông số” chạy được, có video.
- **Gửi CBHD:** Video 2–3 phút.
- **Trước khi gửi:** mọi bước trước mốc đã đánh dấu xong; tự kiểm theo [T15](#t15).

<a id="b42"></a>

### Bước 42 · Viết Chương 4–6, gửi bản thảo đầy đủ

**Ngày:** Thứ Hai 14/12 – Thứ Sáu 18/12 · **Thời lượng:** khoảng 18 giờ · **Thuộc:** Việc chung · **Kết thúc bằng:** [Mốc 6](#m6)

**Để làm gì.** Có bản thảo khóa luận đầy đủ gửi CBHD.

**Việc cần làm**

- [ ] Chương 4 (Dữ liệu và thực nghiệm): thêm các mục xây dựng dữ liệu, hướng dẫn nhãn, độ tin cậy nhãn, thiết lập, đối chứng vào trước phần Kết quả và Thảo luận đã viết ở Bước 39; viết mục mối đe dọa đến tính hợp lệ ([T8.1](#t8-1)).
- [ ] Chương 5 (Tích hợp vào CopyPro): kiến trúc, API, giao diện, thời gian, kết quả đầu–cuối.
- [ ] Chương 6 (Kết luận): kết quả theo MT1–MT4, giới hạn, hướng phát triển.
- [ ] Ghép Chương 1–3 đã nháp; chuyển sang mẫu Word của Khoa; tự kiểm theo [T13](#t13).
- [ ] Gửi CBHD toàn văn ngày 18/12.

**Làm ra:** khóa luận bản thảo đầy đủ.

**Xong khi:** đã gửi CBHD ngày 18/12.

**Tra cứu:** [T8](#t8) (dàn ý, quy tắc viết), [T13](#t13) (danh sách kiểm tra).

<a id="m6"></a>

### 🏁 Mốc 6 · Thứ Sáu 18/12 · Bản thảo đầy đủ

- **Phải có:** Khóa luận đủ 6 chương.
- **Gửi CBHD:** Toàn văn khóa luận.
- **Trước khi gửi:** mọi bước trước mốc đã đánh dấu xong; tự kiểm theo [T15](#t15).

<a id="b43"></a>

### Bước 43 · Phần mở rộng: B4 và thử trên máy tính bảng ⭐

**Ngày:** Thứ Bảy 19/12 – Thứ Hai 21/12 · **Thời lượng:** khoảng 10 giờ · **Thuộc:** Nội dung 3 (thực nghiệm)

> ⭐ Phần mở rộng: chỉ làm khi Mốc 4 và Mốc 5 đạt đúng hạn. Chậm tiến độ thì bỏ qua bước này.

**Để làm gì.** Thêm mốc tham chiếu với LLM mạnh hơn, và thử khả năng mở rộng sang nhóm sản phẩm mới.

**Việc cần làm**

- [ ] **B4:** như B2 nhưng dùng LLM mạnh hơn có chế độ suy luận; chạy trên tập kiểm tra; chỉ báo như mốc tham chiếu, không kiểm định giả thuyết.
- [ ] **Máy tính bảng:** chọn 2 mẫu, thu thập trang, sinh quảng cáo, gán khoảng 30 tuyên bố; **chỉ viết thêm tệp cấu hình** `may_tinh_bang.yaml`, giữ nguyên quy tắc A–D đã khóa; so FAR và F1 với ba nhóm chính.
- [ ] Đưa kết quả vào Chương 4 khi sửa ở Bước 44.

**Làm ra:** `ket_qua/mo_rong/`.

**Xong khi:** có bảng kết quả của B4 và của máy tính bảng, hoặc ghi rõ lý do bỏ.

**Tra cứu:** [T6.8](#t6-8) (phần mở rộng).

<a id="b44"></a>

### Bước 44 · Sửa khóa luận theo góp ý của CBHD

**Ngày:** Thứ Ba 22/12 – Thứ Sáu 25/12 · **Thời lượng:** khoảng 14 giờ · **Thuộc:** Việc chung

**Để làm gì.** Sửa hết góp ý trước hạn nộp.

**Việc cần làm**

- [ ] Lập bảng "góp ý → cách sửa → trạng thái".
- [ ] Sửa trong 22–25/12; nếu đã làm Bước 43 thì thêm kết quả phần mở rộng vào Chương 4.
- [ ] Gửi lại CBHD phần đã sửa.

**Làm ra:** khóa luận bản sửa, bảng góp ý.

**Xong khi:** mọi góp ý có trạng thái "đã sửa" hoặc có lý do không sửa.

**Tra cứu:** [T8.2](#t8-2) (quy tắc viết), [T13](#t13) (danh sách kiểm tra).

<a id="b45"></a>

### Bước 45 · Gói tái lập: hướng dẫn cài đặt và chạy lại

**Ngày:** Thứ Bảy 26/12 – Chủ nhật 27/12 · **Thời lượng:** khoảng 6 giờ · **Thuộc:** Việc chung

**Để làm gì.** Người khác và hội đồng chạy lại được kết quả, đúng cam kết "hướng dẫn cài đặt và hướng dẫn chạy lại" trong đề cương.

**Việc cần làm**

- [ ] Cập nhật `README.md`: cài đặt, cấu trúc thư mục, cách chạy từng bước.
- [ ] Viết `scripts/chay_lai.sh`: từ đầu ra đã lưu, dựng lại toàn bộ bảng kết quả mà không gọi lại LLM (nhờ bộ nhớ đệm).
- [ ] Hoàn thiện thẻ dữ liệu `data/THE_DU_LIEU.md` (bắt đầu từ Bước 4): nguồn, cách thu thập, cách gán nhãn, độ tin cậy nhãn, giới hạn, bản quyền (trang thông số thuộc bản quyền của hãng; chỉ chia sẻ trích đoạn ngắn và đường dẫn).
- [ ] Thử chạy lại trong một thư mục sạch.

**Làm ra:** `README.md`, `scripts/chay_lai.sh`, `data/THE_DU_LIEU.md`.

**Xong khi:** chạy lại ra đúng bảng kết quả chính.

**Tra cứu:** [T3.1](#t3-1) (cấu trúc thư mục).

<a id="b46"></a>

### Bước 46 · Kiểm tra cuối và nộp

**Ngày:** Thứ Hai 28/12 – Thứ Năm 31/12 · **Thời lượng:** khoảng 6 giờ · **Thuộc:** Việc chung · **Kết thúc bằng:** [Mốc 7](#m7)

**Để làm gì.** Nộp đúng hạn, không sót lỗi hình thức.

**Việc cần làm**

- [ ] Kiểm tra toàn bộ mã nguồn và dữ liệu (đề cương ghi "trước ngày 31/12/2026").
- [ ] Đi hết danh sách ở [T13](#t13).
- [ ] Gắn tag `v1.0`; nộp khóa luận, mã nguồn, dữ liệu theo hướng dẫn của Khoa.
- [ ] Cố làm xong trong 28–29/12; giữ 30–31/12 làm thời gian dự phòng.

**Làm ra:** bản nộp, tag `v1.0`.

**Xong khi:** đã nộp.

**Tra cứu:** [T13](#t13) (danh sách kiểm tra trước khi nộp), [T15](#t15) (tiêu chí tự kiểm).

<a id="m7"></a>

### 🏁 Mốc 7 · Thứ Năm 31/12 · Nộp

- **Phải có:** Đã kiểm tra toàn bộ mã nguồn, dữ liệu và nộp.
- **Gửi CBHD:** Bản nộp cuối.
- **Trước khi gửi:** mọi bước trước mốc đã đánh dấu xong; tự kiểm theo [T15](#t15).

<a id="thang-1"></a>

## Sau khi nộp · Bảo vệ

> Bảo vệ theo lịch của Khoa.

<a id="b47"></a>

### Bước 47 · Chuẩn bị bảo vệ

**Ngày:** theo lịch của Khoa · **Thời lượng:** khoảng 15 giờ · **Thuộc:** Việc chung

**Để làm gì.** Bảo vệ rõ ràng, đúng giờ, demo chạy được.

**Việc cần làm**

- [ ] Slide 15–20 trang cho khoảng 15 phút, theo thứ tự: vấn đề → ví dụ xuyên suốt → hạn chế của các bài trước → phương pháp → dữ liệu → kết quả → demo → kết luận.
- [ ] Video demo dự phòng.
- [ ] Tập dượt 3 lần, bấm giờ.
- [ ] Ôn câu trả lời ở [T11](#t11).

**Làm ra:** slide, video demo.

**Xong khi:** tập dượt đúng giờ; trả lời được các câu ở T11.

**Tra cứu:** [T1.7](#t1-7) (ví dụ xuyên suốt), [T11](#t11) (câu hỏi phản biện).

---

<a id="tra-cuu"></a>

## Tra cứu

Phần này không phải việc cần làm. Các bước ở trên dẫn tới đây khi cần.

| Mục | Nội dung | Dùng ở bước |
|---|---|---|
| [T1](#t1) | Đề tài trong một trang: vấn đề, bài toán, phương pháp P, câu hỏi nghiên cứu, tính mới, phạm vi, ví dụ xuyên suốt | 1, 3, 17, 47 |
| [T2](#t2) | Lịch tổng thể: các mốc, biểu đồ thời gian, công sức theo tuần | trước mỗi mốc |
| [T3](#t3) | Quy ước dự án: thư mục, mã định danh, thiết lập sinh quảng cáo, định dạng dữ liệu, quy tắc làm việc | 2, 4, 7, 11, 12 |
| [T4](#t4) | Hướng dẫn gán nhãn: tách tuyên bố, bốn nhãn, thứ tự quyết định, cách hiểu thông thường, ví dụ, cặp tối thiểu | 8–10, 13, 20, 24, 25, 27 |
| [T5](#t5) | Đặc tả phương pháp P: bộ thông số, BM25, neo nguồn, chuẩn hóa, bộ quyết định A–D, lý do, tệp cấu hình, kiểm thử | 8, 14, 21, 22, 27–31 |
| [T6](#t6) | Thực nghiệm và đánh giá: đối chứng, công bằng, khóa cấu hình, chỉ số, thống kê, giả thuyết | 26, 30, 32, 33, 36–39 |
| [T7](#t7) | Tích hợp vào CopyPro: kiến trúc, API, tệp cần sửa, giao diện, kiểm tra | 11, 34, 40, 41 |
| [T8](#t8) | Viết khóa luận: dàn ý, quy tắc viết | 17, 35, 39, 42, 44 |
| [T9](#t9) | Rủi ro và phương án dự phòng | khi chậm hoặc gặp sự cố |
| [T10](#t10) | Các điểm cần chốt khi làm thử | 8, 10, 11, 16, 27, 33 |
| [T11](#t11) | Câu hỏi phản biện dự kiến | 3, 47 |
| [T12](#t12) | Khung câu lệnh của B0–B2, trích xuất, tách tuyên bố | 15, 22, 29, 30 |
| [T13](#t13) | Danh sách kiểm tra trước khi nộp | 42, 44, 46 |
| [T14](#t14) | Đối chiếu kế hoạch với đề cương | khi cần chứng minh kế hoạch khớp đề cương |
| [T15](#t15) | Tiêu chí tự kiểm trước mỗi mốc | trước mỗi mốc |
| [T16](#t16) | Ký hiệu và chữ viết tắt | bất cứ lúc nào |

<a id="t1"></a>

### T1. Đề tài trong một trang

| | |
|---|---|
| **Tên đề tài** | Phương pháp kiểm chứng tuyên bố về thông số kỹ thuật có điều kiện ràng buộc trong quảng cáo |
| **Tên tiếng Anh** | A method for condition-aware verification of technical specification claims in advertising |
| **Sinh viên** | Bùi Lê Huy Phước – 23521228 – MMTT2023.2 |
| **Cán bộ hướng dẫn (CBHD)** | ThS Trần Hồng Nghi |
| **Thời gian** | 15/09/2026 – 31/12/2026; bảo vệ theo lịch của Khoa |
| **Tình trạng (11/10/2026)** | Đã có đề cương bản cuối. Chưa có dữ liệu thực nghiệm và mã nguồn của phương pháp. |

<a id="t1-1"></a>

#### T1.1 Vấn đề

LLM viết quảng cáo có thể giữ đúng con số nhưng bỏ hoặc đổi điều kiện đi kèm. Trang thông số iPhone 17 ghi điện thoại "sạc lên đến 50% trong 20 phút với bộ tiếp hợp 40W trở lên". Quảng cáo viết "sạc 50% chỉ trong 20 phút" vẫn đúng con số nhưng bỏ điều kiện bộ tiếp hợp, khiến người mua hiểu sai. Cách kiểm chứng ba nhãn (Supported, Refuted, NEI) thấy con số có trong tài liệu nên dễ chấp nhận tuyên bố này.

Đề tài xây dựng một tính năng mới cho CopyPro, website tạo quảng cáo bằng LLM của đồ án chuyên ngành: kiểm chứng các tuyên bố thông số có điều kiện ràng buộc trong quảng cáo vừa tạo, dựa trên tài liệu chính hãng.

<a id="t1-2"></a>

#### T1.2 Bài toán

| | |
|---|---|
| **Đầu vào** | Quảng cáo q do LLM tạo; mẫu sản phẩm s do người dùng chọn; kho tài liệu chính hãng D(s) của mẫu đó |
| **Đối tượng kiểm chứng** | Tuyên bố có điều kiện ràng buộc: tuyên bố nêu giá trị của một thuộc tính nằm trong danh sách thuộc tính có điều kiện ràng buộc của nhóm sản phẩm (ghi trong tệp cấu hình) |
| **Đầu ra** | Với mỗi tuyên bố c: nhãn y(c), đoạn nguồn e(c) trích từ D(s), lý do r(c) |

Bốn nhãn (định nghĩa đầy đủ ở [T4.2](#t4-2)):

| Nhãn | Ý nghĩa ngắn |
|---|---|
| **Đúng** (Supported) | Cùng sản phẩm, thuộc tính và điều kiện; giá trị khớp; kiểu giá trị không bị đổi |
| **Sai** (Refuted) | Giá trị mâu thuẫn với giá trị công bố ở điều kiện của tuyên bố, hoặc thuận lợi hơn mọi giá trị công bố |
| **Lệch điều kiện** (Misleading) | Con số trùng giá trị công bố ở một điều kiện khác, hoặc mức "lên đến" bị viết thành mức chắc chắn đạt |
| **Chưa đủ thông tin** (NEI) | Tài liệu không có thông số tương ứng, không công bố giá trị ở điều kiện của tuyên bố, hoặc ghi mâu thuẫn |

<a id="t1-3"></a>

#### T1.3 Phương pháp P

```mermaid
flowchart LR
    QC["Quảng cáo do CopyPro tạo"] --> TA["Tách và lọc<br/>tuyên bố"]
    TA --> TH["Truy hồi BM25<br/>trong tài liệu của mẫu đã chọn"]
    TH --> TX["Trích xuất bộ thông số<br/>có neo nguồn"]
    TX --> CH["Chuẩn hóa"]
    CH --> QD["Bộ quyết định A–D<br/>đối chiếu điều kiện"]
    QD --> KQ["Nhãn, đoạn nguồn, lý do<br/>hiển thị trên CopyPro"]
    CF[("Tệp cấu hình<br/>theo nhóm sản phẩm")] -.-> TA
    CF -.-> TX
    CF -.-> QD
    style QD fill:#fde68a,stroke:#b45309,color:#111111
```

| Khối | Làm gì | Đặc tả |
|---|---|---|
| Tách và lọc tuyên bố | LLM tách bài quảng cáo thành tuyên bố; Python giữ tuyên bố có thuộc tính trong tệp cấu hình | [T5.8](#t5-8) |
| Truy hồi BM25 | Xếp hạng các đoạn trong tài liệu của đúng mẫu người dùng chọn, lấy k đoạn đầu (top-k) | [T5.2](#t5-2) |
| Trích xuất có neo nguồn | LLM điền bộ bảy trường thông số, mỗi trường kèm câu gốc làm căn cứ; Python kiểm tra câu gốc có trong văn bản và con số khớp, trường không đạt bị bỏ (neo nguồn); Python dò cụm từ điều kiện để bổ sung điều kiện LLM bỏ sót (kiểm tra đầy đủ) | [T5.1](#t5-1), [T5.3](#t5-3) |
| Chuẩn hóa | Đưa tên sản phẩm, phiên bản, giá trị, đơn vị và kiểu giá trị về cùng một dạng | [T5.4](#t5-4) |
| **Bộ quyết định A–D** | A tìm thông số cùng sản phẩm và thuộc tính; B đối chiếu điều kiện theo sáu loại; C so giá trị; D tổng hợp nhãn theo thứ tự cố định. **Đây là bước chứa điểm mới** (tô màu trong sơ đồ) | [T5.5](#t5-5) |
| Sinh lý do | Ghép lý do từ dấu vết của bộ quyết định, không để LLM viết tự do | [T5.6](#t5-6) |

**Sáu loại điều kiện ràng buộc:** chế độ hoạt động (bật hoặc tắt chống ồn, chế độ tiết kiệm pin), bộ phận (tai nghe hay hộp sạc), phụ kiện (bộ sạc có công suất nhất định), điều kiện đo (độ sâu và thời gian ngâm nước, phần diện tích màn hình được đo), phiên bản sản phẩm, kiểu giá trị ("lên đến", "tối đa", "điển hình", "định mức").

<a id="t1-4"></a>

#### T1.4 Câu hỏi nghiên cứu và cách trả lời

| Câu hỏi | Giả thuyết | So sánh | Chỉ số chính |
|---|---|---|---|
| **CH1.** Đối chiếu tường minh điều kiện có làm giảm tỷ lệ tuyên bố sai hoặc lệch điều kiện bị chấp nhận là Đúng so với các cách kiểm chứng hiện có, mà không bỏ sót nhiều tuyên bố đúng? | **H1.** FAR của P thấp hơn B0–B3, và Recall của nhãn Đúng không thấp hơn quá 5 điểm phần trăm so với đối chứng tốt nhất | P với B0, B1, B2, B3 | FAR, Recall nhãn Đúng |
| **CH2.** Quyết định nhãn bằng quy tắc tường minh trên dữ liệu đã neo nguồn có phát hiện tuyên bố Lệch điều kiện tốt hơn cách để LLM tự gán nhãn? | **H2.** F1 của nhãn Lệch điều kiện của P cao hơn B1 và B2 | P với B1, B2 | F1 nhãn Lệch điều kiện |
| **CH3.** Neo nguồn và đối chiếu điều kiện đóng góp thế nào vào kết quả? | **H3.** P tốt hơn P−NN về FAR và F1 nhãn Lệch điều kiện | P với P−NN; P với P−ĐK | FAR, F1 nhãn Lệch điều kiện |

Tiêu chí kết luận "đạt" hay "không đạt" được ghi trước ở [T6.6](#t6-6). Kết quả được báo cáo cả khi không đạt giả thuyết.

<a id="t1-5"></a>

#### T1.5 Tính mới, đóng góp và bằng chứng sẽ có

| Ý trong đề cương | Bằng chứng trong khóa luận | Bước tạo ra |
|---|---|---|
| **Tính mới 1.** Xét riêng loại tuyên bố thông số có điều kiện ràng buộc trong quảng cáo tiếng Việt do LLM tạo, loại tuyên bố mà các nghiên cứu đã khảo sát chưa xét riêng | Bảng so sánh với các nghiên cứu trước (Chương 2); bộ dữ liệu và hướng dẫn gán nhãn bốn lớp cho riêng loại tuyên bố này; kappa giữa hai người gán | [3](#b03), [9](#b09), [17](#b17), [32](#b32) |
| **Tính mới 2.** Kết luận bằng phép đối chiếu điều kiện: Lệch điều kiện khi con số trùng giá trị công bố ở điều kiện khác, hoặc khi mức "lên đến" bị viết thành mức chắc chắn | F1 Lệch của P so với B1 (cùng bộ thông số, LLM tự gán) và B2 (cùng bốn nhãn, LLM tự gán); P so với P−ĐK | [27](#b27), [28](#b28), [30](#b30), [31](#b31), [37](#b37) |
| **Tính mới 3.** Sáu loại điều kiện làm danh mục để so từng loại (cụ thể hóa lược đồ MeasEval cho thông số sản phẩm) | Tệp cấu hình ba nhóm sản phẩm; kết quả theo từng loại biến đổi trên tập cặp tối thiểu | [8](#b08), [25](#b25), [37](#b37) |
| **Đóng góp 1.** Phương pháp P gồm trích xuất có neo nguồn và bộ quyết định bốn nhãn, cài thành mã nguồn có kiểm thử cho từng quy tắc | Mã nguồn `src/kiemchung/`, `tests/` | [21](#b21), [22](#b22), [27](#b27)–[29](#b29) |
| **Đóng góp 2.** Bộ dữ liệu tiếng Việt bốn nhãn, kèm đoạn nguồn, lý do và tập cặp tối thiểu | Thư mục `data/`, thẻ dữ liệu, bảng thống kê dữ liệu | [4](#b04)–[13](#b13), [18](#b18)–[20](#b20), [23](#b23)–[26](#b26), [32](#b32) |
| **Đóng góp 3.** Số liệu cho biết LLM bỏ hoặc đổi điều kiện thường đến mức nào, theo hai chế độ sinh | Tỷ lệ Lệch điều kiện và Sai theo chế độ có hoặc không có đoạn thông số | [39](#b39) |
| **Đóng góp 4.** Đánh giá có đối chứng với bốn cách kiểm chứng hiện có và hai bản bỏ thành phần | Bảng kết quả chính có KTC và kiểm định | [36](#b36)–[39](#b39) |
| **Đóng góp 5.** Tính năng "Kiểm chứng thông số" trong CopyPro | Tính năng chạy được, video, bảng thời gian | [34](#b34), [40](#b40), [41](#b41) |

**Câu trả lời ngắn khi bị hỏi về tính mới:** "Các cách hiện có để LLM tự đọc bằng chứng rồi phán đoán, hoặc phải tự đoán phần ngữ cảnh bị bỏ. Em liệt kê sáu loại điều kiện mà hãng công bố, rồi kết luận Lệch điều kiện bằng phép đối chiếu tường minh: con số trùng giá trị ở điều kiện khác thì là Lệch. Bước tách điều kiện chỉ chuẩn bị đầu vào. Điểm mới nằm ở bước kết luận. So với B1, dùng cùng bộ thông số đã trích nhưng để LLM gán nhãn, cho thấy riêng tác dụng của bước kết luận; so với B2, dùng cùng bốn nhãn nhưng để LLM đọc bằng chứng rồi gán, cho thấy chỉ sửa câu lệnh là chưa đủ."

<a id="t1-6"></a>

#### T1.6 Phạm vi tóm tắt

| Mục | Trong phạm vi |
|---|---|
| Nhóm sản phẩm | Điện thoại thông minh, tai nghe không dây, đồng hồ thông minh |
| Nhóm thông số | Thời lượng pin, dung lượng pin, sạc nhanh, kháng nước và bụi, màn hình (độ sáng, tần số quét), zoom camera |
| Mẫu sản phẩm | Khoảng 12 mẫu (khoảng 5 điện thoại, 4 tai nghe, 3 đồng hồ) của ít nhất ba hãng (dự kiến Apple, Samsung, Xiaomi, OPPO), đang bán chính hãng tại Việt Nam |
| Bằng chứng | Chỉ tài liệu văn bản chính hãng của đúng mẫu sản phẩm |
| Quảng cáo | Do CopyPro tạo ở ngành Công nghệ; 2 LLM thuộc hai họ mô hình (dự kiến Gemini 3.6 Flash và GPT-OSS 120B qua Groq); 3 loại bài (mô tả sản phẩm, bài đăng mạng xã hội, landing page); 2 chế độ (chỉ nhập tên sản phẩm; nhập thêm đoạn thông số chính hãng vào ô thông tin bổ sung) |
| Quy mô dữ liệu | Khoảng 250–300 tuyên bố và 100–120 biến thể cặp tối thiểu |
| Ngoài phạm vi | Thông số không kèm điều kiện (khối lượng, kích thước, phiên bản Bluetooth); tuyên bố cảm tính; so sánh với sản phẩm khác; giá và khuyến mãi; đo hiệu năng thực tế; kết luận pháp lý; quảng cáo do người viết; tự nhận diện sản phẩm. Máy tính xách tay, tivi, đồ gia dụng không thuộc phạm vi thực nghiệm; khả năng mở rộng chỉ thử trên máy tính bảng (phần mở rộng) |

<a id="t1-7"></a>

#### T1.7 Ví dụ xuyên suốt

Trang thông số Galaxy Buds3 Pro ghi thời lượng phát nhạc lên đến 6 giờ khi bật chống ồn và 7 giờ khi tắt chống ồn (ví dụ trong đề cương).

| Tuyên bố | Nhãn | Vì sao |
|---|---|---|
| "Nghe nhạc 6 giờ khi bật chống ồn" | Đúng | Cùng điều kiện, giá trị khớp |
| "Nghe nhạc 7 giờ khi bật chống ồn" | **Lệch điều kiện** | 7 giờ chỉ đạt khi tắt chống ồn |
| "Nghe nhạc 8 giờ" | Sai | Thuận lợi hơn mọi giá trị công bố cho tai nghe |
| Thời lượng pin ở một chế độ mà trang không công bố | Chưa đủ thông tin | Tài liệu không có giá trị ở điều kiện đó |

Phép so khớp chỉ dựa trên con số dễ chấp nhận tuyên bố thứ hai, vì con số 7 giờ có trong tài liệu. Đây là lỗi mà đề tài khắc phục.

---

<a id="t2"></a>

### T2. Lịch tổng thể

Bốn giai đoạn theo đề cương: tháng 9 khảo sát tài liệu, hướng dẫn gán nhãn, chuẩn bị môi trường (gộp vào Bước 2, 3, 4, 9); tháng 10 làm thử trên 2 mẫu; tháng 11 hoàn thiện dữ liệu, cài đặt P và các đối chứng, khóa cấu hình; tháng 12 chạy tập kiểm tra, tích hợp CopyPro, hoàn thiện khóa luận. Phần lõi bắt buộc làm trước; phần mở rộng (Bước 43) chỉ làm khi đúng tiến độ.

<a id="t2-1"></a>

#### T2.1 Các mốc kiểm tra với CBHD

| Mốc | Ngày | Phải có | Gửi CBHD | Sau bước |
|---|---|---|---|---|
| [**Mốc 1**](#m1) | Thứ Hai 12/10 | Đề cương và tên đề tài được CBHD xác nhận | Đề cương bản cuối (PDF) | [1](#b01) |
| [**Mốc 2**](#m2) | Thứ Bảy 31/10 | Khoảng 60 tuyên bố có nhãn; BM25 và B0 chạy trên bộ thử; hướng dẫn nhãn bản 2; quy mô dữ liệu đã chốt | Báo cáo bộ thử 1–2 trang | [16](#b16) |
| [**Mốc 3**](#m3) | Thứ Sáu 27/11 | Dữ liệu và độ tin cậy nhãn xong; P và các đối chứng chạy trên tập phát triển; cấu hình đã khóa trước khi chạy tập kiểm tra | Tệp khóa cấu hình, bảng kết quả tập phát triển | [33](#b33) |
| [**Mốc 4**](#m4) | Thứ Ba 08/12 | Chỉ số, khoảng tin cậy, kiểm định, phân tích lỗi, kết luận H1–H3 | Bảng kết quả chính | [39](#b39) |
| [**Mốc 5**](#m5) | Chủ nhật 13/12 | Tính năng “Kiểm chứng thông số” chạy được, có video | Video 2–3 phút | [41](#b41) |
| [**Mốc 6**](#m6) | Thứ Sáu 18/12 | Khóa luận đủ 6 chương | Toàn văn khóa luận | [42](#b42) |
| [**Mốc 7**](#m7) | Thứ Năm 31/12 | Đã kiểm tra toàn bộ mã nguồn, dữ liệu và nộp | Bản nộp cuối | [46](#b46) |

<a id="t2-2"></a>

#### T2.2 Biểu đồ thời gian

```mermaid
gantt
    title Lộ trình từ 11/10 đến 31/12/2026
    dateFormat YYYY-MM-DD
    axisFormat %d/%m
    section Tháng 10
    B1 Sửa và nộp đề cương, chốt tên đề tài :b01, 2026-10-11, 2d
    Mốc 1 (12/10) :milestone, m1, 2026-10-12, 0d
    B2 Dựng môi trường thực nghiệm, thử LLM :b02, 2026-10-13, 1d
    B3 Khảo sát tài liệu, ghi chú có số trang :b03, 2026-10-14, 2d
    B4 Chọn 12 mẫu sản phẩm, chia trước hai tập :b04, 2026-10-16, 1d
    B5 Thu thập trang thông số của 2 mẫu thử :b05, 2026-10-17, 1d
    B6 Thu thập trang thông số của 10 mẫu còn lại :b06, 2026-10-18, 1d
    B7 Chia tài liệu thành đoạn :b07, 2026-10-19, 1d
    B8 Viết tệp cấu hình điều kiện bắt buộc :b08, 2026-10-20, 2d
    B9 Viết hướng dẫn gán nhãn bốn lớp và ví dụ :b09, 2026-10-21, 2d
    B10 Khảo sát cách hiểu của 5–10 người đọc :b10, 2026-10-23, 1d
    B11 Làm công cụ sinh quảng cáo qua CopyPro :b11, 2026-10-24, 2d
    B12 Sinh quảng cáo và tách tuyên bố của bộ thử :b12, 2026-10-26, 1d
    B13 Gán nhãn bộ thử, đo thời gian gán :b13, 2026-10-27, 1d
    B14 Làm mô-đun truy hồi BM25, đo Recall@k :b14, 2026-10-28, 1d
    B15 Cài đặt đối chứng B0 :b15, 2026-10-29, 1d
    B16 Phân tích bộ thử, chốt hướng dẫn và quy mô :b16, 2026-10-30, 2d
    Mốc 2 (31/10) :milestone, m2, 2026-10-31, 0d
    section Tháng 11
    B17 Viết nháp Chương 1 và Chương 2 :b17, 2026-11-01, 2d
    B18 Sinh quảng cáo cho 10 mẫu còn lại :b18, 2026-11-03, 1d
    B19 Tách tuyên bố của tập phát triển :b19, 2026-11-04, 1d
    B20 Gán nhãn tập phát triển :b20, 2026-11-05, 2d
    B21 Chuẩn hóa sản phẩm, giá trị, đơn vị, kiểu giá trị :b21, 2026-11-07, 1d
    B22 Trích xuất có neo nguồn và kiểm tra đầy đủ :b22, 2026-11-08, 3d
    B23 Tách tuyên bố của tập kiểm tra :b23, 2026-11-11, 1d
    B24 Gán nhãn tập kiểm tra :b24, 2026-11-12, 2d
    B25 Tạo tập cặp tối thiểu :b25, 2026-11-14, 2d
    B26 Ghi chính thức cách chia tập, gửi việc cho người gán thứ hai :b26, 2026-11-16, 1d
    B27 Cài bộ quyết định A–D, sinh lý do, kiểm thử :b27, 2026-11-17, 3d
    B28 Ghép phương pháp P, đo độ đúng trích xuất :b28, 2026-11-20, 1d
    B29 Tách và lọc tuyên bố tự động :b29, 2026-11-21, 1d
    B30 Cài đặt đối chứng B1, B2, B3 :b30, 2026-11-22, 2d
    B31 Làm hai bản bỏ thành phần P−ĐK, P−NN :b31, 2026-11-24, 1d
    B32 Đo độ tin cậy nhãn – gán lại 20%, tính kappa :b32, 2026-11-24, 2d
    B33 Chọn cấu hình, khóa cấu hình, niêm phong nhãn :b33, 2026-11-26, 2d
    Mốc 3 (27/11) :milestone, m3, 2026-11-27, 0d
    B34 Làm dịch vụ kiểm chứng (API) :b34, 2026-11-28, 2d
    B35 Viết nháp Chương 3 :b35, 2026-11-30, 2d
    section Tháng 12
    B36 Chạy tập kiểm tra một lần :b36, 2026-12-02, 1d
    B37 Tính chỉ số, khoảng tin cậy, kiểm định :b37, 2026-12-03, 2d
    B38 Phân tích lỗi theo nguồn gốc :b38, 2026-12-05, 2d
    B39 Kết luận giả thuyết, viết phần kết quả :b39, 2026-12-07, 2d
    Mốc 4 (08/12) :milestone, m4, 2026-12-08, 0d
    B40 Tích hợp vào CopyPro – backend và giao diện :b40, 2026-12-09, 4d
    B41 Kiểm tra tính năng, đo thời gian, quay video :b41, 2026-12-13, 1d
    Mốc 5 (13/12) :milestone, m5, 2026-12-13, 0d
    B42 Viết Chương 4–6, gửi bản thảo đầy đủ :b42, 2026-12-14, 5d
    Mốc 6 (18/12) :milestone, m6, 2026-12-18, 0d
    B43 Phần mở rộng – B4 và thử trên máy tính bảng :b43, 2026-12-19, 3d
    B44 Sửa khóa luận theo góp ý của CBHD :b44, 2026-12-22, 4d
    B45 Gói tái lập – hướng dẫn cài đặt và chạy lại :b45, 2026-12-26, 2d
    B46 Kiểm tra cuối và nộp :b46, 2026-12-28, 4d
    Mốc 7 (31/12) :milestone, m7, 2026-12-31, 0d
```

> Biểu đồ dựng từ cùng dữ liệu với danh sách việc ở đầu file. Nếu biểu đồ không hiện (ví dụ khi xem tệp ngoài GitHub), dùng danh sách việc.

<a id="t2-3"></a>

#### T2.3 Công sức theo tuần

Tổng thời lượng ước tính của Bước 1–46 là **khoảng 296 giờ** (gồm 10 giờ của phần mở rộng ở Bước 43), tức trung bình khoảng 25 giờ mỗi tuần từ 11/10 đến 31/12. Chuẩn bị bảo vệ (Bước 47) thêm khoảng 15 giờ.

| Tuần | Từ – đến | Các bước | Giờ | Mức tải |
|---|---|---|---|---|
| 1 | 11/10 – 18/10 | 1, 2, 3, 4, 5, 6 | 24 | `████████████████` |
| 2 | 19/10 – 25/10 | 7, 8, 9, 10, 11 | 23 | `███████████████` |
| 3 | 26/10 – 01/11 | 12, 13, 14, 15, 16, 17 | 28 | `███████████████████` |
| 4 | 02/11 – 08/11 | 17, 18, 19, 20, 21, 22 | 23 | `███████████████` |
| 5 | 09/11 – 15/11 | 22, 23, 24, 25 | 29 | `███████████████████` |
| 6 | 16/11 – 22/11 | 26, 27, 28, 29, 30 | 30 | `████████████████████` |
| 7 | 23/11 – 29/11 | 30, 31, 32, 33, 34 | 28 | `██████████████████` |
| 8 | 30/11 – 06/12 | 35, 36, 37, 38 | 30 | `████████████████████` |
| 9 | 07/12 – 13/12 | 39, 40, 41 | 28 | `███████████████████` |
| 10 | 14/12 – 20/12 | 42, 43 | 25 | `████████████████` |
| 11 | 21/12 – 27/12 | 43, 44, 45 | 23 | `████████████████` |
| 12 | 28/12 – 31/12 | 46 | 6 | `████` |

Mỗi tuần khoảng 23–30 giờ, tức trung bình 3–4 giờ mỗi ngày. Hai tuần nặng nhất, khoảng 30 giờ, là tuần 6 (16–22/11: cài bộ quyết định, ghép P, tách tự động, cài đối chứng) và tuần 8 (30/11–06/12: viết Chương 3, chạy tập kiểm tra, tính chỉ số, phân tích lỗi). Tuần 12 (28–31/12) chỉ khoảng 6 giờ vì là thời gian dự phòng trước hạn nộp. Tuần 1 tính từ Chủ nhật 11/10.

---

<a id="t3"></a>

### T3. Quy ước dự án

<a id="t3-1"></a>

#### T3.1 Cấu trúc thư mục

```text
KLTN/
├── CHI_TIET_TUYEN_TINH_KHOA_LUAN.md     # tài liệu này
├── README.md
├── de_cuong/                            # đề cương: bản cuối (PDF), bản làm việc, mã dựng
├── báo/, dịch/                          # bài báo gốc và bản dịch để đọc
├── data/
│   ├── mau_san_pham.csv                 # 12 mẫu: mã, nhóm, hãng, URL, tập
│   ├── nguon/<ma_mau>/                  # page.html, page.txt, full.png, meta.json, doan.jsonl
│   ├── cau_hinh/<nhom>.yaml             # thuộc tính có điều kiện, điều kiện bắt buộc, cách hiểu thông thường
│   ├── huong_dan_gan_nhan.md
│   ├── quang_cao/<ma_qc>.json           # câu lệnh, mô hình, tham số, đầu ra, thời điểm
│   ├── tuyen_bo/{thu,chinh}.jsonl
│   ├── nhan/{thu,chinh,gan_lai,nguoi_2}.jsonl
│   ├── cap_toi_thieu.jsonl
│   ├── chia_tap.json
│   └── THE_DU_LIEU.md
├── src/kiemchung/
│   ├── llm.py                           # gọi LLM, bộ nhớ đệm, nhật ký
│   ├── sinh_quang_cao.py, tach_tuyen_bo.py, truy_hoi.py
│   ├── trich_xuat.py, neo_nguon.py, chuan_hoa.py, quyet_dinh.py, p.py
│   ├── danh_gia.py, api.py
│   └── doi_chung/                       # b0.py, b1.py, b2.py, b3.py, b4.py
├── tests/
├── scripts/chay_lai.sh
├── ket_qua/                             # mỗi lần chạy một thư mục con, kèm manifest.json
└── luan_van/                            # nhật ký, ghi chú tài liệu, nháp chương, hình
```

Tên thư mục và tệp mã nguồn viết không dấu để tránh lỗi trên các hệ điều hành.

<a id="t3-2"></a>

#### T3.2 Mã định danh

| Đối tượng | Mẫu mã | Ví dụ |
|---|---|---|
| Mẫu sản phẩm | `<nhóm>-<hãng>-<tên>` | `tn-samsung-buds3pro`, `dt-apple-iphone17`, `dh-apple-watchse3` |
| Đoạn tài liệu | `<ma_mau>#<số>` | `tn-samsung-buds3pro#014` |
| Bài quảng cáo | `qc-<ma_mau>-<llm>-<loai_bai>-<che_do>-<lần>` | `qc-tn-samsung-buds3pro-gemini-social-ten-1` |
| Tuyên bố | `tb-<5 chữ số>` | `tb-00042` |
| Biến thể cặp tối thiểu | `ct-<số của tuyên bố gốc>-<loại>` | `ct-00042-doi_bo_phan` |
| Lần chạy | `run-<ngày>-<hệ thống>-<tập>` | `run-20261201-P-kiemtra` |

<a id="t3-3"></a>

#### T3.3 Thiết lập sinh quảng cáo

| Tham số | Giá trị | Nguồn |
|---|---|---|
| Ngành | `technology` (Công nghệ) | Đề cương; mã lấy từ CopyPro |
| LLM sinh | `gemini-3.6-flash` (Google); `openai/gpt-oss-120b` (Groq) | Đề cương ghi "dự kiến"; mã mô hình tra ngày 11/10/2026 |
| Loại bài | `description` (Mô tả sản phẩm), `social` (bài đăng mạng xã hội), `landing` (Landing page) | Đề cương; mã lấy từ CopyPro |
| Chế độ | `ten`: chỉ nhập tên sản phẩm; `ten_thong_so`: nhập thêm đoạn thông số chính hãng vào ô "Thông tin bổ sung" | Đề cương |
| Từ khóa | Để trống, để chế độ `ten` đúng là "chỉ nhập tên sản phẩm". Chỉ khi Bước 16 thấy quá ít tuyên bố mới điền tên các nhóm thông số, không kèm con số, cho mọi bài | Đề xuất; phương án rủi ro trong đề cương; điểm 13 ở [T10](#t10) |
| Giọng văn, độ dài | `professional` (Chuyên nghiệp), `medium` | Đề xuất, chốt ở Bước 11 |
| Nhiệt độ và tham số khác | Giữ nguyên tham số backend CopyPro tự đặt (ở commit `09a35a5`: nhiệt độ 0,75 và top-p 0,9 khi gọi Gemini và Groq) | Mã nguồn CopyPro |
| Cách gọi | API `POST /api/contents/generate` của backend CopyPro | Bước 11 |
| Số phiên bản mỗi lần gọi | 1, để mỗi lần gọi là một bài | Đề xuất, điểm 7 ở [T10](#t10) |

<a id="t3-4"></a>

#### T3.4 Định dạng dữ liệu

Tuyên bố (`data/tuyen_bo/*.jsonl`, mỗi dòng một tuyên bố):

```json
{"id": "tb-00042", "ma_qc": "qc-tn-samsung-buds3pro-gemini-social-ten-1", "ma_mau": "tn-samsung-buds3pro",
 "cau_goc": "Galaxy Buds3 Pro nghe nhạc liền 7 tiếng ngay cả khi bật chống ồn",
 "tuyen_bo": "Galaxy Buds3 Pro nghe nhạc 7 giờ khi bật chống ồn",
 "thuoc_tinh": "thoi_luong_pin_nghe_nhac", "llm_sinh": "gemini-3.6-flash", "che_do": "ten", "loai_bai": "social"}
```

Nhãn (`data/nhan/*.jsonl`):

```json
{"id": "tb-00042", "nhan": "LECH", "loai": "doi_dieu_kien",
 "bang_chung": ["tn-samsung-buds3pro#014"], "trich": "Thời gian phát nhạc (Giờ, tắt ANC) Lên đến 7",
 "ly_do": "7 giờ chỉ đạt khi tắt chống ồn; tuyên bố ghi bật chống ồn",
 "nguoi_gan": "phuoc", "luot": 1, "giay": 95, "tai_lieu_mau_thuan": false, "ghi_chu": ""}
```

- **Mã nhãn:** `DUNG`, `SAI`, `LECH`, `CHUA_DU`.
- **Mã loại biến đổi** (dùng chung cho nhãn Lệch điều kiện và cho tập cặp tối thiểu): `bo_dieu_kien`, `doi_dieu_kien`, `doi_bo_phan`, `doi_phien_ban`, `doi_kieu_gia_tri`, `doi_gia_tri` (loại cuối thường cho nhãn Sai).

<a id="t3-5"></a>

#### T3.5 Quy tắc làm việc

1. **Nhật ký.** Mỗi ngày làm việc ghi 3–5 dòng vào `luan_van/nhat_ky.md`: đã làm gì, số liệu gì, vướng gì, đổi gì.
2. **Commit nhỏ, thường xuyên;** đẩy lên GitHub mỗi ngày làm việc. Không bao giờ commit khóa API.
3. **Bộ nhớ đệm LLM.** Mọi lần gọi LLM đi qua `llm.py` và được lưu theo mã băm của (mô hình, câu lệnh, tham số), nên chạy lại không tốn tiền và không đổi kết quả.
4. **Bảo vệ tập kiểm tra.**
   - Từ Bước 4, khi hai tập đã được chia trước, mọi lựa chọn (câu lệnh, k, mô hình, ngưỡng, tệp cấu hình, ví dụ trong hướng dẫn) chỉ dựa trên tập phát triển. Bước 26 chỉ ghi chính thức ranh giới đó.
   - Nhãn tập kiểm tra chỉ được mở lại để gán lại mù ở Bước 32.
   - Tập kiểm tra chỉ chạy một lần, sau khi có tag `khoa-cau-hinh`.
5. **Dùng AI hỗ trợ.** Được dùng để viết mã và sửa câu chữ. Không dùng AI để gán nhãn chuẩn. Luôn kiểm lại trích dẫn trên bài gốc.
6. **Sao lưu.** Ảnh chụp trang thông số lưu thêm một bản ngoài máy, ví dụ trên Google Drive.
7. **Đề cương là chuẩn.** Khi đề cương và kế hoạch khác nhau, sửa kế hoạch cho khớp rồi ghi một dòng vào nhật ký.
8. **Chỉ đánh dấu xong khi đạt "Xong khi".** Một bước chỉ được đánh dấu xong trong danh sách việc khi đạt đủ tiêu chí "Xong khi" của bước đó.

---

<a id="t4"></a>

### T4. Hướng dẫn gán nhãn

Đây là khung cho `data/huong_dan_gan_nhan.md` (viết ở Bước 9, chốt bản 2 ở Bước 16). Hệ thống P cài đúng các quy tắc này, nên hướng dẫn và mã nguồn phải luôn khớp nhau.

<a id="t4-1"></a>

#### T4.1 Tách tuyên bố

- Một tuyên bố chỉ có **một thuộc tính và một giá trị**. Câu "pin 6 giờ, sạc đầy trong 1 giờ" tách thành hai tuyên bố.
- **Giữ ngữ cảnh:** tên sản phẩm, phiên bản, bộ phận và điều kiện nằm ở câu trước hoặc câu sau phải được đưa vào tuyên bố, để tuyên bố không đổi nghĩa (hướng của FactLens [10]).
- **Chỉ giữ tuyên bố có điều kiện ràng buộc,** tức có thuộc tính trong tệp cấu hình của nhóm sản phẩm. Bỏ: khối lượng, kích thước, phiên bản Bluetooth; tuyên bố cảm tính; so sánh với sản phẩm khác; giá và khuyến mãi.

<a id="t4-2"></a>

#### T4.2 Định nghĩa bốn nhãn (nguyên văn đề cương)

| Nhãn | Định nghĩa |
|---|---|
| **Đúng** | Tài liệu có thông số cùng sản phẩm, thuộc tính và điều kiện với tuyên bố, giá trị khớp và kiểu giá trị không bị đổi. |
| **Sai** | Tài liệu có thông số cùng sản phẩm và thuộc tính, nhưng giá trị của tuyên bố mâu thuẫn với giá trị công bố ở điều kiện của tuyên bố hoặc thuận lợi hơn mọi giá trị được công bố, đồng thời không trùng giá trị nào ở điều kiện khác. |
| **Lệch điều kiện** | Giá trị trong tuyên bố trùng giá trị được công bố ở một điều kiện khác với điều kiện mà tuyên bố nêu hoặc được hiểu thông thường (bỏ hoặc đổi chế độ, bộ phận, phụ kiện, phiên bản, điều kiện đo), hoặc tuyên bố biến mức tối đa "lên đến" thành mức chắc chắn đạt. |
| **Chưa đủ thông tin** | Kho tài liệu không có thông số cùng sản phẩm và thuộc tính, không công bố giá trị ở điều kiện mà tuyên bố nêu, hoặc ghi mâu thuẫn. |

Hai khái niệm dùng chung:

- **Khớp giá trị:** bằng giá trị công bố sau chuẩn hóa, hoặc **kém thuận lợi hơn** giá trị đó (ví dụ nêu thời lượng pin thấp hơn, thời gian sạc lâu hơn), vì không gây hiểu nhầm có lợi cho người bán. Hướng thuận lợi của từng thuộc tính ghi trong tệp cấu hình. Riêng mã phân loại như chuẩn IP, kế hoạch đề xuất phải bằng đúng, vì các mức chống nước không xếp thành một thang (theo IEC 60529, mức 7–8 không mặc nhiên bao gồm mức 5–6); đây là điểm 11 cần chốt ở [T10](#t10).
- **Điều kiện của tuyên bố:** điều kiện được nêu rõ; điều kiện bắt buộc nào không nêu thì lấy **cách hiểu thông thường** trong tệp cấu hình ([T4.5](#t4-5)).

<a id="t4-3"></a>

#### T4.3 Thứ tự quyết định

Đi từ trên xuống, **dừng ở dòng đầu tiên thỏa**. Các dòng D1–D6 theo đúng thứ tự quy tắc D trong đề cương; hai dòng D1a, D1b lấy từ những chỗ khác của đề cương (xem ghi chú dưới bảng).

| Dòng | Kiểm tra | Nhãn |
|---|---|---|
| D1 | Tài liệu không có thông số cùng sản phẩm và thuộc tính | Chưa đủ thông tin |
| D1a | Không xác định được điều kiện của tuyên bố, kể cả sau khi dò cụm từ trong tệp cấu hình (ví dụ tuyên bố nêu một chế độ mà tệp cấu hình không biết) | Chưa đủ thông tin |
| D1b | Tài liệu ghi hai giá trị khác nhau cho cùng sản phẩm, thuộc tính và điều kiện của tuyên bố | Chưa đủ thông tin, đặt cờ `tai_lieu_mau_thuan` |
| D2 | Tuyên bố biến mức "lên đến" thành mức chắc chắn đạt: có từ khẳng định ("luôn", "đảm bảo", "ít nhất", "mọi lúc") cho một mức không cao hơn mức "lên đến" ở cùng điều kiện | Lệch điều kiện (`doi_kieu_gia_tri`) |
| D3 | Có thông số cùng điều kiện và giá trị khớp | Đúng |
| D4 | Giá trị của tuyên bố bằng giá trị được công bố ở một điều kiện khác | Lệch điều kiện |
| D5 | Giá trị mâu thuẫn với giá trị ở cùng điều kiện, hoặc thuận lợi hơn mọi giá trị công bố cho cùng bộ phận và phiên bản | Sai |
| D6 | Còn lại: tài liệu không công bố giá trị ở điều kiện tuyên bố nêu | Chưa đủ thông tin |

> **Về D1a và D1b.** Chuỗi D trong đề cương không có hai trường hợp này, nhưng đề cương có nêu ở chỗ khác: D1a theo câu "nếu vẫn không xác định được điều kiện thì kết luận Chưa đủ thông tin" ở Nội dung 2; D1b theo định nghĩa nhãn Chưa đủ thông tin ("hoặc ghi mâu thuẫn"). Hai dòng được đặt trước D2 để không bao giờ dẫn tới nhãn Đúng. Chốt ở Bước 27 (điểm 6 và 14 ở [T10](#t10)).
>
> **Về D5.** "Mọi giá trị công bố" được hiểu là mọi giá trị cho cùng bộ phận và phiên bản, đúng như ví dụ trong đề cương: "nghe nhạc 8 giờ" là Sai "vì thuận lợi hơn mọi giá trị công bố cho tai nghe", dù tổng thời lượng kèm hộp sạc lớn hơn 8 giờ.

**Kiểu giá trị.** Tuyên bố không có từ chỉ kiểu giá trị thì lấy kiểu giá trị mặc định của thuộc tính trong tệp cấu hình, thường là kiểu hãng công bố. Vì vậy "nghe nhạc 6 giờ" khớp "lên đến 6 giờ" (ví dụ nhãn Đúng trong đề cương). Từ khẳng định chắc chắn được xét ở D2. Tuyên bố ghi rõ một kiểu giá trị khác tài liệu (ví dụ ghi "định mức" cho con số "điển hình") thì kiểu giá trị bị đổi: không thể là Đúng ở D3, và được xét như khác điều kiện ở D4.

<a id="t4-4"></a>

#### T4.4 Ghi bằng chứng và lý do

- Ghi mã đoạn và câu trích **nguyên văn** từ tài liệu.
- Lý do viết một câu, nêu rõ điều kiện nào bị bỏ hoặc bị đổi, ví dụ: "7 giờ chỉ đạt khi tắt chống ồn; tuyên bố ghi bật chống ồn."
- **Tài liệu mâu thuẫn hoặc ghi nhầm:** gán Chưa đủ thông tin, đặt `tai_lieu_mau_thuan = true`, thống kê riêng.
- **Điều kiện không xếp được vào sáu loại:** ghi vào trường `ghi_chu` để báo trong phần giới hạn của khóa luận.

<a id="t4-5"></a>

#### T4.5 Cách hiểu thông thường khi tuyên bố không nêu điều kiện (bản đề xuất)

Nguyên tắc chung theo đề cương: hiểu theo cách người mua thông thường hiểu, **bộ phận chính, không mua thêm phụ kiện**. Bảng dưới là bản đề xuất để viết tệp cấu hình ở Bước 8; khảo sát người đọc ở Bước 10 sẽ xác nhận hoặc sửa.

| Nhóm | Thuộc tính | Điều kiện bắt buộc (loại điều kiện) | Cách hiểu khi tuyên bố không nêu |
|---|---|---|---|
| Điện thoại | Thời lượng pin | Hoạt động sử dụng: xem video, xem video trực tuyến, nghe nhạc (chế độ hoạt động); phiên bản | Hoạt động kém thuận lợi nhất trong các hoạt động hãng công bố*; phiên bản nêu trong tên |
| Điện thoại | Sạc nhanh (giá trị: thời gian sạc, thấp hơn là tốt hơn) | Công suất bộ sạc (phụ kiện); mốc phần trăm cần đạt, ví dụ 50% (điều kiện đo) | Không mua thêm bộ sạc |
| Điện thoại | Độ sáng | Chế độ hiển thị: thông thường, HDR, ngoài trời, cực đại (chế độ hoạt động)*; phần diện tích đo (điều kiện đo) | Chế độ thông thường; phần diện tích đo như hãng công bố cho chế độ đó |
| Điện thoại | Tần số quét | Tối đa hay thích ứng (kiểu giá trị) | Mức tối đa như hãng công bố |
| Điện thoại | Zoom | Quang học hay kỹ thuật số (đề xuất xếp vào chế độ hoạt động*) | Quang học |
| Điện thoại | Kháng nước và bụi | Độ sâu, thời gian, loại nước (điều kiện đo) | Điều kiện thử hãng công bố |
| Điện thoại | Dung lượng pin | Điển hình hay định mức (kiểu giá trị); phiên bản | Điển hình*; phiên bản nêu trong tên |
| Tai nghe | Thời lượng pin | Bật hay tắt chống ồn (chế độ hoạt động); chỉ tai nghe hay kèm hộp sạc (bộ phận) | Chỉ tai nghe; chế độ kém thuận lợi nhất* |
| Tai nghe | Sạc nhanh (giá trị: số giờ nghe sau khi sạc) | Số phút sạc (điều kiện đo); bộ phận | Tai nghe |
| Tai nghe | Kháng nước | Tai nghe hay hộp sạc (bộ phận); điều kiện thử (điều kiện đo) | Tai nghe |
| Tai nghe | Dung lượng pin | Tai nghe hay hộp sạc (bộ phận) | Tai nghe |
| Đồng hồ | Thời lượng pin | Chế độ thường hay nguồn điện thấp (chế độ hoạt động); bản GPS hay GPS + di động (phiên bản) | Chế độ kém thuận lợi nhất, tức chế độ thường*; phiên bản nêu trong tên |
| Đồng hồ | Sạc nhanh (giá trị: thời gian sạc, thấp hơn là tốt hơn) | Bộ sạc hoặc cáp (phụ kiện); mốc phần trăm cần đạt (điều kiện đo) | Cáp đi kèm hộp |
| Đồng hồ | Kháng nước | Độ sâu hoặc chuẩn, hoạt động được phép (điều kiện đo) | Điều kiện hãng công bố |
| Đồng hồ | Độ sáng | Chế độ hiển thị (chế độ hoạt động) | Chế độ thông thường |

\* Điểm cần chốt ở [T10](#t10). "Kém thuận lợi nhất" nghĩa là tuyên bố không nêu chế độ phải đúng ở mọi chế độ người dùng có thể chọn. Vì vậy tuyên bố dùng con số của chế độ tốt nhất mà không nêu chế độ là Lệch điều kiện. Với độ sáng, các hãng gọi khác nhau ("tối đa", "cực đại", "đỉnh"), nên tệp cấu hình ghi cách gọi theo từng mẫu, và với độ sáng các từ này được hiểu là chế độ hiển thị chứ không phải kiểu giá trị (điểm 12).

<a id="t4-6"></a>

#### T4.6 Ví dụ (chỉ lấy từ mẫu dự kiến thuộc tập phát triển)

Các con số lấy từ đề cương hoặc từ lần xem trang chính hãng tiếng Việt ngày 09/10/2026. **Kiểm lại từng con số trên bản chụp ở Bước 5 và Bước 6.**

| # | Tuyên bố | Dòng | Nhãn | Lý do |
|---|---|---|---|---|
| 1 | iPhone 17 sạc nhanh lên đến 50% trong 20 phút với bộ sạc 40W trở lên | D3 | Đúng | Khớp cả giá trị và điều kiện bộ tiếp hợp 40W |
| 2 | iPhone 17 sạc 50% chỉ trong 20 phút | D4 | Lệch (`bo_dieu_kien`) | Hiểu là không mua thêm bộ sạc; 50% trong 20 phút chỉ đạt với bộ tiếp hợp 40W trở lên |
| 3 | Màn hình iPhone 17 sáng 3000 nit | D4 | Lệch (`bo_dieu_kien`) | Hiểu là chế độ thông thường (1000 nit); 3000 nit là độ sáng đỉnh ngoài trời |
| 4 | Màn hình iPhone 17 sáng tối đa 1000 nit | D3 | Đúng | Khớp độ sáng tối đa ở chế độ thông thường |
| 5 | Màn hình iPhone 17 đạt 4000 nit ngoài trời | D5 | Sai | Cùng điều kiện ngoài trời, tài liệu ghi 3000 nit; 4000 nit thuận lợi hơn mọi giá trị |
| 6 | Galaxy Buds3 Pro nghe nhạc 6 giờ khi bật chống ồn | D3 | Đúng | Khớp (ví dụ trong đề cương) |
| 7 | Galaxy Buds3 Pro nghe nhạc 7 giờ khi bật chống ồn | D4 | Lệch (`doi_dieu_kien`) | 7 giờ chỉ đạt khi tắt chống ồn (ví dụ trong đề cương) |
| 8 | Galaxy Buds3 Pro pin 7 giờ | D4 | Lệch (`bo_dieu_kien`) | Không nêu chế độ nên phải đúng cả khi bật chống ồn (6 giờ); 7 giờ chỉ đạt khi tắt chống ồn |
| 9 | Galaxy Buds3 Pro nghe nhạc đến 6 giờ | D3 | Đúng | Bằng giá trị ở chế độ kém thuận lợi nhất |
| 10 | Galaxy Buds3 Pro nghe nhạc 8 giờ | D5 | Sai | Thuận lợi hơn mọi giá trị công bố cho tai nghe (ví dụ trong đề cương) |
| 11 | Hộp sạc Galaxy Buds3 Pro cũng chống nước IP57 | D4 | Lệch (`doi_bo_phan`) | IP57 chỉ áp dụng cho tai nghe; hộp sạc không kháng nước |
| 12 | Galaxy Buds3 Pro luôn nghe đủ 6 giờ | D2 | Lệch (`doi_kieu_gia_tri`) | Tài liệu ghi "lên đến 6 giờ" |
| 13 | Apple Watch SE 3 dùng đến 32 giờ ở chế độ nguồn điện thấp | D3 | Đúng | Khớp (ví dụ trong đề cương) |
| 14 | Apple Watch SE 3 pin 32 giờ | D4 | Lệch (`bo_dieu_kien`) | Không nêu chế độ; 32 giờ chỉ đạt ở chế độ nguồn điện thấp, chế độ thường là 18 giờ |
| 15 | Apple Watch SE 3 luôn dùng đủ 18 giờ mỗi ngày | D2 | Lệch (`doi_kieu_gia_tri`) | Tài liệu ghi "lên đến 18 giờ" |
| 16 | Xiaomi 15T có độ sáng cực đại 3200 nit | D3 | Đúng | Cùng chế độ cực đại; phần 25% diện tích được đo ghi vào lý do |
| 17 | Màn hình Xiaomi 15T sáng 3200 nit | D4 | Lệch (`bo_dieu_kien`) | Không nói "cực đại" nên hiểu là chế độ thông thường; 3200 nit là độ sáng cực đại đo trên 25% diện tích |
| 18 | Galaxy Buds3 Pro nghe 5 giờ ở chế độ xuyên âm | D6 | Chưa đủ thông tin | Trang không công bố giá trị cho chế độ xuyên âm. Tệp cấu hình phải biết cụm "xuyên âm"; nếu không, hệ thống dừng ở D1a |

Ví dụ 8, 9 và 14 phụ thuộc cách hiểu "chế độ kém thuận lợi nhất". Nếu khảo sát ở Bước 10 cho kết quả khác thì sửa nhãn của các ví dụ này.

<a id="t4-7"></a>

#### T4.7 Biến thể cặp tối thiểu

| Loại | Cách tạo từ tuyên bố Đúng | Nhãn thường gặp |
|---|---|---|
| `bo_dieu_kien` | Xóa điều kiện khỏi tuyên bố (ví dụ bỏ "với bộ sạc 40W") | Lệch điều kiện nếu con số chỉ đạt ở điều kiện bị bỏ; Đúng nếu con số vẫn đạt theo cách hiểu thông thường |
| `doi_dieu_kien` | Giữ con số, đổi sang một điều kiện khác có trong tài liệu mà ở đó giá trị kém hơn ("7 giờ khi tắt chống ồn" → "7 giờ khi bật chống ồn") | Lệch điều kiện |
| `doi_bo_phan` | Giữ con số, gán cho bộ phận có giá trị kém hơn (IP57 của tai nghe → hộp sạc; tổng thời lượng kèm hộp sạc → chỉ tai nghe) | Lệch điều kiện |
| `doi_kieu_gia_tri` | Thêm từ khẳng định cho mức "lên đến" | Lệch điều kiện |
| `doi_gia_tri` | Thay bằng giá trị thuận lợi hơn, không có ở điều kiện nào | Sai |
| `doi_phien_ban` | Giữ con số, gán cho phiên bản có giá trị kém hơn (chỉ khi trang có nhiều phiên bản) | Lệch điều kiện |

Chiều đổi quan trọng: nếu đổi sang chỗ có giá trị tốt hơn, con số cũ trở thành kém thuận lợi hơn, vẫn khớp và ra Đúng. Nhãn của **từng** biến thể được kiểm tra lại bằng tay, không suy ra tự động từ loại biến đổi.

---

<a id="t5"></a>

### T5. Đặc tả phương pháp P

<a id="t5-1"></a>

#### T5.1 Bộ thông số bảy trường

Mỗi tuyên bố và mỗi thông số trong bằng chứng được biểu diễn bằng cùng một bộ bảy trường, đặt tên theo Thời gian biểu tháng 11 của đề cương. Sáu loại điều kiện nằm trong các trường như sau:

| # | Trường | Ví dụ | Loại điều kiện nằm trong trường |
|---|---|---|---|
| 1 | Sản phẩm | Galaxy Buds3 Pro | – |
| 2 | Phiên bản | Apple Watch SE 3 bản GPS | Phiên bản |
| 3 | Bộ phận | tai nghe, hộp sạc | Bộ phận |
| 4 | Thông số (thuộc tính) | thời lượng pin nghe nhạc | – |
| 5 | Giá trị | 7 | – |
| 6 | Đơn vị | giờ | – |
| 7 | Điều kiện áp dụng cùng kiểu giá trị | bật chống ồn; bộ sạc 40W; ngâm 1 m trong 30 phút; "lên đến" | Chế độ hoạt động, phụ kiện, điều kiện đo, kiểu giá trị |

```json
{
  "san_pham": "Galaxy Buds3 Pro", "phien_ban": null, "bo_phan": "tai_nghe",
  "thuoc_tinh": "thoi_luong_pin_nghe_nhac", "gia_tri": 7, "don_vi": "gio",
  "dieu_kien": {"che_do_chong_on": "bat"}, "kieu_gia_tri": "khong_neu",
  "trich": {"san_pham": "Galaxy Buds3 Pro", "gia_tri": "7 tiếng",
            "dieu_kien.che_do_chong_on": "ngay cả khi bật chống ồn"},
  "mac_dinh": ["bo_phan"]
}
```

Trường `mac_dinh` liệt kê các trường lấy theo cách hiểu thông thường, nên không có câu trích. Ở ví dụ này tuyên bố không nêu bộ phận, nên bộ phận được hiểu là tai nghe.

<a id="t5-2"></a>

#### T5.2 Truy hồi BM25

- Chỉ tìm trong `doan.jsonl` của mẫu sản phẩm người dùng chọn.
- Truy vấn là văn bản tuyên bố. Cách áp dụng BM25 tham khảo giai đoạn truy hồi đầu của Fathom [13].
- Cách tách từ (âm tiết hay từ) và k ∈ {3, 5, 8} được chọn trên tập phát triển ở Bước 33.
- Mọi hệ thống dùng **cùng** top-k đoạn cho cùng một tuyên bố.

<a id="t5-3"></a>

#### T5.3 Trích xuất có neo nguồn và kiểm tra đầy đủ

**(a) LLM trích:** nhận tuyên bố và top-k đoạn; trả JSON theo lược đồ ở T5.1 cho tuyên bố và cho từng thông số liên quan trong bằng chứng. Mỗi trường kèm `trich`, là câu gốc chép nguyên văn.

**(b) Python kiểm tra neo nguồn** (tất định, tức cùng đầu vào luôn ra cùng kết quả):

- câu trích là chuỗi con của văn bản nguồn, sau khi chuẩn hóa khoảng trắng và dấu câu;
- giá trị nằm trong câu trích của nó: con số xuất hiện; mã như IP57 xuất hiện; giá trị phủ định như "không kháng nước" xuất hiện;
- cách diễn đạt của điều kiện xuất hiện trong câu trích của điều kiện;
- **trường không đạt bị bỏ** (đặt `null`, ghi vào `bi_loai`), không đoán.

**(c) Python kiểm tra đầy đủ:** với mỗi điều kiện bắt buộc của thuộc tính, dò các cách diễn đạt trong tệp cấu hình (ví dụ "bật ANC", "bật chống ồn", "khử tiếng ồn chủ động") trong tuyên bố và trong đoạn nguồn. Tìm thấy mà trường đang trống thì điền vào và ghi vào `bo_sung`. Tuyên bố nêu một điều kiện mà tệp cấu hình không biết, hoặc vẫn không xác định được điều kiện, thì kết luận **Chưa đủ thông tin** (dòng D1a).

**(d) Ghi thống kê:** ghi số trường bị loại và số điều kiện được bổ sung của từng tuyên bố, làm số liệu cho Chương 4.

<a id="t5-4"></a>

#### T5.4 Chuẩn hóa

| Loại | Quy tắc |
|---|---|
| Đơn vị | giờ = tiếng = h; phút = min; nit = nits = cd/m²; W, mAh, Hz, x (zoom) |
| Số | "3.000" = 3000 (dấu chấm ngăn hàng nghìn); "1,5" = 1.5 |
| Chuẩn IP | Tách bụi và nước: IP57 → bụi 5, nước 7 |
| Kiểu giá trị | {lên đến, tối đa, up to} → `toi_da`; {điển hình, typical} → `dien_hinh`; {định mức, rated} → `dinh_muc`; {luôn, đảm bảo, ít nhất, mọi lúc} → `khang_dinh`; không có → `khong_neu` |
| Tên sản phẩm, phiên bản | Bảng bí danh trong tệp cấu hình |

<a id="t5-5"></a>

#### T5.5 Bộ quyết định A–D (mã giả)

Chú thích ở cuối mỗi dòng `return` (D1, D1a, D1b, D2–D6) là tên dòng ở bảng [T4.3](#t4-3).

```python
def quyet_dinh(tb, ung_vien, cau_hinh, doi_chieu=True):     # doi_chieu=False là bản P−ĐK
    # A. Tìm thông số cùng sản phẩm và thuộc tính
    cung_tt = [u for u in ung_vien if cung_san_pham(u, tb) and u.thuoc_tinh == tb.thuoc_tinh]
    if not cung_tt:
        return CHUA_DU, vet("khong_co_thong_so")                          # D1

    # B. Điều kiện của tuyên bố (nêu rõ, hoặc cách hiểu thông thường), so theo sáu loại
    if doi_chieu:
        dk = dieu_kien_tuyen_bo(tb, cung_tt, cau_hinh)   # cần cung_tt để hiểu "chế độ kém thuận lợi nhất"
        if dk is None:
            return CHUA_DU, vet("khong_xac_dinh_duoc_dieu_kien")          # D1a
        cung_dk = [u for u in cung_tt if khop_dieu_kien(dk, u, cau_hinh)]
        if co_gia_tri_khac_nhau(cung_dk):
            return CHUA_DU, vet("tai_lieu_mau_thuan")                     # D1b
    else:                                                # P−ĐK: coi mọi thông số là cùng điều kiện
        dk, cung_dk = None, cung_tt                      # nên không có D1a, D1b
    khac_dk = [u for u in cung_tt if u not in cung_dk]
    cung_bp = cung_bo_phan_va_phien_ban(dk, cung_tt)     # dùng cho vế "thuận lợi hơn mọi giá trị"

    # C. So giá trị theo đơn vị và hướng thuận lợi; D. Tổng hợp theo thứ tự
    if tb.kieu_gia_tri == "khang_dinh" and any(
            u.kieu_gia_tri == "toi_da" and not thuan_loi_hon(tb, u, cau_hinh) for u in cung_dk):
        return LECH, vet("doi_kieu_gia_tri")                              # D2
    for u in cung_dk:
        if khop_gia_tri(tb, u, cau_hinh):                                 # bằng, hoặc kém thuận lợi hơn
            return DUNG, vet("khop", u)                                   # D3
    for u in khac_dk:
        if bang(tb, u):
            return LECH, vet(loai_bien_doi(dk, u), u)                     # D4
    if cung_dk or thuan_loi_hon_moi_gia_tri(tb, cung_bp, cau_hinh):
        return SAI, vet("mau_thuan", cung_dk or cung_bp)                  # D5
    return CHUA_DU, vet("khong_co_gia_tri_o_dieu_kien_nay")               # D6
```

| Hàm | Làm gì |
|---|---|
| `dieu_kien_tuyen_bo` | Ghép điều kiện nêu rõ với cách hiểu thông thường trong tệp cấu hình. Với "chế độ kém thuận lợi nhất", chọn chế độ có giá trị kém nhất trong `cung_tt`. Trả `None` nếu tuyên bố nêu một điều kiện mà tệp cấu hình không biết |
| `khop_dieu_kien` | So từng loại trong sáu loại, với các điều kiện bắt buộc của thuộc tính. Luôn so kiểu giá trị khi tuyên bố ghi rõ (tối đa, điển hình, định mức); khi tuyên bố không ghi, lấy kiểu mặc định của thuộc tính |
| `cung_bo_phan_va_phien_ban` | Các thông số cùng bộ phận và phiên bản với tuyên bố; với P−ĐK là toàn bộ `cung_tt` |
| `bang` | Bằng nhau sau chuẩn hóa, trong ngưỡng sai số làm tròn chọn ở Bước 33 |
| `khop_gia_tri` | Bằng, hoặc kém thuận lợi hơn theo hướng thuận lợi của thuộc tính; mã IP theo cách chốt ở điểm 11 của [T10](#t10) |
| `loai_bien_doi` | So điều kiện của tuyên bố với điều kiện của thông số để biết loại lệch: bỏ điều kiện, đổi điều kiện, đổi bộ phận, đổi phiên bản, đổi kiểu giá trị |

<a id="t5-6"></a>

#### T5.6 Sinh lý do

Lý do được ghép từ dấu vết `vet` theo mẫu câu cố định, nên luôn khớp với nhãn.

| Dòng | Mẫu câu |
|---|---|
| D1 | "Tài liệu của {sản phẩm} không có thông số {thuộc tính}." |
| D1a | "Chưa xác định được điều kiện của tuyên bố: “{cụm điều kiện}”." |
| D1b | "Tài liệu ghi hai giá trị khác nhau cho {thuộc tính} ở {điều kiện}: “{trích 1}” và “{trích 2}”." |
| D2 | "Tài liệu ghi mức tối đa: “{trích}”; tuyên bố viết thành mức chắc chắn đạt." |
| D3 | "Khớp với tài liệu: “{trích}”." |
| D4 | "Giá trị {giá trị} {đơn vị} chỉ đạt khi {điều kiện trong tài liệu}; tuyên bố {nêu hoặc được hiểu là} {điều kiện của tuyên bố}. Nguồn: “{trích}”." |
| D5 | "Tài liệu ghi {giá trị trong tài liệu} {đơn vị} ở {điều kiện}; tuyên bố ghi {giá trị}." |
| D6 | "Tài liệu không công bố {thuộc tính} ở {điều kiện của tuyên bố}." |

<a id="t5-7"></a>

#### T5.7 Tệp cấu hình (ví dụ `data/cau_hinh/tai_nghe.yaml`)

```yaml
nhom: tai_nghe
thuoc_tinh:
  thoi_luong_pin_nghe_nhac:
    don_vi: gio
    huong_thuan_loi: cao_hon_tot_hon
    kieu_gia_tri_mac_dinh: toi_da           # khi tuyên bố không nêu kiểu giá trị
    dieu_kien_bat_buoc:                      # tên điều kiện: loại điều kiện (một trong sáu loại)
      che_do_chong_on: che_do_hoat_dong
      bo_phan: bo_phan
    hieu_thong_thuong:
      bo_phan: tai_nghe
      che_do_chong_on: kem_thuan_loi_nhat
  khang_nuoc:
    so_khop: ma_bang_nhau                    # đề xuất: IP57 phải bằng IP57 (điểm 11 ở T10)
    dieu_kien_bat_buoc:
      bo_phan: bo_phan
    hieu_thong_thuong:
      bo_phan: tai_nghe
cach_dien_dat:
  che_do_chong_on:
    bat: ["bật ANC", "bật chống ồn", "khử tiếng ồn chủ động"]
    tat: ["tắt ANC", "tắt chống ồn"]
    xuyen_am: ["chế độ xuyên âm", "xuyên âm"]   # biết cả chế độ hãng không công bố số liệu
  bo_phan:
    hop_sac: ["hộp sạc", "hộp sạc đi kèm"]
    kem_hop_sac: ["kèm hộp sạc", "tổng thời gian sử dụng"]
tu_khang_dinh: ["luôn", "đảm bảo", "ít nhất", "mọi lúc"]
```

Tệp cấu hình được viết từ trang của tập phát triển và hiểu biết chung về nhóm sản phẩm, và được đóng băng cùng lúc khóa cấu hình ở Bước 33.

<a id="t5-8"></a>

#### T5.8 Tách tuyên bố tự động và kiểm thử

- **Tách tự động** (Bước 29): LLM tách bài thành tuyên bố theo quy tắc ở T4.1 ([T12.5](#t12)); Python giữ tuyên bố có thuộc tính trong tệp cấu hình. Chỉ dùng cho CopyPro và cho lượt đầu–cuối; thực nghiệm chính dùng tuyên bố tách thủ công.
- **Kiểm thử** (Bước 27):
  - mỗi dòng D1–D6, kể cả D1a và D1b, có ít nhất 3 kiểm thử: khớp, không khớp, trường hợp biên;
  - mọi ví dụ trong hướng dẫn gán nhãn là kiểm thử hồi quy;
  - có kiểm thử cho neo nguồn và kiểm tra đầy đủ: câu trích không có trong nguồn, con số sai, điều kiện bịa, điều kiện bị bỏ sót;
  - có kiểm thử cho P−ĐK: "Galaxy Buds3 Pro nghe nhạc 7 giờ khi bật chống ồn" phải ra Đúng.

<a id="t5-9"></a>

#### T5.9 Hai bản bỏ thành phần

| Bản | Bỏ gì | Kỳ vọng |
|---|---|---|
| **P−ĐK** | Bỏ bước B: mọi thông số cùng sản phẩm và thuộc tính coi như cùng điều kiện, chỉ so giá trị; vì vậy cũng không có D1a, D1b. Tuyên bố khớp bất kỳ giá trị nào được công bố là Đúng | Không bao giờ ra Lệch điều kiện ở D4, nên FAR cao hơn P. Cho thấy vai trò của đối chiếu điều kiện |
| **P−NN** | Bỏ khâu (b) neo nguồn và khâu (c) kiểm tra đầy đủ ở T5.3, đúng như Bảng 2 của đề cương | Nhiều trường bịa hoặc thiếu điều kiện hơn. Vì bỏ cả hai khâu, H3 đo đóng góp chung của neo nguồn và kiểm tra đầy đủ |

---

<a id="t6"></a>

### T6. Thực nghiệm và đánh giá

<a id="t6-1"></a>

#### T6.1 Các phương pháp được so sánh (Bảng 2 của đề cương)

| Ký hiệu | Đầu vào | Ai gán nhãn | Số nhãn | Vai trò |
|---|---|---|---|---|
| B0 | Tuyên bố và top-k đoạn | LLM | 3 | Đại diện kiểm chứng ba nhãn phổ biến [2] |
| B1 | Bộ thông số đã trích của P và hướng dẫn gán nhãn | LLM | 4 | Tách riêng tác động của bộ quyết định |
| B2 | Tuyên bố, top-k đoạn, hướng dẫn có định nghĩa và ví dụ nhãn Lệch điều kiện | LLM | 4 | Khắc phục chỉ bằng câu lệnh, theo cách đặt nhãn của AVeriTeC [3] |
| B3 | Cặp tuyên bố và bằng chứng | Mô hình ba nhãn tiếng Việt đã huấn luyện của SemViQA [7] | 3 | Hệ thống kiểm chứng tiếng Việt sẵn có |
| P−ĐK | Như P | Quy tắc, bỏ đối chiếu điều kiện | 4 | Đo đóng góp của đối chiếu điều kiện |
| P−NN | Như P | Quy tắc, bỏ neo nguồn và kiểm tra đầy đủ | 4 | Đo đóng góp của neo nguồn |
| B4 ⭐ | Như B2 | LLM mạnh hơn, có chế độ suy luận | 4 | Mốc tham chiếu, không kiểm định giả thuyết |
| **P** | Tuyên bố và top-k đoạn | LLM trích xuất có neo nguồn; Python gán nhãn bằng A–D | 4 | Phương pháp đề xuất |

**Ánh xạ nhãn của B0 và B3:** Supported → Đúng, Refuted → Sai, NEI → Chưa đủ thông tin. Hai hệ thống này không bao giờ ra Lệch điều kiện, nên được so sánh chủ yếu bằng FAR và các nhãn chung; F1 Lệch của chúng bằng 0 vì không có nhãn này, và được ghi rõ trong bảng.

<a id="t6-2"></a>

#### T6.2 Quy tắc công bằng

1. Mọi hệ thống dùng **cùng tuyên bố và cùng top-k đoạn bằng chứng**.
2. Các hệ thống dùng LLM, trừ B4, dùng **cùng LLM và cùng cấu hình** (nhiệt độ 0, chung bộ nhớ đệm).
3. Câu lệnh của B0–B2 được tinh chỉnh trên tập phát triển với số lần thử bằng số lần thử dành cho câu lệnh trích xuất của P; số lần thử ghi vào nhật ký.
4. Không dùng ví dụ thuộc tập kiểm tra trong bất kỳ câu lệnh nào.
5. Nếu LLM kiểm chứng cùng họ với một LLM sinh quảng cáo, mọi bảng chính báo thêm kết quả chia theo LLM sinh.

<a id="t6-3"></a>

#### T6.3 Chia tập, khóa cấu hình, niêm phong nhãn

- **Chia theo mẫu sản phẩm** (chia ở Bước 4, ghi chính thức ở Bước 26): tập phát triển khoảng 4 mẫu, gồm 2 mẫu thử, đủ ba nhóm; tập kiểm tra gồm các mẫu còn lại, nhóm và hãng nào cũng có mẫu. Biến thể cặp tối thiểu đi theo tập của tuyên bố gốc.
- **Khóa trước khi chạy tập kiểm tra** (Bước 33): mô hình, câu lệnh, k, ngưỡng và tệp cấu hình được ghi vào `khoa_cau_hinh.md` cùng mã băm nhãn tập kiểm tra; commit và gắn tag `khoa-cau-hinh`.
- Sau tag này không sửa nhãn tập kiểm tra. Lỗi nhãn phát hiện sau đó được ghi vào phần mối đe dọa đến tính hợp lệ, không sửa âm thầm.

<a id="t6-4"></a>

#### T6.4 Chỉ số

| Chỉ số | Công thức | Ý nghĩa |
|---|---|---|
| **FAR** | (số tuyên bố có nhãn chuẩn khác Đúng mà bị gán Đúng) / (số tuyên bố có nhãn chuẩn khác Đúng) | Tỷ lệ chấp nhận nhầm. Chỉ số quan trọng nhất |
| Recall nhãn Đúng | (số tuyên bố Đúng được gán Đúng) / (số tuyên bố Đúng) | Không được thấp hơn đối chứng tốt nhất quá 5 điểm phần trăm |
| Precision, Recall, F1 từng nhãn | Định nghĩa thông thường | Đặc biệt F1 nhãn Lệch điều kiện |
| Macro-F1 | Trung bình F1 của bốn nhãn | Chất lượng chung |
| Recall@k | (số tuyên bố có đoạn bằng chứng chuẩn nằm trong top-k) / (số tuyên bố có bằng chứng) | Chất lượng truy hồi BM25 |
| Độ đúng trích xuất | Tỷ lệ trường trích đúng, gán tay trên 50 tuyên bố tập phát triển và 30 tuyên bố tập kiểm tra | Chất lượng khối trích xuất |
| Precision, Recall của tách tự động | So với tuyên bố tách thủ công | Chất lượng khối tách tuyên bố |
| Kết quả đầu–cuối | FAR và Macro-F1 khi tách tự động rồi kiểm chứng trên quảng cáo tập kiểm tra | Chất lượng khi dùng thật trên CopyPro |
| Thời gian, chi phí | Giây và số token mỗi tuyên bố, mỗi bài | Khả năng dùng trên CopyPro |

<a id="t6-5"></a>

#### T6.5 Thống kê

- **KTC 95% bằng bootstrap:** lấy mẫu lặp có hoàn lại 1000 lần **theo cụm quảng cáo**, vì các tuyên bố trong cùng một bài phụ thuộc nhau. Biến thể cặp tối thiểu được gom vào cụm của bài quảng cáo chứa tuyên bố gốc.
- **Kiểm định McNemar:** so hai hệ thống trên cùng một tập tuyên bố. Ở đây so quyết định "chấp nhận là Đúng hay không" của P với từng đối chứng, trên các tuyên bố có nhãn chuẩn khác Đúng. **Hiệu chỉnh Holm** để kết luận vẫn đúng khi so nhiều cặp cùng lúc.
- **Recall nhãn Đúng:** kiểm tra "không kém hơn" (cách kiểm do kế hoạch đề xuất). Đạt khi cận dưới của KTC của hiệu (P trừ đối chứng có Recall Đúng cao nhất) lớn hơn −5 điểm phần trăm.
- **Bảng theo hãng, nhóm sản phẩm, loại biến đổi** chỉ để mô tả, không kiểm định, vì mỗi ô ít mẫu.
- **Độ tin cậy nhãn:** kappa của Cohen giữa lần gán đầu và lần gán lại (20%, cách ít nhất 10 ngày, ẩn nhãn cũ); kappa giữa hai người trên khoảng 60 tuyên bố, tính trước khi thảo luận thống nhất.

<a id="t6-6"></a>

#### T6.6 Giả thuyết và tiêu chí kết luận (ghi trước khi chạy tập kiểm tra)

Đề cương phát biểu giả thuyết bằng phép so sánh giá trị. Kế hoạch báo **hai mức** cho mỗi giả thuyết: **đạt theo phát biểu của đề cương** (so giá trị trên tập kiểm tra) và **có ý nghĩa thống kê** (theo KTC và McNemar). Cách hiểu này là đề xuất, cần CBHD duyệt trước Mốc 3 (điểm 15 ở [T10](#t10)).

| Giả thuyết | Đạt theo phát biểu của đề cương | Có ý nghĩa thống kê khi |
|---|---|---|
| **H1** (CH1) | FAR(P) thấp hơn FAR của từng đối chứng B0–B3, và Recall Đúng của P không thấp hơn quá 5 điểm phần trăm so với đối chứng có Recall Đúng cao nhất | McNemar sau hiệu chỉnh Holm có p < 0,05 với từng đối chứng, và cận dưới KTC của hiệu Recall Đúng lớn hơn −5 điểm phần trăm |
| **H2** (CH2) | F1 Lệch của P cao hơn F1 Lệch của B1 và của B2 | KTC của hai hiệu F1 Lệch (P trừ B1, P trừ B2) đều nằm hoàn toàn trên 0 |
| **H3** (CH3) | FAR(P) thấp hơn FAR(P−NN) và F1 Lệch của P cao hơn của P−NN | McNemar có p < 0,05 cho FAR, và KTC của hiệu F1 Lệch nằm hoàn toàn trên 0 |

Giả thuyết được kiểm trên tuyên bố từ quảng cáo thông thường của tập kiểm tra (đề xuất); kết quả trên tập cặp tối thiểu được báo riêng. "Đối chứng tốt nhất" trong H1 được hiểu là đối chứng có Recall Đúng cao nhất. P−ĐK không thuộc giả thuyết nào; kết quả của nó dùng để giải thích vai trò của đối chiếu điều kiện. Mọi giả thuyết được báo cáo cả khi không đạt.

<a id="t6-7"></a>

#### T6.7 Cách báo kết quả (theo đề cương)

- Báo riêng cho **tuyên bố từ quảng cáo thông thường** và cho **tập cặp tối thiểu**.
- Chia theo từng loại biến đổi, từng nhóm sản phẩm, từng hãng, từng LLM sinh quảng cáo, từng chế độ sinh quảng cáo.
- Thống kê tỷ lệ tuyên bố Lệch điều kiện và Sai theo hai chế độ, để biết LLM bỏ, đổi điều kiện hoặc sai con số thường đến mức nào khi có và không có thông số trong yêu cầu.
- Kết quả đầu–cuối trên quảng cáo của tập kiểm tra.
- Phân tích lỗi theo nguồn gốc: tách tuyên bố, truy hồi, trích xuất hay quyết định.

<a id="t6-8"></a>

#### T6.8 Phần mở rộng ⭐

| Phần | Cách làm | Báo cáo |
|---|---|---|
| B4 | Như B2 nhưng dùng LLM mạnh hơn có chế độ suy luận; ghi tên và phiên bản mô hình | Mốc tham chiếu, không kiểm định |
| Máy tính bảng | 2 mẫu, khoảng 30 tuyên bố; **chỉ viết thêm tệp cấu hình**, giữ nguyên quy tắc A–D đã khóa | So FAR và F1 với ba nhóm chính |

<a id="t6-9"></a>

#### T6.9 Bảng và hình cho Chương 4

1. Thống kê dữ liệu: số mẫu, số bài quảng cáo, số tuyên bố theo nhóm, nhãn, LLM, chế độ; số biến thể theo loại.
2. Độ tin cậy nhãn: hai hệ số kappa; kết quả khảo sát cách hiểu.
3. **Bảng kết quả chính:** P, B0–B3, P−ĐK, P−NN × (FAR; Precision, Recall và F1 từng nhãn; Macro-F1), kèm KTC và kết quả McNemar.
4. Phân tích thành phần: P, P−ĐK, P−NN.
5. Kết quả theo loại biến đổi trên tập cặp tối thiểu.
6. Kết quả theo nhóm sản phẩm, hãng, LLM sinh, chế độ sinh.
7. Ma trận nhầm lẫn của P và B2.
8. Recall@k; độ đúng trích xuất; Precision và Recall của tách tự động.
9. Kết quả đầu–cuối.
10. Thời gian và chi phí.
11. Tỷ lệ Lệch điều kiện và Sai theo hai chế độ sinh.
12. Phân loại lỗi kèm 3–5 trường hợp điển hình.
13. ⭐ Kết quả B4 và máy tính bảng, nếu làm.

---

<a id="t7"></a>

### T7. Tích hợp vào CopyPro

CopyPro là repo `23521228-BuiLeHuyPhuoc/NT114.Q21-Web-Copy-Writing` (Next.js, Express, MongoDB). Các đường dẫn tệp dưới đây khớp mã nguồn ở commit `09a35a5`.

<a id="t7-1"></a>

#### T7.1 Kiến trúc

```mermaid
flowchart LR
    UI["Trình duyệt<br/>Next.js"] -->|"1. Bấm kiểm chứng"| BE["Backend CopyPro<br/>Express"]
    BE -->|"2. Gọi API"| SV["Dịch vụ kiểm chứng<br/>FastAPI, Python"]
    SV -->|"3. Kết quả"| BE
    BE -->|"4. Lưu"| DB[("MongoDB")]
    BE -->|"5. Hiển thị"| UI
```

1. Người dùng chọn mẫu sản phẩm và bấm "Kiểm chứng thông số"; trình duyệt gửi `POST /api/contents/:id/verify-specs`.
2. `specVerificationService.js` của backend gọi dịch vụ Python ở địa chỉ `SPEC_VERIFIER_URL` (`POST /kiem-chung`).
3. Dịch vụ chạy tách tuyên bố → BM25 → trích xuất có neo nguồn → chuẩn hóa → A–D → lý do, rồi trả nhãn, đoạn nguồn và lý do của từng tuyên bố.
4. Backend lưu kết quả vào `Content.specVerification`.
5. Giao diện hiển thị bảng kết quả; trang chi tiết nội dung đọc lại kết quả đã lưu.

<a id="t7-2"></a>

#### T7.2 API của dịch vụ kiểm chứng

| Phương thức | Đường dẫn | Vào | Ra |
|---|---|---|---|
| GET | `/mau-san-pham` | – | Danh sách mẫu có trong kho tài liệu |
| POST | `/kiem-chung` | `{"van_ban": "…", "ma_mau": "tn-samsung-buds3pro"}` | `{"phien_ban_he_thong": "…", "ket_qua": [{"tuyen_bo", "nhan", "doan_nguon", "trich", "ly_do"}], "thoi_gian_ms": …}` |

<a id="t7-3"></a>

#### T7.3 Thay đổi trong repo CopyPro (nhánh `kiem-chung-thong-so`)

| Tệp | Thay đổi | Bước |
|---|---|---|
| `backend/src/config/generatorModels.js`, `backend/src/services/aiService.js` | Thêm hai LLM sinh quảng cáo ([T3.3](#t3-3)) | [11](#b11) |
| `backend/src/models/Content.js` | Thêm `specVerification`: `productId`, `results[]`, `verifiedAt`, `verifierVersion` | [40](#b40) |
| `backend/src/routes/user/contentRoutes.js` | Thêm `router.post('/:id/verify-specs', …)` | [40](#b40) |
| `backend/src/controllers/user/contentController.js` | Thêm `verifySpecs` | [40](#b40) |
| `backend/src/services/specVerificationService.js` (mới) | Gọi dịch vụ Python; xử lý quá thời gian; lưu kết quả | [40](#b40) |
| `backend/src/validations/contentValidation.js` | Lược đồ kiểm tra đầu vào cho `verify-specs` | [40](#b40) |
| `frontend/src/services/contentService.ts`, `frontend/src/hooks/queries/useContents.ts` | Hàm và hook gọi API mới | [40](#b40) |
| `frontend/src/app/generate/Generator.tsx` | Nút "Kiểm chứng thông số" và ô chọn mẫu sản phẩm, cạnh điểm chất lượng và kết quả kiểm tra đạo văn | [40](#b40) |
| `frontend/src/app/contents/[id]/ContentDetail.tsx` | Hiển thị kết quả đã lưu | [40](#b40) |
| `SpecVerificationPanel.tsx` (mới) | Bảng kết quả kiểm chứng | [40](#b40) |

<a id="t7-4"></a>

#### T7.4 Giao diện

- Mỗi tuyên bố tô màu theo nhãn: **Đúng** xanh lá, **Sai** đỏ, **Lệch điều kiện** cam, **Chưa đủ thông tin** xám; luôn có chữ tên nhãn, không chỉ dựa vào màu.
- Mỗi tuyên bố có nút xem đoạn nguồn chính hãng và lý do.
- Ô chọn mẫu sản phẩm: người dùng chọn mẫu; hệ thống không tự nhận diện sản phẩm, đúng phạm vi đề cương.
- Kết quả được lưu cùng nội dung đã tạo và xem lại được ở trang chi tiết nội dung.

<a id="t7-5"></a>

#### T7.5 Kiểm tra (Bước 41)

- Chạy trên khoảng 10 quảng cáo thuộc tập kiểm tra; kết quả trên giao diện trùng kết quả gọi dịch vụ trực tiếp.
- Đo thời gian kiểm chứng một bài; ghi trung vị và p90.
- Video 2–3 phút: tạo quảng cáo → kiểm chứng → sửa tuyên bố lệch → kiểm chứng lại.

---

<a id="t8"></a>

### T8. Viết khóa luận

<a id="t8-1"></a>

#### T8.1 Dàn ý (theo mẫu của Khoa, khoảng 60–80 trang)

| Chương | Nội dung chính | Ứng với | Số trang | Viết ở bước |
|---|---|---|---|---|
| 1. Tổng quan | Bối cảnh, CopyPro, vấn đề, câu hỏi nghiên cứu, mục tiêu MT1–MT4, phạm vi, đối tượng, tính mới, đóng góp, bố cục | Mục 1–4 của đề cương | 8–10 | [17](#b17) |
| 2. Cơ sở lý thuyết và nghiên cứu liên quan | Kiểm chứng tự động, BM25, tuyên bố số liệu, ảo giác của LLM, kiểm chứng tiếng Việt, kiểm chứng quảng cáo; bảng hạn chế → cách đề tài xử lý | Bảng 1 của đề cương | 12–15 | [17](#b17) |
| 3. Phương pháp đề xuất | Phát biểu bài toán, nhãn, bộ thông số, tách tuyên bố, trích xuất có neo nguồn, chuẩn hóa, A–D, tệp cấu hình, sinh lý do, ví dụ xuyên suốt | ND2, MT2 | 12–15 | [35](#b35) |
| 4. Dữ liệu và thực nghiệm | Xây dựng dữ liệu, hướng dẫn nhãn, độ tin cậy nhãn, thiết lập, đối chứng, kết quả, phân tích thành phần, phân tích lỗi, thảo luận, mối đe dọa đến tính hợp lệ | ND1, ND3, MT1, MT3 | 15–20 | [39](#b39), [42](#b42) |
| 5. Tích hợp vào CopyPro | Kiến trúc, API, giao diện, thời gian, kết quả đầu–cuối | ND4, MT4 | 6–8 | [42](#b42) |
| 6. Kết luận và hướng phát triển | Kết quả theo MT1–MT4, giới hạn, hướng phát triển | – | 2–3 | [42](#b42) |
| Phụ lục | Hướng dẫn gán nhãn, câu lệnh, tệp cấu hình, danh sách kiểm thử | – | – | [42](#b42), [45](#b45) |

**Mối đe dọa đến tính hợp lệ cần viết ở Chương 4:** người gán nhãn chính là tác giả; quảng cáo do LLM sinh chứ không phải quảng cáo thật; B3 được huấn luyện ngoài miền; LLM kiểm chứng có thể cùng họ với LLM sinh; số mẫu của tập kiểm tra nhỏ; các điều kiện ngoài sáu loại (nếu gặp).

<a id="t8-2"></a>

#### T8.2 Quy tắc viết

- Mỗi đoạn mở đầu bằng ý chính.
- Mọi con số có nguồn: bảng kết quả của mình, hoặc tài liệu kèm số trang.
- Thuật ngữ thống nhất trong cả khóa luận: tuyên bố, điều kiện ràng buộc, cách hiểu thông thường, Lệch điều kiện, neo nguồn, bộ quyết định, tập phát triển, tập kiểm tra.
- Dùng thuật ngữ tiếng Việt, ghi tiếng Anh trong ngoặc ở lần xuất hiện đầu.
- Mọi ký hiệu (q, s, D(s), c, y(c), e(c), r(c), k, FAR) được định nghĩa ở lần xuất hiện đầu.
- Hình tự vẽ, mũi tên thẳng; bảng và hình có số, có tiêu đề và được nhắc tới trong bài; chú thích hình khớp với hình.
- Không dùng "...", không viết hoa tùy tiện; tên chế độ của hãng viết thường (ví dụ "chế độ nguồn điện thấp").

---

<a id="t9"></a>

### T9. Rủi ro và phương án dự phòng

<a id="t9-1"></a>

#### T9.1 Bảng rủi ro

Năm rủi ro đầu lấy từ đề cương. Cột "Dấu hiệu sớm" cho biết khi nào phải bật phương án.

| Rủi ro | Dấu hiệu sớm | Phương án |
|---|---|---|
| Quảng cáo do LLM tạo chứa ít tuyên bố có điều kiện ràng buộc | Bước 16: trung bình dưới 2 tuyên bố có điều kiện mỗi bài | Tăng số bài sinh cho mỗi mẫu; đưa thông số nổi bật (pin, sạc, kháng nước) vào ô từ khóa; tập cặp tối thiểu bảo đảm đủ mẫu cho từng loại lệch |
| Trang thông số thiếu chú thích điều kiện, dùng mã động hoặc ghi không nhất quán | Bước 5–6: `page.txt` thiếu chú thích | Ưu tiên hãng có chú thích đầy đủ; chụp lại trang sau khi hiển thị xong; thông số không có hoặc mâu thuẫn gán Chưa đủ thông tin và thống kê riêng |
| Mô hình bị nhà cung cấp ngừng phục vụ hoặc giới hạn lượt gọi | Lỗi 429, hết hạn mức; thông báo ngừng mô hình | Lưu tên, phiên bản, đầu ra của mọi lần gọi; dùng bộ nhớ đệm; nếu mô hình kiểm chứng ngừng trước khi khóa cấu hình thì chuyển sang mô hình kế nhiệm do nhà cung cấp khuyến nghị và chạy lại trên tập phát triển |
| Gán nhãn chậm hoặc không có người gán thứ hai | Bước 13: hơn 3 phút mỗi tuyên bố; đến Bước 26 (16/11) chưa có người thứ hai | Giảm số tuyên bố từ quảng cáo thông thường nhưng giữ tập cặp tối thiểu và đủ hãng trong tập kiểm tra; không có người thứ hai thì chỉ báo độ nhất quán khi gán lại và ghi rõ giới hạn này |
| Thiếu thời gian | Chậm hơn ngày ghi ở bước đang làm quá 2 ngày | Áp dụng thứ tự rút gọn ở T9.2 |
| B3 (SemViQA) không cài được | Lỗi cài gói, thiếu RAM | Chạy trên Google Colab; vẫn lỗi thì ghi rõ và báo CBHD, vì B3 thuộc phần lõi trong đề cương |
| Trễ tích hợp CopyPro | Bước 40 trễ quá 2 ngày | Giao diện tối giản (một bảng danh sách) nhưng vẫn lưu kết quả vào `Content`, giữ cam kết của Nội dung 4 |
| P không đạt giả thuyết | Bước 39 | Báo trung thực; phân tích lỗi chỉ ra khối gây lỗi; đề xuất cải tiến ở Chương 6 |

<a id="t9-2"></a>

#### T9.2 Thứ tự rút gọn khi chậm tiến độ

Theo rủi ro "Thiếu thời gian" trong đề cương:

1. Bỏ phần mở rộng trước: B4 và phần thử trên máy tính bảng.
2. Nếu vẫn chậm: giảm số mẫu mỗi nhóm, nhưng giữ đủ ba nhóm trong tập kiểm tra.

Riêng khi chậm vì gán nhãn (rủi ro "Gán nhãn chậm" trong đề cương): giảm số tuyên bố từ quảng cáo thông thường, nhưng giữ tập cặp tối thiểu và đủ các hãng trong tập kiểm tra.

**Lõi bắt buộc, không bao giờ bỏ:** bộ dữ liệu; P với đủ A–D, neo nguồn và kiểm tra đầy đủ; B0–B3; P−ĐK, P−NN; khóa cấu hình trước khi chạy tập kiểm tra; tính năng trên CopyPro có lưu kết quả.

---

<a id="t10"></a>

### T10. Các điểm cần chốt khi làm thử

Đề cương nêu nguyên tắc nhưng để lại một số chi tiết cài đặt. Mỗi điểm dưới đây có phương án đề xuất và bước chốt. Chốt xong thì ghi vào hướng dẫn gán nhãn, tệp cấu hình và nhật ký.

| # | Điểm cần chốt | Phương án đề xuất | Chốt ở |
|---|---|---|---|
| 1 | Cách hiểu thông thường khi tuyên bố không nêu chế độ người dùng tự chọn (chống ồn, tiết kiệm pin, hoạt động sử dụng) | Chế độ kém thuận lợi nhất trong các chế độ hãng công bố | [Bước 10](#b10), bằng khảo sát |
| 2 | Kiểu giá trị mặc định của từng thuộc tính khi tuyên bố không nêu | Dung lượng pin: điển hình; thời lượng pin, độ sáng: tối đa như hãng công bố | [Bước 8](#b08) |
| 3 | Zoom quang học hay kỹ thuật số thuộc loại điều kiện nào (đề cương coi là điều kiện bắt buộc nhưng chưa xếp loại) | Chế độ hoạt động | [Bước 8](#b08) |
| 4 | Danh sách từ khẳng định chắc chắn cho dòng D2 | "luôn", "đảm bảo", "ít nhất", "mọi lúc"; bổ sung từ bộ thử | [Bước 8](#b08), [16](#b16) |
| 5 | Dòng D2 có áp dụng khi tuyên bố khẳng định một mức thấp hơn mức "lên đến" không | Có: khẳng định chắc chắn một mức không cao hơn mức "lên đến" ở cùng điều kiện là Lệch điều kiện | [Bước 27](#b27) |
| 6 | Vị trí kiểm tra "tài liệu ghi mâu thuẫn" (có trong định nghĩa nhãn Chưa đủ thông tin, không có trong chuỗi D) | Ngay sau D1a, trước D2 (dòng D1b) | [Bước 27](#b27) |
| 7 | Số phiên bản mỗi lần gọi khi sinh quảng cáo (CopyPro mặc định 3) | 1 phiên bản mỗi lần gọi, để mỗi bài là một lần sinh độc lập; nếu giữ 3 thì gom cụm bootstrap theo lần gọi | [Bước 11](#b11) |
| 8 | Ngưỡng sai số làm tròn khi so giá trị | 1%, chọn lại trên tập phát triển | [Bước 33](#b33) |
| 9 | LLM dùng cho P và B0–B2; LLM mạnh hơn cho B4 | Chọn trên tập phát triển trong số các LLM đã thử ở Bước 2 | [Bước 33](#b33) |
| 10 | Điều kiện gặp trong dữ liệu mà không xếp được vào sáu loại | Ghi vào `ghi_chu` khi gán nhãn; thống kê và báo trong phần giới hạn | [Bước 13](#b13), [20](#b20), [24](#b24) |
| 11 | So khớp chuẩn IP: đề cương coi giá trị kém thuận lợi hơn là khớp, nhưng các mức chống nước không xếp thành một thang | Mã IP phải bằng đúng, vì theo IEC 60529 mức 7–8 không mặc nhiên bao gồm mức 5–6 | [Bước 8](#b08) |
| 12 | Cách gọi độ sáng khác nhau giữa các hãng ("tối đa", "cực đại", "đỉnh") | Khai báo cách gọi theo từng mẫu trong tệp cấu hình; với độ sáng, các từ này là chế độ hiển thị, không phải kiểu giá trị | [Bước 8](#b08) |
| 13 | Ô từ khóa khi sinh quảng cáo | Để trống để chế độ `ten` đúng là "chỉ nhập tên sản phẩm". Nếu Bước 16 thấy quá ít tuyên bố: điền tên các nhóm thông số, không kèm con số, cho mọi bài và sinh lại bộ thử | [Bước 11](#b11), [16](#b16) |
| 14 | Khi không xác định được điều kiện: kết luận ngay (theo câu ở Nội dung 2) hay xét tiếp các dòng sau | Kết luận ngay là Chưa đủ thông tin (dòng D1a) | [Bước 27](#b27) |
| 15 | Tiêu chí kết luận giả thuyết: hai mức (theo phát biểu của đề cương, và có ý nghĩa thống kê), cách hiểu "đối chứng tốt nhất", tập dùng để kiểm | Như [T6.6](#t6-6); xin CBHD duyệt | [Bước 33](#b33), trước Mốc 3 |

---

<a id="t11"></a>

### T11. Câu hỏi phản biện dự kiến

| # | Câu hỏi | Ý chính để trả lời |
|---|---|---|
| 1 | Đề tài khác gì kiểm chứng thông tin thông thường? | Các phương pháp hiện có chủ yếu xét mức khớp nội dung, để LLM tự phán đoán [3] hoặc tự đoán phần bị bỏ [4]. Em đối chiếu tường minh điều kiện và kết luận Lệch bằng quy tắc. Bằng chứng: FAR và F1 Lệch so với B0–B3; ví dụ Galaxy Buds3 Pro |
| 2 | Điểm mới có phải chỉ là thêm nhãn thứ tư? | Không. Nhãn gây hiểu nhầm đã có ở AVeriTeC [3]. Điểm mới là cách kết luận nhãn đó bằng phép đối chiếu điều kiện. So P với B1 (cùng bộ thông số, LLM gán nhãn) tách riêng phần mới; so P với B2 (cùng bốn nhãn, LLM đọc bằng chứng rồi gán) cho thấy chỉ sửa câu lệnh là chưa đủ |
| 3 | LLM tách điều kiện rồi Python kiểm tra thì có gì mới? | Bước đó chỉ chuẩn bị đầu vào; B1 nhận cùng bộ thông số đã trích. Phần mới là bước kết luận, đo bằng cách so P với B1 |
| 4 | Vì sao dùng quy tắc mà không huấn luyện mô hình? | Dữ liệu nhỏ; quy tắc giải thích và kiểm thử được; lý do luôn khớp nhãn. LLM vẫn được dùng ở phần nó làm tốt là tách và trích xuất, có neo nguồn |
| 5 | Vì sao chỉ sáu loại điều kiện? Gặp điều kiện khác thì sao? | Sáu loại bao các điều kiện hãng công bố cho sáu nhóm thông số trong phạm vi. Điều kiện ngoài sáu loại được ghi nhận và thống kê. Lấy điều kiện thẳng từ tài liệu, không cần danh mục, là hướng phát triển; nhưng khi đó phải để LLM ghép điều kiện giữa quảng cáo và tài liệu, khó giữ FAR thấp |
| 6 | Quy tắc có cứng nhắc, khó mở rộng không? | Phần phụ thuộc nhóm sản phẩm nằm trong tệp cấu hình; thêm nhóm là thêm tệp. Phần mở rộng thử đúng điều này trên máy tính bảng với quy tắc A–D đã khóa |
| 7 | Tự gán nhãn rồi tự đánh giá có thiên lệch không? | Hướng dẫn viết trước; B1, B2 nhận cùng hướng dẫn; khóa cấu hình và niêm phong nhãn trước tập kiểm tra; kappa trong một người và giữa hai người; khảo sát cách hiểu |
| 8 | "Cách hiểu thông thường" có chủ quan không? | Ghi trong tệp cấu hình trước khi gán nhãn; có khảo sát 5–10 người đọc; kết quả khảo sát được báo cáo |
| 9 | Quảng cáo do LLM sinh có đại diện cho quảng cáo thật không? | Đúng ngữ cảnh sử dụng của CopyPro; đã nêu trong phạm vi và giới hạn; quảng cáo thật là hướng phát triển |
| 10 | Vì sao chỉ 12 mẫu và 3 nhóm? | Tiêu chí chọn nhóm trong đề cương; khối lượng gán nhãn của một người; tập cặp tối thiểu bù cho số mẫu |
| 11 | LLM trích xuất sai thì sao? | Neo nguồn loại trường bịa; kiểm tra đầy đủ bắt điều kiện bị bỏ sót; P−NN đo tác dụng; có độ đúng trích xuất trên cả hai tập |
| 12 | B3 không có nhãn Lệch, so sánh có công bằng không? | So bằng FAR; giả thuyết về F1 Lệch chỉ so với B1, B2. B3 là đại diện hệ thống tiếng Việt sẵn có, đã nêu là huấn luyện ngoài miền |
| 13 | Nếu P không tốt hơn đối chứng? | Báo trung thực; phân tích lỗi chỉ ra khối gây lỗi; vẫn có đóng góp dữ liệu và tính năng |
| 14 | Vì sao BM25 mà không dùng truy hồi dày đặc? | Kho tài liệu mỗi mẫu nhỏ; đã đo Recall@k; truy hồi không phải trọng tâm |
| 15 | Tài liệu chính hãng sai thì sao? | Gắn cờ mâu thuẫn, gán Chưa đủ thông tin, thống kê riêng; không kết luận pháp lý |
| 16 | Có vi phạm bản quyền khi dùng trang thông số không? | Chỉ dùng để nghiên cứu; chia sẻ trích đoạn ngắn kèm đường dẫn |
| 17 | Vì sao tiếng Việt? | CopyPro phục vụ người Việt; tài nguyên kiểm chứng tiếng Việt còn ít; Luật Quảng cáo sửa đổi năm 2025 yêu cầu người có ảnh hưởng kiểm tra tài liệu sản phẩm |

---

<a id="t12"></a>

### T12. Khung câu lệnh

Đây là điểm bắt đầu. Bản cuối được chốt ở Bước 33 và lưu kèm mã băm.

**T12.1 B0 (ba nhãn).** "Bạn là người kiểm chứng thông tin. Chỉ dựa vào các đoạn tài liệu chính hãng dưới đây, cho biết tuyên bố được tài liệu ủng hộ (Supported), bị bác bỏ (Refuted) hay chưa đủ thông tin (NEI). Trả về JSON {"nhan": …, "doan": […], "ly_do": …}. Tuyên bố: {tuyen_bo}. Tài liệu: {doan_1..k}."

**T12.2 B1 (bốn nhãn, đầu vào có cấu trúc).** "Cho bộ thông số của tuyên bố và các bộ thông số trích từ tài liệu (JSON). Gán một nhãn trong: Đúng, Sai, Lệch điều kiện, Chưa đủ thông tin, theo hướng dẫn sau: {T4.2–T4.5 và tóm tắt tệp cấu hình}. Trả về JSON {"nhan": …, "ly_do": …}."

**T12.3 B2 (bốn nhãn, hướng dẫn và ví dụ).** Gồm hướng dẫn ở T4.2–T4.5, bốn ví dụ từ tập phát triển (mỗi nhãn một ví dụ, có ví dụ Lệch điều kiện), tuyên bố và top-k đoạn. Trả về JSON như T12.2.

**T12.4 Trích xuất của P.** "Trích bộ thông số theo lược đồ JSON cho tuyên bố và cho từng thông số liên quan trong tài liệu. Với MỖI trường, ghi kèm 'trich' là đoạn chép NGUYÊN VĂN từ văn bản tương ứng. Không suy đoán; trường không có trong văn bản thì để null." Kèm lược đồ ở T5.1 và hai ví dụ.

**T12.5 Tách tuyên bố.** "Tách đoạn quảng cáo thành các tuyên bố, mỗi tuyên bố một thuộc tính và một giá trị; giữ tên sản phẩm, phiên bản, bộ phận và điều kiện từ câu xung quanh. Trả về danh sách JSON {"tuyen_bo", "cau_goc", "thuoc_tinh_du_kien"}." Sau đó Python chỉ giữ tuyên bố có thuộc tính trong tệp cấu hình.

<a id="t13"></a>

### T13. Danh sách kiểm tra trước khi nộp

- [ ] Tên đề tài tiếng Việt và tiếng Anh trong khóa luận, đề cương và hệ thống đăng ký trùng từng ký tự.
- [ ] Mọi tài liệu trong danh mục được trích dẫn ít nhất một lần; mọi trích dẫn có trong danh mục; số thứ tự theo lần xuất hiện đầu; định dạng IEEE thống nhất.
- [ ] Mỗi câu nói về bài khác khớp với ghi chú có số trang.
- [ ] Mục tiêu MT1–MT4 tương ứng với Nội dung 1–4 và với các chương.
- [ ] Bảng và hình có số, có tiêu đề, được nhắc tới trong bài; hình tự vẽ, mũi tên thẳng; chú thích hình khớp với màu và nội dung của hình.
- [ ] Không còn "...", chữ đỏ, ghi chú nháp; định dạng gạch đầu dòng thống nhất.
- [ ] Số liệu trong Chương 4 khớp tệp kết quả (chạy `scripts/chay_lai.sh` rồi so).
- [ ] Tag `khoa-cau-hinh` có ngày trước lần chạy tập kiểm tra.
- [ ] Đã kiểm tra trùng lặp văn bản theo quy định của trường.
- [ ] Repo có README và thẻ dữ liệu; không có khóa API.
- [ ] Bản PDF khóa luận và video demo được lưu ở hai nơi.

<a id="t14"></a>

### T14. Đối chiếu kế hoạch với đề cương

Các mục dưới cho thấy mọi việc trong "Thời gian biểu", mọi "Kết quả mong đợi" và phần "Phân công công việc" của đề cương đều có bước tương ứng.

**T14.1 Thời gian biểu**

| Tháng | Việc trong đề cương | Bước |
|---|---|---|
| 09 | Khảo sát các nghiên cứu về kiểm chứng thông tin, truy hồi bằng chứng, kiểm chứng tuyên bố chứa số liệu và suy luận có điều kiện | [3](#b03) |
| 09 | Xây dựng tiêu chí chọn nguồn, cấu trúc lưu dữ liệu và hướng dẫn gán nhãn | [2](#b02) (cấu trúc thư mục), [4](#b04) (tiêu chí nguồn), [9](#b09) (hướng dẫn) |
| 09 | Soạn ít nhất 20 ví dụ gán nhãn minh họa; giữ ngữ cảnh khi tách thông tin quảng cáo | [9](#b09) |
| 09 | Kiểm tra tài nguyên máy, thử các LLM mã nguồn mở | [2](#b02) |
| 10 | Khảo sát bổ sung: ảo giác của LLM, tuyên bố nửa sự thật, kiểm chứng kết hợp ký hiệu, kiểm chứng tiếng Việt | [3](#b03), [17](#b17) |
| 10 | Chọn khoảng 12 mẫu của ít nhất ba hãng; thu thập trang thông số, bản chụp, mã băm (trước hết 2 mẫu thử); chia đoạn giữ điều kiện | [4](#b04)–[7](#b07) |
| 10 | Viết tệp cấu hình điều kiện bắt buộc và hướng dẫn gán nhãn bốn lớp; bổ sung ví dụ điện thoại, đồng hồ; khảo sát 5–10 người đọc | [8](#b08)–[10](#b10) |
| 10 | Bộ dữ liệu thử ban đầu khoảng 60 tuyên bố cho 2 mẫu thử, kèm tài liệu và đường dẫn nguồn | [11](#b11), [12](#b12) |
| 10 | Gán nhãn thủ công, lưu lý do; đo thời gian gán để chốt quy mô | [13](#b13), [16](#b16) |
| 10 | Xây dựng mô-đun truy hồi BM25, chọn top-k | [14](#b14) |
| 10 | Xây dựng B0 | [15](#b15) |
| 10 | Phân tích lỗi trên bộ thử để điều chỉnh hướng dẫn nhãn và cấu trúc dữ liệu | [16](#b16) |
| 10 | Mốc kiểm tra 12/10 và 31/10 | [1](#b01), [16](#b16) |
| 11 | Hoàn thiện bộ dữ liệu chính: sinh quảng cáo cho các mẫu còn lại, tạo tập cặp tối thiểu, gán lại 20%, người thứ hai gán khoảng 60 tuyên bố | [18](#b18)–[20](#b20), [23](#b23)–[26](#b26), [32](#b32) |
| 11 | Chia dữ liệu theo mẫu thành tập phát triển và tập kiểm tra cuối | [4](#b04), [26](#b26) |
| 11 | LLM trích xuất có neo nguồn bảy trường; tách tuyên bố tự động | [22](#b22), [29](#b29) |
| 11 | Chuẩn hóa tên sản phẩm, phiên bản, giá trị và đơn vị | [21](#b21) |
| 11 | Bộ quyết định bốn nhãn (A–D), sinh lý do, kiểm thử từng quy tắc | [27](#b27) |
| 11 | Hoàn thiện P | [28](#b28) |
| 11 | Xây dựng B1, B2, B3 | [30](#b30) |
| 11 | Xây dựng P−ĐK và P−NN | [31](#b31) |
| 11 | Chọn mô hình, k, ngưỡng trên tập phát triển rồi giữ cố định | [33](#b33) |
| 11 | Bắt đầu tích hợp vào CopyPro | [34](#b34) |
| 11 | Mốc kiểm tra 27/11 | [33](#b33) |
| 12 | Chạy P, B0–B3, P−ĐK, P−NN trên tập kiểm tra cuối | [36](#b36) |
| 12 | Tính FAR, Precision, Recall, F1, Macro-F1; F1 nhãn Lệch; bootstrap; McNemar | [37](#b37) |
| 12 | Recall@k của BM25 | [14](#b14), [37](#b37) |
| 12 | Phân tích lỗi theo nguồn gốc truy hồi, trích xuất, quyết định | [38](#b38) |
| 12 | Kiểm tra P có giảm chấp nhận nhầm mà không bỏ sót quá nhiều | [39](#b39) |
| 12 | Tích hợp P vào CopyPro | [40](#b40) |
| 12 | Nếu đúng tiến độ: B4 và thử trên máy tính bảng | [43](#b43) |
| 12 | Hoàn thiện luận văn, biểu đồ, bảng kết quả, hướng dẫn cài đặt và chạy lại | [42](#b42), [44](#b44), [45](#b45) |
| 12 | Mốc kiểm tra 08/12, 13/12, 18/12 | [39](#b39), [41](#b41), [42](#b42) |
| 12 | Kiểm tra toàn bộ mã nguồn, dữ liệu trước 31/12 | [46](#b46) |

**T14.2 Kết quả mong đợi**

| Kết quả mong đợi trong đề cương | Sản phẩm cụ thể | Bước |
|---|---|---|
| Bộ dữ liệu khoảng 250–300 tuyên bố và 100–120 biến thể cặp tối thiểu của khoảng 12 mẫu, kèm tài liệu, nhãn bốn lớp, lý do, hướng dẫn gán nhãn và tệp điều kiện bắt buộc | Thư mục `data/` và thẻ dữ liệu | [4](#b04)–[13](#b13), [16](#b16), [18](#b18)–[20](#b20), [23](#b23)–[26](#b26), [32](#b32), [45](#b45) |
| Hệ thống trả về bốn nhãn kèm đoạn nguồn và lý do | `src/kiemchung/p.py`, `api.py` | [28](#b28), [34](#b34) |
| P, B0–B3 và hai bản bỏ thành phần chạy được trên cùng dữ liệu; mã nguồn P có kiểm thử cho từng quy tắc | `src/kiemchung/`, `tests/` | [15](#b15), [27](#b27)–[31](#b31) |
| Báo cáo thực nghiệm về FAR và nhãn Lệch điều kiện, kể cả khi không cải thiện | Chương 4 | [37](#b37)–[39](#b39), [42](#b42) |
| Website minh họa có tính năng "Kiểm chứng thông số" | Nhánh `kiem-chung-thong-so` của CopyPro | [40](#b40), [41](#b41) |

**T14.3 Phân công công việc**

Mục 3 của Kế hoạch thực hiện trong đề cương: sinh viên làm toàn bộ công việc; người gán nhãn thứ hai chỉ gán độc lập khoảng 60 tuyên bố theo cùng hướng dẫn để tính hệ số kappa của Cohen. Bước tương ứng: [1](#b01) (hỏi CBHD về người gán thứ hai), [26](#b26) (gửi việc cho người gán thứ hai), [32](#b32) (tính kappa).

<a id="t15"></a>

### T15. Tiêu chí tự kiểm trước mỗi mốc

Đây không phải thang điểm chính thức của Khoa. Danh sách gom những điều hội đồng hay hỏi, dùng để tự kiểm trước mỗi mốc.

| Tiêu chí | Đạt khi | Bước liên quan |
|---|---|---|
| Tính mới rõ ràng | Nói được thành phần nào đã có trong nghiên cứu trước, điểm mới nằm ở đâu, và có thí nghiệm đo riêng phần mới (P so với B1, B2) | [17](#b17), [27](#b27)–[31](#b31), [39](#b39) |
| Dữ liệu đáng tin | Hướng dẫn viết trước; khảo sát cách hiểu; kappa trong một người và giữa hai người | [9](#b09), [10](#b10), [32](#b32) |
| Đối chứng công bằng | B1 dùng đúng bộ thông số của P; B2 có hướng dẫn và ví dụ đầy đủ; cùng bằng chứng, cùng LLM | [30](#b30) |
| Thực nghiệm nghiêm túc | Khóa cấu hình và niêm phong nhãn trước tập kiểm tra; KTC; McNemar có hiệu chỉnh; báo cả kết quả không đạt | [33](#b33), [36](#b36)–[39](#b39) |
| Sản phẩm chạy được | Tính năng trên CopyPro có lưu kết quả; video; bảng thời gian; kết quả đầu–cuối | [40](#b40), [41](#b41) |
| Tái lập được | Một lệnh dựng lại bảng kết quả chính | [45](#b45) |
| Hình thức khóa luận | Đúng mẫu Khoa; trích dẫn đúng; thuật ngữ thống nhất | [42](#b42), [46](#b46) |

---

<a id="t16"></a>

### T16. Ký hiệu và chữ viết tắt

| Ký hiệu | Nghĩa |
|---|---|
| `- [ ]`, `- [x]` | Việc chưa làm, việc đã xong |
| 🏁 | Mốc kiểm tra với CBHD |
| ⭐ | Phần mở rộng, chỉ làm khi đúng tiến độ |
| CBHD | Cán bộ hướng dẫn |
| ND1–ND4 | Nội dung 1–4 trong mục "Phương pháp thực hiện" của đề cương |
| MT1–MT4 | Mục tiêu 1–4 của đề cương |
| CH1–CH3, H1–H3 | Câu hỏi nghiên cứu và giả thuyết tương ứng ([T1.4](#t1-4)) |
| P | Phương pháp đề xuất ([T1.3](#t1-3)) |
| B0–B3, B4 | Các phương pháp đối chứng; B4 thuộc phần mở rộng ([T6.1](#t6-1)) |
| P−ĐK, P−NN | P bỏ đối chiếu điều kiện; P bỏ cả neo nguồn lẫn kiểm tra đầy đủ ([T5.9](#t5-9)) |
| Neo nguồn | Mỗi trường LLM trích ra phải kèm câu gốc; Python kiểm tra câu gốc có thật trong văn bản và con số khớp |
| Kiểm tra đầy đủ | Tên gọi trong đề cương cho bước Python dò các cụm từ điều kiện trong tệp cấu hình để bổ sung điều kiện mà LLM bỏ sót |
| D1–D6, D1a, D1b | Các dòng của thứ tự quyết định ([T4.3](#t4-3)) |
| LLM | Mô hình ngôn ngữ lớn |
| BM25 | Cách xếp hạng đoạn văn theo mức liên quan với câu truy vấn, dựa trên tần suất từ |
| top-k | k đoạn được xếp hạng cao nhất |
| FAR | Tỷ lệ chấp nhận nhầm: trong số tuyên bố có nhãn chuẩn khác Đúng, tỷ lệ bị gán Đúng |
| Recall@k | Tỷ lệ tuyên bố có đoạn bằng chứng chuẩn nằm trong top-k |
| KTC | Khoảng tin cậy 95% |
| Kappa của Cohen | Mức đồng thuận giữa hai lần gán nhãn, đã trừ phần trùng do ngẫu nhiên |
| Bộ thử | Khoảng 60 tuyên bố của 2 mẫu thử, làm trong tháng 10 |
| Tập phát triển, tập kiểm tra | Dữ liệu dùng để chọn cấu hình, và dữ liệu chỉ dùng một lần để báo kết quả cuối |
| Cặp tối thiểu | Biến thể chỉ khác tuyên bố gốc ở một chỗ, để đo riêng từng loại lệch ([T4.7](#t4-7)) |
