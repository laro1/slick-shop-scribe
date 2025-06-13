
import React from 'react';
import { useForm } from 'react-hook-form';
import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
} from '@/components/ui/dialog';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Article, EditArticleData } from '@/types/inventory';
import { useToast } from '@/hooks/use-toast';

interface EditArticleDialogProps {
  article: Article | null;
  open: boolean;
  onOpenChange: (open: boolean) => void;
  onSubmit: (data: EditArticleData) => void;
}

export const EditArticleDialog: React.FC<EditArticleDialogProps> = ({
  article,
  open,
  onOpenChange,
  onSubmit,
}) => {
  const { register, handleSubmit, reset, formState: { errors } } = useForm<EditArticleData>();
  const { toast } = useToast();

  React.useEffect(() => {
    if (article) {
      reset({
        id: article.id,
        name: article.name,
        description: article.description,
        price: article.price,
        stock: article.stock,
      });
    }
  }, [article, reset]);

  const handleFormSubmit = (data: EditArticleData) => {
    try {
      onSubmit(data);
      onOpenChange(false);
      toast({
        title: "Artículo actualizado",
        description: "El artículo se ha actualizado correctamente.",
      });
    } catch (error) {
      toast({
        title: "Error",
        description: "Hubo un problema al actualizar el artículo.",
        variant: "destructive",
      });
    }
  };

  if (!article) return null;

  return (
    <Dialog open={open} onOpenChange={onOpenChange}>
      <DialogContent className="sm:max-w-md">
        <DialogHeader>
          <DialogTitle>Editar Artículo</DialogTitle>
        </DialogHeader>
        <form onSubmit={handleSubmit(handleFormSubmit)} className="space-y-4">
          <div className="space-y-2">
            <Label htmlFor="name" className="text-sm font-medium">Nombre del Artículo</Label>
            <Input
              id="name"
              {...register('name', { required: 'El nombre es requerido' })}
              className="text-sm"
            />
            {errors.name && (
              <p className="text-xs text-destructive">{errors.name.message}</p>
            )}
          </div>

          <div className="space-y-2">
            <Label htmlFor="description" className="text-sm font-medium">Descripción</Label>
            <Input
              id="description"
              {...register('description', { required: 'La descripción es requerida' })}
              className="text-sm"
            />
            {errors.description && (
              <p className="text-xs text-destructive">{errors.description.message}</p>
            )}
          </div>

          <div className="grid grid-cols-2 gap-3">
            <div className="space-y-2">
              <Label htmlFor="price" className="text-sm font-medium">Precio</Label>
              <Input
                id="price"
                type="number"
                step="0.01"
                {...register('price', { 
                  required: 'El precio es requerido',
                  min: { value: 0, message: 'El precio debe ser mayor a 0' }
                })}
                className="text-sm"
              />
              {errors.price && (
                <p className="text-xs text-destructive">{errors.price.message}</p>
              )}
            </div>

            <div className="space-y-2">
              <Label htmlFor="stock" className="text-sm font-medium">Stock</Label>
              <Input
                id="stock"
                type="number"
                {...register('stock', { 
                  required: 'El stock es requerido',
                  min: { value: 0, message: 'El stock no puede ser negativo' }
                })}
                className="text-sm"
              />
              {errors.stock && (
                <p className="text-xs text-destructive">{errors.stock.message}</p>
              )}
            </div>
          </div>

          <div className="flex gap-2">
            <Button type="submit" className="flex-1">
              Actualizar
            </Button>
            <Button 
              type="button" 
              variant="outline" 
              onClick={() => onOpenChange(false)}
              className="flex-1"
            >
              Cancelar
            </Button>
          </div>
        </form>
      </DialogContent>
    </Dialog>
  );
};
