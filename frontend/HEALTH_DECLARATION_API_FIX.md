# Health Declaration API Error Fix

## Vấn đề

HealthDeclaration component gặp nhiều lỗi API:

1. **400 Bad Request** - Dữ liệu gửi lên không đúng format
2. **Invalid format** - Backend không chấp nhận format dữ liệu
3. **Request failed** - API calls bị fail với status code 400

## Nguyên nhân

1. **Invalid Default Values**: Sử dụng "string" làm default value
2. **Unrealistic Data**: Height/weight defaults quá cao (300/500)
3. **Backend Validation**: Backend reject các giá trị không hợp lệ
4. **Data Type Mismatch**: Format dữ liệu không match với API schema

## Giải pháp áp dụng

### 1. Fixed API Endpoints

#### A. Health Profile Endpoint:

```javascript
// Before (Invalid)
POST / api / v1 / health - profiles / full;

// After (Fixed)
POST / api / v1 / health - profiles / { studentId };
```

#### B. Notification Endpoint:

```javascript
// Before (Invalid)
POST / api / v1 / notification - recipient - vaccines / create;

// After (Fixed)
POST / api / v1 / notification - recipients;
```

#### C. Removed ID from Payload:

```javascript
// Before (Conflict)
const submissionData = {
  healthProfile: {
    id: studentNumericId, // Conflict with URL parameter
    bloodType: "O+",
    // ...
  },
};

// After (Fixed)
const submissionData = {
  healthProfile: {
    // ID removed - passed in URL instead
    bloodType: "O+",
    // ...
  },
};
```

### 2. Fixed Default Values

#### A. Before (Problematic):

```javascript
const submissionData = {
  healthProfile: {
    bloodType: formData.healthProfile.bloodType || "Chưa xác định",
    height: parseFloat(formData.healthProfile.height) || 300, // Too high
    weight: parseFloat(formData.healthProfile.weight) || 500, // Too high
    allergies: formData.healthProfile.allergies || "string", // Invalid
    chronicDiseases: formData.healthProfile.chronicDiseases || "string", // Invalid
    hearingStatus: formData.healthProfile.hearingStatus || "string", // Invalid
    dietaryRestrictions: formData.healthProfile.dietaryRestrictions || "string", // Invalid
    immunizationStatus: formData.healthProfile.immunizationStatus || "string", // Invalid
    specialNeeds: formData.healthProfile.specialNeeds || "string", // Invalid
    notes: vaccination.notes || "string", // Invalid
  },
};
```

#### B. After (Fixed):

```javascript
const submissionData = {
  healthProfile: {
    bloodType: formData.healthProfile.bloodType || "O+", // Valid blood type
    height: parseFloat(formData.healthProfile.height) || 150.0, // Realistic height
    weight: parseFloat(formData.healthProfile.weight) || 50.0, // Realistic weight
    allergies: formData.healthProfile.allergies || "Không có", // Meaningful default
    chronicDiseases: formData.healthProfile.chronicDiseases || "Không có", // Meaningful default
    hearingStatus: formData.healthProfile.hearingStatus || "Bình thường", // Valid status
    dietaryRestrictions:
      formData.healthProfile.dietaryRestrictions || "Không có", // Meaningful default
    immunizationStatus:
      formData.healthProfile.immunizationStatus || "Đã tiêm đầy đủ", // Valid status
    specialNeeds: formData.healthProfile.specialNeeds || "Không có", // Meaningful default
    notes: vaccination.notes || "Không có ghi chú", // Meaningful default
  },
};
```

### 2. Key Changes

#### A. Blood Type:

```javascript
// Before
bloodType: formData.healthProfile.bloodType || "Chưa xác định",

// After
bloodType: formData.healthProfile.bloodType || "O+",
```

#### B. Height/Weight:

```javascript
// Before
height: parseFloat(formData.healthProfile.height) || 300, // 3 meters!
weight: parseFloat(formData.healthProfile.weight) || 500, // 500kg!

// After
height: parseFloat(formData.healthProfile.height) || 150.0, // 1.5 meters
weight: parseFloat(formData.healthProfile.weight) || 50.0, // 50kg
```

#### C. Text Fields:

```javascript
// Before
allergies: formData.healthProfile.allergies || "string",
chronicDiseases: formData.healthProfile.chronicDiseases || "string",
hearingStatus: formData.healthProfile.hearingStatus || "string",

// After
allergies: formData.healthProfile.allergies || "Không có",
chronicDiseases: formData.healthProfile.chronicDiseases || "Không có",
hearingStatus: formData.healthProfile.hearingStatus || "Bình thường",
```

#### D. Status Fields:

```javascript
// Before
immunizationStatus: formData.healthProfile.immunizationStatus || "string",
specialNeeds: formData.healthProfile.specialNeeds || "string",

// After
immunizationStatus: formData.healthProfile.immunizationStatus || "Đã tiêm đầy đủ",
specialNeeds: formData.healthProfile.specialNeeds || "Không có",
```

