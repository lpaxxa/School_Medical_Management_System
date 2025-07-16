import React, { useState, useEffect } from 'react';
import Swal from 'sweetalert2';
import { Modal, Form, Button, Container, Row, Col, Card, Alert, Badge, Spinner } from 'react-bootstrap';
import inventoryService from '../../../../../services/APINurse/inventoryService';
import { useMedicalEvents } from '../../../../../context/NurseContext/MedicalEventsContext';

const MedicalIncidentUpdateModal = ({ 
  show, 
  selectedEvent, 
  onClose, 
  loading: propLoading = false 
}) => {
  const { updateEvent, loading: contextLoading } = useMedicalEvents();
  const [formData, setFormData] = useState({
    incidentId: '',
    incidentType: '',
    description: '',
    symptoms: '',
    severityLevel: '',
    treatment: '',
    parentNotified: false,
    requiresFollowUp: false,
    followUpNotes: '',
    handledById: 1,
    studentId: '',
    studentName: '',
    dateTime: new Date().toISOString(),
    imageMedicalUrl: '',
    medicationsUsed: []
  });

  // Medication states
  const [medicationSearch, setMedicationSearch] = useState('');
  const [medicationResults, setMedicationResults] = useState([]);
  const [showMedicationDropdown, setShowMedicationDropdown] = useState(false);
  const [searchingMedications, setSearchingMedications] = useState(false);
  const [selectedMedications, setSelectedMedications] = useState([]);
  const [allInventoryItems, setAllInventoryItems] = useState([]); // State for all inventory items

  // Image upload states - following AddHealthArticle pattern
  const [imageFile, setImageFile] = useState(null);
  const [imagePreview, setImagePreview] = useState('');
  const [imageUploadError, setImageUploadError] = useState('');

  // Utility function to handle different date formats
  const formatDateForInput = (dateInput) => {
    if (!dateInput) return '';

    let date;

    // Handle array format from backend [year, month, day]
    if (Array.isArray(dateInput)) {
      if (dateInput.length >= 3) {
        // Month is 0-indexed in JavaScript Date constructor
        date = new Date(dateInput[0], dateInput[1] - 1, dateInput[2]);
      } else {
        return '';
      }
    }
    // Handle string format
    else if (typeof dateInput === 'string') {
      date = new Date(dateInput);
    }
    // Handle Date object
    else if (dateInput instanceof Date) {
      date = dateInput;
    }
    else {
      return '';
    }

    // Check if date is valid
    if (isNaN(date.getTime())) {
      return '';
    }

    return date.toISOString().slice(0, 16);
  };

  const formatDateForDisplay = (dateInput) => {
    if (!dateInput) return 'N/A';

    let date;

    // Handle array format from backend [year, month, day]
    if (Array.isArray(dateInput)) {
      if (dateInput.length >= 3) {
        // Month is 0-indexed in JavaScript Date constructor
        date = new Date(dateInput[0], dateInput[1] - 1, dateInput[2]);
      } else {
        return 'N/A';
      }
    }
    // Handle string format
    else if (typeof dateInput === 'string') {
      date = new Date(dateInput);
    }
    // Handle Date object
    else if (dateInput instanceof Date) {
      date = dateInput;
    }
    else {
      return 'N/A';
    }

    // Check if date is valid
    if (isNaN(date.getTime())) {
      return 'N/A';
    }

    return date.toLocaleDateString('vi-VN', {
      year: 'numeric',
      month: '2-digit',
      day: '2-digit'
    });
  };

  // Initialize form data when modal opens or selectedEvent changes
  useEffect(() => {
    if (show && selectedEvent) {
      console.log("Selected event for update:", selectedEvent);
      
      // Fetch all inventory items first
      const fetchInventory = async () => {
        try {
          const items = await inventoryService.getAllItems();
          if (Array.isArray(items)) {
            setAllInventoryItems(items);
            
            // Set selected medications based on medicationsUsed array from API
            if (Array.isArray(selectedEvent.medicationsUsed)) {
              console.log("Processing array format medications:", selectedEvent.medicationsUsed);
              console.log("Available inventory items:", items.length);
              
              // Xử lý từng thuốc để tìm thông tin chi tiết
              const medicationDetailsPromises = selectedEvent.medicationsUsed.map(async (med) => {
                // Chuẩn hóa ID để so sánh
                const medItemID = typeof med.itemID === 'string' ? med.itemID.trim() : med.itemID;
                const medItemIDNumber = parseInt(medItemID, 10);
                
                console.log(`Finding medication with ID: ${medItemID} (${typeof medItemID})`);
                
                // Tìm thuốc trong kho bằng ID
                let inventoryItem = null;
                
                // Tìm trong danh sách đã tải
                inventoryItem = items.find(item => {
                  const itemID = item.itemID || item.itemId || item.id;
                  const itemIDNumber = parseInt(itemID, 10);
                  return itemIDNumber === medItemIDNumber;
                });
                
                // Nếu không tìm thấy trong danh sách và ID khác 0, gọi API trực tiếp để tìm theo ID
                if (!inventoryItem && !isNaN(medItemIDNumber) && medItemIDNumber > 0) {
                  console.log(`Calling API to find medication by ID: ${medItemIDNumber}`);
                  try {
                    inventoryItem = await inventoryService.getItemById(medItemIDNumber);
                    if (inventoryItem) {
                      console.log(`Found medication via API by ID: ${medItemIDNumber}, name: ${inventoryItem.itemName}`);
                    }
                  } catch (error) {
                    console.warn(`Error fetching medication by ID ${medItemIDNumber}:`, error);
                  }
                }
                
                // Nếu không tìm thấy bằng ID và có tên thuốc, tìm bằng tên
                if (!inventoryItem && med.itemName) {
                  try {
                    console.log(`Searching for medication by name: "${med.itemName}"`);
                    const results = await inventoryService.getItemsByKeyword(med.itemName);
                    if (results && results.length > 0) {
                      // Tìm thuốc phù hợp nhất
                      const normalizedMedName = med.itemName.toLowerCase().trim();
                      const bestMatch = results.find(item => 
                        item.itemName && 
                        item.itemName.toLowerCase().trim() === normalizedMedName
                      ) || results[0]; // Lấy kết quả đầu tiên nếu không có match chính xác
                      
                      inventoryItem = bestMatch;
                      console.log(`Found medication by name: "${med.itemName}" -> "${inventoryItem.itemName}" (ID: ${inventoryItem.itemID || inventoryItem.itemId || inventoryItem.id})`);
                    }
                  } catch (error) {
                    console.warn(`Error searching medication by name "${med.itemName}":`, error);
                  }
                }
                
                // Nếu vẫn không tìm thấy, thử tìm bằng tên thuốc
                if (!inventoryItem && med.itemName) {
                  // Chuẩn hóa tên thuốc để so sánh không phân biệt dấu, khoảng trắng
                  const normalizedMedName = med.itemName.toLowerCase().trim();
                  
                  // Tìm thuốc theo tên 
                  inventoryItem = items.find(item => {
                    if (!item.itemName) return false;
                    const itemName = item.itemName.toLowerCase().trim();
                    return itemName === normalizedMedName ||
                           itemName.includes(normalizedMedName) ||
                           normalizedMedName.includes(itemName);
                  });
                  
                  if (inventoryItem) {
                    console.log(`Found medication by name: "${med.itemName}" -> "${inventoryItem.itemName}" (ID: ${inventoryItem.itemID || inventoryItem.itemId || inventoryItem.id})`);
                  }
                }
                
                if (!inventoryItem) {
                  console.warn(`Medication with itemID ${med.itemID} / name ${med.itemName} not found in inventory. Using default display.`);
                  
                  // Log chi tiết để debug
                  console.log(`Detailed comparison for medication:`);
                  console.log(`- MedInfo: ID=${medItemID} (${typeof medItemID}), Name=${med.itemName || 'Unknown'}`);
                  console.log(`- Available inventory items (${items.length}):`);
                  items.slice(0, 5).forEach((item, idx) => {
                    console.log(`  Item #${idx}: ID=${item.itemID || item.itemId || item.id} (${typeof (item.itemID || item.itemId || item.id)}), Name=${item.itemName}`);
                  });
                }
                
                // Tạo thông tin thuốc dựa trên kết quả tìm kiếm
                return {
                  itemID: inventoryItem ? (inventoryItem.itemID || inventoryItem.itemId || inventoryItem.id) : (med.itemID || ''),
                  quantityUsed: med.quantityUsed || 1,
                  itemName: inventoryItem ? inventoryItem.itemName : (med.itemName || `Thuốc #${med.itemID}`),
                  stockQuantity: inventoryItem ? (inventoryItem.stockQuantity || 0) : 0,
                  unit: inventoryItem ? (inventoryItem.unit || 'viên') : (med.unit || 'viên'),
                  isTemporary: !inventoryItem // Đánh dấu thuốc không có trong kho
                };
              });
              
              // Đợi tất cả các thuốc được xử lý
              const medicationsWithDetails = await Promise.all(medicationDetailsPromises);
              console.log("Processed medications with details:", medicationsWithDetails);
              
              // Thêm thông báo số lượng thuốc đã tải
              if (medicationsWithDetails.length > 0) {
                const foundCount = medicationsWithDetails.filter(med => !med.isTemporary).length;
                const notFoundCount = medicationsWithDetails.filter(med => med.isTemporary).length;
                
                if (foundCount > 0) {
                  Swal.fire({
                    toast: true, position: 'top-end', showConfirmButton: false, timer: 3000,
                    icon: 'success', title: `Đã tải ${foundCount} thuốc từ danh sách sự kiện`
                  });
                }
                
                if (notFoundCount > 0) {
                  Swal.fire({
                    toast: true, position: 'top-end', showConfirmButton: false, timer: 3000,
                    icon: 'info', title: `Có ${notFoundCount} thuốc không tìm thấy trong kho hiện tại`
                  });
                }
              }
              
              setSelectedMedications(medicationsWithDetails);
            } else if (typeof selectedEvent.medicationsUsed === 'string' && selectedEvent.medicationsUsed) {
              // Backward compatibility - parse from string if needed
              console.log("Processing string format medications:", selectedEvent.medicationsUsed);
              // Gọi hàm async với await
              await parseAndSetMedications(selectedEvent.medicationsUsed, items);
            } else {
              console.log("No medications data found or empty");
              setSelectedMedications([]);
            }
          } else {
            console.warn("Invalid inventory items format or empty");
            setAllInventoryItems([]);
          }
        } catch (error) {
          Swal.fire('Lỗi!', 'Không thể tải danh sách thuốc trong kho.', 'error');
          console.error("Failed to fetch inventory:", error);
          
          // Thông báo chi tiết hơn về lỗi
          if (error.response) {
            const status = error.response.status;
            if (status === 404) {
              Swal.fire('Lỗi!', 'API không tìm thấy danh sách thuốc (404)', 'error');
            } else if (status >= 500) {
              Swal.fire('Lỗi!', 'Lỗi máy chủ khi tải danh sách thuốc. Vui lòng thử lại sau', 'error');
            }
          } else if (error.request) {
            Swal.fire('Lỗi!', 'Không thể kết nối đến máy chủ. Vui lòng kiểm tra kết nối mạng', 'error');
          }
        }
      };

      fetchInventory();

      // Set form data from selected event
      setFormData({
        incidentId: selectedEvent.incidentId || selectedEvent.id || '',
        incidentType: selectedEvent.incidentType || '',
        description: selectedEvent.description || '',
        symptoms: selectedEvent.symptoms || '',
        severityLevel: selectedEvent.severityLevel || '',
        treatment: selectedEvent.treatment || '',
        parentNotified: selectedEvent.parentNotified || false,
        requiresFollowUp: selectedEvent.requiresFollowUp || false,
        followUpNotes: selectedEvent.followUpNotes || '',
        handledById: selectedEvent.handledById || selectedEvent.staffId || 1,
        studentId: selectedEvent.studentId || '',
        studentName: selectedEvent.studentName || '',
        dateTime: formatDateForInput(selectedEvent.dateTime || selectedEvent.date) || new Date().toISOString(),
        imageMedicalUrl: selectedEvent.imageMedicalUrl || selectedEvent.imgUrl || '',
        // medicationsUsed is now handled by selectedMedications state
      });

      // Reset image upload states when modal opens
      setImageFile(null);
      setImageUploadError('');

      // Set existing image preview like EditHealthArticle
      if (selectedEvent.imageMedicalUrl) {
        setImagePreview(selectedEvent.imageMedicalUrl);
      } else {
        setImagePreview('');
      }
    }
  }, [show, selectedEvent]);
  
  // Improved function to parse medications using a pre-fetched inventory list and API
  const parseAndSetMedications = async (medicationsString, inventory) => {
    if (!medicationsString || typeof medicationsString !== 'string' || !inventory.length) {
      setSelectedMedications([]);
      return;
    }

    // Helper function for robust string comparison
    const normalizeForCompare = (str) => {
      if (typeof str !== 'string') return '';
      return str
        .replace(/\s+/g, ' ')    // Replace multiple whitespace characters with a single space
        .normalize('NFC')       // Normalize Unicode to handle character inconsistencies
        .toLowerCase()
        .trim();
    };

    // Thêm log để debug
    console.log("Parsing medications string:", medicationsString);
    console.log("Available inventory for comparison:", inventory.length, "items");

    const parsedMedications = [];
    const medicationParts = medicationsString.split(',').map(med => med.trim());

    // Xử lý từng thuốc một cách bất đồng bộ để có thể gọi API khi cần
    const processMedications = medicationParts.map(async (part) => {
      // Định dạng thường gặp: "Tên thuốc (số lượng)"
      const match = part.match(/^(.+?)\s*\((\d+)\)$/);
      if (match) {
        const [, name, quantity] = match;
        const normalizedName = normalizeForCompare(name);
        console.log(`Looking for medication: "${name}" (normalized: "${normalizedName}")`);
        
        // Tìm thuốc bằng nhiều phương pháp (ID, tên, API)
        let foundItem = null;
        
        // Bước 1: Tìm trong kho bằng ID trước (nếu có)
        const idMatch = name.match(/\b(\d+)\b/); // Tìm số trong tên thuốc
        if (idMatch) {
          const possibleId = idMatch[1];
          foundItem = inventory.find(item => {
            const itemId = item.itemID || item.itemId || item.id;
            return String(itemId) === possibleId;
          });
          
          if (foundItem) {
            console.log(`Found medication by extracted ID ${possibleId}: ${foundItem.itemName}`);
          } else if (parseInt(possibleId) > 0) {
            // Bước 2: Nếu không tìm thấy trong danh sách, thử gọi API để tìm trực tiếp theo ID
            try {
              console.log(`Calling API to find medication by ID: ${possibleId}`);
              foundItem = await inventoryService.getItemById(possibleId);
              if (foundItem) {
                console.log(`Found medication via API by ID: ${possibleId}, name: ${foundItem.itemName}`);
              }
            } catch (error) {
              console.warn(`Error fetching medication by ID ${possibleId}:`, error);
            }
          }
        }
        
        // Bước 3: Nếu không tìm thấy bằng ID, tìm bằng tên trong danh sách đã tải
        if (!foundItem) {
          foundItem = inventory.find(item => {
            if (!item.itemName) return false;
            
            const itemName = normalizeForCompare(item.itemName);
            // Kiểm tra bằng nhiều tiêu chí
            const exactMatch = itemName === normalizedName;
            const containsMatch = itemName.includes(normalizedName) || normalizedName.includes(itemName);
            const wordMatch = normalizedName.split(' ').some(word => 
              word.length > 3 && itemName.includes(word)
            );
            
            if (exactMatch || containsMatch || wordMatch) {
              console.log(`Found matching medication in local inventory: "${item.itemName}" (ID: ${item.itemID || item.itemId || item.id})`);
              return true;
            }
            return false;
          });
        }
        
        // Bước 4: Nếu vẫn không tìm thấy, gọi API tìm bằng tên
        if (!foundItem) {
          try {
            console.log(`Searching for medication by name using API: "${name}"`);
            const results = await inventoryService.getItemsByKeyword(name);
            
            if (results && results.length > 0) {
              console.log(`API returned ${results.length} results for "${name}"`);
              
              // Tìm thuốc phù hợp nhất
              const bestMatch = results.find(item => {
                if (!item.itemName) return false;
                const itemName = normalizeForCompare(item.itemName);
                const exactMatch = itemName === normalizedName;
                const containsMatch = itemName.includes(normalizedName) || normalizedName.includes(itemName);
                
                if (exactMatch || containsMatch) {
                  console.log(`Found exact match: "${item.itemName}" (ID: ${item.itemID || item.itemId || item.id})`);
                  return true;
                }
                return false;
              });
              
              // Nếu không có kết quả chính xác, lấy kết quả đầu tiên
              foundItem = bestMatch || results[0];
              console.log(`Selected medication from API results: "${foundItem.itemName}" (ID: ${foundItem.itemID || foundItem.itemId || foundItem.id})`);
            } else {
              console.log(`No API results for "${name}"`);
            }
          } catch (error) {
            console.warn(`Error searching medication by name "${name}":`, error);
          }
        }

        // Xử lý thuốc tìm thấy hoặc tạo thuốc tạm thời
        if (foundItem && (foundItem.itemID != null || foundItem.itemId != null || foundItem.id != null)) {
          const itemID = parseInt(foundItem.itemID || foundItem.itemId || foundItem.id, 10);
          const quantityUsed = parseInt(quantity, 10);

          if (!isNaN(itemID) && !isNaN(quantityUsed)) {
            return {
              itemID,
              itemName: foundItem.itemName,
              quantityUsed,
              stockQuantity: foundItem.stockQuantity || 0,
              unit: foundItem.unit || 'viên',
              isTemporary: false
            };
          } else {
            console.warn(`Could not parse itemID or quantity for: ${name}`);
            return null;
          }
        } else {
          // Nếu không tìm thấy thuốc trong kho, vẫn thêm vào với ID mặc định và đánh dấu là tạm thời
          console.warn(`Medication "${name}" not found in inventory. Adding as temporary medication.`);
          
          // Tạo ID tạm thời cho thuốc - sử dụng hash từ tên để tạo ID nhất quán
          const generateTempId = (name) => {
            let hash = 0;
            for (let i = 0; i < name.length; i++) {
              hash = ((hash << 5) - hash) + name.charCodeAt(i);
              hash |= 0; // Convert to 32bit integer
            }
            return Math.abs(hash % 10000) + 100000; // Unique ID starting with 1xxxxx
          };
          
          const tempID = generateTempId(name);
          const quantityUsed = parseInt(quantity, 10) || 1;
          
          return {
            itemID: tempID,
            itemName: name, // Giữ nguyên tên thuốc
            quantityUsed: quantityUsed,
            stockQuantity: 0,
            unit: 'viên',
            isTemporary: true // Đánh dấu đây là thuốc tạm không có trong inventory
          };
        }
      }
      
      return null; // Trả về null nếu không phải format đúng
    });
    
    // Đợi tất cả các thuốc được xử lý và lọc bỏ những thuốc không hợp lệ
    const result = await Promise.all(processMedications);
    const validMedications = result.filter(med => med !== null);
    
    console.log("Processed string medications with details:", validMedications);
    
    // Thông báo về kết quả xử lý chuỗi thuốc
    if (validMedications.length > 0) {
      const foundCount = validMedications.filter(med => !med.isTemporary).length;
      const notFoundCount = validMedications.filter(med => med.isTemporary).length;
      
      // if (foundCount > 0) {
      //   Swal.fire({
      //     toast: true, position: 'top-end', showConfirmButton: false, timer: 3000,
      //     icon: 'success', title: `Đã tìm thấy ${foundCount} thuốc trong kho`
      //   });
      // }
      
      if (notFoundCount > 0) {
        Swal.fire({
          toast: true, position: 'top-end', showConfirmButton: false, timer: 3000,
          icon: 'info', title: `Có ${notFoundCount} thuốc không tìm thấy trong kho hiện tại`
        });
      }
      
      // Nếu phân tích được ít hơn số thuốc đầu vào
      if (validMedications.length < medicationParts.length) {
        Swal.fire({
          toast: true, position: 'top-end', showConfirmButton: false, timer: 3000,
          icon: 'warning', title: `Không thể phân tích ${medicationParts.length - validMedications.length} mục thuốc do định dạng không đúng`
        });
      }
    }
    
    setSelectedMedications(validMedications);
  };

  // Handle form input changes
  const handleInputChange = (e) => {
    const { name, value, type, checked } = e.target;
    
    setFormData(prevData => ({
      ...prevData,
      [name]: type === 'checkbox' ? checked : value
    }));
  };

  // Handle medication search
  const handleMedicationSearch = async (searchTerm) => {
    setMedicationSearch(searchTerm);
    
    if (searchTerm.trim().length < 2) {
      setMedicationResults([]);
      setShowMedicationDropdown(false);
      return;
    }

    setSearchingMedications(true);
    try {
      const results = await inventoryService.searchItemsByName(searchTerm);
      if (results && Array.isArray(results)) {
        setMedicationResults(results);
        setShowMedicationDropdown(true);
      }
    } catch (error) {
      console.error('Error searching medications:', error);
      setMedicationResults([]);
    } finally {
      setSearchingMedications(false);
    }
  };

  // Handle medication selection
  const handleMedicationSelect = (medication) => {
    // Check if medication is already selected
    const isAlreadySelected = selectedMedications.some(med => med.itemID === medication.itemID);
    
    if (!isAlreadySelected) {
      setSelectedMedications(prev => [...prev, {
        itemID: medication.itemID,
        itemName: medication.itemName,
        quantityUsed: 1,
        stockQuantity: medication.stockQuantity,
        unit: medication.unit || 'viên'
      }]);
      
      // Hiển thị thông báo thêm thuốc thành công
      Swal.fire({
        toast: true, position: 'top-end', showConfirmButton: false, timer: 2000,
        icon: 'success', title: `Đã thêm thuốc "${medication.itemName}" vào danh sách`
      });
    } else {
      Swal.fire({
        toast: true, position: 'top-end', showConfirmButton: false, timer: 2000,
        icon: 'info', title: `Thuốc "${medication.itemName}" đã có trong danh sách`
      });
    }
    
    setMedicationSearch('');
    setShowMedicationDropdown(false);
    setMedicationResults([]);
  };

  // Handle medication quantity change
  const handleMedicationQuantityChange = (itemID, newQuantity) => {
    // Convert to number and validate
    const parsedQuantity = Math.max(0, parseInt(newQuantity) || 0);
    
    setSelectedMedications(prev => {
      // Find the medication being updated
      const medicationBeingUpdated = prev.find(med => med.itemID === itemID);
      const oldQuantity = medicationBeingUpdated ? medicationBeingUpdated.quantityUsed : 0;
      
      // Show toast if quantity changed significantly
      if (medicationBeingUpdated && Math.abs(parsedQuantity - oldQuantity) > 0) {
        // Only show toast when quantity changes by more than 0
        Swal.fire({
          toast: true, position: 'top-end', showConfirmButton: false, timer: 2000,
          icon: 'info', title: `Đã cập nhật số lượng thuốc "${medicationBeingUpdated.itemName}" từ ${oldQuantity} thành ${parsedQuantity} ${medicationBeingUpdated.unit || 'viên'}`
        });
      }
      
      // Update the medication quantity
      return prev.map(med => 
        med.itemID === itemID 
          ? { ...med, quantityUsed: parsedQuantity }
          : med
      );
    });
  };

  // Handle medication removal
  const handleMedicationRemove = (itemID) => {
    // Find the medication to be removed to show its name in the toast
    const medicationToRemove = selectedMedications.find(med => med.itemID === itemID);

    if (medicationToRemove) {
      // Show toast notification for removal
      Swal.fire({
        toast: true, position: 'top-end', showConfirmButton: false, timer: 2000,
        icon: 'warning', title: `Đã xóa thuốc "${medicationToRemove.itemName}" khỏi danh sách`
      });
    }

    // Filter out the medication with the given itemID
    setSelectedMedications(prev => prev.filter(med => med.itemID !== itemID));
  };

  // Handle image file selection - following AddHealthArticle pattern
  const handleImageChange = (e) => {
    const file = e.target.files[0];
    if (!file) return;

    // Validate file type
    const validTypes = ['image/jpeg', 'image/jpg', 'image/png', 'image/gif'];
    if (!validTypes.includes(file.type)) {
      setImageUploadError('Chỉ chấp nhận file ảnh định dạng JPG, PNG hoặc GIF');
      return;
    }

    // Validate file size (max 5MB)
    const maxSize = 5 * 1024 * 1024; // 5MB
    if (file.size > maxSize) {
      setImageUploadError('Kích thước file không được vượt quá 5MB');
      return;
    }

    setImageUploadError('');
    setImageFile(file);

    // Create preview URL using URL.createObjectURL like AddHealthArticle
    const previewUrl = URL.createObjectURL(file);
    setImagePreview(previewUrl);
  };

  // Process image when submitting form - convert to base64
  const processImageForSubmit = async () => {
    if (!imageFile) return '';

    try {
      // Convert image to base64
      const base64Image = await convertImageToBase64(imageFile);
      return base64Image;
    } catch (error) {
      console.error('Error processing image:', error);
      throw new Error('Không thể xử lý ảnh. Vui lòng thử lại.');
    }
  };

  // Convert image to base64
  const convertImageToBase64 = (file) => {
    return new Promise((resolve, reject) => {
      const reader = new FileReader();
      reader.readAsDataURL(file);
      reader.onload = () => resolve(reader.result);
      reader.onerror = error => reject(error);
    });
  };

  // Handle removing uploaded image
  const handleRemoveImage = () => {
    setImageFile(null);
    setImagePreview('');
    setFormData(prev => ({
      ...prev,
      imageMedicalUrl: ''
    }));
    setImageUploadError('');
    // Reset file input
    const fileInput = document.getElementById('medical-image-upload-update');
    if (fileInput) fileInput.value = '';
  };

  // Handle form submission
  const handleSubmit = async (e) => {
    e.preventDefault();
    
    // Use the event ID from the initial selectedEvent prop
    const eventId = selectedEvent?.incidentId || selectedEvent?.id;
    if (!eventId) {
      Swal.fire('Lỗi!', 'Không tìm thấy ID sự kiện để cập nhật. Vui lòng thử lại.', 'error');
      return;
    }

    try {
      console.log("Update Modal - Starting form submission");
      console.log("Update Modal - Selected medications:", selectedMedications);

      // Validate required fields
      if (!formData.incidentType?.trim()) {
        Swal.fire('Lỗi!', 'Vui lòng nhập loại sự kiện', 'error');
        return;
      }
      
      if (!formData.severityLevel) {
        Swal.fire('Lỗi!', 'Vui lòng chọn mức độ nghiêm trọng', 'error');
        return;
      }
      
      if (!formData.studentId?.trim()) {
        Swal.fire('Lỗi!', 'Mã học sinh không được để trống', 'error');
        return;
      }

      // Helper function to check for duplicate IDs
      const removeDuplicateIDs = (medications) => {
        const seen = new Set();
        return medications.filter(med => {
          if (seen.has(med.itemID)) {
            console.log(`Removing duplicate medication with ID: ${med.itemID}, Name: ${med.itemName}`);
            return false;
          }
          seen.add(med.itemID);
          return true;
        });
      };

      // Format medications for API - following the new format
      const medicationsArray = await Promise.all(removeDuplicateIDs(selectedMedications)
        .filter(med => med.quantityUsed > 0)
        .map(async (med) => {
          // Xử lý ID tạm thời, nếu là thuốc không có trong kho
          let rawID = med.itemID;
          let itemID = typeof rawID === 'string' ? parseInt(rawID.trim(), 10) : parseInt(rawID, 10);
          
          // Check if ID is extremely large (could be causing issues)
          if (itemID > 100000000) {
            console.warn(`Very large medication ID detected: ${itemID}, setting to 0`);
            itemID = 0; // Reset to 0 for very large IDs that might cause backend issues
          }
          
          const quantityUsed = typeof med.quantityUsed === 'string' ? parseInt(med.quantityUsed.trim(), 10) : parseInt(med.quantityUsed, 10);
          let itemName = med.itemName || "Không có tên";
          let resolvedFromAPI = false;
          
          console.log(`Processing medication for submission: "${itemName}" (ID: ${itemID}, isTemporary: ${med.isTemporary})`);
          
          // Nếu ID không hợp lệ hoặc thuốc là tạm thời, thử tìm thuốc thật trong kho
          if (isNaN(itemID) || itemID <= 0 || med.isTemporary) {
            console.log(`Attempting to find a real inventory item for: "${itemName}"`);
            
            // Thử tìm thuốc theo tên qua API
            try {
              // Thử tìm bằng getItemsByKeyword API
              const keywordResults = await inventoryService.getItemsByKeyword(itemName);
              
              if (keywordResults && keywordResults.length > 0) {
                // Lấy kết quả phù hợp nhất
                const normalizedName = itemName.toLowerCase().trim();
                const bestMatch = keywordResults.find(item => {
                  if (!item.itemName) return false;
                  return item.itemName.toLowerCase().trim() === normalizedName ||
                         item.itemName.toLowerCase().trim().includes(normalizedName) ||
                         normalizedName.includes(item.itemName.toLowerCase().trim());
                }) || keywordResults[0];
                
                const foundItemId = parseInt(bestMatch.itemID || bestMatch.itemId || bestMatch.id, 10);
                
                if (!isNaN(foundItemId) && foundItemId > 0) {
                  console.log(`Found real medication via API: "${itemName}" -> "${bestMatch.itemName}" (ID: ${foundItemId})`);
                  itemID = foundItemId;
                  itemName = bestMatch.itemName;
                  resolvedFromAPI = true;
                }
              } else {
                console.log(`No results found for "${itemName}" in API search`);
              }
            } catch (error) {
              console.warn(`Error searching medication by name "${itemName}":`, error);
            }
          }
          
          return {
            itemID: isNaN(itemID) ? 0 : itemID,
            quantityUsed: isNaN(quantityUsed) ? 1 : quantityUsed,
            itemName: itemName,
            isTemporary: !resolvedFromAPI && med.isTemporary
          };
        }));

      console.log("Update Modal - Medications array for API:", medicationsArray);

      // Additional validation for medications data, nhưng không chặn việc gửi
      if (medicationsArray.length > 0) {
        const invalidMedications = medicationsArray.filter(med => 
          (!med.isTemporary && (!med.itemID || isNaN(med.itemID) || med.itemID <= 0))
        );
        
        if (invalidMedications.length > 0) {
          Swal.fire('Cảnh báo', 'Một số thuốc có ID không hợp lệ. Hệ thống sẽ bỏ qua những thuốc này.', 'warning');
          console.warn("Invalid medications that will be skipped:", invalidMedications);
        }
        
        const invalidQuantities = medicationsArray.filter(med => 
          !med.quantityUsed || isNaN(med.quantityUsed) || med.quantityUsed <= 0
        );
        
        if (invalidQuantities.length > 0) {
          Swal.fire('Cảnh báo', 'Một số thuốc có số lượng không hợp lệ. Hệ thống sẽ bỏ qua những thuốc này.', 'warning');
          console.warn("Invalid quantities that will be skipped:", invalidQuantities);
        }
      }
      
      // Lọc bỏ các thuốc không hợp lệ và loại bỏ trường isTemporary trước khi gửi đến API
      const validMedicationsArray = medicationsArray
        .filter(med => {
          // Ensure ID is a valid positive integer and quantity is positive
          const itemIDNum = parseInt(med.itemID, 10);
          const quantityNum = parseInt(med.quantityUsed, 10);
          
          // Check for extremely large IDs that might cause backend issues
          const isValidID = !isNaN(itemIDNum) && itemIDNum > 0 && itemIDNum < 100000000;
          const isValidQuantity = !isNaN(quantityNum) && quantityNum > 0;
          
          const isValid = isValidID && isValidQuantity && !med.isTemporary;
          
          if (!isValid) {
            console.log(`Filtering out invalid medication: ID=${med.itemID}, Name=${med.itemName}, Quantity=${med.quantityUsed}, isTemporary=${med.isTemporary}`);
            
            // Show specific reason for filtering
            if (!isValidID) Swal.fire({toast: true, position: 'top-end', showConfirmButton: false, timer: 3000, icon: 'warning', title: `Thuốc "${med.itemName}" có ID không hợp lệ nên sẽ bị bỏ qua`});
            else if (!isValidQuantity) Swal.fire({toast: true, position: 'top-end', showConfirmButton: false, timer: 3000, icon: 'warning', title: `Thuốc "${med.itemName}" có số lượng không hợp lệ nên sẽ bị bỏ qua`});
            else if (med.isTemporary) Swal.fire({toast: true, position: 'top-end', showConfirmButton: false, timer: 3000, icon: 'info', title: `Thuốc "${med.itemName}" không có trong kho nên sẽ bị bỏ qua`});
          }
          
          return isValid;
        })
        .map(({ itemID, quantityUsed }) => ({ 
          itemID: parseInt(itemID, 10), // Ensure integer ID
          quantityUsed: parseInt(quantityUsed, 10) // Ensure integer quantity
        }));
      
      console.log(`Found ${validMedicationsArray.length} valid medications for submission out of ${medicationsArray.length} total`);

      // Format data for API submission according to the new format (without image first)
      const apiData = {
        incidentType: formData.incidentType,
        description: formData.description,
        symptoms: formData.symptoms,
        severityLevel: formData.severityLevel,
        treatment: formData.treatment,
        parentNotified: formData.parentNotified,
        requiresFollowUp: formData.requiresFollowUp,
        followUpNotes: formData.followUpNotes,
        handledById: parseInt(formData.handledById) || 1,
        studentId: formData.studentId,
        imageMedicalUrl: formData.imageMedicalUrl, // Keep existing URL for now
        medicationsUsed: validMedicationsArray // Sử dụng mảng thuốc đã được lọc
      };

      console.log("Update Modal - Final API data being sent:", apiData);
      console.log("Update Modal - medicationsUsed being sent:", JSON.stringify(apiData.medicationsUsed, null, 2));
      
      // Final validation before sending to backend - hiển thị thông báo nhưng không ngăn cản việc gửi
      if (apiData.medicationsUsed.length === 0 && selectedMedications.length > 0) {
        // Nếu người dùng đã chọn thuốc nhưng tất cả đều không hợp lệ
        Swal.fire('Cảnh báo', 'Tất cả thuốc đã chọn đều không hợp lệ hoặc không còn trong kho. Hệ thống sẽ tiếp tục lưu sự kiện mà không có thông tin thuốc.', 'warning');
        console.warn("All medications were invalid and will be skipped.");
      }
      
      console.log("Update Modal - Event ID for update:", eventId);
      
      // Log a final summary of medications being sent
      if (apiData.medicationsUsed.length > 0) {
        console.log(`Sending ${apiData.medicationsUsed.length} medications with IDs: ${
          apiData.medicationsUsed.map(m => m.itemID).join(', ')
        }`);
      }
      
      try {
        // Step 1: Update the event with text data (following EditHealthArticle pattern)
        console.log('Step 1: Updating medical incident with data:', apiData);
        const result = await updateEvent(eventId, apiData);

        if (!result) {
          throw new Error('Không thể cập nhật sự kiện');
        }

        console.log('Medical incident data updated successfully.');

        // Step 2: If a new image file was selected, convert to base64 and update again
        if (imageFile) {
          console.log(`Step 2: Processing new image for incident ID: ${eventId}`);

          try {
            const base64Image = await processImageForSubmit();

            // Update again with the new image
            const imageUpdateData = {
              ...apiData,
              imageMedicalUrl: base64Image
            };

            console.log('Updating with new image...');
            const imageResult = await updateEvent(eventId, imageUpdateData);

            if (imageResult) {
              console.log('New image updated successfully.');
            }
          } catch (imageError) {
            console.error('Error processing image:', imageError);
            // Don't fail the whole update if image processing fails
            Swal.fire('Cảnh báo!', 'Cập nhật thông tin thành công nhưng có lỗi khi xử lý ảnh mới.', 'warning');
          }
        }

        Swal.fire('Thành công!', 'Cập nhật sự kiện y tế thành công!', 'success');
        handleClose();

      } catch (updateError) {
        console.error("Update Modal - Error in updateEvent API call:", updateError);

        // Check for medication ID errors specifically
        if (updateError.response?.data?.data?.includes('Medication Item not found with id')) {
          const errorIdMatch = updateError.response.data.data.match(/id: (\d+)/);
          const errorId = errorIdMatch ? errorIdMatch[1] : 'không xác định';

          Swal.fire('Lỗi!', `Không tìm thấy thuốc với ID: ${errorId}`, 'error');
          console.error(`Backend rejected medication with ID: ${errorId}`);

          // Show instructions to retry
          Swal.fire('Thông tin', 'Vui lòng kiểm tra lại danh sách thuốc và thử lại', 'info');
        } else {
          const errorMessage = updateError.response?.data?.message || updateError.message || 'Lỗi không xác định.';
          if (updateError.response?.status === 400) {
            Swal.fire('Lỗi!', `Dữ liệu không hợp lệ: ${errorMessage}`, 'error');
          } else {
            Swal.fire('Lỗi!', `Không thể cập nhật: ${errorMessage}`, 'error');
          }
        }
      }
    } catch (error) {
      console.error("Update Modal - General error in handleSubmit:", error);
      Swal.fire('Lỗi!', `Đã xảy ra lỗi: ${error.message || 'Lỗi không xác định'}`, 'error');
    }
  };

  // Close modal and reset form
  const handleClose = () => {
    setMedicationSearch('');
    setMedicationResults([]);
    setShowMedicationDropdown(false);
    setSelectedMedications([]);
    // Reset image upload states
    setImageFile(null);
    setImagePreview('');
    setImageUploadError('');
    // Reset file input
    const fileInput = document.getElementById('medical-image-upload-update');
    if (fileInput) fileInput.value = '';
    onClose();
  };

  if (!show) return null;

  return (
    <>
      <style>
        {`
          .lukhang-medical-update-modal-wrapper {
            display: flex !important;
            align-items: center !important;
            justify-content: center !important;
            min-height: 100vh !important;
            position: fixed !important;
            top: 0 !important;
            left: 0 !important;
            width: 100vw !important;
            z-index: 1055 !important;
          }

          /* Fix dropdown arrow display issues */
          .lukhang-medical-update-modal-wrapper .form-select,
          .lukhang-medical-update-modal-wrapper select.form-control,
          .lukhang-medical-update-modal-wrapper select {
            background-image: url("data:image/svg+xml,%3csvg xmlns='http://www.w3.org/2000/svg' viewBox='0 0 16 16'%3e%3cpath fill='none' stroke='%23343a40' stroke-linecap='round' stroke-linejoin='round' stroke-width='2' d='m1 6 7 7 7-7'/%3e%3c/svg%3e") !important;
            background-repeat: no-repeat !important;
            background-position: right 0.75rem center !important;
            background-size: 16px 12px !important;
            appearance: none !important;
            -webkit-appearance: none !important;
            -moz-appearance: none !important;
          }

          /* Remove multiple arrows from dropdown */
          .lukhang-medical-update-modal-wrapper select::-ms-expand {
            display: none !important;
          }

          .lukhang-medical-update-modal-wrapper .form-select::after,
          .lukhang-medical-update-modal-wrapper select::after {
            display: none !important;
          }

          /* Ensure only one arrow per dropdown */
          .lukhang-medical-update-modal-wrapper .dropdown-toggle::after {
            display: none !important;
          }
          
          .lukhang-medical-update-modal-wrapper .modal-dialog {
            margin: 2rem auto !important;
            width: 90vw !important;
            max-width: 1200px !important;
            display: flex !important;
            align-items: center !important;
            min-height: auto !important;
            position: relative !important;
          }
          
          .lukhang-medical-update-modal-content-custom {
            border-radius: 1rem !important;
            overflow: hidden !important;
            box-shadow: 0 20px 60px rgba(255, 193, 7, 0.2) !important;
            border: none !important;
            width: 100% !important;
            max-height: 90vh !important;
            display: flex !important;
            flex-direction: column !important;
            background: white !important;
            position: relative !important;
          }
          
          .lukhang-medical-update-header-custom {
            background: #0d6efd !important;
            color: white !important;
            border: none !important;
            border-radius: 1rem 1rem 0 0 !important;
            padding: 1.5rem 2rem !important;
            display: flex !important;
            align-items: center !important;
            justify-content: space-between !important;
            flex-shrink: 0 !important;
            min-height: 80px !important;
          }
          
          .lukhang-medical-update-title-custom {
            color: white !important;
            font-weight: 600 !important;
            font-size: 1.4rem !important;
            margin: 0 !important;
            flex: 1 !important;
            display: flex !important;
            align-items: center !important;
            white-space: nowrap !important;
            overflow: hidden !important;
            text-overflow: ellipsis !important;
          }
          
          .lukhang-medical-update-title-custom i {
            color: white !important;
            margin-right: 0.75rem !important;
            font-size: 1.2rem !important;
          }
          
          .lukhang-medical-update-close-button-custom {
            background: rgba(255, 255, 255, 0.15) !important;
            border: 2px solid rgba(255, 255, 255, 0.4) !important;
            color: white !important;
            border-radius: 50% !important;
            width: 48px !important;
            height: 48px !important;
            display: flex !important;
            align-items: center !important;
            justify-content: center !important;
            transition: all 0.3s ease !important;
            flex-shrink: 0 !important;
            margin-left: 1.5rem !important;
            font-size: 1.1rem !important;
            text-decoration: none !important;
            outline: none !important;
            box-shadow: none !important;
          }
          
          .lukhang-medical-update-close-button-custom:hover {
            background: rgba(255, 255, 255, 0.3) !important;
            border-color: rgba(255, 255, 255, 0.6) !important;
            color: white !important;
            transform: rotate(90deg) scale(1.15) !important;
            text-decoration: none !important;
          }
          
          .lukhang-medical-update-close-button-custom:focus {
            box-shadow: 0 0 0 4px rgba(255, 255, 255, 0.3) !important;
            color: white !important;
            outline: none !important;
            text-decoration: none !important;
          }
          
          .lukhang-medical-update-close-button-custom:active {
            color: white !important;
            text-decoration: none !important;
          }
          
          .lukhang-medical-update-body-custom {
            flex: 1 !important;
            overflow-y: auto !important;
            max-height: calc(90vh - 240px) !important;
            padding: 2rem !important;
            min-height: 300px !important;
          }
          
          .lukhang-medical-update-footer-custom {
            flex-shrink: 0 !important;
            padding: 2.5rem 2rem !important;
            background: #f8f9fa !important;
            border-top: 1px solid #e9ecef !important;
            min-height: 120px !important;
            display: flex !important;
            align-items: center !important;
            justify-content: center !important;
            gap: 1.5rem !important;
            position: relative !important;
            z-index: 10 !important;
            margin-top: auto !important;
          }
          
          @media (max-width: 992px) {
            .lukhang-medical-update-modal-wrapper .modal-dialog {
              width: 95vw !important;
              margin: 1rem auto !important;
            }
            
            .lukhang-medical-update-header-custom {
              padding: 1.25rem 1.5rem !important;
              min-height: 70px !important;
            }
            
            .lukhang-medical-update-title-custom {
              font-size: 1.2rem !important;
            }
            
            .lukhang-medical-update-close-button-custom {
              width: 42px !important;
              height: 42px !important;
              margin-left: 1rem !important;
            }
            
            .lukhang-medical-update-body-custom {
              padding: 1.5rem !important;
              max-height: calc(90vh - 220px) !important;
            }
            
            .lukhang-medical-update-footer-custom {
              padding: 2rem 1.5rem !important;
              min-height: 110px !important;
            }
          }
          
          @media (max-width: 768px) {
            .lukhang-medical-update-modal-wrapper .modal-dialog {
              width: 98vw !important;
              margin: 0.5rem auto !important;
            }
            
            .lukhang-medical-update-header-custom {
              padding: 1rem 1.25rem !important;
              min-height: 65px !important;
            }
            
            .lukhang-medical-update-title-custom {
              font-size: 1.1rem !important;
            }
            
            .lukhang-medical-update-close-button-custom {
              width: 38px !important;
              height: 38px !important;
              margin-left: 0.75rem !important;
              font-size: 1rem !important;
            }
            
            .lukhang-medical-update-body-custom {
              padding: 1.25rem !important;
              max-height: calc(90vh - 200px) !important;
            }
            
            .lukhang-medical-update-footer-custom {
              padding: 1.75rem 1.25rem !important;
              min-height: 100px !important;
            }
          }

          /* Additional styling for dropdown elements */
          .lukhang-medical-update-modal-wrapper .form-select:focus {
            border-color: #0d6efd !important;
            box-shadow: 0 0 0 0.2rem rgba(13, 110, 253, 0.25) !important;
          }

          .lukhang-medical-update-modal-wrapper .form-control:focus {
            border-color: #0d6efd !important;
            box-shadow: 0 0 0 0.2rem rgba(13, 110, 253, 0.25) !important;
          }

          /* Dropdown menu styling for update modal */
          .lukhang-medical-update-modal-wrapper .dropdown-menu {
            border: 1px solid #0d6efd !important;
            border-radius: 0.375rem !important;
            box-shadow: 0 0.5rem 1rem rgba(0, 0, 0, 0.15) !important;
          }

          .lukhang-medical-update-modal-wrapper .dropdown-item:hover {
            background-color: #e7f1ff !important;
            color: #084298 !important;
          }

          /* Fix severity level dropdown styling */
          .lukhang-medical-update-modal-wrapper select[name="severityLevel"] {
            padding-right: 2.5rem !important;
          }
        `}
      </style>
      <Modal 
        show={show} 
        onHide={handleClose}
        size="xl"
        centered
        backdrop="static"
        className="lukhang-medical-update-modal-wrapper"
        dialogClassName="lukhang-update-modal-dialog-custom"
        contentClassName="lukhang-medical-update-modal-content-custom"
        style={{
          '--bs-modal-zindex': '1055'
        }}
      >
      <Modal.Header 
        closeButton={false}
        className="border-0 lukhang-medical-update-header-custom"
      >
        <Modal.Title 
          className="lukhang-medical-update-title-custom"
        >
          <i className="fas fa-edit"></i>
          Cập nhật sự kiện y tế
        </Modal.Title>
        <Button
          variant="link"
          className="lukhang-medical-update-close-button-custom"
          onClick={handleClose}
          title="Đóng modal"
        >
          <i className="fas fa-times"></i>
        </Button>
      </Modal.Header>
        
        <Form onSubmit={handleSubmit}>
          <Modal.Body className="lukhang-medical-update-body-custom">
            <Container fluid>
              {/* Thông tin cơ bản */}
              <Row className="mb-3">
                <Col md={6}>
                  <Form.Group>
                    <Form.Label className="fw-semibold">
                      <i className="fas fa-id-badge me-2 text-primary"></i>ID sự kiện
                    </Form.Label>
                    <Form.Control
                      type="text"
                      value={formData.incidentId}
                      disabled
                      className="bg-light"
                    />
                  </Form.Group>
                </Col>
                <Col md={6}>
                  <Form.Group>
                    <Form.Label className="fw-semibold">
                      <i className="fas fa-calendar-alt me-2 text-primary"></i>Ngày xảy ra
                    </Form.Label>
                    <Form.Control
                      type="text"
                      value={formatDateForDisplay(selectedEvent?.dateTime || selectedEvent?.date)}
                      disabled
                      className="bg-light"
                    />
                  </Form.Group>
                </Col>
              </Row>

              <Row className="mb-3">
                <Col md={6}>
                  <Form.Group>
                    <Form.Label className="fw-semibold">
                      <i className="fas fa-tag me-2 text-primary"></i>Loại sự kiện <span className="text-danger">*</span>
                    </Form.Label>
                    <Form.Control
                      type="text"
                      name="incidentType"
                      value={formData.incidentType}
                      onChange={handleInputChange}
                      required
                      placeholder="Nhập loại sự kiện"
                    />
                  </Form.Group>
                </Col>
                <Col md={6}>
                  <Form.Group>
                    <Form.Label className="fw-semibold">
                      <i className="fas fa-exclamation-triangle me-2 text-danger"></i>Mức độ nghiêm trọng <span className="text-danger">*</span>
                    </Form.Label>
                    <Form.Select
                      name="severityLevel"
                      value={formData.severityLevel}
                      onChange={handleInputChange}
                      required
                    >
                      <option value="">Chọn mức độ</option>
                      <option value="Nhẹ">Nhẹ</option>
                      <option value="Trung bình">Trung bình</option>
                      <option value="Nghiêm trọng">Nghiêm trọng</option>
                    </Form.Select>
                  </Form.Group>
                </Col>
              </Row>

              <Row className="mb-3">
                <Col md={6}>
                  <Form.Group>
                    <Form.Label className="fw-semibold">
                      <i className="fas fa-user-graduate me-2 text-primary"></i>Tên học sinh
                    </Form.Label>
                    <Form.Control
                      type="text"
                      value={formData.studentName || 'Chưa xác định'}
                      disabled
                      className="bg-light fw-bold"
                    />
                  </Form.Group>
                </Col>
                <Col md={6}>
                  <Form.Group>
                    <Form.Label className="fw-semibold">
                      <i className="fas fa-id-card me-2 text-primary"></i>Mã học sinh
                    </Form.Label>
                    <Form.Control
                      type="text"
                      value={formData.studentId || 'N/A'}
                      disabled
                      className="bg-light"
                    />
                  </Form.Group>
                </Col>
              </Row>

              <Row className="mb-3">
                <Col>
                  <Form.Group>
                    <Form.Label className="fw-semibold">
                      <i className="fas fa-file-alt me-2 text-info"></i>Mô tả chi tiết
                    </Form.Label>
                    <Form.Control
                      as="textarea"
                      rows={3}
                      name="description"
                      value={formData.description}
                      onChange={handleInputChange}
                      placeholder="Mô tả chi tiết sự kiện"
                    />
                  </Form.Group>
                </Col>
              </Row>

              <Row className="mb-3">
                <Col md={6}>
                  <Form.Group>
                    <Form.Label className="fw-semibold">
                      <i className="fas fa-heartbeat me-2 text-warning"></i>Triệu chứng
                    </Form.Label>
                    <Form.Control
                      as="textarea"
                      rows={3}
                      name="symptoms"
                      value={formData.symptoms}
                      onChange={handleInputChange}
                      placeholder="Ghi lại các triệu chứng quan sát được"
                    />
                  </Form.Group>
                </Col>
                <Col md={6}>
                  <Form.Group>
                    <Form.Label className="fw-semibold">
                      <i className="fas fa-stethoscope me-2 text-success"></i>Điều trị
                    </Form.Label>
                    <Form.Control
                      as="textarea"
                      rows={3}
                      name="treatment"
                      value={formData.treatment}
                      onChange={handleInputChange}
                      placeholder="Biện pháp điều trị đã thực hiện"
                    />
                  </Form.Group>
                </Col>
              </Row>

              {/* Medication Search Section */}
              <Row className="mb-3">
                <Col>
                  <Card className="border-primary">
                    <Card.Header className="bg-primary text-white">
                      <h6 className="mb-0">
                        <i className="fas fa-pills me-2"></i>
                        Thuốc sử dụng
                      </h6>
                    </Card.Header>
                    <Card.Body>
                      <div className="position-relative mb-3">
                        <Form.Control
                          type="text"
                          value={medicationSearch}
                          onChange={(e) => handleMedicationSearch(e.target.value)}
                          placeholder="Tìm kiếm thuốc theo tên..."
                        />
                        {searchingMedications && (
                          <div className="position-absolute top-50 end-0 translate-middle-y me-3">
                            <Spinner size="sm" />
                          </div>
                        )}
                        
                        {/* Medication Search Results Dropdown */}
                        {showMedicationDropdown && medicationResults.length > 0 && (
                          <div 
                            className="position-absolute w-100 bg-white border border-primary rounded shadow-sm mt-1"
                            style={{ zIndex: 1000, maxHeight: '200px', overflowY: 'auto' }}
                          >
                            {medicationResults.map((medication, index) => (
                              <div
                                key={medication.itemID || index}
                                className="p-3 border-bottom cursor-pointer"
                                onClick={() => handleMedicationSelect(medication)}
                                style={{ cursor: 'pointer' }}
                                onMouseEnter={(e) => e.target.style.backgroundColor = '#f8f9fa'}
                                onMouseLeave={(e) => e.target.style.backgroundColor = 'white'}
                              >
                                <div className="fw-semibold text-primary">
                                  {medication.itemName}
                                </div>
                                <small className="text-muted">
                                  Tồn kho: {medication.stockQuantity || 0} {medication.unit || 'đơn vị'}
                                </small>
                              </div>
                            ))}
                          </div>
                        )}
                        
                        {showMedicationDropdown && medicationResults.length === 0 && !searchingMedications && (
                          <div 
                            className="position-absolute w-100 bg-white border border-primary rounded shadow-sm mt-1"
                            style={{ zIndex: 1000 }}
                          >
                            <div className="p-3 text-center text-muted">Không tìm thấy thuốc phù hợp</div>
                          </div>
                        )}
                      </div>

                      {/* Selected Medications List */}
                      {selectedMedications.length > 0 && (
                        <div>
                          <h6 className="text-success mb-3">
                            <i className="fas fa-check-circle me-2"></i>
                            Thuốc đã chọn:
                          </h6>
                          {selectedMedications.map((medication, index) => {
                            const isOverStock = medication.quantityUsed > (medication.stockQuantity || 0);
                            return (
                              <Card 
                                key={medication.itemID || index} 
                                className={`mb-2 ${isOverStock ? 'border-danger' : 'border-success'}`}
                              >
                                <Card.Body className="p-3">
                                  <Row className="align-items-center">
                                    <Col md={6}>
                                      <h6 className="text-primary mb-1">{medication.itemName}</h6>
                                      {medication.isTemporary && (
                                        <Badge bg="warning" className="mb-2">
                                          <i className="fas fa-exclamation-triangle me-1"></i>
                                          Không có trong kho
                                        </Badge>
                                      )}
                                      <div className="d-flex align-items-center gap-2">
                                        <Form.Label className="small mb-0">Số lượng:</Form.Label>
                                        <Form.Control
                                          type="number"
                                          min="0"
                                          value={medication.quantityUsed}
                                          onChange={(e) => handleMedicationQuantityChange(medication.itemID, e.target.value)}
                                          className={isOverStock ? 'border-danger' : ''}
                                          style={{ width: '80px' }}
                                        />
                                      </div>
                                    </Col>
                                    <Col md={5}>
                                      <div className="small text-muted mb-1">
                                        Tồn kho: <strong>{medication.stockQuantity || 0}</strong>
                                      </div>
                                      <div>
                                        {medication.stockQuantity === 0 && (
                                          <Badge bg="danger" className="me-1">Hết hàng</Badge>
                                        )}
                                        {medication.stockQuantity > 0 && medication.stockQuantity <= 5 && (
                                          <Badge bg="warning" className="me-1">Sắp hết</Badge>
                                        )}
                                        {medication.stockQuantity > 5 && (
                                          <Badge bg="success" className="me-1">Còn hàng</Badge>
                                        )}
                                      </div>
                                      {isOverStock && (
                                        <Alert variant="danger" className="p-2 mt-2 mb-0">
                                          <small>
                                            <i className="fas fa-exclamation-triangle me-1"></i>
                                            Số lượng vượt quá tồn kho!
                                          </small>
                                        </Alert>
                                      )}
                                    </Col>
                                    <Col md={1}>
                                      <Button
                                        variant="outline-danger"
                                        size="sm"
                                        onClick={() => handleMedicationRemove(medication.itemID)}
                                        title="Xóa thuốc"
                                      >
                                        <i className="fas fa-times"></i>
                                      </Button>
                                    </Col>
                                  </Row>
                                </Card.Body>
                              </Card>
                            );
                          })}
                        </div>
                      )}
                    </Card.Body>
                  </Card>
                </Col>
              </Row>

              {/* Image Upload Section */}
              <Row className="mb-4">
                <Col>
                  <Card className="border-primary">
                    <Card.Header className="bg-primary text-white">
                      <h6 className="mb-0">
                        <i className="fas fa-image me-2"></i>
                        Hình ảnh sự cố y tế
                      </h6>
                    </Card.Header>
                    <Card.Body>
                      {/* Upload from computer section - following AddHealthArticle pattern */}
                      <div className="mb-4">
                        <Form.Label className="fw-semibold">
                          <i className="fas fa-upload me-2 text-primary"></i>
                          Tải ảnh từ máy tính
                        </Form.Label>
                        <Form.Control
                          id="medical-image-upload-update"
                          type="file"
                          name="image"
                          accept="image/*"
                          onChange={handleImageChange}
                        />
                        <Form.Text className="text-muted">
                          Tải lên ảnh mới để thay thế ảnh hiện tại. Để trống nếu không muốn thay đổi.
                        </Form.Text>

                        {/* Image preview - following AddHealthArticle pattern */}
                        {imagePreview && (
                          <div className="mt-3">
                            <Form.Label className="small text-muted">Xem trước:</Form.Label>
                            <div className="position-relative d-inline-block">
                              <img
                                src={imagePreview}
                                alt="Xem trước"
                                className="img-fluid rounded shadow-sm"
                                style={{ maxHeight: '200px', maxWidth: '100%', objectFit: 'cover' }}
                                onError={(e) => {
                                  console.error('Image preview failed to load:', imagePreview);
                                  e.target.style.display = 'none';
                                }}
                              />
                              <Button
                                variant="outline-danger"
                                size="sm"
                                onClick={handleRemoveImage}
                                className="position-absolute top-0 end-0 m-1"
                                title="Xóa ảnh"
                              >
                                <i className="fas fa-times"></i>
                              </Button>
                            </div>
                          </div>
                        )}

                        {imageFile && (
                          <div className="mt-2">
                            <small className="text-muted">
                              <i className="fas fa-file-image me-1"></i>
                              Đã chọn: {imageFile.name} ({(imageFile.size / 1024 / 1024).toFixed(2)} MB)
                            </small>
                          </div>
                        )}

                        {imageUploadError && (
                          <Alert variant="danger" className="mt-3">
                            <i className="fas fa-exclamation-triangle me-2"></i>
                            {imageUploadError}
                          </Alert>
                        )}
                      </div>

                      {/* Manual URL input section */}
                      <div className="mb-3">
                        <Form.Label className="fw-semibold">
                          <i className="fas fa-link me-2 text-info"></i>
                          Hoặc nhập link ảnh
                        </Form.Label>
                        <Form.Control
                          type="url"
                          name="imageMedicalUrl"
                          value={formData.imageMedicalUrl}
                          onChange={handleInputChange}
                          placeholder="Nhập link ảnh sự cố y tế (http://... hoặc https://...)"
                        />
                      </div>

                      {/* Image preview section */}
                      {(imagePreview || formData.imageMedicalUrl) && (
                        <div className="medical-image-preview">
                          <h6 className="text-info fw-bold mb-3 text-center">
                            <i className="fas fa-eye me-2"></i>Preview ảnh sự cố
                          </h6>
                          <div className="d-flex justify-content-center align-items-center">
                            <div className="position-relative">
                              <img
                                src={imagePreview || formData.imageMedicalUrl}
                                alt="Preview ảnh sự cố"
                                className="img-fluid rounded shadow-lg border border-2 border-info"
                                style={{
                                  maxWidth: '100%',
                                  maxHeight: '400px',
                                  width: 'auto',
                                  height: 'auto',
                                  objectFit: 'contain',
                                  display: 'block',
                                  margin: '0 auto'
                                }}
                                onError={(e) => {
                                  e.target.style.display = 'none';
                                  e.target.nextSibling.style.display = 'block';
                                }}
                                onLoad={(e) => {
                                  e.target.style.display = 'block';
                                  e.target.nextSibling.style.display = 'none';
                                }}
                              />
                              <Alert variant="warning" className="text-center mx-auto" style={{ display: 'none', maxWidth: '350px' }}>
                                <i className="fas fa-exclamation-triangle fs-2 text-warning mb-2"></i>
                                <h6>Không thể tải ảnh từ link này</h6>
                                <small className="text-muted">Vui lòng kiểm tra lại link ảnh</small>
                              </Alert>
                            </div>
                          </div>
                        </div>
                      )}
                    </Card.Body>
                  </Card>
                </Col>
              </Row>

              <Row className="mb-3">
                <Col md={6}>
                  <Form.Group>
                    <Form.Check
                      type="checkbox"
                      name="parentNotified"
                      checked={formData.parentNotified}
                      onChange={handleInputChange}
                      label="Đã thông báo phụ huynh"
                      className="fw-semibold"
                    />
                  </Form.Group>
                </Col>
                
                <Col md={6}>
                  <Form.Group>
                    <Form.Check
                      type="checkbox"
                      name="requiresFollowUp"
                      checked={formData.requiresFollowUp}
                      onChange={handleInputChange}
                      label="Cần theo dõi tiếp"
                      className="fw-semibold"
                    />
                  </Form.Group>
                </Col>
              </Row>

              {formData.requiresFollowUp && (
                <Row className="mb-3">
                  <Col>
                    <Form.Group>
                      <Form.Label className="fw-semibold">
                        <i className="fas fa-sticky-note me-2 text-info"></i>Ghi chú theo dõi
                      </Form.Label>
                      <Form.Control
                        as="textarea"
                        rows={3}
                        name="followUpNotes"
                        value={formData.followUpNotes}
                        onChange={handleInputChange}
                        placeholder="Ghi chú cho việc theo dõi tiếp"
                      />
                    </Form.Group>
                  </Col>
                </Row>
              )}
            </Container>
          </Modal.Body>
          
          <Modal.Footer className="lukhang-medical-update-footer-custom">
            <div className="d-flex justify-content-center align-items-center gap-3 w-100">
              <Button 
                variant="outline-secondary"
                size="lg"
                onClick={handleClose}
                className="px-4 py-3 d-flex align-items-center shadow-sm"
                style={{
                  borderRadius: '25px',
                  fontWeight: '600',
                  transition: 'all 0.3s ease',
                  border: '2px solid #6c757d',
                  minWidth: '130px',
                  height: '55px',
                  fontSize: '1.1rem'
                }}
                onMouseEnter={(e) => {
                  e.target.style.backgroundColor = '#6c757d';
                  e.target.style.color = 'white';
                  e.target.style.transform = 'translateY(-2px)';
                  e.target.style.boxShadow = '0 4px 12px rgba(108, 117, 125, 0.3)';
                }}
                onMouseLeave={(e) => {
                  e.target.style.backgroundColor = '';
                  e.target.style.color = '';
                  e.target.style.transform = '';
                  e.target.style.boxShadow = '0 2px 4px rgba(0,0,0,0.1)';
                }}
              >
                <i className="fas fa-times me-2"></i> 
                Hủy
              </Button>
              <Button 
                variant="primary"
                size="lg"
                type="submit"
                disabled={propLoading || contextLoading}
                className="px-4 py-3 d-flex align-items-center shadow-sm"
                style={{
                  borderRadius: '25px',
                  fontWeight: '600',
                  transition: 'all 0.3s ease',
                  border: '2px solid #0d6efd',
                  minWidth: '150px',
                  height: '55px',
                  fontSize: '1.1rem',
                  background: (propLoading || contextLoading) ? '#6c757d' : '#0d6efd',
                  color: 'white'
                }}
                onMouseEnter={(e) => {
                  if (!(propLoading || contextLoading)) {
                    e.target.style.transform = 'translateY(-2px)';
                    e.target.style.boxShadow = '0 4px 12px rgba(13, 110, 253, 0.4)';
                    e.target.style.background = '#0b5ed7';
                  }
                }}
                onMouseLeave={(e) => {
                  if (!(propLoading || contextLoading)) {
                    e.target.style.transform = '';
                    e.target.style.boxShadow = '0 2px 4px rgba(0,0,0,0.1)';
                    e.target.style.background = '#0d6efd';
                  }
                }}
              >
                {(propLoading || contextLoading) ? (
                  <>
                    <Spinner size="sm" className="me-2" /> 
                    Đang cập nhật...
                  </>
                ) : (
                  <>
                    <i className="fas fa-save me-2"></i> 
                    Cập nhật
                  </>
                )}
              </Button>
            </div>
          </Modal.Footer>
        </Form>
      </Modal>
    </>
  );
};

export default MedicalIncidentUpdateModal;
