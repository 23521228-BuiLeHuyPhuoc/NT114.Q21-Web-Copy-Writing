import { Card } from '@/app/components/ui/card';
import { Label } from '@/app/components/ui/label';
import { Input } from '@/app/components/ui/input';
import { Textarea } from '@/app/components/ui/textarea';

interface Props {
  productName: string;
  keywords: string;
  targetAudience: string;
  additionalContext: string;
  onChange: (field: 'productName' | 'keywords' | 'targetAudience' | 'additionalContext', value: string) => void;
}

export function ProductInfoForm({ productName, keywords, targetAudience, additionalContext, onChange }: Props) {
  return (
    <Card className="p-4 space-y-3">
      <Label className="text-sm font-semibold text-foreground/80 block">Thông tin sản phẩm</Label>
      <div>
        <Label className="text-xs text-foreground/70">Tên sản phẩm/dịch vụ</Label>
        <Input placeholder="VD: Áo thun cotton premium" value={productName} onChange={e => onChange('productName', e.target.value)} className="mt-1 text-sm" />
      </div>
      <div>
        <Label className="text-xs text-foreground/70">Từ khóa chính</Label>
        <Input placeholder="VD: cao cấp, chính hãng, freeship" value={keywords} onChange={e => onChange('keywords', e.target.value)} className="mt-1 text-sm" />
      </div>
      <div>
        <Label className="text-xs text-foreground/70">Đối tượng mục tiêu</Label>
        <Input placeholder="VD: Phụ nữ 25-35 tuổi, yêu thời trang" value={targetAudience} onChange={e => onChange('targetAudience', e.target.value)} className="mt-1 text-sm" />
      </div>
      <div>
        <Label className="text-xs text-foreground/70">Thông tin bổ sung</Label>
        <Textarea placeholder="VD: Đang sale 50%, hàng mới về, limited edition..." value={additionalContext} onChange={e => onChange('additionalContext', e.target.value)} className="mt-1 text-sm min-h-16" />
      </div>
    </Card>
  );
}
