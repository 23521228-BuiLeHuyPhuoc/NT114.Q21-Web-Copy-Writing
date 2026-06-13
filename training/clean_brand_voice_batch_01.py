# -*- coding: utf-8 -*-
"""Clean batch 01 brand-voice fine-tuning examples.

This script uses only the Python standard library so it can run in the
current environment without installing spreadsheet dependencies.
"""

from __future__ import annotations

from pathlib import Path
from zipfile import ZIP_DEFLATED, ZipFile
import re
import xml.etree.ElementTree as ET
from xml.sax.saxutils import escape


SOURCE = Path("fine_tuning_excel_pack_brand_voice_UTF8_FIXED/01_train_examples_brand_voice_UTF8_FIXED.xlsx")
OUTPUT = Path("fine_tuning_excel_pack_brand_voice_UTF8_FIXED/01_train_examples_brand_voice_UTF8_CLEANED.xlsx")

HEADERS = ["input", "output", "industry", "tone", "type", "product"]
VALID_INDUSTRIES = {
    "ecommerce",
    "realestate",
    "technology",
    "fnb",
    "healthcare",
    "education",
    "finance",
    "fashion",
    "business",
    "travel",
}
VALID_TYPES = {"headline", "description", "social", "email", "cta", "landing", "seo", "review"}
VALID_TONES = {"urgent", "professional", "friendly", "luxury", "humorous", "emotional"}

TYPE_LABELS = {
    "headline": "tiêu đề quảng cáo",
    "description": "mô tả sản phẩm",
    "social": "bài đăng mạng xã hội",
    "email": "email marketing",
    "cta": "lời kêu gọi hành động",
    "landing": "nội dung landing page",
    "seo": "nội dung SEO",
    "review": "review/testimonial",
}

TONE_LABELS = {
    "urgent": "khẩn cấp",
    "professional": "chuyên nghiệp",
    "friendly": "thân thiện",
    "luxury": "cao cấp",
    "humorous": "hài hước",
    "emotional": "cảm xúc",
}

NS = {"a": "http://schemas.openxmlformats.org/spreadsheetml/2006/main"}


