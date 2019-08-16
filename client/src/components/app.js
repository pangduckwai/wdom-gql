import React from 'react';
import { useQuery } from '@apollo/react-hooks';
import { MYSELF } from '../queries';
import Main from './app-main';

export default function App() {
	const { data, loading, error, refetch } = useQuery(MYSELF);

	if (loading) return <p>Loading...</p>;
	if (error) return <p>ERROR</p>;
	return (
		<Main
			refetch={refetch}
			player={data.me} />
	);
}
