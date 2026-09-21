export type Category = {
  id: string;
  name: string;
};

export type Product = {
  id: string;
  name: string;
  description: string;
  categoryId: string;
  price: number;
  discountPrice?: number;
  image: string;
  inStock: boolean;
  hidden?: boolean;
};

export type StoreSettings = {
  shopName: string;
  shopDescription: string;
  logoUrl: string;
  themeColor: string;
  whatsappNumber: string;
};

export type StoreState = {
  settings: StoreSettings;
  categories: Category[];
  products: Product[];
};

export const STORAGE_KEY = 'arabic-storefront-admin-state-v1';

export const defaultStoreState: StoreState = {
  settings: {
    shopName: 'متجرنا',
    shopDescription: 'تجربة تسوق عربية أنيقة وسريعة',
    logoUrl: 'https://images.unsplash.com/photo-1521572267360-ee0c2909d518?auto=format&fit=crop&w=400&q=80',
    themeColor: '#7c3aed',
    whatsappNumber: '+201044827919',
  },
  categories: [
    { id: 'electronics', name: 'إلكترونيات' },
    { id: 'fashion', name: 'أزياء' },
    { id: 'accessories', name: 'إكسسوارات' },
  ],
  products: [
    {
      id: 'p1',
      name: 'سماعات لاسلكية X9',
      description: 'سماعات صوت ممتازة مع إلغاء الضوضاء وعمر بطارية طويل.',
      categoryId: 'electronics',
      price: 749,
      discountPrice: 599,
      image: 'https://images.unsplash.com/photo-1546435770-a3e426bf472b?auto=format&fit=crop&w=900&q=80',
      inStock: true,
      hidden: false,
    },
    {
      id: 'p2',
      name: 'ساعة ذكية Pro 5',
      description: 'مراقبة اللياقة البدنية، تتبع النش��ط، ومراقبة القلب.',
      categoryId: 'electronics',
      price: 1299,
      discountPrice: 999,
      image: 'https://images.unsplash.com/photo-1523275335684-37898b6baf30?auto=format&fit=crop&w=900&q=80',
      inStock: true,
      hidden: false,
    },
    {
      id: 'p3',
      name: 'سترة أنيقة',
      description: 'سترة عصرية مناسبة للملابس اليومية والوقت المريح.',
      categoryId: 'fashion',
      price: 540,
      discountPrice: 399,
      image: 'https://images.unsplash.com/photo-1521572267360-ee0c2909d518?auto=format&fit=crop&w=900&q=80',
      inStock: true,
      hidden: false,
    },
    {
      id: 'p4',
      name: 'حقيبة فاخرة',
      description: 'حقيبة عملية ومريحة مع تصميم أنيق خاص للارتداء اليومي.',
      categoryId: 'accessories',
      price: 350,
      discountPrice: 249,
      image: 'https://images.unsplash.com/photo-1584917865442-de89df76afd3?auto=format&fit=crop&w=900&q=80',
      inStock: false,
      hidden: false,
    },
  ],
};

export function getCategoryName(categories: Category[], categoryId: string) {
  return categories.find((category) => category.id === categoryId)?.name || 'غير مصنف';
}
