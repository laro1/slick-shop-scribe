
import React from 'react';
import { Alert, AlertDescription } from '@/components/ui/alert';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Article } from '@/types/inventory';
import { AlertTriangle, Package } from 'lucide-react';
import { useTranslation } from 'react-i18next';

interface SaleFormAlertsProps {
  articles: Article[];
  availableArticles: Article[];
  lowStockArticles: Article[];
}

export const SaleFormAlerts: React.FC<SaleFormAlertsProps> = ({ articles, availableArticles, lowStockArticles }) => {
  const { t } = useTranslation();
  const lowStockThreshold = localStorage.getItem("inventory_low_stock_threshold")
    ? JSON.parse(localStorage.getItem("inventory_low_stock_threshold")!)
    : 5;

  if (articles.length === 0) {
    return (
      <Card className="w-full">
        <CardHeader className="pb-4">
          <CardTitle className="text-lg sm:text-xl">{t('register_sale')}</CardTitle>
        </CardHeader>
        <CardContent className="p-4 sm:p-6 pt-0">
          <Alert>
            <Package className="h-4 w-4" />
            <AlertDescription className="text-sm">
              <strong>{t('no_articles_registered_title')}</strong><br />
              {t('no_articles_registered_text')}
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
          <CardTitle className="text-lg sm:text-xl">{t('register_sale')}</CardTitle>
        </CardHeader>
        <CardContent className="p-4 sm:p-6 pt-0">
          <Alert variant="destructive">
            <AlertTriangle className="h-4 w-4" />
            <AlertDescription className="text-sm">
              <strong>{t('no_articles_for_sale_title')}</strong><br />
              {t('no_articles_for_sale_text')}
            </AlertDescription>
          </Alert>
        </CardContent>
      </Card>
    );
  }

  if (lowStockArticles.length > 0) {
    return (
      <Alert className="mb-4">
        <AlertTriangle className="h-4 w-4" />
        <AlertDescription className="text-sm">
          <strong>{t('warning_title')}</strong> {t('low_stock_warning_articles', { count: lowStockArticles.length, threshold: lowStockThreshold })}
        </AlertDescription>
      </Alert>
    );
  }

  return null;
};
