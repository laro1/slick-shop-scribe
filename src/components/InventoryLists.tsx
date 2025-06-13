
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
    <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
      <Card>
        <CardHeader>
          <CardTitle>Inventario de Artículos</CardTitle>
        </CardHeader>
        <CardContent>
          {articles.length === 0 ? (
            <p className="text-muted-foreground text-center py-4">
              No hay artículos registrados
            </p>
          ) : (
            <div className="space-y-3">
              {articles.map((article) => (
                <div key={article.id} className="p-3 border rounded-lg">
                  <div className="flex justify-between items-start mb-2">
                    <h4 className="font-medium">{article.name}</h4>
                    <Badge variant={article.stock > 0 ? "default" : "destructive"}>
                      Stock: {article.stock}
                    </Badge>
                  </div>
                  <p className="text-sm text-muted-foreground mb-2">{article.description}</p>
                  <div className="flex justify-between items-center">
                    <span className="font-medium">${article.price}</span>
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
        <CardHeader>
          <CardTitle>Historial de Ventas</CardTitle>
        </CardHeader>
        <CardContent>
          {sales.length === 0 ? (
            <p className="text-muted-foreground text-center py-4">
              No hay ventas registradas
            </p>
          ) : (
            <div className="space-y-3">
              {sales.slice().reverse().map((sale) => (
                <div key={sale.id} className="p-3 border rounded-lg">
                  <div className="flex justify-between items-start mb-2">
                    <h4 className="font-medium">{sale.articleName}</h4>
                    <Badge variant="secondary">
                      ${sale.totalPrice}
                    </Badge>
                  </div>
                  <div className="text-sm text-muted-foreground space-y-1">
                    <p>Comprador: {sale.buyerName}</p>
                    <p>Cantidad: {sale.quantity} × ${sale.unitPrice}</p>
                    <p>Fecha: {formatDate(sale.saleDate)}</p>
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
