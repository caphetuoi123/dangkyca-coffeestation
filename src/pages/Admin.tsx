import { useState, useEffect } from "react";
import { Coffee, Calendar as CalendarIcon, Users as UsersIcon, Store as StoreIcon, LogOut, DollarSign, ChevronLeft, ChevronRight, Settings, Loader2 } from "lucide-react";
import { ScheduleCalendar } from "@/components/ScheduleCalendar";
import { EmployeeManagement } from "@/components/EmployeeManagement";
import { PayrollCalculation } from "@/components/PayrollCalculation";
import { StoreManagement } from "@/components/StoreManagement";
import { Button } from "@/components/ui/button";
import { Card } from "@/components/ui/card";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogTrigger } from "@/components/ui/dialog";
import { Input } from "@/components/ui/input";
import { useNavigate } from "react-router-dom";
import { generateOptimalScheduleForStores, getStoreScheduleStats } from "@/lib/scheduleAlgorithm";
import { toast } from "sonner";
import { useEmployees, useStores, useAdminSettings, useMigrateToCloud, type Employee, type StoreData } from "@/hooks/useCloudSync";

interface DaySchedule {
  [shift: string]: string[];
}

interface WeekSchedule {
  [day: string]: DaySchedule;
}

interface StoreSchedule {
  [storeId: string]: WeekSchedule;
}

interface WeeklyData {
  weekKey: string;
  weekLabel: string;
  preferences: WeekSchedule;
  storeSchedules: StoreSchedule;
  createdAt: string;
}

const DEFAULT_PASSWORD = "admin123";

