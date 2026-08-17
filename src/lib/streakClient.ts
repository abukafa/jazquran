import { db } from "@/lib/dexie";

// Helper to parse page number from strings like "1a", "20b", "1", etc.
const parsePage = (pageStr: string | undefined): number | null => {
  if (!pageStr) return null;
  const num = parseInt(pageStr.replace(/\D/g, ""), 10);
  return isNaN(num) ? null : num;
};

// Logic for Streak calculation with flexible gap (default 1 day allowed to be missed)
const calculateStreak = (activeDates: Date[]): number => {
  if (activeDates.length === 0) return 0;

  // Normalize dates to start of day and sort descending
  const normalizedDates = Array.from(new Set(activeDates.map(d => {
    const dt = new Date(d);
    dt.setHours(0, 0, 0, 0);
    return dt.getTime();
  }))).sort((a, b) => b - a);

  if (normalizedDates.length === 0) return 0;

  const ONE_DAY = 24 * 60 * 60 * 1000;
  const today = new Date();
  today.setHours(0, 0, 0, 0);

  const diffDaysFromToday = Math.round((today.getTime() - normalizedDates[0]) / ONE_DAY);
  const maxGapAllowed = 1; // 1 day gap allowed (meaning max diff of 2 days)

  // If the most recent activity is older than the allowed gap from today, streak is 0
  if (diffDaysFromToday > maxGapAllowed + 1) {
    return 0;
  }

  let streak = 1;
  for (let i = 0; i < normalizedDates.length - 1; i++) {
    const diffDays = Math.round((normalizedDates[i] - normalizedDates[i + 1]) / ONE_DAY);
    if (diffDays <= maxGapAllowed + 1) {
      streak++;
    } else {
      break;
    }
  }

  return streak;
};

export async function getStreakListLocal(tenantId: string, halaqahId?: string) {
  try {
    let students = await db.students.where({ tenantId }).toArray();
    if (halaqahId && halaqahId !== 'all') {
      students = students.filter(s => s.halaqahId === halaqahId);
    }

    if (!students || students.length === 0) return [];

    const studentIds = students.map(s => s._id);

    // Fetch all MutabaahDaily for these students
    const records = await db.mutabaahs.where('studentId').anyOf(studentIds).toArray();

    const studentStats: Record<string, { uniquePages: Set<string>, activeDates: Date[] }> = {};

    students.forEach(s => {
      studentStats[s._id] = {
        uniquePages: new Set<string>(),
        activeDates: []
      };
    });

    records.forEach((record) => {
      const sId = record.studentId;
      if (!studentStats[sId]) return;

      let isActiveDay = false;

      // Process MurojaahPartner
      if (record.murojaahPartner && record.murojaahPartner.isCompleted) {
        isActiveDay = true;
        const juz = record.murojaahPartner.juz;
        const dari = parsePage(record.murojaahPartner.halamanDari);
        const ke = parsePage(record.murojaahPartner.halamanKe);

        if (juz && dari !== null && ke !== null) {
          const start = Math.min(dari, ke);
          const end = Math.max(dari, ke);
          for (let p = start; p <= end; p++) {
            studentStats[sId].uniquePages.add(`${juz}-${p}`);
          }
        }
      }

      // Process Tatsbit
      if (record.tatsbit && record.tatsbit.isCompleted) {
        isActiveDay = true;
        const juz = record.tatsbit.juz;
        const dari = parsePage(record.tatsbit.halamanDari);
        const ke = parsePage(record.tatsbit.halamanKe);

        if (juz && dari !== null && ke !== null) {
          const start = Math.min(dari, ke);
          const end = Math.max(dari, ke);
          for (let p = start; p <= end; p++) {
            studentStats[sId].uniquePages.add(`${juz}-${p}`);
          }
        }
      }

      if (isActiveDay) {
        studentStats[sId].activeDates.push(record.tanggal);
      }
    });

    // Need to resolve avatars from users if needed.
    // For now we'll fetch all users to quickly attach avatars
    const users = await db.users.toArray();
    const userMap = new Map(users.map(u => [u._id, u]));

    const result = students.map(student => {
      const stats = studentStats[student._id];
      const distinctJuz = new Set(Array.from(stats.uniquePages).map(p => p.split('-')[0]));
      const totalJuz = distinctJuz.size;
      const streak = calculateStreak(stats.activeDates);
      
      const user = student.userId ? userMap.get(student.userId) : null;

      return {
        id: student._id,
        name: student.nama || "No Name",
        avatar: user?.avatar || null,
        totalJuz,
        streak,
      };
    });

    // Sort by streak descending, then by name
    return result.sort((a, b) => {
      if (b.streak !== a.streak) return b.streak - a.streak;
      return a.name.localeCompare(b.name);
    });

  } catch (error) {
    console.error("Error in getStreakListLocal:", error);
    throw new Error(error instanceof Error ? error.message : "Failed to fetch streak list");
  }
}

export async function getStudentHeatmapLocal(studentId: string) {
  try {
    const student = await db.students.get(studentId);
    if (!student) throw new Error("Student not found");

    const records = await db.mutabaahs.where('studentId').equals(studentId).toArray();

    // Mapping frequency: juz -> page -> count
    const frequencyMap: Record<number, Record<number, number>> = {};

    records.forEach((record) => {
      const processSection = (section: any) => {
        if (section && section.isCompleted) {
          const juz = section.juz;
          const dari = parsePage(section.halamanDari);
          const ke = parsePage(section.halamanKe);

          if (juz && dari !== null && ke !== null) {
            if (!frequencyMap[juz]) frequencyMap[juz] = {};
            const start = Math.min(dari, ke);
            const end = Math.max(dari, ke);
            for (let p = start; p <= end; p++) {
              if (p > 0 && p <= 20) { // Limit to valid pages per juz
                frequencyMap[juz][p] = (frequencyMap[juz][p] || 0) + 1;
              }
            }
          }
        }
      };

      processSection(record.murojaahPartner);
      processSection(record.tatsbit);
    });

    // Format for frontend
    const heatmapData: any[] = [];
    
    // Sort juz ascending
    const sortedJuzKeys = Object.keys(frequencyMap).map(k => parseInt(k, 10)).sort((a, b) => a - b);

    for (const juz of sortedJuzKeys) {
      const pagesObj = frequencyMap[juz];
      const touchedPagesCount = Object.keys(pagesObj).length;
      const completionPercentage = Math.round((touchedPagesCount / 20) * 100);

      // Convert to array of pages 1-20
      const pages = [];
      for (let p = 1; p <= 20; p++) {
        pages.push({
          pageNumber: p,
          frequency: pagesObj[p] || 0
        });
      }

      heatmapData.push({
        juz,
        completionPercentage,
        pages
      });
    }

    return {
      studentName: student.nama || "No Name",
      heatmapData
    };

  } catch (error) {
    console.error("Error in getStudentHeatmapLocal:", error);
    throw new Error("Failed to fetch student heatmap");
  }
}
