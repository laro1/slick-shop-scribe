
import React, { useState } from 'react';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { ArticleForm } from '@/components/ArticleForm';
import { SaleForm } from '@/components/SaleForm';
import { InventoryLists } from '@/components/InventoryLists';
import { ExportButton } from '@/components/ExportButton';
import { useInventory } from '@/hooks/useInventory';
import { Package, ShoppingCart, FileSpreadsheet, BarChart3, Menu, TriangleAlert } from 'lucide-react';
import { SidebarProvider, SidebarTrigger } from '@/components/ui/sidebar';
import { AppSidebar } from '@/components/AppSidebar';
import { Button } from '@/components/ui/button';
import { formatCurrency } from '@/lib/utils';

const Index = () => {
  const [activeTab, setActiveTab] = useState('panel');
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

  const pageTitles: { [key: string]: string } = {
    panel: 'Panel de Control',
    articulo: 'Gestión de Artículos',
    sales: 'Gestión de Ventas',
    inventory: 'Gestión de Inventario',
  };

  return (
    <SidebarProvider>
      <div className="flex min-h-screen w-full bg-muted/40">
        <AppSidebar activeTab={activeTab} setActiveTab={setActiveTab} />
        <div className="flex flex-1 flex-col">
          <header className="sticky top-0 z-10 flex h-14 items-center gap-4 border-b bg-background/95 px-4 backdrop-blur supports-[backdrop-filter]:bg-background/60">
            <SidebarTrigger asChild>
              <Button size="icon" variant="outline">
                <Menu className="h-5 w-5" />
                <span className="sr-only">Toggle Menu</span>
              </Button>
            </SidebarTrigger>
            <h1 className="flex-1 text-xl font-semibold tracking-tight">
              {pageTitles[activeTab]}
            </h1>
          </header>
          <main className="flex-1 overflow-auto">
            <div className="container mx-auto px-2 py-4">
              
              {activeTab === 'panel' && (
                <>
                  <div className="mb-6">
                    <h1 className="text-2xl font-bold text-center mb-2">Sistema de Inventario</h1>
                    <p className="text-muted-foreground text-center text-sm">
                      Gestiona tu inventario y ventas de manera eficiente
                    </p>
                  </div>

                  {/* Statistics Cards */}
                  <div className="grid grid-cols-2 gap-2 mb-6">
                    <Card className="p-2 transition-all duration-200 hover:shadow-lg hover:-translate-y-1">
                      <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-1 p-0">
                        <CardTitle className="text-xs font-medium truncate">Total Artículos</CardTitle>
                        <span className="p-2 bg-primary/10 rounded-lg">
                          <Package className="h-4 w-4 text-primary" />
                        </span>
                      </CardHeader>
                      <CardContent className="p-0 pt-1">
                        <div className="text-lg font-bold">{articles.length}</div>
                      </CardContent>
                    </Card>

                    <Card className="p-2 transition-all duration-200 hover:shadow-lg hover:-translate-y-1">
                      <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-1 p-0">
                        <CardTitle className="text-xs font-medium truncate">Ventas Totales</CardTitle>
                        <span className="p-2 bg-primary/10 rounded-lg">
                          <ShoppingCart className="h-4 w-4 text-primary" />
                        </span>
                      </CardHeader>
                      <CardContent className="p-0 pt-1">
                        <div className="text-lg font-bold">{sales.length}</div>
                      </CardContent>
                    </Card>

                    <Card className="p-2 transition-all duration-200 hover:shadow-lg hover:-translate-y-1">
                      <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-1 p-0">
                        <CardTitle className="text-xs font-medium truncate">Valor Inventario</CardTitle>
                        <span className="p-2 bg-primary/10 rounded-lg">
                          <BarChart3 className="h-4 w-4 text-primary" />
                        </span>
                      </CardHeader>
                      <CardContent className="p-0 pt-1">
                        <div className="text-sm font-bold">{formatCurrency(totalInventoryValue)}</div>
                      </CardContent>
                    </Card>

                    <Card className="p-2 transition-all duration-200 hover:shadow-lg hover:-translate-y-1">
                      <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-1 p-0">
                        <CardTitle className="text-xs font-medium truncate">Ingresos Totales</CardTitle>
                        <span className="p-2 bg-primary/10 rounded-lg">
                          <FileSpreadsheet className="h-4 w-4 text-primary" />
                        </span>
                      </CardHeader>
                      <CardContent className="p-0 pt-1">
                        <div className="text-sm font-bold">{formatCurrency(totalSalesValue)}</div>
                      </CardContent>
                    </Card>
                  </div>

                  {lowStockItems > 0 && (
                    <div className="mb-4">
                      <Card className="border-yellow-400 bg-yellow-50 dark:border-yellow-600 dark:bg-yellow-950/50">
                        <CardContent className="pt-4 p-3">
                          <div className="flex items-center gap-3">
                            <TriangleAlert className="h-5 w-5 flex-shrink-0 text-yellow-600 dark:text-yellow-400" />
                            <p className="text-sm font-medium text-yellow-800 dark:text-yellow-200">
                              Tienes {lowStockItems} artículo(s) con stock bajo (≤5 unidades).
                            </p>
                          </div>
                        </CardContent>
                      </Card>
                    </div>
                  )}
                  
                  <div className="flex justify-center mt-8">
                    <ExportButton articles={articles} sales={sales} />
                  </div>
                </>
              )}

              {activeTab === 'articulo' && (
                <div className="space-y-4">
                  <div className="flex justify-center">
                    <div className="w-full max-w-md">
                      <ArticleForm onSubmit={addArticle} />
                    </div>
                  </div>
                </div>
              )}

              {activeTab === 'sales' && (
                <div className="space-y-4">
                  <div className="flex flex-col gap-4">
                    <SaleForm articles={articles} onSubmit={addSale} />
                    <Card>
                      <CardHeader>
                        <CardTitle className="text-lg">Ventas Recientes</CardTitle>
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
                                    <h4 className="font-medium text-sm truncate">{sale.articleName}</h4>
                                    <p className="text-xs text-muted-foreground">
                                      {sale.buyerName} - {sale.quantity} unidades
                                    </p>
                                  </div>
                                  <span className="font-bold text-green-600 text-sm whitespace-nowrap">
                                    {formatCurrency(sale.totalPrice)}
                                  </span>
                                </div>
                              </div>
                            ))}
                          </div>
                        )}
                      </CardContent>
                    </Card>
                  </div>
                </div>
              )}

              {activeTab === 'inventory' && (
                <div className="space-y-4">
                  <InventoryLists 
                    articles={articles} 
                    sales={sales} 
                    onUpdateArticle={updateArticle}
                    onDeleteArticle={deleteArticle}
                    onUpdateSale={updateSale}
                    onDeleteSale={deleteSale}
                  />
                </div>
              )}
            </div>
          </main>
        </div>
      </div>
    </SidebarProvider>
  );
};

export default Index;
