import React, { useState } from "react";
import * as XLSX from "xlsx";
import "./import.css"; // Importamos el CSS con la animación
import Sidebar from "./Sidebar";
import api from "../Config";
import RocketImg from "./rocket.png"; // La imagen del cohete, en la misma carpeta

// >>>>>>>>>> Columnas requeridas para SOW (sin cambios) <<<<<<<<<<
const REQUIRED_COLUMNS_SOW = [
  "ticket_sow",
  "opportunity_id",
  "account_name",
  "delivery_team",
  "ticket_date",
  "sow_description",
  "sow_status",
];

// >>>>>>>>>> Mapeo de columnas para PM <<<<<<<<<<
// Clave = nombre exacto en el Excel
// Valor = nombre interno que usará el front/back
const PM_COLUMN_MAP = {
  "PM": "PM",
  "PM ASSIGNED": "PM_assigned",
  "DESCRITION": "description", 
  "Estimated Completion": "EAC",
  "Estimated Time": "ETC",
  "Execution Time": "TE",
  "Client Break": "TPC",
  "Intraway Break": "TPI",
  "Date": "date",
  "Status": "STATUS",
};

// >>>>>>>>>> Enlaces de plantilla <<<<<<<<<<
const TEMPLATE_URL =
  "https://docs.google.com/spreadsheets/d/1Ed_2SCUxzAai6A4uUbjzyxlCSBAYqq_QjSDXe-jOUPs/edit?usp=sharing";

const PM_TEMPLATE_URL =
  "https://docs.google.com/spreadsheets/d/1XQkHqpL4ZYuMfAuYslLb2Bd4XmXr6Gi2jooObJUuTRA/edit?usp=sharing";

// Función para convertir fechas de Excel a formato `YYYY-MM-DD`
const excelDateToJSDate = (serial) => {
  if (!serial || isNaN(serial)) return null;

  const utc_days = Math.floor(serial - 25569);
  const date = new Date(utc_days * 86400000);

  const year = date.getFullYear();
  const month = String(date.getMonth() + 1).padStart(2, "0");
  const day = String(date.getDate()).padStart(2, "0");

  return `${year}-${month}-${day}`;
};

