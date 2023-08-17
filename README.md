# nestjs-audit

An audit module for Nest framework to keep audit data for web requests.

## Installation

NPM

```bash
npm install nestjs-audit
```

Yarn

```bash
yarn add nestjs-audit
```

## Usage

First, let's register the nestjs-audit in `app.module.ts`

```ts
// app.module.ts
import { Module } from '@nestjs/common';
import { AuditModule } from 'nestjs-audit';

@Module({
  imports: [AuditModule],
})
export class AppModule {}
```

If the following configurations are needed on module level:

- set transports
- configure to audit failed requests
  or
- configure a method that returns the user (actor) who is performing requests

we can make the configurations while importing the module:

```ts
// app.module.ts
import { Module } from '@nestjs/common';
import { AuditModule, TransportMethods } from 'nestjs-audit';
// only if sns transport is needed
import { SNSClient } from '@aws-sdk/client-sns';

@Module({
  imports: [
    AuditModule.forRoot({
      transports: [
        // only one of three supported transport methods is required, but multiple transports can be used as well
        { name: TransportMethods.CONSOLE },
        {
          name: TransportMethods.MONGOOSE,
          options: { connectionString: '<your-database-connection-url>' },
        },
        {
          name: TransportMethods.SNS,
          options: { client: new SNSClient(), snsTopicArn: '<sns-topic-arn>' },
        },
      ],
      // optional (defaults to false)
      logErrors: true,
      // optional
      getUserId: (req) => '<returned-user-id-from-req>',
    }),
  ],
})
export class AppModule {}
```

---

After properly importing the module, we can inject our `AuditService` anywhere that's needed.
This can be done to set the audit configurations in service level.

```ts
import { AuditService, TransportMethods } from 'nestjs-audit';

@Injectable()
// app.service.ts
class SomeService {
  constructor(private readonly audit: AuditService) {
    // just examples of setting audit configs in service level
    audit.addTransport(TransportMethods.CONSOLE);
    audit.setUserIdCallback((req) => req.headers.user.id);
    audit.logErrors = true;
  }
}
```

## Decorator

In order to enable auditing for requests, `@Audit()` decorator needs to be used in the controller level for routes that we need to keep audit data.

```ts
// app.controller.ts

// can be passed to each route specifically if there are routes that we don't need to keep audit for
@Audit()
@Controller()
export class SomeController {
  constructor(private readonly someService: someService) {}

  @Get()
  // @Audit()
  getData() {
    return this.someService.getData();
  }
}
```

If audit is not configured in module or service level, it can be done for each route specifically by passing audit parameters in the decorator:

```ts
// app.controller.ts
@Get()
@Audit({
  // all params are optional
  // action defaults to `req.method` if not set
  action: Action.READ,
  getUserId: (req) => '<returned-user-id-from-req>',
  getResponseObjectId: (req) => '<returned-object-id-from-req>',
  entity: '<entity-name-which-request-is-performed-on>',
})
getData() {
  // some code
}
```

## License

nestjs-audit is [MIT licensed](LICENSE).
