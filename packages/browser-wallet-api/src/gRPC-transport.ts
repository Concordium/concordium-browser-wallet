import { InjectedMessageHandler, MessageStatusWrapper, MessageType } from '@concordium/browser-wallet-message-hub';
import { GrpcStatusCode, GrpcWebFetchTransport } from '@protobuf-ts/grpcweb-transport';
import {
    ClientStreamingCall,
    Deferred,
    DuplexStreamingCall,
    MethodInfo,
    RpcError,
    RpcMetadata,
    RpcOptions,
    RpcOutputStreamController,
    RpcStatus,
    RpcTransport,
    ServerStreamingCall,
    UnaryCall,
} from '@protobuf-ts/runtime-rpc';

/**
 * A transport that retrieves the location of the server from the wallet each time a request is made.
 * TODO: Move the actual fetch to the background / or content script to make this more robust / not leak the URL into this context.
 */
export class BWGRPCTransport implements RpcTransport {
    messageHandler: InjectedMessageHandler;

    transport: RpcTransport | undefined;

    constructor(messageHandler: InjectedMessageHandler) {
        this.messageHandler = messageHandler;
    }

    mergeOptions(options: RpcOptions) {
        return this.transport?.mergeOptions(options) || { ...options };
    }

    unary<I extends object, O extends object>(
        method: MethodInfo<I, O>,
        input: I,
        options: RpcOptions
    ): UnaryCall<I, O> {
        const defHeader = new Deferred<RpcMetadata>();
        const defMessage = new Deferred<O>();
        const defStatus = new Deferred<RpcStatus>();
        const defTrailer = new Deferred<RpcMetadata>();

        this.messageHandler
            .sendMessage<MessageStatusWrapper<string>>(MessageType.GrpcRequest)
            .then((response) => {
                if (!response.success) {
                    throw new Error(response.message);
                }
                this.transport = new GrpcWebFetchTransport({ baseUrl: response.result });
                const unary = this.transport.unary(method, input, options);
                unary.headers.then(defHeader.resolve.bind(defHeader)).catch(defHeader.reject.bind(defHeader));
                unary.response.then(defMessage.resolve.bind(defMessage)).catch(defMessage.reject.bind(defMessage));
                unary.status.then(defStatus.resolve.bind(defStatus)).catch(defStatus.reject.bind(defStatus));
                unary.trailers.then(defTrailer.resolve.bind(defTrailer)).catch(defTrailer.reject.bind(defTrailer));
            })
            .catch((error) => {
                defHeader.rejectPending(error);
                defMessage.rejectPending(error);
                defStatus.rejectPending(error);
                defTrailer.rejectPending(error);
            });

        return new UnaryCall(
            method,
            options?.meta || {},
            input,
            defHeader.promise,
            defMessage.promise,
            defStatus.promise,
            defTrailer.promise
        );
    }

    serverStreaming<I extends object, O extends object>(
        method: MethodInfo<I, O>,
        input: I,
        options: RpcOptions
    ): ServerStreamingCall<I, O> {
        const defHeader = new Deferred<RpcMetadata>();
        const defStatus = new Deferred<RpcStatus>();
        const defTrailer = new Deferred<RpcMetadata>();
        const responseStream = new RpcOutputStreamController<O>();

        this.messageHandler
            .sendMessage<MessageStatusWrapper<string>>(MessageType.GrpcRequest)
            .then((response) => {
                if (!response.success) {
                    throw new Error(response.message);
                }
                this.transport = new GrpcWebFetchTransport({ baseUrl: response.result });
                const stream = this.transport.serverStreaming(method, input, options);
                stream.headers.then(defHeader.resolve.bind(defHeader)).catch(defHeader.reject.bind(defHeader));
                stream.responses.onNext(responseStream.notifyNext.bind(responseStream));
                stream.status.then(defStatus.resolve.bind(defStatus)).catch(defStatus.reject.bind(defStatus));
                stream.trailers.then(defTrailer.resolve.bind(defTrailer)).catch(defTrailer.reject.bind(defTrailer));
            })
            .catch((error) => {
                defHeader.rejectPending(error);
                responseStream.notifyError(error);
                defStatus.rejectPending(error);
                defTrailer.rejectPending(error);
            });

        return new ServerStreamingCall(
            method,
            options?.meta || {},
            input,
            defHeader.promise,
            responseStream,
            defStatus.promise,
            defTrailer.promise
        );
    }

    clientStreaming<I extends object, O extends object>(method: MethodInfo<I, O>): ClientStreamingCall<I, O> {
        const e = new RpcError(
            'Client streaming is not supported by grpc-web',
            GrpcStatusCode[GrpcStatusCode.UNIMPLEMENTED]
        );
        e.methodName = method.name;
        e.serviceName = method.service.typeName;
        throw e;
    }

    duplex<I extends object, O extends object>(method: MethodInfo<I, O>): DuplexStreamingCall<I, O> {
        const e = new RpcError(
            'Duplex streaming is not supported by grpc-web',
            GrpcStatusCode[GrpcStatusCode.UNIMPLEMENTED]
        );
        e.methodName = method.name;
        e.serviceName = method.service.typeName;
        throw e;
    }
}