PRODUCT_PROFILES = {
    "bình giữ nhiệt thép 316": {
        "scene": "mang cà phê từ nhà đến văn phòng",
        "moment": "trước khi bước vào các cuộc họp buổi sáng",
        "problem": "cà phê nhanh nguội hoặc bình rò trong túi làm việc",
        "benefit": "giữ đồ uống sẵn sàng và gọn gàng hơn trong ngày làm việc",
        "proof": "giữ nóng 8 giờ, nắp chống tràn và dễ vệ sinh",
        "choice": "dung tích, màu sắc và cách đóng nắp phù hợp thói quen mang theo",
        "benefits": [
            "Giữ cà phê hoặc trà nóng lâu hơn trong ca làm việc.",
            "Nắp chống tràn giúp bạn yên tâm hơn khi bỏ bình vào túi.",
            "Thiết kế dễ vệ sinh giúp việc dùng hằng ngày bớt phiền.",
        ],
        "highlights": [
            "Chất liệu thép 316 phù hợp nhu cầu dùng thường xuyên.",
            "Khả năng giữ nóng 8 giờ đáp ứng lịch làm việc bận rộn.",
            "Freeship cho đơn từ 2 sản phẩm là điểm cộng khi mua cho mình và đồng nghiệp.",
        ],
        "hashtags": ["#BinhGiuNhiet", "#CaPheDiLam", "#DanVanPhong", "#DoDungTienIch"],
    },
    "đèn bàn LED chống chói": {
        "scene": "học khuya, đọc tài liệu hoặc làm việc tại nhà",
        "moment": "khi bạn cần tập trung mà vẫn muốn góc bàn gọn mắt",
        "problem": "ánh sáng không phù hợp khiến việc học và làm việc nhanh mỏi",
        "benefit": "tùy chỉnh ánh sáng linh hoạt hơn cho từng khung giờ sử dụng",
        "proof": "3 mức sáng, cổ đèn linh hoạt và tiết kiệm điện",
        "choice": "vị trí đặt đèn, mức sáng thường dùng và góc chiếu trên bàn",
        "benefits": [
            "3 mức sáng giúp bạn chọn ánh sáng phù hợp từng thời điểm.",
            "Cổ đèn linh hoạt hỗ trợ điều chỉnh góc chiếu theo vị trí ngồi.",
            "Tiết kiệm điện giúp yên tâm hơn khi dùng thường xuyên.",
        ],
        "highlights": [
            "Thiết kế chống chói phù hợp góc học tập và làm việc tại nhà.",
            "Có thể chuyển mức sáng nhanh khi đọc, ghi chép hoặc dùng laptop.",
            "Khách mới được giảm 10 phần trăm theo thông tin ưu đãi hiện có.",
        ],
        "hashtags": ["#DenBanLED", "#GocHocTap", "#LamViecTaiNha", "#TietKiemDien"],
    },
    "bộ chăm sóc da tối giản": {
        "scene": "bắt đầu thói quen skincare mà không muốn quá nhiều bước",
        "moment": "sau một ngày bận rộn nhưng vẫn muốn chăm sóc da đều đặn",
        "problem": "quy trình quá nhiều sản phẩm khiến người mới dễ bỏ cuộc",
        "benefit": "giữ routine chăm sóc da đơn giản, nhẹ nhàng và dễ theo hơn",
        "proof": "3 bước dễ theo, kết cấu nhẹ và phù hợp dùng hằng ngày",
        "choice": "thói quen buổi sáng, buổi tối và cảm giác kết cấu trên da",
        "benefits": [
            "3 bước dễ theo giúp người mới bắt đầu không bị rối.",
            "Kết cấu nhẹ tạo cảm giác dễ chịu khi dùng hằng ngày.",
            "Routine tối giản giúp bạn duy trì thói quen chăm sóc da đều hơn.",
        ],
        "highlights": [
            "Tập trung vào các bước cơ bản, không làm quy trình trở nên phức tạp.",
            "Phù hợp với người muốn làm quen skincare theo nhịp vừa phải.",
            "Tặng túi du lịch mini để mang theo khi đi học, đi làm hoặc đi chơi.",
        ],
        "hashtags": ["#SkincareToiGian", "#ChamSocDaHangNgay", "#NguoiMoiSkincare", "#RoutineDonGian"],
    },
    "máy xay sinh tố mini": {
        "scene": "chuẩn bị sinh tố hoặc đồ uống nhanh trước khi ra ngoài",
        "moment": "buổi sáng gấp nhưng vẫn muốn có ly đồ uống mang theo",
        "problem": "không có nhiều thời gian chuẩn bị và dọn rửa sau khi xay",
        "benefit": "làm đồ uống cá nhân nhanh hơn, gọn hơn và dễ mang theo",
        "proof": "cốc mang đi, sạc USB và lưỡi dao inox",
        "choice": "dung tích cốc, nhu cầu mang đi và thói quen sạc thiết bị",
        "benefits": [
            "Cốc mang đi giúp giảm bước chuyển đồ uống sang bình khác.",
            "Sạc USB tiện hơn cho người thường di chuyển hoặc làm việc linh hoạt.",
            "Lưỡi dao inox hỗ trợ xay nguyên liệu thường dùng mỗi ngày.",
        ],
        "highlights": [
            "Kích thước mini phù hợp góc bếp nhỏ hoặc bàn làm việc.",
            "Tập trung vào nhu cầu chuẩn bị đồ uống cá nhân nhanh gọn.",
            "Có đổi mới trong 7 ngày nếu lỗi kỹ thuật theo chính sách đi kèm.",
        ],
        "hashtags": ["#MayXayMini", "#DoUongNhanh", "#SongBanRon", "#CocMangDi"],
    },
    "ghế công thái học lưng lưới": {
        "scene": "ngồi máy tính nhiều giờ tại văn phòng hoặc góc làm việc ở nhà",
        "moment": "sau vài tiếng làm việc liên tục trước màn hình",
        "problem": "tư thế ngồi kém thoải mái làm bạn khó duy trì tập trung",
        "benefit": "tạo cảm giác ngồi thoáng và được nâng đỡ tốt hơn khi làm việc lâu",
        "proof": "đỡ lưng, tay ghế điều chỉnh và lưới thoáng",
        "choice": "chiều cao bàn, vóc dáng người ngồi và cách chỉnh tay ghế",
        "benefits": [
            "Phần đỡ lưng hỗ trợ tư thế ngồi ổn định hơn trong giờ làm việc.",
            "Tay ghế điều chỉnh giúp dễ tìm vị trí đặt tay phù hợp.",
            "Lưng lưới thoáng tạo cảm giác dễ chịu khi ngồi lâu.",
        ],
        "highlights": [
            "Phù hợp với nhân viên thường xuyên dùng máy tính.",
            "Thiết kế tập trung vào trải nghiệm ngồi thực tế thay vì trang trí rườm rà.",
            "Có hỗ trợ tư vấn chọn size để giảm rủi ro chọn sai.",
        ],
        "hashtags": ["#GheCongThaiHoc", "#GocLamViec", "#NgoiMayTinh", "#LamViecHieuQua"],
    },
    "nồi chiên không dầu dung tích 6 lít": {
        "scene": "chuẩn bị bữa ăn gia đình nhanh gọn sau giờ làm",
        "moment": "khi cả nhà muốn có món nóng mà không muốn dọn dẹp quá lâu",
        "problem": "nấu ăn mất nhiều thời gian và khâu lau rửa dễ làm bạn ngại vào bếp",
        "benefit": "giúp việc nấu món quen thuộc gọn hơn cho gia đình",
        "proof": "khay chống dính, hẹn giờ và dễ lau chùi",
        "choice": "khẩu phần gia đình, món thường nấu và vị trí đặt nồi trong bếp",
        "benefits": [
            "Dung tích 6 lít phù hợp cho nhu cầu nấu nhanh gọn của gia đình.",
            "Khay chống dính và dễ lau chùi giúp giảm thời gian dọn sau bữa ăn.",
            "Chức năng hẹn giờ hỗ trợ bạn chủ động hơn khi chuẩn bị món ăn.",
        ],
        "highlights": [
            "Tập trung vào các thao tác nấu nướng quen thuộc mỗi ngày.",
            "Phù hợp với người muốn tối giản khâu chuẩn bị và vệ sinh bếp.",
            "Kèm sổ công thức điện tử để có thêm ý tưởng món ăn.",
        ],
        "hashtags": ["#NoiChienKhongDau", "#BepGiaDinh", "#NauAnNhanhGon", "#SoCongThuc"],
    },
    "balo laptop chống nước": {
        "scene": "đi làm, gặp khách hàng hoặc di chuyển qua nhiều điểm trong ngày",
        "moment": "khi bạn cần mang laptop 15 inch mà vẫn muốn balo gọn và êm vai",
        "problem": "mưa bất chợt, quai đeo khó chịu hoặc ngăn laptop thiếu chắc chắn",
        "benefit": "mang laptop và vật dụng đi làm gọn hơn, yên tâm hơn khi di chuyển",
        "proof": "ngăn laptop 15 inch, vải chống nước và đệm vai êm",
        "choice": "kích thước laptop, màu balo và lượng đồ thường mang theo",
        "benefits": [
            "Ngăn laptop 15 inch giúp tách thiết bị khỏi các vật dụng khác.",
            "Vải chống nước hỗ trợ tốt hơn khi gặp mưa nhẹ trên đường đi làm.",
            "Đệm vai êm giúp việc di chuyển nhiều trở nên dễ chịu hơn.",
        ],
        "highlights": [
            "Phù hợp với người đi làm cần mang laptop hằng ngày.",
            "Thiết kế ưu tiên sự gọn gàng và tính thực dụng khi di chuyển.",
            "Miễn phí đổi màu trong 3 ngày giúp bạn linh hoạt hơn sau khi nhận hàng.",
        ],
        "hashtags": ["#BaloLaptop", "#DiLamMoiNgay", "#ChongNuoc", "#PhuKienCongSo"],
    },
    "tai nghe không dây chống ồn": {
        "scene": "làm việc tập trung, họp online hoặc di chuyển trong không gian ồn",
        "moment": "khi bạn cần tách khỏi tiếng ồn để xử lý công việc",
        "problem": "tiếng ồn xung quanh và micro kém rõ làm cuộc gọi thiếu trọn vẹn",
        "benefit": "giữ nhịp làm việc tập trung hơn mà vẫn tiện cho cuộc gọi hằng ngày",
        "proof": "chống ồn chủ động, pin 30 giờ và micro rõ",
        "choice": "thời lượng pin, nhu cầu gọi online và môi trường sử dụng thường xuyên",
        "benefits": [
            "Chống ồn chủ động hỗ trợ giảm xao nhãng trong lúc làm việc.",
            "Pin 30 giờ phù hợp cho lịch dùng dài trong ngày.",
            "Micro rõ giúp cuộc gọi và họp online mạch lạc hơn.",
        ],
        "highlights": [
            "Thiết kế không dây phù hợp người cần di chuyển linh hoạt.",
            "Tập trung vào nhu cầu làm việc, nghe gọi và giữ sự tập trung.",
            "Bảo hành chính hãng 12 tháng giúp bạn yên tâm hơn khi chọn mua.",
        ],
        "hashtags": ["#TaiNgheChongOn", "#LamViecTapTrung", "#HopOnline", "#Pin30Gio"],
    },
    "khóa cửa thông minh": {
        "scene": "quản lý việc ra vào căn hộ cho gia đình hoặc người thuê ngắn hạn",
        "moment": "khi bạn không muốn phụ thuộc hoàn toàn vào chìa khóa cơ",
        "problem": "khó kiểm soát người ra vào hoặc quên theo dõi tình trạng pin khóa",
        "benefit": "kiểm soát lối vào căn hộ linh hoạt và chủ động hơn",
        "proof": "mở bằng vân tay, mã số tạm thời và cảnh báo pin yếu",
        "choice": "số người dùng, nhu cầu cấp mã tạm thời và điều kiện lắp đặt cửa",
        "benefits": [
            "Mở bằng vân tay giúp thao tác ra vào nhanh hơn trong sinh hoạt hằng ngày.",
            "Mã số tạm thời phù hợp khi cần chia sẻ quyền vào nhà trong thời gian ngắn.",
            "Cảnh báo pin yếu giúp bạn chủ động thay pin trước khi bất tiện xảy ra.",
        ],
        "highlights": [
            "Phù hợp với chủ căn hộ muốn quản lý ra vào rõ ràng hơn.",
            "Tập trung vào sự tiện lợi trong các tình huống dùng thật.",
            "Có lắp đặt ưu đãi trong nội thành theo thông tin đi kèm.",
        ],
        "hashtags": ["#KhoaCuaThongMinh", "#CanHoHienDai", "#VanTay", "#KiemSoatRaVao"],
    },
    "thảm yoga chống trượt": {
        "scene": "tập yoga, giãn cơ hoặc tập nhẹ tại nhà",
        "moment": "khi bạn muốn trải thảm ra và bắt đầu buổi tập nhanh chóng",
        "problem": "thảm dễ xê dịch hoặc quá mỏng khiến buổi tập thiếu thoải mái",
        "benefit": "giúp buổi tập tại nhà ổn định, gọn gàng và dễ duy trì hơn",
        "proof": "bề mặt bám tốt, dày 6 mm và dễ cuộn gọn",
        "choice": "không gian tập, độ dày mong muốn và cách cất thảm sau buổi tập",
        "benefits": [
            "Bề mặt bám tốt giúp bạn tự tin hơn khi chuyển động trên thảm.",
            "Độ dày 6 mm tạo cảm giác êm vừa phải cho các bài tập tại nhà.",
            "Dễ cuộn gọn giúp việc cất thảm sau buổi tập nhanh hơn.",
        ],
        "highlights": [
            "Phù hợp với người muốn duy trì lịch tập tại nhà.",
            "Thiết kế ưu tiên sự ổn định và gọn nhẹ trong sử dụng hằng ngày.",
            "Tặng dây đeo thảm để mang đi hoặc cất giữ thuận tiện hơn.",
        ],
        "hashtags": ["#ThamYoga", "#TapTaiNha", "#ChongTruot", "#YogaMoiNgay"],
    },
    "máy lọc không khí phòng ngủ": {
        "scene": "giữ không gian phòng ngủ yên tĩnh và dễ chịu hơn vào buổi tối",
        "moment": "khi gia đình có trẻ nhỏ và muốn theo dõi chất lượng không khí trong phòng",
        "problem": "bụi trong phòng và tiếng máy ồn có thể làm trải nghiệm ngủ kém thoải mái",
        "benefit": "hỗ trợ không gian nghỉ ngơi sạch thoáng và ít tiếng ồn hơn",
        "proof": "màng lọc HEPA, chế độ ngủ yên tĩnh và cảm biến bụi",
        "choice": "diện tích phòng, vị trí đặt máy và nhu cầu dùng chế độ ngủ",
        "benefits": [
            "Màng lọc HEPA hỗ trợ lọc bụi trong không gian phòng ngủ.",
            "Chế độ ngủ yên tĩnh phù hợp khi dùng vào ban đêm.",
            "Cảm biến bụi giúp bạn theo dõi tình trạng không khí dễ hơn.",
        ],
        "highlights": [
            "Phù hợp với gia đình có trẻ nhỏ cần không gian nghỉ ngơi dễ chịu.",
            "Tập trung vào phòng ngủ, nơi độ ồn và diện tích phòng rất đáng cân nhắc.",
            "Có tư vấn diện tích phòng miễn phí để chọn máy sát nhu cầu hơn.",
        ],
        "hashtags": ["#MayLocKhongKhi", "#PhongNgu", "#GiaDinhCoTreNho", "#HEPA"],
    },
    "ví da mini nhiều ngăn": {
        "scene": "ra ngoài gọn nhẹ với thẻ, ít tiền mặt và vài món nhỏ cần lấy nhanh",
        "moment": "khi bạn không muốn chiếc ví làm túi xách hoặc túi quần cộm lên",
        "problem": "ví quá dày, khó tìm thẻ hoặc thiếu cảm giác chỉn chu khi sử dụng",
        "benefit": "giữ các món cần thiết ngăn nắp hơn trong một chiếc ví nhỏ",
        "proof": "da mềm, nhiều ngăn thẻ và kích thước nhỏ",
        "choice": "số thẻ thường mang, màu ví và nhu cầu khắc tên",
        "benefits": [
            "Da mềm tạo cảm giác cầm nắm dễ chịu khi dùng hằng ngày.",
            "Nhiều ngăn thẻ giúp sắp xếp thẻ cần dùng rõ ràng hơn.",
            "Kích thước nhỏ phù hợp với người thích phụ kiện gọn gàng.",
        ],
        "highlights": [
            "Phù hợp để mang theo khi đi làm, đi chơi hoặc dùng túi nhỏ.",
            "Thiết kế tập trung vào sự gọn gàng thay vì chứa quá nhiều đồ.",
            "Có khắc tên theo yêu cầu để tạo dấu ấn cá nhân.",
        ],
        "hashtags": ["#ViDaMini", "#PhuKienGonGang", "#NhieuNganThe", "#KhacTen"],
    },
}


