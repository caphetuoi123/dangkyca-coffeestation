import { useState, useEffect } from 'react';
import { supabase } from '@/integrations/supabase/client';
import { toast } from 'sonner';
import employeeData from '@/data/employees.json';
import storesData from '@/data/stores.json';

export interface Employee {
  id: string;
  name: string;
  phone: string;
  salaryCoefficient: number;
}

export interface StoreData {
  id: string;
  name: string;
  color: string;
}

// Migrate data from localStorage to cloud
export const useMigrateToCloud = () => {
  const [isMigrating, setIsMigrating] = useState(false);
  const [isMigrated, setIsMigrated] = useState(false);

  useEffect(() => {
    checkAndMigrate();
  }, []);

  const checkAndMigrate = async () => {
    const migrated = localStorage.getItem('cloudMigrated');
    if (migrated === 'true') {
      setIsMigrated(true);
      return;
    }

    setIsMigrating(true);

    try {
      // Check if data already exists in cloud
      const { data: existingEmployees } = await supabase
        .from('employees')
        .select('id')
        .limit(1);

      if (existingEmployees && existingEmployees.length > 0) {
        localStorage.setItem('cloudMigrated', 'true');
        setIsMigrated(true);
        setIsMigrating(false);
        return;
      }

      // Migrate employees
      const localEmployees = localStorage.getItem('employees');
      const employeesToMigrate = localEmployees 
        ? JSON.parse(localEmployees) 
        : employeeData.employees;

      if (employeesToMigrate.length > 0) {
        const { error: empError } = await supabase
          .from('employees')
          .insert(employeesToMigrate.map((emp: Employee) => ({
            id: emp.id,
            name: emp.name,
            phone: emp.phone || '',
            salary_coefficient: emp.salaryCoefficient || 1.0
          })));

        if (empError) throw empError;
      }

      // Migrate stores
      const localStores = localStorage.getItem('stores');
      const storesToMigrate = localStores 
        ? JSON.parse(localStores) 
        : storesData.stores;

      if (storesToMigrate.length > 0) {
        const { error: storeError } = await supabase
          .from('stores')
          .insert(storesToMigrate);

        if (storeError) throw storeError;
      }

      // Migrate weekly schedules
      const weeklyDataList = localStorage.getItem('weeklyDataList');
      if (weeklyDataList) {
        const weeklyData = JSON.parse(weeklyDataList);
        const schedules: any[] = [];

        weeklyData.forEach((week: any) => {
          const preferences = week.preferences || {};
          Object.keys(preferences).forEach((employeeName) => {
            const employee = employeesToMigrate.find((e: Employee) => e.name === employeeName);
            if (employee) {
              schedules.push({
                week_key: week.weekKey,
                employee_id: employee.id,
                preferences: preferences[employeeName]
              });
            }
          });
        });

        if (schedules.length > 0) {
          const { error: schedError } = await supabase
            .from('weekly_schedules')
            .insert(schedules);

          if (schedError) throw schedError;
        }
      }

      // Migrate admin password
      const adminPassword = localStorage.getItem('adminPassword');
      if (adminPassword) {
        const { error: passError } = await supabase
          .from('admin_settings')
          .upsert({
            setting_key: 'admin_password',
            setting_value: adminPassword
          });

        if (passError) throw passError;
      }

      localStorage.setItem('cloudMigrated', 'true');
      setIsMigrated(true);
      console.log('✅ Đã migrate dữ liệu lên cloud thành công');
    } catch (error) {
      console.error('Migration error:', error);
      toast.error('Có lỗi khi migrate dữ liệu lên cloud');
    } finally {
      setIsMigrating(false);
    }
  };

  return { isMigrating, isMigrated };
};

