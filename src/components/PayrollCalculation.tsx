import { useState } from "react";
import { Card } from "@/components/ui/card";
import { Input } from "@/components/ui/input";
import { Button } from "@/components/ui/button";
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from "@/components/ui/table";
import { DollarSign, Download } from "lucide-react";
import { Employee } from "@/hooks/useCloudSync";
import * as XLSX from 'xlsx';

interface DaySchedule {
  [shift: string]: string[];
}

interface WeekSchedule {
  [day: string]: DaySchedule;
}

interface StoreSchedule {
  [storeId: string]: WeekSchedule;
}

interface PayrollCalculationProps {
  employees: Employee[];
  storeSchedules: StoreSchedule;
}

const SHIFT_HOURS = {
  "Sáng": 4,   // 6h-10h
  "Trưa": 4,   // 10h-14h
  "Chiều": 4,  // 14h-18h
  "Tối": 4,    // 18h-22h
};

export const PayrollCalculation = ({ employees, storeSchedules }: PayrollCalculationProps) => {
  const [baseSalary, setBaseSalary] = useState<string>("50000");

  const exportToExcel = () => {
    const data: any[] = [];
    
    // Create header
    data.push(['Mã NV', 'Tên nhân viên', 'Hệ số lương', 'Số giờ', 'Lương cơ bản (VNĐ/giờ)', 'Lương (VNĐ)']);
    
    // Fill data
    payrollData.forEach(item => {
      data.push([
        item.id,
        item.name,
        (item.salaryCoefficient ?? 1.0).toFixed(1),
        `${item.hours}h`,
        parseFloat(baseSalary),
        item.salary
      ]);
    });
    
    // Add total row
    data.push(['', '', '', '', 'Tổng cộng:', totalSalary]);
    
    // Create worksheet
    const ws = XLSX.utils.aoa_to_sheet(data);
    
    // Set column widths
    ws['!cols'] = [
      { wch: 10 },
      { wch: 25 },
      { wch: 15 },
      { wch: 10 },
      { wch: 20 },
      { wch: 15 }
    ];
    
    // Create workbook
    const wb = XLSX.utils.book_new();
    XLSX.utils.book_append_sheet(wb, ws, 'Bảng lương');
    
    // Generate file name with current date
    const fileName = `Bang_luong_${new Date().toISOString().split('T')[0]}.xlsx`;
    
    // Download
    XLSX.writeFile(wb, fileName);
  };

  const calculateEmployeeHours = (employeeName: string): number => {
    let totalHours = 0;
    
    Object.values(storeSchedules).forEach(weekSchedule => {
      Object.values(weekSchedule).forEach(daySchedule => {
        Object.entries(daySchedule).forEach(([shift, employeeList]) => {
          if (employeeList.includes(employeeName)) {
            totalHours += SHIFT_HOURS[shift as keyof typeof SHIFT_HOURS] || 0;
          }
        });
      });
    });
    
    return totalHours;
  };

  const calculateSalary = (employee: Employee): number => {
    const hours = calculateEmployeeHours(employee.name);
    const base = parseFloat(baseSalary) || 0;
    return hours * base * (employee.salaryCoefficient ?? 1.0);
  };

  const payrollData = employees.map(employee => ({
    ...employee,
    hours: calculateEmployeeHours(employee.name),
    salary: calculateSalary(employee),
  })).sort((a, b) => b.salary - a.salary);

  const totalSalary = payrollData.reduce((sum, item) => sum + item.salary, 0);

  return (
    <Card className="p-6 space-y-4">
      <div className="flex items-center justify-between">
        <div className="flex items-center gap-3">
          <div className="p-2 rounded-lg bg-accent/10">
            <DollarSign className="w-5 h-5 text-accent" />
          </div>
          <div>
            <h3 className="font-semibold text-lg">Bảng tính lương</h3>
            <p className="text-sm text-muted-foreground">Lương hàng tuần theo ca làm việc</p>
          </div>
        </div>
        <div className="flex items-center gap-3">
          <label className="text-sm font-medium">Lương cơ bản (VNĐ/giờ):</label>
          <Input
            type="number"
            step="1000"
            min="0"
            className="w-32"
            value={baseSalary}
            onChange={(e) => setBaseSalary(e.target.value)}
          />
          <Button onClick={exportToExcel} variant="outline" className="gap-2">
            <Download className="w-4 h-4" />
            Xuất Excel
          </Button>
        </div>
      </div>

      <div className="border rounded-lg">
        <Table>
          <TableHeader>
            <TableRow>
              <TableHead>Mã NV</TableHead>
              <TableHead>Tên nhân viên</TableHead>
              <TableHead className="text-right">Hệ số lương</TableHead>
              <TableHead className="text-right">Số giờ</TableHead>
              <TableHead className="text-right">Lương (VNĐ)</TableHead>
            </TableRow>
          </TableHeader>
          <TableBody>
            {payrollData.length === 0 ? (
              <TableRow>
                <TableCell colSpan={5} className="text-center text-muted-foreground">
                  Chưa có dữ liệu lương
                </TableCell>
              </TableRow>
            ) : (
              <>
                {payrollData.map((item) => (
                  <TableRow key={item.id}>
                    <TableCell className="font-medium">{item.id}</TableCell>
                    <TableCell>{item.name}</TableCell>
                    <TableCell className="text-right">{(item.salaryCoefficient ?? 1.0).toFixed(1)}</TableCell>
                    <TableCell className="text-right">{item.hours}h</TableCell>
                    <TableCell className="text-right font-semibold">
                      {item.salary.toLocaleString('vi-VN')}
                    </TableCell>
                  </TableRow>
                ))}
                <TableRow className="bg-muted/50 font-bold">
                  <TableCell colSpan={4} className="text-right">Tổng cộng:</TableCell>
                  <TableCell className="text-right text-primary">
                    {totalSalary.toLocaleString('vi-VN')} VNĐ
                  </TableCell>
                </TableRow>
              </>
            )}
          </TableBody>
        </Table>
      </div>

      <div className="text-sm text-muted-foreground">
        <p><strong>Công thức tính:</strong> Lương = Số giờ × Lương cơ bản × Hệ số lương</p>
        <p className="mt-1"><strong>Thời gian ca:</strong> Mỗi ca làm việc 4 giờ</p>
      </div>
    </Card>
  );
};
