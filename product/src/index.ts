import { app } from './app';
import sanitizedConfig from './config';
import { natsWrapper } from './nats-wrapper';

import { SignInListener } from './events/listeners/signin-listener';
import { SignOutListener } from './events/listeners/signout-listener';

const start = async () => {
	try {
		await natsWrapper.connect(
			sanitizedConfig.NATS_CLUSTER_ID,
			sanitizedConfig.NATS_CLIENT_ID,
			sanitizedConfig.NATS_URL,
		);
		natsWrapper.client.on('close', () => {
			console.log('NATS Connection Closed.');
			process.exit();
		});

		process.on('SIGINT', () => natsWrapper.client.close());
		process.on('SIGTERM', () => natsWrapper.client.close());

		new SignInListener(natsWrapper.client).listen();
		new SignOutListener(natsWrapper.client).listen();
	} catch (err) {
		console.error(err);
	}

	app.listen(sanitizedConfig.PORT, () => {
		console.log(`listening on port ${sanitizedConfig.PORT}`);
	});
};

start();
