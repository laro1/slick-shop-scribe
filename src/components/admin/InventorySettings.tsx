
import React, { useState } from 'react';
import { Button } from '@/components/ui/button';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Input } from '@/components/ui/input';
import { X } from 'lucide-react';

interface InventorySettingsProps {
  productCategories: string[];
  onAddCategory: (category: string) => void;
  onDeleteCategory: (category: string) => void;
}

export const InventorySettings: React.FC<InventorySettingsProps> = ({ productCategories, onAddCategory, onDeleteCategory }) => {
  const [newCategory, setNewCategory] = useState('');

  const handleAddCategoryClick = () => {
    if (newCategory.trim()) {
      onAddCategory(newCategory.trim());
      setNewCategory('');
    }
  };

  return (
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
  );
};
