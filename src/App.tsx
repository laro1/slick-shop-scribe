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
import type { Article, Sale, ArticleFormData, EditArticleData, EditSaleData } from "@/types/inventory";

export type UserRole = 'Administrador' | 'Vendedor' | 'Inventarista' | 'Consultor';

export interface User {
  id: string;
  name: string;
  businessName: string;
  pin: string;
  logoUrl?: string;
  currency?: string;
  language?: string;
  role: UserRole;
  isActive: boolean;
}

const queryClient = new QueryClient();

const App = () => {
  const [users, setUsers] = useState<User[]>(() => {
    const savedUsers = localStorage.getItem("inventory_users");
    if (savedUsers) {
      const parsedUsers = JSON.parse(savedUsers);
      return parsedUsers.map((user: Omit<User, 'role' | 'isActive'> & Partial<User>) => ({
        ...user,
        role: user.role || 'Vendedor',
        isActive: user.isActive !== undefined ? user.isActive : true,
      }));
    }
    return [];
  });
  
  const { articles, sales, addArticle, updateArticle, deleteArticle, addSale, updateSale, deleteSale, isLoading } = useInventory();
  
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
    localStorage.setItem("inventory_users", JSON.stringify(users));
  }, [users]);

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

  const handleCreateUser = (newUser: Omit<User, "id" | "role" | "isActive">) => {
    if (users.some(u => u.businessName.toLowerCase() === newUser.businessName.toLowerCase())) {
      toast.error("Ya existe un negocio con ese nombre.");
      return;
    }
    const userWithId: User = { 
      ...newUser, 
      id: crypto.randomUUID(), 
      currency: 'COP', 
      language: 'es',
      role: 'Vendedor',
      isActive: true,
    };
    setUsers(prev => [...prev, userWithId]);
    toast.success("Usuario creado con éxito!");
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

    setUsers(prev => prev.filter(u => u.id !== userId));
    toast.success(`El negocio "${userToDelete.businessName}" ha sido eliminado.`);
    return true;
  };

  const handleUpdateUser = (userId: string, updatedData: Partial<Omit<User, 'id' | 'pin'>>) => {
    setUsers(prevUsers =>
      prevUsers.map(user =>
        user.id === userId ? { ...user, ...updatedData } : user
      )
    );
    setActiveUser(prevActiveUser => {
      if (prevActiveUser && prevActiveUser.id === userId) {
        return { ...prevActiveUser, ...updatedData };
      }
      return prevActiveUser;
    });
    toast.success("Los datos del negocio se han actualizado correctamente.");
  };

  const handleEditUser = (userId: string, pin: string, updatedData: Partial<Omit<User, 'id' | 'pin'>>) => {
    const userToEdit = users.find(u => u.id === userId);
    if (!userToEdit) {
      toast.error("Usuario no encontrado.");
      return false;
    }

    if (userToEdit.pin !== pin) {
      toast.error("PIN incorrecto.");
      return false;
    }

    setUsers(prevUsers =>
      prevUsers.map(user =>
        user.id === userId ? { ...user, ...updatedData } : user
      )
    );
    toast.success("Los datos del negocio se han actualizado correctamente.");
    return true;
  };

  const handleToggleUserStatus = (userId: string) => {
    let userName = '';
    let newStatus = false;
    setUsers(prevUsers =>
      prevUsers.map(user => {
        if (user.id === userId) {
          userName = user.name;
          newStatus = !user.isActive;
          return { ...user, isActive: !user.isActive };
        }
        return user;
      })
    );
    toast.success(`La cuenta de ${userName} ha sido ${newStatus ? 'activada' : 'desactivada'}.`);
  };

  const handleAdminLogin = (pin: string) => {
    const ADMIN_PIN = '2607';
    if (pin === ADMIN_PIN) {
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

  const inventoryActions = {
    addArticle: async (articleData: ArticleFormData) => {
      try {
        await addArticle(articleData);
        toast({ title: "Artículo registrado", description: "El artículo se ha agregado a Supabase." });
      } catch(e) {
        toast({ title: "Error", description: (e as Error).message, variant: 'destructive' });
      }
    },
    updateArticle: async (updatedArticle: EditArticleData) => {
      try {
        await updateArticle(updatedArticle);
        toast({ title: "Artículo actualizado", description: "El artículo se ha actualizado en Supabase." });
      } catch(e) {
        toast({ title: "Error", description: (e as Error).message, variant: 'destructive' });
      }
    },
    deleteArticle: async (articleId: string) => {
       try {
        await deleteArticle(articleId);
        toast({ title: "Artículo eliminado", description: "El artículo se ha eliminado de Supabase." });
      } catch(e) {
        toast({ title: "Error", description: (e as Error).message, variant: 'destructive' });
      }
    },
    addSale: async (saleData: SaleFormData) => {
       try {
        await addSale(saleData);
        toast({ title: "Venta registrada", description: "La venta se ha registrado en Supabase." });
      } catch(e) {
        toast({ title: "Error", description: (e as Error).message, variant: 'destructive' });
      }
    },
    updateSale: async (updatedSale: EditSaleData) => {
       try {
        await updateSale(updatedSale);
      } catch(e) {
        toast({ title: "Error", description: (e as Error).message, variant: 'destructive' });
      }
    },
    deleteSale: async (saleId: string) => {
      try {
        await deleteSale(saleId);
        toast({ title: "Venta eliminada", description: "La venta se ha eliminado de Supabase." });
      } catch(e) {
        toast({ title: "Error", description: (e as Error).message, variant: 'destructive' });
      }
    },
  };
  
  if (isLoading) {
    return <div className="flex h-screen items-center justify-center">Cargando datos desde Supabase...</div>;
  }

  return (
    <QueryClientProvider client={queryClient}>
      <TooltipProvider>
        <Toaster />
        <Sonner />
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
      </TooltipProvider>
    </QueryClientProvider>
  );
};

export default App;
