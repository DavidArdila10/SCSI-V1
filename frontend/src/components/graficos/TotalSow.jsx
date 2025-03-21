import { useEffect, useState } from "react";
import Config from "../../Config";

const TotalSow = () => {
    const [totalSows, setTotalSows] = useState(0); 

    useEffect(() => {
        const fetchTotalSows = async () => {
            try {
                const response = await Config.getSowCount();
                console.log("numero de sows :" , response.data)
                setTotalSows(response.data.total); 
            } catch (error) {
                console.error('Error al conectarse con el backend:', error);
            }
        };

        fetchTotalSows();
    }, []); 
    return(
        <div>
            <button className="btn btn-primary">Total S.O.W: {totalSows}</button>
        </div>
    )
}
export default TotalSow;