// Changes here may impact your sales
/* ---------------- checkout-ui-custom ---------------- */

$(document).ready(function () {
	termsCond();
	/* boletaFactura(); */
});

function termsCond() {
	var botonSeguir = ".cart-links.cart-links-bottom .btn-place-order-wrapper";
	$(botonSeguir).addClass("disable");

	jQuery(
		'<p class="terms-cond"><input type="radio" id="terms_conds">Acepto los <a href="/terminos-y-condiciones" target="_blank">Términos y Condiciones</a></p>'
	).insertBefore(".cart-links.cart-links-bottom .btn-place-order-wrapper");

	$("#terms_conds").change(function () {
		if ($(this).is(":checked")) {
			$(botonSeguir).addClass("active");
			$(botonSeguir).removeClass("disable");
		} else {
			$(botonSeguir).addClass("disable");
			$(botonSeguir).removeClass("active");
		}
	});
}

/* function boletaFactura() {
	vtexjs.checkout.getOrderForm().done(function (orderForm) {
		if (orderForm.clientProfileData?.isCorporate) {
			$("#is-corporate-client").addClass("active");
			$("#not-corporate-client").removeClass("active");
		} else {
			$("#is-corporate-client").removeClass("active");
			$("#not-corporate-client").addClass("active");
		}
	});

	$("#is-corporate-client").click(function () {
		$(this).addClass("active");
		$("#not-corporate-client").removeClass("active");
	});

	$("#not-corporate-client").click(function () {
		$(this).addClass("active");
		$("#is-corporate-client").removeClass("active");
	});
} */

/* HEADER Y FUNCIONALIDAD */
$(document).ready(function () {
	const header__steps = setInterval(() => {
		const containerMain = $(".container-header");
		if (!$(".header__stepper__dimaco").length && containerMain.length) {
			try {
				containerMain.after(`
					<div class="header__stepper__dimaco">
						<div class="header__icons" >
							<img class="header__icon__1" src="/arquivos/datos__1.png" alt="correo">
							<img class="header__icon__2" src="/arquivos/datos__2.png" alt="direccion">
							<img class="header__icon__3" src="/arquivos/datos__3.png" alt="pago">
						</div>
						<div class="header__steps">
							<div class="header__step__1"></div>
							<div class="header__bar__1"></div>
							<div class="header__step__2"></div>
							<div class="header__bar__2"></div>
							<div class="header__step__3"></div>
						</div>
					</div>
				`);
				clearinterval(header__steps);
			} catch (error) { }
		}
	}, 1000);
})

$(document).ready(() => {
	const header__change = () => {
		$(document).on("click", ".header__stepper__dimaco .header__icon__1, .header__stepper__dimaco .header__step__1", () => {
			window.location.hash = "#/cart";
		});

		$(document).on("click", ".header__stepper__dimaco .header__icon__2, .header__stepper__dimaco .header__step__2", () => {
			window.location.hash = "#/shipping";
		});

		$(document).on("click", ".header__stepper__dimaco .header__icon__3, .header__stepper__dimaco .header__step__3", () => {
			window.location.hash = "#/payment";
		});

		const applyStyles = () => {
			if (window.location.hash === "#/cart") {
				$(".header__step__2, .header__bar__1").css("background-color", "#DEDEDE");
				$(".header__step__3, .header__bar__2").css("background-color", "#DEDEDE");
			} else if (window.location.hash === "#/shipping") {
				$(".header__step__2, .header__bar__1").css("background-color", "#EE8411");
				$(".header__step__3, .header__bar__2").css("background-color", "#DEDEDE");
			} else if (window.location.hash === "#/payment") {
				$(".header__step__2, .header__bar__1, .header__step__3, .header__bar__2").css("background-color", "#EE8411");
			}
		};

		applyStyles();
	};

	$(window).on("load hashchange", header__change);
});


