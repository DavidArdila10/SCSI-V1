import { useEffect, useState } from "react";
import { Link } from "react-router-dom";
import Config from "../Config";
import Siderbar from "./Siderbar";
import Pagination from "../components/Pagination";
import DownloadFile from "../components/DownloadFile";
import DateSearchBar from "../components/DateSearchBar";

const SowAll = () => {
  const [sow, setSow] = useState([]);
  const [loading, setLoading] = useState(true);
  const [currentPage, setCurrentPage] = useState(1);
  const [totalPages, setTotalPages] = useState(1);
  const [searchTerm, setSearchTerm] = useState("");

  // Estados para las mini barras de búsqueda
  const [clientSearch, setClientSearch] = useState("");
  const [teamSearch, setTeamSearch] = useState("");
  const [statusSearch, setStatusSearch] = useState("");

  const [allSows, setAllSows] = useState([]);
  const [filteredByDate, setFilteredByDate] = useState([]); // Mantenemos

  // Guardar las fechas
  const [startDate, setStartDate] = useState("");
  const [endDate, setEndDate] = useState("");

  // << NUEVO: Guardar el número de páginas del servidor aparte
  const [serverTotalPages, setServerTotalPages] = useState(1);

  // Carga la data paginada del servidor (la que se ve por defecto si NO hay filtros)
  useEffect(() => {
    const fetchSows = async (page) => {
      try {
        const response = await Config.getSowAll(page);
        if (response && response.data) {
          if (Array.isArray(response.data)) {
            setSow(response.data);
            setTotalPages(response.last_page);
            // << NUEVO: Guardamos también en serverTotalPages
            setServerTotalPages(response.last_page);
          } else if (Array.isArray(response.data.data)) {
            setSow(response.data.data);
            setTotalPages(response.data.last_page);
            // << NUEVO:
            setServerTotalPages(response.data.last_page);
          } else {
            console.error("Los datos no son un array:", response.data.data);
          }
        } else {
          console.error("Respuesta inválida:", response);
        }
      } catch (error) {
        console.error("Error al obtener datos:", error);
      } finally {
        setLoading(false);
      }
    };
    fetchSows(currentPage);
  }, [currentPage]);

  // Carga TODOS los SOW (todas las páginas) para filtrar localmente
  useEffect(() => {
    const fetchAllSows = async () => {
      try {
        let allData = [];
        let page = 1;
        let lastPage = 1;

        do {
          const response = await Config.getSowAll(page);
          if (response && response.data) {
            if (Array.isArray(response.data)) {
              allData = allData.concat(response.data);
              lastPage = response.last_page;
            } else if (Array.isArray(response.data.data)) {
              allData = allData.concat(response.data.data);
              lastPage = response.data.last_page;
            } else {
              console.error("Los datos no son un array:", response.data.data);
              break;
            }
          } else {
            console.error("Respuesta inválida:", response);
            break;
          }
          page++;
        } while (page <= lastPage);

        setAllSows(allData);
      } catch (error) {
        console.error("Error al obtener datos:", error);
      }
    };
    fetchAllSows();
  }, []);

  // Verifica si hay algún filtro activo
  const isFiltering = () => {
    return (
      (!!startDate && !!endDate) ||
      !!searchTerm ||
      !!clientSearch ||
      !!teamSearch ||
      !!statusSearch
    );
  };

  const handlePageChange = (page) => {
    setCurrentPage(page);
    setLoading(true);
  };

  // Forzar ir a la página 1 al cambiar los campos
  const handleSearchChange = (e) => {
    setSearchTerm(e.target.value);
    setCurrentPage(1);
  };
  const handleClientSearch = (e) => {
    setClientSearch(e.target.value);
    setCurrentPage(1);
  };
  const handleTeamSearch = (e) => {
    setTeamSearch(e.target.value);
    setCurrentPage(1);
  };
  const handleStatusSearch = (e) => {
    setStatusSearch(e.target.value);
    setCurrentPage(1);
  };

  // Filtrar por fechas desde DateSearchBar
  const handleDateSearch = (startD, endD) => {
    if (!startD || !endD) {
      setFilteredByDate([]);
      setStartDate("");
      setEndDate("");
      setCurrentPage(1);
      return;
    }
    const filtered = allSows.filter((item) => {
      const dateField = new Date(item.ticket_date);
      const start = new Date(startD);
      const end = new Date(endD);
      return dateField >= start && dateField <= end;
    });
    setFilteredByDate(filtered);
    setStartDate(startD);
    setEndDate(endD);
    setCurrentPage(1);
  };

  // Filtro combinado original
  const filteredSows = allSows.filter((item) =>
    (item.ticket_sow?.toLowerCase() || "").includes(searchTerm.toLowerCase()) ||
    (item.sow_description?.toLowerCase() || "").includes(searchTerm.toLowerCase()) ||
    (item.project_id?.toString().toLowerCase() || "").includes(searchTerm.toLowerCase()) ||
    (item.ticket_date?.toLowerCase() || "").includes(searchTerm.toLowerCase())
  );

  const filteredByIndividualSearch = filteredSows.filter((item) =>
    (clientSearch === "" || (item.account_name?.toLowerCase() || "").includes(clientSearch.toLowerCase())) &&
    (teamSearch === "" || (item.delivery_team?.toLowerCase() || "").includes(teamSearch.toLowerCase())) &&
    (statusSearch === "" || (item.sow_status?.toLowerCase() || "").includes(statusSearch.toLowerCase()))
  );

  // Pipeline final por fechas + texto
  let finalFilteredData = allSows;

  // 1) Fechas
  if (startDate && endDate) {
    const start = new Date(startDate);
    const end = new Date(endDate);
    finalFilteredData = finalFilteredData.filter((item) => {
      const dateField = new Date(item.ticket_date);
      return dateField >= start && dateField <= end;
    });
  }

  // 2) Búsqueda general
  finalFilteredData = finalFilteredData.filter((item) =>
    (item.ticket_sow?.toLowerCase() || "").includes(searchTerm.toLowerCase()) ||
    (item.sow_description?.toLowerCase() || "").includes(searchTerm.toLowerCase()) ||
    (item.project_id?.toString().toLowerCase() || "").includes(searchTerm.toLowerCase()) ||
    (item.ticket_date?.toLowerCase() || "").includes(searchTerm.toLowerCase())
  );

  // 3) Búsqueda por client, team, status
  finalFilteredData = finalFilteredData.filter((item) =>
    (clientSearch === "" || (item.account_name?.toLowerCase() || "").includes(clientSearch.toLowerCase())) &&
    (teamSearch === "" || (item.delivery_team?.toLowerCase() || "").includes(teamSearch.toLowerCase())) &&
    (statusSearch === "" || (item.sow_status?.toLowerCase() || "").includes(statusSearch.toLowerCase()))
  );

  // Si no hay filtros => sow (paginación servidor), si hay => finalFilteredData en 1 página
  const filtering = isFiltering();
  let dataToDisplay;
  if (!filtering) {
    dataToDisplay = sow; // Paginación server
  } else {
    dataToDisplay = finalFilteredData; // Todo en 1 sola página
  }

  // UseEffect para ajustar totalPages cuando se encienden/apagan los filtros
  useEffect(() => {
    if (!filtering) {
      // Sin filtros => restaurar totalPages a lo que diga el servidor
      setTotalPages(serverTotalPages);
    } else {
      // Con filtros => 1 sola página
      setTotalPages(1);
    }
  }, [filtering, serverTotalPages]);

  // // Dejar la línea original comentada
  // const dataToDisplay = filteredByDate.length > 0
  //   ? filteredByDate
  //   : searchTerm || clientSearch || teamSearch || statusSearch
  //   ? filteredByIndividualSearch
  //   : sow;

  const formatDate = (dateString) => {
    const [year, month, day] = dateString.split("T")[0].split("-");
    return `${month}/${day}/${year}`;
  };

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
                  {/* Botones New y Kanban, uno debajo del otro */}
                  <div className="me-3" style={{ marginBottom: "70px" }}>
                    <div className="mb-2">
                      
                    </div>
                    <div>
                      
                    </div>
                  </div>
                  <div style={{ width: "27%", marginTop: "38px" }}>
                    <input
                      type="text"
                      className="form-control"
                      placeholder="Search..."
                      value={searchTerm}
                      onChange={handleSearchChange}
                    />
                  </div>
                  <div style={{ width: "20%" }}>
                    <DateSearchBar onSearch={handleDateSearch} />
                  </div>
                  <div style={{ width: "10%" }}>
                    <DownloadFile data={allSows} />
                  </div>
                </div>

                <div className="table-responsive-xl mt-3">
                  <table className="table table-hover table-bordered align-middle">
                    <thead>
                      <tr className="table-secondary">
                        <th>S.O.W-Ticket</th>
                        <th>
                          Client
                          <input
                            type="text"
                            className="form-control form-control-sm d-inline ms-2"
                            style={{ width: "120px" }}
                            placeholder="Filter..."
                            value={clientSearch}
                            onChange={handleClientSearch}
                          />
                        </th>
                        <th>Description</th>
                        <th>Project</th>
                        <th>
                          Team
                          <input
                            type="text"
                            className="form-control form-control-sm d-inline ms-2"
                            style={{ width: "120px" }}
                            placeholder="Filter..."
                            value={teamSearch}
                            onChange={handleTeamSearch}
                          />
                        </th>
                        <th>Date</th>
                        <th>
                          Status
                          <input
                            type="text"
                            className="form-control form-control-sm d-inline ms-2"
                            style={{ width: "120px" }}
                            placeholder="Filter..."
                            value={statusSearch}
                            onChange={handleStatusSearch}
                          />
                        </th>
                        
                      </tr>
                    </thead>
                    <tbody>
                      {loading ? (
                        <tr>
                          <td colSpan="8">Loading...</td>
                        </tr>
                      ) : dataToDisplay && dataToDisplay.length > 0 ? (
                        dataToDisplay.map((item) => (
                          <tr key={item.ticket_sow}>
                            <td>{item.ticket_sow}</td>
                            <td>{item.account_name}</td>
                            <td>{item.sow_description}</td>
                            <td>{item.project_id}</td>
                            <td>{item.delivery_team}</td>
                            <td>{formatDate(item.ticket_date)}</td>
                            <td>{item.sow_status?.toUpperCase() || "UNKNOWN"}</td>
                            
                          </tr>
                        ))
                      ) : (
                        <tr>
                          <td colSpan="8">Sows not found</td>
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

export default SowAll;
