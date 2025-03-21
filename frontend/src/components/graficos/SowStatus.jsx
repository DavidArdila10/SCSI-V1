import { useEffect, useState, useMemo } from "react";
import { Bar } from "react-chartjs-2";
import {
  Chart as ChartJS,
  CategoryScale,
  LinearScale,
  BarElement,
  Tooltip,
  LineElement,
  PointElement,
  LineController,
} from "chart.js";
import jsPDF from "jspdf";
import "jspdf-autotable";
import Config from "../../Config";

// Registrar los componentes de Chart.js
ChartJS.register(
  CategoryScale,
  LinearScale,
  BarElement,
  Tooltip,
  LineElement,
  PointElement,
  LineController
);

export default function SowStatus() {
  const [chartData, setChartData] = useState({
    labels: ["NEW", "IN_PROGRESS", "CLOSED", "BLOCKED", "CANCELLED"],
    datasets: [
      {
        type: "bar",
        label: "Quantity",
        data: [0, 0, 0, 0, 0],
        backgroundColor: [
          "#0057B7",
          "#2ECC71",
          "#E67E22",
          "#8E44AD",
          "#E74C3C",
        ],
        hoverBackgroundColor: [
          "#003f87",
          "#28a745",
          "#d35400",
          "#722b91",
          "#c0392b",
        ],
        borderColor: "#FFFFFF",
        borderWidth: 1,
        hoverBorderWidth: 3,
        // Para que la barra se pinte debajo
        order: 1,
      },
      // ← Se elimina la segunda dataset (línea)
    ],
  });

  const [isDarkMode, setIsDarkMode] = useState(() => {
    const theme =
      document.documentElement.getAttribute("data-bs-theme") || "light";
    return theme === "dark";
  });

  const [sowList, setSowList] = useState([]);
  const [selectedCategory, setSelectedCategory] = useState(null);
  const [showModal, setShowModal] = useState(false);
  const [loading, setLoading] = useState(false);

  useEffect(() => {
    const handleThemeChange = () => {
      const currentTheme =
        document.documentElement.getAttribute("data-bs-theme") || "light";
      setIsDarkMode(currentTheme === "dark");
    };

    const observer = new MutationObserver(() => {
      handleThemeChange();
    });

    observer.observe(document.documentElement, {
      attributes: true,
      attributeFilter: ["data-bs-theme"],
    });

    handleThemeChange();

    return () => {
      observer.disconnect();
    };
  }, []);

  useEffect(() => {
    const fetchAndSyncData = async () => {
        setLoading(true);
        try {
            let initialData = {
                NEW: 0,
                IN_PROGRESS: 0,
                CLOSED: 0,
                BLOCKED: 0,
                CANCELLED: 0,
            };

            const response = await Config.getSowStatus();
            response.data.forEach((item) => {
                if (item.sow_status) {
                    const normalizedStatus = item.sow_status.toUpperCase();
                    if (initialData[normalizedStatus] !== undefined) {
                        initialData[normalizedStatus] = 
                            item.total != null && !isNaN(item.total) ? item.total : 0;
                    }
                }
            });

            setChartData((prev) => ({
                ...prev,
                datasets: [
                    {
                        ...prev.datasets[0],
                        data: Object.values(initialData).map((val) =>
                            val != null && !isNaN(val) ? val : 0
                        ),
                    },
                ],
            }));
        } catch (error) {
            console.error("Error fetching chart data:", error);
        } finally {
            setLoading(false);
        }
    };

    fetchAndSyncData(); // Llamada inicial

    // 🚀 Escuchar cambios en los estados de los SOWs desde el Kanban
    const handleSowStatusUpdated = () => {
        fetchAndSyncData(); // Actualiza la gráfica cuando se mueva un SOW
    };

    window.addEventListener("sowStatusUpdated", handleSowStatusUpdated);

    return () => {
        window.removeEventListener("sowStatusUpdated", handleSowStatusUpdated);
    };
}, []);


  const handleBarClick = async (event, elements) => {
    // Medir tiempo antes de la carga
    const startTime = performance.now();

    if (elements.length > 0) {
      const index = elements[0].index;
      const category = chartData.labels[index];
      setSelectedCategory(category);

      setLoading(true);
      try {
        const cachedData = localStorage.getItem(`sow_${category}`);
        if (cachedData) {
          setSowList(JSON.parse(cachedData));
          setShowModal(true);
        }

        let allSows = [];
        let page = 1;
        let hasMoreData = true;

        while (hasMoreData) {
          const response = await Config.getSowAll(page);
          if (response.data && response.data.length > 0) {
            allSows = allSows.concat(response.data);
            page++;
          } else {
            hasMoreData = false;
          }
        }

        const filteredSows = allSows.filter(
          (sow) =>
            sow.sow_status && sow.sow_status.toUpperCase() === category
        );

        setSowList(filteredSows);
        localStorage.setItem(`sow_${category}`, JSON.stringify(filteredSows));
        setShowModal(true);
      } catch (error) {
        console.error("Error fetching SOWs:", error);
      } finally {
        setLoading(false);
        // Mostrar tiempo transcurrido en segundos
        console.log(
          `Tardó ${(performance.now() - startTime) / 1000} segundos en traer la información.`
        );
      }
    }
  };

  const generatePDF = () => {
    const doc = new jsPDF();
    doc.setFontSize(18);
    doc.text(`SOWs in Category: ${selectedCategory}`, 14, 22);
    doc.setFontSize(12);
    doc.autoTable({
      head: [
        [
          "S.O.W-Ticket",
          "Client",
          "Description",
          "Project",
          "Team",
          "Date",
          "Status",
        ],
      ],
      body: sowList.map((sow) => [
        sow.ticket_sow || "N/A",
        sow.account_name || "N/A",
        sow.sow_description || "N/A",
        sow.project_id || "N/A",
        sow.delivery_team || "N/A",
        sow.ticket_date || "N/A",
        sow.sow_status || "N/A",
      ]),
      startY: 30,
    });
    doc.save(`SOWs_${selectedCategory}.pdf`);
  };

  const memoizedChartData = useMemo(() => chartData, [chartData]);

  const closeModal = () => {
    setShowModal(false);
    setSelectedCategory(null);
    setSowList([]);
  };

  return (
    <div
      style={{
        display: "flex",
        justifyContent: "space-between",
        gap: "45px",
        alignItems: "flex-start",
      }}
    >
      {loading && (
        <div
          style={{
            position: "fixed",
            top: 0,
            left: 0,
            width: "100%",
            height: "100%",
            backgroundColor: "rgba(0, 0, 0, 0.5)",
            display: "flex",
            justifyContent: "center",
            alignItems: "center",
            zIndex: 1001,
          }}
        >
          <div className="spinner-border text-light" role="status">
            <span className="visually-hidden">Loading...</span>
          </div>
        </div>
      )}

      {showModal && (
        <div
          style={{
            position: "fixed",
            top: 0,
            left: 0,
            width: "100%",
            height: "100%",
            backgroundColor: "rgba(0, 0, 0, 0.5)",
            display: "flex",
            justifyContent: "center",
            alignItems: "center",
            zIndex: 1000,
          }}
        >
          <div
            style={{
              backgroundColor: isDarkMode ? "#333" : "#FFF",
              padding: "20px",
              borderRadius: "8px",
              width: "80%",
              maxHeight: "70%",
              overflowY: "auto",
            }}
          >
            <div
              style={{
                display: "flex",
                justifyContent: "space-between",
                alignItems: "center",
              }}
            >
              <h3 style={{ color: isDarkMode ? "#FFF" : "#000", margin: 0 }}>
                SOWs in Category:{" "}
                <span style={{ color: "#0057B7" }}>{selectedCategory}</span>
              </h3>
              <button
                onClick={generatePDF}
                style={{
                  backgroundColor: "transparent",
                  border: "none",
                  cursor: "pointer",
                }}
              >
                <i
                  className="fas fa-download"
                  style={{ fontSize: "24px", color: "#0057B7" }}
                ></i>
              </button>
            </div>
            <table
              className="table table-hover table-bordered align-middle"
              style={{ marginTop: "15px" }}
            >
              <thead>
                <tr className="table-secondary">
                  <th>S.O.W-Ticket</th>
                  <th>Client</th>
                  <th>Description</th>
                  <th>Project</th>
                  <th>Team</th>
                  <th>Date</th>
                  <th>Status</th>
                </tr>
              </thead>
              <tbody>
                {sowList.map((sow) => (
                  <tr key={sow.ticket_sow || Math.random()}>
                    <td>{sow.ticket_sow || "N/A"}</td>
                    <td>{sow.account_name || "N/A"}</td>
                    <td>{sow.sow_description || "N/A"}</td>
                    <td>{sow.project_id || "N/A"}</td>
                    <td>{sow.delivery_team || "N/A"}</td>
                    <td>{sow.ticket_date || "N/A"}</td>
                    <td>{sow.sow_status || "N/A"}</td>
                  </tr>
                ))}
                {sowList.length === 0 && (
                  <tr>
                    <td colSpan="7">No SOWs found for this category.</td>
                  </tr>
                )}
              </tbody>
            </table>
            <button
              onClick={closeModal}
              className="btn btn-secondary"
              style={{
                marginTop: "10px",
                display: "block",
                marginLeft: "auto",
                marginRight: "auto",
              }}
            >
              Close
            </button>
          </div>
        </div>
      )}

      <div style={{ width: "850px", height: "420px" }}>
        <Bar
          data={memoizedChartData}
          options={{
            responsive: true,
            maintainAspectRatio: false,
            plugins: {
              legend: {
                display: true,
              },
            },
            hover: {
              mode: "nearest",
              intersect: true,
            },
            onClick: handleBarClick,
            scales: {
              x: {
                title: {
                  display: true,
                  text: "Status",
                  color: isDarkMode ? "#FFFFFF" : "#000000",
                },
                ticks: {
                  color: isDarkMode ? "#FFFFFF" : "#000000",
                },
              },
              y: {
                title: {
                  display: true,
                  text: "Quantity",
                  color: isDarkMode ? "#FFFFFF" : "#000000",
                },
                beginAtZero: true,
                ticks: {
                  color: isDarkMode ? "#FFFFFF" : "#000000",
                },
              },
            },
          }}
        />
      </div>
    </div>
  );
}
