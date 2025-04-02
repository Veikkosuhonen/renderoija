export const codecs = [
    'vp09.00.10.08',
] as const;

export type Codec = typeof codecs[number];

export type JobParams = {
    glsl: string;
    width: number;
    height: number;
    numFrames: number;
    frameTime: number;
    framerate: number;
    bitrate: number;
    codec: Codec;
};

export type RendererJobFrameMessage = {
    messageType: "frame";
    frame: number;
    image: ImageBitmap;
}

export type EncoderJobProgressMessage = {
    messageType: "frame";
    frame: number;
}

export type EncoderHostFrameMessage = {
    messageType: "frame";
    frame: number;
    image: ImageBitmap;
}

export type EncoderJobCompletedMessage = {
    messageType: "completed",
    buffer: ArrayBuffer
}

export type JobSubmitMessage = {
    messageType: "submit";
    job: JobParams;
}

export type JobTerminateMessage = {
    messageType: "terminate";
}

export type JobCompletedMessage = {
    messageType: "completed";
}

export type JobErrorMessage = {
    messageType: "error";
    error: any;
}

export type RendererHostMessage = JobSubmitMessage | JobTerminateMessage;

export type EncoderHostMessage = EncoderHostFrameMessage | JobSubmitMessage | JobTerminateMessage;

export type RendererWorkerMessage = RendererJobFrameMessage | JobCompletedMessage | JobErrorMessage;

export type EncoderWorkerMessage = EncoderJobProgressMessage | EncoderJobCompletedMessage | JobErrorMessage;

export type WorkerStatus = "idle" | "working" | "completed" | "error";
