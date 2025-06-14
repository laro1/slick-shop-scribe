import React, { useState } from 'react';
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { ArticleForm } from '@/components/ArticleForm';
import { SaleForm } from '@/components/SaleForm';
import { InventoryLists } from '@/components/InventoryLists';
import { ExportButton } from '@/components/ExportButton';
import { useInventory } from '@/hooks/useInventory';
import { Package, ShoppingCart, FileSpreadsheet, BarChart3, Menu } from 'lucide-react';
import { SidebarProvider, SidebarTrigger } from '@/components/ui/sidebar';
import { AppSidebar } from '@/components/AppSidebar';
import { Button } from '@/components/ui/button';

const Index = () => {
  const [activeTab, setActiveTab] = useState('articulo');
  const { 
    articles, 
    sales, 
    addArticle, 
    updateArticle, 
    deleteArticle, 
    addSale, 
    updateSale, 
    deleteSale 
  } = useInventory();

  const totalInventoryValue = articles.reduce((sum, article) => sum + (article.price * article.stock), 0);
  const totalSalesValue = sales.reduce((sum, sale) => sum + sale.totalPrice, 0);
  const lowStockItems = articles.filter(article => article.stock <= 5).length;

  return (
    <SidebarProvider>
      <div className="flex min-h-screen w-full bg-muted/40">
        <AppSidebar activeTab={activeTab} setActiveTab={setActiveTab} />
        <div className="flex flex-1 flex-col">
          <header className="sticky top-0 z-10 flex h-14 items-center gap-4 border-b bg-background px-4 sm:px-6">
            <SidebarTrigger asChild className="sm:hidden">
              <Button size="icon" variant="outline">
                <Menu className="h-5 w-5" />
                <span className="sr-only">Toggle Menu</span>
              </Button>
            </SidebarTrigger>
          </header>
          <main className="flex-1 overflow-auto">
            <div className="container mx-auto px-2 sm:px-4 py-4 sm:py-8">
              <div className="mb-6 sm:mb-8">
                <h1 className="text-2xl sm:text-4xl font-bold text-center mb-2">Sistema de Inventario</h1>
                <p className="text-muted-foreground text-center text-sm sm:text-base">
                  Gestiona tu inventario y ventas de manera eficiente
                </p>
              </div>

              {/* Statistics Cards */}
              <div className="grid grid-cols-2 lg:grid-cols-4 gap-2 sm:gap-4 mb-6 sm:mb-8">
                <Card className="p-2 sm:p-4">
                  <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-1 sm:pb-2 p-0 sm:p-6">
                    <CardTitle className="text-xs sm:text-sm font-medium truncate">Total Artículos</CardTitle>
                    <Package className="h-3 w-3 sm:h-4 sm:w-4 text-muted-foreground" />
                  </CardHeader>
                  <CardContent className="p-0 sm:p-6 pt-1 sm:pt-0">
                    <div className="text-lg sm:text-2xl font-bold">{articles.length}</div>
                  </CardContent>
                </Card>

                <Card className="p-2 sm:p-4">
                  <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-1 sm:pb-2 p-0 sm:p-6">
                    <CardTitle className="text-xs sm:text-sm font-medium truncate">Ventas Totales</CardTitle>
                    <ShoppingCart className="h-3 w-3 sm:h-4 sm:w-4 text-muted-foreground" />
                  </CardHeader>
                  <CardContent className="p-0 sm:p-6 pt-1 sm:pt-0">
                    <div className="text-lg sm:text-2xl font-bold">{sales.length}</div>
                  </CardContent>
                </Card>

                <Card className="p-2 sm:p-4">
                  <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-1 sm:pb-2 p-0 sm:p-6">
                    <CardTitle className="text-xs sm:text-sm font-medium truncate">Valor Inventario</CardTitle>
                    <BarChart3 className="h-3 w-3 sm:h-4 sm:w-4 text-muted-foreground" />
                  </CardHeader>
                  <CardContent className="p-0 sm:p-6 pt-1 sm:pt-0">
                    <div className="text-sm sm:text-2xl font-bold">${totalInventoryValue.toFixed(2)}</div>
                  </CardContent>
                </Card>

                <Card className="p-2 sm:p-4">
                  <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-1 sm:pb-2 p-0 sm:p-6">
                    <CardTitle className="text-xs sm:text-sm font-medium truncate">Ingresos Totales</CardTitle>
                    <FileSpreadsheet className="h-3 w-3 sm:h-4 sm:w-4 text-muted-foreground" />
                  </CardHeader>
                  <CardContent className="p-0 sm:p-6 pt-1 sm:pt-0">
                    <div className="text-sm sm:text-2xl font-bold">${totalSalesValue.toFixed(2)}</div>
                  </CardContent>
                </Card>
              </div>

              {lowStockItems > 0 && (
                <div className="mb-4 sm:mb-6">
                  <Card className="border-yellow-200 bg-yellow-50">
                    <CardContent className="pt-4 sm:pt-6 p-3 sm:p-6">
                      <p className="text-yellow-800 text-sm">
                        ⚠️ Tienes {lowStockItems} artículo(s) con stock bajo (≤5 unidades)
                      </p>
                    </CardContent>
                  </Card>
                </div>
              )}

              <Tabs value={activeTab} onValueChange={setActiveTab} className="w-full">
                <div className="flex flex-col gap-4 mb-4 sm:mb-6">
                  <TabsList className="grid w-full grid-cols-3 h-auto">
                    <TabsTrigger value="articulo" className="text-xs sm:text-sm py-2">Artículo</TabsTrigger>
                    <TabsTrigger value="sales" className="text-xs sm:text-sm py-2">Ventas</TabsTrigger>
                    <TabsTrigger value="inventory" className="text-xs sm:text-sm py-2">Inventario</TabsTrigger>
                  </TabsList>
                  
                  <div className="flex justify-center">
                    <ExportButton articles={articles} sales={sales} />
                  </div>
                </div>

                <TabsContent value="articulo" className="space-y-4 sm:space-y-6">
                  <div className="flex justify-center">
                    <div className="w-full max-w-md">
                      <ArticleForm onSubmit={addArticle} />
                    </div>
                  </div>
                </TabsContent>

                <TabsContent value="sales" className="space-y-4 sm:space-y-6">
                  <div className="flex flex-col lg:grid lg:grid-cols-2 gap-4 sm:gap-6">
                    <SaleForm articles={articles} onSubmit={addSale} />
                    <Card>
                      <CardHeader>
                        <CardTitle className="text-lg sm:text-xl">Ventas Recientes</CardTitle>
                      </CardHeader>
                      <CardContent>
                        {sales.length === 0 ? (
                          <p className="text-muted-foreground text-center py-4 text-sm">
                            No hay ventas registradas
                          </p>
                        ) : (
                          <div className="space-y-3">
                            {sales.slice(-5).reverse().map((sale) => (
                              <div key={sale.id} className="p-3 border rounded-lg">
                                <div className="flex justify-between items-start gap-2">
                                  <div className="min-w-0 flex-1">
                                    <h4 className="font-medium text-sm sm:text-base truncate">{sale.articleName}</h4>
                                    <p className="text-xs sm:text-sm text-muted-foreground">
                                      {sale.buyerName} - {sale.quantity} unidades
                                    </p>
                                  </div>
                                  <span className="font-bold text-green-600 text-sm sm:text-base whitespace-nowrap">
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

                <TabsContent value="inventory" className="space-y-4 sm:space-y-6">
                  <InventoryLists 
                    articles={articles} 
                    sales={sales} 
                    onUpdateArticle={updateArticle}
                    onDeleteArticle={deleteArticle}
                    onUpdateSale={updateSale}
                    onDeleteSale={deleteSale}
                  />
                </TabsContent>
              </Tabs>
            </div>
          </main>
        </div>
      </div>
    </SidebarProvider>
  );
};

export default Index;
