import otpGenarator from 'otp-generator';

const AddMinutesToDate = (date: number, minutes: number) => {
	return new Date(date + minutes * 60000);
};

export const otpGenerate = () => {
	const otp = otpGenarator.generate(6, { upperCaseAlphabets: false, specialChars: false });
	const now = Date.now();

	const expirationTime = AddMinutesToDate(now, 10);
	return { otp, expirationTime, now };
};
