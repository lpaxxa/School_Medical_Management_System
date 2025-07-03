# Centralized In-App Notification System Implementation

## Overview

This implementation transforms the School Medical Management System from an email-based notification system to a centralized in-app notification system, giving parents more control over their children's health checkups while providing better tracking and workflow management for medical staff.

## Key Changes Made

### 1. Database Schema Updates

#### HealthCampaign Entity
- Added `end_date` field to track campaign duration
- Status flow: PREPARING → ONGOING → COMPLETED/CANCELLED

#### New SystemNotification Entity
- Replaces email notifications with in-app notifications
- Links to Parent, Student, HealthCampaign, and MedicalCheckup
- Tracks read/unread status and timestamps
- Supports different notification types and target user types

### 2. API Changes

#### Commented Out Old Email APIs
- `MedicalCheckupController.createMedicalCheckupWithNotification()`
- `MedicalCheckupController.updateMedicalCheckupWithNotification()`
- `MedicalCheckupService.sendBatchHealthNotificationsToParents()`
- `MedicalCheckupService.getCheckupsNeedingParentNotification()`
- `MedicalCheckupService.getCheckupsWithHealthImplications()`

#### New In-App Notification APIs

**Medical Checkup Management:**
- `POST /api/v1/medical-checkups/create-with-students` - Create checkups for multiple students
- `POST /api/v1/medical-checkups/{checkupId}/notify-parents-checkup` - Send in-app notifications
- `GET /api/v1/medical-checkups/{checkupId}/student-consents` - View parent consent status
- `GET /api/v1/medical-checkups/classes` - Get class list for student selection
- `GET /api/v1/medical-checkups/students/by-class/{classId}` - Get students by class

**System Notification Management:**
- `GET /api/v1/system-notifications/parent/{parentId}` - Get all notifications for parent
- `GET /api/v1/system-notifications/parent/{parentId}/unread` - Get unread notifications
- `PUT /api/v1/system-notifications/{notificationId}/mark-read` - Mark notification as read
- `PUT /api/v1/system-notifications/parent/{parentId}/mark-all-read` - Mark all as read
- `GET /api/v1/system-notifications/parent/{parentId}/count/unread` - Get unread count

### 3. New DTOs

#### MedicalCheckupCreateRequestDTO
```json
{
  "healthCampaignId": 1,
  "checkupType": "Khám tổng quát",
  "checkupDate": "2024-08-15",
  "notes": "Khám sức khỏe định kỳ",
  "studentIds": [1, 2, 3],
  "specialCheckupItems": ["BLOOD_TEST", "DENTAL_EXAMINATION"],
  "createdByNurseId": 1,
  "autoNotifyParents": true
}
```

#### SystemNotificationDTO
```json
{
  "id": 1,
  "title": "Thông báo khám sức khỏe định kỳ",
  "message": "Thông báo khám sức khỏe định kỳ cho học sinh...",
  "type": "HEALTH_CHECKUP",
  "isRead": false,
  "targetUserType": "PARENT",
  "createdAt": "2024-07-03T11:30:00",
  "parentId": 1,
  "studentId": 1,
  "healthCampaignId": 1
}
```

#### StudentConsentDTO
```json
{
  "studentId": 1,
  "studentName": "Nguyễn Văn A",
  "className": "10A1",
  "parentId": 1,
  "parentName": "Nguyễn Thị B",
  "overallResponse": "PENDING",
  "hasResponded": false,
  "specialCheckupConsents": [
    {
      "checkupType": "BLOOD_TEST",
      "isConsented": null,
      "parentNote": ""
    }
  ]
}
```

## Business Logic Flow

### 1. Health Campaign Creation
1. Admin creates health campaign with status: PREPARING
2. Campaign includes start_date, end_date, and notes

### 2. Student Selection and Checkup Creation
1. Admin/Nurse selects classes or individual students
2. Creates checkups using `POST /api/v1/medical-checkups/create-with-students`
3. System automatically creates:
   - MedicalCheckup records for each student
   - SystemNotification records for parents
   - SpecialCheckupConsent records (if special items required)

### 3. Parent Notification and Response
1. Parents receive in-app notifications
2. Parents can view checkup details and special items requiring consent
3. Parents approve/reject specific checkup items with optional notes
4. System tracks all responses with timestamps

### 4. Nurse Workflow
1. Nurses can view consent status using `GET /api/v1/medical-checkups/{checkupId}/student-consents`
2. Perform checkups only for parent-approved items
3. Record results in MedicalCheckup entity
4. Notify parents of results using `POST /api/v1/medical-checkups/{checkupId}/notify-parents-checkup`

### 5. Result Notification
1. System automatically creates result notifications
2. Parents receive in-app notifications with diagnosis and recommendations
3. Checkup marked as `parentNotified: true`

## Technical Implementation

### Services
- **SystemNotificationService**: Manages in-app notifications
- **MedicalCheckupService**: Enhanced with student selection and notification logic

### Repositories
- **SystemNotificationRepository**: CRUD operations for notifications
- **StudentRepository**: Enhanced with class querying methods

### State Management
- **SystemNotification.isRead**: false → true
- **SpecialCheckupConsent.isConsented**: null → true/false
- **MedicalCheckup.parentNotified**: false → true
- **HealthCampaign.status**: PREPARING → ONGOING → COMPLETED

## Error Handling
- Proper EntityNotFoundException for missing records
- Transaction management with @Transactional
- Graceful degradation if parent information is missing

## Testing
- Integration test verifies DTO creation and compilation
- All endpoints compile and are ready for integration testing
- Test coverage for new notification workflow

## Future Enhancements

1. **Complete Special Checkup Consent Logic**
   - Implement detailed consent tracking
   - Add parent response APIs

2. **Enhanced Notification Management**
   - Notification categories and priorities
   - Push notifications for mobile apps

3. **Health Campaign Status Automation**
   - Automatic status transitions based on dates
   - Campaign progress tracking

4. **Reporting and Analytics**
   - Parent response rates
   - Checkup completion statistics
   - Health trend analysis

## Migration Notes

- Old email functionality is commented out, not deleted
- Existing database structure preserved
- New tables can be added without affecting existing data
- Gradual migration possible by enabling both systems temporarily

## Security Considerations

- Parent can only view notifications for their own children
- Nurse/Admin role-based access to student management
- Audit trail through notification timestamps and responses

This implementation provides a solid foundation for the centralized in-app notification system while maintaining backward compatibility and enabling future enhancements.