def col_to_idx(ref: str) -> int:
    match = re.match(r"([A-Z]+)", ref)
    if not match:
        return 1
    value = 0
    for char in match.group(1):
        value = value * 26 + ord(char) - 64
    return value


def idx_to_col(idx: int) -> str:
    chars = []
    while idx:
        idx, rem = divmod(idx - 1, 26)
        chars.append(chr(65 + rem))
    return "".join(reversed(chars))


def read_xlsx(path: Path) -> list[list[str]]:
    with ZipFile(path) as workbook:
        shared_strings: list[str] = []
        if "xl/sharedStrings.xml" in workbook.namelist():
            root = ET.fromstring(workbook.read("xl/sharedStrings.xml"))
            for item in root.findall("a:si", NS):
                shared_strings.append("".join((text.text or "") for text in item.findall(".//a:t", NS)))

        sheet = ET.fromstring(workbook.read("xl/worksheets/sheet1.xml"))
        rows: list[list[str]] = []
        for row in sheet.findall(".//a:sheetData/a:row", NS):
            cells: dict[int, str] = {}
            for cell in row.findall("a:c", NS):
                idx = col_to_idx(cell.attrib.get("r", "A"))
                cell_type = cell.attrib.get("t")
                value_node = cell.find("a:v", NS)
                inline_node = cell.find("a:is", NS)
                if cell_type == "s" and value_node is not None:
                    value = shared_strings[int(value_node.text or "0")]
                elif cell_type == "inlineStr" and inline_node is not None:
                    value = "".join((text.text or "") for text in inline_node.findall(".//a:t", NS))
                elif value_node is not None:
                    value = value_node.text or ""
                else:
                    value = ""
                cells[idx] = value
            if cells:
                rows.append([cells.get(i, "") for i in range(1, max(cells) + 1)])
        return rows


