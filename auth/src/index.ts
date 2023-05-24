import { app } from './app';
import sanitizedConfig from './config';

const start = () => {
	app.listen(sanitizedConfig.PORT, () => {
		console.log(`listening on port ${sanitizedConfig.PORT}`);
	});
};

start();
