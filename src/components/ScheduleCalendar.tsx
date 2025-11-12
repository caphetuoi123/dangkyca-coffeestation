import { useState } from "react";
import { Card } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { Calendar, Users, Clock, Download } from "lucide-react";
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
  title = "Lịch làm việc tuần"
}: { 
  schedule: WeekSchedule;
  preferences?: WeekSchedule;
  title?: string;
}) => {

  const exportToExcel = () => {
    const data: any[] = [];
    
    // Create header
    data.push(['Ngày', 'Ca', 'Thời gian', 'Nhân viên được phân bổ', 'Số lượng yêu cầu']);
    
    // Fill data
    DAYS.forEach(day => {
      SHIFTS.forEach(shift => {
        const assignedEmployees = getEmployeesForShift(day, shift);
        const required = SHIFT_REQUIREMENTS[shift];
        const timeRange = SHIFT_TIMES[shift as keyof typeof SHIFT_TIMES];
        
        data.push([
          day,
          shift,
          timeRange,
          assignedEmployees.join(', ') || 'Chưa phân công',
          `${assignedEmployees.length}/${required}`
        ]);
      });
    });
    
    // Create worksheet
    const ws = XLSX.utils.aoa_to_sheet(data);
    
    // Set column widths
    ws['!cols'] = [
      { wch: 15 },
      { wch: 10 },
      { wch: 12 },
      { wch: 40 },
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
                  const assignedEmployees = getEmployeesForShift(day, shift);
                  const registeredEmployees = preferences?.[day]?.[shift] || [];
                  const { assigned, required, isFull } = getShiftStatus(day, shift);
                  return (
                    <div
                      key={shift}
                      className={`p-3 rounded-lg border-2 transition-all ${getShiftColor(shift)} hover:shadow-md`}
                    >
                      <div className="flex items-center justify-between mb-2">
                        <div className="flex items-center gap-2">
                          <Clock className="w-3 h-3" />
                          <span className="font-medium text-sm">{shift}</span>
                        </div>
                        <Badge variant="secondary" className="text-xs">
                          {assigned}/{required}
                        </Badge>
                      </div>
                      <div className="text-xs text-muted-foreground mb-1">
                        {SHIFT_TIMES[shift as keyof typeof SHIFT_TIMES]}
                      </div>
                      
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
