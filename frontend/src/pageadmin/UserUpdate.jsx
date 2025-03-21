import { useEffect, useState } from "react";
import Siderbar from "./Sidebar";
import Config from "../Config";
import { Link, useNavigate, useParams } from "react-router-dom";

const UserUpdate = () => {
  const navigate = useNavigate();
  const { id } = useParams();
  const [name, setName] = useState("");
  const [email, setEmail] = useState("");
  const [roles, setRoles] = useState([]);
  const [selectedRole, setSelectedRole] = useState(""); // Se cambió a un solo valor
  const [errors, setErrors] = useState({}); // Para manejar errores de validación

  useEffect(() => {
    const getUserById = async () => {
      try {
        const userData = await Config.getUserById(id);
        console.log("Datos del usuario: ", userData);
        setName(userData.name);
        setEmail(userData.email);
        if (userData.roles && Array.isArray(userData.roles) && userData.roles.length > 0) {
          setSelectedRole(userData.roles[0]); // Solo se toma un rol
        }
      } catch (error) {
        console.error("Error al obtener usuario:", error);
      }
    };

    const fetchRoles = async () => {
      try {
        const response = await Config.getUserRol();
        console.log("Roles disponibles: ", response);
        setRoles(response);
      } catch (error) {
        console.error("Error al obtener roles:", error);
      }
    };

    getUserById();
    fetchRoles();
  }, [id]);

  const handleRoleChange = (role) => {
    setSelectedRole(role);
    console.log("Rol seleccionado:", role);
  };

  const submitUpdate = async (ev) => {
    ev.preventDefault();
    try {
      const currentUser = { name, email, roles: [selectedRole] };
      await Config.getUserUpdate(currentUser, id);
      console.log("Usuario actualizado correctamente");
      navigate("/admin/user");
    } catch (error) {
      if (error.response && error.response.data && error.response.data.errors) {
        setErrors(error.response.data.errors);
      } else {
        console.error("Error al actualizar usuario:", error);
      }
    }
  };

  return (
    <div>
      <div className="row">
        <div className="col-sm-1">
          <Siderbar />
        </div>
        <div className="col-sm-11 mt-3 mb-3">
          <div className="me-4">
            <div className="card">
              <div className="card-header">
                <div className="container d-flex">
                  <div className="col-sm-1">
                    <Link to={-1} className="btn btn-secondary d-flex align-items-center">
                      <span className="material-symbols-outlined">arrow_back</span>
                      Back
                    </Link>
                  </div>
                  <div className="col-sm-11 d-flex justify-content-center align-items-center">
                    Edit User ID: {id}
                  </div>
                </div>
              </div>
              <div className="card-body">
                <div className="container">
                  <form onSubmit={submitUpdate}>
                    <div className="col-sm-12 mt-3">
                      <label htmlFor="name">Name</label>
                      <input
                        type="text"
                        className="form-control"
                        value={name}
                        onChange={(e) => setName(e.target.value)}
                      />
                      {errors.name && <div className="text-danger">{errors.name}</div>}
                    </div>
                    <div className="col-sm-12 mt-3">
                      <label htmlFor="email">Email:</label>
                      <input
                        type="email"
                        className="form-control"
                        value={email}
                        onChange={(e) => setEmail(e.target.value)}
                      />
                      {errors.email && <div className="text-danger">{errors.email}</div>}
                    </div>

                    <div className="col-sm-12 mt-3">
                      <label htmlFor="roles">Roles:</label>
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
                                {role.name.toUpperCase()}
                              </label>
                            </div>
                          ))
                        ) : (
                          <div>Cargando roles...</div>
                        )}
                      </div>
                      {errors.roles && <div className="text-danger">{errors.roles}</div>}
                    </div>

                    <div className="btn-group mt-3">
                      <button type="submit" className="btn btn-primary d-flex">
                        <span className="material-symbols-outlined">upgrade</span>
                        Update User
                      </button>
                    </div>
                  </form>
                </div>
              </div>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
};

export default UserUpdate;
