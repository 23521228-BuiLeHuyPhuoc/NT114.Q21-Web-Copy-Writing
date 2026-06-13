from __future__ import annotations

import argparse
import re
import tempfile
import zipfile
from pathlib import Path
from xml.etree import ElementTree as ET


SHEET_NS = 'http://schemas.openxmlformats.org/spreadsheetml/2006/main'
XML_NS = 'http://www.w3.org/XML/1998/namespace'
MC_NS = 'http://schemas.openxmlformats.org/markup-compatibility/2006'
X14AC_NS = 'http://schemas.microsoft.com/office/spreadsheetml/2009/9/ac'
XR_NS = 'http://schemas.microsoft.com/office/spreadsheetml/2014/revision'
XR2_NS = 'http://schemas.microsoft.com/office/spreadsheetml/2015/revision2'
XR3_NS = 'http://schemas.microsoft.com/office/spreadsheetml/2016/revision3'
NS = {'x': SHEET_NS}
IGNORABLE_PREFIX_URIS = {
    'x14ac': X14AC_NS,
    'xr': XR_NS,
    'xr2': XR2_NS,
    'xr3': XR3_NS,
}

ET.register_namespace('', SHEET_NS)
ET.register_namespace('mc', MC_NS)
ET.register_namespace('x14ac', X14AC_NS)
ET.register_namespace('xr', XR_NS)
ET.register_namespace('xr2', XR2_NS)
ET.register_namespace('xr3', XR3_NS)


def used_namespace_uris(root: ET.Element) -> set[str]:
    namespaces = set()
    for element in root.iter():
        names = [element.tag, *element.attrib]
        for name in names:
            if name.startswith('{'):
                namespaces.add(name[1:].split('}', 1)[0])
    return namespaces


def normalize_ignorable_prefixes(root: ET.Element) -> None:
    used_namespaces = used_namespace_uris(root)
    ignorable_attribute = f'{{{MC_NS}}}Ignorable'
    for element in root.iter():
        value = element.get(ignorable_attribute)
        if not value:
            continue

        kept_prefixes = [
            prefix for prefix in value.split()
            if IGNORABLE_PREFIX_URIS.get(prefix, '') in used_namespaces
        ]
        if kept_prefixes:
            element.set(ignorable_attribute, ' '.join(kept_prefixes))
        else:
            del element.attrib[ignorable_attribute]


