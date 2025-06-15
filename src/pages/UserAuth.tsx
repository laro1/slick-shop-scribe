
import React, { useState } from 'react';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { CreateUserDialog } from '@/components/CreateUserDialog';
import { LoginDialog } from '@/components/LoginDialog';
import type { User as UserType } from '@/App';
import { Building, User, Trash2, MoreHorizontal } from 'lucide-react';
import { DeleteUserDialog } from '@/components/DeleteUserDialog';
import { EditUserDialog } from '@/components/EditUserDialog';
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuTrigger,
} from "@/components/ui/dropdown-menu"
import { AdminAuthDialog } from '@/components/AdminAuthDialog';

interface UserAuthProps {
  users: UserType[];
  onLogin: (user: UserType, pin: string) => boolean;
  onCreateUser: (user: Omit<UserType, 'id'>) => void;
  onDeleteUser: (userId: string, pin: string) => boolean;
  onEditUser: (userId: string, pin: string, data: Partial<Omit<UserType, 'id' | 'pin'>>) => boolean;
}

export const UserAuth: React.FC<UserAuthProps> = ({ users, onLogin, onCreateUser, onDeleteUser, onEditUser }) => {
  const [selectedUser, setSelectedUser] = useState<UserType | null>(null);
  const [isCreateOpen, setCreateOpen] = useState(false);
  const [userToDelete, setUserToDelete] = useState<UserType | null>(null);
  const [userToEdit, setUserToEdit] = useState<UserType | null>(null);
  const [isAdminAuthOpen, setAdminAuthOpen] = useState(false);
  const [isAdminMode, setAdminMode] = useState(false);

  const handleAdminSuccess = () => {
    setAdminMode(true);
  };

  const handleSelectUser = (user: UserType) => {
    setSelectedUser(user);
  };

  const handleDeleteClick = (e: React.MouseEvent, user: UserType) => {
    e.stopPropagation();
    setUserToDelete(user);
  };

  const handleEditClick = (e: React.MouseEvent, user: UserType) => {
    e.stopPropagation();
    setUserToEdit(user);
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
          <User className="h-6 w-6" />
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
                className="text-center relative"
              >
                {isAdminMode && (
                  <div className="absolute top-2 right-2 z-10">
                    <DropdownMenu>
                      <DropdownMenuTrigger asChild>
                        <Button 
                          variant="ghost" 
                          size="icon"
                          className="h-7 w-7"
                          onClick={(e) => e.stopPropagation()}
                        >
                          <MoreHorizontal className="h-4 w-4" />
                          <span className="sr-only">Abrir menú</span>
                        </Button>
                      </DropdownMenuTrigger>
                      <DropdownMenuContent align="end">
                        <DropdownMenuItem onClick={(e) => handleEditClick(e, user)}>
                          Editar
                        </DropdownMenuItem>
                        <DropdownMenuItem 
                          className="text-destructive focus:text-destructive" 
                          onClick={(e) => handleDeleteClick(e, user)}
                        >
                          Eliminar
                        </DropdownMenuItem>
                      </DropdownMenuContent>
                    </DropdownMenu>
                  </div>
                )}

                <div className="cursor-pointer" onClick={() => handleSelectUser(user)}>
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
                      <User className="w-4 h-4 mr-2" />
                      <span>{user.name}</span>
                    </div>
                  </CardContent>
                </div>
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

      {userToDelete && (
        <DeleteUserDialog
          isOpen={!!userToDelete}
          onOpenChange={(isOpen) => !isOpen && setUserToDelete(null)}
          user={userToDelete}
          onDelete={onDeleteUser}
        />
      )}

      {userToEdit && (
        <EditUserDialog
          isOpen={!!userToEdit}
          onOpenChange={(isOpen) => !isOpen && setUserToEdit(null)}
          user={userToEdit}
          onEditUser={onEditUser}
        />
      )}
      <AdminAuthDialog isOpen={isAdminAuthOpen} onOpenChange={setAdminAuthOpen} onSuccess={handleAdminSuccess} />
    </div>
  );
};
