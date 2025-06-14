import React, { useState } from 'react';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import { Button } from '@/components/ui/button';
import { Collapsible, CollapsibleContent, CollapsibleTrigger } from '@/components/ui/collapsible';
import { Article, Sale, EditArticleData, EditSaleData } from '@/types/inventory';
import { EditArticleDialog } from '@/components/EditArticleDialog';
import { EditSaleDialog } from '@/components/EditSaleDialog';
import { Edit, Trash2, ChevronDown } from 'lucide-react';
import { useToast } from '@/hooks/use-toast';

interface InventoryListsProps {
  articles: Article[];
  sales: Sale[];
  onUpdateArticle: (data: EditArticleData) => void;
  onDeleteArticle: (id: string) => void;
  onUpdateSale: (data: EditSaleData) => void;
  onDeleteSale: (id: string) => void;
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
  const { toast } = useToast();

  const formatDate = (date: Date) => {
    return new Date(date).toLocaleDateString('es-ES', {
      year: 'numeric',
      month: 'short',
      day: 'numeric',
      hour: '2-digit',
      minute: '2-digit'
    });
  };

  const handleDeleteArticle = (article: Article) => {
    try {
      onDeleteArticle(article.id);
      toast({
        title: "Artículo eliminado",
        description: "El artículo se ha eliminado correctamente.",
      });
    } catch (error) {
      toast({
        title: "Error",
        description: error instanceof Error ? error.message : "No se puede eliminar el artículo.",
        variant: "destructive",
      });
    }
  };

  const handleDeleteSale = (sale: Sale) => {
    try {
      onDeleteSale(sale.id);
      toast({
        title: "Venta eliminada",
        description: "La venta se ha eliminado correctamente.",
      });
    } catch (error) {
      toast({
        title: "Error",
        description: "Hubo un problema al eliminar la venta.",
        variant: "destructive",
      });
    }
  };

  return (
    <>
      <div className="flex flex-col lg:grid lg:grid-cols-2 gap-4 sm:gap-6">
        <Card>
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
                    No hay artículos registrados
                  </p>
                ) : (
                  <div className="space-y-3">
                    {articles.map((article) => (
                      <div key={article.id} className="p-3 border rounded-lg">
                        <div className="flex justify-between items-start mb-2 gap-2">
                          <h4 className="font-medium text-sm sm:text-base truncate flex-1">{article.name}</h4>
                          <div className="flex items-center gap-1">
                            <Badge variant={article.stock > 5 ? "default" : article.stock > 0 ? "secondary" : "destructive"} className="text-xs whitespace-nowrap">
                              Stock: {article.stock}
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
                        <img src={article.imageUrl} alt={article.name} className="w-full h-32 object-cover rounded-md mb-2" />
                        <div className="flex justify-between items-center">
                          <span className="font-medium text-sm sm:text-base">${article.price}</span>
                          <span className="text-xs text-muted-foreground">
                            {formatDate(article.createdAt)}
                          </span>
                        </div>
                      </div>
                    ))}
                  </div>
                )}
              </CardContent>
            </CollapsibleContent>
          </Collapsible>
        </Card>

        <Card>
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
                    No hay ventas registradas
                  </p>
                ) : (
                  <div className="space-y-3">
                    {sales.slice().reverse().map((sale) => (
                      <div key={sale.id} className="p-3 border rounded-lg">
                        <div className="flex justify-between items-start mb-2 gap-2">
                          <h4 className="font-medium text-sm sm:text-base truncate flex-1">{sale.articleName}</h4>
                          <div className="flex items-center gap-1">
                            <Badge variant="secondary" className="text-xs whitespace-nowrap">
                              ${sale.totalPrice}
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
                        <div className="text-xs sm:text-sm text-muted-foreground space-y-1">
                          <p className="truncate">Comprador: {sale.buyerName}</p>
                          <div className="flex justify-between items-center">
                            <span>Cantidad: {sale.quantity} × ${sale.unitPrice}</span>
                            <span className="text-xs">{formatDate(sale.saleDate)}</span>
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
        onSubmit={onUpdateArticle}
      />

      <EditSaleDialog
        sale={editingSale}
        articles={articles}
        open={!!editingSale}
        onOpenChange={(open) => !open && setEditingSale(null)}
        onSubmit={onUpdateSale}
      />
    </>
  );
};
