import React, { useState, useEffect } from 'react';
import { toast } from 'react-toastify';
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
                  toast.success(`Đã tải ${foundCount} thuốc từ danh sách sự kiện`);
                }
                
                if (notFoundCount > 0) {
                  toast.info(`Có ${notFoundCount} thuốc không tìm thấy trong kho hiện tại`);
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
          toast.error("Không thể tải danh sách thuốc trong kho.");
          console.error("Failed to fetch inventory:", error);
          
          // Thông báo chi tiết hơn về lỗi
          if (error.response) {
            const status = error.response.status;
            if (status === 404) {
              toast.error("API không tìm thấy danh sách thuốc (404)");
            } else if (status >= 500) {
              toast.error("Lỗi máy chủ khi tải danh sách thuốc. Vui lòng thử lại sau");
            }
          } else if (error.request) {
            toast.error("Không thể kết nối đến máy chủ. Vui lòng kiểm tra kết nối mạng");
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
        dateTime: selectedEvent.dateTime || selectedEvent.date || new Date().toISOString(),
        imageMedicalUrl: selectedEvent.imageMedicalUrl || selectedEvent.imgUrl || '',
        // medicationsUsed is now handled by selectedMedications state
      });
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
      
      if (foundCount > 0) {
        toast.success(`Đã tìm thấy ${foundCount} thuốc trong kho`);
      }
      
      if (notFoundCount > 0) {
        toast.info(`Có ${notFoundCount} thuốc không tìm thấy trong kho hiện tại`);
      }
      
      // Nếu phân tích được ít hơn số thuốc đầu vào
      if (validMedications.length < medicationParts.length) {
        toast.warning(`Không thể phân tích ${medicationParts.length - validMedications.length} mục thuốc do định dạng không đúng`);
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
      toast.success(`Đã thêm thuốc "${medication.itemName}" vào danh sách`);
    } else {
      toast.info(`Thuốc "${medication.itemName}" đã có trong danh sách`);
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
        toast.info(
          `Đã cập nhật số lượng thuốc "${medicationBeingUpdated.itemName}" từ ${oldQuantity} thành ${parsedQuantity} ${medicationBeingUpdated.unit || 'viên'}`
        );
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
      toast.warning(`Đã xóa thuốc "${medicationToRemove.itemName}" khỏi danh sách`);
    }
    
    // Filter out the medication with the given itemID
    setSelectedMedications(prev => prev.filter(med => med.itemID !== itemID));
  };

  // Handle form submission
  const handleSubmit = async (e) => {
    e.preventDefault();
    
    // Use the event ID from the initial selectedEvent prop
    const eventId = selectedEvent?.incidentId || selectedEvent?.id;
    if (!eventId) {
      toast.error('Không tìm thấy ID sự kiện để cập nhật. Vui lòng thử lại.');
      return;
    }

    try {
      console.log("Update Modal - Starting form submission");
      console.log("Update Modal - Selected medications:", selectedMedications);

      // Validate required fields
      if (!formData.incidentType?.trim()) {
        toast.error('Vui lòng nhập loại sự kiện');
        return;
      }
      
      if (!formData.severityLevel) {
        toast.error('Vui lòng chọn mức độ nghiêm trọng');
        return;
      }
      
      if (!formData.studentId?.trim()) {
        toast.error('Mã học sinh không được để trống');
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
          toast.warning(`Một số thuốc có ID không hợp lệ. Hệ thống sẽ bỏ qua những thuốc này.`);
          console.warn("Invalid medications that will be skipped:", invalidMedications);
        }
        
        const invalidQuantities = medicationsArray.filter(med => 
          !med.quantityUsed || isNaN(med.quantityUsed) || med.quantityUsed <= 0
        );
        
        if (invalidQuantities.length > 0) {
          toast.warning(`Một số thuốc có số lượng không hợp lệ. Hệ thống sẽ bỏ qua những thuốc này.`);
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
            if (!isValidID) toast.warning(`Thuốc "${med.itemName}" có ID không hợp lệ nên sẽ bị bỏ qua`);
            else if (!isValidQuantity) toast.warning(`Thuốc "${med.itemName}" có số lượng không hợp lệ nên sẽ bị bỏ qua`);
            else if (med.isTemporary) toast.info(`Thuốc "${med.itemName}" không có trong kho nên sẽ bị bỏ qua`);
          }
          
          return isValid;
        })
        .map(({ itemID, quantityUsed }) => ({ 
          itemID: parseInt(itemID, 10), // Ensure integer ID
          quantityUsed: parseInt(quantityUsed, 10) // Ensure integer quantity
        }));
      
      console.log(`Found ${validMedicationsArray.length} valid medications for submission out of ${medicationsArray.length} total`);

      // Format data for API submission according to the new format
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
        imageMedicalUrl: formData.imageMedicalUrl,
        medicationsUsed: validMedicationsArray // Sử dụng mảng thuốc đã được lọc
      };

      console.log("Update Modal - Final API data being sent:", apiData);
      console.log("Update Modal - medicationsUsed being sent:", JSON.stringify(apiData.medicationsUsed, null, 2));
      
      // Final validation before sending to backend - hiển thị thông báo nhưng không ngăn cản việc gửi
      if (apiData.medicationsUsed.length === 0 && selectedMedications.length > 0) {
        // Nếu người dùng đã chọn thuốc nhưng tất cả đều không hợp lệ
        toast.warning("Tất cả thuốc đã chọn đều không hợp lệ hoặc không còn trong kho. Hệ thống sẽ tiếp tục lưu sự kiện mà không có thông tin thuốc.");
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
        // Directly call the context function to update the event
        const result = await updateEvent(eventId, apiData);
        
        if (result) {
          toast.success('Cập nhật sự kiện y tế thành công!');
          handleClose();
        }
      } catch (updateError) {
        console.error("Update Modal - Error in updateEvent API call:", updateError);
        
        // Check for medication ID errors specifically
        if (updateError.response?.data?.data?.includes('Medication Item not found with id')) {
          const errorIdMatch = updateError.response.data.data.match(/id: (\d+)/);
          const errorId = errorIdMatch ? errorIdMatch[1] : 'không xác định';
          
          toast.error(`Không tìm thấy thuốc với ID: ${errorId}`);
          console.error(`Backend rejected medication with ID: ${errorId}`);
          
          // Show instructions to retry
          toast.info('Vui lòng kiểm tra lại danh sách thuốc và thử lại');
        } else {
          const errorMessage = updateError.response?.data?.message || updateError.message || 'Lỗi không xác định.';
          if (updateError.response?.status === 400) {
            toast.error(`Dữ liệu không hợp lệ: ${errorMessage}`);
          } else {
            toast.error(`Không thể cập nhật: ${errorMessage}`);
          }
        }
      }
    } catch (error) {
      console.error("Update Modal - General error in handleSubmit:", error);
      toast.error(`Đã xảy ra lỗi: ${error.message || 'Lỗi không xác định'}`)
    }
  };

  // Close modal and reset form
  const handleClose = () => {
    setMedicationSearch('');
    setMedicationResults([]);
    setShowMedicationDropdown(false);
    setSelectedMedications([]);
    onClose();
  };

  if (!show) return null;

  return (
    <>
      <div className="modal show d-block" tabIndex="-1" style={{ backgroundColor: 'rgba(0,0,0,0.5)' }}>
        <div className="modal-dialog modal-xl">
          <div className="modal-content">
            <div className="modal-header bg-primary text-white">
              <h5 className="modal-title fw-bold">
                <i className="fas fa-edit me-2"></i>
                Cập nhật sự kiện y tế
              </h5>
              <button 
                type="button" 
                className="btn-close btn-close-white" 
                onClick={handleClose}
                aria-label="Close"
              ></button>
            </div>
            
            <form onSubmit={handleSubmit}>
              <div className="modal-body">
                <div className="card">
                  <div className="card-body">
                    {/* Thông tin cơ bản */}
                    <div className="row mb-3">
                      <div className="col-md-6">
                        <h6 className="text-primary fw-bold mb-2">
                          <i className="fas fa-id-badge me-2"></i>ID sự kiện
                        </h6>
                        <p className="text-dark"><code className="bg-light p-1 rounded">{formData.incidentId}</code></p>
                      </div>
                      <div className="col-md-6">
                        <h6 className="text-primary fw-bold mb-2">
                          <i className="fas fa-calendar-alt me-2"></i>Ngày xảy ra
                        </h6>
                        <p className="text-dark">{formData.dateTime ? new Date(formData.dateTime).toLocaleDateString('vi-VN') : 'N/A'}</p>
                      </div>
                    </div>

                    <div className="row mb-3">
                      <div className="col-md-6">
                        <h6 className="text-primary fw-bold mb-2">
                          <i className="fas fa-tag me-2"></i>Loại sự kiện
                        </h6>
                        <input 
                          type="text" 
                          className="form-control" 
                          name="incidentType" 
                          value={formData.incidentType} 
                          onChange={handleInputChange}
                          required
                        />
                      </div>
                      <div className="col-md-6">
                        <h6 className="text-danger fw-bold mb-2">
                          <i className="fas fa-exclamation-triangle me-2"></i>Mức độ nghiêm trọng
                        </h6>
                        <select 
                          className="form-select" 
                          name="severityLevel" 
                          value={formData.severityLevel} 
                          onChange={handleInputChange}
                          required
                        >
                          <option value="">Chọn mức độ...</option>
                          <option value="Nhẹ">Nhẹ</option>
                          <option value="Trung bình">Trung bình</option>
                          <option value="Nghiêm trọng">Nghiêm trọng</option>
                        </select>
                      </div>
                    </div>

                    <div className="row mb-3">
                      <div className="col-md-6">
                        <h6 className="text-primary fw-bold mb-2">
                          <i className="fas fa-user-graduate me-2"></i>Tên học sinh
                        </h6>
                        <p className="fw-bold text-dark">{formData.studentName || 'Chưa xác định'}</p>
                      </div>
                      <div className="col-md-6">
                        <h6 className="text-primary fw-bold mb-2">
                          <i className="fas fa-id-card me-2"></i>Mã học sinh
                        </h6>
                        <p className="text-dark"><code className="bg-light p-1 rounded">{formData.studentId || 'N/A'}</code></p>
                      </div>
                    </div>

                    <hr className="my-4" />

                    {/* Mô tả */}
                    <div className="mb-3">
                      <h6 className="text-info fw-bold mb-2">
                        <i className="fas fa-file-alt me-2"></i>Mô tả chi tiết
                      </h6>
                      <textarea
                        name="description"
                        value={formData.description}
                        onChange={handleInputChange}
                        rows="3"
                        placeholder="Mô tả chi tiết sự kiện"
                        className="form-control"
                      />
                    </div>

                    <div className="mb-3">
                      <h6 className="text-warning fw-bold mb-2">
                        <i className="fas fa-heartbeat me-2"></i>Triệu chứng
                      </h6>
                      <textarea
                        name="symptoms"
                        value={formData.symptoms}
                        onChange={handleInputChange}
                        rows="3"
                        placeholder="Ghi lại các triệu chứng quan sát được"
                        className="form-control"
                      />
                    </div>

                    <div className="mb-3">
                      <h6 className="text-success fw-bold mb-2">
                        <i className="fas fa-stethoscope me-2"></i>Điều trị
                      </h6>
                      <textarea
                        name="treatment"
                        value={formData.treatment}
                        onChange={handleInputChange}
                        rows="3"
                        placeholder="Biện pháp điều trị đã thực hiện"
                        className="form-control"
                      />
                        </div>
                    
                    <div className="mb-3">
                      <label className="form-label fw-bold text-muted">
                        <i className="fas fa-image me-2"></i>URL Hình ảnh
                      </label>
                      <input 
                        type="text" 
                        className="form-control" 
                        name="imageMedicalUrl" 
                        value={formData.imageMedicalUrl} 
                        onChange={handleInputChange}
                        placeholder="URL hình ảnh liên quan đến sự kiện y tế"
                      />
                    </div>

                {/* Medication Search Section */}
                <div className="mb-4">
                  <div className="card border-primary">
                    <div className="card-header bg-primary text-white">
                      <h6 className="mb-0 fw-bold">
                        <i className="fas fa-pills me-2"></i>Thuốc sử dụng
                      </h6>
                    </div>
                    <div className="card-body">
                      <div className="position-relative">
                        <div className="input-group">
                          <span className="input-group-text">
                            <i className="fas fa-search"></i>
                          </span>
                          <input
                            type="text"
                            className="form-control"
                            value={medicationSearch}
                            onChange={(e) => handleMedicationSearch(e.target.value)}
                            placeholder="Tìm kiếm thuốc theo tên..."
                          />
                          {searchingMedications && (
                            <span className="input-group-text">
                              <i className="fas fa-spinner fa-spin text-primary"></i>
                            </span>
                          )}
                        </div>
                        
                        {/* Medication Search Results Dropdown */}
                        {showMedicationDropdown && medicationResults.length > 0 && (
                          <div className="list-group shadow position-absolute w-100" style={{top: '100%', zIndex: 1000, maxHeight: '300px', overflowY: 'auto'}}>
                            {medicationResults.map((medication, index) => (
                              <button
                                key={medication.itemID || index}
                                type="button"
                                className="list-group-item list-group-item-action d-flex justify-content-between align-items-center"
                                onClick={() => handleMedicationSelect(medication)}
                              >
                                <div>
                                  <div className="fw-bold text-primary">{medication.itemName}</div>
                                  <small className="text-muted">
                                    ID: {medication.itemID} | Đơn vị: {medication.unit || 'viên'}
                                  </small>
                                </div>
                                <div className="ms-2">
                                  <span className="badge bg-secondary rounded-pill me-2">
                                    {medication.stockQuantity} {medication.unit || 'viên'}
                                  </span>
                                  {medication.stockQuantity === 0 && (
                                    <span className="badge bg-danger">Hết hàng</span>
                                  )}
                                  {medication.stockQuantity > 0 && medication.stockQuantity <= 5 && (
                                    <span className="badge bg-warning">Sắp hết</span>
                                  )}
                                  {medication.stockQuantity > 5 && (
                                    <span className="badge bg-success">Còn hàng</span>
                                  )}
                                </div>
                              </button>
                            ))}
                          </div>
                        )}
                      </div>

                      {/* Selected Medications */}
                      {selectedMedications.length > 0 && (
                        <div className="mt-4">
                          <h6 className="fw-bold text-primary mb-3">
                            <i className="fas fa-pills me-2"></i>
                            Thuốc đã chọn:
                          </h6>
                          <div className="medication-list">
                            {selectedMedications.map((medication, index) => (
                              <div 
                                key={`selected-med-${medication.itemID}-${index}`} 
                                className={`card mb-3 shadow-sm ${medication.isTemporary ? 'border-warning' : 'border-info'}`}
                              >
                                <div className={`card-header py-2 ${medication.isTemporary ? 'bg-warning-subtle' : 'bg-info-subtle'}`}>
                                  <div className="d-flex justify-content-between align-items-center">
                                    <h6 className="mb-0 fw-bold">
                                      <i className={`fas fa-capsules me-2 ${medication.isTemporary ? 'text-warning' : 'text-primary'}`}></i>
                                      {medication.itemName}
                                    </h6>
                                    <button
                                      type="button"
                                      className="btn btn-outline-danger btn-sm"
                                      onClick={() => handleMedicationRemove(medication.itemID)}
                                      title="Xóa thuốc này"
                                    >
                                      <i className="fas fa-times"></i>
                                    </button>
                                  </div>
                                </div>
                                <div className={`card-body py-3 ${medication.isTemporary ? 'bg-light' : ''}`}>
                                  <div className="row align-items-center">
                                    <div className="col-md-6 mb-2 mb-md-0">
                                      <div className="input-group">
                                        <span className="input-group-text bg-light">
                                          <i className="fas fa-hashtag text-primary"></i> Số lượng
                                        </span>
                                        <input
                                          type="number"
                                          className="form-control"
                                          value={medication.quantityUsed}
                                          onChange={(e) => handleMedicationQuantityChange(medication.itemID, e.target.value)}
                                          min="0"
                                          max={medication.stockQuantity}
                                        />
                                        <span className="input-group-text bg-light">{medication.unit}</span>
                                      </div>
                                      {medication.isTemporary && (
                                        <div className="mt-2">
                                          <small className="text-warning">
                                            <i className="fas fa-exclamation-triangle me-1"></i>
                                            Thuốc không có trong kho
                                          </small>
                                        </div>
                                      )}
                                    </div>
                                    <div className="col-md-6">
                                      <div className="d-flex align-items-center">
                                        <span className="me-2 text-secondary">
                                          <i className="fas fa-warehouse me-1"></i> Tồn kho:
                                        </span>
                                        <span className="fw-bold">{medication.stockQuantity} {medication.unit}</span>
                                        {medication.stockQuantity === 0 && (
                                          <span className="badge bg-danger ms-2">Hết hàng</span>
                                        )}
                                        {medication.stockQuantity > 0 && medication.stockQuantity <= 5 && (
                                          <span className="badge bg-warning ms-2">Sắp hết</span>
                                        )}
                                        {medication.stockQuantity > 5 && (
                                          <span className="badge bg-success ms-2">Còn hàng</span>
                                        )}
                                      </div>
                                    </div>
                                  </div>
                                </div>
                              </div>
                            ))}
                          </div>
                        </div>
                      )}
                    </div>
                  </div>
                </div>

                <hr />

                {/* Checkboxes */}
                <div className="row mb-3">
                  <div className="col-md-6">
                    <div className="form-check">
                      <input
                        type="checkbox"
                        className="form-check-input"
                        id="parentNotified"
                        name="parentNotified"
                        checked={formData.parentNotified}
                        onChange={handleInputChange}
                      />
                      <label className="form-check-label fw-bold text-warning" htmlFor="parentNotified">
                        <i className="fas fa-bell me-2"></i>Đã thông báo phụ huynh
                      </label>
                    </div>
                  </div>
                  
                  <div className="col-md-6">
                    <div className="form-check">
                      <input
                        type="checkbox"
                        className="form-check-input"
                        id="requiresFollowUp"
                        name="requiresFollowUp"
                        checked={formData.requiresFollowUp}
                        onChange={handleInputChange}
                      />
                      <label className="form-check-label fw-bold text-info" htmlFor="requiresFollowUp">
                        <i className="fas fa-eye me-2"></i>Cần theo dõi
                      </label>
                    </div>
                  </div>
                </div>

                {/* Follow-up Notes */}
                {formData.requiresFollowUp && (
                  <div className="mb-3">
                    <label className="form-label fw-bold" style={{color: '#6f42c1'}}>
                      <i className="fas fa-sticky-note me-2"></i>Ghi chú theo dõi
                    </label>
                    <textarea
                      name="followUpNotes"
                      value={formData.followUpNotes}
                      onChange={handleInputChange}
                      rows="2"
                      placeholder="Ghi chú chi tiết về việc theo dõi"
                      className="form-control"
                    />
                  </div>
                )}
                  </div>
                </div>
              </div>

              <div className="modal-footer bg-light">
                <button 
                  type="button" 
                  className="btn btn-secondary btn-lg" 
                  onClick={handleClose}
                >
                  <i className="fas fa-times me-2"></i>
                  Hủy
                </button>
                <button 
                  type="submit" 
                  className="btn btn-warning btn-lg"
                  disabled={propLoading || contextLoading}
                >
                  {propLoading || contextLoading ? (
                    <>
                      <i className="fas fa-spinner fa-spin me-2"></i> Đang cập nhật...
                    </>
                  ) : (
                    <>
                      <i className="fas fa-save me-2"></i> Cập nhật
                    </>
                  )}
                </button>
              </div>
            </form>
          </div>
        </div>
      </div>
    </>
  );
};

export default MedicalIncidentUpdateModal;
