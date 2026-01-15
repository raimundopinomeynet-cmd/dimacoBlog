import React, { useEffect, useState } from 'react'
import { useProduct } from 'vtex.product-context'
import app from './app.css'
const index = () => {
     const productContextValue = useProduct();
    const [Specs, setSpecs] = useState([])

    useEffect(() => {
        const dataComplementarios = productContextValue?.product?.properties;
        if (dataComplementarios?.length) {
            setSpecs(productContextValue?.product?.properties) 
        }
    }, [])

    if (!Specs.length) return <></>

    return (
        <div>
            {
                Specs.map( (spec, index) => (
                    <div key={spec?.name} className={`${app.rowDataSpecs} ${index % 2 === 0 ? app.rowDataSpecsColor : ''}`} >
                        <div className={app.rowDataSpecsPropertie}>{spec?.name || ""}:</div>
                        <div>{spec?.values[0] || ""}</div>
                    </div>
                ))
            }
        </div>
    )
}

export default index