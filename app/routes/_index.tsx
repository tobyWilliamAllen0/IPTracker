import type { MetaFunction } from '@remix-run/node';

export const meta: MetaFunction = () => {
	return [
		{ title: 'IP TRacker' },
		{ name: 'description', content: 'IP Tracker APP' },
	];
};

export default function Index() {
	return <div className="h-screen"></div>;
}
