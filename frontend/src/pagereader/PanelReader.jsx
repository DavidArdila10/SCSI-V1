import { Link } from "react-router-dom";
import { useEffect, useState } from "react";

const PanelReader = () => {
  const [time, setTime] = useState("");
  const [greeting, setGreeting] = useState("");

  useEffect(() => {
    const updateTime = () => {
      try {
        // Obtener la hora de Colombia
        const now = new Date(new Date().toLocaleString("en-US", { timeZone: "America/Bogota" }));
        
        // Extraer horas y minutos sin segundos
        const hours = now.getHours();
        const minutes = now.getMinutes().toString().padStart(2, "0");
        const formattedTime = `${hours}:${minutes}`;

        setTime(formattedTime);
        console.log("Hora en Colombia:", formattedTime);

        // Definir el saludo según la hora
        if (hours >= 0 && hours < 12) {
          setGreeting("Buenos días");
        } else if (hours >= 12 && hours < 18) {
          setGreeting("Buenas tardes");
        } else {
          setGreeting("Buenas noches");
        }
      } catch (error) {
        console.error("Error obteniendo la hora de Colombia:", error);
      }
    };

    updateTime();
    const interval = setInterval(updateTime, 1000);

    return () => clearInterval(interval);
  }, []);

  return (
    <div className="container">
      <div className="row justify-content-center mt-5 mb-5">
        <div className="col-12 text-center">
          <h1 className="fw-bold text-primary">{greeting} 👋</h1>
          <h4 className="text-muted">
            Bienvenido al panel de lectura, ¡esperamos que tengas un excelente día!
          </h4>
          <p className="text-info fw-bold">
            Hora actual en Colombia: {time ? `${time} a.m.` : "Cargando..."}
          </p>
        </div>

        <div className="col-sm-2 d-flex justify-content-center">
          <Link className="btn btn-lg btn-outline-primary fw-bold" to="/reader/sow">
            📊 Ir a la Tabla S.O.W
          </Link>
        </div>
      </div>

      {/* Estilos */}
      <style>
        {`
          .container {
            background: linear-gradient(135deg, #f8f9fa, #e3f2fd);
            padding: 50px;
            border-radius: 15px;
            box-shadow: 0 4px 10px rgba(0, 0, 0, 0.1);
          }

          h1 {
            font-size: 2.5rem;
          }

          .btn {
            padding: 12px 25px;
            font-size: 18px;
            transition: transform 0.2s ease-in-out;
          }

          .btn:hover {
            transform: scale(1.05);
          }
        `}
      </style>
    </div>
  );
};

export default PanelReader;
