import * as nestjs from '@nestjs/common/decorators/core/apply-decorators';
import { Audit } from '../../decorators';

describe('Audit Decorator', () => {
  it('should apply decorator', () => {
    const decoratorSpy = jest.spyOn(nestjs, 'applyDecorators');
    Audit();
    expect(decoratorSpy).toHaveBeenCalled();
  });
});