/* MEJORAR LA CALIDAD DE LAS IMAGENES DE 55-55 a 128-128 */
const image__cart = (time = 1000) => {
	setTimeout(() => {
		$(".table.cart-items td.product-image img").each(function () {
			let img = $(this);
			let src = img.attr("src");
			let newSrc = src.replace(/(\d+)-(\d+)(-\d+)/, `$1-128-128`);
			img.attr("src", newSrc);
		});
	}, time);
}

$(window).on("load", image__cart)
$(window).on("hashchange", image__cart)
$(window).on("orderFormUpdated.vtex", () => image__cart(1250))

/* LINK de  Elegir más Productos*/
const loadMyCompLink = () => {
	const LinkComp = setInterval(() => {
		const btn = $(".checkout-container .cart-template .summary-template-holder .btn-place-order-wrapper");
		const linkHome = $(".Link__Home");

		if (btn.length && !linkHome.length) {
			try {
				clearInterval(LinkComp)
				btn.after("<a href='/' class='Link__Home cano__s'>Elegir más Productos</a>")
			} catch (error) {
			}
		}
	}, 500);
}

$(window).on("load", loadMyCompLink)

const colorSummary = () => {
	const summarytwo = $(".summary-template-holder .accordion-body.collapse.in").eq(1);
	if (summarytwo.length) {
		$(".summary-template-holder .accordion-body.collapse.in").eq(1).addClass("summary__cano__color");
	}
}
/* COLOR SUMMARY */
$(window).on("load", colorSummary)
$(window).on("hashchange", colorSummary)


/* faviconLink */
$(window).on("load", () => {
	const faviconLink = $('<link>', {
		rel: 'shortcut icon',
		href: '/arquivos/favico_dimaco.png'
	});
	$('head').append(faviconLink);
});


/* ################## INICIO - INPUT__GROUP  para facturacion ################## */
const updateCustomData = async ({ appId, body }) => {
	const url = `/api/checkout/pub/orderForm/${vtexjs.checkout.orderFormId}/customData/${appId}`;
	const method = "PUT";

	try {
		const res = await fetch(url, {
			body: JSON.stringify(body),
			method
		})
		await vtexjs.checkout.getOrderForm().done(of => { })
		return res;
	} catch (error) {
		return error;
	}
}

$(document).ready(function () {
    vtex.validation.regex.numericPunctuation = /^[a-zA-Z0-9 .,\\-]+$/;
});

