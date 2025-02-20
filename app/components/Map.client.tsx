import type { LatLngTuple } from 'leaflet';
import { useEffect } from 'react';
import { MapContainer, TileLayer, Marker, useMap } from 'react-leaflet';

export function Map({
	height,
	initialPosition,
}: {
	height: string;
	initialPosition: LatLngTuple;
}) {
	const position: LatLngTuple = initialPosition;

	return (
		<div style={{ height }}>
			<MapContainer
				style={{
					height: '100%',
				}}
				center={position}
				zoom={13}
				scrollWheelZoom={false}
			>
				<TileLayer
					attribution='&copy; <a href="https://www.openstreetmap.org/copyright">OpenStreetMap</a> contributors'
					url="https://{s}.tile.openstreetmap.org/{z}/{x}/{y}.png"
				/>
				<MapMarker position={position} />
			</MapContainer>
		</div>
	);
}

const MapMarker = ({ position }: { position: LatLngTuple }) => {
	const map = useMap();
	useEffect(() => {
		map.setView(position);
	}, [map, position]);

	return <Marker position={position}></Marker>;
};
