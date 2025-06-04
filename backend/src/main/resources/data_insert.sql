SELECT * FROM dbo.health_profiles;
SELECT * FROM dbo.medical_checkups;
SELECT * FROM dbo.medical_staff;
SELECT * FROM dbo.medication_instructions;
SELECT * FROM dbo.member;
SELECT * FROM dbo.parents;
SELECT * FROM dbo.students;
SELECT * FROM dbo.vaccinations;



-- Thứ tự insert:
-- 1. member (AccountMember)
-- 2. medical_staff
-- 3. parents
-- 4. health_profiles
-- 5. students
-- 6. medical_checkups
-- 7. medication_instructions
-- 8. vaccinations

-- 1. Insert dữ liệu vào bảng member (AccountMember)
INSERT INTO member (id, password, email, phone_number, role)
VALUES
    ('admin01', '12345', 'admin@gmail.com', '0903123456', 'ADMIN'),
    ('nurse01', '12345', 'nurse01@gmail.com', '0913222333', 'NURSE'),
    ('nurse02', '12345', 'nurse02@gmail.com', '0913222334', 'NURSE'),
    ('parent01', '12345', 'parent1@gmail.com', '0913222337', 'PARENT'),
    ('parent02', '12345', 'parent2@gmail.com', '0913222338', 'PARENT'),
    ('parent03', '12345', 'parent3@gmail.com', '0913222339', 'PARENT');

-- 2. Insert dữ liệu vào bảng medical_staff
INSERT INTO medical_staff (fullName, qualification, specialization, phone_number, email, account_id)
VALUES
    (N'Nguyễn Văn An', N'Bác sĩ đa khoa', N'Y học học đường', '0901234567', 'nva@gmail.com', 'nurse01'),
    (N'Trần Thị Bình', N'Y tá', N'Sơ cứu', '0912345678', 'ttb@gmail.com', 'nurse02');

-- 3. Insert dữ liệu vào bảng parents
INSERT INTO parents (fullName, phoneNumber, email, address, relationship_type, account_id)
VALUES
    (N'Phạm Văn Chính', '0923456789', 'pvc@gmail.com', N'Số 123 Đường Lê Lợi, Quận 1, TP.HCM', N'Cha', 'parent01'),
    (N'Lê Thị Dung', '0934567890', 'ltd@gmail.com', N'Số 456 Đường Nguyễn Huệ, Quận 1, TP.HCM', N'Mẹ', 'parent02'),
    (N'Hoàng Văn Em', '0945678901', 'hve@gmail.com', N'Số 789 Đường Trần Hưng Đạo, Quận 5, TP.HCM', N'Cha', 'parent03');

-- 4. Insert dữ liệu vào bảng health_profiles
INSERT INTO health_profiles (blood_type, height, weight, bmi, allergies, chronic_diseases, treatment_history, vision_left, vision_right, hearing_status)
VALUES
    ('A+', 130.5, 30.2, 17.7, N'Dị ứng với đậu phộng', N'Không có', N'Không có tiền sử bệnh tật nghiêm trọng', '20/20', '20/20', N'Bình thường'),
    ('O', 142.0, 35.5, 18.1, N'Dị ứng với hải sản', N'Hen suyễn', N'Đã điều trị hen suyễn từ năm 6 tuổi', '20/30', '20/30', N'Bình thường'),
    ('B+', 150.5, 42.0, 18.5, N'Không có', N'Không có', N'Không có', '20/20', '20/25', N'Bình thường'),
    ('AB', 138.0, 32.5, 17.3, N'Dị ứng với bụi', N'Viêm mũi dị ứng', N'Điều trị viêm mũi dị ứng định kỳ', '20/25', '20/25', N'Bình thường'),
    ('A-', 145.5, 38.0, 18.0, N'Dị ứng với phấn hoa', N'Không có', N'Không có', '20/20', '20/20', N'Bình thường');

-- 5. Insert dữ liệu vào bảng students
INSERT INTO students (fullName, date_of_birth, gender, student_id, class_name, grade_level, school_year, health_profile_id, parent_id)
VALUES
    (N'Phạm Văn Con', '2016-05-10', N'Nam', 'SV001', '1A', N'Lớp 1', '2023-2024', 1, 1),
    (N'Lê Thị Em', '2015-07-15', N'Nữ', 'SV002', '2B', N'Lớp 2', '2023-2024', 2, 2),
    (N'Phạm Thị Nhỏ', '2016-03-22', N'Nữ', 'SV003', '1A', N'Lớp 1', '2023-2024', 3, 1),
    (N'Hoàng Văn Út', '2015-11-30', N'Nam', 'SV004', '2B', N'Lớp 2', '2023-2024', 4, 3),
    (N'Lê Văn Bé', '2016-02-18', N'Nam', 'SV005', '1A', N'Lớp 1', '2023-2024', 5, 2);

