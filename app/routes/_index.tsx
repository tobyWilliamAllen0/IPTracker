import type { LoaderFunction, MetaFunction } from '@remix-run/node';
import MobileBG from '../images/pattern-bg-mobile.png';
import Arrow from '../images/icon-arrow.svg';
import { useLoaderData } from '@remix-run/react';
import { useMemo } from 'react';

export const meta: MetaFunction = () => {
	return [
		{ title: 'IP TRacker' },
		{ name: 'description', content: 'IP Tracker APP' },
	];
};

export const loader: LoaderFunction = async () => {
	const response = await fetch(
		process.env.BASE_URL! + `country,city?apiKey=${process.env.API_KEY}`,
	);
	return await response.json();
};

export default function Index() {
	const data = useLoaderData<typeof loader>();

	const makeAddress = useMemo(() => {
		return `${data?.location?.city}, ${data?.location?.region}, ${data?.location?.postalCode}, ${data?.location?.country}`;
	}, [data]);

	return (
		<div className="h-screen">
			<header
				className="flex flex-col items-center w-full h-[30%] bg-no-repeat bg-center bg-cover p-4"
				style={{
					backgroundImage: `url(${MobileBG})`,
				}}
			>
				<h2 className="text-white text-2xl">IP Address Tracker</h2>
				<div className="relative w-full h-12 mt-6">
					<input
						className="h-12 w-full max-w-md rounded-lg px-4 pr-14 bg-white outline-none text-gray-800"
						type="text"
						placeholder="Search for any IP address or domain"
					/>
					<div className="w-12 h-12 bg-black absolute right-0 top-0 flex items-center justify-center rounded-r-lg">
						<img src={Arrow} alt="arrow" />
					</div>
				</div>
				<div className="relative flex flex-col gap-4 bg-white p-4 items-center justify-center mx-4 mt-4 rounded-xl w-full z-20">
					<div className="flex flex-col gap-1 items-center justify-center">
						<span className="text-sm text-gray-500 font-semibold text-center">
							IP ADDRESS
						</span>
						<span className="text-xl text-black text-center font-semibold">
							{data?.ip}
						</span>
					</div>
					<div className="flex flex-col gap-1 items-center justify-center">
						<span className="text-sm text-gray-500 font-semibold text-center">
							LOCATION
						</span>
						<span className="text-xl text-black text-center font-semibold line-clamp-2 whitespace-nowrap text-ellipsis max-w-full text-wrap">
							{makeAddress}
						</span>
					</div>
					<div className="flex flex-col gap-1 items-center justify-center">
						<span className="text-sm text-gray-500 font-semibold text-center">
							TIMEZONE
						</span>
						<span className="text-xl text-black text-center font-semibold">
							{data?.location?.timezone}
						</span>
					</div>
					<div className="flex flex-col gap-1 items-center justify-center">
						<span className="text-sm text-gray-500 font-semibold text-center">
							ISP
						</span>
						<span className="text-xl text-black text-center font-semibold">
							{data?.isp}
						</span>
					</div>
				</div>
			</header>

			<main className="w-full h-[70%] z-0 relative"></main>
		</div>
	);
}
