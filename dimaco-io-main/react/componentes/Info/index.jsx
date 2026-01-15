import { useEffect } from 'react'
import { useProduct } from 'vtex.product-context'

const index = () => {
    const productContextValue = useProduct();

    useEffect(() => {
        console.log("productContextValue ",productContextValue)
    }, [])
    

    return (
        <div></div>
    )
}

export default index