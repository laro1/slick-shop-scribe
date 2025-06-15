
import React, { useState } from 'react';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { CreateUserDialog } from '@/components/CreateUserDialog';
import { LoginDialog } from '@/components/LoginDialog';
import type { User as UserType } from '@/types/user';
import { Building, User as UserIcon } from 'lucide-react';
import { AdminAuthDialog } from '@/components/AdminAuthDialog';
import { useNavigate } from 'react-router-dom';

interface UserAuthProps {
  users: UserType[];
  onLogin: (user: UserType, pin: string) => boolean;
  onCreateUser: (user: Omit<UserType, 'id' | 'role' | 'isActive'>) => void;
  onAdminLogin: (pin: string) => boolean;
}

export const UserAuth: React.FC<UserAuthProps> = ({ users, onLogin, onCreateUser, onAdminLogin }) => {
  const [selectedUser, setSelectedUser] = useState<UserType | null>(null);
  const [isCreateOpen, setCreateOpen] = useState(false);
  const [isAdminAuthOpen, setAdminAuthOpen] = useState(false);
  const navigate = useNavigate();

  const handleAdminVerify = (pin: string) => {
    const success = onAdminLogin(pin);
    if (success) {
      navigate('/admin');
    }
    return success;
  };

  const handleSelectUser = (user: UserType) => {
    setSelectedUser(user);
  };

  return (
    <div className="min-h-screen bg-muted/40 flex flex-col items-center justify-center p-4 relative">
      <div className="absolute top-4 left-4">
        <Button 
          variant="ghost" 
          size="icon" 
          onClick={() => setAdminAuthOpen(true)}
          aria-label="Configuración de Administrador"
        >
          <UserIcon className="h-6 w-6" />
        </Button>
      </div>
      <div className="w-full max-w-4xl">
        <div className="text-center mb-8">
          <h1 className="text-4xl font-bold tracking-tight">Bienvenido</h1>
          <p className="text-muted-foreground mt-2">Selecciona tu negocio para continuar o crea uno nuevo.</p>
        </div>

        {users.length > 0 ? (
          <div className="grid grid-cols-1 sm:grid-cols-2 md:grid-cols-3 lg:grid-cols-4 gap-6">
            {users.map((user) => (
              <Card 
                key={user.id} 
                className="text-center relative cursor-pointer"
                onClick={() => handleSelectUser(user)}
              >
                <CardHeader className="items-center pt-8">
                  <div className="w-20 h-20 rounded-full bg-primary/10 flex items-center justify-center mb-3">
                    {user.logoUrl ? (
                      <img src={user.logoUrl} alt={user.businessName} className="w-full h-full object-cover rounded-full" />
                    ) : (
                      <Building className="w-10 h-10 text-primary" />
                    )}
                  </div>
                  <CardTitle className="text-lg">{user.businessName}</CardTitle>
                </CardHeader>
                <CardContent>
                  <div className="flex items-center justify-center text-sm text-muted-foreground">
                    <UserIcon className="w-4 h-4 mr-2" />
                    <span>{user.name}</span>
                  </div>
                </CardContent>
              </Card>
            ))}
          </div>
        ) : (
          <div className="text-center py-10 border-2 border-dashed rounded-lg">
             <h3 className="text-lg font-semibold">No hay negocios registrados</h3>
             <p className="text-muted-foreground mt-1">Crea el primer negocio para empezar a gestionar tu inventario.</p>
          </div>
        )}

        <div className="mt-10 text-center">
          <Button onClick={() => setCreateOpen(true)}>Crear Nuevo Negocio</Button>
        </div>
      </div>
      
      <CreateUserDialog
        isOpen={isCreateOpen}
        onOpenChange={setCreateOpen}
        onCreateUser={onCreateUser}
      />

      {selectedUser && (
        <LoginDialog
          isOpen={!!selectedUser}
          onOpenChange={(isOpen) => !isOpen && setSelectedUser(null)}
          user={selectedUser}
          onLogin={onLogin}
        />
      )}
      <AdminAuthDialog 
        isOpen={isAdminAuthOpen} 
        onOpenChange={setAdminAuthOpen} 
        onVerify={handleAdminVerify} 
      />
    </div>
  );
};
