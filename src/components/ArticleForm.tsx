
import React from 'react';
import { useForm } from 'react-hook-form';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { ArticleFormData } from '@/types/inventory';
import { useToast } from '@/hooks/use-toast';

interface ArticleFormProps {
  onSubmit: (data: ArticleFormData) => void;
}

export const ArticleForm: React.FC<ArticleFormProps> = ({ onSubmit }) => {
  const { register, handleSubmit, reset, formState: { errors } } = useForm<ArticleFormData>();
  const { toast } = useToast();

  const handleFormSubmit = (data: ArticleFormData) => {
    try {
      onSubmit(data);
      reset();
      toast({
        title: "Artículo registrado",
        description: "El artículo se ha agregado correctamente al inventario.",
      });
    } catch (error) {
      toast({
        title: "Error",
        description: "Hubo un problema al registrar el artículo.",
        variant: "destructive",
      });
    }
  };

  return (
    <Card className="w-full">
      <CardHeader className="pb-4">
        <CardTitle className="text-lg sm:text-xl">Registrar Artículo</CardTitle>
      </CardHeader>
      <CardContent className="p-4 sm:p-6 pt-0">
        <form onSubmit={handleSubmit(handleFormSubmit)} className="space-y-4">
          <div className="space-y-2">
            <Label htmlFor="name" className="text-sm font-medium">Nombre del Artículo</Label>
            <Input
              id="name"
              {...register('name', { required: 'El nombre es requerido' })}
              placeholder="Ingrese el nombre del artículo"
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
              placeholder="Descripción del artículo"
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
                placeholder="0.00"
                className="text-sm"
              />
              {errors.price && (
                <p className="text-xs text-destructive">{errors.price.message}</p>
              )}
            </div>

            <div className="space-y-2">
              <Label htmlFor="stock" className="text-sm font-medium">Stock Inicial</Label>
              <Input
                id="stock"
                type="number"
                {...register('stock', { 
                  required: 'El stock es requerido',
                  min: { value: 0, message: 'El stock no puede ser negativo' }
                })}
                placeholder="0"
                className="text-sm"
              />
              {errors.stock && (
                <p className="text-xs text-destructive">{errors.stock.message}</p>
              )}
            </div>
          </div>

          <Button type="submit" className="w-full text-sm py-2">
            Registrar Artículo
          </Button>
        </form>
      </CardContent>
    </Card>
  );
};
