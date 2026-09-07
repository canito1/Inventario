"use client";

import { useState, useEffect } from "react";
import { useRouter } from "next/navigation";
import {
  Search,
  Filter,
  Package,
  Upload,
} from "lucide-react";
import { useToast } from "@/hooks/use-toast";
import * as XLSX from "xlsx";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import {
  Card,
  CardContent,
  CardDescription,
  CardHeader,
  CardTitle,
} from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import AdvancedInventoryTable from "@/components/AdvancedInventoryTable";
import { ProductDetailsDialog } from "@/components/ProductDetailsDialog";
import { ProductDialog } from "@/components/ProductDialog";
import { DeleteConfirmDialog } from "@/components/DeleteConfirmDialog";
import { CurrencyDisplay } from "@/components/CurrencyDisplay";
import { ProductImage } from "@/components/ProductImage";
import { AppSidebar } from "@/components/AppSidebar";
import {
  Breadcrumb,
  BreadcrumbItem,
  BreadcrumbLink,
  BreadcrumbList,
  BreadcrumbPage,
  BreadcrumbSeparator,
} from "@/components/ui/breadcrumb";
import { Separator } from "@/components/ui/separator";
import {
  SidebarInset,
  SidebarProvider,
  SidebarTrigger,
} from "@/components/ui/sidebar";
import { useAuth } from "@/contexts/AuthContext";
import { Item, itemsService } from "@/lib/items";

