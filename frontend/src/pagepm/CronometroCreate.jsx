import { Link, useNavigate } from "react-router-dom";
import Siderbar from "./Sidebar";
import Config from "../Config";
import { useState } from "react";

const CronometroCreate = () => {
  // Agregamos 'PM_assigned' después de 'PM'
  const fields = [
    { label: "PM", name: "PM", type: "text" },
    { label: "PM Assigned", name: "PM_assigned", type: "text" }, 
    { label: "Description", name: "description", type: "textarea" },
    { label: "Estimated time to complete", name: "EAC", type: "text" },
    { label: "Estimated completion time", name: "ETC", type: "text" },
    { label: "Execution Time", name: "TE", type: "number" },
    { label: "Client Break", name: "TPC", type: "number" },
    { label: "Intraway Break", name: "TPI", type: "number" },
    { label: "Date", name: "date", type: "date" },
  ];

  const [formData, setFormData] = useState({});
  const [errors, setErrors] = useState({});
  const navigate = useNavigate();

  const handleChange = (e) => {
    const { name, value } = e.target;
    setFormData({ ...formData, [name]: value });
  };

  const submitCreate = async (e) => {
    e.preventDefault();
    try {
      const response = await Config.createCronometro(formData);
      console.log(response.data);
      navigate("/pm/cronometros");
    } catch (error) {
      if (error.response && error.response.data && error.response.data.errors) {
        const serverErrors = error.response.data.errors;
        const newErrors = {};
        Object.keys(serverErrors).forEach((key) => {
          newErrors[key] = serverErrors[key][0];
        });
        setErrors(newErrors);
      } else {
        console.error("Unexpected error:", error);
      }
    }
  };

  return (
    <div style={{ overflow: "hidden" }}>
      <div className="row">
        <div className="col-sm-1">
          <Siderbar />
        </div>
        <div className="col-sm-11 mt-3 mb-3">
          <div className="me-4">
            <div className="card border border-dark-subtle">
              <div className="card-body ps-5 pe-5">
                <div className="d-flex">
                  <div className="col-sm-2">
                    <Link
                      to={-1}
                      className="btn btn-secondary d-flex justify-content-center"
                      style={{ width: "100px" }}
                    >
                      <span className="material-symbols-outlined me-2">
                        arrow_back
                      </span>
                      Back
                    </Link>
                  </div>
                  <h3 className="card-title text-center col-sm-8 mb-4">
                    Cronómetro Create
                  </h3>
                </div>

                <form onSubmit={submitCreate}>
                  {/* row g-3 => separa campos con 'gap' */}
                  <div className="row g-3">
                    {fields.map((field, index) => {
                      const isDaysField =
                        field.name === "TE" ||
                        field.name === "TPC" ||
                        field.name === "TPI";
                      // Si es "description", ocupamos col-md-12
                      const colClass =
                        field.name === "description" ? "col-md-12" : "col-md-6";

                      return (
                        <div key={index} className={colClass}>
                          <label className="semi-bold">{field.label}</label>
                          {field.type === "textarea" ? (
                            <textarea
                              className="form-control"
                              name={field.name}
                              value={formData[field.name] || ""}
                              onChange={handleChange}
                              rows={3}
                            />
                          ) : (
                            <>
                              {isDaysField ? (
                                <div className="input-group">
                                  <input
                                    className="form-control"
                                    type={field.type}
                                    name={field.name}
                                    value={formData[field.name] || ""}
                                    onChange={handleChange}
                                  />
                                  <span className="input-group-text">Days</span>
                                </div>
                              ) : (
                                <input
                                  className="form-control"
                                  type={field.type}
                                  name={field.name}
                                  value={formData[field.name] || ""}
                                  onChange={handleChange}
                                />
                              )}
                            </>
                          )}
                          {errors[field.name] && (
                            <div className="text-danger">
                              {errors[field.name]}
                            </div>
                          )}
                        </div>
                      );
                    })}
                  </div>

                  <button
                    type="submit"
                    className="btn btn-primary d-flex mt-4"
                  >
                    <span className="material-symbols-outlined">
                      add_circle
                    </span>
                    Create Cronómetro
                  </button>
                </form>
              </div>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
};

export default CronometroCreate;
