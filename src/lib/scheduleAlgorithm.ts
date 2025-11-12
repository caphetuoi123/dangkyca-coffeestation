interface DaySchedule {
  [shift: string]: string[];
}

interface WeekSchedule {
  [day: string]: DaySchedule;
}

interface StoreSchedule {
  [storeId: string]: WeekSchedule;
}

const DAYS = ["Thứ 2", "Thứ 3", "Thứ 4", "Thứ 5", "Thứ 6", "Thứ 7", "Chủ nhật"];
const SHIFTS = ["Sáng", "Trưa", "Chiều", "Tối"];
const SHIFT_REQUIREMENTS: { [key: string]: number } = {
  "Sáng": 2,
  "Trưa": 1,
  "Chiều": 1,
  "Tối": 1,
};

export function generateOptimalScheduleForStores(
  preferences: WeekSchedule,
  storeIds: string[]
): StoreSchedule {
  const storeSchedules: StoreSchedule = {};
  const employeeAssignments: {
    [employee: string]: { [day: string]: { [shift: string]: string | null } };
  } = {};

  // Initialize employee assignments tracking
  const allEmployees = new Set<string>();
  Object.values(preferences).forEach((dayPrefs) => {
    Object.values(dayPrefs).forEach((employees) => {
      employees.forEach((emp) => allEmployees.add(emp));
    });
  });

  allEmployees.forEach((emp) => {
    employeeAssignments[emp] = {};
    DAYS.forEach((day) => {
      employeeAssignments[emp][day] = {};
      SHIFTS.forEach((shift) => {
        employeeAssignments[emp][day][shift] = null;
      });
    });
  });

  // Initialize store schedules
  storeIds.forEach((storeId) => {
    storeSchedules[storeId] = {};
    DAYS.forEach((day) => {
      storeSchedules[storeId][day] = {};
      SHIFTS.forEach((shift) => {
        storeSchedules[storeId][day][shift] = [];
      });
    });
  });

  // Count total shifts per employee across all stores
  const employeeShiftCount: { [employee: string]: number } = {};
  allEmployees.forEach((emp) => (employeeShiftCount[emp] = 0));

  // Assign employees to stores for each day and shift
  DAYS.forEach((day) => {
    SHIFTS.forEach((shift) => {
      const availableEmployees = preferences[day]?.[shift] || [];
      const required = SHIFT_REQUIREMENTS[shift];

      // Filter employees who haven't been assigned to any store for this day-shift
      const unassignedEmployees = availableEmployees.filter(
        (emp) => employeeAssignments[emp][day][shift] === null
      );

      // Sort by total shift count to balance workload
      const sortedEmployees = [...unassignedEmployees].sort(
        (a, b) => employeeShiftCount[a] - employeeShiftCount[b]
      );

      // Assign employees to stores in round-robin fashion
      let employeeIndex = 0;
      for (const storeId of storeIds) {
        const assigned: string[] = [];
        for (let i = 0; i < required && employeeIndex < sortedEmployees.length; i++) {
          const employee = sortedEmployees[employeeIndex];
          assigned.push(employee);
          employeeAssignments[employee][day][shift] = storeId;
          employeeShiftCount[employee]++;
          employeeIndex++;
        }
        storeSchedules[storeId][day][shift] = assigned;
      }
    });
  });

  return storeSchedules;
}

export function getScheduleStats(schedule: WeekSchedule) {
  const employeeShiftCount: { [employee: string]: number } = {};
  let totalAssigned = 0;
  let totalRequired = 0;

  DAYS.forEach((day) => {
    SHIFTS.forEach((shift) => {
      const assigned = schedule[day]?.[shift] || [];
      const required = SHIFT_REQUIREMENTS[shift];

      totalAssigned += assigned.length;
      totalRequired += required;

      assigned.forEach((emp) => {
        employeeShiftCount[emp] = (employeeShiftCount[emp] || 0) + 1;
      });
    });
  });

  return {
    employeeShiftCount,
    totalAssigned,
    totalRequired,
    fillRate: totalRequired > 0 ? (totalAssigned / totalRequired) * 100 : 0,
  };
}

export function getStoreScheduleStats(storeSchedules: StoreSchedule) {
  const employeeShiftCount: { [employee: string]: number } = {};
  let totalAssigned = 0;
  let totalRequired = 0;

  Object.values(storeSchedules).forEach((schedule) => {
    DAYS.forEach((day) => {
      SHIFTS.forEach((shift) => {
        const assigned = schedule[day]?.[shift] || [];
        const required = SHIFT_REQUIREMENTS[shift];

        totalAssigned += assigned.length;
        totalRequired += required;

        assigned.forEach((emp) => {
          employeeShiftCount[emp] = (employeeShiftCount[emp] || 0) + 1;
        });
      });
    });
  });

  return {
    employeeShiftCount,
    totalAssigned,
    totalRequired,
    fillRate: totalRequired > 0 ? (totalAssigned / totalRequired) * 100 : 0,
  };
}
