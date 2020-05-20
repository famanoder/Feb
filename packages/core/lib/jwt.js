import jsonwebtoken from 'jsonwebtoken';

export function jwt(app) {
	const { secret = 'secret', expire = 60 * 10 } = app.config.jwt || {};
  app.context.jwt = {
    sign(data, opts) {
      const token = jsonwebtoken.sign(data, secret, Object.assign({
        expiresIn: expire
      }, opts));
      return token;
    },
    verify(token) {
      const res = {
        error: null,
        token: null,
        isExpired: false,
        isInvalid: false
      };
      try {
        res.token = jsonwebtoken.verify(token, secret);
      } catch (e) {
        res.error = e.name;
        res.isExpired = e.name === 'TokenExpiredError';
        res.isInvalid = e.name === 'JsonWebTokenError';
      }
      return res;
    }
  }
}
