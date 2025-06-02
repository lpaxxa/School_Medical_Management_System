import React, { useState } from "react";

const ReportExport = ({ report }) => {
  const [exportFormat, setExportFormat] = useState("pdf");
  const [isExporting, setIsExporting] = useState(false);

  const handleExport = () => {
    setIsExporting(true);

    // Simulate export process
    setTimeout(() => {
      setIsExporting(false);

      // In a real app, this would trigger the actual download
      alert(
        `Báo cáo được xuất dưới dạng ${exportFormat.toUpperCase()} thành công.`
      );
    }, 1500);
  };

  return (
    <div className="report-export">
      <h4>Xuất báo cáo</h4>

      <div className="export-options">
        <div className="export-format-options">
          <label className="radio-option">
            <input
              type="radio"
              name="exportFormat"
              value="pdf"
              checked={exportFormat === "pdf"}
              onChange={() => setExportFormat("pdf")}
            />
            <i className="fas fa-file-pdf"></i>
            <span>PDF</span>
          </label>

          <label className="radio-option">
            <input
              type="radio"
              name="exportFormat"
              value="excel"
              checked={exportFormat === "excel"}
              onChange={() => setExportFormat("excel")}
            />
            <i className="fas fa-file-excel"></i>
            <span>Excel</span>
          </label>

          <label className="radio-option">
            <input
              type="radio"
              name="exportFormat"
              value="csv"
              checked={exportFormat === "csv"}
              onChange={() => setExportFormat("csv")}
            />
            <i className="fas fa-file-csv"></i>
            <span>CSV</span>
          </label>
        </div>

        <button
          className="export-button"
          onClick={handleExport}
          disabled={isExporting}
        >
          {isExporting ? (
            <>
              <i className="fas fa-spinner fa-spin"></i> Đang xuất...
            </>
          ) : (
            <>
              <i className={`fas fa-file-${exportFormat}`}></i> Xuất báo cáo
            </>
          )}
        </button>
      </div>
    </div>
  );
};

export default ReportExport;
