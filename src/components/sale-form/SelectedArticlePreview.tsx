
import React from 'react';
import { Article } from '@/types/inventory';

interface SelectedArticlePreviewProps {
  selectedArticle?: Article;
}

export const SelectedArticlePreview: React.FC<SelectedArticlePreviewProps> = ({ selectedArticle }) => {
  if (!selectedArticle) return null;

  return (
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
  );
};
