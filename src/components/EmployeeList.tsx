import { useState } from "react";
import { Card } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogTrigger } from "@/components/ui/dialog";
import { Users, Coffee, Plus, X } from "lucide-react";
import { toast } from "sonner";

interface EmployeeListProps {
  employees: string[];
  onAddEmployee: (name: string) => void;
  onRemoveEmployee: (name: string) => void;
}

export const EmployeeList = ({ employees, onAddEmployee, onRemoveEmployee }: EmployeeListProps) => {
  const [newEmployeeName, setNewEmployeeName] = useState("");
  const [isDialogOpen, setIsDialogOpen] = useState(false);

  const handleAddEmployee = () => {
    const name = newEmployeeName.trim();
    if (!name) {
      toast.error("Vui lòng nhập tên nhân viên");
      return;
    }
    if (employees.includes(name)) {
      toast.error("Nhân viên đã tồn tại");
      return;
    }
    onAddEmployee(name);
    setNewEmployeeName("");
    setIsDialogOpen(false);
    toast.success(`Đã thêm nhân viên ${name}`);
  };

  const handleRemoveEmployee = (name: string) => {
    onRemoveEmployee(name);
    toast.success(`Đã xóa nhân viên ${name}`);
  };

  return (
    <Card className="p-6 space-y-4">
      <div className="flex items-center justify-between">
        <div className="flex items-center gap-3">
          <div className="p-2 rounded-lg bg-accent/10">
            <Users className="w-5 h-5 text-accent" />
          </div>
          <div>
            <h3 className="font-semibold text-lg">Danh sách nhân viên</h3>
            <p className="text-sm text-muted-foreground">{employees.length} nhân viên</p>
          </div>
        </div>
        <Dialog open={isDialogOpen} onOpenChange={setIsDialogOpen}>
          <DialogTrigger asChild>
            <Button size="sm" className="gap-2">
              <Plus className="w-4 h-4" />
              Thêm NV
            </Button>
          </DialogTrigger>
          <DialogContent>
            <DialogHeader>
              <DialogTitle>Thêm nhân viên mới</DialogTitle>
            </DialogHeader>
            <div className="space-y-4">
              <div>
                <Input
                  placeholder="Tên nhân viên"
                  value={newEmployeeName}
                  onChange={(e) => setNewEmployeeName(e.target.value)}
                  onKeyPress={(e) => e.key === "Enter" && handleAddEmployee()}
                />
              </div>
              <Button onClick={handleAddEmployee} className="w-full">
                Thêm
              </Button>
            </div>
          </DialogContent>
        </Dialog>
      </div>

      <div className="grid grid-cols-2 sm:grid-cols-3 md:grid-cols-5 gap-2">
        {employees.map((employee, index) => (
          <Badge
            key={index}
            variant="secondary"
            className="justify-between py-2 px-3 text-sm font-medium hover:bg-primary/10 transition-colors group"
          >
            <span>{employee}</span>
            <button
              onClick={() => handleRemoveEmployee(employee)}
              className="ml-2 opacity-0 group-hover:opacity-100 transition-opacity hover:text-destructive"
            >
              <X className="w-3 h-3" />
            </button>
          </Badge>
        ))}
      </div>
    </Card>
  );
};
