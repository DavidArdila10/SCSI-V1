import { useState, useEffect } from 'react';
import Config from '../Config';

const Enum = ({ value, onChange, field }) => {
    const [options, setOptions] = useState([]);

    useEffect(() => {
        const fetchOptions = async () => {
            try {
                const response = await Config.getEnum(field);
                if (Array.isArray(response.data)) {
                    setOptions(response.data);
                } else {
                    console.error('La respuesta de la API no es un array:', response.data);
                    setOptions([]);
                }
            } catch (error) {
                console.error('Hubo un error al obtener las opciones del enum:', error);
                setOptions([]);
            }
        };

        fetchOptions();
    }, [field]);

    const handleChange = (e) => {
        const { value } = e.target;
        onChange({ target: { name: field, value } });
    };

    return (
        <select value={value} onChange={handleChange} className="form-select">
            <option value="">Select an option</option>
            {options.map((option, idx) => (
                <option key={idx} value={option}>
                    {option}
                </option>
            ))}
        </select>
    );
};

export default Enum;

