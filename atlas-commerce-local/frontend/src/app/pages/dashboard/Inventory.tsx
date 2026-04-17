import { useEffect, useMemo, useState } from 'react';
import { Package, AlertTriangle } from 'lucide-react';
import { Card } from '../../components/ui/card';
import { Button } from '../../components/ui/button';
import { Input } from '../../components/ui/input';
import { Badge } from '../../components/ui/badge';
import { getAdminInventory, updateAdminInventory } from '../../lib/api';
import { toast } from 'sonner';

export function DashboardInventory() {
  const [inventory, setInventory] = useState<any[]>([]);
  const [searchTerm, setSearchTerm] = useState('');

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
          item.category.toLowerCase().includes(searchTerm.toLowerCase()),
      ),
    [inventory, searchTerm],
  );

  const lowStockCount = inventory.filter((item) => item.stockLevel <= item.lowStockThreshold).length;

  const handleUpdateStock = async (item: any, newStock: number) => {
    try {
      await updateAdminInventory(item.productId, Math.max(0, newStock), item.lowStockThreshold);
      await loadInventory();
      toast.success('Stock level updated');
    } catch (error) {
      toast.error(error instanceof Error ? error.message : 'Unable to update stock');
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
          Live inventory controls for the backend catalog
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
          placeholder="Search products by name or category..."
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
                <th className="text-left p-4" style={{ color: '#2E2E2E' }}>Category</th>
                <th className="text-left p-4" style={{ color: '#2E2E2E' }}>Price</th>
                <th className="text-left p-4" style={{ color: '#2E2E2E' }}>Stock Level</th>
                <th className="text-left p-4" style={{ color: '#2E2E2E' }}>Status</th>
              </tr>
            </thead>
            <tbody>
              {filteredInventory.map((item) => {
                const status = getStockStatus(item);
                const isLowStock = item.stockLevel <= item.lowStockThreshold;

                return (
                  <tr key={item.id} className="border-t">
                    <td className="p-4">
                      <div>
                        <p style={{ color: '#2E2E2E', fontWeight: 600 }}>{item.name}</p>
                        <p className="text-sm" style={{ color: '#6B6B6B' }}>{item.unit}</p>
                      </div>
                    </td>
                    <td className="p-4">
                      <span className="text-sm" style={{ color: '#6B6B6B' }}>
                        {item.category}
                      </span>
                    </td>
                    <td className="p-4">
                      <span style={{ color: '#2E7D32', fontWeight: 600 }}>
                        ${item.price.toFixed(2)}
                      </span>
                    </td>
                    <td className="p-4">
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
                    <td className="p-4">
                      <Badge className={`${status.color} ${status.textColor}`}>
                        {status.label}
                      </Badge>
                    </td>
                  </tr>
                );
              })}
            </tbody>
          </table>
        </div>
      </Card>
    </div>
  );
}
