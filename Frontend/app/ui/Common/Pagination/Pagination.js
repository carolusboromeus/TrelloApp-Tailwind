import React from 'react';
import PropTypes from 'prop-types'

const Pagination = (props) => {
    const { contentsTotal, pageNumber, setPageNumber } = props;
    const pageSize = 50;

    const totalPages = Math.ceil(contentsTotal / pageSize);

    const goToNextPage = () => {
        if (pageNumber < totalPages - 1) {
            setPageNumber(pageNumber + 1);
        }
    };

    const goToPreviousPage = () => {
        if (pageNumber > 0) {
            setPageNumber(pageNumber - 1);
        }
    };

    const goToPage = (page) => {
        if (page >= 0 && page < totalPages) {
            setPageNumber(page);
        }
    };

    const css = 'text-black border border-slate-400 rounded-full bg-list-bg-color mx-1 my-1 px-2 hover:text-list-bg-color hover:border-navbar-app-bg-color hover:bg-navbar-app-bg-color';

    return (
        <div> 
            {/* Pagination Controls */}
            <div className="text-center w-full text-sm">
                {pageNumber !== 0 && 
                    <button className='border border-slate-400 rounded-full bg-list-bg-color my-1 px-1 text-black hover:text-list-bg-color hover:border-navbar-app-bg-color hover:bg-navbar-app-bg-color' 
                        onClick={goToPreviousPage} 
                        disabled={pageNumber === 0}
                    >
                        <i className='bi bi-caret-left-fill'></i>
                    </button>
                }
                {totalPages !== 1 && Array.from({ length: totalPages }, (_, index) => (
                    <button
                        key={index}
                        onClick={() => goToPage(index)}
                        className={(pageNumber === index ? `${css} text-white border border-board-bg-color bg-navbar-app-bg-color` : css)}
                    >
                        {index + 1}
                    </button>
                ))}
                {pageNumber !== totalPages - 1 && 
                    <button className='border border-slate-400 rounded-full bg-list-bg-color my-1 px-1 text-black hover:text-list-bg-color hover:border-navbar-app-bg-color hover:bg-navbar-app-bg-color' 
                        onClick={goToNextPage} 
                        disabled={pageNumber === totalPages - 1}>
                        <i className='bi bi-caret-right-fill'></i>
                    </button>
                }
            </div>
        </div>
    );
};

Pagination.propTypes = {
    contentsTotal: PropTypes.number.isRequired,
    pageNumber: PropTypes.number.isRequired,
    setPageNumber: PropTypes.func.isRequired
};

export default Pagination;