PRODUCT_CONTEXT = {
    'bình giữ nhiệt thép 316': {
        'moment': 'buổi sáng bỏ bình vào túi, đi qua vài cuộc họp vẫn còn cảm giác yên tâm vì đồ uống được chuẩn bị từ nhà',
        'worry': 'ngại nước rò ra giấy tờ, laptop hoặc phải mất thời gian cọ rửa cuối ngày',
        'human': 'hợp với người muốn ly cà phê mang đi gọn gàng, không thành một việc phải canh chừng',
        'hint': 'nhắc khách kiểm tra dung tích và cách đóng nắp trước khi chọn',
        'hashtags': '#BinhGiuNhiet #CaPheDiLam #MuaSamThongMinh',
    },
    'đèn bàn LED chống chói': {
        'moment': 'góc bàn học khuya hoặc bàn làm việc tại nhà cần ánh sáng ổn định, không quá gắt',
        'worry': 'ngồi lâu dễ mỏi mắt nếu đèn quá chói hoặc không chỉnh được hướng sáng',
        'human': 'hợp với người cần một chiếc đèn dễ dùng mỗi tối, không phải setup phức tạp',
        'hint': 'nhắc khách cân nhắc diện tích bàn và thói quen đọc, viết, dùng laptop',
        'hashtags': '#DenBanLED #GocHocTap #LamViecTaiNha',
    },
    'bộ chăm sóc da tối giản': {
        'moment': 'buổi tối sau ngày dài, người mới skincare thường chỉ muốn vài bước rõ ràng và dễ duy trì',
        'worry': 'sợ mua quá nhiều món rồi không biết dùng theo thứ tự nào',
        'human': 'hợp với người muốn bắt đầu nhẹ nhàng, hiểu làn da trước khi thêm nhiều sản phẩm khác',
        'hint': 'nhắc khách thử từ tần suất phù hợp và đọc kỹ phản ứng của da',
        'hashtags': '#SkincareToiGian #ChamSocDa #NguoiMoiBatDau',
    },
    'máy xay sinh tố mini': {
        'moment': 'sáng bận rộn vẫn muốn chuẩn bị một ly đồ uống nhanh trước khi ra khỏi nhà',
        'worry': 'ngại máy cồng kềnh, rửa lâu hoặc phải lắp quá nhiều bộ phận',
        'human': 'hợp với người thích đồ uống tự chuẩn bị nhưng không có nhiều thời gian',
        'hint': 'nhắc khách cắt nhỏ nguyên liệu và xem kỹ hướng dẫn dùng an toàn',
        'hashtags': '#MayXayMini #SinhToNhanh #BepGon',
    },
    'ghế công thái học lưng lưới': {
        'moment': 'một ngày làm việc dài trước màn hình cần điểm tựa ổn định hơn cho lưng và vai',
        'worry': 'ngồi tạm trên ghế không phù hợp dễ khiến cơ thể mỏi sớm',
        'human': 'hợp với người làm việc tại bàn nhiều giờ và muốn nâng cấp góc làm việc một cách thực tế',
        'hint': 'nhắc khách hỏi thêm về chiều cao bàn, vóc dáng và cách chỉnh tay ghế',
        'hashtags': '#GheCongThaiHoc #GocLamViec #LamViecLau',
    },
    'nồi chiên không dầu dung tích 6 lít': {
        'moment': 'bữa tối gia đình cần món nhanh, ít phải canh bếp và dễ dọn sau khi ăn',
        'worry': 'ngại dầu bắn, khay khó rửa hoặc dung tích không đủ cho cả nhà',
        'human': 'hợp với gia đình muốn nấu gọn hơn mà vẫn có nhiều lựa chọn món quen',
        'hint': 'nhắc khách cân nhắc khẩu phần gia đình và cách vệ sinh khay',
        'hashtags': '#NoiChienKhongDau #BepGiaDinh #NauAnGon',
    },
    'balo laptop chống nước': {
        'moment': 'đi làm, đi học hoặc di chuyển qua cơn mưa bất chợt vẫn muốn đồ đạc được sắp xếp gọn',
        'worry': 'sợ laptop va đập nhẹ, giấy tờ ướt hoặc vai đau khi mang lâu',
        'human': 'hợp với người thường xuyên di chuyển và cần một chiếc balo nhìn chỉn chu',
        'hint': 'nhắc khách kiểm tra kích thước laptop và số ngăn cần dùng hằng ngày',
        'hashtags': '#BaloLaptop #DiLamMoiNgay #ChongNuoc',
    },
    'tai nghe không dây chống ồn': {
        'moment': 'quán cà phê, văn phòng mở hoặc chuyến xe đông người cần một khoảng tập trung riêng',
        'worry': 'ngại tiếng ồn chen vào cuộc gọi hoặc pin không đủ cho ngày dài',
        'human': 'hợp với người làm việc linh hoạt, cần nghe rõ và nói rõ hơn trong nhiều bối cảnh',
        'hint': 'nhắc khách cân nhắc thời lượng pin, micro và cảm giác đeo lâu',
        'hashtags': '#TaiNgheKhongDay #TapTrungLamViec #ChongOn',
    },
    'khóa cửa thông minh': {
        'moment': 'ra vào căn hộ nhiều lần trong ngày, có lúc cần gửi mã tạm cho người thân hoặc khách',
        'worry': 'sợ quên chìa, pin yếu hoặc khó kiểm soát người ra vào',
        'human': 'hợp với chủ căn hộ muốn tiện hơn nhưng vẫn cần hiểu rõ cách vận hành',
        'hint': 'nhắc khách hỏi kỹ loại cửa, phương án lắp đặt và cách xử lý khi pin yếu',
        'hashtags': '#KhoaCuaThongMinh #CanHoHienDai #AnTamRaVao',
    },
    'thảm yoga chống trượt': {
        'moment': 'buổi tập tại nhà cần một mặt thảm ổn định để giữ nhịp thở và tư thế',
        'worry': 'sàn trơn hoặc thảm quá mỏng làm buổi tập mất tập trung',
        'human': 'hợp với người muốn duy trì thói quen vận động nhẹ nhàng tại nhà',
        'hint': 'nhắc khách chọn độ dày, bề mặt bám và cách vệ sinh sau buổi tập',
        'hashtags': '#ThamYoga #TapTaiNha #SongKhoeMoiNgay',
    },
    'máy lọc không khí phòng ngủ': {
        'moment': 'phòng ngủ cần không gian yên tĩnh hơn, nhất là khi gia đình có trẻ nhỏ',
        'worry': 'ngại tiếng máy, chọn sai diện tích phòng hoặc không biết khi nào cần thay lọc',
        'human': 'hợp với gia đình muốn chăm chút chất lượng không gian ngủ một cách vừa phải',
        'hint': 'nhắc khách hỏi diện tích phòng, chế độ ngủ và lịch bảo trì màng lọc',
        'hashtags': '#MayLocKhongKhi #PhongNguYenTinh #GiaDinhCoTreNho',
    },
    'ví da mini nhiều ngăn': {
        'moment': 'ra ngoài gọn nhẹ, chỉ cần thẻ, ít tiền mặt và vài món nhỏ dễ lấy',
        'worry': 'ngại ví dày cộm, khó tìm thẻ hoặc phụ kiện nhìn không đủ chỉn chu',
        'human': 'hợp với người thích phụ kiện nhỏ nhưng vẫn muốn mọi thứ có chỗ riêng',
        'hint': 'nhắc khách cân nhắc số thẻ hay mang và nhu cầu khắc tên',
        'hashtags': '#ViDaMini #PhuKienGonGang #KhacTenTheoYeuCau',
    },
}

