import type { LoaderFunction, MetaFunction } from '@remix-run/node';
import MobileBG from '../images/pattern-bg-mobile.png';
import Arrow from '../images/icon-arrow.svg';
import { useLoaderData } from '@remix-run/react';
import { useMemo, useRef } from 'react';
import { Map } from '../components/Map.client';
import { ClientOnly } from '../components/client-only';
import useFetch from '~/hooks/useFetch';

export const meta: MetaFunction = () => {
	return [
		{ title: 'IP TRacker' },
		{ name: 'description', content: 'IP Tracker APP' },
	];
};

export const loader: LoaderFunction = async () => {
	const response = await fetch(
		`https://geo.ipify.org/api/v2/country,city?apiKey=at_LxxJAOaspMQk5orx900VzVcdKqwCF`,
	);
	const data = await response.json();
	return {
		data,
		apiKey: 'at_LxxJAOaspMQk5orx900VzVcdKqwCF', // Pass the API key to the component
	};
};

export default function Index() {
	const { data, apiKey } = useLoaderData<typeof loader>();
	const inputRef = useRef<HTMLInputElement>(null);

	const [lookUpIPData, lookUpIP] = useFetch();

	const handleIpLookup = () => {
		if (inputRef.current?.value) {
			lookUpIP({
				url: `country,city?apiKey=${apiKey}&ipAddress=${inputRef.current?.value}`,
				method: 'GET',
			});
		}
	};

	const usableData = useMemo(() => {
		if (lookUpIPData.response) {
			return lookUpIPData.response;
		} else {
			return data;
		}
	}, [data, lookUpIPData.response]);

	const makeAddress = useMemo(() => {
		return `${usableData?.location?.city}, ${usableData?.location?.region}, ${usableData?.location?.postalCode}, ${usableData?.location?.country}`;
	}, [usableData]);

	const items = useMemo(() => {
		return [
			{
				label: 'IP ADDRESS',
				value: usableData?.ip,
			},
			{
				label: 'LOCATION',
				value: makeAddress,
			},
			{
				label: 'TIMEZONE',
				value: usableData?.location?.timezone,
			},
			{
				label: 'ISP',
				value: usableData?.isp,
			},
		];
	}, [
		makeAddress,
		usableData?.ip,
		usableData?.isp,
		usableData?.location?.timezone,
	]);

	return (
		<div className="h-screen">
			<header
				className={`flex flex-col items-center w-full h-1/3 md:h-full md:max-h-[225px] bg-no-repeat bg-center bg-cover p-4 `}
				style={{
					backgroundImage: `url(${MobileBG})`,
				}}
			>
				<h2 className="text-white text-2xl">IP Address Tracker</h2>
				<div className="relative w-full max-w-lg m-auto h-12 mt-6 ">
					<input
						ref={inputRef}
						className="h-12 w-full rounded-lg px-4 pr-14 bg-white outline-none text-gray-800"
						type="text"
						placeholder="Search for any IP address or domain"
					/>
					<div
						className="w-12 h-12 bg-black absolute right-0 top-0 flex items-center justify-center rounded-r-lg"
						onClick={handleIpLookup}
					>
						<img src={Arrow} alt="arrow" />
					</div>
				</div>
				<div
					className={`relative flex flex-col md:flex-row md:max-w-4xl md:w-full md:justify-around md:py-10 md:[&>*]:border-r-[1px] gap-4 bg-white p-4 items-center justify-center mx-4 mt-4 rounded-xl w-full z-20 ${
						lookUpIPData?.isLoading ? 'blur-sm' : ''
					}`}
				>
					{items.map((item, index) => (
						<div
							key={item.label}
							className={`flex flex-col gap-1 items-center justify-center md:w-1/4 ${
								index === items.length - 1 ? '!border-r-0' : ''
							}`}
						>
							<span className="text-sm text-gray-500 font-semibold text-center">
								{item.label}
							</span>
							<span className="text-xl text-black text-center font-semibold">
								{item.value}
							</span>
						</div>
					))}
				</div>
			</header>

			<main className="w-full h-2/3 md:h-full z-0 relative">
				<ClientOnly
					fallback={
						<div
							id="skeleton"
							style={{ height: '100%', background: '#d1d1d1' }}
						/>
					}
				>
					{() => (
						<Map
							height="100%"
							initialPosition={[
								usableData?.location?.lat,
								usableData?.location?.lng,
							]}
						/>
					)}
				</ClientOnly>
			</main>
		</div>
	);
}
