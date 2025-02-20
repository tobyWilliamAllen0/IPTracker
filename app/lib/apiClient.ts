import { Method } from 'axios';

function formatUrl(path: string) {
	const adjustedPath = path[0] !== '/' ? `/${path}` : path;
	return process.env.BASE_URL + adjustedPath;
	// return adjustedPath
}

async function checkStatus(response: Response) {
	if (response.status >= 200 && response.status < 300) {
		return parseJSON(response);
	}

	return Promise.reject(await response.text());
}

async function parseJSON(response: Response) {
	if (response && response.headers) {
		if (
			response.headers.get('Content-Type') === 'application/json; charset=UTF-8'
		) {
			return await response.json();
		}
		if (response.headers.get('Content-Type') === 'text/plain;charset=UTF-8') {
			return await response.text();
		}
	}
	return response;
}
interface Options extends RequestInit {
	type?: 'formdata' | undefined;
	data?: any;
	headers?: any;
	url: string;
	method: Method;
}
async function ApiClient(path: string, options: Options) {
	const url = formatUrl(path);
	const fetchOptions = options;

	fetchOptions.headers = fetchOptions.headers || {};

	if (fetchOptions.type === 'formdata') {
		fetchOptions.body = new FormData();

		for (const key in options.data) {
			if (
				typeof key === 'string' &&
				options.data.hasOwnProperty(key) &&
				typeof options.data[key] !== 'undefined'
			) {
				fetchOptions.body.append(key, options.data[key]);
			}
		}
	} else {
		fetchOptions.body = JSON.stringify(options.data);
		fetchOptions.headers['Content-Type'] = 'application/json';
		fetchOptions.headers['Accept'] = 'application/json';
	}

	return fetch(url, { ...fetchOptions })
		.then(checkStatus)
		.then(parseJSON);
}
export default ApiClient;