TONE_COPY = {
    'urgent': {
        'voice': 'khẩn vừa đủ, nhắc hành động hôm nay nhưng không tạo áp lực giả',
        'opening': 'Nếu đang định mua thì đây là lúc nên xem kỹ, vì ưu đãi chỉ có ý nghĩa khi sản phẩm thật sự hợp nhu cầu.',
        'cta': 'Xem mẫu đang phù hợp và nhắn shop kiểm tra trước khi chốt.',
    },
    'friendly': {
        'voice': 'thân thiện như một người bán hàng có tâm đang giải thích chậm rãi',
        'opening': 'Có những món không cần nói quá nhiều, chỉ cần giải thích đúng cảnh dùng là khách tự thấy có hợp hay không.',
        'cta': 'Nhắn shop mô tả nhu cầu của bạn, tụi mình gợi ý mẫu phù hợp hơn.',
    },
    'professional': {
        'voice': 'chuyên nghiệp, rõ tiêu chí chọn và tách lợi ích khỏi thông tin cần kiểm chứng',
        'opening': 'Một lựa chọn tốt nên được nhìn bằng nhu cầu sử dụng, đặc điểm chính và điều kiện mua đi kèm.',
        'cta': 'Xem thông tin chi tiết rồi quyết định theo đúng nhu cầu sử dụng.',
    },
    'emotional': {
        'voice': 'cảm xúc nhẹ, chạm vào phiền toái đời thường nhưng không bi lụy',
        'opening': 'Đôi khi thứ khiến mình muốn mua không phải lời quảng cáo lớn, mà là cảm giác một việc nhỏ trong ngày được nhẹ đi.',
        'cta': 'Lưu lại để cân nhắc khi bạn muốn chăm chút hơn cho thói quen hằng ngày.',
    },
}

TYPE_LABEL = {
    'headline': 'Tiêu Đề Quảng Cáo',
    'description': 'Mô Tả Sản Phẩm',
    'social': 'Social Media Post',
    'email': 'Email Marketing',
    'cta': 'Lời Kêu Gọi Hành Động',
}


def norm_space(value: str) -> str:
    return re.sub(r'\s+', ' ', value or '').strip()


def extract_field(text: str, label: str) -> str:
    match = re.search(rf'{re.escape(label)}:\s*(.+?)(?:\n|$)', text)
    if not match:
        return ''
    return match.group(1).strip().rstrip('.')


def feature_phrase(features: list[str]) -> str:
    items = [item.strip() for item in features if item.strip()]
    if not items:
        return 'các điểm chính trong brief'
    if len(items) == 1:
        return items[0]
    return ', '.join(items[:-1]) + ' và ' + items[-1]


def feature_bullets(features: list[str], prefix: str = '-') -> str:
    labels = ['Điểm dùng được ngay', 'Lý do đáng cân nhắc', 'Chi tiết hỗ trợ quyết định']
    lines = []
    for index, feature in enumerate(features[:3]):
        label = labels[index] if index < len(labels) else 'Chi tiết'
        lines.append(f'{prefix} {label}: {feature}.')
    return '\n'.join(lines)


def parse_row(row: dict[str, str]) -> dict[str, object]:
    text = row.get('A', '')
    product = row.get('F') or extract_field(text, 'Sản phẩm/dịch vụ')
    features = [part.strip() for part in extract_field(text, 'Từ khóa chính').split(';') if part.strip()]
    return {
        'input': text,
        'industry': row.get('C', 'ecommerce'),
        'tone': row.get('D', 'friendly'),
        'type': row.get('E', 'description'),
        'product': product,
        'features': features,
        'audience': extract_field(text, 'Đối tượng mục tiêu') or 'khách hàng đang cân nhắc mua sắm online',
        'offer': extract_field(text, 'Thông tin bổ sung') or 'liên hệ shop để biết thêm thông tin',
    }


def context_for(product: str) -> dict[str, str]:
    return PRODUCT_CONTEXT.get(product, {
        'moment': 'một tình huống mua sắm đời thường, nơi khách cần thông tin rõ hơn là lời quảng cáo quá mạnh',
        'worry': 'khách muốn biết sản phẩm có thật sự hợp nhu cầu trước khi quyết định',
        'human': 'hợp với người thích lựa chọn vừa đủ, thực tế và dễ hiểu',
        'hint': 'nhắc khách hỏi thêm shop nếu còn điểm chưa chắc',
        'hashtags': '#MuaSamThongMinh #ThuongMaiDienTu #TuVanThat',
    })


def build_headline(meta: dict[str, object]) -> str:
    product = meta['product']
    audience = meta['audience']
    features = meta['features']
    offer = meta['offer']
    tone = TONE_COPY.get(meta['tone'], TONE_COPY['friendly'])
    ctx = context_for(product)
    feat = feature_phrase(features)
    first = features[0] if features else 'đúng nhu cầu'
    second = features[1] if len(features) > 1 else feat
    third = features[2] if len(features) > 2 else feat
    return f'''Phiên bản 1:
Headline: {product} cho {audience}: gọn hơn trong đúng khoảnh khắc cần {first}.
Subheadline: Khi {ctx['moment']}, điều khách cần không phải lời hứa lớn mà là cảm giác chọn đúng. Sản phẩm được giới thiệu xoay quanh {feat}, kèm {offer} để bạn có thêm lý do cân nhắc.
Góc cần biết: Giọng viết {tone['voice']}; không thêm chứng nhận, không tự bịa hiệu quả ngoài brief.
Lời kêu gọi hành động: {tone['cta']}

Phiên bản 2:
Headline: Đỡ phải phân vân lâu khi chọn {product} cho {audience}.
Subheadline: Điểm đáng xem là {second} và {third}; phần còn lại nên được quyết định theo thói quen dùng thật của bạn. {customer_hint(ctx)}.
Góc cần biết: {ctx['worry'].capitalize()}, nên nội dung ưu tiên giải thích rõ thay vì thúc ép mua nhanh.
Lời kêu gọi hành động: Nhắn shop hỏi thêm nếu bạn muốn so sánh trước khi mua.

Phiên bản 3:
Headline: Một lựa chọn {product} dễ hiểu cho người muốn mua chắc tay hơn.
Subheadline: {ctx['human'].capitalize()}. Nội dung tập trung vào {feat} và ưu đãi {offer}, không dùng kiểu nói quá đà.
Góc cần biết: Nếu chi tiết nào chưa khớp nhu cầu, hãy hỏi lại shop trước khi chốt.
Lời kêu gọi hành động: Lưu lại hoặc mở trang sản phẩm để xem kỹ hơn.'''