def text_after_colon(line: str) -> str:
    return line.split(":", 1)[1].strip().rstrip(".") if ":" in line else ""


def normalize_length(raw: str) -> str:
    value = raw.lower()
    if "ngắn" in value or value == "short":
        return "short"
    if "dài" in value or value == "long":
        return "long"
    return "medium"


def parse_metadata(row: dict[str, str]) -> dict[str, object]:
    lines = row["input"].splitlines()
    raw_length = text_after_colon(lines[6]) if len(lines) > 6 else ""
    variation_match = re.search(r"(\d+)", lines[8] if len(lines) > 8 else "")
    product = row["product"].strip()
    return {
        "industry": row["industry"].strip() if row["industry"].strip() in VALID_INDUSTRIES else "ecommerce",
        "tone": row["tone"].strip() if row["tone"].strip() in VALID_TONES else "professional",
        "type": row["type"].strip() if row["type"].strip() in VALID_TYPES else "description",
        "product": product,
        "keywords": text_after_colon(lines[3]) if len(lines) > 3 else "",
        "targetAudience": text_after_colon(lines[4]) if len(lines) > 4 else "",
        "additionalContext": text_after_colon(lines[5]) if len(lines) > 5 else "",
        "length": normalize_length(raw_length),
        "variations": int(variation_match.group(1)) if variation_match else 1,
        "profile": PRODUCT_PROFILES[product],
    }


def feature_list(meta: dict[str, object]) -> list[str]:
    return [part.strip() for part in str(meta["keywords"]).split(";") if part.strip()]


def cap_first(text: str) -> str:
    return text[:1].upper() + text[1:] if text else text


def when_scene(profile: dict[str, object]) -> str:
    return f"khi bạn {profile['scene']}"


def audience_clause(audience: str) -> str:
    if audience.startswith("gia đình"):
        return "gia đình bạn có trẻ nhỏ"
    return f"bạn là {audience}"


def context_note(context: str) -> str:
    if context.startswith("tặng"):
        return f"quà {context}"
    if "bảo hành" in context:
        return f"chính sách {context}"
    return context


def clean_input(meta: dict[str, object]) -> str:
    content_type = str(meta["type"])
    tone = str(meta["tone"])
    return "\n".join(
        [
            f"Hãy viết {TYPE_LABELS[content_type]} bằng tiếng Việt cho ngành {meta['industry']}.",
            f"industry: {meta['industry']}",
            f"type: {content_type}",
            f"tone: {tone}",
            "language: vi",
            f"length: {meta['length']}",
            f"variations: {meta['variations']}",
            f"productName: {meta['product']}",
            f"keywords: {meta['keywords']}",
            f"targetAudience: {meta['targetAudience']}",
            f"additionalContext: {meta['additionalContext']}",
            f"Yêu cầu: tạo đúng {meta['variations']} phiên bản độc lập, thể hiện rõ tone {TONE_LABELS[tone]} và trả lời đúng format của type {content_type}.",
        ]
    )


def versioned(parts: list[str]) -> str:
    return "\n\n".join(f"Phiên bản {idx}:\n{body}" for idx, body in enumerate(parts, start=1))


def headline_output(meta: dict[str, object]) -> str:
    product = str(meta["product"])
    audience = str(meta["targetAudience"])
    context = str(meta["additionalContext"])
    note = context_note(context)
    profile = meta["profile"]  # type: ignore[assignment]
    f1, f2, f3 = feature_list(meta)
    if meta["tone"] == "urgent":
        bodies = [
            "\n".join(
                [
                    f"Headline: Đừng đợi đến lúc {profile['problem']} mới tìm {product}.",
                    f"Subheadline: Với {f1}, {f2} và {f3}, sản phẩm giúp bạn chủ động hơn {when_scene(profile)}.",
                    f"Lời kêu gọi hành động: Xem chi tiết ngay và hỏi shop về {note}.",
                ]
            ),
            "\n".join(
                [
                    f"Headline: Đang cần {product}? Đừng để việc chọn mua đến phút cuối.",
                    f"Subheadline: Nhất là {profile['moment']}, những điểm như {profile['proof']} sẽ giúp bạn quyết định nhanh hơn mà vẫn bám đúng nhu cầu dùng thật.",
                    "Lời kêu gọi hành động: Nhắn shop ngay để được gợi ý mẫu phù hợp.",
                ]
            ),
            "\n".join(
                [
                    f"Headline: {cap_first(product)} đáng xem ngay nếu bạn muốn bớt bất tiện.",
                    f"Subheadline: Dành cho {audience}, tập trung vào {f1}, {f2}, {f3} và thông tin kèm theo: {context}.",
                    "Lời kêu gọi hành động: Kiểm tra lựa chọn phù hợp trước khi bạn cần dùng gấp.",
                ]
            ),
        ]
    else:
        bodies = [
            "\n".join(
                [
                    f"Headline: {cap_first(product)} để ngày dùng của bạn nhẹ hơn.",
                    f"Subheadline: Một lựa chọn dễ làm quen cho {audience}, với {f1}, {f2} và {f3} để hỗ trợ {when_scene(profile)}.",
                    "Lời kêu gọi hành động: Xem thử mẫu hợp với thói quen của bạn.",
                ]
            ),
            "\n".join(
                [
                    f"Headline: Nhẹ một việc nhỏ mỗi ngày cùng {product}.",
                    f"Subheadline: Sản phẩm giúp bạn {profile['benefit']}, đồng thời có thêm thông tin hỗ trợ: {context}.",
                    "Lời kêu gọi hành động: Nhắn shop nếu bạn muốn hỏi thêm trước khi chọn.",
                ]
            ),
            "\n".join(
                [
                    f"Headline: Chọn {product} theo cách bạn thật sự dùng.",
                    f"Subheadline: Từ {f1} đến {f2} và {f3}, mọi điểm chính đều hướng đến nhu cầu của {audience}.",
                    "Lời kêu gọi hành động: Lưu lại để so sánh khi bạn cần mua.",
                ]
            ),
        ]
    return versioned(bodies)


