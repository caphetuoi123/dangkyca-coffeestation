import { useState } from "react";
import { Card } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { Calendar, Clock, Check, Save, X } from "lucide-react";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";

interface DaySchedule {
  [shift: string]: boolean;
}

interface WeekSchedule {
  [day: string]: DaySchedule;
}

const DAYS = ["Thứ 2", "Thứ 3", "Thứ 4", "Thứ 5", "Thứ 6", "Thứ 7", "Chủ nhật"];
const SHIFTS = ["Sáng", "Trưa", "Chiều", "Tối"];

const SHIFT_TIMES = {
  "Sáng": "6h-10h",
  "Trưa": "10h-14h",
  "Chiều": "14h-18h",
  "Tối": "18h-22h",
};

export const ShiftRegistration = ({
  employees,
  preferences,
  onPreferencesChange,
  onSave,
  onExit,
  defaultSelectedEmployee,
  disableEmployeeSelection = false,
}: {
  employees: string[];
  preferences: WeekSchedule;
  onPreferencesChange: (preferences: WeekSchedule) => void;
  onSave: () => void;
  onExit: () => void;
  defaultSelectedEmployee?: string;
  disableEmployeeSelection?: boolean;
}) => {
  const [selectedEmployee, setSelectedEmployee] = useState<string>(
    defaultSelectedEmployee || employees[0] || ""
  );

  const toggleShiftPreference = (day: string, shift: string) => {
    const hasPreference = preferences[day]?.[shift] || false;

    const newPreferences = { ...preferences };
    if (!newPreferences[day]) {
      newPreferences[day] = {};
    }

    newPreferences[day][shift] = !hasPreference;

    onPreferencesChange(newPreferences);
  };

  const hasEmployeeRegistered = (day: string, shift: string) => {
    return preferences[day]?.[shift] || false;
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

  const getRegistrationCount = () => {
    let count = 0;
    DAYS.forEach(day => {
      SHIFTS.forEach(shift => {
        if (hasEmployeeRegistered(day, shift)) count++;
      });
    });
    return count;
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
            <h2 className="text-2xl font-bold text-foreground">Đăng ký ca làm việc</h2>
            <p className="text-sm text-muted-foreground">Chọn ca có thể làm cho tuần tới</p>
          </div>
        </div>
      </div>

      {/* Employee Selection */}
      <Card className="p-4">
        <div className="flex items-center justify-between">
          <div className="flex-1">
            <label className="text-sm font-medium text-muted-foreground mb-2 block">
              Chọn nhân viên
            </label>
            <Select 
              value={selectedEmployee} 
              onValueChange={setSelectedEmployee}
              disabled={disableEmployeeSelection}
            >
              <SelectTrigger className="w-[200px]">
                <SelectValue />
              </SelectTrigger>
              <SelectContent>
                {employees.map((emp) => (
                  <SelectItem key={emp} value={emp}>
                    {emp}
                  </SelectItem>
                ))}
              </SelectContent>
            </Select>
          </div>
          <div className="text-right">
            <div className="text-sm text-muted-foreground">Đã đăng ký</div>
            <div className="text-2xl font-bold text-primary">{getRegistrationCount()} ca</div>
          </div>
        </div>
      </Card>

      {/* Registration Grid */}
      <div className="grid gap-4">
        {DAYS.map((day) => (
          <Card key={day} className="p-4 hover:shadow-lg transition-shadow">
            <div className="space-y-3">
              <h3 className="font-semibold text-lg text-foreground">{day}</h3>
              <div className="grid grid-cols-4 gap-3">
                {SHIFTS.map((shift) => {
                  const isRegistered = hasEmployeeRegistered(day, shift);
                  
                  return (
                    <button
                      key={shift}
                      onClick={() => toggleShiftPreference(day, shift)}
                      className={`p-3 rounded-lg border-2 transition-all ${getShiftColor(shift)} hover:shadow-md ${
                        isRegistered ? "ring-2 ring-primary ring-offset-2" : ""
                      }`}
                    >
                      <div className="flex items-center justify-between mb-2">
                        <div className="flex items-center gap-2">
                          <Clock className="w-3 h-3" />
                          <span className="font-medium text-sm">{shift}</span>
                        </div>
                        {isRegistered && (
                          <Check className="w-4 h-4 text-primary" />
                        )}
                      </div>
                      <div className="text-left">
                        <div className="text-xs text-muted-foreground">
                          {SHIFT_TIMES[shift as keyof typeof SHIFT_TIMES]}
                        </div>
                      </div>
                    </button>
                  );
                })}
              </div>
            </div>
          </Card>
        ))}
      </div>

      {/* Action Buttons */}
      <Card className="p-6">
        <div className="flex items-center justify-between gap-4">
          <div className="text-sm text-muted-foreground">
            Sau khi hoàn tất đăng ký, nhấn "Lưu lịch đăng ký" để cập nhật dữ liệu vào hệ thống quản lý
          </div>
          <div className="flex gap-3">
            <Button variant="outline" onClick={onExit} className="gap-2">
              <X className="w-4 h-4" />
              Thoát
            </Button>
            <Button onClick={onSave} size="lg" className="gap-2">
              <Save className="w-4 h-4" />
              Lưu lịch đăng ký
            </Button>
          </div>
        </div>
      </Card>
    </div>
  );
};
