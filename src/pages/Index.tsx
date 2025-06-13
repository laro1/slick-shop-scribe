
import React, { useState } from 'react';
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { ArticleForm } from '@/components/ArticleForm';
import { SaleForm } from '@/components/SaleForm';
import { InventoryLists } from '@/components/InventoryLists';
import { ExportButton } from '@/components/ExportButton';
import { useInventory } from '@/hooks/useInventory';
import { Package, ShoppingCart, FileSpreadsheet, BarChart3 } from 'lucide-react';

const Index = () => {
  const { articles, sales, addArticle, addSale } = useInventory();

  const totalInventoryValue = articles.reduce((sum, article) => sum + (article.price * article.stock), 0);
  const totalSalesValue = sales.reduce((sum, sale) => sum + sale.totalPrice, 0);
  const lowStockItems = articles.filter(article => article.stock <= 5).length;

  return (
    <div className="min-h-screen bg-background">
      <div className="container mx-auto px-4 py-8">
        <div className="mb-8">
          <h1 className="text-4xl font-bold text-center mb-2">Sistema de Inventario</h1>
          <p className="text-muted-foreground text-center">
            Gestiona tu inventario y ventas de manera eficiente
          </p>
        </div>

        {/* Statistics Cards */}
        <div className="grid grid-cols-1 md:grid-cols-4 gap-4 mb-8">
          <Card>
            <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
              <CardTitle className="text-sm font-medium">Total Artículos</CardTitle>
              <Package className="h-4 w-4 text-muted-foreground" />
            </CardHeader>
            <CardContent>
              <div className="text-2xl font-bold">{articles.length}</div>
            </CardContent>
          </Card>

          <Card>
            <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
              <CardTitle className="text-sm font-medium">Ventas Totales</CardTitle>
              <ShoppingCart className="h-4 w-4 text-muted-foreground" />
            </CardHeader>
            <CardContent>
              <div className="text-2xl font-bold">{sales.length}</div>
            </CardContent>
          </Card>

          <Card>
            <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
              <CardTitle className="text-sm font-medium">Valor Inventario</CardTitle>
              <BarChart3 className="h-4 w-4 text-muted-foreground" />
            </CardHeader>
            <CardContent>
              <div className="text-2xl font-bold">${totalInventoryValue.toFixed(2)}</div>
            </CardContent>
          </Card>

          <Card>
            <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
              <CardTitle className="text-sm font-medium">Ingresos Totales</CardTitle>
              <FileSpreadsheet className="h-4 w-4 text-muted-foreground" />
            </CardHeader>
            <CardContent>
              <div className="text-2xl font-bold">${totalSalesValue.toFixed(2)}</div>
            </CardContent>
          </Card>
        </div>

        {lowStockItems > 0 && (
          <div className="mb-6">
            <Card className="border-yellow-200 bg-yellow-50">
              <CardContent className="pt-6">
                <p className="text-yellow-800">
                  ⚠️ Tienes {lowStockItems} artículo(s) con stock bajo (≤5 unidades)
                </p>
              </CardContent>
            </Card>
          </div>
        )}

        <Tabs defaultValue="register" className="w-full">
          <div className="flex flex-col sm:flex-row justify-between items-start sm:items-center mb-6 gap-4">
            <TabsList className="grid w-full sm:w-auto grid-cols-3">
              <TabsTrigger value="register">Registrar</TabsTrigger>
              <TabsTrigger value="sales">Ventas</TabsTrigger>
              <TabsTrigger value="inventory">Inventario</TabsTrigger>
            </TabsList>
            
            <ExportButton articles={articles} sales={sales} />
          </div>

          <TabsContent value="register" className="space-y-6">
            <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
              <ArticleForm onSubmit={addArticle} />
              <SaleForm articles={articles} onSubmit={addSale} />
            </div>
          </TabsContent>

          <TabsContent value="sales" className="space-y-6">
            <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
              <SaleForm articles={articles} onSubmit={addSale} />
              <Card>
                <CardHeader>
                  <CardTitle>Ventas Recientes</CardTitle>
                </CardHeader>
                <CardContent>
                  {sales.length === 0 ? (
                    <p className="text-muted-foreground text-center py-4">
                      No hay ventas registradas
                    </p>
                  ) : (
                    <div className="space-y-3">
                      {sales.slice(-5).reverse().map((sale) => (
                        <div key={sale.id} className="p-3 border rounded-lg">
                          <div className="flex justify-between items-start">
                            <div>
                              <h4 className="font-medium">{sale.articleName}</h4>
                              <p className="text-sm text-muted-foreground">
                                {sale.buyerName} - {sale.quantity} unidades
                              </p>
                            </div>
                            <span className="font-bold text-green-600">
                              ${sale.totalPrice}
                            </span>
                          </div>
                        </div>
                      ))}
                    </div>
                  )}
                </CardContent>
              </Card>
            </div>
          </TabsContent>

          <TabsContent value="inventory" className="space-y-6">
            <InventoryLists articles={articles} sales={sales} />
          </TabsContent>
        </Tabs>
      </div>
    </div>
  );
};

export default Index;
