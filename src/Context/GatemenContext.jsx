import axiosHandler from "@/config/axiosconfig"
import { createContext, useContext, useEffect } from "react"
import { toast } from "react-toastify"




export const GatemenContext = createContext()


export const GatemenContextProvider = ({ children }) => {

    const PendingGatemenData = async () => {
        try {
            const res = await axiosHandler.get('/purchase-order/pending/gate-man')
            return res?.data?.pendingPOs || []
        } catch (error) {
            console.log(error)
        }
    }

    const AcceptPOData = async (id) => {
        try {
            const res = await axiosHandler.put(`purchase-order/accept/${id}`)
            toast.success(res?.data?.message)
        } catch (error) {
            console.log(error)
        }
    }

    const GetAllPOData = async (page) => {
        try {
            const res = await axiosHandler.get(`/gateman/all?page=${page}&limit=10`)
            return res?.data?.entries
        } catch (error) {
            console.log(error)
        }
    }

    const PostGatemenData = async (formData) => {
        try {
            const res = await axiosHandler.post(`/gateman`, formData, {
                headers: {
                    "Content-Type": "multipart/form-data",
                },
            });
            toast.success(res?.data?.message);
            return res.data;
        } catch (error) {
            console.error("Error posting Gateman data:", error);
            toast.error(error?.response?.data?.message || "Failed to create entry");
        }
    };

    const UpdatedGatemenData = async (data) => {
        try {
            const res = await axiosHandler.put("/gateman",
                data,
                { headers: { "Content-Type": "application/json" } }
            );
             toast.success(res?.data?.message)
        } catch (error) {
            console.error( error);
            throw error;
        }
    };
    const DeleteGatemenData = async (_id) => {
        try {
            const res = await axiosHandler.delete(`/gateman`, { data: { _id } });
            toast.success(res?.data?.message)
            GetAllPOData()
        } catch (error) {
            console.log(error)
        }
    }
    const DetailsGatemenData = async (_id) => {
        try {
            const res = await axiosHandler.get(`/gateman/${_id}`);
            return res?.data?.entry
            toast.success(res?.data?.message)
        } catch (error) {
            console.log(error)
        }
    }


    return (
        <GatemenContext.Provider value={{ PendingGatemenData, AcceptPOData, PostGatemenData, GetAllPOData, UpdatedGatemenData, DeleteGatemenData, DetailsGatemenData }}>
            {children}
        </GatemenContext.Provider>
    )
}


export const useGatemenContext = () => useContext(GatemenContext)