def build_description(meta: dict[str, object]) -> str:
    product = meta['product']
    audience = meta['audience']
    features = meta['features']
    offer = meta['offer']
    tone = TONE_COPY.get(meta['tone'], TONE_COPY['friendly'])
    ctx = context_for(product)
    feat = feature_phrase(features)
    bullets = feature_bullets(features)
    return f'''Phiên bản 1:
Mô tả ngắn: {tone['opening']} Với {product}, phần đáng chú ý nằm ở cách sản phẩm đi vào một tình huống rất cụ thể: {ctx['moment']}.
Lợi ích chính:
{bullets}
- Phù hợp hơn với {audience} vì nội dung nói thẳng vào nhu cầu sử dụng, không cố làm sản phẩm nghe lớn hơn thực tế.
Đặc điểm nổi bật:
- {feat}.
- Ưu đãi/ghi chú đi kèm: {offer}.
Góc cần biết: {customer_hint(ctx)}; nếu còn điểm chưa chắc, nên hỏi shop trước.
Lời kêu gọi hành động: {tone['cta']}

Phiên bản 2:
Mô tả ngắn: Nếu bạn từng ngại vì {ctx['worry']}, {product} là một lựa chọn đáng xem trong nhóm sản phẩm này. Cách giới thiệu nên đi từ trải nghiệm thật, sau đó mới nói đến ưu đãi.
Lợi ích chính:
- Giúp khách hình dung sản phẩm trong sinh hoạt hằng ngày thay vì chỉ đọc một danh sách tính năng.
- Làm rõ các điểm {feat}, đủ để so sánh nhanh với nhu cầu cá nhân.
- Giữ lời văn có người nói, có nhịp nghỉ, không ép khách phải mua ngay.
Đặc điểm nổi bật:
{bullets}
Góc cần biết: Không tự thêm số liệu, chứng nhận hoặc cam kết ngoài brief.
Lời kêu gọi hành động: Xem kỹ thông tin sản phẩm rồi chọn khi bạn thấy thật sự hợp.

Phiên bản 3:
Mô tả ngắn: {product} dành cho {audience} muốn một lựa chọn rõ ràng, vừa đủ thông tin và dễ hỏi thêm trước khi quyết định.
Lợi ích chính:
- {ctx['human'].capitalize()}.
- Các điểm {feat} được đặt trong ngữ cảnh dùng thật, nên nội dung bớt khô và dễ tin hơn.
- {offer.capitalize()} là phần cộng thêm, không phải lý do duy nhất để mua.
Đặc điểm nổi bật:
{bullets}
Góc cần biết: Chọn sản phẩm khi nó giải quyết đúng việc bạn đang cần, không vì câu chữ làm bạn thấy vội.
Lời kêu gọi hành động: Nhắn shop mô tả thói quen dùng, shop sẽ gợi ý kỹ hơn.'''


def build_social(meta: dict[str, object]) -> str:
    product = meta['product']
    audience = meta['audience']
    features = meta['features']
    offer = meta['offer']
    tone = TONE_COPY.get(meta['tone'], TONE_COPY['friendly'])
    ctx = context_for(product)
    feat = feature_phrase(features)
    return f'''Phiên bản 1:
Hook: Có những món mua về không cần gây ồn ào, chỉ cần đúng việc mình đang cần mỗi ngày.
Caption: {product} hợp với {audience} khi bạn muốn giải quyết một chuyện rất đời thường: {ctx['moment']}. Điểm mình thích ở cách chọn này là nó có {feat}, nên khách có cơ sở để cân nhắc thay vì chỉ bị kéo bởi một câu quảng cáo mạnh.
Góc cần biết: {customer_hint(ctx)}. {offer.capitalize()} là thông tin đáng xem thêm, nhưng vẫn nên chọn theo nhu cầu thật.
Lời kêu gọi hành động: {tone['cta']}
Hashtags: {ctx['hashtags']}

Phiên bản 2:
Hook: Nếu bạn từng thấy phiền vì {ctx['worry']}, lưu lại gợi ý này.
Caption: {product} không cần được nói như một món thay đổi mọi thứ. Chỉ cần nói đúng: sản phẩm có {feat}, dành cho {audience}, và phù hợp hơn khi bạn muốn một lựa chọn rõ ràng, dễ hỏi thêm, dễ so sánh. Giọng viết nên như người thật đang tư vấn: có lý do, có giới hạn, có lời nhắc kiểm tra trước khi mua.
Góc cần biết: Không thêm số liệu hay lời cam kết ngoài brief.
Lời kêu gọi hành động: Nhắn shop nếu bạn muốn hỏi kỹ hơn về trường hợp sử dụng của mình.
Hashtags: {ctx['hashtags']}

Phiên bản 3:
Hook: Mua sắm dễ chịu hơn khi mình hiểu vì sao món đó hợp với mình.
Caption: Với {product}, hãy nhìn vào {feat}. Nếu bạn là {audience}, những chi tiết này có thể giúp quyết định nhẹ hơn trong bối cảnh {ctx['moment']}. Hiện có {offer}, nhưng Hạt Mộc vẫn muốn bạn chọn chậm một nhịp: đúng nhu cầu thì mua, chưa chắc thì hỏi thêm.
Góc cần biết: Nội dung giữ nhịp {tone['voice']}.
Lời kêu gọi hành động: Bình luận hoặc nhắn shop nhu cầu của bạn để được tư vấn cụ thể hơn.
Hashtags: {ctx['hashtags']}'''


