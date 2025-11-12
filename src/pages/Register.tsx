import { useState, useEffect } from "react";
import { Coffee, ArrowLeft, Calendar, LogOut, UserCircle, Loader2 } from "lucide-react";
import { ShiftRegistration } from "@/components/ShiftRegistration";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { useNavigate } from "react-router-dom";
import { toast } from "sonner";
import { useEmployees, useWeeklySchedules, useMigrateToCloud, type Employee } from "@/hooks/useCloudSync";


interface DaySchedule {
  [shift: string]: string[];
}

interface WeekSchedule {
  [day: string]: DaySchedule;
}

interface WeeklyData {
  weekKey: string;
  weekLabel: string;
  preferences: WeekSchedule;
  storeSchedules: any;
  createdAt: string;
}

const Register = () => {
  const navigate = useNavigate();
  const { employees: cloudEmployees, loading: employeesLoading } = useEmployees();
  const { isMigrating } = useMigrateToCloud();

  // Helper functions for week management
  function getWeekKey(date: Date): string {
    const year = date.getFullYear();
    const week = getWeekNumber(date);
    return `${year}-W${String(week).padStart(2, '0')}`;
  }

  function getWeekNumber(date: Date): number {
    const d = new Date(Date.UTC(date.getFullYear(), date.getMonth(), date.getDate()));
    const dayNum = d.getUTCDay() || 7;
    d.setUTCDate(d.getUTCDate() + 4 - dayNum);
    const yearStart = new Date(Date.UTC(d.getUTCFullYear(), 0, 1));
    return Math.ceil((((d.getTime() - yearStart.getTime()) / 86400000) + 1) / 7);
  }

  function getWeekDateRange(date: Date): string {
    const d = new Date(date);
    const dayNum = d.getDay() || 7;
    const monday = new Date(d);
    monday.setDate(d.getDate() - dayNum + 1);
    const sunday = new Date(monday);
    sunday.setDate(monday.getDate() + 6);
    
    const formatDate = (date: Date) => {
      const day = String(date.getDate()).padStart(2, '0');
      const month = String(date.getMonth() + 1).padStart(2, '0');
      return `${day}/${month}`;
    };
    
    return `${formatDate(monday)} - ${formatDate(sunday)}`;
  }

  function getWeekLabel(date: Date): string {
    const weekNum = getWeekNumber(date);
    const year = date.getFullYear();
    const dateRange = getWeekDateRange(date);
    return `Tuần ${weekNum} - ${year} (${dateRange})`;
  }

  function getNextWeekDate(): Date {
    const today = new Date();
    const nextWeek = new Date(today.getTime() + 7 * 24 * 60 * 60 * 1000);
    return nextWeek;
  }

  const nextWeekDate = getNextWeekDate();
  const nextWeekKey = getWeekKey(nextWeekDate);
  const nextWeekLabel = getWeekLabel(nextWeekDate);

  const { schedules, saveSchedule } = useWeeklySchedules(nextWeekKey);
  
  const [preferences, setPreferences] = useState<WeekSchedule>({});
  
  // Employee login state
  const [loggedInEmployee, setLoggedInEmployee] = useState<Employee | null>(() => {
    const saved = sessionStorage.getItem("loggedInEmployee");
    if (saved) {
      try {
        return JSON.parse(saved);
      } catch {
        return null;
      }
    }
    return null;
  });
  
  const [employeeId, setEmployeeId] = useState("");
  const [loginError, setLoginError] = useState("");

  // Load employee's schedule when logged in
  useEffect(() => {
    if (loggedInEmployee && schedules.length > 0) {
      const employeeSchedule = schedules.find(s => s.employee_id === loggedInEmployee.id);
      if (employeeSchedule) {
        setPreferences(employeeSchedule.preferences || {});
      }
    }
  }, [loggedInEmployee, schedules]);

  const handleLogin = () => {
    setLoginError("");
    const employee = cloudEmployees.find(emp => emp.id === employeeId.trim());
    
    if (!employee) {
      setLoginError("Mã nhân viên không tồn tại!");
      return;
    }
    
    setLoggedInEmployee(employee);
    sessionStorage.setItem("loggedInEmployee", JSON.stringify(employee));
    toast.success(`Xin chào ${employee.name}!`, {
      description: "Bạn có thể bắt đầu đăng ký ca làm việc",
    });
  };

  const handleLogout = () => {
    setLoggedInEmployee(null);
    sessionStorage.removeItem("loggedInEmployee");
    setEmployeeId("");
    toast.info("Đã đăng xuất");
  };

  const handleSave = async () => {
    if (!loggedInEmployee) return;

    try {
      await saveSchedule(loggedInEmployee.id, preferences);
      toast.success("Đã lưu lịch đăng ký thành công!", {
        description: `Đã lưu cho ${nextWeekLabel}`,
      });
    } catch (error) {
      toast.error("Không thể lưu lịch đăng ký");
    }
  };

  const handleExit = () => {
    navigate("/");
  };

  if (isMigrating || employeesLoading) {
    return (
      <div className="min-h-screen bg-gradient-to-br from-background via-background to-secondary/20 flex items-center justify-center">
        <div className="text-center space-y-4">
          <Loader2 className="w-12 h-12 animate-spin text-primary mx-auto" />
          <p className="text-muted-foreground">
            {isMigrating ? "Đang đồng bộ dữ liệu..." : "Đang tải..."}
          </p>
        </div>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-gradient-to-br from-background via-background to-secondary/20">
      {/* Header */}
      <header className="border-b bg-card/50 backdrop-blur-sm sticky top-0 z-40 shadow-sm">
        <div className="container mx-auto px-4 py-4">
          <div className="flex items-center justify-between">
            <div className="flex items-center gap-3">
              <div className="p-2 rounded-xl bg-gradient-to-br from-primary to-accent">
                <Coffee className="w-6 h-6 text-primary-foreground" />
              </div>
              <div>
                <h1 className="text-2xl font-bold bg-gradient-to-r from-primary to-accent bg-clip-text text-transparent">
                  Đăng ký ca làm việc
                </h1>
                <p className="text-sm text-muted-foreground">Đăng ký cho tuần sắp tới</p>
              </div>
            </div>
            <div className="flex gap-3 items-center">
              <div className="flex items-center gap-2 px-4 py-2 bg-primary/10 rounded-lg border border-primary/20">
                <Calendar className="w-4 h-4 text-primary" />
                <span className="text-sm font-medium text-primary">
                  {nextWeekLabel}
                </span>
              </div>
              <Button variant="outline" onClick={() => navigate("/")} className="gap-2">
                <ArrowLeft className="w-4 h-4" />
                Về trang chủ
              </Button>
            </div>
          </div>
        </div>
      </header>

      {/* Main Content */}
      <main className="container mx-auto px-4 py-8">
        {!loggedInEmployee ? (
          <div className="max-w-md mx-auto mt-12">
            <Card className="border-2 shadow-lg">
              <CardHeader className="text-center pb-4">
                <div className="mx-auto mb-4 p-3 rounded-full bg-primary/10 w-fit">
                  <UserCircle className="w-12 h-12 text-primary" />
                </div>
                <CardTitle className="text-2xl">Đăng nhập nhân viên</CardTitle>
                <CardDescription>
                  Vui lòng nhập mã nhân viên để đăng ký ca làm việc
                </CardDescription>
              </CardHeader>
              <CardContent className="space-y-4">
                <div className="space-y-2">
                  <label htmlFor="employeeId" className="text-sm font-medium">
                    Mã nhân viên
                  </label>
                  <Input
                    id="employeeId"
                    placeholder="Nhập mã nhân viên (VD: NV001)"
                    value={employeeId}
                    onChange={(e) => {
                      setEmployeeId(e.target.value);
                      setLoginError("");
                    }}
                    onKeyDown={(e) => {
                      if (e.key === "Enter") {
                        handleLogin();
                      }
                    }}
                    className={loginError ? "border-destructive" : ""}
                  />
                  {loginError && (
                    <p className="text-sm text-destructive">{loginError}</p>
                  )}
                </div>
                <Button 
                  onClick={handleLogin} 
                  className="w-full"
                  size="lg"
                >
                  Đăng nhập
                </Button>
                <Button 
                  variant="outline" 
                  onClick={() => navigate("/")} 
                  className="w-full"
                >
                  Quay lại trang chủ
                </Button>
              </CardContent>
            </Card>
          </div>
        ) : (
          <>
            <div className="mb-6 flex items-center justify-between bg-card/50 backdrop-blur-sm border rounded-lg p-4 shadow-sm">
              <div className="flex items-center gap-3">
                <div className="p-2 rounded-full bg-primary/10">
                  <UserCircle className="w-6 h-6 text-primary" />
                </div>
                <div>
                  <p className="text-sm text-muted-foreground">Đang đăng nhập với tư cách</p>
                  <p className="font-semibold text-lg">
                    {loggedInEmployee.name} <span className="text-muted-foreground text-sm">({loggedInEmployee.id})</span>
                  </p>
                </div>
              </div>
              <Button variant="outline" onClick={handleLogout} className="gap-2">
                <LogOut className="w-4 h-4" />
                Đăng xuất
              </Button>
            </div>
            <ShiftRegistration
              employees={[loggedInEmployee.name]}
              preferences={preferences}
              onPreferencesChange={setPreferences}
              onSave={handleSave}
              onExit={handleExit}
              defaultSelectedEmployee={loggedInEmployee.name}
              disableEmployeeSelection={true}
            />
          </>
        )}
      </main>
    </div>
  );
};

export default Register;