const facturacion = {
	main: () => {
		$(document).ready(() => {
			$("a#not-corporate-client").on("click", () =>
				$("button#go-to-shipping").prop("disabled", false)
			);
		});

		$(window).on("load hashchange", () => {
			const { createInputFactura, validateInputFactura } = facturacion;
			createInputFactura()
			validateInputFactura()
		});
	},

	regionComunasMap: {
		"Región Metropolitana": ["Alhué", "Buin", "Calera De Tango", "Centro de Ski - El Colorado", "Centro de Ski - Farellones", "Centro de Ski - La Parva", "Centro de Ski - Valle Nevado", "Cerrillos", "Cerro Navia", "Chicureo", "Colina", "Conchalí", "Curacaví", "El Bosque", "El Monte", "Estación Central", "Huechuraba", "Independencia", "Isla De Maipo", "La Cisterna", "La Florida", "La Granja", "La Pintana", "La Reina", "Lampa", "Las Condes", "Lo Barnechea", "Lo Barnechea (Excepto Cordillera)", "Lo Espejo", "Lo Prado", "Macul", "Maipú", "María Pinto", "Melipilla", "Ñuñoa", "Padre Hurtado", "Paine", "Pedro Aguirre Cerda", "Peñaflor", "Peñalolén", "Pirque", "Providencia", "Pudahuel", "Puente Alto", "Quilicura", "Quinta Normal", "Recoleta", "Renca", "San Bernardo", "San Joaquín", "San José De Maipo", "San Miguel", "San Pedro", "San Ramón", "Santiago", "Talagante", "Tiltil", "Vitacura"],
		"Región de Tarapacá (I)": ["Camiña", "Colchane", "Huara", "Iquique", "Pica", "Pozo Almonte", "Alto Hospicio"],
		"Región de Antofagasta (II)": ["Antofagasta", "Calama", "María Elena", "Mejillones", "Ollagüe", "San Pedro De Atacama", "Sierra Gorda", "Taltal", "Tocopilla"],
		"Región de Atacama (III)": ["Alto Del Carmen", "Caldera", "Chañaral", "Copiapó", "Diego De Almagro", "Freirina", "Huasco", "Tierra Amarilla", "Vallenar"],
		"Región de Coquimbo (IV)": ["Andacollo", "Canela", "Caleta Hornos", "Combarbalá", "Coquimbo", "Guanaqueros", "Illapel", "La Higuera", "La Serena", "Las Tacas", "Los Vilos", "Monte Patria", "Morrillos", "Ovalle", "Paihuano", "Playa Blanca", "Puerto Velero", "Punitaqui", "Río Hurtado", "Salamanca", "Tongoy", "Totoralillo", "Vicuña"],
		"Región de Valparaíso (V)": ["Algarrobo", "Cabildo", "Calle Larga", "Cartagena", "Casablanca", "Catemu", "Concón", "El Quisco", "El Tabo", "Hijuelas", "Isla De Pascua", "Juan Fernández", "La Calera", "La Cruz", "La Ligua", "Limache", "Llay-Llay", "Los Andes", "Nogales", "Olmué", "Panquehue", "Papudo", "Petorca", "Puchuncaví", "Putaendo", "Quillota", "Quilpué", "Quintero", "Rinconada", "San Antonio", "San Esteban", "San Felipe", "Santa María", "Santo Domingo", "Valparaíso", "Villa Alemana", "Viña Del Mar", "Zapallar"],
		"Región del Libertador General Bernardo O'Higgins (VI)": ["Chépica", "Chimbarongo", "Codegua", "Coinco", "Coltauco", "Doñihue", "Graneros", "La Estrella", "Lago Rapel", "Las Cabras", "Litueche", "Lolol", "Machalí", "Malloa", "Marchigüe", "Mostazal", "Nancagua", "Navidad", "Olivar", "Palmilla", "Paredones", "Peralillo", "Peumo", "Pichidegua", "Pichilemu", "Placilla", "Pumanque", "Quinta De Tilcoco", "Rancagua", "Rengo", "Requinoa", "San Fernando", "San Vicente", "Santa Cruz"],
		"Región del Maule (VII)": ["Cauquenes", "Chanco", "Colbún", "Constitución", "Curepto", "Curicó", "Empedrado", "Hualañé", "Licantén", "Linares", "Longaví", "Maule", "Molina", "Parral", "Pelarco", "Pelluhue", "Pencahue", "Rauco", "Retiro", "Río Claro", "Romeral", "Sagrada Familia", "San Clemente", "San Javier", "San Rafael", "Talca", "Teno", "Vichuquén", "Villa Alegre", "Yerbas Buenas"],
		"Región del Biobío (VIII)": ["Alto Bío Bío", "Antuco", "Arauco", "Cabrero", "Cañete", "Chiguayante", "Concepción", "Contulmo", "Coronel", "Curanilahue", "Dichato", "Florida", "Hualpén", "Hualqui", "Laja", "Lebu", "Lirquen", "Los Alamos", "Los Ángeles", "Lota", "Mulchén", "Nacimiento", "Negrete", "Penco", "Pingueral", "Quilaco", "Quilleco", "Recinto", "San Pedro De la Paz", "San Rosendo", "Santa Bárbara", "Santa Juana", "Talcahuano", "Tirúa", "Tomé", "Tucapel", "Yumbel"],
		"Región de La Araucanía (IX)": ["Angol", "Caburga", "Calafquen", "Carahue", "Cholchol", "Collipulli", "Corralco", "Cunco", "Curacautín", "Curarrehue", "Ercilla", "Freire", "Galvarino", "Gorbea", "Lago Cólico", "Lago Cólico Norte", "Lago Cólico Sur", "Lautaro", "Licanray", "Loncoche", "Lonquimay", "Los Sauces", "Lumaco", "Malalcahuello", "Melipeuco", "Nueva Imperial", "Padre Las Casas", "Perquenco", "Pitrufquén", "Pucón", "Puerto Saavedra", "Purén", "Renaico", "Temuco", "Teodoro Schmidt", "Toltén", "Traiguén", "Victoria", "Vilcún", "Villarrica"],
		"Región de Los Lagos (X)": ["Ancud", "Calbuco", "Castro", "Chaitén", "Chonchi", "Cochamó", "Curaco De Vélez", "Dalcahue", "El Islote", "Ensenada", "Fresia", "Frutillar", "Futaleufú", "Hualaihué", "Llanquihue", "Los Muermos", "Marina Rupanco", "Maullín", "Osorno", "Palena", "Puerto Montt", "Puerto Octay", "Puerto Varas", "Puqueldón", "Purranque", "Puyehue", "Queilén", "Quellón", "Quemchi", "Quinchao", "Río Negro", "San Juan De la Costa", "San Pablo"],
		"Región de Aysén del General Carlos Ibáñez del Campo (XI)": ["Aysén", "Chile Chico", "Cisnes", "Cochrane", "Coyhaique", "Guaitecas", "Lago Verde", "O'Higgins", "Río Ibáñez", "Tortel"],
		"Región de Magallanes y la Antártica Chilena (XII)": ["Antártica", "Cabo De Hornos", "Laguna Blanca", "Porvenir", "Primavera", "Puerto Natales", "Punta Arenas", "Río Verde", "San Gregorio", "Timaukel", "Torres Del Paine"],
		"Región de Los Ríos (XIV)": ["Coñaripe", "Corral", "Futrono", "La Union", "Lago Ranco", "Lanco", "Los Lagos", "Mafil", "Mariquina", "Paillaco", "Panguipulli", "Rio Bueno", "Valdivia"],
		"Región de Arica y Parinacota (XV)": ["Arica", "Camarones", "General Lagos", "Putre"],
		"Región del Ñuble (XVI)": ["Bulnes", "Chillán", "Chillán Viejo", "Cobquecura", "Coelemu", "Coihueco", "El Carmen", "Ninhue", "Ñiquén", "Pemuco", "Pinto", "Portezuelo", "Quillón", "Quirihue", "Ranquil", "San Carlos", "San Fabián", "San Ignacio", "San Nicolás", "Treguaco", "Yungay"],
	},

	data__fact: {},

	complete__info: () => Object.values(facturacion.data__fact).every(value => value !== ""),

	getFacturaData: () => vtexjs.checkout?.orderForm?.customData?.customApps?.find(app => app.id === "datos_factura_v2")?.fields || "",

	setupFacturaInputs: () => {
		const { data__fact, complete__info, updateComunas } = facturacion;

		if (data__fact.region) {
			$("#region_v2").val(data__fact.region);
			updateComunas(data__fact.region, data__fact.comuna);
		}

		$("#region_v2").on("change", function () {
			const selectedRegion = $(this).val();
			data__fact.region = selectedRegion;
			updateComunas(selectedRegion);
		});

		const fields = [
			{ id: "direccion_v2", key: "direccion" },
			{ id: "region_v2", key: "region" },
			{ id: "comuna_v2", key: "comuna" },
		];

		let timeout__factura = null;

		fields.forEach(({ id, key }) => {
			$(`#${id}`).on("input", function () {

				data__fact[key] = $(this).val();
				const isComplete = complete__info();
				console.log("DATOS__facturacion", data__fact)

				if (isComplete) {
					clearTimeout(timeout__factura);
					timeout__factura = setTimeout(async () => {
						await updateCustomData({
							appId: "datos_factura_v2",
							body: data__fact,
						});
					}, 1700);
				}
			});
		});
	},

	updateComunas: (selectedRegion, preselectedComuna = "") => {
		const comunas = facturacion.regionComunasMap[selectedRegion] || [];
		const $comunaSelect = $("#comuna_v2");
		$comunaSelect.empty();
		$comunaSelect.append('<option value="" hidden>Seleccione una comuna</option>');

		comunas.forEach(comuna => {
			const isSelected = comuna === preselectedComuna ? "selected" : "";
			$comunaSelect.append(`<option value="${comuna}" ${isSelected}>${comuna}</option>`);
		});

		if (preselectedComuna) {
			facturacion.data__fact.comuna = preselectedComuna;
		}
	},

	createInputFactura: () => {
		if (window.location.hash !== "#/profile") return;

		const input__group = setInterval(() => {
			const link__factura = $("h5.corporate-title");
			const box__corporate = $("form.form-step.box-edit fieldset.box-client-info-pj div.corporate-info-box");

			if (link__factura.hasClass("visible") && $("#aditional__info__factura").length) {
				clearInterval(input__group);
				return;
			}

			if (Object.keys(facturacion.data__fact).length === 0) {
				const dataFactOF = facturacion.getFacturaData()
				facturacion.data__fact.direccion = dataFactOF?.direccion || ""
				facturacion.data__fact.comuna = dataFactOF?.comuna || ""
				facturacion.data__fact.region = dataFactOF?.region || ""

				console.log("data__fact", facturacion.data__fact)
				console.log("data__fact", dataFactOF)
			}

			const aditional__info__factura = `
				<div id="aditional__info__factura">
					<div class='data__comuna'>
						<div>
							<label class="label__v2" for="region_v2">Región (Obligatorio):</label>
							<select class="input__v2" id="region_v2" name="region">
								<option value="" hidden>Seleccione una región</option>
								${Object.keys(facturacion.regionComunasMap)
									.map(region => `<option value="${region}">${region}</option>`)
									.join("")
								}
							</select>
						</div>
						<div>
							<label class="label__v2" for="comuna_v2">Comuna (Obligatorio):</label>
							<select class="input__v2" id="comuna_v2" name="comuna"> <option value="" hidden>Seleccione una comuna</option></select>
						</div>
					</div>
					<label class="label__v2" for="direccion_v2">Dirección de facturación (Obligatorio):</label>
					<input class="input__v2" type="text" id="direccion_v2" value="${facturacion.data__fact?.direccion || ""}" name="direccion" placeholder="Ingrese su Dirección de facturación">
				</div>
			`;

			if (link__factura.hasClass("visible") && !$("#aditional__info__factura").length) {
				clearInterval(input__group);
				box__corporate.append(aditional__info__factura);
				facturacion.setupFacturaInputs();
			}
		}, 500);
	},

	validateInputFactura: () => {
		let validate__Factura = setInterval(() => {
			if (window.location.hash !== "#/profile") {
				clearInterval(validate__Factura);
				return;
			}

			if ($("h5.corporate-title").hasClass("visible")) {
				if (!$("#client-company-nickname").val()) {
					$("#client-company-nickname")
						.val("not tradeName value")
						.trigger($.Event("keydown", { keyCode: 9 }))
						.trigger("click");
				}

				const fieldsToValidate = [
					"#client-company-name", "#client-company-nickname",
					"#client-company-ie", "#client-company-document",
					"#direccion_v2", "#region_v2", "#comuna_v2"
				];

				if($("#rut__no__valido").length){
					$("button#go-to-shipping").prop("disabled", true);
					return 
				}

				const allFieldsCompleted = fieldsToValidate.every(field => {
					const $field = $(field);
					return $field.val().trim() !== "";
				});

				$("button#go-to-shipping").prop("disabled", !allFieldsCompleted);
			} else {
				$("button#go-to-shipping").prop("disabled", false);
			}
		}, 1500);
	},
}

