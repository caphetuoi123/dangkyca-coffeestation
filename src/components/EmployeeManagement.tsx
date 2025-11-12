import { useState } from "react";
import { Card } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogTrigger } from "@/components/ui/dialog";
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from "@/components/ui/table";
import { Users, Plus, Pencil, Trash2, Save, X, AlertCircle } from "lucide-react";
import { toast } from "sonner";
import { Alert, AlertDescription } from "@/components/ui/alert";
import { Employee } from "@/hooks/useCloudSync";

interface EmployeeManagementProps {
  employees: Employee[];
  onAddEmployee: (employee: Employee) => void;
  onUpdateEmployee: (oldId: string, newEmployee: Employee) => void;
  onRemoveEmployee: (id: string) => void;
  hasUnsavedChanges: boolean;
  onSave: () => void;
  onCancel: () => void;
}

export const EmployeeManagement = ({ 
  employees, 
  onAddEmployee, 
  onUpdateEmployee,
  onRemoveEmployee,
  hasUnsavedChanges,
  onSave,
  onCancel
}: EmployeeManagementProps) => {
  const [isAddDialogOpen, setIsAddDialogOpen] = useState(false);
  const [isEditDialogOpen, setIsEditDialogOpen] = useState(false);
  const [editingEmployee, setEditingEmployee] = useState<Employee | null>(null);
  const [formData, setFormData] = useState({ id: "", name: "", phone: "", salaryCoefficient: "1.0" });

  const handleAdd = () => {
    const id = formData.id.trim();
    const name = formData.name.trim();
    const phone = formData.phone.trim();
    const coefficient = parseFloat(formData.salaryCoefficient);
    
    if (!id) {
      toast.error("Vui lòng nhập mã nhân viên");
      return;
    }
    if (!name) {
      toast.error("Vui lòng nhập tên nhân viên");
      return;
    }
    if (!phone) {
      toast.error("Vui lòng nhập số điện thoại");
      return;
    }
    if (isNaN(coefficient) || coefficient <= 0) {
      toast.error("Hệ số lương phải là số dương");
      return;
    }
    if (employees.some(e => e.id === id)) {
      toast.error("Mã nhân viên đã tồn tại");
      return;
    }
    if (employees.some(e => e.name === name)) {
      toast.error("Tên nhân viên đã tồn tại");
      return;
    }

    onAddEmployee({ id, name, phone, salaryCoefficient: coefficient });
    setFormData({ id: "", name: "", phone: "", salaryCoefficient: "1.0" });
    setIsAddDialogOpen(false);
    toast.success(`Đã thêm nhân viên ${name}`);
  };

  const handleEdit = () => {
    if (!editingEmployee) return;
    
    const id = formData.id.trim();
    const name = formData.name.trim();
    const phone = formData.phone.trim();
    const coefficient = parseFloat(formData.salaryCoefficient);
    
    if (!id) {
      toast.error("Vui lòng nhập mã nhân viên");
      return;
    }
    if (!name) {
      toast.error("Vui lòng nhập tên nhân viên");
      return;
    }
    if (!phone) {
      toast.error("Vui lòng nhập số điện thoại");
      return;
    }
    if (isNaN(coefficient) || coefficient <= 0) {
      toast.error("Hệ số lương phải là số dương");
      return;
    }
    if (employees.some(e => e.id === id && e.id !== editingEmployee.id)) {
      toast.error("Mã nhân viên đã tồn tại");
      return;
    }
    if (employees.some(e => e.name === name && e.id !== editingEmployee.id)) {
      toast.error("Tên nhân viên đã tồn tại");
      return;
    }

    onUpdateEmployee(editingEmployee.id, { id, name, phone, salaryCoefficient: coefficient });
    setIsEditDialogOpen(false);
    setEditingEmployee(null);
    toast.success(`Đã cập nhật nhân viên ${name}`);
  };

  const handleDelete = (employee: Employee) => {
    if (confirm(`Bạn có chắc muốn xóa nhân viên ${employee.name}?`)) {
      onRemoveEmployee(employee.id);
      toast.success(`Đã xóa nhân viên ${employee.name}`);
    }
  };

  const openEditDialog = (employee: Employee) => {
    setEditingEmployee(employee);
    setFormData({ 
      id: employee.id,
      name: employee.name,
      phone: employee.phone || '',
      salaryCoefficient: employee.salaryCoefficient.toString() 
    });
    setIsEditDialogOpen(true);
  };

  return (
    <Card className="p-6 space-y-4">
      {hasUnsavedChanges && (
        <Alert className="border-primary/50 bg-primary/5">
          <AlertCircle className="h-4 w-4 text-primary" />
          <AlertDescription className="text-sm">
            Có thay đổi chưa lưu. Nhớ nhấn "Lưu danh sách" để đồng bộ dữ liệu cho phần đăng ký ca.
          </AlertDescription>
        </Alert>
      )}
      
      <div className="flex items-center justify-between">
        <div className="flex items-center gap-3">
          <div className="p-2 rounded-lg bg-accent/10">
            <Users className="w-5 h-5 text-accent" />
          </div>
          <div>
            <h3 className="font-semibold text-lg">Quản lý nhân viên</h3>
            <p className="text-sm text-muted-foreground">{employees.length} nhân viên</p>
          </div>
        </div>
        <Dialog open={isAddDialogOpen} onOpenChange={setIsAddDialogOpen}>
          <DialogTrigger asChild>
            <Button size="sm" className="gap-2">
              <Plus className="w-4 h-4" />
              Thêm nhân viên
            </Button>
          </DialogTrigger>
          <DialogContent>
            <DialogHeader>
              <DialogTitle>Thêm nhân viên mới</DialogTitle>
            </DialogHeader>
            <div className="space-y-4">
              <div>
                <label className="text-sm font-medium mb-2 block">Mã nhân viên</label>
                <Input
                  placeholder="VD: NV001"
                  value={formData.id}
                  onChange={(e) => setFormData({ ...formData, id: e.target.value })}
                  onKeyPress={(e) => e.key === "Enter" && handleAdd()}
                />
              </div>
              <div>
                <label className="text-sm font-medium mb-2 block">Tên nhân viên</label>
                <Input
                  placeholder="Nhập tên..."
                  value={formData.name}
                  onChange={(e) => setFormData({ ...formData, name: e.target.value })}
                  onKeyPress={(e) => e.key === "Enter" && handleAdd()}
                />
              </div>
              <div>
                <label className="text-sm font-medium mb-2 block">Số điện thoại</label>
                <Input
                  placeholder="Nhập số điện thoại..."
                  value={formData.phone}
                  onChange={(e) => setFormData({ ...formData, phone: e.target.value })}
                  onKeyPress={(e) => e.key === "Enter" && handleAdd()}
                />
              </div>
              <div>
                <label className="text-sm font-medium mb-2 block">Hệ số lương</label>
                <Input
                  type="number"
                  step="0.1"
                  min="0.1"
                  placeholder="1.0"
                  value={formData.salaryCoefficient}
                  onChange={(e) => setFormData({ ...formData, salaryCoefficient: e.target.value })}
                  onKeyPress={(e) => e.key === "Enter" && handleAdd()}
                />
              </div>
              <Button onClick={handleAdd} className="w-full">
                Thêm
              </Button>
            </div>
          </DialogContent>
        </Dialog>
      </div>

      <div className="border rounded-lg">
        <Table>
          <TableHeader>
            <TableRow>
              <TableHead>Mã NV</TableHead>
              <TableHead>Tên nhân viên</TableHead>
              <TableHead className="text-right">Hệ số lương</TableHead>
              <TableHead className="text-right">Thao tác</TableHead>
            </TableRow>
          </TableHeader>
          <TableBody>
            {employees.length === 0 ? (
              <TableRow>
                <TableCell colSpan={4} className="text-center text-muted-foreground">
                  Chưa có nhân viên nào
                </TableCell>
              </TableRow>
            ) : (
              employees.map((employee) => (
                <TableRow key={employee.id}>
                  <TableCell className="font-medium">{employee.id}</TableCell>
                  <TableCell>{employee.name}</TableCell>
                  <TableCell className="text-right">{(employee.salaryCoefficient ?? 1.0).toFixed(1)}</TableCell>
                  <TableCell className="text-right">
                    <div className="flex justify-end gap-2">
                      <Button
                        size="sm"
                        variant="outline"
                        onClick={() => openEditDialog(employee)}
                      >
                        <Pencil className="w-4 h-4" />
                      </Button>
                      <Button
                        size="sm"
                        variant="destructive"
                        onClick={() => handleDelete(employee)}
                      >
                        <Trash2 className="w-4 h-4" />
                      </Button>
                    </div>
                  </TableCell>
                </TableRow>
              ))
            )}
          </TableBody>
        </Table>
      </div>

      <Dialog open={isEditDialogOpen} onOpenChange={setIsEditDialogOpen}>
        <DialogContent>
          <DialogHeader>
            <DialogTitle>Chỉnh sửa thông tin nhân viên</DialogTitle>
          </DialogHeader>
          <div className="space-y-4">
            <div>
              <label className="text-sm font-medium mb-2 block">Mã nhân viên</label>
              <Input
                placeholder="VD: NV001"
                value={formData.id}
                onChange={(e) => setFormData({ ...formData, id: e.target.value })}
                onKeyPress={(e) => e.key === "Enter" && handleEdit()}
              />
            </div>
            <div>
              <label className="text-sm font-medium mb-2 block">Tên nhân viên</label>
              <Input
                placeholder="Nhập tên..."
                value={formData.name}
                onChange={(e) => setFormData({ ...formData, name: e.target.value })}
                onKeyPress={(e) => e.key === "Enter" && handleEdit()}
              />
            </div>
            <div>
              <label className="text-sm font-medium mb-2 block">Số điện thoại</label>
              <Input
                placeholder="Nhập số điện thoại..."
                value={formData.phone}
                onChange={(e) => setFormData({ ...formData, phone: e.target.value })}
                onKeyPress={(e) => e.key === "Enter" && handleEdit()}
              />
            </div>
            <div>
              <label className="text-sm font-medium mb-2 block">Hệ số lương</label>
              <Input
                type="number"
                step="0.1"
                min="0.1"
                placeholder="1.0"
                value={formData.salaryCoefficient}
                onChange={(e) => setFormData({ ...formData, salaryCoefficient: e.target.value })}
                onKeyPress={(e) => e.key === "Enter" && handleEdit()}
              />
            </div>
            <Button onClick={handleEdit} className="w-full">
              Cập nhật
            </Button>
          </div>
        </DialogContent>
      </Dialog>

      {/* Save/Cancel Buttons */}
      {hasUnsavedChanges && (
        <Card className="p-4 bg-muted/30">
          <div className="flex items-center justify-between gap-4">
            <div className="text-sm text-muted-foreground">
              Sau khi hoàn tất chỉnh sửa, nhấn "Lưu danh sách" để đồng bộ dữ liệu nhân viên vào hệ thống
            </div>
            <div className="flex gap-3">
              <Button variant="outline" onClick={onCancel} className="gap-2">
                <X className="w-4 h-4" />
                Hủy thay đổi
              </Button>
              <Button onClick={onSave} size="lg" className="gap-2">
                <Save className="w-4 h-4" />
                Lưu danh sách
              </Button>
            </div>
          </div>
        </Card>
      )}
    </Card>
  );
};
