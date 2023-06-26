import path from 'path';

export const checkFileType = (file: any, cb: any) => {
	const fileTypes = /jpeg|jpg|png|gif|svg/;

	const extName = fileTypes.test(path.extname(file.originalname).toLowerCase());
	const mimeType = fileTypes.test(file.mimetype);

	if (extName && mimeType) {
		return cb(null, true);
	} else {
		cb('Error: you can only upload images');
	}
};
