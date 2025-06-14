
import React from 'react';
import { Alert, AlertDescription } from '@/components/ui/alert';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Article } from '@/types/inventory';
import { AlertTriangle, Package } from 'lucide-react';

interface SaleFormAlertsProps {
  articles: Article[];
  availableArticles: Article[];
  lowStockArticles: Article[];
}

export const SaleFormAlerts: React.FC<SaleFormAlertsProps> = ({ articles, availableArticles, lowStockArticles }) => {
  if (articles.length === 0) {
    return (
      <Card className="w-full">
        <CardHeader className="pb-4">
          <CardTitle className="text-lg sm:text-xl">Registrar Venta</CardTitle>
        </CardHeader>
        <CardContent className="p-4 sm:p-6 pt-0">
          <Alert>
            <Package className="h-4 w-4" />
            <AlertDescription className="text-sm">
              <strong>No hay artículos registrados.</strong><br />
              Primero debe registrar artículos antes de poder realizar ventas.
            </AlertDescription>
          </Alert>
        </CardContent>
      </Card>
    );
  }

  if (availableArticles.length === 0) {
    return (
      <Card className="w-full">
        <CardHeader className="pb-4">
          <CardTitle className="text-lg sm:text-xl">Registrar Venta</CardTitle>
        </CardHeader>
        <CardContent className="p-4 sm:p-6 pt-0">
          <Alert variant="destructive">
            <AlertTriangle className="h-4 w-4" />
            <AlertDescription className="text-sm">
              <strong>No hay artículos disponibles para venta.</strong><br />
              Todos los artículos están agotados. Actualice el stock de sus artículos.
            </AlertDescription>
          </Alert>
        </CardContent>
      </Card>
    );
  }

  if (lowStockArticles.length > 0) {
    return (
      <Alert className="mb-4">
        <AlertTriangle className="h-4 w-4" />
        <AlertDescription className="text-sm">
          <strong>Advertencia:</strong> {lowStockArticles.length} artículo(s) tienen stock bajo (≤5 unidades)
        </AlertDescription>
      </Alert>
    );
  }

  return null;
};
