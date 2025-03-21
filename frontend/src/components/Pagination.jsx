import React from 'react';

const Pagination = ({ totalPages, currentPage, handlePageChange }) => {
    return (
        <div className="pagination-container d-flex justify-content-center align-items-center mt-4">
            {/* Botón Anterior */}
            <button
                onClick={() => handlePageChange(currentPage - 1)}
                className="btn pagination-btn"
                disabled={currentPage === 1}
            >
                &laquo; Prev
            </button>

            {/* Botones numerados */}
            <div className="page-buttons">
                {Array.from({ length: totalPages }, (_, index) => (
                    <button
                        key={index + 1}
                        onClick={() => handlePageChange(index + 1)}
                        className={`btn page-btn ${currentPage === index + 1 ? 'active-page' : ''}`}
                    >
                        {index + 1}
                    </button>
                ))}
            </div>

            {/* Botón Siguiente */}
            <button
                onClick={() => handlePageChange(currentPage + 1)}
                className="btn pagination-btn"
                disabled={currentPage === totalPages}
            >
                Next &raquo;
            </button>

            {/* Estilos en línea para mejorar la apariencia */}
            <style>
                {`
                    .pagination-container {
                        gap: 10px;
                    }

                    .pagination-btn, .page-btn {
                        border: none;
                        padding: 10px 15px;
                        font-size: 16px;
                        font-weight: bold;
                        border-radius: 8px;
                        transition: all 0.3s ease-in-out;
                        cursor: pointer;
                        margin: 0 5px;
                        box-shadow: 2px 2px 5px rgba(0,0,0,0.2);
                    }

                    .pagination-btn {
                        background: linear-gradient(135deg, #6a11cb, #2575fc);
                        color: white;
                    }

                    .pagination-btn:hover {
                        background: linear-gradient(135deg, #2575fc, #6a11cb);
                        transform: scale(1.1);
                    }

                    .pagination-btn:disabled {
                        background: grey;
                        cursor: not-allowed;
                        transform: scale(1);
                    }

                    .page-buttons {
                        display: flex;
                        gap: 5px;
                    }

                    .page-btn {
                        background: rgba(255, 110, 75, 0.8);
                        color: white;
                    }

                    .page-btn:hover {
                        background: rgba(255, 80, 55, 1);
                        transform: scale(1.15);
                    }

                    .active-page {
                        background: rgba(200, 60, 40, 1);
                        color: white;
                        transform: scale(1.15);
                        border: 2px solid white;
                    }
                `}
            </style>
        </div>
    );
};

export default Pagination;