def description_output(meta: dict[str, object]) -> str:
    product = str(meta["product"])
    audience = str(meta["targetAudience"])
    context = str(meta["additionalContext"])
    profile = meta["profile"]  # type: ignore[assignment]
    benefits = profile["benefits"]
    highlights = profile["highlights"]
    f1, f2, f3 = feature_list(meta)
    if meta["tone"] == "emotional":
        bodies = [
            "\n".join(
                [
                    f"Mô tả ngắn: Có những ngày chỉ cần bớt một bất tiện nhỏ, mọi thứ đã dễ thở hơn. {cap_first(product)} phù hợp với {audience}, nhất là {profile['moment']}, giúp bạn {profile['benefit']}.",
                    "Lợi ích chính:",
                    f"* {benefits[0]}",
                    f"* {benefits[1]}",
                    f"* {benefits[2]}",
                    "Đặc điểm nổi bật:",
                    f"* {cap_first(f1)}.",
                    f"* {cap_first(f2)}.",
                    f"* {cap_first(f3)}; {context}.",
                    "Lời kêu gọi hành động: Chọn sản phẩm phù hợp để thói quen hằng ngày của bạn nhẹ nhàng hơn.",
                ]
            ),
            "\n".join(
                [
                    f"Mô tả ngắn: Khi {profile['problem']}, một lựa chọn đúng nhu cầu sẽ giúp bạn thấy yên tâm hơn. {cap_first(product)} tập trung vào trải nghiệm dùng thật, không làm mọi thứ phức tạp.",
                    "Lợi ích chính:",
                    f"* {benefits[1]}",
                    f"* {benefits[2]}",
                    f"* {benefits[0]}",
                    "Đặc điểm nổi bật:",
                    f"* Phù hợp với {audience}.",
                    f"* Nổi bật với {f1}, {f2} và {f3}.",
                    f"* Thông tin kèm theo: {context}.",
                    "Lời kêu gọi hành động: Nhắn shop để được gợi ý theo cách bạn sẽ dùng mỗi ngày.",
                ]
            ),
            "\n".join(
                [
                    f"Mô tả ngắn: {cap_first(product)} không cần hứa hẹn quá nhiều; điểm đáng giá nằm ở việc giúp {profile['moment']} trở nên chủ động hơn.",
                    "Lợi ích chính:",
                    f"* {benefits[2]}",
                    f"* {benefits[0]}",
                    f"* {benefits[1]}",
                    "Đặc điểm nổi bật:",
                    f"* {highlights[0]}",
                    f"* {highlights[1]}",
                    f"* {highlights[2]}",
                    "Lời kêu gọi hành động: Xem chi tiết để chọn phiên bản hợp với nhịp sống của bạn.",
                ]
            ),
        ]
    else:
        bodies = [
            "\n".join(
                [
                    f"Mô tả ngắn: {cap_first(product)} là lựa chọn dành cho {audience} cần {profile['benefit']}. Sản phẩm tập trung vào các yếu tố sử dụng thực tế và dễ đánh giá.",
                    "Lợi ích chính:",
                    f"* {benefits[0]}",
                    f"* {benefits[1]}",
                    f"* {benefits[2]}",
                    "Đặc điểm nổi bật:",
                    f"* {cap_first(f1)}.",
                    f"* {cap_first(f2)}.",
                    f"* {cap_first(f3)}; {context}.",
                    "Lời kêu gọi hành động: Xem thông tin sản phẩm và chọn cấu hình phù hợp với nhu cầu của bạn.",
                ]
            ),
            "\n".join(
                [
                    f"Mô tả ngắn: Nếu bạn đang tìm {product} {when_scene(profile)}, đây là lựa chọn có các tiêu chí rõ ràng để cân nhắc trước khi mua.",
                    "Lợi ích chính:",
                    f"* {benefits[1]}",
                    f"* {benefits[0]}",
                    f"* {benefits[2]}",
                    "Đặc điểm nổi bật:",
                    f"* Phù hợp với {audience}.",
                    f"* Tập trung vào {profile['proof']}.",
                    f"* Có thêm hỗ trợ/ưu đãi: {context}.",
                    "Lời kêu gọi hành động: Liên hệ shop để kiểm tra lựa chọn phù hợp trước khi đặt hàng.",
                ]
            ),
            "\n".join(
                [
                    f"Mô tả ngắn: {cap_first(product)} giúp bạn giải quyết nhu cầu chính mà không phải đọc quá nhiều thông tin rời rạc. Các điểm nổi bật đều gắn với cách dùng hằng ngày.",
                    "Lợi ích chính:",
                    f"* {benefits[2]}",
                    f"* {benefits[1]}",
                    f"* {benefits[0]}",
                    "Đặc điểm nổi bật:",
                    f"* {highlights[0]}",
                    f"* {highlights[1]}",
                    f"* {highlights[2]}",
                    "Lời kêu gọi hành động: Đọc chi tiết sản phẩm để quyết định dựa trên đúng tiêu chí bạn cần.",
                ]
            ),
        ]
    return versioned(bodies)


def hashtags(profile: dict[str, object], shift: int = 0) -> str:
    tags = list(profile["hashtags"])
    if shift:
        tags = tags[shift:] + tags[:shift]
    return " ".join(tags[:4])


