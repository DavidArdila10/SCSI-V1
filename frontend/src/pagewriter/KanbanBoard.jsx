import React, { useEffect, useState } from "react";
import { useNavigate } from "react-router-dom";
import { DragDropContext, Droppable, Draggable } from "@hello-pangea/dnd";
import Config from "../Config";

const KanbanBoard = () => {
  const navigate = useNavigate();
  const [sows, setSows] = useState([]);
  const [loading, setLoading] = useState(true);
  const [searchTerm, setSearchTerm] = useState("");

  // Estados posibles en el Kanban
  const statuses = ["new", "in_progress", "blocked", "cancelled", "closed"];

  // Obtener SOWs desde el backend
  useEffect(() => {
    const fetchSows = async () => {
      try {
        const response = await Config.getAllSowsNoPaginate();
        setSows(response);
      } catch (error) {
        console.error("Error obteniendo los SOWs:", error);
      } finally {
        setLoading(false);
      }
    };
    fetchSows();
  }, []);

  // Filtrar por búsqueda en ticket_sow y account_name (cliente)
  const filteredSows = sows.filter(
    (sow) =>
      sow.ticket_sow.toLowerCase().includes(searchTerm.toLowerCase()) ||
      (sow.account_name && sow.account_name.toLowerCase().includes(searchTerm.toLowerCase()))
  );

  // Agrupar SOWs por estado
  const columns = statuses.map((status) => ({
    status,
    items: filteredSows.filter((sow) => sow.sow_status === status),
  }));

  // Función de Drag & Drop
  const onDragEnd = async (result) => {
    if (!result.destination) return;

    const { source, destination, draggableId } = result;
    const newStatus = statuses[destination.droppableId]; // Obtener el nuevo estado

    // Buscar el SOW y actualizarlo en la UI
    const updatedSows = sows.map((sow) =>
      sow.ticket_sow === draggableId ? { ...sow, sow_status: newStatus } : sow
    );

    setSows(updatedSows); // Actualizar en el frontend inmediatamente

    // Enviar actualización al backend
    try {
      const response = await Config.getSowUpdate({ sow_status: newStatus }, draggableId);
      if (response && response.status === 200) {
        console.log(`✅ SOW ${draggableId} actualizado a ${newStatus}`);
        window.dispatchEvent(new Event("sowStatusUpdated")); // Notificar a SowStatus
      } else {
        console.warn(`⚠️ No se pudo actualizar el SOW ${draggableId} en el backend`);
      }
    } catch (error) {
      console.error("❌ Error actualizando el SOW:", error);
    }
  };

  return (
    <div className="container mt-4">
      {/* Botón "Back" y Barra de Búsqueda */}
      <div className="d-flex justify-content-between align-items-center mb-3">
        <button className="btn btn-secondary" onClick={() => navigate(-1)}>
          ← Back
        </button>
        <h2 className="text-center flex-grow-1">Kanban Board</h2>
        <input
          type="text"
          className="form-control"
          style={{ width: "300px" }}
          placeholder="Buscar por SOW Ticket o Cliente..."
          value={searchTerm}
          onChange={(e) => setSearchTerm(e.target.value)}
        />
      </div>

      {loading && <p>Cargando datos...</p>}

      {!loading && (
        <DragDropContext onDragEnd={onDragEnd}>
          <div style={{ display: "flex", justifyContent: "space-between" }}>
            {columns.map((column, index) => (
              <Droppable key={column.status} droppableId={index.toString()}>
                {(provided) => (
                  <div
                    ref={provided.innerRef}
                    {...provided.droppableProps}
                    style={{
                      width: "18%",
                      minHeight: "400px",
                      border: "1px solid #ccc",
                      borderRadius: "5px",
                      padding: "10px",
                      background: "#f9f9f9",
                      textAlign: "center",
                    }}
                  >
                    <h5
                      style={{
                        textTransform: "capitalize",
                        color: "#333",
                        fontWeight: "bold",
                      }}
                    >
                      {column.status.replace("_", " ")}
                    </h5>

                    {column.items.length === 0 && (
                      <p style={{ fontSize: "0.9rem", color: "#888" }}>
                        No tickets
                      </p>
                    )}

                    {column.items.map((item, idx) => (
                      <Draggable
                        key={item.ticket_sow}
                        draggableId={item.ticket_sow}
                        index={idx}
                      >
                        {(provided) => (
                          <div
                            ref={provided.innerRef}
                            {...provided.draggableProps}
                            {...provided.dragHandleProps}
                            style={{
                              background: "#fff",
                              marginBottom: "10px",
                              padding: "10px",
                              border: "1px solid #ddd",
                              borderRadius: "5px",
                              boxShadow: "2px 2px 5px rgba(0,0,0,0.1)",
                              cursor: "grab",
                              ...provided.draggableProps.style,
                            }}
                          >
                            <h6
                              style={{
                                color: "#007bff",
                                fontSize: "1rem",
                                fontWeight: "bold",
                              }}
                            >
                              {item.ticket_sow}
                            </h6>
                            <p
                              style={{
                                fontSize: "0.9rem",
                                color: "#555",
                                margin: "5px 0",
                              }}
                            >
                              {item.sow_description}
                            </p>
                            <small
                              style={{
                                display: "block",
                                color: "#888",
                                fontSize: "0.85rem",
                              }}
                            >
                              Cliente: {item.account_name || "N/A"}
                            </small>
                            <small
                              style={{
                                display: "block",
                                color: "#888",
                                fontSize: "0.85rem",
                              }}
                            >
                              Project: {item.project_id}
                            </small>
                          </div>
                        )}
                      </Draggable>
                    ))}
                    {provided.placeholder}
                  </div>
                )}
              </Droppable>
            ))}
          </div>
        </DragDropContext>
      )}
    </div>
  );
};

export default KanbanBoard;
