import otpGenarator from 'otp-generator';

const AddMinutesToDate = (date: Date, minutes: number) => {
	return new Date(date.getTime() + minutes * 60000);
};

export const otpGenerate = () => {
	const otp = otpGenarator.generate(6, { upperCaseAlphabets: false, specialChars: false });
	const now = new Date();
	const expirationTime = AddMinutesToDate(now, 10);
	return { otp, expirationTime, now };
};
