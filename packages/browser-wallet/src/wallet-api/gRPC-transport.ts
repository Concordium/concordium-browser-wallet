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
 * The purpose of this custom transport is to defer providing the baseUrl until a request is called, instead of when the transport is created,
 * but other than that it is just forwards the inputs to the internal GrpcWebFetchTransport and forwards the outputs to the returned UnaryCall / ServerStreamingCall.
 * TODO: Move the actual fetch to the background / or content script to make this more robust / not leak the URL into this context.
 */
export class BWGRPCTransport implements RpcTransport {
    messageHandler: InjectedMessageHandler;

    transport: RpcTransport;

    constructor(messageHandler: InjectedMessageHandler) {
        this.messageHandler = messageHandler;
        // baseUrl is placeholder that is replaced during the call.
        this.transport = new GrpcWebFetchTransport({ baseUrl: '' });
    }

    mergeOptions(options: RpcOptions) {
        return this.transport?.mergeOptions(options) || { ...options };
    }

    /**
     * UnaryCalls expects a single response from the server.
     */
    unary<I extends object, O extends object>(
        method: MethodInfo<I, O>,
        input: I,
        options: RpcOptions
    ): UnaryCall<I, O> {
        // Prepare the 4 outputs:
        const defHeader = new Deferred<RpcMetadata>();
        const defMessage = new Deferred<O>();
        const defStatus = new Deferred<RpcStatus>();
        const defTrailer = new Deferred<RpcMetadata>();

        // Retrieve the baseUrl from the background script:
        this.messageHandler
            .sendMessage<MessageStatusWrapper<string>>(MessageType.GrpcRequest)
            .then((response) => {
                if (!response.success) {
                    throw new Error(response.message);
                }
                // Perform the actual gRPC request: (Overwrite the baseUrl to use the one we got from the wallet)
                const unary = this.transport.unary(method, input, { ...options, baseUrl: response.result });
                // Forward results for all the 4 outputs:
                unary.headers.then(defHeader.resolve.bind(defHeader)).catch(defHeader.reject.bind(defHeader));
                unary.response.then(defMessage.resolve.bind(defMessage)).catch(defMessage.reject.bind(defMessage));
                unary.status.then(defStatus.resolve.bind(defStatus)).catch(defStatus.reject.bind(defStatus));
                unary.trailers.then(defTrailer.resolve.bind(defTrailer)).catch(defTrailer.reject.bind(defTrailer));
            })
            .catch((error) => {
                // Forward the error to all the 4 outputs if the background scripts returns a negative result:
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

    /**
     * serverStreaming expects any number of responses from the server, until it is closed with the status/trailers.
     */
    serverStreaming<I extends object, O extends object>(
        method: MethodInfo<I, O>,
        input: I,
        options: RpcOptions
    ): ServerStreamingCall<I, O> {
        // Prepare the 4 outputs:
        const defHeader = new Deferred<RpcMetadata>();
        const defStatus = new Deferred<RpcStatus>();
        const defTrailer = new Deferred<RpcMetadata>();
        const responseStream = new RpcOutputStreamController<O>();

        // Retrieve the baseUrl from the background script:
        this.messageHandler
            .sendMessage<MessageStatusWrapper<string>>(MessageType.GrpcRequest)
            .then((response) => {
                if (!response.success) {
                    throw new Error(response.message);
                }

                // Perform the actual gRPC request: (Overwrite the baseUrl to use the one we got from the wallet)
                const stream = this.transport.serverStreaming(method, input, { ...options, baseUrl: response.result });
                // Forward results for all the 4 outputs:
                stream.headers.then(defHeader.resolve.bind(defHeader)).catch(defHeader.reject.bind(defHeader));
                stream.responses.onNext(responseStream.notifyNext.bind(responseStream));
                stream.status.then(defStatus.resolve.bind(defStatus)).catch(defStatus.reject.bind(defStatus));
                stream.trailers.then(defTrailer.resolve.bind(defTrailer)).catch(defTrailer.reject.bind(defTrailer));
            })
            .catch((error) => {
                // Forward the error to all the 4 outputs if the background scripts returns a negative result:
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
