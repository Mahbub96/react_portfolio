/**
 * Chart Options Generator
 * ECharts configuration options for various chart types
 * Production-ready version
 */

import { formatNumber, formatPercent } from "./formatters";

/**
 * Generate line chart option for time series
 */
export const getLineChartOption = (title, data, color, total, trend) => {
  // Format data for ECharts
  const dates = data.map((item) => item[0]);
  const values = data.map((item) => item[1]);

  const trendColor = trend >= 0 ? "#10b981" : "#ef4444";
  const trendIcon = trend >= 0 ? "▲" : "▼";
  const trendText = `${trendIcon}${Math.abs(trend).toFixed(2)}%`;

  return {
    backgroundColor: "transparent",
    tooltip: {
      trigger: "axis",
      axisPointer: {
        type: "cross",
        label: {
          backgroundColor: "#6a7985",
        },
      },
      formatter: function (params) {
        const param = params[0];
        return `${param.axisValue}<br/>${title}: ${formatNumber(param.value)}`;
      },
    },
    grid: {
      left: "3%",
      right: "4%",
      bottom: "15%",
      top: "10%",
      containLabel: true,
    },
    xAxis: {
      type: "category",
      boundaryGap: false,
      data: dates,
      axisLine: { lineStyle: { color: "#ddd" } },
      axisLabel: { color: "#666", rotate: 45 },
    },
    yAxis: {
      type: "value",
      axisLine: { lineStyle: { color: "#ddd" } },
      splitLine: { lineStyle: { color: "#f0f0f0" } },
      axisLabel: {
        color: "#666",
        formatter: function (value) {
          return formatNumber(value);
        },
      },
    },
    series: [
      {
        name: title,
        type: "line",
        data: values,
        smooth: true,
        itemStyle: {
          color: color,
        },
        areaStyle: {
          color: {
            type: "linear",
            x: 0,
            y: 0,
            x2: 0,
            y2: 1,
            colorStops: [
              {
                offset: 0,
                color: color + "80",
              },
              {
                offset: 1,
                color: color + "10",
              },
            ],
          },
        },
        lineStyle: {
          width: 2,
          color: color,
        },
        symbol: "circle",
        symbolSize: 6,
      },
    ],
    graphic: [
      {
        type: "text",
        left: "center",
        top: "5%",
        style: {
          text: `${title}\n${formatNumber(total)} ${trendText} / period`,
          fontSize: 14,
          fontWeight: "bold",
          fill: "#333",
        },
      },
    ],
  };
};

/**
 * Generate donut chart option
 */
export const getDonutChartOption = (data, total, colors = []) => {
  const defaultColors = [
    "#1565c0",
    "#f59e0b",
    "#10b981",
    "#ef4444",
    "#8b5cf6",
    "#06b6d4",
  ];

  const chartColors = colors.length > 0 ? colors : defaultColors;

  // Prepare series data
  const seriesData = data.map((item, idx) => ({
    value: item.pageViews || item.count || 0,
    name: item.medium || item.device || item.name || "Unknown",
    itemStyle: {
      color: chartColors[idx % chartColors.length],
    },
  }));

  return {
    backgroundColor: "transparent",
    tooltip: {
      trigger: "item",
      formatter: function (params) {
        const percentage =
          total > 0 ? ((params.value / total) * 100).toFixed(1) : 0;
        return `${params.name}<br/>${formatNumber(
          params.value
        )} (${percentage}%)`;
      },
    },
    series: [
      {
        name: "Data",
        type: "pie",
        radius: ["40%", "70%"],
        center: ["50%", "50%"],
        avoidLabelOverlap: false,
        itemStyle: {
          borderRadius: 4,
          borderColor: "#fff",
          borderWidth: 2,
        },
        label: {
          show: false,
        },
        emphasis: {
          label: {
            show: true,
            fontSize: 14,
            fontWeight: "bold",
          },
        },
        labelLine: {
          show: false,
        },
        data: seriesData,
      },
    ],
  };
};

/**
 * Generate world map chart option
 */