def build_email(meta: dict[str, object]) -> str:
    product = meta['product']
    audience = meta['audience']
    features = meta['features']
    offer = meta['offer']
    tone = TONE_COPY.get(meta['tone'], TONE_COPY['friendly'])
    ctx = context_for(product)
    feat = feature_phrase(features)
    bullets = feature_bullets(features, prefix='•')
    return f'''Phiên bản 1:
Subject: Một gợi ý {product} đáng xem cho nhu cầu hiện tại
Preview text: Viết ngắn, rõ và đủ thật để bạn cân nhắc trước khi mua.
Lời chào: Chào bạn,
Nội dung chính: Nếu bạn là {audience}, có thể bạn không cần thêm một lời quảng cáo quá mạnh. Bạn cần biết sản phẩm này có hợp với cách mình dùng hay không. {product} được đặt trong bối cảnh {ctx['moment']} và tập trung vào {feat}.
{bullets}
Góc cần biết: {customer_hint(ctx)}. {offer.capitalize()} là thông tin đi kèm để bạn xem thêm, không phải lời thúc ép.
Lời kêu gọi hành động: {tone['cta']}

Phiên bản 2:
Subject: Trước khi chọn {product}, xem nhanh các điểm đáng cân nhắc
Preview text: Một email tư vấn theo nhu cầu thật, không phóng đại công dụng.
Lời chào: Chào bạn,
Nội dung chính: Nhiều khách phân vân vì {ctx['worry']}. Vì vậy, cách giới thiệu {product} nên bắt đầu từ điều bạn đang cần giải quyết, rồi mới đến tính năng.
{bullets}
Ưu đãi/ghi chú: {offer}.
Góc cần biết: Nội dung này chỉ dùng thông tin trong brief; nếu cần thông số chi tiết hơn, hãy hỏi shop trước khi đặt.
Lời kêu gọi hành động: Trả lời email hoặc nhắn shop để được tư vấn theo trường hợp của bạn.

Phiên bản 3:
Subject: {product} có thể hợp nếu bạn muốn một lựa chọn rõ ràng hơn
Preview text: Không cần quyết định vội; chỉ cần có đủ thông tin đúng.
Lời chào: Chào bạn,
Nội dung chính: {tone['opening']} Với {product}, điểm nên xem là {feat}. Sản phẩm hướng đến {audience}, đặc biệt trong những lúc {ctx['moment']}.
{bullets}
Góc cần biết: {ctx['human'].capitalize()}. Hãy chọn khi bạn thấy đúng nhu cầu, không chỉ vì ưu đãi {offer}.
Lời kêu gọi hành động: Mở trang sản phẩm để xem kỹ hoặc nhắn shop hỏi thêm.'''


def build_cta(meta: dict[str, object]) -> str:
    product = meta['product']
    audience = meta['audience']
    features = meta['features']
    offer = meta['offer']
    tone = TONE_COPY.get(meta['tone'], TONE_COPY['friendly'])
    ctx = context_for(product)
    feat = feature_phrase(features)
    return f'''Phiên bản 1:
Lời kêu gọi hành động chính: Xem {product} có hợp với cách bạn dùng không
Microcopy: Dành cho {audience}, tập trung vào {feat}. {offer.capitalize()} nếu bạn muốn cân nhắc thêm.
Gợi ý đặt dưới nút: Chọn khi đúng nhu cầu; chưa chắc thì nhắn shop hỏi trước.

Phiên bản 2:
Lời kêu gọi hành động chính: Nhắn shop tư vấn {product} theo nhu cầu của bạn
Microcopy: Kể nhanh bối cảnh dùng của bạn, ví dụ {ctx['moment']}, shop sẽ gợi ý kỹ hơn.
Gợi ý đặt dưới nút: Không cần quyết định vội nếu bạn còn phân vân.

Phiên bản 3:
Lời kêu gọi hành động chính: Lưu {product} để so sánh trước khi mua
Microcopy: Sản phẩm có {feat}; phù hợp hơn khi bạn muốn giải quyết chuyện {ctx['worry']}.
Gợi ý đặt dưới nút: Giọng CTA {tone['voice']}, khuyến khích chọn đúng thay vì mua nhanh.'''


def customer_hint(ctx: dict[str, str]) -> str:
    value = str(ctx.get('hint') or '').strip()
    lowered = value.lower()
    if lowered.startswith('nhắc khách '):
        value = 'Bạn nên ' + value[len('nhắc khách '):]
    elif lowered.startswith('nhac khach '):
        value = 'Ban nen ' + value[len('nhac khach '):]
    return value[:1].upper() + value[1:] if value else 'Bạn nên hỏi thêm shop nếu còn điểm chưa chắc.'


