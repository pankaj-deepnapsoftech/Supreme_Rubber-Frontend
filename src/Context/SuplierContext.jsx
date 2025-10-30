import { createContext, useContext } from "react";




export const SuplierContext = createContext()

export const SuplierProvider = ({ children }) => {

//   const [products, setProducts] = useState([]);
//     const [loading, setLoading] = useState(false);

    // ==================== 📦 PRODUCT API CALLS ====================

    const createSupplier = async (data) => {
        try {
            const res = await axiosHandler.post("/supplier", data);
            // await getAllProducts(); // Refresh list
            return res.data;
        } catch (error) {
            console.error("❌ Error creating product:", error);
            throw error;
        }
    };
    

    // const updateSupplier = async (data) => {
    //     try {
    //         const res = await axiosHandler.put("/product", data);
    //         await getAllProducts();
    //         return res.data;
    //     } catch (error) {
    //         console.error("❌ Error updating product:", error);
    //         throw error;
    //     }
    // };

    // const deleteSupplier = async (id) => {
    //     try {
    //         const res = await axiosHandler.delete("/product", { data: { id } });
    //         await getAllProducts();
    //         return res.data;
    //     } catch (error) {
    //         console.error("❌ Error deleting product:", error);
    //         throw error;
    //     }
    // };

    // const getAllSuplier = async () => {
    //     try {
    //         setLoading(true);
    //         const res = await axiosHandler.get("/product/all");
    //         setProducts(res?.data?.products || []);
    //         return res.data;
    //     } catch (error) {
    //         console.error("❌ Error fetching all products:", error);
    //         throw error;
    //     } finally {
    //         setLoading(false);
    //     }
    // };

    // const getSupplierDetails = async (id) => {
    //     try {
    //         const res = await axiosHandler.get(`/product/${id}`);
            
    //         return res.data?.product;
    //     } catch (error) {
    //         console.error("❌ Error fetching product details:", error);
    //         throw error;
    //     }
    // };



    return (
        <SuplierContext.Provider value={createSupplier}> {children} </SuplierContext.Provider>
    )
}


export const useSuplierContext = ()=> useContext(SuplierContext)
