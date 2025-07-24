import React, { useState, useEffect } from 'react';
import { Modal, Button, Form, Row, Col } from 'react-bootstrap';
import Swal from 'sweetalert2';
import './ScheduleEditModal.css';

const ScheduleEditModal = ({ show, onHide, checkupData, onSubmit, loading, validated, errors, setCheckupData }) => {

    const [formData, setFormData] = useState(checkupData);
    const [validationErrors, setValidationErrors] = useState({});

    useEffect(() => {
        if (checkupData) {
            // Format ngày để hiển thị đúng trong input date
            const formattedData = { ...checkupData };
            if (checkupData.checkupDate) {
                // Nếu checkupDate là array [year, month, day] từ backend
                if (Array.isArray(checkupData.checkupDate)) {
                    const [year, month, day] = checkupData.checkupDate;
                    formattedData.checkupDate = `${year}-${month.toString().padStart(2, '0')}-${day.toString().padStart(2, '0')}`;
                } else if (typeof checkupData.checkupDate === 'string') {
                    // Nếu đã là string, kiểm tra format
                    const dateStr = checkupData.checkupDate;
                    if (dateStr.includes('T')) {
                        // Nếu có timestamp, chỉ lấy phần date
                        formattedData.checkupDate = dateStr.split('T')[0];
                    } else {
                        formattedData.checkupDate = dateStr;
                    }
                }
            }
            setFormData(formattedData);
        } else {
            setFormData({});
        }
        setValidationErrors({});
    }, [checkupData]);

    // ===== VALIDATION FUNCTION =====
    const validateForm = () => {
        const newErrors = {};

        // ===== VALIDATE TẤT CẢ CÁC THUỘC TÍNH =====

        // 1. NGÀY KHÁM - BẮT BUỘC
        if (!formData.checkupDate || !formData.checkupDate.toString().trim()) {
            newErrors.checkupDate = 'Ngày khám là bắt buộc.';
        } else {
            const selectedDate = new Date(formData.checkupDate);
            const today = new Date();
            today.setHours(0, 0, 0, 0);
            selectedDate.setHours(0, 0, 0, 0);

            if (isNaN(selectedDate.getTime())) {
                newErrors.checkupDate = 'Ngày khám không hợp lệ.';
            } else if (selectedDate.getTime() < today.getTime()) {
                newErrors.checkupDate = 'Ngày khám không được là ngày trong quá khứ.';
            }
        }

        // 2. LOẠI HÌNH KHÁM - BẮT BUỘC
        if (!formData.checkupType || !formData.checkupType.toString().trim()) {
            newErrors.checkupType = 'Loại hình khám là bắt buộc.';
        } else {
            const checkupTypeValue = formData.checkupType.toString().trim();
            if (checkupTypeValue.length < 3) {
                newErrors.checkupType = 'Loại hình khám phải có ít nhất 3 ký tự.';
            } else if (checkupTypeValue.length > 100) {
                newErrors.checkupType = 'Loại hình khám không được vượt quá 100 ký tự.';
            } else if (!/^[a-zA-ZÀ-ỹ0-9\s\-\.\,\(\)]+$/.test(checkupTypeValue)) {
                newErrors.checkupType = 'Loại hình khám chứa ký tự không hợp lệ.';
            }
        }

        // 3. TRẠNG THÁI KHÁM - BẮT BUỘC
        if (!formData.checkupStatus || !formData.checkupStatus.toString().trim()) {
            newErrors.checkupStatus = 'Trạng thái khám là bắt buộc.';
        } else {
            const validStatuses = ['COMPLETED', 'NEED_FOLLOW_UP', 'CANCELLED'];
            if (!validStatuses.includes(formData.checkupStatus)) {
                newErrors.checkupStatus = 'Trạng thái khám không hợp lệ.';
            }
        }

        // 4. CHIỀU CAO (CM) - BẮT BUỘC
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

        // 5. CÂN NẶNG (KG) - BẮT BUỘC
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

        // 6. BMI - TỰ ĐỘNG TÍNH (không cần validate)

        // 7. HUYẾT ÁP - BẮT BUỘC
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

                if (systolic < 50) {
                    newErrors.bloodPressure = 'Huyết áp tâm thu quá thấp (tối thiểu 50).';
                } else if (systolic > 300) {
                    newErrors.bloodPressure = 'Huyết áp tâm thu quá cao (tối đa 300).';
                } else if (diastolic < 20) {
                    newErrors.bloodPressure = 'Huyết áp tâm trương quá thấp (tối thiểu 20).';
                } else if (diastolic > 200) {
                    newErrors.bloodPressure = 'Huyết áp tâm trương quá cao (tối đa 200).';
                } else if (systolic <= diastolic) {
                    newErrors.bloodPressure = 'Huyết áp tâm thu phải cao hơn tâm trương.';
                }
            }
        }

        // 8. THỊ LỰC MẮT TRÁI - BẮT BUỘC
        if (!formData.visionLeft || !formData.visionLeft.toString().trim()) {
            newErrors.visionLeft = 'Thị lực mắt trái là bắt buộc.';
        } else {
            const visionLeftValue = formData.visionLeft.toString().trim();

            const visionPattern = /^(\d+)\/(\d+)$/;
            const match = visionLeftValue.match(visionPattern);

            if (!match) {
                newErrors.visionLeft = 'Thị lực mắt trái phải có định dạng: [số]/[số] (ví dụ: 10/10, 20/20).';
            } else {
                const numerator = parseInt(match[1]);
                const denominator = parseInt(match[2]);

                if (numerator < 1) {
                    newErrors.visionLeft = 'Thị lực mắt trái: tử số phải ≥ 1.';
                } else if (numerator > 100) {
                    newErrors.visionLeft = 'Thị lực mắt trái: tử số phải ≤ 100.';
                } else if (denominator < 1) {
                    newErrors.visionLeft = 'Thị lực mắt trái: mẫu số phải ≥ 1.';
                } else if (denominator > 100) {
                    newErrors.visionLeft = 'Thị lực mắt trái: mẫu số phải ≤ 100.';
                } else if (![5, 6, 8, 10, 12, 15, 20, 25, 30, 40, 50, 60, 80, 100].includes(denominator)) {
                    newErrors.visionLeft = 'Thị lực mắt trái: mẫu số nên là một trong các giá trị chuẩn (5, 6, 8, 10, 12, 15, 20, 25, 30, 40, 50, 60, 80, 100).';
                }
            }
        }

        // 9. THỊ LỰC MẮT PHẢI - BẮT BUỘC
        if (!formData.visionRight || !formData.visionRight.toString().trim()) {
            newErrors.visionRight = 'Thị lực mắt phải là bắt buộc.';
        } else {
            const visionRightValue = formData.visionRight.toString().trim();

            const visionPattern = /^(\d+)\/(\d+)$/;
            const match = visionRightValue.match(visionPattern);

            if (!match) {
                newErrors.visionRight = 'Thị lực mắt phải phải có định dạng: [số]/[số] (ví dụ: 10/10, 20/20).';
            } else {
                const numerator = parseInt(match[1]);
                const denominator = parseInt(match[2]);

                if (numerator < 1) {
                    newErrors.visionRight = 'Thị lực mắt phải: tử số phải ≥ 1.';
                } else if (numerator > 100) {
                    newErrors.visionRight = 'Thị lực mắt phải: tử số phải ≤ 100.';
                } else if (denominator < 1) {
                    newErrors.visionRight = 'Thị lực mắt phải: mẫu số phải ≥ 1.';
                } else if (denominator > 100) {
                    newErrors.visionRight = 'Thị lực mắt phải: mẫu số phải ≤ 100.';
                } else if (![5, 6, 8, 10, 12, 15, 20, 25, 30, 40, 50, 60, 80, 100].includes(denominator)) {
                    newErrors.visionRight = 'Thị lực mắt phải: mẫu số nên là một trong các giá trị chuẩn (5, 6, 8, 10, 12, 15, 20, 25, 30, 40, 50, 60, 80, 100).';
                }
            }
        }

        // 10. THÍNH LỰC - BẮT BUỘC
        if (!formData.hearingStatus || !formData.hearingStatus.toString().trim()) {
            newErrors.hearingStatus = 'Thính lực là bắt buộc.';
        } else {
            const hearingValue = formData.hearingStatus.toString().trim();

            if (hearingValue.length < 2) {
                newErrors.hearingStatus = 'Thính lực phải có ít nhất 2 ký tự.';
            } else if (hearingValue.length > 100) {
                newErrors.hearingStatus = 'Thính lực không được vượt quá 100 ký tự.';
            } else if (!/^[a-zA-ZÀ-ỹ0-9\s\-\.\,\(\)\/]+$/.test(hearingValue)) {
                newErrors.hearingStatus = 'Thính lực chỉ được chứa chữ cái, số, dấu cách và các ký tự: - . , ( ) /';
            } else {
                const validHearingKeywords = [
                    'bình thường', 'tốt', 'khỏe', 'giảm nhẹ', 'giảm vừa', 'giảm nặng',
                    'điếc', 'khiếm thính', 'cần kiểm tra', 'không rõ', 'bất thường',
                    'binh thuong', 'tot', 'khoe', 'giam nhe', 'giam vua', 'giam nang',
                    'diec', 'khiem thinh', 'can kiem tra', 'khong ro', 'bat thuong',
                    'normal', 'good', 'healthy', 'mild', 'moderate', 'severe', 'profound',
                    'deaf', 'hearing loss', 'impaired', 'unclear', 'abnormal', 'poor',
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

        // 11. NHỊP TIM (BPM) - BẮT BUỘC
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

        // 12. NHIỆT ĐỘ (°C) - BẮT BUỘC
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

        // 13. CHẨN ĐOÁN - BẮT BUỘC (chỉ kiểm tra không được để trống)
        if (!formData.diagnosis || !formData.diagnosis.toString().trim()) {
            newErrors.diagnosis = 'Chẩn đoán là bắt buộc.';
        }

        // 14. ĐỀ NGHỊ CỦA BÁC SĨ - TÙY CHỌN
        if (formData.recommendations && formData.recommendations.toString().trim()) {
            const recommendationsValue = formData.recommendations.toString().trim();

            if (recommendationsValue.length > 1000) {
                newErrors.recommendations = 'Đề nghị của bác sĩ không được vượt quá 1000 ký tự.';
            } else if (!/^[a-zA-ZÀ-ỹ0-9\s\-\.\,\(\)\[\]\:\;\!\?\+\=\/\%\&]+$/.test(recommendationsValue)) {
                newErrors.recommendations = 'Đề nghị của bác sĩ chứa ký tự không hợp lệ.';
            }
        }

        setValidationErrors(newErrors);
        return Object.keys(newErrors).length === 0;
    };

    const handleChange = (e) => {
        const { name, value } = e.target;
        setFormData(prev => ({ ...prev, [name]: value }));
        if (setCheckupData) {
            setCheckupData(prev => ({ ...prev, [name]: value }));
        }

        // Clear validation error for this field when user starts typing
        if (validationErrors[name]) {
            setValidationErrors(prev => {
                const newErrors = { ...prev };
                delete newErrors[name];
                return newErrors;
            });
        }
    };

    const handleSubmit = (e) => {
        e.preventDefault();

        // Validate form before submitting
        if (!validateForm()) {
            const errorCount = Object.keys(validationErrors).length;

            Swal.fire({
                icon: 'error',
                title: 'Dữ liệu không hợp lệ!',
                html: `
                    <div style="text-align: left;">
                        <p><strong>Có ${errorCount} lỗi cần sửa:</strong></p>
                        <ul style="margin: 10px 0; padding-left: 20px;">
                            ${Object.entries(validationErrors).map(([, message]) => `<li>${message}</li>`).join('')}
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

        onSubmit(formData);
    };

    // Calculate BMI when height or weight changes
    useEffect(() => {
        if (formData.height > 0 && formData.weight > 0) {
            const heightInMeters = formData.height / 100;
            const bmi = (formData.weight / (heightInMeters * heightInMeters)).toFixed(2);
            setFormData(prev => ({ ...prev, bmi }));
            if (setCheckupData) {
                setCheckupData(prev => ({ ...prev, bmi }));
            }
        }
    }, [formData.height, formData.weight, setCheckupData]);

    return (
        <Modal 
            show={show} 
            onHide={onHide} 
            size="xl" 
            dialogClassName="schedule-edit-checkup-modal"
            aria-labelledby="edit-checkup-modal"
            centered
        >
            <Modal.Header closeButton className="schedule-edit-modal-header">
                <Modal.Title id="edit-checkup-modal" className="schedule-edit-modal-title">
                    Chỉnh sửa Hồ sơ khám: {formData.studentName}
                </Modal.Title>
            </Modal.Header>
            <Form noValidate validated={validated} onSubmit={handleSubmit}>
                <Modal.Body className="schedule-edit-modal-body">
                    {/* General Info Section */}
                    <div className="schedule-form-section">
                        <h5>Thông tin chung (Không thể thay đổi)</h5>
                        <Row>
                            <Col md={4}>
                                <Form.Group>
                                    <Form.Label>Mã học sinh</Form.Label>
                                    <Form.Control type="text" value={formData.studentId || ''} readOnly disabled />
                                </Form.Group>
                            </Col>
                            <Col md={4}>
                                <Form.Group>
                                    <Form.Label>Học sinh</Form.Label>
                                    <Form.Control type="text" value={formData.studentName || ''} readOnly disabled />
                                </Form.Group>
                            </Col>
                            <Col md={4}>
                                <Form.Group>
                                    <Form.Label>Lớp</Form.Label>
                                    <Form.Control type="text" value={formData.studentClass || ''} readOnly disabled />
                                </Form.Group>
                            </Col>
                        </Row>
                    </div>

                    {/* Checkup Info Section */}
                    <div className="schedule-form-section">
                        <h5>Thông tin khám</h5>
                        <Row>
                            <Col md={4}>
                                <Form.Group controlId="checkupDate">
                                    <Form.Label>Ngày khám</Form.Label>
                                    <Form.Control
                                        type="date"
                                        name="checkupDate"
                                        value={formData.checkupDate || ''}
                                        onChange={handleChange}
                                        isInvalid={!!(validationErrors.checkupDate || errors?.checkupDate)}
                                        required
                                    />
                                    <Form.Control.Feedback type="invalid">{validationErrors.checkupDate || errors?.checkupDate}</Form.Control.Feedback>
                                </Form.Group>
                            </Col>
                            <Col md={4}>
                                <Form.Group controlId="checkupType">
                                    <Form.Label>Loại hình khám</Form.Label>
                                    <Form.Control
                                        type="text"
                                        name="checkupType"
                                        value={formData.checkupType || ''}
                                        onChange={handleChange}
                                        placeholder="VD: Khám định kỳ"
                                        isInvalid={!!(validationErrors.checkupType || errors?.checkupType)}
                                        required
                                    />
                                    <Form.Control.Feedback type="invalid">{validationErrors.checkupType || errors?.checkupType}</Form.Control.Feedback>
                                </Form.Group>
                            </Col>
                            <Col md={4}>
                                <Form.Group controlId="checkupStatus">
                                    <Form.Label>Trạng thái khám</Form.Label>
                                    <Form.Select
                                        name="checkupStatus"
                                        value={formData.checkupStatus || ''}
                                        onChange={handleChange}
                                        isInvalid={!!(validationErrors.checkupStatus || errors?.checkupStatus)}
                                        required
                                    >
                                        <option value="">Chọn trạng thái</option>
                                        <option value="COMPLETED">Đã hoàn thành</option>
                                        <option value="NEED_FOLLOW_UP">Cần theo dõi</option>
                                        <option value="CANCELLED">Đã hủy</option>
                                    </Form.Select>
                                    <Form.Control.Feedback type="invalid">{validationErrors.checkupStatus || errors?.checkupStatus}</Form.Control.Feedback>
                                </Form.Group>
                            </Col>
                        </Row>
                    </div>

                    {/* Physical Measurements Section */}
                    <div className="schedule-form-section">
                        <h5>Các chỉ số sức khỏe</h5>
                        {/* Hàng 1: Chiều cao, Cân nặng, BMI */}
                        <Row className="mb-3">
                            <Col md={4}>
                                <Form.Group controlId="height">
                                    <Form.Label>Chiều cao (cm)</Form.Label>
                                    <Form.Control
                                        type="number"
                                        step="0.1"
                                        name="height"
                                        placeholder="VD: 165"
                                        value={formData.height || ''}
                                        onChange={handleChange}
                                        isInvalid={!!(validationErrors.height || errors?.height)}
                                        required
                                    />
                                    <Form.Control.Feedback type="invalid">{validationErrors.height || errors?.height}</Form.Control.Feedback>
                                </Form.Group>
                            </Col>
                            <Col md={4}>
                                <Form.Group controlId="weight">
                                    <Form.Label>Cân nặng (kg)</Form.Label>
                                    <Form.Control
                                        type="number"
                                        step="0.1"
                                        name="weight"
                                        placeholder="VD: 55"
                                        value={formData.weight || ''}
                                        onChange={handleChange}
                                        isInvalid={!!(validationErrors.weight || errors?.weight)}
                                        required
                                    />
                                    <Form.Control.Feedback type="invalid">{validationErrors.weight || errors?.weight}</Form.Control.Feedback>
                                </Form.Group>
                            </Col>
                            <Col md={4}>
                                <Form.Group controlId="bmi">
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
                                <Form.Group controlId="bloodPressure">
                                    <Form.Label>Huyết áp</Form.Label>
                                    <Form.Control
                                        type="text"
                                        name="bloodPressure"
                                        placeholder="VD: 120/80"
                                        value={formData.bloodPressure || ''}
                                        onChange={handleChange}
                                        isInvalid={!!(validationErrors.bloodPressure || errors?.bloodPressure)}
                                        required
                                    />
                                    <Form.Control.Feedback type="invalid">{validationErrors.bloodPressure || errors?.bloodPressure}</Form.Control.Feedback>
                                </Form.Group>
                            </Col>
                            <Col md={4}>
                                <Form.Group controlId="visionLeft">
                                    <Form.Label>Thị lực (Trái)</Form.Label>
                                    <Form.Control
                                        type="text"
                                        name="visionLeft"
                                        placeholder="VD: 12/20, 20/20"
                                        value={formData.visionLeft || ''}
                                        onChange={handleChange}
                                        isInvalid={!!(validationErrors.visionLeft || errors?.visionLeft)}
                                        required
                                    />
                                    <Form.Control.Feedback type="invalid">{validationErrors.visionLeft || errors?.visionLeft}</Form.Control.Feedback>
                                </Form.Group>
                            </Col>
                            <Col md={4}>
                                <Form.Group controlId="visionRight">
                                    <Form.Label>Thị lực (Phải)</Form.Label>
                                    <Form.Control
                                        type="text"
                                        name="visionRight"
                                        placeholder="VD: 12/20, 20/20"
                                        value={formData.visionRight || ''}
                                        onChange={handleChange}
                                        isInvalid={!!(validationErrors.visionRight || errors?.visionRight)}
                                        required
                                    />
                                    <Form.Control.Feedback type="invalid">{validationErrors.visionRight || errors?.visionRight}</Form.Control.Feedback>
                                </Form.Group>
                            </Col>
                        </Row>

                        {/* Hàng 3: Thính lực, Nhịp tim, Nhiệt độ */}
                        <Row className="mb-3">
                            <Col md={4}>
                                <Form.Group controlId="hearingStatus">
                                    <Form.Label>Thính lực</Form.Label>
                                    <Form.Control
                                        type="text"
                                        name="hearingStatus"
                                        placeholder="VD: Bình thường"
                                        value={formData.hearingStatus || ''}
                                        onChange={handleChange}
                                        isInvalid={!!(validationErrors.hearingStatus || errors?.hearingStatus)}
                                        required
                                    />
                                    <Form.Control.Feedback type="invalid">{validationErrors.hearingStatus || errors?.hearingStatus}</Form.Control.Feedback>
                                </Form.Group>
                            </Col>
                            <Col md={4}>
                                <Form.Group controlId="heartRate">
                                    <Form.Label>Nhịp tim (bpm)</Form.Label>
                                    <Form.Control
                                        type="number"
                                        name="heartRate"
                                        placeholder="VD: 80"
                                        value={formData.heartRate || ''}
                                        onChange={handleChange}
                                        isInvalid={!!(validationErrors.heartRate || errors?.heartRate)}
                                        required
                                    />
                                    <Form.Control.Feedback type="invalid">{validationErrors.heartRate || errors?.heartRate}</Form.Control.Feedback>
                                </Form.Group>
                            </Col>
                            <Col md={4}>
                                <Form.Group controlId="bodyTemperature">
                                    <Form.Label>Nhiệt độ (°C)</Form.Label>
                                    <Form.Control
                                        type="number"
                                        step="0.1"
                                        name="bodyTemperature"
                                        placeholder="VD: 36.5"
                                        value={formData.bodyTemperature || ''}
                                        onChange={handleChange}
                                        isInvalid={!!(validationErrors.bodyTemperature || errors?.bodyTemperature)}
                                        required
                                    />
                                    <Form.Control.Feedback type="invalid">{validationErrors.bodyTemperature || errors?.bodyTemperature}</Form.Control.Feedback>
                                </Form.Group>
                            </Col>
                        </Row>
                    </div>

                    {/* Diagnosis and Notes Section */}
                    <div className="schedule-form-section">
                        <h5>Chẩn đoán và Đề nghị</h5>
                         <Row>
                            <Col md={12}>
                                <Form.Group controlId="diagnosis">
                            <Form.Label>Chẩn đoán</Form.Label>
                            <Form.Control
                                as="textarea"
                                rows={3}
                                name="diagnosis"
                                value={formData.diagnosis || ''}
                                onChange={handleChange}
                                isInvalid={!!(validationErrors.diagnosis || errors?.diagnosis)}
                                placeholder="Nhập chẩn đoán sức khỏe của học sinh..."
                                required
                            />
                            <Form.Control.Feedback type="invalid">{validationErrors.diagnosis || errors?.diagnosis}</Form.Control.Feedback>
                                </Form.Group>
                            </Col>
                        </Row>
                        <Row>
                            <Col md={12}>
                                <Form.Group controlId="recommendations">
                                    <Form.Label>Đề nghị của bác sĩ</Form.Label>
                                    <Form.Control
                                        as="textarea"
                                        rows={3}
                                        name="recommendations"
                                        value={formData.recommendations || ''}
                                        onChange={handleChange}
                                        isInvalid={!!(validationErrors.recommendations || errors?.recommendations)}
                                        placeholder="Nhập các đề nghị, khuyến cáo của bác sĩ..."
                                    />
                                    <Form.Control.Feedback type="invalid">{validationErrors.recommendations || errors?.recommendations}</Form.Control.Feedback>
                                </Form.Group>
                            </Col>
                        </Row>
                    </div>
                </Modal.Body>
                <Modal.Footer className="schedule-edit-modal-footer">
                    <Button
                        variant="secondary"
                        onClick={onHide}
                        disabled={loading}
                    >
                        <i className="fas fa-times me-1"></i>
                        Hủy
                    </Button>
                    <Button
                        variant="primary"
                        type="submit"
                        className="schedule-save-btn"
                        disabled={loading}
                    >
                        {loading ? (
                            <>
                                <span className="spinner-border spinner-border-sm me-2" role="status" aria-hidden="true"></span>
                                Đang lưu...
                            </>
                        ) : (
                            <>
                                <i className="fas fa-save me-1"></i>
                                Lưu thay đổi
                            </>
                        )}
                    </Button>
                </Modal.Footer>
            </Form>
        </Modal>
    );
};

export default ScheduleEditModal;
