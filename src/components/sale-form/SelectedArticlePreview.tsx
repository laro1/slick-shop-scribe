
import React from 'react';
import { Article } from '@/types/inventory';
import { formatCurrency } from '@/lib/utils';
import { Capacitor } from '@capacitor/core';
import { useTranslation } from 'react-i18next';

interface SelectedArticlePreviewProps {
  selectedArticle?: Article;
}

export const SelectedArticlePreview: React.FC<SelectedArticlePreviewProps> = ({ selectedArticle }) => {
  const { t } = useTranslation();
  if (!selectedArticle) return null;

  const getImageSrc = (path: string) => {
    // Return original path if it's already a web URL or a data URL
    if (path && (path.startsWith('http') || path.startsWith('data:'))) {
      return path;
    }
    // For local file paths from Capacitor, convert them to a usable format for the webview
    if (path && Capacitor.isNativePlatform()) {
      return Capacitor.convertFileSrc(path);
    }
    return path;
  };

  return (
    <div className="p-3 bg-muted rounded-md border">
      <div className="flex items-center gap-3">
        <div className="flex-shrink-0">
          {selectedArticle.imageUrl ? (
            <img 
              src={getImageSrc(selectedArticle.imageUrl)} 
              alt={selectedArticle.name} 
              className="w-12 h-12 object-cover rounded border"
              onError={(e) => {
                console.error('Error loading image:', selectedArticle.imageUrl);
                e.currentTarget.style.display = 'none';
              }}
            />
          ) : (
            <div className="w-12 h-12 bg-secondary rounded flex items-center justify-center flex-shrink-0">
              <span className="text-xs text-muted-foreground text-center">{t('no_image')}</span>
            </div>
          )}
        </div>
        <div className="flex-1 min-w-0">
          <p className="text-sm font-medium truncate">{selectedArticle.name}</p>
          <div className="flex justify-between items-center text-xs mt-1 gap-2">
            <span className="truncate">{t('price_label')}{formatCurrency(selectedArticle.price)}</span>
            <span className={`flex-shrink-0 ${selectedArticle.stock <= 5 ? "text-yellow-600 font-medium" : ""}`}>
              {t('stock_label')}{selectedArticle.stock}
              {selectedArticle.stock <= 5 && " ⚠️"}
            </span>
          </div>
        </div>
      </div>
    </div>
  );
};
