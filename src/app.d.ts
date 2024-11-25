// See https://svelte.dev/docs/kit/types#app.d.ts

import { Session } from "./lib/session/session";

// for information about these interfaces
declare global {
	namespace App {
		// interface Error {}
		interface Locals {
			session: Session | null,
			userId: number | null
		}
		// interface PageData {}
		// interface PageState {}
		// interface Platform {}
	}
}

export { };