// Hook for employees with realtime sync
export const useEmployees = () => {
  const [employees, setEmployees] = useState<Employee[]>([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    loadEmployees();

    // Set up realtime subscription
    const channel = supabase
      .channel('employees_changes')
      .on(
        'postgres_changes',
        {
          event: '*',
          schema: 'public',
          table: 'employees'
        },
        () => {
          loadEmployees();
        }
      )
      .subscribe();

    return () => {
      supabase.removeChannel(channel);
    };
  }, []);

  const loadEmployees = async () => {
    try {
      const { data, error } = await supabase
        .from('employees')
        .select('*')
        .order('created_at', { ascending: true });

      if (error) throw error;
      
      // Map database fields to Employee interface
      const mappedEmployees = (data || []).map(emp => ({
        id: emp.id,
        name: emp.name,
        phone: emp.phone,
        salaryCoefficient: emp.salary_coefficient || 1.0
      }));
      
      setEmployees(mappedEmployees);
    } catch (error) {
      console.error('Error loading employees:', error);
      toast.error('Không thể tải danh sách nhân viên');
    } finally {
      setLoading(false);
    }
  };

  const addEmployee = async (employee: Employee) => {
    try {
      const { error } = await supabase
        .from('employees')
        .insert([{
          id: employee.id,
          name: employee.name,
          phone: employee.phone,
          salary_coefficient: employee.salaryCoefficient || 1.0
        }]);

      if (error) throw error;
      await loadEmployees();
      toast.success('Đã thêm nhân viên thành công!');
    } catch (error) {
      console.error('Error adding employee:', error);
      toast.error('Không thể thêm nhân viên');
    }
  };

  const updateEmployee = async (oldId: string, newEmployee: Employee) => {
    try {
      // If ID changed, we need to delete old and insert new
      if (oldId !== newEmployee.id) {
        const { error: deleteError } = await supabase
          .from('employees')
          .delete()
          .eq('id', oldId);

        if (deleteError) throw deleteError;

        const { error: insertError } = await supabase
          .from('employees')
          .insert([{
            id: newEmployee.id,
            name: newEmployee.name,
            phone: newEmployee.phone,
            salary_coefficient: newEmployee.salaryCoefficient || 1.0
          }]);

        if (insertError) throw insertError;
      } else {
        const { error } = await supabase
          .from('employees')
          .update({
            name: newEmployee.name,
            phone: newEmployee.phone,
            salary_coefficient: newEmployee.salaryCoefficient || 1.0
          })
          .eq('id', oldId);

        if (error) throw error;
      }

      await loadEmployees();
      toast.success('Đã cập nhật nhân viên thành công!');
    } catch (error) {
      console.error('Error updating employee:', error);
      toast.error('Không thể cập nhật nhân viên');
    }
  };

  const removeEmployee = async (id: string) => {
    try {
      const { error } = await supabase
        .from('employees')
        .delete()
        .eq('id', id);

      if (error) throw error;
      await loadEmployees();
      toast.success('Đã xóa nhân viên thành công!');
    } catch (error) {
      console.error('Error removing employee:', error);
      toast.error('Không thể xóa nhân viên');
    }
  };

  return { employees, loading, addEmployee, updateEmployee, removeEmployee, reload: loadEmployees };
};

// Hook for stores with realtime sync
export const useStores = () => {
  const [stores, setStores] = useState<StoreData[]>([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    loadStores();

    // Set up realtime subscription
    const channel = supabase
      .channel('stores_changes')
      .on(
        'postgres_changes',
        {
          event: '*',
          schema: 'public',
          table: 'stores'
        },
        () => {
          loadStores();
        }
      )
      .subscribe();

    return () => {
      supabase.removeChannel(channel);
    };
  }, []);

  const loadStores = async () => {
    try {
      const { data, error } = await supabase
        .from('stores')
        .select('*')
        .order('created_at', { ascending: true });

      if (error) throw error;
      setStores(data || []);
    } catch (error) {
      console.error('Error loading stores:', error);
      toast.error('Không thể tải danh sách cửa hàng');
    } finally {
      setLoading(false);
    }
  };

  const addStore = async (store: StoreData) => {
    try {
      const { error } = await supabase
        .from('stores')
        .insert([store]);

      if (error) throw error;
      await loadStores();
      toast.success('Đã thêm cửa hàng thành công!');
    } catch (error) {
      console.error('Error adding store:', error);
      toast.error('Không thể thêm cửa hàng');
    }
  };

  const removeStore = async (id: string) => {
    try {
      const { error } = await supabase
        .from('stores')
        .delete()
        .eq('id', id);

      if (error) throw error;
      await loadStores();
      toast.success('Đã xóa cửa hàng thành công!');
    } catch (error) {
      console.error('Error removing store:', error);
      toast.error('Không thể xóa cửa hàng');
    }
  };

  return { stores, loading, addStore, removeStore, reload: loadStores };
};

// Hook for admin settings
export const useAdminSettings = () => {
  const [settings, setSettings] = useState<Record<string, string>>({});
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    loadSettings();
  }, []);

  const loadSettings = async () => {
    try {
      const { data, error } = await supabase
        .from('admin_settings')
        .select('*');

      if (error) throw error;
      
      const settingsMap: Record<string, string> = {};
      (data || []).forEach((item: any) => {
        settingsMap[item.setting_key] = item.setting_value;
      });
      
      setSettings(settingsMap);
    } catch (error) {
      console.error('Error loading settings:', error);
    } finally {
      setLoading(false);
    }
  };

  const updateSetting = async (key: string, value: string) => {
    try {
      const { error } = await supabase
        .from('admin_settings')
        .upsert({
          setting_key: key,
          setting_value: value
        });

      if (error) throw error;
      await loadSettings();
    } catch (error) {
      console.error('Error updating setting:', error);
      throw error;
    }
  };

  return { settings, loading, updateSetting };
};