facturacion.main()

function validateChileanRut(rut) {
	const cleanRut = rut.replace(/[^0-9kK]/g, '');
	if (cleanRut.length < 2) return false;

	const cuerpo = cleanRut.slice(0, -1);
	const dv = cleanRut.slice(-1).toLowerCase();
	let suma = 0;
	let multiplicador = 2;

	for (let i = cuerpo.length - 1; i >= 0; i--) {
		suma += parseInt(cuerpo.charAt(i)) * multiplicador;
		multiplicador = (multiplicador === 7) ? 2 : multiplicador + 1;
	}

	let dvEsperado = 11 - (suma % 11);
	if (dvEsperado === 11) dvEsperado = '0';
	else if (dvEsperado === 10) dvEsperado = 'k';
	else dvEsperado = dvEsperado.toString();

	return dv === dvEsperado;

}

const applyRutValidation = () => {
	const selectors = [
		"#client-document",
		"#client-company-document",
	];

	// 1) Configurar un observer para cada input, que vigile su contenedor

	selectors.forEach(selector => {
		$(selector).each(function () {
			const $input = $(this);
			const $wrapper = $input.closest(".vtex-input, .vtex-text-field");

			if ($wrapper.length) {
				// Observer para eliminar el check verde si el RUT es inválido

				const observer = new MutationObserver(() => {
					const rutActual = $input.val()?.trim();
					const isValid = validateChileanRut(rutActual);

					// Si es inválido => quitar clase de éxito y cualquier ícono check
					if (!isValid) {
						$wrapper.removeClass("vtex-input--success");
						$wrapper.find(".vtex-input__icon-check, .icon-check, [data-icon='check']").remove();
					}
				});
				observer.observe($wrapper[0], { childList: true, attributes: true, subtree: true });
			}
		});
	});

	// 2) Lógica principal de validación en "input"
	selectors.forEach(selector => {
		$(document).on("input", selector, function () {
			const $input = $(this);
			const rut = $input.val().trim();
			const isValid = validateChileanRut(rut);
			$input.next(".rut-error").remove();

			const setBorder = color => {
				$input[0].style.setProperty("border", `2px solid ${color}`, "important");
			};

			if (isValid) {
				setBorder("green");
			} else {
				setBorder("red");
				$input.after(`
					<div class="rut-error" id="rut__no__valido" style="color:red;font-size:12px;margin-top:3px;">
						RUT inválido<br>
						Introduzca un documento válido, por favor.
					</div>
				`);
			}

			const anyInvalid = selectors.some(sel => {
				const val = $(sel).val()?.trim();
				return val && !validateChileanRut(val);
			});

			$("button#go-to-shipping, button#btn-go-to-payment").prop("disabled", anyInvalid);
		});
	});
};

