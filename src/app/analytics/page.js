"use client";
import React, { useState, useEffect } from "react";
import {
  FaChartBar,
  FaEye,
  FaGlobe,
  FaClock,
  FaDesktop,
  FaUsers,
  FaMapMarkerAlt,
  FaCalendarAlt,
  FaLock,
  FaArrowUp,
  FaArrowDown,
  FaRefresh,
  FaDesktopAlt,
  FaLanguage,
} from "react-icons/fa";
import { useDataContext } from "../../contexts/useAllContext";

export default function AnalyticsPage() {
  const [stats, setStats] = useState(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);
  const [activeTab, setActiveTab] = useState("overview");

  const { auth, isLoaded, makeAuthenticatedRequest, refreshAuth } =
    useDataContext();

  useEffect(() => {
    if (isLoaded && auth) {
      fetchStats();
    }
  }, [isLoaded, auth]);

  const fetchStats = async () => {
    try {
      setLoading(true);
      setError(null);
      const result = await makeAuthenticatedRequest("/api/visitors");

      if (result.error) {
        if (result.status === 401) {
          const refreshed = refreshAuth();
          if (refreshed) {
            setTimeout(() => fetchStats(), 100);
            return;
          }
          setError("Authentication failed. Please try logging in again.");
        } else {
          setError(result.error || "An unexpected error occurred.");
        }
        return;
      }

      const data = await result.response.json();
      setStats(data);
    } catch (error) {
      setError("Failed to fetch analytics data. Please try again.");
    } finally {
      setLoading(false);
    }
  };

  if (!isLoaded) {
    return (
      <div className="min-h-screen bg-gradient-to-br from-slate-900 via-slate-800 to-slate-900 flex items-center justify-center">
        <div className="text-center">
          <div className="animate-spin rounded-full h-16 w-16 border-b-2 border-teal-400 mx-auto mb-4"></div>
          <p className="text-slate-300 text-lg">Checking authentication...</p>
        </div>
      </div>
    );
  }

  if (!auth) {
    return (
      <div className="min-h-screen bg-gradient-to-br from-slate-900 via-slate-800 to-slate-900 flex items-center justify-center p-4">
        <div className="max-w-md w-full bg-slate-800/50 backdrop-blur-sm border border-slate-700 rounded-2xl p-8 text-center">
          <div className="w-16 h-16 bg-red-500/20 rounded-full flex items-center justify-center mx-auto mb-6">
            <FaLock className="text-2xl text-red-400" />
          </div>
          <h1 className="text-2xl font-bold text-white mb-4">Access Denied</h1>
          <p className="text-slate-300 mb-6">
            You need to be logged in to view analytics
          </p>
          <button
            onClick={() => window.history.back()}
            className="bg-teal-600 hover:bg-teal-700 text-white px-6 py-3 rounded-lg font-medium transition-all duration-200 hover:scale-105"
          >
            Go Back
          </button>
        </div>
      </div>
    );
  }

  if (loading) {
    return (
      <div className="min-h-screen bg-gradient-to-br from-slate-900 via-slate-800 to-slate-900 flex items-center justify-center">
        <div className="text-center">
          <div className="animate-spin rounded-full h-16 w-16 border-b-2 border-teal-400 mx-auto mb-4"></div>
          <p className="text-slate-300 text-lg">Loading analytics...</p>
        </div>
      </div>
    );
  }

  if (error) {
    return (
      <div className="min-h-screen bg-gradient-to-br from-slate-900 via-slate-800 to-slate-900 flex items-center justify-center p-4">
        <div className="max-w-md w-full bg-slate-800/50 backdrop-blur-sm border border-red-500/20 rounded-2xl p-8 text-center">
          <h2 className="text-2xl font-bold text-white mb-4">
            Error Loading Analytics
          </h2>
          <p className="text-slate-300 mb-6">{error}</p>
          <div className="space-y-3">
            <button
              onClick={() => fetchStats()}
              className="w-full bg-teal-600 hover:bg-teal-700 text-white px-6 py-3 rounded-lg font-medium transition-all duration-200 hover:scale-105"
            >
              Retry
            </button>
            <button
              onClick={refreshAuth}
              className="w-full bg-orange-600 hover:bg-orange-700 text-white px-6 py-3 rounded-lg font-medium transition-all duration-200 hover:scale-105"
            >
              Refresh Auth
            </button>
          </div>
        </div>
      </div>
    );
  }

  if (!stats) {
    return (
      <div className="min-h-screen bg-gradient-to-br from-slate-900 via-slate-800 to-slate-900 flex items-center justify-center p-4">
        <div className="max-w-md w-full bg-slate-800/50 backdrop-blur-sm border border-slate-700 rounded-2xl p-8 text-center">
          <div className="w-16 h-16 bg-teal-500/20 rounded-full flex items-center justify-center mx-auto mb-6">
            <FaChartBar className="text-2xl text-teal-400" />
          </div>
          <h2 className="text-2xl font-bold text-white mb-4">
            No Analytics Data
          </h2>
          <p className="text-slate-300">
            Analytics data will appear here as visitors interact with your
            portfolio.
          </p>
        </div>
      </div>
    );
  }

  const tabs = [
    { id: "overview", label: "Overview", icon: FaChartBar },
    { id: "visitors", label: "Visitors", icon: FaUsers },
    { id: "pages", label: "Pages", icon: FaGlobe },
    { id: "devices", label: "Devices", icon: FaDesktop },
    { id: "geography", label: "Geography", icon: FaMapMarkerAlt },
  ];

  return (
    <div className="min-h-screen bg-gradient-to-br from-slate-900 via-slate-800 to-slate-900">
      {/* Header */}
      <div className="bg-slate-800/50 backdrop-blur-sm border-b border-slate-700 sticky top-0 z-10">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-6">
          <div className="flex flex-col lg:flex-row lg:items-center lg:justify-between gap-4">
            <div>
              <h1 className="text-3xl lg:text-4xl font-bold bg-gradient-to-r from-teal-400 to-teal-600 bg-clip-text text-transparent">
                <FaChartBar className="inline mr-3" />
                Analytics Dashboard
              </h1>
              <p className="text-slate-300 mt-2">
                Comprehensive insights into your portfolio performance
              </p>
            </div>

            <button
              onClick={fetchStats}
              className="p-3 text-slate-300 hover:text-teal-400 hover:bg-slate-700/50 rounded-lg transition-colors duration-200"
              title="Refresh data"
            >
              <FaRefresh className="text-lg" />
            </button>
          </div>
        </div>
      </div>

      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
        {/* Overview Cards */}
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6 mb-8">
          <div className="bg-slate-800/50 backdrop-blur-sm border border-slate-700 rounded-2xl p-6 hover:border-teal-500/50 transition-all duration-300 hover:scale-105">
            <div className="w-12 h-12 bg-teal-500/20 rounded-xl flex items-center justify-center mb-4">
              <FaEye className="text-xl text-teal-400" />
            </div>
            <h3 className="text-3xl font-bold text-white mb-2">
              {stats.totalVisitors?.toLocaleString() || 0}
            </h3>
            <p className="text-slate-300 text-sm font-medium">Total Visitors</p>
          </div>

          <div className="bg-slate-800/50 backdrop-blur-sm border border-slate-700 rounded-2xl p-6 hover:border-teal-500/50 transition-all duration-300 hover:scale-105">
            <div className="w-12 h-12 bg-blue-500/20 rounded-xl flex items-center justify-center mb-4">
              <FaClock className="text-xl text-blue-400" />
            </div>
            <h3 className="text-3xl font-bold text-white mb-2">
              {stats.todayVisitors || 0}
            </h3>
            <p className="text-slate-300 text-sm font-medium">Today</p>
          </div>

          <div className="bg-slate-800/50 backdrop-blur-sm border border-slate-700 rounded-2xl p-6 hover:border-teal-500/50 transition-all duration-300 hover:scale-105">
            <div className="w-12 h-12 bg-purple-500/20 rounded-xl flex items-center justify-center mb-4">
              <FaCalendarAlt className="text-xl text-purple-400" />
            </div>
            <h3 className="text-3xl font-bold text-white mb-2">
              {stats.thisWeekVisitors || 0}
            </h3>
            <p className="text-slate-300 text-sm font-medium">This Week</p>
          </div>

          <div className="bg-slate-800/50 backdrop-blur-sm border border-slate-700 rounded-2xl p-6 hover:border-teal-500/50 transition-all duration-300 hover:scale-105">
            <div className="w-12 h-12 bg-green-500/20 rounded-xl flex items-center justify-center mb-4">
              <FaUsers className="text-xl text-green-400" />
            </div>
            <h3 className="text-3xl font-bold text-white mb-2">
              {stats.thisMonthVisitors || 0}
            </h3>
            <p className="text-slate-300 text-sm font-medium">This Month</p>
          </div>
        </div>

        {/* Navigation Tabs */}
        <div className="flex flex-wrap gap-2 mb-8">
          {tabs.map((tab) => {
            const IconComponent = tab.icon;
            return (
              <button
                key={tab.id}
                className={`flex items-center gap-2 px-4 py-3 rounded-xl font-medium transition-all duration-200 ${
                  activeTab === tab.id
                    ? "bg-teal-600 text-white shadow-lg shadow-teal-600/25"
                    : "bg-slate-800/50 text-slate-300 hover:bg-slate-700/50 hover:text-white border border-slate-700 hover:border-teal-500/50"
                }`}
                onClick={() => setActiveTab(tab.id)}
              >
                <IconComponent className="text-lg" />
                {tab.label}
              </button>
            );
          })}
        </div>

        {/* Tab Content */}
        <div className="bg-slate-800/50 backdrop-blur-sm border border-slate-700 rounded-2xl p-6">
          {activeTab === "overview" && (
            <div className="grid grid-cols-1 lg:grid-cols-2 gap-8">
              <div className="space-y-6">
                <div className="bg-slate-700/50 rounded-xl p-6">
                  <h3 className="text-xl font-semibold text-white mb-4 flex items-center gap-2">
                    <FaGlobe className="text-teal-400" />
                    Most Visited Pages
                  </h3>
                  <div className="space-y-3">
                    {stats.pageStats?.slice(0, 5).map((page, index) => (
                      <div
                        key={page._id}
                        className="flex items-center justify-between p-3 bg-slate-800/50 rounded-lg hover:bg-slate-700/50 transition-colors duration-200"
                      >
                        <div className="flex items-center gap-3">
                          <span className="w-8 h-8 bg-teal-500/20 rounded-lg flex items-center justify-center text-teal-400 font-bold text-sm">
                            #{index + 1}
                          </span>
                          <span className="text-white font-medium truncate">
                            {page._id}
                          </span>
                        </div>
                        <span className="text-teal-400 font-bold font-mono">
                          {page.count}
                        </span>
                      </div>
                    ))}
                  </div>
                </div>

                <div className="bg-slate-700/50 rounded-xl p-6">
                  <h3 className="text-xl font-semibold text-white mb-4 flex items-center gap-2">
                    <FaDesktop className="text-blue-400" />
                    Device Types
                  </h3>
                  <div className="space-y-3">
                    {stats.deviceStats?.map((device) => (
                      <div
                        key={device.device}
                        className="flex items-center justify-between p-3 bg-slate-800/50 rounded-lg hover:bg-slate-700/50 transition-colors duration-200"
                      >
                        <span className="text-white font-medium">
                          {device.device}
                        </span>
                        <span className="text-blue-400 font-bold font-mono">
                          {device.count}
                        </span>
                      </div>
                    ))}
                  </div>
                </div>
              </div>

              <div className="space-y-6">
                <div className="bg-slate-700/50 rounded-xl p-6">
                  <h3 className="text-xl font-semibold text-white mb-4 flex items-center gap-2">
                    <FaDesktopAlt className="text-purple-400" />
                    Browser Distribution
                  </h3>
                  <div className="space-y-3">
                    {stats.browserStats?.map((browser) => (
                      <div
                        key={browser.browser}
                        className="flex items-center justify-between p-3 bg-slate-800/50 rounded-lg hover:bg-slate-700/50 transition-colors duration-200"
                      >
                        <span className="text-white font-medium">
                          {browser.browser}
                        </span>
                        <span className="text-purple-400 font-bold font-mono">
                          {browser.count}
                        </span>
                      </div>
                    ))}
                  </div>
                </div>

                <div className="bg-slate-700/50 rounded-xl p-6">
                  <h3 className="text-xl font-semibold text-white mb-4 flex items-center gap-2">
                    <FaMapMarkerAlt className="text-green-400" />
                    Top Countries
                  </h3>
                  <div className="space-y-3">
                    {stats.countryStats?.slice(0, 5).map((country) => (
                      <div
                        key={country.country}
                        className="flex items-center justify-between p-3 bg-slate-800/50 rounded-lg hover:bg-slate-700/50 transition-colors duration-200"
                      >
                        <span className="text-white font-medium">
                          {country.country}
                        </span>
                        <span className="text-green-400 font-bold font-mono">
                          {country.count}
                        </span>
                      </div>
                    ))}
                  </div>
                </div>
              </div>
            </div>
          )}

          {activeTab === "visitors" && (
            <div className="space-y-6">
              <div className="bg-slate-700/50 rounded-xl p-6">
                <h3 className="text-xl font-semibold text-white mb-4 flex items-center gap-2">
                  <FaUsers className="text-teal-400" />
                  Recent Visits
                </h3>
                <div className="space-y-3">
                  {stats.recentVisits?.slice(0, 10).map((visit, index) => (
                    <div
                      key={index}
                      className="p-4 bg-slate-800/50 rounded-lg hover:bg-slate-700/50 transition-colors duration-200"
                    >
                      <div className="flex items-center justify-between mb-2">
                        <span className="text-teal-400 font-mono text-sm">
                          {new Date(visit.timestamp).toLocaleString()}
                        </span>
                        <span className="text-slate-400 text-sm">
                          #{index + 1}
                        </span>
                      </div>
                      <div className="grid grid-cols-1 sm:grid-cols-3 gap-2 text-sm">
                        <span className="bg-slate-700/50 px-3 py-1 rounded-lg text-white">
                          IP: {visit.ip}
                        </span>
                        <span className="bg-slate-700/50 px-3 py-1 rounded-lg text-white">
                          Page: {visit.page}
                        </span>
                        <span className="bg-slate-700/50 px-3 py-1 rounded-lg text-white">
                          From: {visit.referrer || "direct"}
                        </span>
                      </div>
                    </div>
                  ))}
                </div>
              </div>
            </div>
          )}

          {activeTab === "pages" && (
            <div className="bg-slate-700/50 rounded-xl p-6">
              <h3 className="text-xl font-semibold text-white mb-4 flex items-center gap-2">
                <FaGlobe className="text-teal-400" />
                Page Performance
              </h3>
              <div className="space-y-3">
                {stats.pageStats?.map((page, index) => (
                  <div
                    key={page._id}
                    className="flex items-center justify-between p-4 bg-slate-800/50 rounded-lg hover:bg-slate-700/50 transition-colors duration-200"
                  >
                    <div className="flex items-center gap-4">
                      <span className="w-10 h-10 bg-teal-500/20 rounded-lg flex items-center justify-center text-teal-400 font-bold">
                        #{index + 1}
                      </span>
                      <div>
                        <span className="text-white font-medium block">
                          {page._id}
                        </span>
                        <span className="text-slate-400 text-sm">Page URL</span>
                      </div>
                    </div>
                    <div className="text-right">
                      <span className="text-teal-400 font-bold font-mono text-xl block">
                        {page.count}
                      </span>
                      <span className="text-slate-400 text-sm">Visits</span>
                    </div>
                  </div>
                ))}
              </div>
            </div>
          )}

          {activeTab === "devices" && (
            <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
              <div className="bg-slate-700/50 rounded-xl p-6">
                <h3 className="text-xl font-semibold text-white mb-4 flex items-center gap-2">
                  <FaDesktop className="text-blue-400" />
                  Device Types
                </h3>
                <div className="space-y-3">
                  {stats.deviceStats?.map((device) => (
                    <div
                      key={device.device}
                      className="flex items-center justify-between p-3 bg-slate-800/50 rounded-lg hover:bg-slate-700/50 transition-colors duration-200"
                    >
                      <span className="text-white font-medium">
                        {device.device}
                      </span>
                      <span className="text-blue-400 font-bold font-mono">
                        {device.count}
                      </span>
                    </div>
                  ))}
                </div>
              </div>

              <div className="bg-slate-700/50 rounded-xl p-6">
                <h3 className="text-xl font-semibold text-white mb-4 flex items-center gap-2">
                  <FaDesktopAlt className="text-purple-400" />
                  Screen Resolutions
                </h3>
                <div className="space-y-3">
                  {stats.screenStats?.slice(0, 15).map((screen) => (
                    <div
                      key={screen.resolution}
                      className="flex items-center justify-between p-3 bg-slate-800/50 rounded-lg hover:bg-slate-700/50 transition-colors duration-200"
                    >
                      <span className="text-white font-medium font-mono">
                        {screen.resolution}
                      </span>
                      <span className="text-purple-400 font-bold font-mono">
                        {screen.count}
                      </span>
                    </div>
                  ))}
                </div>
              </div>
            </div>
          )}

          {activeTab === "geography" && (
            <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
              <div className="bg-slate-700/50 rounded-xl p-6">
                <h3 className="text-xl font-semibold text-white mb-4 flex items-center gap-2">
                  <FaMapMarkerAlt className="text-green-400" />
                  Top Countries
                </h3>
                <div className="space-y-3">
                  {stats.countryStats?.map((country) => (
                    <div
                      key={country.country}
                      className="flex items-center justify-between p-3 bg-slate-800/50 rounded-lg hover:bg-slate-700/50 transition-colors duration-200"
                    >
                      <span className="text-white font-medium">
                        {country.country}
                      </span>
                      <span className="text-green-400 font-bold font-mono">
                        {country.count}
                      </span>
                    </div>
                  ))}
                </div>
              </div>

              <div className="bg-slate-700/50 rounded-xl p-6">
                <h3 className="text-xl font-semibold text-white mb-4 flex items-center gap-2">
                  <FaLanguage className="text-orange-400" />
                  Languages
                </h3>
                <div className="space-y-3">
                  {stats.languageStats?.map((lang) => (
                    <div
                      key={lang.language}
                      className="flex items-center justify-between p-3 bg-slate-800/50 rounded-lg hover:bg-slate-700/50 transition-colors duration-200"
                    >
                      <span className="text-white font-medium">
                        {lang.language}
                      </span>
                      <span className="text-orange-400 font-bold font-mono">
                        {lang.count}
                      </span>
                    </div>
                  ))}
                </div>
              </div>
            </div>
          )}
        </div>
      </div>
    </div>
  );
}
