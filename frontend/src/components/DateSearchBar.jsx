// DateSearchBar.jsx
import React, { useState } from "react";

const DateSearchBar = ({ onSearch }) => {
  const [localStartDate, setLocalStartDate] = useState("");
  const [localEndDate, setLocalEndDate] = useState("");

  const handleSearch = () => {
    if (!localStartDate || !localEndDate) {
      alert("Por favor, selecciona ambas fechas.");
      return;
    }

    if (new Date(localStartDate) > new Date(localEndDate)) {
      alert("La fecha de inicio no puede ser mayor que la fecha de finalización.");
      return;
    }

    // Opcional: validación de fechas válidas
    if (isNaN(new Date(localStartDate)) || isNaN(new Date(localEndDate))) {
      alert("Por favor, selecciona fechas válidas.");
      return;
    }

    // En lugar de filtrar, solo notificamos al padre:
    onSearch(localStartDate, localEndDate);
  };

  const handleClear = () => {
    setLocalStartDate("");
    setLocalEndDate("");
    onSearch("", "");
  };

  return (
    <div className="date-search-bar">
      <h4 className="mb-3 text-center">Search by Dates</h4>
      <div className="d-flex flex-column align-items-center">
        <div className="d-flex align-items-center mb-2">
          <input
            type="date"
            value={localStartDate}
            onChange={(e) => setLocalStartDate(e.target.value)}
            className="form-control me-2"
          />
          <input
            type="date"
            value={localEndDate}
            onChange={(e) => setLocalEndDate(e.target.value)}
            className="form-control me-2"
          />
          <button onClick={handleSearch} className="btn btn-primary d-flex align-items-center me-2">
            <span className="material-symbols-outlined me-1">search</span>
          </button>
          <button onClick={handleClear} className="btn btn-secondary d-flex align-items-center">
            <span className="material-symbols-outlined me-1">delete_sweep</span>
          </button>
        </div>
      </div>
    </div>
  );
};

export default DateSearchBar;
