import { useEffect, useState } from "react";
import { Link, useParams, useNavigate } from "react-router-dom";
import Config from "../Config";
import Enum from "../components/Enum";

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

    

    useEffect(() => {
        const getSowById = async () => {
            try {
                const response = await Config.getSowsById(id);
                const data = response.data;
                setFormData(data);

            } catch (error) {
                console.error("Error fetching SOW:", error);
                navigate("/error");
            }
        };
        getSowById();
    }, [id, navigate]);

   


    const fields = [
        { label: "Sow Ticket", name: "ticket_sow", type: "text", col: 8 },
        { label: "CLS", name: "cls", type: "text", col: 8 },
        { label: "Opportunity Name", name: "opportunity_name", type: "text", col: 8 },
        { label: "Opportunity ID", name: "opportunity_id", type: "text", col: 8 },
        { label: "Account Name", name: "account_name", type: "text", col: 8 },
        { label: "Delivery Team", name: "delivery_team", type: "text", col: 8 },
        { label: "Ticket Date", name: "ticket_date", type: "date", col: 8 },
        { label: "Create_at", name: "create_at", type: "date", col: 8 },
        { label: "Description", name: "sow_description", type: "textarea", col: 8 },
        { label: "Priority", name: "priority", type: "select", col: 8, field: "priority" },
        { label: "Sow Due Date", name: "sow_due_date", type: "date", col: 8 },
        { label: "Effort Due Date", name: "effort_due_date", type: "date", col: 8 },
        { label: "Sow Status", name: "sow_status", type: "select", col: 8, field: "sow_status" },
        { label: "Delivery Date", name: "sow_delivery_date", type: "date", col: 8 },
        { label: "Effort Owner", name: "effort_owner", type: "text", col: 8},
        { label: "Project ID", name: "project_id", type: "text", col: 8 },
        { label: "Sow Owner", name: "sow_owner", type: "text", col: 8 },
        { label: "Effort Status", name: "effort_status", type: "select", col: 8, field: "effort_status" },
        { label: "Effort Delivery Date", name: "effort_delivery_date", type: "date", col: 8 },
        { label: "Comments", name: "comments", type: "textarea", col: 8 },
        { label: "Sow Link", name: "sow_link", type: "text", col: 8 },
        { label: "Effort Link", name: "effort_link", type: "text", col: 8 },
    ];

    return (
        <div className=" ms-5 me-5">
            <div className="row mt-3 d-flex justify-content-center">
                <div className="col-lg-10">
                    <div className="card mt-3 mb-3">
                        <div className="card-body ps-5 pe-5">
                            <div className="d-flex">
                            <div className="col-sm-2">
                                        <Link
                                            to="/reader/sow"
                                            className="btn btn-secondary  d-flex align-items-center"
                                            style={{width: "100px"}}
                                        >
                                            <span className="material-symbols-outlined me-2">
                                                arrow_back
                                            </span>{" "}
                                            Back
                                        </Link>
                                    </div>
                            <h3 className="card-title text-center col-sm-8 mb-4">SOW DETAILS</h3>
                            </div>
                            <form>
                                <div className="form-row d-flex flex-column justify-content-center">
                              
                                
                                    {fields.map((field, index) => (
                                        <div
                                            key={index}
                                            className={`col-md-${field.col} mb-3 mx-auto`}
                                        >
                                            <label className="mb-1 semi-bold">{field.label}</label>
                                            {field.type === "textarea" ? (
                                                <textarea
                                                    className="form-control"
                                                    name={field.name}
                                                    value={formData[field.name] || ''}
                                                    
                                                />
                                            ) : field.type === "select" ? (
                                                
                                                <Enum
                                                    value={formData[field.name] || ''}
                                                    
                                                     field={field.name}
                                                     onChange={() => {}}
                                                     disabled
                                                />
                                            ) : (
                                                <input
                                                    className="form-control"
                                                    type={field.type}
                                                    name={field.name}
                                                    value={formData[field.name] || ''}
                                                    
                                                />
                                            )}
                                        </div>
                                    ))}
                                </div>
                            </form>
                            </div>
                        </div>
                </div>
            </div>
        </div>
    );
};

export default SowDetails;

