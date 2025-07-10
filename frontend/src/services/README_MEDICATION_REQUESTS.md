# Medication Request Service

This service provides functions for interacting with the parent medication request APIs. It handles fetching request history, submitting new requests, updating existing requests, and canceling requests.

## Available Functions

### 1. Fetch Medication History

```javascript
import medicationRequestService from "../services/medicationRequestService";

// Get medication history for the logged-in parent
const fetchMedicationHistory = async () => {
  try {
    const history = await medicationRequestService.fetchMedicationHistory();
    console.log("Medication history:", history);
    // Process history data
  } catch (error) {
    console.error("Error fetching history:", error);
  }
};
```

### 2. Submit New Medication Request

```javascript
import medicationRequestService from "../services/medicationRequestService";

// Submit a new medication request
const submitNewRequest = async () => {
  const requestData = {
    studentId: 1, // Student ID (required)
    medicineName: "Vitamin C", // Medication name (required)
    dosage: "1 viên mỗi sáng", // Dosage instructions (required)
    frequency: 1, // Times per day (required)
    startDate: "2024-07-10", // Start date in YYYY-MM-DD format (required)
    endDate: "2024-07-17", // End date in YYYY-MM-DD format (required)
    timeToTake: ["08:00", "19:00"], // Array of times to take medication (required)
    notes: "Uống sau khi ăn", // Additional instructions (optional)
    prescriptionImage: fileObject, // File object from input[type=file] (optional)
  };

  try {
    const response = await medicationRequestService.submitMedicationRequest(
      requestData
    );
    console.log("Submission successful:", response);
  } catch (error) {
    console.error("Error submitting request:", error);
  }
};
```

### 3. Update Existing Medication Request

```javascript
import medicationRequestService from "../services/medicationRequestService";

// Update an existing medication request
const updateRequest = async () => {
  const requestId = 123; // ID of the request to update

  // IMPORTANT: Use the field names exactly as they appear in the history API response
  const updatedData = {
    // Request identification
    id: requestId,

    // Student information
    healthProfileId: 5,
    studentName: "Nguyễn Văn A",
    studentClass: "3A1",
    studentId: "HS001",

    // Requester information
    requestedBy: "Nguyễn Thị B",
    requestedByAccountId: "ACC123",
    submittedAt: "2024-05-25",

    // Medication details - Use these exact field names
    medicationName: "Vitamin C Updated", // NOT medicineName
    dosageInstructions: "2 viên mỗi sáng", // NOT dosage
    frequencyPerDay: 2, // NOT frequency

    // Treatment period
    startDate: "2024-07-10",
    endDate: "2024-07-20",

    // Time of day - Must be formatted as a JSON string
    timeOfDay: JSON.stringify(["08:00", "13:00", "19:00"]),

    // Additional instructions
    specialInstructions: "Uống sau khi ăn, đã cập nhật", // NOT notes

    // Status information
    parentProvided: true,
    status: "PENDING_APPROVAL",
  };

  try {
    const response = await medicationRequestService.updateMedicationRequest(
      requestId,
      updatedData
    );
    console.log("Update successful:", response);
  } catch (error) {
    console.error("Error updating request:", error);
  }
};
```

### 4. Cancel Medication Request

```javascript
import medicationRequestService from "../services/medicationRequestService";

// Cancel an existing medication request
const cancelRequest = async () => {
  const requestId = 123; // ID of the request to cancel

  try {
    const response = await medicationRequestService.cancelMedicationRequest(
      requestId
    );
    console.log("Cancellation successful:", response);
  } catch (error) {
    console.error("Error canceling request:", error);
  }
};
```

### 5. Get Medication Administration Details

```javascript
import medicationRequestService from "../services/medicationRequestService";
import { useAuth } from "../context/AuthContext";

// In your component
const { API_ENDPOINTS } = useAuth();

// Get administration details for a medication request
const getAdministrationDetails = async () => {
  const requestId = 123; // ID of the request

  try {
    const details =
      await medicationRequestService.getMedicationAdministrationDetails(
        requestId,
        API_ENDPOINTS
      );
    console.log("Administration details:", details);
    // Process details
  } catch (error) {
    console.error("Error getting details:", error);
  }
};
```

