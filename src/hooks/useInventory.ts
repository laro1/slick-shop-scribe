
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
      paymentMethod: saleData.paymentMethod,
      amountPaid: saleData.paymentMethod === 'sinabono' ? 0 : saleData.amountPaid,
      bankName: saleData.paymentMethod === 'transferencia' ? saleData.bankName : undefined,
    };

    setSales(prev => [...prev, newSale]);
    updateArticleStock(article.id, article.stock - saleData.quantity);
    
    return newSale;
  };

  const updateSale = (updatedSale: EditSaleData) => {
    const currentSale = sales.find(s => s.id === updatedSale.id);
    if (!currentSale) {
      throw new Error('Venta no encontrada');
    }
    
    const newArticle = articles.find(a => a.id === updatedSale.articleId);
    if (!newArticle) {
      throw new Error('Artículo no encontrado');
    }

    if (currentSale.articleId === updatedSale.articleId) {
      // Article is the same, just quantity might have changed
      const quantityDifference = updatedSale.quantity - currentSale.quantity;
      if (quantityDifference > 0 && newArticle.stock < quantityDifference) {
        throw new Error('Stock insuficiente para la nueva cantidad');
      }
      updateArticleStock(newArticle.id, newArticle.stock - quantityDifference);
    } else {
      // Article has been changed
      const oldArticle = articles.find(a => a.id === currentSale.articleId);
      if (!oldArticle) {
        // This should not happen if data is consistent
        throw new Error('Artículo original de la venta no encontrado');
      }
      // Check stock for new article
      if (newArticle.stock < updatedSale.quantity) {
        throw new Error('Stock insuficiente para el nuevo artículo');
      }
      // Restore stock for old article
      updateArticleStock(oldArticle.id, oldArticle.stock + currentSale.quantity);
      // Decrease stock for new article
      updateArticleStock(newArticle.id, newArticle.stock - updatedSale.quantity);
    }
    
    // Update sale details
    setSales(prev => prev.map(sale => 
      sale.id === updatedSale.id 
        ? { 
            ...sale, 
            articleId: updatedSale.articleId,
            articleName: newArticle.name,
            quantity: updatedSale.quantity,
            unitPrice: newArticle.price,
            totalPrice: newArticle.price * updatedSale.quantity,
            buyerName: updatedSale.buyerName,
            paymentMethod: updatedSale.paymentMethod,
            amountPaid: updatedSale.paymentMethod === 'sinabono' ? 0 : updatedSale.amountPaid,
            bankName: updatedSale.paymentMethod === 'transferencia' ? updatedSale.bankName : undefined,
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
