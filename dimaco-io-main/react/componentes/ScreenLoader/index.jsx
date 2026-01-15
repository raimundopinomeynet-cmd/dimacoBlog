import { useState, useEffect } from "react";
import app from "./app.css" 

const LoaderScreen = () =>  (
    <div className={app.loader__container__home}>
        <img  className={app.loader__image} src="/arquivos/loader__botonera.png" alt="Icono loader" />
    </div>
)

const ScreenLoader = () => {
    const [loading, setLoading] = useState(true);

    useEffect(() => {
        const handleLoad = () => setLoading(false);
        if (document.readyState === "complete") {
            setLoading(false);
        } else {
            window.addEventListener("load", handleLoad);
        }

        return () => window.removeEventListener("load", handleLoad);
    }, []);

    return loading ? <LoaderScreen />: <></>;
};

export default ScreenLoader;
