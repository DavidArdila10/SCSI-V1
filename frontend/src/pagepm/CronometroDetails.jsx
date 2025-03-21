import { useEffect, useState } from "react";
import { Link, useParams, useNavigate } from "react-router-dom";
import Config from "../Config";
import moment from "moment";

const CronometroDetails = () => {
  const { id } = useParams();
  const navigate = useNavigate();

  // Agregamos PM_assigned al estado inicial
  const [formData, setFormData] = useState({
    PM: "",
    PM_assigned: "",       // <-- NUEVO
    description: "",
    EAC: "",
    ETC: "",
    TE: "",
    TPC: "",
    TPI: "",
    date: "",
    // Eliminados: start_date, accumulated_hours, accumulated_days
  });

  const [creatorInfo, setCreatorInfo] = useState(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);

  useEffect(() => {
    const fetchData = async () => {
      try {
        // Obtiene datos del cronómetro
        const data = await Config.getCronometroById(id);
        console.log("Datos del Cronómetro recibidos:", data);

        // Actualiza el estado del formulario con los datos recibidos
        setFormData((prevState) => ({
          ...prevState,
          ...data,
        }));

        // Verifica si `id` está presente para obtener información adicional del creador
        if (data.id) {
          try {
            const creator = await Config.getCronometroCreateInfo(data.id);
            console.log("Información del creador recibida:", creator);
            setCreatorInfo(creator || null);
          } catch (creatorError) {
            console.error("Error al obtener información del creador:", creatorError);
            setCreatorInfo(null);
          }
        }
      } catch (fetchError) {
        console.error("Error al obtener datos del Cronómetro:", fetchError);
        setError("No se pudo cargar la información del Cronómetro.");
      } finally {
        setLoading(false);
      }
    };

    fetchData();
  }, [id]);

  const handleChange = (e) => {
    const { name, value } = e.target;
    setFormData((prevState) => ({
      ...prevState,
      [name]: value,
    }));
  };

  const submitUpdate = async (ev) => {
    ev.preventDefault();
    try {
      await Config.updateCronometro(formData, id);
      console.log("Cronómetro actualizado correctamente");
      navigate("/pm/cronometros");
    } catch (error) {
      console.error("Error al actualizar Cronómetro:", error);
    }
  };

  const handleDelete = async () => {
    try {
      await Config.deleteCronometroById(id);
      console.log("Cronómetro eliminado correctamente");
      navigate("/pm/cronometros");
    } catch (error) {
      console.error("Error al eliminar Cronómetro:", error);
    }
  };

  if (loading) {
    return <div>Loading...</div>;
  }

  if (error) {
    return (
      <div className="ms-5 me-5">
        <h3>Error</h3>
        <p>{error}</p>
        <button onClick={() => navigate("/pm/cronometros")} className="btn btn-primary">
          Volver
        </button>
      </div>
    );
  }

  // Agregamos PM_assigned a los campos a renderizar
  const fields = [
    { label: "PM", name: "PM", type: "text" },
    { label: "PM Assigned", name: "PM_assigned", type: "text" }, // <-- NUEVO
    { label: "Description", name: "description", type: "textarea" },
    { label: "EAC", name: "EAC", type: "text" },
    { label: "ETC", name: "ETC", type: "text" },
    { label: "Execution Time", name: "TE", type: "number" },
    { label: "Client Break", name: "TPC", type: "number" },
    { label: "Intraway Break", name: "TPI", type: "number" },
    { label: "Date", name: "date", type: "date" },
  ];

  return (
    <div className="ms-5 me-5">
      <div className="row mt-3 d-flex justify-content-center">
        <div className="col-lg-10">
          <div className="card mt-3 mb-3">
            <div className="card-body ps-5 pe-5">
              <div className="d-flex">
                <div className="col-sm-2">
                  <Link
                    to="/pm/cronometros"
                    className="btn btn-secondary d-flex align-items-center"
                    style={{ width: "100px" }}
                  >
                    <span className="material-symbols-outlined me-2">arrow_back</span>
                    Back
                  </Link>
                </div>
                <h3 className="card-title text-center col-sm-8 mb-4">
                  Cronómetro Details
                </h3>
              </div>
              <form onSubmit={submitUpdate}>
                <div className="row g-3">
                  {fields.map((field, index) => {
                    // Si es "description" => col-md-12; si no => col-md-6
                    const colClass =
                      field.name === "description" ? "col-md-12" : "col-md-6";

                    return (
                      <div key={index} className={colClass}>
                        <label className="mb-1 semi-bold">{field.label}</label>
                        {field.type === "textarea" ? (
                          <textarea
                            className="form-control"
                            name={field.name}
                            value={formData[field.name] || ""}
                            onChange={handleChange}
                            rows={3}
                          />
                        ) : (
                          <input
                            className="form-control"
                            type={field.type}
                            name={field.name}
                            value={formData[field.name] || ""}
                            onChange={handleChange}
                          />
                        )}
                      </div>
                    );
                  })}
                </div>

                <div className="form-group d-flex justify-content-between mt-4">
                  <button
                    type="submit"
                    className="btn btn-primary d-flex align-items-center"
                  >
                    <span className="material-symbols-outlined">upgrade</span>
                    Update 
                  </button>
                  <button
                    type="button"
                    onClick={handleDelete}
                    className="btn btn-danger d-flex align-items-center"
                  >
                    <span className="material-symbols-outlined">delete</span>
                    Delete
                  </button>
                </div>
              </form>

              <div className="mt-4">
                <h4>Creator Information</h4>
                {creatorInfo ? (
                  <>
                    <p>
                      <strong>Author:</strong> {creatorInfo.user_name || "N/A"}
                    </p>
                    <p>
                      <strong>Created in:</strong>{" "}
                      {creatorInfo.created_at
                        ? moment(creatorInfo.created_at).format("MMMM Do YYYY, h:mm:ss a")
                        : "N/A"}
                    </p>
                  </>
                ) : (
                  <p>Información no encontrada.</p>
                )}
              </div>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
};

export default CronometroDetails;
