/* eslint-disable @typescript-eslint/no-explicit-any */
import type { ClientsConfig, RecorderState, ServiceContext, EventContext, } from '@vtex/api'
import { method, Service } from '@vtex/api'
import { Clients } from './clients'
import { getSkuById } from './middlewares/getSkuById'
import { skuprice } from './middlewares/price'

const TIMEOUT_MS = 800

const clients: ClientsConfig<Clients> = {
	implementation: Clients,
	options: {
		default: {
			retries: 2,
			timeout: TIMEOUT_MS,
		},

	},
}

declare global {

	type Context = ServiceContext<Clients, State>

	interface StatusChangeContext extends EventContext<Clients> {
		body: {
			domain: string
			orderId: string
			currentState: string
			lastState: string
			currentChangeDate: string
			lastChangeDate: string

		}
	}


	interface State extends RecorderState {
		code: number
	}
}


export default new Service({
	clients,
	routes: {
		getSkuById: method({
			GET: getSkuById,
		}),
		sku_price: method({
			GET: skuprice,
		})
	}
})
