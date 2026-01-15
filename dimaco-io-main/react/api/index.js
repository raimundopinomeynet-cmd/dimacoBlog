export const getProductById = async ({productId}) => {
    try {
        const response = await fetch(`/v1/api/proxy/sku/${productId}`)
        const data = await response.json()
        return data;
    } catch (error) {
        return "err_unk";
    }
}