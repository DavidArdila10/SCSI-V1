import { useEffect, useState, useRef } from "react";
import { Link } from "react-router-dom";
import Config from "../Config";
import Siderbar from "./Sidebar";
import Pagination from "../components/Pagination";
import DateSearchBar from "../components/DateSearchBar";

/**
 * Componente extenso de Cronómetro...
 */
const CronometroAll = () => {
  const [allCronometros, setAllCronometros] = useState([]);
  const [allCronometros1, setAllCronometros1] = useState([]);
  const [cronometros, setCronometros] = useState([]);
  const [loading, setLoading] = useState(true);
  const [currentPage, setCurrentPage] = useState(1);
  const [totalPages, setTotalPages] = useState(1);
  const [searchTerm, setSearchTerm] = useState("");

  // Nuevo: Estado para filtro de status
  const [statusFilter, setStatusFilter] = useState("ALL");
  // Nuevo: Mostrar/ocultar dropdown de filtro de status
  const [showStatusFilterDropdown, setShowStatusFilterDropdown] = useState(false);

  // Interval para incrementar localmente en la UI
  const incrementIntervalRef = useRef(null);
  // Interval para auto-guardar periódicamente
  const autosaveIntervalRef = useRef(null);

  // ==========================================
  // 1. Cargar lista principal (paginada)
  // ==========================================
  const fetchCronometros = async (page) => {
    try {
      const response = await Config.getCronometros(page);
      if (response && response.data) {
        console.log("Datos recibidos del backend antes del ajuste:", response.data);

        const nowMs = Date.now();

        const adjusted = await Promise.all(
          response.data.map(async (item) => {
            const c = { ...item };

            ["te", "tpc", "tpi"].forEach((field) => {
              const isRunningKey = `is_running_${field}`;
              const elapsedKey = `elapsed_${field}`;
              const lastUpdatedKey = `last_updated_${field}`;

              if (c[isRunningKey]) {
                const lastUpdatedStr = c[lastUpdatedKey];
                let lastMs = 0;

                if (lastUpdatedStr) {
                  const parsed = new Date(lastUpdatedStr).getTime();
                  if (!Number.isNaN(parsed)) {
                    lastMs = parsed;
                  }
                }

                let diffSec = Math.floor((nowMs - lastMs) / 1000);
                if (diffSec < 0) diffSec = 0;

                c[elapsedKey] = (c[elapsedKey] || 0) + diffSec;
                c[lastUpdatedKey] = new Date(nowMs).toISOString();
              }
            });

            // Actualizar en BD si está corriendo
            const updates = {};
            ["te", "tpc", "tpi"].forEach((field) => {
              const isRunningKey = `is_running_${field}`;
              const elapsedKey = `elapsed_${field}`;
              const lastUpdatedKey = `last_updated_${field}`;

              if (c[isRunningKey]) {
                updates[elapsedKey] = c[elapsedKey];
                updates[lastUpdatedKey] = c[lastUpdatedKey];
              }
            });

            if (Object.keys(updates).length > 0) {
              try {
                await Config.updateCronometro(updates, c.id);
              } catch (err) {
                console.error("Error al actualizar diff immediate:", err);
              }
            }

            return c;
          })
        );

        setAllCronometros(adjusted);
        setCronometros(adjusted);
        setTotalPages(response.last_page);
      }
    } catch (error) {
      console.error("Error al obtener los cronómetros:", error);
    } finally {
      setLoading(false);
    }
  };

  // Cargar todos los cronómetros sin paginar (para filtros locales)
  useEffect(() => {
    const fetchAllCronometros = async () => {
      try {
        let allData = [];
        let page = 1;
        let lastPage = 1;

        do {
          const response = await Config.getCronometros(page);
          if (response && response.data) {
            if (Array.isArray(response.data)) {
              allData = allData.concat(response.data);
              lastPage = response.last_page;
            } else if (response.data && Array.isArray(response.data.data)) {
              allData = allData.concat(response.data.data);
              lastPage = response.data.last_page;
            } else {
              console.error("Los datos no son un array:", response.data);
              break;
            }
          } else {
            console.error("Respuesta inválida:", response);
            break;
          }
          page++;
        } while (page <= lastPage);

        setAllCronometros1(allData);
      } catch (error) {
        console.error("Error al obtener cronómetros:", error);
      }
    };

    fetchAllCronometros();
  }, []);

  // ==========================================
  // 2. Al montar/cambiar página => fetch lista
  // ==========================================
  useEffect(() => {
    fetchCronometros(currentPage);
  }, [currentPage]);

  useEffect(() => {
    // Cuando cambian los filtros, ir a página 1
    setCurrentPage(1);
  }, [searchTerm, statusFilter]);

  // ==========================================
  // 3. Interval para incrementar localmente cada 1s
  // ==========================================
  useEffect(() => {
    if (!incrementIntervalRef.current) {
      incrementIntervalRef.current = setInterval(() => {
        // (Código original para saber día local)
        const today = new Date().getDay();
        console.log(
          `Hoy es: ${
            ["Domingo", "Lunes", "Martes", "Miércoles", "Jueves", "Viernes", "Sábado"][today]
          }`
        );

        // Si es domingo (0) o sábado (6), no incrementa
        if (today === 0 || today === 6) return;

        // ===============================
        // NUEVO: Hora de Colombia
        // ===============================
        const nowColombiaStr = new Date().toLocaleString("en-US", {
          timeZone: "America/Bogota",
        });
        const nowColombia = new Date(nowColombiaStr);
        const hourCol = nowColombia.getHours();
        const dayCol = nowColombia.getDay();

        // Log para ver la hora y día de Colombia
        console.log(
          `Hora en Colombia: ${hourCol}h, Día (0=Dom,...6=Sáb): ${dayCol}`
        );

        // También NO incrementar si en Colombia es sábado(6) o domingo(0)
        if (dayCol === 0 || dayCol === 6) return;

        // =====================================
        // Solo contar entre 8am (8) y 5pm (17)
        // => si está fuera (hourCol <8 o hourCol >=17), NO sumamos
        // =====================================
        if (hourCol < 8 || hourCol >= 17) {
          return;
        }

        // Incrementamos 1s en cada timer que esté corriendo
        setCronometros((prev) =>
          prev.map((item) => {
            const newItem = { ...item };
            ["te", "tpc", "tpi"].forEach((field) => {
              const isRunningKey = `is_running_${field}`;
              const elapsedKey = `elapsed_${field}`;
              if (newItem[isRunningKey]) {
                newItem[elapsedKey] = (newItem[elapsedKey] || 0) + 1;
              }
            });
            return newItem;
          })
        );
      }, 1000);
    }
    return () => {
      clearInterval(incrementIntervalRef.current);
    };
  }, []);

  // ==========================================
  // 4. Auto-guardado cada 1s
  // ==========================================
  useEffect(() => {
    if (!autosaveIntervalRef.current) {
      autosaveIntervalRef.current = setInterval(async () => {
        // (LÍNEA ORIGINAL) día local
        const today = new Date().getDay();
        if (today === 0 || today === 6) return;

        // ===============================
        // NUEVO: Hora de Colombia
        // ===============================
        const nowColombiaStr = new Date().toLocaleString("en-US", {
          timeZone: "America/Bogota",
        });
        const nowColombia = new Date(nowColombiaStr);
        const hourCol = nowColombia.getHours();
        const dayCol = nowColombia.getDay();

        // Si en Colombia es sábado(6) o domingo(0) => no guardamos
        if (dayCol === 0 || dayCol === 6) return;

        // Si está fuera del rango 8..16 => no guardamos
        if (hourCol < 8 || hourCol >= 17) {
          return;
        }

        // (Código ORIGINAL) auto-guardado
        try {
          const nowISO = new Date().toISOString();
          setCronometros((prevCronometros) => {
            prevCronometros.forEach(async (c) => {
              const updates = {};
              ["te", "tpc", "tpi"].forEach((field) => {
                const isRunningKey = `is_running_${field}`;
                const elapsedKey = `elapsed_${field}`;
                const lastUpdatedKey = `last_updated_${field}`;
                if (c[isRunningKey]) {
                  updates[elapsedKey] = c[elapsedKey];
                  updates[lastUpdatedKey] = nowISO;
                }
              });
              if (Object.keys(updates).length > 0) {
                await Config.updateCronometro(updates, c.id);
              }
            });
            return prevCronometros; // no mutamos el array final
          });
        } catch (err) {
          console.error("Error en auto-guardado:", err);
        }
      }, 1000);
    }
    return () => {
      clearInterval(autosaveIntervalRef.current);
    };
  }, []);

  // ==========================================
  // 5. Paginación
  // ==========================================
  const handlePageChange = (page) => {
    setCurrentPage(page);
    setLoading(true);
  };

  // ==========================================
  // 6. Búsqueda por fechas
  // ==========================================
  const handleDateSearch = (startDate, endDate) => {
    if (!startDate && !endDate) {
      // Sin fechas => volver a paginación normal
      fetchCronometros(currentPage);
      return;
    }
    const start = new Date(startDate);
    const end = new Date(endDate);

    const filtered = allCronometros1.filter((item) => {
      const itemDate = new Date(item.date);
      return itemDate >= start && itemDate <= end;
    });
    setCronometros(filtered);
  };

  // ==========================================
  // 7. Iniciar / Pausar un timer (TE, TPC, TPI)
  //    Al iniciar uno, pausa los otros dos (solo dentro del MISMO item).
  // ==========================================
  const toggleTimerIndependently = async (field, id, isRunning) => {
    console.log(`Toggling timer for ${field} with id:`, id);
    if (!id || typeof id !== "number") {
      console.error("ID de cronómetro inválido:", id);
      return;
    }

    const lowerField = field.toLowerCase();

    // Claves que usaremos para manipular el estado:
    const isRunningKey = `is_running_${lowerField}`;
    const elapsedKey = `elapsed_${lowerField}`;
    const lastUpdatedKey = `last_updated_${lowerField}`;

    try {
      if (isRunning) {
        // ==========================================
        //  A) PAUSAR el cronómetro seleccionado
        // ==========================================
        let finalElapsed = 0;

        // 1. Actualizar el estado local (cronometros) para pausar
        setCronometros((prev) => {
          const updated = prev.map((c) => {
            if (c.id === id) {
              finalElapsed = c[elapsedKey] || 0;
              return { ...c, [isRunningKey]: false };
            }
            return c;
          });
          return updated;
        });

        // 2. También sincronizar allCronometros1:
        setAllCronometros1((prev) => {
          return prev.map((c) => {
            if (c.id === id) {
              return {
                ...c,
                [isRunningKey]: false,
                [elapsedKey]: finalElapsed,
              };
            }
            return c;
          });
        });

        // 3. Esperamos un pequeño delay para que React actualice su estado
        await new Promise((resolve) => setTimeout(resolve, 100));

        // 4. Llamar a la API para "pausar" el cronómetro en la BD
        await Config.updateCronometroElapsedTime(id, {
          [elapsedKey]: finalElapsed,
          [isRunningKey]: false,
          [lastUpdatedKey]: null,
        });
      } else {
        // ==========================================
        // B) INICIAR el cronómetro seleccionado
        //    => Pausar los otros dos de ESTE item
        // ==========================================
        const nowISO = new Date().toISOString();

        // 1. Actualizar el estado local, poniendo `true` al seleccionado
        //    y `false` a los otros dos (te, tpc, tpi) del MISMO item
        setCronometros((prev) =>
          prev.map((c) => {
            if (c.id === id) {
              return {
                ...c,
                // El que se está iniciando
                [isRunningKey]: true,
                [lastUpdatedKey]: nowISO,

                // Pausar los otros
                is_running_te: field === "TE",
                is_running_tpc: field === "TPC",
                is_running_tpi: field === "TPI",
                last_updated_te: field === "TE" ? nowISO : null,
                last_updated_tpc: field === "TPC" ? nowISO : null,
                last_updated_tpi: field === "TPI" ? nowISO : null,
              };
            }
            return c;
          })
        );

        // 2. Sincronizar allCronometros1 de la misma forma
        setAllCronometros1((prev) =>
          prev.map((c) => {
            if (c.id === id) {
              return {
                ...c,
                [isRunningKey]: true,
                [lastUpdatedKey]: nowISO,

                is_running_te: field === "TE",
                is_running_tpc: field === "TPC",
                is_running_tpi: field === "TPI",
                last_updated_te: field === "TE" ? nowISO : null,
                last_updated_tpc: field === "TPC" ? nowISO : null,
                last_updated_tpi: field === "TPI" ? nowISO : null,
              };
            }
            return c;
          })
        );

        // 3. Llamar a la API con un único objeto que contenga
        //    la nueva configuración de los 3 timers:
        const updates = {
          // El que se inicia
          [isRunningKey]: true,
          [lastUpdatedKey]: nowISO,

          // Pausar los otros dos
          is_running_te: field === "TE",
          last_updated_te: field === "TE" ? nowISO : null,

          is_running_tpc: field === "TPC",
          last_updated_tpc: field === "TPC" ? nowISO : null,

          is_running_tpi: field === "TPI",
          last_updated_tpi: field === "TPI" ? nowISO : null,
        };

        await Config.updateCronometro(updates, id);
      }
    } catch (error) {
      console.error(`Error al alternar el temporizador ${field}:`, error);
    }
  };

  // ==========================================
  // 8. STATUS (DELIVERED, CANCELLED, reset)
  // ==========================================
  const handleStatusChange = async (id, newStatus) => {
    try {
      await Config.updateCronometro({ STATUS: newStatus }, id);
      setCronometros((prev) =>
        prev.map((c) => (c.id === id ? { ...c, STATUS: newStatus } : c))
      );
      setAllCronometros1((prev) =>
        prev.map((c) => (c.id === id ? { ...c, STATUS: newStatus } : c))
      );
    } catch (error) {
      console.error("Error al cambiar STATUS:", error);
    }
  };

  const resetStatus = async (id) => {
    try {
      await Config.updateCronometro({ STATUS: null }, id);
      setCronometros((prev) =>
        prev.map((c) => (c.id === id ? { ...c, STATUS: null } : c))
      );
      setAllCronometros1((prev) =>
        prev.map((c) => (c.id === id ? { ...c, STATUS: null } : c))
      );
    } catch (error) {
      console.error("Error al resetear STATUS:", error);
    }
  };

  // (NUEVO) Confirm antes de marcar DELIVERED/CANCELLED
  const handleStatusChangeWithConfirm = async (item, newStatus) => {
    const teSec = item.elapsed_te || 0;
    const tpcSec = item.elapsed_tpc || 0;
    const tpiSec = item.elapsed_tpi || 0;
    const totalSec = teSec + tpcSec + tpiSec;

    const teFormatted = formatElapsedTime(teSec);
    const tpcFormatted = formatElapsedTime(tpcSec);
    const tpiFormatted = formatElapsedTime(tpiSec);
    const totalFormatted = formatElapsedTime(totalSec);

    const teDays = item.TE || 0;
    const tpcDays = item.TPC || 0;
    const tpiDays = item.TPI || 0;

    const message =
      `Vas a marcar este cronómetro como ${newStatus}.\n\n` +
      `Detalles de tiempo transcurrido (8h = 1 día):\n` +
      ` - TE : ${teFormatted}\n` +
      ` - TPC: ${tpcFormatted}\n` +
      ` - TPI: ${tpiFormatted}\n` +
      `-----------------------\n` +
      `Total: ${totalFormatted}\n\n` +
      `Valores planeados (DÍAS):\n` +
      ` - TE : ${teDays} días\n` +
      ` - TPC: ${tpcDays} días\n` +
      ` - TPI: ${tpiDays} días\n\n` +
      `¿Deseas continuar?`;

    if (window.confirm(message)) {
      await handleStatusChange(item.id, newStatus);
    }
  };

  // ==========================================
  // 9. Formatear el tiempo (segundos -> d h m s)
  // ==========================================
  const formatElapsedTime = (elapsedSeconds) => {
    const s = Math.max(0, elapsedSeconds || 0);
    const SECONDS_PER_DAY = 28800; // 8h = 1 día
    const days = Math.floor(s / SECONDS_PER_DAY);
    const remainder = s % SECONDS_PER_DAY;
    const hours = Math.floor(remainder / 3600);
    const minutes = Math.floor((remainder % 3600) / 60);
    const seconds = remainder % 60;

    return `${days}d ${hours}h ${minutes}m ${seconds}s`;
  };

  // ==========================================
  // 10. Formatear fecha
  // ==========================================
  const formatDate = (dateString) => {
    if (!dateString) return "N/A";
    const [year, month, day] = dateString.split("T")[0].split("-");
    return `${month}/${day}/${year}`;
  };

  // ==========================================
  // 11. Búsqueda por texto
  // ==========================================
  const handleSearchChange = (e) => {
    const value = e.target.value;
    setSearchTerm(value);

    if (!value) {
      // Si el searchTerm queda vacío => volver a la paginación normal
      fetchCronometros(currentPage);
      return;
    }
    const term = value.toLowerCase();
    const filtered = allCronometros1.filter((item) => {
      return (
        (item.PM?.toLowerCase() || "").includes(term) ||
        (item.description?.toLowerCase() || "").includes(term) ||
        (item.EAC?.toString().toLowerCase() || "").includes(term) ||
        (item.ETC?.toString().toLowerCase() || "").includes(term) ||
        (item.date?.toLowerCase() || "").includes(term) ||
        (item.PM_assigned?.toLowerCase() || "").includes(term)
      );
    });
    setCronometros(filtered);
  };

  // ==========================================
  // Nuevo: Función para cambiar el filtro de status
  // ==========================================
  const handleStatusFilterChange = (value) => {
    setStatusFilter(value);
    setShowStatusFilterDropdown(false);

    if (value === "ALL") {
      fetchCronometros(currentPage);
      return;
    }

    let filtered = allCronometros1.filter((item) => item.STATUS === value);

    if (searchTerm) {
      const term = searchTerm.toLowerCase();
      filtered = filtered.filter(
        (item) =>
          (item.PM?.toLowerCase() || "").includes(term) ||
          (item.description?.toLowerCase() || "").includes(term) ||
          (item.EAC?.toString().toLowerCase() || "").includes(term) ||
          (item.ETC?.toString().toLowerCase() || "").includes(term) ||
          (item.date?.toLowerCase() || "").includes(term) ||
          (item.PM_assigned?.toLowerCase() || "").includes(term)
      );
    }
    setCronometros(filtered);
  };

  // Filtro por searchTerm
  const filteredCronometros = allCronometros1.filter((item) => {
    const term = searchTerm.toLowerCase();
    return (
      (item.PM?.toLowerCase() || "").includes(term) ||
      (item.description?.toLowerCase() || "").includes(term) ||
      (item.EAC?.toString().toLowerCase() || "").includes(term) ||
      (item.ETC?.toString().toLowerCase() || "").includes(term) ||
      (item.date?.toLowerCase() || "").includes(term) ||
      (item.PM_assigned?.toLowerCase() || "").includes(term)
    );
  });

  let dataToDisplay = searchTerm ? filteredCronometros : cronometros;
  if (statusFilter !== "ALL") {
    dataToDisplay = dataToDisplay.filter((item) => item.STATUS === statusFilter);
  }

  // ==========================================
  // RENDER
  // ==========================================
  return (
    <div style={{ overflow: "hidden" }}>
      <div className="row">
        <div className="col-sm-1">
          <Siderbar />
        </div>
        <div className="col-sm-11 mt-4 mb-3">
          <div className="me-4">
            <div className="card">
              <div className="card-body">
                <div className="d-flex justify-content-between align-items-center mb-3">
                  <div style={{ marginBottom: "20px" }}>
                    <Link
                      to={"/admin/cronometros/create"}
                      className="btn btn-primary d-flex align-items-center"
                    >
                      <span className="material-symbols-outlined">add_circle</span>
                      New
                    </Link>
                  </div>
                  <div
                    className="d-flex align-items-center"
                    style={{ gap: "10px" }}
                  >
                    <div
                      style={{
                        width: "400px",
                        marginTop: "37px",
                        marginRight: "150px",
                      }}
                    >
                      <input
                        type="text"
                        className="form-control"
                        placeholder="Search..."
                        value={searchTerm}
                        onChange={handleSearchChange}
                      />
                    </div>
                    <div
                      style={{
                        width: "300px",
                        marginRight: "350px",
                      }}
                    >
                      <DateSearchBar onSearch={handleDateSearch} />
                    </div>
                  </div>
                </div>

                <div className="table-responsive-xl mt-3">
                  <table className="table table-hover table-bordered align-middle">
                    <thead>
                      <tr className="table-secondary">
                        <th>PM</th>
                        {/* <-- NUEVO: Agregamos la columna PM_assigned */}
                        <th>PM Assigned</th>
                        <th>Description</th>
                        <th>Estimated Completion</th>
                        <th>Estimated Time</th>
                        <th>Execution Time</th>
                        <th>Client Break</th>
                        <th>Intraway Break</th>
                        <th>Date</th>
                        <th style={{ position: "relative" }}>
                          {/* STATUS con filtro */}
                          <div style={{ display: "flex", alignItems: "center" }}>
                            <span>Status</span>
                            <span
                              className="material-symbols-outlined"
                              style={{
                                cursor: "pointer",
                                marginLeft: "5px",
                                fontSize: "20px",
                              }}
                              onClick={() =>
                                setShowStatusFilterDropdown(!showStatusFilterDropdown)
                              }
                            >
                              filter_list
                            </span>
                          </div>
                          {showStatusFilterDropdown && (
                            <div
                              style={{
                                position: "absolute",
                                top: "100%",
                                left: 0,
                                backgroundColor: "#fff",
                                border: "1px solid #ccc",
                                borderRadius: "4px",
                                zIndex: 999,
                                padding: "5px",
                                width: "120px",
                              }}
                            >
                              <div
                                style={{ cursor: "pointer" }}
                                onClick={() => handleStatusFilterChange("ALL")}
                              >
                                ALL
                              </div>
                              <div
                                style={{ cursor: "pointer" }}
                                onClick={() => handleStatusFilterChange("DELIVERED")}
                              >
                                DELIVERED
                              </div>
                              <div
                                style={{ cursor: "pointer" }}
                                onClick={() => handleStatusFilterChange("CANCELLED")}
                              >
                                CANCELLED
                              </div>
                            </div>
                          )}
                        </th>
                        <th
                          style={{
                            textAlign: "center",
                            verticalAlign: "middle",
                          }}
                        >
                          <span
                            className="material-symbols-outlined"
                            style={{ fontSize: "24px" }}
                          >
                            visibility
                          </span>
                        </th>
                      </tr>
                    </thead>
                    <tbody>
                      {loading ? (
                        <tr>
                          <td colSpan="11">Loading...</td>
                        </tr>
                      ) : dataToDisplay.length > 0 ? (
                        dataToDisplay.map((item) => (
                          <tr key={item.id}>
                            <td>{item.PM || "Sin PM"}</td>
                            {/* <-- NUEVO: Mostrar la info de PM_assigned */}
                            <td>{item.PM_assigned || "N/A"}</td>
                            <td>{item.description || "No description"}</td>
                            <td>{item.EAC || "N/A"}</td>
                            <td>{item.ETC || "N/A"}</td>

                            {/* TE (segundos) */}
                            <td>
                              {formatElapsedTime(item.elapsed_te)}
                              {item.TE ? (
                                <small
                                  style={{
                                    marginLeft: "6px",
                                    fontSize: "12px",
                                    color: "#666",
                                    display: "inline-block",
                                  }}
                                >
                                  ( {item.TE} DAYS)
                                </small>
                              ) : null}
                              {/* 
                                Si STATUS es DELIVERED o CANCELLED, no mostrar el botón.
                              */}
                              {(item.STATUS === "DELIVERED" || item.STATUS === "CANCELLED") ? null : (
                                <button
                                  className={`btn btn-${
                                    item.is_running_te ? "danger" : "success"
                                  } btn-sm`}
                                  style={{
                                    marginLeft: "6px",
                                    padding: "3px",
                                    width: "28px",
                                    height: "28px",
                                    borderRadius: "50%",
                                    display: "flex",
                                    alignItems: "center",
                                    justifyContent: "center",
                                    border: "none",
                                    boxShadow: "0px 2px 5px rgba(0, 0, 0, 1)",
                                  }}
                                  onClick={() =>
                                    toggleTimerIndependently("TE", item.id, item.is_running_te)
                                  }
                                >
                                  <span
                                    className="material-symbols-outlined"
                                    style={{ fontSize: "16px" }}
                                  >
                                    {item.is_running_te ? "pause" : "play_arrow"}
                                  </span>
                                </button>
                              )}
                            </td>

                            {/* TPC (segundos) */}
                            <td>
                              {formatElapsedTime(item.elapsed_tpc)}
                              {item.TPC ? (
                                <small
                                  style={{
                                    marginLeft: "6px",
                                    fontSize: "12px",
                                    color: "#666",
                                    display: "inline-block",
                                  }}
                                >
                                  ( {item.TPC} DAYS)
                                </small>
                              ) : null}
                              {(item.STATUS === "DELIVERED" || item.STATUS === "CANCELLED") ? null : (
                                <button
                                  className={`btn btn-${
                                    item.is_running_tpc ? "danger" : "success"
                                  } btn-sm`}
                                  style={{
                                    marginLeft: "6px",
                                    padding: "3px",
                                    width: "28px",
                                    height: "28px",
                                    borderRadius: "50%",
                                    display: "flex",
                                    alignItems: "center",
                                    justifyContent: "center",
                                    border: "none",
                                    boxShadow: "0px 2px 5px rgba(0, 0, 0, 1)",
                                  }}
                                  onClick={() =>
                                    toggleTimerIndependently("TPC", item.id, item.is_running_tpc)
                                  }
                                >
                                  <span
                                    className="material-symbols-outlined"
                                    style={{ fontSize: "16px" }}
                                  >
                                    {item.is_running_tpc ? "pause" : "play_arrow"}
                                  </span>
                                </button>
                              )}
                            </td>

                            {/* TPI (segundos) */}
                            <td>
                              {formatElapsedTime(item.elapsed_tpi)}
                              {item.TPI ? (
                                <small
                                  style={{
                                    marginLeft: "6px",
                                    fontSize: "12px",
                                    color: "#666",
                                    display: "inline-block",
                                  }}
                                >
                                  ( {item.TPI} DAYS)
                                </small>
                              ) : null}
                              {(item.STATUS === "DELIVERED" || item.STATUS === "CANCELLED") ? null : (
                                <button
                                  className={`btn btn-${
                                    item.is_running_tpi ? "danger" : "success"
                                  } btn-sm`}
                                  style={{
                                    marginLeft: "6px",
                                    padding: "3px",
                                    width: "28px",
                                    height: "28px",
                                    borderRadius: "50%",
                                    display: "flex",
                                    alignItems: "center",
                                    justifyContent: "center",
                                    border: "none",
                                    boxShadow: "0px 2px 5px rgba(0, 0, 0, 1)",
                                  }}
                                  onClick={() =>
                                    toggleTimerIndependently("TPI", item.id, item.is_running_tpi)
                                  }
                                >
                                  <span
                                    className="material-symbols-outlined"
                                    style={{ fontSize: "16px" }}
                                  >
                                    {item.is_running_tpi ? "pause" : "play_arrow"}
                                  </span>
                                </button>
                              )}
                            </td>

                            <td>{item.date ? formatDate(item.date) : "N/A"}</td>
                            <td>
                              {item.STATUS ? (
                                <div>
                                  <span>{item.STATUS}</span>
                                  <button
                                    className="btn btn-outline-secondary btn-sm ms-2"
                                    onClick={() => resetStatus(item.id)}
                                  >
                                    <span className="material-symbols-outlined">autorenew</span>
                                  </button>

                                  {(item.STATUS === "DELIVERED" ||
                                    item.STATUS === "CANCELLED") && (
                                    <div
                                      className="mt-2 text-muted"
                                      style={{ fontSize: "14px" }}
                                    >
                                      <strong>Total General:</strong>{" "}
                                      {formatElapsedTime(
                                        (item.elapsed_te || 0) +
                                          (item.elapsed_tpc || 0) +
                                          (item.elapsed_tpi || 0)
                                      )}
                                    </div>
                                  )}
                                </div>
                              ) : (
                                <>
                                  {/* Botón "Delivered" */}
                                  <button
                                    className="btn btn-success btn-sm"
                                    style={{
                                      padding: "6px 10px",
                                      fontSize: "14px",
                                      borderRadius: "6px",
                                      display: "flex",
                                      alignItems: "center",
                                      justifyContent: "center",
                                      gap: "5px",
                                      boxShadow: "0px 2px 5px rgba(0, 0, 0, 0.15)",
                                      marginRight: "0px",
                                      marginBottom: "5px",
                                    }}
                                    onClick={() =>
                                      handleStatusChangeWithConfirm(item, "DELIVERED")
                                    }
                                  >
                                    <span
                                      className="material-symbols-outlined"
                                      style={{ fontSize: "16px" }}
                                    >
                                      done how_to_reg
                                    </span>
                                  </button>

                                  {/* Botón "Cancelled" */}
                                  <button
                                    className="btn btn-danger btn-sm"
                                    style={{
                                      padding: "6px 10px",
                                      fontSize: "14px",
                                      borderRadius: "6px",
                                      display: "flex",
                                      alignItems: "center",
                                      justifyContent: "center",
                                      gap: "5px",
                                      boxShadow: "0px 2px 5px rgba(0, 0, 0, 0.15)",
                                    }}
                                    onClick={() =>
                                      handleStatusChangeWithConfirm(item, "CANCELLED")
                                    }
                                  >
                                    <span
                                      className="material-symbols-outlined"
                                      style={{ fontSize: "16px" }}
                                    >
                                      do_not_disturb hourglass_disabled
                                    </span>
                                  </button>
                                </>
                              )}
                            </td>
                            <td>
                              <Link
                                to={`/admin/cronometros/details/${item.id}`}
                                className="btn d-flex justify-content-center w-60"
                              >
                                <span className="material-symbols-outlined">pageview</span>
                              </Link>
                            </td>
                          </tr>
                        ))
                      ) : (
                        <tr>
                          <td colSpan="11">No cronómetros found</td>
                        </tr>
                      )}
                    </tbody>
                  </table>
                </div>
                <Pagination
                  totalPages={totalPages}
                  currentPage={currentPage}
                  handlePageChange={handlePageChange}
                />
              </div>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
};

export default CronometroAll;