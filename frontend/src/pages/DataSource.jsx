import { useState,useEffect } from "react";
import api from "../services/api";

export default function DataSourcePage() {
    const [dataSources, setDataSources] = useState([]);
    const [loading, setLoading] = useState(true);
    const[error, setError] = useState(null);
    const [newSource, setNewSource] = useState({
        type: "csv-upload",
        name: "",
        comfig: "{}",
    });
    const [file, setFile] = useState(null);

    //get the role form the localStorage (set during login)
    const role = localStorage.getItem("role") || "viever";

    //fetch datasources from the backend
    useEffect(() => {
        const fetchSources = async () => {
            try {
                const token = localStorage.getItem("token");
                const res = await api.get("/datasources", {
                    headers: { Authorization: `Bearer ${token}` },
                });
                setDataSources(res.data); 
            } catch (err) {
                setError("Failed to fetch data sources");
                console.error(err);
            } finally {
                setLoading(false);
            }
        };
        fetchSources();
    }, []);
}