def social_output(meta: dict[str, object]) -> str:
    product = str(meta["product"])
    audience = str(meta["targetAudience"])
    context = str(meta["additionalContext"])
    profile = meta["profile"]  # type: ignore[assignment]
    f1, f2, f3 = feature_list(meta)
    if meta["tone"] == "urgent":
        bodies = [
            "\n".join(
                [
                    f"Hook: Đừng chờ đến lúc {profile['problem']} rồi mới tìm giải pháp.",
                    f"Caption: Nếu bạn đang cần {product} {when_scene(profile)}, hãy xem ngay các điểm chính: {f1}, {f2} và {f3}. Sản phẩm phù hợp với {audience} muốn quyết định nhanh nhưng vẫn dựa trên thông tin rõ ràng. Thông tin kèm theo: {context}.",
                    "Lời kêu gọi hành động: Nhắn shop ngay để kiểm tra lựa chọn phù hợp.",
                    f"Hashtags: {hashtags(profile, 0)}",
                ]
            ),
            "\n".join(
                [
                    f"Hook: Cần dùng sớm? {cap_first(product)} là lựa chọn đáng xem ngay.",
                    f"Caption: Với {profile['proof']}, sản phẩm giúp bạn chủ động hơn, nhất là {profile['moment']}. Đừng để đến khi cần gấp mới so sánh từng lựa chọn; hãy xem thông tin sản phẩm và hỏi shop nếu còn phân vân.",
                    "Lời kêu gọi hành động: Xem chi tiết hôm nay để chọn đúng nhu cầu.",
                    f"Hashtags: {hashtags(profile, 1)}",
                ]
            ),
            "\n".join(
                [
                    f"Hook: Một lựa chọn đúng lúc có thể giúp ngày của bạn gọn hơn ngay từ bây giờ.",
                    f"Caption: {cap_first(product)} dành cho {audience}, nổi bật với {f1}, {f2} và {f3}. Nếu {profile['problem']} là điều bạn đang gặp, đây là lúc nên kiểm tra sản phẩm và tận dụng thông tin hỗ trợ: {context}.",
                    "Lời kêu gọi hành động: Lưu sản phẩm và chốt lựa chọn trước khi bạn cần dùng gấp.",
                    f"Hashtags: {hashtags(profile, 2)}",
                ]
            ),
        ]
    else:
        bodies = [
            "\n".join(
                [
                    f"Hook: Có món đồ nhỏ thôi, nhưng dùng đúng thì ngày nhẹ hơn hẳn.",
                    f"Caption: {cap_first(product)} hợp với {audience} đang muốn {profile['benefit']}. Điểm dễ thích là {f1}, {f2} và {f3}; thêm {context} để bạn cân nhắc thoải mái hơn trước khi mua.",
                    "Lời kêu gọi hành động: Nhắn shop nếu bạn muốn được gợi ý theo nhu cầu riêng.",
                    f"Hashtags: {hashtags(profile, 0)}",
                ]
            ),
            "\n".join(
                [
                    f"Hook: Chọn đồ hợp mình đôi khi bắt đầu từ vài chi tiết rất thực tế.",
                    f"Caption: Nếu bạn thường {profile['scene']}, {product} là lựa chọn đáng lưu lại. Sản phẩm tập trung vào {profile['proof']}, giúp bạn bớt phải đoán trước khi quyết định.",
                    "Lời kêu gọi hành động: Xem thêm thông tin rồi chọn theo thói quen dùng của bạn.",
                    f"Hashtags: {hashtags(profile, 1)}",
                ]
            ),
            "\n".join(
                [
                    f"Hook: Mua sắm dễ hơn khi mình biết rõ mình cần gì.",
                    f"Caption: {cap_first(product)} dành cho {audience}, nhất là khi {profile['problem']}. Với {f1}, {f2}, {f3} và thông tin kèm theo {context}, bạn có đủ cơ sở để xem sản phẩm có hợp thật không.",
                    "Lời kêu gọi hành động: Lưu lại để so sánh trước khi đặt hàng.",
                    f"Hashtags: {hashtags(profile, 2)}",
                ]
            ),
        ]
    return versioned(bodies)


def email_output(meta: dict[str, object]) -> str:
    product = str(meta["product"])
    audience = str(meta["targetAudience"])
    context = str(meta["additionalContext"])
    profile = meta["profile"]  # type: ignore[assignment]
    benefits = profile["benefits"]
    f1, f2, f3 = feature_list(meta)
    bodies = [
        "\n".join(
            [
                f"Subject: Gợi ý {product} cho nhu cầu sử dụng hằng ngày",
                f"Preview text: Các điểm chính giúp bạn đánh giá nhanh trước khi mua.",
                "Lời chào: Chào bạn,",
                f"Nội dung chính: Nếu {audience_clause(audience)}, {product} là lựa chọn đáng cân nhắc {when_scene(profile)}. Sản phẩm tập trung vào {f1}, {f2} và {f3}, giúp bạn đánh giá dựa trên các yếu tố sử dụng thực tế.\n\nThông tin kèm theo hiện có: {context}. Bạn có thể xem đây là phần hỗ trợ thêm sau khi sản phẩm đã phù hợp với nhu cầu chính.",
                "Lời kêu gọi hành động: Xem chi tiết sản phẩm và chọn phiên bản phù hợp.",
            ]
        ),
        "\n".join(
            [
                f"Subject: Trước khi chọn {product}, hãy kiểm tra 3 điểm này",
                f"Preview text: {cap_first(f1)}, {f2} và {f3} là các tiêu chí nên xem kỹ.",
                "Lời chào: Chào bạn,",
                f"Nội dung chính: Khi mua {product}, điều quan trọng là sản phẩm có khớp với cách bạn dùng hay không. Với nhu cầu của {audience}, ba điểm nên ưu tiên là:\n\n* {benefits[0]}\n* {benefits[1]}\n* {benefits[2]}\n\nNgoài ra, shop đang có thông tin hỗ trợ: {context}.",
                "Lời kêu gọi hành động: Nhắn shop để được tư vấn theo nhu cầu cụ thể.",
            ]
        ),
        "\n".join(
            [
                f"Subject: {cap_first(product)} có phù hợp với nhu cầu của bạn?",
                f"Preview text: Một cách rà soát ngắn trước khi quyết định đặt hàng.",
                "Lời chào: Chào bạn,",
                f"Nội dung chính: Nếu bạn thường gặp tình huống {profile['problem']}, hãy xem {product} như một lựa chọn để cân nhắc có cơ sở. Sản phẩm nổi bật ở {profile['proof']}, phù hợp với bối cảnh {profile['moment']}.\n\nTrước khi đặt hàng, bạn nên kiểm tra {profile['choice']} để chọn đúng nhu cầu.",
                "Lời kêu gọi hành động: Mở trang sản phẩm để xem thông tin chi tiết.",
            ]
        ),
    ]
    return versioned(bodies)


def cta_output(meta: dict[str, object]) -> str:
    product = str(meta["product"])
    context = str(meta["additionalContext"])
    profile = meta["profile"]  # type: ignore[assignment]
    f1, f2, f3 = feature_list(meta)
    bodies = [
        "\n".join(
            [
                f"Lời kêu gọi hành động chính: Xem {product} có hợp với bạn không",
                f"Microcopy: Nổi bật với {f1}, {f2} và {f3}; thêm {context} để bạn cân nhắc dễ hơn.",
            ]
        ),
        "\n".join(
            [
                f"Lời kêu gọi hành động chính: Nhắn shop để chọn {product} đúng nhu cầu",
                f"Microcopy: Kể nhanh cách bạn sẽ dùng, shop sẽ gợi ý theo bối cảnh {profile['scene']}.",
            ]
        ),
        "\n".join(
            [
                f"Lời kêu gọi hành động chính: Lưu {product} để so sánh trước khi mua",
                f"Microcopy: Phù hợp khi bạn muốn {profile['benefit']} mà vẫn có đủ thông tin trước khi đặt hàng.",
            ]
        ),
    ]
    return versioned(bodies)


