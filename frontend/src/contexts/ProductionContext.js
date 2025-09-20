import React, { createContext, useContext, useReducer, useEffect } from "react";
import axios from "axios";

const ProductionContext = createContext();

const initialState = {
  currentProductionLine: null,
  dailyStats: {
    totalProduced: 0,
    firstTimeThrough: 0,
    needImprovement: 0,
    modified: 0,
    rejected: 0,
    defectRate: 0,
    rejectionRate: 0,
    efficiencyRate: 0,
  },
  defectTypes: [
    "Broken stitch",
    "Loose tension",
    "Hem length up down",
    "Dirty spot",
    "Down stitch",
    "Join stitch",
    "Label missing",
    "Needle mark",
    "Oil spot",
    "Open seam",
    "Part shading",
    "Pleat",
    "Point up down",
    "Print defect",
    "Puckering",
    "Track missing",
    "Skip stitch",
    "Sldr up down",
    "Without button",
    "Untrims thread",
  ],
  modificationTypes: [
    "Stitch repair",
    "Button attachment",
    "Label correction",
    "Pressing",
    "Spot cleaning",
    "Measurement adjustment",
  ],
  rejectionReasons: [
    "Irreparable damage",
    "Material defect",
    "Wrong size",
    "Color mismatch",
    "Pattern defect",
    "Multiple defects",
  ],
  loading: false,
  error: null,
};

// Reducer
const productionReducer = (state, action) => {
  switch (action.type) {
    case "SET_LOADING":
      return { ...state, loading: action.payload };

    case "SET_ERROR":
      return { ...state, error: action.payload, loading: false };

    case "SET_PRODUCTION_LINE":
      return { ...state, currentProductionLine: action.payload };

    case "UPDATE_DAILY_STATS":
      return { ...state, dailyStats: action.payload };

    case "ADD_DEFECT_TYPE":
      return {
        ...state,
        defectTypes: [...state.defectTypes, action.payload],
      };

    case "ADD_MODIFICATION_TYPE":
      return {
        ...state,
        modificationTypes: [...state.modificationTypes, action.payload],
      };

    case "ADD_REJECTION_REASON":
      return {
        ...state,
        rejectionReasons: [...state.rejectionReasons, action.payload],
      };

    case "RECORD_PRODUCTION":
      const { type, data } = action.payload;
      const updatedStats = { ...state.dailyStats };

      updatedStats.totalProduced += 1;

      switch (type) {
        case "first_time_through":
          updatedStats.firstTimeThrough += 1;
          break;
        case "need_improvement":
          updatedStats.needImprovement += 1;
          break;
        case "modified":
          updatedStats.modified += 1;
          break;
        case "rejected":
          updatedStats.rejected += 1;
          break;
        default:
          break;
      }

      updatedStats.defectRate = (
        ((updatedStats.needImprovement + updatedStats.rejected) /
          updatedStats.totalProduced) *
        100
      ).toFixed(2);
      updatedStats.rejectionRate = (
        (updatedStats.rejected / updatedStats.totalProduced) *
        100
      ).toFixed(2);
      updatedStats.efficiencyRate = (
        (updatedStats.firstTimeThrough / updatedStats.totalProduced) *
        100
      ).toFixed(2);

      return { ...state, dailyStats: updatedStats };

    default:
      return state;
  }
};

// Provider Component
export const ProductionProvider = ({ children }) => {
  const [state, dispatch] = useReducer(productionReducer, initialState);

  // API Base URL
  const API_BASE_URL =
    process.env.REACT_APP_API_BASE_URL || "http://localhost:3001/api";

  // Actions
  const setLoading = (loading) => {
    dispatch({ type: "SET_LOADING", payload: loading });
  };

  const setError = (error) => {
    dispatch({ type: "SET_ERROR", payload: error });
  };

  const setProductionLine = (lineId) => {
    dispatch({ type: "SET_PRODUCTION_LINE", payload: lineId });
    localStorage.setItem("currentProductionLine", lineId);
  };

  const addDefectType = (defectType) => {
    dispatch({ type: "ADD_DEFECT_TYPE", payload: defectType });
  };

  const addModificationType = (modificationType) => {
    dispatch({ type: "ADD_MODIFICATION_TYPE", payload: modificationType });
  };

  const addRejectionReason = (reason) => {
    dispatch({ type: "ADD_REJECTION_REASON", payload: reason });
  };

  const recordProduction = async (type, data = {}) => {
    try {
      setLoading(true);

      const productionData = {
        production_line_id: state.currentProductionLine,
        type: type,
        timestamp: new Date().toISOString(),
        ...data,
      };

      // Send to backend API
      await axios.post(`${API_BASE_URL}/production/record`, productionData);

      // Update local state
      dispatch({ type: "RECORD_PRODUCTION", payload: { type, data } });

      setLoading(false);
    } catch (error) {
      setError(error.message);
      console.error("Error recording production:", error);
    }
  };

  const fetchDailyStats = async () => {
    try {
      setLoading(true);
      const response = await axios.get(
        `${API_BASE_URL}/production/daily-stats`,
        {
          params: {
            production_line_id: state.currentProductionLine,
            date: new Date().toISOString().split("T")[0],
          },
        }
      );

      dispatch({ type: "UPDATE_DAILY_STATS", payload: response.data });
      setLoading(false);
    } catch (error) {
      setError(error.message);
      console.error("Error fetching daily stats:", error);
    }
  };

  // Load production line from localStorage on mount
  useEffect(() => {
    const savedProductionLine = localStorage.getItem("currentProductionLine");
    if (savedProductionLine) {
      dispatch({ type: "SET_PRODUCTION_LINE", payload: savedProductionLine });
    }
  }, []);

  // Fetch daily stats when production line changes
  useEffect(() => {
    if (state.currentProductionLine) {
      fetchDailyStats();
    }
  }, [state.currentProductionLine]);

  const value = {
    ...state,
    setProductionLine,
    addDefectType,
    addModificationType,
    addRejectionReason,
    recordProduction,
    fetchDailyStats,
    setLoading,
    setError,
  };

  return (
    <ProductionContext.Provider value={value}>
      {children}
    </ProductionContext.Provider>
  );
};

// Custom Hook
export const useProduction = () => {
  const context = useContext(ProductionContext);
  if (!context) {
    throw new Error("useProduction must be used within a ProductionProvider");
  }
  return context;
};
