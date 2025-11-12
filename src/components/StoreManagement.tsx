import { useState } from "react";
import { Card } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Badge } from "@/components/ui/badge";
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogTrigger } from "@/components/ui/dialog";
import { Store, Plus, X, Palette } from "lucide-react";
import { toast } from "sonner";

export interface StoreData {
  id: string;
  name: string;
  color: string;
}

interface StoreManagementProps {
  stores: StoreData[];
  onAddStore: (store: Omit<StoreData, "id">) => void;
  onRemoveStore: (storeId: string) => void;
}

const PRESET_COLORS = [
  "#3b82f6", // blue
  "#8b5cf6", // purple
  "#ec4899", // pink
  "#f59e0b", // amber
  "#10b981", // emerald
  "#ef4444", // red
  "#06b6d4", // cyan
  "#f97316", // orange
];

export const StoreManagement = ({ stores, onAddStore, onRemoveStore }: StoreManagementProps) => {
  const [isDialogOpen, setIsDialogOpen] = useState(false);
  const [newStoreName, setNewStoreName] = useState("");
  const [selectedColor, setSelectedColor] = useState(PRESET_COLORS[0]);

  const handleAddStore = () => {
    const name = newStoreName.trim();
    if (!name) {
      toast.error("Vui lòng nhập tên cửa hàng");
      return;
    }
    if (stores.some(store => store.name === name)) {
      toast.error("Cửa hàng đã tồn tại");
      return;
    }
    onAddStore({ name, color: selectedColor });
    setNewStoreName("");
    setSelectedColor(PRESET_COLORS[0]);
    setIsDialogOpen(false);
    toast.success(`Đã thêm cửa hàng ${name}`);
  };

  const handleRemoveStore = (storeId: string, storeName: string) => {
    if (stores.length <= 1) {
      toast.error("Phải có ít nhất 1 cửa hàng");
      return;
    }
    onRemoveStore(storeId);
    toast.success(`Đã xóa cửa hàng ${storeName}`);
  };

  return (
    <Card className="p-6 space-y-4">
      <div className="flex items-center justify-between">
        <div className="flex items-center gap-3">
          <div className="p-2 rounded-lg bg-primary/10">
            <Store className="w-5 h-5 text-primary" />
          </div>
          <div>
            <h3 className="font-semibold text-lg">Quản lý cửa hàng</h3>
            <p className="text-sm text-muted-foreground">{stores.length} cửa hàng</p>
          </div>
        </div>
        <Dialog open={isDialogOpen} onOpenChange={setIsDialogOpen}>
          <DialogTrigger asChild>
            <Button size="sm" className="gap-2">
              <Plus className="w-4 h-4" />
              Thêm cửa hàng
            </Button>
          </DialogTrigger>
          <DialogContent>
            <DialogHeader>
              <DialogTitle>Thêm cửa hàng mới</DialogTitle>
            </DialogHeader>
            <div className="space-y-4">
              <div>
                <label className="text-sm font-medium mb-2 block">Tên cửa hàng</label>
                <Input
                  placeholder="Ví dụ: Station 891"
                  value={newStoreName}
                  onChange={(e) => setNewStoreName(e.target.value)}
                  onKeyPress={(e) => e.key === "Enter" && handleAddStore()}
                />
              </div>
              <div>
                <label className="text-sm font-medium mb-2 block flex items-center gap-2">
                  <Palette className="w-4 h-4" />
                  Màu đại diện
                </label>
                <div className="grid grid-cols-4 gap-2">
                  {PRESET_COLORS.map((color) => (
                    <button
                      key={color}
                      onClick={() => setSelectedColor(color)}
                      className={`h-12 rounded-lg border-2 transition-all ${
                        selectedColor === color ? "border-foreground scale-105" : "border-border"
                      }`}
                      style={{ backgroundColor: color }}
                    />
                  ))}
                </div>
              </div>
              <Button onClick={handleAddStore} className="w-full">
                Thêm
              </Button>
            </div>
          </DialogContent>
        </Dialog>
      </div>

      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-3">
        {stores.map((store) => (
          <Card
            key={store.id}
            className="p-4 hover:shadow-md transition-shadow group"
            style={{ borderLeftWidth: "4px", borderLeftColor: store.color }}
          >
            <div className="flex items-center justify-between">
              <div className="flex items-center gap-3">
                <div
                  className="w-10 h-10 rounded-lg flex items-center justify-center"
                  style={{ backgroundColor: `${store.color}20` }}
                >
                  <Store className="w-5 h-5" style={{ color: store.color }} />
                </div>
                <div>
                  <h4 className="font-semibold">{store.name}</h4>
                  <Badge
                    variant="secondary"
                    className="text-xs mt-1"
                    style={{ backgroundColor: `${store.color}20`, color: store.color }}
                  >
                    {store.id}
                  </Badge>
                </div>
              </div>
              <button
                onClick={() => handleRemoveStore(store.id, store.name)}
                className="opacity-0 group-hover:opacity-100 transition-opacity hover:text-destructive"
              >
                <X className="w-4 h-4" />
              </button>
            </div>
          </Card>
        ))}
      </div>
    </Card>
  );
};
