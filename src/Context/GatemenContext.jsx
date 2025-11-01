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

    const GetAllPOData = async () => {
        try {
            const res = await axiosHandler.get(`/gateman/all`)
            console.log(res)
        } catch (error) {
            console.log(error) 
        }
    }
    useEffect(() =>{
      GetAllPOData()
    }, [])

    return (
        <GatemenContext.Provider value={{ PendingGatemenData, AcceptPOData }}>
            {children}
        </GatemenContext.Provider>
    )
}


export const useGatemenContext = () => useContext(GatemenContext)





