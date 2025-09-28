const amqp = require("amqplib");
const { logger } = require("../utils/logger");

let connection;
let channel;

const setupRabbitMQ = async () => {
  try {
    const rabbitmqUrl = process.env.RABBITMQ_URL || "amqp://localhost";

    // Create connection
    connection = await amqp.connect(rabbitmqUrl);

    // Create channel
    channel = await connection.createChannel();

    // Setup queues
    const queues = [
      process.env.RABBITMQ_QUEUE_PRODUCTION || "production_queue",
      process.env.RABBITMQ_QUEUE_DEFECTS || "defects_queue",
      process.env.RABBITMQ_QUEUE_ANALYTICS || "analytics_queue",
    ];

    for (const queueName of queues) {
      await channel.assertQueue(queueName, {
        durable: true,
        maxLength: 10000,
        messageTtl: 24 * 60 * 60 * 1000,
      });
      logger.info(`Queue '${queueName}' ready`);
    }

    // Setup error handling
    connection.on("error", (error) => {
      logger.error("RabbitMQ connection error:", error);
    });

    connection.on("close", () => {
      logger.warn("RabbitMQ connection closed");
    });

    logger.info("RabbitMQ connected successfully");
    return { connection, channel };
  } catch (error) {
    logger.error("RabbitMQ connection failed:", error);
    throw error;
  }
};

const publishMessage = async (queue, message) => {
  try {
    if (!channel) {
      throw new Error("RabbitMQ channel not initialized");
    }

    const messageBuffer = Buffer.from(JSON.stringify(message));
    await channel.sendToQueue(queue, messageBuffer, {
      persistent: true,
      timestamp: Date.now(),
    });

    logger.info(`Message published to queue '${queue}'`);
  } catch (error) {
    logger.error("Failed to publish message:", error);
    throw error;
  }
};

const consumeMessages = async (queue, callback) => {
  try {
    if (!channel) {
      throw new Error("RabbitMQ channel not initialized");
    }

    await channel.consume(queue, async (message) => {
      if (message !== null) {
        try {
          const content = JSON.parse(message.content.toString());
          await callback(content);
          channel.ack(message);
        } catch (error) {
          logger.error("Error processing message:", error);
          channel.nack(message, false, false);
        }
      }
    });

    logger.info(`Consuming messages from queue '${queue}'`);
  } catch (error) {
    logger.error("Failed to consume messages:", error);
    throw error;
  }
};

const getChannel = () => {
  if (!channel) {
    throw new Error("RabbitMQ not initialized. Call setupRabbitMQ() first.");
  }
  return channel;
};

const closeConnection = async () => {
  try {
    if (channel) {
      await channel.close();
    }
    if (connection) {
      await connection.close();
    }
    logger.info("RabbitMQ connection closed");
  } catch (error) {
    logger.error("Error closing RabbitMQ connection:", error);
  }
};

module.exports = {
  setupRabbitMQ,
  publishMessage,
  consumeMessages,
  getChannel,
  closeConnection,
};
