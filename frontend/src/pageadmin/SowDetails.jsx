import { useEffect, useState } from "react";
import { Link, useParams, useNavigate } from "react-router-dom";
import Config from "../Config";
import Enum from "../components/Enum";
import moment from "moment";

const SowDetails = () => {
    const { id } = useParams();
    const navigate = useNavigate();

    const [formData, setFormData] = useState({
        ticket_sow: "",
        cls: "",
        opportunity_name: "",
        opportunity_id: "",
        account_name: "",
        delivery_team: "",
        ticket_date: "",
        sow_description: "",
        priority: "",
        sow_due_date: "",
        effort_due_date: "",
        project_id: "",
        sow_owner: "",
        sow_status: "",
        sow_delivery_date: "",
        effort_owner: "",
        effort_status: "",
        effort_delivery_date: "",
        comments: "",
        sow_link: "",
        effort_link: "",
    });

    const [creatorInfo, setCreatorInfo] = useState(null);
    const [loading, setLoading] = useState(true);
    const [error, setError] = useState(null);

    useEffect(() => {
        const fetchData = async () => {
            try {
                // Obtén los datos del SOW
                const data = await Config.getSowById(id);
                console.log("Datos del SOW recibidos:", data);
    
                // Actualiza el estado del formulario con los datos recibidos
                setFormData((prevState) => ({
                    ...prevState,
                    ...data,
                }));
    
                // Verifica si `ticket_sow` está presente para hacer la segunda solicitud
                if (data.ticket_sow) {
                    try {
                        const creatorInfo = await Config.getSowCreateInfo(data.ticket_sow);
                        console.log("Información del creador recibida:", creatorInfo);
                        setCreatorInfo(creatorInfo || null);
                    } catch (creatorError) {
                        console.error("Error al obtener información del creador:", creatorError);
                        setCreatorInfo(null);
                    }
                } else {
                    console.warn("El campo `ticket_sow` no está definido en los datos recibidos.");
                }
            } catch (fetchError) {
                console.error("Error al obtener datos del SOW:", fetchError);
                setError("No se pudo cargar la información del SOW.");
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
            await Config.getSowUpdate(formData, id);
            console.log("Sow actualizado correctamente");
            navigate("/admin/sow");
        } catch (error) {
            console.error("Error al actualizar SOW:", error);
        }
    };

    const handleDelete = async () => {
        try {
            await Config.getSowDeleteById(id);
            console.log("Sow eliminado correctamente");
            navigate("/admin/sow");
        } catch (error) {
            console.error("Error al eliminar SOW:", error);
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
                <button onClick={() => navigate("/admin/sow")} className="btn btn-primary">
                    Volver
                </button>
            </div>
        );
    }

    const fields = [
        { label: "Sow Ticket *", name: "ticket_sow", type: "text", col: 8 },
        { label: "Delivery Team *", name: "delivery_team", type: "text", col: 8 },
        { label: "Ticket Date *", name: "ticket_date", type: "date", col: 8 },
        { label: "Description *", name: "sow_description", type: "textarea", col: 8 },
        { label: "Sow Status *", name: "sow_status", type: "select", col: 8, field: "sow_status" },
        { label: "CLS", name: "cls", type: "text", col: 8 },
        { label: "Opportunity Name", name: "opportunity_name", type: "text", col: 8 },
        { label: "Opportunity ID", name: "opportunity_id", type: "text", col: 8 },
        { label: "Account Name", name: "account_name", type: "text", col: 8 },
        { label: "Create_at", name: "create_at", type: "date", col:8},
        { label: "Priority", name: "priority", type: "select", col: 8, field: "priority" },
        { label: "Sow Due Date", name: "sow_due_date", type: "date", col: 8},
        { label: "Effort Due Date", name: "effort_due_date", type: "date", col: 8 },
        { label: "Delivery Date", name: "sow_delivery_date", type: "date", col: 8},
        { label: "Effort Owner", name: "effort_owner", type: "text", col: 8 },
        { label: "Project ID", name: "project_id", type: "text", col: 8 },
        { label: "Sow Owner", name: "sow_owner", type: "text", col: 8 },
        { label: "Effort Status", name: "effort_status", type: "select", col: 8, field: "effort_status" },
        { label: "Effort Delivery Date", name: "effort_delivery_date", type: "date", col: 8 },
        { label: "Comments", name: "comments", type: "textarea", col: 8 },
        { label: "Sow Link", name: "sow_link", type: "text", col: 8 },
        { label: "Effort Link", name: "effort_link", type: "text", col: 8 },
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
                                        to="/admin/sow"
                                        className="btn btn-secondary d-flex align-items-center"
                                        style={{ width: "100px" }}
                                    >
                                        <span className="material-symbols-outlined me-2">arrow_back</span>
                                        Back
                                    </Link>
                                </div>
                                <h3 className="card-title text-center col-sm-8 mb-4">SOW DETAILS</h3>
                            </div>
                            <form onSubmit={submitUpdate}>
                                <div className="form-row d-flex flex-column justify-content-center">
                                    {fields.map((field, index) => (
                                        <div key={index} className={`col-md-${field.col} mb-3 mx-auto`}>
                                            <label className="mb-1 semi-bold">{field.label}</label>
                                            {field.type === "textarea" ? (
                                                <textarea
                                                    className="form-control"
                                                    name={field.name}
                                                    value={formData[field.name] || ""}
                                                    onChange={handleChange}
                                                />
                                            ) : field.type === "select" ? (
                                                <Enum
                                                    value={formData[field.name] || ""}
                                                    onChange={handleChange}
                                                    field={field.name}
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
                                    ))}
                                </div>
                                <div className="form-group d-flex justify-content-between mt-4">
                                    <button type="submit" className="btn btn-primary d-flex align-items-center">
                                        <span className="material-symbols-outlined">upgrade</span>
                                        Update Sow
                                    </button>
                                    <button type="button" onClick={handleDelete} className="btn btn-danger d-flex align-items-center">
                                        <span className="material-symbols-outlined">delete</span>
                                        Delete
                                    </button>
                                </div>
                            </form>
                            <div className="mt-4">
                                <h4>Creator Information</h4>
                                {creatorInfo ? (
                                    <>
                                        <p><strong>Author:</strong> {creatorInfo.user_name || "N/A"}</p>
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

export default SowDetails;
