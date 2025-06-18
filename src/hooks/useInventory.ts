

import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query';
import { supabase } from '@/integrations/supabase/client';
import { Article, Sale, ArticleFormData, SaleFormData, EditArticleData, EditSaleData } from '@/types/inventory';

// --- Interfaces para la forma de los datos de Supabase ---
interface SupabaseArticleRow {
    id: string;
    name: string;
    image_url: string;
    price: number;
    stock: number;
    created_at: string;
}

interface SupabaseSaleRow {
    id: string;
    item_id: string;
    article_name: string;
    quantity: number;
    unit_price: number;
    total_price: number;
    buyer_name: string;
    sale_date: string;
    payment_method: 'efectivo' | 'transferencia' | 'sinabono';
    bank_name: string | null;
    amount_paid: number;
}

// --- Funciones auxiliares para Supabase Storage ---

// Sube una imagen a Supabase Storage y devuelve la URL pública.
const uploadArticleImage = async (imageFile: File): Promise<string> => {
    const fileName = `${crypto.randomUUID()}-${imageFile.name}`;
    
    try {
        const { data, error } = await supabase.storage
            .from('article_images')
            .upload(fileName, imageFile, {
                cacheControl: '3600',
                upsert: false
            });

        if (error) {
            console.error('Error uploading image:', error);
            throw new Error(`Error al subir la imagen: ${error.message}`);
        }

        const { data: { publicUrl } } = supabase.storage
            .from('article_images')
            .getPublicUrl(data.path);
        
        console.log('Image uploaded successfully:', publicUrl);
        return publicUrl;
    } catch (error) {
        console.error('Upload error:', error);
        throw error;
    }
};

// Elimina una imagen de Supabase Storage.
const deleteArticleImage = async (imageUrl: string) => {
    try {
        if (!imageUrl || !imageUrl.includes('supabase')) {
            return;
        }
        
        // Extraer el nombre del archivo de la URL
        const urlParts = imageUrl.split('/');
        const fileName = urlParts[urlParts.length - 1];
        
        if (fileName) {
            const { error } = await supabase.storage
                .from('article_images')
                .remove([fileName]);
            
            if (error) {
                console.error("Error deleting image:", error);
            } else {
                console.log("Image deleted successfully:", fileName);
            }
        }
    } catch (error) {
        console.error("Error deleting image:", error);
    }
};

// Convierte una URL de tipo "blob:" de nuevo a un objeto File para poder subirlo.
const fileFromBlobUrl = async (blobUrl: string): Promise<File> => {
    const response = await fetch(blobUrl);
    const blob = await response.blob();
    return new File([blob], "uploaded_image.png", { type: blob.type });
};

// --- Hook principal de inventario ---

