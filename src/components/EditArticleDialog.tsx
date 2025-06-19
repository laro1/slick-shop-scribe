
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
  onSubmit: (data: EditArticleData) => Promise<void>;
}

type EditArticleFormValues = {
    id: string;
    name: string;
    price: number;
    stock: number;
    imageUrl: FileList;
};

export const EditArticleDialog: React.FC<EditArticleDialogProps> = ({
  article,
  open,
  onOpenChange,
  onSubmit,
}) => {
  const { register, handleSubmit, reset, formState: { errors, isSubmitting } } = useForm<EditArticleFormValues>();
  const { toast } = useToast();

  React.useEffect(() => {
    if (article) {
      console.log('Inicializando formulario con artículo:', article);
      reset({
        id: article.id,
        name: article.name,
        price: article.price,
        stock: article.stock,
      });
    }
  }, [article, reset]);

  const handleFormSubmit = async (data: EditArticleFormValues) => {
    if (!article) return;
    
    console.log('=== ENVIANDO DATOS DEL FORMULARIO DE EDICIÓN ===');
    console.log('Datos del formulario:', data);
    console.log('Artículo original:', article);
    
    try {
      const imageFile = data.imageUrl?.[0];
      const newImageUrl = imageFile ? URL.createObjectURL(imageFile) : article.imageUrl;
      
      const updateData: EditArticleData = {
        id: article.id,
        name: data.name,
        price: Number(data.price),
        stock: Number(data.stock),
        imageUrl: newImageUrl,
      };
      
      console.log('Datos preparados para enviar a la mutación:', updateData);
      
      await onSubmit(updateData);
      
      onOpenChange(false);
      toast({
        title: "Artículo actualizado",
        description: "El artículo se ha actualizado correctamente.",
      });
    } catch (error) {
      console.error('Error en handleFormSubmit:', error);
      toast({
        title: "Error",
        description: error instanceof Error ? error.message : "Hubo un problema al actualizar el artículo.",
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

          <div className="grid grid-cols-2 gap-3">
            <div className="space-y-2">
              <Label htmlFor="price" className="text-sm font-medium">Precio</Label>
              <Input
                id="price"
                type="number"
                step="0.01"
                {...register('price', { 
                  required: 'El precio es requerido',
                  valueAsNumber: true,
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
                  valueAsNumber: true,
                  min: { value: 0, message: 'El stock no puede ser negativo' }
                })}
                className="text-sm"
              />
              {errors.stock && (
                <p className="text-xs text-destructive">{errors.stock.message}</p>
              )}
            </div>
          </div>

          <div className="space-y-2">
            <Label htmlFor="imageUrl" className="text-sm font-medium">Imagen del Artículo</Label>
            {article.imageUrl && (
                <div className="relative">
                  <img 
                    src={article.imageUrl} 
                    alt={article.name} 
                    className="w-full h-32 object-cover rounded-md mt-1 mb-2"
                    onError={(e) => {
                      console.error('Error loading image in edit dialog:', article.imageUrl);
                      e.currentTarget.style.display = 'none';
                    }}
                  />
                </div>
            )}
            <Input
              id="imageUrl"
              type="file"
              accept="image/*"
              {...register('imageUrl')}
              className="text-sm file:mr-4 file:py-2 file:px-4 file:rounded-md file:border-0 file:text-sm file:font-semibold file:bg-primary/10 file:text-primary hover:file:bg-primary/20 cursor-pointer"
            />
            <p className="text-xs text-muted-foreground">
              {article.imageUrl ? 'Sube una nueva imagen para reemplazar la actual (opcional).' : 'Sube una imagen para el artículo.'}
            </p>
            {errors.imageUrl && (
              <p className="text-xs text-destructive">{errors.imageUrl.message}</p>
            )}
          </div>

          <div className="flex gap-2">
            <Button type="submit" className="flex-1" disabled={isSubmitting}>
              {isSubmitting ? 'Actualizando...' : 'Actualizar'}
            </Button>
            <Button 
              type="button" 
              variant="outline" 
              onClick={() => onOpenChange(false)}
              className="flex-1"
              disabled={isSubmitting}
            >
              Cancelar
            </Button>
          </div>
        </form>
      </DialogContent>
    </Dialog>
  );
};
