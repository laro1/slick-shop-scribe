import React from 'react';
import { useForm } from 'react-hook-form';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import { Alert, AlertDescription } from '@/components/ui/alert';
import { Article, SaleFormData } from '@/types/inventory';
import { useToast } from '@/hooks/use-toast';
import { AlertTriangle, Package, ImageIcon } from 'lucide-react';

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
      setValue('articleId', ''); // Reset select value
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
  const lowStockArticles = articles.filter(article => article.stock > 0 && article.stock <= 5);

  if (articles.length === 0) {
    return (
      <Card className="w-full">
        <CardHeader className="pb-4">
          <CardTitle className="text-lg sm:text-xl">Registrar Venta</CardTitle>
        </CardHeader>
        <CardContent className="p-4 sm:p-6 pt-0">
          <Alert>
            <Package className="h-4 w-4" />
            <AlertDescription className="text-sm">
              <strong>No hay artículos registrados.</strong><br />
              Primero debe registrar artículos antes de poder realizar ventas.
            </AlertDescription>
          </Alert>
        </CardContent>
      </Card>
    );
  }

  if (availableArticles.length === 0) {
    return (
      <Card className="w-full">
        <CardHeader className="pb-4">
          <CardTitle className="text-lg sm:text-xl">Registrar Venta</CardTitle>
        </CardHeader>
        <CardContent className="p-4 sm:p-6 pt-0">
          <Alert variant="destructive">
            <AlertTriangle className="h-4 w-4" />
            <AlertDescription className="text-sm">
              <strong>No hay artículos disponibles para venta.</strong><br />
              Todos los artículos están agotados. Actualice el stock de sus artículos.
            </AlertDescription>
          </Alert>
        </CardContent>
      </Card>
    );
  }

  return (
    <Card className="w-full">
      <CardHeader className="pb-4">
        <CardTitle className="text-lg sm:text-xl">Registrar Venta</CardTitle>
      </CardHeader>
      <CardContent className="p-4 sm:p-6 pt-0">
        {lowStockArticles.length > 0 && (
          <Alert className="mb-4">
            <AlertTriangle className="h-4 w-4" />
            <AlertDescription className="text-sm">
              <strong>Advertencia:</strong> {lowStockArticles.length} artículo(s) tienen stock bajo (≤5 unidades)
            </AlertDescription>
          </Alert>
        )}

        <form onSubmit={handleSubmit(handleFormSubmit)} className="space-y-4">
          <div className="space-y-2">
            <Label htmlFor="articleId" className="text-sm font-medium">Artículo</Label>
            <Select onValueChange={(value) => setValue('articleId', value)}>
              <SelectTrigger className="text-sm">
                <SelectValue placeholder="Seleccione un artículo" />
              </SelectTrigger>
              <SelectContent>
                {availableArticles.map((article) => (
                  <SelectItem key={article.id} value={article.id} className="text-sm">
                    <div className="flex flex-col">
                      <span className="font-medium">{article.name}</span>
                      <span className="text-xs text-muted-foreground">
                        Stock: {article.stock} - ${article.price}
                        {article.stock <= 5 && (
                          <span className="text-yellow-600 ml-1">⚠️ Stock bajo</span>
                        )}
                      </span>
                    </div>
                  </SelectItem>
                ))}
              </SelectContent>
            </Select>
            {errors.articleId && (
              <p className="text-xs text-destructive">Debe seleccionar un artículo</p>
            )}
          </div>

          {selectedArticle && (
            <div className="p-3 bg-muted rounded-md border flex items-center gap-3">
              <img src={selectedArticle.imageUrl} alt={selectedArticle.name} className="w-12 h-12 object-cover rounded" />
              <div className="flex-1">
                <p className="text-sm font-medium">{selectedArticle.name}</p>
                <div className="flex justify-between text-xs">
                  <span>Precio: ${selectedArticle.price}</span>
                  <span className={selectedArticle.stock <= 5 ? "text-yellow-600 font-medium" : ""}>
                    Stock: {selectedArticle.stock}
                    {selectedArticle.stock <= 5 && " ⚠️"}
                  </span>
                </div>
              </div>
            </div>
          )}

          <div className="grid grid-cols-2 gap-3">
            <div className="space-y-2">
              <Label htmlFor="quantity" className="text-sm font-medium">Cantidad</Label>
              <Input
                id="quantity"
                type="number"
                {...register('quantity', { 
                  required: 'La cantidad es requerida',
                  min: { value: 1, message: 'La cantidad debe ser mayor a 0' },
                  max: selectedArticle ? { value: selectedArticle.stock, message: 'Cantidad excede el stock disponible' } : undefined
                })}
                placeholder="1"
                className="text-sm"
              />
              {errors.quantity && (
                <p className="text-xs text-destructive">{errors.quantity.message}</p>
              )}
            </div>

            <div className="space-y-2 col-span-2 sm:col-span-1">
              <Label htmlFor="buyerName" className="text-sm font-medium">Nombre del Comprador</Label>
              <Input
                id="buyerName"
                {...register('buyerName', { required: 'El nombre del comprador es requerido' })}
                placeholder="Ingrese el nombre del comprador"
                className="text-sm"
              />
              {errors.buyerName && (
                <p className="text-xs text-destructive">{errors.buyerName.message}</p>
              )}
            </div>
          </div>

          <Button type="submit" className="w-full text-sm py-2">
            Registrar Venta
          </Button>
        </form>
      </CardContent>
    </Card>
  );
};
