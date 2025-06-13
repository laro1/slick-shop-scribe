
import React from 'react';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import { Article, Sale } from '@/types/inventory';

interface InventoryListsProps {
  articles: Article[];
  sales: Sale[];
}

export const InventoryLists: React.FC<InventoryListsProps> = ({ articles, sales }) => {
  const formatDate = (date: Date) => {
    return new Date(date).toLocaleDateString('es-ES', {
      year: 'numeric',
      month: 'short',
      day: 'numeric',
      hour: '2-digit',
      minute: '2-digit'
    });
  };

  return (
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
                    <Badge variant={article.stock > 5 ? "default" : article.stock > 0 ? "secondary" : "destructive"} className="text-xs whitespace-nowrap">
                      Stock: {article.stock}
                    </Badge>
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
                    <Badge variant="secondary" className="text-xs whitespace-nowrap">
                      ${sale.totalPrice}
                    </Badge>
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
  );
};
