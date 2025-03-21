import { useEffect, useState } from "react";
import Siderbar from "./Siderbar";
import SowStatus from "../components/graficos/SowStatus";
import TotalSow from "../components/graficos/TotalSow";

const PanelWriter = () => {
  const [time, setTime] = useState("");
  const [greeting, setGreeting] = useState("");

  useEffect(() => {
    const updateTime = () => {
      try {
        // Obtener la hora actual de Colombia
        const now = new Date(new Date().toLocaleString("en-US", { timeZone: "America/Bogota" }));
        
        // Formatear horas, minutos y segundos
        const hours = now.getHours();
        const minutes = now.getMinutes().toString().padStart(2, "0");
        const seconds = now.getSeconds().toString().padStart(2, "0");
        const formattedTime = `${hours}:${minutes}:${seconds}`;

        setTime(formattedTime);
        console.log("Hora en Colombia:", formattedTime);

        // Asignar saludo según la hora
        if (hours >= 0 && hours < 12) {
          setGreeting("¡Buenos días! ☀️");
        } else if (hours >= 12 && hours < 18) {
          setGreeting("¡Buenas tardes! 🌤️");
        } else {
          setGreeting("¡Buenas noches! 🌙");
        }
      } catch (error) {
        console.error("Error obteniendo la hora de Colombia:", error);
      }
    };

    updateTime();
    const interval = setInterval(updateTime, 1000); // Actualizar cada segundo

    return () => clearInterval(interval);
  }, []);

  return (
    <div style={{ overflow: "hidden" }}>
      <div className="row">
        <div className="col-sm-1 g-0">
          <div className="bg-body-primary">
            <Siderbar />
          </div>
        </div>

        <div className="col-sm-11 mb-5 g-0">
          <div className="container">
            <div className="col-sm-8 mx-auto">
              {/* Mensaje de bienvenida más cálido */}
              <div className="text-center mt-4">
                <h2 className="fw-bold text-dark">{greeting}</h2>
                <p className="text-muted">
                  Ahora mismo en Colombia son las <span className="text-info fw-bold">{time ? time : "Cargando..."}</span>.
                </p>
                <p className="text-secondary">
                  ¡Esperamos que disfrutes trabajando en esta sección! 🚀
                </p>
                <hr className="mb-4" />
              </div>

              <div className="ms-5 mb-4">
                <TotalSow />
              </div>

              <div className="d-flex justify-content-center" style={{ height: "400px" }}>
                <SowStatus />
              </div>
            </div>
          </div>
        </div>
      </div>

      {/* Estilos adicionales */}
      <style>
        {`
          .container {
            padding: 30px;
            border-radius: 10px;
            background: white;
          }

          h2 {
            font-weight: 700;
            color: #333;
          }

          .text-muted {
            font-size: 18px;
            font-weight: 500;
          }

          .text-info {
            font-size: 20px;
            color: #007bff;
          }

          .text-secondary {
            font-size: 16px;
            font-style: italic;
            color: #6c757d;
          }
        `}
      </style>
    </div>
  );
};

export default PanelWriter;
