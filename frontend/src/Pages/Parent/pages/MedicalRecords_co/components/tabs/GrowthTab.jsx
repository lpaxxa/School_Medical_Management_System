import React, { useState, useEffect, useCallback, useRef } from "react";
import {
  FaInfoCircle,
  FaChartLine,
  FaRulerVertical,
  FaWeight,
  FaCalendarAlt,
  FaSync,
} from "react-icons/fa";
import medicalService from "../../../../../../services/medicalService";
import { formatDate } from "../../utils/formatters";

const GrowthTab = ({ studentId }) => {
  const [checkupsData, setCheckupsData] = useState([]);
  const [isLoading, setIsLoading] = useState(true);
  const [isRefreshing, setIsRefreshing] = useState(false);
  const [error, setError] = useState(null);
  const [activeChart, setActiveChart] = useState("both"); // 'height', 'weight', 'both'
  const [lastUpdated, setLastUpdated] = useState(null);

  // Ref để quản lý interval
  const refreshIntervalRef = useRef(null);
  const componentMountedRef = useRef(true);

  // Hàm fetch dữ liệu có thể tái sử dụng
  const fetchCheckupsData = useCallback(
    async (isRefresh = false) => {
      if (!studentId || !componentMountedRef.current) return;

      if (isRefresh) {
        setIsRefreshing(true);
      } else {
        setIsLoading(true);
      }
      setError(null);

      try {
        console.log(
          "Fetching checkups data for growth chart:",
          studentId,
          isRefresh ? "(refresh)" : "(initial)"
        );
        const response = await medicalService.getMedicalCheckups(studentId);

        // API trả về array trực tiếp
        const checkupsArray = Array.isArray(response)
          ? response
          : response.data || [];

        console.log("Raw checkups data:", checkupsArray);

        // Lọc và sắp xếp dữ liệu theo thời gian, chỉ lấy những record có height và weight
        const validCheckups = checkupsArray
          .filter((checkup) => {
            const hasRequiredData =
              checkup.height && checkup.weight && checkup.checkupDate;
            console.log("Checkup validation:", {
              id: checkup.id,
              height: checkup.height,
              weight: checkup.weight,
              checkupDate: checkup.checkupDate,
              hasRequiredData,
            });
            return hasRequiredData;
          })
          .map((checkup) => {
            // Đảm bảo checkupDate được parse đúng
            const parsedDate = new Date(checkup.checkupDate);
            console.log("Date parsing:", {
              original: checkup.checkupDate,
              parsed: parsedDate,
              isValid: !isNaN(parsedDate.getTime()),
            });

            return {
              ...checkup,
              checkupDate: parsedDate.toISOString(), // Chuẩn hóa format
              height: parseFloat(checkup.height),
              weight: parseFloat(checkup.weight),
            };
          })
          .sort((a, b) => {
            const dateA = new Date(a.checkupDate);
            const dateB = new Date(b.checkupDate);
            return dateA.getTime() - dateB.getTime(); // Sắp xếp từ cũ đến mới
          });

        console.log(
          "Processed and sorted checkups:",
          validCheckups.map((c) => ({
            id: c.id,
            checkupDate: c.checkupDate,
            height: c.height,
            weight: c.weight,
            parsedDate: new Date(c.checkupDate).toLocaleDateString("vi-VN"),
          }))
        );

        if (componentMountedRef.current) {
          setCheckupsData(validCheckups);
          setLastUpdated(new Date());
        }
      } catch (err) {
        console.error("Error fetching checkups for growth chart:", err);
        if (componentMountedRef.current) {
          setError("Không thể tải dữ liệu tăng trưởng. Vui lòng thử lại sau.");
        }
      } finally {
        if (componentMountedRef.current) {
          if (isRefresh) {
            setIsRefreshing(false);
          } else {
            setIsLoading(false);
          }
        }
      }
    },
    [studentId]
  );

  // Hàm refresh thủ công
  const handleManualRefresh = useCallback(() => {
    fetchCheckupsData(true);
  }, [fetchCheckupsData]);

  // Effect để load dữ liệu ban đầu và setup auto-refresh
  useEffect(() => {
    componentMountedRef.current = true;

    // Load dữ liệu ban đầu
    fetchCheckupsData(false);

    // Setup auto-refresh mỗi 30 giây
    refreshIntervalRef.current = setInterval(() => {
      fetchCheckupsData(true);
    }, 30000);

    // Cleanup khi component unmount
    return () => {
      componentMountedRef.current = false;
      if (refreshIntervalRef.current) {
        clearInterval(refreshIntervalRef.current);
      }
    };
  }, [fetchCheckupsData]);

  // Tính toán min/max cho scaling biểu đồ
  const getChartBounds = (data, field) => {
    if (!data.length) return { min: 0, max: 100 };

    const values = data
      .map((item) => {
        const value = parseFloat(item[field]);
        console.log(`${field} value:`, item[field], "->", value);
        return value;
      })
      .filter((val) => !isNaN(val) && val > 0);

    if (values.length === 0) return { min: 0, max: 100 };

    const min = Math.min(...values);
    const max = Math.max(...values);
    const padding = (max - min) * 0.1; // 10% padding

    const bounds = {
      min: Math.max(0, min - padding),
      max: max + padding,
    };

    console.log(`Chart bounds for ${field}:`, { min, max, bounds, values });
    return bounds;
  };

  // Tạo path cho SVG line chart
  const createPath = (data, field, bounds, chartWidth, chartHeight) => {
    if (!data.length) return "";

    console.log(`Creating path for ${field}:`, {
      dataLength: data.length,
      bounds,
      chartWidth,
      chartHeight,
    });

    const points = data
      .map((item, index) => {
        const x =
          data.length === 1
            ? chartWidth / 2
            : (index / (data.length - 1)) * chartWidth;
        const value = parseFloat(item[field]);
        const y =
          chartHeight -
          ((value - bounds.min) / (bounds.max - bounds.min)) * chartHeight;

        console.log(`Point ${index} for ${field}:`, {
          date: formatDate(item.checkupDate),
          value,
          x,
          y,
        });

        return `${x},${y}`;
      })
      .join(" ");

    return `M${points.replace(/ /g, " L")}`;
  };

  // Tạo points cho dots
  const createDots = (data, field, bounds, chartWidth, chartHeight) => {
    if (!data.length) return [];

    return data.map((item, index) => {
      const x =
        data.length === 1
          ? chartWidth / 2
          : (index / (data.length - 1)) * chartWidth;
      const value = parseFloat(item[field]);
      const y =
        chartHeight -
        ((value - bounds.min) / (bounds.max - bounds.min)) * chartHeight;
      return {
        x,
        y,
        value,
        date: item.checkupDate,
        formattedDate: formatDate(item.checkupDate),
      };
    });
  };

  if (error) {
    return (
      <div className="growth-panel">
        <div className="error-message">
          <FaInfoCircle /> {error}
        </div>
      </div>
    );
  }

  if (isLoading) {
    return (
      <div className="growth-panel">
        <div className="data-loading">
          <div className="loading-spinner small"></div>
          <p>Đang tải dữ liệu tăng trưởng...</p>
        </div>
      </div>
    );
  }

  if (checkupsData.length === 0) {
    return (
      <div className="growth-panel">
        <h3>Biểu đồ tăng trưởng</h3>
        <div className="no-data-message">
          <FaInfoCircle />
          <h4>Chưa có dữ liệu tăng trưởng</h4>
          <p>
            Học sinh chưa có đủ dữ liệu kiểm tra sức khỏe để hiển thị biểu đồ
            tăng trưởng.
          </p>
          <p>
            Cần ít nhất 1 lần kiểm tra sức khỏe có đầy đủ thông tin chiều cao và
            cân nặng.
          </p>
        </div>
      </div>
    );
  }

  const chartWidth = 800;
  const chartHeight = 300;
  const heightBounds = getChartBounds(checkupsData, "height");
  const weightBounds = getChartBounds(checkupsData, "weight");

  // Debug: Log final data being used for chart
  console.log("Final chart data:", {
    checkupsCount: checkupsData.length,
    checkups: checkupsData.map((c) => ({
      date: formatDate(c.checkupDate),
      height: c.height,
      weight: c.weight,
    })),
    heightBounds,
    weightBounds,
  });

  return (
    <div className="growth-panel">
      <div className="growth-header">
        <div className="growth-title-section">
          <h3>Biểu đồ tăng trưởng</h3>
          {lastUpdated && (
            <div className="last-updated">
              Cập nhật: {lastUpdated.toLocaleTimeString("vi-VN")}
            </div>
          )}
        </div>
        <div className="growth-controls">
          <button
            className="refresh-btn"
            onClick={handleManualRefresh}
            disabled={isRefreshing}
            title="Làm mới dữ liệu"
          >
            <FaSync className={isRefreshing ? "rotating" : ""} />
            {isRefreshing ? "Đang tải..." : "Làm mới"}
          </button>
          <div className="chart-controls">
            <button
              className={`chart-control-btn ${
                activeChart === "both" ? "active" : ""
              }`}
              onClick={() => setActiveChart("both")}
            >
              <FaChartLine /> Cả hai
            </button>
            <button
              className={`chart-control-btn ${
                activeChart === "height" ? "active" : ""
              }`}
              onClick={() => setActiveChart("height")}
            >
              <FaRulerVertical /> Chiều cao
            </button>
            <button
              className={`chart-control-btn ${
                activeChart === "weight" ? "active" : ""
              }`}
              onClick={() => setActiveChart("weight")}
            >
              <FaWeight /> Cân nặng
            </button>
          </div>
        </div>
      </div>

      {/* Debug info - có thể bỏ sau khi test xong */}
      <div
        style={{
          fontSize: "12px",
          color: "#666",
          marginBottom: "16px",
          padding: "8px",
          background: "#f8f9fa",
          borderRadius: "4px",
          border: "1px solid #e9ecef",
        }}
      >
        <strong>Dữ liệu biểu đồ ({checkupsData.length} lần khám):</strong>
        {checkupsData.map((checkup, index) => (
          <div key={index} style={{ marginLeft: "8px" }}>
            • {formatDate(checkup.checkupDate)}: Cao {checkup.height}cm, Nặng{" "}
            {checkup.weight}kg
          </div>
        ))}
      </div>

      <div className="growth-chart-container">
        <svg
          className="growth-chart-svg"
          viewBox={`0 0 ${chartWidth + 120} ${chartHeight + 100}`}
          preserveAspectRatio="xMidYMid meet"
        >
          {/* Background grid */}
          <defs>
            <pattern
              id="grid"
              width="40"
              height="30"
              patternUnits="userSpaceOnUse"
            >
              <path
                d="M 40 0 L 0 0 0 30"
                fill="none"
                stroke="#f1f5f9"
                strokeWidth="1"
              />
            </pattern>
          </defs>
          <rect
            width={chartWidth}
            height={chartHeight}
            fill="url(#grid)"
            transform="translate(60, 20)"
          />

          {/* Chart area background */}
          <rect
            x="60"
            y="20"
            width={chartWidth}
            height={chartHeight}
            fill="#fafbfc"
            stroke="#e2e8f0"
            strokeWidth="1"
            rx="8"
          />

          {/* Y-axis labels for height */}
          {(activeChart === "height" || activeChart === "both") && (
            <g className="y-axis-height">
              {[0, 0.25, 0.5, 0.75, 1].map((ratio, index) => {
                const y = 20 + chartHeight - ratio * chartHeight;
                const value = (
                  heightBounds.min +
                  (heightBounds.max - heightBounds.min) * ratio
                ).toFixed(1);
                return (
                  <g key={`height-y-${index}`}>
                    <line
                      x1="55"
                      y1={y}
                      x2="60"
                      y2={y}
                      stroke="#6366f1"
                      strokeWidth="1"
                    />
                    <text
                      x="50"
                      y={y + 4}
                      textAnchor="end"
                      fontSize="12"
                      fill="#6366f1"
                      fontWeight="500"
                    >
                      {value}cm
                    </text>
                  </g>
                );
              })}
            </g>
          )}

          {/* Y-axis labels for weight */}
          {(activeChart === "weight" || activeChart === "both") && (
            <g className="y-axis-weight">
              {[0, 0.25, 0.5, 0.75, 1].map((ratio, index) => {
                const y = 20 + chartHeight - ratio * chartHeight;
                const value = (
                  weightBounds.min +
                  (weightBounds.max - weightBounds.min) * ratio
                ).toFixed(1);
                return (
                  <g key={`weight-y-${index}`}>
                    <line
                      x1={chartWidth + 60}
                      y1={y}
                      x2={chartWidth + 65}
                      y2={y}
                      stroke="#dc2626"
                      strokeWidth="1"
                    />
                    <text
                      x={chartWidth + 70}
                      y={y + 4}
                      textAnchor="start"
                      fontSize="12"
                      fill="#dc2626"
                      fontWeight="500"
                    >
                      {value}kg
                    </text>
                  </g>
                );
              })}
            </g>
          )}

          {/* X-axis labels */}
          <g className="x-axis">
            {checkupsData.map((item, index) => {
              const x =
                checkupsData.length === 1
                  ? 60 + chartWidth / 2
                  : 60 + (index / (checkupsData.length - 1)) * chartWidth;
              return (
                <g key={`x-${index}`}>
                  <line
                    x1={x}
                    y1={chartHeight + 20}
                    x2={x}
                    y2={chartHeight + 25}
                    stroke="#64748b"
                    strokeWidth="1"
                  />
                  <text
                    x={x}
                    y={chartHeight + 40}
                    textAnchor="middle"
                    fontSize="11"
                    fill="#64748b"
                  >
                    {formatDate(item.checkupDate)}
                  </text>
                </g>
              );
            })}
          </g>

          {/* Height line chart */}
          {(activeChart === "height" || activeChart === "both") && (
            <g className="height-chart" transform="translate(60, 20)">
              {/* Gradient for height line */}
              <defs>
                <linearGradient
                  id="heightGradient"
                  x1="0%"
                  y1="0%"
                  x2="0%"
                  y2="100%"
                >
                  <stop offset="0%" stopColor="#6366f1" stopOpacity="0.3" />
                  <stop offset="100%" stopColor="#6366f1" stopOpacity="0.05" />
                </linearGradient>
              </defs>

              {/* Fill area under height line */}
              <path
                d={`${createPath(
                  checkupsData,
                  "height",
                  heightBounds,
                  chartWidth,
                  chartHeight
                )} L${chartWidth},${chartHeight} L0,${chartHeight} Z`}
                fill="url(#heightGradient)"
              />

              {/* Height line */}
              <path
                d={createPath(
                  checkupsData,
                  "height",
                  heightBounds,
                  chartWidth,
                  chartHeight
                )}
                fill="none"
                stroke="#6366f1"
                strokeWidth="3"
                strokeLinecap="round"
                strokeLinejoin="round"
              />

              {/* Height dots */}
              {createDots(
                checkupsData,
                "height",
                heightBounds,
                chartWidth,
                chartHeight
              ).map((dot, index) => (
                <circle
                  key={`height-dot-${index}`}
                  cx={dot.x}
                  cy={dot.y}
                  r="5"
                  fill="#6366f1"
                  stroke="#ffffff"
                  strokeWidth="2"
                  className="chart-dot"
                >
                  <title>{`${dot.formattedDate}: ${dot.value}cm`}</title>
                </circle>
              ))}
            </g>
          )}

          {/* Weight line chart */}
          {(activeChart === "weight" || activeChart === "both") && (
            <g className="weight-chart" transform="translate(60, 20)">
              {/* Gradient for weight line */}
              <defs>
                <linearGradient
                  id="weightGradient"
                  x1="0%"
                  y1="0%"
                  x2="0%"
                  y2="100%"
                >
                  <stop offset="0%" stopColor="#dc2626" stopOpacity="0.3" />
                  <stop offset="100%" stopColor="#dc2626" stopOpacity="0.05" />
                </linearGradient>
              </defs>

              {/* Fill area under weight line */}
              {activeChart === "weight" && (
                <path
                  d={`${createPath(
                    checkupsData,
                    "weight",
                    weightBounds,
                    chartWidth,
                    chartHeight
                  )} L${chartWidth},${chartHeight} L0,${chartHeight} Z`}
                  fill="url(#weightGradient)"
                />
              )}

              {/* Weight line */}
              <path
                d={createPath(
                  checkupsData,
                  "weight",
                  weightBounds,
                  chartWidth,
                  chartHeight
                )}
                fill="none"
                stroke="#dc2626"
                strokeWidth="3"
                strokeLinecap="round"
                strokeLinejoin="round"
                strokeDasharray={activeChart === "both" ? "5,5" : "none"}
              />

              {/* Weight dots */}
              {createDots(
                checkupsData,
                "weight",
                weightBounds,
                chartWidth,
                chartHeight
              ).map((dot, index) => (
                <circle
                  key={`weight-dot-${index}`}
                  cx={dot.x}
                  cy={dot.y}
                  r="5"
                  fill="#dc2626"
                  stroke="#ffffff"
                  strokeWidth="2"
                  className="chart-dot"
                >
                  <title>{`${dot.formattedDate}: ${dot.value}kg`}</title>
                </circle>
              ))}
            </g>
          )}

          {/* Chart legend */}
          <g
            className="chart-legend"
            transform={`translate(60, ${chartHeight + 60})`}
          >
            {(activeChart === "height" || activeChart === "both") && (
              <g>
                <line
                  x1="0"
                  y1="15"
                  x2="20"
                  y2="15"
                  stroke="#6366f1"
                  strokeWidth="3"
                />
                <circle
                  cx="10"
                  cy="15"
                  r="4"
                  fill="#6366f1"
                  stroke="#ffffff"
                  strokeWidth="2"
                />
                <text
                  x="30"
                  y="19"
                  fontSize="13"
                  fill="#374151"
                  fontWeight="500"
                >
                  Chiều cao (cm)
                </text>
              </g>
            )}
            {(activeChart === "weight" || activeChart === "both") && (
              <g
                transform={
                  activeChart === "both"
                    ? "translate(150, 0)"
                    : "translate(0, 0)"
                }
              >
                <line
                  x1="0"
                  y1="15"
                  x2="20"
                  y2="15"
                  stroke="#dc2626"
                  strokeWidth="3"
                  strokeDasharray={activeChart === "both" ? "5,5" : "none"}
                />
                <circle
                  cx="10"
                  cy="15"
                  r="4"
                  fill="#dc2626"
                  stroke="#ffffff"
                  strokeWidth="2"
                />
                <text
                  x="30"
                  y="19"
                  fontSize="13"
                  fill="#374151"
                  fontWeight="500"
                >
                  Cân nặng (kg)
                </text>
              </g>
            )}
          </g>
        </svg>
      </div>

      {/* Stats summary */}
      <div className="growth-stats">
        <div className="stats-row">
          <div className="stat-card">
            <div className="stat-icon height">
              <FaRulerVertical />
            </div>
            <div className="stat-content">
              <div className="stat-label">Chiều cao hiện tại</div>
              <div className="stat-value">
                {checkupsData[checkupsData.length - 1]?.height} cm
              </div>
              {checkupsData.length > 1 && (
                <div className="stat-change">
                  {(
                    parseFloat(checkupsData[checkupsData.length - 1]?.height) -
                    parseFloat(checkupsData[0]?.height)
                  ).toFixed(1)}{" "}
                  cm kể từ lần đầu
                </div>
              )}
            </div>
          </div>

          <div className="stat-card">
            <div className="stat-icon weight">
              <FaWeight />
            </div>
            <div className="stat-content">
              <div className="stat-label">Cân nặng hiện tại</div>
              <div className="stat-value">
                {checkupsData[checkupsData.length - 1]?.weight} kg
              </div>
              {checkupsData.length > 1 && (
                <div className="stat-change">
                  {(
                    parseFloat(checkupsData[checkupsData.length - 1]?.weight) -
                    parseFloat(checkupsData[0]?.weight)
                  ).toFixed(1)}{" "}
                  kg kể từ lần đầu
                </div>
              )}
            </div>
          </div>

          <div className="stat-card">
            <div className="stat-icon checkups">
              <FaCalendarAlt />
            </div>
            <div className="stat-content">
              <div className="stat-label">Số lần khám</div>
              <div className="stat-value">{checkupsData.length}</div>
              <div className="stat-change">
                Từ {formatDate(checkupsData[0]?.checkupDate)} đến{" "}
                {formatDate(checkupsData[checkupsData.length - 1]?.checkupDate)}
              </div>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
};

export default GrowthTab;
