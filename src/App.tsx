import { Toaster } from "@/components/ui/toaster";
import { Toaster as Sonner, toast } from "@/components/ui/sonner";
import { TooltipProvider } from "@/components/ui/tooltip";
import { QueryClient, QueryClientProvider } from "@tanstack/react-query";
import { BrowserRouter, Routes, Route } from "react-router-dom";
import Index from "./pages/Index";
import NotFound from "./pages/NotFound";
import { UserAuth } from "./pages/UserAuth";
import { useState, useEffect } from "react";
import type { Article, Sale } from "@/types/inventory";

export interface SubUser {
  id: string;
  name: string;
  role: 'Administrador' | 'Vendedor' | 'Inventarista' | 'Consultor';
  status: 'active' | 'inactive';
}

export interface User {
  id: string;
  name: string;
  businessName: string;
  pin: string;
  logoUrl?: string;
  currency?: string;
  language?: string;
}

export interface UserData {
  articles: Article[];
  sales: Sale[];
  subUsers: SubUser[];
}

const queryClient = new QueryClient();

const App = () => {
  const [users, setUsers] = useState<User[]>(() => {
    const savedUsers = localStorage.getItem("inventory_users");
    return savedUsers ? JSON.parse(savedUsers) : [];
  });

  const [data, setData] = useState<Record<string, UserData>>(() => {
    const savedData = localStorage.getItem("inventory_data");
    if (savedData) {
      const parsedData = JSON.parse(savedData);
      const userList = JSON.parse(localStorage.getItem("inventory_users") || "[]");

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
        // Migration for subUsers
        if (!userData.subUsers || userData.subUsers.length === 0) {
           const ownerUser = userList.find((u: User) => u.id === userId);
           userData.subUsers = ownerUser ? [{
             id: crypto.randomUUID(),
             name: ownerUser.name,
             role: 'Administrador' as const,
             status: 'active' as const,
           }] : [];
        }
      });
      return parsedData;
    }
    return {};
  });

  const [activeUser, setActiveUser] = useState<User | null>(null);

  useEffect(() => {
    localStorage.setItem("inventory_users", JSON.stringify(users));
  }, [users]);

  useEffect(() => {
    localStorage.setItem("inventory_data", JSON.stringify(data));
  }, [data]);

  const handleLogin = (user: User, pin: string) => {
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

  const handleCreateUser = (newUser: Omit<User, "id">) => {
    if (users.some(u => u.businessName.toLowerCase() === newUser.businessName.toLowerCase())) {
      toast.error("Ya existe un negocio con ese nombre.");
      return;
    }
    const userWithId = { ...newUser, id: crypto.randomUUID(), currency: 'COP', language: 'es' };
    const adminSubUser: SubUser = {
      id: crypto.randomUUID(),
      name: newUser.name,
      role: 'Administrador',
      status: 'active',
    };
    setUsers(prev => [...prev, userWithId]);
    setData(prev => ({ ...prev, [userWithId.id]: { articles: [], sales: [], subUsers: [adminSubUser] } }));
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

  const subUserActions = {
    addSubUser: (subUser: Omit<SubUser, 'id'>) => {
      if (!activeUser) return;
      const newSubUser = { ...subUser, id: crypto.randomUUID() };
      setData(prev => {
        const userData = prev[activeUser.id] || { articles: [], sales: [], subUsers: [] };
        return { ...prev, [activeUser.id]: { ...userData, subUsers: [...userData.subUsers, newSubUser] } };
      });
      toast.success("Usuario creado con éxito.");
    },
    updateSubUser: (updatedSubUser: SubUser) => {
      if (!activeUser) return;
      setData(prev => {
        const userData = prev[activeUser.id];
        return { ...prev, [activeUser.id]: { ...userData, subUsers: userData.subUsers.map(su => su.id === updatedSubUser.id ? updatedSubUser : su) } };
      });
      toast.success("Usuario actualizado con éxito.");
    },
    deleteSubUser: (subUserId: string) => {
      if (!activeUser) return;
      setData(prev => {
        const userData = prev[activeUser.id];
        if (userData.subUsers.length <= 1) {
          toast.error("No se puede eliminar el último usuario.");
          return prev;
        }
        if (userData.subUsers.find(su => su.id === subUserId)?.role === 'Administrador' && userData.subUsers.filter(su => su.role === 'Administrador').length === 1) {
          toast.error("No se puede eliminar el último administrador.");
          return prev;
        }
        return { ...prev, [activeUser.id]: { ...userData, subUsers: userData.subUsers.filter(su => su.id !== subUserId) } };
      });
      toast.success("Usuario eliminado con éxito.");
    }
  };

  const inventoryActions = {
    addArticle: (article: Omit<Article, 'id' | 'createdAt'>) => {
      if (!activeUser) return;
      const newArticle = { ...article, id: crypto.randomUUID(), createdAt: new Date() };
      setData(prev => {
        const userData = prev[activeUser.id] || { articles: [], sales: [], subUsers: [] };
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
          return { ...prev, [activeUser.id]: { sales: [...userData.sales, newSale], articles: newArticles } };
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

  if (!activeUser) {
    return (
      <QueryClientProvider client={queryClient}>
        <TooltipProvider>
          <Toaster />
          <Sonner />
          <UserAuth users={users} onLogin={handleLogin} onCreateUser={handleCreateUser} onDeleteUser={handleDeleteUser} />
        </TooltipProvider>
      </QueryClientProvider>
    );
  }

  const currentUserData = data[activeUser.id] || { articles: [], sales: [], subUsers: [] };

  return (
    <QueryClientProvider client={queryClient}>
      <TooltipProvider>
        <Toaster />
        <Sonner />
        <BrowserRouter>
          <Routes>
            <Route path="/" element={
              <Index 
                currentUser={activeUser}
                onLogout={handleLogout}
                onUpdateUser={handleUpdateUser}
                articles={currentUserData.articles}
                sales={currentUserData.sales}
                subUsers={currentUserData.subUsers}
                {...inventoryActions}
                {...subUserActions}
              />
            } />
            <Route path="*" element={<NotFound />} />
          </Routes>
        </BrowserRouter>
      </TooltipProvider>
    </QueryClientProvider>
  );
};

export default App;
