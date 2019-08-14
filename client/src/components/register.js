import React from 'react';
import { useMutation } from '@apollo/react-hooks';
import { REGISTER } from '../mutations';
import RegisterComp from './register-comp';

export default function Register() {
	const [register, { loading, error }] = useMutation(REGISTER, {
		onCompleted({ response }) {
			if (response.successful) {
				localStorage.setItem("token", response.event.token);
			}
		}
	});

	if (loading) return <p>Loading...</p>;
	if (error) return <p>ERROR</p>;
	return <RegisterComp register={register} />;
}
