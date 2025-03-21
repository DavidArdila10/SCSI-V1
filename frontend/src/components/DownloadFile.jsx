import { useState, useEffect } from "react";
import { saveAs } from "file-saver";
import * as XLSX from "xlsx";
import jsPDF from "jspdf";
import "jspdf-autotable";
import { Document, Packer, Paragraph } from "docx";
import Config from "../Config"; // Importación añadida

const DownloadFile = ({ data }) => {
  const [isLoading, setIsLoading] = useState(false);
  const [error, setError] = useState("");
  const [selectedFormat, setSelectedFormat] = useState("excel");
  const [showModal, setShowModal] = useState(false);
  const [isDataReady, setIsDataReady] = useState(false);

  // Validar si los datos están disponibles
  useEffect(() => {
    if (Array.isArray(data) && data.length > 0) {
      setIsDataReady(true);
    } else {
      setIsDataReady(false);
    }
  }, [data]);

  const fetchDataFromBackend = async () => {
    try {
      const response = await Config.downloadSow();
      const blob = new Blob([response.data], { type: response.headers["content-type"] });
      const textData = await blob.text();
      const jsonData = JSON.parse(textData);
      return jsonData;
    } catch (error) {
      console.error("Error al obtener los datos del backend:", error);
      throw new Error("No se pudieron obtener los datos del backend.");
    }
  };

  const downloadFile = async (format) => {
    try {
      setIsLoading(true);

      let finalData = data;

      if (!isDataReady) {
        try {
          finalData = await fetchDataFromBackend(); // Obtener datos del backend si no están listos
          setIsDataReady(true);
        } catch (error) {
          setError("No hay datos disponibles para descargar.");
          setIsLoading(false);
          return;
        }
      }

      if (format === "excel") {
        downloadExcel(finalData);
      } else if (format === "pdf") {
        downloadPDF(finalData);
      } else if (format === "csv") {
        downloadCSV(finalData);
      } else if (format === "word") {
        downloadWord(finalData);
      }

      setIsLoading(false);
      setShowModal(false);
    } catch (error) {
      console.error("Error al descargar el archivo:", error);
      setError("Hubo un problema al descargar el archivo. Intenta nuevamente.");
      setIsLoading(false);
    }
  };

  const downloadExcel = (data) => {
    const worksheet = XLSX.utils.json_to_sheet(data);
    const workbook = XLSX.utils.book_new();
    XLSX.utils.book_append_sheet(workbook, worksheet, "SOWs");
    const excelBuffer = XLSX.write(workbook, { bookType: "xlsx", type: "array" });
    saveAs(new Blob([excelBuffer], { type: "application/octet-stream" }), "sows.xlsx");
  };

  const downloadPDF = (data) => {
    const doc = new jsPDF();
    doc.text("Lista de SOWs", 10, 10);

    const tableData = data.map((item) => [
      item.ticket_sow,
      item.account_name,
      item.sow_description,
      item.project_id,
      item.delivery_team,
      item.ticket_date,
      item.sow_status,
    ]);

    doc.autoTable({
      head: [["Ticket", "Client", "Description", "Project", "Team", "Date", "Status"]],
      body: tableData,
    });

    doc.save("sows.pdf");
  };

  const downloadCSV = (data) => {
    const headers = Object.keys(data[0]).join(",");
    const rows = data.map((row) => Object.values(row).join(","));
    const csvContent = [headers, ...rows].join("\n");

    const blob = new Blob([csvContent], { type: "text/csv" });
    saveAs(blob, "sows.csv");
  };

  const downloadWord = (data) => {
    const doc = new Document({
      sections: [
        {
          children: data.map(
            (item) =>
              new Paragraph(
                `Ticket: ${item.ticket_sow}, Client: ${item.account_name}, Description: ${item.sow_description}, Project: ${item.project_id}, Team: ${item.delivery_team}, Date: ${item.ticket_date}, Status: ${item.sow_status}`
              )
          ),
        },
      ],
    });

    Packer.toBlob(doc).then((blob) => {
      saveAs(blob, "sows.docx");
    });
  };

  return (
    <div className="d-flex flex-column align-items-center">
      {/* Botón de descarga */}
      <button
        onClick={() => setShowModal(true)}
        className="btn-icon"
        style={{ background: "none", border: "none", cursor: "pointer" }}
      >
        <span className="material-symbols-outlined" style={{ fontSize: "40px" }}>
          download
        </span>
      </button>

      {/* Modal de selección de formato */}
      {showModal && (
        <div
          className="modal d-flex justify-content-center align-items-center"
          style={{
            position: "fixed",
            top: "0",
            left: "0",
            width: "100vw",
            height: "100vh",
            background: "rgba(0,0,0,0.5)",
          }}
        >
          <div
            className="modal-content p-4"
            style={{
              background: "white",
              borderRadius: "8px",
              boxShadow: "0 4px 8px rgba(0, 0, 0, 0.2)",
              width: "300px",
            }}
          >
            <h5>Select the format</h5>
            <select
              id="format"
              value={selectedFormat}
              onChange={(e) => setSelectedFormat(e.target.value)}
              className="form-select my-3"
            >
              <option value="excel">Excel (.xlsx)</option>
              <option value="pdf">PDF (.pdf)</option>
              <option value="word">Word (.docx)</option>
              <option value="csv">CSV (.csv)</option>
            </select>
            <div className="d-flex justify-content-end">
              <button
                className="btn btn-primary me-2 d-flex align-items-center"
                onClick={() => downloadFile(selectedFormat)}
                disabled={isLoading}
              >
                <span className="material-symbols-outlined me-1">download</span>
                {isLoading ? "Downloading..." : "Download"}
              </button>
              <button
                className="btn btn-secondary d-flex align-items-center"
                onClick={() => setShowModal(false)}
              >
                <span className="material-symbols-outlined me-1">close</span>
                Cancel
              </button>
            </div>
          </div>
        </div>
      )}

      {/* Mensajes de error */}
      {error && <p className="text-danger mt-2">{error}</p>}
    </div>
  );
};

export default DownloadFile; 
