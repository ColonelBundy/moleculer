/* eslint-disable no-console */

"use strict";

let ServiceBroker = require("../src/service-broker");

// Create broker
let broker = new ServiceBroker({
	nodeID: process.argv[2] || "sender-" + process.pid,
	transporter: "NATS",
	//transporter: "amqp://192.168.0.181:5672",
	//disableBalancer: true,
	//serializer: "ProtoBuf",
	logger: console,
	logFormatter: "simple"
});

let c = 1;
broker.createService({
	name: "event-sender",
	started() {
		setInterval(() => {
			this.logger.info(`Send 'user.created' event. ID: ${c}`);
			this.broker.emit("user.created", { id: c++ }); // Balanced
			//this.broker.emit("user.created", { id: c++ }, "payment"); // Balanced but only for 'payment' group
			//this.broker.broadcast("user.created", { id: c++ }); // Broadcasted all services
			//this.broker.broadcastLocal("user.created", { id: c++ }); // Broadcasted only local services
		}, 2000);

		setInterval(() => {
			this.broker.sendPing();
		}, 5000);
	},

	events: {
		"$node.pong"({ nodeID, elapsedTime, timeDiff }) {
			//this.logger.info(`PING-PONG from '${nodeID}' - Time: ${elapsedTime}ms, Time difference: ${timeDiff}ms `);
		}
	}
});

/*
broker.createService({
	name: "payment",
	events: {
		"user.created"(data, sender) {
			this.logger.info("PAYMENT: User created event received! ID:", data.id);
		}
	}
});

broker.createService({
	name: "mail",
	events: {
		"user.created": {
			handler(data, sender) {
				this.logger.info("MAIL: User created event received! ID:", data.id);
			}
		}
	}
});
*/
broker.start().then(() => {
	broker.repl();
});
