
import React from 'react';
import { Controller, Control, FieldErrors } from 'react-hook-form';
import { Label } from '@/components/ui/label';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import { Article, SaleFormData } from '@/types/inventory';
import { formatCurrency } from '@/lib/utils';
import { useTranslation } from 'react-i18next';

interface ArticleSelectorProps {
  control: Control<SaleFormData>;
  errors: FieldErrors<SaleFormData>;
  availableArticles: Article[];
}

export const ArticleSelector: React.FC<ArticleSelectorProps> = ({ control, errors, availableArticles }) => {
  const { t } = useTranslation();
  
  return (
    <div className="space-y-2">
      <Label htmlFor="articleId" className="text-sm font-medium">{t('article')}</Label>
      <Controller
        name="articleId"
        control={control}
        rules={{ required: t('article_selection_required') }}
        render={({ field }) => (
          <Select onValueChange={field.onChange} value={field.value || ''}>
            <SelectTrigger className="text-sm">
              <SelectValue placeholder={t('select_article_placeholder')} />
            </SelectTrigger>
            <SelectContent>
              {availableArticles.map((article) => (
                <SelectItem key={article.id} value={article.id} className="text-sm">
                  <div className="flex items-center gap-3 w-full">
                    <div className="flex-shrink-0">
                      {article.imageUrl ? (
                        <img 
                          src={article.imageUrl} 
                          alt={article.name} 
                          className="w-8 h-8 object-cover rounded border"
                          onError={(e) => {
                            e.currentTarget.style.display = 'none';
                          }}
                        />
                      ) : (
                        <div className="w-8 h-8 bg-secondary rounded flex items-center justify-center">
                          <span className="text-xs">📦</span>
                        </div>
                      )}
                    </div>
                    <div className="flex-1 min-w-0">
                      <div className="font-medium truncate">{article.name}</div>
                      <div className="text-xs text-muted-foreground flex justify-between">
                        <span>{t('stock_label')}{article.stock}</span>
                        <span>{formatCurrency(article.price)}</span>
                        {article.stock <= 5 && (
                          <span className="text-yellow-600 ml-1">{t('low_stock_label')}</span>
                        )}
                      </div>
                    </div>
                  </div>
                </SelectItem>
              ))}
            </SelectContent>
          </Select>
        )}
      />
      {errors.articleId && (
        <p className="text-xs text-destructive">{errors.articleId.message}</p>
      )}
    </div>
  );
};
