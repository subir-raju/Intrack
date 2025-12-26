import React, { createContext, useContext, useState, useCallback } from "react";

const ProductionContext = createContext();

export function ProductionProvider({ children }) {
  const [currentProductionLine, setCurrentProductionLine] = useState(1);
  const [defectCategories, setDefectCategories] = useState([
    { id: 1, name: "Broken Stitch", category: "Sewing" },
    { id: 2, name: "Loose Tension", category: "Sewing" },
    { id: 3, name: "Hem Length", category: "Finishing" },
    { id: 4, name: "Dirty Spot", category: "Contamination" },
    { id: 5, name: "Down Stitch", category: "Sewing" },
    { id: 6, name: "Join Stitch", category: "Sewing" },
    { id: 7, name: "Label Missing", category: "Finishing" },
    { id: 8, name: "Needle Mark", category: "Sewing" },
    { id: 9, name: "Oil Spot", category: "Contamination" },
    { id: 10, name: "Open Seam", category: "Sewing" },
    { id: 11, name: "Print Defect", category: "Printing" },
    { id: 12, name: "Skip Stitch", category: "Sewing" },
    { id: 13, name: "Untrims Thread", category: "Finishing" },
  ]);

  const [rejectionReasons, setRejectionReasons] = useState([
    { id: 1, name: "Irreparable Damage", category: "Quality" },
    { id: 2, name: "Multiple Defects", category: "Quality" },
    { id: 3, name: "Material Defect", category: "Material" },
    { id: 4, name: "Customer Request", category: "Order" },
    { id: 5, name: "Measurement Error", category: "Fitting" },
  ]);

  const [modificationOptions] = useState([
    "Stitching",
    "Hem Length",
    "Button Replacement",
    "Seam Fixing",
    "Label Attachment",
    "Thread Removal",
    "Stain Removal",
    "Zipper Repair",
  ]);

  const productionLines = [
    { id: 1, name: "Production Line 1" },
    { id: 2, name: "Production Line 2" },
    { id: 3, name: "Production Line 3" },
    { id: 4, name: "Production Line 4" },
    { id: 5, name: "Production Line 5" },
  ];

  const addDefectCategory = useCallback(
    (name, category) => {
      const newCategory = {
        id: defectCategories.length + 1,
        name,
        category,
      };
      setDefectCategories([...defectCategories, newCategory]);
      return newCategory;
    },
    [defectCategories]
  );

  const addRejectionReason = useCallback(
    (name, category) => {
      const newReason = {
        id: rejectionReasons.length + 1,
        name,
        category,
      };
      setRejectionReasons([...rejectionReasons, newReason]);
      return newReason;
    },
    [rejectionReasons]
  );

  const value = {
    currentProductionLine,
    setCurrentProductionLine,
    defectCategories,
    rejectionReasons,
    modificationOptions,
    productionLines,
    addDefectCategory,
    addRejectionReason,
  };

  return (
    <ProductionContext.Provider value={value}>
      {children}
    </ProductionContext.Provider>
  );
}

export function useProduction() {
  const context = useContext(ProductionContext);
  if (!context) {
    throw new Error("useProduction must be used within ProductionProvider");
  }
  return context;
}
