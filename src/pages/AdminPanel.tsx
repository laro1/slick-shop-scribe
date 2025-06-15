
import React, { useState } from 'react';
import { useNavigate } from 'react-router-dom';
import {
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
} from "@/components/ui/table";
import { Button } from '@/components/ui/button';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Building, User as UserIcon, Edit, Trash2 } from 'lucide-react';
import type { User } from '@/App';
import { CreateUserDialog } from '@/components/CreateUserDialog';
import { EditUserDialog } from '@/components/EditUserDialog';
import { DeleteUserDialog } from '@/components/DeleteUserDialog';

interface AdminPanelProps {
  users: User[];
  onCreateUser: (user: Omit<User, 'id'>) => void;
  onEditUser: (userId: string, pin: string, data: Partial<Omit<User, 'id' | 'pin'>>) => boolean;
  onDeleteUser: (userId: string, pin: string) => boolean;
  onAdminLogout: () => void;
}

export const AdminPanel: React.FC<AdminPanelProps> = ({ users, onCreateUser, onEditUser, onDeleteUser, onAdminLogout }) => {
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
        <div className="flex items-center justify-between mb-8">
          <h1 className="text-3xl font-bold">Panel de Administrador</h1>
          <div className="flex gap-2">
            <Button onClick={() => setCreateOpen(true)}>Crear Usuario</Button>
            <Button variant="outline" onClick={handleLogout}>Salir del modo admin</Button>
          </div>
        </div>
        
        <Card>
          <CardHeader>
            <CardTitle>Gestión de Usuarios</CardTitle>
          </CardHeader>
          <CardContent>
            <Table>
              <TableHeader>
                <TableRow>
                  <TableHead className="w-[80px]">Logo</TableHead>
                  <TableHead>Nombre del Negocio</TableHead>
                  <TableHead>Nombre de Usuario</TableHead>
                  <TableHead className="text-right">Acciones</TableHead>
                </TableRow>
              </TableHeader>
              <TableBody>
                {users.length > 0 ? users.map(user => (
                  <TableRow key={user.id}>
                    <TableCell>
                      <div className="w-10 h-10 rounded-full bg-primary/10 flex items-center justify-center">
                        {user.logoUrl ? (
                          <img src={user.logoUrl} alt={user.businessName} className="w-full h-full object-cover rounded-full" />
                        ) : (
                          <Building className="w-5 h-5 text-primary" />
                        )}
                      </div>
                    </TableCell>
                    <TableCell className="font-medium">{user.businessName}</TableCell>
                    <TableCell>{user.name}</TableCell>
                    <TableCell className="text-right">
                      <Button variant="ghost" size="icon" onClick={() => setUserToEdit(user)}>
                        <Edit className="h-4 w-4" />
                      </Button>
                      <Button variant="ghost" size="icon" className="text-destructive hover:text-destructive" onClick={() => setUserToDelete(user)}>
                        <Trash2 className="h-4 w-4" />
                      </Button>
                    </TableCell>
                  </TableRow>
                )) : (
                  <TableRow>
                    <TableCell colSpan={4} className="h-24 text-center">
                      No hay usuarios registrados.
                    </TableCell>
                  </TableRow>
                )}
              </TableBody>
            </Table>
          </CardContent>
        </Card>
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
