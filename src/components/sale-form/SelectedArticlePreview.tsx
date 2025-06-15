
import React from 'react';
import { Article } from '@/types/inventory';
import { formatCurrency } from '@/lib/utils';
import { Capacitor } from '@capacitor/core';

interface SelectedArticlePreviewProps {
  selectedArticle?: Article;
}

export const SelectedArticlePreview: React.FC<SelectedArticlePreviewProps> = ({ selectedArticle }) => {
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
    <div className="p-3 bg-muted rounded-md border flex items-center gap-3">
      {selectedArticle.imageUrl ? (
        <img 
          src={getImageSrc(selectedArticle.imageUrl)} 
          alt={selectedArticle.name} 
          className="w-12 h-12 object-cover rounded" 
        />
      ) : (
        <div className="w-12 h-12 bg-secondary rounded flex items-center justify-center">
          <span className="text-xs text-muted-foreground">Sin img</span>
        </div>
      )}
      <div className="flex-1">
        <p className="text-sm font-medium">{selectedArticle.name}</p>
        <div className="flex justify-between text-xs">
          <span>Precio: {formatCurrency(selectedArticle.price)}</span>
          <span className={selectedArticle.stock <= 5 ? "text-yellow-600 font-medium" : ""}>
            Stock: {selectedArticle.stock}
            {selectedArticle.stock <= 5 && " ⚠️"}
          </span>
        </div>
      </div>
    </div>
  );
};
