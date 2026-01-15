import React, { useState, useEffect } from "react";
import app from "./app.css";
import useProduct from "vtex.product-context/useProduct";
import { useProductDispatch } from "vtex.product-context/ProductDispatchContext";

const SquareMeterCalculator = () => {
  const [medida, setMedida] = useState("");
  const [metrosCuadrados, setMetrosCuadrados] = useState(0);
  const [error, setError] = useState("");
  const [isChecked, setIsChecked] = useState(false);
  const { product, selectedItem, selectedQuantity } = useProduct();
  const dispatch = useProductDispatch();

  const [productData, setProductData] = useState(selectedItem);
  const [totalPrice, setTotalPrice] = useState(0);
  const [totalPiezas, setTotalPiezas] = useState(0);

  const isCeramicaPorcelanato = () => {
    if (
      !product ||
      !product.categoryTree ||
      !Array.isArray(product.categoryTree)
    ) {
      return false;
    }

    return product.categoryTree.some((category) => category.id === 69);
  };

  const hasRendimientoValue = () => {
    if (
      !product ||
      !product.properties ||
      !Array.isArray(product.properties) ||
      product.properties.length < 2 ||
      !product.properties[1].values ||
      !Array.isArray(product.properties[1].values) ||
      product.properties[1].values.length === 0
    ) {
      return false;
    }

    const rendimientoName = product.properties[1].name;
    return (
      rendimientoName &&
      typeof rendimientoName === "string" &&
      rendimientoName.includes("Rendimiento")
    );
  };

  if (!isCeramicaPorcelanato() || !hasRendimientoValue()) {
    return null;
  }

  const formatoCLP = new Intl.NumberFormat("es-CL", {
    style: "currency",
    currency: "CLP",
    maximumFractionDigits: 0, // CLP no usa decimales
  });

  const calculateQuantity = (value, checkboxState = isChecked) => {
    if (!value || isNaN(value) || parseInt(value) <= 0) {
      return 0;
    }

    const m2 = product.properties[1].values[0];
    if (!m2) return 0;

    const lado = parseInt(value);
    let piezas = Math.ceil(lado / m2);

    // Si el checkbox está activo, sumar 1 pieza adicional
    if (checkboxState) {
      piezas = piezas + 1; // Sumar 1 pieza adicional
    }

    return piezas;
  };

  const handleChange = (e) => {
    const value = e.target.value;

    setMedida(value);
    setError("");

    const piezas = calculateQuantity(value);

    if (piezas > 0) {
      const priceFormatted = formatoCLP.format(
        piezas * productData.sellers[0].commertialOffer.Price
      );
      setTotalPrice(priceFormatted);
      setMetrosCuadrados(parseInt(value));
      setTotalPiezas(piezas);

      if (dispatch) {
        dispatch({
          type: "SET_QUANTITY",
          args: { quantity: piezas },
        });
        console.log(">>Cantidad actualizada a:", piezas);
      }
    } else {
      setMetrosCuadrados(0);
      setTotalPrice(0);
      setTotalPiezas(0);

      // Resetear la cantidad a 1 si no hay valor válido
      if (dispatch) {
        dispatch({
          type: "SET_QUANTITY",
          args: { quantity: 1 },
        });
      }
    }
  };

  const handleCheckboxChange = (e) => {
    const newCheckedState = e.target.checked;
    setIsChecked(newCheckedState);

    // Recalcular automáticamente si hay un valor válido
    if (medida && !isNaN(medida) && parseInt(medida) > 0) {
      const piezas = calculateQuantity(medida, newCheckedState);

      if (piezas > 0) {
        const priceFormatted = formatoCLP.format(
          piezas * productData.sellers[0].commertialOffer.Price
        );
        setTotalPrice(priceFormatted);
        setTotalPiezas(piezas);

        if (dispatch) {
          dispatch({
            type: "SET_QUANTITY",
            args: { quantity: piezas },
          });
          console.log(">>Cantidad actualizada a:", piezas);
        }
      }
    }
  };

  return (
    <div
      className="calculadora-container"
      style={{
        border: "2px solid #706E78",
        borderRadius: "10px",
        padding: "0.4rem 1rem",
        margin: "1rem 0",
        maxWidth: "420px",
      }}
    >
      <div className="calculadora-header">
        <h2
          style={{
            color: "#007934",
            fontWeight: "400",
            fontSize: "1rem",
            fontFamily: "Anton, sans-serif",
            marginBottom: "5px",
          }}
        >
          ¿Cuántos m² necesitas cubrir?
        </h2>
        {/* <p style={{ color: "#000000", fontWeight: "800", fontSize: "0.7rem" }}>
          Ingresa el área en metros cuadrados
        </p> */}
      </div>
      <div className="calculadora-form">
        <div className="input-group">
          <div
            className="input-with-unit"
            style={{
              display: "flex",
              alignItems: "center",
              position: "relative",
              color: "#007934",
            }}
          >
            <input
              type="number"
              style={{
                width: "30%",
                borderRadius: "10px",
                outline: "none",
                fontSize: "1rem",
                fontWeight: "800",
                color: "#007934",
              }}
              id="medida"
              name="medida"
              value={medida}
              onChange={handleChange}
              placeholder="Ej: 5"
              className={error ? "input-error" : ""}
              min="1"
              max="9999"
            />
            <span>
              <svg
                xmlns="http://www.w3.org/2000/svg"
                version="1.0"
                width="40.000000pt"
                height="40.000000pt"
                viewBox="0 0 612.000000 612.000000"
                preserveAspectRatio="xMidYMid meet"
              >
                <g
                  transform="translate(0.000000,612.000000) scale(0.100000,-0.100000)"
                  fill="#000000"
                  stroke="none"
                >
                  <path d="M1505 5059 c-31 -17 -425 -411 -441 -441 -51 -97 62 -216 159 -167 12 6 64 52 115 102 l92 92 0 -1395 c0 -1328 1 -1399 19 -1462 47 -170 177 -297 352 -343 46 -13 272 -15 1449 -15 l1395 0 -92 -92 c-50 -51 -96 -103 -102 -115 -49 -97 70 -210 167 -159 32 18 425 412 441 443 15 30 14 69 -3 101 -18 32 -412 425 -443 441 -93 47 -209 -69 -162 -162 6 -12 52 -64 102 -114 l92 -93 -1390 0 c-1377 0 -1390 1 -1435 21 -60 27 -88 54 -116 114 l-24 50 0 1389 0 1390 98 -96 c108 -106 133 -119 196 -97 71 25 105 104 72 167 -18 32 -412 425 -443 441 -27 14 -72 14 -98 0z" />
                  <path d="M2012 5053 c-40 -20 -62 -59 -62 -113 0 -32 7 -48 34 -78 l34 -37 1329 -5 c1211 -5 1331 -6 1358 -22 33 -18 63 -48 91 -93 18 -28 19 -79 24 -1358 l5 -1329 37 -34 c30 -27 46 -34 78 -34 55 0 94 22 114 64 15 31 16 152 16 1343 0 1074 -3 1317 -14 1359 -33 126 -135 253 -242 304 -110 52 -55 50 -1459 50 -1190 0 -1313 -2 -1343 -17z" />
                  <path d="M4053 4241 c-134 -46 -209 -143 -169 -219 22 -43 54 -62 103 -62 36 0 50 7 93 45 41 37 58 45 89 45 46 0 71 -24 71 -69 0 -29 -20 -52 -174 -204 -184 -182 -205 -212 -192 -282 4 -20 19 -44 37 -59 l31 -26 233 0 c228 0 235 1 260 23 50 43 49 126 -1 166 -23 18 -41 21 -120 21 -52 0 -94 4 -94 9 0 5 36 42 81 82 103 94 145 151 163 223 46 175 -94 327 -298 326 -34 -1 -84 -9 -113 -19z" />
                  <path d="M2628 3778 c-31 -4 -76 -17 -99 -28 -53 -28 -120 -96 -143 -149 -11 -22 -23 -41 -28 -41 -4 0 -8 21 -8 48 0 88 -58 144 -150 144 -55 0 -100 -21 -126 -59 -18 -27 -19 -57 -22 -588 -2 -308 0 -580 3 -604 17 -115 177 -157 262 -69 l28 29 5 428 5 428 35 69 c46 90 98 128 173 128 63 0 126 -30 157 -74 47 -66 50 -96 50 -539 0 -395 1 -418 20 -448 52 -86 203 -89 257 -6 16 24 18 68 23 453 5 405 6 427 26 470 40 85 116 149 179 150 72 0 155 -55 186 -125 17 -37 19 -76 19 -465 0 -395 2 -428 19 -467 11 -23 30 -47 42 -54 70 -37 157 -28 206 23 l28 29 0 482 c0 446 -1 486 -19 537 -47 136 -108 218 -199 263 -180 92 -413 16 -496 -162 -14 -28 -27 -51 -31 -51 -4 0 -17 23 -31 52 -31 66 -106 143 -165 170 -60 26 -134 35 -206 26z" />
                </g>
              </svg>
            </span>
          </div>
          {error && <span className="error-message">{error}</span>}
        </div>
      </div>

      <div className={app.calculadoraInfo}>
        <p
          className="calculadora-info-text"
          style={{
            fontSize: "0.8rem",
            color: "#6c757d",
            fontWeight: "500",
            marginTop: "0.3rem",
          }}
        >
          *Estimación referencial de cantidades requeridas.
        </p>
        <input
          type="checkbox"
          name="calculadora"
          id="calculadora"
          checked={isChecked}
          onChange={handleCheckboxChange}
          style={{
            appearance: "none",
            WebkitAppearance: "none",
            MozAppearance: "none",
            width: "15px",
            height: "15px",
            border: "2px solid #007934",
            borderRadius: "3px",
            backgroundColor: isChecked ? "#007934" : "white",
            cursor: "pointer",
            position: "relative",
            transition: "all 0.3s ease",
            outline: "none",
            ...(isChecked && {
              backgroundImage:
                'url(\'data:image/svg+xml;utf8,<svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 24 24" fill="white"><path d="M9 16.17L4.83 12l-1.42 1.41L9 19 21 7l-1.41-1.41z"/></svg>\')',
              backgroundSize: "12px",
              backgroundPosition: "center",
              backgroundRepeat: "no-repeat",
            }),
          }}
        />
        <label htmlFor="calculadora">
          <span
            style={{
              fontSize: "0.7rem",
              fontWeight: "500",
              marginLeft: "0.4rem",
              color: "#6c757d",
              padding: "0.2rem 0",
            }}
          >
            Incluye 10% adicional de material por posibles daños o faltantes.
          </span>
        </label>
      </div>

      {metrosCuadrados > 0 && (
        <div
          className="resultado-container"
          style={{
            borderTop: "1px solid #000000",
            display: "flex",
            justifyContent: "space-between",
            alignItems: "center",
            padding: "0.5rem",
            marginTop: "5px",
            flexWrap: "wrap",
          }}
        >
          <h3 style={{ margin: 0, padding: 0 }}>Resultado:</h3>
          <div
            className="resultado-item"
            style={{
              display: "flex",
              justifyContent: "space-between",
              alignItems: "center",
              gap: "3rem",
            }}
          >
            <p
              style={{
                fontSize: "0.9rem",
                fontWeight: "400",
                color: "#090F05",
                fontFamily: "Anton, sans-serif",
              }}
            >
              Área: {metrosCuadrados} m²
            </p>
            <p
              style={{
                color: "#090F05",
                fontWeight: "400",
                fontSize: "0.9rem",
                fontFamily: "Anton, sans-serif",
              }}
            >
              Cajas: {totalPiezas}
            </p>
            <p
              style={{
                color: "#007934",
                fontWeight: "400",
                fontSize: "1rem",
                fontFamily: "Anton, sans-serif",
              }}
            >
              Total: {totalPrice}
            </p>
          </div>
        </div>
      )}
    </div>
  );
};

export default SquareMeterCalculator;
