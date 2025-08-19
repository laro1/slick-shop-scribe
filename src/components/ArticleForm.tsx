
import React from 'react';
import { useForm } from 'react-hook-form';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { ArticleFormData } from '@/types/inventory';
import { useToast } from '@/hooks/use-toast';
import { useTranslation } from 'react-i18next';
import { Upload } from 'lucide-react';

interface ArticleFormProps {
  onSubmit: (data: ArticleFormData) => Promise<void>;
}

type ArticleFormValues = {
  name: string;
  price: number;
  stock: number;
  imageUrl: FileList;
};

export const ArticleForm: React.FC<ArticleFormProps> = ({ onSubmit }) => {
  const { register, handleSubmit, reset, formState: { errors, isSubmitting }, watch } = useForm<ArticleFormValues>();
  const { toast } = useToast();
  const { t } = useTranslation();
  const imageUrl = watch("imageUrl");

  const handleFormSubmit = async (data: ArticleFormValues) => {
    const imageFile = data.imageUrl?.[0];
    try {
      console.log('Submitting article data:', {
        name: data.name,
        price: data.price,
        stock: data.stock,
        imageFile: imageFile?.name || 'No image selected'
      });

      await onSubmit({
        name: data.name,
        price: data.price,
        stock: data.stock,
        imageUrl: imageFile ? URL.createObjectURL(imageFile) : '',
      });

      reset();
      toast({
        title: t('article_registered_success_title'),
        description: t('article_registered_success_description'),
      });
    } catch (error) {
      console.error('Error submitting article:', error);
      toast({
        title: t('error'),
        description: error instanceof Error ? error.message : t('article_registration_error_description'),
        variant: "destructive",
      });
    }
  };

  return (
    <Card className="w-full">
      <CardHeader className="pb-4">
        <CardTitle className="text-lg sm:text-xl">{t('register_article')}</CardTitle>
      </CardHeader>
      <CardContent className="p-4 sm:p-6 pt-0">
        <form onSubmit={handleSubmit(handleFormSubmit)} className="space-y-4">
          <div className="space-y-2">
            <Label htmlFor="name" className="text-sm font-medium">{t('article_name')}</Label>
            <Input
              id="name"
              {...register('name', { required: t('name_required') })}
              placeholder={t('article_name_placeholder')}
              className="text-sm"
            />
            {errors.name && (
              <p className="text-xs text-destructive">{errors.name.message}</p>
            )}
          </div>

          <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
            <div className="space-y-2">
              <Label htmlFor="price" className="text-sm font-medium">{t('price')}</Label>
              <Input
                id="price"
                type="number"
                step="0.01"
                {...register('price', { 
                  required: t('price_required'),
                  valueAsNumber: true,
                  min: { value: 0.01, message: t('price_positive') }
                })}
                placeholder="0.00"
                className="text-sm"
              />
              {errors.price && (
                <p className="text-xs text-destructive">{errors.price.message}</p>
              )}
            </div>

            <div className="space-y-2">
              <Label htmlFor="stock" className="text-sm font-medium">{t('initial_stock')}</Label>
              <Input
                id="stock"
                type="number"
                {...register('stock', { 
                  required: t('stock_required'),
                  valueAsNumber: true,
                  min: { value: 0, message: t('stock_not_negative') }
                })}
                placeholder="0"
                className="text-sm"
              />
              {errors.stock && (
                <p className="text-xs text-destructive">{errors.stock.message}</p>
              )}
            </div>
          </div>

          <div className="space-y-2">
            <Label className="text-sm font-medium">{t('article_image')}</Label>
            <div className="flex items-center gap-2">
                <Input
                  id="imageUrl"
                  type="file"
                  accept="image/*"
                  className="hidden"
                  {...register('imageUrl')}
                />
                <Label
                    htmlFor="imageUrl"
                    className="inline-flex items-center gap-2 cursor-pointer rounded-md border border-input bg-transparent px-3 py-2 text-sm shadow-sm transition-colors hover:bg-accent hover:text-accent-foreground"
                >
                    <Upload className="h-4 w-4" />
                    <span>{t('select_file_button')}</span>
                </Label>
                {imageUrl?.[0] && (
                    <span className="text-sm text-muted-foreground truncate flex-1">{imageUrl[0].name}</span>
                )}
            </div>
            {errors.imageUrl && (
              <p className="text-xs text-destructive">{errors.imageUrl.message}</p>
            )}
          </div>

          <Button type="submit" className="w-full text-sm py-2" disabled={isSubmitting}>
            {isSubmitting ? 'Registrando...' : t('register_article')}
          </Button>
        </form>
      </CardContent>
    </Card>
  );
};
