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
import type { Article, Sale } from "@/types/inventory";

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

export interface UserData {
  articles: Article[];
  sales: Sale[];
}

const queryClient = new QueryClient();

const App = () => {
  const [users, setUsers] = useState<User[]>(() => {
    const savedUsers = localStorage.getItem("inventory_users");
    if (savedUsers) {
      const parsedUsers = JSON.parse(savedUsers);
      // Add default role and isActive for existing users for migration
      return parsedUsers.map((user: Omit<User, 'role' | 'isActive'> & Partial<User>) => ({
        ...user,
        role: user.role || 'Vendedor',
        isActive: user.isActive !== undefined ? user.isActive : true,
      }));
    }
    return [];
  });

  const [data, setData] = useState<Record<string, UserData>>(() => {
    const savedData = localStorage.getItem("inventory_data");
    if (savedData) {
      const parsedData = JSON.parse(savedData);
      
      Object.keys(parsedData).forEach(userId => {
        const userData = parsedData[userId];
        // Migration for articles date
        if (userData.articles) {
          // eslint-disable-next-line @typescript-eslint/no-explicit-any
          userData.articles = userData.articles.map((article: any) => ({
            ...article,
            createdAt: article.createdAt ? new Date(article.createdAt) : new Date(),
          }));
        }
        // remove subUsers property if it exists from old data
        if (userData.subUsers) {
          delete userData.subUsers;
        }
      });
      return parsedData;
    }
    return {};
  });

  const [activeUser, setActiveUser] = useState<User | null>(null);
  const [isAdmin, setIsAdmin] = useState(false);

  const [productCategories, setProductCategories] = useState<string[]>(() => {
    const savedCategories = localStorage.getItem("inventory_product_categories");
    if (savedCategories) {
      return JSON.parse(savedCategories);
    }
    return ['General']; // Default category
  });

  useEffect(() => {
    localStorage.setItem("inventory_users", JSON.stringify(users));
  }, [users]);

  useEffect(() => {
    localStorage.setItem("inventory_data", JSON.stringify(data));
  }, [data]);

  useEffect(() => {
    localStorage.setItem("inventory_product_categories", JSON.stringify(productCategories));
  }, [productCategories]);

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
    setData(prev => ({ ...prev, [userWithId.id]: { articles: [], sales: [] } }));
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
    setData(prev => {
      const newData = { ...prev };
      delete newData[userId];
      return newData;
    });

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

  const inventoryActions = {
    addArticle: (article: Omit<Article, 'id' | 'createdAt'>) => {
      if (!activeUser) return;
      const newArticle = { ...article, id: crypto.randomUUID(), createdAt: new Date() };
      setData(prev => {
        const userData = prev[activeUser.id] || { articles: [], sales: [] };
        return { ...prev, [activeUser.id]: { ...userData, articles: [...userData.articles, newArticle] } };
      });
    },
    updateArticle: (updatedArticle: Article) => {
      if (!activeUser) return;
      setData(prev => {
        const userData = prev[activeUser.id];
        return { ...prev, [activeUser.id]: { ...userData, articles: userData.articles.map(a => a.id === updatedArticle.id ? updatedArticle : a) } };
      });
    },
    deleteArticle: (articleId: string) => {
      if (!activeUser) return;
      setData(prev => {
        const userData = prev[activeUser.id];
        return { ...prev, [activeUser.id]: { ...userData, articles: userData.articles.filter(a => a.id !== articleId) } };
      });
    },
    addSale: (sale: Omit<Sale, 'id'>) => {
       if (!activeUser) return;
      const newSale = { ...sale, id: crypto.randomUUID() };
      setData(prev => {
        const userData = prev[activeUser.id];
        const article = userData.articles.find(a => a.name === newSale.articleName);
        if (article) {
          const updatedArticle = { ...article, stock: article.stock - newSale.quantity };
          const newArticles = userData.articles.map(a => a.id === article.id ? updatedArticle : a);
          return { ...prev, [activeUser.id]: { ...userData, sales: [...userData.sales, newSale], articles: newArticles } };
        }
        return prev;
      });
    },
    updateSale: (updatedSale: Sale) => {
       if (!activeUser) return;
       setData(prev => {
        const userData = prev[activeUser.id];
        return { ...prev, [activeUser.id]: { ...userData, sales: userData.sales.map(s => s.id === updatedSale.id ? updatedSale : s) } };
      });
    },
    deleteSale: (saleId: string) => {
      if (!activeUser) return;
      setData(prev => {
        const userData = prev[activeUser.id];
        return { ...prev, [activeUser.id]: { ...userData, sales: userData.sales.filter(s => s.id !== saleId) } };
      });
    },
  };

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
                    articles={(data[activeUser.id] || { articles: [], sales: [] }).articles}
                    sales={(data[activeUser.id] || { articles: [], sales: [] }).sales}
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
