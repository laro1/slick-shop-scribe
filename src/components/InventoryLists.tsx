
import React, { useState } from 'react';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import { Button } from '@/components/ui/button';
import { Article, Sale, EditArticleData, EditSaleData } from '@/types/inventory';
import { EditArticleDialog } from '@/components/EditArticleDialog';
import { EditSaleDialog } from '@/components/EditSaleDialog';
import { Edit, Trash2 } from 'lucide-react';
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
          <CardHeader className="pb-4">
            <CardTitle className="text-lg sm:text-xl">Inventario de Artículos</CardTitle>
          </CardHeader>
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
                    <p className="text-xs sm:text-sm text-muted-foreground mb-2 line-clamp-2">{article.description}</p>
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
        </Card>

        <Card>
          <CardHeader className="pb-4">
            <CardTitle className="text-lg sm:text-xl">Historial de Ventas</CardTitle>
          </CardHeader>
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
