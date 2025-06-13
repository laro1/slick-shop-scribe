
import React from 'react';
import { useForm } from 'react-hook-form';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import { Article, SaleFormData } from '@/types/inventory';
import { useToast } from '@/hooks/use-toast';

interface SaleFormProps {
  articles: Article[];
  onSubmit: (data: SaleFormData) => void;
}

export const SaleForm: React.FC<SaleFormProps> = ({ articles, onSubmit }) => {
  const { register, handleSubmit, reset, setValue, watch, formState: { errors } } = useForm<SaleFormData>();
  const { toast } = useToast();
  const selectedArticleId = watch('articleId');
  const selectedArticle = articles.find(a => a.id === selectedArticleId);

  const handleFormSubmit = (data: SaleFormData) => {
    try {
      onSubmit(data);
      reset();
      toast({
        title: "Venta registrada",
        description: "La venta se ha registrado correctamente.",
      });
    } catch (error) {
      toast({
        title: "Error",
        description: error instanceof Error ? error.message : "Hubo un problema al registrar la venta.",
        variant: "destructive",
      });
    }
  };

  const availableArticles = articles.filter(article => article.stock > 0);

  if (availableArticles.length === 0) {
    return (
      <Card className="w-full max-w-md">
        <CardHeader>
          <CardTitle>Registrar Venta</CardTitle>
        </CardHeader>
        <CardContent>
          <p className="text-muted-foreground text-center py-4">
            No hay artículos disponibles para venta.
            Registre artículos primero.
          </p>
        </CardContent>
      </Card>
    );
  }

  return (
    <Card className="w-full max-w-md">
      <CardHeader>
        <CardTitle>Registrar Venta</CardTitle>
      </CardHeader>
      <CardContent>
        <form onSubmit={handleSubmit(handleFormSubmit)} className="space-y-4">
          <div className="space-y-2">
            <Label htmlFor="articleId">Artículo</Label>
            <Select onValueChange={(value) => setValue('articleId', value)}>
              <SelectTrigger>
                <SelectValue placeholder="Seleccione un artículo" />
              </SelectTrigger>
              <SelectContent>
                {availableArticles.map((article) => (
                  <SelectItem key={article.id} value={article.id}>
                    {article.name} - Stock: {article.stock} - ${article.price}
                  </SelectItem>
                ))}
              </SelectContent>
            </Select>
            {errors.articleId && (
              <p className="text-sm text-destructive">Debe seleccionar un artículo</p>
            )}
          </div>

          {selectedArticle && (
            <div className="p-3 bg-muted rounded-md">
              <p className="text-sm font-medium">{selectedArticle.name}</p>
              <p className="text-sm text-muted-foreground">{selectedArticle.description}</p>
              <p className="text-sm">Precio: ${selectedArticle.price}</p>
              <p className="text-sm">Stock disponible: {selectedArticle.stock}</p>
            </div>
          )}

          <div className="space-y-2">
            <Label htmlFor="quantity">Cantidad</Label>
            <Input
              id="quantity"
              type="number"
              {...register('quantity', { 
                required: 'La cantidad es requerida',
                min: { value: 1, message: 'La cantidad debe ser mayor a 0' },
                max: selectedArticle ? { value: selectedArticle.stock, message: 'Cantidad excede el stock disponible' } : undefined
              })}
              placeholder="1"
            />
            {errors.quantity && (
              <p className="text-sm text-destructive">{errors.quantity.message}</p>
            )}
          </div>

          <div className="space-y-2">
            <Label htmlFor="buyerName">Nombre del Comprador</Label>
            <Input
              id="buyerName"
              {...register('buyerName', { required: 'El nombre del comprador es requerido' })}
              placeholder="Ingrese el nombre del comprador"
            />
            {errors.buyerName && (
              <p className="text-sm text-destructive">{errors.buyerName.message}</p>
            )}
          </div>

          <Button type="submit" className="w-full">
            Registrar Venta
          </Button>
        </form>
      </CardContent>
    </Card>
  );
};
