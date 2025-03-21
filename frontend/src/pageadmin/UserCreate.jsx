import { useEffect, useState } from "react";
import Siderbar from "./Sidebar";
import Config from "../Config";
import { Link, useNavigate, useParams } from "react-router-dom";

const UserCreate = () => {
  const navigate = useNavigate();
  const { id } = useParams();

  // Estados
  const [name, setName] = useState("");
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [password_confirmation, setPasswordConfirmation] = useState("");
  const [roles, setRoles] = useState([]);
  const [selectedRole, setSelectedRole] = useState(""); // Cambiado a un solo valor
  const [errors, setErrors] = useState({});
  const [loadingRoles, setLoadingRoles] = useState(true);

  // Cargar roles al montar el componente
  useEffect(() => {
    const fetchRoles = async () => {
      try {
        const response = await Config.getUserRol();
        console.log("Roles cargados (fetchRoles):", response);

        // Agregar el rol "pm" si no está en la lista
        const updatedRoles = [...response];
        if (!updatedRoles.some((role) => role.name === "pm")) {
          updatedRoles.push({ id: 999, name: "pm" });
        }

        setRoles(updatedRoles);
      } catch (error) {
        console.error("Error al obtener roles:", error);
      } finally {
        setLoadingRoles(false);
      }
    };
    fetchRoles();
  }, []);

  // Manejar selección de roles (solo un rol a la vez)
  const handleRoleChange = (role) => {
    setSelectedRole(role);
    console.log("Rol seleccionado:", role);
  };

  // Crear usuario
  const submitCreate = async (ev) => {
    ev.preventDefault();
    try {
      // Armar objeto que se enviará al backend
      const currentUser = {
        name,
        email,
        password,
        password_confirmation,
        roles: [selectedRole], // Se envía solo el rol seleccionado
      };
      console.log("Datos que se enviarán al backend:", currentUser);

      // Llamar a la API para crear
      const response = await Config.getUserCreate(currentUser);
      console.log("Respuesta del backend tras crear usuario:", response.data);

      console.log("Usuario creado correctamente");
      navigate("/admin/user");
    } catch (error) {
      console.error("Error en la creación de usuario:", error);
      if (error.response && error.response.data && error.response.data.errors) {
        setErrors(error.response.data.errors);
      } else {
        console.error("Error inesperado:", error);
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
            <div className="card">
              <div className="card-header w-100">
                <div className="d-flex">
                  <Link
                    to={-1}
                    className="btn btn-secondary d-flex align-items-center"
                  >
                    <span className="material-symbols-outlined me-1">
                      arrow_back
                    </span>
                    Back
                  </Link>
                  <div className="col-sm-8">
                    <h4 className="d-flex justify-content-center">
                      Create User
                    </h4>
                  </div>
                </div>
              </div>

              <div className="card-body ps-5 pe-5">
                <form onSubmit={submitCreate}>
                  {/* Name */}
                  <div className="col-sm-12 mt-3">
                    <label htmlFor="name">Name:</label>
                    <input
                      type="text"
                      className="form-control"
                      name="name"
                      value={name}
                      onChange={(e) => setName(e.target.value)}
                    />
                    {errors.name && (
                      <div className="text-danger">{errors.name}</div>
                    )}
                  </div>

                  {/* Email */}
                  <div className="col-sm-12 mt-3">
                    <label htmlFor="email">Email:</label>
                    <input
                      type="email"
                      className="form-control"
                      name="email"
                      value={email}
                      onChange={(e) => setEmail(e.target.value)}
                    />
                    {errors.email && (
                      <div className="text-danger">{errors.email}</div>
                    )}
                  </div>

                  {/* Password */}
                  <div className="col-sm-12 mt-3">
                    <label htmlFor="password">Password:</label>
                    <input
                      type="password"
                      className="form-control"
                      name="password"
                      value={password}
                      onChange={(e) => setPassword(e.target.value)}
                    />
                    {errors.password && (
                      <div className="text-danger">{errors.password}</div>
                    )}
                  </div>

                  {/* Password Confirmation */}
                  <div className="col-sm-12 mt-3">
                    <label htmlFor="password_confirmation">
                      Password Confirmation:
                    </label>
                    <input
                      type="password"
                      className="form-control"
                      name="password_confirmation"
                      value={password_confirmation}
                      onChange={(e) => setPasswordConfirmation(e.target.value)}
                    />
                    {errors.password_confirmation && (
                      <div className="text-danger">
                        {errors.password_confirmation}
                      </div>
                    )}
                  </div>

                  {/* Roles */}
                  <div className="col-sm-12 mt-3">
                    <label htmlFor="roles">Roles:</label>
                    {loadingRoles ? (
                      <div>Loading roles...</div>
                    ) : (
                      <div className="role-checkboxes">
                        {roles.length > 0 ? (
                          roles.map((role) => (
                            <div key={role.id} className="form-check">
                              <input
                                className="form-check-input"
                                type="radio"
                                name="role"
                                value={role.name}
                                checked={selectedRole === role.name}
                                onChange={() => handleRoleChange(role.name)}
                              />
                              <label className="form-check-label">
                                {role.name}
                              </label>
                            </div>
                          ))
                        ) : (
                          <div>No hay roles disponibles</div>
                        )}
                      </div>
                    )}
                    {errors.roles && (
                      <div className="text-danger">{errors.roles}</div>
                    )}
                  </div>

                  {/* Botón Submit */}
                  <div className="btn-group mt-3">
                    <button type="submit" className="btn btn-primary d-flex">
                      <span className="material-symbols-outlined">
                        add_circle
                      </span>
                      Create User
                    </button>
                  </div>
                </form>
              </div>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
};

export default UserCreate;
