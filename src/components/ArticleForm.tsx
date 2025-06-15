
import React from 'react';
import { useForm } from 'react-hook-form';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { ArticleFormData } from '@/types/inventory';
import { useToast } from '@/hooks/use-toast';
import { useTranslation } from 'react-i18next';

interface ArticleFormProps {
  onSubmit: (data: ArticleFormData) => void;
}

type ArticleFormValues = {
  name: string;
  price: number;
  stock: number;
  imageUrl: FileList;
};

export const ArticleForm: React.FC<ArticleFormProps> = ({ onSubmit }) => {
  const { register, handleSubmit, reset, formState: { errors } } = useForm<ArticleFormValues>();
  const { toast } = useToast();
  const { t } = useTranslation();

  const handleFormSubmit = (data: ArticleFormValues) => {
    const imageFile = data.imageUrl?.[0];
    try {
      if (!imageFile) {
        toast({
          title: t('error'),
          description: t('image_selection_error'),
          variant: "destructive",
        });
        return;
      }

      onSubmit({
        name: data.name,
        price: data.price,
        stock: data.stock,
        imageUrl: URL.createObjectURL(imageFile),
      });

      reset();
      toast({
        title: t('article_registered_success_title'),
        description: t('article_registered_success_description'),
      });
    } catch (error) {
      toast({
        title: t('error'),
        description: t('article_registration_error_description'),
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

          <div className="grid grid-cols-2 gap-3">
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
            <Label htmlFor="imageUrl" className="text-sm font-medium">{t('article_image')}</Label>
            <Input
              id="imageUrl"
              type="file"
              accept="image/*"
              {...register('imageUrl', { required: t('image_required') })}
              className="text-sm file:mr-4 file:py-2 file:px-4 file:rounded-md file:border-0 file:text-sm file:font-semibold file:bg-primary/10 file:text-primary hover:file:bg-primary/20 cursor-pointer"
            />
            {errors.imageUrl && (
              <p className="text-xs text-destructive">{errors.imageUrl.message}</p>
            )}
          </div>

          <Button type="submit" className="w-full text-sm py-2">
            {t('register_article')}
          </Button>
        </form>
      </CardContent>
    </Card>
  );
};
