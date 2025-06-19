
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
      <div className="w-full space-y-4">
        <Card className="w-full">
          <Collapsible open={articlesOpen} onOpenChange={setArticlesOpen}>
            <CardHeader className="pb-3">
              <CollapsibleTrigger className="flex items-center justify-between w-full hover:bg-muted/50 p-2 rounded-md transition-colors">
                <CardTitle className="text-base sm:text-lg text-left">Inventario de Artículos</CardTitle>
                <ChevronDown className={`h-4 w-4 transition-transform duration-200 ${articlesOpen ? 'rotate-180' : ''}`} />
              </CollapsibleTrigger>
            </CardHeader>
            <CollapsibleContent>
              <CardContent className="p-3 sm:p-6 pt-0">
                {articles.length === 0 ? (
                  <p className="text-muted-foreground text-center py-4 text-sm">
                    {t('no_articles_registered')}
                  </p>
                ) : (
                  <div className="space-y-3">
                    {articles.map((article) => (
                      <div key={article.id} className="p-3 border rounded-lg transition-all duration-200 hover:shadow-md hover:border-primary/30">
                        <div className="flex gap-3">
                          {/* Image */}
                          <div className="w-16 h-16 sm:w-20 sm:h-20 flex-shrink-0 overflow-hidden rounded-md bg-muted flex items-center justify-center">
                            <img 
                              src={article.imageUrl} 
                              alt={article.name} 
                              className="w-full h-full object-cover"
                              onError={(e) => {
                                console.error('Error loading image:', article.imageUrl);
                                e.currentTarget.src = '/placeholder.svg';
                              }}
                            />
                          </div>

                          {/* Content */}
                          <div className="flex-1 min-w-0">
                            <div className="flex items-start justify-between gap-2 mb-2">
                              <h4 className="font-semibold text-sm sm:text-base truncate">{article.name}</h4>
                              <div className="flex items-center gap-1 flex-shrink-0">
                                <Badge 
                                  variant={article.stock > lowStockThreshold ? "default" : article.stock > 0 ? "secondary" : "destructive"} 
                                  className="text-xs"
                                >
                                  {article.stock}
                                </Badge>
                                <Button
                                  size="icon"
                                  variant="ghost"
                                  className="h-6 w-6"
                                  onClick={() => setEditingArticle(article)}
                                >
                                  <Edit className="h-3 w-3" />
                                </Button>
                                <Button
                                  size="icon"
                                  variant="ghost"
                                  className="h-6 w-6 text-destructive hover:text-destructive"
                                  onClick={() => handleDeleteArticle(article)}
                                >
                                  <Trash2 className="h-3 w-3" />
                                </Button>
                              </div>
                            </div>

                            <div className="space-y-1">
                              <div className="flex justify-between items-center">
                                <span className="font-bold text-sm sm:text-base text-primary">
                                  {formatCurrencyLocalized(article.price, 'USD', 'es')}
                                </span>
                                <span className="text-xs text-muted-foreground">
                                  Stock: {article.stock}
                                </span>
                              </div>
                              <span className="text-xs text-muted-foreground block">
                                {formatDate(article.createdAt)}
                              </span>
                            </div>
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
            <CardHeader className="pb-3">
              <CollapsibleTrigger className="flex items-center justify-between w-full hover:bg-muted/50 p-2 rounded-md transition-colors">
                <CardTitle className="text-base sm:text-lg text-left">Historial de Ventas</CardTitle>
                <ChevronDown className={`h-4 w-4 transition-transform duration-200 ${salesOpen ? 'rotate-180' : ''}`} />
              </CollapsibleTrigger>
            </CardHeader>
            <CollapsibleContent>
              <CardContent className="p-3 sm:p-6 pt-0">
                {sales.length === 0 ? (
                  <p className="text-muted-foreground text-center py-4 text-sm">
                    {t('no_sales_recorded')}
                  </p>
                ) : (
                  <div className="space-y-3">
                    {sales.slice().reverse().map((sale) => (
                      <div key={sale.id} className="p-3 border rounded-lg transition-all duration-200 hover:shadow-md hover:border-primary/30">
                        <div className="space-y-3">
                          {/* Header with title and actions */}
                          <div className="flex items-start justify-between gap-2">
                            <div className="flex-1 min-w-0">
                              <h4 className="font-semibold text-sm sm:text-base truncate">{sale.articleName}</h4>
                            </div>
                            <div className="flex items-center gap-1 flex-shrink-0">
                              <Badge variant="outline" className="border-green-600/50 text-xs font-bold text-green-700">
                                {formatCurrencyLocalized(sale.amountPaid, 'USD', 'es')}
                              </Badge>
                              <Button
                                size="icon"
                                variant="ghost"
                                className="h-6 w-6"
                                onClick={() => setEditingSale(sale)}
                              >
                                <Edit className="h-3 w-3" />
                              </Button>
                              <Button
                                size="icon"
                                variant="ghost"
                                className="h-6 w-6 text-destructive hover:text-destructive"
                                onClick={() => handleDeleteSale(sale)}
                              >
                                <Trash2 className="h-3 w-3" />
                              </Button>
                            </div>
                          </div>

                          {/* Sale details - Información completa restaurada */}
                          <div className="space-y-2">
                            {/* Comprador y fecha */}
                            <div className="flex flex-col sm:flex-row sm:justify-between sm:items-center gap-1">
                              <div className="flex items-center gap-1 text-xs sm:text-sm text-muted-foreground">
                                <span className="font-medium">{t('buyer')}:</span>
                                <span className="text-foreground">{sale.buyerName}</span>
                              </div>
                              <span className="text-xs text-muted-foreground">{formatDate(sale.saleDate)}</span>
                            </div>
                            
                            {/* Cantidad y precios */}
                            <div className="grid grid-cols-2 gap-2 text-xs sm:text-sm">
                              <div className="space-y-1">
                                <div className="flex justify-between">
                                  <span className="text-muted-foreground">{t('quantity')}:</span>
                                  <span className="font-medium">{sale.quantity}</span>
                                </div>
                                <div className="flex justify-between">
                                  <span className="text-muted-foreground">Precio unit:</span>
                                  <span className="font-medium">{formatCurrencyLocalized(sale.unitPrice, 'USD', 'es')}</span>
                                </div>
                              </div>
                              <div className="space-y-1">
                                <div className="flex justify-between">
                                  <span className="text-muted-foreground">Total:</span>
                                  <span className="font-bold text-primary">{formatCurrencyLocalized(sale.totalPrice, 'USD', 'es')}</span>
                                </div>
                                <div className="flex justify-between">
                                  <span className="text-muted-foreground">Pagado:</span>
                                  <span className="font-medium text-green-600">{formatCurrencyLocalized(sale.amountPaid, 'USD', 'es')}</span>
                                </div>
                              </div>
                            </div>

                            {/* Método de pago */}
                            <div className="flex justify-between items-center text-xs sm:text-sm">
                              <span className="text-muted-foreground">Método de pago:</span>
                              <div className="flex items-center gap-2">
                                <Badge variant="secondary" className="text-xs">
                                  {sale.paymentMethod === 'efectivo' ? 'Efectivo' : 
                                   sale.paymentMethod === 'transferencia' ? 'Transferencia' : 'Sin Abono'}
                                </Badge>
                                {sale.paymentMethod === 'transferencia' && sale.bankName && (
                                  <span className="text-xs text-muted-foreground">({sale.bankName})</span>
                                )}
                              </div>
                            </div>
                            
                            {/* Saldo pendiente */}
                            {sale.totalPrice > sale.amountPaid && (
                              <div className="border-t pt-2 mt-2">
                                <div className="flex justify-between items-center text-orange-600 font-medium">
                                  <span className="text-xs sm:text-sm">{t('pending')}:</span>
                                  <span className="text-sm font-bold">{formatCurrencyLocalized(sale.totalPrice - sale.amountPaid, 'USD', 'es')}</span>
                                </div>
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
