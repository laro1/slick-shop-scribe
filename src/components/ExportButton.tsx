
import React from 'react';
import { Button } from '@/components/ui/button';
import { Download } from 'lucide-react';
import * as XLSX from 'xlsx';
import { Article, Sale } from '@/types/inventory';
import { useToast } from '@/hooks/use-toast';

interface ExportButtonProps {
  articles: Article[];
  sales: Sale[];
}

export const ExportButton: React.FC<ExportButtonProps> = ({ articles, sales }) => {
  const { toast } = useToast();

  const exportToExcel = () => {
    try {
      // Create workbook
      const workbook = XLSX.utils.book_new();

      // Prepare articles data
      const articlesData = articles.map(article => ({
        'ID': article.id,
        'Nombre': article.name,
        'URL Imagen': article.imageUrl,
        'Precio': article.price,
        'Stock': article.stock,
        'Fecha de Creación': new Date(article.createdAt).toLocaleDateString('es-ES')
      }));

      // Prepare sales data
      const salesData = sales.map(sale => ({
        'ID Venta': sale.id,
        'Artículo': sale.articleName,
        'Cantidad': sale.quantity,
        'Precio Unitario': sale.unitPrice,
        'Total': sale.totalPrice,
        'Comprador': sale.buyerName,
        'Fecha de Venta': new Date(sale.saleDate).toLocaleDateString('es-ES')
      }));

      // Create worksheets
      const articlesSheet = XLSX.utils.json_to_sheet(articlesData);
      const salesSheet = XLSX.utils.json_to_sheet(salesData);

      // Add worksheets to workbook
      XLSX.utils.book_append_sheet(workbook, articlesSheet, 'Artículos');
      XLSX.utils.book_append_sheet(workbook, salesSheet, 'Ventas');

      // Generate filename with current date
      const currentDate = new Date().toISOString().split('T')[0];
      const filename = `inventario_${currentDate}.xlsx`;

      // Write file
      XLSX.writeFile(workbook, filename);

      toast({
        title: "Exportación exitosa",
        description: `Los datos se han exportado a ${filename}`,
      });

    } catch (error) {
      toast({
        title: "Error en la exportación",
        description: "Hubo un problema al exportar los datos.",
        variant: "destructive",
      });
    }
  };

  const hasData = articles.length > 0 || sales.length > 0;

  return (
    <Button 
      onClick={exportToExcel} 
      disabled={!hasData}
      className="flex items-center gap-2 text-sm px-3 py-2 sm:px-4 sm:py-2"
      size="sm"
    >
      <Download className="h-3 w-3 sm:h-4 sm:w-4" />
      <span className="hidden sm:inline">Exportar a Excel</span>
      <span className="sm:hidden">Exportar</span>
    </Button>
  );
};