// Hook for weekly schedules with realtime sync
export const useWeeklySchedules = (weekKey: string, employeeId?: string) => {
  const [schedules, setSchedules] = useState<any[]>([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    loadSchedules();

    // Set up realtime subscription
    const channel = supabase
      .channel('schedules_changes')
      .on(
        'postgres_changes',
        {
          event: '*',
          schema: 'public',
          table: 'weekly_schedules',
          filter: `week_key=eq.${weekKey}`
        },
        () => {
          loadSchedules();
        }
      )
      .subscribe();

    return () => {
      supabase.removeChannel(channel);
    };
  }, [weekKey, employeeId]);

  const loadSchedules = async () => {
    try {
      let query = supabase
        .from('weekly_schedules')
        .select('*')
        .eq('week_key', weekKey);

      if (employeeId) {
        query = query.eq('employee_id', employeeId);
      }

      const { data, error } = await query;

      if (error) throw error;
      setSchedules(data || []);
    } catch (error) {
      console.error('Error loading schedules:', error);
    } finally {
      setLoading(false);
    }
  };

  const saveSchedule = async (employeeId: string, preferences: any) => {
    try {
      const { error } = await supabase
        .from('weekly_schedules')
        .upsert({
          week_key: weekKey,
          employee_id: employeeId,
          preferences: preferences
        }, {
          onConflict: 'week_key,employee_id'
        });

      if (error) throw error;
      await loadSchedules();
      toast.success('Đã lưu đăng ký ca thành công!');
    } catch (error) {
      console.error('Error saving schedule:', error);
      toast.error('Không thể lưu đăng ký ca');
      throw error;
    }
  };

  return { schedules, loading, saveSchedule, reload: loadSchedules };
};

// Hook to get aggregated preferences for all employees for a week
export const useAggregatedPreferences = (weekKey: string) => {
  const { schedules, loading } = useWeeklySchedules(weekKey);
  const { employees } = useEmployees();
  const [aggregatedPreferences, setAggregatedPreferences] = useState<any>({});

  useEffect(() => {
    if (!loading && schedules.length > 0) {
      // Aggregate all employee preferences into a single preferences object
      // Format: preferences[day][shift] = [employee1Name, employee2Name, ...]
      const aggregated: any = {};
      
      schedules.forEach((schedule) => {
        const employee = employees.find(emp => emp.id === schedule.employee_id);
        if (!employee) return;
        
        const employeeName = employee.name;
        const prefs = schedule.preferences || {};
        
        Object.keys(prefs).forEach((day) => {
          if (!aggregated[day]) {
            aggregated[day] = {};
          }
          
          Object.keys(prefs[day]).forEach((shift) => {
            // Check if this employee registered for this shift (boolean value)
            if (prefs[day][shift] === true) {
              if (!aggregated[day][shift]) {
                aggregated[day][shift] = [];
              }
              
              // Add employee name if not already in the list
              if (!aggregated[day][shift].includes(employeeName)) {
                aggregated[day][shift].push(employeeName);
              }
            }
          });
        });
      });
      
      setAggregatedPreferences(aggregated);
    } else if (!loading && schedules.length === 0) {
      setAggregatedPreferences({});
    }
  }, [schedules, loading, employees]);

  return { preferences: aggregatedPreferences, loading };
};

// Hook to manage scheduled weeks
export const useScheduledWeek = (weekKey: string) => {
  const [scheduledWeek, setScheduledWeek] = useState<any>(null);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    loadScheduledWeek();

    // Set up realtime subscription
    const channel = supabase
      .channel('scheduled_week_changes')
      .on(
        'postgres_changes',
        {
          event: '*',
          schema: 'public',
          table: 'scheduled_weeks',
          filter: `week_key=eq.${weekKey}`
        },
        () => {
          loadScheduledWeek();
        }
      )
      .subscribe();

    return () => {
      supabase.removeChannel(channel);
    };
  }, [weekKey]);

  const loadScheduledWeek = async () => {
    try {
      const { data, error } = await (supabase as any)
        .from('scheduled_weeks')
        .select('*')
        .eq('week_key', weekKey)
        .maybeSingle();

      if (error) throw error;
      setScheduledWeek(data);
    } catch (error) {
      console.error('Error loading scheduled week:', error);
    } finally {
      setLoading(false);
    }
  };

  const saveScheduledWeek = async (storeSchedules: any) => {
    try {
      const { error } = await (supabase as any)
        .from('scheduled_weeks')
        .upsert({
          week_key: weekKey,
          is_scheduled: true,
          store_schedules: storeSchedules,
          scheduled_at: new Date().toISOString()
        });

      if (error) throw error;
      await loadScheduledWeek();
    } catch (error) {
      console.error('Error saving scheduled week:', error);
      throw error;
    }
  };

  const clearScheduledWeek = async () => {
    try {
      const { error } = await (supabase as any)
        .from('scheduled_weeks')
        .delete()
        .eq('week_key', weekKey);

      if (error) throw error;
      await loadScheduledWeek();
    } catch (error) {
      console.error('Error clearing scheduled week:', error);
      throw error;
    }
  };

  return { 
    scheduledWeek, 
    loading, 
    isScheduled: scheduledWeek?.is_scheduled || false,
    storeSchedules: scheduledWeek?.store_schedules || {},
    saveScheduledWeek,
    clearScheduledWeek,
    reload: loadScheduledWeek 
  };
};
