# nestjs-audit

An audit module for Nest framework to keep audit data for web requests.

## Installation

Npm

```bash
npm install @appstellar-team/nestjs-audit
```

Yarn

```bash
yarn add @appstellar-team/nestjs-audit
```

## Getting Started

First, let's register the nestjs-audit in `app.module.ts` by including it in imports.

```ts
// app.module.ts
import { Module } from '@nestjs/common';
import { AuditModule } from '@appstellar-team/nestjs-audit';

@Module({
  imports: [AuditModule],
})
export class AppModule {}
```

The following configurations can be set on the app module level:

- set transports
- enable audit data for failed requests
  and
- provide a callback that returns the user (actor) who is performing requests

Each service, controller or route that is part of that module will then inherit the same configurations and this way we avoid duplicating code.

To set module level configurations, pass the needed options while importing the module:

```ts
// app.module.ts
import { Module } from '@nestjs/common';
import { AuditModule, TransportMethods } from '@appstellar-team/nestjs-audit';
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
This can be done to set the audit configurations in service level so the same configurations will be inherited by controllers that have the specific service injected.

```ts
// app.service.ts
import { AuditService, TransportMethods } from '@appstellar-team/nestjs-audit';

@Injectable()
class SomeService {
  constructor(private readonly audit: AuditService) {
    // examples of setting audit options in service level
    audit.addTransport(TransportMethods.CONSOLE);
    audit.setUserIdCallback((req) => req.headers.user.id);
    audit.logErrors = true;
  }
}
```

## Decorator Usage

In order to enable auditing for requests, `@Audit()` decorator has to be used in the controller level for routes that we need to keep audit data for.

```ts
// app.controller.ts
import { Audit } from '@appstellar-team/nestjs-audit';

// can be passed to each route specifically if there are routes that we don't need to keep audit for
@Audit()
@Controller()
export class SomeController {
  constructor(private readonly someService: SomeService) {}

  @Get()
  // @Audit()
  getData() {
    return this.someService.getData();
  }
}
```

If audit options are not set in module or service level, it can be done for each route specifically by passing audit parameters in the decorator:

```ts
// app.controller.ts
import { Action, Audit } from '@appstellar-team/nestjs-audit';

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

## Contributing

Pull requests are welcomed. For major changes, please open an issue first to discuss what you would like to change.

## License

nestjs-audit is [MIT licensed](LICENSE).
