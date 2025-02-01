
export default {
	async fetch(request, env) {
		const { pathname } = new URL(request.url);
		if (pathname.startsWith('/api/')) {
			return env.SERVICE.fetch(request);
		}
		// Otherwise, serve the static assets.
		// Without this, the Worker will error and no assets will be served.
		return env.ASSETS.fetch(request);
	}
}
