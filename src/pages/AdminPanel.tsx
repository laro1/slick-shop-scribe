
import React, { useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { Button } from '@/components/ui/button';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import type { User } from '@/App';
import { CreateUserDialog } from '@/components/CreateUserDialog';
import { EditUserDialog } from '@/components/EditUserDialog';
import { DeleteUserDialog } from '@/components/DeleteUserDialog';
import { UserManagement } from '@/components/admin/UserManagement';
import { InventorySettings } from '@/components/admin/InventorySettings';
import { SecuritySettings } from '@/components/admin/SecuritySettings';

interface AdminPanelProps {
  users: User[];
  onCreateUser: (user: Omit<User, 'id' | 'role' | 'isActive'>) => void;
  onEditUser: (userId: string, pin: string, data: Partial<Omit<User, 'id' | 'pin'>>) => boolean;
  onDeleteUser: (userId: string, pin: string) => boolean;
  onAdminLogout: () => void;
  onToggleUserStatus: (userId: string) => void;
  productCategories: string[];
  onAddCategory: (category: string) => void;
  onDeleteCategory: (category: string) => void;
  lowStockThreshold: number;
  onSetLowStockThreshold: (threshold: number) => void;
  enableLotAndExpiry: boolean;
  onSetEnableLotAndExpiry: (enabled: boolean) => void;
  sessionTimeout: number;
  onSetSessionTimeout: (minutes: number) => void;
}

export const AdminPanel: React.FC<AdminPanelProps> = ({ users, onCreateUser, onEditUser, onDeleteUser, onAdminLogout, onToggleUserStatus, productCategories, onAddCategory, onDeleteCategory, lowStockThreshold, onSetLowStockThreshold, enableLotAndExpiry, onSetEnableLotAndExpiry, sessionTimeout, onSetSessionTimeout }) => {
  const navigate = useNavigate();
  const [isCreateOpen, setCreateOpen] = useState(false);
  const [userToEdit, setUserToEdit] = useState<User | null>(null);
  const [userToDelete, setUserToDelete] = useState<User | null>(null);

  const handleLogout = () => {
    onAdminLogout();
    navigate('/');
  };
  
  return (
    <div className="min-h-screen bg-muted/40 p-4 sm:p-8">
      <div className="max-w-7xl mx-auto">
        <div className="flex flex-col sm:flex-row items-start sm:items-center justify-between gap-4 mb-8">
          <h1 className="text-2xl sm:text-3xl font-bold">Panel de Administrador</h1>
          <div className="flex gap-2 self-end sm:self-auto">
            <Button onClick={() => setCreateOpen(true)}>Crear Usuario</Button>
            <Button variant="outline" onClick={handleLogout}>Salir del modo admin</Button>
          </div>
        </div>
        
        <Card>
          <CardHeader>
            <CardTitle>Gestión de Usuarios</CardTitle>
          </CardHeader>
          <CardContent>
            <UserManagement
              users={users}
              onToggleUserStatus={onToggleUserStatus}
              onEditUserClick={setUserToEdit}
              onDeleteUserClick={setUserToDelete}
            />
          </CardContent>
        </Card>

        <InventorySettings
          productCategories={productCategories}
          onAddCategory={onAddCategory}
          onDeleteCategory={onDeleteCategory}
          lowStockThreshold={lowStockThreshold}
          onSetLowStockThreshold={onSetLowStockThreshold}
          enableLotAndExpiry={enableLotAndExpiry}
          onSetEnableLotAndExpiry={onSetEnableLotAndExpiry}
        />

        <SecuritySettings 
          sessionTimeout={sessionTimeout}
          onSetSessionTimeout={onSetSessionTimeout}
        />
      </div>

      <CreateUserDialog
        isOpen={isCreateOpen}
        onOpenChange={setCreateOpen}
        onCreateUser={onCreateUser}
      />
      
      {userToEdit && (
        <EditUserDialog
          isOpen={!!userToEdit}
          onOpenChange={(isOpen) => !isOpen && setUserToEdit(null)}
          user={userToEdit}
          onEditUser={onEditUser}
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
    </div>
  );
};