const ImportData = () => {
  // Tipo de importación: SOW o PM
  const [importType, setImportType] = useState("SOW");

  const [selectedFile, setSelectedFile] = useState(null);
  const [previewData, setPreviewData] = useState([]);
  const [uploading, setUploading] = useState(false);
  const [message, setMessage] = useState("");
  const [formattedData, setFormattedData] = useState([]);

  // Manejamos la animación del cohete
  const [animateRocket, setAnimateRocket] = useState(false);
  const [showRocket, setShowRocket] = useState(false);

  const handleFileChange = (event) => {
    const file = event.target.files[0];
    if (!file) return;

    setSelectedFile(file);
    readFile(file);
  };

  const readFile = async (file) => {
    const reader = new FileReader();
    reader.onload = async (event) => {
      const data = event.target.result;
      const workbook = XLSX.read(data, { type: "array" });

      try {
        const sheetName = workbook.SheetNames[0];
        const sheet = workbook.Sheets[sheetName];
        // parseamos a array de arrays, con header:1
        const parsedData = XLSX.utils.sheet_to_json(sheet, { header: 1 });

        if (!parsedData.length) {
          alert("⚠️ No se encontró ninguna hoja en el archivo.");
          return;
        }

        // Ignoramos la fila 0 (encabezados) y tomamos las filas de datos
        const headerRow = parsedData[0];
        const rows = parsedData.slice(1);

        if (importType === "SOW") {
          // ================== MODO SOW (SIN MAPEO, EXACTO COMO ANTES) ===================
          // Validar que todas las columnas REQUERIDAS (SOW) estén presentes en headerRow
          const validSow = REQUIRED_COLUMNS_SOW.every((col) =>
            headerRow.includes(col)
          );
          if (!validSow) {
            alert(
              "⚠️ El archivo (SOW) no tiene las columnas requeridas en el orden esperado."
            );
            setSelectedFile(null);
            setPreviewData([]);
            return;
          }

          // Formatear
          const formattedDataAll = rows.map((row) => {
            const rowObj = {};
            const missingFields = [];

            REQUIRED_COLUMNS_SOW.forEach((col, colIndex) => {
              let value =
                col === "ticket_date"
                  ? excelDateToJSDate(row[colIndex])
                  : row[colIndex] || "";

              // Convertimos sow_status a minúsculas
              if (col === "sow_status" && value) {
                value = value.toLowerCase();
              }

              rowObj[col] = value;

              // Marcamos como faltante si el valor está vacío
              if (!value) {
                missingFields.push(col);
              }
            });

            rowObj._missingFields = missingFields;
            return rowObj;
          });

          // Filtramos las filas que tengan ticket_sow
          const filteredData = formattedDataAll.filter((r) => r.ticket_sow);
          setPreviewData(filteredData);
          setFormattedData(filteredData);
        } else {
          // ================== MODO PM (CON MAPEO) ===================
          // 1) Creamos un diccionario para saber en qué índice está cada columna
          const headerIndexMap = {};
          headerRow.forEach((headerName, idx) => {
            headerIndexMap[headerName] = idx;
          });

          // 2) Verificamos que AL MENOS exista la columna "PM"
          if (headerIndexMap["PM"] == null) {
            alert(
              "⚠️ El archivo no tiene la columna 'PM' requerida para la importación de PM."
            );
            setSelectedFile(null);
            setPreviewData([]);
            return;
          }

          // 3) Mapeamos cada fila usando PM_COLUMN_MAP
          //    Aquí permitimos letras o números en EAC, ETC, TE, TPC, TPI
          const formattedDataPM = rows.map((rowArr) => {
            const rowObj = {};
            const missingFields = [];

            Object.entries(PM_COLUMN_MAP).forEach(([excelCol, internalCol]) => {
              const colIndex = headerIndexMap[excelCol];
              if (colIndex == null) {
                // Si no existe en la fila de encabezados, ponlo a null
                rowObj[internalCol] = null;
              } else {
                let rawValue = rowArr[colIndex] ?? "";
                if (internalCol === "date" && rawValue) {
                  rawValue = excelDateToJSDate(rawValue);
                }
                // Dejamos el valor tal cual para que admita letras y/o números
                rowObj[internalCol] = rawValue;
              }
            });

            // Checamos si "PM" está vacío
            if (!rowObj["PM"]) {
              missingFields.push("PM");
            }

            rowObj._missingFields = missingFields;
            return rowObj;
          });

          // Filtrar filas que tengan PM
          const filteredPM = formattedDataPM.filter((r) => r.PM);
          setPreviewData(filteredPM);
          setFormattedData(filteredPM);
        }
      } catch (err) {
        console.error("Error al leer el archivo:", err);
        alert(
          "⚠️ Error al procesar el archivo. Asegúrate de que sea un archivo Excel válido."
        );
      }
    };

    reader.readAsArrayBuffer(file);
  };

  const handleUpload = async () => {
    // Verificamos si hay filas con campos faltantes
    const rowsWithMissingFields = previewData.filter(
      (row) => row._missingFields && row._missingFields.length > 0
    );

    if (rowsWithMissingFields.length > 0) {
      alert(
        "⚠️ Hay filas con campos obligatorios vacíos. Por favor, revisa la vista previa."
      );
      return;
    }

    if (formattedData.length === 0) {
      alert("⚠️ No hay datos para subir.");
      return;
    }

    // Activamos el cohete
    setShowRocket(true);
    setAnimateRocket(true);

    console.log(
      "🚀 Enviando datos a la API (con actualización si repetido):",
      JSON.stringify(formattedData, null, 2)
    );

    setUploading(true);
    setMessage("");

    try {
      // A la misma ruta, tu backend decide si es PM o SOW
      const response = await api.importSows(formattedData);

      if (response.status === 200 || response.status === 201) {
        setMessage("✅ Datos subidos (o actualizados) exitosamente");
        setSelectedFile(null);
        setPreviewData([]);
        setFormattedData([]);

        setTimeout(() => {
          setShowRocket(false);
        }, 1000);
      } else {
        throw new Error(response.data.error || "Error al subir los datos");
      }
    } catch (error) {
      console.error("❌ Error en la carga:", error);

      if (error.response) {
        console.error("📌 Detalles del error:", error.response.data);
        alert(`❌ Error: ${JSON.stringify(error.response.data, null, 2)}`);
      } else {
        alert(`❌ Error desconocido: ${error.message}`);
      }

      setShowRocket(false);
      setAnimateRocket(false);
    } finally {
      setUploading(false);
      setTimeout(() => {
        setAnimateRocket(false);
      }, 2000);
    }
  };

  return (
    <div style={{ overflow: "hidden" }}>
      <div className="row">
        <div className="col-sm-2">
          <Sidebar />
        </div>
        <div className="col-sm-10 mt-4 mb-3">
          <div className="container">
            <div className="card shadow-lg">
              <div className="card-body text-center">
                <h2 className="text-4xl font-bold text-dark mt-2">
                  📥 Importador de Datos
                </h2>
                <p className="text-lg text-gray-700">
                  Selecciona un archivo Excel o CSV para importar datos.
                </p>

                {/* >>>>>>> Cuadro de "Recuerda" <<<<<<< */}
                <div className="bg-light border border-warning rounded-lg p-3 mt-3">
                  <strong>⚠️ Recuerda:</strong>{" "}
                  {importType === "SOW" ? (
                    <>
                      El archivo debe tener exactamente estos campos en orden:
                      <div className="mt-2 text-sm text-dark bg-white border rounded p-2 overflow-auto">
                        {REQUIRED_COLUMNS_SOW.join(", ")}
                      </div>
                    </>
                  ) : (
                    <>
                      El archivo de PM debe tener estos encabezados 
                      <div className="mt-2 text-sm text-dark bg-white border rounded p-2 overflow-auto">
                        {Object.keys(PM_COLUMN_MAP).join(", ")}
                      </div>
                      <p className="text-muted mt-2">
                        (Solo <b>PM</b> es obligatorio; en Estimated Completion y Estimated Time
                        admitimos letras y números)
                      </p>
                    </>
                  )}
                </div>

                {/* >>>>>>> Bloque con Plantilla / Descargar / Selector, DEBAJO del "Recuerda" <<<<<<< */}
                <div className="mt-3">
                  <p className="text-md text-dark">
                    {importType === "SOW"
                      ? "📌 Plantilla S.O.W"
                      : "📌 Plantilla P.M"}{" "}
                    <a
                      href={
                        importType === "SOW" ? TEMPLATE_URL : PM_TEMPLATE_URL
                      }
                      target="_blank"
                      rel="noopener noreferrer"
                      className="btn btn-sm btn-primary ms-2"
                    >
                      Descargar
                    </a>{" "}
                    <label className="fw-bold mb-0 ms-3 me-2">
                      Tipo de Importación:
                    </label>
                    <select
                      className="form-select form-select-sm bg-warning text-dark d-inline-block w-auto"
                      value={importType}
                      onChange={(e) => setImportType(e.target.value)}
                    >
                      <option value="SOW">SOW</option>
                      <option value="PM">PM</option>
                    </select>
                  </p>
                </div>

                <div className="mt-4">
                  <label className="btn btn-primary btn-lg">
                    <input
                      type="file"
                      accept=".csv, .xlsx"
                      onChange={handleFileChange}
                      hidden
                    />
                    📂 Seleccionar Archivo
                  </label>
                </div>

                {selectedFile && (
                  <p className="mt-2 text-lg text-dark">
                    Archivo seleccionado:{" "}
                    <span className="text-primary">{selectedFile.name}</span>
                  </p>
                )}

                {previewData.length > 0 && (
                  <div className="table-responsive mt-3">
                    <table className="table table-bordered table-hover">
                      <thead className="table-dark">
                        <tr>
                          {importType === "SOW" ? (
                            REQUIRED_COLUMNS_SOW.map((col) => (
                              <th key={col} className="text-white">
                                {col}
                              </th>
                            ))
                          ) : (
                            // Para PM, mostramos las columnas internas
                            Object.values(PM_COLUMN_MAP).map((internalCol) => (
                              <th key={internalCol} className="text-white">
                                {internalCol}
                              </th>
                            ))
                          )}
                        </tr>
                      </thead>
                      <tbody>
                        {previewData.slice(0, 5).map((row, index) => {
                          const columnsToRender =
                            importType === "SOW"
                              ? REQUIRED_COLUMNS_SOW
                              : Object.values(PM_COLUMN_MAP);

                          return (
                            <React.Fragment key={index}>
                              <tr>
                                {columnsToRender.map((col) => (
                                  <td key={col}>{String(row[col] || "")}</td>
                                ))}
                              </tr>
                              {row._missingFields &&
                                row._missingFields.length > 0 && (
                                  <tr>
                                    <td colSpan={columnsToRender.length}>
                                      <span className="text-danger">
                                        Faltan campos:{" "}
                                        {row._missingFields.join(", ")}
                                      </span>
                                    </td>
                                  </tr>
                                )}
                            </React.Fragment>
                          );
                        })}
                      </tbody>
                    </table>
                  </div>
                )}

                {previewData.length > 0 && (
                  <button
                    onClick={handleUpload}
                    className="btn btn-success btn-lg mt-3 w-100"
                    disabled={uploading}
                  >
                    {uploading ? "⏳ Subiendo..." : "🚀 Subir Datos"}
                  </button>
                )}

                {message && (
                  <p className="mt-3 text-xl text-success">{message}</p>
                )}
              </div>
            </div>
          </div>
        </div>
      </div>

      {showRocket && (
        <div className="rocket-container multiple-rockets">
          {[...Array(4)].map((_, i) => (
            <img
              key={i}
              src={RocketImg}
              alt={`Rocket-${i}`}
              className={`rocket-image ${animateRocket ? "rocket-launch" : ""}`}
            />
          ))}
        </div>
      )}
    </div>
  );
};

export default ImportData;
