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

  // Tạo path cho SVG line chart (đường nối các điểm trên đỉnh cột)
  const createPath = (data, field, bounds, chartWidth, chartHeight) => {
    if (!data.length) return "";

    console.log(`Creating path for ${field}:`, {
      dataLength: data.length,
      bounds,
      chartWidth,
      chartHeight,
    });

    const groupWidth = chartWidth / data.length;
    const barWidth = Math.min(groupWidth * 0.35, 40);
    const barSpacing = 4;

    const points = data
      .map((item, index) => {
        const groupCenterX = index * groupWidth + groupWidth / 2;
        const value = parseFloat(item[field]);

        // Sử dụng cùng logic với createBars để đảm bảo đường nối đi qua đỉnh cột
        const valueRatio = (value - bounds.min) / (bounds.max - bounds.min);
        const barHeight = valueRatio * chartHeight * 0.8;
        const y = chartHeight - barHeight;

        // Tính x dựa trên loại cột (height = trái, weight = phải)
        const x =
          field === "height"
            ? groupCenterX - barWidth - barSpacing / 2 + barWidth / 2 // Center of height bar
            : groupCenterX + barSpacing / 2 + barWidth / 2; // Center of weight bar

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

  // Tạo points cho dots (trên đỉnh cột)
  const createDots = (data, field, bounds, chartWidth, chartHeight) => {
    if (!data.length) return [];

    const groupWidth = chartWidth / data.length;
    const barWidth = Math.min(groupWidth * 0.35, 40);
    const barSpacing = 4;

    return data.map((item, index) => {
      const groupCenterX = index * groupWidth + groupWidth / 2;
      const value = parseFloat(item[field]);

      // Sử dụng cùng logic với createBars
      const valueRatio = (value - bounds.min) / (bounds.max - bounds.min);
      const barHeight = valueRatio * chartHeight * 0.8;
      const y = chartHeight - barHeight;

      // Tính x dựa trên loại cột
      const x =
        field === "height"
          ? groupCenterX - barWidth - barSpacing / 2 + barWidth / 2 // Center of height bar
          : groupCenterX + barSpacing / 2 + barWidth / 2; // Center of weight bar

      return {
        x,
        y,
        value,
        date: item.checkupDate,
        formattedDate: formatDate(item.checkupDate),
      };
    });
  };

  // Tạo bars cho biểu đồ cột - 2 cột cho mỗi ngày (cùng scale trục Y)
  const createBars = (data, chartWidth, chartHeight) => {
    if (!data.length) return [];

    const groupWidth = chartWidth / data.length; // Không gian cho mỗi nhóm ngày
    const barWidth = Math.min(groupWidth * 0.35, 40); // Mỗi cột chiếm 35% không gian nhóm
    const barSpacing = 4; // Khoảng cách giữa 2 cột trong cùng nhóm

    // Tạo một scale chung cho cả chiều cao và cân nặng
    const allValues = [];
    data.forEach((item) => {
      allValues.push(parseFloat(item.height));
      allValues.push(parseFloat(item.weight));
    });

    const minValue = Math.min(...allValues);
    const maxValue = Math.max(...allValues);
    const padding = (maxValue - minValue) * 0.1;
    const commonBounds = {
      min: Math.max(0, minValue - padding),
      max: maxValue + padding,
    };

    const bars = [];

    data.forEach((item, index) => {
      const groupCenterX = index * groupWidth + groupWidth / 2;
      const heightValue = parseFloat(item.height);
      const weightValue = parseFloat(item.weight);

      // Tính chiều cao cột dựa trên scale chung
      const heightRatio =
        (heightValue - commonBounds.min) /
        (commonBounds.max - commonBounds.min);
      const weightRatio =
        (weightValue - commonBounds.min) /
        (commonBounds.max - commonBounds.min);

      const heightBarHeight = heightRatio * chartHeight * 0.8;
      const weightBarHeight = weightRatio * chartHeight * 0.8;

      // Cột chiều cao (bên trái)
      bars.push({
        type: "height",
        x: groupCenterX - barWidth - barSpacing / 2,
        y: chartHeight - heightBarHeight,
        width: barWidth,
        height: heightBarHeight,
        value: heightValue,
        unit: "cm",
        date: item.checkupDate,
        formattedDate: formatDate(item.checkupDate),
        index,
        color: "#6366f1",
        label: `${heightValue}cm`,
      });

      // Cột cân nặng (bên phải)
      bars.push({
        type: "weight",
        x: groupCenterX + barSpacing / 2,
        y: chartHeight - weightBarHeight,
        width: barWidth,
        height: weightBarHeight,
        value: weightValue,
        unit: "kg",
        date: item.checkupDate,
        formattedDate: formatDate(item.checkupDate),
        index,
        color: "#dc2626",
        label: `${weightValue}kg`,
      });
    });

    return { bars, commonBounds };
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
  const { bars, commonBounds } = createBars(
    checkupsData,
    chartWidth,
    chartHeight
  );

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

          {/* Y-axis labels - Left side (alternating height and weight values) */}
          <g className="y-axis-left">
            {[0, 0.25, 0.5, 0.75, 1].map((ratio, index) => {
              const y = 20 + chartHeight - ratio * chartHeight;
              const commonValue =
                commonBounds.min +
                (commonBounds.max - commonBounds.min) * ratio;

              // Xen kẽ giữa chiều cao và cân nặng
              const isHeightTurn = index % 2 === 0; // Chẵn = chiều cao, lẻ = cân nặng
              const value = commonValue.toFixed(1);
              const displayText = isHeightTurn ? `${value}cm` : `${value}kg`;
              const textColor = isHeightTurn ? "#6366f1" : "#dc2626";

              return (
                <g key={`left-y-${index}`}>
                  <line
                    x1="55"
                    y1={y}
                    x2="60"
                    y2={y}
                    stroke="#64748b"
                    strokeWidth="1"
                  />
                  <text
                    x="50"
                    y={y + 4}
                    textAnchor="end"
                    fontSize="12"
                    fill={textColor}
                    fontWeight="500"
                  >
                    {displayText}
                  </text>
                </g>
              );
            })}
          </g>

          {/* X-axis labels */}
          <g className="x-axis">
            {checkupsData.map((item, index) => {
              const groupWidth = chartWidth / checkupsData.length;
              const groupCenterX = 60 + index * groupWidth + groupWidth / 2;
              return (
                <g key={`x-${index}`}>
                  <line
                    x1={groupCenterX}
                    y1={chartHeight + 20}
                    x2={groupCenterX}
                    y2={chartHeight + 25}
                    stroke="#64748b"
                    strokeWidth="1"
                  />
                  <text
                    x={groupCenterX}
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

          {/* Bar Chart with Separate Height and Weight Bars */}
          <g className="bar-chart" transform="translate(60, 20)">
            {/* Gradient definitions */}
            <defs>
              <linearGradient
                id="heightBarGradient"
                x1="0%"
                y1="0%"
                x2="0%"
                y2="100%"
              >
                <stop offset="0%" stopColor="#8b5cf6" stopOpacity="0.9" />
                <stop offset="100%" stopColor="#6366f1" stopOpacity="0.8" />
              </linearGradient>
              <linearGradient
                id="weightBarGradient"
                x1="0%"
                y1="0%"
                x2="0%"
                y2="100%"
              >
                <stop offset="0%" stopColor="#f87171" stopOpacity="0.9" />
                <stop offset="100%" stopColor="#dc2626" stopOpacity="0.8" />
              </linearGradient>
            </defs>

            {/* Bars */}
            {bars.map((bar) => {
              // Chỉ hiển thị cột theo activeChart
              const shouldShow =
                activeChart === "both" ||
                (activeChart === "height" && bar.type === "height") ||
                (activeChart === "weight" && bar.type === "weight");

              if (!shouldShow) return null;

              return (
                <g key={`bar-${bar.type}-${bar.index}`}>
                  {/* Bar */}
                  <rect
                    x={bar.x}
                    y={bar.y}
                    width={bar.width}
                    height={bar.height}
                    fill={
                      bar.type === "height"
                        ? "url(#heightBarGradient)"
                        : "url(#weightBarGradient)"
                    }
                    stroke={bar.color}
                    strokeWidth="1"
                    rx="3"
                    className="chart-bar"
                  >
                    <title>{`${bar.formattedDate}: ${bar.label}`}</title>
                  </rect>

                  {/* Value label on top of bar */}
                  <text
                    x={bar.x + bar.width / 2}
                    y={bar.y - 3}
                    textAnchor="middle"
                    fontSize="10"
                    fill={bar.color}
                    fontWeight="600"
                  >
                    {bar.label}
                  </text>
                </g>
              );
            })}

            {/* Height line connecting the tops */}
            {(activeChart === "height" || activeChart === "both") && (
              <path
                d={createPath(
                  checkupsData,
                  "height",
                  commonBounds,
                  chartWidth,
                  chartHeight
                )}
                fill="none"
                stroke="#6366f1"
                strokeWidth="2"
                strokeLinecap="round"
                strokeLinejoin="round"
                opacity="0.8"
              />
            )}

            {/* Weight line connecting the tops */}
            {(activeChart === "weight" || activeChart === "both") && (
              <path
                d={createPath(
                  checkupsData,
                  "weight",
                  commonBounds,
                  chartWidth,
                  chartHeight
                )}
                fill="none"
                stroke="#dc2626"
                strokeWidth="2"
                strokeLinecap="round"
                strokeLinejoin="round"
                strokeDasharray={activeChart === "both" ? "5,5" : "none"}
                opacity="0.8"
              />
            )}

            {/* Height dots */}
            {(activeChart === "height" || activeChart === "both") &&
              createDots(
                checkupsData,
                "height",
                commonBounds,
                chartWidth,
                chartHeight
              ).map((dot, index) => (
                <circle
                  key={`height-dot-${index}`}
                  cx={dot.x}
                  cy={dot.y}
                  r="4"
                  fill="#6366f1"
                  stroke="#ffffff"
                  strokeWidth="2"
                  className="chart-dot"
                >
                  <title>{`${dot.formattedDate}: ${dot.value}cm`}</title>
                </circle>
              ))}

            {/* Weight dots */}
            {(activeChart === "weight" || activeChart === "both") &&
              createDots(
                checkupsData,
                "weight",
                commonBounds,
                chartWidth,
                chartHeight
              ).map((dot, index) => (
                <circle
                  key={`weight-dot-${index}`}
                  cx={dot.x}
                  cy={dot.y}
                  r="4"
                  fill="#dc2626"
                  stroke="#ffffff"
                  strokeWidth="2"
                  className="chart-dot"
                >
                  <title>{`${dot.formattedDate}: ${dot.value}kg`}</title>
                </circle>
              ))}
          </g>

          {/* Chart legend */}
          <g
            className="chart-legend"
            transform={`translate(60, ${chartHeight + 60})`}
          >
            {(activeChart === "height" || activeChart === "both") && (
              <g>
                {/* Height bar icon */}
                <rect
                  x="0"
                  y="8"
                  width="8"
                  height="14"
                  fill="url(#heightBarGradient)"
                  stroke="#6366f1"
                  strokeWidth="1"
                  rx="2"
                />
                <text
                  x="18"
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
                    ? "translate(140, 0)"
                    : "translate(0, 0)"
                }
              >
                {/* Weight bar icon */}
                <rect
                  x="0"
                  y="8"
                  width="8"
                  height="14"
                  fill="url(#weightBarGradient)"
                  stroke="#dc2626"
                  strokeWidth="1"
                  rx="2"
                />
                <text
                  x="18"
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
