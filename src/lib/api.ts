import axios from "axios";

const BACKEND_URL = import.meta.env.VITE_BACKEND_URL;

export const api = axios.create({
    baseURL: `${BACKEND_URL}/api/inventory`
});

api.interceptors.request.use(config => {
    const token = localStorage.getItem('auth_token')
    const rawWarehouse = localStorage.getItem('auth_selectedWarehouse');
    let selectedWarehouseId = null;
    if(rawWarehouse){
        try {
            const parsed = JSON.parse(rawWarehouse);
            selectedWarehouseId = parsed.warehouseId;            
        } catch (error) {
            console.log("Failed to parse auth_selectedWarehouse.");  
        }
    }

    if(token){
        config.headers.Authorization = `Bearer ${token}`
    }

    config.params = {
        ...config.params,
        selectedWarehouseId
    }
    console.log(`API token-${token} selectedWarehouseId - ${selectedWarehouseId}`)

    return config

})