### 6. Convert Image to Base64

```javascript
import medicationRequestService from "../services/medicationRequestService";

// Convert an image file to base64
const convertImage = async () => {
  // Assuming fileObject is from an input[type=file] element
  const fileObject = document.querySelector("input[type=file]").files[0];

  try {
    const base64String = await medicationRequestService.convertImageToBase64(
      fileObject
    );
    console.log("Base64 string:", base64String);
  } catch (error) {
    console.error("Error converting image:", error);
  }
};
```

## API Response Formats

### 1. Medication History Response

```json
[
  {
    "id": 6,
    "submittedAt": "2024-05-25",
    "healthProfileId": 1,
    "studentName": "Nguyễn Minh Anh",
    "studentClass": "3A1",
    "studentId": "HS001",
    "requestedBy": "Nguyễn Văn An",
    "requestedByAccountId": "ACC006",
    "medicationName": "Vitamin C",
    "dosageInstructions": "1 viên mỗi sáng",
    "startDate": "2024-06-01",
    "endDate": "2024-08-30",
    "frequencyPerDay": 1,
    "timeOfDay": "[\"08:00\"]",
    "specialInstructions": "Uống sau ăn sáng",
    "prescriptionImageUrl": "base64_image",
    "parentProvided": true,
    "status": "APPROVED",
    "rejectionReason": null,
    "approvedBy": "Nguyễn Thị Hoa",
    "responseDate": "2024-05-26T09:00:00"
  }
]
```

### 2. Submit Medication Request - Request Format

```json
{
  "studentId": 1,
  "medicineName": "Vitamin C",
  "dosage": "1 viên mỗi sáng",
  "frequency": 1,
  "startDate": "2024-07-10",
  "endDate": "2024-07-17",
  "timeToTake": ["08:00", "19:00"],
  "notes": "Uống sau khi ăn",
  "prescriptionImageBase64": "base64_encoded_string"
}
```

### 3. Update Medication Request - Request Format

```json
{
  "id": 6,
  "submittedAt": "2024-05-25",
  "healthProfileId": 1,
  "studentName": "Nguyễn Minh Anh",
  "studentClass": "3A1",
  "studentId": "HS001",
  "requestedBy": "Nguyễn Văn An",
  "requestedByAccountId": "ACC006",
  "medicationName": "Vitamin C Updated",
  "dosageInstructions": "2 viên mỗi sáng",
  "startDate": "2024-06-01",
  "endDate": "2024-08-30",
  "frequencyPerDay": 2,
  "timeOfDay": "[\"08:00\",\"19:00\"]",
  "specialInstructions": "Uống sau ăn sáng, đã cập nhật",
  "parentProvided": true,
  "status": "PENDING_APPROVAL"
}
```

## Status Values

The medication request can have the following status values:

- `PENDING_APPROVAL`: Request is awaiting approval
- `APPROVED`: Request has been approved
- `REJECTED`: Request has been rejected
- `COMPLETED`: Medication administration has been completed
- `CANCELLED`: Request has been canceled

## Field Name Mapping

When updating medication requests, ensure you use the correct field names as they appear in the history API response:

| Submit API Field | History/Update API Field   |
| ---------------- | -------------------------- |
| medicineName     | medicationName             |
| dosage           | dosageInstructions         |
| frequency        | frequencyPerDay            |
| timeToTake       | timeOfDay (as JSON string) |
| notes            | specialInstructions        |

## Error Handling

All functions in the service throw errors if API calls fail. Be sure to handle these errors in your code:

```javascript
try {
  // Call service function
} catch (error) {
  // Handle different error types
  if (error.response) {
    // Server responded with an error status
    console.error("Server error:", error.response.data.message);
  } else if (error.request) {
    // Request was made but no response was received
    console.error("Network error - no response received");
  } else {
    // Error in setting up the request
    console.error("Request error:", error.message);
  }
}
```

## Demo Component

A demo component is provided to showcase all these functions in action. You can find it at:

`/src/Pages/Parent/pages/SendMedicine_co/MedicationRequestDemo.jsx`

To use it, import and add it to your route configuration or include it in an existing component.
