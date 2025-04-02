import * as M from 'webm-muxer';
import { EncoderHostFrameMessage, EncoderHostMessage, JobParams } from "./types";

type EncoderState = {
    encoder: VideoEncoder
    muxer: M.Muxer<M.ArrayBufferTarget>
    jobParams: JobParams
} | null

let encoderState: EncoderState = null

const log = (msg: string, ...rest: any) => console.log("[ENCODER] " + msg, rest)

self.onmessage = async (event) => {
    const message = event.data as EncoderHostMessage;

    try {
        switch (message.messageType) {
            case "submit":
                const job = message.job;
                await initEncoder(job);
                break;
            case "frame":
                onFrame(message)
                break;
            case "terminate":
                cleanup()
                break;
        }
    } catch (e) {
        onError(e as Error)
        cleanup()
    }
}

const onFrame = async (message: EncoderHostFrameMessage) => {
    if (!encoderState) throw new Error("Encoder not initialized!");

    const timestamp = message.frame * encoderState.jobParams.frameTime * 1_000_000

    const videoFrame = new VideoFrame(message.image, { timestamp })

    let opts: VideoEncoderEncodeOptions = {}

    if (message.frame % encoderState.jobParams.framerate === 0) {
        opts.keyFrame = true
    }

    encoderState.encoder.encode(videoFrame, opts)

    if (message.frame >= encoderState.jobParams.numFrames - 1) {
        log("flushing")

        await encoderState.encoder.flush()
        encoderState.muxer.finalize()

        

        self.postMessage({
            messageType: "completed",
            buffer: encoderState.muxer.target.buffer,
        })

        log("done")

        cleanup()
    }

    videoFrame.close()

    self.postMessage({
        messageType: "frame",
        frame: message.frame
    })
}

const cleanup = () => {
    log("cleaning up")
    if (encoderState) {
        encoderState.encoder.close()
    }
    self.close()
}

const onError = (e: Error) => {
    self.postMessage({ messageType: "error", error: e });
}

const initEncoder = async (job: JobParams) => {
    const config: VideoEncoderConfig = {
        width: job.width,
        height: job.height,
        bitrate: job.bitrate,
        framerate: job.framerate,
        codec: 'vp09.00.10.08',
    }

    const support = await VideoEncoder.isConfigSupported(config);
    if (!support.supported) {
        onError(new Error("This videoEncoder config is not supported"))
    }


    const muxer = new M.Muxer({
        target: new M.ArrayBufferTarget(),
        video: {
            codec: 'V_VP9',
            width: job.width,
            height: job.height,
            frameRate: job.framerate
        }
    });

    const encoder = new VideoEncoder({
        output: (chunk, metadata) => {
            muxer.addVideoChunk(chunk, metadata)
        },
        error: onError,
    })

    encoder.configure(config)

    encoderState = { encoder, muxer, jobParams: job }

    log("initialized", encoderState)
}