def build_output(meta: dict[str, object]) -> str:
    content_type = meta["type"]
    if content_type == "headline":
        return headline_output(meta)
    if content_type == "description":
        return description_output(meta)
    if content_type == "social":
        return social_output(meta)
    if content_type == "email":
        return email_output(meta)
    if content_type == "cta":
        return cta_output(meta)
    raise ValueError(f"Unsupported content type in this batch: {content_type}")


def xlsx_cell(ref: str, value: str, style: int = 1) -> str:
    safe = escape(value, {"\"": "&quot;"})
    return f'<c r="{ref}" t="inlineStr" s="{style}"><is><t xml:space="preserve">{safe}</t></is></c>'


def write_xlsx(path: Path, rows: list[list[str]]) -> None:
    path.parent.mkdir(parents=True, exist_ok=True)
    max_row = len(rows)
    max_col = len(rows[0]) if rows else 1
    dimension = f"A1:{idx_to_col(max_col)}{max_row}"
    sheet_rows = []
    for r_idx, row in enumerate(rows, start=1):
        cells = []
        for c_idx, value in enumerate(row, start=1):
            cells.append(xlsx_cell(f"{idx_to_col(c_idx)}{r_idx}", value, 2 if r_idx == 1 else 1))
        sheet_rows.append(f'<row r="{r_idx}" spans="1:{max_col}">{"".join(cells)}</row>')

    sheet_xml = f'''<?xml version="1.0" encoding="UTF-8" standalone="yes"?>
<worksheet xmlns="http://schemas.openxmlformats.org/spreadsheetml/2006/main" xmlns:r="http://schemas.openxmlformats.org/officeDocument/2006/relationships">
  <dimension ref="{dimension}"/>
  <sheetViews><sheetView workbookViewId="0"><pane ySplit="1" topLeftCell="A2" activePane="bottomLeft" state="frozen"/><selection pane="bottomLeft" activeCell="A2" sqref="A2"/></sheetView></sheetViews>
  <sheetFormatPr defaultRowHeight="18"/>
  <cols>
    <col min="1" max="1" width="65" customWidth="1"/>
    <col min="2" max="2" width="95" customWidth="1"/>
    <col min="3" max="6" width="18" customWidth="1"/>
  </cols>
  <sheetData>{''.join(sheet_rows)}</sheetData>
  <pageMargins left="0.7" right="0.7" top="0.75" bottom="0.75" header="0.3" footer="0.3"/>
</worksheet>'''

    files = {
        "[Content_Types].xml": '''<?xml version="1.0" encoding="UTF-8" standalone="yes"?>
<Types xmlns="http://schemas.openxmlformats.org/package/2006/content-types">
  <Default Extension="rels" ContentType="application/vnd.openxmlformats-package.relationships+xml"/>
  <Default Extension="xml" ContentType="application/xml"/>
  <Override PartName="/xl/workbook.xml" ContentType="application/vnd.openxmlformats-officedocument.spreadsheetml.sheet.main+xml"/>
  <Override PartName="/xl/worksheets/sheet1.xml" ContentType="application/vnd.openxmlformats-officedocument.spreadsheetml.worksheet+xml"/>
  <Override PartName="/xl/styles.xml" ContentType="application/vnd.openxmlformats-officedocument.spreadsheetml.styles+xml"/>
  <Override PartName="/docProps/core.xml" ContentType="application/vnd.openxmlformats-package.core-properties+xml"/>
  <Override PartName="/docProps/app.xml" ContentType="application/vnd.openxmlformats-officedocument.extended-properties+xml"/>
</Types>''',
        "_rels/.rels": '''<?xml version="1.0" encoding="UTF-8" standalone="yes"?>
<Relationships xmlns="http://schemas.openxmlformats.org/package/2006/relationships">
  <Relationship Id="rId1" Type="http://schemas.openxmlformats.org/officeDocument/2006/relationships/officeDocument" Target="xl/workbook.xml"/>
  <Relationship Id="rId2" Type="http://schemas.openxmlformats.org/package/2006/relationships/metadata/core-properties" Target="docProps/core.xml"/>
  <Relationship Id="rId3" Type="http://schemas.openxmlformats.org/officeDocument/2006/relationships/extended-properties" Target="docProps/app.xml"/>
</Relationships>''',
        "docProps/core.xml": '''<?xml version="1.0" encoding="UTF-8" standalone="yes"?>
<cp:coreProperties xmlns:cp="http://schemas.openxmlformats.org/package/2006/metadata/core-properties" xmlns:dc="http://purl.org/dc/elements/1.1/" xmlns:dcterms="http://purl.org/dc/terms/" xmlns:dcmitype="http://purl.org/dc/dcmitype/" xmlns:xsi="http://www.w3.org/2001/XMLSchema-instance">
  <dc:creator>Codex</dc:creator>
  <cp:lastModifiedBy>Codex</cp:lastModifiedBy>
  <dcterms:created xsi:type="dcterms:W3CDTF">2026-06-12T00:00:00Z</dcterms:created>
  <dcterms:modified xsi:type="dcterms:W3CDTF">2026-06-12T00:00:00Z</dcterms:modified>
</cp:coreProperties>''',
        "docProps/app.xml": '''<?xml version="1.0" encoding="UTF-8" standalone="yes"?>
<Properties xmlns="http://schemas.openxmlformats.org/officeDocument/2006/extended-properties" xmlns:vt="http://schemas.openxmlformats.org/officeDocument/2006/docPropsVTypes">
  <Application>Codex</Application>
  <DocSecurity>0</DocSecurity>
  <ScaleCrop>false</ScaleCrop>
  <HeadingPairs><vt:vector size="2" baseType="variant"><vt:variant><vt:lpstr>Worksheets</vt:lpstr></vt:variant><vt:variant><vt:i4>1</vt:i4></vt:variant></vt:vector></HeadingPairs>
  <TitlesOfParts><vt:vector size="1" baseType="lpstr"><vt:lpstr>Train</vt:lpstr></vt:vector></TitlesOfParts>
  <Company></Company>
  <LinksUpToDate>false</LinksUpToDate>
  <SharedDoc>false</SharedDoc>
  <HyperlinksChanged>false</HyperlinksChanged>
  <AppVersion>16.0300</AppVersion>
</Properties>''',
        "xl/workbook.xml": '''<?xml version="1.0" encoding="UTF-8" standalone="yes"?>
<workbook xmlns="http://schemas.openxmlformats.org/spreadsheetml/2006/main" xmlns:r="http://schemas.openxmlformats.org/officeDocument/2006/relationships">
  <fileVersion appName="xl"/>
  <workbookPr defaultThemeVersion="124226"/>
  <bookViews><workbookView xWindow="0" yWindow="0" windowWidth="28800" windowHeight="17600"/></bookViews>
  <sheets><sheet name="Train" sheetId="1" r:id="rId1"/></sheets>
  <calcPr calcId="0"/>
</workbook>''',
        "xl/_rels/workbook.xml.rels": '''<?xml version="1.0" encoding="UTF-8" standalone="yes"?>
<Relationships xmlns="http://schemas.openxmlformats.org/package/2006/relationships">
  <Relationship Id="rId1" Type="http://schemas.openxmlformats.org/officeDocument/2006/relationships/worksheet" Target="worksheets/sheet1.xml"/>
  <Relationship Id="rId2" Type="http://schemas.openxmlformats.org/officeDocument/2006/relationships/styles" Target="styles.xml"/>
</Relationships>''',
        "xl/styles.xml": '''<?xml version="1.0" encoding="UTF-8" standalone="yes"?>
<styleSheet xmlns="http://schemas.openxmlformats.org/spreadsheetml/2006/main">
  <fonts count="2"><font><sz val="11"/><name val="Calibri"/></font><font><b/><sz val="11"/><name val="Calibri"/></font></fonts>
  <fills count="2"><fill><patternFill patternType="none"/></fill><fill><patternFill patternType="gray125"/></fill></fills>
  <borders count="1"><border><left/><right/><top/><bottom/><diagonal/></border></borders>
  <cellStyleXfs count="1"><xf numFmtId="0" fontId="0" fillId="0" borderId="0"/></cellStyleXfs>
  <cellXfs count="3">
    <xf numFmtId="0" fontId="0" fillId="0" borderId="0" xfId="0"/>
    <xf numFmtId="0" fontId="0" fillId="0" borderId="0" xfId="0" applyAlignment="1"><alignment vertical="top" wrapText="1"/></xf>
    <xf numFmtId="0" fontId="1" fillId="0" borderId="0" xfId="0" applyAlignment="1"><alignment vertical="top" wrapText="1"/></xf>
  </cellXfs>
  <cellStyles count="1"><cellStyle name="Normal" xfId="0" builtinId="0"/></cellStyles>
</styleSheet>''',
        "xl/worksheets/sheet1.xml": sheet_xml,
    }
    with ZipFile(path, "w", ZIP_DEFLATED) as workbook:
        for name, content in files.items():
            workbook.writestr(name, content)


