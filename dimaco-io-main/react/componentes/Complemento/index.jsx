import { useEffect, useState } from 'react'
import { useProduct } from 'vtex.product-context'
import { getSpecificationValues } from '../../helpers/Specifications';
import { getProductById } from '../../api';
import app from './app.css'
import { useOrderItems } from 'vtex.order-items/OrderItems'
import { Link } from "vtex.render-runtime"
import { useQuery } from 'react-apollo';
import GET_PRODUCT from "../../graphql/queryGetProduct.gql"

const formatoCLP = new Intl.NumberFormat("es-CL", {
    style: "currency",
    currency: "CLP",
    minimumFractionDigits: 0, // sin decimales
    maximumFractionDigits: 0
});

const getPrices = ({price, listPrice}) => {
    if(price < listPrice){
        return <div className={app.prices__complemento}>
            <div className={app.prices__price}>{formatoCLP.format(price)}</div>
            <div className={app.prices__list}>{formatoCLP.format(listPrice)}</div>
        </div>
    } else {
        return formatoCLP.format(price);
    }
}
  
const ComplementoItem = ({ skuId, setUnidades }) => {
    const [Sku, setSku] = useState(null)
    const [SelectedQuantity, setSelectedQuantity] = useState(0)
    const [PriceComplemento, setPriceComplemento] = useState(0)
    const [Detail, setDetail] = useState("")

    useEffect(() => {
        if (skuId) {
            getSku({ productId: skuId })
        }
    }, [skuId])

    const { data } = useQuery(GET_PRODUCT, {
        variables: {
            slug: Detail.split("/")[1],
        },
        skip: !Detail,
        ssr: false
    });

    useEffect(() => {
        if(data?.product){
            const currentItem = data.product.items.find(item => item.itemId == skuId)
            setPriceComplemento({
                price: currentItem.sellers[0].commertialOffer.Price,
                listPrice: currentItem.sellers[0].commertialOffer.ListPrice,
            })
        }
    }, [data])
    
    const getSku = async ({ productId }) => {
        const res = await getProductById({ productId })
        if (res?.sku?.DetailUrl) {
            setDetail(res?.sku?.DetailUrl)
            setSku(res?.sku)
        } else {
            setSku(null)
        }
    }

    if (!Sku) return <></>

    const updateUnits = (newQuantity) => {
        setSelectedQuantity(newQuantity);
        setUnidades(prev => {
            const exists = prev.find(item => item.id === skuId);
            if (exists) {
                return prev.map(item =>
                    item.id === skuId ? { ...item, quantity: newQuantity, seller: "1" } : item
                );
            }
            return [...prev, { id: skuId, quantity: newQuantity, seller: "1" }];
        });
    };

    const handleMinus = () => {
        if (SelectedQuantity > 0) {
            updateUnits(SelectedQuantity - 1);
        }
    };

    const handlePlus = () => updateUnits(SelectedQuantity + 1)

    return (
        <div className={app.complemento__main} >
            <img src={Sku?.Images?.length ? Sku?.Images[0]?.ImageUrl : Sku?.ImageUrl} alt={Sku?.ProductName} />
            <div className={app.complemento__info}>
                <div className={app.complemento__text}>
                    <Link className={app.link__prouduct} to={Sku.DetailUrl}>{Sku.ProductName}</Link>
                </div>
                <div className={app.complemento__checkbox}>
                    <div className={app.table__quantity__main}>
                        <button onClick={handleMinus} className={app.table__quantity__button} type='button' >-</button>
                        <input className={app.table__quantity__input} readOnly type="tel" value={SelectedQuantity} />
                        <button onClick={handlePlus} className={app.table__quantity__button} type='button' >+</button>
                    </div>

                    <div>
                        {
                            PriceComplemento ? 
                                <span style={{ fontWeight: 600 }}>
                                    {getPrices(PriceComplemento)}
                                </span> 
                            : <></>
                        }
                    </div>
                </div>
            </div>
        </div>
    )
}

const Complemento = () => {
    const productContextValue = useProduct();
    const [Complemento, setComplemento] = useState(null)
    const [Unidades, setUnidades] = useState([])
    const { addItem } = useOrderItems();

    useEffect(() => {
        const dataComplementarios = productContextValue?.product;
        if (dataComplementarios?.specificationGroups.length) {
            const dataSpecificationValues = getSpecificationValues(
                dataComplementarios?.specificationGroups, //data
                "complemento", //specificationGroup
                ["complemento-sku-id"] //specificationName
            )

            if (dataSpecificationValues?.["complemento-sku-id"]) {
                console.log("complemento-sku-id: ", dataComplementarios?.specificationGroups)
                setComplemento(dataSpecificationValues["complemento-sku-id"]?.split('#')?.filter(i => i))
            }
        } else {
            setComplemento(null)
        }
    }, [productContextValue?.product])

    useEffect(() => {
        const button = document.querySelector(".vtex-flex-layout-0-x-flexRow--add__pdp button.vtex-button");
        if (button) {
            const handleClick = async () => {
                const unidadesAgregar = Unidades.filter(u => u.quantity)
                if (unidadesAgregar.length) {
                    await addItem(unidadesAgregar)
                }
            };
            button.addEventListener("click", handleClick);
            return () => button.removeEventListener("click", handleClick);
        }
    }, [Unidades]);

    if (!Complemento || !Complemento?.length) return <></>

    return (
        <div className={app.box__complemento} >
            <p>Añade a tu compra:</p>
            <section className={app.box__complemento__items}>
                {
                    Complemento?.map(skuId =>
                        <ComplementoItem
                            key={skuId}
                            skuId={skuId}
                            setUnidades={setUnidades}
                        />
                    )
                }
            </section>
        </div>
    )
}

export default Complemento