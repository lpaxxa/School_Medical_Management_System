import React from "react";
import { FaChevronDown } from "react-icons/fa";

const StudentSelector = ({
  students,
  selectedStudentId,
  onStudentChange,
  isLoading,
}) => {
  if (!students || students.length === 0) {
    return null;
  }

  return (
    <div className="student-selector">
      <label htmlFor="studentSelector">Chọn học sinh:</label>
      <div className="select-wrapper">
        <select
          id="studentSelector"
          value={selectedStudentId || ""}
          onChange={onStudentChange}
          disabled={isLoading}
        >
          {students.map((student) => (
            <option key={student.id} value={student.id}>
              {student.fullName}{" "}
              {student.className ? `(${student.className})` : ""}
            </option>
          ))}
        </select>
        <FaChevronDown />
      </div>
    </div>
  );
};

export default StudentSelector;