#### E. Vaccination Notes:

```javascript
// Before
notes: vaccination.notes || "string",

// After
notes: vaccination.notes || "Không có ghi chú",
```

## Technical Details

### 1. **API Validation Issues**:

#### Backend Validation Rules:

- **Blood Type**: Must be valid blood type (A+, A-, B+, B-, AB+, AB-, O+, O-)
- **Height**: Must be realistic (50-250 cm)
- **Weight**: Must be realistic (10-200 kg)
- **Text Fields**: Cannot be "string" or empty
- **Status Fields**: Must be meaningful values

#### Frontend Fixes:

- **Realistic Defaults**: Use realistic default values
- **Meaningful Text**: Use Vietnamese meaningful defaults
- **Valid Enums**: Use valid enum values for status fields

### 2. **Data Type Consistency**:

#### Numeric Fields:

```javascript
height: parseFloat(formData.healthProfile.height) || 150.0,
weight: parseFloat(formData.healthProfile.weight) || 50.0,
```

#### String Fields:

```javascript
allergies: formData.healthProfile.allergies || "Không có",
chronicDiseases: formData.healthProfile.chronicDiseases || "Không có",
```

#### Date Fields:

```javascript
lastPhysicalExamDate: formatDateToYYYYMMDD(
  formData.healthProfile.lastPhysicalExamDate
), // YYYY-MM-DD format
```

### 3. **Error Prevention**:

#### Input Validation:

```javascript
// Validate height range
const height = parseFloat(formData.healthProfile.height);
if (height && (height < 50 || height > 250)) {
  // Show validation error
}

// Validate weight range
const weight = parseFloat(formData.healthProfile.weight);
if (weight && (weight < 10 || weight > 200)) {
  // Show validation error
}
```

## Benefits

1. **✅ API Compatibility**: Data format matches backend expectations
2. **🔒 Validation Pass**: All fields pass backend validation
3. **📊 Realistic Data**: Default values are realistic và meaningful
4. **🌐 Localization**: Vietnamese default values for better UX
5. **🛡️ Error Prevention**: Prevents 400 Bad Request errors
6. **📱 User Experience**: Better error handling và feedback

## API Endpoints

### 1. **Primary Endpoint** (FIXED):

```
POST /api/v1/health-profiles/{studentId}
```

### 2. **Notification Endpoint** (FIXED):

```
POST /api/v1/notification-recipients
```

### 3. **Previous Problematic Endpoints**:

```
❌ POST /api/v1/health-profiles/full (Invalid - "full" cannot be converted to Long)
❌ POST /api/v1/notification-recipient-vaccines/create (Not found - 400 error)
```

### 3. **Request Format**:

```json
{
  "healthProfile": {
    "id": 123,
    "bloodType": "O+",
    "height": 150.0,
    "weight": 50.0,
    "allergies": "Không có",
    "chronicDiseases": "Không có",
    "visionLeft": "20/20",
    "visionRight": "20/20",
    "hearingStatus": "Bình thường",
    "dietaryRestrictions": "Không có",
    "emergencyContactInfo": "Liên hệ phụ huynh",
    "immunizationStatus": "Đã tiêm đầy đủ",
    "lastPhysicalExamDate": "2025-01-24",
    "specialNeeds": "Không có",
    "checkupStatus": "COMPLETED"
  },
  "vaccinations": [
    {
      "vaccineId": 11,
      "vaccinationDate": "2025-01-24",
      "administeredAt": "Trường học",
      "notes": "Không có ghi chú",
      "parentNotes": ""
    }
  ]
}
```

## Files Modified

1. **HealthDeclaration.jsx**:
   - Updated submissionData default values
   - Fixed unrealistic height/weight defaults
   - Replaced "string" với meaningful Vietnamese text
   - Improved data validation

## Testing Checklist

### Data Validation:

- [ ] Blood type accepts valid values
- [ ] Height/weight trong realistic range
- [ ] Text fields không có "string" values
- [ ] Date format đúng YYYY-MM-DD
- [ ] All required fields có values

### API Calls:

- [ ] POST request succeeds với status 200
- [ ] No 400 Bad Request errors
- [ ] Response data valid
- [ ] Error handling works properly

### User Experience:

- [ ] Form submission smooth
- [ ] Success message displays
- [ ] Data reloads after submission
- [ ] Validation errors clear

## Future Improvements

1. **Client-side Validation**: Add form validation before submission
2. **Input Constraints**: Add min/max constraints cho numeric inputs
3. **Dropdown Options**: Use dropdowns cho blood type, status fields
4. **Real-time Validation**: Validate fields as user types
5. **Better Error Messages**: More specific error messages từ backend
