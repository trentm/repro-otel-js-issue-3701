import os from "node:os";
// import { Logger } from "@warrify/json-logger";
import {
  diag,
  DiagLogLevel,
  trace,
} from "@opentelemetry/api";
import { BatchSpanProcessor } from "@opentelemetry/sdk-trace-base";
import { OTLPTraceExporter } from "@opentelemetry/exporter-trace-otlp-http";
import { NodeTracerProvider } from "@opentelemetry/sdk-trace-node";
import { registerInstrumentations } from "@opentelemetry/instrumentation";
import { AwsLambdaInstrumentation } from "@opentelemetry/instrumentation-aws-lambda";
import { DnsInstrumentation } from "@opentelemetry/instrumentation-dns";
import { AwsInstrumentation } from "@opentelemetry/instrumentation-aws-sdk";
import { HttpInstrumentation } from "@opentelemetry/instrumentation-http";
import {
  SemanticAttributes,
  SemanticResourceAttributes,
  CloudProviderValues,
  CloudPlatformValues,
} from "@opentelemetry/semantic-conventions";

// const logger = new Logger("tracing");

// diag.setLogger(logger as any, DiagLogLevel.ALL);

try {
  const provider = new NodeTracerProvider();
  const spanProcessor = new BatchSpanProcessor(
    new OTLPTraceExporter({
      url: process.env.OTEL_EXPORTER_OTLP_ENDPOINT,
    })
  );

  provider.addSpanProcessor(spanProcessor);
  provider.register();
  trace.setGlobalTracerProvider(provider);

  registerInstrumentations({
    instrumentations: [
      new AwsInstrumentation({}),
      new AwsLambdaInstrumentation({
        requestHook: (span, { event, context }) => {
          span.setAttributes({
            [SemanticAttributes.AWS_LAMBDA_INVOKED_ARN]:
              context.invokedFunctionArn,
          });
        },
        responseHook: (span, { err, res }) => {
          if (err instanceof Error) {
            span.recordException(err);
          }
          if (res) {
            span.setAttribute("faas.res", res);
          }
        },
      }),
      new DnsInstrumentation({}),
      new HttpInstrumentation(),
    ],
  });
} catch (err: any) {
  console.error(err);
}

import { createServer } from 'node:http'
const server = createServer((req, res) => {
    req.resume()
    req.on('end', () => {
        res.writeHead(200, {
            'Content-Type': 'text/plain'
        })
        res.end('pong')
    })
})
server.listen(3000, () => {
    console.log('listening at http://127.0.0.1:3000')
})
