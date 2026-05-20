import { 
  ShoppingBag, 
  Building2, 
  Laptop, 
  Utensils, 
  Heart, 
  GraduationCap, 
  DollarSign,
  Shirt,
  Briefcase,
  Plane
} from 'lucide-react';
import { Card } from '@/app/components/ui/card';

interface IndustrySelectorProps {
  selectedIndustry: string;
  onSelectIndustry: (industry: string) => void;
}

const industries = [
  { id: 'ecommerce', name: 'Thương Mại Điện Tử', icon: ShoppingBag, color: 'bg-stone-500' },
  { id: 'realestate', name: 'Bất Động Sản', icon: Building2, color: 'bg-stone-500' },
  { id: 'technology', name: 'Công Nghệ', icon: Laptop, color: 'bg-stone-500' },
  { id: 'fnb', name: 'Ẩm Thực', icon: Utensils, color: 'bg-amber-500' },
  { id: 'healthcare', name: 'Y Tế & Sức Khỏe', icon: Heart, color: 'bg-red-500' },
  { id: 'education', name: 'Giáo Dục', icon: GraduationCap, color: 'bg-green-500' },
  { id: 'finance', name: 'Tài Chính', icon: DollarSign, color: 'bg-emerald-500' },
  { id: 'fashion', name: 'Thời Trang', icon: Shirt, color: 'bg-amber-500' },
  { id: 'business', name: 'Dịch Vụ Doanh Nghiệp', icon: Briefcase, color: 'bg-stone-500' },
  { id: 'travel', name: 'Du Lịch', icon: Plane, color: 'bg-stone-500' },
];

export function IndustrySelector({ selectedIndustry, onSelectIndustry }: IndustrySelectorProps) {
  return (
    <div className="grid grid-cols-2 md:grid-cols-3 lg:grid-cols-5 gap-4">
      {industries.map((industry) => {
        const Icon = industry.icon;
        const isSelected = selectedIndustry === industry.id;
        
        return (
          <Card
            key={industry.id}
            className={`p-6 cursor-pointer transition-all hover:scale-105 ${
              isSelected
                ? 'ring-2 ring-stone-500 shadow-lg'
                : 'hover:shadow-md'
            }`}
            onClick={() => onSelectIndustry(industry.id)}
          >
            <div className="flex flex-col items-center text-center gap-3">
              <div className={`${industry.color} p-3 rounded-lg`}>
                <Icon className="w-6 h-6 text-white" />
              </div>
              <p className={`text-sm font-medium ${
                isSelected ? 'text-stone-600' : 'text-gray-700'
              }`}>
                {industry.name}
              </p>
            </div>
          </Card>
        );
      })}
    </div>
  );
}