$(document).ready(applyRutValidation);

/* ################## FIN - INPUT__GROUP  para facturacion ################## */



/* CASOS DE FACTURACION */
const facturacionEmpresas = () => {
	if(window.location.hash === "#/payment" || window.location.hash ==="#/shipping"){
		const fieldset = $("form.form-step fieldset.box-client-info-pj div.corporate-info-box")
		const display = fieldset.css("display");
		if(!vtexjs?.checkout?.orderForm?.customData && display === "block"){
			window.location.hash = "#/profile"
		}
	}
} 
$(window).on("load", facturacionEmpresas);
$(window).on("hashchange", facturacionEmpresas);

const mensajeEntrega = () => {
	setInterval(() => {
		if (location.hash !== "#/shipping") return;
		const messages = $(".vtex-omnishipping-1-x-leanShippingOption .shp-option-text .shp-option-text-package span");

		messages.each(function () {
			const text = $(this).text(); 
			if(text.includes("9 a 19h")) return
			const match = text.match(/(\d+)/); 

			if (match) {
				const daysToAdd = parseInt(match[1], 10);
				const addBusinessDays = (startDate, days) => {
					const date = new Date(startDate);
					let added = 0;
					while (added < days) {
						date.setDate(date.getDate() + 1);
						const day = date.getDay();
						if (day !== 0 && day !== 6) {
							// No domingo (0) ni sábado (6)
							added++;
						}
					}
					return date;
				};

				const deliveryDate = addBusinessDays(new Date(), daysToAdd);
				const opcionesFecha = { weekday: 'long', day: 'numeric', month: 'short' };
				const fechaFormateada = deliveryDate.toLocaleDateString('es-MX', opcionesFecha);
				$(this).text(`Llega el ${fechaFormateada} de 9 a 19h`);
			}
		});
	}, 550);
}

$(window).on("load", mensajeEntrega);