const Admin = () => {
  const navigate = useNavigate();
  const [isPasswordDialogOpen, setIsPasswordDialogOpen] = useState(false);
  const [passwordForm, setPasswordForm] = useState({ currentPassword: "", newPassword: "", confirmPassword: "" });
  
  // Cloud sync hooks
  const { isMigrating } = useMigrateToCloud();
  const { employees, loading: employeesLoading, addEmployee, updateEmployee, removeEmployee } = useEmployees();
  const { stores, loading: storesLoading, addStore, removeStore } = useStores();
  const { settings, loading: settingsLoading, updateSetting } = useAdminSettings();
  
  // Check authentication
  useEffect(() => {
    const isAuth = sessionStorage.getItem("adminAuth");
    if (!isAuth) {
      navigate("/admin-login");
    }
  }, [navigate]);

  // Weekly data management
  const [weeklyDataList, setWeeklyDataList] = useState<WeeklyData[]>(() => {
    const saved = localStorage.getItem("weeklyDataList");
    return saved ? JSON.parse(saved) : [];
  });

  const [currentWeekIndex, setCurrentWeekIndex] = useState<number>(0);

  // Initialize current week if needed
  useEffect(() => {
    if (weeklyDataList.length === 0) {
      const today = new Date();
      const weekKey = getWeekKey(today);
      const weekLabel = getWeekLabel(today);
      const newWeekData: WeeklyData = {
        weekKey,
        weekLabel,
        preferences: {},
        storeSchedules: {},
        createdAt: today.toISOString(),
      };
      setWeeklyDataList([newWeekData]);
      setCurrentWeekIndex(0);
    }
  }, []);

  const currentWeekData = weeklyDataList[currentWeekIndex];
  const preferences = currentWeekData?.preferences || {};
  const storeSchedules = currentWeekData?.storeSchedules || {};

  const [selectedStore, setSelectedStore] = useState<string>(stores[0]?.id || "");

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

  useEffect(() => {
    if (stores.length > 0 && !selectedStore) {
      setSelectedStore(stores[0].id);
    }
  }, [stores, selectedStore]);

  const handleAddEmployee = (employee: Employee) => {
    addEmployee(employee);
  };

  const handleUpdateEmployee = (oldId: string, newEmployee: Employee) => {
    updateEmployee(oldId, newEmployee);
  };

  const handleRemoveEmployee = (id: string) => {
    const employee = employees.find(emp => emp.id === id);
    if (!employee) return;
    
    removeEmployee(id);
    
    const name = employee.name;
    const newPreferences = { ...preferences };
    Object.keys(newPreferences).forEach(day => {
      Object.keys(newPreferences[day]).forEach(shift => {
        newPreferences[day][shift] = newPreferences[day][shift].filter(emp => emp !== name);
      });
    });

    const newStoreSchedules = { ...storeSchedules };
    Object.keys(newStoreSchedules).forEach(storeId => {
      Object.keys(newStoreSchedules[storeId]).forEach(day => {
        Object.keys(newStoreSchedules[storeId][day]).forEach(shift => {
          newStoreSchedules[storeId][day][shift] = newStoreSchedules[storeId][day][shift].filter(emp => emp !== name);
        });
      });
    });

    // Update current week data
    const updated = [...weeklyDataList];
    updated[currentWeekIndex] = {
      ...currentWeekData,
      preferences: newPreferences,
      storeSchedules: newStoreSchedules,
    };
    setWeeklyDataList(updated);
  };

  const handleAddStore = (store: Omit<StoreData, "id">) => {
    const newStore: StoreData = {
      ...store,
      id: `store-${Date.now()}`,
    };
    addStore(newStore);
  };

  const handleRemoveStore = (storeId: string) => {
    removeStore(storeId);
    const newStoreSchedules = { ...storeSchedules };
    delete newStoreSchedules[storeId];
    
    // Update current week data
    const updated = [...weeklyDataList];
    updated[currentWeekIndex] = {
      ...currentWeekData,
      storeSchedules: newStoreSchedules,
    };
    setWeeklyDataList(updated);
    
    if (selectedStore === storeId && stores.length > 1) {
      setSelectedStore(stores.find(s => s.id !== storeId)?.id || "");
    }
  };

  const handleGenerateSchedule = () => {
    const storeIds = stores.map(s => s.id);
    const generated = generateOptimalScheduleForStores(preferences, storeIds);
    
    const updated = [...weeklyDataList];
    updated[currentWeekIndex] = {
      ...currentWeekData,
      storeSchedules: generated,
    };
    setWeeklyDataList(updated);
    
    const stats = getStoreScheduleStats(generated);
    toast.success("Đã tạo lịch làm việc cho tất cả cửa hàng!", {
      description: `Đã phân bổ ${stats.totalAssigned}/${stats.totalRequired} ca (${stats.fillRate.toFixed(0)}%) cho ${stores.length} cửa hàng`,
    });
  };

  const handlePreviousWeek = () => {
    if (currentWeekIndex > 0) {
      setCurrentWeekIndex(currentWeekIndex - 1);
    }
  };

  const handleNextWeek = () => {
    if (currentWeekIndex < weeklyDataList.length - 1) {
      setCurrentWeekIndex(currentWeekIndex + 1);
    } else {
      // Create new week
      const lastWeek = weeklyDataList[weeklyDataList.length - 1];
      const lastDate = new Date(lastWeek.createdAt);
      const nextDate = new Date(lastDate.getTime() + 7 * 24 * 60 * 60 * 1000);
      const weekKey = getWeekKey(nextDate);
      const weekLabel = getWeekLabel(nextDate);
      
      const newWeekData: WeeklyData = {
        weekKey,
        weekLabel,
        preferences: {},
        storeSchedules: {},
        createdAt: nextDate.toISOString(),
      };
      
      setWeeklyDataList([...weeklyDataList, newWeekData]);
      setCurrentWeekIndex(weeklyDataList.length);
    }
  };

  const handleChangePassword = async () => {
    const savedPassword = settings.admin_password || DEFAULT_PASSWORD;
    
    if (passwordForm.currentPassword !== savedPassword) {
      toast.error("Mật khẩu hiện tại không chính xác");
      return;
    }
    
    if (!passwordForm.newPassword || passwordForm.newPassword.length < 6) {
      toast.error("Mật khẩu mới phải có ít nhất 6 ký tự");
      return;
    }
    
    if (passwordForm.newPassword !== passwordForm.confirmPassword) {
      toast.error("Mật khẩu xác nhận không khớp");
      return;
    }
    
    try {
      await updateSetting('admin_password', passwordForm.newPassword);
      setPasswordForm({ currentPassword: "", newPassword: "", confirmPassword: "" });
      setIsPasswordDialogOpen(false);
      toast.success("Đã đổi mật khẩu thành công!");
    } catch (error) {
      toast.error("Không thể đổi mật khẩu");
    }
  };

  const handleLogout = () => {
    sessionStorage.removeItem("adminAuth");
    toast.success("Đã đăng xuất");
    navigate("/");
  };

  if (isMigrating || employeesLoading || storesLoading || settingsLoading) {
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

  const stats = getStoreScheduleStats(storeSchedules);
  const currentStoreSchedule = storeSchedules[selectedStore] || {};
  const currentStoreName = stores.find(s => s.id === selectedStore)?.name || "";

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
                  Quản lý hệ thống
                </h1>
                <p className="text-sm text-muted-foreground">Hệ thống quản lý đa cửa hàng</p>
              </div>
            </div>
            <div className="flex gap-2 items-center">
              {/* Week Navigation */}
              <div className="flex items-center gap-2 px-4 py-2 bg-card rounded-lg border">
                <Button
                  onClick={handlePreviousWeek}
                  disabled={currentWeekIndex === 0}
                  variant="ghost"
                  size="sm"
                >
                  <ChevronLeft className="w-4 h-4" />
                </Button>
                <span className="text-sm font-medium min-w-[120px] text-center">
                  {currentWeekData?.weekLabel || "Tuần hiện tại"}
                </span>
                <Button
                  onClick={handleNextWeek}
                  variant="ghost"
                  size="sm"
                >
                  <ChevronRight className="w-4 h-4" />
                </Button>
              </div>
              
              <Button onClick={handleGenerateSchedule} size="lg" className="gap-2">
                <CalendarIcon className="w-4 h-4" />
                Tạo lịch cho tất cả cửa hàng
              </Button>
              <Dialog open={isPasswordDialogOpen} onOpenChange={setIsPasswordDialogOpen}>
                <DialogTrigger asChild>
                  <Button variant="outline" size="lg" className="gap-2">
                    <Settings className="w-4 h-4" />
                    Đổi mật khẩu
                  </Button>
                </DialogTrigger>
                <DialogContent>
                  <DialogHeader>
                    <DialogTitle>Đổi mật khẩu quản lý</DialogTitle>
                  </DialogHeader>
                  <div className="space-y-4">
                    <div>
                      <label className="text-sm font-medium mb-2 block">Mật khẩu hiện tại</label>
                      <Input
                        type="password"
                        placeholder="Nhập mật khẩu hiện tại"
                        value={passwordForm.currentPassword}
                        onChange={(e) => setPasswordForm({ ...passwordForm, currentPassword: e.target.value })}
                      />
                    </div>
                    <div>
                      <label className="text-sm font-medium mb-2 block">Mật khẩu mới</label>
                      <Input
                        type="password"
                        placeholder="Nhập mật khẩu mới (tối thiểu 6 ký tự)"
                        value={passwordForm.newPassword}
                        onChange={(e) => setPasswordForm({ ...passwordForm, newPassword: e.target.value })}
                      />
                    </div>
                    <div>
                      <label className="text-sm font-medium mb-2 block">Xác nhận mật khẩu mới</label>
                      <Input
                        type="password"
                        placeholder="Nhập lại mật khẩu mới"
                        value={passwordForm.confirmPassword}
                        onChange={(e) => setPasswordForm({ ...passwordForm, confirmPassword: e.target.value })}
                        onKeyPress={(e) => e.key === "Enter" && handleChangePassword()}
                      />
                    </div>
                    <Button onClick={handleChangePassword} className="w-full">
                      Xác nhận đổi mật khẩu
                    </Button>
                  </div>
                </DialogContent>
              </Dialog>
              <Button onClick={handleLogout} variant="outline" size="lg" className="gap-2">
                <LogOut className="w-4 h-4" />
                Đăng xuất
              </Button>
            </div>
          </div>
        </div>
      </header>

      {/* Main Content */}
      <main className="container mx-auto px-4 py-8 space-y-6">
        <EmployeeManagement
          employees={employees} 
          onAddEmployee={handleAddEmployee}
          onUpdateEmployee={handleUpdateEmployee}
          onRemoveEmployee={handleRemoveEmployee}
          hasUnsavedChanges={false}
          onSave={() => {}}
          onCancel={() => {}}
        />

        <StoreManagement
          stores={stores}
          onAddStore={handleAddStore}
          onRemoveStore={handleRemoveStore}
        />

        {/* Stats Card */}
        {stats.totalAssigned > 0 && (
          <Card className="p-6">
            <div className="grid grid-cols-2 sm:grid-cols-4 gap-6">
              <div>
                <div className="text-sm text-muted-foreground mb-1">Tổng cửa hàng</div>
                <div className="text-3xl font-bold text-primary">
                  {stores.length}
                </div>
              </div>
              <div>
                <div className="text-sm text-muted-foreground mb-1">Tổng ca phân bổ</div>
                <div className="text-3xl font-bold text-accent">
                  {stats.totalAssigned}/{stats.totalRequired}
                </div>
              </div>
              <div>
                <div className="text-sm text-muted-foreground mb-1">Tỷ lệ lấp đầy</div>
                <div className="text-3xl font-bold text-secondary-foreground">
                  {stats.fillRate.toFixed(0)}%
                </div>
              </div>
              <div>
                <div className="text-sm text-muted-foreground mb-1">Nhân viên tham gia</div>
                <div className="text-3xl font-bold text-primary">
                  {Object.keys(stats.employeeShiftCount).length}
                </div>
              </div>
            </div>
          </Card>
        )}

        {/* Schedule View */}
        <Tabs defaultValue="schedule" className="w-full">
          <TabsList className="grid w-full max-w-2xl mx-auto grid-cols-2">
            <TabsTrigger value="schedule" className="gap-2">
              <CalendarIcon className="w-4 h-4" />
              Lịch làm việc
            </TabsTrigger>
            <TabsTrigger value="payroll" className="gap-2">
              <DollarSign className="w-4 h-4" />
              Bảng lương
            </TabsTrigger>
          </TabsList>
          
          <TabsContent value="schedule" className="mt-6 space-y-4">
            {stores.length > 0 && (
              <Card className="p-4">
                <div className="flex items-center gap-4">
                  <StoreIcon className="w-5 h-5 text-muted-foreground" />
                  <div className="flex-1">
                    <label className="text-sm font-medium text-muted-foreground mb-2 block">
                      Chọn cửa hàng
                    </label>
                    <Select value={selectedStore} onValueChange={setSelectedStore}>
                      <SelectTrigger className="w-[250px]">
                        <SelectValue />
                      </SelectTrigger>
                      <SelectContent>
                        {stores.map((store) => (
                          <SelectItem key={store.id} value={store.id}>
                            <div className="flex items-center gap-2">
                              <div
                                className="w-3 h-3 rounded-full"
                                style={{ backgroundColor: store.color }}
                              />
                              {store.name}
                            </div>
                          </SelectItem>
                        ))}
                      </SelectContent>
                    </Select>
                  </div>
                </div>
              </Card>
            )}
            <ScheduleCalendar 
              schedule={currentStoreSchedule}
              preferences={preferences}
              title={`Lịch làm việc - ${currentStoreName}`} 
            />
          </TabsContent>

          <TabsContent value="payroll" className="mt-6">
            <PayrollCalculation 
              employees={employees}
              storeSchedules={storeSchedules}
            />
          </TabsContent>
        </Tabs>
      </main>
    </div>
  );
};

export default Admin;
