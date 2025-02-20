import { useReducer } from 'react';
import ApiClient from '../lib/apiClient';
import { Method } from 'axios';

interface State {
	isLoading: boolean;
	error: any;
	response: any;
}

interface Action {
	type: 'FETCH_INIT' | 'FETCH_SUCCESS' | 'FETCH_FAILURE';
	payload?: any;
}
interface UseFetchAction {
	onSuccess?: (res: any) => void;
	onError?: (error: any) => void;
}
interface Options extends RequestInit {
	type?: 'formdata' | undefined;
	data?: any;
	headers?: any;
	url: string;
	method: Method;
}

const dataFetchReducer = (state: State, action: Action) => {
	switch (action.type) {
		case 'FETCH_INIT':
			return { ...state, isLoading: true, error: null, response: null };
		case 'FETCH_SUCCESS':
			return {
				...state,
				isLoading: false,
				error: null,
				response: action.payload,
			};
		case 'FETCH_FAILURE':
			return {
				...state,
				isLoading: false,
				error: action.payload,
				response: null,
			};
		default:
			return state;
	}
};

function useFetch(
	action?: UseFetchAction,
): [State, (options: Options) => Promise<unknown>] {
	const [state, dispatch] = useReducer(dataFetchReducer, {
		isLoading: false,
		error: null,
		response: null,
	});

	async function performAction(options: Options) {
		try {
			dispatch({ type: 'FETCH_INIT' });
			const res = await ApiClient(options.url, options);
			action && action.onSuccess && action.onSuccess(res);
			dispatch({ type: 'FETCH_SUCCESS', payload: res });
		} catch (e: any) {
			action && action.onError && action.onError(e);
			dispatch({ type: 'FETCH_FAILURE', payload: e });
		}
	}

	return [state, performAction];
}
export default useFetch;
