
import React, { useState } from 'react';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { ArticleForm } from '@/components/ArticleForm';
import { SaleForm } from '@/components/SaleForm';
import { InventoryLists } from '@/components/InventoryLists';
import { ExportButton } from '@/components/ExportButton';
import { Package, ShoppingCart, FileSpreadsheet, BarChart3, Menu, TriangleAlert, LogOut, User as UserIcon } from 'lucide-react';
import { SidebarProvider, SidebarTrigger } from '@/components/ui/sidebar';
import { AppSidebar } from '@/components/AppSidebar';
import { Button } from '@/components/ui/button';
import { formatCurrency } from '@/lib/utils';
import type { User, UserData } from '@/App';
import type { Article, Sale } from '@/types/inventory';
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuLabel,
  DropdownMenuSeparator,
  DropdownMenuTrigger,
} from "@/components/ui/dropdown-menu"
import { Avatar, AvatarFallback, AvatarImage } from "@/components/ui/avatar"
import { SettingsPage } from '@/pages/SettingsPage';

interface IndexProps extends UserData {
  currentUser: User;
  onLogout: () => void;
  onUpdateUser: (userId: string, updatedData: Partial<Omit<User, 'id' | 'pin'>>) => void;
  addArticle: (article: Omit<Article, 'id' | 'createdAt'>) => void;
  updateArticle: (updatedArticle: Article) => void;
  deleteArticle: (articleId: string) => void;
  addSale: (sale: Omit<Sale, 'id'>) => void;
  updateSale: (updatedSale: Sale) => void;
  deleteSale: (saleId: string) => void;
}

const Index: React.FC<IndexProps> = ({
  currentUser,
  onLogout,
  onUpdateUser,
  articles,
  sales,
  addArticle,
  updateArticle,
  deleteArticle,
  addSale,
  updateSale,
  deleteSale
}) => {
  const [activeTab, setActiveTab] = useState('panel');

  const totalInventoryValue = articles.reduce((sum, article) => sum + (article.price * article.stock), 0);
  const totalSalesValue = sales.reduce((sum, sale) => sum + sale.amountPaid, 0);
  const lowStockItems = articles.filter(article => article.stock <= 5).length;

  const pageTitles: { [key: string]: string } = {
    panel: 'Panel de Control',
    articulo: 'Gestión de Artículos',
    sales: 'Gestión de Ventas',
    inventory: 'Gestión de Inventario',
    settings: 'Configuración',
  };

  return (
    <SidebarProvider>
      <div className="flex min-h-screen w-full bg-muted/40">
        <AppSidebar activeTab={activeTab} setActiveTab={setActiveTab} />
        <div className="flex flex-1 flex-col">
          <header className="sticky top-0 z-30 flex h-14 items-center gap-4 border-b bg-background/95 px-4 backdrop-blur supports-[backdrop-filter]:bg-background/60">
            <SidebarTrigger asChild>
              <Button size="icon" variant="outline" className="sm:hidden">
                <Menu className="h-5 w-5" />
                <span className="sr-only">Toggle Menu</span>
              </Button>
            </SidebarTrigger>
            <h1 className="flex-1 text-xl font-semibold tracking-tight">
              {pageTitles[activeTab]}
            </h1>
            <div className="ml-auto flex items-center gap-4">
               <DropdownMenu>
                <DropdownMenuTrigger asChild>
                  <Button
                    variant="outline"
                    size="icon"
                    className="overflow-hidden rounded-full"
                  >
                     <Avatar>
                        <AvatarImage src={currentUser.logoUrl} alt={currentUser.businessName} />
                        <AvatarFallback>{currentUser.businessName.charAt(0)}</AvatarFallback>
                      </Avatar>
                  </Button>
                </DropdownMenuTrigger>
                <DropdownMenuContent align="end">
                  <DropdownMenuLabel>{currentUser.businessName}</DropdownMenuLabel>
                  <DropdownMenuSeparator />
                  <DropdownMenuItem disabled>{currentUser.name}</DropdownMenuItem>
                  <DropdownMenuSeparator />
                  <DropdownMenuItem onClick={onLogout}>
                    <LogOut className="mr-2 h-4 w-4" />
                    Cerrar Sesión
                  </DropdownMenuItem>
                </DropdownMenuContent>
              </DropdownMenu>
            </div>
          </header>
          <main className="flex-1 overflow-auto p-4">
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
                  <div className="grid grid-cols-2 lg:grid-cols-4 gap-4 mb-6">
                    <Card className="p-4 text-center transition-all duration-200 hover:shadow-xl hover:-translate-y-1">
                      <CardContent className="p-0 flex flex-col items-center justify-center gap-2">
                        <div className="p-3 bg-primary/10 rounded-full">
                          <Package className="h-6 w-6 text-primary" />
                        </div>
                        <div className="text-2xl font-bold">{articles.length}</div>
                        <p className="text-sm font-medium text-muted-foreground">Total Artículos</p>
                      </CardContent>
                    </Card>

                    <Card className="p-4 text-center transition-all duration-200 hover:shadow-xl hover:-translate-y-1">
                       <CardContent className="p-0 flex flex-col items-center justify-center gap-2">
                        <div className="p-3 bg-primary/10 rounded-full">
                          <ShoppingCart className="h-6 w-6 text-primary" />
                        </div>
                        <div className="text-2xl font-bold">{sales.length}</div>
                        <p className="text-sm font-medium text-muted-foreground">Ventas Totales</p>
                      </CardContent>
                    </Card>

                    <Card className="p-4 text-center transition-all duration-200 hover:shadow-xl hover:-translate-y-1">
                       <CardContent className="p-0 flex flex-col items-center justify-center gap-2">
                        <div className="p-3 bg-primary/10 rounded-full">
                          <BarChart3 className="h-6 w-6 text-primary" />
                        </div>
                        <div className="text-xl font-bold">{formatCurrency(totalInventoryValue)}</div>
                        <p className="text-sm font-medium text-muted-foreground">Valor Inventario</p>
                      </CardContent>
                    </Card>

                    <Card className="p-4 text-center transition-all duration-200 hover:shadow-xl hover:-translate-y-1">
                      <CardContent className="p-0 flex flex-col items-center justify-center gap-2">
                        <div className="p-3 bg-primary/10 rounded-full">
                          <FileSpreadsheet className="h-6 w-6 text-primary" />
                        </div>
                        <div className="text-xl font-bold">{formatCurrency(totalSalesValue)}</div>
                        <p className="text-sm font-medium text-muted-foreground">Ingresos Totales</p>
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
                                    {sale.totalPrice > sale.amountPaid && (
                                      <p className="text-xs text-orange-600 font-medium">
                                        Pendiente: {formatCurrency(sale.totalPrice - sale.amountPaid)}
                                      </p>
                                    )}
                                  </div>
                                  <span className="font-bold text-green-600 text-sm whitespace-nowrap">
                                    {formatCurrency(sale.amountPaid)}
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

              {activeTab === 'settings' && (
                <SettingsPage 
                  currentUser={currentUser} 
                  onUpdateUser={onUpdateUser}
                />
              )}
            </div>
          </main>
        </div>
      </div>
    </SidebarProvider>
  );
};

export default Index;
