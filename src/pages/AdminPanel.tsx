
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
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Building, Edit, Trash2, X } from 'lucide-react';
import type { User } from '@/App';
import { CreateUserDialog } from '@/components/CreateUserDialog';
import { EditUserDialog } from '@/components/EditUserDialog';
import { DeleteUserDialog } from '@/components/DeleteUserDialog';
import { Switch } from '@/components/ui/switch';
import { Input } from '@/components/ui/input';

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
}

export const AdminPanel: React.FC<AdminPanelProps> = ({ users, onCreateUser, onEditUser, onDeleteUser, onAdminLogout, onToggleUserStatus, productCategories, onAddCategory, onDeleteCategory }) => {
  const navigate = useNavigate();
  const [isCreateOpen, setCreateOpen] = useState(false);
  const [userToEdit, setUserToEdit] = useState<User | null>(null);
  const [userToDelete, setUserToDelete] = useState<User | null>(null);
  const [newCategory, setNewCategory] = useState('');

  const handleLogout = () => {
    onAdminLogout();
    navigate('/');
  };

  const handleAddCategoryClick = () => {
    if (newCategory.trim()) {
      onAddCategory(newCategory.trim());
      setNewCategory('');
    }
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
            {/* Desktop Table View */}
            <div className="hidden sm:block">
              <Table>
                <TableHeader>
                  <TableRow>
                    <TableHead className="w-[80px]">Logo</TableHead>
                    <TableHead>Nombre del Negocio</TableHead>
                    <TableHead>Nombre de Usuario</TableHead>
                    <TableHead>Rol</TableHead>
                    <TableHead>Estado</TableHead>
                    <TableHead className="text-right">Acciones</TableHead>
                  </TableRow>
                </TableHeader>
                <TableBody>
                  {users.length > 0 ? users.map(user => (
                    <TableRow key={user.id} className={!user.isActive ? 'bg-muted/50' : ''}>
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
                      <TableCell>
                        <span className="inline-flex items-center rounded-md bg-muted px-2 py-1 text-xs font-medium text-muted-foreground">
                          {user.role}
                        </span>
                      </TableCell>
                      <TableCell>
                        <div className="flex items-center gap-2">
                          <Switch
                            checked={user.isActive}
                            onCheckedChange={() => onToggleUserStatus(user.id)}
                            aria-label="Activar o desactivar cuenta"
                          />
                           <span className={user.isActive ? 'text-green-600' : 'text-red-600'}>
                            {user.isActive ? 'Activo' : 'Inactivo'}
                           </span>
                        </div>
                      </TableCell>
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
                      <TableCell colSpan={6} className="h-24 text-center">
                        No hay usuarios registrados.
                      </TableCell>
                    </TableRow>
                  )}
                </TableBody>
              </Table>
            </div>

            {/* Mobile Card View */}
            <div className="sm:hidden space-y-4">
              {users.length > 0 ? users.map(user => (
                <div key={user.id} className={`border rounded-lg p-4 ${!user.isActive ? 'bg-muted/50' : ''}`}>
                  <div className="flex items-start justify-between gap-2 mb-3">
                    <div className="flex items-center gap-3 overflow-hidden">
                      <div className="w-10 h-10 rounded-full bg-primary/10 flex items-center justify-center shrink-0">
                        {user.logoUrl ? (
                          <img src={user.logoUrl} alt={user.businessName} className="w-full h-full object-cover rounded-full" />
                        ) : (
                          <Building className="w-5 h-5 text-primary" />
                        )}
                      </div>
                      <div className="truncate">
                        <p className="font-medium truncate">{user.businessName}</p>
                        <p className="text-sm text-muted-foreground truncate">{user.name}</p>
                      </div>
                    </div>
                    <div className="flex shrink-0 -mr-2 -mt-2">
                      <Button variant="ghost" size="icon" onClick={() => setUserToEdit(user)}>
                        <Edit className="h-4 w-4" />
                      </Button>
                      <Button variant="ghost" size="icon" className="text-destructive hover:text-destructive" onClick={() => setUserToDelete(user)}>
                        <Trash2 className="h-4 w-4" />
                      </Button>
                    </div>
                  </div>
                  <div className="border-t pt-3 space-y-2 text-sm">
                    <div className="flex justify-between items-center">
                      <span className="text-muted-foreground">Rol:</span>
                      <span className="inline-flex items-center rounded-md bg-muted px-2 py-1 text-xs font-medium text-muted-foreground">
                        {user.role}
                      </span>
                    </div>
                    <div className="flex justify-between items-center">
                      <span className="text-muted-foreground">Estado:</span>
                      <div className="flex items-center gap-2">
                        <Switch
                          id={`status-${user.id}`}
                          checked={user.isActive}
                          onCheckedChange={() => onToggleUserStatus(user.id)}
                        />
                        <label htmlFor={`status-${user.id}`} className={user.isActive ? 'font-medium text-green-700' : 'font-medium text-red-700'}>
                          {user.isActive ? 'Activo' : 'Inactivo'}
                        </label>
                      </div>
                    </div>
                  </div>
                </div>
              )) : (
                <div className="text-center py-10">
                  <p className="text-muted-foreground">No hay usuarios registrados.</p>
                </div>
              )}
            </div>
          </CardContent>
        </Card>

        <Card className="mt-8">
          <CardHeader>
            <CardTitle>Configuración de Inventario</CardTitle>
            <CardDescription>
              Gestiona las categorías de productos y otras configuraciones globales del inventario.
            </CardDescription>
          </CardHeader>
          <CardContent>
            <div>
              <h3 className="text-lg font-medium">Categorías de productos</h3>
              <p className="text-sm text-muted-foreground mb-4">
                Crea y elimina las categorías que se usarán en los productos.
              </p>
              <div className="flex w-full max-w-sm items-center space-x-2 mb-4">
                <Input
                  type="text"
                  placeholder="Ej: Bebidas"
                  value={newCategory}
                  onChange={(e) => setNewCategory(e.target.value)}
                  onKeyDown={(e) => e.key === 'Enter' && handleAddCategoryClick()}
                />
                <Button onClick={handleAddCategoryClick}>Agregar</Button>
              </div>
              <div className="flex flex-wrap gap-2">
                {productCategories.length > 0 ? productCategories.map(category => (
                  <div key={category} className="flex items-center gap-1 bg-muted rounded-full px-3 py-1 text-sm">
                    <span>{category}</span>
                    <button onClick={() => onDeleteCategory(category)} className="text-muted-foreground hover:text-destructive rounded-full -mr-1 p-0.5">
                      <X className="h-4 w-4" />
                      <span className="sr-only">Eliminar {category}</span>
                    </button>
                  </div>
                )) : (
                  <p className="text-sm text-muted-foreground">No hay categorías. Agrega la primera.</p>
                )}
              </div>
            </div>

            <div className="border-t pt-6 mt-6">
              <h3 className="text-lg font-medium">Niveles de Stock y Alertas</h3>
              <p className="text-sm text-muted-foreground">
                Próximamente: Aquí podrás configurar los niveles de stock mínimo para generar alertas.
              </p>
            </div>

            <div className="border-t pt-6 mt-6">
              <h3 className="text-lg font-medium">Control de Lotes y Caducidad</h3>
              <p className="text-sm text-muted-foreground">
                Próximamente: Activa y gestiona el seguimiento de productos por lote o fecha de caducidad.
              </p>
            </div>
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
