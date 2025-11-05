import React from "react";

const Pagination = ({ page, setPage, hasNextPage, totalPages }) => {
    const hasPrevPage = page > 1;

    return (
        <div className="flex justify-center items-center gap-3 py-4">
           
            <button
                onClick={() => hasPrevPage && setPage(page - 1)}
                disabled={!hasPrevPage}
                className={`px-4 py-2 rounded-full text-sm font-medium transition-all duration-200 ${hasPrevPage
                        ? "bg-white text-gray-700 hover:bg-blue-100 shadow-md border border-gray-300"
                        : "bg-gray-200 text-gray-400 cursor-not-allowed border border-gray-200"
                    }`}
            >
                Prev
            </button>

           
            <span className="px-4 py-2 rounded-full text-sm font-semibold bg-blue-50 text-blue-700 shadow-inner">
                Page {page} {totalPages ? `of ${totalPages}` : ""}
            </span>

           
            <button
                onClick={() => hasNextPage && setPage(page + 1)}
                disabled={!hasNextPage}
                className={`px-4 py-2 rounded-full text-sm font-medium transition-all duration-200 ${hasNextPage
                        ? "bg-white text-gray-700 hover:bg-blue-100 shadow-md border border-gray-300"
                        : "bg-gray-200 text-gray-400 cursor-not-allowed border border-gray-200"
                    }`}
            >
                Next
            </button>
        </div>
    );
};

export default Pagination;
