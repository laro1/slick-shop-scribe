
import React from 'react';
import { Button } from '@/components/ui/button';
import { Download } from 'lucide-react';
import * as XLSX from 'xlsx';
import { Article, Sale } from '@/types/inventory';
import { useToast } from '@/hooks/use-toast';
import { useTranslation } from 'react-i18next';
import i18n from '@/i18n';

interface ExportButtonProps {
  articles: Article[];
  sales: Sale[];
}

export const ExportButton: React.FC<ExportButtonProps> = ({ articles, sales }) => {
  const { toast } = useToast();
  const { t } = useTranslation();
  const currentLang = i18n.language;


  const exportToExcel = () => {
    try {
      // Create workbook
      const workbook = XLSX.utils.book_new();

      // Prepare articles data
      const articlesData = articles.map(article => ({
        [t('excel_header_id')]: article.id,
        [t('excel_header_name')]: article.name,
        [t('excel_header_image_url')]: article.imageUrl,
        [t('excel_header_price')]: article.price,
        [t('excel_header_stock')]: article.stock,
        [t('excel_header_created_at')]: new Date(article.createdAt).toLocaleDateString(currentLang === 'es' ? 'es-ES' : 'en-US')
      }));

      // Prepare sales data
      const salesData = sales.map(sale => ({
        [t('excel_header_sale_id')]: sale.id,
        [t('excel_header_article')]: sale.articleName,
        [t('excel_header_quantity')]: sale.quantity,
        [t('excel_header_unit_price')]: sale.unitPrice,
        [t('excel_header_total')]: sale.totalPrice,
        [t('excel_header_buyer')]: sale.buyerName,
        [t('excel_header_sale_date')]: new Date(sale.saleDate).toLocaleDateString(currentLang === 'es' ? 'es-ES' : 'en-US')
      }));

      // Create worksheets
      const articlesSheet = XLSX.utils.json_to_sheet(articlesData);
      const salesSheet = XLSX.utils.json_to_sheet(salesData);

      // Add worksheets to workbook
      XLSX.utils.book_append_sheet(workbook, articlesSheet, t('excel_sheet_articles'));
      XLSX.utils.book_append_sheet(workbook, salesSheet, t('excel_sheet_sales'));

      // Generate filename with current date
      const currentDate = new Date().toISOString().split('T')[0];
      const filename = `${t('inventory_filename_prefix')}_${currentDate}.xlsx`;

      // Write file
      XLSX.writeFile(workbook, filename);

      toast({
        title: t('export_success_title'),
        description: t('export_success_description', { filename }),
      });

    } catch (error) {
      toast({
        title: t('export_error_title'),
        description: t('export_error_description'),
        variant: "destructive",
      });
    }
  };

  const hasData = articles.length > 0 || sales.length > 0;

  return (
    <Button 
      onClick={exportToExcel} 
      disabled={!hasData}
    >
      <Download className="h-4 w-4 mr-2" />
      <span>{t('export_data')}</span>
    </Button>
  );
};

