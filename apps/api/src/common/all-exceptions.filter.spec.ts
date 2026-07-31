import { ArgumentsHost, BadRequestException } from '@nestjs/common';
import { AllExceptionsFilter } from './all-exceptions.filter';

describe('AllExceptionsFilter', () => {
  const filter = new AllExceptionsFilter();

  function createHost(): {
    host: ArgumentsHost;
    response: { status: jest.Mock; json: jest.Mock };
  } {
    const json = jest.fn();
    const status = jest.fn().mockReturnValue({ json });
    const response = { status, json };
    const host = {
      switchToHttp: () => ({
        getResponse: () => response,
        getRequest: () => ({ method: 'GET', url: '/test' }),
      }),
    } as unknown as ArgumentsHost;

    return { host, response };
  }

  it('preserves status and body for HttpException', () => {
    const { host, response } = createHost();

    filter.catch(new BadRequestException('bad input'), host);

    expect(response.status).toHaveBeenCalledWith(400);
    expect(response.json).toHaveBeenCalledWith(
      expect.objectContaining({ message: 'bad input' }),
    );
  });

  it('normalizes unknown errors to a 500 with a generic message', () => {
    const { host, response } = createHost();

    filter.catch(new Error('boom'), host);

    expect(response.status).toHaveBeenCalledWith(500);
    expect(response.json).toHaveBeenCalledWith({
      statusCode: 500,
      message: 'Internal server error',
    });
  });
});
