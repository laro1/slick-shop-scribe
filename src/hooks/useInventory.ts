
import { useState, useEffect } from 'react';
import { Article, Sale, ArticleFormData, SaleFormData, EditArticleData, EditSaleData } from '@/types/inventory';

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

  const updateArticle = (updatedArticle: EditArticleData) => {
    setArticles(prev => prev.map(article => 
      article.id === updatedArticle.id 
        ? { ...article, ...updatedArticle }
        : article
    ));
    
    // Update sales with new article name and price if changed
    const article = articles.find(a => a.id === updatedArticle.id);
    if (article && (article.name !== updatedArticle.name || article.price !== updatedArticle.price)) {
      setSales(prev => prev.map(sale => 
        sale.articleId === updatedArticle.id 
          ? { 
              ...sale, 
              articleName: updatedArticle.name,
              unitPrice: updatedArticle.price,
              totalPrice: updatedArticle.price * sale.quantity
            }
          : sale
      ));
    }
  };

  const deleteArticle = (articleId: string) => {
    // Check if article has associated sales
    const relatedSales = sales.filter(sale => sale.articleId === articleId);
    if (relatedSales.length > 0) {
      throw new Error('No se puede eliminar un artículo que tiene ventas asociadas');
    }
    
    setArticles(prev => prev.filter(article => article.id !== articleId));
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

  const updateSale = (updatedSale: EditSaleData) => {
    const currentSale = sales.find(s => s.id === updatedSale.id);
    const article = articles.find(a => a.id === updatedSale.articleId);
    
    if (!currentSale || !article) {
      throw new Error('Venta o artículo no encontrado');
    }

    const quantityDifference = updatedSale.quantity - currentSale.quantity;
    
    if (quantityDifference > 0 && article.stock < quantityDifference) {
      throw new Error('Stock insuficiente para la nueva cantidad');
    }

    // Update stock
    updateArticleStock(article.id, article.stock - quantityDifference);

    // Update sale
    setSales(prev => prev.map(sale => 
      sale.id === updatedSale.id 
        ? { 
            ...sale, 
            articleId: updatedSale.articleId,
            articleName: article.name,
            quantity: updatedSale.quantity,
            unitPrice: article.price,
            totalPrice: article.price * updatedSale.quantity,
            buyerName: updatedSale.buyerName
          }
        : sale
    ));
  };

  const deleteSale = (saleId: string) => {
    const sale = sales.find(s => s.id === saleId);
    if (!sale) {
      throw new Error('Venta no encontrada');
    }

    // Restore stock
    updateArticleStock(sale.articleId, 
      articles.find(a => a.id === sale.articleId)!.stock + sale.quantity
    );

    setSales(prev => prev.filter(sale => sale.id !== saleId));
  };

  return {
    articles,
    sales,
    addArticle,
    updateArticle,
    deleteArticle,
    addSale,
    updateSale,
    deleteSale,
  };
};
