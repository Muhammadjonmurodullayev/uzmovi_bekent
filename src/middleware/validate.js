module.exports = function validate(schema) {
    return (req, res, next) => {
      try {
        schema.parse({
          body: req.body,
          query: req.query,
          params: req.params
        });
        next();
      } catch (e) {
        next(e);
      }
    };
  };
  