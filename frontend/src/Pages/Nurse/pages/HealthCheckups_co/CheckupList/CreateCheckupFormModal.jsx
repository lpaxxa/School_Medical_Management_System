import React, { useState, useEffect } from 'react';
import { Modal, Button, Form, Row, Col, ListGroup, Badge, Spinner } from 'react-bootstrap';
import { useAuth } from '../../../../../context/AuthContext';
import Swal from 'sweetalert2';
import './CreateCheckupFormModal.css';

const CreateCheckupFormModal = ({ show, onClose, student, campaign, onSubmit }) => {
  const { currentUser } = useAuth();
  const [formData, setFormData] = useState({});
  const [isLoading, setIsLoading] = useState(false);
  const [errors, setErrors] = useState({});

  const getInitialData = () => ({
    studentId: student.studentId,
    healthCampaignId: campaign.id,
    parentConsentId: student.parentConsentId,
    medicalStaffId: currentUser?.id || 1, 
    checkupDate: new Date().toISOString().split('T')[0],
    checkupType: "Khám tổng quát định kỳ",
    checkupStatus: "COMPLETED",
    specialCheckupItems: student.specialCheckupItems || [],
    height: '',
    weight: '',
    bmi: '',
    bloodPressure: '',
    visionLeft: '',
    visionRight: '',
    hearingStatus: '',
    heartRate: '',
    bodyTemperature: '',
    diagnosis: '',
    notes: '',
  });

  useEffect(() => {
    if (show && student && campaign) {
      setFormData(getInitialData());
      setErrors({});
    }
  }, [show, student, campaign, currentUser]);

  useEffect(() => {
    if (formData.height > 0 && formData.weight > 0) {
      const heightInMeters = formData.height / 100;
      const bmi = (formData.weight / (heightInMeters * heightInMeters)).toFixed(2);
      setFormData(prev => ({ ...prev, bmi }));
    } else {
      setFormData(prev => ({ ...prev, bmi: '' }));
    }
  }, [formData.height, formData.weight]);

  const validateForm = () => {
    const newErrors = {};

    // Validate ngày khám
    if (!formData.checkupDate) {
      newErrors.checkupDate = 'Ngày khám là bắt buộc.';
    } else {
      const selectedDate = new Date(formData.checkupDate);
      const today = new Date();
      today.setHours(0, 0, 0, 0); // Reset time to compare only dates
      selectedDate.setHours(0, 0, 0, 0); // Reset time for selected date too

      if (selectedDate.getTime() < today.getTime()) {
        newErrors.checkupDate = 'Ngày khám không được là ngày trong quá khứ.';
      }
    }

    // Validate loại hình khám
    if (!formData.checkupType || !formData.checkupType.toString().trim()) {
      newErrors.checkupType = 'Loại hình khám là bắt buộc.';
    }

    // Validate trạng thái khám
    if (!formData.checkupStatus || !formData.checkupStatus.toString().trim()) {
      newErrors.checkupStatus = 'Trạng thái là bắt buộc.';
    }

    // ===== VALIDATE TẤT CẢ CÁC CHỈ SỐ SỨC KHỎE =====

    // 1. CHIỀU CAO (CM) - BẮT BUỘC
    if (!formData.height || !formData.height.toString().trim()) {
      newErrors.height = 'Chiều cao là bắt buộc.';
    } else {
      const heightValue = Number(formData.height);
      if (isNaN(heightValue)) {
        newErrors.height = 'Chiều cao phải là một số.';
      } else if (heightValue <= 0) {
        newErrors.height = 'Chiều cao phải lớn hơn 0.';
      } else if (heightValue < 50) {
        newErrors.height = 'Chiều cao quá thấp (tối thiểu 50cm).';
      } else if (heightValue > 250) {
        newErrors.height = 'Chiều cao quá cao (tối đa 250cm).';
      } else if (!Number.isInteger(heightValue * 10)) {
        newErrors.height = 'Chiều cao chỉ được có tối đa 1 chữ số thập phân.';
      }
    }

    // 2. CÂN NẶNG (KG) - BẮT BUỘC
    if (!formData.weight || !formData.weight.toString().trim()) {
      newErrors.weight = 'Cân nặng là bắt buộc.';
    } else {
      const weightValue = Number(formData.weight);
      if (isNaN(weightValue)) {
        newErrors.weight = 'Cân nặng phải là một số.';
      } else if (weightValue <= 0) {
        newErrors.weight = 'Cân nặng phải lớn hơn 0.';
      } else if (weightValue < 5) {
        newErrors.weight = 'Cân nặng quá nhẹ (tối thiểu 5kg).';
      } else if (weightValue > 200) {
        newErrors.weight = 'Cân nặng quá nặng (tối đa 200kg).';
      } else if (!Number.isInteger(weightValue * 10)) {
        newErrors.weight = 'Cân nặng chỉ được có tối đa 1 chữ số thập phân.';
      }
    }

    // 3. BMI - TỰ ĐỘNG TÍNH (không cần validate)
    // BMI được tính tự động từ chiều cao và cân nặng

    // 4. NHỊP TIM (BPM) - BẮT BUỘC
    if (!formData.heartRate || !formData.heartRate.toString().trim()) {
      newErrors.heartRate = 'Nhịp tim là bắt buộc.';
    } else {
      const heartRateValue = Number(formData.heartRate);
      if (isNaN(heartRateValue)) {
        newErrors.heartRate = 'Nhịp tim phải là một số.';
      } else if (heartRateValue <= 0) {
        newErrors.heartRate = 'Nhịp tim phải lớn hơn 0.';
      } else if (!Number.isInteger(heartRateValue)) {
        newErrors.heartRate = 'Nhịp tim phải là số nguyên.';
      } else if (heartRateValue < 30) {
        newErrors.heartRate = 'Nhịp tim quá chậm (tối thiểu 30 bpm).';
      } else if (heartRateValue > 220) {
        newErrors.heartRate = 'Nhịp tim quá nhanh (tối đa 220 bpm).';
      }
    }

    // 5. NHIỆT ĐỘ (°C) - BẮT BUỘC
    if (!formData.bodyTemperature || !formData.bodyTemperature.toString().trim()) {
      newErrors.bodyTemperature = 'Nhiệt độ là bắt buộc.';
    } else {
      const tempValue = Number(formData.bodyTemperature);
      if (isNaN(tempValue)) {
        newErrors.bodyTemperature = 'Nhiệt độ phải là một số.';
      } else if (tempValue <= 0) {
        newErrors.bodyTemperature = 'Nhiệt độ phải lớn hơn 0.';
      } else if (!Number.isInteger(tempValue * 10)) {
        newErrors.bodyTemperature = 'Nhiệt độ chỉ được có tối đa 1 chữ số thập phân.';
      } else if (tempValue < 30) {
        newErrors.bodyTemperature = 'Nhiệt độ quá thấp (tối thiểu 30°C).';
      } else if (tempValue > 45) {
        newErrors.bodyTemperature = 'Nhiệt độ quá cao (tối đa 45°C).';
      }
    }

    // 6. HUYẾT ÁP - BẮT BUỘC
    if (!formData.bloodPressure || !formData.bloodPressure.toString().trim()) {
      newErrors.bloodPressure = 'Huyết áp là bắt buộc.';
    } else {
      const bloodPressureValue = formData.bloodPressure.toString().trim();

      // Kiểm tra định dạng: số/số
      const bloodPressurePattern = /^(\d+)\/(\d+)$/;
      const match = bloodPressureValue.match(bloodPressurePattern);

      if (!match) {
        newErrors.bloodPressure = 'Huyết áp phải có định dạng: [số]/[số] (ví dụ: 120/80).';
      } else {
        const systolic = parseInt(match[1]);
        const diastolic = parseInt(match[2]);

        // Validate systolic (tâm thu)
        if (systolic < 50) {
          newErrors.bloodPressure = 'Huyết áp tâm thu quá thấp (tối thiểu 50).';
        } else if (systolic > 300) {
          newErrors.bloodPressure = 'Huyết áp tâm thu quá cao (tối đa 300).';
        }
        // Validate diastolic (tâm trương)
        else if (diastolic < 20) {
          newErrors.bloodPressure = 'Huyết áp tâm trương quá thấp (tối thiểu 20).';
        } else if (diastolic > 200) {
          newErrors.bloodPressure = 'Huyết áp tâm trương quá cao (tối đa 200).';
        }
        // Validate logic: systolic should be higher than diastolic
        else if (systolic <= diastolic) {
          newErrors.bloodPressure = 'Huyết áp tâm thu phải cao hơn tâm trương.';
        }
        // Warning for abnormal values
        else if (systolic < 80 || systolic > 200 || diastolic < 40 || diastolic > 120) {
          // This is just a warning, not an error - could be implemented as a separate warning system
        }
      }
    }

    // 7. THỊ LỰC MẮT TRÁI - BẮT BUỘC
    if (!formData.visionLeft || !formData.visionLeft.toString().trim()) {
      newErrors.visionLeft = 'Thị lực mắt trái là bắt buộc.';
    } else {
      const visionLeftValue = formData.visionLeft.toString().trim();

      // Kiểm tra định dạng: số/số
      const visionPattern = /^(\d+)\/(\d+)$/;
      const match = visionLeftValue.match(visionPattern);

      if (!match) {
        newErrors.visionLeft = 'Thị lực mắt trái phải có định dạng: [số]/[số] (ví dụ: 10/10, 20/20).';
      } else {
        const numerator = parseInt(match[1]);
        const denominator = parseInt(match[2]);

        // Validate numerator
        if (numerator < 1) {
          newErrors.visionLeft = 'Thị lực mắt trái: tử số phải ≥ 1.';
        } else if (numerator > 100) {
          newErrors.visionLeft = 'Thị lực mắt trái: tử số phải ≤ 100.';
        }
        // Validate denominator
        else if (denominator < 1) {
          newErrors.visionLeft = 'Thị lực mắt trái: mẫu số phải ≥ 1.';
        } else if (denominator > 100) {
          newErrors.visionLeft = 'Thị lực mắt trái: mẫu số phải ≤ 100.';
        }
        // Validate logic: common vision values
        else if (![5, 6, 8, 10, 12, 15, 20, 25, 30, 40, 50, 60, 80, 100].includes(denominator)) {
          newErrors.visionLeft = 'Thị lực mắt trái: mẫu số nên là một trong các giá trị chuẩn (5, 6, 8, 10, 12, 15, 20, 25, 30, 40, 50, 60, 80, 100).';
        }
      }
    }

    // 8. THỊ LỰC MẮT PHẢI - BẮT BUỘC
    if (!formData.visionRight || !formData.visionRight.toString().trim()) {
      newErrors.visionRight = 'Thị lực mắt phải là bắt buộc.';
    } else {
      const visionRightValue = formData.visionRight.toString().trim();

      // Kiểm tra định dạng: số/số
      const visionPattern = /^(\d+)\/(\d+)$/;
      const match = visionRightValue.match(visionPattern);

      if (!match) {
        newErrors.visionRight = 'Thị lực mắt phải phải có định dạng: [số]/[số] (ví dụ: 10/10, 20/20).';
      } else {
        const numerator = parseInt(match[1]);
        const denominator = parseInt(match[2]);

        // Validate numerator
        if (numerator < 1) {
          newErrors.visionRight = 'Thị lực mắt phải: tử số phải ≥ 1.';
        } else if (numerator > 100) {
          newErrors.visionRight = 'Thị lực mắt phải: tử số phải ≤ 100.';
        }
        // Validate denominator
        else if (denominator < 1) {
          newErrors.visionRight = 'Thị lực mắt phải: mẫu số phải ≥ 1.';
        } else if (denominator > 100) {
          newErrors.visionRight = 'Thị lực mắt phải: mẫu số phải ≤ 100.';
        }
        // Validate logic: common vision values
        else if (![5, 6, 8, 10, 12, 15, 20, 25, 30, 40, 50, 60, 80, 100].includes(denominator)) {
          newErrors.visionRight = 'Thị lực mắt phải: mẫu số nên là một trong các giá trị chuẩn (5, 6, 8, 10, 12, 15, 20, 25, 30, 40, 50, 60, 80, 100).';
        }
      }
    }

    // 9. THÍNH LỰC - BẮT BUỘC
    if (!formData.hearingStatus || !formData.hearingStatus.toString().trim()) {
      newErrors.hearingStatus = 'Thính lực là bắt buộc.';
    } else {
      const hearingValue = formData.hearingStatus.toString().trim();

      // Validate length
      if (hearingValue.length < 2) {
        newErrors.hearingStatus = 'Thính lực phải có ít nhất 2 ký tự.';
      } else if (hearingValue.length > 100) {
        newErrors.hearingStatus = 'Thính lực không được vượt quá 100 ký tự.';
      }
      // Validate content - không chứa ký tự đặc biệt không phù hợp
      else if (!/^[a-zA-ZÀ-ỹ0-9\s\-\.\,\(\)\/]+$/.test(hearingValue)) {
        newErrors.hearingStatus = 'Thính lực chỉ được chứa chữ cái, số, dấu cách và các ký tự: - . , ( ) /';
      }
      // Validate meaningful content
      else {
        const validHearingKeywords = [
          // Tiếng Việt có dấu
          'bình thường', 'tốt', 'khỏe', 'giảm nhẹ', 'giảm vừa', 'giảm nặng',
          'điếc', 'khiếm thính', 'cần kiểm tra', 'không rõ', 'bất thường',
          'yếu', 'kém', 'mất', 'suy giảm', 'có vấn đề', 'bình thường',
          // Tiếng Việt không dấu
          'binh thuong', 'tot', 'khoe', 'giam nhe', 'giam vua', 'giam nang',
          'diec', 'khiem thinh', 'can kiem tra', 'khong ro', 'bat thuong',
          'yeu', 'kem', 'mat', 'suy giam', 'co van de',
          // Tiếng Anh
          'normal', 'good', 'healthy', 'mild', 'moderate', 'severe', 'profound',
          'deaf', 'hearing loss', 'impaired', 'unclear', 'abnormal', 'poor',
          'needs', 'examination', 'check', 'test', 'problem', 'issue',
          // Số liệu
          'db', 'hz', 'khz', '%'
        ];

        const hasValidKeyword = validHearingKeywords.some(keyword =>
          hearingValue.toLowerCase().includes(keyword.toLowerCase())
        );

        if (!hasValidKeyword) {
          newErrors.hearingStatus = 'Thính lực nên mô tả tình trạng nghe (VD: Bình thường, Giảm nhẹ, Cần kiểm tra, v.v.).';
        }
      }
    }

    // 10. CHẨN ĐOÁN - BẮT BUỘC (chỉ kiểm tra không được để trống)
    if (!formData.diagnosis || !formData.diagnosis.toString().trim()) {
      newErrors.diagnosis = 'Chẩn đoán là bắt buộc.';
    }

    // 11. ĐỀ NGHỊ/GHI CHÚ - TÙY CHỌN
    if (formData.notes && formData.notes.toString().trim()) {
      const notesValue = formData.notes.toString().trim();

      if (notesValue.length > 1000) {
        newErrors.notes = 'Đề nghị không được vượt quá 1000 ký tự.';
      }
      // Validate content - không chứa ký tự đặc biệt không phù hợp
      else if (!/^[a-zA-ZÀ-ỹ0-9\s\-\.\,\(\)\[\]\:\;\!\?\+\=\/\%\&]+$/.test(notesValue)) {
        newErrors.notes = 'Đề nghị chứa ký tự không hợp lệ.';
      }
    }

    setErrors(newErrors);
    return Object.keys(newErrors).length === 0;
  };

  const handleChange = (e) => {
    const { name, value } = e.target;
    setFormData(prev => ({ ...prev, [name]: value }));
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    if (!validateForm()) {
      // Count errors and show detailed message
      const errorCount = Object.keys(errors).length;

      Swal.fire({
        icon: 'error',
        title: 'Dữ liệu không hợp lệ!',
        html: `
          <div style="text-align: left;">
            <p><strong>Có ${errorCount} lỗi cần sửa:</strong></p>
            <ul style="margin: 10px 0; padding-left: 20px;">
              ${Object.entries(errors).map(([, message]) => `<li>${message}</li>`).join('')}
            </ul>
            <p style="color: #666; font-size: 14px; margin-top: 15px;">
              <i class="fas fa-info-circle"></i> Vui lòng kiểm tra lại các trường đã tô đỏ.
            </p>
          </div>
        `,
        confirmButtonText: 'Tôi hiểu',
        width: '500px'
      });
      return;
    }

    setIsLoading(true);
    try {
      await onSubmit(formData);
      onClose(); 
    } catch (error) {
      // Error is handled by the parent component's Swal
    } finally {
      setIsLoading(false);
    }
  };

  const handleReset = () => {
    setFormData(getInitialData());
    setErrors({});
  };

  if (!student) return null;

  return (
    <Modal show={show} onHide={onClose} size="xl" backdrop="static" dialogClassName="create-checkup-modal">
      <Modal.Header closeButton>
        <Modal.Title>Tạo Hồ sơ Khám cho: {student.studentName}</Modal.Title>
      </Modal.Header>
      <Form noValidate onSubmit={handleSubmit}>
        <Modal.Body>
          <div className="form-section">
            <h5>Thông tin chung</h5>
            <Row className="mb-3 info-text">
              <Col md={4}><p><strong>Học sinh:</strong> {student.studentName}</p></Col>
              <Col md={4}><p><strong>Lớp:</strong> {student.studentClass}</p></Col>
              <Col md={4}><p><strong>Chiến dịch:</strong> {campaign?.title}</p></Col>
            </Row>
            <Row>
              <Col md={4}>
                <Form.Group controlId="checkupDate">
                  <Form.Label>Ngày khám</Form.Label>
                  <Form.Control type="date" name="checkupDate" value={formData.checkupDate || ''} onChange={handleChange} isInvalid={!!errors.checkupDate} required />
                  <Form.Control.Feedback type="invalid">{errors.checkupDate}</Form.Control.Feedback>
                </Form.Group>
              </Col>
              <Col md={4}>
                <Form.Group controlId="checkupType">
                  <Form.Label>Loại hình khám</Form.Label>
                  <Form.Control type="text" name="checkupType" value={formData.checkupType || ''} onChange={handleChange} isInvalid={!!errors.checkupType} required />
                   <Form.Control.Feedback type="invalid">{errors.checkupType}</Form.Control.Feedback>
                </Form.Group>
              </Col>
              <Col md={4}>
                <Form.Group controlId="checkupStatus">
                  <Form.Label>Trạng thái khám</Form.Label>
                  <Form.Select name="checkupStatus" value={formData.checkupStatus || 'COMPLETED'} onChange={handleChange} isInvalid={!!errors.checkupStatus} required>
                    <option value="COMPLETED">Đã hoàn thành</option>
                    <option value="NEED_FOLLOW_UP">Cần theo dõi</option>
                  </Form.Select>
                  <Form.Control.Feedback type="invalid">{errors.checkupStatus}</Form.Control.Feedback>
                </Form.Group>
              </Col>
            </Row>
          </div>

          <div className="form-section">
            <h5>Các chỉ số sức khỏe</h5>
            {/* Hàng 1: Chiều cao, Cân nặng, BMI */}
            <Row className="mb-3">
              <Col md={4}>
                <Form.Group>
                  <Form.Label>Chiều cao (cm)</Form.Label>
                  <Form.Control
                    type="number"
                    step="0.1"
                    name="height"
                    value={formData.height || ''}
                    onChange={handleChange}
                    isInvalid={!!errors.height}
                    placeholder="Nhập chiều cao..."
                  />
                  <Form.Control.Feedback type="invalid">{errors.height}</Form.Control.Feedback>
                </Form.Group>
              </Col>
              <Col md={4}>
                <Form.Group>
                  <Form.Label>Cân nặng (kg)</Form.Label>
                  <Form.Control
                    type="number"
                    step="0.1"
                    name="weight"
                    value={formData.weight || ''}
                    onChange={handleChange}
                    isInvalid={!!errors.weight}
                    placeholder="Nhập cân nặng..."
                  />
                  <Form.Control.Feedback type="invalid">{errors.weight}</Form.Control.Feedback>
                </Form.Group>
              </Col>
              <Col md={4}>
                <Form.Group>
                  <Form.Label>BMI</Form.Label>
                  <Form.Control
                    type="number"
                    name="bmi"
                    value={formData.bmi || ''}
                    readOnly
                    placeholder="Tự động tính"
                  />
                </Form.Group>
              </Col>
            </Row>

            {/* Hàng 2: Huyết áp, Thị lực (Trái), Thị lực (Phải) */}
            <Row className="mb-3">
              <Col md={4}>
                <Form.Group>
                  <Form.Label>Huyết áp</Form.Label>
                  <Form.Control
                    type="text"
                    name="bloodPressure"
                    value={formData.bloodPressure || ''}
                    onChange={handleChange}
                    isInvalid={!!errors.bloodPressure}
                    placeholder="VD: 120/80"
                    required
                  />
                  <Form.Control.Feedback type="invalid">{errors.bloodPressure}</Form.Control.Feedback>
                </Form.Group>
              </Col>
              <Col md={4}>
                <Form.Group>
                  <Form.Label>Thị lực (Trái)</Form.Label>
                  <Form.Control
                    type="text"
                    name="visionLeft"
                    value={formData.visionLeft || ''}
                    onChange={handleChange}
                    isInvalid={!!errors.visionLeft}
                    placeholder="VD: 12/20, 20/20"
                    required
                  />
                  <Form.Control.Feedback type="invalid">{errors.visionLeft}</Form.Control.Feedback>
                </Form.Group>
              </Col>
              <Col md={4}>
                <Form.Group>
                  <Form.Label>Thị lực (Phải)</Form.Label>
                  <Form.Control
                    type="text"
                    name="visionRight"
                    value={formData.visionRight || ''}
                    onChange={handleChange}
                    isInvalid={!!errors.visionRight}
                    placeholder="VD: 12/20, 20/20"
                    required
                  />
                  <Form.Control.Feedback type="invalid">{errors.visionRight}</Form.Control.Feedback>
                </Form.Group>
              </Col>
            </Row>

            {/* Hàng 3: Thính lực, Nhịp tim, Nhiệt độ */}
            <Row className="mb-3">
              <Col md={4}>
                <Form.Group>
                  <Form.Label>Thính lực</Form.Label>
                  <Form.Control
                    type="text"
                    name="hearingStatus"
                    value={formData.hearingStatus || ''}
                    onChange={handleChange}
                    isInvalid={!!errors.hearingStatus}
                    placeholder="VD: Bình thường"
                    required
                  />
                  <Form.Control.Feedback type="invalid">{errors.hearingStatus}</Form.Control.Feedback>
                </Form.Group>
              </Col>
              <Col md={4}>
                <Form.Group>
                  <Form.Label>Nhịp tim (bpm)</Form.Label>
                  <Form.Control
                    type="number"
                    name="heartRate"
                    value={formData.heartRate || ''}
                    onChange={handleChange}
                    isInvalid={!!errors.heartRate}
                    placeholder="VD: 80"
                    required
                  />
                  <Form.Control.Feedback type="invalid">{errors.heartRate}</Form.Control.Feedback>
                </Form.Group>
              </Col>
              <Col md={4}>
                <Form.Group>
                  <Form.Label>Nhiệt độ (°C)</Form.Label>
                  <Form.Control
                    type="number"
                    step="0.1"
                    name="bodyTemperature"
                    value={formData.bodyTemperature || ''}
                    onChange={handleChange}
                    isInvalid={!!errors.bodyTemperature}
                    placeholder="VD: 36.5"
                    required
                  />
                  <Form.Control.Feedback type="invalid">{errors.bodyTemperature}</Form.Control.Feedback>
                </Form.Group>
              </Col>
            </Row>
          </div>

          <div className="form-section">
            <h5>Khám chuyên khoa (Từ PH)</h5>
            {formData.specialCheckupItems?.length > 0 ? (
                <ListGroup horizontal>
                    {formData.specialCheckupItems.map((item, index) => (
                        <ListGroup.Item key={index} as={Badge} bg="info" className="me-2">{item}</ListGroup.Item>
                    ))}
                </ListGroup>
             ) : (
                <p className="text-muted">Không có mục khám đặc biệt nào được chọn.</p>
             )}
          </div>

          <div className="form-section">
            <h5>Kết luận & Đề nghị</h5>
            <Row>
              <Col md={12} className="mb-3">
                <Form.Group controlId="diagnosis">
                  <Form.Label>Chẩn đoán</Form.Label>
                  <Form.Control
                    as="textarea"
                    rows={3}
                    name="diagnosis"
                    value={formData.diagnosis || ''}
                    onChange={handleChange}
                    isInvalid={!!errors.diagnosis}
                    placeholder="Nhập chẩn đoán sức khỏe của học sinh..."
                  />
                  <Form.Control.Feedback type="invalid">{errors.diagnosis}</Form.Control.Feedback>
                </Form.Group>
              </Col>
              <Col md={12}>
                <Form.Group controlId="notes">
                  <Form.Label>Đề nghị</Form.Label>
                  <Form.Control
                    as="textarea"
                    rows={3}
                    name="notes"
                    value={formData.notes || ''}
                    onChange={handleChange}
                    isInvalid={!!errors.notes}
                    placeholder="Nhập các đề nghị, khuyến cáo cho học sinh..."
                  />
                  <Form.Control.Feedback type="invalid">{errors.notes}</Form.Control.Feedback>
                </Form.Group>
              </Col>
            </Row>
          </div>
        </Modal.Body>
        <Modal.Footer>
          <Button variant="secondary" onClick={onClose} disabled={isLoading}>Hủy</Button>
          <Button variant="warning" onClick={handleReset} disabled={isLoading}>Đặt lại</Button>
          <Button variant="primary" type="submit" disabled={isLoading}>
            {isLoading ? <><Spinner as="span" animation="border" size="sm" /> Đang lưu...</> : 'Lưu Hồ sơ'}
          </Button>
        </Modal.Footer>
      </Form>
    </Modal>
  );
};

export default CreateCheckupFormModal; 