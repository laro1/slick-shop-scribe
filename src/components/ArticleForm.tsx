
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
    <Card className="w-full max-w-md">
      <CardHeader>
        <CardTitle>Registrar Artículo</CardTitle>
      </CardHeader>
      <CardContent>
        <form onSubmit={handleSubmit(handleFormSubmit)} className="space-y-4">
          <div className="space-y-2">
            <Label htmlFor="name">Nombre del Artículo</Label>
            <Input
              id="name"
              {...register('name', { required: 'El nombre es requerido' })}
              placeholder="Ingrese el nombre del artículo"
            />
            {errors.name && (
              <p className="text-sm text-destructive">{errors.name.message}</p>
            )}
          </div>

          <div className="space-y-2">
            <Label htmlFor="description">Descripción</Label>
            <Input
              id="description"
              {...register('description', { required: 'La descripción es requerida' })}
              placeholder="Descripción del artículo"
            />
            {errors.description && (
              <p className="text-sm text-destructive">{errors.description.message}</p>
            )}
          </div>

          <div className="space-y-2">
            <Label htmlFor="price">Precio</Label>
            <Input
              id="price"
              type="number"
              step="0.01"
              {...register('price', { 
                required: 'El precio es requerido',
                min: { value: 0, message: 'El precio debe ser mayor a 0' }
              })}
              placeholder="0.00"
            />
            {errors.price && (
              <p className="text-sm text-destructive">{errors.price.message}</p>
            )}
          </div>

          <div className="space-y-2">
            <Label htmlFor="stock">Stock Inicial</Label>
            <Input
              id="stock"
              type="number"
              {...register('stock', { 
                required: 'El stock es requerido',
                min: { value: 0, message: 'El stock no puede ser negativo' }
              })}
              placeholder="0"
            />
            {errors.stock && (
              <p className="text-sm text-destructive">{errors.stock.message}</p>
            )}
          </div>

          <Button type="submit" className="w-full">
            Registrar Artículo
          </Button>
        </form>
      </CardContent>
    </Card>
  );
};
