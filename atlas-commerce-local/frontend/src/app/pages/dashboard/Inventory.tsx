import { useEffect, useMemo, useState } from 'react';
import { Package, AlertTriangle, PencilLine } from 'lucide-react';
import { Card, Button, Input, Badge, Label, Textarea } from '../../components/ui/core';

import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogFooter,
  DialogHeader,
  DialogTitle,
} from '../../components/ui/dialog';
import { getAdminInventory, updateAdminInventory } from '../../lib/api';
import { toast } from 'sonner';

interface InventoryEditorState {
  id: string;
  productId: number;
  name: string;
  summary: string;
  producerName: string;
  producerLocation: string;
  productionMethod: string;
  price: number;
  stockLevel: number;
  isFeatured: boolean;
}

export function DashboardInventory() {
  const [inventory, setInventory] = useState<any[]>([]);
  const [searchTerm, setSearchTerm] = useState('');
  const [editor, setEditor] = useState<InventoryEditorState | null>(null);
  const [isSaving, setIsSaving] = useState(false);

  const loadInventory = async () => {
    const data = await getAdminInventory();
    setInventory(data);
  };

  useEffect(() => {
    void loadInventory();
  }, []);

  const filteredInventory = useMemo(
    () =>
      inventory.filter(
        (item) =>
          item.name.toLowerCase().includes(searchTerm.toLowerCase()) ||
          item.category.toLowerCase().includes(searchTerm.toLowerCase()) ||
          item.producerName.toLowerCase().includes(searchTerm.toLowerCase()),
      ),
    [inventory, searchTerm],
  );

  const lowStockCount = inventory.filter((item) => item.stockLevel <= item.lowStockThreshold).length;

  const handleUpdateStock = async (item: any, newStock: number) => {
    try {
      await updateAdminInventory(item.productId, { stockLevel: Math.max(0, newStock) });
      await loadInventory();
      toast.success('Stock level updated');
    } catch (error) {
      toast.error(error instanceof Error ? error.message : 'Unable to update stock');
    }
  };

  const handleOpenEditor = (item: any) => {
    setEditor({
      id: item.id,
      productId: item.productId,
      name: item.name,
      summary: item.summary,
      producerName: item.producerName,
      producerLocation: item.producerLocation,
      productionMethod: item.productionMethod,
      price: item.price,
      stockLevel: item.stockLevel,
      isFeatured: item.isFeatured,
    });
  };

  const handleSaveProduct = async () => {
    if (!editor) return;
    setIsSaving(true);
    try {
      await updateAdminInventory(editor.productId, {
        stockLevel: Math.max(0, editor.stockLevel),
        price: Number(editor.price),
        summary: editor.summary,
        producerName: editor.producerName,
        producerLocation: editor.producerLocation,
        productionMethod: editor.productionMethod,
        isFeatured: editor.isFeatured,
      });
      await loadInventory();
      setEditor(null);
      toast.success('Product details updated');
    } catch (error) {
      toast.error(error instanceof Error ? error.message : 'Unable to update product');
    } finally {
      setIsSaving(false);
    }
  };

  const getStockStatus = (item: any) => {
    if (item.stockLevel === 0) {
      return { label: 'Out of Stock', color: 'bg-red-600', textColor: 'text-white' };
    }
    if (item.stockLevel <= item.lowStockThreshold) {
      return { label: 'Low Stock', color: 'bg-orange-500', textColor: 'text-white' };
    }
    return { label: 'In Stock', color: 'bg-green-600', textColor: 'text-white' };
  };

  return (
    <div className="p-4 md:p-6 lg:p-8 space-y-6">
      <div>
        <h1 className="mb-2" style={{ color: '#2E2E2E' }}>
          Inventory Management
        </h1>
        <p style={{ color: '#6B6B6B' }}>
          Update stock, price, producer details, and product summaries from the live backend catalog.
        </p>
      </div>

      <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
        <Card className="p-6">
          <div className="flex items-center gap-4">
            <div className="flex h-12 w-12 items-center justify-center rounded-full" style={{ backgroundColor: '#A5D6A7' }}>
              <Package className="h-6 w-6" style={{ color: '#2E7D32' }} />
            </div>
            <div>
              <p className="text-sm" style={{ color: '#6B6B6B' }}>Total Products</p>
              <p className="text-2xl" style={{ color: '#2E2E2E', fontWeight: 700 }}>
                {inventory.length}
              </p>
            </div>
          </div>
        </Card>

        <Card className="p-6">
          <div className="flex items-center gap-4">
            <div className="flex h-12 w-12 items-center justify-center rounded-full" style={{ backgroundColor: '#A5D6A7' }}>
              <Package className="h-6 w-6" style={{ color: '#2E7D32' }} />
            </div>
            <div>
              <p className="text-sm" style={{ color: '#6B6B6B' }}>Total Stock Units</p>
              <p className="text-2xl" style={{ color: '#2E2E2E', fontWeight: 700 }}>
                {inventory.reduce((sum, item) => sum + item.stockLevel, 0)}
              </p>
            </div>
          </div>
        </Card>

        <Card className="p-6">
          <div className="flex items-center gap-4">
            <div className="flex h-12 w-12 items-center justify-center rounded-full" style={{ backgroundColor: '#FFE0B2' }}>
              <AlertTriangle className="h-6 w-6" style={{ color: '#FF9800' }} />
            </div>
            <div>
              <p className="text-sm" style={{ color: '#6B6B6B' }}>Low Stock Items</p>
              <p className="text-2xl" style={{ color: '#FF9800', fontWeight: 700 }}>
                {lowStockCount}
              </p>
            </div>
          </div>
        </Card>
      </div>

      <Card className="p-4">
        <Input
          placeholder="Search products, categories, or producers..."
          value={searchTerm}
          onChange={(e) => setSearchTerm(e.target.value)}
          className="max-w-md"
          style={{ borderColor: '#A5D6A7' }}
        />
      </Card>

      <Card className="overflow-hidden">
        <div className="overflow-x-auto">
          <table className="w-full">
            <thead style={{ backgroundColor: '#FAFAF5' }}>
              <tr>
                <th className="text-left p-4" style={{ color: '#2E2E2E' }}>Product</th>
                <th className="text-left p-4" style={{ color: '#2E2E2E' }}>Producer</th>
                <th className="text-left p-4" style={{ color: '#2E2E2E' }}>Price</th>
                <th className="text-left p-4" style={{ color: '#2E2E2E' }}>Stock Level</th>
                <th className="text-left p-4" style={{ color: '#2E2E2E' }}>Status</th>
                <th className="text-left p-4" style={{ color: '#2E2E2E' }}>Actions</th>
              </tr>
            </thead>
            <tbody>
              {filteredInventory.map((item) => {
                const status = getStockStatus(item);
                const isLowStock = item.stockLevel <= item.lowStockThreshold;

                return (
                  <tr key={item.id} className="border-t">
                    <td className="p-4 align-top">
                      <div>
                        <div className="flex items-center gap-2 mb-1">
                          <p style={{ color: '#2E2E2E', fontWeight: 600 }}>{item.name}</p>
                          {item.isFeatured && (
                            <Badge style={{ backgroundColor: '#2E7D32' }}>Featured</Badge>
                          )}
                        </div>
                        <p className="text-sm" style={{ color: '#6B6B6B' }}>{item.category}</p>
                        <p className="text-xs mt-1 max-w-md" style={{ color: '#6B6B6B' }}>{item.summary}</p>
                      </div>
                    </td>
                    <td className="p-4 align-top">
                      <p style={{ color: '#2E2E2E', fontWeight: 600 }}>{item.producerName}</p>
                      <p className="text-sm" style={{ color: '#2E7D32' }}>{item.producerLocation}</p>
                    </td>
                    <td className="p-4 align-top">
                      <span style={{ color: '#2E7D32', fontWeight: 600 }}>
                        ${item.price.toFixed(2)}
                      </span>
                    </td>
                    <td className="p-4 align-top">
                      <div className="flex items-center gap-2">
                        <Button
                          variant="outline"
                          size="sm"
                          onClick={() => void handleUpdateStock(item, item.stockLevel - 1)}
                          className="h-8 w-8 p-0"
                          style={{ borderColor: '#2E7D32' }}
                        >
                          -
                        </Button>
                        <span
                          className="w-12 text-center"
                          style={{
                            color: isLowStock ? '#FF9800' : '#2E2E2E',
                            fontWeight: isLowStock ? 700 : 600,
                          }}
                        >
                          {item.stockLevel}
                        </span>
                        <Button
                          variant="outline"
                          size="sm"
                          onClick={() => void handleUpdateStock(item, item.stockLevel + 1)}
                          className="h-8 w-8 p-0"
                          style={{ borderColor: '#2E7D32' }}
                        >
                          +
                        </Button>
                      </div>
                    </td>
                    <td className="p-4 align-top">
                      <Badge className={`${status.color} ${status.textColor}`}>
                        {status.label}
                      </Badge>
                    </td>
                    <td className="p-4 align-top">
                      <Button variant="outline" onClick={() => handleOpenEditor(item)} style={{ borderColor: '#2E7D32', color: '#2E7D32' }}>
                        <PencilLine className="h-4 w-4 mr-2" />
                        Edit details
                      </Button>
                    </td>
                  </tr>
                );
              })}
            </tbody>
          </table>
        </div>
      </Card>

      <Dialog open={!!editor} onOpenChange={(open) => !open && setEditor(null)}>
        <DialogContent className="sm:max-w-2xl">
          <DialogHeader>
            <DialogTitle>Edit product details</DialogTitle>
            <DialogDescription>
              Update the GLH-facing product description, producer details, price, and stock in one place.
            </DialogDescription>
          </DialogHeader>

          {editor && (
            <div className="grid gap-4 py-2">
              <div className="grid gap-2">
                <Label htmlFor="product-summary">Summary</Label>
                <Textarea
                  id="product-summary"
                  value={editor.summary}
                  onChange={(e) => setEditor((prev) => (prev ? { ...prev, summary: e.target.value } : prev))}
                />
              </div>

              <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                <div className="grid gap-2">
                  <Label htmlFor="producer-name">Producer name</Label>
                  <Input
                    id="producer-name"
                    value={editor.producerName}
                    onChange={(e) => setEditor((prev) => (prev ? { ...prev, producerName: e.target.value } : prev))}
                  />
                </div>
                <div className="grid gap-2">
                  <Label htmlFor="producer-location">Producer location</Label>
                  <Input
                    id="producer-location"
                    value={editor.producerLocation}
                    onChange={(e) => setEditor((prev) => (prev ? { ...prev, producerLocation: e.target.value } : prev))}
                  />
                </div>
              </div>

              <div className="grid gap-2">
                <Label htmlFor="production-method">Production method</Label>
                <Textarea
                  id="production-method"
                  value={editor.productionMethod}
                  onChange={(e) => setEditor((prev) => (prev ? { ...prev, productionMethod: e.target.value } : prev))}
                />
              </div>

              <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
                <div className="grid gap-2">
                  <Label htmlFor="product-price">Price</Label>
                  <Input
                    id="product-price"
                    type="number"
                    min="0"
                    step="0.01"
                    value={editor.price}
                    onChange={(e) => setEditor((prev) => (prev ? { ...prev, price: Number(e.target.value) } : prev))}
                  />
                </div>
                <div className="grid gap-2">
                  <Label htmlFor="product-stock">Stock level</Label>
                  <Input
                    id="product-stock"
                    type="number"
                    min="0"
                    step="1"
                    value={editor.stockLevel}
                    onChange={(e) => setEditor((prev) => (prev ? { ...prev, stockLevel: Number(e.target.value) } : prev))}
                  />
                </div>
                <div className="grid gap-2">
                  <Label htmlFor="product-featured">Featured</Label>
                  <button
                    id="product-featured"
                    type="button"
                    onClick={() => setEditor((prev) => (prev ? { ...prev, isFeatured: !prev.isFeatured } : prev))}
                    className="h-10 rounded-md border px-4 text-sm text-left"
                    style={{ borderColor: '#A5D6A7', color: '#2E2E2E' }}
                  >
                    {editor.isFeatured ? 'Yes, show in featured sections' : 'No, standard catalogue item'}
                  </button>
                </div>
              </div>
            </div>
          )}

          <DialogFooter>
            <Button variant="outline" onClick={() => setEditor(null)}>
              Cancel
            </Button>
            <Button onClick={() => void handleSaveProduct()} disabled={isSaving} style={{ backgroundColor: '#2E7D32' }}>
              {isSaving ? 'Saving...' : 'Save changes'}
            </Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>
    </div>
  );
}
