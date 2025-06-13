
export interface Article {
  id: string;
  name: string;
  description: string;
  price: number;
  stock: number;
  createdAt: Date;
}

export interface Sale {
  id: string;
  articleId: string;
  articleName: string;
  quantity: number;
  unitPrice: number;
  totalPrice: number;
  buyerName: string;
  saleDate: Date;
}

export interface SaleFormData {
  articleId: string;
  quantity: number;
  buyerName: string;
}

export interface ArticleFormData {
  name: string;
  description: string;
  price: number;
  stock: number;
}

export interface EditArticleData {
  id: string;
  name: string;
  description: string;
  price: number;
  stock: number;
}

export interface EditSaleData {
  id: string;
  articleId: string;
  quantity: number;
  buyerName: string;
}