def final_headline(meta: dict[str, object]) -> str:
    product = meta['product']
    audience = meta['audience']
    features = meta['features']
    offer = meta['offer']
    ctx = context_for(product)
    first = features[0] if features else 'dung nhu cau'
    second = features[1] if len(features) > 1 else first
    third = features[2] if len(features) > 2 else second
    feat = feature_phrase(features)
    return f'''Phiên bản 1:
Headline: {product}: gọn hơn cho những lúc {first} thật sự quan trọng.
Subheadline: Dành cho {audience}, nhất là khi {ctx['moment']}. Điểm đáng xem là {feat}; đủ rõ để bạn cân nhắc mà không cần một lời hứa quá tay.
Góc cần biết: {customer_hint(ctx)}.
Lời kêu gọi hành động: Nhắn shop hỏi mẫu phù hợp trước khi chốt.

Phiên bản 2:
Headline: Bớt một nỗi lo nhỏ mỗi ngày với {product}.
Subheadline: Nếu bạn từng ngại chuyện {ctx['worry']}, hãy bắt đầu từ ba điểm: {first}, {second} và {third}. Ưu đãi hiện có: {offer}.
Góc cần biết: Chọn theo thói quen dùng thật sẽ dễ hài lòng hơn chọn vì một câu quảng cáo hay.
Lời kêu gọi hành động: Xem chi tiết sản phẩm rồi lưu lại để so sánh.

Phiên bản 3:
Headline: Một lựa chọn {product} vừa đủ thực tế cho {audience}.
Subheadline: {ctx['human'].capitalize()}. Sản phẩm phù hợp khi bạn muốn thông tin rõ, lợi ích cụ thể và một lời nhắc mua hàng nhẹ nhàng.
Góc cần biết: {offer.capitalize()} là điểm cộng thêm, không phải lý do duy nhất để quyết định.
Lời kêu gọi hành động: Hỏi shop nếu bạn muốn kiểm tra kỹ trước khi mua.'''


def final_description(meta: dict[str, object]) -> str:
    product = meta['product']
    audience = meta['audience']
    features = meta['features']
    offer = meta['offer']
    ctx = context_for(product)
    feat = feature_phrase(features)
    first = features[0] if features else 'dễ dùng'
    second = features[1] if len(features) > 1 else first
    third = features[2] if len(features) > 2 else second
    return f'''Phiên bản 1:
Mô tả ngắn: Có những món không cần làm cuộc sống thay đổi hẳn, chỉ cần làm một việc nhỏ trở nên nhẹ hơn. {product} dành cho {audience} trong những lúc {ctx['moment']}.
Lợi ích chính:
- Giúp bạn yên tâm hơn với nhu cầu {first} mà không phải đọc quá nhiều thông tin rối.
- {second.capitalize()} là điểm cộng rõ ràng khi dùng hằng ngày.
- {third.capitalize()} giúp sản phẩm dễ được đưa vào thói quen hiện có.
Đặc điểm nổi bật:
- {feat}.
- Thông tin đi kèm: {offer}.
Góc cần biết: {customer_hint(ctx)}.
Lời kêu gọi hành động: Nhắn shop mô tả nhu cầu của bạn để được gợi ý mẫu phù hợp.

Phiên bản 2:
Mô tả ngắn: Nếu bạn từng phân vân vì {ctx['worry']}, {product} là một lựa chọn đáng xem. Cách sản phẩm thuyết phục không nằm ở lời nói lớn, mà ở những chi tiết đủ dùng: {feat}.
Lợi ích chính:
- Phù hợp với {audience} muốn mua chắc tay hơn.
- Dễ so sánh vì các điểm chính được nói thẳng vào nhu cầu dùng thật.
- Ưu đãi {offer} giúp bạn có thêm lý do cân nhắc nếu sản phẩm đã đúng nhu cầu.
Đặc điểm nổi bật:
- {first}.
- {second}.
- {third}.
Góc cần biết: Nên chọn khi sản phẩm giải quyết đúng việc bạn đang cần, không chỉ vì đang có ưu đãi.
Lời kêu gọi hành động: Xem chi tiết và hỏi shop trước nếu còn điểm chưa chắc.

Phiên bản 3:
Mô tả ngắn: {product} hợp với người thích một lựa chọn rõ ràng, không phô trương và dễ đưa vào sinh hoạt mỗi ngày.
Lợi ích chính:
- {ctx['human'].capitalize()}.
- Giảm cảm giác phải đoán mò khi mua online nhờ các thông tin {feat}.
- Tạo cảm giác được tư vấn thay vì bị thúc ép.
Đặc điểm nổi bật:
- Điểm chính dễ kiểm tra: {feat}.
- Ghi chú thêm để cân nhắc: {offer}.
Góc cần biết: Mua đúng nhu cầu sẽ dễ dùng lâu hơn mua vì thấy vội.
Lời kêu gọi hành động: Lưu lại để so sánh hoặc nhắn shop hỏi thêm.'''