export default function ProductosPage() {
  const { user, loading: authLoading } = useAuth();
  const router = useRouter();
  const { toast } = useToast();
  const [products, setProducts] = useState<Item[]>([]);
  const [searchTerm, setSearchTerm] = useState("");
  const [selectedProduct, setSelectedProduct] = useState<Item | null>(null);
  const [productDialogOpen, setProductDialogOpen] = useState(false);
  const [deleteDialogOpen, setDeleteDialogOpen] = useState(false);
  const [productToDelete, setProductToDelete] = useState<Item | null>(null);
  const [deleteLoading, setDeleteLoading] = useState(false);
  const [isDetailsDialogOpen, setIsDetailsDialogOpen] = useState(false);
  const [importDialogOpen, setImportDialogOpen] = useState(false);
  const [importLoading, setImportLoading] = useState(false);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    if (!authLoading && !user) {
      router.push("/login");
      return;
    }

    if (user) {
      fetchProducts();
    }
  }, [user, authLoading, router]);

  // Recargar datos cuando la página vuelve a tener foco
  useEffect(() => {
    const handleFocus = () => {
      if (user && !loading) {
        fetchProducts();
      }
    };

    window.addEventListener('focus', handleFocus);
    return () => window.removeEventListener('focus', handleFocus);
  }, [user, loading]);

  const fetchProducts = async () => {
    try {
      setLoading(true);
      const response = await itemsService.getItems({ limit: 100 });
      setProducts(response.items);
    } catch (error) {
      console.error("Error fetching products:", error);
    } finally {
      setLoading(false);
    }
  };

  const filteredProducts = products.filter(
    (product) =>
      product.name.toLowerCase().includes(searchTerm.toLowerCase()) ||
      (product.barcode &&
        product.barcode.toLowerCase().includes(searchTerm.toLowerCase())) ||
      (typeof product.category === "string"
        ? product.category
        : product.category.name
      )
        .toLowerCase()
        .includes(searchTerm.toLowerCase())
  );

  const handleAddProduct = () => {
    setSelectedProduct(null);
    setProductDialogOpen(true);
  };

  const handleEditProduct = (product: Item) => {
    setSelectedProduct(product);
    setProductDialogOpen(true);
  };

  const handleDeleteProduct = (product: Item) => {
    setProductToDelete(product);
    setDeleteDialogOpen(true);
  };

  const confirmDelete = async () => {
    if (!productToDelete) return;
    try {
      setDeleteLoading(true);
      await itemsService.deleteItem(productToDelete._id);
      toast({ title: "Producto eliminado", description: `${productToDelete.name} fue eliminado correctamente.` });
      await fetchProducts();
      setDeleteDialogOpen(false);
      setProductToDelete(null);
    } catch (error: any) {
      toast({
        title: "Error al eliminar",
        description: error.response?.data?.message || "No se pudo eliminar el producto.",
        variant: "destructive",
      });
    } finally {
      setDeleteLoading(false);
    }
  };

  if (authLoading) {
    return (
      <div className="flex items-center justify-center min-h-screen">
        <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-gray-900"></div>
      </div>
    );
  }

  if (!user) {
    return null;
  }

  if (loading) {
    return (
      <SidebarProvider>
        <AppSidebar />
        <SidebarInset>
          <div className="flex items-center justify-center h-64">
            <div className="text-center">
              <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-primary mx-auto mb-4"></div>
              <p>Cargando productos...</p>
            </div>
          </div>
        </SidebarInset>
      </SidebarProvider>
    );
  }

  return (
    <SidebarProvider>
      <AppSidebar />
      <SidebarInset>
        <header className="flex h-14 sm:h-16 shrink-0 items-center gap-2 border-b px-2 sm:px-4">
          <SidebarTrigger className="-ml-1" />
          <Separator orientation="vertical" className="mr-2 h-4" />
          <Breadcrumb className="flex-1 min-w-0">
            <BreadcrumbList>
              <BreadcrumbItem className="hidden sm:block">
                <BreadcrumbLink href="/" className="text-sm">
                  Sistema de Inventario
                </BreadcrumbLink>
              </BreadcrumbItem>
              <BreadcrumbSeparator className="hidden sm:block" />
              <BreadcrumbItem>
                <BreadcrumbPage className="text-sm">Productos</BreadcrumbPage>
              </BreadcrumbItem>
            </BreadcrumbList>
          </Breadcrumb>
        </header>

        <div className="flex flex-1 flex-col gap-3 sm:gap-4 p-2 sm:p-4 pt-0">
          <div className="space-y-6 mt-3 sm:mt-4">
            {/* Header */}
            <div className="flex flex-col sm:flex-row justify-between items-start sm:items-center gap-4">
              <div>
                <h1 className="text-2xl font-bold">Productos</h1>
                <p className="text-muted-foreground">
                  Gestiona tu inventario de productos
                </p>
              </div>
              <Button
                type="button"
                onClick={handleAddProduct}
                className="w-full sm:w-auto"
              >
                <Package className="mr-2 h-4 w-4" />
                Ingresar producto
              </Button>
            </div>

            {/* Products Table */}
            <div className="mt-4">
              <AdvancedInventoryTable
                data={filteredProducts}
                loading={loading}
                showHeader={false}
                onAdd={handleAddProduct}
                onEdit={handleEditProduct}
                onDelete={handleDeleteProduct}
                onViewDetails={(item) => {
                  setSelectedProduct(item)
                  setIsDetailsDialogOpen(true)
                }}
              />
            </div>
          </div>
        </div>
      </SidebarInset>

      {/* Dialogs */}
      {selectedProduct && (
        <ProductDetailsDialog
          product={selectedProduct}
          open={isDetailsDialogOpen}
          onOpenChange={setIsDetailsDialogOpen}
        />
      )}
      <ProductDialog
        open={productDialogOpen}
        onOpenChange={setProductDialogOpen}
        product={selectedProduct}
        onSuccess={fetchProducts}
      />
      <DeleteConfirmDialog
        open={deleteDialogOpen}
        onOpenChange={setDeleteDialogOpen}
        onConfirm={confirmDelete}
        loading={deleteLoading}
        title="¿Eliminar producto?"
        description={`¿Estás seguro de que quieres eliminar "${productToDelete?.name}"? Esta acción no se puede deshacer.`}
      />
    </SidebarProvider>
  );
}
