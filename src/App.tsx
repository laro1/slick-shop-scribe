
import { Toaster } from "@/components/ui/toaster";
import { Toaster as Sonner } from "@/components/ui/sonner";
import { TooltipProvider } from "@/components/ui/tooltip";
import { QueryClient, QueryClientProvider } from "@tanstack/react-query";
import { BrowserRouter, Routes, Route, Navigate } from "react-router-dom";
import Index from "./pages/Index";
import NotFound from "./pages/NotFound";
import { UserAuth } from "./pages/UserAuth";
import { AdminPanel } from "./pages/AdminPanel";
import SplashScreen from "./components/SplashScreen";
import { useAppLogic } from "./hooks/useAppLogic";

const queryClient = new QueryClient();

const AppContent = () => {
  const {
    activeUser,
    isAdmin,
    showSplash,
    isInventoryLoading,
    isUsersLoading,
    isAdminPinLoading,
    t,
    users,
    handleLogin,
    handleCreateUser,
    handleAdminLogin,
    handleLogout,
    handleUpdateUser,
    articles,
    sales,
    inventoryActions,
    handleEditUser,
    handleDeleteUser,
    handleToggleUserStatus,
    handleAdminLogout,
    productCategories,
    handleAddCategory,
    handleDeleteCategory,
    lowStockThreshold,
    handleSetLowStockThreshold,
    enableLotAndExpiry,
    handleSetEnableLotAndExpiry,
    sessionTimeout,
    handleSetSessionTimeout,
  } = useAppLogic();

  if (showSplash) {
    return <SplashScreen />;
  }

  if (isInventoryLoading || isUsersLoading || isAdminPinLoading) {
    return <div className="flex h-screen items-center justify-center">{t('loading_data')}</div>;
  }

  return (
    <BrowserRouter>
      <Routes>
        <Route path="/" element={
          activeUser
            ? <Index
                currentUser={activeUser}
                onLogout={handleLogout}
                onUpdateUser={handleUpdateUser}
                articles={articles}
                sales={sales}
                {...inventoryActions}
              />
            : <UserAuth
                users={users}
                onLogin={handleLogin}
                onCreateUser={handleCreateUser}
                onAdminLogin={handleAdminLogin}
              />
        } />
        <Route path="/admin" element={
          isAdmin
            ? <AdminPanel
                users={users}
                onCreateUser={handleCreateUser}
                onEditUser={handleEditUser}
                onDeleteUser={handleDeleteUser}
                onAdminLogout={handleAdminLogout}
                onToggleUserStatus={handleToggleUserStatus}
                productCategories={productCategories}
                onAddCategory={handleAddCategory}
                onDeleteCategory={handleDeleteCategory}
                lowStockThreshold={lowStockThreshold}
                onSetLowStockThreshold={handleSetLowStockThreshold}
                enableLotAndExpiry={enableLotAndExpiry}
                onSetEnableLotAndExpiry={handleSetEnableLotAndExpiry}
                sessionTimeout={sessionTimeout}
                onSetSessionTimeout={handleSetSessionTimeout}
              />
            : <Navigate to="/" />
        } />
        <Route path="*" element={<NotFound />} />
      </Routes>
    </BrowserRouter>
  );
};


const App = () => {
  return (
    <QueryClientProvider client={queryClient}>
      <TooltipProvider>
        <Toaster />
        <Sonner />
        <AppContent />
      </TooltipProvider>
    </QueryClientProvider>
  );
};

export default App;