export const useInventory = () => {
    const queryClient = useQueryClient();

    // LEER artículos
    const { data: articles = [], isLoading: articlesLoading, refetch: refetchArticles } = useQuery({
        queryKey: ['articles'],
        queryFn: async (): Promise<Article[]> => {
            console.log('Fetching articles from Supabase...');
            
            const { data, error } = await supabase
                .from('items')
                .select('id, name, image_url, price, stock, created_at')
                .order('created_at', { ascending: false });
            
            if (error) {
                console.error('Error fetching articles:', error);
                throw new Error(`Error al obtener artículos: ${error.message}`);
            }
            
            console.log('Articles fetched successfully:', data?.length || 0, 'items');
            
            return (data || []).map(item => ({
                id: item.id,
                name: item.name,
                imageUrl: item.image_url || '',
                price: Number(item.price),
                stock: Number(item.stock),
                createdAt: new Date(item.created_at),
            }));
        },
        staleTime: 0,
        refetchOnMount: true,
        refetchOnWindowFocus: true,
    });

    // LEER ventas
    const { data: sales = [], isLoading: salesLoading, refetch: refetchSales } = useQuery({
        queryKey: ['sales'],
        queryFn: async (): Promise<Sale[]> => {
            console.log('Fetching sales from Supabase...');
            
            const { data, error } = await supabase
                .from('sales')
                .select('id, item_id, article_name, quantity, unit_price, total_price, buyer_name, sale_date, payment_method, bank_name, amount_paid')
                .order('sale_date', { ascending: false });
            
            if (error) {
                console.error('Error fetching sales:', error);
                throw new Error(`Error al obtener ventas: ${error.message}`);
            }
            
            console.log('Sales fetched successfully:', data?.length || 0, 'items');
            
            return (data || []).map(sale => ({
                id: sale.id,
                articleId: sale.item_id,
                articleName: sale.article_name,
                quantity: Number(sale.quantity),
                unitPrice: Number(sale.unit_price),
                totalPrice: Number(sale.total_price),
                buyerName: sale.buyer_name,
                saleDate: new Date(sale.sale_date),
                paymentMethod: sale.payment_method as 'efectivo' | 'transferencia' | 'sinabono',
                bankName: sale.bank_name || undefined,
                amountPaid: Number(sale.amount_paid),
            }));
        },
        staleTime: 0,
        refetchOnMount: true,
        refetchOnWindowFocus: true,
    });

    // Refrescar datos
    const refreshData = async () => {
        console.log('Refreshing all data...');
        await Promise.all([
            queryClient.invalidateQueries({ queryKey: ['articles'] }),
            queryClient.invalidateQueries({ queryKey: ['sales'] }),
        ]);
        await Promise.all([
            refetchArticles(),
            refetchSales(),
        ]);
        console.log('Data refreshed successfully');
    };

    // CREAR artículo
    const { mutateAsync: addArticle } = useMutation({
        mutationFn: async (articleData: ArticleFormData) => {
            console.log('Adding article to Supabase:', articleData);
            
            let publicUrl = '';
            
            try {
                // Convertir blob URL a File y subir imagen
                const imageFile = await fileFromBlobUrl(articleData.imageUrl);
                publicUrl = await uploadArticleImage(imageFile);

                // Insertar artículo en la base de datos
                const { data, error } = await supabase
                    .from('items')
                    .insert({
                        name: articleData.name,
                        price: articleData.price,
                        stock: articleData.stock,
                        image_url: publicUrl,
                    })
                    .select()
                    .single();

                if (error) {
                    console.error('Error inserting article:', error);
                    // Intentar borrar la imagen si falla la inserción
                    await deleteArticleImage(publicUrl);
                    throw new Error(`Error al crear artículo: ${error.message}`);
                }
                
                console.log('Article added successfully:', data);
                return data;
            } catch (error) {
                console.error('Error in addArticle:', error);
                // Limpiar imagen si algo falla
                if (publicUrl) {
                    await deleteArticleImage(publicUrl);
                }
                throw error;
            }
        },
        onSuccess: async () => {
            console.log('Article added, refreshing data...');
            await refreshData();
        },
        onError: (error) => {
            console.error('Error adding article:', error);
        }
    });

    // ACTUALIZAR artículo
    const { mutateAsync: updateArticle } = useMutation({
        mutationFn: async (updatedArticle: EditArticleData) => {
            console.log('Updating article in Supabase:', updatedArticle);
            
            let newImageUrl = updatedArticle.imageUrl;
            
            try {
                // Si la URL es un blob, es una nueva imagen para subir
                if (updatedArticle.imageUrl.startsWith('blob:')) {
                    const imageFile = await fileFromBlobUrl(updatedArticle.imageUrl);
                    newImageUrl = await uploadArticleImage(imageFile);
                    
                    // Borrar la imagen antigua si es diferente a la nueva
                    const originalArticle = (articles as Article[]).find(a => a.id === updatedArticle.id);
                    if (originalArticle && originalArticle.imageUrl && originalArticle.imageUrl !== newImageUrl) {
                        await deleteArticleImage(originalArticle.imageUrl);
                    }
                }
                
                const { data, error } = await supabase
                    .from('items')
                    .update({
                        name: updatedArticle.name,
                        price: updatedArticle.price,
                        stock: updatedArticle.stock,
                        image_url: newImageUrl,
                    })
                    .eq('id', updatedArticle.id)
                    .select()
                    .single();

                if (error) {
                    console.error('Error updating article:', error);
                    throw new Error(`Error al actualizar artículo: ${error.message}`);
                }
                
                console.log('Article updated successfully:', data);
                return data;
            } catch (error) {
                console.error('Error in updateArticle:', error);
                throw error;
            }
        },
        onSuccess: async () => {
            console.log('Article updated, refreshing data...');
            await refreshData();
        },
        onError: (error) => {
            console.error('Error updating article:', error);
        }
    });

    // ELIMINAR artículo
    const { mutateAsync: deleteArticle } = useMutation({
        mutationFn: async (articleId: string) => {
            console.log('Deleting article from Supabase:', articleId);
            
            const articleToDelete = (articles as Article[]).find(a => a.id === articleId);
            if (!articleToDelete) {
                throw new Error("Artículo no encontrado");
            }
            
            // Verificar si tiene ventas asociadas
            const { data: salesData, error: salesError } = await supabase
                .from('sales')
                .select('id')
                .eq('item_id', articleId)
                .limit(1);
            
            if (salesError) {
                console.error('Error checking sales:', salesError);
                throw new Error(`Error al verificar ventas: ${salesError.message}`);
            }
            
            if (salesData && salesData.length > 0) {
                throw new Error('No se puede eliminar un artículo que tiene ventas asociadas');
            }

            // Eliminar artículo de la base de datos
            const { error: deleteError } = await supabase
                .from('items')
                .delete()
                .eq('id', articleId);
            
            if (deleteError) {
                console.error('Error deleting article:', deleteError);
                throw new Error(`Error al eliminar artículo: ${deleteError.message}`);
            }

            // Eliminar imagen del storage
            if (articleToDelete.imageUrl) {
                await deleteArticleImage(articleToDelete.imageUrl);
            }
            
            console.log('Article deleted successfully');
        },
        onSuccess: async () => {
            console.log('Article deleted, refreshing data...');
            await refreshData();
        },
        onError: (error) => {
            console.error('Error deleting article:', error);
        }
    });

    // CREAR venta
    const { mutateAsync: addSale } = useMutation({
        mutationFn: async (saleData: SaleFormData) => {
            console.log('Adding sale to Supabase:', saleData);
            
            const article = (articles as Article[]).find(a => a.id === saleData.articleId);
            if (!article) throw new Error('Artículo no encontrado');
            if (article.stock < saleData.quantity) throw new Error('Stock insuficiente');
            
            const newStock = article.stock - saleData.quantity;
            const totalPrice = article.price * saleData.quantity;

            try {
                // Insertar venta
                const { data: saleResult, error: saleError } = await supabase
                    .from('sales')
                    .insert({
                        item_id: saleData.articleId,
                        article_name: article.name,
                        quantity: saleData.quantity,
                        unit_price: article.price,
                        total_price: totalPrice,
                        buyer_name: saleData.buyerName,
                        payment_method: saleData.paymentMethod,
                        amount_paid: saleData.paymentMethod === 'sinabono' ? 0 : saleData.amountPaid,
                        bank_name: saleData.paymentMethod === 'transferencia' ? saleData.bankName : null,
                        sale_date: new Date().toISOString(),
                    })
                    .select()
                    .single();

                if (saleError) {
                    console.error('Error inserting sale:', saleError);
                    throw new Error(`Error al crear venta: ${saleError.message}`);
                }
                
                // Actualizar stock
                const { error: stockError } = await supabase
                    .from('items')
                    .update({ stock: newStock })
                    .eq('id', article.id);
                
                if (stockError) {
                    console.error('Error updating stock:', stockError);
                    // Intentar revertir la venta
                    await supabase.from('sales').delete().eq('id', saleResult.id);
                    throw new Error(`Error al actualizar el stock: ${stockError.message}`);
                }
                
                console.log('Sale added successfully:', saleResult);
                return saleResult;
            } catch (error) {
                console.error('Error in addSale:', error);
                throw error;
            }
        },
        onSuccess: async () => {
            console.log('Sale added, refreshing data...');
            await refreshData();
        },
        onError: (error) => {
            console.error('Error adding sale:', error);
        }
    });
    
    // ACTUALIZAR venta
    const { mutateAsync: updateSale } = useMutation({
        mutationFn: async (updatedSale: EditSaleData) => {
            console.log('Updating sale in Supabase:', updatedSale);
            
            const originalSale = (sales as Sale[]).find(s => s.id === updatedSale.id);
            if (!originalSale) throw new Error('Venta no encontrada');
            
            const newArticle = (articles as Article[]).find(a => a.id === updatedSale.articleId);
            if (!newArticle) throw new Error('Artículo no encontrado');
            
            const oldArticle = (articles as Article[]).find(a => a.id === originalSale.articleId);
            if (!oldArticle) throw new Error('Artículo original no encontrado');

            try {
                // Calcular cambios de stock
                let stockChanges: Array<{id: string, newStock: number}> = [];
                
                if (originalSale.articleId !== updatedSale.articleId) {
                    // Cambio de artículo: restaurar stock del antiguo, reducir del nuevo
                    stockChanges.push({
                        id: originalSale.articleId,
                        newStock: oldArticle.stock + originalSale.quantity
                    });
                    stockChanges.push({
                        id: updatedSale.articleId,
                        newStock: newArticle.stock - updatedSale.quantity
                    });
                } else {
                    // Mismo artículo: ajustar diferencia de cantidad
                    const stockDifference = originalSale.quantity - updatedSale.quantity;
                    stockChanges.push({
                        id: updatedSale.articleId,
                        newStock: newArticle.stock + stockDifference
                    });
                }

                // Verificar stock suficiente
                for (const change of stockChanges) {
                    if (change.newStock < 0) {
                        throw new Error('Stock insuficiente para esta operación');
                    }
                }

                const totalPrice = newArticle.price * updatedSale.quantity;

                // Actualizar venta
                const { data, error: saleError } = await supabase
                    .from('sales')
                    .update({
                        item_id: updatedSale.articleId,
                        article_name: newArticle.name,
                        quantity: updatedSale.quantity,
                        unit_price: newArticle.price,
                        total_price: totalPrice,
                        buyer_name: updatedSale.buyerName,
                        payment_method: updatedSale.paymentMethod,
                        amount_paid: updatedSale.paymentMethod === 'sinabono' ? 0 : updatedSale.amountPaid,
                        bank_name: updatedSale.paymentMethod === 'transferencia' ? updatedSale.bankName : null,
                    })
                    .eq('id', updatedSale.id)
                    .select()
                    .single();

                if (saleError) {
                    console.error('Error updating sale:', saleError);
                    throw new Error(`Error al actualizar venta: ${saleError.message}`);
                }

                // Actualizar stocks
                for (const change of stockChanges) {
                    const { error: stockError } = await supabase
                        .from('items')
                        .update({ stock: change.newStock })
                        .eq('id', change.id);
                    
                    if (stockError) {
                        console.error('Error updating stock:', stockError);
                        throw new Error(`Error al actualizar el stock: ${stockError.message}`);
                    }
                }
                
                console.log('Sale updated successfully:', data);
                return data;
            } catch (error) {
                console.error('Error in updateSale:', error);
                throw error;
            }
        },
        onSuccess: async () => {
            console.log('Sale updated, refreshing data...');
            await refreshData();
        },
        onError: (error) => {
            console.error('Error updating sale:', error);
        }
    });

    // ELIMINAR venta
    const { mutateAsync: deleteSale } = useMutation({
        mutationFn: async (saleId: string) => {
            console.log('Deleting sale from Supabase:', saleId);
            
            const saleToDelete = (sales as Sale[]).find(s => s.id === saleId);
            if (!saleToDelete) throw new Error("Venta no encontrada");
            
            const article = (articles as Article[]).find(a => a.id === saleToDelete.articleId);
            if (!article) throw new Error("Artículo asociado a la venta no encontrado");
            
            const newStock = article.stock + saleToDelete.quantity;

            try {
                // Eliminar venta
                const { error: deleteError } = await supabase
                    .from('sales')
                    .delete()
                    .eq('id', saleId);
                
                if (deleteError) {
                    console.error('Error deleting sale:', deleteError);
                    throw new Error(`Error al eliminar venta: ${deleteError.message}`);
                }

                // Restaurar stock
                const { error: stockError } = await supabase
                    .from('items')
                    .update({ stock: newStock })
                    .eq('id', article.id);
                
                if (stockError) {
                    console.error('Error restoring stock:', stockError);
                    throw new Error(`Error al restaurar el stock: ${stockError.message}`);
                }
                
                console.log('Sale deleted successfully');
            } catch (error) {
                console.error('Error in deleteSale:', error);
                throw error;
            }
        },
        onSuccess: async () => {
            console.log('Sale deleted, refreshing data...');
            await refreshData();
        },
        onError: (error) => {
            console.error('Error deleting sale:', error);
        }
    });

    return {
        articles: articles as Article[],
        sales: sales as Sale[],
        isLoading: articlesLoading || salesLoading,
        addArticle,
        updateArticle,
        deleteArticle,
        addSale,
        updateSale,
        deleteSale,
        refreshData,
    };
};