-- 6. Insert dữ liệu vào bảng medical_checkups
INSERT INTO medical_checkups (student_id, checkup_date, checkup_type, height, weight, bmi, blood_pressure, vision_left, vision_right, hearing_status, heart_rate, body_temperature, diagnosis, recommendations, follow_up_needed, parent_notified, staff_id)
VALUES
    (1, '2023-09-15 09:30:00', N'Khám định kỳ', 130.5, 30.2, 17.7, '90/60', '20/20', '20/20', N'Bình thường', 85, 36.5, N'Sức khỏe bình thường', N'Duy trì chế độ ăn uống đầy đủ dinh dưỡng', 0, 1, 1),
    (2, '2023-09-15 10:15:00', N'Khám định kỳ', 142.0, 35.5, 18.1, '95/65', '20/30', '20/30', N'Bình thường', 90, 36.7, N'Có biểu hiện của viêm họng nhẹ', N'Uống nhiều nước, nghỉ ngơi đầy đủ', 1, 1, 1),
    (3, '2023-09-16 09:00:00', N'Khám định kỳ', 150.5, 42.0, 18.5, '100/70', '20/20', '20/25', N'Bình thường', 88, 36.6, N'Sức khỏe bình thường', N'Tăng cường vận động', 0, 1, 2),
    (4, '2023-09-16 10:30:00', N'Khám định kỳ', 138.0, 32.5, 17.3, '90/60', '20/25', '20/25', N'Bình thường', 92, 37.0, N'Có dấu hiệu viêm mũi dị ứng', N'Tránh tiếp xúc với bụi, uống thuốc theo đơn', 1, 1, 2),
    (1, '2023-12-10 09:15:00', N'Khám theo dõi', 132.0, 31.0, 17.8, '95/65', '20/20', '20/20', N'Bình thường', 86, 36.6, N'Sức khỏe cải thiện', N'Tiếp tục duy trì chế độ ăn uống lành mạnh', 0, 1, 1);

-- 7. Insert dữ liệu vào bảng medication_instructions
INSERT INTO medication_instructions (health_profile_id, medication_name, dosage_instructions, start_date, end_date, frequency_per_day, time_of_day, special_instructions, parent_provided, prescribed_by, created_date, status)
VALUES
    (2, N'Ventolin (Salbutamol)', N'Xịt 2 lần khi có triệu chứng khó thở', '2023-09-15', '2024-09-15', 2, N'["08:00", "20:00"]', N'Xịt khi có dấu hiệu khó thở, có thể dùng thêm khi cần thiết', 1, N'Bác sĩ Nguyễn Văn An', '2023-09-15', N'Đang hoạt động'),
    (4, N'Telfast (Fexofenadine)', N'1 viên/ngày', '2023-09-16', '2023-10-16', 1, N'["08:00"]', N'Uống sau khi ăn sáng', 1, N'Bác sĩ Trần Thị Bình', '2023-09-16', N'Đang hoạt động'),
    (2, N'Flixotide (Fluticasone)', N'Xịt 1 lần vào buổi sáng và tối', '2023-09-15', '2024-03-15', 2, N'["08:00", "20:00"]', N'Súc miệng sau khi sử dụng', 1, N'Bác sĩ Nguyễn Văn An', '2023-09-15', N'Đang hoạt động');

-- 8. Insert dữ liệu vào bảng vaccinations
INSERT INTO vaccinations (health_profile_id, vaccine_name, vaccination_date, next_dose_date, dose_number, administered_by, administered_at, notes, parent_consent)
VALUES
    (1, N'Vắc xin phòng cúm', '2023-10-15', '2024-10-15', 1, N'Bác sĩ Nguyễn Văn An', N'Trung tâm Y tế trường học', N'Tiêm không có phản ứng phụ', 1),
    (2, N'Vắc xin phòng cúm', '2023-10-15', '2024-10-15', 1, N'Bác sĩ Nguyễn Văn An', N'Trung tâm Y tế trường học', N'Có nhẹ sốt sau tiêm, đã hết sau 24 giờ', 1),
    (3, N'Vắc xin phòng cúm', '2023-10-16', '2024-10-16', 1, N'Bác sĩ Trần Thị Bình', N'Trung tâm Y tế trường học', N'Tiêm không có phản ứng phụ', 1),
    (4, N'Vắc xin phòng cúm', '2023-10-16', '2024-10-16', 1, N'Bác sĩ Trần Thị Bình', N'Trung tâm Y tế trường học', N'Tiêm không có phản ứng phụ', 1),
    (5, N'Vắc xin phòng cúm', '2023-10-16', '2024-10-16', 1, N'Bác sĩ Trần Thị Bình', N'Trung tâm Y tế trường học', N'Tiêm không có phản ứng phụ', 1);