export const getCountriesMapOption = (countriesData, mapReady) => {
  // Map country names to ECharts-compatible format
  const countryNameMap = {
    "United States": "United States of America",
    "United States of America": "United States of America",
    USA: "United States of America",
    UK: "United Kingdom",
    "Great Britain": "United Kingdom",
    Russia: "Russian Federation",
    "Russian Federation": "Russian Federation",
    "South Korea": "Korea",
    "North Korea": "Korea",
    Vietnam: "Vietnam",
    Myanmar: "Myanmar",
    Burma: "Myanmar",
    Bangladesh: "Bangladesh",
  };

  // Process country data - filter out Unknown but keep all others
  const mapData = countriesData
    .filter((country) => {
      const countryName = country?.country;
      return (
        countryName &&
        countryName !== "Unknown" &&
        countryName !== "unknown" &&
        countryName.trim() !== ""
      );
    })
    .map((country) => {
      let countryName = country.country || "";
      countryName = countryName.trim();
      countryName = countryNameMap[countryName] || countryName;
      return {
        name: countryName,
        value: country.sessions || country.pageViews || 0,
      };
    });

  const maxValue = Math.max(...mapData.map((d) => d.value), 1);

  // Try to show world map if loaded and we have data
  if (mapReady && mapData.length > 0) {
    return {
      backgroundColor: "transparent",
      tooltip: {
        trigger: "item",
        formatter: function (params) {
          if (params.data) {
            return `${params.data.name || params.name}: ${
              params.data.value || params.value || 0
            } sessions`;
          }
          return `${params.name}: ${params.value || 0} sessions`;
        },
      },
      visualMap: {
        min: 0,
        max: maxValue,
        left: "10",
        top: "bottom",
        calculable: true,
        realtime: true,
        inRange: {
          color: ["#e3f2fd", "#64b5f6", "RED", "#1565c0", "GREEN"],
        },
        textStyle: {
          color: "#666",
          fontSize: 12,
        },
        orient: "vertical",
        itemWidth: 15,
        itemHeight: 100,
      },
      geo: {
        map: "world",
        roam: true,
        zoom: 2,
        center: [0, 0],
        itemStyle: {
          areaColor: "#ddd", // lighter grey for countries without data
          borderColor: "#fff", // subtle borders
          borderWidth: 0.5,
        },
        emphasis: {
          itemStyle: {
            areaColor: "red", // hover color
            borderColor: "#fff",
            borderWidth: 1.5,
            shadowBlur: 10,
            shadowColor: "rgba(0, 0, 0, 0.3)",
          },
          label: {
            show: true,
            color: "#333",
            fontSize: 12,
            fontWeight: "bold",
          },
        },
        label: { show: false },
      },

      series: [
        {
          name: "Sessions",
          type: "map",
          geoIndex: 0,
          data: mapData,
          label: {
            show: false,
          },
          emphasis: {
            label: {
              show: true,
              formatter: function (params) {
                const name = params.name || "Unknown";
                const value = params.value || 0;
                return `${name}\n${value} sessions`;
              },
              fontSize: 12,
              fontWeight: "bold",
              color: "#fff",
            },
            itemStyle: {
              borderColor: "#fff",
              borderWidth: 2,
            },
          },
          select: {
            itemStyle: {
              areaColor: "#F00", // WHITE SELECTED COLOR
              borderColor: "#f00",
              borderWidth: 2,
            },

            label: {
              show: true,
              fontWeight: "bold",
              fontSize: 13,
            },
          },
          itemStyle: {
            borderColor: "#fff",
            borderWidth: 0.5,
            areaColor: function (params) {
              // If country has sessions → make it YELLOW
              return params.value > 0 ? "yellow" : "#f5f5f5";
            },
          },
        },
      ],
    };
  }

  // Fallback: Bar chart when map not available or no data
  const sortedCountries = countriesData
    .sort((a, b) => (b.sessions || 0) - (a.sessions || 0))
    .slice(0, 10);

  return {
    backgroundColor: "f5f5f5",
    tooltip: {
      trigger: "axis",
      formatter: "{b}: {c} sessions",
    },
    grid: {
      left: "3%",
      right: "4%",
      bottom: "10%",
      containLabel: true,
    },
    xAxis: {
      type: "value",
      axisLine: { lineStyle: { color: "#ddd" } },
      splitLine: { lineStyle: { color: "#f0f0f0" } },
      axisLabel: { color: "#666" },
    },
    yAxis: {
      type: "category",
      data: sortedCountries.map((c) => c.country || "Unknown"),
      axisLine: { lineStyle: { color: "#ddd" } },
      axisLabel: { color: "#666" },
    },
    series: [
      {
        name: "Sessions",
        type: "bar",
        data: sortedCountries.map((c) => c.sessions || 0),
        itemStyle: {
          color: {
            type: "linear",
            x: 0,
            y: 0,
            x2: 1,
            y2: 0,
            colorStops: [
              { offset: 0, color: "#1565c0" },
              { offset: 1, color: "#42a5f5" },
            ],
          },
          borderRadius: [0, 4, 4, 0],
        },
      },
    ],
  };
};
