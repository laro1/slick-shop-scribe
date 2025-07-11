import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query';
import { supabase } from '@/integrations/supabase/client';
import { Article, Sale, ArticleFormData, SaleFormData, EditArticleData, EditSaleData } from '@/types/inventory';
import { toast } from 'sonner';

// --- Interfaces para la forma exacta de los datos de Supabase ---
interface SupabaseArticleRow {
    id: string;
    name: string;
    image_url: string | null;
    price: number;
    stock: number;
    initial_stock: number;
    initial_price: number;
    created_at: string;
    description: string | null;
}

interface SupabaseSaleRow {
    id: string;
    item_id: string;
    article_name: string | null;
    quantity: number;
    unit_price: number | null;
    total_price: number;
    buyer_name: string;
    sale_date: string | null;
    payment_method: string | null;
    bank_name: string | null;
    amount_paid: number | null;
}

// --- Funciones auxiliares para Supabase Storage ---

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

const deleteArticleImage = async (imageUrl: string) => {
    try {
        if (!imageUrl || !imageUrl.includes('supabase')) {
            return;
        }
        
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

const fileFromBlobUrl = async (blobUrl: string): Promise<File> => {
    const response = await fetch(blobUrl);
    const blob = await response.blob();
    return new File([blob], "uploaded_image.png", { type: blob.type });
};

// --- Hook principal de inventario ---

export const useInventory = () => {
    const queryClient = useQueryClient();

    // LEER artículos - mapeo exacto con la estructura de Supabase
    const { data: articles = [], isLoading: articlesLoading, refetch: refetchArticles } = useQuery({
        queryKey: ['articles'],
        queryFn: async (): Promise<Article[]> => {
            console.log('Fetching articles from Supabase...');
            console.log('Supabase URL: https://lfcanknjipqulsbgjmmg.supabase.co');
            console.log('Checking RLS policies for items table...');
            
            try {
                const { data, error } = await supabase
                    .from('items')
                    .select('id, name, image_url, price, stock, initial_stock, initial_price, created_at, description')
                    .order('created_at', { ascending: false });
                
                if (error) {
                    console.error('Error fetching articles:', error);
                    console.error('Error details:', error.details, error.hint, error.message);
                    
                    if (error.code === 'PGRST301') {
                        toast.error('Sin permisos para acceder al inventario. Verifica las políticas RLS.');
                    } else if (error.code === 'PGRST116') {
                        console.log('No articles found in database');
                        return [];
                    } else {
                        toast.error(`Error de base de datos: ${error.message}`);
                    }
                    return [];
                }
                
                console.log('Raw articles data from Supabase:', data);
                
                if (!data || data.length === 0) {
                    console.log('No articles data returned');
                    return [];
                }
                
                const mappedArticles = data.map((item: SupabaseArticleRow) => ({
                    id: item.id,
                    name: item.name,
                    imageUrl: item.image_url || '/placeholder.svg',
                    price: Number(item.price),
                    stock: Number(item.stock),
                    initialStock: Number(item.initial_stock),
                    initialPrice: Number(item.initial_price),
                    createdAt: new Date(item.created_at),
                } as Article));
                
                console.log('Articles mapped successfully:', mappedArticles.length, 'items');
                return mappedArticles;
            } catch (error) {
                console.error('Error in articles query:', error);
                toast.error('No se pudo cargar el inventario');
                return [];
            }
        },
        retry: (failureCount, error: any) => {
            // No reintentar si es un error de permisos RLS
            if (error?.code === 'PGRST301') {
                return false;
            }
            return failureCount < 2;
        },
        retryDelay: 1000,
        staleTime: 0,
        refetchOnMount: true,
        refetchOnWindowFocus: true,
    });

    // LEER ventas - mapeo exacto con la estructura de Supabase
    const { data: sales = [], isLoading: salesLoading, refetch: refetchSales } = useQuery({
        queryKey: ['sales'],
        queryFn: async (): Promise<Sale[]> => {
            console.log('Fetching sales from Supabase...');
            console.log('Supabase URL: https://lfcanknjipqulsbgjmmg.supabase.co');
            console.log('Checking RLS policies for sales table...');
            
            try {
                const { data, error } = await supabase
                    .from('sales')
                    .select('id, item_id, article_name, quantity, unit_price, total_price, buyer_name, sale_date, payment_method, bank_name, amount_paid')
                    .order('sale_date', { ascending: false });
                
                if (error) {
                    console.error('Error fetching sales:', error);
                    console.error('Error details:', error.details, error.hint, error.message);
                    
                    if (error.code === 'PGRST301') {
                        toast.error('Sin permisos para acceder a las ventas. Verifica las políticas RLS.');
                    } else if (error.code === 'PGRST116') {
                        console.log('No sales found in database');
                        return [];
                    } else {
                        toast.error(`Error de base de datos: ${error.message}`);
                    }
                    return [];
                }
                
                console.log('Raw sales data from Supabase:', data);
                
                if (!data || data.length === 0) {
                    console.log('No sales data returned');
                    return [];
                }
                
                const mappedSales = data.map((sale: SupabaseSaleRow) => {
                    // Validar y normalizar payment_method
                    let paymentMethod: 'efectivo' | 'transferencia' | 'sinabono' = 'efectivo';
                    if (sale.payment_method === 'transferencia' || sale.payment_method === 'sinabono') {
                        paymentMethod = sale.payment_method;
                    }
                    
                    return {
                        id: sale.id,
                        articleId: sale.item_id,
                        articleName: sale.article_name || 'Artículo desconocido',
                        quantity: Number(sale.quantity),
                        unitPrice: Number(sale.unit_price || 0),
                        totalPrice: Number(sale.total_price),
                        buyerName: sale.buyer_name,
                        saleDate: new Date(sale.sale_date || new Date()),
                        paymentMethod: paymentMethod,
                        bankName: sale.bank_name || undefined,
                        amountPaid: Number(sale.amount_paid || 0),
                    } as Sale;
                });
                
                console.log('Sales mapped successfully:', mappedSales.length, 'items');
                return mappedSales;
            } catch (error) {
                console.error('Error in sales query:', error);
                toast.error('No se pudo cargar las ventas');
                return [];
            }
        },
        retry: (failureCount, error: any) => {
            // No reintentar si es un error de permisos RLS
            if (error?.code === 'PGRST301') {
                return false;
            }
            return failureCount < 2;
        },
        retryDelay: 1000,
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

    // CREAR artículo - mapeo exacto con estructura de Supabase
    const { mutateAsync: addArticle } = useMutation({
        mutationFn: async (articleData: ArticleFormData) => {
            console.log('Adding article to Supabase:', articleData);
            
            let publicUrl = '';
            
            try {
                // Subir imagen
                const imageFile = await fileFromBlobUrl(articleData.imageUrl);
                publicUrl = await uploadArticleImage(imageFile);

                // Insertar artículo con la estructura exacta de Supabase
                const { data, error } = await supabase
                    .from('items')
                    .insert({
                        name: articleData.name,
                        price: articleData.price,
                        stock: articleData.stock,
                        initial_stock: articleData.stock,
                        initial_price: articleData.price,
                        image_url: publicUrl,
                        description: null, // Campo que existe en Supabase
                    })
                    .select()
                    .single();

                if (error) {
                    console.error('Error inserting article:', error);
                    await deleteArticleImage(publicUrl);
                    throw new Error(`Error al crear artículo: ${error.message}`);
                }
                
                console.log('Article added successfully:', data);
                return data;
            } catch (error) {
                console.error('Error in addArticle:', error);
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
            console.log('=== INICIANDO ACTUALIZACIÓN DE ARTÍCULO ===');
            console.log('Datos recibidos para actualizar:', updatedArticle);
            
            let newImageUrl = updatedArticle.imageUrl;
            
            try {
                // Manejar actualización de imagen si es necesario
                if (updatedArticle.imageUrl.startsWith('blob:')) {
                    console.log('Subiendo nueva imagen...');
                    const imageFile = await fileFromBlobUrl(updatedArticle.imageUrl);
                    newImageUrl = await uploadArticleImage(imageFile);
                    
                    const originalArticle = (articles as Article[]).find(a => a.id === updatedArticle.id);
                    if (originalArticle && originalArticle.imageUrl && originalArticle.imageUrl !== newImageUrl) {
                        await deleteArticleImage(originalArticle.imageUrl);
                    }
                }
                
                console.log('Actualizando artículo en Supabase con datos:', {
                    id: updatedArticle.id,
                    name: updatedArticle.name,
                    price: Number(updatedArticle.price),
                    stock: Number(updatedArticle.stock),
                    image_url: newImageUrl,
                });

                const { data, error } = await supabase
                    .from('items')
                    .update({
                        name: updatedArticle.name,
                        price: Number(updatedArticle.price),
                        stock: Number(updatedArticle.stock),
                        image_url: newImageUrl,
                    })
                    .eq('id', updatedArticle.id)
                    .select()
                    .single();

                if (error) {
                    console.error('Error actualizando artículo en Supabase:', error);
                    console.error('Detalles del error:', error.details, error.hint, error.message);
                    throw new Error(`Error al actualizar artículo: ${error.message}`);
                }
                
                console.log('Artículo actualizado exitosamente en Supabase:', data);
                toast.success('Artículo actualizado correctamente');
                return data;
            } catch (error) {
                console.error('Error en updateArticle:', error);
                toast.error('Error al actualizar el artículo');
                throw error;
            }
        },
        onSuccess: async () => {
            console.log('Artículo actualizado, refrescando datos...');
            await refreshData();
        },
        onError: (error) => {
            console.error('Error en mutación updateArticle:', error);
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

            const { error: deleteError } = await supabase
                .from('items')
                .delete()
                .eq('id', articleId);
            
            if (deleteError) {
                console.error('Error deleting article:', deleteError);
                throw new Error(`Error al eliminar artículo: ${deleteError.message}`);
            }

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

    // CREAR venta - mapeo exacto con estructura de Supabase
    const { mutateAsync: addSale } = useMutation({
        mutationFn: async (saleData: SaleFormData) => {
            console.log('Adding sale to Supabase:', saleData);
            
            const article = (articles as Article[]).find(a => a.id === saleData.articleId);
            if (!article) throw new Error('Artículo no encontrado');
            if (article.stock < saleData.quantity) throw new Error('Stock insuficiente');
            
            const newStock = article.stock - saleData.quantity;
            const totalPrice = article.price * saleData.quantity;

            try {
                // Insertar venta con estructura exacta de Supabase
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
            console.log('=== INICIANDO ACTUALIZACIÓN DE VENTA ===');
            console.log('Datos recibidos para actualizar:', updatedSale);
            
            const originalSale = (sales as Sale[]).find(s => s.id === updatedSale.id);
            if (!originalSale) {
                const error = 'Venta no encontrada';
                console.error(error);
                throw new Error(error);
            }
            
            const newArticle = (articles as Article[]).find(a => a.id === updatedSale.articleId);
            if (!newArticle) {
                const error = 'Artículo no encontrado';
                console.error(error);
                throw new Error(error);
            }
            
            const oldArticle = (articles as Article[]).find(a => a.id === originalSale.articleId);
            if (!oldArticle) {
                const error = 'Artículo original no encontrado';
                console.error(error);
                throw new Error(error);
            }

            try {
                // Calcular cambios de stock
                let stockChanges: Array<{id: string, newStock: number}> = [];
                
                if (originalSale.articleId !== updatedSale.articleId) {
                    // Cambio de artículo: devolver stock al artículo original y descontar del nuevo
                    stockChanges.push({
                        id: originalSale.articleId,
                        newStock: oldArticle.stock + originalSale.quantity
                    });
                    stockChanges.push({
                        id: updatedSale.articleId,
                        newStock: newArticle.stock - updatedSale.quantity
                    });
                } else {
                    // Mismo artículo: ajustar stock por diferencia de cantidad
                    const stockDifference = originalSale.quantity - updatedSale.quantity;
                    stockChanges.push({
                        id: updatedSale.articleId,
                        newStock: newArticle.stock + stockDifference
                    });
                }

                // Validar que no habrá stock negativo
                for (const change of stockChanges) {
                    if (change.newStock < 0) {
                        const error = 'Stock insuficiente para esta operación';
                        console.error(error, 'Stock resultante:', change.newStock);
                        throw new Error(error);
                    }
                }

                const totalPrice = newArticle.price * updatedSale.quantity;

                console.log('Actualizando venta en Supabase con datos:', {
                    id: updatedSale.id,
                    item_id: updatedSale.articleId,
                    article_name: newArticle.name,
                    quantity: Number(updatedSale.quantity),
                    unit_price: Number(newArticle.price),
                    total_price: Number(totalPrice),
                    buyer_name: updatedSale.buyerName,
                    payment_method: updatedSale.paymentMethod,
                    amount_paid: Number(updatedSale.paymentMethod === 'sinabono' ? 0 : updatedSale.amountPaid),
                    bank_name: updatedSale.paymentMethod === 'transferencia' ? updatedSale.bankName : null,
                });

                // Actualizar la venta
                const { data, error: saleError } = await supabase
                    .from('sales')
                    .update({
                        item_id: updatedSale.articleId,
                        article_name: newArticle.name,
                        quantity: Number(updatedSale.quantity),
                        unit_price: Number(newArticle.price),
                        total_price: Number(totalPrice),
                        buyer_name: updatedSale.buyerName,
                        payment_method: updatedSale.paymentMethod,
                        amount_paid: Number(updatedSale.paymentMethod === 'sinabono' ? 0 : updatedSale.amountPaid),
                        bank_name: updatedSale.paymentMethod === 'transferencia' ? updatedSale.bankName : null,
                    })
                    .eq('id', updatedSale.id)
                    .select()
                    .single();

                if (saleError) {
                    console.error('Error actualizando venta en Supabase:', saleError);
                    console.error('Detalles del error:', saleError.details, saleError.hint, saleError.message);
                    throw new Error(`Error al actualizar venta: ${saleError.message}`);
                }

                console.log('Venta actualizada exitosamente, actualizando stocks...');

                // Actualizar stocks
                for (const change of stockChanges) {
                    console.log(`Actualizando stock del artículo ${change.id} a ${change.newStock}`);
                    const { error: stockError } = await supabase
                        .from('items')
                        .update({ stock: change.newStock })
                        .eq('id', change.id);
                    
                    if (stockError) {
                        console.error('Error actualizando stock:', stockError);
                        throw new Error(`Error al actualizar el stock: ${stockError.message}`);
                    }
                }
                
                console.log('Venta y stocks actualizados exitosamente:', data);
                toast.success('Venta actualizada correctamente');
                return data;
            } catch (error) {
                console.error('Error en updateSale:', error);
                toast.error('Error al actualizar la venta');
                throw error;
            }
        },
        onSuccess: async () => {
            console.log('Venta actualizada, refrescando datos...');
            await refreshData();
        },
        onError: (error) => {
            console.error('Error en mutación updateSale:', error);
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
                const { error: deleteError } = await supabase
                    .from('sales')
                    .delete()
                    .eq('id', saleId);
                
                if (deleteError) {
                    console.error('Error deleting sale:', deleteError);
                    throw new Error(`Error al eliminar venta: ${deleteError.message}`);
                }

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