def final_social(meta: dict[str, object]) -> str:
    product = meta['product']
    audience = meta['audience']
    features = meta['features']
    offer = meta['offer']
    tone = meta['tone']
    ctx = context_for(product)
    feat = feature_phrase(features)
    if tone == 'urgent':
        hook_1 = 'Đang cân nhắc thì nên xem kỹ hôm nay, nhưng không cần mua vội.'
        hook_2 = 'Ưu đãi chỉ đáng giữ lại khi sản phẩm thật sự hợp với cách bạn dùng.'
    else:
        hook_1 = 'Một món nhỏ, nhưng dùng đúng lúc thì thấy ngày nhẹ hơn một chút.'
        hook_2 = 'Mua sắm dễ chịu hơn khi thông tin đủ rõ và không bị thúc ép.'
    return f'''Phiên bản 1:
Hook: {hook_1}
Caption: {product} dành cho {audience} trong những lúc {ctx['moment']}. Mình sẽ nhìn vào {feat} trước, rồi mới xét đến ưu đãi {offer}. Vậy mới biết đây là món hợp thật hay chỉ là món nghe có vẻ hay.
Góc cần biết: {customer_hint(ctx)}.
Lời kêu gọi hành động: Nhắn shop nếu bạn muốn được gợi ý theo nhu cầu riêng.
Hashtags: {ctx['hashtags']}

Phiên bản 2:
Hook: {hook_2}
Caption: Nếu bạn từng gặp chuyện {ctx['worry']}, {product} là một lựa chọn đáng để lưu lại. Sản phẩm có {feat}, vừa đủ để bạn so sánh nhanh mà không cần đọc quá nhiều lời quảng cáo.
Góc cần biết: {offer.capitalize()} là điểm cộng thêm khi sản phẩm đã phù hợp.
Lời kêu gọi hành động: Lưu bài này lại để xem lại trước khi chọn.
Hashtags: {ctx['hashtags']}

Phiên bản 3:
Hook: Có những quyết định mua hàng nên chậm lại một nhịp để chọn đúng hơn.
Caption: Với {product}, hãy bắt đầu từ nhu cầu của {audience}: cần gì, dùng lúc nào, có vướng điểm nào không. Nếu các điểm {feat} khớp với thói quen của bạn, sản phẩm này đáng được cân nhắc.
Góc cần biết: {ctx['human'].capitalize()}.
Lời kêu gọi hành động: Bình luận nhu cầu hoặc nhắn shop để được tư vấn cụ thể hơn.
Hashtags: {ctx['hashtags']}'''


def final_email(meta: dict[str, object]) -> str:
    product = meta['product']
    audience = meta['audience']
    features = meta['features']
    offer = meta['offer']
    ctx = context_for(product)
    feat = feature_phrase(features)
    first = features[0] if features else 'dễ dùng'
    second = features[1] if len(features) > 1 else first
    third = features[2] if len(features) > 2 else second
    return f'''Phiên bản 1:
Subject: Gợi ý {product} cho nhu cầu dùng hằng ngày
Preview text: Một vài điểm đáng xem trước khi bạn quyết định.
Lời chào: Chào bạn,
Nội dung chính: Nếu bạn là {audience}, có lẽ điều bạn cần không phải một lời giới thiệu quá mạnh. Bạn cần biết {product} có hợp với bối cảnh {ctx['moment']} hay không.

Sản phẩm này đáng xem nhờ {feat}. Trong đó, {first} giúp xử lý nhu cầu chính; {second} và {third} làm trải nghiệm dùng trọn vẹn hơn.

Góc cần biết: {customer_hint(ctx)}. Hiện có {offer}, bạn có thể xem như một điểm cộng nếu sản phẩm đã đúng nhu cầu.
Lời kêu gọi hành động: Mở chi tiết sản phẩm hoặc nhắn shop để được tư vấn kỹ hơn.

Phiên bản 2:
Subject: Trước khi mua {product}, bạn có thể xem nhanh điểm này
Preview text: Chọn chắc hơn khi biết sản phẩm giải quyết đúng việc gì.
Lời chào: Chào bạn,
Nội dung chính: Nhiều người phân vân vì {ctx['worry']}. Vì vậy, với {product}, hãy nhìn vào nhu cầu thật trước: bạn cần {first}, muốn {second}, hay quan tâm nhiều hơn đến {third}?

Nếu câu trả lời khớp với cách bạn dùng hằng ngày, đây là lựa chọn đáng cân nhắc. Nếu chưa chắc, bạn có thể hỏi shop trước khi đặt.

Góc cần biết: {offer.capitalize()} đang đi kèm, nhưng quyết định cuối cùng vẫn nên dựa trên mức độ phù hợp.
Lời kêu gọi hành động: Trả lời tin nhắn này với nhu cầu của bạn, shop sẽ gợi ý cụ thể hơn.

Phiên bản 3:
Subject: {product} có thể là món bạn đang tìm
Preview text: Rõ lợi ích, rõ tình huống dùng, không cần quyết định vội.
Lời chào: Chào bạn,
Nội dung chính: {ctx['human'].capitalize()}. {product} tập trung vào {feat}, phù hợp với {audience} khi muốn một lựa chọn thực tế hơn cho sinh hoạt hằng ngày.

Bạn có thể cân nhắc sản phẩm này nếu đang cần giải quyết chuyện {ctx['worry']}. Còn nếu muốn chắc hơn, hãy hỏi shop về tình huống dùng của bạn.

Góc cần biết: {customer_hint(ctx)}.
Lời kêu gọi hành động: Xem chi tiết hoặc nhắn shop trước khi chốt đơn.'''


def final_cta(meta: dict[str, object]) -> str:
    product = meta['product']
    audience = meta['audience']
    features = meta['features']
    offer = meta['offer']
    ctx = context_for(product)
    feat = feature_phrase(features)
    return f'''Phiên bản 1:
Lời kêu gọi hành động chính: Xem {product} có hợp với bạn không
Microcopy: Dành cho {audience}, nổi bật với {feat}. Có {offer} nếu bạn muốn cân nhắc thêm.

Phiên bản 2:
Lời kêu gọi hành động chính: Nhắn shop để chọn {product} đúng nhu cầu
Microcopy: Kể nhanh bạn dùng trong bối cảnh nào, shop sẽ gợi ý theo tình huống thật như {ctx['moment']}.

Phiên bản 3:
Lời kêu gọi hành động chính: Lưu {product} để so sánh trước khi mua
Microcopy: Phù hợp hơn khi bạn muốn giải quyết chuyện {ctx['worry']} mà vẫn cần một lựa chọn rõ ràng, dễ hỏi thêm.'''


