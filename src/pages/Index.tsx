import React, { useState } from 'react';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { ArticleForm } from '@/components/ArticleForm';
import { SaleForm } from '@/components/SaleForm';
import { InventoryLists } from '@/components/InventoryLists';
import { ExportButton } from '@/components/ExportButton';
import { Package, ShoppingCart, FileSpreadsheet, BarChart3, Menu, TriangleAlert, LogOut, Settings } from 'lucide-react';
import { SidebarProvider, SidebarTrigger } from '@/components/ui/sidebar';
import { AppSidebar } from '@/components/AppSidebar';
import { Button } from '@/components/ui/button';
import { formatCurrency } from '@/lib/utils';
import type { User } from '@/types/user';
import type { Article, Sale, ArticleFormData, EditArticleData, SaleFormData, EditSaleData } from '@/types/inventory';
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
import { useTranslation } from 'react-i18next';
import { formatCurrencyLocalized } from '@/lib/localization';

interface IndexProps {
  currentUser: User;
  onLogout: () => void;
  onUpdateUser: (userId: string, updatedData: Partial<Omit<User, 'id' | 'pin'>>) => void;
  articles: Article[];
  sales: Sale[];
  addArticle: (data: ArticleFormData) => void;
  updateArticle: (data: EditArticleData) => void;
  deleteArticle: (id: string) => void;
  addSale: (data: SaleFormData) => void;
  updateSale: (data: EditSaleData) => void;
  deleteSale: (id: string) => void;
  darkMode: boolean;
  onSetDarkMode: (enabled: boolean) => void;
  colorTheme: string;
  onSetColorTheme: (theme: string) => void;
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
  deleteSale,
  darkMode,
  onSetDarkMode,
  colorTheme,
  onSetColorTheme,
}) => {
  const [activeTab, setActiveTab] = useState('panel');
  const { t } = useTranslation();

  const totalInventoryValue = articles.reduce((sum, article) => sum + (article.price * article.stock), 0);
  const totalSalesValue = sales.reduce((sum, sale) => sum + sale.totalPrice, 0);
  const totalOriginalInventoryValue = totalSalesValue; // Usar el valor total de ventas como valor original
  const lowStockItems = articles.filter(article => article.stock <= 5).length;

  const pageTitles: { [key: string]: string } = {
    panel: t('dashboard_title'),
    articulo: t('article_management'),
    sales: t('sales_management'),
    inventory: t('inventory_management'),
    settings: t('settings'),
  };

  // Crear funciones async wrapper para manejar las operaciones
  const handleAddArticle = async (data: ArticleFormData) => {
    await addArticle(data);
  };

  const handleUpdateArticle = async (data: EditArticleData) => {
    await updateArticle(data);
  };

  const handleDeleteArticle = async (id: string) => {
    await deleteArticle(id);
  };

  const handleAddSale = async (data: SaleFormData) => {
    await addSale(data);
  };

  const handleUpdateSale = async (data: EditSaleData) => {
    await updateSale(data);
  };

  const handleDeleteSale = async (id: string) => {
    await deleteSale(id);
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
                  <DropdownMenuItem onClick={() => setActiveTab('settings')}>
                    <Settings className="mr-2 h-4 w-4" />
                    {t('settings')}
                  </DropdownMenuItem>
                  <DropdownMenuItem disabled>{currentUser.name}</DropdownMenuItem>
                  <DropdownMenuSeparator />
                  <DropdownMenuItem onClick={onLogout}>
                    <LogOut className="mr-2 h-4 w-4" />
                    {t('logout')}
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
                    <h1 className="text-2xl font-bold text-center mb-2">{t('inventory_system')}</h1>
                    <p className="text-muted-foreground text-center text-sm">
                      {t('inventory_management_efficiently')}
                    </p>
                  </div>

                  {/* Statistics Cards */}
                  <div className="grid grid-cols-1 md:grid-cols-2 gap-4 mb-6">
                    <Card className="p-6 text-center transition-all duration-200 hover:shadow-xl hover:-translate-y-1 bg-blue-50 dark:bg-blue-950/20 border-blue-200 dark:border-blue-800">
                      <CardContent className="p-0 flex flex-col items-center justify-center gap-3">
                        <div className="p-4 bg-blue-100 dark:bg-blue-900/30 rounded-full">
                          <Package className="h-8 w-8 text-blue-600 dark:text-blue-400" />
                        </div>
                        <div className="text-2xl font-bold text-blue-700 dark:text-blue-300">{formatCurrencyLocalized(totalOriginalInventoryValue, currentUser.currency, currentUser.language)}</div>
                        <p className="text-base font-medium text-blue-600 dark:text-blue-400">Valor Original Inventario</p>
                      </CardContent>
                    </Card>

                    <Card className="p-6 text-center transition-all duration-200 hover:shadow-xl hover:-translate-y-1 bg-green-50 dark:bg-green-950/20 border-green-200 dark:border-green-800">
                      <CardContent className="p-0 flex flex-col items-center justify-center gap-3">
                        <div className="p-4 bg-green-100 dark:bg-green-900/30 rounded-full">
                          <BarChart3 className="h-8 w-8 text-green-600 dark:text-green-400" />
                        </div>
                        <div className="text-2xl font-bold text-green-700 dark:text-green-300">{formatCurrencyLocalized(totalInventoryValue, currentUser.currency, currentUser.language)}</div>
                        <p className="text-base font-medium text-green-600 dark:text-green-400">Valor Inventario Vendido</p>
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
                              {t('low_stock_warning', { count: lowStockItems })}
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
                      <ArticleForm onSubmit={handleAddArticle} />
                    </div>
                  </div>
                </div>
              )}

              {activeTab === 'sales' && (
                <div className="space-y-4">
                  <div className="flex flex-col gap-4">
                    <SaleForm articles={articles} onSubmit={handleAddSale} />
                    <Card>
                      <CardHeader>
                        <CardTitle className="text-lg">{t('recent_sales')}</CardTitle>
                      </CardHeader>
                      <CardContent>
                        {sales.length === 0 ? (
                          <p className="text-muted-foreground text-center py-4 text-sm">
                            {t('no_sales_recorded')}
                          </p>
                        ) : (
                          <div className="space-y-3">
                            {sales.slice(-5).reverse().map((sale) => (
                              <div key={sale.id} className="p-3 border rounded-lg">
                                <div className="flex justify-between items-start gap-2">
                                  <div className="min-w-0 flex-1">
                                    <h4 className="font-medium text-sm truncate">{sale.articleName}</h4>
                                    <p className="text-xs text-muted-foreground">
                                      {sale.buyerName} - {sale.quantity} {t('units')}
                                    </p>
                                    {sale.totalPrice > sale.amountPaid && (
                                      <p className="text-xs text-orange-600 font-medium">
                                        {t('pending_payment')}: {formatCurrencyLocalized(sale.totalPrice - sale.amountPaid, currentUser.currency, currentUser.language)}
                                      </p>
                                    )}
                                  </div>
                                  <span className="font-bold text-green-600 text-sm whitespace-nowrap">
                                    {formatCurrencyLocalized(sale.amountPaid, currentUser.currency, currentUser.language)}
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
                    onUpdateArticle={handleUpdateArticle}
                    onDeleteArticle={handleDeleteArticle}
                    onUpdateSale={handleUpdateSale}
                    onDeleteSale={handleDeleteSale}
                  />
                </div>
              )}

              {activeTab === 'settings' && (
                <SettingsPage 
                  currentUser={currentUser} 
                  onUpdateUser={onUpdateUser}
                  darkMode={darkMode}
                  onSetDarkMode={onSetDarkMode}
                  colorTheme={colorTheme}
                  onSetColorTheme={onSetColorTheme}
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
