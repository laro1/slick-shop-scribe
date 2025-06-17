
import React, { useState } from 'react';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import { Button } from '@/components/ui/button';
import { Collapsible, CollapsibleContent, CollapsibleTrigger } from '@/components/ui/collapsible';
import { Article, Sale, EditArticleData, EditSaleData } from '@/types/inventory';
import { EditArticleDialog } from '@/components/EditArticleDialog';
import { EditSaleDialog } from '@/components/EditSaleDialog';
import { Edit, Trash2, ChevronDown } from 'lucide-react';
import { formatCurrency } from '@/lib/utils';
import { useTranslation } from 'react-i18next';
import { formatCurrencyLocalized } from '@/lib/localization';

interface InventoryListsProps {
  articles: Article[];
  sales: Sale[];
  onUpdateArticle: (data: EditArticleData) => Promise<void>;
  onDeleteArticle: (id: string) => Promise<void>;
  onUpdateSale: (data: EditSaleData) => Promise<void>;
  onDeleteSale: (id: string) => Promise<void>;
}

export const InventoryLists: React.FC<InventoryListsProps> = ({ 
  articles, 
  sales, 
  onUpdateArticle, 
  onDeleteArticle, 
  onUpdateSale, 
  onDeleteSale 
}) => {
  const [editingArticle, setEditingArticle] = useState<Article | null>(null);
  const [editingSale, setEditingSale] = useState<Sale | null>(null);
  const [articlesOpen, setArticlesOpen] = useState(false);
  const [salesOpen, setSalesOpen] = useState(false);
  const { t } = useTranslation();

  const lowStockThreshold = localStorage.getItem("inventory_low_stock_threshold") 
    ? JSON.parse(localStorage.getItem("inventory_low_stock_threshold")!) 
    : 5;

  const formatDate = (date: Date) => {
    return new Date(date).toLocaleDateString('es-ES', {
      year: 'numeric',
      month: 'short',
      day: 'numeric',
      hour: '2-digit',
      minute: '2-digit'
    });
  };

  const handleDeleteArticle = async (article: Article) => {
    try {
      await onDeleteArticle(article.id);
    } catch (error) {
      console.error('Error deleting article:', error);
    }
  };

  const handleDeleteSale = async (sale: Sale) => {
    try {
      await onDeleteSale(sale.id);
    } catch (error) {
      console.error('Error deleting sale:', error);
    }
  };

  return (
    <>
      <div className="w-full space-y-6">
        <Card className="w-full">
          <Collapsible open={articlesOpen} onOpenChange={setArticlesOpen}>
            <CardHeader className="pb-4">
              <CollapsibleTrigger className="flex items-center justify-between w-full hover:bg-muted/50 p-2 rounded-md transition-colors">
                <CardTitle className="text-lg sm:text-xl text-left">Inventario de Artículos</CardTitle>
                <ChevronDown className={`h-4 w-4 transition-transform duration-200 ${articlesOpen ? 'rotate-180' : ''}`} />
              </CollapsibleTrigger>
            </CardHeader>
            <CollapsibleContent>
              <CardContent className="p-4 sm:p-6 pt-0">
                {articles.length === 0 ? (
                  <p className="text-muted-foreground text-center py-4 text-sm">
                    {t('no_articles_registered')}
                  </p>
                ) : (
                  <div className="w-full space-y-4">
                    {articles.map((article) => (
                      <div key={article.id} className="w-full p-3 border rounded-lg transition-all duration-200 hover:shadow-md hover:border-primary/30">
                        <div className="w-full flex flex-col space-y-3">
                          <div className="flex justify-between items-start gap-2">
                            <h4 className="font-semibold text-sm sm:text-base truncate flex-1">{article.name}</h4>
                            <div className="flex items-center gap-1.5 flex-shrink-0">
                              <Badge variant={article.stock > lowStockThreshold ? "default" : article.stock > 0 ? "secondary" : "destructive"} className="text-xs whitespace-nowrap">
                                Stock: {article.stock}
                              </Badge>
                              <Button
                                size="icon"
                                variant="ghost"
                                className="h-7 w-7"
                                onClick={() => setEditingArticle(article)}
                              >
                                <Edit className="h-4 w-4" />
                              </Button>
                              <Button
                                size="icon"
                                variant="ghost"
                                className="h-7 w-7 text-destructive hover:text-destructive"
                                onClick={() => handleDeleteArticle(article)}
                              >
                                <Trash2 className="h-4 w-4" />
                              </Button>
                            </div>
                          </div>
                          <div className="w-full h-32 overflow-hidden rounded-md bg-muted flex items-center justify-center">
                            <img 
                              src={article.imageUrl} 
                              alt={article.name} 
                              className="w-full h-full object-contain"
                              onError={(e) => {
                                console.error('Error loading image:', article.imageUrl);
                                e.currentTarget.src = '/placeholder.svg';
                              }}
                            />
                          </div>
                          <div className="flex justify-between items-center">
                            <span className="font-bold text-base sm:text-lg text-primary">{formatCurrencyLocalized(article.price, 'USD', 'es')}</span>
                            <span className="text-xs text-muted-foreground">
                              {formatDate(article.createdAt)}
                            </span>
                          </div>
                        </div>
                      </div>
                    ))}
                  </div>
                )}
              </CardContent>
            </CollapsibleContent>
          </Collapsible>
        </Card>

        <Card className="w-full">
          <Collapsible open={salesOpen} onOpenChange={setSalesOpen}>
            <CardHeader className="pb-4">
              <CollapsibleTrigger className="flex items-center justify-between w-full hover:bg-muted/50 p-2 rounded-md transition-colors">
                <CardTitle className="text-lg sm:text-xl text-left">Historial de Ventas</CardTitle>
                <ChevronDown className={`h-4 w-4 transition-transform duration-200 ${salesOpen ? 'rotate-180' : ''}`} />
              </CollapsibleTrigger>
            </CardHeader>
            <CollapsibleContent>
              <CardContent className="p-4 sm:p-6 pt-0">
                {sales.length === 0 ? (
                  <p className="text-muted-foreground text-center py-4 text-sm">
                    {t('no_sales_recorded')}
                  </p>
                ) : (
                  <div className="w-full space-y-4">
                    {sales.slice().reverse().map((sale) => (
                      <div key={sale.id} className="w-full p-3 border rounded-lg transition-all duration-200 hover:shadow-md hover:border-primary/30">
                        <div className="w-full flex flex-col space-y-3">
                          <div className="flex justify-between items-start gap-2">
                            <h4 className="font-semibold text-sm sm:text-base truncate flex-1">{sale.articleName}</h4>
                            <div className="flex items-center gap-1.5 flex-shrink-0">
                              <Badge variant="outline" className="border-green-600/50 text-xs font-bold text-green-700 whitespace-nowrap">
                                {formatCurrencyLocalized(sale.amountPaid, 'USD', 'es')}
                              </Badge>
                              <Button
                                size="icon"
                                variant="ghost"
                                className="h-7 w-7"
                                onClick={() => setEditingSale(sale)}
                              >
                                <Edit className="h-4 w-4" />
                              </Button>
                              <Button
                                size="icon"
                                variant="ghost"
                                className="h-7 w-7 text-destructive hover:text-destructive"
                                onClick={() => handleDeleteSale(sale)}
                              >
                                <Trash2 className="h-4 w-4" />
                              </Button>
                            </div>
                          </div>
                          <div className="text-xs sm:text-sm text-muted-foreground space-y-1.5">
                            <p className="truncate">{t('buyer')}: <span className="font-medium text-foreground">{sale.buyerName}</span></p>
                            <div className="flex justify-between items-center">
                              <span>{t('quantity')}: {sale.quantity} × {formatCurrencyLocalized(sale.unitPrice, 'USD', 'es')}</span>
                              <span className="text-xs">{formatDate(sale.saleDate)}</span>
                            </div>
                            {sale.totalPrice > sale.amountPaid && (
                              <div className="text-xs text-orange-600 font-medium border-t pt-1.5 mt-1.5 flex justify-between">
                                 <span>{t('total')}: {formatCurrencyLocalized(sale.totalPrice, 'USD', 'es')}</span>
                                 <span>{t('pending')}: {formatCurrencyLocalized(sale.totalPrice - sale.amountPaid, 'USD', 'es')}</span>
                              </div>
                            )}
                          </div>
                        </div>
                      </div>
                    ))}
                  </div>
                )}
              </CardContent>
            </CollapsibleContent>
          </Collapsible>
        </Card>
      </div>

      <EditArticleDialog
        article={editingArticle}
        open={!!editingArticle}
        onOpenChange={(open) => !open && setEditingArticle(null)}
        onSubmit={async (data) => {
          try {
            await onUpdateArticle(data);
            setEditingArticle(null);
          } catch (error) {
            console.error('Error updating article:', error);
          }
        }}
      />

      <EditSaleDialog
        sale={editingSale}
        articles={articles}
        open={!!editingSale}
        onOpenChange={(open) => !open && setEditingSale(null)}
        onSubmit={async (data) => {
          try {
            await onUpdateSale(data);
            setEditingSale(null);
          } catch (error) {
            console.error('Error updating sale:', error);
          }
        }}
      />
    </>
  );
};
