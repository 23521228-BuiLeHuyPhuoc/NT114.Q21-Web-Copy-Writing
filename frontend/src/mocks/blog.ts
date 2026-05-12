export interface BlogPost {
  id: number;
  slug: string;
  cat: string;
  catLabel: string;
  title: string;
  excerpt: string;
  author: string;
  authorRole: string;
  date: string;
  readTime: string;
  img: string;
  featured?: boolean;
  content: {
    lead: string;
    sections: {
      heading: string;
      body: string[];
    }[];
  };
}

export const BLOG_CATEGORIES = [
  { label: 'Tất cả', id: 'all' },
  { label: 'Hướng dẫn AI', id: 'ai' },
  { label: 'Copywriting', id: 'copy' },
  { label: 'Marketing', id: 'marketing' },
  { label: 'Case Study', id: 'case' },
  { label: 'Tin tức', id: 'news' },
];

export const BLOG_POSTS: BlogPost[] = [
  {
    id: 1,
    slug: 'gpt-4o-vs-llama-31-copywriting-viet-nam',
    cat: 'ai',
    catLabel: 'Hướng dẫn AI',
    title: 'GPT-4o vs Llama 3.1: Model nào phù hợp cho copywriting Việt Nam?',
    excerpt: 'Phân tích điểm mạnh, điểm yếu và tình huống sử dụng phù hợp nhất của từng model AI cho copywriter Việt Nam.',
    author: 'Lê Thu Hằng',
    authorRole: 'CTO CopyPro',
    date: '22/03/2026',
    readTime: '8 phút đọc',
    img: 'https://images.unsplash.com/photo-1562577308-9e66f0c65ce5?crop=entropy&cs=tinysrgb&fit=max&fm=jpg&w=1200',
    featured: true,
    content: {
      lead: 'Không có một model tốt nhất cho mọi loại nội dung. Chọn đúng model phụ thuộc vào mục tiêu chiến dịch, độ phức tạp của brief và yêu cầu bảo mật dữ liệu.',
      sections: [
        {
          heading: 'GPT-4o phù hợp khi cần chất lượng và suy luận tốt',
          body: [
            'GPT-4o xử lý brief dài, yêu cầu nhiều ràng buộc và các chiến dịch cần nhiều lớp thông điệp tốt hơn. Đây là lựa chọn phù hợp cho landing page, email sequence hoặc nội dung cần logic thuyết phục rõ ràng.',
            'Với tiếng Việt, GPT-4o thường giữ văn phong tự nhiên, giảm lỗi lặp ý và biết cân bằng giữa tính bán hàng với độ tin cậy của thương hiệu.',
          ],
        },
        {
          heading: 'Llama 3.1 phù hợp cho tốc độ, chi phí và kiểm soát dữ liệu',
          body: [
            'Llama 3.1 là lựa chọn tốt cho các tác vụ có cấu trúc rõ như mô tả sản phẩm, biến thể tiêu đề, caption ngắn hoặc nội dung số lượng lớn.',
            'Nếu doanh nghiệp cần self-host hoặc kiểm soát dữ liệu chặt hơn, Llama 3.1 giúp giảm phụ thuộc vào dịch vụ bên ngoài và dễ tối ưu theo quy trình nội bộ.',
          ],
        },
        {
          heading: 'Cách chọn model trong thực tế',
          body: [
            'Dùng GPT-4o cho nội dung chiến lược, cần lập luận, sáng tạo hoặc tone thương hiệu khó. Dùng Llama 3.1 cho nội dung lặp lại, cần tốc độ và chi phí thấp.',
            'Cách hiệu quả nhất là tạo bản nháp bằng model nhanh, sau đó dùng model mạnh hơn để biên tập phần headline, CTA và thông điệp chính.',
          ],
        },
      ],
    },
  },
  {
    id: 2,
    slug: '10-cong-thuc-copywriting-ap-dung-voi-ai',
    cat: 'copy',
    catLabel: 'Copywriting',
    title: '10 công thức copywriting không bao giờ lỗi thời - áp dụng ngay với AI',
    excerpt: 'Từ AIDA đến PAS, những công thức copywriting kinh điển vẫn hoạt động tốt khi kết hợp với AI.',
    author: 'Phạm Thị Lan',
    authorRole: 'Head of Marketing',
    date: '20/03/2026',
    readTime: '6 phút đọc',
    img: 'https://images.unsplash.com/photo-1763833294545-e38e4fab1961?crop=entropy&cs=tinysrgb&fit=max&fm=jpg&w=1200',
    content: {
      lead: 'AI không thay thế tư duy copywriting nền tảng. Công thức tốt giúp prompt rõ hơn, đầu ra dễ kiểm soát hơn và giảm thời gian chỉnh sửa.',
      sections: [
        {
          heading: 'AIDA: rõ hành trình từ chú ý đến hành động',
          body: [
            'AIDA gồm Attention, Interest, Desire và Action. Khi viết prompt, hãy yêu cầu AI tạo từng phần riêng thay vì viết một đoạn quảng cáo chung chung.',
            'Công thức này phù hợp cho Facebook Ads, landing page ngắn và email giới thiệu sản phẩm mới.',
          ],
        },
        {
          heading: 'PAS: bắt đầu từ vấn đề thật',
          body: [
            'PAS gồm Problem, Agitate và Solution. Với AI, bạn nên cung cấp pain point cụ thể của khách hàng để nội dung không bị sáo rỗng.',
            'Cách này hiệu quả với sản phẩm B2B, dịch vụ tư vấn hoặc các sản phẩm cần giải thích giá trị trước khi bán.',
          ],
        },
        {
          heading: 'Before-After-Bridge: cho thấy chuyển đổi',
          body: [
            'Mô tả trạng thái trước khi dùng sản phẩm, kết quả sau khi dùng và cây cầu dẫn đến thay đổi đó. Đây là cấu trúc dễ đọc và dễ áp dụng cho case study.',
            'Khi dùng AI, hãy yêu cầu giữ mỗi phần trong 1-2 câu để tránh nội dung dài và mất trọng tâm.',
          ],
        },
      ],
    },
  },
  {
    id: 3,
    slug: 'shopviet-tang-ctr-40-phan-tram-voi-copypro',
    cat: 'case',
    catLabel: 'Case Study',
    title: 'Shopviet tăng CTR 40% chỉ sau 2 tháng dùng CopyPro',
    excerpt: 'Case study về cách một doanh nghiệp e-commerce tối ưu copy sản phẩm bằng AI và đạt kết quả vượt kỳ vọng.',
    author: 'Nguyễn Minh Trí',
    authorRole: 'CEO CopyPro',
    date: '18/03/2026',
    readTime: '12 phút đọc',
    img: 'https://images.unsplash.com/photo-1591696205602-2f950c417cb9?crop=entropy&cs=tinysrgb&fit=max&fm=jpg&w=1200',
    content: {
      lead: 'Shopviet cần chuẩn hóa nội dung cho hàng trăm SKU nhưng đội marketing không thể viết thủ công với tốc độ tăng trưởng danh mục.',
      sections: [
        {
          heading: 'Vấn đề ban đầu',
          body: [
            'Mỗi sản phẩm có mô tả khác nhau về chất lượng, độ dài và CTA. Điều này khiến quảng cáo khó test và trang sản phẩm thiếu nhất quán.',
            'Đội marketing cũng mất nhiều thời gian chỉnh lại các bản copy do cộng tác viên viết theo nhiều phong cách khác nhau.',
          ],
        },
        {
          heading: 'Cách triển khai',
          body: [
            'Shopviet xây bộ template theo nhóm sản phẩm, sau đó dùng CopyPro tạo nhiều biến thể headline, mô tả ngắn và CTA cho từng SKU.',
            'Các biến thể được chấm điểm nội bộ theo độ rõ lợi ích, độ khớp tệp khách hàng và mức độ dễ hiểu trước khi đưa vào quảng cáo.',
          ],
        },
        {
          heading: 'Kết quả',
          body: [
            'Sau 2 tháng, CTR trung bình tăng 40% ở nhóm sản phẩm được tối ưu. Thời gian sản xuất nội dung giảm đáng kể và team dễ test thông điệp hơn.',
            'Quan trọng hơn, đội marketing có một quy trình lặp lại được thay vì phụ thuộc vào cảm hứng viết từng ngày.',
          ],
        },
      ],
    },
  },
  {
    id: 4,
    slug: 'fine-tuning-llm-cho-bat-dong-san',
    cat: 'ai',
    catLabel: 'Hướng dẫn AI',
    title: 'Fine-tuning LLM cho ngành bất động sản: Hướng dẫn từng bước',
    excerpt: 'Cách chuẩn bị dữ liệu và fine-tune model để tạo copy bất động sản đúng tone thương hiệu.',
    author: 'Hoàng Văn Đức',
    authorRole: 'Lead AI Engineer',
    date: '15/03/2026',
    readTime: '15 phút đọc',
    img: 'https://images.unsplash.com/photo-1758873268663-5a362616b5a7?crop=entropy&cs=tinysrgb&fit=max&fm=jpg&w=1200',
    content: {
      lead: 'Fine-tuning chỉ hiệu quả khi doanh nghiệp có dữ liệu mẫu đủ tốt và mục tiêu rõ ràng về giọng viết.',
      sections: [
        {
          heading: 'Chuẩn bị dữ liệu mẫu',
          body: [
            'Hãy thu thập các mẫu tin đăng, email tư vấn, mô tả dự án và landing page đã được duyệt. Dữ liệu nên thể hiện rõ phong cách sang trọng, thực tế hoặc đầu tư tùy phân khúc.',
            'Loại bỏ các mẫu lỗi thời, sai pháp lý hoặc dùng lời hứa quá mức để tránh model học sai.',
          ],
        },
        {
          heading: 'Thiết kế cặp input/output',
          body: [
            'Mỗi ví dụ nên gồm brief đầu vào và bản copy mong muốn. Brief cần có loại bất động sản, vị trí, khách hàng mục tiêu, lợi thế cạnh tranh và tone.',
            'Output nên nhất quán về cấu trúc để model học được cách trình bày, không chỉ học từ vựng.',
          ],
        },
        {
          heading: 'Đánh giá sau fine-tuning',
          body: [
            'Đừng chỉ kiểm tra câu chữ hay. Hãy đánh giá độ đúng thông tin, tính tuân thủ pháp lý và khả năng chuyển đổi của CTA.',
            'Nên giữ một bộ test cố định để so sánh model trước và sau fine-tuning theo cùng tiêu chí.',
          ],
        },
      ],
    },
  },
  {
    id: 5,
    slug: 'email-marketing-2026-ai-thay-doi-nhu-the-nao',
    cat: 'marketing',
    catLabel: 'Marketing',
    title: 'Email marketing năm 2026: AI đã thay đổi mọi thứ như thế nào?',
    excerpt: 'Phân tích xu hướng email marketing với AI: cá nhân hóa, subject line tối ưu và tự động hóa nội dung.',
    author: 'Phạm Thị Lan',
    authorRole: 'Head of Marketing',
    date: '12/03/2026',
    readTime: '7 phút đọc',
    img: 'https://images.unsplash.com/photo-1719845788637-57ff1e230578?crop=entropy&cs=tinysrgb&fit=max&fm=jpg&w=1200',
    content: {
      lead: 'AI giúp email marketing chuyển từ gửi hàng loạt sang tạo trải nghiệm gần với từng nhóm khách hàng hơn.',
      sections: [
        {
          heading: 'Subject line không còn viết một lần cho tất cả',
          body: [
            'AI có thể tạo nhiều biến thể subject line theo phân khúc khách hàng, mức độ quan tâm và lịch sử tương tác.',
            'Điểm quan trọng là vẫn cần giới hạn tone và lời hứa để tránh subject line gây hiểu nhầm hoặc quá giật gân.',
          ],
        },
        {
          heading: 'Nội dung email cá nhân hóa theo hành vi',
          body: [
            'Một khách hàng vừa xem bảng giá cần thông điệp khác với người mới đọc blog. AI giúp tạo bản nháp phù hợp cho từng ngữ cảnh.',
            'Khi kết hợp với CRM, đội marketing có thể tạo chuỗi email linh hoạt mà không phải viết thủ công từng biến thể.',
          ],
        },
        {
          heading: 'Vai trò mới của marketer',
          body: [
            'Marketer tập trung nhiều hơn vào chiến lược, dữ liệu phân khúc và kiểm soát chất lượng thay vì viết từng email từ đầu.',
            'AI là công cụ tăng tốc, nhưng tiêu chí thương hiệu và hiểu biết khách hàng vẫn quyết định hiệu quả cuối cùng.',
          ],
        },
      ],
    },
  },
  {
    id: 6,
    slug: 'copypro-ra-mat-api-v2',
    cat: 'news',
    catLabel: 'Tin tức',
    title: 'CopyPro ra mắt API v2.0 - Tốc độ nhanh hơn 3x, giá rẻ hơn 40%',
    excerpt: 'Phiên bản API mới với latency thấp, hỗ trợ streaming response và mô hình giá mới cho đội kỹ thuật.',
    author: 'Lê Thu Hằng',
    authorRole: 'CTO CopyPro',
    date: '10/03/2026',
    readTime: '4 phút đọc',
    img: 'https://images.unsplash.com/photo-1591453089816-0fbb971b454c?crop=entropy&cs=tinysrgb&fit=max&fm=jpg&w=1200',
    content: {
      lead: 'API v2.0 tập trung vào tốc độ phản hồi, chi phí triển khai và trải nghiệm tích hợp cho các đội sản phẩm.',
      sections: [
        {
          heading: 'Streaming response cho trải nghiệm nhanh hơn',
          body: [
            'Thay vì chờ toàn bộ nội dung hoàn tất, ứng dụng có thể hiển thị từng phần kết quả ngay khi model tạo ra.',
            'Điều này đặc biệt hữu ích cho trình soạn thảo nội dung, chatbot hỗ trợ marketing và các workflow cần phản hồi tức thì.',
          ],
        },
        {
          heading: 'Mô hình giá linh hoạt hơn',
          body: [
            'API v2.0 tối ưu chi phí cho tác vụ số lượng lớn như tạo biến thể mô tả sản phẩm hoặc tiêu đề quảng cáo.',
            'Doanh nghiệp có thể chọn model theo độ phức tạp nội dung thay vì dùng một cấu hình cố định cho mọi tác vụ.',
          ],
        },
        {
          heading: 'Tương thích tốt hơn với workflow hiện có',
          body: [
            'Bản mới bổ sung metadata rõ hơn, mã lỗi dễ xử lý hơn và tài liệu mẫu cho các luồng tích hợp phổ biến.',
            'Mục tiêu là giúp đội kỹ thuật tích hợp nhanh mà không cần thay đổi toàn bộ hệ thống nội dung đang vận hành.',
          ],
        },
      ],
    },
  },
];

export const TRENDING_POSTS = BLOG_POSTS.slice(0, 4).map((post, index) => ({
  title: post.title,
  reads: ['4.2K', '3.8K', '3.1K', '2.7K'][index],
  slug: post.slug,
}));
