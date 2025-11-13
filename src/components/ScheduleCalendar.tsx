import { useState } from "react";
import { Card } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { Calendar, Users, Clock, Download, Edit2, X, Check } from "lucide-react";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import * as XLSX from 'xlsx';

interface Employee {
  name: string;
  shift: string;
}

interface DaySchedule {
  [shift: string]: string[];
}

interface WeekSchedule {
  [day: string]: DaySchedule;
}

const DAYS = ["Thứ 2", "Thứ 3", "Thứ 4", "Thứ 5", "Thứ 6", "Thứ 7", "Chủ nhật"];
const SHIFTS = ["Sáng", "Trưa", "Chiều", "Tối"];
const SHIFT_REQUIREMENTS: { [key: string]: number } = {
  "Sáng": 2,
  "Trưa": 1,
  "Chiều": 1,
  "Tối": 1,
};

const SHIFT_TIMES = {
  "Sáng": "6h-10h",
  "Trưa": "10h-14h",
  "Chiều": "14h-18h",
  "Tối": "18h-22h",
};

export const ScheduleCalendar = ({ 
  schedule,
  preferences,
  title = "Lịch làm việc tuần",
  onScheduleChange,
  editable = false
}: { 
  schedule: WeekSchedule;
  preferences?: WeekSchedule;
  title?: string;
  onScheduleChange?: (schedule: WeekSchedule) => void;
  editable?: boolean;
}) => {
  const [editingShift, setEditingShift] = useState<{ day: string; shift: string } | null>(null);
  const [tempEmployees, setTempEmployees] = useState<string[]>([]);

  const exportToExcel = () => {
    const data: any[] = [];
    
    // Create header - mỗi nhân viên sẽ là một cột riêng
    data.push(['Ngày', 'Ca', 'Thời gian', 'Nhân viên 1', 'Nhân viên 2', 'Nhân viên 3', 'Số lượng yêu cầu']);
    
    // Fill data
    DAYS.forEach(day => {
      SHIFTS.forEach(shift => {
        const assignedEmployees = getEmployeesForShift(day, shift);
        const required = SHIFT_REQUIREMENTS[shift];
        const timeRange = SHIFT_TIMES[shift as keyof typeof SHIFT_TIMES];
        
        // Tách mỗi nhân viên thành ô riêng biệt
        const row = [
          day,
          shift,
          timeRange,
          assignedEmployees[0] || '',
          assignedEmployees[1] || '',
          assignedEmployees[2] || '',
          `${assignedEmployees.length}/${required}`
        ];
        
        data.push(row);
      });
    });
    
    // Create worksheet
    const ws = XLSX.utils.aoa_to_sheet(data);
    
    // Set column widths
    ws['!cols'] = [
      { wch: 15 },
      { wch: 10 },
      { wch: 12 },
      { wch: 20 },
      { wch: 20 },
      { wch: 20 },
      { wch: 15 }
    ];
    
    // Create workbook
    const wb = XLSX.utils.book_new();
    XLSX.utils.book_append_sheet(wb, ws, 'Lịch làm việc');
    
    // Generate file name with current date
    const fileName = `Lich_lam_viec_${new Date().toISOString().split('T')[0]}.xlsx`;
    
    // Download
    XLSX.writeFile(wb, fileName);
  };

  const startEditShift = (day: string, shift: string) => {
    const currentEmployees = getEmployeesForShift(day, shift);
    setTempEmployees([...currentEmployees]);
    setEditingShift({ day, shift });
  };

  const cancelEdit = () => {
    setEditingShift(null);
    setTempEmployees([]);
  };

  const saveEdit = () => {
    if (editingShift && onScheduleChange) {
      const newSchedule = { ...schedule };
      if (!newSchedule[editingShift.day]) {
        newSchedule[editingShift.day] = {};
      }
      newSchedule[editingShift.day][editingShift.shift] = tempEmployees;
      onScheduleChange(newSchedule);
    }
    setEditingShift(null);
    setTempEmployees([]);
  };

  const addEmployee = (employeeName: string) => {
    if (!tempEmployees.includes(employeeName)) {
      setTempEmployees([...tempEmployees, employeeName]);
    }
  };

  const removeEmployee = (index: number) => {
    setTempEmployees(tempEmployees.filter((_, idx) => idx !== index));
  };

  const getAvailableEmployees = (day: string, shift: string) => {
    // Lấy danh sách nhân viên đã đăng ký cho ca này
    return preferences?.[day]?.[shift] || [];
  };

  const getShiftColor = (shift: string) => {
    switch (shift) {
      case "Sáng":
        return "bg-accent/20 text-accent-foreground border-accent/30";
      case "Trưa":
        return "bg-primary/20 text-primary-foreground border-primary/30";
      case "Chiều":
        return "bg-secondary/20 text-secondary-foreground border-secondary/30";
      case "Tối":
        return "bg-muted text-muted-foreground border-muted/50";
      default:
        return "bg-muted text-muted-foreground";
    }
  };

  const getEmployeesForShift = (day: string, shift: string) => {
    return schedule[day]?.[shift] || [];
  };

  const getShiftStatus = (day: string, shift: string) => {
    const assigned = getEmployeesForShift(day, shift).length;
    const required = SHIFT_REQUIREMENTS[shift];
    return { assigned, required, isFull: assigned >= required };
  };

  return (
    <div className="space-y-6">
      {/* Header */}
      <div className="flex items-center justify-between">
        <div className="flex items-center gap-3">
          <div className="p-3 rounded-xl bg-primary/10">
            <Calendar className="w-6 h-6 text-primary" />
          </div>
          <div>
            <h2 className="text-2xl font-bold text-foreground">{title}</h2>
            <p className="text-sm text-muted-foreground">
              {title === "Lịch làm việc tuần" ? "Lịch làm việc được tự động phân bổ" : "Đăng ký ca làm việc cho tuần tới"}
            </p>
          </div>
        </div>
        <div className="flex items-center gap-4">
          <div className="flex items-center gap-4 text-sm text-muted-foreground">
            <div className="flex items-center gap-1">
              <Clock className="w-4 h-4" />
              <span>Sáng: 2 NV</span>
            </div>
            <div className="flex items-center gap-1">
              <Clock className="w-4 h-4" />
              <span>Trưa-Tối: 1 NV</span>
            </div>
          </div>
          <Button onClick={exportToExcel} variant="outline" className="gap-2">
            <Download className="w-4 h-4" />
            Xuất Excel
          </Button>
        </div>
      </div>

      {/* Calendar Grid */}
      <div className="grid gap-4">
        {DAYS.map((day) => (
          <Card key={day} className="p-4 hover:shadow-lg transition-shadow">
            <div className="space-y-3">
              <div className="flex items-center justify-between">
                <h3 className="font-semibold text-lg text-foreground">{day}</h3>
                <div className="flex gap-1">
                  {SHIFTS.map((shift) => {
                    const { assigned, required, isFull } = getShiftStatus(day, shift);
                    return (
                      <Badge
                        key={shift}
                        variant="outline"
                        className={`text-xs ${getShiftColor(shift)} ${isFull ? 'opacity-100' : 'opacity-60'}`}
                      >
                        {shift}: {assigned}/{required}
                      </Badge>
                    );
                  })}
                </div>
              </div>

              <div className="grid grid-cols-4 gap-3">
                {SHIFTS.map((shift) => {
                  const isEditing = editingShift?.day === day && editingShift?.shift === shift;
                  const assignedEmployees = isEditing ? tempEmployees : getEmployeesForShift(day, shift);
                  const registeredEmployees = preferences?.[day]?.[shift] || [];
                  const availableEmployees = getAvailableEmployees(day, shift).filter(
                    emp => !assignedEmployees.includes(emp)
                  );
                  const { assigned, required, isFull } = getShiftStatus(day, shift);
                  
                  return (
                    <div
                      key={shift}
                      className={`p-3 rounded-lg border-2 transition-all ${getShiftColor(shift)} hover:shadow-md ${
                        isEditing ? "ring-2 ring-primary" : ""
                      }`}
                    >
                      <div className="flex items-center justify-between mb-2">
                        <div className="flex items-center gap-2">
                          <Clock className="w-3 h-3" />
                          <span className="font-medium text-sm">{shift}</span>
                        </div>
                        <div className="flex items-center gap-1">
                          <Badge variant="secondary" className="text-xs">
                            {assignedEmployees.length}/{required}
                          </Badge>
                          {editable && !isEditing && (
                            <Button
                              size="sm"
                              variant="ghost"
                              className="h-6 w-6 p-0"
                              onClick={() => startEditShift(day, shift)}
                            >
                              <Edit2 className="w-3 h-3" />
                            </Button>
                          )}
                        </div>
                      </div>
                      <div className="text-xs text-muted-foreground mb-1">
                        {SHIFT_TIMES[shift as keyof typeof SHIFT_TIMES]}
                      </div>
                      
                      {/* Editing Mode */}
                      {isEditing ? (
                        <div className="space-y-2">
                          <div className="space-y-1">
                            <div className="text-xs font-medium text-foreground">Nhân viên đã chọn:</div>
                            {assignedEmployees.length > 0 ? (
                              assignedEmployees.map((emp, idx) => (
                                <div
                                  key={idx}
                                  className="flex items-center justify-between text-xs px-2 py-1 bg-primary/20 rounded border border-primary/30"
                                >
                                  <span className="font-medium">{emp}</span>
                                  <Button
                                    size="sm"
                                    variant="ghost"
                                    className="h-4 w-4 p-0"
                                    onClick={() => removeEmployee(idx)}
                                  >
                                    <X className="w-3 h-3" />
                                  </Button>
                                </div>
                              ))
                            ) : (
                              <p className="text-xs text-muted-foreground italic">Chưa chọn</p>
                            )}
                          </div>

                          {availableEmployees.length > 0 && (
                            <div className="space-y-1">
                              <div className="text-xs font-medium text-foreground">Thêm nhân viên:</div>
                              <Select onValueChange={addEmployee}>
                                <SelectTrigger className="h-7 text-xs">
                                  <SelectValue placeholder="Chọn..." />
                                </SelectTrigger>
                                <SelectContent>
                                  {availableEmployees.map((emp) => (
                                    <SelectItem key={emp} value={emp} className="text-xs">
                                      {emp}
                                    </SelectItem>
                                  ))}
                                </SelectContent>
                              </Select>
                            </div>
                          )}

                          <div className="flex gap-1 pt-1">
                            <Button
                              size="sm"
                              variant="default"
                              className="h-6 flex-1 text-xs gap-1"
                              onClick={saveEdit}
                            >
                              <Check className="w-3 h-3" />
                              Lưu
                            </Button>
                            <Button
                              size="sm"
                              variant="outline"
                              className="h-6 flex-1 text-xs gap-1"
                              onClick={cancelEdit}
                            >
                              <X className="w-3 h-3" />
                              Hủy
                            </Button>
                          </div>
                        </div>
                      ) : (
                        <>
                          {/* Assigned Employees */}
                          <div className="space-y-1 mb-2">
                            <div className="text-xs font-medium text-foreground">Đã phân bổ:</div>
                            {assignedEmployees.length > 0 ? (
                              assignedEmployees.map((emp, idx) => (
                                <div
                                  key={idx}
                                  className="text-xs px-2 py-1 bg-primary/20 rounded border border-primary/30 font-medium"
                                >
                                  {emp}
                                </div>
                              ))
                            ) : (
                              <p className="text-xs text-muted-foreground italic">Chưa phân công</p>
                            )}
                          </div>

                          {/* Registered Employees */}
                          {registeredEmployees.length > 0 && (
                            <div className="space-y-1 pt-2 border-t border-border/50">
                              <div className="text-xs font-medium text-muted-foreground">Đã đăng ký ({registeredEmployees.length}):</div>
                              <div className="space-y-1 max-h-24 overflow-y-auto">
                                {registeredEmployees.map((emp, idx) => (
                                  <div
                                    key={idx}
                                    className="text-xs px-2 py-1 bg-background/50 rounded border border-border/30"
                                  >
                                    {emp}
                                  </div>
                                ))}
                              </div>
                            </div>
                          )}
                        </>
                      )}
                    </div>
                  );
                })}
              </div>
            </div>
          </Card>
        ))}
      </div>

    </div>
  );
};