EXPECTED_FIELDS = {
    "headline": ["Headline:", "Subheadline:", "Lời kêu gọi hành động:"],
    "description": ["Mô tả ngắn:", "Lợi ích chính:", "Đặc điểm nổi bật:", "Lời kêu gọi hành động:"],
    "social": ["Hook:", "Caption:", "Lời kêu gọi hành động:", "Hashtags:"],
    "email": ["Subject:", "Preview text:", "Lời chào:", "Nội dung chính:", "Lời kêu gọi hành động:"],
    "cta": ["Lời kêu gọi hành động chính:", "Microcopy:"],
}


def validate(clean_rows: list[list[str]]) -> list[str]:
    errors: list[str] = []
    if clean_rows[0] != HEADERS:
        errors.append(f"Header mismatch: {clean_rows[0]}")
    banned_input = [
        "temperature tham khảo",
        "modelmode",
        "fineTunedModelId".lower(),
        "templateid",
        "projectid",
        "maxoutputtokens",
        "giới hạn output tối đa",
    ]
    banned_output = ["Góc cần biết", "Tương tự phiên bản", "Như trên", "Bạn có thể dùng lại"]
    seen_outputs: dict[tuple[str, str], str] = {}
    whole_outputs: set[str] = set()

    for idx, row in enumerate(clean_rows[1:], start=2):
        data = dict(zip(HEADERS, row))
        if data["industry"] not in VALID_INDUSTRIES:
            errors.append(f"Row {idx}: invalid industry {data['industry']}")
        if data["tone"] not in VALID_TONES:
            errors.append(f"Row {idx}: invalid tone {data['tone']}")
        if data["type"] not in VALID_TYPES:
            errors.append(f"Row {idx}: invalid type {data['type']}")
        lowered_input = data["input"].lower()
        for token in banned_input:
            if token in lowered_input:
                errors.append(f"Row {idx}: banned input token {token}")
        for token in banned_output:
            if token in data["output"]:
                errors.append(f"Row {idx}: banned output phrase {token}")

        versions = re.findall(r"^Phiên bản (\d+):", data["output"], flags=re.MULTILINE)
        if versions != ["1", "2", "3"]:
            errors.append(f"Row {idx}: wrong versions {versions}")
        for field in EXPECTED_FIELDS.get(data["type"], []):
            if data["output"].count(field) != 3:
                errors.append(f"Row {idx}: field count mismatch for {field}")
        if data["type"] == "description" and data["output"].count("* ") < 18:
            errors.append(f"Row {idx}: description needs 6 bullets per version")
        if data["type"] == "social":
            for line in data["output"].splitlines():
                if line.startswith("Hashtags:"):
                    count = len(re.findall(r"#[\wÀ-ỹ]+", line))
                    if count < 3 or count > 6:
                        errors.append(f"Row {idx}: hashtag count {count}")

        key = (data["product"], data["type"])
        previous = seen_outputs.get(key)
        if previous == data["output"]:
            errors.append(f"Row {idx}: duplicate output for product/type {key}")
        seen_outputs[key] = data["output"]
        if data["output"] in whole_outputs:
            errors.append(f"Row {idx}: exact duplicate output")
        whole_outputs.add(data["output"])
    return errors


def main() -> None:
    source_rows = read_xlsx(SOURCE)
    if source_rows[0] != HEADERS:
        raise SystemExit(f"Unexpected headers: {source_rows[0]}")

    clean_rows = [HEADERS]
    for source_row in source_rows[1:]:
        row_data = dict(zip(HEADERS, source_row))
        meta = parse_metadata(row_data)
        clean_rows.append(
            [
                clean_input(meta),
                build_output(meta),
                str(meta["industry"]),
                str(meta["tone"]),
                str(meta["type"]),
                str(meta["product"]),
            ]
        )

    errors = validate(clean_rows)
    if errors:
        raise SystemExit("Validation failed before write:\n" + "\n".join(errors[:50]))

    write_xlsx(OUTPUT, clean_rows)
    reread = read_xlsx(OUTPUT)
    reread_errors = validate(reread)
    if reread_errors:
        raise SystemExit("Validation failed after write:\n" + "\n".join(reread_errors[:50]))

    print(f"Wrote {OUTPUT}")
    print(f"Rows: {len(reread) - 1}; Columns: {len(reread[0])}")
    print("Validation: OK")


if __name__ == "__main__":
    main()
