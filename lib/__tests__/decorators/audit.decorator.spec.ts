import * as nestjs from '@nestjs/common/decorators/core/apply-decorators';
import { Audit } from '../../decorators';

describe('Audit Decorator', () => {
  it('should apply decorator', () => {
    const decoratorMock = jest.spyOn(nestjs, 'applyDecorators');
    Audit();
    expect(decoratorMock).toHaveBeenCalled();
  });
});
