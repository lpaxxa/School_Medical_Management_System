/**
 * Service để tính toán trạng thái checkup record cho students
 * Thay thế cho backend field hasCheckupRecord
 */

import { getAllMedicalCheckups } from '../../../../../services/APINurse/healthCheckupService';

class CheckupStatusService {
  constructor() {
    this.checkupsCache = null;
    this.cacheTimestamp = null;
    this.cacheExpiry = 30000; // 30 seconds
  }

  /**
   * Lấy danh sách medical checkups với cache
   */
  async getMedicalCheckups(forceRefresh = false) {
    const now = Date.now();
    
    // Kiểm tra cache
    if (!forceRefresh && 
        this.checkupsCache && 
        this.cacheTimestamp && 
        (now - this.cacheTimestamp) < this.cacheExpiry) {
      console.log('🔄 [CheckupStatus] Using cached medical checkups');
      return this.checkupsCache;
    }

    try {
      console.log('🔄 [CheckupStatus] Fetching fresh medical checkups...');
      const checkups = await getAllMedicalCheckups();
      
      // Update cache
      this.checkupsCache = checkups;
      this.cacheTimestamp = now;
      
      console.log('✅ [CheckupStatus] Medical checkups loaded:', checkups.length, 'records');
      return checkups;
    } catch (error) {
      console.error('❌ [CheckupStatus] Error fetching medical checkups:', error);
      
      // Return cached data if available, otherwise empty array
      return this.checkupsCache || [];
    }
  }

  /**
   * Tạo map studentId → hasCheckupRecord cho một campaign
   */
  async createCheckupStatusMap(campaignId) {
    try {
      const allCheckups = await this.getMedicalCheckups();
      
      // Filter checkups theo campaignId
      const campaignCheckups = allCheckups.filter(checkup => 
        checkup.healthCampaignId === campaignId || 
        checkup.campaignId === campaignId
      );
      
      console.log(`🔍 [CheckupStatus] Found ${campaignCheckups.length} checkups for campaign ${campaignId}`);
      
      // Tạo map studentId → true
      const statusMap = {};
      campaignCheckups.forEach(checkup => {
        if (checkup.studentId) {
          statusMap[checkup.studentId] = true;
        }
      });
      
      console.log('🔍 [CheckupStatus] Status map:', statusMap);
      return statusMap;
      
    } catch (error) {
      console.error('❌ [CheckupStatus] Error creating status map:', error);
      return {};
    }
  }

  /**
   * Merge student data với checkup status
   */
  async enrichStudentsWithCheckupStatus(students, campaignId) {
    try {
      console.log(`🔄 [CheckupStatus] Enriching ${students.length} students for campaign ${campaignId}`);
      
      const statusMap = await this.createCheckupStatusMap(campaignId);
      
      const enrichedStudents = students.map(student => ({
        ...student,
        hasCheckupRecord: statusMap[student.studentId] || false
      }));
      
      const studentsWithCheckups = enrichedStudents.filter(s => s.hasCheckupRecord).length;
      console.log(`✅ [CheckupStatus] Enriched students: ${studentsWithCheckups}/${students.length} have checkup records`);
      
      return enrichedStudents;
      
    } catch (error) {
      console.error('❌ [CheckupStatus] Error enriching students:', error);
      
      // Fallback: return students with hasCheckupRecord = false
      return students.map(student => ({
        ...student,
        hasCheckupRecord: false
      }));
    }
  }

  /**
   * Cập nhật cache khi có checkup mới được tạo
   */
  invalidateCache() {
    console.log('🔄 [CheckupStatus] Cache invalidated');
    this.checkupsCache = null;
    this.cacheTimestamp = null;
  }

  /**
   * Cập nhật trực tiếp cache khi tạo checkup mới
   */
  addCheckupToCache(newCheckup) {
    if (this.checkupsCache && Array.isArray(this.checkupsCache)) {
      console.log('🔄 [CheckupStatus] Adding new checkup to cache:', newCheckup.id);
      this.checkupsCache.push(newCheckup);
    }
  }
}

// Export singleton instance
const checkupStatusService = new CheckupStatusService();
export default checkupStatusService;
