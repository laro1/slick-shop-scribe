import { Toaster } from "@/components/ui/toaster";
import { Toaster as Sonner, toast } from "@/components/ui/sonner";
import { TooltipProvider } from "@/components/ui/tooltip";
import { QueryClient, QueryClientProvider } from "@tanstack/react-query";
import { BrowserRouter, Routes, Route, Navigate } from "react-router-dom";
import Index from "./pages/Index";
import NotFound from "./pages/NotFound";
import { UserAuth } from "./pages/UserAuth";
import { AdminPanel } from "./pages/AdminPanel";
import { useState, useEffect } from "react";
import { useInventory } from "@/hooks/useInventory";
import { useUsers } from "@/hooks/useUsers";
import { useAdmin } from "@/hooks/useAdmin";
import type { Article, Sale, ArticleFormData, SaleFormData, EditArticleData, EditSaleData } from "@/types/inventory";
import type { User, UserFormData } from "@/types/user";

export type { User, UserFormData };

const queryClient = new QueryClient();

const AppContent = () => {
  const { users, isUsersLoading, addUser, updateUser, deleteUser, toggleUserStatus } = useUsers();
  const { adminPin, isAdminPinLoading } = useAdmin();
  
  const [activeUser, setActiveUser] = useState<User | null>(null);
  const [isAdmin, setIsAdmin] = useState(false);

  const [productCategories, setProductCategories] = useState<string[]>(() => {
    const savedCategories = localStorage.getItem("inventory_product_categories");
    if (savedCategories) {
      return JSON.parse(savedCategories);
    }
    return ['General']; // Default category
  });

  const [lowStockThreshold, setLowStockThreshold] = useState<number>(() => {
    const savedThreshold = localStorage.getItem("inventory_low_stock_threshold");
    if (savedThreshold) {
      return JSON.parse(savedThreshold);
    }
    return 5; // Default threshold
  });

  const [enableLotAndExpiry, setEnableLotAndExpiry] = useState<boolean>(() => {
    const saved = localStorage.getItem("inventory_lot_expiry_enabled");
    return saved ? JSON.parse(saved) : false;
  });

  const [sessionTimeout, setSessionTimeout] = useState<number>(() => {
    const saved = localStorage.getItem("inventory_session_timeout");
    return saved ? JSON.parse(saved) : 30; // Default 30 minutes
  });

  useEffect(() => {
    localStorage.setItem("inventory_product_categories", JSON.stringify(productCategories));
  }, [productCategories]);

  useEffect(() => {
    localStorage.setItem("inventory_low_stock_threshold", JSON.stringify(lowStockThreshold));
  }, [lowStockThreshold]);

  useEffect(() => {
    localStorage.setItem("inventory_lot_expiry_enabled", JSON.stringify(enableLotAndExpiry));
  }, [enableLotAndExpiry]);

  useEffect(() => {
    localStorage.setItem("inventory_session_timeout", JSON.stringify(sessionTimeout));
  }, [sessionTimeout]);

  const handleLogin = (user: User, pin: string) => {
    if (!user.isActive) {
      toast.error("Esta cuenta está desactivada. Contacta al administrador.");
      return false;
    }
    if (user.pin === pin) {
      setActiveUser(user);
      toast.success(`Bienvenido, ${user.name}!`);
      return true;
    }
    toast.error("PIN incorrecto");
    return false;
  };

  const handleLogout = () => {
    setActiveUser(null);
  };

  const handleCreateUser = (newUser: UserFormData) => {
    addUser(newUser);
  };
  
  const handleDeleteUser = (userId: string, pin: string) => {
    const userToDelete = users.find(u => u.id === userId);
    if (!userToDelete) {
      toast.error("Usuario no encontrado.");
      return false;
    }

    if (userToDelete.pin !== pin) {
      toast.error("PIN incorrecto.");
      return false;
    }

    deleteUser(userId);
    toast.success(`El negocio "${userToDelete.businessName}" ha sido eliminado.`);
    return true;
  };

  const handleUpdateUser = async (userId: string, updatedData: Partial<Omit<User, 'id' | 'pin'>>) => {
    await updateUser({ userId, data: updatedData });
    setActiveUser(prevActiveUser => {
      if (prevActiveUser && prevActiveUser.id === userId) {
        return { ...prevActiveUser, ...updatedData };
      }
      return prevActiveUser;
    });
  };

  const handleEditUser = async (userId: string, pin: string, updatedData: Partial<Omit<User, 'id' | 'pin'>>) => {
    const userToEdit = users.find(u => u.id === userId);
    if (!userToEdit) {
      toast.error("Usuario no encontrado.");
      return false;
    }

    if (userToEdit.pin !== pin) {
      toast.error("PIN incorrecto.");
      return false;
    }
    
    try {
        await updateUser({ userId, data: updatedData });
        return true;
    } catch (e) {
        return false;
    }
  };

  const handleToggleUserStatus = (userId: string) => {
    const user = users.find(u => u.id === userId);
    if (user) {
      toggleUserStatus({ userId, currentStatus: user.isActive, userName: user.name });
    }
  };

  const handleAdminLogin = (pin: string) => {
    if (isAdminPinLoading) {
      toast.info("Verificando PIN...");
      return false;
    }
    if (!adminPin) {
      toast.error("La configuración de administrador no está disponible.");
      return false;
    }
    if (pin === adminPin) {
      setIsAdmin(true);
      toast.success("Acceso de administrador concedido.");
      return true;
    }
    toast.error("PIN de administrador incorrecto.");
    return false;
  };

  const handleAdminLogout = () => {
    setIsAdmin(false);
  };

  const handleAddCategory = (category: string) => {
    if (productCategories.map(c => c.toLowerCase()).includes(category.toLowerCase())) {
      toast.error("Esa categoría ya existe.");
      return;
    }
    setProductCategories(prev => [...prev, category]);
    toast.success(`Categoría "${category}" agregada.`);
  };

  const handleDeleteCategory = (category: string) => {
    setProductCategories(prev => prev.filter(c => c !== category));
    toast.success(`Categoría "${category}" eliminada.`);
  };

  const handleSetLowStockThreshold = (threshold: number) => {
    if (threshold >= 0) {
      setLowStockThreshold(threshold);
      toast.success(`Nivel de stock bajo configurado a ${threshold} unidades.`);
    } else {
      toast.error("El nivel de stock no puede ser negativo.");
    }
  };

  const handleSetEnableLotAndExpiry = (enabled: boolean) => {
    setEnableLotAndExpiry(enabled);
    toast.success(`Seguimiento de lotes y caducidad ${enabled ? 'activado' : 'desactivado'}.`);
  };

  const handleSetSessionTimeout = (minutes: number) => {
    if (minutes > 0) {
      setSessionTimeout(minutes);
      toast.success(`Tiempo de expiración de sesión configurado a ${minutes} minutos.`);
    } else {
      toast.error("El tiempo de expiración debe ser mayor a 0.");
    }
  };

  const { articles, sales, addArticle, updateArticle, deleteArticle, addSale, updateSale, deleteSale, isLoading: isInventoryLoading } = useInventory();

  const inventoryActions = {
    addArticle: async (articleData: ArticleFormData) => {
      try {
        await addArticle(articleData);
        toast.success("Artículo registrado con éxito.");
      } catch (e) {
        toast.error((e as Error).message);
      }
    },
    updateArticle: async (updatedArticle: EditArticleData) => {
      try {
        await updateArticle(updatedArticle);
        toast.success("Artículo actualizado con éxito.");
      } catch (e) {
        toast.error((e as Error).message);
      }
    },
    deleteArticle: async (articleId: string) => {
      try {
        await deleteArticle(articleId);
        toast.success("Artículo eliminado con éxito.");
      } catch (e) {
        toast.error((e as Error).message);
      }
    },
    addSale: async (saleData: SaleFormData) => {
      try {
        await addSale(saleData);
        toast.success("Venta registrada con éxito.");
      } catch (e) {
        toast.error((e as Error).message);
      }
    },
    updateSale: async (updatedSale: EditSaleData) => {
      try {
        await updateSale(updatedSale);
        toast.success("Venta actualizada con éxito.");
      } catch (e) {
        toast.error((e as Error).message);
      }
    },
    deleteSale: async (saleId: string) => {
      try {
        await deleteSale(saleId);
        toast.success("Venta eliminada con éxito.");
      } catch (e) {
        toast.error((e as Error).message);
      }
    },
  };

  if (isInventoryLoading || isUsersLoading || isAdminPinLoading) {
    return <div className="flex h-screen items-center justify-center">Cargando datos desde Supabase...</div>;
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
