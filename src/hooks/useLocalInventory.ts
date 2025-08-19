import { useState, useEffect } from 'react';
import { Article, Sale, ArticleFormData, SaleFormData, EditArticleData, EditSaleData } from '@/types/inventory';
import { toast } from 'sonner';

const ARTICLES_KEY = 'inventory_articles';
const SALES_KEY = 'inventory_sales';

// Funciones auxiliares para localStorage
const loadFromStorage = <T>(key: string, defaultValue: T): T => {
  try {
    const stored = localStorage.getItem(key);
    return stored ? JSON.parse(stored) : defaultValue;
  } catch (error) {
    console.error(`Error loading ${key} from localStorage:`, error);
    return defaultValue;
  }
};

const saveToStorage = <T>(key: string, data: T): void => {
  try {
    localStorage.setItem(key, JSON.stringify(data));
  } catch (error) {
    console.error(`Error saving ${key} to localStorage:`, error);
  }
};

// Función para generar IDs únicos
const generateId = (): string => {
  return crypto.randomUUID();
};

export const useLocalInventory = () => {
  const [articles, setArticles] = useState<Article[]>([]);
  const [sales, setSales] = useState<Sale[]>([]);
  const [isLoading, setIsLoading] = useState(true);

  // Cargar datos del localStorage al inicializar
  useEffect(() => {
    const loadedArticles = loadFromStorage<Article[]>(ARTICLES_KEY, []);
    const loadedSales = loadFromStorage<Sale[]>(SALES_KEY, []);
    
    // Convertir fechas de string a Date
    const articlesWithDates = loadedArticles.map(article => ({
      ...article,
      createdAt: new Date(article.createdAt)
    }));
    
    const salesWithDates = loadedSales.map(sale => ({
      ...sale,
      saleDate: new Date(sale.saleDate)
    }));
    
    setArticles(articlesWithDates);
    setSales(salesWithDates);
    setIsLoading(false);
  }, []);

  // Función para refrescar datos (mantener compatibilidad con la interfaz anterior)
  const refreshData = async (): Promise<void> => {
    console.log('Refreshing data from localStorage...');
    // En localStorage no necesitamos refrescar, pero mantenemos la función por compatibilidad
  };

  // CREAR artículo
  const addArticle = async (articleData: ArticleFormData): Promise<any> => {
    try {
      console.log('Adding article to localStorage:', articleData);
      
      const newArticle: Article = {
        id: generateId(),
        name: articleData.name,
        imageUrl: articleData.imageUrl,
        price: articleData.price,
        stock: articleData.stock,
        initialStock: articleData.stock,
        initialPrice: articleData.price,
        createdAt: new Date(),
      };

      const updatedArticles = [newArticle, ...articles];
      setArticles(updatedArticles);
      saveToStorage(ARTICLES_KEY, updatedArticles);
      
      toast.success('Artículo agregado correctamente');
      console.log('Article added successfully:', newArticle);
      return newArticle;
    } catch (error) {
      console.error('Error adding article:', error);
      toast.error('Error al agregar el artículo');
      throw error;
    }
  };

  // ACTUALIZAR artículo
  const updateArticle = async (updatedArticle: EditArticleData): Promise<any> => {
    try {
      console.log('Updating article in localStorage:', updatedArticle);
      
      const updatedArticles = articles.map(article => 
        article.id === updatedArticle.id 
          ? {
              ...article,
              name: updatedArticle.name,
              imageUrl: updatedArticle.imageUrl,
              price: updatedArticle.price,
              stock: updatedArticle.stock,
            }
          : article
      );
      
      setArticles(updatedArticles);
      saveToStorage(ARTICLES_KEY, updatedArticles);
      
      toast.success('Artículo actualizado correctamente');
      console.log('Article updated successfully');
      return updatedArticle;
    } catch (error) {
      console.error('Error updating article:', error);
      toast.error('Error al actualizar el artículo');
      throw error;
    }
  };

  // ELIMINAR artículo
  const deleteArticle = async (articleId: string): Promise<any> => {
    try {
      console.log('Deleting article from localStorage:', articleId);
      
      // Verificar si tiene ventas asociadas
      const associatedSales = sales.filter(sale => sale.articleId === articleId);
      if (associatedSales.length > 0) {
        throw new Error('No se puede eliminar un artículo que tiene ventas asociadas');
      }

      const updatedArticles = articles.filter(article => article.id !== articleId);
      setArticles(updatedArticles);
      saveToStorage(ARTICLES_KEY, updatedArticles);
      
      toast.success('Artículo eliminado correctamente');
      console.log('Article deleted successfully');
    } catch (error) {
      console.error('Error deleting article:', error);
      toast.error(error instanceof Error ? error.message : 'Error al eliminar el artículo');
      throw error;
    }
  };

  // CREAR venta
  const addSale = async (saleData: SaleFormData): Promise<any> => {
    try {
      console.log('Adding sale to localStorage:', saleData);
      
      const article = articles.find(a => a.id === saleData.articleId);
      if (!article) throw new Error('Artículo no encontrado');
      if (article.stock < saleData.quantity) throw new Error('Stock insuficiente');
      
      const totalPrice = article.price * saleData.quantity;
      
      const newSale: Sale = {
        id: generateId(),
        articleId: saleData.articleId,
        articleName: article.name,
        quantity: saleData.quantity,
        unitPrice: article.price,
        totalPrice: totalPrice,
        buyerName: saleData.buyerName,
        saleDate: new Date(),
        paymentMethod: saleData.paymentMethod,
        bankName: saleData.bankName,
        amountPaid: saleData.amountPaid,
      };

      // Actualizar stock del artículo
      const updatedArticles = articles.map(a => 
        a.id === saleData.articleId 
          ? { ...a, stock: a.stock - saleData.quantity }
          : a
      );
      
      const updatedSales = [newSale, ...sales];
      
      setArticles(updatedArticles);
      setSales(updatedSales);
      saveToStorage(ARTICLES_KEY, updatedArticles);
      saveToStorage(SALES_KEY, updatedSales);
      
      toast.success('Venta registrada correctamente');
      console.log('Sale added successfully:', newSale);
      return newSale;
    } catch (error) {
      console.error('Error adding sale:', error);
      toast.error(error instanceof Error ? error.message : 'Error al registrar la venta');
      throw error;
    }
  };

  // ACTUALIZAR venta
  const updateSale = async (updatedSale: EditSaleData): Promise<any> => {
    try {
      console.log('Updating sale in localStorage:', updatedSale);
      
      const originalSale = sales.find(s => s.id === updatedSale.id);
      if (!originalSale) throw new Error('Venta no encontrada');
      
      const article = articles.find(a => a.id === originalSale.articleId);
      if (!article) throw new Error('Artículo no encontrado');
      
      // Restaurar stock original y aplicar nuevo stock
      const stockDifference = updatedSale.quantity - originalSale.quantity;
      const newStock = article.stock - stockDifference;
      
      if (newStock < 0) {
        throw new Error('Stock insuficiente para esta cantidad');
      }
      
      const updatedSaleData: Sale = {
        ...originalSale,
        quantity: updatedSale.quantity,
        totalPrice: originalSale.unitPrice * updatedSale.quantity,
        buyerName: updatedSale.buyerName,
        paymentMethod: updatedSale.paymentMethod,
        bankName: updatedSale.bankName,
        amountPaid: updatedSale.amountPaid,
      };
      
      const updatedArticles = articles.map(a => 
        a.id === originalSale.articleId 
          ? { ...a, stock: newStock }
          : a
      );
      
      const updatedSales = sales.map(s => 
        s.id === updatedSale.id ? updatedSaleData : s
      );
      
      setArticles(updatedArticles);
      setSales(updatedSales);
      saveToStorage(ARTICLES_KEY, updatedArticles);
      saveToStorage(SALES_KEY, updatedSales);
      
      toast.success('Venta actualizada correctamente');
      console.log('Sale updated successfully');
      return updatedSaleData;
    } catch (error) {
      console.error('Error updating sale:', error);
      toast.error(error instanceof Error ? error.message : 'Error al actualizar la venta');
      throw error;
    }
  };

  // ELIMINAR venta
  const deleteSale = async (saleId: string): Promise<any> => {
    try {
      console.log('Deleting sale from localStorage:', saleId);
      
      const saleToDelete = sales.find(s => s.id === saleId);
      if (!saleToDelete) throw new Error('Venta no encontrada');
      
      // Restaurar stock del artículo
      const updatedArticles = articles.map(a => 
        a.id === saleToDelete.articleId 
          ? { ...a, stock: a.stock + saleToDelete.quantity }
          : a
      );
      
      const updatedSales = sales.filter(s => s.id !== saleId);
      
      setArticles(updatedArticles);
      setSales(updatedSales);
      saveToStorage(ARTICLES_KEY, updatedArticles);
      saveToStorage(SALES_KEY, updatedSales);
      
      toast.success('Venta eliminada correctamente');
      console.log('Sale deleted successfully');
    } catch (error) {
      console.error('Error deleting sale:', error);
      toast.error('Error al eliminar la venta');
      throw error;
    }
  };

  return {
    articles,
    sales,
    isLoading,
    addArticle,
    updateArticle,
    deleteArticle,
    addSale,
    updateSale,
    deleteSale,
    refreshData,
  };
};