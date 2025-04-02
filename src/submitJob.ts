import { EncoderJobCompletedMessage, EncoderJobProgressMessage, EncoderWorkerMessage, JobCompletedMessage, JobParams, RendererJobFrameMessage, RendererWorkerMessage } from "./types";


/**
 * Submits a job to a web worker for rendering.
 */
export const submitJob = async (
    job: JobParams, 
    onRenderedFrame: (p: RendererJobFrameMessage) => void,
    onEncodedFrame: (p: EncoderJobProgressMessage) => void,
) => {
    const rendererWorker = new Worker(new URL('./rendererWorker.ts', import.meta.url));

    const encoderWorker = new Worker(new URL('./encoderWorker.ts', import.meta.url), { type: 'module' });

    const submitMessage = {
        messageType: "submit",
        job,
    };

    rendererWorker.postMessage(submitMessage);

    const renderJob = new Promise<JobCompletedMessage>((resolve, reject) => {
        rendererWorker.onmessage = (e) => {
            const message = e.data as RendererWorkerMessage;

            switch (message.messageType) {
                case "frame":
                    encoderWorker.postMessage(message)
                    onRenderedFrame(message);
                    break;
                case "completed":
                    resolve(message);
                    rendererWorker.terminate();
                    break;
                case "error":
                    reject(message.error);
                    rendererWorker.terminate();
                    break;
            }
        };

        rendererWorker.onerror = (e) => {
            reject(e);
            rendererWorker.terminate();
            encoderWorker.terminate();
        };
    });

    encoderWorker.postMessage(submitMessage)

    const encodeJob = new Promise<EncoderJobCompletedMessage>((resolve, reject) => {
        encoderWorker.onmessage = (e) => {
            const message = e.data as EncoderWorkerMessage;

            switch (message.messageType) {
                case "frame":
                    onEncodedFrame(message);
                    break;
                case "completed":
                    resolve(message);
                    encoderWorker.terminate();
                    break;
                case "error":
                    reject(message.error);
                    encoderWorker.terminate();
                    break;
            }
        };

        encoderWorker.onerror = (e) => {
            reject(e);
            rendererWorker.terminate();
            encoderWorker.terminate();
        };
    });

    const [_, buffer] = await Promise.all([renderJob, encodeJob]);

    return buffer
}
