
import { useState, useEffect } from 'react';
import { Article, Sale, ArticleFormData, SaleFormData } from '@/types/inventory';

export const useInventory = () => {
  const [articles, setArticles] = useState<Article[]>([]);
  const [sales, setSales] = useState<Sale[]>([]);

  // Load data from localStorage on mount
  useEffect(() => {
    const savedArticles = localStorage.getItem('inventory-articles');
    const savedSales = localStorage.getItem('inventory-sales');
    
    if (savedArticles) {
      setArticles(JSON.parse(savedArticles));
    }
    
    if (savedSales) {
      setSales(JSON.parse(savedSales));
    }
  }, []);

  // Save articles to localStorage
  useEffect(() => {
    localStorage.setItem('inventory-articles', JSON.stringify(articles));
  }, [articles]);

  // Save sales to localStorage
  useEffect(() => {
    localStorage.setItem('inventory-sales', JSON.stringify(sales));
  }, [sales]);

  const addArticle = (articleData: ArticleFormData) => {
    const newArticle: Article = {
      id: crypto.randomUUID(),
      ...articleData,
      createdAt: new Date(),
    };
    
    setArticles(prev => [...prev, newArticle]);
    return newArticle;
  };

  const updateArticleStock = (articleId: string, newStock: number) => {
    setArticles(prev => prev.map(article => 
      article.id === articleId 
        ? { ...article, stock: newStock }
        : article
    ));
  };

  const addSale = (saleData: SaleFormData) => {
    const article = articles.find(a => a.id === saleData.articleId);
    if (!article) {
      throw new Error('Artículo no encontrado');
    }

    if (article.stock < saleData.quantity) {
      throw new Error('Stock insuficiente');
    }

    const newSale: Sale = {
      id: crypto.randomUUID(),
      articleId: saleData.articleId,
      articleName: article.name,
      quantity: saleData.quantity,
      unitPrice: article.price,
      totalPrice: article.price * saleData.quantity,
      buyerName: saleData.buyerName,
      saleDate: new Date(),
    };

    setSales(prev => [...prev, newSale]);
    updateArticleStock(article.id, article.stock - saleData.quantity);
    
    return newSale;
  };

  return {
    articles,
    sales,
    addArticle,
    addSale,
  };
};
