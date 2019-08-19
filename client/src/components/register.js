import React from 'react';
import { useMutation } from '@apollo/react-hooks';
import { REGISTER } from '../mutations';
import RegisterComp from './register-comp';

export default function Register(props) {
	const [register, { loading, error }] = useMutation(REGISTER, {
		onCompleted(data) {
			if (data.registerPlayer.successful) {
				sessionStorage.setItem("token", data.registerPlayer.event.token);
			}
		}
	});

	if (loading) return <p>Loading...</p>;

	if (error) {
		console.log(JSON.stringify(error));
		return <p>ERROR</p>;
	}

	return (
		<RegisterComp
			register={register}
			refetch={props.refetch} />
	);
}