BUILDERS = {
    'headline': final_headline,
    'description': final_description,
    'social': final_social,
    'email': final_email,
    'cta': final_cta,
}


def read_shared_strings(zip_file: zipfile.ZipFile) -> list[str]:
    root = ET.fromstring(zip_file.read('xl/sharedStrings.xml'))
    strings = []
    for item in root.findall('x:si', NS):
        strings.append(''.join(node.text or '' for node in item.findall('.//x:t', NS)))
    return strings


def column_from_ref(cell_ref: str) -> str:
    return re.sub(r'\d+', '', cell_ref or '')


def rows_from_sheet(zip_file: zipfile.ZipFile) -> tuple[ET.ElementTree, list[dict[str, str]]]:
    shared_strings = read_shared_strings(zip_file)
    tree = ET.ElementTree(ET.fromstring(zip_file.read('xl/worksheets/sheet1.xml')))
    rows = []
    for row in tree.getroot().findall('.//x:sheetData/x:row', NS):
        values = {}
        for cell in row.findall('x:c', NS):
            value_node = cell.find('x:v', NS)
            value = ''
            if value_node is not None and value_node.text is not None:
                value = shared_strings[int(value_node.text)] if cell.get('t') == 's' else value_node.text
            values[column_from_ref(cell.get('r'))] = value
        rows.append(values)
    return tree, rows


def add_shared_string(root: ET.Element, value: str) -> int:
    index = len(root.findall('x:si', NS))
    si = ET.SubElement(root, f'{{{SHEET_NS}}}si')
    t = ET.SubElement(si, f'{{{SHEET_NS}}}t')
    t.set(f'{{{XML_NS}}}space', 'preserve')
    t.text = value or ''
    return index


def update_cell(cell: ET.Element, value: str, shared_root: ET.Element) -> None:
    cell.set('t', 's')
    for child in list(cell):
        cell.remove(child)
    value_node = ET.SubElement(cell, f'{{{SHEET_NS}}}v')
    value_node.text = str(add_shared_string(shared_root, value))


def enrich_rows(rows: list[dict[str, str]]) -> list[dict[str, str]]:
    enriched = [rows[0]]
    for row in rows[1:]:
        meta = parse_row(row)
        builder = BUILDERS.get(meta['type'], build_description)
        next_row = dict(row)
        next_row['B'] = builder(meta)
        enriched.append(next_row)
    return enriched


def write_enriched_workbook(source: Path, destination: Path) -> dict[str, int]:
    with zipfile.ZipFile(source, 'r') as zin:
        sheet_tree, rows = rows_from_sheet(zin)
        enriched = enrich_rows(rows)
        shared_root = ET.Element(f'{{{SHEET_NS}}}sst')

        sheet_rows = sheet_tree.getroot().findall('.//x:sheetData/x:row', NS)
        for row_index, row_element in enumerate(sheet_rows):
            row_values = enriched[row_index]
            for cell in row_element.findall('x:c', NS):
                column = column_from_ref(cell.get('r'))
                update_cell(cell, row_values.get(column, ''), shared_root)

        shared_root.set('count', str(len(shared_root.findall('x:si', NS))))
        shared_root.set('uniqueCount', str(len(shared_root.findall('x:si', NS))))
        normalize_ignorable_prefixes(sheet_tree.getroot())
        shared_xml = ET.tostring(shared_root, encoding='utf-8', xml_declaration=True)
        sheet_xml = ET.tostring(sheet_tree.getroot(), encoding='utf-8', xml_declaration=True)

        with tempfile.NamedTemporaryFile(delete=False, suffix='.xlsx', dir=destination.parent) as temp_file:
            temp_path = Path(temp_file.name)

        try:
            with zipfile.ZipFile(temp_path, 'w', compression=zipfile.ZIP_DEFLATED) as zout:
                for entry in zin.infolist():
                    if entry.filename == 'xl/sharedStrings.xml':
                        zout.writestr(entry, shared_xml)
                    elif entry.filename == 'xl/worksheets/sheet1.xml':
                        zout.writestr(entry, sheet_xml)
                    else:
                        zout.writestr(entry, zin.read(entry.filename))
            destination.parent.mkdir(parents=True, exist_ok=True)
            temp_path.replace(destination)
        finally:
            if temp_path.exists():
                temp_path.unlink()

    before_chars = sum(len(row.get('B', '')) for row in rows[1:])
    after_chars = sum(len(row.get('B', '')) for row in enriched[1:])
    return {
        'examples': len(enriched) - 1,
        'before_avg_output_chars': round(before_chars / max(1, len(rows) - 1)),
        'after_avg_output_chars': round(after_chars / max(1, len(enriched) - 1)),
    }


def main() -> None:
    parser = argparse.ArgumentParser()
    parser.add_argument('source', type=Path)
    parser.add_argument('destination', type=Path)
    args = parser.parse_args()
    stats = write_enriched_workbook(args.source, args.destination)
    print(stats)


if __name__ == '__main__':
    main()
